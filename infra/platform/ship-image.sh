#!/usr/bin/env bash
# 맥 빌드 → SSH 이미지 전송 → 운영 서버는 교체만 (초안, 2026-11-07). 현재 front 만 지원.
#
#   infra/platform/ship-image.sh --tag <release> [--dry-run] [--skip-build]
#
# 단계: 1 로컬 소스 확인 → 2 linux/amd64 빌드 → 3 이미지 검사 → 4 docker save|gzip + SHA-256
#       → 5 서버 읽기 전용 사전 검사(디스크·현재 이미지·태그 중복)  ← --dry-run 은 여기까지(서버 쓰기 없음)
#       → 6 /tmp 전송·SHA-256 대조·docker load·레이어 대조 → 7 .env 백업·FRONTEND_IMAGE 교체·검증, 실패 시 롤백
#       → 8 이전 이미지를 맥 복구 저장소로 스트리밍·검증 후 서버 태그 정리(복구본 검증 실패 시 서버 사본 유지)
#
# 환경 변수
#   CREFANS_SSH            ssh 래퍼(기본 crefans_server/.local/cancel-now-20261106/ssh.sh). "$CREFANS_SSH 'cmd'" 형태로 호출.
#   FRONTEND_BUILD_ENV     NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=... 한 줄 파일(권한 600). 값은 출력·기록하지 않는다.
#   CREFANS_RECOVERY_DIR   이전 이미지 보관 위치(기본 /Users/ethan/crefans-recovery). 삭제는 RETENTION.md 대로 사용자 승인 후 별도로.
#   DOCKER_CONFIG          Docker Desktop 자격 증명 도우미가 멈출 때 credsStore 없는 설정 폴더로 지정.
set -euo pipefail
umask 077  # 복구 저장소에 쓰는 이미지·설정·덤프를 600/700으로 만든다(RETENTION.md, 2026-11-11 사용자 결정)

FRONT=$(cd "$(dirname "$0")/../.." && pwd)
SSH=${CREFANS_SSH:-/Users/ethan/repository/crefans_server/.local/cancel-now-20261106/ssh.sh}
RECOVERY=${CREFANS_RECOVERY_DIR:-/Users/ethan/crefans-recovery}
TAG= DRY=0 SKIP_BUILD=0
while [ $# -gt 0 ]; do case "$1" in
  --tag) TAG=$2; shift 2;; --dry-run) DRY=1; shift;; --skip-build) SKIP_BUILD=1; shift;;
  *) echo "알 수 없는 인자: $1" >&2; exit 2;; esac; done
[[ "$TAG" =~ ^[a-z0-9][a-z0-9.-]{2,60}$ ]] || { echo '--tag 필요(소문자·숫자·.-)' >&2; exit 2; }
IMG=crefans-front:$TAG
OUT=$FRONT/.local/ship-$TAG; mkdir -p "$OUT"
log(){ printf '[%s] %s\n' "$(date -u +%H:%M:%SZ)" "$*" | tee -a "$OUT/ship.log"; }
remote(){ "$SSH" "$@" </dev/null; }

# 1. 로컬 소스: 미커밋 변경 없음, origin/prod 와 같은 커밋
cd "$FRONT"
test -z "$(git status --porcelain --untracked-files=no)" || { echo '미커밋 변경이 있어 중단' >&2; exit 1; }
git fetch -q origin prod
HEAD_SHA=$(git rev-parse HEAD); PROD_SHA=$(git rev-parse origin/prod)
[ "$HEAD_SHA" = "$PROD_SHA" ] || log "주의: HEAD $HEAD_SHA ≠ origin/prod $PROD_SHA (운영 반영 전 prod 승격 필요)"
log "source $HEAD_SHA tag $IMG dry-run=$DRY"

# 2. 빌드 (BUILDPLATFORM 네이티브 빌드 단계 + amd64 런타임)
if [ "$SKIP_BUILD" = 0 ]; then
  : "${FRONTEND_BUILD_ENV:?FRONTEND_BUILD_ENV 파일 경로 필요}"
  [ "$(stat -f %Lp "$FRONTEND_BUILD_ENV")" = 600 ] || { echo 'FRONTEND_BUILD_ENV 권한은 600' >&2; exit 1; }
  KAKAO=$(sed -n 's/^NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=//p' "$FRONTEND_BUILD_ENV")
  [ -n "$KAKAO" ] || { echo 'NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY 비어 있음' >&2; exit 1; }
  python3 infra/platform/deploy-preflight.py --required-gib 8 | tee -a "$OUT/ship.log"
  s=$(date +%s)
  NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=$KAKAO docker buildx build --platform linux/amd64 --load \
    --build-arg NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY \
    --label org.opencontainers.image.revision="$HEAD_SHA" \
    -f infra/platform/Dockerfile -t "$IMG" . >"$OUT/build.log" 2>&1 || { tail -20 "$OUT/build.log"; exit 1; }
  log "build $(( $(date +%s)-s ))s"
  # 카카오 키가 클라이언트 번들에 들어갔는지(값은 환경 변수로만 넘기고 출력하지 않음)
  KAKAO_CHECK=$KAKAO docker run --rm --platform linux/amd64 -e KAKAO_CHECK --entrypoint sh "$IMG" -c \
    'grep -rqF "$KAKAO_CHECK" .next/static' </dev/null || { echo '번들에 카카오 키 없음' >&2; exit 1; }
  unset KAKAO
fi

# 3. 이미지 검사: 아키텍처·소스 커밋·실행 파일·amd64 sharp
test "$(docker image inspect -f '{{.Os}}/{{.Architecture}}' "$IMG")" = linux/amd64
test "$(docker image inspect -f '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$IMG")" = "$HEAD_SHA"
docker run --rm --platform linux/amd64 --entrypoint sh "$IMG" -c \
  'test -f server.js && test -d .next/static && test -d public && test -f node_modules/@img/sharp-linux-x64/package.json' </dev/null
LAYERS=$(docker image inspect -f '{{json .RootFS.Layers}}' "$IMG")
echo "$LAYERS" > "$OUT/layers.json"
log "image $(docker image inspect -f '{{.Id}}' "$IMG") layers=$(echo "$LAYERS" | shasum -a 256 | cut -c1-16)"

# 4. 저장·해시
TAR=$OUT/front-$TAG.tar.gz
[ -s "$TAR" ] || docker save "$IMG" | gzip -1 > "$TAR"
gzip -t "$TAR"; SUM=$(shasum -a 256 "$TAR" | cut -d' ' -f1); BYTES=$(stat -f %z "$TAR")
echo "$SUM  $(basename "$TAR")" > "$OUT/SHA256SUMS"
log "archive $BYTES bytes sha256 $SUM"

# 5. 서버 읽기 전용 사전 검사
PRE=$(remote "set -e; cd /opt/crefans
  echo cur=\$(sudo docker inspect -f '{{.Config.Image}}' crefans-beta-frontend-1)
  echo env=\$(sudo grep -c '^FRONTEND_IMAGE=' .env)
  echo exists=\$(sudo docker image inspect '$IMG' >/dev/null 2>&1 && echo 1 || echo 0)
  echo tmp=\$(df -B1 --output=avail /tmp | tail -1)
  echo docker=\$(sudo df -B1 --output=avail \$(sudo docker info -f '{{.DockerRootDir}}') | tail -1)")
echo "$PRE" | tee -a "$OUT/ship.log"
val(){ echo "$PRE" | sed -n "s/^$1=//p"; }
PREV=$(val cur)
[ "$(val env)" = 1 ] || { echo '.env FRONTEND_IMAGE 행이 1개가 아님' >&2; exit 1; }
[ "$(val exists)" = 0 ] || { echo "서버에 $IMG 이미 있음" >&2; exit 1; }
[ "$PREV" != "$IMG" ] || { echo '이미 운영 중인 태그' >&2; exit 1; }
# /tmp 에 압축본, docker 저장소에 압축 해제본(압축본의 약 3배)과 여유 4GiB 를 요구
[ "$(val tmp)" -gt $(( BYTES + 1024**3 )) ] || { echo '/tmp 여유 부족' >&2; exit 1; }
[ "$(val docker)" -gt $(( BYTES * 3 + 4 * 1024**3 )) ] || { echo 'docker 저장소 여유 부족' >&2; exit 1; }
log "preflight OK: 운영 $PREV → $IMG"
if [ "$DRY" = 1 ]; then log 'DRY-RUN 종료: 서버에 쓰지 않음'; exit 0; fi

# 6. 전송·적재·대조
RT=/tmp/ship-$TAG
remote "install -d -m700 $RT"
"$SSH" "cat > $RT/img.tar.gz" < "$TAR"
test "$(remote "sha256sum $RT/img.tar.gz | cut -d' ' -f1")" = "$SUM"
remote "gunzip -c $RT/img.tar.gz | sudo docker load" | tee -a "$OUT/ship.log"
test "$(remote "sudo docker image inspect -f '{{json .RootFS.Layers}}' '$IMG'")" = "$LAYERS"
remote "rm -rf $RT"
log "load OK: 레이어 일치, 서버 임시 파일 삭제"

# 7. 교체 (deploy.sh 방식: frontend 만, 실패 시 .env 복원·이전 이미지로 복귀)
"$SSH" "bash -s" >>"$OUT/deploy.log" 2>&1 <<EOF || { tail -30 "$OUT/deploy.log"; exit 1; }
set -euo pipefail; cd /opt/crefans
B=/opt/crefans-backup-$TAG; IMG=$IMG; PREV=$PREV
compose(){ sudo docker compose -p crefans-beta -f compose.yml -f compose.beta.yml -f compose.admin.yml "\$@" </dev/null; }
sudo install -d -m0700 "\$B"; sudo test ! -e "\$B/deployed"
test "\$(sudo docker inspect -f '{{.Config.Image}}' crefans-beta-frontend-1)" = "\$PREV"
others=\$(for s in api worker admin database proxy; do sudo docker inspect -f '{{.Name}} {{.Id}}' crefans-beta-\$s-1; done)
sudo cp -p .env "\$B/.env"
rollback(){ c=\$?; if [ \$c -ne 0 ]; then sudo cp -p "\$B/.env" .env; compose up -d --no-deps --no-build frontend || true; echo "FAILED → \$PREV 복귀"; fi; exit \$c; }
trap rollback EXIT
sudo sed -i "s|^FRONTEND_IMAGE=.*|FRONTEND_IMAGE=\$IMG|" .env; sudo chmod 600 .env
diff <(sudo grep -v '^FRONTEND_IMAGE=' "\$B/.env") <(sudo grep -v '^FRONTEND_IMAGE=' .env)
compose config --quiet
compose up -d --no-deps --no-build frontend
sleep 8
test "\$(sudo docker inspect -f '{{.Config.Image}} {{.State.Running}} {{.RestartCount}} {{.State.OOMKilled}}' crefans-beta-frontend-1)" = "\$IMG true 0 false"
test "\$others" = "\$(for s in api worker admin database proxy; do sudo docker inspect -f '{{.Name}} {{.Id}}' crefans-beta-\$s-1; done)"
for u in /service/feed /service/landing /service/legal/terms /api/v1/health; do
  c=\$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://crefans.com\$u"); echo "\$u \$c"; test "\$c" = 200; done
c=\$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://crefans.com/service/events/beta-feedback"); echo "redirect \$c"; test "\$c" = 301
css=\$(curl -s -m 20 https://crefans.com/service/landing | grep -o '/_next/static/[^"]*\.css' | head -1)
c=\$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://crefans.com\$css"); echo "static \$c"; test "\$c" = 200
c=\$(curl -s -o /dev/null -w '%{http_code} %{content_type}' -m 30 "https://crefans.com/_next/image?url=%2Fbrand%2Ffeatured-creators-v1.png&w=64&q=75"); echo "image \$c"; case "\$c" in "200 image/"*) ;; *) exit 1;; esac
sudo date -u +%FT%TZ | sudo tee "\$B/deployed" >/dev/null; trap - EXIT
echo "OK frontend=\$IMG"
EOF
log "deploy OK ($PREV → $IMG)"

# 8. 이전 이미지 → 맥 복구 저장소 (서버 디스크를 거치지 않고 스트리밍), 검증 후 서버 사본 정리
REC=$RECOVERY/$(date +%Y%m%d)/$TAG; mkdir -p "$REC"
remote "sudo docker image inspect -f '$PREV {{.Id}}' '$PREV'" > "$REC/IMAGE_IDS"
remote "sudo docker save '$PREV' | gzip -1" > "$REC/front-prev.tar.gz"
remote "sudo tar -C /opt/crefans-backup-$TAG -cf - .env deployed" > "$REC/settings-prev.tar"
(cd "$REC" && gzip -t front-prev.tar.gz && tar -tf settings-prev.tar >/dev/null \
  && tar -xzOf front-prev.tar.gz index.json >/dev/null && shasum -a 256 IMAGE_IDS front-prev.tar.gz settings-prev.tar > SHA256SUMS)
log "recovery $REC 검증 OK"
remote "sudo docker image rm '$PREV' && sudo rm -rf /opt/crefans-backup-$TAG && df -h / | tail -1" | tee -a "$OUT/ship.log"
log "완료. 맥 로컬 이미지 정리는 python3 infra/platform/image-retention.py --keep 3 계획 확인 후 별도로."
