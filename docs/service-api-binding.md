# 목업 유지와 실제 서비스 바인딩

## 게시물 멤버십 안내 데이터 (2026-10-24)

`useServiceModel`은 피드 첫/다음 페이지와 게시물 상세가 이미 반환하는 작성자 프로필의 `plans`를 `data.creatorPlans`에 합친다. bootstrap에 있던 오래된 이름·가격·혜택은 최신 응답으로 교체하며 빈 목록도 그대로 반영한다. 표시 컴포넌트는 네트워크 호출 없이 전달된 상품으로 안내한다. 멤버십 안내 레이어 열기는 조회 화면의 지역 상태 변경이고, 선택 링크만 기존 `/service/membership/:creatorId?plan=:planId` 흐름으로 이동한다. 서버 접근권한 및 가입 snapshot 계약은 유지한다. 최초 로컬 어댑터 검증은 [검증 기록](./audit/membership-offer-20261024.json)에 있다. 이후 `membership-ui-20261024` 프론트로 운영 배포했으며, 운영 서비스의 API대역 상품 안내 검사와 실제 API 비로그인 피드/로그인 검사를 분리한 [배포 증거](./audit/membership-ui-deployment-20261024.json)를 따른다.

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

`Post.views`는 `/bootstrap`, `/posts`, `/posts/:id`가 전달하는 `Posting.total_view_count` 누적값이다. 공용 표시부가 그대로 사용하며 이전 API처럼 값이 없으면 생략한다. 신규 v1은 조회 증가를 아직 기록하지 않으므로 이 표시 연결을 자동 집계 완료로 해석하지 않는다. 현재0인 DB 값은0으로 유지한다.

`useServiceModel`은 bootstrap/common과 경로별 직접 조회를 결합한다. 홈 카테고리 선택은 `feedCategory`로 주입하고 `/posts?category=분야` 및 cursor 추가 조회에 동일하게 전송한다. 필터 변경 시 이전 커서를 초기화하고 과거 응답을 무시한다. 조회 실패 시 bootstrap의 다른 분야 게시물로 대체하지 않는다. 크리에이터 프로필의 creatorId 조회는 카테고리 선택의 영향을 받지 않는다. `useDirectoryModel`은 서버 검색·카테고리·커서·늦은 응답 무시를 처리한다. 댓글 최초 10개/추가 10개, 답글은 클릭 시 별도 조회한다. 피드 페이지 추가 조회 후 좋아요·저장·읽음 처리로 목록이 초기화되지 않도록 확인된 상태만 갱신한다. 개인정보·계정 변경 등에는 실제 모델을 다시 조회한다.

`useStudioModel`은 overview/finance/community와 날짜별 reports를 표시 모델 계약에 맞춘다. 미등록 계정은 크리에이터 시작하기 화면으로 유도한다. 업로드는 FormData API에 연결하고 표시용 object URL을 실제 저장 주소로 오인하지 않는다. 전역 댓글 설정·가입 당시 멤버십 버전·계좌 확인·금액/계좌에 묶인 출금 인증을 서버에 맡긴다.

스튜디오 댓글 답글은 `StudioCommentReply`를 목업·서비스·디자인 시스템에서 공유한다. `CommunityReply.author`와 `fromCreator`로 작성자 사진·이름·본인 여부를 표시한다. `useStudioModel.updateReply/deleteReply`는 `/studio/comments/:id/replies/:replyId`의 PUT/DELETE에 연결하고 성공 시 목록을 다시 조회한다. 실패 시 변경 내용을 성공으로 표시하지 않으며 편집 초안을 유지한다. `/preview`는 선택한 목업 크리에이터의 활동명·사진과 메모리 상태를 사용한다. 2026-10-28 추가, 운영 미배포.

`useCheckoutModel`은 서버 주문·등록된 기본 카드·승인 결과를 표시한다. Toss 공개 키는 서버 설정 조회로 받으며 브라우저에서 server secret이나 billing key를 읽지 않는다. PASS는 팝업 시작→서버 결과 확인→서버 proof 흐름이다.

Next `/api/v1/[...path]`는 고정 PLATFORM_API_ORIGIN으로만 프록시한다. 쿠키·Origin·Range·PASS 서명·응답 쿠키를 보존하고 업로드/파일 응답을 스트리밍한다. 같은 출처 배포의 일반 API는 Caddy가 API에 연결하고, CDN 보호 미디어 경로는 엣지가 현재 권한 API를 확인한 뒤 S3 파일을 전달한다.

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

로고 클릭은 `/feed`, 랜딩 진입은 팬 사이드바의 고객센터 바로 위 `서비스 소개`(`/landing`), 스튜디오에서는 기존 하단 링크. 빈 홈 피드에는 서비스 소개·고객센터·공지사항·크리에이터 스튜디오 푸터 링크를 추가로 표시해 모바일에서도 접근할 수 있다. 사이드바와 빈 피드는 `components/crefans/ServiceLinks.tsx`를 공유하며 `/preview`에서도 동일한 basePath 경로 규칙을 사용한다.

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

2026-10-21 금융 정책 DB 전환: 수수료율/정산 보류를 관리자 API로 변경할 수 있다. 최고 관리자만 GET/PUT `/api/v1/admin/financial-policy` 및 이력 조회 가능하며, 일반 팬/스튜디오 화면에는 설정 UI를 추가하지 않았다. 신규 최초 결제에는 DB 최신값을 읽고 기존 구독 갱신과 승인 복구에는 기존 snapshot을 유지한다. 재시작은 필요하지 않으며 운영 설정이 없으면 신규 결제는 차단된다.


### 사고 추적 보완 (2026-10-22, 로컬 구현)

`/service`에서 전역 오류·Promise rejection·React error boundary를 수집한다. `/preview`는 유지한다. 전송은 lib/api/browser-errors.ts에 한정하며 오류 종류와 `_next/static` JS 위치만 허용한다. 메일/비밀번호/본문/URL/query/원문 stack은 보내지 않는다. 페이지당5건과 중복 억제, 서버 IP별10회/분 제한을 적용했다. 클라이언트 보고는 비신뢰 입력이고 보안 자동 차단/Telegram을 직접 유발하지 않는다. 서버 X-Request-ID를 프록시에서 전달하고 5xx 안내에 표시한다. 별도 운영 콘솔 `/console/logs`와 [서버 수집 범위](../../crefans_server/docs/operational-logging.md), [이번 검증](../../crefans_server/docs/logging-implementation-20261022.json)을 참고한다. 운영 반영은 아직 하지 않았다.


### 결제수단 불능·갱신 대기 (2026-10-22)

`requiresUpdate` 카드는 카드 관리에서 변경 안내와 기본선택 비활성으로 표시한다. 실제 checkout도 불능 기본카드로 새 청구를 시작하지 않는다. `subscriptions.renewalPending`은 유효 이용권한과 구분된 갱신 대기 섹션에 표시하며 `billingIssue`/`retryAt`로 카드변경/다음시도·해지 동선을 제공한다. `/preview`와 공통 뷰를 유지한다. PC/390px 브라우저 검증은 `e2e/billing-recovery.spec.ts`, 실제 DB/공급사대역·SMTP 및 운영 결과는 서버 `docs/billing-recovery-20261022.json`. 실제 분실카드 청구/외부메일 전달성 검증을 대신하지 않는다.

### 세션 보호 미디어 (2026-10-22)

미디어 URL은 `/api/v1/media/:id/file`만 사용한다. GET/HEAD/Range마다 API가 세션·소유권/구독/기간/열람 기록을 검증한다. 운영 CDN은 캐시 적중 전 이 API를 호출하고 비공개 S3 바이트를 직접 전달한다. 쿠키를 S3로 보내거나 bearer 서명 URL을 사용하지 않는다. 직접 API 스트리밍은 같은 권한의 롤백/legacy 경로이며 legacy 파일만 동일 호스트 origin-file 경로로 이동할 수 있다. Next 프록시는 HEAD와 취소 신호·보호 헤더도 전달한다. 카드·오버레이·편집 썸네일의 `MediaVideo`는 관리형 API 주소의 재생 실패 시 같은 인증 API로 제한된 재시도를 하고 위치를 복원한다. 목업/외부/blob URL은 재시도하지 않는다. 다른 세션에서 복사한 이미지·영상 주소의 접근 거절을 실제 브라우저로 검증하며 [서버 운영 문서](../../crefans_server/docs/private-media.md)를 따른다.

### 2026-10-22 멤버십 레벨 공개

공통 ManagementPages에서 멤버십 rank(1~100), 게시물 `전체 공개`/`레벨 N 이상`/`상품명 전용`을 설정한다. 실제 모델은 accessLevel/rank를 API에 전달하고 목업도 같은 표시 컴포넌트와 검증 계약을 쓴다. 기존 상품 전용은 유지. 신규 가입 스냅샷의 레벨로 최소 공개를 판정하고 과거 계약은 상품 수정으로 변경하지 않는다. 팬 잠금 안내·카드·미리보기에도 조건을 표시한다. 백엔드 [플랫폼 API](../../crefans_server/docs/platform-api.md)와 [미디어 계약](../../crefans_server/docs/private-media.md)을 따른다.

## 법률문서와 가입 안내 (2026-10-22)

실제 `/service/legal/{terms,privacy,policy}`와 가입 모달은 서버 코드 원본 `legal-documents.ts`를 같은 `LegalDocumentBody`로 표시한다. 가입 화면의 필수 개인정보 항목은 처리방침 확인이며 마케팅 동의와 분리한다. 주입된 버전/본문 해시를 signup.policyVersions로 전송하고, 최신 시행본과 불일치하면 서버409로 거부한다. 안내를 열었다고 체크박스를 자동 체크하지 않는다. `/preview`는 같은 컴포넌트에 별도 예시 문서를 주입하고 기존 링크를 유지한다.

현재 문서는 2026-10-30.2(공개일2026-10-22, 시행일2026-10-30)이며 공개일과 신규가입 적용 시행일을 구분한다. documentsPublished=true라도 signupReady=false이면 가입·가입인증메일을 차단한다. 2026-10-30 사용자 확인(국외이전 내용·일반 콘텐츠 베타 검수)과 처리방침 7·8·9조 보완(파기·보관기간, AWS Korea·Google Asia Pacific·Telegram 국외 이전, 구독 시 크리에이터 제공 동의)으로 blockers를 비우고 signupReady=true가 되었다. 베타 초대 명단 검사는 그대로다. 가입연령은 만19세 이상으로 확정하고 서버 검사를 적용했다. 발행본 대역으로 통과한 E2E를 실제 가입 개방/법률검토/공급자 검증으로 해석하지 않는다. 상세 근거와 완료 조건은 [백엔드 구현](../../crefans_server/docs/platform-implementation.md)의 코드 관리 약관 절을 따른다.

- 가입 UI와 약관은 만19세 이상 기준을 함께 안내한다. 실제 권한은 서버의 서명된 공급사 결과/DB proof로 검사하며 프론트 체크박스·자가신고로 연령을 증명하지 않는다. 목업은 공유 UI/샘플 본문을 사용하고 PASS 성공 대역임을 표시한다.

## 2026-10-24 홈·메시지 운영 반영

`feed-inbox-20261024`에서 홈 category/cursor 조회와 수신 메시지 읽음 API를 함께 배포했다. 현재 운영 카테고리·게시물 데이터는 비어 있어 전체 칩과 빈 피드가 표시된다. 데이터가 있는 경우의 필터/페이징 및 읽음 상태 전환은 배포 이미지·운영 목업/응답 대역과 실제 격리 DB에서 검증했다. 실운영 회원 메시지는 변경하지 않았다. 선택된 소스·이미지·운영 검사 범위는 [배포 증거](./audit/feed-inbox-deployment-20261024.json)를 따른다. 준비중 가입 변경은 이 배포에 포함하지 않았다.


## 게시물 공유 (2026-10-25)

공용 PostShareDialog → `features/post-share/usePostShare` → `lib/browser/post-share` 경계로 브라우저 기능을 연결한다. 서버 API나 실제/목업 데이터를 복제하지 않으며 공유 시 별도 게시물 조회를 요청하지 않는다. 세 방식 모두 현재 보고 있는 게시물의 ID로 페이지 주소를 구성한다. 카카오와 기기 공유에는 공개 제목과 페이지 URL만 전달하고 본문·첨부·직접 파일 링크는 제외한다.

카카오 SDK2.8.4는 [공식 다운로드](https://developers.kakao.com/docs/ko/javascript/download)의 SRI를 고정해 레이어 진입 후 한 번 준비한다. SDK 불러오기를 기다린 뒤 자동 공유하지 않고 사용자의 다음 버튼 클릭에서 실행한다. `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`는 공개 JavaScript 키이며 빌드 시 주입된다. `.env.example`의 빈 칸 및 `infra/platform/Dockerfile`의 동명 build arg를 제공했다. 연결 절차·한계는 [외부 서비스 안내](./third-party-setup.md)를 따른다. 키가 없으면 외부 SDK를 요청하지 않는다. 복사/더보기는 카카오 연결과 독립적이다.

### 2026-10-25 확정 베타 정책 연결

공통 ServiceGuidePage를 `/preview/guide/{fan,creator}`와 `/service/guide/{fan,creator}`에 연결하고 고객센터 FAQ/안내 링크를 공유한다. 설정에서 광고 수신 선택을 저장할 때 marketingVersion을 전달하며, 실제 데이터는 서버의 버전 동의/철회 이력을 따른다. 프록시는 수신거부 HTML과 Accept/CSP/Referrer-Policy를 전달한다. 가입·법률 게이트는 유지한다. 출금 공통 UI·목업도 최소10만원이며 정산 날짜는 확정 입금일로 오인하지 않도록 보류기간 종료일로 표시한다. 신규 주문의 테스트 결제/미사용7일 정책은 checkout snapshot을 표시한다. 별도 환불 버튼은 없다.

검증: `e2e/beta-policy.spec.ts`, `e2e/service.spec.ts`, `e2e/billing-recovery.spec.ts`, `e2e/signup-deferred.spec.ts`. 실제 SMTP/PG/PASS/은행이 아닌 격리 DB·공급사 대역이다. 적용/남은 개방 조건은 [베타 계획](./beta-role-test-plan.md)을 따른다.


## 콩 충전·후원 연결 (2026-10-25)

`features/service/useBeansModel.ts`는 bootstrap.beanSupport와 세션으로 활성화하며 `BeanContext`/`BeanPages`를 목업과 공유한다. `/service/beans` 지갑·잔액/내역, `/service/beans/charge` 전용 수량 선택·충전, `/service/beans/success`/`fail` PG 결과, `/service/studio/beans` 수익·출금을 연결했다. 목업은 동일 경로의 `/preview` prefix와 useMockBeans 모델이며 실제 PG/은행 요청을 보내지 않는다. 기존 목업 카탈로그/링크는 유지한다.

결제는 서버 주문을 만든 뒤 SDK 개별 결제창을 호출하고, 결과 URL의 결제키는 읽은 즉시 제거한다. 성공 URL 방문만으로 충전하지 않고 서버의 소유자·원화 금액·PG 상태 확인 결과로만 반영한다. pending 주문은 다시 결제, processing은 같은 주문 재조회다. 후원/출금 요청키는 결과 불명 때 유지하며 입력 변경 때만 새로 만든다. 화면 뒤로가기/새로고침에도 확정 잔액은 DB에서 조회한다.

서버 기능은 기본 off, live 판매는 별도 gate다. 테스트 키 충전으로 실제 출금할 수 없으며 실입금·보류·PIN/계좌 버전과 베타 송금 차단은 서버에서 검사한다. 크리에이터/팬 공용 UI는 서버 오류를 표시하고 가짜 성공으로 대체하지 않는다. PG/은행 대역 E2E는 실제 금융 검증이 아니다. 출처/검증 근거: 서버 docs/platform-api.md 콩 절, 프론트 e2e/beans.spec.ts, 독립 콘솔 e2e/beans.spec.ts.

2026-10-25 운영 배포: 위 콩 공용 UI/실API를 beans-20261025로 반영했다. 기능은 on, beta/test 결제·live 승인 false·실송금 false이며 로그인 보호는 유지한다. [운영 검증](./audit/bean-deployment-20261025.json)에서 실제 소스/DB/화면/배치 검수와 미실행 실금융 범위를 확인한다.

2026-10-25 충전 전용 화면(운영 반영: bean-wallet-20261025): 공용 `BeanChargePage`와 기존 `Radio`를 사용해 10/30/50,100/300/500,1000/5000/10000콩을3열로 선택한다. 옛 ChargeModal의 수량/가격·선택 요약 구도만 참고하고 구형110원 상품표/PG 모델은 호출하지 않는다. 현행1콩100원·서버 가격산출·기존 주문/결제창/결과 경로는 그대로 유지한다. 지갑과 후원 레이어에서 진입하며 지갑의 미완료 주문 재시도도 유지한다. [검증 기록](./audit/bean-charge-page-20261025.json).

2026-10-25 지갑 잔액 계층(운영 반영: bean-wallet-20261025): `BeanBalanceSummary`는 지갑/스튜디오에서 사용 가능한 콩·출금 가능한 콩만 주요 지표로 표시한다. 일반/프로모션과 보류·출금제외·처리중 잔액은 기존 AccordionItem의 기본 펼쳐진 계층 목록으로 제공한다. 서버 `/beans/wallet`의 `spendableBeans`·`spendableBreakdown`은 미동결 purchased/promotion lot, `withdrawableBeans`는 출금 심사 `eligible`의 일반 후원콩(live/실입금/보류완료/미동결)과 2026-10-26 승인된 회사 지급·후원 출처 검증 프로모션 후원콩의 합이다. `withdrawableBreakdown:{paid,promotion}`을 별도 표시한다. 누락값을 보유 잔액으로 추정하거나0으로 위장하지 않으며 출금 최소수량/PIN/은행 조건을 면제하지 않는다. [검증 기록](./audit/bean-balance-hierarchy-20261025.json).

지갑 툴팁·모바일 내 지갑·전용 충전/잔액 계층은 `bean-wallet-20261025`로 운영 반영했다. API/worker·프론트2이미지/실행소스749파일·운영HTTP14/브라우저14·새 worker heartbeat를 확인했고 DB/관리자콘솔·미디어 및 가입/실금융 차단은 보존했다. 실제 PG/송금은 실행하지 않았다. [운영 증거](./audit/bean-wallet-deployment-20261025.json).


2026-10-25 `bean-clay-20261025`: 충전9카드에 승인된 수량별 클레이 이미지를 적용하고 지갑의 개별 목업 안내를 제거했다. 공용 표시 컴포넌트 변경이므로 목업/실서비스 동시 적용되며 수량·가격·주문·결제 API는 불변이다. 프론트만 교체하고 API/worker는 `bean-wallet-20261025` 유지. 운영14HTTP/이미지10해시·실행563파일 및 PC/모바일7검사 통과, 실금융 실행은 제외. [배포 증거](./audit/bean-clay-deployment-20261025.json).

2026-10-25 최신 프론트/API/worker `bean-vat-20261025`: 30/50이미지교환·배수제거·VAT포함110원/콩 신규충전. 프론트는 요청수량만 전송하고 서버가 금액을 계산·저장,PG창/승인은 저장금액 사용. 기존 주문 snapshot/후원·출금100원 기준·20% 유지.329프론트/30서버·4격리DB대역E2E·운영14HTTPS/806실행파일/9이미지SHA 확인. 실제PG 승인 미실행. [증거](./audit/bean-vat-deployment-20261025.json).


### 콩 충전 완료 화면 (2026-10-26, 운영 반영)

`BeanPaymentResultPage`는 충전 수량·저장된 결제 금액(VAT 포함)·주문번호·지갑/탐색 이동을 제공한다. 실제 `useBeanPaymentResult`는 소유자 전용 GET 주문 API를 먼저 확인한다. 이미 paid이면 승인 API를 재호출하지 않고, pending/processing이며 성공 콜백에 결제키가 있을 때만 기존 승인 API를 호출한다. 완료는 응답의 paid 상태에만 해당한다. 조회 실패/취소/미확정에서는 영수증을 숨긴다. 주소에서 결제키·금액을 제거하고 주문 ID만 유지하며 새로고침 시 저장 주문을 조회한다. 지갑 갱신 실패를 승인 실패로 표시하지 않는다. 기존 주문 금액을 현재 단가로 재계산하지 않는다.

목업 결제와 지갑의 결제 계속은 `/preview/beans/success?id=...`로 이동해 같은 결과 화면을 사용한다. `/preview/beans/success` 직접 진입의 100콩 예시는 목업 컨테이너에서만 주입하고 실제 서비스에는 적용하지 않는다. 목업 주문 상태는 기존처럼 메모리에 있으므로 전체 새로고침 시 사라진다. 실제 주문은 DB에서 복원한다.

근거 확인일2026-10-26: [토스페이먼츠 결제창 연동 공식 문서](https://docs.tosspayments.com/guides/v2/payment-window/integration)의 인증 후 서버 금액검증·결제 승인·응답 확인 단계에 따라 성공 URL 자체를 결제 완료로 간주하지 않는다. 검증은 `tests/bean-payment-result.test.cjs`, `e2e/beans.spec.ts`, [실행 증거](./audit/bean-completion-20261026.json). 개발 검증은 격리 DB·PG/은행 대역이다. 후속 `bean-wallet-ui-20261026` 프론트 배포에서 운영 목업 흐름·실서비스 비로그인 가드·소스613개 해시를 확인했다. 실공급자 결제는 실행하지 않았다. [운영 검증](./audit/bean-wallet-ui-deployment-20261026.json).


### 지갑 내역 전용 페이지 (2026-10-26, 운영 반영)

`/service/beans` 제목은 **지갑**이며 내역 본문은 `/service/beans/charges`(충전 내역), `/service/beans/history`(콩 내역), `/service/beans/tips`(후원 내역)로 분리했다. `/preview`에도 동일 경로/공용 컴포넌트를 사용한다. 새 페이지는 로그인·기능 활성화 조건을 보존하고, 페이지 진입 시 첫 페이지로 조회한다. 당시 운영의 충전 주문은 최근20건만 제공했으며 이동 내역/보낸 후원은20개씩 넘겼다. 현재 로컬의 전체 기간 필터·주문 페이지네이션은 아래 후속 절을 따른다. 미결제 주문 재시도/확인 중 주문 재조회/완료 주문 상세 진입을 유지한다. API·DB·가격·출금 정책 변경 없음. 2026-11-02 화면 명칭을 통일했으며, 친구 초대 이벤트(`/service/beans/referral`)를 이용할 수 있을 때 지갑의 첫 번째 메뉴로 표시한다. URL과 조회 범위는 유지한다.

보낸 후원 조회 오류 때 이전 응답을 남기지 않고 오류로 표시하도록 실제 모델을 보정했다. 재시도로 복구할 수 있으며 실패를 빈 내역으로 오인시키지 않는다. 목업은 충전 완료 기록과 후원 기록·크리에이터 이름을 해당 목록에 제공하고 같은 페이지 크기를 사용한다. 목업 전체 새로고침 시 메모리 초기화는 유지한다. [검증 기록](./audit/bean-wallet-pages-20261026.json).

2026-10-26 프론트 `bean-wallet-ui-20261026` 운영 반영: 지갑 제목·기본 펼침·초록 다색 충전 CTA·3개 전용 내역·충전 완료를 공유 컴포넌트에 적용했다. API/worker는 `bean-vat-20261025`, DB·금융 정책·가입/실금융 차단 조건 유지. [배포 증거](./audit/bean-wallet-ui-deployment-20261026.json).

### 주문번호·이력 필터 (2026-10-26, 운영 미배포)

`BeanHistoryPage`가 기간·상태·방향·검색 상태를 관리하고 `BeanHistoryView`에 주입한다. `useBeansModel.refresh(false,page,query)`는 wallet에 from/to/status/direction, sent tips에 from/to/q를 전달한다. 늦게 도착한 이전 조건의 응답은 generation으로 버린다. 목업/카탈로그는 `filterBeanHistory`로 전체 예시에 같은 조건을 적용한 뒤20개씩 자른다. 결과 총수와 초기화·빈 검색 결과를 제공한다. API 오류는 별도 오류 상태다.

- 공통 기간: 전체/최근1·3·6개월/1년. 최근 기간은 오늘의 KST 날짜부터 달 수를 빼고 해당 월의 말일로 보정한다. 양끝 날짜를 포함하며 전체 기간은 날짜 매개변수를 보내지 않는다.
- `/beans/wallet`: `from`,`to`(YYYY-MM-DD), `status`(pending/processing/paid/failed/cancelled/disputed), `direction`(in/out). 기간을 주문 생성일/이동일에 적용하고 상태는 주문에, 방향은 이동 증감 부호에 적용한다. `chargesTotal`/`entriesTotal`은 해당 조건의 총수. 지갑 잔액과 금융 정책은 필터와 무관하다.
- `/beans/tips`: 같은 기간과 `q`(100자 이하, 현재 표시 크리에이터명 또는 메시지 부분 검색). 본인 sender 조건을 유지하고 필터 후 정렬·페이지 처리. `%`·`_`·역슬래시는 LIKE 검색에서 리터럴로 이스케이프한다.
- 주문 응답 `createdAt`을 화면에서 `CF-YYYYMMDDHHmmss`(KST)로 표현한다. 생성일이 없는 응답은 `확인 불가`이며 결제일/현재시각으로 대체하지 않는다. 표시번호는 같은 초 중복 가능성이 있는 표시값이다. 결제·권한·멱등성·고객지원 실제 대조는 UUID를 유지한다. DB migration 없음.
- 다음 배포 시 API/worker와 프론트가 모두 필요하다. 현재 운영 API `bean-vat-20261025`와 프론트 `bean-wallet-ui-20261026`는 이번 필터를 포함하지 않는다.

UI 조사(2026-10-26): [쿠팡 공식 주문목록 진입 안내](https://news.coupang.com/archives/63616/)와 [2025-06-21 모바일 주문목록 캡처가 있는 사용기](https://miamiduri.tistory.com/261)를 참고했다. 상단 검색·주문별 날짜/상태/상세 진입 구성을 참고한 것이며 쿠팡의 현재 로그인 화면이나 필터 옵션을 전부 실조작 검증한 것은 아니다. 기간 칩·상태 선택·초기화는 크레팬스 기존 ChipRow/SelectField에 맞춘 적용 판단이다. [검증 기록](./audit/bean-history-filters-20261026.json).

2026-10-26 후속 운영 반영: 위 주문번호·세 이력 필터와 예시 데이터를 frontend/API/worker `bean-history-20261026`로 배포했다. 이전 미배포 표기는 당시 기록이다. 소스해시·주요HTTP·worker·운영 목업4브라우저 조건 통과, DB/금융정책 유지. [배포 검증](./audit/bean-history-deployment-20261026.json).


### 게시물 후원자 수 (2026-10-26)

게시물 응답 `supporterCount`는 `bean_tips`의 게시물별 고유 `sender_id` 수다. 프로필 후원(post_id 없음)은 제외하고 동일 회원의 반복 후원·멱등 재시도는 한 명으로 집계한다. 후원자 ID/개인정보는 공개 게시물 응답에 포함하지 않는다. 게시물 후원 성공 응답도 이 수치를 반환하며 공통 BeanModel에서 카드/상세/갤러리에 공유한다. 기존 권한·게시물 소유자 검사·콩 원장은 유지한다.

프론트는 동전 아이콘+인원수, 게시물 제목이 있는 전용 입력/확인/완료 화면을 사용한다. 후원 유입 충전 완료는 해당 게시물 후원으로 복귀한다. 배포 시 API/프론트와 `20261026090000_post_supporters` 복합 인덱스 마이그레이션을 함께 적용해야 한다. 현재 로컬 검증 상태이며 운영 미배포.

### 프로필 관계 목록 (2026-10-26)

프로필 숫자는 `/service/followers?profile={id}` 또는 `/service/following?profile={id}`로 이동하며 공개 API `/profiles/:id/connections`를 조회한다. 본인 숫자는 기존 내 목록으로 이동한다. `/preview`는 동일 목록 UI와 목업 공급자를 사용한다. 시온만 두 목록 비공개이며 서버 데이터의 시온 계정을 변경하지 않는다. API는 공개설정·소유자 확인 후 20명 단위로 제공한다. 2026-10-26 social-tips-20261026 릴리스로 운영 배포했다.

설정→개인정보 관리의 팔로워 공개·팔로잉 공개는 독립 스위치다. showFollowers/showFollowing 저장 후 실제 모델을 갱신하며 목업도 같은 화면·저장 동작을 사용한다. 비공개 표시는 숫자·링크 대신 자물쇠다.

## 공개 명함 QR 진입 (2026-10-27)

- 2026-10-29 차콜09(Apple SD Gothic Neo) 앞·뒷면으로 변경. 공개 연락처는 khpark@crefans.com. 명함 이미지 URL에 버전 쿼리를 붙여 이전 분홍색 이미지 캐시와 구분하며 화면 배경·재생 제어도 차콜로 통일한다. 기존 타이머/중지/재생/다시보기/공개 who 검증은 유지한다. 별도 인쇄 QR 뒷면은 동일 `https://business.crefans.com/card?who=khpark`를 담는다. 배포 증거는 `docs/audit/card-charcoal-20261029.json`.

- `https://business.crefans.com/card?who=khpark`: 로그인 없이 명함을 보여주는 독립 페이지. 소스는 `app/card/page.tsx`, `components/business-card/`이며 서비스/목업 회원 모델과 구형 인증 Provider를 사용하지 않는다.
- 상단 ‘안녕하세요, 만나서 반갑습니다.’는 AOS 형식의 fade-up CSS 연출이다. 시간대 인사와 하단 연락처·안내·입장 링크·계속 보기 UI는 제거했다. 별도 애니메이션 패키지는 추가하지 않는다.
- 양면 이미지 로드 후 3D 등장0.8초, 뒷면1초, 앞면 전환0.7초를 거친다. 앞면의 진행 막대5초 완료 후 고정 주소 `https://crefans.com/service/landing`으로 replace한다. 양면 캐시 완료를 감지하고 이미지 실패 시 자동 이동을 중지한다.
- 진행 막대 오른쪽에44px 아이콘 버튼 중지/재생/다시보기를 표시한다. requestAnimationFrame과 단일 누적 시간축으로 회전·진행·자동 입장을 관리한다. 중지는 현재 위치를 보존, 재생은 이어서, 다시보기는 인사/명함/진행을 처음부터 재시작한다. 중복 프레임은 정리하며 동작 줄이기는 이동 연출을 생략한다.
- 잘못되거나 누락·중복된 who는 middleware404다. 사업 도메인은 server `infra/platform/Caddyfile`에서 명함·관련 이미지·Next 정적 파일만 제공하고 나머지 경로는404다. 기존 beta 금융/가입 정책은 바꾸지 않는다.
- 최초 배포 증거 `.local/business-card-20261027/`, 3D 배포 `.local/business-card-animation-20261027/`, 프로필 동기화 `.local/profile-card-sync-20261027/`, 현재 재생 제어 `.local/card-controls-20261027/`와 PROGRESS를 따른다. 타이머/중지/재생/다시보기/404 단위 검사 및 모바일·PC 브라우저와 HTTPS를 검증한다. 실제 인쇄물의 휴대폰 QR 스캔은 별도다.
- PC·모바일 내 프로필은 공용 커버의 내 지갑 버튼 하나를 사용하며 설정 서비스 안내도 동일하게 표시한다. 반응형 여백/하단 메뉴/댓글 입력 같은 의도된 배치 차이는 유지한다.

- 2026-10-27 미노출 복구: 로딩/첫 프레임 대기가1.2초 넘으면 CSS만으로 받은 앞면을 정적으로 표시한다. JS 비활성·스크립트 차단 시에도 앞면 표시가 가능하며 정상 연출 준비 후에는 기존 순서를 따른다. 이미지 자체가 아직 내려오지 않았거나 실패했다면 표시 가능하다고 보장하지 않는다.
- 가시성 변경 때 기준시각을 재설정하고 hidden 구간은 진행시키지 않는다. 프레임 간격은100ms까지만 반영해 긴 정지 이후 곧바로7500ms 완료로 처리하지 않는다. 저성능 기기에서는 실제 연출이 더 길어질 수 있다.
- 근거 확인2026-10-27: [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), [이미지 complete](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/complete). 정상 이미지 여부는 기존 naturalWidth 확인을 유지한다. 당사자 기기의 실제 원인 확정과 재현 가능한 코드 결함을 구분한다. 증거 `.local/card-visible-20261027/`, PROGRESS의 ‘명함 미노출 조사·복구’ 참조.

- 초기 서버 HTML에는 영구적인 inline 숨김을 넣지 않는다. 정상 스타일/스크립트에서는 기존 등장 연출을 유지하고, 스타일이 차단된 경우에도 앞면 HTML 자체를 숨기지 않는다. 무스타일 전체 외관을 인증한 것은 아니다. 최종 검증은 `docs/audit/card-visible-20261027.json`에 기록한다.

- 2026-10-27 서비스 소개 초기 HTML: `app/service/landing/page.tsx`의 `dynamic=force-dynamic`으로 공통 query Provider가 브라우저 스크립트를 기다리며 소개 전체를 준비 문구로 대체하지 않도록 한다. 현재 에셋 모드의 소개 본문은 JS 비활성·차단에서도 제공하며 상호작용은 JS가 필요하다. 실제 신고된 명함 주소의 정확한 원인은 미확정이며 별개로 재현된 이동 대상 문제를 보완했다. 근거 [Next14 useSearchParams](https://nextjs.org/docs/14/app/api-reference/functions/use-search-params), 검증 `docs/audit/landing-ready-20261027.json`.

### 2026-10-30 보낸 후원 구분 필터 (운영 반영: bean-tip-filter-20261030)

보낸 후원의 기간 칩 아래 공용 `SelectField`에 전체 후원·게시물 후원·프로필 후원을 제공한다. `BeanHistoryFilters.sourceType`과 `BeanHistoryQuery.sourceType`으로 연결하며 전체는 쿼리 생략, 게시물은 `post`, 프로필은 `profile`을 `/beans/tips`에만 전송한다. 기존 검색·기간과 AND 조건이고 조건 변경/초기화 시1페이지로 복귀한다. 목업도 전체 자료에서 필터한 다음 페이지를 나누며 총수·빈 결과에 반영한다. 서버는 본인 범위에서 `post_id IS NOT NULL`/`IS NULL`을 기준으로 조회/건수 조건을 함께 적용한다. 게시물이 삭제·비공개여도 후원 구분은 바뀌지 않는다. 가격·잔액·후원/출금 실행과 DB schema 변경 없음.

운영 배포 및 검증 증거는 프론트 `.local/bean-tip-filter-deploy-20261030/verification.json`과 양쪽 `PROGRESS.md`의 같은 릴리스 항목에 기록한다. 운영 브라우저 확인은 목업 자료와 비로그인 접근 제한이며, 본인 범위의 실제 API 필터는 격리 DB/E2E로 검증했다.

### 운영 활동 분야 아이콘·순서 (2026-10-31)

bootstrap.data.categories의 서버 정렬 순서를 홈·탐색에 그대로 사용한다(‘전체’는 맨 앞). optional categoryIcons 사전을 CategoryChip/ProfileHeader에 props로 전달하여 업로드 이미지도 같은 표시 컴포넌트로 노출한다. 목업은 기존 기본 이미지 매핑을 유지한다. 업로드 URL은 /api/v1/categories/:id/icon/:version으로 직접 조회하며 URL 버전이 변경되면 새 이미지를 받는다. 상세 관리·권한·파일 검증 계약은 서버 platform-api.md의 활동 분야 절을 따른다.

### 탐색 신규 크리에이터 (2026-10-31)

`GET /creators` 첫 응답의 `newCreators`를 주목할 크리에이터 아래, 전체 목록 위에 표시한다. 서버가 크리에이터 등록일 내림차순으로 최신 6명을 선정하며 광고 여부와 무관하다. 특정 기간 내 등록자라는 별도 기간 정책은 없다. 동일 검색어·카테고리와 검색 공개/활성 조건을 적용하며 후속 페이지의 빈 newCreators 배열로 첫 페이지 신규 목록을 지우지 않는다. `useDirectoryModel`의 요청 세대 검사로 이전 검색 응답이 새 검색을 덮지 않는다. 목업은 `ServiceData.newCreatorIds`로 지우·모카·시온을 예시 주입한다. 실제 서비스는 이를 대체 데이터로 사용하지 않는다. 공통 `CreatorCard`의 프로필·팔로우 동작과 `/brand/new-creators-sprout-v1.png` 이미지젠 아이콘(22px)을 사용한다.

### 프로필 핸들 중복 확인 (2026-10-31)

설정의 프로필 수정에서 `GET /me/handle-availability?handle=...`를 호출한다. 회원 인증이 필요하고 반환값은 핸들·사용 가능 여부뿐이며 본인 소유는 제외한다. 변경된 핸들만 중복 확인 성공 후 저장하며, 재입력·닫기·다시 열기는 이전 확인을 무효화한다. 늦은 응답은 요청 세대로 무시한다. 기존 형식의 핸들을 그대로 둔 이름·소개 수정은 핸들 값을 보내지 않아 막히지 않는다. 목업은 fixture의 크리에이터 핸들로 같은 UI를 검증하고 실서비스에 샘플을 섞지 않는다. 스튜디오 링크는 목업/서비스 각각의 `/studio`로 이동한다. 확인은 예약이 아니며 서버 저장·DB 고유 제약이 최종 중복을 거부한다.

### 프로모션 100콩 이벤트 즉시 수령 (2026-11-03, 미배포)
`useBeansModel`의 getPromotionClaim/claimPromotion을 `usePromotionClaim`에 주입한다. GET `/events/promotion-beans`와 POST `/events/promotion-beans/claim`는 세션 본인만 대상으로 하며 body는 `{}`다. 응답은 `{status,quantity:100,claimedAt}`로 available/claimed/ineligible/unavailable을 구분한다. status 조회만으로 지급되지 않는다. 성공한 claimed 이후 지갑·내역을 다시 조회하고, 통신 오류는 재시도 가능하게 둔다. 서버 고정 키로 응답 유실 후 재요청도1회만 지급한다. 401은 로그인 복귀 링크, 로딩/오류 중에는 받기 불가. 프리뷰는 API를 호출하지 않는다.
서버의 PROMOTION_EVENT_MEMBER_IDS에 운영자가 확정한 팬 계정 ID를 최대13개 지정해야 한다. 빈 값·잘못된 값·BEAN_LEDGER_ENABLED=false는 신규 지급을 막는다. 회원가입만으로 대상이 되지 않으며 브라우저에서 대상/수량을 전달할 수 없다. 현재 작업에서는 운영 명단/설정/지급을 변경하지 않았다.

### 원년멤버 배지 수령·표시 (2026-11-03, 미배포)
`useServiceModel.foundingBadge`가 GET `/events/founding-badge`, POST `/events/founding-badge/claim`(빈body), PUT `/me/founding-badge`({visible})를 연결한다. `useFoundingBadge`는 회원 세션별 수명/동시요청/늦은 응답을 방어하고 반환 상태로만 완료·표시 여부를 갱신한다. 성공하면 본인 viewer·creator flag를 갱신하고 페이지 진입 시 bootstrap/publicProfile로 서버 저장값을 재조회한다. `FoundingBadgeEventDetail`은 /service와 /preview 공용이며 목업은 useMockFoundingBadge만 사용한다.
기존 참여 확정 크리에이터3명·팬13명 정책,1인1회. 서버의 FOUNDING_BADGE_MEMBER_IDS 미설정 시 신규 수령은 중지다. 회원가입만으로 지급하지 않고 운영 실제 대상 명단·배포는 아직 남아 있다. 실제 MySQL8건, 프론트523건/레이어/TS, PC·모바일WebKit·320px목업3흐름 증거는 [검증 기록](./audit/founding-badge-claim-20261103.json). 브라우저 실서비스API는 명시한 대역이며 실제 운영 지급/실물iPhone 검증과 구분한다.
