# 디자인 시스템 카탈로그

경로: `/design-system` · 로컬 개발 미리보기: `http://127.0.0.1:3010/design-system`

현재 진입점은 `CustomDesignSystem`이다. 기본 요소는 `components/ui/`, 서비스 패턴은 `components/crefans/`의 공통 컴포넌트를 직접 사용한다. 아래 **현재 사용 안내**가 신규 UI의 기준이며, 초기 카탈로그와 V1·랜딩 개편 설명은 기존 작업의 기록으로 보존한다.

## 현재 사용 안내

- 2026-11-13 공용 댓글/답글은 ISO 날짜를 방금/n분/n시간/n일 전으로 표시하고 원래 KST 날짜를 `time`의 title에 보존한다. 신고는 오른쪽 위 44px 더보기 버튼 안에서 열며 기존 신고 모달·권한을 유지한다. [W3C 메뉴 버튼](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) 기준 aria-haspopup/expanded, 열림 시 항목 포커스, Escape 복귀와 바깥 클릭/포커스 이탈 닫기를 적용했다(2026-11-13 확인).

- 2026-11-13 AI 사진 편집의 8분류 그림은 [AiPhotoCategoryIcon](../components/crefans/studio/AiPhotoCategoryIcon.tsx)에서 `public/brand/ai-photo/*-colorful-flat-v3.png`를 사용한다. 검색 카테고리와 같은 둥근 플랫 스타일의 다양한 색상이며 공용 모달의 실제/미리보기 모두 사용한다. 텍스트 라벨이 이름을 제공하고 그림 alt는 비운다.

### 크리에이터 전환 가드 (2026-11-07)

- 공용 [GuardPage](../components/crefans/GuardPage.tsx)는 가입 완료 화면과 같은 가운데 정렬 안내 페이지다(88px 파란 원형 체크, 제목 초기 포커스, 설명, 48px 주 버튼, 선택 보조 버튼). 이미지·문구·링크는 props로 주입하고 `image`가 없으면 체크를 표시한다. [SignupCompletePage](../components/crefans/SignupCompletePage.tsx)도 같은 컴포넌트를 사용하며 동작(같은 탭 가입 후에만 표시)은 그대로다. 스타일은 기존 `signup-complete.module.css`를 공유한다(멤버십 가입 완료의 체크도 이 파일 사용).
- `CreatorGuardPage`: 크리에이터 미전환(`overview.started=false`) 회원이 `/service/studio/*`(start 제외)에 들어오면 시작하기 화면으로 바로 보내지 않고 팬 셸 안에 이 가드를 보여 준다. 주 버튼 크리에이터 시작하기(`/studio/start`), 보조 버튼 팬 화면으로. 비로그인 안내·크리에이터 스튜디오는 기존대로다. 그림 교체 지점은 같은 파일의 `creatorGuardImage` 상수(사용자 채택 연필 PNG, 88×88px·투명 배경). 가입 완료 화면은 기존 체크를 유지한다.
- 확인: `/preview/studio/guard`, 상태·피드백 카탈로그의 **크리에이터 전환 안내 보기**. [단위 검사](../tests/creator-guard.test.cjs), [브라우저 검사](../e2e/creator-guard.spec.ts)(API 대역·목업, PC/Pixel 7).
### 빈 상태 그림 (2026-11-07, 미배포)

- 데이터가 없는 목록·표·이력·소개는 공용 [Empty](../components/crefans/ServiceUI.tsx)(카탈로그는 [EmptyState](../components/ui/Primitives.tsx), 빈 [DataTable](../components/ui/DataTable.tsx) 포함)를 사용한다. 세 컴포넌트 모두 운영 콘솔 `EmptyState`의 회색 접힌 문서 그림을 복사한 [에셋](../public/brand/empty/empty-page-v1.svg)(36×44, 출처·해시 `empty-page-v1.source.json`)을 [EmptyIllustration](../components/ui/EmptyIllustration.tsx)으로 문구 위에 표시한다. 장식 그림이라 `alt=""`·`aria-hidden`이고 콘솔 저장소를 런타임에 참조하지 않는다. 문구·설명·동작 props는 그대로다.
- 그림은 "데이터 없음"만 뜻한다. 같은 레이아웃을 쓰는 조회 오류(`ApiState`)·찾을 수 없음·이용 불가·비공개·사전 조건 안내는 `illustration={false}`로 그림을 생략하며, 로딩 중에는 빈 상태를 표시하지 않는 기존 규칙을 유지한다. 선택창 검색 결과 없음과 입력 필드 도움말은 화면 단위 빈 상태가 아니어서 제외한다.
- 서비스 UI 카탈로그 [ServicePatternCatalog](../components/design-system/ServicePatternCatalog.tsx)에 설명·동작 포함/제목만/그림 없는 안내 상태를 등록했다. 단위 검사: [tests/empty-state-asset.test.cjs](../tests/empty-state-asset.test.cjs).

### 모바일 스튜디오 게시물 통합 카드 (2026-11-07)

- [ContentManagementPage](../components/crefans/studio/ManagementPages.tsx)는 767px 이하에서 통합 카드, PC에서는 기존 표를 사용한다. 같은 서비스·목업 모델과 미리보기·수정·삭제 동선을 재사용한다. [카드 스타일](../components/crefans/studio/content-list.module.css)은 흰 배경·가는 테두리, 밑줄 활성 탭, 썸네일·상태·공개 범위·일시·하단 세 관리 동작을 한 카드에 묶는다.
- 현재 페이지 첫 카드를 펼쳐 표시하고 제목 클릭·Enter/Space로 접는다. 검색·상태·정렬·페이지가 바뀌면 새 목록의 첫 카드가 펼쳐진다. 하단 관리 영역의 가로선은 카드 좌우 테두리에, 세로선은 가로선부터 하단 테두리까지 이어진다. 삭제는 공통 TypedConfirmDialog에서 현재 게시물 제목을 띄어쓰기까지 정확히 입력해야 실행된다. 취소 후 재진입은 입력을 초기화하고 처리 중에는 중복 제출·닫기를 막으며 실패하면 입력과 목록을 유지한다. 영상 처리·운영 숨김·댓글 닫힘 상태를 생략하지 않는다. 일시는 한국 시간이며 예약 글은 게시 예정 시각을 표시한다.
- 공통 [DataTable](../components/ui/DataTable.tsx)의 안정 정렬 함수를 카드도 사용한다. 기본순은 서버 주입 순서이며, 정렬 후 페이지를 나눈다. 모바일 선택창은 기존 SelectField를 사용한다. PC 정렬 순환·페이지 규칙은 변경하지 않는다.
- [카탈로그](../components/design-system/StudioContentCatalog.tsx)에 일반·빈 목록·긴 제목·영상 처리·삭제 실패/처리 중 상태를 등록한다. [브라우저 검사](../e2e/studio-content-cards.spec.ts)는 PC·iPhone WebKit·320px, 목업 및 서비스 API 대역이다. 실제 회원 게시물을 변경하거나 실물 iPhone을 검사한 것으로 해석하지 않는다.

### 콘텐츠 성과 상세 펼침 (2026-11-06)

- 공용 [ContentPerformance](../components/crefans/studio/ContentPerformance.tsx)를 실제 스튜디오·목업 통계 요약에서 사용한다. 첫 게시물은 펼치고 나머지는 접으며, 제목·썸네일·조회는 항상 표시한다. 조회는 주입된 값 그대로 표시하고 피드·상세를 합산하지 않는다.
- 펼친 통계는 피드 노출·상세 조회·30분 방문수 / 공유·외부 유입·영상 재생의 3열×2행으로 표시한다. [스타일](../components/crefans/studio/content-performance.module.css)의 1px grid gap이 가로·세로 연결선을 만들고 마지막 빈 칸도 같은 배경을 사용한다. 유입 경로·좋아요·댓글은 상세에서 보존하며, 통계 미제공은 0으로 바꾸지 않는다. 1만 이상은 기존 조회수 표시처럼 만·억 단위로 줄이고 title·접근성 이름에 정확한 숫자를 유지한다.
- 집계 기준은 기존 InfoTooltip으로 표시한다. 항목 제목의 네이티브 버튼을 클릭하거나 Enter/Space로 펼치고 접으며 aria-expanded/aria-controls를 유지한다. 항목 하단의 별도 접기 버튼은 표시하지 않는다(2026-11-07). 근거: [WAI-ARIA Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), 확인일 2026-11-06. [카탈로그](../components/design-system/ContentPerformanceCatalog.tsx)는 일반·빈 목록·미집계·0·긴 제목/큰 수치를 제공한다. [브라우저 검사](../e2e/content-performance.spec.ts)는 PC·iPhone WebKit·320px 목업/API 대역이며 실물 기기·실회원 검증과 구분한다.

| 카탈로그 메뉴 | 확인할 내용 | 등록 위치 |
| --- | --- | --- |
| 미리보기 | 공통 로고·브랜드 색상, 실제 크리에이터·멤버십 카드 | `CustomDesignSystem.tsx` |
| 디자인 토큰 | 색상·타이포그래피·간격·모션 검색과 JSON 다운로드 | `CustomDesignSystem.tsx`, `lib/design/tokens.ts` |
| 입력·선택 | 아바타·버튼, 입력 형식, 도움말·오류·비활성·읽기 전용, 단일·다중 선택 | `FormControlsCatalog.tsx`, `CustomDesignSystem.tsx` |
| 표·페이지 | 3단계 정렬, 페이지 크기 변경, 일반·로딩·빈 표, 여러 페이지·한 페이지·데이터 없음 | `DataDisplayCatalog.tsx` |
| 서비스 UI | 실제 서비스 카드·피드·스튜디오 지표·정산·API 상태, 화면별 목업 미리보기 | `ServicePatternCatalog.tsx` |
| 상태·피드백 | 모달·바텀시트·토스트·로딩·오류·빈 상태 | `CustomDesignSystem.tsx` |

새 UI는 공통 컴포넌트로 구현하고, 정상·빈 값/목록·오류·disabled·readOnly·loading 중 해당하는 상태를 카탈로그에 등록한 다음 같은 컴포넌트를 목업에서 재사용한다. 지원하지 않는 상태를 샘플 처리 결과로 꾸미지 않는다. 목업·카탈로그마다 같은 UI를 별도 JSX와 CSS로 복제하지 않는다.

### 멤버십 결제 (2026-11-05)

- 공용 [MembershipCheckout](../components/crefans/MembershipCheckout.tsx)는 주문 스냅샷·카드 상태·동의·콜백을 주입받는다. 상품과 결제수단을 연한 구분선으로 나누며 모바일 CTA는 전체 너비로 두 줄, PC는 두 열이다. 긴 상품명·금액은 320px에서도 넘치지 않도록 배치한다.
- [PaymentTerms](../components/crefans/PaymentTerms.tsx)의 선택적 `list` 표시를 이용해 결제 주기·해지·환불의 요약 아래에 기존 상세 원문을 펼친다. 콩 충전 등 기존 호출부는 기본 카드 표시를 유지한다. 동의는 기본 미선택이며 카드가 없거나 갱신이 필요하면 정기결제를 활성화하지 않는다.
- [카탈로그](../components/design-system/MembershipCheckoutCatalog.tsx)는 일반·카드 없음/갱신 필요·처리 중·결과 조회·오류·주문 조회·긴 상품명을 제공한다. `/preview/checkout`은 같은 뷰의 로컬 목업이다. [브라우저 검사](../e2e/membership-checkout-layout.spec.ts)는 로컬 API 대역으로 수행하며 실결제를 검증하지 않는다.

### PC 팬 계정 메뉴·인증 확인 (2026-11-02)

- PC 헤더 아바타의 공용 [HeaderAccountMenu](../components/crefans/HeaderAccountMenu.tsx)에 내 프로필·설정·로그아웃을 배치한다. 링크/버튼을 사용하는 disclosure로 구현하며 펼침 표시·aria-expanded·Escape 복귀·외부 클릭·포커스 이탈 닫기를 지원한다. 모바일은 기존 내 프로필 진입을 유지한다.
- 로그인 상태 조회 중에는 비로그인 버튼을 렌더링하지 않는다. [ServiceRouter](../components/service/ServiceRouter.tsx)의 loading을 전달하고 기존 useDelayedLoading 기반 DelayedInlineSpinner를 사용해 1초가 넘을 때만 스피너가 나타난다. 조회 전 상태를 비로그인으로 단정하지 않는다.
- 로그아웃은 주입된 accountActions.logout 성공 후 갱신하며 실패는 공통 모달로 안내한다. pending 재입력을 막고 실패를 성공으로 바꾸지 않는다. 카탈로그는 정상·사진 없음·처리 중·실패 상태를 제공한다. 검증: [헤더 상태 단위 검사](../tests/header-auth-loading.test.cjs), [브라우저 시나리오](../e2e/header-account-menu.spec.ts).
- 공식 참고(2026-11-02): https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ — 네이티브 링크/버튼을 유지하는 펼침 패턴을 채택했으며 ARIA menu 역할은 사용하지 않는다.

### 스튜디오 빠른 작업 대시보드 (2026-11-02)

- 공용 [DashboardPage](../components/crefans/studio/DashboardPage.tsx)는 대시보드 제목·아바타 인사, 게시물 작성, 빠른 작업, 임시저장, 주요 지표, 최근 활동·게시물 성과 순서로 표시한다. PC는 작업/지표와 활동/성과를 각각 두 열로 배치하고 모바일은 한 열로 배치한다.
- 확정된 빠른 작업은 게시물·댓글 / 광고 상품·출금 신청 / 콩 후원·출금·크리에이터 설정의 2열 3행이다. `withdraw`는 멤버십 수익 출금 신청, `beans`는 콩 후원·출금의 기존 경로를 유지한다. 두 수익을 합산하거나 출금 정책을 변경하지 않는다. 임시저장은 `content?status=draft`로 이동한다.
- 데이터는 모델에서 주입하고 빈 활동/게시물을 예시로 채우지 않는다. 순수익·구독자·팔로워의 값/단위와 각 리포트 경로, 목적지가 없는 활동의 비링크 표시를 유지한다. [카탈로그](../components/design-system/StudioDashboardExample.tsx)는 일반·첫 이용/빈 목록·긴 활동명 상태를 제공한다. [검사](../e2e/studio-dashboard.spec.ts)는 목업 이동과 서비스 API 대역을 구분하며 실금융·운영 로그인 검증을 대신하지 않는다.

### 모바일 당겨서 새로고침 (2026-11-02)

- 내부 스크롤 영역 맨 위에서 한 손가락으로96px 이상 아래로 당긴 뒤 놓으면 현재 URL을 다시 불러온다. [PullToRefresh](../components/crefans/PullToRefresh.tsx)를 공용 ServiceShell에서 사용하며, 작은 상태 안내는 기존 색상·아이콘·LoadingSpinner를 재사용한다. 모바일 coarse pointer에만 적용한다. 홈·탐색·프로필 외 지갑/이력/친구 초대, 메시지 목록, 알림, 구독/결제 내역, 팔로우 목록, 게시물, 설정 목록, 결제수단 목록, FAQ·공지·이벤트·정책·안내 조회에 적용한다. 경로 정책은 isPullRefreshPage에서 관리한다.
- 짧은 당김·가로/위쪽 이동·다중 터치·취소·중간 스크롤·중첩 스크롤 영역·모달·입력 포커스·작성 중 댓글 초안은 새로고침하지 않는다. 메시지 목록만 data-pull-refresh-scroll로 내부 최상단 경계를 공유한다. 대화방·다른 대화의 보관 초안·전송 중에는 data-pull-refresh-block으로 중단한다. 문의 작성, 인증·멤버십 구매·충전·출금·공급사 결과 처리는 제외한다. 지갑 이력·결제수단·구독·설정의 변경 요청 중에도 중단한다.
- PC·GNB/댓글 입력바 배치는 유지한다. 스튜디오·랜딩은 원래 문서 스크롤이므로 중복 제스처를 추가하지 않는다. [전체 경로 조사](./audit/mobile-refresh-route-audit-20261102.json), [조회 화면/보호 조건 검사](../e2e/pull-refresh-pages.spec.ts), [기존 회귀 검사](../e2e/pull-to-refresh.spec.ts)는 합성 TouchEvent, Chromium CDP 터치, WebKit 에뮬레이션을 구분하며 실물 아이폰 Chrome 검증을 대신하지 않는다.
- 근거 확인2026-11-01: [Chrome overscroll 안내](https://developer.chrome.com/blog/overscroll-behavior), [W3C Touch Events Level2](https://www.w3.org/community/reports/touchevents/CG-FINAL-touch-events-20240704/). 내부 스크롤·overscroll 차단을 유지해 GNB 회귀를 피하고, 대상 스크롤러에 한정한 non-passive touchmove를 유효한 아래 당김에서만 취소하는 적용 판단이다. 브라우저 자체 새로고침 UI를 복원하는 방식은 아니다.

### 친구 초대 이벤트·레퍼럴 (2026-11-01)

- `ReferralCard`는 실제·목업 지갑의 공통 초대 카드다. 기존 콩 이미지, 연한 초록 보상 영역, 링크 입력/복사 버튼, 세 가지 참여 지표, 보상 안내 순서로 구성한다. 금액·대기일·월 상한·집계는 주입된 응답을 사용하며 원래 보상 조건을 바꾸지 않는다.
- 복사 성공은 `SnackbarProvider`/`Toast`로 하단에 4초간 표시한다. 본문 높이는 바뀌지 않고 모바일 GNB 위에 나타난다. 실패는 링크 옆에 남겨 직접 복사할 수 있게 한다. 서비스 UI 카탈로그의 친구 초대 이벤트 예시는 참여 있음/없음을 제공한다.

### 회원가입 완료 (2026-10-31)

2026-10-31 사용자 지시로 완료 모달을 전용 페이지 `/service/signup/complete`(`components/crefans/SignupCompletePage.tsx`)로 바꿨다. 88px 파란 원형 체크, 제목(초기 포커스)·환영 문구·"로그인하러 가기"를 가운데 정렬하고, 로그인 화면은 방금 가입한 이메일을 미리 채운다(같은 탭의 sessionStorage, 주소에는 넣지 않음). 실서비스에서는 이 탭에서 가입에 성공한 뒤에만 보이고 주소로 바로 열면 가입 화면으로 돌아간다. 미리보기(`/preview/signup/complete`)와 상태·피드백 카탈로그 버튼은 항상 보여 준다.

### 이벤트 안내 (2026-10-26)

2026-11-03 이벤트 배너·직접 받기 UI 운영 반영. 명단 미설정으로 실제 수령은 중지 상태다. [배포 검증](./audit/events-deployment-20261103.json).

- 2026-11-03 즉시 받기: PromotionClaim 공용 UI에 확인 중·수령 가능·지급 중·완료·비대상·중지·로그인·오류 상태를 주입한다. 48px 받기 버튼은 처리 중 중복 클릭을 막고 완료 뒤 지갑 링크로 전환한다. 오류는 버튼 아래, 로그인은 원래 이벤트로 복귀한다. 서버 지급 성공 후 지갑을 갱신하며 목업은 별도의 로컬 지갑을 갱신한다. 카탈로그의 받기 상태 선택으로 동일 UI를 확인한다.

- `EventPages.tsx`의 공통 목록·상세를 서비스 UI 카탈로그에서 4종 정상 상세/목록·빈 목록·없는 이벤트 상태로 확인한다. `/preview`와 `/service`는 `lib/content/events.ts`의 동일한 공개 편집 콘텐츠를 주입한다.
- 상세는 통이미지 대신 HTML 제목·혜택·보조문구와 개별 에셋을 조합한다. 네이버페이 상품권은 공식 화면에서 크롭한 `naverpay-10000-cropped-v2.png`, 나머지 혜택은 `public/brand/events/open-beta-v2/`의 투명 WebP를 사용한다. 파스텔 카드에 좌측 이미지, 우측 정렬 남색(#080d3b) 제목을 배치하며 이미지·글 사이와 카드 안쪽에 최소18px 여백을 둔다. 제목은 Pretendard Black(900), clamp(17px,5.8cqw,44px) 한 규칙으로 통일한다. 보조문구는 Pretendard Regular(400), clamp(11px,2cqw,16px), #626b8b로 각 혜택 우측하단에 둔다. 목록은 네이버페이 상품권→광고상품 기간2배→프로모션100콩→오픈 기념 배지 순서로 이미지·HTML 제목·대상 안내를 조합한 배너4개를 표시하며 각각 해당 상세로 이동한다. 상세마다 한 혜택과 공통·전용 유의사항을 표시한다. 공통 원문2개 그룹을 재사용해 누락·내용 차이를 방지하며, 순번 대신 theme을 주입해 목록과 단독 상세에서도 광고상품의 연보라색·콩의 민트색·배지의 라벤더색을 유지한다. 링크의 접근성 이름에 이벤트 제목을 제공하고 이미지는 장식으로 처리한다. 상품권을 메인으로 강조하되 “유용한 피드백 제공자 최대3명” 조건은 유지한다. [Pretendard 공식 배포본](https://github.com/orioncactus/pretendard) v1.3.9 서브셋2종을 public/fonts/pretendard에서 자체 제공하며, 원본 LICENSE와 source.json을 보관한다(확인2026-10-26). 이벤트 영역만 적용해 다른 화면의 글꼴은 유지한다.
- 2026-11-03 목록의 광고상품·100콩·오픈 기념 3종은 좌측 HTML 제목/우측 은은한3D 이미지로 구성한다. 제목은 clamp(23px,6.6cqw,46px)로 통일하고 별표로 시작하는 대상 안내는 우측하단 clamp(11px,2.2cqw,15px)로 표시한다. 네이버페이 목록/상세는 기존 디자인 그대로다. 신규640px 투명 WebP3개는 총97,650B이며 상세 혜택에도 재사용한다. [생성 프롬프트](./audit/event-banners-prompts-20261103.json), [로컬 검증](./audit/event-banners-20261103.json).
- 피드백 이벤트는 혜택 아래 여백과 구분선으로 접수 안내를 구분하고 공용 ActionLink를 사용한다. 공개 콘텐츠의 submission으로 이메일·제목·본문 양식을 주입하며 모바일/PC와 service/preview에서 같은 구성이다. 클릭은 메일 작성만 열고 발송/접수 성공을 표시하지 않는다.
- 최신 혜택 표시 순서는 유용한 피드백최대3명 네이버페이1만원 상품권, 별도 주목할 크리에이터 기간2배 상품, 전체회원1회 프로모션100콩(수령부터30일), 전체회원1회 오픈 기념 한정판 배지다. 지급·선정·노출 실행 기능을 추가한 것은 아니며 일정은 별도 안내한다.
- 2026-10-26 유의사항 보완: 참여 확정 테스터(크리에이터3명/팬13명)·혜택별1인1회, 피드백의 구체성·재현 가능성·개선 기여도 기준을 사용자 승인으로 명시. 7개 소제목과14px 본문으로 구분하며 콩 카드에는 직접 출금 불가·최소1,000콩·수수료20%·베타 실제 은행출금 미제공을14px 별도 안내한다. 장식 보조문구보다 중요한 제한을 더 읽기 쉽게 표시한다. 기간/완료 기준/지급일·광고 실행 일정·상품권 발급조건은 미정이며, 배지 지급·표시 설정은 제공 예정으로 구분한다. 근거·로컬검증은 [이벤트 유의사항 검토](./audit/event-terms-20261026.json), 운영 반영은 [event-terms-20261026 배포 검증](./audit/event-terms-deployment-20261026.json)을 따른다.

### 오픈 기념 배지 (2026-10-29)

- `CreatorName`은 `isFoundingMember===true`일 때 기존 이벤트 보라색 별 배지를 이름 오른쪽에 표시한다. 파란 인증 배지와 독립적이며 인증 권한을 부여하지 않는다. 공용 이름 컴포넌트를 사용하므로 프로필·게시물·댓글·답글에 같은 표시 규칙이 적용된다. 카탈로그에 기념/인증 동시 표시·팬 표시·미지급·긴 이름 예시를 둔다.
- 목업 데이터에서만 하늘·지우·팬지민을 지정했다. 댓글 예시와 팬의 새 댓글도 동일한 이름·사진·배지를 사용한다. 당시(2026-10-29)는 실제 회원 지급 API·관리자 부여·표시/숨김 설정이 범위 밖이었다. 2026-11-03 직접 받기 구현은 아래 최신 절을 따른다. 개발 검증: [증거](./audit/event-priority-badges-20261029.json). 이벤트 배치·공식 상품권 크롭과 목업 배지의 운영 반영: [event-priority-20261029 배포 검증](./audit/event-priority-deployment-20261029.json).

### 지갑·내역 탐색 (2026-10-26)

- `BeanWalletPages.tsx`의 `BeanWalletOverview`/`BeanHistoryView`를 실제 서비스·목업·카탈로그에서 공유한다. 지갑에는2개 주요 잔액, 한 알 콩 PNG(`soft3d-v2/10.png`)와60px 풀빛 초록·그린·에메랄드·청록 그라데이션 충전 버튼(플러스 아이콘 없음), 한 행 최대2개의 박스 링크를 친구 초대 이벤트 → 충전 내역 → 콩 내역 → 후원 내역 순서로 둔다. 친구 초대 이벤트는 기능을 이용할 수 있을 때만 표시한다.
- `BeanBalanceSummary`의 콩 세부 내역은 기본 펼침이며 접고 펼칠 수 있다. 같은 요약을 쓰는 스튜디오에도 적용된다. action 슬롯으로 잔액 아래에 충전 버튼을 배치했다. 이전 문서의 기본 접힘은 당시 상태 기록이다.
- 내역은 상태 배지·금액/증감·사유/메시지·일시를 정렬된 목록으로 제공한다. 조회 실패/로딩/빈 상태/결제 버튼 비활성을 카탈로그에서 확인한다. 데이터 오류를 빈 목록으로 표시하지 않는다. 버튼은44px 이상, reduced-motion에서 전환 효과를 끈다. 그라데이션은 정적 배경이며 반복 빛줄기 애니메이션은 추가하지 않았다.
- `bean-wallet-ui-20261026` 운영 반영. [운영 검증](./audit/bean-wallet-ui-deployment-20261026.json), [개발 검증](./audit/bean-wallet-pages-20261026.json), [초록 다색 버튼 검증](./audit/bean-charge-green-blend-20261026.json).

### 콩 충전 완료 (2026-10-26)

- `components/crefans/BeanPaymentResultPage.tsx`를 실제 서비스·목업·서비스 UI 카탈로그에서 공유한다. 충전 수량·주문에 저장된 VAT 포함 결제 금액·주문번호와 지갑/탐색 이동을 표시한다. 기존 콩 PNG를 재사용하며 모바일 320/390px·PC1280px에서 가운데 정렬, 이동 버튼 높이48px를 확인했다.
- 카탈로그의 **콩 충전 결과 상태**에서 완료/결과 확인 중/승인 미확정/중단/실패를 선택한다. 완료 데이터가 없으면 영수증을 만들지 않는다. 카탈로그/직접 목업 진입에만 예시를 주입한다. `bean-wallet-ui-20261026`로 운영 반영했다. [개발 검증](./audit/bean-completion-20261026.json), [운영 검증](./audit/bean-wallet-ui-deployment-20261026.json).

### 입력과 여러 줄 입력

- 댓글이 없는 공통 안내는 **댓글이 없습니다**다. 피드·게시물 상세·갤러리의 같은 `CommentsSection`을 사용하고, 767px 이하에서는 안내 문구를 가로 가운데 정렬한다. 댓글 등록 후에는 안내가 사라진다.
- 모바일 댓글은 `components/crefans/CommentComposer.tsx`를 사용한다(2026-10-24). 767px 이하에서 팬 셸은 GNB 바로 위, 게시물 갤러리는 상세 패널 하단에 한 줄 입력과 44px 위 화살표 등록 버튼을 배치한다. 스크롤과 분리된 `CommentDock`에 표시하므로 마지막 댓글까지 내려갈 필요가 없다. 피드에서 여러 댓글 목록을 열면 마지막 선택한 게시물의 입력바 하나만 표시하며 각 목록의 **댓글 쓰기**로 초안을 유지한 채 전환한다. 독립 게시물 상세와 갤러리 오버레이에서는 **댓글 쓰기** 링크를 숨기고 기존 입력창으로 바로 작성한다. 목업과 실제 서비스의 공용 화면에 적용하며,2026-10-25 로컬 반영·운영 배포 대기다. [상세 검증](./audit/post-detail-comment-link-20261025.json), [갤러리 후속 검증](./audit/gallery-comment-link-20261025.json).
- 모바일 피드 입력바 왼쪽의 **댓글 닫기** X는 44×44px 터치 영역·28px SVG이며, 화면 시작 여백4px(안전영역 우선)·입력칸 간격4px로 배치한다. 기존16px/8px보다 입력칸이20px 넓어졌다. 해당 버튼은 해당 카드의 댓글 목록을 접는다. 스크롤 위치에서 사용할 수 있고 닫힌 카드로 강제 이동하지 않는다. 여러 댓글이 열려 있으면 기존 순서에 따라 남은 입력바가 표시된다. 닫힌 카드 초안은 기존 접기와 동일하게 초기화되며 다른 열린 카드 초안은 유지한다. 상세/갤러리에는 이 닫기 버튼을 표시하지 않는다. [닫기 동작 기록](./audit/comment-close-20261024.json), [간격 비교·후속 검증](./audit/close-spacing-20261024.json).
- 모바일 갤러리는 열자마자 입력바를 표시하며 키보드를 자동으로 열지 않는다. 댓글 목록은 펼칠 때 조회하고, 목록 접기/펼치기와 상세 패널 크기 변경 중에도 입력바·초안을 유지한다. 미디어 전체 확대에서는 패널과 함께 숨기고 축소하면 복원한다. 이전/다음 게시물 이동 시 새 게시물의 빈 입력으로 전환하며 댓글이 닫힌 글에서는 입력바를 표시하지 않는다. PC는 목록을 펼쳐야 본문의 여러 줄 입력이 보인다. 후속 검증: [갤러리 댓글 입력 기록](./audit/gallery-comment-dock-20261024.json).
- 빈 값·등록 중은 전송 불가, 한글 조합 중 Enter는 전송하지 않는다. 실패하면 초안과 오류를 유지하고 성공하면 초안을 비운다. 잠긴/댓글 닫힌 게시물은 입력바를 제공하지 않는다. PC는 기존 여러 줄 입력이며 읽기 전용 스튜디오 미리보기는 플로팅 입력을 만들지 않는다. 목업/실서비스가 동일 구현과 주입된 댓글 액션을 사용한다. 서비스 UI 카탈로그의 **모바일 댓글 입력바**에서 일반/오류/등록 중/읽기 전용을 확인한다.
- 키보드가 표시되는 동안 `VisualViewport`의 높이/상단 오프셋으로 보이는 높이를 맞추고 팬 GNB를 잠시 숨긴다. 갤러리 입력은 모달 DOM 안에 유지하며 Tab/Shift+Tab은 보이는 요소 사이를 순환한다. 근거: [MDN VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport), [React createPortal](https://react.dev/reference/react-dom/createPortal), [WAI-ARIA 모달 패턴](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), 확인일 2026-10-24. 검증은 Chromium/WebKit 및 키보드 높이 대역이며 물리 iPhone 키보드 검수는 별도다. 공통 입력바와 갤러리 진입 즉시 표시를 2026-10-24 운영에 반영했다([배포 검증](./audit/gallery-comments-deployment-20261024.json)). [검증 기록](./audit/mobile-comment-composer-20261024.json).

`components/ui/Field.tsx`에서 `Field`, `TextAreaField`를 가져온다. 기존 `components/ui/Primitives.tsx` 경로도 두 컴포넌트를 다시 export한다.

- `Field`: `label`, `error?`, `hint?`와 기존 `InputHTMLAttributes<HTMLInputElement>`를 받는다. `text`, `email`, `tel`, `url`, `password`, `search`, `number` 등 네이티브 입력 형식을 유지한다. `value`, `defaultValue`, `name`, `required`, `disabled`, `readOnly`, `min`, `step` 등의 속성과 `onChange(event)`를 그대로 전달한다.
- `Field`와 `TextAreaField`의 `tooltip?`은 제목 오른쪽에 기존 `InfoTooltip`을 표시한다. 툴팁 버튼은 input label 밖에 두어 입력 이름을 바꾸지 않으며, 읽기 전용·비활성 입력에서도 설명을 확인할 수 있다. 카탈로그의 웹 주소·읽기 전용 입력·여러 줄 입력에서 확인한다.
- `prefix?`, `suffix?`는 아이콘·프로필 주소·금액 단위처럼 입력 앞뒤 내용을 표시한다. `type="search"`에는 검색 아이콘이 기본으로 들어가며 브라우저 기본 지우기 버튼과 중복하지 않는다.
- `Field.action?`은 입력 테두리 밖 오른쪽에 같은 높이의 버튼을 배치한다. 공통 도움말·오류·label 연결을 유지하고 비활성/대기 상태는 호출부에서 전달한다. 프로필 핸들 중복 확인에 사용한다.

- 지우기는 `clearable`과 `onClear`를 함께 전달해야 사용할 수 있다. 값이 있을 때 버튼을 표시하며, 실제 값 변경은 `onClear`의 호출부가 처리한다. `disabled`나 `readOnly`이면 실행하지 않는다.
- `showPasswordToggle`의 기본값은 `false`다. `type="password"`와 함께 켜면 보기/숨기기 버튼을 표시한다. 기존 화면에 별도 보기 버튼이 있으면 중복해서 켜지 않는다.
- `TextAreaField`: `label`, `error?`, `hint?`와 `TextareaHTMLAttributes<HTMLTextAreaElement>`를 받는다. `showCount`로 글자 수를 표시하며, `maxLength`가 있으면 현재 글자 수와 제한을 함께 보여 준다.
- label은 입력 요소와 `htmlFor`로 연결하고, 지우기·보기 버튼을 label 안에 넣지 않는다. 외부 `aria-describedby`는 내부 도움말·글자 수 ID와 함께 유지한다. 입력 오류는 `aria-invalid`와 `role="alert"`로 전달한다.

이 컴포넌트는 값을 자동 포맷하거나 빈 값에 목업 데이터를 채우지 않는다. 검증·저장·서버 오류 해석은 호출부 모델에서 수행한다.

갤러리 닫기는 공용 `MediaOverlay`와 `Icon(close)`를 사용한다. 선택한1번 시안에 따라 아이콘24px·터치 영역44×44px·검정40% 반투명 원형·hover55%이며 내부 패딩은0이다. 모바일 상단/오른쪽12px와 안전영역을 확보한다. 게시물·프로필/배경사진 확대가 공유하며, 상세 패널이 전체 화면인 흰 배경에서는 기존 밝은 버튼/진한 아이콘 대비를 유지한다. 2026-10-25 운영 반영: [배포·검증](./audit/gallery-close-soft-deployment-20261025.json).

### 게시물 공유 레이어

게시물 더보기 메뉴의 **공유**는 `PostShareDialog`를 연다. 즉시 복사하지 않으며 **복사·카카오톡·더보기** 세 항목 중 사용자가 선택한다. 공용 `Dialog`의 PC 모달·모바일 하단 시트와 `ShareDialog`를 피드·프로필 피드·상세·갤러리·저장/좋아요 목록에서 재사용한다. 스튜디오 읽기 전용 미리보기는 기존 더보기 비활성 정책을 유지한다. 카탈로그의 게시물 공유 예시는 실제 외부 전송 없이 같은 표시부에 상태/콜백을 주입한다.

- 복사: 클릭 후 Clipboard API 성공일 때만 완료 문구를 표시한다. 거부/미지원이면 주소 선택 입력칸으로 직접 복사할 수 있다.
- 카카오톡: 공식 SDK를 레이어가 열릴 때 미리 준비하고 버튼 클릭에서 `Kakao.Share.sendDefault`를 호출한다. 미설정/준비 중/실패 상태는 비활성·설명으로 표시한다. 호출만으로 전송 완료를 주장하지 않는다. 아이콘은 카카오 공식 예제 원본이다.
- 더보기: 기기의 `navigator.share`를 클릭에서 직접 호출한다. 취소는 오류를 표시하지 않고 레이어를 유지한다. 미지원/권한 거부는 명확히 안내한다. 세 항목은 최소44px 이상이며 처리 중 중복 호출을 막는다.
- 공유 데이터는 게시물 제목과 해당 `/preview/post/:id` 또는 `/service/post/:id` 주소뿐이다. 현재 화면의 query/hash·세션값·본문·미디어 주소는 전달하지 않는다. 공유 링크의 기존 구독 접근 검사는 유지한다.

구현 근거/설정은 [외부 연결 안내의 카카오톡 공유](./third-party-setup.md), [검증 증거](./audit/post-share-20261025.json). 현재 로컬 구현이며 카카오 앱 미연결·실기기 공유 대상 선택/전송·운영 배포는 미검증이다.

### 게시물 후원 아이콘 (2026-10-29)

공용 `BeanPages.tsx`의 `TipButton`에서 게시물 후원 아이콘을 이미지젠으로 제작한 노란 동전 PNG로 교체했다. 피드·프로필 피드·상세·갤러리와 목업/실서비스가 같은 표시부를 사용한다. 24×24px, 기존 최소44px 클릭 높이와 후원 인원수·접근성 이름을 유지하고 이미지 자체는 장식용으로 처리한다. Next Image 최적화를 사용하며 검증 환경에서 전송 이미지1,881B를 확인했다. 프로필의 큰 후원 버튼과 스튜디오 메뉴의 동전 SVG는 기존 디자인을 유지한다.

[에셋](../public/brand/post-actions/support-coin-flat-v1.png), [생성 도구·전체 프롬프트](./design/post-support-icon-v1.generation.json), [검증 기록](./audit/post-support-icon-20261029.json). 최초 아이콘 교체는 광고상품 배포에 포함되었다. 2026-10-29 누락 보완으로 본인 게시물·스튜디오 읽기 전용 미리보기·BeanContext 없는 카탈로그에서도 같은 동전과 후원 수를 비상호작용 표시한다. 일반 팬의 후원 버튼은 유지하며, 게시물 후원 설정 또는 전체 기능이 꺼지면 표시하지 않는다. 미리보기는 원본 후원 수를 유지한다. 저장·좋아요 목록은 반응 버튼 없는 썸네일 목록이며 상세 진입 후 공용 표시를 사용한다. [누락 보완·운영 배포 검증](./audit/post-coin-deployment-20261029.json).

### 게시물 조회수

`components/crefans/PostViews.tsx`는 공용 `PostActions`에서 좋아요·댓글 뒤, 저장 버튼 앞에 표시한다. 피드·프로필 피드·저장/좋아요 목록·게시물 상세·갤러리·스튜디오 읽기 전용 미리보기에서 같은 표시를 사용한다. 비밀번호 입력창에서도 쓰는 기존 공용 `FieldIcon(show)` SVG(21×21px)와 숫자를 표시하며 버튼은 아니다. 생성했던 눈 PNG와 생성 기록은 공개 에셋에서 삭제했다. 숫자·접근성 이름과6px 간격은 유지한다. 2026-10-25 SVG 교체 운영 반영: [검증 기록](./audit/post-views-icon-20261025.json).

0회는 `0`, 1만 미만은 천 단위 구분, 이후는 `2.5만`·`1.2억`으로 표시한다. 정확한 숫자는 접근성 이름과 title에 유지한다. 미제공·유효하지 않은 값은 임의의0으로 바꾸지 않고 생략한다. 카탈로그 **게시물 조회수**에0/일반/큰 값/미제공을 등록했다. 실제 서비스는 DB 누적값을 표시하며 신규 v1의 조회 증가는 아직 구현되지 않았다. [표시·API·브라우저 검증](./audit/post-views-20261025.json). 2026-10-25 운영 반영 및 PC·모바일12조건 확인: [배포 증거](./audit/post-views-deployment-20261025.json).

### 뒤로가기 버튼

페이지·목록으로 복귀하는 UI는 `components/crefans/BackButton.tsx`를 사용한다. 원형 44×44px 터치 영역과 22px 왼쪽 화살표, 목적지를 설명하는 `label`을 공유한다. `href`는 기존 목적지로 이동하는 링크이며 `onClick`은 메시지 대화 닫기 같은 화면 내 전환이다. 임의의 브라우저 방문 기록으로 이동하지 않는다. 제목 옆에서는 `PageTitle`의 `back`에 배치한다. 목업·실서비스·서비스 UI 카탈로그가 같은 컴포넌트를 쓴다.

2026-10-24 전수 검토: 현재 팬 서비스·스튜디오·공통 UI와 양쪽 라우터의 소스101개, 탐색 후보121곳을 검토했다. 텍스트 복귀13곳과 기존 아이콘2곳을 공통화했다. 구형 앱·별도 관리자콘솔은 범위에서 제외했다. [파일 목록·후보별 판단](./audit/back-navigation-inventory-20261024.json), [실행 증거](./audit/back-navigation-20261024.json).

| 적용 화면 | 기존 목적지·동작 |
| --- | --- |
| 공지사항 상세·없는 공지 | 공지사항 목록 |
| 팔로잉·팔로워, 저장·좋아요 목록 | 내 프로필 |
| 비밀번호 재설정 | 로그인 |
| 로그인 하단 | 메인 소개 페이지 |
| 카드 등록 결과 중 결제 복귀 | 해당 멤버십 결제 |
| 스튜디오 게시물 작성·수정·없는 게시물 | 콘텐츠 목록 |
| 스튜디오 정산 내역·출금 PIN 설정 | 수익 현황 |
| 스튜디오 리포트3종 | 대시보드 |
| 게시물 상세·모바일 대화 | 피드·대화 목록 |

결제 완료 후 내 구독/결제수단 이동, 작성 단계의 이전/다음, 미디어 넘김, 페이지네이션, 탭·메뉴·관련 화면·고객지원 안내는 복귀 버튼이 아닌 각 기능의 텍스트를 유지한다. 새 복귀 UI도 이 분류를 따른다. 로컬 전수 통일은 검증 완료다. 2026-10-24 저장·좋아요·팔로잉·팔로워4개 목록과 공용 BackButton/PageTitle 기반을 운영 반영했다. 나머지 전수 통일 변경의 배포는 별도이며, [이번 배포·검증 증거](./audit/collection-back-deployment-20261024.json)를 따른다.

### 타이포 중심 서비스 소개 (2026-11-03)

`/service/landing`과 `/preview/landing`은 같은 `LandingPage`를 사용한다. 중앙 두 줄 제목·짧은 소개 다음에 크리에이터 목록을 놓고 PC5열/모바일2열로 표시한다. 기존 사진·이름·배지를 유지하며 사진·이름·프로필 보기로 같은 프로필에 이동한다. 에셋 모드는 `/preview`로 이동하며 실제 팔로우를 실행하지 않는다.

‘크리에이터 둘러보기’ 제목 옆 공통 `InfoTooltip`은 “이 서비스 소개에 표시된 크리에이터는 가상의 인물입니다.”를 표시한다. 문구는 콘텐츠에서 주입하며 실제 크리에이터 데이터 모드에서는 생략한다. 마우스/키보드/터치·Escape·화면 경계 처리는 기존 공통 툴팁을 재사용한다. 배경 화보·콜라주·손글씨 장식 대신 서비스 토큰의 흰 배경·진한 제목·파란 동작 색상을 사용한다.

### 크리에이터 검색

탐색의 주목 제목 오른쪽 설명은 공용 `components/ui/InfoTooltip.tsx`를 사용한다. `label`과 `content`를 전달하며 이미지젠 `public/brand/tooltip-info-v1.png`를20px로 표시하고44px 클릭영역과14px 설명글자를 제공한다. 마우스/키보드포커스/터치로 열고, Escape·바깥선택·재선택으로 닫는다. 툴팁 위에 마우스를 옮겨도 유지하고 `role="tooltip"`과 `aria-describedby`를 연결한다. 화면 밖으로 넘치지 않게 위치를 조정하고 주목목록이 없으면 제목·아이콘을 함께 숨긴다. 카탈로그의 정보 툴팁과 목업/실서비스가 같은 컴포넌트다. 문구는 “홍보성 프로모션이 적용된 크리에이터나 해당 광고 상품을 이용중인 크리에이터가 노출될 수 있습니다.”다. 2026-10-24 운영반영. [최초 검증 및 생성근거](./audit/featured-tooltip-20261024.json), [정정문구 배포 검증](./audit/featured-tooltip-deployment-20261024.json). 확인일2026-10-24: [W3C hover/focus 안내](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), [APG tooltip 참고](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). APG는 합의 전 작업중 패턴이며 접근성 인증을 주장하지 않는다.

탐색의 **주목할 크리에이터** 제목은 승인된 이미지젠 별빛 `public/brand/featured-creators-v1.png`를 왼쪽22px, 간격6px로 사용한다. 공용 `ExplorePage`와 CSS를 목업/실서비스/화면카탈로그가 재사용하며, 장식이미지는 빈alt/aria-hidden으로 중복읽기를 피한다. Next Image로 작게 최적화하고 주목목록이 없으면 제목과 함께 숨긴다. 2026-10-24 운영 반영. [배포·검증 증거](./audit/featured-icon-deployment-20261024.json).

홈과 탐색은 `components/crefans/CreatorSearch.tsx`와 `creator-search.module.css`를 공유한다. 홈에서 사용하던 연한 배경·46px 최소 높이·24px 둥근 모서리·14px 글자·20px 검색 아이콘·11px/14px 안쪽 여백을 기준으로 통일했다. `href`를 주면 검색 페이지 진입 링크, `value`와 `onChange`를 주면 검색 입력이다. 입력의 `disabled`·`readOnly`도 지원하며, 포커스는 검색 영역 바깥선 하나로 표시한다.

홈은 각 basePath의 `/explore`로 이동하고, 탐색은 기존 검색어·카테고리·URL의 `q`를 처리한다. 목업과 실제 서비스가 같은 뷰를 사용하며 데이터 처리 방식은 유지한다. 서비스 UI 카탈로그의 **크리에이터 검색**에서 링크·입력·읽기 전용·비활성을 확인한다. [로컬 검증 증거](./audit/creator-search-20261024.json). 2026-10-24 운영 반영했으며 [배포·운영 검증](./audit/creator-search-deployment-20261024.json)을 따른다.

### 목록 선택

### Chip·ChipRow

홈·탐색의 크리에이터 분류는 `components/crefans/CategoryChip.tsx`가 공용 `Chip`에 이미지젠 라운드 플랫 아이콘을 주입한다. 전체·라이프스타일·뷰티·코스프레·피트니스·음악·여행·게임·아트·일상10종이며 `public/brand/categories/*-round-flat-v1.png`의 투명 원본을 Next Image로 최적화한다. 아이콘20px·글자 간격6px, 빈 alt/장식영역으로 중복 낭독을 피하고 미등록 분류는 이름만 표시한다. 서비스 UI 카탈로그에서 동일한 컴포넌트의 선택/미선택·미등록 분류를 확인한다. 탐색 필터는 `margin-block`만 지정해 모바일 공용16px 여백을 덮어쓰지 않는다. 2026-10-24 운영 반영, [제작 프롬프트·원본·배포 검증](./audit/category-icons-deployment-20261024.json).

프로필의 카테고리 표시는 같은 파일의 `CategoryIcon`으로 검색과 동일한 에셋·매핑·20px 크기를 재사용한다. `ProfileHeader`의 작은 칩에서 `#`을 제거하고 아이콘과 이름을6px 간격으로 정렬한다. 기존 표시용 태그에 동작 없는 버튼을 추가하지 않으며, 미등록 태그는 이름만/빈 목록은 생략한다. 목업·실서비스 프로필 및 프로필을 재사용하는 스튜디오 미리보기에 적용된다. 카탈로그 프로필 예시에 등록/미등록/빈 태그를 함께 둔다. [2026-10-25 검증·배포 증거](./audit/profile-category-20261025.json).

분류 필터(탐색·설정 카테고리, 알림 분류 등)는 `components/ui/Primitives`의 `Chip`을 `components/ui/ChipRow.tsx`의 `ChipRow` 안에 둔다. 화면별 버튼 CSS를 만들지 않는다. 알림 분류의 **라이브** 칩은 표시하지 않는다. 서버/목업 데이터에 해당 유형이 있어도 필터 선택지에서 제외하며 기존 알림 데이터와 전체 목록은 유지한다(2026-10-25 로컬 반영, 운영 배포 대기). [검증 기록](./audit/notification-live-chip-20261025.json).

- `ChipRow`: `label`(그룹 aria-label), `children`, `className?`. 항상 한 줄(`nowrap`)이며 넘치면 좌우 스크롤. 터치는 기본 스크롤, 마우스는 끌어서 스크롤(6px 이상 움직이면 드래그로 보고 그 직후 클릭은 무시). 스크롤바는 숨기고 모바일(≤767px)에서는 스크롤 영역을 본문 좌우 여백까지 확장해 화면 끝까지 보이게 한다. 내부 패딩과 `scroll-padding-inline`을 모두 16px로 맞춰 첫 칩은 본문과 정렬하고 초기 스냅이 여백을 지우지 않게 한다. 화면별 외부 간격은 `margin-block`·`padding-block`으로만 지정하여 공용 좌우 여백을 덮어쓰지 않는다.
- 카탈로그: 입력·선택 탭 "탐색과 선택" 섹션(칩 14개로 넘침 상태 확인).
- 2026-10-24 확인: [MDN scroll-padding-inline](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-padding-inline)의 정렬 영역 여백을 적용. [초기 위치·드래그·모바일/PC 측정 증거](./audit/chip-row-inset-20261024.json).

홈 `FeedPage` 상단도 같은 `Chip`/`ChipRow`를 사용한다. 검색창 모양의 링크는 각 basePath의 `/explore`로 이동하며 입력창/별도 검색 상태를 만들지 않는다. 관심 카테고리는 전체/분야 단일 선택이고 계정의 장기 관심사를 저장하는 설정은 아니다. 실제 서비스는 모델이 선택값과 서버 필터링 페이지를 주입하고, 전체 예시 목록을 가진 목업은 크리에이터 태그로 필터한다. 게시물 오버레이의 이전/다음 문맥도 필터된 목록을 사용한다. 빈 결과에서 전체 피드로 복귀하며 기존 서비스 안내 푸터를 유지한다. 서비스 UI 카탈로그의 홈 iframe에 같은 구현이 표시된다. [로컬 검증 증거](./audit/feed-toolbar-20261024.json).

비로그인 안내 `SignInPrompt`는 선택한02번 기존3D 자물쇠(투명 열쇠구멍)를88px 영역에 표시한다. 이미지는 장식용 빈alt이며, 제목24px·안내14px·로그인/회원가입48px 버튼과 기존 로그인 복귀 URL을 유지한다. 원본은 `public/brand/signin-lock-3d-transparent-v1.png`, 생성 근거는 같은 이름의 generation.json이다. 모바일 푸터는 공용 셸 좌우16px에 맞춰 본문 폭을 채우며,2열 안내 링크와 사업자 정보를 유지한다. PC는 기존 사이드바의 서비스 안내를 사용한다. 서비스 UI 카탈로그에 같은 컴포넌트를 등록하며 [모바일·PC 검사](../e2e/signin-prompt-gutter.spec.ts)로 표시와 경로를 확인한다. 후원 모달에서는 `SignInPrompt variant="dialog"`를 사용해 화면 기준 최소 높이와 페이지용 푸터를 제외한다. 자물쇠·로그인/가입 버튼·로그인 후 복귀 경로는 공유하며, 낮은 화면에서는 공통 Dialog의 필요한 스크롤을 유지한다. [모달 검사](../e2e/tip-login-dialog.spec.ts)에서 PC·모바일 맞춤 높이와 낮은 화면의 버튼 접근을 확인한다.

설정 `SettingsPage`도 같은 `Chip`/`ChipRow`를 사용한다. 전체(기본)·계정 설정·항목 모아보기·공개 설정·알림과 결제·계정 관리·서비스 안내로 필터하며 로그아웃/탈퇴는 전체 또는 계정 관리에서 표시한다. 서비스 안내는 PC·모바일 공통으로 공용 `ServiceFooter`/`ServiceLinks`를 재사용한다. 전체 또는 서비스 안내 선택 시 설정 하단에 표시하며, 모바일(767px 이하)은 기존 2열 링크 격자와 사업자 정보를 사용한다. PC는 기존 푸터 링크 배치를 유지하고 사업자 정보는 사이드바에 표시한다. 별도 스튜디오 링크 행·사업자 정보 중복은 두지 않는다(2026-11-02). 공용 `BusinessInfo`는 호스팅서비스 제공자 상호와 통신판매중개자 고지(이용약관 제1조 문구, `lib/content/business.ts`의 `intermediaryNotice`)를 함께 표시하고, 멤버십 결제 확인 상자(`PaymentTerms`의 `seller`)는 판매자 크리에이터와 같은 고지를 같은 글자 크기로 표시한다. 콩 충전 확인에는 넣지 않는다(2026-11-06, [표시 검사](../e2e/legal-notices.spec.ts)). PC에도 카테고리 칩을 표시하고 기존 내용 폭과 모달/`?section=` 진입을 유지한다. 공용 칩 스타일은 별도로 복제하지 않는다. [검증 증거](./audit/settings-categories-20261024.json). 2026-10-24 설정 카테고리와 모바일 전체폭 구분띠를 운영 반영했으며 [배포·운영 검증](./audit/settings-categories-deployment-20261024.json)을 따른다.

공용 서비스 푸터와 PC 사이드바의 `개인정보처리방침` 링크는 기본 본문 색상 `--cf-color-text`(진한 검정 계열)로 강조한다. 다른 안내 링크의 보조 색상·기존 hover·목적지와 배치는 유지한다. [PC·모바일 로컬 확인](./audit/privacy-link-20261103.json).

### 체크박스·라디오

동의·옵션 선택에는 `components/ui/Choice.tsx`의 `Checkbox`, `Radio`를 사용한다. 브라우저 기본 모양(`accent-color`)이나 화면별 CSS로 체크박스를 직접 만들지 않는다.

- 공통 props: `label`(ReactNode), `description?`, `checked`(boolean), `onChange(checked:boolean)`, `disabled?`, `className?`와 나머지 네이티브 `<input>` 속성(`name`, `value`, `required` 등). 네이티브 인풋을 `<label>`로 감싸므로 텍스트 클릭·스크린리더 라벨이 그대로 동작한다.
- `Radio`는 같은 `name`으로 묶고, 각 옵션의 `checked`에 선택 여부를 넣는다. 그룹 제목은 호출하는 쪽에서 `<fieldset><legend>`로 감싼다.
- 상태: 기본·선택·비활성(선택/미선택)·포커스(브랜드색 외곽선). 읽기 전용 상태는 없으므로 변경 불가 항목은 `disabled`로 표현한다.
- 카탈로그: 입력·선택 탭 "체크박스와 라디오" 섹션. 비활성 토글이 두 컴포넌트에도 적용된다.
- 사용처: 회원가입 동의 3종, 로그인 상태 유지, 멤버십 가입 동의, 회원 탈퇴 확인, 크리에이터 시작하기 공개 프로필 확인.

신규 목록 선택에는 `components/ui/SelectField.tsx`의 `SelectField`를 사용한다. `Primitives.tsx`에서도 다시 export하며, 네이티브 `<select>`의 `<option>` children이나 변경 이벤트를 받는 방식과는 계약이 다르다.

- 옵션은 `options: {value:string; label:string; disabled?:boolean; image?:string|null}[]`로 전달한다. 단일 선택은 `value:string`, `onChange(value:string)`을 사용한다. `multiple`을 켜면 `value:string[]`, `onChange(value:string[])`을 사용한다.
- `image`는 각 옵션 라벨 왼쪽과 선택된 단일 값 왼쪽에 20px 장식 이미지를 표시한다. 미지정·빈 값·로드 실패는 텍스트만 표시한다. 다중 선택의 트리거는 기존 요약 텍스트·개수를 유지한다. 스튜디오 첫 전환·설정은 탐색에 이미 로드한 bootstrap `categoryIcons`와 공용 `categoryImageSrc`를 사용하며 운영 등록 이미지·명시적 null·기존 기본 이미지 규칙을 함께 따른다.
- `searchable`은 옵션 검색, `multiple`과 함께 쓰는 `selectAll`은 전체 선택/해제를 켠다. 검색 중에는 현재 검색 결과의 활성 옵션만 전체 선택/해제하며, 검색 밖에서 선택한 값은 유지한다.
- `label`, `placeholder`, `hint`, `error`, `required`, `disabled`, `readOnly`, `id`, `name`, `hideLabel`, `className`을 지원한다. `name`을 주면 선택 값을 hidden input으로 전달한다. 필수 선택 여부 등 업무 검증은 호출부에서 처리한다.
- `value: ''`인 옵션도 실제 선택 항목으로 사용할 수 있다. 예를 들어 `전체 공개`나 `모든 멤버십`을 빈 문자열 옵션으로 등록했다면 그 label을 표시하며, placeholder로 바꾸지 않는다.
- 방향키·Home/End로 활성 항목을 이동하고 Enter/Space로 선택한다. Escape로 닫고 트리거에 포커스를 돌려준다. 다중 전체 선택은 Ctrl/Cmd+A로도 실행하며, 검색 입력 안에서는 텍스트 전체 선택 동작을 유지한다.

선택창은 `combobox`/`listbox`/`option` 상태를 제공하고, 화면 크기에 맞춰 목록 위치와 높이를 조절한다. 카탈로그에서 비활성 옵션, 빈 옵션, 검색 결과 없음, 오류, 읽기 전용, 모달 안의 선택창을 확인한다.

### 표 정렬과 페이지 이동

`components/ui/DataTable.tsx`의 `DataTable<T>`는 `rows`, `columns`, `rowKey`, `sort`, `onSortChange`, `caption`을 받는다. 열은 `{key, label, render(row), sortValue?(row)}`로 정의하며, `sortValue`가 있는 열만 정렬 버튼을 제공한다. `sortValue`는 문자열·숫자·`null`을 반환한다.

- `sort`는 호출부에서 관리하는 `TableSort`, 즉 `null | {key:string; direction:'asc'|'desc'}`다. 같은 열을 클릭하면 **기본 순서(null) → 오름차순(asc) → 내림차순(desc) → 기본 순서(null)**로 전환한다. 다른 열을 선택하면 오름차순부터 시작한다.
- 기본 순서는 전달받은 `rows`의 순서다. 배열을 복사해 정렬하며 원본을 바꾸지 않는다. 동점 항목은 원래 순서를 유지하는 안정 정렬을 사용하고 `null` 값은 양방향 모두 마지막에 둔다.
- `page`와 `pageSize`를 모두 주면 전체 전달 데이터를 먼저 정렬한 후 현재 페이지를 잘라 표시한다. `page`는 1부터 시작한다. 정렬·필터·페이지 크기가 바뀔 때 페이지를 1로 돌리는 책임은 호출부에 있다.
- `loading`은 로딩 상태와 정렬 버튼 비활성화를 제공하며, `emptyMessage`는 빈 표의 문구를 바꾼다. 열 상태는 `aria-sort`, 로딩은 `aria-busy`로 전달한다.
- 표 자체는 페이지 버튼을 만들지 않는다. `components/ui/Pagination.tsx`의 `Pagination`에 `page`, `totalItems`, `pageSize`, `onPageChange`, 선택적 `label`을 전달한다. 현재 페이지는 `aria-current="page"`로 표시하며, 긴 범위는 생략부호로 줄인다. 데이터가 없거나 한 페이지만 있으면 이동 버튼이 비활성화된다.

```tsx
<DataTable
  rows={rows}
  columns={columns}
  rowKey={row => row.id}
  caption="구독자 목록"
  sort={sort}
  onSortChange={next => { setSort(next); setPage(1); }}
  page={page}
  pageSize={pageSize}
/>
<Pagination
  page={page}
  pageSize={pageSize}
  totalItems={rows.length}
  onPageChange={setPage}
/>
```

이 예시는 전체 예시 데이터를 받은 카탈로그의 클라이언트 정렬·페이지 분할 범위다. 실제 API의 서버 정렬·페이지네이션 계약은 유지한다. 서버에서 받은 한 페이지를 전체 데이터로 간주해 다시 분할하거나, 그 페이지의 정렬을 전체 데이터 정렬로 표현하지 않는다.

### 서비스 패턴과 데이터 주입

`ServicePatternCatalog.tsx`는 `components/crefans/`의 `FollowButton`(팔로우/팔로우 하는중 토글, 해제 시 확인 모달), `CreatorCard`, `MembershipPlanCard`, `PostCard`, `MetricCard`, `LedgerRow`, `AmountRows`, `Action`, `Empty`, `Notice`, `PageTitle`, `ApiState`를 직접 사용한다. 카탈로그가 옵션·목업 데이터·콜백을 주입하며, 표시 컴포넌트는 API나 fixture를 직접 읽지 않는다. 공통 팔로우 버튼은 미팔로우일 때 파란 배경·흰 글자(primary), 팔로우 중일 때 흰 배경·진한 글자와 테두리(secondary)다. 더하기/체크 아이콘은 탐색·프로필·팔로잉 목록·카탈로그 모두24px다. 모바일 탐색 카드는 아이콘/문구 간격과 좌우패딩을2px로 맞춰320px 폭에서도 한 줄을 유지한다. 프로필 배경 위 팔로우 버튼 아이콘은24px이며, 내 프로필 설정 아이콘은22px로 소폭 줄였다. 최소높이36px·글자최소14px·패딩은 유지한다. 설정22px 변경도 2026-10-24 운영반영했다. [크기 검증](./audit/profile-settings-icon-20261024.json), [배포 검증](./audit/gnb-unread-deployment-20261024.json). 팔로우 해제 확인 모달은 유지한다. 팔로우 색상·크기 및 설정24px 기준은 2026-10-24 운영 반영했다. 로컬 검증은 `docs/audit/follow-toggle-20261024.json`, 운영 검증은 [배포 증거](./audit/follow-toggle-deployment-20261024.json)를 참고한다.

팔로우·멤버십 선택·게시물 잠금·좋아요·저장·API 로딩/오류/성공 상태를 해당 공통 컴포넌트에서 전환한다. 게시물 좋아요 선택 하트는 테두리와 내부를 같은 `color.danger` 빨강으로 채우고, 취소하면 빈 하트로 표시한다. 피드·상세·갤러리·목업/서비스는 공용 PostActions/CSS를 사용한다. 이 채움 변경은2026-10-24 운영반영했다([로컬 검증](./audit/liked-heart-20261024.json), [배포 검증](./audit/category-icons-deployment-20261024.json)). 화면별 헤더·탭·메시지·알림·목록의 전체 구성은 `/preview` 페이지를 iframe과 새 탭 링크로 확인한다. 실제 서비스 연결은 동일 표시 컴포넌트에 실제 모델을 주입하는 방식이며, 카탈로그 조작이 실제 발행·결제·정산을 실행하지 않는다.

- `PostMembershipNotice`는 피드·게시물 상세의 멤버십 이름 안내와 가격/혜택 레이어를 공유한다. 차단 영역은 가입 가능한 최저 등급 상품의 멤버십 이미지를 어둡게 처리한 배경으로 표시하고, 모달은 각 상품의 이미지를 카드 상단에 표시한다. 상품 전용은 지정 상품만 사용하며 비공개 게시물 이미지를 대체 이미지로 사용하지 않는다. 공용 `OptionalImage`로 이미지 없음·로딩 실패 시 그림과 빈 자리를 생략하고 기존 안내·혜택·가입 동선을 유지한다. 카탈로그는 같은 크리에이터의 상품으로 이미지 있음/없음/실패·판매 중단·빈 목록·읽기 전용을 확인한다. 이미지 표시 개선은2026-10-25 로컬 반영·운영 배포 대기([검증 기록](./audit/membership-offer-images-20261025.json)). `getPostMembershipOffer`는 같은 크리에이터의 상품 전용/최소 레벨 조건을 구분하고, 가입 가능한 상품만 레이어에 표시한다. PC는 중앙 floating Dialog, 모바일은 sheet이며 안내 열기는 페이지 이동이나 결제를 실행하지 않는다. 상품 선택 링크는 기존 멤버십 페이지에 plan을 전달한다. 서비스 UI 카탈로그에서 가입 가능·판매 중단·빈 목록·읽기 전용을 전환한다. [실행 증거](./audit/membership-offer-20261024.json). 멤버십 안내·공통 Dialog와 상세 뒤로가기 배치는 `membership-ui-20261024`로 운영에 반영됐으며 [배포 검증](./audit/membership-ui-deployment-20261024.json)에 기록했다.

- `BenefitsField`는 `value:string[]`와 `onChange`를 받아 혜택을 개별 입력·추가·삭제한다. 저장 시 빈 항목 정리와 필수 검증은 호출부에서 수행한다. 입력·선택 메뉴에 기본·빈 목록·오류·비활성·읽기 전용 상태가 등록되어 있다. 멤버십 편집 미리보기 기능은 요청 취소로 추가하지 않았다.
- `PinPad`(components/ui/PinPad.tsx)와 `usePinPad`(hooks/usePinPad.ts)가 출금 PIN 입력의 단일 구현이다(2026-11-11, 이전 `PinField` 대체). 점 6개 + 3×4 키패드(숫자 10개 무작위 배열·전체삭제·한 자리 지우기), 6자리가 차면 `onComplete`로 바로 확인한다. 시도마다 `reset()`으로 값을 지우고 배열을 다시 섞는다. 값은 훅 상태에만 있고 input·폼·저장소에 쓰지 않는다. 디자인은 사용자 선택 C안(바텀시트, 2026-11-11): 밝은 배경·가는 구분선의 키패드를 다이얼로그 하단에 가장자리까지 붙이고, 모바일은 `Dialog sheet` 바텀시트, PC는 카드이며 포커스된 패드에서 숫자키·Backspace·Delete를 받는다. 사용처: 출금 PIN 설정(2단계 입력), 출금 PIN 재설정(`studio/security/reset`, 같은 2단계 입력 후 PASS 본인인증, 2026-11-11), 멤버십 출금 확인, 콩 출금 확인. 확인용 패드에는 `resetHref`로 "PIN을 잊으셨나요?" 링크를 붙여 재설정 페이지로 보낸다. 이메일 인증 코드·운영 콘솔 2차 인증(OTP)은 붙여넣기·자동완성이 필요해 이 패드를 쓰지 않는다.
- `AmountPresets`는 금액 문자열·가용 잔액·증액 단위와 콜백을 받는다. 1만/5만/10만/50만/100만 더하기, 전액, 초기화를 제공한다. 빼기 모드는 최종 요청으로 제거했다. 빈 값·가용 금액 0·disabled도 카탈로그에서 확인한다.
- 멤버십 이미지 등록은 게시물과 공통 `MediaUpload`를 사용한다. 멤버십에서는 `max={1}`·이미지 전용 accept·`사진 추가` 문구로 주입하여 0/1 카운터, 회색 추가 버튼, 짧은 형식·용량 안내, 정사각 썸네일과 삭제 버튼을 표시한다. 삭제 후 새 사진을 선택하며 파일 검증·업로드는 모델에서 수행한다. 실서비스·목업 모두 JPG·PNG·WebP 5MB 이하이고 동영상은 허용하지 않는다. 게시물은 기존 사진·동영상 다중 선택을 유지한다. `OptionalImage`를 스튜디오/팬 멤버십 카드에서 공유하여 없거나 깨진 이미지에서는 기본 카드 상태를 유지한다. `Toggle`은 동일 활성화 플래그를 표시하고 변경 콜백만 호출한다. 이미지 등록과 활성화 UI는 입력·선택 카탈로그에 등록한다.
- `Charts.tsx`의 `Trend`와 `BarChart`는 데이터에 따른 선·막대를 표시한다. 화면에 처음 들어오면 `motion.chart` 600ms 동안 나타나며, 데이터 변경 시 현재 표시 값에서 새 값으로 이동한다. 같은 내용의 새 배열은 다시 시작하지 않고, 모션 감소 설정에서는 즉시 값을 표시한다. `BarChart.items`의 `id`는 데이터가 바뀌어도 같은 항목을 식별할 수 있도록 유지한다.
- 서비스 UI 메뉴의 차트 예시에서 증가·감소·0·빈 데이터와 첫 진입을 확인한다. 스튜디오 순수익·구독자·팔로워 리포트도 화면별 목록에 등록한다. 리포트는 주입된 `ApiResult<StudioReport>`를 표시하고 표 정렬·페이지 상태만 화면에서 관리한다.

- 공용 `MessagesPage`의 보내기 버튼은 `Icon`의 위쪽 화살표를 사용한다. 게시물 상세의 피드 복귀 링크와 모바일 대화 목록 복귀 버튼은 같은 44×44px 원형 배경·왼쪽 화살표 스타일을 공유하며 키보드 포커스와 접근성 이름을 제공한다. 게시물 상세의 복귀 버튼은 작성자 아바타 왼쪽 같은 줄에 10px 간격으로 배치하며 더보기 메뉴는 오른쪽을 유지한다. 읽기 전용 콘텐츠 미리보기에서는 복귀 링크를 표시하지 않는다. 팬·스튜디오·목업·실서비스 및 카탈로그 iframe이 같은 화면을 재사용한다.
- 공용 `ServiceShell`의 모바일 GNB(767px 이하)는 아이콘 전용이며 아이콘·프로필 사진·기본 아바타는 28×28px, 각 링크는 56×48px다. 메뉴 이름은 `aria-label`, 선택 상태는 `aria-current`로 제공한다. 미확인 메시지·알림 개수 배지와 프로필 사진/기본 아바타를 표시하며 768px 이상은 텍스트가 있는 기존 사이드바를 사용한다. 목업·실서비스·화면 카탈로그에서 같은 셸을 재사용한다.
- 미확인 개수는 공용 `components/ui/UnreadBadge.tsx`에 `count`를 전달한다. 0개/비로그인 숨김, 1~99개 숫자, 100개 이상 `99+`. 빨간 배경·흰 글자11px·높이20px이며 아이콘 우상단에 겹쳐 표시한다. 링크의 접근성 이름에는 생략하지 않은 실제 개수를 제공한다. 수신 미확인 메시지 합계와 읽지 않은 알림 수를 기존 모델에서 계산하며 성공한 읽음 처리만 반영한다. 카탈로그에0/1/9/99/100예시를 제공한다. 2026-10-24 운영반영, [검증 증거](./audit/gnb-unread-deployment-20261024.json).
- 팬 GNB·PC 사이드바·상단 알림은 `components/crefans/NavigationIcon.tsx`의 라운드 플랫 이미지젠 아이콘을 공유한다. 홈·탐색·메시지(빈 말풍선)·알림·기본 프로필5종을 `public/brand/navigation/*-round-flat-v1.png` 투명 원본으로 보존하고 Next Image로 최적화한다. 선택은 파랑·보라, 미선택은 CSS grayscale·opacity. 모바일 GNB·PC 사이드바의 선택 링크에는 사각 배경색을 넣지 않는다. 아이콘/텍스트 색상·프로필 선택 테두리·키보드 포커스 표시로 구분한다([배포 검증](./audit/gnb-clear-deployment-20261024.json)). 레이아웃 크기는 모바일28px/PC21px이며 투명 여백의 시각적 크기를 CSS scale로 보정한다. `NavigationAvatar`는 모바일 마이의 기존 사진을 유지하고 사진 없음/실패시에만 같은 기본 프로필을 표시한다. 일반 프로필 아바타와 게시물 `CommentIcon`은 기존 표시를 유지한다. 디자인시스템 서비스 UI에서도 같은 컴포넌트의 선택·미선택·사진/기본값을 확인한다. 2026-10-24 운영 반영([프롬프트·원본·배포 검증](./audit/gnb-flat-deployment-20261024.json)).
- 모바일 설정(767px 이하)은 메뉴 그룹 사이와 로그아웃 영역 앞에 화면 전체 너비의테두리 없는8px 중립 배경띠를 표시해 흰색 영역을 구분한다. 내용의16px 안쪽여백과 기존 메뉴/모달 동작을 유지하며 PC는 기존 레이아웃을 사용한다. 목업/실서비스가 같은 `account.module.css`를 사용한다. [전체폭 검증](./audit/settings-edge-dividers-20261024.json), [테두리 제거 검증](./audit/settings-divider-color-20261024.json). 테두리 제거 후속 변경도 2026-10-24 운영에 반영했다. [배포·운영 검증](./audit/settings-divider-color-deployment-20261024.json).
- 설정의 로그아웃·회원 탈퇴는 같은 `menuList` 전체 너비 행을 사용한다. 이름은 왼쪽, 16px 꺾쇠는 오른쪽에 배치하며 기존 메뉴의 높이·안쪽 여백·키보드 포커스를 공유한다. 로그아웃은 위험 색상(빨강), 회원 탈퇴는 기본 메뉴 글자색을 사용한다. 로그아웃 busy 처리와 탈퇴 안내 모달은 유지한다.
- 모바일 메시지·알림 제목은 공통 h2 토큰 24px·행간1.3·굵기700으로 맞춘다. PC 제목 크기는 유지한다. GNB·헤더·사이드바는 미확인 숫자배지, 목록은 미확인 점을 사용하며 둘 다 `color.danger` 빨간색, 읽지 않은 메시지·알림 행은 `color.warningSoft` 옅은 노란색이다. 메시지·알림 목록 항목 사이에는 구분선을 표시하지 않는다. 모바일 배경은 화면 양끝까지 표시하고 내부16px 여백을 유지한다. 이 변경은2026-10-25 운영에 반영했다. [변경 전후 검증](./audit/inbox-dividers-20261025.json)과 [배포·운영 검증](./audit/inbox-dividers-deployment-20261025.json)을 따른다. 선택된 대화는 별도 중립 배경으로 구분하며 선택 상태를 읽지 않음으로 간주하지 않는다.
- 메시지 목록의 날짜·시간은 선택 여부와 관계없이 `color.textMuted` 회색을 사용한다. 대화방 날짜·시간도 같은 보조 색상이다. 선택 상태에 파란 시간 표시를 추가하지 않는다. [로컬 색상 검증](./audit/message-time-color-20261024.json). 2026-10-24 운영 반영했으며 [배포 검증](./audit/message-time-deployment-20261024.json)에 확인 범위를 기록했다.
- `MessagesPage`는 주입된 `Message.unread`와 선택적인 `markConversationRead` 콜백을 사용한다. 대화 표시·탭 활성 시 스냅샷 ID를 전달하고 성공한 ID만 읽음으로 바꾼다. 팬/스튜디오 목업 및 실제 모델이 같은 표시 컴포넌트를 사용한다. 알림은 기존 개별/모두 읽음 동작을 유지한다. [검증 증거](./audit/inbox-unread-20261024.json)는 로컬 목업·서비스 어댑터 대역·격리 DB 검사이며 운영 배포 또는 물리 iPhone 검증이 아니다.


- 모바일 팬 셸은 `100dvh` 높이 안에서 본문 스크롤 영역과 하단 GNB를 나눈다. GNB는 마지막 고정 높이 행이며 문서 전체는 스크롤하지 않는다. 짧은 콘텐츠도 메뉴가 화면 끝을 유지하고 긴 본문은 메뉴 위에서 스크롤한다. `/preview` 안내 띠는 같은 화면 높이 안에 포함한다. 인증·랜딩·스튜디오와 PC 배치는 기존 구조를 유지한다.
- 경로 변경 시 모바일 본문 스크롤을 초기화하고, 모달/미디어 오버레이가 열린 동안 본문 스크롤을 잠근다. 메시지방은 고정 픽셀 최소 높이 대신 본문 가용 높이를 사용한다. 검사: `e2e/mobile-shell.spec.ts`, [구조·운영 검증 증거](./audit/mobile-shell-20261024.json).
- 2026-10-24 조사: [WebKit 312149](https://bugs.webkit.org/show_bug.cgi?id=312149)와 [297779](https://bugs.webkit.org/show_bug.cgi?id=297779)에 iOS의 주소창/키보드 변화 후 하단 fixed 요소 표시 이상 사례가 있다. 사용자 기기의 원인이 동일하다고 확정하지 않았으며, fixed 요소 보정값 대신 레이아웃에서 메뉴와 스크롤을 분리했다. [MDN 동적 뷰포트 단위](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length)와 [overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior)를 근거로 `dvh`·본문 스크롤 경계 제어를 적용했다. 물리 iPhone 주소창/키보드 검증과 자동 WebKit 검증은 구분한다.

- `MediaOverlay`는 게시물과 프로필이 공유하는 전체 화면 미디어 표시 컴포넌트다. 닫기 X 아이콘은 PC·모바일 모두36×36px이며 버튼 위치·배경 크기는 유지한다(2026-10-25 로컬 반영, 운영 배포 대기). [검증 기록](./audit/gallery-close-icon-20261025.json). 미디어 URL·선택 인덱스·열림 상태·닫기/인덱스 콜백을 주입한다. 상세 패널(`children`)과 갤러리 버튼(`stageAction`)이 없으면 사진만 화면 전체에 비율 유지로 표시한다. 스와이프/이전·다음/닫기·Escape·포커스 복원·스크롤 잠금을 공유하고 실제 접근 권한은 호출 모델/API가 결정한다. `ProfileHeader`는 프로필 사진/배경을 연결하며 사진 없음·로드 실패 시 진입하지 않는다. 서비스 컴포넌트의 **프로필 사진 크게 보기** 예시는 같은 헤더로 사진 있음/없음을 표시한다.

- 게시물 상세(`PostDetailPage`)도 피드의 공용 `PostOverlay`를 사용한다. 사진을 누르면 선택한 미디어부터 열리고 갤러리 안에서 이미지·동영상을 넘길 수 있다. 본문의 동영상은 기존 네이티브 재생 컨트롤을 유지한다. 잠김·읽기 전용·미디어 없음에는 확대 진입을 제공하지 않으며, 게시물 ID/접근 권한/읽기 전용 변경 시 열린 갤러리를 닫고 권한 복구만으로 다시 열지 않는다. 상세에는 이전·다음 게시물 문맥을 임의로 주입하지 않는다. 2026-10-25 로컬 반영, 운영 배포 대기. [검증 기록](./audit/post-detail-gallery-20261025.json).

### 모션과 확인 항목

일반 본문 이동 링크는 `components/ui/TextLink.tsx`를 사용한다. Next Link의 `href` 등 기존 속성을 받으며 파란색 글자와 밑줄로 표시한다. 메뉴·로고·카드 전체 링크·주요 CTA 버튼은 각 역할에 맞는 형태를 유지한다.

모달·바텀시트·토스트·선택 목록은 `lib/design/tokens.ts`의 `motion.normal` **200ms 진입**, `motion.fast` **120ms 종료**를 공유한다. 닫힘 애니메이션 동안 내용을 유지하고, 종료 중인 표면의 추가 조작을 막은 뒤 닫거나 제거한다. `prefers-reduced-motion: reduce`에서는 애니메이션·전환을 끄고 종료 대기를 생략한다. `Dialog`는 Escape·배경 클릭·포커스 복귀·본문 스크롤 잠금을 유지한다.

공통 `Dialog`는 열릴 때 `tabIndex=-1`인 제목에 포커스를 두고 닫기 버튼을 자동 강조하지 않는다. 닫기는 테두리 없는 44×44px 버튼에 28px SVG X를 표시하며, Tab으로 이동했을 때의 포커스 표시는 유지한다. Tab/Shift+Tab은 보이는 활성 요소 사이를 순환하고 중첩 Dialog의 요소는 제외한다. 멤버십 안내는 열기 버튼에 먼저 포커스를 두어 WebKit에서도 닫힌 뒤 해당 버튼으로 복귀한다. 목업·실서비스·스튜디오·디자인 카탈로그가 같은 구현을 사용한다. [WAI-ARIA 모달 패턴](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)의 정적 제목 초기 포커스 및 닫힘 후 복귀 지침을 적용했다(확인: 2026-10-24). 별도 미디어 갤러리 오버레이의 제스처·배치는 이 변경 범위에 포함하지 않는다.

- 모달·바텀시트 하단 액션은 `components/ui/DialogActions.tsx`를 사용한다. 취소·확인 또는 단독 닫기·저장 버튼을 오른쪽으로 정렬하며, 좁은 화면에서도 정렬을 유지한 채 필요한 경우 줄을 바꾼다.
- `Toast` 하단의 3px 막대는 자동 닫힘까지 남은 4초를 표시한다. 새 메시지에서는 막대와 타이머를 함께 다시 시작하며, 부모의 일반 재렌더링이나 콜백 변경은 남은 시간을 초기화하지 않는다. 모션 감소 설정에서는 연속 축소 대신 1초 단위로 줄어든다. 시간 막대는 보조 장식으로 처리해 알림 문구의 음성 안내를 반복하지 않는다.
- 2026-10-29: 일시적인 저장·수정·삭제·공유 완료 안내는 본문 문단 대신 공용 [Toast](../components/ui/Toast.tsx)로 표시한다. [SnackbarProvider와 useSnackbarMessage](../components/ui/SnackbarProvider.tsx)를 `PresentationProviders`에서 공유해 API 저장 후 페이지가 재생성되어도 완료 메시지가 유지된다. 최신 안내 한 개만 표시하고 같은 내용의 새 안내는 4초 타이머를 새로 시작한다. 경로 변경·수동 닫기는 안내를 지우며, 입력 오류·조회 상태·결제/출금 결과 화면은 각 문맥에 남긴다. `/preview`와 `/service`의 팬·스튜디오가 같은 구현을 사용한다. 운영 콘솔은 별도 저장소로 이번 적용 범위가 아니다.
- 스낵바는 문서 흐름 밖의 하단 중앙에 표시하며 모바일 GNB·safe-area를 피한다. 열린 dialog가 있으면 그 내부에 portal을 두고, 지원 브라우저의 수동 popover top layer를 사용해 모달의 잘림·비활성화 영향을 피한다. 사용자의 포커스를 가져오지 않고 `role=status`로 안내한다. 근거: [MDN popover](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover), [showPopover](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/showPopover), [Firefox modal/popover 사례](https://bugzilla.mozilla.org/show_bug.cgi?id=1961535), 확인2026-10-29. 물리 iPhone·구형 미지원 브라우저 검증과 최신 WebKit 에뮬레이션을 구분한다. [검증 기록](./audit/snackbar-20261029.json).
- 활성 버튼은 hover의 배경·색상 변화와 키보드 `focus-visible` 외곽선을 제공한다. 비활성 버튼에는 hover 강조를 적용하지 않는다. 검색 입력처럼 외부 래퍼가 포커스를 표시하는 경우 내부 input 외곽선은 중복해서 그리지 않는다.

검증은 `npm run check`와 브라우저 확인으로 나눈다. `tests/field.test.cjs`는 입력 속성·콜백·접근성 연결·보조 버튼·글자 수를, `tests/data-table.test.cjs`는 3단계 정렬·안정 정렬·원본 보존·정렬 후 페이지 분할·페이지 경계를 검사한다. 브라우저에서는 선택창 키보드 이동·모달 내부 선택·좁은 화면·모션 감소 설정과 실제 표시 상태를 확인한다. 문서에 적힌 상태가 등록되었다고 해서 실제 서버 기능의 검증이 완료된 것으로 간주하지 않는다.

## 초기 카탈로그에 포함된 항목 (보존 기록)

1. 디자인 토큰: 역할별 색상, 간격, 컨트롤 높이, radius, border, shadow, breakpoint, 모션. `theme.useToken()`의 전체 계산 결과를 검색하거나 JSON으로 내려받을 수 있다.
2. 타이포그래피: H1~H5, 본문, 캡션, 실제 font-family·크기·굵기·행간, 의미별 텍스트, 링크, 숫자, 말줄임과 복사.
3. 버튼·아이콘: 종류, 크기, 아이콘, 위험 행동, 전체 너비, ghost, disabled, loading, 포인터·키보드 상태.
4. 입력·선택: 텍스트, 비밀번호, 검색, 숫자, textarea, 자동완성, 단일·다중 select, 체크박스, 라디오, 스위치, 날짜·기간·시간, 슬라이더, 평점, 색상, 트리·계층 선택, 로컬 파일 선택.
5. 폼: 기본 도움말, 오류·경고·성공·검증 중 메시지와 실제 필수값·이메일 검증, 초기화.
6. 피드백: snackbar/toast, notification, inline alert, spinner, skeleton, progress, empty, result.
7. 오버레이: 알림 모달, 확인·삭제 컨펌, 저장 로딩, drawer, tooltip, popover, popconfirm.
8. 데이터 표시: avatar, badge, tag, card, statistic, descriptions, table, timeline, collapse.
9. 탐색: tabs, segmented, breadcrumb, pagination, menu, dropdown, steps, divider.
10. 실제 서비스 컴포넌트: PostView, FollowButtonView, MembershipCard, PaymentHistoryItem, CategoryTag, MediaGallery, FeedFilter, EmailAutoComplete.
11. 상태 비교표: 기본·disabled·error/warning·loading/read-only 및 실제 상태 색상.

## 초기 카탈로그의 데이터와 화면 분리 (보존 기록)

- `features/design-system/catalog.ts`: 분류 목록과 기본/긴 문구·큰 금액/빈 목록 fixture 생성.
- `features/design-system/useDesignSystemModel.ts`: 검색, 크기, 비활성, fixture 시나리오 상태.
- `components/design-system/`: 섹션별 미리보기와 UI 상호작용. 선택·폼 입력·메시지 등은 로컬에서만 동작한다.
- `lib/theme.ts`: 기존 공통 테마 설정을 추출한 단일 참조. 서비스의 테마 값 자체는 바꾸지 않았다.
- `PostView`와 `FollowButtonView`의 표시 계층을 named export하여 실제 API 모델 없이도 상태를 주입한다. PostView의 `comments` 슬롯을 `null`로 전달해 카탈로그에서는 댓글 API가 실행되지 않는다. 기존 서비스는 기본 댓글 영역을 유지한다.
- 루트 `ApplicationProviders`는 `/design-system`에서 인증·알림 Context 초기화를 생략한다. 서비스 경로에서는 기존 제공자를 유지한다.

상단 크기/비활성 제어는 지원하는 기본 UI에 적용된다. 개별 크기·상태 비교 예시는 고정되어 있고, 서비스 컴포넌트의 자체 스타일은 기존 구현을 그대로 보여준다. 데이터 선택기는 10번 섹션의 멤버십·결제·미디어 데이터를 전환한다. 게시글 권한·팔로우 상태는 해당 예시 안에서 전환한다.

실제 업로드·결제·삭제·회원 API를 호출하지 않는다. 선택한 파일과 입력한 폼은 저장하지 않는다. 기존 컴포넌트가 지원하지 않는 상태를 지원하는 것처럼 추가하지 않았다. 예를 들어 PaymentHistoryItem은 현재 status별 배지가 없다.

## 초기 카탈로그 검증 (보존 기록)

`npm run check`로 레이어, 타입, 회귀 테스트를 실행한다. 신규 테스트는 샘플 데이터의 독립성과 카탈로그/서비스 경로의 Provider 분기를 검사한다. 기존 46개 렌더링 파일 기준도 유지한다.

개발 서버 예시:

```sh
NEXT_PUBLIC_APP_ENV=local npm run dev -- --hostname 127.0.0.1 --port 3010
```

브라우저에서 폼 검증·초기화, 메시지, 컨펌 확인/취소, 모달 로딩, 드로어, 토큰 검색/다운로드, 비활성 전환, 긴/빈 fixture, 게시글 접근 상태를 확인한다. 모바일 가로 넘침과 이미지 로딩도 확인한다. 이 페이지의 noindex 설정은 검색 색인 방지이며 접근 통제 기능은 아니다.

## 전면 개편 V1 (feat/ui-redesign)

- 기준 커밋: `6e132a6` (기존 랜딩·카탈로그 보존). `dev` 브랜치가 없어 현재 작업의 검증된 기준 커밋에서 분기했다.
- 참고: https://chatgpt.com/s/m_6aa5019c03e88191a0aa833bf23c1ed1
- V1 당시 `/design-system`은 개편 테마 미리보기였다. 목업의 화이트·바이올렛 방향을 해석한 제안값이며 원본 색상을 정확히 추출한 값은 아니다.
- `lib/design/tokens.ts`: 기본 palette → 의미별 color, typography, space, radius, size, border, shadow, motion, breakpoint. CSS 변수 `--cf-*`도 이 파일에서 생성한다.
- `lib/design/theme.ts`: 의미별 토큰을 Ant Design 및 컴포넌트별 설정에 연결한다. 디자인을 바꿀 때 화면에 색상 HEX를 다시 적지 않는다.
- `DesignSystem`의 지역 ConfigProvider + AntdApp으로 카탈로그와 모달·알림에만 새 테마를 적용한다. 기존 `appTheme`와 인증·결제·API는 유지한다.
- 토큰 JSON 다운로드는 새 토큰 원본을, 하단 계산 토큰 다운로드는 Ant Design 계산 결과와 비교용 기존 상수를 제공한다.
- 기존 서비스 컴포넌트의 인라인 색상은 아직 개편되지 않았다. 해당 예시는 데이터 계약과 현재 동작 확인용이다. 이후 화면 개편 시 차례로 의미별 토큰을 사용하도록 이전한다.
- 일반 텍스트·강조 버튼 대비 4.5:1 이상과 테마 격리를 `tests/redesign-tokens.test.cjs`에서 검증한다.

## V2 — 자체 UI로 교체 (현재)

V1의 Ant Design 테마 변형은 새 디자인 기준으로 사용하지 않는다. `/design-system`은 `CustomDesignSystem`을 렌더링하며 `components/ui`의 기본 요소와 `components/crefans`의 실제 서비스 표시 컴포넌트를 함께 사용한다. V1 파일은 기존 작업 보존용이며 이 경로에서 import하지 않는다.

- `AppShell`: 모바일 하단 내비게이션, 데스크톱 사이드 탐색. 현재 메뉴는 카탈로그용이며 이후 실제 팬 라우트를 연결한다.
- `Primitives`: Button, Chip, Badge, EmptyState, Dialog/BottomSheet, Toast. Toast, Field, TextAreaField, SelectField는 전용 파일에서 구현하고 이 경로에서도 다시 export한다. AntD 래핑 없음.
- `Content`: V2 초기에 만든 CreatorCard, PostCard, MembershipCard, TransactionItem 예시는 보존한다. 현재 카탈로그는 탐색·피드·멤버십·정산 화면에서 재사용하는 `components/crefans`의 공통 컴포넌트를 직접 등록한다.
- 네이티브 dialog: showModal, Escape, 취소, 배경 클릭, 포커스 복귀 및 배경 스크롤 잠금. 모바일에서 bottom sheet 변형 사용.
- 공유 토큰 원본은 `lib/design/tokens.ts`. 기존 `lib/design/theme.ts`는 V1 어댑터로 새 페이지에서 사용하지 않는다.
- 카탈로그 경로에서는 PresentationProviders가 기존 AntD UI Provider를 생략한다. 기존 서비스 경로는 유지한다.
- 계획: `docs/ui-migration-plan.md`. 아직 서비스 전체 이전을 완료한 상태가 아니다.

## 초기 랜딩 목업 기록 (현재 동작은 화면 검수 문서 참조)

- `/preview/landing`: 동일한 공유 토큰과 자체 UI를 사용하는 첫 서비스 목업 페이지.
- 크리에이터 fixture는 `components/preview/landing-data.ts`에 분리한다. 카테고리 필터, 프로필 미리보기/로컬 팔로우, 콘텐츠·멤버십·메시지 예시 전환 제공.
- 기존 랜딩의 기능/지원 소개 데이터를 재사용한다. 운영 통계처럼 오인할 수 있는 목표 수치와 과거 출시 일정은 새 목업에 표시하지 않는다.
- `/preview/*`는 인증·알림·AntD presentation provider 없이 동작한다. 실제 회원가입/결제/서비스 API를 호출하지 않는다.
- 375/390/430/1280px 가로 넘침 및 이미지 로딩, 필터·팔로우·서비스 전환 브라우저 확인. `npm run check` 65개 테스트 통과.

### 랜딩 목업 V2 — 첨부 원본 기준 (보존 기록)

당시 `/preview/landing`은 사용자 첨부 `Codex 이미지 2026년 9월 12일 오후 05_25_04.png`의 구조를 따른다. 앞선 독자 제안의 카테고리/기능/지원 섹션은 새 랜딩에서 제거했다.

- 구성: 검색·계정 헤더 → 인물 사진 히어로 → 3단계 이용 안내 → 추천 크리에이터 5명 → 다크 CTA.
- `designTokens.landing`: 검정 CTA, 라벤더 아이콘, 보더·반경·배너 색상. 기존 서비스의 API/인증은 변경하지 않음.
- 실제 HTML 문구/버튼/검색/팔로우와 새로 생성한 사진 5장 사용. 원본 화면을 이미지로 붙이지 않음.
- 프로필·로그인·회원가입은 목업 다이얼로그. 입력값은 저장/전송하지 않으며 회원가입 버튼을 실제 기능 완료로 표현하지 않음.
- 1224px에서 섹션 높이 421/255/347/214px 확인(목업 421/251/344/214px). 375/390/430px 가로 넘침 없음, 깨진 이미지 없음. 검색/팔로우/모달 브라우저 검증.
- 이미지 자산과 생성 프롬프트: `docs/landing-image-prompts.md`.

### 현재 — 팬 화면과 크리에이터 스튜디오

`/preview/screens`에 팬·크리에이터·공통 화면 41개 진입점을 모았다. 위 V2 랜딩의 임시 로그인/프로필 다이얼로그는 현재 전용 페이지 링크로 교체되었다. 공통 표시 컴포넌트는 `components/crefans/`, 목업 모델은 `components/preview/`에 분리했다. 신규 컴포넌트는 AntD 없이 동일 토큰과 HTML/CSS를 사용한다. 화면과 계약의 최신 설명은 `docs/preview-pages.md`를 참조한다.

목업 여부는 `/preview` 공통 레이아웃의 최상단 띠배너에만 표시한다. 개별 서비스 컴포넌트는 실제 사용 문구와 주입된 데이터를 표현하며 목업 설명을 별도로 출력하지 않는다. 디자인 시스템 자체는 제원과 상태를 설명하는 카탈로그이므로 해당 설명을 유지한다.

### 모바일 14px 표시 기준 (2026-10-24)

- 사용자가 채택한 팬 서비스·랜딩·디자인 카탈로그의 767px 이하 글자 크기는 최소 14px다. 기존 `typography.body.size` 토큰을 `--cf-mobile-font-min`으로 상속하고, 작은 본문·라벨·버튼·입력 도움말·공용 UI는 `max(기존 크기, 모바일 최소 크기)`를 사용한다. 큰 제목은 유지하며 768px 이상의 팬 화면과 구형 앱에는 이 최소값을 설정하지 않는다.
- 2026-10-28 크리에이터 스튜디오도 같은 방식을 쓴다. 스튜디오 루트가 `--cf-mobile-font-min`을 PC 13px, 767px 이하 14px(`typography.body.size`)로 정의하고, 스튜디오 CSS의 14px 미만 글자와 공용 선택 상자·기간 선택기 필드는 `max(기존 크기, 최소값)`을 따른다. 정책·정산 안내글은 본문 14px·제목 15px, 리포트 항목 칩은 공용 Chip 규격(높이40px·패딩9/17px·14px·선택 시 accentSoft)과 같다.
- 실제 `/service`와 `/preview`는 동일 컴포넌트/CSS를 사용한다. 목업 안내 띠는 제품 UI 밖의 작은 검수 표식이므로 기존 11px를 유지한다. 타이포그래피 카탈로그는 기본 토큰 수치와 현재 모바일 표시 정책을 함께 설명한다.
- 320px 랜딩 CTA는 세로로 배치하고, 모바일 혜택 문구는 아이콘 아래에 놓아 14px에서 읽기 쉽게 조정한다. 멤버십 안내 배경의 음수 여백도 공통 모바일 패딩 경계(767px)에 맞춘다.
- 2026-10-24 사용자 확인으로 운영 기본값으로 채택했다. 이전 운영 이미지는 `crefans-front:membership-identity-20261024`. 적용 범위·전후 글자 크기·화면/배포 검증은 [모바일 14px 증거](./audit/mobile-14px-20261024.json)에 기록한다.

### 공통 프로필 아바타

- `components/ui/Avatar.tsx`에 사진 주소·이름·크기·사진 위치를 주입한다. `components/crefans/ServiceUI.tsx`의 `Avatar`는 기존 `creator` 데이터를 이 공통 컴포넌트에 연결한다.
- 사진이 없거나 로딩에 실패하면 동일한 사람 모양 SVG를 표시한다. 사진 주소가 변경되면 다시 로딩한다. 목업 이름이나 이니셜로 대체하지 않는다.
- 사진과 기본 아이콘은 같은 정원 컨테이너를 사용하며 flex 레이아웃에서도 크기를 유지한다. 반응형 크기 조정은 `--avatar-size-override` 하나로 가로·세로를 함께 변경한다.
- 메시지, 프로필, 댓글, 알림, 구독 목록, 스튜디오의 프로필 사진에 재사용한다. `/design-system`의 **입력·선택 → 서비스 공통 아바타**에서 24~80px 크기와 사진 유무를 확인할 수 있다.

### 현재 브랜드 — 두 조각의 하트

첨부 로고 시안의 **3행 2번째**를 기준으로 비대칭 하트 심볼과 소문자 워드마크를 SVG로 재구성했다. `Brand`는 랜딩·팬·스튜디오·인증·디자인 카탈로그에서 공유하며, 가입 화면처럼 사진 위에 놓일 때는 `inverse`로 심볼과 워드마크 모두 흰색인 단색 로고를 사용한다. `public/brand/`에 기본 로고·반전 로고·심볼이 있고, 글자도 벡터 윤곽이므로 설치된 폰트에 영향을 받지 않는다. 심볼과 워드마크의 높이를 맞춘 로고 비율은 약 5.6:1이며 `--cf-brand-height`로 높이를 조절한다. 팬·스튜디오·미리보기·카탈로그는 루트 `app/icon.svg`의 정사각 심볼 파비콘을 상속한다. `app/favicon.ico`는16/32/48/64px 대체 아이콘, `app/apple-icon.png`는 흰 배경180px 홈 화면 아이콘이다. 문서 제목·OG사이트명은 `lib/seo/site.ts`의 `크레팬스(Crefans)`로 통일하고 페이지별 제목과 비공개 noindex는 유지한다.

| 역할 | 색상 | 토큰 |
| --- | --- | --- |
| 주요 버튼·선택·포커스 | 블루 `#2563EB` | `color.accent` / `service.brand` |
| 보조 강조 | 딥 블루 `#1E40AF` | `color.complementary` |
| 선택 배경 | 라이트 블루 `#EFF6FF` | `color.accentSoft` |
| 제목·본문 | 잉크 네이비 `#202333` | `color.text` |

일반적이고 쉽게 이해할 수 있는 UI를 위해 테마는 블루 계열로 통일한다. `lib/design/tokens.ts`에서 hover·active·focus·보조색·아바타 색상을 함께 관리한다. 랜딩의 색상 이름 토큰은 `landing.accent` / `landing.accentSoft`로 교체했다. 기본 아바타는 블루 계열, 성공·오류 상태는 별도 의미 색상을 사용한다. `/design-system` 첫 화면에서 두 로고와 역할별 색상을 비교할 수 있다. 이전 AntD 화면의 테마는 이 개편 범위에 포함되지 않는다.

### 모바일 갤러리 상세 패널 (2026-10-24)

- `SocialPages.tsx`의 공통 `PostCard`에서 이미지를 열면 사용하는 `PostOverlay`에 적용한다. 서비스/목업/디자인 카탈로그가 같은 표시 계층을 쓴다.
- 767px 이하: 미디어 높이 56%(기본) → 22%(축소) → 0%(상세 전체). 손잡이 드래그 후 가까운 높이에 고정한다. 클릭은 세 단계를 순환하고, 위/아래 방향키와 Home/End도 지원한다. PC에서는 손잡이를 숨기고 기존 좌우 배치를 유지한다.
- 모바일 갤러리 영역 오른쪽 아래 확대·축소 아이콘은 상세 패널을 완전히 숨기고 미디어 높이를 브라우저 표시 영역의 100%로 늘린다. 원본 비율을 유지하며, 축소하면 직전 패널 높이·미디어 위치·작성 중인 댓글을 유지한다. 동영상 노드를 다시 만들지 않는다. 닫고 다시 열면 기본 모드다. PC에서는 이 버튼을 숨긴다.
- 2026-10-29 로컬: 767px 이하 게시물 갤러리는 이미지 자체를 탭해도 같은 전체 보기 모드를 전환한다. 다시 탭하거나 우측 아래 축소 버튼을 누르면 이전 패널 높이로 복원한다. 단일 이미지도 지원하며 스와이프·6px 이상 이동·포인터 취소·다중 터치 후 클릭은 제외한다. 동영상·PC·프로필 사진 전용 뷰어의 클릭 동작은 유지한다. [이미지 탭 검증](./audit/gallery-image-tap-20261029.json), 운영 배포 대기.
- 확대·축소 버튼은 갤러리 영역 안의 오른쪽·아래 10px에 배치하고 확대 시 기기 안전 여백을 반영한다. 상세 전체로 갤러리가 숨겨지면 버튼도 숨긴다. 모바일 갤러리는 `overflow:clip`으로 네이티브 포커스 스크롤을 막고 기존 transform 기반 넘김을 유지한다([MDN overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow), 2026-10-24 확인). 위치·회귀 증거: [갤러리 아이콘 위치](./audit/mobile-gallery-corner-20261024.json).
- 손잡이는 독립된 44px 터치 영역이고 전체 보기에서는 닫기 버튼·상단 안전 여백을 확보한다. 본문/댓글 스크롤과 미디어의 가로 넘김은 분리한다. 포인터 취소·창 크기 변경은 마지막 높이로 복원하며 reduced-motion에서는 높이 전환 애니메이션을 끈다.
- 근거 확인(2026-10-24): [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action), [MDN setPointerCapture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture). 브라우저의 기본 세로 스크롤은 본문에 남기고 사용자 정의 세로 드래그는 손잡이에만 적용했다.
- 검증: [갤러리 패널 검증 기록](./audit/mobile-gallery-sheet-20261024.json), [확대·축소 검증 기록](./audit/mobile-gallery-expand-20261024.json). iPhone 실기 Safari 확인과 운영 배포 여부는 각 기록의 제한 범위를 따른다.

### 긴 이름 마키 (2026-10-24)

`components/ui/MarqueeText.tsx`는 실제 텍스트 폭이 가용 폭을 넘을 때만 양 끝에서 잠시 멈추며 왕복한다. 짧은 값·빈 값은 정지한다. 글자·웹폰트·컨테이너 폭 변경을 다시 측정하며 화면 읽기 도구에는 중복 없는 전체 문자열을 제공한다. `CreatorName`은 같은 마키와 고정 인증 배지를 조합한다. 핸들과 멤버십 이름, 이름을 포함한 알림·확인창에도 재사용하고 아바타·배지·가격·동작 버튼은 고정한다. 카탈로그 ‘서비스 UI → 긴 이름 마키’에서 짧음/빈 값/넘침을 비교한다.

기기의 동작 줄이기 설정 또는 ‘텍스트 움직임 끄기’에서는 전체 문자열을 줄바꿈한다. 설정 페이지는 왼쪽 ‘텍스트 움직임’과 오른쪽 공용 Toggle로 표시한다. 켜짐은 움직임 허용, 꺼짐은 정지·줄바꿈이며 변경 즉시 기기 내 설정을 저장한다. PC 사이드바·랜딩 하단·스튜디오 하단의 기존 버튼과 MarqueeMotionControl의 동일한 상태를 공유한다. 카탈로그에는 스위치와 버튼을 함께 제공한다. hover/키보드 포커스는 추가적인 일시 정지만 제공한다. 근거 확인일 2026-10-24: [W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)는 지속 움직임을 멈출 수단을 요구하고 hover/focus만으로는 충분하지 않다고 설명한다. [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)에 따라 시스템 선호도도 반영했다. 이 구현/검사는 서비스 전체의 접근성 인증을 의미하지 않는다.

`e2e/marquee-text.spec.ts`는 실제 폭·이동 끝점·정지/복원·결제 확인·갤러리·서비스 API 대역을 검수한다. 입력 필드·검색 값·URL/ID·접근성 이름·이미지 대체 텍스트는 원문을 유지하며 마키를 넣지 않는다. 프로필 설정 아이콘은 PC/모바일 모두 16×16px, 설정 문구는 기존 14px 이상을 유지한다. 실행 결과·배포 기준선은 [마키 검증 증거](audit/marquee-names-20261024.json)를 따른다. 설정 스위치의 2026-10-25 로컬 변경·정렬/토글/재진입·키보드 검증은 [설정 스위치 증거](audit/text-motion-switch-20261025.json)를 따른다.


## 공용 UI 운영 반영 (2026-10-25)

`crefans-front:ui-batch-ready-20261025`에 텍스트 움직임 스위치, 멤버십 안내/차단 영역의 상품 사진, 상세 갤러리 진입·댓글쓰기 링크 미노출·닫기36px, 피드 댓글 닫기, 알림 라이브칩 제거, 공통 뒤로가기 및 공유 레이어를 반영했다. 목업과 실서비스는 같은 표시 컴포넌트를 사용한다. 카카오톡 공유는 앱 키가 없어 준비 중이며 복사/기기 공유는 브라우저 지원 여부를 따른다.

공용 ServiceShell 본문은 초기화가 끝날 때까지 inert 상태로 키보드·포인터 입력을 막아 초기 클릭 손실을 방지한다. 초기화 후 기존 화면·입력 동작을 유지한다. 새 게시물 스튜디오 미리보기의 날짜는 한국 시간대로 명시하여 서버/브라우저 시간대 차이의 초기 표시 오류를 방지한다. 선택 배포본535파일 대조와 이미지/운영의 브라우저·단위·화면 검증 및 자동화/실공급자 경계는 [일괄 배포 증거](audit/ui-batch-deployment-20261025.json)를 따른다. 앞선 개별 기록의 로컬·미배포 표시는 당시 상태로 보존한다.


## 콩 재화 플랫 재설계 조사 (2026-10-25, 제안 단계)

사용자가 운영 클레이의 밀집/입체 표현을 거부하고 아기자기한 플랫·성긴 구성을 요청했다. 재화 그림에 대한 단일 공인 업계 표준으로 단정하지 않는다. 공식 디자인 설명·공개 상점 관찰과 프로젝트 권장안을 구분했다. 운영은 여전히 클레이 bean-clay-20261025이며 이 조사만으로 이미지/UI/배포를 변경하지 않았다.

- [Duolingo 공식 디자인팀 설명](https://blog.duolingo.com/shape-language-duolingos-art-style/): 둥근 도형·적은 디테일·분명한 실루엣과 여백을 작은 화면에서도 유지하는 접근을 참고한다. 과거 설계 배경 글이며 현행 유료상품 규칙이 아니다.
- [Roblox 공식 Robux 상점](https://www.roblox.com/upgrades/robux): 렌더 브라우저에서9개 패키지의 동일 재화 심볼+수량/가격 중심 구성을 확인했다. 큰 수량을 많은 개체로 그려야 하는 것은 아니라는 설계 참고다. 지역별 가격/혜택을 크레팬스에 복사하지 않는다.
- [Supercell 공식 상점](https://store.supercell.com/brawlstars): 공개 재화 프로모션까지만 확인, 판매 옵션은 로그인 필요. 플랫 스타일을 업계 공통이라고 주장하는 근거로 쓰지 않는다.
- [팬트리](https://fantrie.com/): 웹 리더는 로그인으로 이동했고 로컬 브라우저는403이었다. 현행 충전 이미지 미확인, 팬트리 디자인을 봤다고 보고하지 않는다.
- [NN/G 아이콘 사용성](https://www.nngroup.com/articles/icon-usability/)·[Google 공식 아이콘 가이드](https://google.github.io/material-design-icons/): 최소 형태·크기별 명료함·텍스트 병행의 일반 UI 원칙 참고. 재화 일러스트 전용 강제규격은 아니다.

권장 제작안: 민트/크림 위주2D플랫, 둥근 실루엣·투명 배경. 질감/광택/실사 주름·홈·촘촘한 겹침을 제거한다.10/30/50은 간격 있는 콩1/2/3개,100/300/500은 닫힌 주머니1개에 콩문양/리본/별로 변화,1000/5000/10000은 선물상자1개에 같은 수준의 간단한 변화. 그릇에서 콩이 쏟아지거나 대량으로 쌓인 표현은 배제한다. 구체적인 색/최대3개/구성은 사용자 취향에 맞춘 제안이며 공식 표준 수치가 아니다. 정확한 상품 수량·가격은 기존 텍스트로 전달한다.

다음 검수: 대표 시안을 실제 모바일80px·PC112px로 비교 후9카드에 적용, 수량/원화·선택 상태·공유 UI/결제 경로를 확인한다. 조사 증거 [bean-flat-research-20261025.json](./audit/bean-flat-research-20261025.json), 브라우저 원본 `.local/bean-flat-research-20261025/`. 이 단계는 제품/실금융 테스트나 배포 완료가 아니다.


2026-10-25 후속 시안: 기본 image_gen으로 [9수량 플랫 비교 보드](./design/bean-flat-sheet-v1.png)를 생성·잔음영 축소 편집해 제시했다. 생성/프롬프트는 [메타데이터](./design/bean-flat-sheet-v1.generation.json), 파일 검증과 미적용 범위는 [증거](./audit/bean-flat-preview-20261025.json). 보드1장이며 개별 투명 에셋·실제80/112px 적용/운영 배포는 아직 수행하지 않았다.


2026-10-25 소프트3D 비교안: 동일 플랫 보드의9수량/성긴개체/닫힌용기/색상을 유지한 [소프트3D 보드](./design/bean-soft3d-sheet-v1.png)를 추가했다. 기본 image_gen style-transfer1회, [프롬프트·원본](./design/bean-soft3d-sheet-v1.generation.json) 및 [검증 증거](./audit/bean-soft3d-preview-20261025.json). 사용자 스타일 선택 전이며 UI/개별 에셋·운영은 미변경.


2026-10-25 사용자 지정6모티프 [소프트3D 비교안](./design/bean-soft3d-six-v1.png): 콩1/2/3개·매듭보따리·종이택배상자·닫힌 나무보물상자. 선물상자와 다른 재질/형태를 구별하고 무더기는 배제했다. [생성 프롬프트](./design/bean-soft3d-six-v1.generation.json), [파일·육안검증](./audit/bean-soft3d-six-20261025.json). 수량별 상품 매핑·개별 투명 에셋·UI/운영은 미적용.


2026-10-25 최신 요청: 닫힌용기 제안을 대체해 [열린용기·꼬치·소쿠리8종 소프트3D 시안](./design/bean-soft3d-open-eight-v1.png)을 제작했다. 상단1/2/3개와 꼬치3개,소쿠리4·보따리3·종이상자4·나무보물상자4개가 보이는 비교안이다. 내용물3~5개·무더기금지 원칙, 실제 충전수량/가격 매핑은 미정. [생성 프롬프트](./design/bean-soft3d-open-eight-v1.generation.json)와 [초기실패/보정·파일검증](./audit/bean-soft3d-open-eight-20261025.json) 보존. UI/운영 미적용.


2026-10-25 개별에셋: [10~10000콩9종 비교](./design/bean-soft3d-series-v2.preview.png)·[종이상자/2꼬치 대안](./design/bean-soft3d-series-v2.alternatives.png), [HTML 원본](./design/bean-soft3d-series-v2.preview.html). 실제 PNG11개는 public/brand/beans/soft3d-v2/에 저장,10/30/50=1/2/3개·100=5꼬치·300=소쿠리·500=비단보따리·1000/5000/10000=나무/은/금상자. 기본 최대5개·대안6개, 용기3~5개. [정확한 생성기록](./design/bean-soft3d-series-v2.generation.json), [검증](./audit/bean-soft3d-series-20261025.json).80/112px·밝고어두운배경 정적갤러리 확인이며 실제공용UI/운영 교체는 미수행.


2026-10-25 최신 [v3 선택본](./design/bean-soft3d-series-v3.preview.png)은1,000콩=종이박스,5,000콩=나무보물상자,10,000콩=금색보물상자다. 은색은 현재 선택에서 제외,이전v2는 과거 증거로 보존한다. 새생성 없이 기존PNG 재사용,현재경로 public/brand/beans/soft3d-v3/. [선택·원본해시](./design/bean-soft3d-series-v3.selection.json),[검증](./audit/bean-soft3d-remap-20261025.json). 공용UI/운영은 여전히 미적용.


2026-10-25 꼬치 수정 후보 [v4부분 비교판](./design/bean-skewer-v4.preview.png):10=5개꼬치2개,30=3개×10,100=10개×10. 사용자명시로해당이미지는실제10개표현허용.50은10개×10이면100이라는수량불일치로확인대기(권장5개×10),아직생성하지않았다. [생성기록](./design/bean-skewer-v4.generation.json),[검증·미완료범위](./audit/bean-skewer-v4-20261025.json). 완전한9종v4나운영적용이아니며현재완전선택본은앞선v3다.


2026-10-25 확정:50콩=5개꼬치×10에사용자동의,새이미지추가후 [완전v4선택9종](./design/bean-soft3d-series-v4.preview.png)을구성했다.10=5개꼬치2개·30=3개×10·50=5개×10·100=10개×10,나머지는300소쿠리/500비단/1000종이/5000나무/10000금색.이전50대기는해소, [선택·개별파일해시](./design/bean-soft3d-series-v4.selection.json),[50생성프롬프트](./design/bean-skewer-v4-fifty.generation.json),[검증](./audit/bean-series-v4-complete-20261025.json).검은배수문자는밝은UI배경용이며실제공용UI/운영은미적용.


2026-10-25 현재 충전 UI: /preview와/service가 `BeanChargePage`를 공유한다.30콩=기존50꼬치,50콩=기존30지퍼백이며 배수텍스트/CSS 제거. 나머지 최신v7구성 유지, 이미지80px모바일/112pxPC.9카드마다 VAT 포함 가격·1콩110원 표시,공용 Radio/선택요약과 실제/목업 주문에 적용. 운영 `bean-vat-20261025`. [모바일](./design/bean-vat.mobile.png),[PC](./design/bean-vat.desktop.png),[배포 검증](./audit/bean-vat-deployment-20261025.json).

2026-10-26 지갑 이력 필터(로컬 반영, 운영 미배포): 기존 `Chip`/`ChipRow` 기간 선택과 `SelectField` 상태·방향 선택을 `BeanHistoryView`에서 재사용한다. 후원 검색은 `CreatorSearch`의 label/placeholder/maxLength 주입을 사용한다. 기본 크리에이터 검색의 문구·디자인은 보존한다. 카탈로그의 지갑 화면/데이터 상태에서 동일한 필터·검색·빈 결과·초기화·결제 중 비활성을 확인할 수 있다. 주문 UUID 본문 대신 공용 `beanOrderNumber`의 생성시각 표시를 사용한다. [개발 검증](./audit/bean-history-filters-20261026.json).

2026-10-26 후속 운영 반영: 위 주문번호·세 이력 필터와 예시 데이터를 frontend/API/worker `bean-history-20261026`로 배포했다. 이전 미배포 표기는 당시 기록이다. 소스해시·주요HTTP·worker·운영 목업4브라우저 조건 통과, DB/금융정책 유지. [배포 검증](./audit/bean-history-deployment-20261026.json).

- 스튜디오 답글: `components/crefans/studio/StudioCommentReply.tsx`를 패턴 카탈로그에서도 재사용. 내 답글/팬 읽기 전용/변경 실패/저장·삭제 중 상태, 빈·변경 없는 수정 제출 비활성화와 삭제 확인을 검수한다(2026-10-28).

- 2026-10-28 터치 입력 예외: 모바일 일반 글자 최소14px 규칙과 별개로 텍스트 입력·textarea·select·편집 가능 영역은 `app/globals.css`에서 최소16px로 유지한다. 입력 포커스의 iPhone 자동 확대를 피하기 위한 규칙이며 PC·버튼·체크박스 크기는 유지한다. 화면 폭이 큰 휴대폰 가로 모드도 포인터 조건으로 적용하며 손가락 확대는 허용한다. 독립 운영 콘솔은 자체 전역 CSS에 같은 기준을 둔다. 검증 범위는 [입력 확대 증거](./audit/iphone-input-zoom-20261028.json) 참고.

### 스튜디오 광고상품 (2026-10-29)

`AdvertisingPage`는 `AdvertisingModel`을 받는 공용 표시 컴포넌트다. 상품 카드·VAT 포함 금액·안내 모달·구매 내역에 기존 Action/Chip/Dialog/BackButton/Toast와 색상 토큰을 재사용한다. 표시부는 직접 API나 PG를 호출하지 않는다. `/design-system`의 서비스 UI > 스튜디오 광고상품에서 일반·판매중지·빈 목록·로딩·실패·구매 비활성 상태를 확인한다. 예시 컨테이너는 목업 구매만 수행하며 실제 서비스는 현재 상품 조회까지 연결, 결제 기능은 미구현이다. [증거](./audit/advertising-20261029.json).

### 미구독 게시물 가격 안내 (2026-10-29)

공용 `PostMembershipNotice`는 판매 중인 적격 멤버십 이름·이미지·월 원화 구독료와 참고 콩 환산액을 함께 표시한다. `lib/crefans/bean-pricing.ts`의 참고 가치는1콩100원이며 실제 충전가110원(VAT포함)과 다르다. 원화 카드 결제·콩 결제 불가를 표시하고 모달에서 환산 기준을 설명한다. 빈 목록·판매 종료·특정 상품 전용에 임의 가격을 만들지 않으며 기존 결제 로직은 유지한다.

### 영상 최적화 상태 (2026-11-02)

공용 `VideoProcessing`을 작성 화면1안·게시물 목록2안·팬 피드1안으로 사용한다. 작성 화면은 카메라·스피너를 정사각 썸네일에 표시하고 상태 문구를 아래에 둔다. 업로드한 로컬 미리보기가 있으면 유지하며 삭제·순서 변경은 기존 동작을 따른다. 목록은 제목 아래 파란 `최적화 중` 칩을 표시하고 게시 여부와 구분한다. 피드·갤러리는 중앙 카메라·스피너와 `영상 최적화 중`, `완료되면 영상을 볼 수 있어요.`를 표시한다. 서버 처리 중에는 미완성 미디어 URL을 요청하지 않으며 완료 시 기존 영상 컨트롤로 전환한다. 진행률·예상 시간은 임의로 표시하지 않는다. 감소된 모션 설정에서는 스피너 회전을 멈춘다.

`/design-system`의 서비스 UI → 영상 최적화 표시에서 처리 중·로컬 미리보기·완료·실패·빈 미디어 상태를 같은 실제 컴포넌트로 확인한다. `e2e/video-processing-preview.spec.ts`, `tests/media-upload.test.cjs`, `tests/media-video.test.cjs`가 표시 전환과 기존 미디어 동작을 검사한다. 이는 프론트 상태 주입 검증이며 실제 운영 파일 변환 작업의 성공을 증명하지 않는다.

### 멤버십 삭제 직접 입력과 수익 안내 (2026-11-02)

- 공통 `components/ui/TypedConfirmDialog.tsx`는 운영 콘솔의 `TypedConfirmDialog`처럼 확인 문구·실행 라벨·요청 콜백·처리 상태·오류를 주입한다. 기존 `Dialog`·`Field`·`DialogActions`를 재사용한다. 입력은 띄어쓰기까지 정확히 일치해야 하며 자동 제출하지 않는다. 재진입/대상 변경 시 초기화, 처리 중 취소·닫기·중복 실행 차단, 실패 시 입력 유지. 디자인 시스템 서비스 예시에서 정상/빈 입력·실패·처리 중을 확인한다.
- 멤버십 삭제는 현재 멤버십 이름을 입력하여 `{deleted:true,confirmation}`으로 보낸다. 서버가 잠금 안에서 현재 이름·소유권·삭제 여부·유효 구독을 다시 검사하며 기존 구독 이력은 보존한다. 이 확인은 실수 방지이며 인증·권한 검사를 대신하지 않는다.
- 월 구독료 도움말은 `나의 공제율: N% · 예상 수익: N원 / 결제 1건`으로 표시한다. 원천징수 설명은 이 입력 도움말에 표시하지 않는다. `/studio/finance.creatorTerms.platformFeeBps`의 실제 적용 공제율로 `금액 − floor(금액 × bps / 10000)`을 계산한다. 개별 조건이 없으면 서버가 현재 DB 기본값을 반환하며 미조회/미설정이면 임의 20% 대신 `확인 필요`로 표시한다. 목업은 명시적으로 예시 조건을 주입한다. 기존 결제/구독의 공제율 스냅샷을 재계산하지 않는다.

### 오픈 기념 배지 직접 받기 (2026-11-03, 미배포)
기존 이벤트 에셋/타이포와 공통48px primary 버튼을 유지한다. `FoundingBadgeClaim`은 로그인 필요·확인 중·수령 가능·수령 중·완료·대상 아님·중지·오류를 실제 모델로 표시한다. 완료 시 내 프로필 링크와 공통 Toggle의 ‘프로필에 배지 표시’를 제공한다. 서버 성공 전에 완료/표시 설정을 낙관적으로 바꾸지 않고, 요청 중 이중 클릭·당겨 새로고침을 차단한다. 조회/저장 오류는 alert, 상태 설명은 status다.
실서비스는 수령+공개 선택일 때만 기존 `CreatorName` 배지를 표시한다. 목업 기본 팬은 이 이벤트에서 받아야 자신의 배지가 나타나며, 다른 목업 인물의 기존 예시 배지는 유지한다. 목업 수령/표시 상태는 Provider 내 페이지 이동 동안 유지되고 전체 새로고침 시 초기화된다. 카탈로그 ‘이벤트 안내’에서 배지 받기 상태·완료·스위치를 확인할 수 있다.

2026-11-03 이벤트 공개 수령: 콩/배지의 공용 참여안내는 전체회원·계정당1회이며 과거 확정테스터 안내를 공유하지 않는다. 프로모션 수령 완료는 서버 expiresAt을 한국시간으로 표시하고 미사용 잔액 소멸을 안내한다. 배지에는30일 제한이 없다. 네이버페이 선정 정책은 유지하며, 광고상품은 별도 기간2배 상품 안내를 따른다.

### 오픈 기념 이벤트 PC 간격 (2026-11-03)
- 4종의 공통 명칭은 “크레팬스 오픈 기념 이벤트”, 배지 표시명은 “오픈 기념 한정판 배지”로 통일한다. 기존 URL·수령 키·지급 조건은 유지한다.
- 공통 제목은 clamp(28px,6.4cqw,50px), 보조문구는 clamp(15px,3.2cqw,24px). 헤더는 grid gap16px, 로고 뒤 추가8px. 카드 아래 일정은 clamp(14px,2.4cqw,22px), 수령 제목 아래12px·버튼 위20px, 유의사항 위32px·소제목 아래12px를 확보한다. 이벤트 내부 선택자 우선순위로 서비스 공통 문단 초기화에 의해 여백이 사라지지 않게 한다.
## 프로필 미디어 타일 (2026-11-02)

내 프로필·크리에이터 프로필의 미디어 탭은 `components/crefans/PostMediaTile.tsx`를 공용으로 쓴다. 사진/동영상 첫 썸네일과 `MediaSummary`의 우측 하단 유형별 아이콘·개수 배지를 표시한다. 3열 정사각형과 기존 프로필 좌우 여백을 유지하며 작은 타일에서는 배지 간격과 내부 여백만 줄인다. 텍스트 전용 게시물은 제외하고 잠금·영상 최적화·미리보기 실패 상태를 구분한다. 디자인 카탈로그의 `ProfileMediaCatalog`에서 이 상태를 전환할 수 있다.

2026-11-03 광고 이벤트: 일반1/3/7/30일과 별도2/6/14/60일 상품을 공용 목록/안내창에 함께 표시한다. 선택 비교가격은 취소선 기준가·50% 할인·실결제금액·VAT 포함 및 동일기간 산정 근거를 함께 표시한다. 광고 상세는 선정3명/30일이용권 문구 대신 새 상품 방식과 구매준비 상태를 설명한다. PC/모바일/320px 및 일반·판매중지·빈값·오류·로딩·구매비활성 검증은 `playwright.advertising.config.ts`.


2026-11-03 광고상품 목록: 아이콘·상품명/총 노출기간은 왼쪽, 비교가격 취소선·판매가격·VAT 포함은 오른쪽에 표시한다. 기간 2배 상품은 `주목할 크리에이터(n일+n일)`로 표시하며, 부제와 목록의 비교기준 설명은 생략한다. 비교기준은 구매 안내 모달에서 확인한다. 2026-11-04 별도 `상품 구매` 버튼을 없애고 상품행 오른쪽에 꺾쇠를 넣었다. 상품행 전체를 누르거나 키보드로 선택하면 안내 모달이 열린다. 판매 중지는 행을 비활성화하고 문구를 표시하며 실제 서비스 결제 비활성 상태는 유지한다.

광고상품에서 유효한 비교가격과 비교근거가 있는 할인 상품은 상품명 앞에 빨간 `특가`, 취소선 비교금액 오른쪽에 정수 내림 할인율을 표시한다. 일반 상품에는 두 표시를 붙이지 않는다.

광고상품은 검색 페이지의 22px 아이콘과 섹션 제목 구조를 사용하되 제목을 18px/600으로 표시하고 `특가`와 `기본 상품`으로 구성한다. 특가는 기존 비교가격·근거 검증을 통과한 할인 상품이며 없으면 섹션을 숨긴다. 기본 상품에는 특가를 제외한 나머지 상품만 원래 순서로 표시하며, 없으면 섹션을 숨긴다. 두 섹션에 상품을 중복 표시하지 않는다. 섹션은 h2, 개별 상품은 h3를 사용한다.

스튜디오 헤더는 `팬 화면` 테두리 버튼형 링크로 팬 피드에 연결하고, 오른쪽 아바타는 `마이페이지로 이동` 이름의 링크로 내 프로필에 연결한다. 모바일320px에서도 한 줄 배치와 터치영역을 유지한다.

광고 구매내역은 결제와 사용을 분리한다. 사용전은 파란 배지/우측 사용버튼, 사용중은 성공색 배지/시작·종료시각, 완료는 회색 배지. 좌측 정보/우측 버튼의 구분선 목록으로 표시한다. 사용 버튼은 공용 Dialog로 기간을 안내한 뒤 확정하며 광고 사용중 다른 주문은 종료까지 비활성이다. 실제 결제 준비중 상태는 유지한다.

### 구독 다시 이용하기 (2026-11-05)

`SubscriptionResumeDialog`는 공용 Dialog·Checkbox·DialogActions·Action과 기존 요약 행을 사용한다. 금액/날짜/상품명은 props로 주입하고 기본 미동의, 처리 중 비활성, 서버 오류를 표현한다. `SubscriptionResumeCatalog`에서 일반·카드 없음·처리 중·긴 상품명 상태를 확인하며 서비스/목업은 `SubscriptionsPage`에서 같은 컴포넌트를 사용한다. 즉시 결제하지 않으며 남은 유료 기간이 끝나는 다음 결제일부터 자동 갱신한다.

### 카드 등록 완료 1안 (2026-11-05)

`BillingRegistrationResultPage`의 billing/success만 회원가입 완료와 같은 88px 파란 체크·중앙 정렬·큰 복귀 CTA로 표시한다. `signup-complete.module.css`의 체크 스타일을 재사용하고 제목 간격 28px, 복귀 버튼 최소 높이52px를 적용한다. 이전 화면 복귀는 props의 returnPath로 이동하고 결제에서 진입한 경우 결제수단 관리 보조 링크도 표시한다. 관리 화면으로 복귀할 때는 동일 목적지 링크를 중복 표시하지 않는다. `BillingResultCatalog`에서 완료(결제/카드 관리)·확인 중·오류·취소 상태를 공통 컴포넌트로 확인한다. `/preview/billing/success`도 같은 표시 UI를 사용한다.

### 프로필 이름과 배경 간격 (2026-11-06)

공용 `ProfileHeader`는 마이페이지·다른 사람의 프로필·목업·디자인 시스템에서 같은 배치를 사용한다. 아바타는 배경 하단에30px 겹치고, 이름·핸들 전용 `identityDetails`는46px 상단 패딩으로 이름 시작점을 배경 아래16px에 둔다. 제목 margin 초기화에 간격이 사라지지 않도록 여백은 텍스트 컨테이너가 맡으며, 아바타와 이름은 상단 정렬한다.


### 멤버십 가입 완료 (2026-11-06)
- `MembershipCompletePage`는 카드 등록 완료의 중앙 정렬·제목 간격·전체 너비 버튼과 회원가입 완료의 88px 파란 체크를 재사용한다. 상품 정보가 있는 결제 완료 화면은 상품명·VAT 포함 금액·이용 방식·혜택을 안내 아래에 표시한다.
- 서버 주문이 `paid`인 결제 화면과 한 달 결제 결과가 `success`인 경우에만 표시한다. 처리 중·실패·취소의 확인/재시도 동작은 유지한다. 주요 링크는 ‘내 구독 확인’이다.
- `/design-system`의 서비스 UI → 멤버십 결제 상태에서 일반/한 달 가입 완료를 확인할 수 있다. `/preview/checkout?state=paid`와 `?state=paid-one-time`은 실제 결제 없는 예시다.
- 검증: `e2e/membership-complete.spec.ts`의 PC·iPhone WebKit·320px 화면, API 대역 성공/미확정 상태 및 링크 검증. 실제 PG 결제 검증으로 확대하지 않는다.

### 프로필 멤버십 사진 (2026-11-07)

- 공용 `MembershipPlanCard`의 compact 카드에는 등록한 `plan.image`를 36px 원형으로 표시한다. 사진이 없거나 로딩에 실패하면 공통 `OptionalImage`가 생략하며 이름·월 가격·레벨·기존 가입/관리 동작은 유지한다. 이름과 가격은 왼쪽 두 줄, 레벨과 최소44px 버튼은 오른쪽에 배치한다. 내 프로필과 타인 프로필·목업에서 같은 컴포넌트를 사용한다.
- 입력·선택 카탈로그의 이미지 업로드 영역에서 큰 선택 카드와 작은 프로필 카드가 같은 사진을 공유한다. 사진 변경/제거·비활성·가입 중·긴 이름과 관리 버튼 상태를 확인할 수 있다.

### 고객센터 AI 가이드 (2026-11-08)
- 가이드 사이트의 AI 가이드(crefans_guide `AdvisorChat.astro`)를 서비스 공용 [AdvisorChat](../components/crefans/AdvisorChat.tsx)으로 옮겼다. 고객센터에서만 오른쪽 아래 떠 있는 버튼(`AdvisorLauncher`)으로 열고, PC는 420×680 창, 모바일(767px 이하)은 전체 화면이다. 버튼은 모바일 하단 내비 위(76px+안전영역)에 둔다.
- 답변은 굵게(`**`)와 표만 해석해 React 요소로 그리고, 나머지는 글자 그대로 둔다(HTML 삽입 없음). 규칙은 [lib/crefans/advisor.ts](../lib/crefans/advisor.ts), 질문은 accountActions.askAdvisor 콜백으로만 보낸다(실서비스 [lib/api/advisor.ts](../lib/api/advisor.ts), 목업 [advisor-fixtures](../components/preview/service/advisor-fixtures.ts)). 가이드의 '이어서 물어보기'는 가이드 색인이 필요해 넣지 않았다.
- 글꼴은 가이드와 같이 Apple SD Gothic Neo 우선(어드바이저만). 카탈로그 [AdvisorChatCatalog](../components/design-system/AdvisorChatCatalog.tsx): 답변·관련 없음·오류(다시 시도)·하루 한도. 단위 검사 [tests/support-advisor.test.cjs](../tests/support-advisor.test.cjs).

### 스튜디오 AI 사진 편집 (2026-11-08)
- 사용자 결정: 시안 A(모달 편집기) + 의상 교체는 시안 C의 영역 칠하기, 크리에이터 무료·하루 10회·한 번에 1장. 시안 원본은 로컬 `.local/imagegen-drafts/`(저장소 밖 기록).
- [AiPhotoDialog](../components/crefans/studio/AiPhotoDialog.tsx)는 공용 Dialog(`persistent`, `fullscreenOnMobile`)의 컴팩트 편집/결과 두 단계에 원본 고르기, 옷·메이크업·표정·포즈·배경·구도·렌즈·신체 보정 아이콘 탭, 커스텀 프롬프트 직접 입력(프리셋 포함 총2000자), 기본 실사 설정(선택 UI 미노출), 본인·동의 확인, 남은 횟수, 결과 1장 선택를 둔다. 옷은 [AiPhotoMask](../components/crefans/studio/AiPhotoMask.tsx)로 칠한 곳만 투명한 원본 크기 마스크 PNG를 만든다. 규칙은 [lib/crefans/ai-photo.ts](../lib/crefans/ai-photo.ts).
- 작성 화면 버튼은 `model.actions.aiEditPhoto`가 있을 때만 보인다. 실제 서비스는 서버의 허용 크리에이터 조회 결과가 `allowed`일 때 생성 API를 주입한다. 목업 대역은 [ai-photo-fixtures](../components/preview/studio/ai-photo-fixtures.ts), 카탈로그는 [AiPhotoCatalog](../components/design-system/AiPhotoCatalog.tsx)(정상·사진 없음·실패·안전 차단·한도 소진). 결과 썸네일에는 'AI 생성' 표시(MediaUpload `aiGenerated`).
- 검사: [tests/studio-ai-photo.test.cjs](../tests/studio-ai-photo.test.cjs). 팬 화면 게시물의 'AI 생성' 표시와 서버 저장은 서버 연결 때 추가한다.
- 2026-11-08 실제 연결: 실제 서비스 스튜디오는 `/studio/ai-photo/quota`가 allowed(운영 콘솔 허용 목록)일 때만 `aiEditPhoto`·`aiPhotoQuota`를 주입하고, 생성은 `/studio/ai-photo/edit`(multipart, 마스크 PNG)로 보낸다. 게시물 미디어의 `aiGenerated`는 팬 화면 게시물(PostGallery: 해당 사진 왼쪽 위 'AI 생성'), 프로필 미디어 타일, 작성 화면 팬 미리보기에 표시한다.

- 2026-11-08 선택한 1안 폴리싱: 파란색 선택 탭·기본 실사 설정(선택 UI 미노출), 208px 원본, 공용 TextAreaField/Checkbox/Action, 접힌 이용 안내. 생성 중/완료는 결과 화면으로 전환하고 결과 1장을 확인하며 설정 수정 시 입력을 유지한다. 모바일 전체 화면·PC 최대640px에서 본문만 스크롤하고 만들기 버튼만 고정한다. 결과 확대/원본 확대·선택·경과 시간·한도·마스크를 유지한다. 바깥 클릭은 닫지 않는다. 카탈로그 정상/빈 사진/오류/안전 차단/한도 소진에도 같은 컴포넌트를 사용한다.


### AI 사진 편집 단일 생성·본문 스크롤 (2026-11-13 개정)

- 표시 정리: 무료·한 번에1장 문구와 사진느낌 선택3버튼은 미노출, 일반 편집 요청 style은 photo이며 코스어 의상 모드만 기존 cosplay 계약을 사용한다. 남은횟수는 유지하고 AI 생성 표시 및 이용 안내 라벨은 본문 왼쪽에 정렬한다.

- 사용자 후속 수정: 공용 `AiPhotoDialog`의 만들기 버튼만 하단 고정한다. 원본·카테고리·예시·직접 입력·동의·이용 안내·남은 횟수는 하나의 본문 스크롤에 둔다. 결과의 다시 만들기/게시물 추가도 본문 흐름이다. 한 번에1장을 생성하며 서버 공급사 요청도 n=1이다. 모바일 입력을 자동으로 포커스하지 않는다.
- `lib/crefans/ai-photo-presets.ts`의 옷12·메이크업12·표정13·포즈24·배경13·구도6·렌즈6·신체6 자연어 문구를 사진 카드로3개씩 순환하며, 배경 첫 페이지에 서코 실내를 둔다(총92개). “다른 예시 보기”는 AI/API를 호출하지 않으며 작성 중 문구를 유지한다. 예시는 선택 상태로만 관리하고 재클릭하면 해당 항목을 해제한다. 커스텀 입력은 별도로 유지하며 프리셋 문구와 내부에서 합성한다. 생성은 명시적인 생성 버튼에서만 수행한다.
- 서버 종류에도 makeup/expression을 추가하며 얼굴 구조·정체성 보존 지시를 유지한다. 기존 허용 목록·마스크·동의·한도·모더레이션·실패 시 결과 보존은 그대로다. 서버와 프론트를 함께 반영해야 새 두 분류가 동작한다.
- 근거 확인2026-11-13: [W3C APG 모달](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [탭 패턴](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). 공용 Dialog의 포커스 격리/복귀와 탭의 좌우/Home/End 키 이동을 유지한다. 시안은 구현의 접근성 전체 검증을 대신하지 않는다.


### 댓글·답글 좋아요 (2026-11-13)

- 공용 `CommentRow`의 시간/답글 메타 영역에 `CommentLikeButton`(하트+숫자)을 둔다. 피드 인라인·게시물 상세·펼친 답글에 같은 액션을 주입한다. 삭제 자리표시에는 표시하지 않고 readOnly에서는 비활성이다.
- 클릭 후 서버 성공 응답의 liked/likes로만 갱신한다. 처리 중 중복 클릭 차단, 실패 시 기존 하트/개수 보존 및 인라인 오류, aria-pressed·접근성 이름·키보드 포커스 표시를 제공한다. 게시물 전체 좋아요와 상태/개수를 섞지 않는다.
- 실제 서비스는 PUT /posts/:id/comments/:commentId/like에 enabled:boolean을 보내며 계정 세대가 바뀐 응답을 반영하지 않는다. 비로그인 동작은 기존 로그인 필요 모달을 사용한다. 목업은 같은 카테고리의 댓글/답글에 로컬 멱등 변경을 주입한다. 새 알림 기능은 포함하지 않는다.
- 근거 확인2026-11-13: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html — 서버에서 매 요청마다 게시물/댓글 접근을 검사하고 반응 회원 ID는 반환하지 않는다. 관련 검사: tests/comment-likes.test.cjs, tests/crefans-social.test.cjs의 comment likes 시나리오, 서버 tests/platform-comment-social.test.cjs.


### 나를 코스어로 만들기·의상 옷장 (2026-11-13)

- 공용 AiPhotoDialog의 진입 버튼은 옷 탭과 의상 옷장을 연다. 공용 SelectField의 보기 형식에서 카드(기본2열)·목록·의상 크게(캐러셀)·모아 보기(3열)·입력 우선(입력창을 옷장 앞으로)을 선택한다. 같은 편집창에서 보기 전환·설정 복귀 시 형식·문구·동의·칠한 영역이 유지되며, 새로고침 후 영구 저장은 하지 않는다. 공용 [AiPhotoWardrobe](../components/crefans/studio/AiPhotoWardrobe.tsx)가7분류32종을 공유한다. 의상 선택은 체크 상태를 바꾸며 재클릭/캐러셀 선택 해제로 취소한다. 탭·보기 전환으로 선택과 커스텀 입력을 유지한다. 같은 진입 버튼 또는 옷 직접 편집으로 일반 옷 편집에 돌아간다. 원본/보기 선택/옷장/입력/동의/횟수는 본문 스크롤, 만들기 버튼만 하단 고정이다.
- 캐러셀은 이전·다음으로 순환 탐색하며 탐색만으로 작성 문구를 바꾸지 않는다. ‘이 의상 선택’ 또는 썸네일 선택으로 적용한다. 자동 재생 없이 명명된 버튼과 현재 의상/순번의 polite 안내를 제공한다. 근거: [W3C WAI 캐러셀 제어](https://www.w3.org/WAI/tutorials/carousels/controls/)·[기능](https://www.w3.org/WAI/tutorials/carousels/functionality/), 확인2026-11-13. 적용 판단: 사용자 수동 탐색과 선택을 분리하며 스와이프만으로 조작을 강제하지 않는다.
- 보기 형식 선택은 의상 제목 오른쪽100px 무테 메뉴다. 현재 형식과 꺾쇠만 표시하고 공용 SelectField의 hideLabel로 접근성 이름은 유지한다. 별도 행/입력창처럼 강조하지 않는다. 일반 옷 편집 복귀는 의상 목록 아래 제공한다. 마스크 도구는 붓 아이콘·크기가 다른 점3개·되돌리기·지우개를 한 줄로 표시하며 선택상태·disabled·aria-label/title을 보존한다. 기존 공용 Icon 선형 자산을 확장하며 마스크 좌표/붓 비율/생성 동작은 바꾸지 않는다.
- 일반 분류의 [의상 목록](../lib/crefans/ai-photo-costumes.ts): 리본 메이드, 세일러 코스튬, 고딕 오프숄더, 판타지 마법사, 사이버 슈트, 아이돌 무대복, 치어 코스튬, 비치 투피스. 크롭톱·오프숄더·짧은 하의·일반 투피스 수영복 선택을 포함한다. 썸네일은 의상 스타일 예시이며 이미지 자체를 생성 공급사에 보내거나 정확 복제를 보장하지 않는다. 현재 자산은 `public/brand/ai-photo/costumes/*-v2.webp`이며 가발·장식·소품·신발이 보이는 전신 마네킹이다. 코디 명세와 생성 문구는 카탈로그에서 함께 관리한다. 생성 프롬프트는 `.local/cosplay-complete-look-20261113/prompts.json`이다.
- 의상 카테고리: 일반8종, 니케/오버워치/디아블로/진격의거인/귀멸의칼날/주술회전 각4종. 제목 아래 작은 공용 SelectField로 작품을 고르고 기본/게임/애니메이션 구분과 개수를 표시한다. 분류 전환만으로 문구·동의·마스크·보기형식을 초기화하거나 생성하지 않는다. 카드 선택만 요청을 적용하며 undo를 유지한다. 캐러셀은 현재 작품 안에서만 순환하고 작품을 바꾸면 첫 의상 또는 그 작품의 선택 의상을 보여준다. [카탈로그](../lib/crefans/ai-photo-costumes.ts)가 단일 원본이다.
- 코디32종은 내장 image_gen으로 각각 생성한512px WebP다. 가발·머리장식·소품·신발을 착용한 얼굴 없는 전신 마네킹 시각화이며 공식 이미지 복사나 공식 제휴로 안내하지 않는다. 생성 프롬프트·원본 경로·SHA/해상도/육안검토는 `.local/cosplay-categories-20261113/` 증거를 따른다. 기존 마스크 프롬프트로 얼굴·나이·체형·피부색·배경 유지 요청을 명시한다. 썸네일은 공급사에 참조로 전달되지 않는다.
- 공식 자료는 위 작업일 PROGRESS의 후보조사 링크를 확인했다. [Blizzard Fan Art Program 제출약관](https://www.blizzard.com/en-us/legal/a6def1da-48b1-41ba-8e8c-8b849efa1f24/terms-and-conditions-of-fan-art-submissions-to-blizzard-entertainment)과 [영상 정책](https://www.blizzard.com/en-gb/legal/2068564f-f427-4c1c-8664-c107c90b34d5/blizzard-video-policy)은 해당 프로그램/영상의 조건이므로 상용AI의상 서비스의 포괄 허락으로 적용하지 않는다(확인2026-11-13). 이번 생성·검증은 권리허락 취득을 증명하지 않는다.
- 코스어 옷 모드만 기존 API `kind=outfit, style=cosplay`를 사용한다. 옷 영역 칠하기는 유지하되 cosplay는 원본+분홍 영역 가이드로 전달하여 명시된 가발·헤어·소품·신발도 변경할 수 있다. 일반 photo 의상 교체는 기존 hard mask를 유지한다. 원본 구도 안에서 보이는 항목만 적용하고 얼굴·미요청부분 보존을 지시한다. 본인/동의·하루 한도·1장·기존 결과 보존과 안전 검사는 유지한다. 다른 카테고리와 일반 옷 편집은 photo다. 기존 사진느낌 선택3버튼을 다시 노출하지 않는다.
- 사용자 정책: 성인용 노출 있는 비성적 의상을 선택할 수 있도록 준비한다. 기존 UI의 노출 일괄 금지 문구는 나체·성적인 합성 금지로 정확하게 정리했다. 공급사 입력/출력 Moderation이나 고정 안전지시는 변경하지 않았다. 공식 [Moderation 분류](https://developers.openai.com/api/docs/guides/moderation)는 sexual을 성적 흥분 목적 콘텐츠로 구분하며, 공급사 판정은 요청마다 수행된다. [시행 중 이용정책(2025-10-29)](https://openai.com/policies/usage-policies/revisions/2025-10-29/)도 확인했다(확인일2026-11-13; 현재 대표 URL의2026-11-20본은 미래 시행이라 현행으로 적용하지 않음). 노출 여부만으로 공급사 통과를 보장하지 않는다.
- 확인 범위: 단위/브라우저 검사는 UI와 요청 연결 및 목업 결과이며 실제 공급사 의상 품질·얼굴 보존을 입증하지 않는다. [검사](../tests/studio-ai-photo.test.cjs).

- 2026-11-13: 생성 인물 원본 유지/여성/남성은 실제 성별 표현 변경 요청이며 내부 합성 요청에 반영한다. 신체 보정은 가슴·힙·키 비율 각각5단계, 기존 요청을 중복하지 않고 교체한다. 렌즈는 캐논 RF6종 모델/초점거리/조리개를 명시한 AI 촬영 느낌이며 실제 광학 성능을 보장하지 않는다. 결과별 이미지 편집은 해당 결과를 다음 소스로 삼고 원본·기존 소스를 보존한다. 작품 분류 셀렉트는 공식 사이트에서 확인한 로고를 contain으로 왼쪽 표시한다.

- 2026-11-13 프리셋 선택 카드92개는 aiPhotoPresetTitle의 짧은 제목 하나만 표시하고, 장문 hover/접근성 이름을 쓰지 않는다. 선택은 기존 자연어 요청을 내부에서 합성하며, 상세 누적 문구는 화면에 표시하지 않는다. 의상32종의 카드/목록/캐러셀/모아보기/입력우선도 이름만 표시하며 색/스타일 부가 설명은 생략한다.

- 2026-11-13 누적 프롬프트 입력란/적용취소 버튼은 없고 커스텀 프롬프트만 노출한다. 프리셋·신체축·성별·직접 입력은 분리되어 취소가 사용자 입력을 삭제하지 않는다. 생성 시 활성 프리셋+성별+직접 입력 순서로 합성하고 활성 항목만 API에 보낸다. 커스텀 요청 범위는 마지막으로 입력한 탭이며, 탭 탐색만으로 범위를 바꾸지 않는다. 명시적 옷 요청이 남아 있으면 마스크를 요구하고, 해제한 옷 프리셋만으로는 요구하지 않는다.

- 2026-11-13 표정 사진 프리셋은 생성 인물 여성/남성 선택에 맞춰13종 전부 해당 모델 예시로 바뀐다. 원본 유지는 기존 혼합 예시를 사용하며 원본 사진에서 성별을 추론하지 않는다. 사진 URL만 바뀌므로 표정 선택·제목·실제 요청·커스텀 입력은 유지한다.

- 2026-11-13 표정 탭 첫 진입의 기본 선택·첫 카드는 무표정이다. 여성/남성 무표정 사진을 제공하고 기존12표정의 이미지 번호는 유지한다. 다른 표정 선택 시 앞선 표정을 대체하고, 재클릭 해제 후 탭을 다시 열어도 자동 재선택하지 않는다. 새 초안·결과 이어편집 시 첫 진입 기본을 다시 적용한다.
