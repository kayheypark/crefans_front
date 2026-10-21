# 설치와 실행

현재 신규 서비스의 설치·개발 명령은 [프론트 README](../README.md)를 따른다. 기존 Ant Design 앱도 저장소에 남아 있으므로 루트 `/`와 신규 `/service/feed`를 구분한다.

- 의존성 재현: `npm ci` (lockfile 사용).
- 개발: `npm run dev -- --hostname 127.0.0.1 --port 3010`. 기존 프로세스가 있으면 두 번째 서버를 같은 `.next`로 실행하지 않는다.
- 정적 검사/단위: `npm run check`.
- 문서 검증: `npm run check:docs`. 형제 백엔드가 필요하며 다른 위치면 `CREFANS_SERVER_DIR` 지정.
- 브라우저 검사: `npm run test:e2e`. 전용 로컬 MySQL과 Chromium 준비는 [서비스 바인딩](./service-api-binding.md) 참조.
- 운영 빌드: dev와 별도 checkout에서 `npm run build`, 이후 `npm run start`. 이것만으로 백엔드·TLS·운영 공급사 검증이 완료되지 않는다.
