"""Read-only deployment capacity guard; never prunes images or database volumes."""
import argparse,json,shutil,subprocess,sys
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--path',default='.');p.add_argument('--required-gib',type=float,default=8);a=p.parse_args()
free=shutil.disk_usage(Path(a.path).resolve()).free;required=int(a.required_gib*1024**3)
if free<required:
 print(json.dumps({'ready':False,'reason':'insufficient_disk','freeBytes':free,'requiredBytes':required}));sys.exit(1)
try:r=subprocess.run(['docker','info','--format','{{.ServerVersion}}'],capture_output=True,text=True,timeout=15)
except (OSError,subprocess.TimeoutExpired):print(json.dumps({'ready':False,'reason':'docker_unavailable'}));sys.exit(1)
ready=r.returncode==0 and bool(r.stdout.strip()) and 'Cannot connect' not in r.stdout
print(json.dumps({'ready':ready,'freeBytes':free,'requiredBytes':required,'dockerVersion':r.stdout.strip() if ready else None}));sys.exit(0 if ready else 1)
