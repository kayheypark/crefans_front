# 목업 유지와 실제 서비스 바인딩

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
