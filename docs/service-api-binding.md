# 목업 유지와 실제 서비스 바인딩

역할별 출시 검수와 합격 조건은 [정식 출시 검수 시나리오](./release-test-scenarios.md)를 기준으로 한다. 목업/공급자 대역 통과와 실제 공급사/운영 검증을 구분한다.

2026-10-07부터 실제 서비스를 목업과 별도 경로로 운영한다. 표시 컴포넌트는 둘 다 `components/crefans`를 사용하며, 실제 화면은 샘플 데이터/샘플 액션을 import하지 않는다.

| 계층 | 목업 | 실제 서비스 |
| --- | --- | --- |
| 경로 | /preview/* | /service/* |
| 컨테이너 | components/preview | components/service |
| 데이터/액션 | fixture·mock hook | features/service |
| HTTP | 없음 | lib/api/platform.ts → /api/v1 |
| 공통 표시 | components/crefans, components/ui | 같은 표시 계층 |
| 계정/권한/가격 | 테스트용 상태 | 백엔드가 검증한 실제 DB 값 |

원래 랜딩/팬/스튜디오 목업 URL은 유지한다. 새 API 실패 시 목업 데이터로 대체하지 않는다. 실 서비스가 비어 있으면 빈 상태를 표시한다. 외부 이메일·PASS·결제·은행 미설정 상태는 해당 행동의 오류로 표시하고 다른 페이지 조회를 막지 않는다.

## 로컬 링크

- 실제 홈: http://127.0.0.1:3010/service/feed
- 실제 탐색: http://127.0.0.1:3010/service/explore
- 실제 로그인/가입: /service/login, /service/signup
- 실제 프로필/멤버십/게시물: /service/creator/<UUID 또는 핸들>, /service/membership/<UUID 또는 핸들>, /service/post/<UUID>
- 팬 프로필: /service/member/<UUID 또는 회원 핸들>
- 내 프로필/설정/모아보기: /service/me, /service/settings, /service/following, /service/followers
- 구독·결제: /service/subscriptions, /service/subscriptions?tab=payments, /service/payment-methods, /service/checkout/<주문 UUID>
- 메시지/알림/지원: /service/messages, /service/notifications, /service/support, /service/notices, /service/legal/terms|privacy|policy
- 비밀번호 재설정: /service/reset-password
- 실제 스튜디오: /service/studio, /service/studio/start, /service/studio/content, /service/studio/content/new, /service/studio/content/<UUID>/edit
- 스튜디오 나머지 메뉴: memberships/subscribers/comments/messages/analytics/reports/revenue, reports/subscribers, reports/followers, earnings/settlements/withdraw/withdrawals/accounts/security/settings
- 기존 목업 링크 목록: docs/preview-pages.md

## 구현 경계

`useServiceModel`은 bootstrap/common과 경로별 직접 조회를 결합한다. `useDirectoryModel`은 서버 검색·카테고리·커서·늦은 응답 무시를 처리한다. 댓글 최초 10개/추가 10개, 답글은 클릭 시 별도 조회한다. 피드 페이지 추가 조회 후 좋아요·저장·읽음 처리로 목록이 초기화되지 않도록 확인된 상태만 갱신한다. 개인정보·계정 변경 등에는 실제 모델을 다시 조회한다.

`useStudioModel`은 overview/finance/community와 날짜별 reports를 표시 모델 계약에 맞춘다. 미등록 계정은 크리에이터 시작하기 화면으로 유도한다. 업로드는 FormData API에 연결하고 표시용 object URL을 실제 저장 주소로 오인하지 않는다. 전역 댓글 설정·가입 당시 멤버십 버전·계좌 확인·금액/계좌에 묶인 출금 인증을 서버에 맡긴다.

`useCheckoutModel`은 서버 주문·등록된 기본 카드·승인 결과를 표시한다. Toss 공개 키는 서버 설정 조회로 받으며 브라우저에서 server secret이나 billing key를 읽지 않는다. PASS는 팝업 시작→서버 결과 확인→서버 proof 흐름이다.

Next `/api/v1/[...path]`는 고정 PLATFORM_API_ORIGIN으로만 프록시한다. 쿠키·Origin·Range·PASS 서명·응답 쿠키를 보존하고 업로드/파일 응답을 스트리밍한다. 같은 출처 배포에서는 Caddy가 API에 직접 연결한다.

실제 코드에서 오래된 Cognito/Ant Design 앱의 provider를 적용하지 않는다. 기존 화면 자체는 사용자 지시대로 전환 대상이며 신규 바인딩 대상으로 삼지 않았다. legacy Toss 키 검증은 모듈 import가 아닌 SDK 사용 시에 실행해 계정값 없이도 전체 프로젝트를 빌드할 수 있다.

## API·DB·배포 기준

백엔드 저장소의 `docs/platform-implementation.md`, `docs/platform-api.md`, `docs/provider-contracts.md`, `infra/platform/README.md`를 함께 읽는다. 프론트는 BACKEND DB를 직접 조회하지 않는다. 운영 환경값은 해당 runtime.env 예시에 있으며 제공되지 않은 값을 임의 생성해 외부 서비스 완료를 흉내내지 않는다.

로컬 프론트는 3010의 기존 Next dev 하나를 사용한다. 같은 checkout의 .next를 공유하는 두 번째 dev/build를 실행하지 않는다. 이번 배포용 build 검증은 별도 임시 복사본에서 수행했다.

## 운영 전 남은 외부 작업

SMTP/Toss 계정 설정과 실제 테스트 환경 검증, PASS/은행 공급사별 공식 연동 bridge, 정책 값/약관 게시, 기존 사용자/구독/S3 이관, Docker 컨테이너 실행·TLS·백업 복구·부하 검증. 현재 백엔드 관리자 API는 제공하지만 새 관리자 UI는 포함하지 않는다. 메시지·지원·정산 등의 보조 목록은 현재 전체 관계 조회 방식이며 대규모 데이터의 서버 페이지 분리와 부하 검증은 운영 규모에 맞춰 추가한다.

## 랜딩 에셋 모드

- 단일 플래그 `NEXT_PUBLIC_LANDING_USE_ASSETS`: `true`(기본)=목업과 같은 에셋, `false`=실제 DB 크리에이터. NEXT_PUBLIC 환경값이므로 변경 후 dev 재시작/운영 재빌드. `.env.example`에 true 명시.
- `lib/content/landing.ts`의 이미지·문구·3단계 소개를 `/preview/landing`과 `/service/landing`이 함께 사용한다. 실제 모드에서도 고정 서비스 소개/히어로는 유지하고 카드/콜라주만 서버 데이터로 구성한다.
- 에셋 모드 샘플 프로필은 `/preview/creator/*`, 팔로우는 랜딩 내부 상태. 로그인·회원가입·탐색은 `/service` 경로를 유지한다. 그 외 실제 서비스 페이지의 API 연결은 그대로다.

로고 클릭은 `/feed`, 랜딩 진입은 팬 사이드바의 고객센터 바로 위 `서비스 소개`(`/landing`), 스튜디오에서는 기존 하단 링크. `/preview`에서도 동일한 basePath 경로 규칙을 사용한다.

### 결제수단 등록 (2026-10-07)
- `/api/v1/billing/registrations`에서 회원 전용 비공개 customerKey, registrationId/state, 승인된 복귀 경로를 받고 Toss 등록창으로 이동한다. 카드번호/CVC는 서비스 서버가 수집하지 않는다.
- 복귀 콜백은 authKey를 즉시 URL에서 제거하고 등록 시도와 함께 서버로 보낸다. sessionStorage에는 시도 식별자/복귀 경로만 저장한다. 성공·취소·오류 결과와 재시도 및 원 주문 복귀를 제공한다.
- 목업은 동일 결제수단 관리 컴포넌트에 가상 카드/인증 데이터를 주입해 동의→본인 확인→등록 흐름을 확인한다. 실제 서비스는 공식 PG 창을 사용한다.
- 서버는 빌링키를 암호화하고, 삭제 시 PG 해제 후 암호화 키를 지운다. 해제 실패는 worker가 재처리하며 갱신/진행 중 결제에 사용되는 카드는 삭제를 차단한다.

### 2026-10-08 결제 상태/환불 연결

실제 checkout은 같은 순간 중복 클릭을 막고, 미확인 승인 후 원래 주문을 재조회한다. 확정 실패 주문은 `/checkout/:id/retry` 이후 `/pay`로 재결제한다. 카드 등록 콜백은 복구된 로그인 이후 한 번 처리하며 authKey를 저장하지 않는다. 공통 구독/결제 내역 컴포넌트에 실제 `refundOrder` 액션을 주입하여 확인 모달 뒤 전액 환불을 요청한다. 환불 완료/확인 중 상태를 표시하고 결제 내역 탭 URL을 유지한다. `/preview` 경로와 공유 컴포넌트 구조는 보존한다. 백엔드 상세 검증/정책 경계는 server/docs/provider-contracts.md 참조.

## Playwright 반복 검증 도구 (2026-10-08)

프론트에서 `npm run test:e2e`를 실행한다. 현재 실제 PG/PASS/은행 키 없이 동작하는 Chromium PC·모바일 검사다. `e2e/preview.spec.ts`는 목업 화면/필수 입력/비밀번호 토글/팔로우 해제 확인/모바일 스튜디오 안내, `e2e/service.spec.ts`는 실제 서비스 API·DB로 가입·PASS 팝업·로그인·유료 권한·결제/실패 복구/갱신/해지/환불·이미지 업로드/GET/HEAD/Range·계좌/PIN/출금·세션 갱신/만료를 검사한다. 목업 스모크 테스트는 시각적 픽셀 비교나 모든 상호작용 검증을 의미하지 않는다.

### 실행 준비

- 프론트와 백엔드를 형제 디렉터리 `crefans_front`, `crefans_server`로 둔다. 다른 경로면 `CREFANS_SERVER_DIR`에 백엔드 절대 경로를 지정한다. 두 리포에 이번 E2E 변경과 최신 migration이 있어야 한다.
- 두 프로젝트 `npm ci`, 백엔드 Prisma Client 생성(`npx prisma generate`)을 준비한다. Chromium은 프론트 `npm run test:e2e:install`로 설치한다. Linux CI는 `npx playwright install --with-deps chromium` 사용.
- 백엔드 `.local/platform.env`에 기존 격리 127.0.0.1:3307/crefans_platform_dev 연결 설정이 있어야 한다. 일반 `.env`는 로드하지 않는다. 이 MySQL 인스턴스가 실행 중이어야 한다.
- 테스트 시작 시 동일 로컬 인스턴스에 **crefans_platform_e2e** DB를 만들고 그 DB에만 migration deploy를 적용한다. 개발/운영 DB는 초기화하지 않는다. 최초 DB 생성 권한이 필요하며 없다면 이 테스트 DB를 운영자가 미리 생성하고 해당 로컬 사용자에게 권한을 부여한다.
- E2E 전용 API3012·프론트3011·`.next-e2e`를 자동 시작한다. 기존 개발3010/API3001/`.next`는 재사용하지 않는다. 전용 포트가 이미 점유되면 실패하므로 다른 E2E 실행과 동시에 돌리지 않는다. 실행 완료/Ctrl+C 시 전용 서버를 종료한다.
- 서비스 검사마다 팬·크리에이터·다른 회원, 멤버십·전용 글·카드·정책·출금용 수익을 생성하고 finally로 해당 데이터만 정리한다. 종료 시 남은 fixture도 정리한다. SIGKILL/전원 종료는 cleanup을 보장하지 못하므로 E2E 전용 DB의 잔여 테스트 데이터만 따로 점검한다.

### 명령

```sh
npm run test:e2e                        # 전체 PC·모바일 검사
npm run test:e2e -- --project=chromium e2e/service.spec.ts
npm run test:e2e -- --grep '환불'       # 선택 실행
npm run test:e2e:headed                 # 브라우저를 보며 실행
npm run test:e2e:ui                     # UI에서 선택·반복 실행
npm run test:e2e:report                 # 최근 HTML 결과 확인
```

실패 시 `test-results/`에 스크린샷·영상·trace가 남는다. `npx playwright show-trace <trace.zip>`으로 요청/응답과 화면을 확인한다. `playwright-report/`, `test-results/`, 인증 상태 디렉터리는 Git에서 제외한다. 결과에는 합성 계정/테스트 인증 코드가 포함될 수 있으며 공개 보고서 업로드 전 내용을 확인한다. 실제 자격증명으로 이 대역 테스트를 실행할 필요가 없다.

### 공급사·보안 경계와 CI

백엔드 `tests/e2e-server.cjs`는 테스트 전용 실행 파일이며 `src/`와 운영 엔트리에서 import하지 않는다. loopback에만 바인딩하고 제어 API는 실행마다 무작위 토큰으로 보호한다. 테스트 DB 연결과 E2E 모드를 먼저 검사하며 SMTP/Toss/PASS/은행은 합성 응답으로 고정한다. 공급사 HTTP 호출은 대역 밖 목적지를 거부하고 은행 지급은 대역에서만 수행한다. 토스 SDK 실제 인증창·PG 매입/취소 내역, 실제 PASS 전문·은행 이체 계약·이메일 전달성은 별도 실연동 검수다. `renew`/`payout` 제어는 해당 fixture의 도메인 메서드를 호출하며 운영 scheduler 전체 실행을 증명하지 않는다.

`.github/workflows/playwright.yml`은 수동 workflow_dispatch 템플릿이다. 백엔드 repository/ref를 입력하고 private 저장소라면 읽기 권한의 `E2E_REPO_TOKEN`을 등록한다. 일회용 MySQL·Chromium 설치·기존 check·E2E·7일 결과 보관을 구성했다. 원격 커밋/실행은 이번 작업에서 하지 않았으며 CI 성공으로 보고하지 않는다.

참고 확인일 2026-10-08: [Playwright webServer](https://playwright.dev/docs/test-webserver), [fixtures](https://playwright.dev/docs/test-fixtures), [인증 격리](https://playwright.dev/docs/auth). 환경을 공유하는 기존 서버를 임의 재사용하지 않고 각 상태 변경 검사에 별도 계정을 사용한다. 97개 출시 검수의 전체 자동화·출시 승인과 구분한다.

2026-10-08 로컬 검증 결과: Playwright47/47(PC29·모바일18), 기존 check273/273, API·권한 통합19/19 통과. 테스트 데이터 잔여0 및 전용 서버 종료 확인. 실행 중 발견한 가입 완료 화면 소실·프로필 팔로우 버튼 클릭 차단을 수정하고 E2E로 재검증했다. GitHub Actions는 문법 검증만 수행했다.

## 단건결제 연결 (2026-10-21)
실제 checkout은 등록 카드의 월 자동결제 또는 '한 달만 결제하기' 일반 카드 결제를 지원한다. 후자는 /checkout/:id/payment-window에서 서버 금액을 받고 SDK requestPayment를 호출하며 /service/payment/success|fail로 복귀한다. success는 /checkout/:id/confirm에서 소유권/주문번호/금액 확인 후 승인하고, 한 달 권한을 자동 갱신 없이 생성한다. 콜백 paymentKey는 URL에서 제거하고 브라우저 저장소에 보관하지 않는다. /preview 링크는 유지한다. 단건 카드사 인증 이후 실공급자 승인/취소는 후속 검증 항목이다.

### 2026-10-21 미이용 전액 환불 API 준비

일반 구독 종료는 갱신 해지 예약을 유지한다. 결제 상세의 셀프 환불 진입을 제거했고, 환불 action/API는 미이용 검증을 붙여 보존한다. `GET /api/v1/checkout/:id/refund-eligibility`로 UI 추가 전에 가능 여부를 조회할 수 있다. 공통 bootstrap은 유료 본문/미디어를 제외하며 저장·좋아요 모아보기(`/service/me?tab=saved|liked`)만 `collection` query로 해당 콘텐츠를 요청한다. 실제 제공 경계에서 서버가 회차별 최초 이용 시각을 기록하므로 결제/설정 화면 진입만으로 소비되지 않는다. 과거 미추적 결제는 수동 확인 대상이다. 상세 계약은 [공급사/환불 계약](../../crefans_server/docs/provider-contracts.md)을 따른다.
