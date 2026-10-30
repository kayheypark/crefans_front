"""Release image retention for crefans deploys.

Keeps the newest N tags per crefans repository plus every image used by a container
(running or stopped) and any explicitly protected tag. Prints a plan by default and
removes tags only with --apply, using `docker rmi` without --force. Missing-name
lookups may use the exact unused image ID only if it has that single planned tag.
Never touches other repositories, volumes, networks or build cache.

Local:  python3 infra/platform/image-retention.py --keep 3 [--apply]
Remote: ssh HOST 'sudo -n python3 - --keep 3 --apply' < infra/platform/image-retention.py
"""
import argparse, json, shutil, subprocess, sys
from datetime import datetime, timezone

DEFAULT_REPOS = ('crefans-front', 'crefans-api', 'crefans-admin')


def plan(images, in_use_ids, keep, repos, protected_tags=()):
    """images: [{'tag','id','created'}] with ISO created strings. Returns (keep_rows, remove_rows)."""
    if keep < 1:
        raise ValueError('keep must be at least 1 so the current release always survives')
    protected = set(protected_tags)
    keep_rows, remove_rows = [], []
    for repo in repos:
        rows = sorted((r for r in images if r['tag'].split(':', 1)[0] == repo), key=lambda r: (r['created'], r['tag']), reverse=True)
        newest_ids = []
        for r in rows:
            if r['id'] not in newest_ids:
                newest_ids.append(r['id'])
        newest_ids = set(newest_ids[:keep])
        for r in rows:
            reason = ('in-use' if r['id'] in in_use_ids else 'protected' if r['tag'] in protected
                      else 'newest' if r['id'] in newest_ids else None)
            (keep_rows if reason else remove_rows).append({**r, **({'reason': reason} if reason else {})})
    return keep_rows, remove_rows


def docker(*args):
    return subprocess.check_output(['docker', *args], text=True, timeout=120)


def collect(repos):
    images = []
    for line in docker('images', '--no-trunc', '--format', '{{.Repository}}:{{.Tag}} {{.ID}}').splitlines():
        tag, iid = line.split()
        if tag.split(':', 1)[0] in repos and not tag.endswith(':<none>'):
            images.append({'tag': tag, 'id': iid})
    if images:
        created = [json.loads(line) for line in docker('image', 'inspect', '--format', '{{json .Created}}', *[r['id'] for r in images]).splitlines()]
        for r, c in zip(images, created):
            r['created'] = c
    containers = docker('ps', '-a', '--no-trunc', '--format', '{{.ID}}').split()
    in_use = set(docker('inspect', '--format', '{{.Image}}', *containers).split()) if containers else set()
    return images, in_use


def safe_id_fallback(row, info, in_use_ids):
    """A missing tag lookup may use its ID only when it has exactly that one tag."""
    return (info['Id'] == row['id'] and row['id'] not in in_use_ids
            and info.get('RepoTags') == [row['tag']]
            and all(d.split('@', 1)[0] == row['tag'].split(':', 1)[0]
                    for d in info.get('RepoDigests', [])))


def self_test():
    imgs = [{'tag': f'crefans-front:r{i}', 'id': f'sha256:{i}', 'created': f'2026-10-{10 + i:02d}T00:00:00Z'} for i in range(6)]
    imgs += [{'tag': 'crefans-front:alias', 'id': 'sha256:5', 'created': '2026-10-15T00:00:00Z'},
             {'tag': 'crefans-api:a1', 'id': 'sha256:a1', 'created': '2026-10-01T00:00:00Z'},
             {'tag': 'mysql:8.0', 'id': 'sha256:db', 'created': '2026-01-01T00:00:00Z'}]
    keep, remove = plan(imgs, in_use_ids={'sha256:0'}, keep=3, repos=DEFAULT_REPOS, protected_tags=['crefans-front:r1'])
    removed = sorted(r['tag'] for r in remove)
    assert removed == ['crefans-front:r2'], removed  # r5(+alias), r4, r3 newest; r0 in use; r1 protected
    assert not any(r['tag'].startswith('mysql') for r in keep + remove), 'other repositories must be ignored'
    assert all(r['tag'] != 'crefans-api:a1' for r in remove), 'single api image is the newest and kept'
    # Negative controls: unsafe inputs must be refused or visibly change the plan.
    try:
        plan(imgs, set(), keep=0, repos=DEFAULT_REPOS)
    except ValueError:
        pass
    else:
        raise AssertionError('keep=0 must be refused')
    unsafe_keep, unsafe_remove = plan(imgs, set(), keep=3, repos=DEFAULT_REPOS)
    assert 'crefans-front:r0' in [r['tag'] for r in unsafe_remove], 'control: without in-use protection r0 would be removed'
    row = {'tag': 'crefans-front:old', 'id': 'sha256:old'}
    info = {'Id': row['id'], 'RepoTags': [row['tag']], 'RepoDigests': ['crefans-front@sha256:old']}
    assert safe_id_fallback(row, info, set())
    assert not safe_id_fallback(row, info, {row['id']})
    assert not safe_id_fallback(row, {**info, 'Id': 'sha256:changed'}, set())
    assert not safe_id_fallback(row, {**info, 'RepoTags': [row['tag'], 'other:keep']}, set())
    assert not safe_id_fallback(row, {**info, 'RepoDigests': ['other@sha256:old']}, set())
    print(json.dumps({'selfTest': 'pass', 'idFallbackSafetyCases': 5}))


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--keep', type=int, default=3)
    p.add_argument('--repos', default=','.join(DEFAULT_REPOS))
    p.add_argument('--protect', action='append', default=[], help='extra tag to keep, e.g. the rollback release')
    p.add_argument('--apply', action='store_true')
    p.add_argument('--self-test', action='store_true')
    p.add_argument('--path', default='/', help='filesystem to report free space for')
    a = p.parse_args()
    if a.self_test:
        return self_test()
    repos = tuple(x for x in a.repos.split(',') if x)
    images, in_use = collect(repos)
    keep, remove = plan(images, in_use, a.keep, repos, a.protect)
    report = {'at': datetime.now(timezone.utc).isoformat(), 'apply': a.apply, 'keepPerRepository': a.keep,
              'freeBytesBefore': shutil.disk_usage(a.path).free, 'kept': keep, 'planned': remove, 'removed': [], 'errors': []}
    if a.apply:
        for r in remove:
            target = r['tag']
            lookup = subprocess.run(['docker', 'image', 'inspect', r['tag']], capture_output=True, text=True, timeout=120)
            _, current_in_use = collect(repos)
            if lookup.returncode == 0:
                info = json.loads(lookup.stdout)[0]
                if info['Id'] != r['id'] or info['Id'] in current_in_use:
                    report['errors'].append({'tag': r['tag'], 'error': 'tag changed or image is now in use'}); continue
            elif 'No such image:' in lookup.stderr:
                # Some imported Desktop images appear in ls but cannot be resolved by name.
                info = json.loads(docker('image', 'inspect', r['id']))[0]
                if not safe_id_fallback(r, info, current_in_use):
                    report['errors'].append({'tag': r['tag'], 'error': 'ID fallback refused: changed, shared or in-use image'}); continue
                target = r['id']
            else:
                report['errors'].append({'tag': r['tag'], 'error': lookup.stderr.strip()[-300:]}); continue
            res = subprocess.run(['docker', 'rmi', target], capture_output=True, text=True, timeout=300)
            (report['removed'] if res.returncode == 0 else report['errors']).append({'tag': r['tag'], 'usedIdFallback': target == r['id'], **({} if res.returncode == 0 else {'error': res.stderr.strip()[-300:]})})
    report['freeBytesAfter'] = shutil.disk_usage(a.path).free
    print(json.dumps(report, indent=2))
    sys.exit(1 if report['errors'] else 0)


if __name__ == '__main__':
    main()
