#!/usr/bin/env python3
"""Validate the two repositories' document inventory, contracts, links and evidence freshness."""
import argparse, hashlib, json, os, platform, re, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path

FRONT=Path(__file__).resolve().parents[1]
BACK=Path(os.environ.get('CREFANS_SERVER_DIR',str(FRONT.parent/'crefans_server'))).resolve()
ROOTS={'front':FRONT,'server':BACK}
MANIFEST=FRONT/'docs/audit/manifest.json'
EVIDENCE=FRONT/'docs/audit/evidence.json'
CONTRACT=BACK/'docs/current-contracts.md'
DOC_EXT={'.md','.mdx','.rst','.txt'}

def sha(data):return hashlib.sha256(data).hexdigest()
def now():return datetime.now(timezone.utc).isoformat()
def git(root,*args):return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
def files(root):return sorted(set(git(root,'ls-files','--cached','--others','--exclude-standard').splitlines()))
def documents():return {f'{repo}/{f}':root/f for repo,root in ROOTS.items() for f in files(root) if Path(f).suffix.lower() in DOC_EXT and (root/f).is_file()}
def inventory_errors(docs,manifest):
 errors=[]
 for name in sorted(set(docs)-set(manifest)):errors.append('Unreviewed document: '+name)
 for name in sorted(set(manifest)-set(docs)):errors.append('Missing document: '+name)
 for name,entry in manifest.items():
  if entry.get('kind') not in ['current','mixed-history','legacy','asset-record','original-requirement','generated']:errors.append('Invalid classification: '+name)
  if not entry.get('review') or not entry.get('evidence'):errors.append('Missing review/evidence: '+name)
  for evidence in entry.get('evidence',[]):
   repo,_,file=evidence.partition('/')
   if repo not in ROOTS or not (ROOTS[repo]/file).exists():errors.append('Missing review source: '+name+' -> '+evidence)
  if name in docs and entry.get('kind')=='legacy' and '문서 상태 (2026-10-08)' not in docs[name].read_text():errors.append('Legacy scope banner missing: '+name)
 return errors

def link_errors(file,text):
 errors=[];checked=0;external=0
 # Inline Markdown links/images; bare/backticked paths and reference links are separate limitations.
 for match in re.finditer(r'!?\[[^\]\n]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)',text):
  target=match.group(1).strip('<>')
  if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:',target) and not re.match(r'^/.*:\d+$',target):external+=1;continue
  if target.startswith('#'):continue
  target=target.split('#',1)[0].split('?',1)[0];target=re.sub(r':\d+$','',target)
  if not target:continue
  resolved=Path(target) if target.startswith('/') else file.parent/target
  checked+=1
  if not resolved.exists():errors.append(str(file.relative_to(file.parents[0]))+' -> '+target)
 return errors,checked,external

def contracts():
 env=os.environ.copy();env['CREFANS_SERVER_DIR']=str(BACK)
 data=json.loads(subprocess.check_output(['node','scripts/doc-contracts.cjs'],cwd=FRONT,env=env,text=True))
 schema=(BACK/'prisma/schema.prisma').read_text()
 migrations=sorted(p.parent.name for p in (BACK/'prisma/migrations').glob('*/migration.sql'))
 templates={}
 for repo,f in [('front','.env.example'),('server','infra/platform/runtime.env.example')]:
  templates[repo]=re.findall(r'^([A-Z][A-Z0-9_]*)=',(ROOTS[repo]/f).read_text(),re.M)
 data.update(schema=schema,models=re.findall(r'^model (\w+)\s*\{',schema,re.M),enums=re.findall(r'^enum (\w+)\s*\{',schema,re.M),migrations=migrations,environmentKeys=templates,scripts={r:json.loads((p/'package.json').read_text())['scripts'] for r,p in ROOTS.items()})
 return data

def render_contract(data):
 lines=['# 코드에서 추출한 현재 계약','', '이 문서는 프론트 `npm run docs:contracts`로 재생성한다. `check:docs`가 코드에서 다시 추출해 전체 내용을 비교한다. 추출은 등록된 Nest 컨트롤러의 명시적 decorator와 화면 카탈로그 AST를 사용한다. 실행 중인 운영 서버·DB 적용 상태·공급사 성공의 증거는 아니다.', '', '## 등록된 /api/v1 라우트', '', '| Method | 경로 | 근거 |','| --- | --- | --- |']
 for r in data['routes']:lines.append(f"| {r['method']} | `{r['path']}` | `{r['source']}::{r['handler']}` |")
 lines+=['','GET 라우트의 Express HEAD 처리 및 OPTIONS/CORS는 별도 명시 decorator 목록에 추가하지 않는다. 바이너리 미디어 예외와 권한 의미는 [API 계약](./platform-api.md)을 따른다.','','## 목업 카탈로그 전체','','| 경로 | 메뉴명 |','| --- | --- |']
 for s in data['screens']:lines.append(f"| `{s['path']}` | {s['title']} |")
 lines+=['','카탈로그에 없는 편집/상세/query 변형은 프론트 화면 검수 문서의 추가 경로와 라우터가 기준이다. 이 목록 자체가 모든 동적 URL의 존재 검증은 아니다.','','## 환경 템플릿 키와 npm 명령','', '실제 `.env`/비밀 runtime 파일은 읽거나 값/해시를 수집하지 않는다. 아래는 예시 파일의 키 이름만이다. 런타임의 모든 선택적 환경변수 목록과 같다고 가정하지 않는다.']
 for repo in ['front','server']:
  lines+=['',f'### {repo}', '', '환경 키: '+', '.join('`'+k+'`' for k in data['environmentKeys'][repo]),'','| 명령 | package.json 실행문 |','| --- | --- |']
  for k,v in data['scripts'][repo].items():lines.append(f'| `npm run {k}` | `{v}` |')
 lines+=['','## migration 파일 목록','',*['- `'+v+'`' for v in data['migrations']],'',f"## Prisma 전체 정의 ({len(data['models'])} models · {len(data['enums'])} enums)",'','아래는 `prisma/schema.prisma` 원문이다. 필드·관계·제약·인덱스를 생략하지 않는다. 기존 모델의 Cognito 주석은 과거 호환 필드 이름이며 플랫폼 인증 방식은 Member 자체 세션이다. 배포된 DB 스키마와 일치하는지는 대상 DB에서 별도 검증한다.','','```prisma',data['schema'].rstrip(),'```','']
 return '\n'.join(lines)

def semantic_errors(data,docs):
 errors=[]
 expected={(r['method'],r['path'].removeprefix('/api/v1')) for r in data['routes']}
 actual=set(re.findall(r'^\| (GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) \| (/[^ |]*) \|', (BACK/'docs/platform-api.md').read_text(),re.M))
 for r in sorted(expected-actual):errors.append('API explanation missing: '+' '.join(r))
 for r in sorted(actual-expected):errors.append('API explanation not registered: '+' '.join(r))
 preview=(FRONT/'docs/preview-pages.md').read_text()
 for screen in data['screens']:
  if screen['path'] not in preview:errors.append('Preview path undocumented: '+screen['path'])
 if not CONTRACT.exists() or CONTRACT.read_text()!=render_contract(data):errors.append('Generated contracts stale: npm run docs:contracts, then review changes')
 for path in [Path('/Users/ethan/AGENTS.md'),Path('/Users/ethan/.codex/AGENTS.md'),FRONT/'AGENTS.md',BACK/'AGENTS.md']:
  if '## 검증 증거 필수 규약' not in path.read_text():errors.append('Mandatory evidence rule absent: '+str(path))
 if sha((FRONT/'docs/service-hierarchy.md').read_bytes())!=json.loads(MANIFEST.read_text())['originalHierarchySha256']:errors.append('Original user hierarchy changed')
 return errors

def state(docs):
 snapshots={name:sha(file.read_bytes()) for name,file in docs.items()}
 sources={}
 for repo,root in ROOTS.items():
  for f in files(root):
   p=root/f
   if not p.is_file() or p.suffix.lower() in DOC_EXT:continue
   if f.startswith(('public/','output/','docs/audit/')):continue
   if '.env' in p.name:
    if p.name.endswith('.env.example'):sources[f'{repo}/{f}']=sha(p.read_bytes())
    continue
   if p.suffix in {'.ts','.tsx','.js','.cjs','.py','.css','.json','.prisma','.sql','.yml','.yaml','.conf'} or p.name in {'Dockerfile','Caddyfile'}:sources[f'{repo}/{f}']=sha(p.read_bytes())
 snapshots.update({'guidance/home':sha(Path('/Users/ethan/AGENTS.md').read_bytes()),'guidance/codex':sha(Path('/Users/ethan/.codex/AGENTS.md').read_bytes()),'audit/manifest':sha(MANIFEST.read_bytes())})
 return {'documents':snapshots,'sources':sources}

def freshness_errors(current,saved):
 errors=[]
 for section in ['documents','sources']:
  left=current.get(section,{});right=saved.get(section,{})
  for key in sorted(set(left)|set(right)):
   if left.get(key)!=right.get(key):errors.append('Evidence expired: '+key)
 return errors

def self_test():
 fake=FRONT/'docs/nonexistent-probe.md'
 assert link_errors(fake,'[bad](./__missing_audit_target__.md)')[0]
 assert not link_errors(fake,'[valid](../README.md)')[0]
 assert inventory_errors({'front/probe.md':fake},{})==['Unreviewed document: front/probe.md']
 assert freshness_errors({'sources':{'x':'new'}},{'sources':{'x':'old'}})==['Evidence expired: x']
 assert freshness_errors({'documents':{'new':'hash'}},{'documents':{}})==['Evidence expired: new']
 # A contract mutation must differ byte-for-byte from the accepted document.
 data=contracts();changed=json.loads(json.dumps(data));changed['routes'].append({'method':'POST','path':'/api/v1/probe','source':'probe','handler':'probe'})
 assert render_contract(changed)!=render_contract(data)
 assert 'API explanation missing: POST /probe' in semantic_errors(changed,documents())
 return ['missing-link rejected; valid-link accepted','new-document rejected','changed-source rejected','changed-document rejected','changed-route contract rejected']

def inspect():
 docs=documents();manifest=json.loads(MANIFEST.read_text());data=contracts()
 errors=inventory_errors(docs,manifest['documents']);checked=external=0
 for name,file in docs.items():
  found,n,e=link_errors(file,file.read_text());errors += [name+': '+v for v in found];checked+=n;external+=e
 errors+=semantic_errors(data,docs)
 summary={'documents':len(docs),'documentsByRepo':{r:sum(n.startswith(r+'/') for n in docs) for r in ROOTS},'routes':len(data['routes']),'screens':len(data['screens']),'models':len(data['models']),'enums':len(data['enums']),'migrations':len(data['migrations']),'localMarkdownTargets':checked,'externalInlineLinksNotFetched':external}
 return errors,summary,state(docs)

def prove():
 executions=[]
 commands=[('front',['npm','run','check']),('server',['npm','run','build']),('server',['npm','run','test:platform:domain']),('server',['npm','run','test:platform']),('front',['npm','run','test:e2e'])]
 for repo,command in commands:
  started=now();print('Running '+repo+': '+' '.join(command),flush=True)
  result=subprocess.run(command,cwd=ROOTS[repo],capture_output=True,text=True)
  out=result.stdout+'\n'+result.stderr
  # Store result summaries only: financial/test logs may include synthetic identifiers.
  counts=re.findall(r'^# (?:tests|pass|fail|skipped) \d+|^\s*\d+ (?:passed|failed|skipped).*$',out,re.M)
  executions.append({'repo':repo,'command':command,'startedAt':started,'finishedAt':now(),'exitCode':result.returncode,'summary':counts,'outputSha256':sha(out.encode())})
  print(json.dumps(executions[-1],ensure_ascii=False),flush=True)
  if result.returncode:raise RuntimeError('Verification failed: '+repo+' '+' '.join(command)+'; output deliberately not published; rerun command locally')
 return executions

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--contracts',action='store_true');parser.add_argument('--record',action='store_true');parser.add_argument('--prove',action='store_true');parser.add_argument('--self-test',action='store_true');args=parser.parse_args()
 if args.contracts:CONTRACT.write_text(render_contract(contracts()));print('Generated '+str(CONTRACT));return
 if args.self_test:print(json.dumps({'negativeControls':self_test()},ensure_ascii=False));return
 errors,summary,current=inspect()
 if errors:print('\n'.join(errors));sys.exit(1)
 if args.record or args.prove:
  initial=current;executions=prove() if args.prove else []
  errors,summary,current=inspect();errors+=freshness_errors(current,initial)
  if errors:print('\n'.join(errors));sys.exit(1)
  proof={'checkedAt':now(),'environment':{'node':subprocess.check_output(['node','--version'],text=True).strip(),'python':platform.python_version(),'os':platform.platform(),'databaseScope':'loopback3307; dev tests + dedicated crefans_platform_e2e; not deployed DB'},'scope':'working trees; inline local Markdown file targets; AST routes; preview catalog; full Prisma source; template keys; package scripts; immutable original hierarchy','summary':summary,'negativeControls':self_test(),'repositories':{r:{'head':git(p,'rev-parse','HEAD'),'branch':git(p,'branch','--show-current'),'dirty':bool(git(p,'status','--porcelain'))} for r,p in ROOTS.items()},'state':current,'executions':executions,'verificationLevel':'local-tests-and-contracts' if executions else 'snapshot-only-not-test-proof','limits':['No exhaustive natural-language correctness proof','No runtime secrets or deployed DB/schema comparison','No provider/live payment/bank/mail, deployment, load or backup recovery validation','No external link availability or fragment-anchor checks','No pixel/complete interaction proof for every route','Archive/design source text preserved; original asset reference files may be unavailable']}
  EVIDENCE.write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'recorded':str(EVIDENCE),**summary},ensure_ascii=False));return
 if not EVIDENCE.exists():print('Evidence missing: review documents, then run --record or --prove');sys.exit(1)
 saved=json.loads(EVIDENCE.read_text());errors=freshness_errors(current,saved.get('state',{}))
 if errors:print('\n'.join(errors));sys.exit(1)
 print(json.dumps({'result':'PASS','evidenceAt':saved['checkedAt'],'verificationLevel':saved['verificationLevel'],**summary},ensure_ascii=False))

if __name__=='__main__':main()
