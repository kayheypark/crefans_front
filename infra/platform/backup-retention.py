"""Deploy DB dump retention for crefans (2026-10-30 /pilot-work: backups kept at most 7 days).

Each deploy writes a full DB dump to /opt/crefans-backup-<release>/database.sql (+ database.sha256). This removes
only those two files once the dump is older than --days (default 7), so withdrawn members' data does not outlive the
30-day purge promise. The release folders themselves (.env / runtime.env copies used by rollback, logs) stay.
Never touches the live DB volume or anything outside /opt/crefans-backup-*/. Prints a plan by default; --apply deletes.

Local plan test:  python3 infra/platform/backup-retention.py --root /tmp/x --days 7
Remote:           ssh HOST 'sudo -n python3 - --days 7 --apply' < infra/platform/backup-retention.py
"""
import argparse, json, os, sys
from datetime import datetime, timezone
from pathlib import Path

DUMP_FILES = ('database.sql', 'database.sha256')


def plan(root, days, now):
    """Returns (keep, remove) lists of {'path','modified','bytes'} for dumps under root/crefans-backup-*/."""
    cutoff = now.timestamp() - days * 86400
    keep, remove = [], []
    for folder in sorted(Path(root).glob('crefans-backup-*')):
        if not folder.is_dir() or folder.is_symlink():
            continue
        for name in DUMP_FILES:
            f = folder / name
            if not f.is_file() or f.is_symlink():
                continue
            st = f.stat()
            row = {'path': str(f), 'modified': datetime.fromtimestamp(st.st_mtime, timezone.utc).isoformat(), 'bytes': st.st_size}
            (remove if st.st_mtime < cutoff else keep).append(row)
    return keep, remove


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument('--root', default='/opt')
    p.add_argument('--days', type=int, default=7)
    p.add_argument('--apply', action='store_true')
    a = p.parse_args(argv)
    if a.days < 1:
        sys.exit('days must be at least 1')
    now = datetime.now(timezone.utc)
    keep, remove = plan(a.root, a.days, now)
    removed, errors = [], []
    if a.apply:
        for row in remove:
            try:
                os.remove(row['path']); removed.append(row['path'])
            except OSError as e:
                errors.append({'path': row['path'], 'error': str(e)})
    print(json.dumps({'at': now.isoformat(), 'apply': a.apply, 'days': a.days, 'kept': keep, 'planned': [r['path'] for r in remove],
                      'plannedBytes': sum(r['bytes'] for r in remove), 'removed': removed, 'errors': errors}, indent=2))
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
