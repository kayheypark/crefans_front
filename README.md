# 크레팬스 프론트

현재 신규 UI는 `/preview/*`(목업)와 `/service/*`(실제 API)가 같은 `components/crefans` 표시 컴포넌트를 사용한다. 기존 앱 경로는 교체 대상이며 신규 서비스 시작 주소는 `/service/feed`다. `/`를 신규 서비스 홈으로 간주하지 않는다.

## 시작

Node/npm 버전은 실행 환경과 lockfile에 맞춘다. 현재 E2E CI는 Node 22다.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3010
```

실제 API는 형제 `crefans_server`의 격리 개발 런타임(3001)이 필요하다. Next proxy의 `PLATFORM_API_ORIGIN` 기본값은 `http://127.0.0.1:3001`이며 다른 주소를 쓰면 서버 환경값으로 지정한다. 랜딩의 `NEXT_PUBLIC_LANDING_USE_ASSETS=true`는 기본 에셋 모드다. 브라우저 공개 변수에 비밀키를 넣지 않는다.

같은 `.next`를 쓰는 dev/build를 동시에 실행하지 않는다. E2E는 별도 `.next-e2e`와 3011/3012를 사용한다.

## 검증과 문서

```sh
npm run check
npm run check:docs
npm run test:e2e
```

- [화면 목록](./docs/preview-pages.md) / [서비스 바인딩·E2E 준비](./docs/service-api-binding.md)
- [디자인 시스템](./docs/design-system.md) / [계층도 원문](./docs/service-hierarchy.md)
- [출시 시나리오와 미결정 정책](./docs/release-test-scenarios.md)
- [문서 현행화 검증과 한계](./docs/documentation-verification.md)
- [작업 상태](./PROGRESS.md) / [작업 규약](./AGENTS.md)
