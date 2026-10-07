# PROGRESS: crefans_front

다른 에이전트가 이 파일만 읽고 이어받을 수 있도록 유지한다. 규약은 `AGENTS.md`.

## 현재 상태 (2026-10-07) — 실제 API 바인딩

- `/preview/*` 팬/스튜디오 목업·기존 링크는 유지. 신규 `/service/*`는 동일한 표시 컴포넌트를 실제 `/api/v1` 데이터 모델로 렌더한다. 기존 앱은 이번 바인딩 대상에서 제외.
- `components/service`, `features/service`, `lib/api/platform.ts` + 동일 출처 스트리밍 proxy. fixture import 없음. 브라우저 쿠키 세션·401 회전/재요청·탭 간 Web Locks, 로그인/이메일 가입 코드/서버 PASS proof 연결.
- 팬 feed/explore/profile/post/댓글 페이지·2뎁스 조회/메시지/알림/저장·좋아요/구독·결제 내역/결제수단/설정·문의, 스튜디오 onboarding/content/media/memberships/subscribers/community/reports/finance/계좌/PIN/출금 바인딩. 외부 미설정은 API 오류로 표시하며 가짜 성공/데이터를 넣지 않는다.
- 시작: `http://127.0.0.1:3010/service/feed`, `/service/login`, `/service/signup`, `/service/studio`. 로그인 전 보호 화면은 로그인 안내. 실제 개발 DB는 비어 있으므로 목업 인물/게시물이 나타나지 않는 것이 정상.
- front dev 3010은 하나만 실행. production build는 임시 checkout 복사본에서 수행(.next 충돌 방지). backend API3001 + 격리 MySQL3307 + worker. 운영 DB/외부 발송/실결제/은행송금 미실행.
- 구조/경로/모델 표: `docs/service-api-binding.md`; backend `docs/platform-implementation.md`, `docs/platform-api.md`, `docs/provider-contracts.md`, `infra/platform/README.md`. 양쪽 AGENTS에 재개 규칙 추가.
- 검증: layer/type/test267개, production Next build(외부 계정 없이) 통과. 실제 explore 빈 상태와 기존 `/preview/post/morning` 유지 확인. HTTP 프론트 proxy 경유 검증은 서버 구현 문서 참조.
- 남은 운영 입력: SMTP/Toss 계정 및 정책, PASS/은행 vendor SDK bridge, 문서/카테고리·관리자 등록/기존 데이터 이관, Docker/TLS·복구/부하/공급사 테스트. 신규 관리자 UI와 월별 세무 증빙은 현재 목업 바인딩 범위 밖.

## 이전 상태 (2026-09-13)

- 브랜치 `feat/ui-redesign`에서 디자인 전면 개편 진행 중. 마지막 커밋 `6e132a6`(랜딩 개편·디자인 카탈로그 기준 보존) 이후 디자인 시스템·레이아웃·프로바이더 등 미커밋 변경 다수.
- `/preview/*` 아래의 팬·스튜디오·공통 화면이 목업 데이터로 동작한다. 상세 경로와 현재 기능은 `docs/preview-pages.md`를 참조한다. 운영 API 미연결. AntD는 기존 서비스 페이지가 아직 사용하므로 유지.
- 백엔드(crefans_server)는 `feat/local-member-auth`에서 Cognito 제거·자체 인증·단일 원서버 배포를 준비 중. 프론트 인증 화면(비밀번호 찾기 등)은 서버 계약 확정 후 연결한다.

## 핵심 결정

- 회원가입 이메일 인증: 코드 유효 10분, 재전송 쿨다운 3분(2026-09-13 확정). 쿨다운 중에도 기존 코드 입력은 허용.

- 팬 / 크리에이터 스튜디오 / 공통 3영역 정보구조를 기준으로 화면을 구성한다. 원문은 `docs/service-hierarchy.md`, URL·탭·모달로 옮긴 결과와 보완 사항은 `docs/preview-pages.md`.
- 표시 컴포넌트(`components/crefans`)는 props 주입만 받고, 목업은 `components/preview`에서 주입한다(AGENTS.md "신규 UI의 데이터 주입 규칙").
- 목업 안내는 `/preview` 공통 레이아웃 최상단의 `목업 페이지입니다` 배너 한 개로 통일한다. 산발적인 목업 안내와 검수용 링크는 제거하고 실제 사용자 동선을 유지한다.
- 멤버십 활성화는 단일 플래그로 공개 노출과 신규 가입을 함께 제어한다. 기존 구독자의 조건·권한은 보존하며 유효 구독자가 없는 상품만 판매 목록에서 삭제한다. 멤버십 미리보기는 요청 취소로 추가하지 않는다. 게시물 미리보기는 별개로 실제 팬 `PostDetailPage`를 재사용한다.
- 출금 금액 프리셋은 더하기 전용이며 전액·초기화를 유지한다. 출금 후 잔액을 같은 화면에 표시한다. 설정한 체험용 6자리 PIN 확인 후 출금 접수 상태를 보여준다.
- 운영 후속 설계는 `docs/membership-versioning.md`, `docs/withdrawal-security-pass.md`, `docs/media-lifecycle.md`를 반드시 확인한다. 기존 서버의 불변 멤버십 버전 보호가 완성된 것은 아니다. PASS는 가입/간편비밀번호 설정·재설정에 추가할 예정이며, 미디어 고아 파일 정리는 매일 19:00 Asia/Seoul 배치를 **문서로만** 정리했다.

## 다음 할 일

- 운영체제 파일 선택 취소를 일반 브라우저에서 수동 확인한다. 이벤트 전파 회귀 검사는 통과했으나 자동화 도구가 해당 취소 조작을 지원하지 않는다. 병행 작업의 공통 `DateRangePicker` 추가 검증은 해당 작업 기록을 따른다.
- 사용자가 커밋을 요청하면 미커밋 변경을 정리하고 커밋(AGENTS.md 커밋 규칙 준수).
- 팬 화면부터 실제 모델/API 연결(순서: `docs/ui-migration-plan.md`).
- 서버 로컬 인증 API(`/auth/forgot-password`, `/auth/reset-password`) 확정 시 인증 화면 연결.

## 미해결 질문

- 계층도의 "신고하기", "문의하기·내 문의 내역"이 preview에 어느 수준까지 구현됐는지 대조 필요.
- 멤버십 비활성 시 팬 화면 잠금 안내 문구 확정 필요(후보: "크리에이터가 활성화한 멤버십만 노출됩니다.").

## 작업 로그

- 2026-09-13 (2차): 스튜디오 리포트 조회 기간을 셀렉트 대신 달력 기간 선택기 `components/ui/DateRangePicker.tsx`로 교체(월요일 시작 2개월 달력, 연속 범위 채움, 인접 월 옅은 날짜도 채움, 프리셋 11종, 초기화·취소·적용). 리포트 모델은 `dateRange/defaultRange/minDate/maxDate/applyDateRange`만 노출(기간 셀렉트 API 제거). 기록 범위 안내문과 툴바 구분선 제거. 게시물 목록을 공통 `DataTable`로 전환, 목록 미리보기는 다이얼로그. 게시물 편집은 이미지 URL 입력 대신 `ImageUpload`(드래그 앤 드롭 존으로 개선), 우측 sticky 모바일 프레임 실시간 미리보기(전용 미리보기 화면 제거). 스튜디오는 768px 미만에서 "모바일에서는 지원하지 않습니다" 안내만 표시(모바일 메뉴 제거). 메뉴 '수익과 정산' → '수익,정산,출금 관리', 설정 아이콘 톱니바퀴. 검증: npm run check 통과, 브라우저 확인(리포트·목록·편집·모바일). 커밋 안 함.
- 2026-09-13 (28차): '이메일 인증 다시 받기' 기능과 진입 링크 삭제. `/verify-email` 화면·라우트·카탈로그·탭 제목, CommonModel의 requestVerification/verifyEmail·auth.verified, 목업 구현과 테스트 제거. 이메일 인증은 회원가입 화면 안에서만 이뤄진다.
- 2026-09-13 (27차): 회원가입에 비밀번호 확인 입력 추가(불일치 시 즉시 안내, 가입 버튼 비활성).
- 2026-09-13 (26차): 결정: 인증 코드 재전송 쿨다운은 3분(서버 member_challenges도 분당 1회→3분으로 맞출 것, 서버 레포 작업 시 반영). 회원가입 화면에서 이탈 유도 링크('이미 계정이 있으신가요? 로그인', '메인으로 돌아가기') 제거. 로그인 화면 링크는 유지.
- 2026-09-13 (25차): 회원가입 인증 코드 정책(목업): 같은 이메일 재전송은 3분 쿨다운(에러코드 RESEND_COOLDOWN, 남은 분 안내), 코드 유효 10분, 검증 성공 시 폐기. 쿨다운 에러가 나도 화면은 코드 입력칸을 열어 이미 받은 코드를 입력할 수 있다. 서버(member_challenges)의 '분당 1회 발송'을 3분으로 맞출지 결정 필요.
- 2026-09-13 (24차): 로그인·회원가입을 일반 헤더 아래 단일 컬럼으로 정리('← 크레팬스 홈' 제거, 하단 '메인으로 돌아가기'). 회원가입: 사진/로고 패널 삭제, 이메일 인증 코드 요청·확인을 같은 화면에서 진행(목업 코드 123456), PASS 본인인증 버튼→모달(목업은 즉시 완료), 이메일·PASS 인증 전에는 가입 버튼 비활성. accountActions에 requestSignupCode/verifySignupCode/verifyIdentity 추가, signup 입력에 emailVerified/identityVerified.
- 2026-09-13 (23차): 로그인 화면의 감성 문구('다시, 여기서', 부제) 제거, 제목 '로그인'만 표기.
- 2026-09-13 (22차): 고객센터 FAQ의 native <details>를 공용 `components/ui/Accordion.tsx`(grid-rows 전환 애니메이션, aria-expanded)로 교체. 팬 목업 기본 상태를 로그인으로 변경(헤더가 알림·프로필을 보이고, 로그아웃 후 로그인·회원가입 표시).
- 2026-09-13 (21차): 팬 헤더를 로고 + (로그인 시) 알림·프로필 사진 / (비로그인 시) 로그인·회원가입 버튼만으로 축소. 상단 메뉴(홈·탐색하기·내 구독·고객센터)와 스튜디오 링크 제거.
- 2026-09-13 (20차): 팬 사이드바 하단에서 '내 구독'·'설정' 제거(고객센터·공지사항·스튜디오만). '설정'은 내 프로필 목록 마지막 항목으로 이동, 내 구독은 내 프로필 목록·상단 메뉴로 진입.
- 2026-09-13 (19차): 빈 상태 안의 행동 링크/버튼을 작은 외곽선 알약 버튼 한 가지로 통일(`.empty a, .empty button`). 저장한/좋아요한 게시물의 '피드 둘러보기'에서 검정 primaryLink 클래스 제거.
- 2026-09-13 (18차): 내 구독/결제 내역 탭을 스튜디오와 같은 세그먼트 컨트롤로 통일(밑줄 제거, 활성=흰 배경+브랜드색+옅은 그림자).
- 2026-09-13 (17차): 빈 상태 컴포넌트(`Empty`, `EmptyState`)에서 ○ 글리프와 큰 제목 제거. 점선 테두리 상자에 14px 보조색 제목 + 12px 설명으로 축소.
- 2026-09-13 (16차): 메뉴 항목명과 도착 페이지 제목 일치화. 팬: 홈(피드→홈), 탐색하기, 내 구독(탭별 제목 내 구독/결제 내역), 팔로잉 목록, 고객센터, 상단 메뉴·사이드바 하단·내 프로필 목록 동일 표기, 내 프로필 목록은 계층도 마이페이지 항목만 유지(계정 설정·알림 설정·고객센터 제거). 스튜디오: 페이지 제목을 메뉴 라벨로(게시물·댓글·멤버십·구독자·통계 요약·출금 신청·정산 계좌). 브라우저 탭 제목(app/preview 두 page.tsx)과 /preview/screens 카탈로그 라벨도 같은 이름으로.
- 2026-09-13 (15차): 팬 화면 콘텐츠 래퍼(피드·알림·크리에이터 프로필·구독·공통 페이지·고객센터)를 PC에서 왼쪽 정렬로 변경(margin:0). 셸 패딩은 유지. 인증 화면은 가운데 유지.
- 2026-09-13 (14차): 장식용 하트 아이콘 전부 제거(프로필 소개 옆, 멤버십 안내 카드, 랜딩 특징 카드, 랜딩 시그니처 ♡, 계정 메뉴·설정 아이콘). 게시물 좋아요 버튼의 하트만 기능 아이콘으로 유지. Icon에 'bell' 추가.
- 2026-09-13 (13차): 게시물 미디어 오른쪽 아래에 사진/동영상 개수 글리프 배지(`MediaSummary`, 팬 카드·상세·미리보기 공통, 단일 이미지 게시물도 사진 1). 업로더 타일의 순서 번호 제거, 타입 배지를 아이콘으로, 드롭존을 한 줄 '＋ 이미지·동영상 추가' 버튼으로 축소하고 제한 안내는 아래 한 줄 힌트로. 공용 아이콘 `components/ui/MediaTypeIcon.tsx`.
- 2026-09-13 (12차): 크리에이터 설정 우측에 팬 프로필 모바일 미리보기(초안 반영, 클릭 차단) 추가. 폰 프레임을 `studio/PhoneFrame.tsx`로 분리해 게시물 미리보기와 공용. '활동 쉬어가기' 문구를 '계정 비활성화/활성화'로 교체.
- 2026-09-13 (11차): 전 서비스 폼 전수조사 후 주 제출 버튼을 필수값 유효 전까지 disabled 처리(19개 폼, 목록은 docs/preview-pages.md '제출 버튼 규칙'). `.action:disabled`에 not-allowed 커서 추가.
- 2026-09-13 (10차): 크리에이터 시작하기 화면의 감성 문구·부연 설명 제거, 제목만 표기("크리에이터 시작하기" / 완료 시 "크리에이터 설정 완료").
- 2026-09-13 (9차): 스튜디오 페이지 래퍼 여백 통일: 전부 왼쪽 정렬·하단 32px, 폭 1100/800/640 세 단계, 제목 아래 안내문 간격 -10/28 통일, 리포트 뒤로가기·헤딩 간격 28. dashboard/analytics `.page` 규칙이 없던 것도 추가.
- 2026-09-13 (8차): 수익,정산,출금 관리 그룹 아이콘을 동전(coin, 단일 원 + ₩)으로 교체. 리포트 그룹 아이콘은 막대 차트(chart)로 교체.
- 2026-09-13 (7차): 스튜디오 메뉴 재편: 콘텐츠(연필 아이콘)=게시물·댓글, 새 그룹 멤버십(카드 아이콘)=멤버십, 구독자 관리(사람 아이콘)=구독자·메시지.
- 2026-09-13 (6차): 멤버십 활성화 스위치는 즉시 바꾸지 않고 확인 다이얼로그(숨기기/공개하기) 후에만 `setMembershipActive`를 호출. 취소하면 스위치 값이 유지된다.
- 2026-09-13 (5차): 게시물 ··· 버튼을 팝오버 메뉴(신고→확인 다이얼로그→`reportPost`, 공유→링크 복사, 수정→내 게시물일 때 스튜디오 편집 링크)로 교체. 소유 판정은 `ServiceViewModel.ownCreatorIds`(목업은 하늘). 댓글 허용 설정 3단계: 스튜디오 설정의 전역 스위치(`StudioProfile.commentsEnabled`, 최우선) → 게시물별 `StudioContent.commentsEnabled`(편집 화면 토글, 전역 off면 비활성) → 팬 `Post.commentsEnabled`(닫힘 표시·댓글 섹션 대체). 규칙은 `lib/crefans/comments.ts`. 피드에서 검색·추천/팔로잉 탭 제거(백엔드 정렬). 여백 감사: 셸 `.main` 팬/스튜디오 동일 리듬(24/36/72, 태블릿 24/24/64, 모바일 20/16/100), 페이지 래퍼의 상단 오프셋·좌우 이중 padding 제거(management/report `.page`, `.start`, `.login`, `.signup`, `.support`, `.profile`). 검증: npm run check 통과, 브라우저 확인.
- 2026-09-13 (4차): 게시물 미디어를 단일 `mediaUrl`에서 `media:StudioMedia[]`(이미지+동영상, 최대 10개, `lib/design/image-upload.ts`의 `mediaUploadMaxItems`)로 변경. 새 `components/ui/MediaUpload.tsx`: 다중 선택·드래그 앤 드롭 추가, 타일 그리드(타입 배지·순서 번호·삭제), Pointer Events 기반 끌어서 순서 변경(마우스·터치 동일, 6px 임계값, 사이 타일이 transform으로 밀리는 애니메이션, 드롭 후 FLIP으로 제자리 안착), 화살표 키 순서 변경, 순수 헬퍼 `media-order.ts`. 팬 `Post.media` 추가 및 상세/카드에 가로 스와이프 갤러리. 댓글 목업 `components/preview/comment-fixtures.ts`: 결정적 난수로 37개 스레드(긴 본문, 빈 게시물, 2뎁스 대댓글, 100명 태그). 팬 상세·피드 카드 공용 `CommentsSection`(10개씩 더 보기, 멘션 칩 12개 후 "외 N명"), 피드 카드 댓글 버튼은 이동 대신 인라인 펼침. 스튜디오 댓글 관리 10개 페이지네이션·팬 대댓글·태그 표시. 검증: npm run check 231 tests 통과, 브라우저(3010) 확인.
- 2026-09-13 (3차): 설정 다이얼로그의 토글 스위치가 둥근 사각형으로 커지던 문제 수정. 원인은 account.module.css의 `.dialogBody input{min-height:40px;border-radius:6px}`가 스위치 input에도 적용된 것. toggle.module.css 선택자를 `.toggle input[role=switch]`로 올려 컨테이너 규칙을 이기게 함. 브라우저 확인 완료.
- 2026-09-13 주의: 사용자 개발 서버(3010)가 떠 있는 상태에서 확인용 `next dev`를 하나 더 띄우면 같은 `.next`를 공유해 CSS 청크가 깨진다(mini-css-extract HMR removeChild 오류). 브라우저 확인은 이미 떠 있는 서버 포트를 사용할 것.
- 2026-09-13: 스튜디오 대시보드 팔로워 지표 포맷을 `{인원수}명`으로 고정(예: 12,400명). 목업이 `followerCount`로 값을 만들고, 기존 "12.4K ↔ 전체 숫자" 토글과 `exactValue` 필드·CSS를 제거. tests/studio-metric.test.cjs를 고정 포맷 검증으로 교체. 검증: npm run check 통과(217 tests).
- 2026-09-13: 공통 모달 액션 오른쪽 정렬, 스낵바 잔여 시간 바, 텍스트 링크·버튼/행 hover·focus, 검색창 중복 테두리 수정. 차트 최초 진입/데이터 변경 애니메이션, 혜택 목록 입력, 3종 상세 리포트와 직접 기간 지정, 2단 스튜디오 메뉴와 열림/닫힘 애니메이션을 추가. 공통 PIN/이미지 업로드/활성화 스위치 및 금액 프리셋을 카탈로그에 등록. 팬 UI 게시물 미리보기, 출금 후 잔액, 멤버십 이미지·활성화·삭제 동작을 확인했다. 목업 안내는 최상단 배너 하나로 통일했다. 멤버십 파일 선택 취소의 이벤트 전파 회귀 테스트 통과. 검증: npm run check 통과(217 tests). 실제 결제·PASS·은행 이체·운영 미디어 정리 배치는 실행하지 않음.
- 2026-09-13: 계층도 원문을 `docs/service-hierarchy.md`로 저장. 이전까지 원문은 대화 첨부로만 존재했고 레포에는 없었다. AGENTS.md에 PROGRESS.md·계층도 참조 추가. PROGRESS.md 신설. 코드 변경 없음.

### 29차 (2026-09-13) 콘텐츠 미리보기 '피드로 돌아가기' 제거
- 스튜디오 게시물 미리보기(PhoneFrame, readOnly)에서는 상단 '피드로 돌아가기'를 렌더하지 않음. 실제 게시물 상세의 링크는 유지.
- `components/crefans/SocialPages.tsx` PostDetailPage 한 줄 변경. check 통과.

### 30차 (2026-09-13) 팬 댓글의 대댓글을 요청 시 로드하는 구조로 변경
- 결정: 댓글 목록은 `replyCount`만 싣고, 대댓글은 "답글 N개 보기" 클릭 시 `SocialModel.loadReplies(postId, commentId)`로 가져온다(모든 뎁스를 한 번에 내려주지 않음). 불러온 뒤에는 "답글 숨기기"로 접고, 다시 열 때 재요청하지 않음. 미리보기(readOnly)에서는 버튼 비활성.
- 타입: `types/crefans-social.ts` `SocialComment.replies` 제거 → `replyCount?`, 새 `SocialReply`, `loadReplies` 액션. 목업 `useMockSocial`은 `initialReplies`(댓글 id → 답글 목록)와 `replyDelay`(기본 400ms, 로딩 상태 표시용)를 받음. 픽스처 `toSocialComments`는 개수만, 새 `toSocialReplies`가 답글 맵을 만든다(`fixtures.ts`의 `initialReplies`).
- 화면: `SocialPages.tsx` `CommentItem`이 로딩·에러·펼침 상태를 가짐. `.repliesToggle` 스타일 추가.
- 스튜디오 댓글 관리(`CommunityPages.tsx`)는 관리 목적이라 답글을 그대로 펼쳐 보여줌(변경 없음).
- 테스트: crefans-social(카드 인라인 댓글에서 답글 로드·숨김·재요청 없음, 목업 `loadReplies` 성공/미존재), comment-fixtures(답글 맵) 갱신. check 235 통과, 브라우저(3010 `/preview/post/morning`) 확인.

### 31차 (2026-09-13) 크리에이터 본인 댓글 강조
- 결정: `SocialComment.fromCreator`를 최상위 댓글에도 두고(`SocialReply`는 이제 `Omit<SocialComment,'replyCount'>`), 팬 화면에서 크리에이터 행은 뎁스와 무관하게 연한 브랜드색 배경(`.comment[data-creator]`)+"크리에이터" 배지로 표시.
- 구조: `SocialPages.tsx`에 공용 `CommentRow` 추가. 댓글 한 건은 `.thread` 래퍼 = 댓글 행 + 답글 토글 + 답글 목록(형제)으로 바꿔서 배경 틴트가 답글에 번지지 않게 함. 토글·답글은 아바타 폭(47px)만큼 들여쓰기.
- 픽스처: `messyCommentThreads`가 `fromCreator`(index 2, 이후 13개마다) 스레드를 크리에이터 계정("하늘")으로 생성. 크리에이터 댓글은 태그·숨김 없음.
- 테스트: comment-fixtures(크리에이터 최상위 댓글 존재), crefans-social(강조 행에만 배지). check 235 통과, 브라우저(3010) 확인.

### 32차 (2026-09-13) 로그인 화면 하단 링크 여백
- 로그인 버튼과 "계정이 없으신가요? 회원가입" 사이 여백 확대: `.authFoot` 상단 margin 27→40px(모바일 24→36px). `account.module.css`만 변경.
- (32차 보완) `.authFoot` 여백이 `service.module.css`의 `.root p{margin-top:0}`(특이도 0,1,1)에 밀려 적용되지 않던 문제 → `.login .authFoot`로 특이도 상향.
- 로그인 비밀번호 "보기" 텍스트 버튼(랜딩 토큰 `--cf-landing-muted` 사용, 전용 CSS) 제거 → 공용 `Field`의 `showPasswordToggle`(눈 아이콘, `--cf-size-control`/`--cf-color-textSecondary` 토큰)로 교체. `account.module.css`의 `.password*` 규칙 삭제.
- (32차 보완) 회원가입 비밀번호·비밀번호 확인 입력란에도 `showPasswordToggle` 적용.

### 33차 (2026-09-13) 체크박스·라디오 컴포넌트화 + 디자인 시스템 등록
- 조사: 체크박스·라디오 공용 컴포넌트 없음. 라디오는 서비스에 사용처 없음. 체크박스는 7곳(회원가입 동의 3, 로그인 유지, 멤버십 가입 동의, 탈퇴 확인, 크리에이터 시작 공개 프로필 확인)+카탈로그 토글 2곳이 네이티브 인풋에 `accent-color`만 입혀 사용, 크기도 14/17/18px로 제각각.
- 새 `components/ui/Choice.tsx`(`Checkbox`, `Radio`) + `choice.module.css`: appearance:none으로 토큰(`--cf-color-borderStrong`, `--cf-service-brand`, `--cf-radius-small`, `--cf-color-surface`, `--cf-color-disabledText`)만 써서 그림. 체크 표시는 clip-path, 라디오는 원형 점. 선택자 `.choice input[type=…]`로 컨테이너의 `input{min-height:40px}` 류 규칙보다 우선.
- `Primitives`에서 재export하지 않음(테스트 로더가 CSS 모듈을 자동 모킹하지 않아 모든 Primitives 소비 테스트에 모킹을 강요하게 됨). 페이지는 `@/components/ui/Choice`에서 직접 import.
- 사용처 7곳 교체, `account.module.css`/`creator.module.css`/`overview.module.css`/`custom.module.css`의 체크박스 전용 규칙 삭제(동의 문구 11~12px → 컴포넌트 13px로 통일).
- 카탈로그 `FormControlsCatalog`에 "체크박스와 라디오" 섹션(기본·설명·비활성 2종, 라디오 그룹 3+비활성 1) 추가. `docs/design-system.md`에 사용 규칙 추가.
- 테스트: 새 `tests/choice.test.cjs`(3건), 페이지 테스트 4곳에 `./choice.module.css` 모킹 추가. check 238 통과.

### 34차 (2026-09-13) 댓글 작성자 배지 문구
- 게시물 작성자 본인의 댓글·답글 배지를 "크리에이터" → "작성자"로 변경(크리에이터가 아니어도 게시물을 쓸 수 있으므로). 데이터 필드명 `fromCreator`와 CSS 클래스 `creatorBadge`는 그대로 두었고 의미는 "게시물 작성자"다.

### 35차 (2026-09-13) 조사: 팬 진입 페이지의 공통 레이아웃 적용 여부
- 새 목업(`/preview/*`): `ServiceRouter`가 모든 팬 화면을 `ServiceShell`로 감싼다(인증 3화면은 `auth` 플래그). 미적용 화면 없음. `/preview/landing`만 랜딩 전용 레이아웃(의도).
- 기존 앱(antd): `app/(main)/*`만 `MainLayout`(라우트 그룹 layout). 다음 9개 페이지는 공통 레이아웃 없이 각자 `minHeight:100vh`/`maxWidth` 인라인 스타일로 구성됨 → `app/post/[id]`, `app/subscription/[creatorId]`, `app/subscription/manage`, `app/subscription/billing/success|fail`, `app/payment/success|fail`, `app/email-verification`, `app/(auth)/login`. `app/page.tsx`는 랜딩(의도).
- 조치 없음(조사만). 리디자인에서 기존 앱 페이지를 교체할 때 `(main)` 그룹으로 옮기거나 `ServiceShell` 적용 대상으로 삼을 것.

### 36차 (2026-09-13) 탐색 페이지에 사이드 메뉴 표시
- `ServiceShell`의 사이드바 없는 넓은 레이아웃(`top`) 대상에서 `explore` 제거 → 탐색 페이지도 홈과 같은 사이드 메뉴 레이아웃. `creator`(프로필)·`membership`은 아직 넓은 레이아웃 유지(확인 필요).
- (36차 보완) 크리에이터 프로필·멤버십도 사이드 메뉴 레이아웃으로. `ServiceShell`의 `top` 분기와 `.topLayout` CSS 삭제 → 팬 화면은 인증 3화면을 제외하고 모두 같은 사이드바 레이아웃.

### 37차 (2026-09-13) 크리에이터 프로필에 판매 중인 멤버십 먼저 노출
- `CreatorProfilePage`: 소개·통계·팔로우 영역 바로 아래, 게시물 탭 위에 "멤버십" 섹션 추가. `getCreatorPlans`에서 `available!==false`인 플랜만 `MembershipPlanCard`(`planGrid`)로 표시. 팬이 해당 크리에이터를 활성 구독 중이면 그 카드는 선택 스타일+"가입 중" 비활성. 판매 중인 플랜이 없으면 "판매 중인 멤버십이 없어요." 안내.
- 카드의 "가입하기"는 `/membership/{id}?plan={planId}`로 이동. `MembershipPage`에 `initialPlanId` prop 추가, `ServiceRouter`가 `?plan=`을 넘겨 해당 플랜을 미리 선택. `MembershipPlanCard`에 `actionLabel?` prop(기본 '선택하고 계속').
- CSS: `.profilePlans`, `.noPlans` (creator.module.css, 모바일 패딩 18px).
- 테스트: crefans-creator에 프로필 멤버십 섹션(순서·비판매 숨김·이동 경로·가입 중·빈 상태·미리 선택) 추가, 잠금 라벨 테스트는 타일 범위로 좁힘. check 239 통과.
- (37차 보완) 프로필의 멤버십 카드는 `MembershipPlanCard compact`: 한 줄 행(이름+추천 배지 · 월 요금 · 가입 버튼)만 두고 이미지·설명·혜택은 생략(상세는 멤버십 페이지에서). 프로필은 `.planList`로 세로 나열, `.compactPlan` 가로 배치. 멤버십 페이지는 기존 카드 유지.
- (37차 보완) 크리에이터 프로필 탭 이름 "게시물" → "피드" (피드·미디어·소개). 상단 통계의 "게시물" 수는 유지.
- (37차 보완) 프로필 피드 탭은 홈 피드와 같은 `PostCard` 목록(본문·미디어·좋아요·댓글 인라인, 잠금 게시물은 티저)으로 렌더. 타일 그리드는 미디어 탭에서만. `CreatorPages`가 `SocialPages`의 `PostCard`를 import(순환 없음). 테스트 모델에 좋아요·저장 필드 추가, 잠금 라벨 테스트는 미디어 탭에서 검사.

### 38차 (2026-09-13) 탐색 카테고리 칩 통일
- 탐색 페이지 카테고리 버튼이 선택 시 검정(`--cf-landing-ink`), 선택된 상태 호버 시 테마색(`--cf-color-accentHover`)으로 바뀌어 뒤죽박죽이던 문제. 전용 `.filters button` CSS를 모두 삭제하고 디자인 시스템 `Chip`(`components/ui/Primitives`)으로 교체: 기본 회색, 선택·호버 연한 테마색 배경+테마색 글자, 필 형태. 테스트 Primitives 모킹에 `Chip` 추가.

### 39차 (2026-09-13) 팔로우 토글 버튼 스타일
- `CreatorCard`(탐색)와 크리에이터 프로필의 팔로우 버튼: 팔로잉 상태는 "팔로우 하는중" + 테마색 배경·흰 글자(`Action` 기본 `primary`), 미팔로우는 기존 `secondary`(흰 배경·테두리) 유지. 체크/플러스 아이콘 유지.
- 참고: `Action variant="brand"`는 `service.module.css`의 `.brand`(로고 스타일)와 클래스가 겹친다. 멤버십 카드 추천 버튼이 이 variant를 쓰며 `.plan button` 규칙이 글자 크기를 덮어써서 겉보기엔 정상. 정리 필요(미해결).
- (39차 보완) 팔로잉 목록(`/preview/following`)의 행 버튼도 "팔로우 하는중" + 테마색 배경·흰 글자·체크 아이콘으로 통일(`CommonPages.tsx`).

### 40차 (2026-09-13) FollowButton 컴포넌트화 + 해제 confirm + 팔로잉 목록 유지 + 탐색 카드 아바타
- 조사: 팔로우 버튼은 탐색 `CreatorCard`·프로필·팔로잉 목록이 각자 `Action`+아이콘+텍스트를 조립하고 있었음(같은 컴포넌트 아님). 새 `components/crefans/FollowButton.tsx`(`following`, `name`, `onToggle`, `disabled?`)로 통합: 미팔로우 `secondary` "+ 팔로우" 즉시 토글, 팔로우 중 `primary` "✓ 팔로우 하는중" 클릭 시 Dialog "팔로우를 해제할까요?"(취소/팔로우 해제) 후에만 토글.
- 디자인 시스템 `ServicePatternCatalog`에 `FollowButton` 예시(토글 가능 1 + 비활성 1) 추가, CreatorCard 예시도 자동으로 같은 동작. `docs/design-system.md` 갱신.
- 팔로잉 목록: 해제한 크리에이터 행을 즉시 제거하지 않고 남겨 "팔로우"로 되돌릴 수 있게 함(`shown` 로컬 상태 = 진입 시 팔로잉 + 이후 새 팔로우; 카운트는 실제 팔로잉 수). 페이지를 떠나면 정리됨.
- 탐색 `CreatorCard`: 이름 왼쪽에 `Avatar`(40px) 추가(`.creatorHead`), 이름은 한 줄 말줄임.
- 테스트: 새 `tests/follow-button.test.cjs`(즉시 팔로우 / 해제 confirm 취소·확인), crefans-common에 팔로잉 목록 유지 시나리오. check 242 통과.
- (40차 보완) 크리에이터 프로필의 팔로우 해제 confirm 브라우저 확인(모달 → 취소 유지 → 해제 시 "팔로우"). 탐색 `CreatorCard`에 크리에이터 카테고리(`creator.tags`, 탐색 필터와 같은 값) `#태그` 칩 표시(프로필과 같은 `.tags` 스타일).

### 41차 (2026-09-14) 알림 분류 버튼 Chip 통일
- 알림 페이지 분류 버튼도 선택 시 검정(`--cf-landing-ink`)·호버 시 테마색으로 섞여 있던 전용 CSS(`.notificationFilters button*`) 삭제, 디자인 시스템 `Chip`으로 교체(탐색 카테고리와 동일). 테스트 Primitives 모킹에 `Chip` 추가.

### 42차 (2026-09-14) ChipRow: 한 줄 유지 + 좌우 스크롤·드래그
- 새 `components/ui/ChipRow.tsx` + `chip-row.module.css`: Chip을 한 줄로 두고 넘치면 가로 스크롤. 터치는 네이티브, 마우스는 Pointer Events로 끌어서 스크롤(임계 6px, 드래그 직후 클릭은 onClickCapture에서 차단). 스크롤바 숨김, 모바일에서 본문 여백(16px)까지 bleed.
- 적용: 탐색 카테고리(`.filters`), 알림 분류(`.notificationFilters`), 디자인 시스템 "탐색과 선택" 섹션(칩 14개). 컨테이너의 flex/wrap/gap 규칙 삭제.
- 테스트: `tests/chip-row.test.cjs`(드래그 스크롤·클릭 억제·터치 무시), 페이지 테스트 4곳에 `./chip-row.module.css` 모킹. check 244 통과. `docs/design-system.md`에 사용 규칙 추가.

### 43차 (2026-09-14) 모바일 래퍼 이중 패딩 제거
- ≤700px에서 `.explore,.membership,.subscriptions{padding:20px 16px 36px}`가 `.main`의 20/16px과 겹쳐 좌우 32px·상단 40px이 되던 문제(홈 `.feed`는 래퍼 패딩 없음). 래퍼는 `padding:0 0 36px`로 변경 → 탐색·내 구독(결제 내역 탭 포함)·멤버십이 홈과 같은 좌우 16px. 여백 규칙(`docs/preview-pages.md`: 래퍼는 하단 여백만)과 일치.

### 44차 (2026-09-14) 프로필 팔로우 버튼 위치·구독하기 제거
- 크리에이터 프로필의 `FollowButton`을 커버 이미지 오른쪽 아래(`.coverAction`, absolute 16px)로 이동. 소개 아래 액션 행(`.profileActions`)과 "구독하기" 링크(`.brandLink`) 삭제 — 멤버십 진입은 바로 아래 멤버십 섹션의 "가입하기"로.
- (44차 보완) 프로필 탭에 개수 표시: "피드 {게시물 수}", "미디어 {이미지·동영상 있는 게시물 수}"(`.tabCount`), 소개는 개수 없음. 미디어 탭은 미디어가 있는 게시물만 타일로 표시하고 없으면 "아직 미디어가 없어요" 빈 상태.
- (44차 보완) 모바일(≤700px) 커버 위 팔로우 버튼 축소: 높이 30px, 글자 11px, 아이콘 12px, 여백 12px(`.coverAction button`).

### 45차 (2026-09-14) 홈 타이틀 제거
- 홈(피드) 화면의 "홈" `PageTitle` 제거. 첫 게시물 카드가 바로 시작(카드 상단 padding 20px 유지). 사이드/하단 메뉴 라벨 "홈"은 그대로.

### 46차 (2026-09-14) 모바일 피드 구분선 전폭
- ≤700px에서 `.post{margin-inline:-16px;padding-inline:16px}` → 게시물 카드 하단 구분선이 화면 가로를 꽉 채움(내용 위치는 16px 유지). 프로필 피드 탭은 `.profileFeed` 모바일 패딩을 0으로 해 같은 결과. 데스크톱은 변경 없음.

### 47차 (2026-09-14) PC 피드 최대 폭 480px
- `.feed{max-width:650px}` → 480px. 같은 래퍼를 쓰는 게시물 상세(`/preview/post/*`)도 480px로 좁아짐(의도적으로 통일; 다르게 원하면 분리).

### 48차 (2026-09-14) 피드 게시물 상세 오버레이
- 피드 카드(홈·프로필 피드 탭)의 이미지를 누르면 `PostOverlay`(SocialPages.tsx)가 전체 화면을 덮음: 왼쪽 어두운 무대에 큰 이미지/동영상(object-fit contain, 여러 개면 이전/다음 버튼·카운터·← → 키), 오른쪽 400px 흰 패널에 `PostHeading`(작성자·시간···· 메뉴)·제목·본문·`PostActions`·인라인 댓글(`CommentsSection`). 닫기: × 버튼(열릴 때 포커스), Esc, 배경 클릭. 열린 동안 body 스크롤 잠금. 모바일(≤700px)은 무대 56vh 위 + 패널 아래 세로 배치.
- 이미지만 `Zoomable` 버튼(cursor: zoom-in)으로 감싸고 동영상은 기존 컨트롤 유지. 잠금 게시물·readOnly 미리보기·게시물 상세 페이지에서는 열리지 않음(피드 카드 전용).
- 테스트: crefans-social에 오버레이 열기/시작 인덱스/순환 이동/동영상/닫기/배경 클릭, 잠금·readOnly 미제공 2건 추가. check 246 통과.
- (47차 보완) 크리에이터 프로필 페이지 전체를 PC에서 최대 480px(`.profile{max-width:480px}`, 기존 800px). 커버·소개·멤버십 행·탭·피드/미디어 그리드 모두 이 폭 안. 피드 탭 전용 제한은 제거. 모바일은 기존대로 전폭.

### 49차 (2026-09-14) 하늘 대표 게시물에 다채로운 미디어
- `fixtures.ts`의 `morning` 게시물에 `media` 7개(이미지 5 + 동영상 2, 동영상은 `public/video_1.mp4` 재사용). 피드 갤러리(스와이프·카운터·점), 오른쪽 아래 사진/동영상 개수 배지, 오버레이 이전/다음·동영상 재생을 한 게시물에서 확인 가능. 다른 게시물은 단일 이미지 유지.

### 50차 (2026-09-14) 모바일 프로필 커버 전폭·섹션 여백 축소
- ≤700px: `.cover{margin-inline:-16px}`로 커버 이미지가 화면 가로를 꽉 채움. 소개·멤버십·탭·미디어 그리드의 자체 좌우 여백(18px)을 0으로 → 본문 기본 여백 16px만 적용(이전 34px). PC는 변경 없음(480px 페이지 안 26px).
- (50차 보완) 모바일 피드 게시물 카드의 미디어 영역(이미지·갤러리·잠금 안내)을 전폭으로: `.post .mediaWrap,.post .lockedMedia{margin-inline:-16px}` + radius 0. 홈·프로필 피드 탭 공통. 미디어 탭 타일 그리드는 16px 여백 유지(전폭 시도 되돌림).

### 51차 (2026-09-14) 피드 끝 안내 문구
- 홈 피드와 프로필 피드 탭의 마지막 게시물 아래에 `FeedEnd`("모두 확인했습니다", 12px 회색, 가운데, role=status). 게시물이 없으면 빈 상태만 표시. 테스트 1건 추가.

### 52차 (2026-09-14) 조사: 사이드바 브레이크포인트
- 팬 `ServiceShell`: `service.module.css` `@media(max-width:767px)`에서 `.sidebar{display:none}`, `.body{display:block}`, `.bottomNav` 표시 → 768px 이상 사이드바, 767px 이하 하단 탭. ≤1000px은 사이드바 폭 190→166px 축소만. 토큰 `breakpoint.tablet=768`과 일치.
- 스튜디오 `StudioShell`: JS `matchMedia(max-width: tablet-1 = 767px)`로 "모바일 미지원" 안내, ≤1050px은 사이드바 패딩 축소.
- 불일치: 페이지 CSS의 모바일 규칙은 700px(creator/social/chip-row) 또는 600/560px(common/account/community) 기준. 701~767px 구간은 사이드바가 사라지고 `.main` 여백은 16px인데 카드 전폭(-16px bleed)·모바일 패딩 규칙은 적용되지 않음. 통일하려면 페이지 규칙을 767px로 맞추는 것이 후보(미결정).

### 53차 (2026-09-14) PC 크리에이터 페이지 본문 여백 제거
- `ServiceShell`이 `active==='creator'`일 때 `main`에 `.flushMain`(≥768px: padding-top/left 0) 추가 → 커버가 사이드바 경계·헤더에 붙음. 오른쪽·아래 여백과 페이지 내부 26px 여백, 모바일 규칙은 유지.
- (53차 보완) 커버 위 팔로우 버튼을 PC에서도 소형(30px 높이·11px 글자)으로 통일. 모바일 전용 규칙은 위치(12px)만 남김.

### 54차 (2026-09-14) 탐색: 광고 카드 + 간단 목록
- `Creator.promoted?:boolean` 추가(향후 크리에이터에게 판매할 상단 노출 광고 상품). 탐색 페이지는 검색·카테고리 필터 결과 중 `promoted`만 `CreatorCard` 그리드로, 나머지는 "모든 크리에이터" 헤딩 아래 `ul.creatorList` 한 줄 행(아바타 36·이름·@핸들, 프로필 링크, 팔로우 버튼 없음). 카드가 없으면 헤딩 생략, 둘 다 없으면 기존 빈 상태.
- 목업: 하늘·지우·서연 `promoted:true`, 민지·예린·수아는 행. 테스트 1건 추가(카드/행 분리·행 최소 정보·헤딩 조건). check 248 통과.
- (54차 보완) "모든 크리에이터" 헤딩 상단 여백이 `.root h2{margin-top:0}`에 밀려 0이던 문제 → `.explore .listHeading`으로 특이도 상향, 상단 32px.

### 55차 (2026-09-14) PC 헤더·사이드바 고정
- 팬 `ServiceShell`: `.header{position:sticky;top:0;z-index:20}`, `.sidebar{position:sticky;top:68px;align-self:start;height:calc(100vh - 68px);overflow-y:auto}` → 피드를 스크롤해도 헤더와 사이드 메뉴가 항상 보임. 모바일(≤767)은 사이드바 숨김·하단 탭 고정 그대로.
- (55차 보완) 모바일 하단 탭 "마이"는 사용자 아이콘 대신 내 프로필 사진(`Avatar` 24px, 사진 없거나 비로그인이면 기본 아바타). 활성 시 브랜드색 링.

### 56차 (2026-09-14) 모바일 헤더 숨김 + 하단 탭에 알림
- ≤767px에서 팬 헤더 숨김(`.header:not([data-auth]){display:none}`). 로그인·회원가입·비밀번호 재설정(`auth`)은 로고가 필요해 헤더 유지.
- 헤더에만 있던 알림 진입을 하단 탭에 추가: 홈·탐색·메시지·알림·마이 5개(항목 min-width 64→56px). 알림 탭은 읽지 않은 알림이 있으면 브랜드색 점 + `aria-label="알림 N개"`.
- 미해결: 비로그인 모바일에서 로그인/회원가입 진입(헤더 링크가 사라짐) — 마이 탭 진입 시 로그인 유도 화면이 필요할 수 있음.

### 57차 (2026-09-14) 비로그인 마이 탭 로그인 유도
- `AccountPages.tsx`에 `SignInPrompt`(Empty 기반: "로그인이 필요해요" + 로그인(브랜드색 필)/회원가입 링크). `MyProfilePage`는 `model.signedIn===false`면 이를 렌더(PC·모바일 공통, 하단 탭 마이 포함). 다른 로그인 필요 화면(메시지·알림·내 구독)은 아직 미적용(미해결).
- 테스트 1건 추가. 확인 경로: 설정 → 로그아웃 → 모바일 마이 탭.

### 58차 (2026-09-14) 피드 갤러리 드래그·화살표 + 목업 로그인 상태 유지
- `PostGallery`(미디어 2개 이상): 터치는 네이티브 스와이프, 마우스는 Pointer Events로 끌어서 스크롤(임계 6px, 드래그 중 `data-dragging`으로 scroll-snap 해제, 놓으면 가장 가까운 슬라이드로 smooth 스냅). 드래그 직후 클릭은 onClickCapture로 차단해 오버레이가 열리지 않음. PC 호버 시 이전/다음 화살표(첫/마지막에서는 해당 방향 숨김, `hover:none` 기기에서는 표시 안 함, readOnly 미리보기에서는 비활성).
- `PreviewProvider`: 목업 `signedIn`을 `sessionStorage('crefans-preview-signed-in')`에 유지 → 로그아웃 후 새로고침해도 비로그인 유지(마이 탭 로그인 유도 화면 테스트 가능). 테스트 1건 추가(드래그·스냅·클릭 억제·화살표·터치 무시).
- (58차 보완) 탐색 카드 안의 팔로우 해제 confirm이 깨지던 문제: `.creatorInfo button{width:100%}`/`.creatorInfo p{…}`가 카드 내부에서 렌더되는 Dialog의 ×·취소·해제 버튼과 본문에도 적용돼 제목이 세로로 밀림 → `.creatorInfo>button`, `.creatorInfo>p`로 직계만 대상.

### 59차 (2026-09-14) 빈 상태 점선 테두리 제거
- `ServiceUI.Empty`(service.module.css `.empty`), 디자인 시스템 `EmptyState`(ui.module.css `.empty`), 프로필 `.noPlans`에서 `1px dashed` 테두리 삭제. `.noPlans`는 대신 연한 배경. 업로드 드롭존 점선은 유지(용도가 다름).

### 60차 (2026-09-14) 카드 카운터 제거·오버레이 점 페이지네이션·게시물 이전/다음
- `PostGallery`(카드): "현재/전체" 카운터 삭제, 점 표시만 유지.
- `PostOverlay`: 무대 하단 가운데 점 페이지네이션(`.stageDots`, 흰색), 카운터 삭제. `PostCard`에 `context?:Post[]`(카드가 속한 정렬 목록) 추가 → 홈 피드는 `data.posts`, 프로필 피드 탭은 `ownPosts` 주입. 오버레이는 내부 `post` 상태를 가지며 패널 맨 아래 "이전 게시물/다음 게시물"(`.panelNav`, secondary) 버튼으로 목록을 이동(잠금·미디어 없는 게시물 건너뜀, 끝에서는 비활성). `context`가 없으면 버튼 자체를 렌더하지 않음.
- 테스트 2건 추가(카운터 없음·점·컨텍스트 이동·잠금 건너뜀·컨텍스트 없을 때 미노출). check 252 통과.
- (60차 보완) 오버레이 무대를 슬라이드 트랙(`.stageTrack`, translateX + .32s 전환)으로: 모든 미디어를 슬라이드로 렌더하고 터치·마우스 드래그를 따라 실시간으로 이동(6px 이후 축 판정, 세로면 무시), 놓을 때 40px 이상이면 이웃으로 전환, 끝에서는 1/3 저항 후 복귀. 순환 제거(끝 화살표 숨김, ← → 키도 clamp). 현재 슬라이드의 동영상만 컨트롤 표시. 동영상에서 시작한 제스처 무시. 테스트 갱신(트랙 translate·드래그 중 전환 없음·저항·clamp).
- (54차 보완) 탐색 카드 영역에 "주목할 크리에이터" 헤딩 추가(`.featuredHeading`, 상단 4px). 카드가 없으면 두 헤딩 모두 생략.

### 61차 (2026-09-14) 프로필 소개 탭 개편 + 스튜디오 소개 글·SNS 링크 관리
- 타입: `Creator.about?`(긴 소개), `Creator.links?:CreatorLinks{youtube,instagram,facebook}`; `StudioProfile.about`, `StudioProfile.links`; `updateProfile`이 두 필드를 함께 받음(온보딩은 기존 값 유지).
- 팬 프로필 소개 탭: "{이름}의 이야기" 제목과 "멤버십 혜택 알아보기" 링크 삭제. `about`(없으면 `bio`)을 줄바꿈 유지로 표시하고, 등록된 SNS만 아이콘 칩(`.socialLinks`, 새 탭)으로 나열. `Icon`에 youtube/instagram/facebook 추가.
- 스튜디오 크리에이터 설정: `AboutFields`(소개 글 textarea 1000자 + SNS 링크 3개 URL 필드). http(s)로 시작하지 않는 링크가 있으면 저장 버튼 비활성, 목업 `update`도 같은 검증 + 빈 링크 제거. 저장 시 `onProfileChange`로 팬 데이터에 반영, 폰 미리보기에도 즉시 반영.
- 목업: 하늘(소개 3문단 + 링크 3개), 지우(소개 + 인스타그램만). 테스트: 소개 탭(제목/링크 없음·등록된 SNS만·bio 폴백), 설정(필드 존재·URL 검증 게이트) 추가. check 254 통과.

### 62차 (2026-09-14) 프로필 팔로잉 비공개 표시
- 크리에이터 프로필 통계에서 `followingCount`가 없으면(=비공개) 열을 제거하던 것을, 열은 유지하고 숫자 자리에 자물쇠 아이콘(`.lockedCount`, `aria-label="팔로잉 비공개"`)을 표시하도록 변경. 목업에서는 하늘만 숫자, 나머지는 자물쇠.
- 결정: 팔로잉 공개는 크리에이터 전용이 아닌 팬 공통 설정이므로 스튜디오가 아니라 팬 설정 > 개인정보에 둠(63차).

### 63차 (2026-09-14) 설정 > 개인정보에 "팔로잉 공개" 토글
- `AccountPreferences.showFollowing`(기본 true), `AccountSettingsUpdate` privacy 섹션에 포함, 목업 저장 반영. 설정 개인정보 패널에 Toggle "팔로잉 공개"(끄면 다른 사람에게 자물쇠). 내 프로필 통계의 "팔로잉" 라벨에 비공개 시 작은 자물쇠 표시. `route.settingsSection`에 'privacy' 추가(`?section=privacy` 딥링크).
- 다른 사람이 보는 프로필(크리에이터 프로필)의 자물쇠는 `Creator.followingCount` 유무로 표시 — 실제 API에서는 이 설정에 따라 서버가 값을 내려주지 않으면 됨. 테스트 1건 추가. check 255 통과.

### 64차 (2026-09-14) 게시물 오버레이 등장·퇴장 애니메이션
- `PostCard`가 `usePresence(viewerOpen, motion.fast)`로 퇴장 동안 오버레이를 유지하고 `data-state=open|closing`을 전달. CSS: 배경 페이드(등장 normal 200ms / 퇴장 fast 120ms) + 무대·패널 12px 떠오름·scale .985(등장)/가라앉음(퇴장), 퇴장 중 pointer-events 차단, reduced-motion이면 애니메이션 없음. 키 리스너·body 스크롤 잠금은 `open`일 때만.
- 테스트: 닫기·배경 클릭 시 `closing` 상태 유지 후 160ms 뒤 언마운트, 재오픈 시 `open` 복귀. check 255 통과.

### 65차 (2026-09-14) 내 프로필 정보 체계·아이콘 정리
- 내 프로필 메뉴를 "내 활동"만으로 축소: 팔로잉 목록·저장한 게시물·좋아요한 게시물·내 구독·설정. 제거: 결제 내역(내 구독의 탭과 중복), 결제수단 관리(설정 > 결제수단 관리와 중복).
- 아이콘: 저장한 게시물=`bookmark`(포스팅 카드 저장 버튼과 같은 그림, `SocialPages`의 인라인 `SaveIcon`을 공용 `Icon`으로 통합), 좋아요=`heart`, 설정=`settings`(톱니). 설정 항목: 계정 정보 `user`, 비밀번호 `lock`, 이메일 `mail`, 알림 `bell`, 결제수단 `card`, 개인정보 `shield`, 차단 `ban`. `Icon.tsx`에 user/shield/ban/mail/bookmark/settings 추가.

### 66차 (2026-09-14) 내 프로필 정보 계층 분리 + 팔로워 목록
- 내 프로필 메뉴를 4그룹(`.menuGroup` h3)으로: 계정 설정(프로필 수정 버튼→기존 다이얼로그, 이메일 설정·비밀번호 변경→`/settings?section=email|password`), 항목 모아보기(저장·좋아요·팔로잉 목록·팔로워 목록), 공개 설정(팔로잉 공개→`?section=privacy`), 구독과 설정(내 구독·설정). 프로필 헤더의 "프로필 수정" 버튼은 그룹 항목으로 이동(중복 제거).
- `route.settingsSection`을 설정 패널 전체 키로 확장(목업이 `?section=` 그대로 매핑) → 딥링크로 패널 즉시 오픈.
- 새 `FollowersPage`(`/preview/followers`, CommonPages): `ServiceData.followers?:Follower[]`(목업 56명, `messyFanPool` 기반) 읽기 전용 목록·검색·빈 상태. 라우터·카탈로그·탭 제목 등록.
- 테스트: 계정(그룹 헤딩·딥링크·결제 중복 없음·프로필 수정 버튼), 공통(팔로워 목록·검색·빈 상태) 추가; 계정 테스트의 `button` 헬퍼를 자식 텍스트 평탄화로 교체. check 257 통과.

### 67차 (2026-09-14) 팬 프로필 = 크리에이터 프로필 레이아웃, 설정은 커버 ⚙ 버튼으로
- 새 `components/crefans/ProfileHeader.tsx`(creator.module.css 공용): 커버+코너 액션, 겹친 아바타, 이름/@핸들, 한 줄 소개, 태그, 통계 dl. `CreatorProfilePage`와 `MyProfilePage`가 함께 사용.
- 내 프로필(`/me`): 크리에이터 프로필과 동일한 셸(커버 없으면 연한 배경) + 피드/미디어/소개 탭(팬 게시물 없음 → 빈 상태). 차이는 커버 오른쪽 위 "⚙ 설정" 링크(`.coverLink`, `:has`로 상단 배치)와 멤버십 섹션 없음. 메뉴 그룹·프로필 수정 다이얼로그·로그아웃은 프로필에서 제거. `ServiceShell`은 `me`도 `flushMain`.
- 설정(`/settings`): 5개 그룹(계정 설정 / 항목 모아보기 / 공개 설정 / 알림과 결제 / 계정 관리)으로 재구성. "계정 정보(닉네임)" 패널을 "프로필 수정"(닉네임+소개, `updateProfile`)으로 대체. 저장/좋아요 목록 뷰는 `?tab=` 그대로.
- 테스트: 프로필 헤더·설정 진입 링크·프로필 수정은 설정에서, 설정 그룹 구성 검증으로 갱신. check 257 통과.

### 2026-10-07 실제 서비스 로그인 안내 레이아웃
- 스튜디오 비로그인 화면을 `ServiceShell(auth)`로 감싸 공통 헤더/디자인 변수를 적용. 이전에는 셸이 없어 테마 버튼 색상이 빠져 있었다.
- 공통 `SignInPrompt`는 전체 콘텐츠 너비와 화면 높이를 활용해 중앙 정렬. 제목24px/설명14px, 로그인·회원가입 최소44px 버튼. 팬 보호 화면/목업에도 동일 컴포넌트 적용.
- 스튜디오는 전용 안내 문구를 props로 주입. PC1440×900/모바일 브라우저에서 중앙 정렬과 테마 버튼 확인. layer/type/test260개 통과.

### 2026-10-07 랜딩 데이터 모드 플래그
- 사용자 요청에 따라 `NEXT_PUBLIC_LANDING_USE_ASSETS` 하나로 목업 에셋/실제 DB 랜딩 전환. 기본 true 및 `.env.example` true.
- 랜딩 콘텐츠/크리에이터 에셋을 `lib/content/landing.ts`로 이동하여 목업과 실제 랜딩이 같은 데이터를 공유. 실제 모드에서도 히어로·3단계 고정 소개를 유지. 기존 `/preview` 링크 유지.
- 에셋 샘플 카드는 목업 프로필에 연결하고 팔로우는 로컬 상태. 실제 계정·탐색 경로 유지.

### 2026-10-07 로고와 랜딩 진입 동선
- 팬/스튜디오/랜딩의 로고는 해당 basePath의 홈 피드로 이동. 실제·목업 모두 동일 컴포넌트에 반영.
- 팬/스튜디오 사이드바 내부 하단 footer에 작은 `서비스 소개` 링크 추가(랜딩으로 이동). 팬 sidebar는 세로 flex/margin-top:auto로 화면 하단 배치.
- 랜딩 에셋 플래그 분기 검증을 포함한 check262개 통과. PC에서 랜딩 로고 클릭→실제 홈 피드 이동 및 sidebar 하단 서비스 소개 링크 위치 확인.

- 위치 정정(2026-10-07): 팬 사이드바 `서비스 소개`를 최하단 footer에서 고객센터 바로 위로 이동. 기존 작은 보조 메뉴 스타일 사용, 실제/목업 공통 반영.

### 2026-10-07 저장/좋아요 목록 여백
- `me?tab=saved|liked` 목록에 프로필 커버용 `flushMain`이 적용되어 PC 상단/왼쪽 여백이 없어졌던 원인 수정. 프로필 본화면만 flush, 두 목록은 일반 페이지 공통 패딩(PC24px/36px)을 사용. 실제/목업 공통 반영.
- PC 브라우저에서 저장/좋아요 두 목록 모두 상단24px/왼쪽36px 확인. 사용자 재확인: 목업/실제 서비스는 동일 레이아웃·컴포넌트를 유지하여 공통 UI 수정이 양쪽에 반영되어야 한다. 데이터/API 주입만 분리한다.

### 2026-10-07 결제수단 등록 점검(수정 미실행)
- Toss 공식 v2 빌링 연동/코어 API와 소스 비교. 실제 UI는 requestBillingAuth→authKey→서버 빌링키 발급/AES-GCM 저장. 회원·소유권·중복등록·갱신 사용 카드 삭제 차단 존재. 실제 공급사 화면/승인은 계정 미설정으로 검증하지 않음.
- 보완: 목업은 안내 모달 후 가상 카드 즉시 추가라 PG 등록창 흐름 미재현; 실제 paymentGuidance 공백으로 안내 부족. 카드사 파싱이 공식 card.issuerCode 대신 card.company, 마스킹 숫자 제거 후 마지막4자리 추출도 표시 왜곡 가능.
- 보완: 삭제는 DB soft delete만 있고 공급사 billingKey 폐기 호출 없음. 결제 중 등록 뒤 원 주문으로 복귀 동선 없음. customerKey는 공개 프로필에도 쓰이는 member UUID 그대로라 별도 비공개 결제 식별자 권장. 등록 시도/복귀 상태 연계 및 authKey URL 정리도 미구현.
- 소스/브라우저 점검만 했으며 실제 카드 정보 입력·공급사 등록/삭제·결제 실행 없음.

### 2026-10-07 결제수단 등록 보완과 Chrome 검증
- 감사에서 발견한 문제 구현: 서버 등록 시도/state·비공개 customerKey, 원 결제 주문 복귀, 성공/취소/오류·재시도, authKey URL 즉시 제거(비로그인 포함). sessionStorage에 민감 authKey를 쓰지 않는다. 실제 카드 입력은 공식 Toss 창에서만 진행.
- 공유 결제수단 화면에 목업 데이터 주입 방식으로 카드 선택→등록 동의→본인 확인→등록 추가. 동의/올바른 코드 전 버튼 disabled. 실제 화면에는 가상 등록창이 나타나지 않는다. 기본 카드 변경·삭제·남은 기본 카드 복구 유지.
- 서버는 issuerCode·마스킹 표시 수정, PG 빌링키 폐기·worker 재시도·진행 결제 삭제 차단·비활성 계정 콜백 폐기 처리. DB 마이그레이션 및 계약은 백엔드 docs 참조.
- check267개/분리 복사본 production build 통과. backend 도메인17·HTTP13 통과.
- 실제 Chrome: 동의 전 다음 disabled, 잘못된 코드 등록 disabled, 선택한 삼성카드 등록, 두 카드 기본 전환, 삭제 confirm/기본 카드 복구; 실제 API503 안내·취소와 재등록 실패 메시지·위조 콜백 차단·주소 정리 확인. error/warn 로그 없음. 검증 중 발견된 재등록 오류 후 버튼 전환 문제 수정 후 재확인.
- 검증 이미지 `/tmp/crefans-billing-chrome-registration.png`. Toss 키가 없어 실제 공급사 창/발급/폐기는 미검증. 기존 `/preview` 링크 및 공통 표시 컴포넌트 구조 유지. 커밋/운영 배포 없음.

- 최종 확인: HTTP13개 프론트3010 프록시 경유 통과. 검증용 Chrome 탭과 임시 개발 회원/세션 정리. 로컬 front3010/API3001/worker는 실행 유지.

### 2026-10-07 출시 준비 점검
- 이번 작업은 출시 준비 조사이며 구현/전체 테스트 재실행/배포는 하지 않음. 최신 통과267은 UI·훅·기존 코드 검사 포함, 실제 제품 전체 흐름 E2E 보장 아님. 자동 Playwright/Cypress E2E, 신규 CI, 커버리지 측정 구성 없음.
- 신규 UI 출시 기본 경로 전환 필요: app/page.tsx는 기존 랜딩이고 Caddy는 이를 그대로 전달. 랜딩 에셋 모드의 샘플 프로필 /preview와 로컬 팔로우는 사용자 요청 유지 사항이지만 공개 출시 동선 확정 필요.
- 로그인 성공 후 이동 코드 없음; 프로필 사진/커버 변경 입력·저장 계약 누락 및 공개 이미지 권한을 실제 데이터로 검증해야 함. 대규모 관계 목록, 관리자 UI와 정산 마감/증빙은 추가 범위 판단 필요.
- production npm audit:7건(critical2/high4/moderate1). 실제 노출/패치 호환성 분석 필요. backend50건. 자동 수정하지 않음.
- 출시 차단/검증 순서는 백엔드 PROGRESS.md 출시 준비 점검 참조. 주요 E2E: 가입메일/PASS→로그인·세션/복귀→크리에이터 시작·미디어 발행→팬 결제·유료 권한→갱신/해지/환불→계좌·출금/운영 처리. 테스트 DB/회원/쿠키는 독립 격리, 공급사 sandbox 별도 검증.

### 2026-10-07 현재 버전 보존·브랜치 정리
- 사용자 승인: 현재 버전을 보존하고 프론트/백엔드 브랜치 정리. 제품 동작은 변경하지 않는다.
- 기존 원격 기본 브랜치는 main 하나이며 dev/prod가 없음을 fetch로 확인. main은 기존 배포 연동 때문에 보존하고, prod는 기존 origin/main 기준, dev는 승인한 현재 작업 전체를 보존한 초기 개발 기준으로 구성한다.
- 두 리포지토리에 동일한 checkpoint/crefans-pre-launch-20261007 annotated tag로 복귀 지점을 만든다. 기존 기능 브랜치는 이력이 dev에 포함된 경우에만 삭제한다. 강제 push/reset/운영 배포/원격 기본 브랜치 변경 없음.
- .DS_Store 변경은 제품 커밋에서 제외하고 로컬 파일은 보존한다. 외부 자격증명과 격리 DB/미디어/환경 파일은 커밋하지 않는다.

- 브랜치 정리 검증: npm run check267개 통과. dev=현재 승인 버전, prod=기존 운영 main 기준, main=기존 배포 호환용 유지. 적용 완료 migration과 기존 변경 이력은 재작성하지 않는다.
