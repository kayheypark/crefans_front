# PROGRESS: crefans_front

다른 에이전트가 이 파일만 읽고 이어받을 수 있도록 유지한다. 규약은 `AGENTS.md`.

## 현재 기준 (2026-10-24) — 모바일 14px 채택

- 사용자 확인으로 모바일 14px 버전을 채택했다. 767px 이하 팬 서비스·랜딩·공용 UI·디자인 카탈로그의 작은 글자를 14px 기준으로 표시하고 768px 이상은 기존 크기를 유지한다. 목업과 실제 서비스는 같은 CSS를 사용한다.
- 운영 프론트는 `crefans-front:mobile-14px-20261024`. 이번 브랜치 통합은 배포된 화면을 바꾸지 않는다. API/DB/admin도 변경하지 않는다. 이전 이미지 `crefans-front:membership-identity-20261024`와 복구 설정 `/opt/crefans-backup-mobile-14px-20261024`는 유지한다.
- 기존 운영 변경은 별도 기준 커밋 `c114533`으로 보존했다. 직전 이미지의 런타임 473파일과 일치하는 인덱스를 만들었고, 그 위에 23파일의 모바일 글자 크기·레이아웃 변경을 분리했다. 통합 경로는 `feat/mobile-14px-typography → dev → prod`이며 원격 병합 결과는 Git PR·브랜치 기록으로 확인한다.
- 검증: `npm run check` 283개 통과. 현재 런타임 473파일 모두 운영 14px 이미지 소스와 일치. 기존 최종 amd64빌드·12화면 모바일/PC 대조·320~1280px 경계 검수 증거는 `docs/audit/mobile-14px-20261024.json`. 이번 통합 검증은 `docs/audit/mobile-14px-integration-20261024.json`, 상세 명령·최종 원격 병합 영수증은 `.local/merge-mobile-14px-20261024/`에 보존한다.
- `.local/` 설정·실행 산출물은 Git에서 제외한다. 기존 작업 파일을 비공개 로컬 백업으로 보존했으며 강제 푸시·기존 커밋 재작성은 하지 않는다.

## API 바인딩 기준 기록 (2026-10-08)

- `/preview/*` 팬/스튜디오 목업·기존 링크는 유지. 신규 `/service/*`는 동일한 표시 컴포넌트를 실제 `/api/v1` 데이터 모델로 렌더한다. 기존 앱은 이번 바인딩 대상에서 제외.
- `components/service`, `features/service`, `lib/api/platform.ts` + 동일 출처 스트리밍 proxy. fixture import 없음. 브라우저 쿠키 세션·401 회전/재요청·탭 간 Web Locks, 로그인/이메일 가입 코드/서버 PASS proof 연결.
- 팬 feed/explore/profile/post/댓글 페이지·2뎁스 조회/메시지/알림/저장·좋아요/구독·결제 내역/결제수단/설정·문의, 스튜디오 onboarding/content/media/memberships/subscribers/community/reports/finance/계좌/PIN/출금 바인딩. 외부 미설정은 API 오류로 표시하며 가짜 성공/데이터를 넣지 않는다.
- 시작: `http://127.0.0.1:3010/service/feed`, `/service/login`, `/service/signup`, `/service/studio`. 로그인 전 보호 화면은 로그인 안내. 실제 개발 DB는 비어 있으므로 목업 인물/게시물이 나타나지 않는 것이 정상.
- front dev 3010은 하나만 실행. production build는 임시 checkout 복사본에서 수행(.next 충돌 방지). backend API3001 + 격리 MySQL3307 + worker. 운영 DB/외부 발송/실결제/은행송금 미실행.
- 구조/경로/모델 표: `docs/service-api-binding.md`; backend `docs/platform-implementation.md`, `docs/platform-api.md`, `docs/provider-contracts.md`, `infra/platform/README.md`. 양쪽 AGENTS에 재개 규칙 추가.
- 최신 검증은 `docs/audit/evidence.json`의 실행 명령·시각·종료 코드와 소스 해시를 기준으로 확인한다. 과거 작업 로그의 테스트 수는 그 실행 시점 기록이며 최신 수와 혼합하지 않는다.
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
- 신규 플랫폼은 멤버십 버전/구독 snapshot·서버 PASS proof·출금 PIN·19시 미디어 정리 worker를 구현했다. 관련 문서는 `docs/membership-versioning.md`, `docs/withdrawal-security-pass.md`, `docs/media-lifecycle.md`. 실제 PASS/은행 공급사 bridge·운영 배치 등록과 삭제 정책 검수는 남아 있다.

## 다음 할 일

- 운영체제 파일 선택 취소를 일반 브라우저에서 수동 확인한다. 이벤트 전파 회귀 검사는 통과했으나 자동화 도구가 해당 취소 조작을 지원하지 않는다. 병행 작업의 공통 `DateRangePicker` 추가 검증은 해당 작업 기록을 따른다.
- 사용자가 커밋을 요청하면 미커밋 변경을 정리하고 커밋(AGENTS.md 커밋 규칙 준수).
- 실제 모델/API 연결과 비밀번호 재설정은 완료. 다음 범위는 출시 시나리오의 공급사 실연동·운영 배포/이관·정책 확정·부하/복구 검증이다.
- 문서/코드 변경 후 `npm run check:docs`로 증거 유효성을 확인한다.

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

### 2026-10-07 게시물 미디어 업로드 형식 통일
- 서버 지원 형식에 맞춰 공통 파일 선택 accept와 작성 화면 안내, 목업 검증을 JPG·PNG·WebP / MP4·WebM으로 통일. MOV는 변환 연동 전까지 지원하지 않는다. 실제 서비스와 목업은 동일 작성 컴포넌트를 사용한다.
- 이미지5MB·영상300MB·합계10개 제한 유지. MP4/WebM 허용·MOV 거부 및 선택 형식 회귀 검사 포함 npm run check268개 통과. 실제 파일 업로드/브라우저 재검증은 이번 작업에서 실행하지 않음.

### 2026-10-07 구독 전용 게시물 권한 상태 보완
- 실제 서비스 refresh 시작 시 이전 본문·댓글·공통 결제 상태와 목록 커서를 제거. 세션 만료/권한 변경/로그아웃 후 재조회가 실패해도 이전 계정 콘텐츠를 화면 상태로 유지하지 않으며, 이전 generation 댓글 응답을 무시한다. 목업 구조는 유지.
- 지연 재조회/세션 실패/이전 댓글 응답 회귀 검사 추가. npm run check269개 통과. 백엔드 시작일·공유 미디어·캐시 정책 보안 보완 및 HTTP19/도메인17 검증은 서버 PROGRESS 참조. 운영 S3 정책/실제 CDN 검증은 이번 범위에 포함하지 않음.

### 2026-10-08 출시 검수 계획과 공통 조사 규약
- 사용자 요청으로 Codex 전역·/Users/ethan·두 리포 AGENTS.md에 애매한 구현/검증/정책의 공식 웹 근거 조사 원칙 기록. 사실/권장/사업 결정 구분, 공급사 대역과 실연동 검증 구분.
- 프론트 docs/release-test-scenarios.md에 97개 시나리오: 인증10·권한12·팬/콘텐츠10·결제16·정기결제15·환불12·수익/정산/출금12·운영10. 계정/데이터 준비, 실행 방식, 합격 조건, 미결정 정책, 증거 양식과 출시 판정 포함.
- Toss v2/코어API/FAQ/멱등성, OWASP 권한/세션/거래승인/회귀, 현행 전자상거래법17·18조 및 공정위 지침 공식 자료 확인. 현재 갱신/환불/계좌 코드와 교차 검토.
- 이번 작업은 문서/지침 작성. 시나리오 실행·실금융·외부 발송·운영 배포 없음. ID97개 고유성/그룹 연속성/표 구조와 diff 공백 검사 통과. 기존 미커밋 미디어/권한 보완과 .DS_Store 변경 보존.

### 2026-10-08 결제 수명주기 바인딩·Chrome 검증
- dev 기반 feat/billing-lifecycle-validation. 기존 변경 보존, 커밋/푸시 없음. checkout 중복 클릭 차단·미확인 주문 재조회·확정 실패 retry/pay 연결, 카드 콜백 로그인 복구·단일 처리 보완.
- 공통 CreatorPages 결제 내역에 실제 refundOrder 액션/2단계 확인/오류 및 refunding/refunded 표시 추가. 결제 내역 URL tab=payments 유지, 같은 크리에이터 구독 히스토리 복수 건 key 충돌 보완. 목업 링크와 공유 컴포넌트 구조 유지.
- npm run check273개 통과(타입/레이어/회귀 포함). backend build·도메인/결제 HTTP54개·별도 API 권한19개 통과. 실제 Chrome에서 대역 공급사+격리 DB로 결제→구독→갱신 해지→전액 환불→새로고침 후 결제 내역 유지·완료 상태 확인. 임시 테스트 회원/주문/API 정리, 일반 front3010/API3001 복구.
- 공급사 창/실제 Toss 테스트 승인과 취소는 미실행. 테스트 정책값은 미확정이며 환불 수수료/부분 환불·PASS/은행 bridge·97개 전체 출시 검수는 별도. 상세 계약과 출처는 백엔드 docs/provider-contracts.md.

### 2026-10-08 이메일·PASS·은행 연동 가정 검증 후속
- Chrome 실제 스튜디오 출금 화면에서 합성 회원으로 금액/계좌 검토·오답 PIN 거부·정답 접수·출금 내역·가용액 감소 확인. 검토 화면의 사용자 별칭 라벨을 '예금주 별칭'으로 수정하여 검증된 실명과 구분, 목업/실제 공통 컴포넌트에서 재확인.
- backend 신규 공급사 도메인17/HTTP7(24개) 및 전체78개 통과, 별도 API 권한19개·front check273개 통과. 공급사는 대역, SMTP는 loopback 프로토콜 수신 서버이며 실제 외부 발송/PASS/송금 없음. 상세 검증과 출처는 server/docs/provider-contracts.md.
- 임시 대역 API/합성 계정/주문 정리 후 일반 API3001 복구, 목업 링크와 front3010 유지. 외부 실연동·전체 출시 검수 완료를 의미하지 않는다. 커밋/푸시 없음.

### 2026-10-08 Playwright 반복 검증 도구
- 두 리포 feat/playwright-validation에서 기존 변경 보존. Playwright Chromium·PC/Pixel7, 전체/선택/화면 표시/UI 반복/HTML 결과 명령과 실패 스크린샷·영상·trace 구성. 기존 /preview 링크 유지.
- 프론트3011/.next-e2e·실제 Nest API3012·전용 crefans_platform_e2e DB 분리. 자동 migration·역할별 합성 회원/멤버십/주문 생성·finally/종료 cleanup. SMTP/Toss/PASS/은행은 테스트 응답 대역이며 실제 외부 호출/금융 없음.
- 최종 E2E47개 모두 통과: 목업 PC/모바일36개와 실제 서비스11개. 가입/이메일/PASS 팝업/로그인·유료 본문/첨부 GET HEAD Range·중복 승인/응답 유실/확정 거절/갱신/해지/환불·계좌/PIN/출금·로그아웃/세션 만료 검증. 프론트 check273개·별도 API 권한19개 통과, workflow YAML 파싱/diff 검사 통과.
- 실제 결함 수정: 가입 성공 후 refresh가 화면을 unmount해 완료 모달이 사라지는 동작 제거. 프로필 소개 영역이 팔로우 버튼 클릭을 가로막는 겹침 수정. Playwright에서 가입 완료·PC/모바일 팔로우 확인/취소/해제 재검증.
- E2E 회원/게시물/미디어/주문/구독/출금/인증 증명/문서 잔여0, 개발 DB e2e 회원0 확인. E2E3011/3012 종료, 꺼져 있던 일반 개발 front3010/API3001 다시 실행 후 HTTP200 확인.
- 수동 GitHub Actions 템플릿 작성(일회용 MySQL·report7일); 원격 실행/커밋/푸시 없음. 반복 절차/환경/경계 docs/service-api-binding.md. 실제 공급사 SDK/승인/송금/메일 전달·전체97개 출시 검수·부하/운영 복구는 미검증.

### 2026-10-08 문서 전수 현행화·검증 증거

- 문서 전체를 Git 추적+ignore되지 않은 미추적 파일로 인벤토리화했다. 현재 안내/혼합 역사/구형/에셋 생성 기록/계층도 원문을 분류하고 코드·설정·검사 경계를 대조했다.
- README/실행 안내·확정 API 래퍼·화면 카탈로그·프로필 여백 예외·멤버십 snapshot·PASS/PIN·media worker 상태의 오래된 설명을 수정했다. 구형 Cognito/비버전 API/Lambda/사업안은 경고와 현재 계약 링크를 추가해 보존했다. 계층도 원문은 그대로 유지한다.
- 공통 지침 두 곳과 양쪽 리포 AGENTS에 완료 주장별 합격 조건/실제 명령·결과/소스 해시·만료/미검증 경계 규약을 추가했다.
- 재현 도구: 프론트 `check:docs`, `test:docs`, `docs:contracts`, `docs:record`, `docs:prove`. 전체 현황/검토 근거는 `docs/audit/manifest.json`, 실제 실행 결과/시각/해시는 `docs/audit/evidence.json`(모두 프론트)에 저장한다. 최신 실행 결과는 증거 파일이 기준이며 실패·스냅샷만 저장한 경우를 완료 테스트로 해석하지 않는다.
- 자동 검사는 자연어 전체의 진실성·실제 공급사/운영 DB/배포/부하·복구를 보장하지 않는다. 자세한 범위는 프론트 `docs/documentation-verification.md`를 따른다.

### 2026-10-08 초기 출시 사업 정책 추천 조사

- 요청에 따라 수수료20%·7일 전액/이후 미제공기간 환불·14일+PG 실정산 확인·24시간 추가3회 재시도·1만원 주간 출금·회원/콘텐츠 범위 및 약관/개인정보 구성을 추천안으로 기록했다. 사용자 승인·운영 적용 전이다.
- 현재 환불 수수료 유지/부분환불 미지원·원장 가용액과 PG 현금 재원 차이·상품 비활성의 갱신 중단·가입시 성인 여부 미차단을 대조해 추천안 적용에 필요한 코드 차이를 명시했다. 제품·비밀값·지급 토글은 변경하지 않았다.
- 근거/확인일/미결정 계약은 `docs/release-test-scenarios.md`의 “초기 출시 정책 추천안”에 있다. 기존 전체 제품 테스트 증거는 `docs/audit/evidence-20261008-local-tests.json`, 이번 문서 검증은 현재 `docs/audit/evidence.json`으로 구분한다.


### 2026-10-08 로컬 개인정보 처리방침 작성지침 확인

- Downloads의 개인정보보호위원회2026.4 개정판185쪽을 확인하고 공식 게시일과 대조. 중복 파일은 SHA-256 동일,2025.4판과 구분했다. 원본을 Git에 복제하지 않았다.
- 관련 절의 처리 근거 구분·법정 기록 분리·수탁자/재수탁자·국외 조회/재이전·공개 정보·비로그인 접근·이전 버전 공개 기준을 출시 정책 추천 문서에 반영했다. 관련 쪽수/원본 경로/해시/확인 명령과 미검증 범위를 함께 기록했다.
- 추천안 보완만 수행하며 제품·사업 정책·공급사 계약·비밀값 변경 없음. 전체185쪽의 준수 검증/최종 법적 검토를 완료했다고 주장하지 않는다.


### 2026-10-09 홈 피드 빈 상태 가운데 정렬

- 공통 FeedPage에서 게시물 없는 경우에만 최대480px 제한을 풀어 본문 가용 폭 가운데에 안내를 배치했다. 목업/서비스에 같은 표시 컴포넌트를 적용하며 게시물이 있는 피드의 기존 폭·정렬은 유지한다.
- Playwright Chromium으로 로컬3010 /service/feed 확인: PC1440px 본문/안내 중심815px, 모바일390px 중심195px, 오차0px·가로 overflow 없음. typecheck 통과. 문서 증거는 snapshot으로 갱신하며 이전 전체 제품 테스트의 변경 소스 적용 증거로 간주하지 않는다.


### 2026-10-09 알림·내 프로필 비로그인 레이아웃 통일

- 같은 SignInPrompt를 쓰지만 내 프로필에 비로그인 상태에서도 flushMain 여백 제거가 적용되는 원인을 수정했다. 로그인한 내 프로필 기본 탭만 여백 제거를 적용하며 공유 ServiceShell에서 목업/서비스에 반영한다.
- Playwright Chromium 로컬3010 /service/notifications와 /service/me 비로그인 비교: PC1440px 안내 x326/y92/978×720·padding24/36/72, 모바일390px x16/y20/358×720·padding20/16/100으로 두 경로 동일. typecheck 통과. 전체 제품/공급사 검사는 이번 범위가 아니다.

### 2026-10-09 이메일 변경 코드 누락 수정 및 SMTP 시나리오

- 실제 이메일 설정 폼이 입력 코드를 API에 누락하던 문제를 e2e/mail.spec.ts에서 재현 후 수정. 목업 계약은 유지하고 live 요청에만 code 포함.
- 이메일 변경 및 비밀번호 재설정 E2E 추가. 기존 회원가입 E2E와 합쳐3개 통과, front check273개 통과. SMTP 수신 실제 코드로 가입 이메일 인증도 Chrome에서 완료. PASS 실가입/다른 메일 클라이언트 검증은 별도.
- 서버 HTML 메일3종 실제 연결, 11종 중 나머지8종은 템플릿만 준비. Gmail 스팸 미해결. 상세 증거 docs/audit/mail-verification-20261009.json 및 서버 docs/provider-contracts.md 참조.

### 2026-10-09 외부 서비스 연결 실행 안내

- docs/third-party-setup.md에 토스 빌링·PASS·지급대행·AWS/도메인/백업·S3/CDN·Google 전달성/선택적 SES·운영 알림의 공식 문서, 사용자 역할, 키 적용 위치, 추가 개발, 합격 조건을 정리했다.
- 지급대행의 별도 계약/JWE/셀러 본인확인과 테스트 법인 제한, PASS 내부 콜백과 공급사 콜백 차이, 현재 로컬 신규 업로드를 구분했다. 외부 신청/발송/과금/실금융/환경 변경 없음.
- 문서 검사 결과와 소스 증거는 docs/audit/third-party-setup-verification-20261009.json. 문서 검사 통과는 공급사 연동/운영 검증 완료가 아니다.

### 2026-10-09 서드파티 연결 재개 지침

- 후속 연결 요청 시 프론트 docs/third-party-setup.md를 먼저 읽고 추천하도록 AGENTS.md에 기록했다. 공급사 최신 조건 재확인과 키 입력/추가 개발 구분을 유지한다. 코드·환경·외부 서비스 변경 없음.

### 2026-10-21 토스 테스트 키 실연동 및 단건결제 연결
- 두 저장소 dev와 HEAD가 동일한 상태에서 feat/toss-test-integration 생성. 기존 미커밋 변경 보존, 커밋/푸시/가입비 결제 없음. 토스 개발 연동 체험 상점의 API 개별 연동 test 키만 server/.local/platform.env(0600, ignored)에 저장. 운영 키 없음.
- 실제 Chrome /service에서 합성 회원으로 카드 등록→빌링키 발급→1,000원 첫 승인 확인. 실제 Toss sandbox 조회와 DB 대조: 중복 승인 억제, 임시로 만기시킨 구독의 갱신 승인, 갱신 해지, 최초/갱신 2건 전액 취소, 빌링키 폐기/암호문 삭제 통과. 실제 출금 없음.
- 단건결제: payment-window/confirm API, SDK 일반 카드창, /service/payment/success|fail 연결. 기존 주문 금액/소유권/동시성/멱등/복구/원장을 재사용하고 한 달 이용권은 auto_renew=false. /preview 유지. 실서비스에 '한 달만 결제하기' 진입 추가.
- 실브라우저에서 카드 등록 성공 후 refresh가 결과 컴포넌트를 unmount하고 재등록 확인을 반복하는 결함 발견. 결과 화면에서 전역 refresh를 제거, 이동 시 데이터 재조회 유지. 회귀 검사 추가.
- 단건 창 신한·국민 모두 실제 카드사 인증 필요. 사용자가 지금 인증 어렵다고 답하여 일반 단건 최종 승인/실공급자 취소는 미검증. 창 호출만 성공을 승인 성공으로 기록하지 않음. 추후 신규 주문으로 카드사 인증→confirm→토스 NORMAL/DONE·DB 권한·환불 대조 필요.
- 검증: front npm run check(레이어·타입·274 tests) PASS, server npm run build 및 billing/payment lifecycle/HTTP 45 tests PASS. 금액 변조·타인 주문·중복·응답 유실은 공급사 대역+실DB 검사. docs/audit/toss-verification-20261021.json(front)에 범위/소스 해시/실공급자 결과 기록. 전체 E2E·운영 계약·실청구 검증 아님.
- 로컬 MySQL3307 및 front3010 실행. 마지막 코드 반영 후 API 재실행(node .local/toss-api.cjs)이 승인 단계에서 거절되어 API3001 종료 상태. 재실행 전 사용자 승인 필요. 임시 검증 launcher는 test 키+로컬 dev DB 강제, 수수료1000bps/보류0일/환불30일을 프로세스 안에만 설정(사업 정책 확정 아님), worker 미실행.
- 인수인계: server/.local/toss-fixture.json(0600)에 합성 fan/creator/plan/oneTimeOrder와 합성 로그인 정보, .local/toss-live-check.cjs의 audit/billing/one-time 모드 및 .local/toss-provider-evidence.json 존재. billing 모드는 이미 완료했으므로 다시 실행하지 말 것. 현재 단건 주문은 만료 가능. 미결제 테스트 fixture는 후속 인증을 위해 보존, 완료 후 대상 ID만 정리. 키/합성 비밀번호를 로그·문서에 출력하지 말 것.

### 2026-10-21 빌링 실서비스 상시 연결 후속
- 기존 /service 카드 등록→checkout→구독/결제 내역 연결에 API와 갱신 worker를 함께 실행하는 npm run dev:billing 추가. scripts/platform-billing-test.cjs는 로컬3307/crefans_platform_dev + 개별 test 키만 허용한다. API/worker 종료를 묶고 60초 갱신/승인 재조회/빌링키 처리 작업을 실행한다. 실제 청구 없음.
- 임시 개발 정책: 수수료1000bps, 정산보류0일, 환불30일, 재시도2회/1시간. 프로세스에만 설정하며 운영 정책/라이브 키는 변경하지 않음. 송금과 미디어 파일 삭제는 이 모드에서 비활성. 운영은 기존 배포 API/worker와 확정 정책·계약된 빌링 MID/live 키 필요.
- 백엔드3001 재실행 완료, front3010/DB3307 실행 중. 합성 테스트 회원으로 실제 Chrome 카드 재등록/멤버십 선택/1,000원 빌링 첫 승인/내 구독 DB 연결 재검증. 활성 구독과 등록 카드는 후속 사용 확인을 위해 유지(환불/삭제한 앞선 검증 건과 구분).
- backend build, 결제/설정/HTTP 47 tests PASS. 로컬 전용 launcher에 live 키·다른 DB 거부 대조 검사 포함. worker-health 완료/실패0 확인. Front 코드 변경 없음, 직전274 tests 증거 유지. 일반 단건 카드사 인증은 여전히 미검증.
- 검증 증거: front docs/audit/billing-binding-20261021.json 및 /tmp/crefans-billing-subscription-active.png. 후속 서버 시작은 server에서 npm run dev:billing, frontend는 기존3010 사용. 구형 .local/toss-api.cjs 대신 저장소 스크립트 사용. 실제 이용자 회원가입은 PASS 실연동 필요(기존 미해결).

### 2026-10-21 미이용 구독 전액 환불 API 사전 준비
- 사용자 확정: 기본 구독 종료는 갱신 해지 예약. 별도로 해당 크리에이터 유료 콘텐츠 미이용 결제는 100% 환불 API를 마련하되 진입 버튼은 두지 않는다. 기존 결제 상세 환불 버튼/확인 UI 제거, API/action은 보존. 종전 임시 환불30일 정책은 폐기, REFUND_WINDOW_DAYS는 현재 미사용.
- DB nullable usage_tracking_started_at/content_accessed_at 추가(migration 20261021070000). 신규 승인/갱신부터 추적, 도입 전 결제는 REFUND_USAGE_UNKNOWN으로 자동 환불 거부/수동 확인. 현재 Chrome 테스트용 활성 구독은 도입 전 결제이므로 미이용이라고 소급 판정하지 않는다.
- 서버가 유료 본문/미디어 제공 전에 현재 회차 최초 이용을 기록한다. 피드·프로필 피드·상세·모아보기·댓글·반응·미디어 직접 GET/HEAD/Range 포함. 기본 bootstrap은 유료 본문/미디어를 제외; /service/me?tab=saved|liked만 본인 collection query 요청. 공개 콘텐츠/프로필 정보/결제/설정/잠긴 콘텐츠/소유자 조회는 소비하지 않음. 화면 밖 콘텐츠·미디어 전송 중단/저장소 오류는 허용된 제공 요청 시점부터 보수적으로 이용 처리한다.
- GET /api/v1/checkout/:id/refund-eligibility 추가, POST /checkout/:id/refund에서 member 잠금 아래 재검사. 환불 청구 선행 시 refunding 동안 콘텐츠 비공개, 콘텐츠 선행 시 자동 환불 거부. 회차별 분리, 중복/응답 유실 재조회 유지. 전액 취소 확정 시 gross 전액 반환·fees/net 0 반전, 이후 독립 결제 보존. 법정/오결제 등 수동 예외 권리까지 배제하지 않는다.
- 로컬 격리3307 DB에 migration 적용, API3001+갱신 worker를 새 코드로 재시작. 실제 PG 취소는 실행하지 않았다. front check(레이어/타입/274 tests), backend build 및 접근보안/빌링/설정/환불 HTTP·DB 60 tests PASS. 공급사 대역+합성 계정/로컬 DB 검증이며 운영 금융/전체 E2E 검증 아님.
- 근거/정책 상세: server docs/provider-contracts.md, front docs/service-api-binding.md. 소스 해시/명령/환경/범위 증거: front docs/audit/unused-refund-20261021.json. 후속: 필요할 때 환불 가능 여부 API에 UI 연결, 과거 결제 수동 심사·운영 예외 화면·운영 PG 검증 별도. 커밋/푸시 없음, 기존 미커밋 작업 보존.

### 2026-10-21 누적 작업 브랜치 정리
- 원격 fetch/prune 확인: dev는 작업 시작 HEAD와 같고, feat/toss-test-integration에 누적 미커밋 코드/테스트/문서를 보존해 PR을 통해 dev로 통합한다. prod/main에는 반영하지 않는다. 단건/빌링/미이용 환불, SMTP 템플릿, 공급사/Playwright/문서 검증 등 동일 사용자 요청의 누적 작업을 함께 보존한다.
- 중복 feat 브랜치는 dev에 이미 포함된 동일 시작 커밋만 가리킨다. 독자 커밋이 없는 로컬 브랜치만 -d로 정리한다. 현재 작업 브랜치는 PR 통합 확인 후 정리하며 강제 push/히스토리 재작성은 하지 않는다.
- Finder .DS_Store 변경은 코드 커밋에서 제외하고 별도 Git stash로 보존한다. ignored .local/env/인증 자료는 stage하지 않는다. 새/변경 텍스트의 실제 키 형태 검사와 staged 파일 목록·diff --check 확인을 수행한다.
- 직전 코드 검증(front check 274, backend build+60 tests) 및 unused-refund-20261021.json 소스 해시를 보존한다. 이번 정리는 애플리케이션 코드 변경 없이 커밋/브랜치 정리이며 Playwright workflow 기본 backend ref만 dev로 갱신한다. 문서 계약/스냅샷을 갱신하고 check:docs를 재확인한다. 실제 결제/환불/운영 배포 없음.

#### 브랜치 정리 실제 결과 및 원격 전송 보류
- 코드 보존 커밋: `8727423`. 현재 로컬 브랜치는 feat/toss-test-integration이며 dev/main/prod는 변경하지 않았다. 각 저장소에서 dev의 조상으로 확인된 중복 feat 브랜치 5개만 git branch -d로 삭제했다. 삭제 대상에 독자 커밋이 없음을 merge-base --is-ancestor로 확인했다.
- .DS_Store 변경은 각 저장소 stash@{0} "Finder metadata preserved before branch cleanup"에 보존했다. git status --short 빈 결과로 작업 트리 정리를 확인했다. .local/env는 ignored 상태, stage된 파일에는 포함하지 않았다. credential-like 패턴 대조 입력 탐지/대상 파일 무검출, staged diff --check 통과. 이 검사는 모든 비밀정보의 부재를 보장하는 완전한 탐지는 아니다.
- GitHub 원격 fetch는 성공했다. 두 origin은 공개 저장소이며, 자동 승인 심사가 공개 저장소로 전체 코드/문서/검증 기록을 push하는 명시 승인이 부족하다는 이유로 전송을 거절했다. 우회 전송하지 않았다. 원격 기능 브랜치/PR/merge는 만들지 않았으며, 사용자가 공개 업로드를 승인하면 기능 브랜치를 push하고 PR을 통해 dev에 통합한 뒤 로컬/원격 기능 브랜치를 정리한다. 운영 main/prod는 그대로 유지한다.
- 문서 계약과 snapshot 재생성 및 npm run check:docs PASS(56문서/81 API/41화면/11 migrations). snapshot-only-not-test-proof이며 기존 274/60 코드 검사 증거를 별도로 보존한다. 이번 추가 커밋은 작업 상태/증거 문서 기록이다.

### 2026-10-21 수수료율·정산 보류의 DB 관리 구현
- 사용자 요청으로 수수료율/정산 보류 원본을 financial_policies의 platform 행으로 전환했다. 최초 신규 결제 claim transaction에서 DB를 읽어 platformFeeBps/settlementHoldDays/financialPolicyVersion을 snapshot으로 보존한다. 변경 후 신규 가입에는 즉시 적용, 기존 구독 갱신·처리 중 승인 복구는 기존 snapshot 유지. env 키는 미사용이며 DB 미설정 시 신규 결제를 차단한다. 출금 수수료/최소 출금액/재시도 DB 관리는 이번 범위가 아니다.
- GET/PUT /api/v1/admin/financial-policy 및 GET /history 추가. 활성 SUPER_ADMIN만 가능. 정수bps0~10000/보류0~365/version/필수 사유 검사, version 조건부 변경으로 동시 수정409, 변경자·이유·시각 포함 financial_policy_changes 기록을 같은 transaction으로 반영한다. 감사 저장 실패 시 정책도 rollback. 관리자 UI는 추가하지 않았다.
- migration 20261021080000_db_financial_policy는 빈 version0 행만 생성한다. 운영 값은 미정이다. 기존 로컬 test10%/0일은 dev:billing이 최초 미설정 행에만 초기화하고 이후 DB 수정값은 재시작으로 덮어쓰지 않는다. 로컬3307에 적용, API3001/worker를 새 코드로 재시작했다. 실금융·운영 변경은 없음.
- 반복 검사 npm run test:policy(빌드+8 tests). 기존 E2E DB를 named lock으로 단독 사용하고 사전 정책/이력 복원·합성 fixture 삭제. E2E runtime도 같은 lock 사용. 새 임시 DB 생성 시 기존 사용자 권한1044로 실패했고, 새 DB ALL PRIVILEGES 부여는 자동 심사가 거절했다. 권한 변경은 실행하지 않고 기존 E2E DB 사용으로 해결했다. 추가 관리자 승인을 요구하지 않는다.
- 검증: backend build, 정책 HTTP/DB 8 tests 및 기존 금융·빌링·환불/출금 회귀60 tests PASS. 권한 거부/invalid/동시 수정/감사 실패 rollback/환경값 fallback 거부/정책 변경 후 신규 적용·기존 갱신/승인 복구 보존/0%/초기화 미덮어쓰기 포함. 공급사 대역이며 실제 PG 결제/환불은 실행하지 않았다. API/문서 계약 재생성 및 check:docs로 현행화한다.
- 증거: front docs/audit/db-financial-policy-20261021.json. 공식 권한/감사 근거와 예시 JSON은 server docs/provider-contracts.md 및 infra/platform/README.md. 다음: 필요한 경우 관리자 UI 연결, 사업자가 운영 수수료율/보류를 승인해 등록. 원격 공개 push는 앞선 승인 보류를 유지하며 수행하지 않는다.

### 2026-10-21 EC2 베타 배포 준비 및 승인 대기
- 사용자 요청 구성: 서울 t3a.medium 1대, gp3 암호화50GiB, IPv4 1개, beta.crefans.com, 같은 호스트의 front/API/worker/MySQL/Caddy. 베타 백업 생략, Toss test 전용·출금/파일삭제 off. 기존 IAM 역할/정책은 변경하지 않는다.
- AWS 계정/기존 VPC·공개 subnet·Canonical Ubuntu24.04 AMI·기존 SSH 키 일치를 읽기 전용 확인했다. 기존 도메인/SG/DB를 덮어쓰지 않고 별도 베타 SG와 DNS를 계획했다. 새 SG 생성 시 자동 승인 심사가 공개80/443 및 관리 PC /32 SSH 범위의 별도 승인 부족으로 거절했다. 명령은 실행되지 않았으며 AWS 인스턴스/EIP/DNS/권한 변경 없음. 구체적 범위·비용·SMTP/Toss test 설정 전달을 묶어 사용자 승인 요청, 우회하지 않음.
- frontend .dockerignore에 .local/세션/결과/중첩.env 제외 보강. backend infra/platform/bootstrap-ubuntu.sh와 compose.beta.yml로 공식 Docker 설치·로그 제한·키 SSH·2GiB swap·메모리 한도와 검증 이미지 태그 지정 준비. 비밀 설정과 이미지 archive는 ignored .local/aws-beta 아래만 보관, AWS 관리자 키 제외. GitHub push/운영 데이터 복제/기본 관리자 생성 없음.
- 로컬 Docker credential helper 지연은 개인 설정을 수정하지 않고 공개 이미지용 빈 auth config+기존 공식 Buildx/Compose plugin으로 해결. front/API linux/amd64 빌드 PASS, front check 레이어/타입/274 tests PASS. 새 격리 Docker MySQL에12 migrations PASS, Caddy 경유HTTP8 checks PASS(health v1 envelope, service3/preview3, 익명 admin401). Chrome hydration 피드/로그인 안내/목업 프로필 확인, 관측 console error0. 이미지 일반 사용자/로컬 비밀 폴더 제외 확인. 테스트 전용 컨테이너/볼륨 정리하며 기존3010/3001/3307과 사용자 DB는 유지한다.
- 근거·소스해시·명령 결과: front docs/audit/aws-beta-preparation-20261021.json. 설치/보안 공식 근거와 절차는 server infra/platform/README.md. EC2 생성·공개DNS/TLS·원격SMTP·PASS/은행/운영금융은 미검증이며 배포 완료가 아니다. 새 DB의 PASS/공개약관/금융정책 미설정 차단을 유지한다.

### 2026-10-21 사용자 승인 후 EC2 베타 배포 실행
- 사용자가 구체적 구성에 "승인"으로 답해 기존 자동 심사 차단이 해소됐다. 동일 AWS 계정849615239502/서울, 승인된 웹80/443 공개·관리PC /32 SSH·기존 키·SMTP/Toss test 비공개 전달 범위로만 실행했다. 새 IAM 권한/역할/키는 만들지 않았다.
- 신규 자원: EC2 i-0c24409aae93555f2, SG sg-0fa9862683387a4df, 암호화 gp3 50GiB vol-0bce242d71aed98bc, EIP15.164.140.26, beta.crefans.com A(TTL60). 기존 apex/메일 DNS/기존 DB/보안 그룹은 변경하지 않았다. 실제 과금 시작됨. Standard credit/IMDSv2 required/hop1/no profile/정확한 ingress 10항목 명세 대조 PASS.
- 공식 Ubuntu24.04 bootstrap 완료, Docker29.9.2/로그 회전/키 SSH/루트 EBS 내2GiB swap. AWS 콘솔의 ED25519 호스트 지문과 SSH 스캔을 대조한 known_hosts만 사용했다. 이미지 원격 SHA256 원본 일치, 환경파일600/디렉터리700 확인. 원격 업로드는 앱 이미지와 승인된 SMTP·Toss test 설정만 포함, AWS 관리자 키·로컬 DB·회원/결제 fixture는 제외.
- Caddy `/`를 `/service/feed`로302 연결해 구형 root 앱 대신 신규 실제 피드로 진입하도록 배포 설정 보완. /preview/* 유지. 새 Docker MySQL 초기화 및 마이그레이션·앱 시작 진행 중. 실행 기록 /tmp/crefans-beta-remote-deploy.log, 리소스 추적 .local/aws-beta/resources.json. 공개 HTTPS/SMTP 연결/브라우저/worker 최종 검증은 이어서 수행하며 아직 완료로 주장하지 않는다.

#### EC2 베타 배포 최종 검증 결과
- https://beta.crefans.com/service/feed 및 /preview/landing 공개 접속 완료. 루트302→신규 피드, HTTP308→HTTPS. 실제 유효 인증서로14 HTTP checks PASS: 서비스4/목업3/루트/환경경로2/health/익명admin401/업로드401/잘못된Origin403. source Caddy와 원격 설정 SHA 일치. five containers running, MySQL healthy, host 공개는 proxy80/443뿐. 실제 DB12 migrations 완료, worker-health tick 완료·failures{}.
- Chrome 실도메인에서 피드 빈 상태/알림·내 프로필 로그인 안내/랜딩 목업 hydration 확인, 관측 error0. 서비스/목업 탭 유지. 새 DB 회원·구독·주문0과 금융정책 version0/null 확인. 정상적인 미설정 차단을 보존했다. SMTP 원격 STARTTLS·인증 PASS이며 메일은 보내지 않았다. Toss test 전용·출금/미디어삭제 off·AWS 키 미전달 확인.
- 최초 /.env,/runtime.env 요청은 구형 포괄 페이지의 HTML200이었다. respond 단독 차단도 Caddy 자동 정렬 때문에 fallback handle 이후가 되어 HTTP 검사가 다시 실패했다. 공식 handle/directive order 확인 후 같은 레벨의 handle matcher로 수정, Caddy validate/reload 및 공개 재검사404 PASS. 초기 실패/수정 증거를 함께 보존하고 검사 기대값을 완화하지 않았다. 원격 셸 heredoc에서는 compose run stdin 소비를 확인해 앱 시작을 별도 명령으로 실행했고, 후속 절차에는 -T --interactive=false 명시.
- 원격 임시 업로드 archive만 제거, 실행 이미지·/opt/crefans 비밀설정·DB/미디어 volume과 로컬 비공개 release는 유지. 디스크 약39GiB 여유. AWS 자원 비용 발생 중이며 backup은 요청대로 없음. 기존 apex/메일DNS/IAM/로컬 실행 서비스는 변경 없음. GitHub push/실금융/실메일 발송 없음.
- 상세 증거 front docs/audit/aws-beta-deployment-20261021.json 및 server infra/platform/README.md. 준비 증거/274 tests/빌드 이력은 aws-beta-preparation-20261021.json을 보존. 코드 변경은 Caddy 루트/민감경로 처리이며 원격 validate/HTTP를 검증, 제품 테스트를 이유 없이 재실행하지 않았다. 문서 계약·snapshot/check:docs 후속 갱신.
- 남은 것: PASS 실연동, 게시할 약관·금융/갱신 정책 확정, 이후 실제 가입/결제/구독 시나리오, 실메일 수신/운영 부하·복구 검증. 빈 DB의 worker tick/SMTP 인증/배포 성공을 상용 출시나 금융 전체 검증 완료로 해석하지 않는다.

### 2026-10-21 PASS 실제 연동 재개 조사
- 사용자 요청으로 기존 IdentityProvider/IdentityController 및 서드파티 연결 안내를 확인했다. 로컬/배포용 설정에서 PASS 공급사 정보 미설정, 공개 beta identity/start signup 요청은503/PASS_NOT_CONFIGURED를 확인했다. 공급사 호출 전 거부하는 경로이며 실제 휴대폰/SMS 인증은 발생하지 않았다. 기존 계약 업체/공식 문서 유무를 사용자에게 질문했고 확인 대기다.
- NICE 공식 휴대폰본인확인 상품(PASS 지원)·사업자 신청·모듈 배포 절차를 재확인했다. 공식 문서의 상품/계약과 실제 암호화/API 명세를 구분하며 비공식 블로그/타 공급사 테스트 키를 가져와 구현하지 않는다. 기존 계약이 없다면 NICE 우선 후보로 신청 준비 항목을 front docs/third-party-setup.md에 정리했다. PortOne도 조사했지만 휴대폰 확인과 통합인증 상품/계약이 다르므로 임의 전환하지 않았다.
- 런타임 코드/배포/환경/가입·성인인증 보호를 변경하지 않았다. 공급사 미선정·공식 명세/키 미확보 상태에서 본인인증을 가짜 성공시키지 않는다. 계약·요금 동의·외부 문의 발송 없음. 다음: 사용자 기존 계약 확인→정확한 공식 명세/테스트 자격정보 확보→전용 브리지 구현→보안 대역/실공급사 인증→베타 반영. 증거 front docs/audit/pass-readiness-20261021.json. 이번은 조사/문서 변경으로 제품 유닛 검사를 불필요하게 재실행하지 않으며 문서 계약/스냅샷 확인을 수행한다.

### 2026-10-22 크레팬스 운영 알림·주입 방어 구현 및 격리 검증

- `[crefans] operations` 전용 채널, 무작업 worker1시간 요약을 사용자 확정. 서버 feat/operations-security에서 기존 금융정책/베타 배포 미커밋 변경을 보존하고 신규 작업, 프런트는 UI 변경 없이 문서·감사 증거만 갱신한다. 양쪽 기존 feature는dev의후손이어서 현재base를이어새branch로분리했으며reset/stash/기존커밋재작성없음.
- 오류5xx/실행중치명예외·batch, 가입/구독/갱신/해지예약/콘텐츠CRUD/예약공개/팬·크리에이터프로필 이벤트, 안전 metadata와 실제IP, DBoutbox/retry/중복제한, 고신뢰query주입탐지와24시간API차단 구현. 상세는 server docs/platform-implementation.md, infra/platform/README.md. DB14 migrations은 격리3307에만 적용. 베타원격은아직12 migrations/이전이미지.
- build와도메인/금융/인증/권한/HTTP/security/operations **160tests PASS/0skip**. 기존API3001은test PG설정이라미설정기대검사2개실패, 별도API를수동bootstrap한2차검사에서는cache/originmiddleware누락으로2개실패. 최종실제main을임시포트에서키없이실행하여160/160PASS. 기존실행API/프런트/worker설정유지. 전용DB·공급자대역이며실금융/실메일/실Telegram아님.
- 실제Caddy컨테이너+echo upstream에서고정proxyIP/위조전용IP헤더덮어쓰기/CF제거/민감경로404/루트302 PASS. 테스트컨테이너/네트워크 finally정리. APIHTTP에서오류IP·원문에러미노출·탐지/차단/해제큐확인. 실DB잠금·동시성·rollback, 대역429/발송장애/잘못된채널거부/시간요약/치명오류종료대조포함.
- 전용봇토큰/채널ID는기존privateenv3곳에없음. NC·UBA설정재사용없음. 사용자에게BotFather전용봇생성·채널게시권한추가·privateenv토큰입력을요청했다. 새key이름을빈값/주석과함께private설정및runtime.env.example에추가. 전용채널존재는TelegramUI확인했지만봇연결/실수신은미완료. 보안접근을넓히는봇생성/게시권한은사용자진행필요.
- 현재미완료: 전용봇연결→실수신테스트→새MacIP의AWS SSH접속승인/연결→베타migration/이미지/Caddy/네트워크교체와운영검증. 앱초기DB실패/OOM/강제종료는외부가용성모니터필요. 모든SQL난독화/자유본문/정적페이지를막는WAF라는주장금지.
- 증거 docs/audit/operations-security-20261022.json. 문서계약을검토후재생성하며docs:record는snapshot-only임을유지,check:docs와test:docs를별도수행한다. 이전전체프론트E2E를재실행한것으로확대하지않는다.

- 최종 추가 검증: 실제 main을 사용한 격리 API 포함160/160 재검사PASS(2026-10-22 00:05 KST), real Caddy header검사PASS, Compose+beta 병합config exit0. 처음 logging anchor 삽입이 depends_on/volume에도 들어가 YAML검사실패하여 해당삽입만수정하고 config재검사PASS. 일반API3001/DB3307/프런트3010기존프로세스유지. 테스트생성 후회원정리로고아가된합성outbox209건만 제거(모델신규적용이후fixture, 실제회원이벤트없음),미래전용봇연결때테스트잔여전송방지. 실제봇확인CLI는자기합성이벤트ID만전송하도록제한,치명오류역시해당이벤트를우선전송하고6초이내비정상종료. 봇신규연결/베타운영배포는아직미완료.

- 검토 후 보완(2026-10-22): Telegram429 대기는 개별 큐 항목뿐 아니라 API/worker 공용 PlatformJob gate에 반영하여 다른 이벤트가 제한을 우회하지 않도록 했다. 재시도 미래시각은 실제 응답 시각 기준이며 fatal/연결확인 CLI는 해당 이벤트ID만 선택한다. 연기된 retry_at 갱신은 처리건수0으로 반환하여 매분 잘못된 완료알림을 만들지 않는다. 실제 갱신 자동종료도 구독해제 이벤트에 포함. 새 대조검사·최종 재검증 결과는 감사 증거를 따른다.

- 최종 소스 검증 확정: 2026-10-22 00:09~00:10 KST 실제 Nest build exit0, 도메인/금융/권한/HTTP/운영알림/실DB 보안 **162 PASS/0 FAIL/0 SKIP**. 내부 배치 오류는 job/errorType/안전한 내부 errorCode를 즉시 기록하고 원문 메시지는 제외한다. 전체 시나리오의 실공급사 결제·Telegram실수신·프런트E2E를 수행했다고 주장하지 않는다. 최신 audit/operations-security-20261022.json이 소스SHA/명령/시각/종료코드와 미검증 경계를 보존한다.
- Prisma migrate CLI는 사전검사한 로컬3307/dev DATABASE_URL을 명시 전달하여 새2개 migration을 적용했으며 로그에 일반.env 자동로드가 표시되었다. 이후 새 런타임/테스트는 일반.env를 로드하지 않는다. 명시 환경변수 우선으로 실제대상은 로컬dev DB였고 운영DB 접속/수정은 없었다. schema validate는 임시사본+명시dummyURL로검증했다.

## 2026-10-22 운영 알림·API 주입 방어 베타 배포 완료

- 사용자 명시 배포 지시로 beta.crefans.com에 API/worker `crefans-api:operations-20261022` 반영. image sha256:48763dc75668cf5c92dced009bcc6b85ab986885475ee22279d610e00abee0be. 프런트 기존 beta-20261021 유지, `/preview` 링크 유지. 로컬162검증 대상의 operations/security/jobs/Prisma 원문 SHA와 실제 컨테이너 일치 확인. 신규2개 migration 포함 실제DB14개 완료, API/worker/DB/frontend/Caddy5개 running.
- 공개HTTPS14검사PASS(서비스/목업/루트/TLS/민감파일404/401·Origin403/no-store), 실제 외부접속원 보안6검사PASS: 전달IP헤더 위조 무시·실제IP/고정proxy172.30.90.2 기록, 첫SQL403→두번째 API차단→정상health403→본인테스트차단만만료처리→해제기록/health200, PASS 미설정503 오류의 IP/outbox 보존. 실가입/실금융/실메일 없음. 실제회원/구독/주문0, 출금·미디어삭제 false 유지.
- worker 매분 실행·worker-run3건/worker-health failures{} 확인. 무작업1시간요약은 로컬 시계검사 통과이고 운영에서1시간 실제 경과 수신검사는 아직 아님. 전용 Telegram token/chatID는 원격에도빈값이므로 이벤트4건은큐에유지. Telegram 실발송/수신 완료라고 주장하지 않는다. 전용봇 생성/채널게시권한/비공개값 입력 후 실제 수신검증이 남았다.
- 실제배포 중 두문제 발견·복구: Docker --env-file이 Compose dotenv 따옴표를 그대로넘겨 사전DB URL검사실패(마이그레이션전/기존앱유지), Compose run --rm --no-deps -T --interactive=false의정식env파싱으로수정. 이어고정proxy .2와동적IP 충돌로자동롤백, 기존설정·이미지·네트워크재기동확인후 dynamic ip_range172.30.90.128/25 분리. 실제Docker회귀검사에서API를자동주소할당한뒤Caddy .2 기동/헤더검증PASS, 최종운영네트워크도동일범위. 초기 readiness502는기대한envelope200까지제한재시도. 실패로그는비밀값제거후Git밖에보관.
- 데이터/미디어/인증서 named volume3개 보존. 사용자 베타정책에따라DB백업을새로구성하지않았으며 설정·이전이미지 롤백자료는 원격 /opt/crefans-backup-operations-20261022 (0700). DB 역migration 없음. 배포스크립트는 `.local/aws-beta/operations-release/deploy.sh`, 원격이미지archive는로드·SHA대조후제거. 기록된이전태그/설정으로복구가능하나추가형schema14개는유지한다.
- 관리PC IP 변경으로 기존 /32가맞지않아 배포전용 현재IP TCP22 /32 임시규칙만CLI추가. 검증후해당규칙ID만삭제했고원래3 ingress권한복원확인. 80/443 기존공개와DB/API/Next 비공개유지, IAM/DNS/기존규칙수정없음. 이후SSH는다시허용된관리IP에서만가능하다.
- Chrome 실제 /service/feed 재접속과 /preview/creator/haneul 목업 내용확인, 피드화면증거저장. 배포·구성·실동작증거 front docs/audit/operations-deployment-20261022.json. 실제클라이언트IP·민감설정은공개증거에복제하지않고ignored private자료에만보관한다. 공식Docker ipam의 ip_range 정의확인2026-10-22: https://docs.docker.com/reference/compose-file/networks/#ipam.
- 다음: 전용봇연결/실수신·실제1시간요약/초기DB실패·OOM 외부감시 구성. PASS/은행/운영금융정책·상용가입/결제검증은별도미완료. 이번배포를상용출시완료로해석하지않는다. 애플리케이션소스변경없고배포네트워크설정과관련실Docker회귀검사만수정했으므로162금융/도메인검사를불필요하게재실행하지않았다.

## 2026-10-22 운영자 콘솔 존재 여부 조사·최소 구성 제안

- 사용자 질문에 코드 읽기 전용 조사. 신규 crefans_front app/components/features/lib/types에서 admin 화면/호출 미발견, 기존crefans_admin별도프로젝트의dashboard/users/posts/media/board/reports/login은존재. 해당프로젝트는비버전/admin/auth·/admin계약이고서버src/admin/admin-auth.controller.ts는Cognito인증. 신규플랫폼자체인증/api/v1과그대로호환되지않는다. 레거시관리자실행/별도외부호스팅가용성은조회하지않았다.
- 신규 PlatformAdminController에는11개endpoints(금융정책조회/수정/이력, 문의목록/답변, 신고목록/처리, 문서목록/저장, 카테고리설정,광고노출설정). PlatformAuthGuard+활성Admin권한, 금융정책최고관리자제한. 현재베타Compose에는관리자전용컨테이너없고신규프런트관리화면없음. URL의HTML200만으로화면존재를판정하지않는다.
- 제안(아직구현지시/정책확정아님): 운영현황, 회원·크리에이터, 콘텐츠·신고, 결제·정산조회, 고객지원, 운영설정 6메뉴의작은콘솔. 기존신규API/공유폼·표재사용. 초기에는임의환불/송금/일괄강제삭제기능을추가하지않고현상조회·신고숨김·문의답변·문서게시·이미DB화한수수료/보류기간에집중. 회원상태/게시물숨김/관리자결제조회/운영기록API는추가필요.
- 관리자권한은서버검증/최소권한, 변경과보안기록은민감값제외감사기록을기본설계요건으로제안. OWASP Authorization/Logging Cheat Sheet 공식문서확인2026-10-22. 이번은구현/권한부여/배포/금융실행없음, 제품테스트불필요. 근거파일·HEAD·SHA·검색범위는front docs/audit/admin-console-inventory-20261022.json. 다음은사용자구체구현지시후범위확정·화면/API보완.

## 2026-10-22 독립 운영 콘솔·매출 조회 구현

- 사용자 지시: 매출 조회 포함, 프론트 프로젝트에 넣지 않고 소스·리포 분리. 별도 crefans_admin(feat/operator-console) 신규 /console 런타임을 구현, 서비스프론트 app/components/features/lib/types diff 없음. 기존레거시관리자URL은새콘솔로redirect, Cognito/비버전API/AuthProvider 런타임제거(미사용파일참고보존). 클라이언트토큰저장/기본계정 없음.
- 메뉴6개: 운영현황, 회원·크리에이터조회, 콘텐츠메타/신고처리, 매출·정산조회, 문의답변/공지FAQ, 금융정책/약관. 매출은KST최대366일/승인일원장/환불원기간귀속/전체·일별·크리에이터20명페이지. 수수료비용차감전·테스트결제포함가능·현금흐름/회계매출/순이익/PG대사아님을표시. 결제내역생성일/출금전체기준명시. 실패/미승인제외,민감PG/회원필드select제외,동일RepeatableRead스냅샷.
- 신규7개 /api/v1/admin 조회API: me/overview/members/posts/revenue/payments/withdrawals. 활성Admin서버guard유지, 금융조회ADMIN/SUPER_ADMIN, 정책SUPER_ADMIN. 문의/문서/신고변경은관리자·대상ID outbox와원자저장, 원문미포함. 신고PENDING경합201/409, 자동숨김아님. 기존금융정책버전/사유/감사유지. local3002 Origin기본값추가, 운영명시목록은수동설정필요.
- **초기버전제외**: 회원강제정지/콘텐츠숨김복구·관리자보호미디어상세/환불·송금버튼/PG테스트운영분리/발생일기준환불현금흐름. 운영콘솔전체완성/출시가능을주장하지않는다. 다음은운영배포·실관리자계정지정과필요시강제조치권한/감사설계.
- 검증: 서버Nest build exit0, 격리MySQL 관리자8+기존금융정책8=16 PASS, 콘솔타입+단위3 PASS, real-main/실DB Chromium E2E4 PASS(실로그인/조회/답변저장/신고/잘못된Origin403/API503대조/모바일). production build exit0. 초기E2E alert locator2건실패는Next announcer중복선택으로수정후전체4재검증. 이전162검사를이번에다시돌렸다고확대하지않는다.
- 관리자기존Next14.2.32취약점조사후15.5.28 + PostCSS8.5.31 동일메이저override. 공급사보안릴리스/OWASP/Toss공식문서확인. 최종 npm audit --omit=dev 취약점0/exit0, 개발도구포함moderate2/high8/critical0(미해결10건). 강제메이저일괄업데이트없음. 빌드/E2E재실행으로override호환확인.
- 로컬기존billing-test API/worker를동일설정으로재시작해새관리자API반영(운영DB아님), 콘솔loopback3002기동. /login200·익명/admin/me401·서비스3010/feed200. 기본관리자생성/권한부여/운영배포/실결제·외부발송없음. E2E3013/3003/.next-e2e와운영개발DB/3010/3002캐시격리,합성데이터정리.
- 증거: /Users/ethan/repository/crefans_admin/docs/verification-20261022.json에HEAD/dirty/소스SHA/명령/시각/exit/대조검사/미실행범위. docs/screenshots에합성매출PC/모바일화면. 과거admin-console-inventory는구현전시점기록으로유지하며현재상태는본로그와새증거가우선한다.

## 2026-10-22 독립 관리자 운영 배포·Telegram 실연결 완료

- 사용자 명시 요청으로 https://admin.crefans.com/console 배포. 동일EC2에별도crefans_admin소스/이미지/standalone·비루트·readonly컨테이너384MiB를추가. ADMIN_IMAGE=crefans-admin:console-20261022, API/worker=crefans-api:admin-20261022, 서비스프론트beta-20261021/목업유지. Caddy는관리자admin/auth3종만직접API전달하고다른API404,실제IP헤더덮어쓰기유지. 정확한admin Origin추가,host-onlySecure쿠키확인. 새EC2/IAM/DB백업없고apex/메일DNS변경없음.
- 요청 이메일은 기존 사용자 이메일의 한영전환 입력으로 해석. 운영DB미존재를확인후운영자1명만명시bootstrap(SUPER_ADMIN활성). 기존회원있으면덮어쓰기거부,비밀번호는salted scrypt해시로만전달저장·로그미출력. email_verified는수동운영자확인이지SMTP챌린지/PASS성공이아님. Chrome실로그인·운영매출0조회PASS,실제회원1/주문0. 금융정책값을임의설정하지않음.
- 별도실행승인후공식BotFather에서crefans_operations_bot(CREFANS Operations)생성, [crefans] operations에게시만허용. 정보변경·메시지수정삭제·스토리·초대·관리자추가·차단·방송권한해제,getMe/getChatMember검증. 토큰/채널ID는.local/platform.env600및운영runtime.env600비공개저장. 로컬과beta각자기합성이벤트발송후Telegram앱의동일ID/action실수신확인(접수만으로완료주장안함). 운영미발송0. 실제1시간요약경과수신은아직아님.
- 검증: amd64 Nest/Next Dockerbuild exit0,readonly standalone로그인200/정적asset7개200,공개정상TLS검사12 PASS(관리자로그인·매출셸/익명401/민감파일404/타API404/악성Origin403/기존beta서비스·목업·health200). 관리컴파일JS2개원격SHA로컬일치,6컨테이너running. DB/미디어/Caddy볼륨보존,14migration기존상태조회만·seed/reset/추가migration없음. 임시현재IP/32 TCP22규칙은완료후해당ID삭제,원래3ingress복원. 원격임시암호해시/봇전달JSON/이미지archive제거,실행설정/이미지보존. 롤백 /opt/crefans-backup-admin-20261022(700).
- 초기실패: Docker타입검사참조lib/utils COPY누락2회보완후build성공,bot가입update미수신은승인된채널연결메시지로chat확인, Caddy재기동/TLS발급중일시연결오류는제한재시도후정상공인TLS로재검증(보안경고우회없음). 이전162전체테스트를다시돌렸다고확대하지않는다. 상세HEAD/dirty/sourceSHA/image/명령결과/미검증경계는crefans_admin/docs/deployment-20261022.json. 실운영매출화면docs/screenshots/admin-live-revenue.png,로컬합성알림수신telegram-connected.png. 민감값/실제접속IP는공개증거에포함하지않음.
- 다음: 필요시회원정지/콘텐츠숨김·보호미디어관리, PASS/은행/실PG·실가입,실1시간요약수신,외부장애감시. 운영콘솔/Telegram접속완료를상용출시완료로단정하지않는다.


## 2026-10-22 운영 사고 추적 연결 (로컬 검증)

- /service 공통 레이아웃에서 전역 JS/rejection, error boundary 수집. features/service 훅→lib/api 전송 계층 유지, /preview에는 적용하지 않음. 원문 메시지·URL/query·개인정보·stack 미전송, 허용 정적JS위치/오류종류만, 페이지5건/중복제거.
- 실제 API 응답 X-Request-ID를 로컬 프록시가 전달하고 서비스5xx 안내에 표시. 운영 로그 UI는 별도 crefans_admin /console/logs에만 구현.
- layer/TS/단위276 PASS, 서버 로그55+별도 실제MySQL19·금융/인증/SMTP회귀137·관리자 TS/5/브라우저9·Caddy 실컨테이너 확인. 공급사 대역/로컬SMTP이며 실PG/외부메일 발송 없음. 운영 배포는 아직 하지 않았다. docs/service-api-binding.md, 서버 docs/operational-logging.md 및 logging-implementation-20261022.json에 범위/명령/해시/한계 기록. 문서 계약은 신규4라우트/감사스키마/환경 예시를 대조해 재생성하며 해시 snapshot과 실행 검증은 구분한다.


## 2026-10-22 정기결제 카드 불능 안내 (진행 중)

- 백엔드의 카드 requiresUpdate, 구독 renewalPending/billingIssue/retryAt를 공유 결제수단/구독 컴포넌트에 연결. 미결제 구독은 현재 이용중에서 분리해 갱신 결제 대기와 카드 변경/해지 동선을 제공. 불능 카드 기본선택과 최초 청구 버튼을 비활성화하고 새 기본 카드 선택 시 복구기간 내 재청구됨을 설명한다. 목업과 실제 서비스 표시 컴포넌트 동일.
- 합격 기준: 분실 카드 오류→이용권한 회수→카드 변경→1회 복구, 해지 후 카드변경시 미청구, PC/390px 실제 브라우저. 서버 금융/권한/SMTP outbox 및 운영 배포 증거를 연결할 예정.

- 2026-10-22 운영 반영 완료: crefans-front:billing-recovery-20261022. 카드 변경 안내/불능 카드 기본·청구 버튼 비활성/갱신 대기·해지 동선, PC390px 브라우저2 PASS·front276/TS/layer·amd64 build PASS. API/worker/admin/Caddy와 함께 배포하고 원본 DB 컨테이너/볼륨 보존. 운영 공개20 PASS 및 실제 Chrome 보호 화면 확인, 임시SSH회수. 공급사 대역/실DB 증거와 실제 운영 상태를 구분하며 서버 docs/billing-recovery-20261022.json 참조.


## 2026-10-22 초기 수수료·운영비 재검토

- 사용자 요청은 소수 크리에이터 매출/운영비 계산 및 피딩·온리팬즈보다 높지 않은 수수료 추천. 조사와 문서/계산만 변경, 운영 DB 금융정책/클라우드/발송/배포 변경 없음. 기존 미커밋 작업 보존.
- PDing 공식 소개 검색색인에 creator80/85/90%(플랫폼20/15/10), 직접 열람한 공식 약관에는 결제·출금·환전 비용/단건 포인트 구매. 총실공제율은 계약·대시보드 미확인. OnlyFans20%는2021 회사의 의회제출자료와2026-06-18보도로 대조; 최신공식약관 사이트는 브라우저 안전정책에 막혀 우회하지 않았으며 직접 재확인 완료로 주장하지 않음.
- 현재EC242.374USD기본/월은전일AWS계산기증거. 영상100분/4Mbps/구독+10%여유면3.3GB,400구독AWS만약30.2만원. 미도입CloudFront Pro15USD/50TB·10M요청 공식확인. EC2+CDN+이전연구저장/변환/백업예산 약11.7만원, 부대비용 여유 포함 F15만원은 미계약 항목을 남긴 가정이다. 실제청구서/성능보장 아님.
- 월1만원,PG3.74%현금비용,플랫폼수수료VAT유보(매입공제미반영),손실1%가정. 10%총공제의기여435원/구독, F15만원손익경계345건. 20/100/200/400/1155구독의잔액−141298/−106491/−62982/+24036/+352530원(인건비등제외). 과거5/50/100/1000균등모델4명은1155구독이며초기4소형과다름.
- 추천: 초기초대크리에이터한정총공제10%(PG·수수료VAT포함)를CDN/비용통제조건으로검토. 기존20%추천은확정아님을연결문서에도명시. 무자본·영구10%·사업전체흑자보장없음. 초기부족예산/우대기간·실제구독료/PG/PASS/은행·세무구조는미결정,DB미적용.
- 증거 docs/audit/commission-model-20261022.py 및json. Decimal재계산,400/1155사례,344부족·345충당경계PASS. 문서financial.md·release-test-scenarios/manifest의범위·링크검증은 npm run check:docs,해시갱신은docs:record로구분. 제품코드변경없어제품테스트재실행없음. 최종명령/시각/종료코드/문서SHA는docs/audit/commission-research-verification-20261022.json에보존.


## 2026-10-22 구독료1만원 이상 수요 커뮤니티 조사

- 디시와 커뮤니티 조사 요청. 디시ASMR2개·Reddit3개 본문 대조: 국내2023년3만원 만족/지속 의사, 별도후기의예산상간헐구독, 해외10달러실결제후업로드지속성요구·10/25달러상이한가격수용·오래응원한창작자20달러지불. 영수증/대표성/현재가격/장기갱신미검증, 국내유효가격표본이오래됐음을명시. 게임/OTT/굿즈/광고/출처불명SEO 및2020회사평균2만원을현재수요증거로채택하지않음.
- 월1만원은이전산술가정이지검증된시장평균아님. 기본9900/강한기존팬14900은가격실험제안이며DB미변경. 초기적자허용을반영해유료전환·2/3회차갱신·실제구독당매출측정권장. F15만원/10%모델의5000/9900/10000/14900가격별경계690/349/345/232건(50건씩유지시14/7/7/5명), 가격별수요동일가정·인건비별도·CDN미도입경계유지.
- docs/financial.md에원문링크/날짜/근거수준/한계추가, 기존계산스크립트의가격민감도정수경계검사추가. 제품코드/금융정책/배포/발송변경없음. 이번명령·HEAD/dirty·SHA·문서검사결과는docs/audit/subscription-price-research-20261022.json. 이전수수료검증은이번문서변경이전스냅샷으로보존.


## 2026-10-22 성장별 서버 확장 비용 가정 보정

- 사용자지적대로월15만원고정표는성장손익예측으로부적절.20%/9900원시나리오에서성장단계별운영예산범위를입력한민감도표로보완.30/100/250/500/1000/3000/5000건에각각15~20/15~20/15~25/20~30/30~50/50~100/80~150만원은자체예산가정이며AWS견적/실측/성능보장아님.
- AWS공식확인2026-10-22: CloudFrontPro15USD/50TB·10M요청,OAC/signedURLs,지속초과시성능조정/가입이력조건; S3용량·보관·요청과서버부하별증설은별도.현재미도입CDN/S3분리가저비용예산전제.기존계산기단가를이용하면1000건/3.3TB EC2직접전송AWS만약68.6만원.무료이용/시청시간/원본보관/요청수미확정.
- 과금관계수와동시이용구분,API/DB/worker/디스크병목실측후증설.20%기여1330.74원/건,월15/20/30/50만원충당경계113/151/226/376건.인건비등제외;운영금융정책/인프라/배포변경없음.
- financial.md·docs/audit/growth-scaling-20261022.py/json에자료·가정·산술경계·문서검증기록. 다음:미디어S3/CDN실구현검증,무료/유료동시부하·영상시청/업로드/보관량측정후구성별견적확정.이번문서조사로성능/출시/흑자를보장하지않음.


## 2026-10-22 빈 홈 피드의 서비스 안내 링크

- 빈 홈 피드 안내 아래에 서비스 소개(랜딩)·고객센터·공지사항·크리에이터 스튜디오 링크를 표시한다. 기존 사이드바와 `components/crefans/ServiceLinks.tsx`를 공유하며 `/preview`·`/service`의 basePath를 유지한다. 게시물이 있는 피드는 기존 모습 그대로다. API·데이터·운영 배포 변경 없음.
- 합격 기준: PC·모바일 빈 피드에서 네 링크 접근, 하단 고정 메뉴와 겹침/가로 넘침 없음, 기존 피드 유지. 로컬3010의 실제 API 빈 응답에서 Chromium1440/390/320px 모두 네 링크 클릭 이동(12회), 가운데 정렬·가림·가로 넘침·pageerror 확인 PASS. 게시물 있는 목업에는 빈 푸터 미표시. 데스크톱/모바일 스크린샷 시각 검토 완료.
- npm run check(layer·TypeScript·단위276) PASS. docs/preview-pages.md·service-api-binding.md를 구현과 대조했다. 문서 해시 기록과 검증은 제품 테스트와 구분하며 HEAD/dirty·소스SHA·명령/종료코드·브라우저 결과는 docs/audit/empty-feed-verification-20261022.json에 기록한다. 운영 사이트에는 아직 배포하지 않았다.

- 2026-10-22 사용자 요청으로 운영 반영 완료: https://beta.crefans.com/service/feed, 이미지 `crefans-front:empty-feed-20261022`. 기존 운영 대비 실행 소스 변경은 푸터 관련4파일뿐이며 빌드 이미지465개 소스/에셋 해시가 로컬과 일치. amd64 production build PASS, 프론트만 교체하고 API/worker/DB/admin/proxy 컨테이너ID 보존.
- 실제 운영 Chromium1440/390/320px 빈 홈 링크12회 이동·가로 넘침/가림/중앙 정렬·JS오류 없음, 기존 목업 피드 유지 PASS. 정상TLS·API health·관리자 로그인 화면 확인. 재기동 중 일시502 두 건은 readiness 재시도 후 정상이며 무중단 배포라고 주장하지 않는다. 임시 현재IP/32 SSH 규칙 회수·원래 ingress/egress 복구. 롤백 `/opt/crefans-backup-empty-feed-20261022`. 증거 `docs/audit/empty-feed-deployment-20261022.json` 및 `empty-feed-live-*.png`.

## 2026-10-22 크리에이터 2명·팬 20명 베타 준비 점검

- 요청은 추가 검증 필요성과 장애 위험 조사. 코드/운영설정/DB 쓰기·가입·결제·메일 발송·부하 발생 없이 기존 테스트 소스/증거와 운영 읽기 결과를 대조했다. 합격 조건은 현재 동작 상태와 가입/거래 차단 요인을 확인하고, 미실행 검수를 환경별로 분리하는 것이다.
- 운영 6컨테이너/3공개주소 정상, 현재 컨테이너 재시작0/OOM 없음, 가용 RAM 약2.4GB·디스크35GB. 크리에이터/구독/주문/미디어0, worker 직전실행 실패0. 빈 DB/저부하 정상은 22명 사용·실거래 성공의 증거가 아니다.
- PASS/은행 미설정, Toss test, 금융정책 version0/null 확인. 가입·청구 전제 미충족으로 전체 흐름 외부 모집 보류 권장. SMTP/Telegram은 설정 존재만 재확인했으며 실수신을 이번에 다시 검사하지 않았다.
- release-test-scenarios.md에 단계별 파일럿 검수 추가: 2크리에이터 권한 교차, 실제 기기/영상, 중복·갱신·해지·환불 대사,22명60분/44명단기/24시간관찰 제안, 장애독립감시·복원·단계적 초대. 백업 보류는 기존 사용자 방침이며 실제 지인 데이터 도입 전 재검토 권장일 뿐 이번에 변경하지 않았다. 신규 Redis/스케일업을 근거 없이 요구하지 않는다.
- 증거 docs/audit/pilot-readiness-20261022.json. 이번 실행은 운영 읽기/공개 GET/문서검사; 제품 단위·통합·E2E 재실행 및 실공급사·실기기·부하·복구 검수는 미실행. 기존 테스트 통과를 이번 실행으로 확대하지 않는다.

## 2026-10-22 미디어 EC2 저장과 S3·CDN 성장 비용 비교

- 신규 업로드는 diskStorage→Docker media볼륨→EC2 EBS이며 S3 아님을 코드/compose와 직전 운영 증거로 확인. 기존 EBS 빈 공간 때문에 초기 증분비용은 작지만 성장 장기비용 최적화로 보지 않는다.
- AWS공식 재조사: 서울S3 Standard첫50TB $0.025/GB-month(공개가격API발행2026-10-15), EC2인터넷첫구간$0.126/GB·계정공유무료100GB, CloudFrontPro $15/월·50TB/10M요청·OAC/서명URL 지원·지속초과성능/가입조건. EBS $0.0912는전일실제계산기증거 사용.
- 동일1000GB저장+1000GB전송 예시: EBS+직접전송$204.60 vs S3+Pro$40 기본비. 요청/백업/세금/앱서버 등 제외,저장credit미적용. S3만 옮기면 전송절약제한,EC2에도CDN가능하므로CDN효과와S3저장효과 구분. 총청구견적·성능보장아님.
- docs/financial.md·docs/audit/media-storage-cost-20261022.json에 출처/계산/소스SHA 기록. 다음 권장:실제파일누적전비공개S3+OAC+짧은서명접근 구현 검토 및권한/Range/환불이용이력 회귀. 조사만 했으며 운영계약/리소스/업로드코드는 변경하지 않았다.

### 2026-10-22 비공개 CDN 미디어 전환

- 카드/오버레이/업로드/편집 썸네일의 동영상을 공통 MediaVideo로 연결. 관리형 API URL만 오류 시 60초 내 최대2회 재인가하고 재생 위치를 복구; preview/static/blob은 기존 경로 유지.
- 실제 로컬DB+AWS S3/CloudFront+Chromium에서 만료된 서명 403 후 인증 API 재요청·디코딩·seek와 PC/모바일 화면 확인. 단위/계층/타입 포함 npm run check278통과.
- E2E 전체 최초49통과/2실패를 조사: 제거된 환불 버튼 기대와 손상 PNG fixture. 현행 미열람 API 환불/열람 거부 정책 및 잘못된 이미지 거부를 검증하도록 수정 후 서비스12통과, 나머지40 검사는 최초 실행 통과.
- Docker의 public 파일 읽기 권한을 COPY --chown=node:node로 보정해 image runtime 사용자로462파일 해시를 대조. 배포 결과는 서버 docs/private-media.md 및 실행 증거 참조.

- 운영 최종 결과: 2026-10-22 14:52 KST media-cdn-20261022 배포. 실제 HTTPS 이미지/영상 S3 업로드와 CDN 응답/권한 차단 확인, 테스트 자료 정리. 14:53 API/feed/preview/정적이미지200, 컨테이너 restart0/OOMfalse. 서버 docs/media-migration-20261022.json에 초기 실패·수정·롤백 및 최종 증거를 보존.


## 2026-10-22 공유 링크의 비구독 접근 차단 (진행 중)

- 사용자 원래 기획 확인: URL만 전달받은 비로그인/비구독자가 접근할 수 없어야 한다. 기존 60초 CDN bearer 서명은 요구 미충족. S3 저장 유지, API 세션/정확한 상품/기간/환불 권한 확인 후 서버 스트리밍으로 수정. GET/HEAD/Range 모두 검사, 해지예약은 남은 유료기간만 허용. 브라우저에 서명/저장소 URL 미제공, 기존 CDN 직접 접근도 폐쇄 예정.
- 대가: CDN 직접전송/캐시 비용절감은 중단, EC2 전송량/연결 사용 증가. 인증된 다운로드 후 저장/녹화 회수는 별도이며 완전 방지를 주장하지 않음.
- 합격 조건: 실 S3+격리DB/다중 브라우저에서 복사 URL·타상품·만료·로그아웃·HEAD/Range 우회 거부, 정상/해지예약/소유자 재생·seek, 비공개 원본/CDN 폐쇄. 통과 후 API/worker/front 운영 배포와 실제 HTTPS 확인. 기존 미커밋 변경/DB 보존.

### 2026-10-22 세션 보호 미디어 운영 반영·검증

- 15:20 KST beta.crefans.com API/worker/front를 media-session-20261022로 교체. S3 저장 유지, 매 GET/HEAD/Range의 세션·구독·기간·환불 검사 후 API 스트리밍, 외부 서명 URL/307 제거. Next HEAD·취소 신호/보호 헤더 전달. CDN 서명 설정은 활성 runtime에서 제거. DB/admin/proxy 컨테이너·schema 유지.
- 단위10·front278/layer/TS·도메인95·서비스 E2E12 PASS. 실제 S3+로컬DB/Chromium6 PASS: 영상 디코딩/seek, 복사 이미지·영상 URL을 비로그인/다른 로그인 세션에서403, 타상품/만료/로그아웃/비활성 계정/환불 경합/성인·공개 재사용 우회 거부, 해지예약 허용.
- 실제 운영 HTTPS 합성 소유자·구독자·비구독자에서도 이미지/영상 업로드201, GET200/HEAD200/Range206, 비구독/타상품/만료/회수세션 거부 확인. 테스트 자료 제거 후 member1/creator0/media0. API/worker/front running/restart0/OOMfalse, 15:22 관찰 시 배포후 감사error0.
- 기존 CDN은 15:23 KST Disabled/Deployed 확인, 캐시 /* 무효화 Completed, S3 OAC 허용 제거 및 CloudFront 읽기 명시적Deny. 실제 만료 전 서명 URL의200→403 대조 통과; 원본403. AWS 전파 완료 최종상태는 docs/media-session-20261022.json 참조.
- 이미지 소스178+462 SHA 일치. 최초 sandbox DB연결 거부는 허용 네트워크로 재실행; 배포 최초 백업폴더 권한 실패는 앱 변경 전 중단돼 sudo install 스크립트 재전송 후 성공. 호환 rollback은 billing-recovery-20261022 + 신규 S3 버킷 서버 전송이며 실제 객체 읽기 통과; CDN 재활성화 금지.
- 비용 영향: EC2가 바이트를 전송하므로 이전 CDN 직접전송 비용절감 가정 폐기. 이미 허용된 연결/저장 사본·녹화 회수, 탈취 쿠키, 대규모 부하/복구/실금융 검증은 별도 한계. 이 변경을 전체 출시/무결함 보장으로 확대하지 않는다. 상세 서버 docs/private-media.md 및 docs/media-session-20261022.json.

- 최종 문서 계약/인벤토리58·라우트96 및 누락/변경 대조5종 PASS. 실제 실행·운영 증거와 단순 문서 해시 snapshot을 구분해 보존. 후속 미디어 작업에서도 URL 공유로 비구독 접근이 허용되는 설계를 도입하지 않는다.

## 2026-10-22 멤버십 레벨별 공개 (진행 중)

- 현재 상품 지정 공개는 정확한 상품만 허용하며, 최소 레벨 판정은 서버 내부에 있으나 스튜디오 설정이 빠져 있음. 기존 access_plan_id/ membership_level 필드를 재사용해 기존 상품 전용 게시물은 유지하고 accessLevel(최소 레벨) 옵션 추가. DB 구조 변경 없음.
- 멤버십 rank(1~100)를 관리하고 가입 당시 rank 스냅샷 기준으로 판정. 상품 수정이 기존 구독의 레벨/가격을 변경하지 않음. 모호한 상속을 가격으로 추론하지 않음. 공개/최소 레벨/정확한 상품을 명시적으로 구분.
- 합격 조건: 레벨1/2/3 본문·댓글·이미지·영상 권한 행렬, 다른 크리에이터·비구독·만료 차단, 해지예약 기간 허용, GET/HEAD/Range·복사 URL 우회 차단. 설정 저장/수정과 목업/실서비스 동일 UI 확인 후 운영 배포 및 합성 계정 검사/정리. 이전 미커밋 변경 보존.

### 2026-10-22 멤버십 레벨 공개 운영 배포·검증 완료

- 16:02 KST membership-level-20261022 API/worker/front 반영. DB/schema/migration 변경 없이 membership.level과 posting.membership_level/access_plan_id 재사용. 기존 상품 전용 글 유지, 새 최소레벨 설정과 rank1~100 입력 추가. 과거 구독 snapshot의 레벨 유지, 기존 클라이언트의 필드 생략 수정도 레벨 게시물을 전체 공개로 바꾸지 않음.
- 공통 스튜디오/팬/미리보기 UI에 레벨과 공개 범위 표시. 프론트281/layer/TS, 서버 build 및 도메인95, 서비스 E2E12, 실제 S3·격리DB·Chromium9 통과. 신규 작성/수정/새로고침, rank1/2/3 행렬, 본문·댓글·이미지/영상 GET/HEAD/Range·환불·해지예약·만료·타크리에이터·복사 URL·정확한 상품 보존 확인. 금융은 공급사 대역 회귀이며 실결제 재검증 아님.
- 운영 HTTPS 합성 소유자/구독자/비구독자에서도 9개 레벨 조합과 이미지/영상 bytes/HEAD/Range, 해지예약·기간 만료·회수 세션 차단 확인. 가입 당시 레벨이 상품 수정으로 바뀌지 않음. 테스트 자료 삭제 후 member1/creator0/media0. 16:04:57 최종 관찰 시 배포 후 감사error0, API/worker/front running/restart0/OOMfalse. DB/admin/proxy 컨테이너 유지.
- 배포 이미지 API178·front462 소스/asset SHA-256 일치. 이전 media-session 이미지의 실제 S3 읽기를 배포 전 검증하고 자동 복구 준비. CDN은 계속 폐쇄. 임시계정/세션/객체 제거. 장시간 부하/실금융/백업복원 등 별도 범위를 무결함 보장으로 확대하지 않음.
- 증거: 서버 docs/membership-level-20261022.json. 기존 문서의 잔여 CDN 서명60초 설명도 현재 API 스트리밍 계약으로 교정. 테스트 기대값에서 CDN DNS 제거/미디어 소유권403/동일 이름 fixture 선택을 보정했으며 실제 제품 권한 우회로 해석하지 않음.

- 마지막 대조: 상품 ID가 다른 상위 레벨 구독도 최소 레벨 글에는 허용되는 것을 로컬·운영 이미지/영상 Range에서 확인. 기존 상품 전용의 타상품 거부는 유지. 문서58개/계약96라우트 대조 및 음성대조5종은 실제 제품 검사와 구분해 기록.

## 2026-10-22 CDN 비용·공유 링크 권한 조사 (제안, 미구현)

- 사용자 요청은 업계 방식 조사. AWS/Google 공식 문서 확인: 서명 쿠키는 URL만 공유받은 비구독자를 막지만 발급 후 권한 회수는 쿠키 만료와 구분해야 함. 크레팬스에는 Lambda@Edge viewer-request가 현재 세션·상품/레벨·기간·환불 열람을 확인한 뒤 S3/CloudFront가 파일을 보내는 구조를 권장. 캐시 적중도 검사하고 실패 시 거부·허용 결과 캐시 금지. 자체 인증 유지 가능.
- 현재 EC2 스트리밍은 배포 상태의 설명이며 CDN 비용 절감과 URL 공유 차단이 양립 불가능한 것은 아님. AWS 원본→CloudFront 전송 무료; EC2가 원본인 구성도 요금 절감 여지는 있으나 중계 부하는 남음. 권장안은 미디어 바이트를 EC2에서 분리하며 인증 API/DB 부하·지연은 유지.
- Free $0/100GB·100만요청, Pro $15/50TB·1,000만요청; Lambda@Edge 별도 과금·상위 플랜 전용 정책/함수 조합 제한 확인. 100만 미디어 요청, 인증100ms+응답1ms/128MB 가정 시 함수 약$1.83, Pro 포함 약$16.83은 CDN/함수 예시만이며 총 운영비/절감 실측 아님. 작은 사용량에서는 즉시 절감이 보장되지 않음.
- 서버 docs/private-media.md에 비교·구체 보안 경계·실패 대조/캐시 적중/Range/실기기/부하 합격 조건 기록. 근거 docs/media-cdn-research-20261022.json에 공식 출처·확인일·HEAD/dirty·소스SHA·Decimal 계산4검사 PASS 저장. 제품 코드·운영·과금 플랜 변경/배포/새 아키텍처 실험은 미수행. 문서 검토와 문서 스냅샷은 런타임 보안 증명과 구분.
- 문서 검사: `npm run docs:record && npm run check:docs && npm run test:docs` 종료0, 문서58/라우트96/로컬링크181 대조 및 잘못된 입력5종 PASS. 이 결과는 문서의 계약·참조·변경 탐지 범위이며 CDN 실구현 검증이 아니다.

## 2026-10-22 세션 검증 CDN 전환 (진행 중)

- 사용자 테스트 후 배포 승인. 브라우저 URL/현재 로그인/공통 표시 컴포넌트 변경 없음. CloudFront가 매 파일 요청의 현재 세션·상품/레벨·환불 권한을 API에서 확인한 뒤 S3 파일을 전송. 직접 API는 롤백/legacy 경로다.
- 프론트 재빌드/기능 수정은 없으며 로컬 실제 S3·격리 DB·Chromium 회귀와 운영 CDN 별도 브라우저 검사 진행. 최종 배포 결과/증거는 서버 PROGRESS 및 docs/private-media.md를 따른다.

### 2026-10-22 세션 검증 CDN 운영 전환 완료

- 16:47:41 KST beta DNS를 CloudFront로 전환. API/worker `media-edge-final-20261022`, 프론트 `membership-level-20261022` 유지. DB/schema·admin/front 보존. 동일 URL·host-only 쿠키, 매 GET/HEAD/Range의 현재 세션/상품/레벨/기간/환불 검사 뒤 비공개 S3/CDN 전송. 일반 API/페이지는 캐시하지 않고 브라우저 no-store 유지.
- 로컬 단위/loopback37 PASS·선택MySQL1skip, 도메인95, 실S3·격리MySQL·Chromium10, 운영HTTP/로그설정2 PASS. 실제 CloudFront 사전/운영: 이미지·영상 업로드201/GET200/HEAD200/Range206, 레벨9조합/정확한상품/해지예약·만료·계정정지·회수세션·환불·삭제/복사URL 차단. media_retry도 재인증하며 임의 쿼리/예전서명 거부. 캐시3회Hit, 운영 합성검사 권한조회154·API파일스트림0, 실제IP 기록.
- 베타 DNS 전환 전 인증 호스트를 응답 불가로 바꾼 실제 장애 대조: 이미 캐시된 영상503/파일미노출, 정상함수 복구 후206. 테스트 장애함수는 운영에 연결하지 않음. 22동시Range 전부206, 운영 p95 619ms/max684ms. 한 구독의 짧은 동시요청이며 22명 장시간 검증이 아님.
- Chromium/WebKit PC·390px에서 디코딩/재생/seek·복사URL403. 실제 로그인폼201·Secure HttpOnly host-only쿠키·refresh201·미디어206·logout후차단을 두 엔진에서 확인. 물리적 iPhone 검증은 아님. 초기 브라우저시험의 metadata/play 대기와 로그인후자동이동 가정을 실제 UI동작에 맞춰 보정. 임시정리스크립트 /tmp 모듈경로 보정 후 합성계정·파일 제거.
- 16:51:26 KST 최종 확인: CF Deployed/Free ACTIVE, S3공개차단4종/OAC범위/게시된함수SHA 일치. API이미지 amd64 소스180 SHA 일치, 6컨테이너 running/restart0/OOM없음, worker최신실패없음, 전환후감사5xx0. 임시계정0·기존member1/creator0/media0. 원본준비백업 /opt/crefans-backup-media-edge-20261022 및 최종이미지백업 /opt/crefans-backup-media-edge-final-20261022 보존. 문제 시 origin-only로 보호API 전송 및DNS복원, bearerURL 재활성화 금지.
- 증거 docs/media-edge-20261022.json, frontend docs/audit/media-edge-{desktop,mobile}.png. S3/함수 별도과금·인증API/DB 의존은 유지하며 월비용 절감 실측/무결함을 주장하지 않는다. 이미 허용된 연결/저장사본·세션탈취, 물리적기기·장시간부하·실금융·백업복원은 별도. 사용자 기존dirty작업을 보존했고 이 작업에서 Git commit/push는 하지 않음.

- 최종 문서 계약58/라우트98/화면41 및 잘못된 입력 대조5종 PASS. 장애 시험 후 Lambda $LATEST도 정상 코드로 복구(활성 번호버전 불변), 원격 배포 임시파일 제거. 공개 증거에서 비밀값·세션토큰 제외 확인.

## 2026-10-22 베타 모집 가능 여부 재확인

- 17:39 KST 운영 읽기 전용: PASS3설정 없음, Toss client/secret test, 은행adapter 없음/자동송금false, 금융정책version0·수수료/정산보류null, published terms/privacy 없음. worker 최근완료·실패map비어있음. 비밀값/개인정보 출력, 가입/청구/설정 변경/배포 없음.
- 판단: 지인 비공개 모집 공지는 가능하나 현재 그대로 일반가입·구독 초대를 시작할 단계는 아님. auth.service는 본인인증과 게시 약관 스냅샷을 필수로 검사하고 financial-policy는 미설정 시 checkout503. 요청한 약관 하드코딩 방침을 구현·동의이력과 맞추는 작업이 남음. 미디어 배포 검사 통과를 전체 가입/결제 완료로 확대하지 않음.
- 다음: PASS 실제연동/본인가입, 약관·개인정보 실제게시/동의처리, DB금융정책 확정·입력 → 실기기·별도계정 소수 파일럿 → 크리에이터2명/팬20명 확대 권장. 실제 과금은 토스 live활성화·실주기검증 후 별도. 운영정책/가격을 이번 조사로 임의 확정하지 않음. 사용자 백업보류 유지, 복원검증 미완료 경계 명시.
- 공식 토스 API키 문서(https://docs.tosspayments.com/reference/using-api/api-keys)와 OWASP Authorization Cheat Sheet(https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)를 2026-10-22 확인. 증거 front docs/audit/beta-invitation-readiness-20261022.json에 실행시각/종료0/소스SHA/운영boolean과 판정 분리. 이전 실CDN 증거 server docs/media-edge-20261022.json을 재사용했고 제품 테스트는 재실행하지 않음.

## 2026-10-22 플랫폼 수수료 20% 초기값 저장

- 사용자 수수료20% 지정에 따라 17:51 KST 운영 financial_policies.platform/platform_fee_bps를 null→2000으로 저장. 보류기간은 질문 단계로 미결정이므로 null 유지. 기존version0/정책이력0/주문·구독·수익0을 검사한 뒤 동시 변경 방지 조건과 동일 트랜잭션 감사(admin.financial_policy.fee_draft_set)로 수수료 초기값만 저장. 활성 정책 발행·송금·결제·환경변수·코드·schema 변경 없음.
- 검증: readback2000/holdnull/version0/configuredfalse, 감사before/after, paymentPolicy의 FINANCIAL_POLICY_REQUIRED 차단 대조, 10000원×20%=2000원/순수익8000원 계산 확인. 보류기간이 정해지면 기존 SUPER_ADMIN 금융정책 API에 expectedVersion0/fee2000/합의한일수를 함께 넣어 version1 발행할 것. 이번 초기값 기록은 감사 원장에 있고 완성된 금융정책 이력은 아직 생성하지 않음.
- 보류기간은 성공 결제 처리 시각+일수×24시간으로 available_at을 정해 출금 가능 잔액으로 전환하는 내부 대기기간. 자동송금 시점·환불권 소멸·PG입금 확인이 아님. PG 정산은 계약·영업일 주기이므로 별도 확인 필요. 공식 토스 https://docs.tosspayments.com/resources/glossary/settlement 2026-10-22 확인. 임의 보류일수/PG·세금 부담 정책을 정하지 않음.
- 증거 front docs/audit/fee-policy-20261022.json: 실제 명령/시각/종료0/HEAD·dirty/스크립트·소스SHA/검증 결과. 다음 할 일은 보류기간 결정과 앞선 PASS/약관 준비. 직전 모집준비 증거의 fee=null은 변경 전 기록이다.

## 2026-10-22 코드 관리 약관·개인정보처리방침 (진행 중)

- 사용자 요청: 맥북 공식 가이드와 현재 구현을 대조하여 하드코딩·운영배포. Downloads의 개인정보보호위원회 2026.4 작성지침185쪽을 추출하고 국외이전 표(PDF47쪽/본문45쪽)를 렌더링 확인. 2026.9.11 시행 개인정보법·2026.7.21 시행 전자상거래법령 및 AWS/Google/Telegram 공식 자료 대조.
- 사업자 정보: 사용자가 상호 좋아하는일해야지 확인. 로컬 사업자등록정정 제출서와 grade_homepage의 회사 공개정보, uba_server 약관 초안을 교차 확인해 상호·대표자·사업자번호·주소·전화·회사 공개 이메일·개인정보책임자를 반영. 통신판매업 신고번호는 발견 못함(미신고로 단정하지 않음). 원문 개인 서류를 리포에 복사하지 않음.
- 확인된 정책: 수수료20%, 해지예약은 기간말까지 권한 유지, 미사용 전액환불은 고객센터/API, 상품·최소레벨 구분. 법정 청약철회권을 해지예약이나 단순 페이지 진입 기록으로 일괄 배제하지 않음. 정산보류·PG/세금 부담·연령은 임의 확정하지 않음.
- 구현: server src/platform/legal-documents.ts 단일 코드 원본으로 common/가입 문서 제공, 관리자 문서 API는 공지·FAQ만. 문서 본문·버전+SHA·시행 상태/시각을 확인해 member_consents에 원자 저장. 프론트 LegalDocumentBody를 공개문서·가입 모달에서 공유, 실제 모달의 URL 텍스트 표시 버그 수정. 개인정보 안내 확인과 선택 마케팅 동의 분리, preview 샘플·기존 링크 유지.
- 중요한 미해결: withdrawAccount는 비활성화만 하고 개인정보 파기 안 함. 일반요청 외 감사 보유기간 미결정, 인증 만료와 실제 파기 다름. AWS 글로벌 edge·Google메일·Telegram IP알림 국외이전의 실제 국가/계약/보유기간 미확정. 원본이 서울이라고 전부 국내처리라고 쓰지 않음. 가입연령 사용자 질문 중. 이 상태에서 효력 있는 시행본이라고 허위 게시하지 않도록 draft/시행일null/가입·가입인증메일 차단. 기존 로그인/비밀번호복구/미디어 동작 유지.
- 검증 진행: server build, 법률문서 단위5, 실제격리DB+공급사/SMTP대역21, front layer/TS/단위282 PASS. 관리자 API 우회 방지 추가 후 재검증·브라우저·배포 대기. PASS/PG/은행 실검증·외부법률검토·데이터파기 개선 완료를 주장하지 않음.

### 2026-10-22 가입 기준 확정·후속 검증

- 사용자 응답으로 가입을 생일 기준 만19세 이상으로 확정. 법제처/현행 청소년보호법을 대조하여 연도 예외와 구분. PASS adapter signup 요청 minimumAge19, 서명된 콜백 adultVerified===true 및 가입 proof.adult_verified 이중검사. 생년월일 원문 추가 저장 없음.
- 약관·개인정보 초안2와 공통 가입 화면/목업 문구 반영. false/누락/문자열/숫자 콜백과 클라이언트 adultVerified/birthDate 위조 거부, 실패 시 proof 소비·회원 생성 없음 검증. 서버58(front282) PASS, 서비스 E2E 및 후속 이미지/운영 브라우저 검증 진행 중.
- 앞선 legal-draft 릴리스는 18:15KST 초안1로 반영되고 health/문서/6컨테이너 검사 통과. 연령 반영 legal-age 후속 배포 준비. 파기/국외이전/콘텐츠 정책 등 미해결은 유지, 가입 개방 아님.

### 2026-10-22 약관 초안·만19세 제한 운영 반영

- 18:25:14 KST API/worker/front `legal-age-20261022` 배포 완료. 문서 `2026-10-22.draft-2`, 시행일null. 만19세 규약·사업자정보·수수료20%·해지예약/미사용환불·실제 개인정보 처리 항목을 코드 원본과 공유 UI에 반영. 관리자 법률문서 변경 경로 차단, 동의 본문/버전/SHA 원자 저장.
- 최종 변경 검증: server build·연령/약관/가입·SMTP/PASS/은행 대역/운영이벤트58 PASS, front layer/TS/단위282 PASS, 격리MySQL Chromium E2E12 PASS. 앞선 도메인 첫95중4실패는 기존 테스트의 시행본 fixture 누락이었고 테스트만 보정해95 PASS. 제품의 draft gate는 유지. 실제 공급사 결제/메일/PASS 검증과 구분.
- 운영 Chromium1440/390: 실제 API 본문이 코드와 일치, 목차/초안표시/가로넘침없음, 가입 모달 전체문서·자동동의없음, 가입메일/PASS/가입버튼 차단, preview 가입 동작 보존·페이지오류0. 모달 스크린샷은 애니메이션 완료 후 촬영. 18:26KST readonly: member1/creator0/media0, fee2000bps/holdnull/version0 유지, worker실패없음·해당릴리스HTTP5xx0. API/worker/front running/restart0/OOMfalse, DB/admin/proxy 컨테이너 보존.
- 이미지 소스 API181/front464 SHA 일치, amd64. DB migration/seed·미디어/S3/CF설정·금융정책 변경 없음. 백업 `/opt/crefans-backup-legal-age-20261022`에 직전 환경 보존·실패 시 이미지복구 절차. 이번 작업 Git commit/push 없음. 원문 개인서류/비밀값은 공개 증거 제외.
- **미완료/다음 작업:** 효력 있는 약관·처리방침 시행은 아직 하지 않음. 탈퇴후 파기·법정기록 분리/보관기간, AWS·Google·Telegram 실제 국외이전 계약·국가·기간, 통신판매업 신고정보·콘텐츠 허용범위·정산보류/비용/세금 정책을 확정/구현·검증한 뒤 새 시행본을 발행할 것. 실제 PASS연동 시 생일 전날/당일·연초/연말 판정 확인 필수. 가입연령은 더 이상 미결정 아님.
- 공개 검증 증거: front `docs/audit/legal-publication-20261022.json`. 문서 스냅샷은 계약/참조/변경 탐지 증거이며 적법성/무결함·출시가능 증명이 아니다.

- 최종 문서 확인:58문서/98라우트/41화면/188로컬참조 대조 PASS, 누락링크·신규문서·변경소스·변경문서·API변경 실패대조5종 PASS. 모바일 모달 애니메이션 완료 화면과 PC처리방침/모바일약관 시각 검수. 원격 전송 임시파일 제거, 복구백업 유지.

## 2026-10-22 법률문서 전체 공개 배포 (진행 중)

- 사용자 “약관도 다 배포” 지시에 따라 이용약관·개인정보·운영정책 공개본2026-10-22.1을 준비. 공개와 신규 가입 동의 적용을 구분해 publishedAt(공개일)·documentsPublished·signupReady를 명시한다. effectiveAt은 미정이며 미해결 절차를 완료했다고 허위 기재하지 않는다. 기존 만19세/결제/개인정보 guard 유지.
- 약관·처리방침·운영정책·가입 수집안내·선택 마케팅 문서를 공개본으로 일치시키고 초안 표현을 현재 처리현황/신규가입 준비안내로 정리. 개인정보 실제 삭제·국외이전 계약 확인이나 사업정책의 새 결정을 이번 공개 지시로 임의 수행하지 않음.
- 합격 조건: 공개 API와3개 페이지 본문 일치·공개일/버전 표시, published문서라도 signupReady=false면 메일/PASS/가입 차단, 시행일·blockers 우회 없음, 목업·동의 원문/해시 유지. build/단위/격리DB/운영1440·390 브라우저/배포 후health·worker 검사와 증거 기록 예정.

### 2026-10-22 법률문서 공개본 배포 확인

- 18:50:37 KST API/worker/front `legal-public-20261022` 반영. 이용약관·개인정보처리방침·운영정책 및 가입 안내/선택마케팅 문서의 공개본2026-10-22.1, 공개일2026-10-22. `documentsPublished=true`, `signupReady=false`, `effectiveAt=null`을 운영에서 대조. **공개 배포이며 정식 가입 적용 시행·개방 완료가 아님**. 미확정 파기/국외이전/사업정책을 허위로 완료 처리하지 않음.
- server build·관련 단위/격리DB16, front layer/TS/단위282 PASS. 실제 운영Chromium1440/390에서3공개페이지 및 가입모달4문서 본문 전체를 원본과 대조, 공개일/버전·목차·가로넘침없음/자동동의없음/가입차단/preview보존 확인. 18:51:22 최종 browserPASS·페이지오류0. 초기 운영정책 검사에 불필요한 상호 반복 요구가 있어 harness조건만 바로잡아 재검증했고 본문 전체 검사는 유지.
- 18:50:53 readonly: 기존member1/creator0/media0, 수수료2000bps/holdnull/version0 유지, worker실패없음·해당릴리스HTTP5xx0. API181/front464 소스SHA와 amd64이미지 일치, API/worker/front restart0·OOM없음, DB/admin/proxy 컨테이너 보존. schema/migration/미디어/금융정책 변경·실금융/외부메일발송·Git commit/push 없음.
- 복구백업 `/opt/crefans-backup-legal-public-20261022`. 증거 front `docs/audit/legal-public-release-20261022.json`. 이전 공개초안 증거는 당시 버전 기록이며 현재 문서 상태는 이번 증거를 따른다. 남은 실제 개인정보 파기·국외이전 계약/국가/기간·콘텐츠 허용범위/정산 등 사업정책·PASS실연동 검증 후 별도의 시행일을 지정해야 함.

### 2026-10-23 NICE 도입 문의 초안 재사용 문서 저장

- 사용자 요청: 앞서 제시한 NICE 도입 문의를 docs 하위 Markdown으로 저장하고 다음 문의 시 바로 재사용 가능하게 한다.
- 산출물: `docs/nice-identity-inquiry.md`. 앞선 문의 본문 그대로 보존, 신청 선택 항목·공식 URL·미제출/미계약 상태·확인 범위를 함께 기록. 기존 서드파티 재개 진입점 `docs/third-party-setup.md`의 NICE 순서에 링크를 추가했다. 기존 AGENTS의 서드파티 재개 규칙을 통해 찾을 수 있어 불변 규약을 중복 추가하지 않았다.
- 검증: Python 본문 추출/UTF-8 길이/SHA 대조 종료코드0. 본문1,508바이트·앰대시 없음·기존 SHA `9a05c702addf042cb1ced6a6831794676e6a3bd552677e38ab8809edba0664e5` 일치. 저장 문서 SHA `81110f8c47150b69025bc8fc9299167f695ae144e384bea8390fcac4455f998b`. 신규 문서를 docs/audit/manifest.json에 등록했다.
- 문서 검사 기준: 변경 전 `npm run check:docs`는 앞선 조사 로그가 추가된 server/PROGRESS.md 증거 만료만 보고(종료1). 해당 로그의 사용자 결정/공식 자료/미승인·미구현 경계를 재검토했고 이번 문서·링크를 검토하여 `npm run docs:record` 후 `npm run check:docs`로 재확인한다. 증거는 문서 스냅샷이며 제품 테스트·공급사 승인 증거가 아니다.
- 범위: front HEAD `dc3d663e63c7b22bb57dc8c198af2ab6d963488a`, 작업 시작 dirty91경로(기존 작업 포함). 문서·인벤토리·진행 기록/문서 증거만 변경; 제품 코드·DB·운영 배포·외부 문의 제출 없음. 제품 테스트는 문서 저장 작업에 해당 없어 재실행하지 않는다. 다음 NICE/PASS 문의 요청에는 저장 초안과 현재 변경 사항을 확인해 안내한다.

### 2026-10-23 NICE 문의 소개 문구 간소화

- 사용자 요청에 따라 `docs/nice-identity-inquiry.md` 복사 본문을 ‘창작물 공유 플랫폼’ 소개로 변경하고 성인 콘텐츠 상세 설명을 제거했다. 월 멤버십 구조·생일 기준 만19세 확인·요금/테스트/기술 자료 문의는 유지한다. 기존 콘텐츠 운영 정책의 변경 또는 공급사 승인으로 해석하지 않는다.
- 합격 조건 및 직접 확인: 복사 본문에 창작물 공유 플랫폼 포함, 제거 대상 문구·앰대시 없음, 만19세 목적 유지, UTF-8 1,324바이트로 2,000 이내. Python assert 확인. 본문 SHA `02e0b0917cc1bbeff748c7d65e873c619e4a81a8b9da6b002959a2b64693efd2`, 파일 SHA `5b161ac15e829e22c1270ba75182b2a988700f6d2e01eca851b75ed04e927101`. 이전 버전 1,508바이트와 해시는 과거 기록이며 최신 본문에는 적용되지 않는다.
- 검증 환경: 2026-10-23T21:54:24.684051+09:00, front HEAD `dc3d663e63c7b22bb57dc8c198af2ab6d963488a`, 현재 dirty92경로(기존 변경 포함). 문서 manifest의 검토 설명을 수정했고 `npm run docs:record`·`npm run check:docs`로 참조/계약/스냅샷을 확인한다. 제품 코드·배포·외부 문의 제출 없음; 문구 수정이므로 제품 테스트는 실행하지 않는다.

### 2026-10-23 계좌 확인 공급사 조사 기록 연결

- 창작자 출금 계좌의 유효성·명의·점유·이체를 구분한 NICE/토스 공식 조사와 현재 backend 어댑터 대조는 server/PROGRESS.md의 같은 날짜 로그에 기록. NICE 본인확인 상담에 계좌정보확인/1원 인증 견적을 함께 요청하는 권장안이며 공급사 선정·비용·제품 구현은 미확정이다.
- 이번 문의는 조사/추천만 수행하여 저장된 NICE 복사용 본문과 실제 제품 코드는 변경하지 않았다. 변경된 조사 로그를 검토하고 문서 snapshot/참조 검사를 갱신한다. 실공급사 검증이나 테스트 완료로 해석하지 않는다.

### 2026-10-23 NICE 계좌 확인 문의·권장안 문서 저장

- 사용자 ‘문서에 저장’ 요청에 따라 `docs/nice-identity-inquiry.md`에 계좌정보확인/계좌1원인증 문의 문단을 기존 본인확인 초안과 통합했다. 신청 선택은 휴대폰본인확인·계좌인증, 적용영역은 회원가입·계좌등록으로 정리. 처음 등록/계좌 변경 시 검증, 출금 PIN, 최종 지급 확인의 권장안과 공식 근거·현재 공급사/OTP 미구현 상태도 저장했다. 기존 서드파티 안내 링크로 계속 접근 가능하다.
- 직접 검증: 2026-10-23T22:01:38.678043+09:00, HEAD `dc3d663e63c7b22bb57dc8c198af2ab6d963488a`, dirty92경로(기존 변경 포함). Python으로 통합 본문의 필수 문구·성인 상세 문구 제외·앰대시 없음·2,000바이트 제한을 확인. 결과 1,767바이트, 본문 SHA `ac0e5341f189e98a04d365be00d52004c1881561db749e946d416089170e58ae`, 파일 SHA `22f33175017c3ab762c6c51aa640d0553233e0caa604b679d27758a88c67cfd6`. 이전 바이트/해시 기록은 당시 버전만 설명한다.
- 문서 manifest의 검토 내용/근거 경로를 업데이트하고 `npm run docs:record`·`npm run check:docs`로 문서 계약·링크·스냅샷을 확인한다. 문서 저장만 수행, 외부 문의 제출·제품 코드/운영 변경·실제 인증/송금 없음. 제품 테스트는 해당 없어 실행하지 않는다.


### 2026-10-23 Swagger 분리 문서 감사 갱신

- 서버 Swagger를 유저·크리에이터 스튜디오76개 / 관리 콘솔25개로 분리해 운영 배포. 공통 인증3개만 중복하며 합집합98개. 프론트 표시 컴포넌트/서비스 바인딩 변경 없음. 서버 `docs/platform-api.md`, `AGENTS.md`, `PROGRESS.md`와 `docs/swagger-split-20261023.json`의 코드/검사/운영 증거를 대조하고 문서 manifest를 갱신했다. 서버11개 검사 및 실제 운영 UI 검증과 문서 스냅샷 검사를 구분한다.


### 2026-10-23 Swagger 3분리 문서 감사 갱신

- 사용자 변경 요청에 따라 서버 문서를 유저55 / 크리에이터 스튜디오36 / 관리자 콘솔25개로 분리해 운영 배포. 스튜디오 전용21개와 실제 공통 호출15개, 관리자 전용22개와 공통인증3개이며 합집합98개. `features/service/useStudioModel.ts`, `components/service/StudioRouter.tsx` 및 API 어댑터를 읽어 공통 범위를 대조했다. 프론트 제품 코드 변경 없음. 서버11개 검사/실운영 UI·HTTP 증거는 `docs/swagger-three-20261023.json`; 문서 검토·snapshot 검사는 별도다.

### 2026-10-23 분홍 머리 코스프레 모델을 모카 목업 크리에이터로 추가

- 기존 `cosplay-anime-v3.png`를 참조해 image_gen으로 아바타·커버·전신 화보·촬영 준비 사진4장을 생성. 최종 에셋과 정확한 프롬프트/생성 원본은 `public/illustrations/creators/moka/`에 보존. 기존 사진은 유지했다.
- `components/preview/service/fixtures.ts`에 모카(`moka.cos`), 코스프레 카테고리, 공개/레벨1/레벨2 게시물3개와 이미지가 있는 멤버십2개를 추가. 탐색·프로필·피드·미디어·소개·멤버십·가입 후 내 구독에서 기존 공유 컴포넌트를 재사용한다. 목업 가격/통계는 운영 정책이 아니며 정적 이미지는 공개 샘플이다. 운영 API/DB·공용 랜딩 데이터 변경 없음.
- 검증: `npm run check` 종료0, 레이어/TypeScript/282개 검사 PASS. fixture 직접 검증으로 크리에이터7명 중 신규1명·게시물3개·플랜2개·이미지5개 경로/해시·중복 ID없음·비가입/레벨1/레벨2 접근행렬을 확인. 첫 CommonJS 검증 harness의 import 호이스팅 문제를 harness에서 보정했으며 제품 변경은 하지 않았다.
- 실제 로컬 브라우저1280×720/390×844에서 프로필 사진/커버/멤버십 사진, 코스프레 필터, 미디어/소개, 확대/다음사진/다음게시물, 가입확인·내구독·레벨1공개/레벨2잠금을 확인. 이미지깨짐/가로넘침없음·수집된 콘솔오류0. 새로고침 후 최초 비가입 상태로 복원했고 서버3010과 프로필 탭을 남겼다. 운영 공급사/보안 검증이나 배포를 뜻하지 않는다.
- 증거: `docs/audit/mock-moka-20261023.json`, 스크린샷/검사로그 `.local/moka-preview-20261023/`. 기존 미커밋 변경 보존, Git commit/push·배포 없음. 변경 문서와 manifest를 코드/검수 내용에 맞춰 검토 후 `docs:record`/`check:docs`로 다시 대조한다. 기존 AGENTS의 공유 UI·목업 격리·증거 규약을 그대로 적용하므로 새 규약은 추가하지 않았다.

### 2026-10-23 모카 목업 운영 프론트 배포

- 사용자 ‘운영’ 요청에 따라 검증한 모카 목업을 기존 `beta.crefans.com` 프론트에 배포했다. 운영 확인 URL: `https://beta.crefans.com/preview/creator/moka`, `/preview/membership/moka`. 실제 운영 회원·크리에이터 DB 생성이 아니라 `/preview` 호스팅 반영이다.
- 변경 범위: 운영 기준 이미지465개 코드/설정/에셋 해시 대조에서 fixture1개 변경, 모카 사진4장+generation.json 추가만 확인. 새 이미지의470파일은 로컬과 일치. 기존 미커밋 변경은 보존했으며 API/worker/DB/admin/proxy 컨테이너는 같은 ID 유지. migration/seed·결제·메일·정책·미디어보안 설정 변경 없음.
- 검증: 직전 레이어/타입/282개 검사 및 로컬 브라우저 증거의 관련소스/에셋12개 해시 일치 재확인. 운영용 amd64 Docker build 종료0, 격리3013 컨테이너6페이지200·이미지4개 바이트 일치 후 제거. 최초 Docker credential helper 대기와 로컬 shasum locale 오류는 기존 배포 Docker설정/Python checksum으로 해결했고 원격 checksum 대조 통과.
- 운영 전송·load·프론트 교체·사후검사 모두 종료0. 프론트 이미지 `crefans-front:mock-moka-20261023`, health와8개 운영 페이지200, 새 사진4개 SHA 일치, 프론트 running/restart0. PC1280×720·모바일390×844 프로필, 멤버십 진입·사진·잠금표시, 이미지깨짐/가로넘침없음·수집된 콘솔오류0 확인. 임시 SSH 단일IP 규칙은 삭제하고 원래 규칙과 일치 확인.
- 증거 `docs/audit/mock-moka-deployment-20261023.json`, 실행로그/운영 스크린샷 `.local/moka-preview-20261023/`. 실패 시 복구 설정은 `/opt/crefans-backup-mock-moka-20261023`. 실제 유료미디어/공급사 전체검증은 이번 목업 배포 범위가 아니다. 운영 프로필 탭을 남겼으며 다음 변경은 동일 공유 UI/목업 격리 규약을 따른다.

### 2026-10-23 모카 랜딩·검색·피드 노출 확대 및 운영 반영

- 랜딩 공용 에셋 목록 첫 항목으로 모카를 이동해 프로필 정보 중복을 제거했다. 랜딩 대표 사진·첫 주목할 크리에이터·하단 콜라주와 목업 탐색 첫 카드에 표시. 목업 홈은 기존 첫 공개 게시물을 유지하며 얼굴이 잘리지 않게 사진 위치를 보정했다. 다중 미디어 갤러리에서도 주입된 position이 적용되도록 수정했다.
- 에셋형 랜딩의 검색·더보기는 프로필 카드와 같은 `/preview`로 이동한다. 실제 데이터 모드는 기존 `/service` 기본값 유지. `/service/landing`과 `/preview/landing`은 같은 표시 컴포넌트/에셋을 사용하며 실제 API 피드·탐색에 샘플을 삽입하거나 운영 회원/크리에이터 DB를 생성하지 않았다. 앞선 모카 생성 로그의 ‘공용 랜딩 변경 없음’은 그 시점의 기록이다.
- 검증: 레이어·TypeScript·283개 단위검사 통과(종료0). 랜딩 검색/더보기의 두 데이터 경로와 다중 이미지 위치 회귀 확인. 최종 amd64 빌드 통과, 이미지470파일이 현재 소스와 일치하고 이전 운영 대비 런타임5파일만 변경. 격리 컨테이너4경로200/사진4개 SHA 일치 후 제거. 초기 HTTP 검사에서 클라이언트 렌더링 내용을 SSR에 기대한 harness 오류를 바로잡았고 화면 내용은 실제 브라우저로 검증했다.
- 운영 프론트 `crefans-front:moka-discovery-20261023` 배포 및 health/5경로200 확인. frontend running/restart0, API·worker·DB·admin·proxy ID 보존. 임시 SSH 단일IP 규칙 삭제 및 기존 권한 복원 확인. 복구 설정 `/opt/crefans-backup-moka-discovery-20261023`.
- 운영 PC1280×720/모바일390×844에서 대표 사진·첫 카드·모카 이름 검색 결과·더보기 탐색 이동·첫 피드 게시물과 얼굴 크롭 확인. 모바일 가로넘침 없음·수집된 콘솔오류0. 운영 랜딩 탭을 남겼다. 실행 시각/파일 SHA/로그/스크린샷은 `docs/audit/moka-discovery-20261023.json`. 문서 검토 후 `docs:record`·`check:docs`로 참조와 증거를 갱신하며 이 검사는 제품 테스트와 구분한다.

### 2026-10-23 남성 북부대공 크리에이터 시온 콘셉트

- 사용자 요청은 남성 모델 기획·사진 제시. ‘중국 엑셀 느낌’을 중국 남성 라이브 퍼포먼스의 화려한 스타일로 해석한다고 먼저 알리고, 28세 성인 가상 인물 시온(SION, 가칭 sion.noir)으로 구상했다. 검은 머리·선명한 턱선·넓은 어깨, 검은 귀족풍 코트/아이보리 셔츠/은색 장식, 차가운 청색 배경과 붉은 조명 포인트가 핵심이다. 특정 실존 인물 참조 없음.
- imagegen 스킬의 built-in image_gen으로 세로 실사 콘셉트1장 생성·사용자에게 표시. `.local/creator-concepts/sion/portrait-v1.png`에 원본을 복사했고 기획/정확한 프롬프트/원본 경로는 같은 폴더 `concept.json`에 보존. 이미지 검증 증거는 `docs/audit/sion-concept-20261023.json`. 인물·의상·손·글자 없음 육안 검수 및 PNG규격/해상도/SHA/복사본 일치 확인.
- 상태: 콘셉트 제안만 완료. 사진 방향에 대한 사용자 반응에 따라 프로필/커버/댄스/비하인드 변형을 만든 뒤 별도 요청 범위에서 목업으로 연결할 수 있다. 현재 제품 코드·fixture·DB·운영 배포 변경 없음. 단순 이미지 기획이라 제품 테스트는 수행하지 않았고 문서 스냅샷 검사는 별도로 갱신한다. 기존 AGENTS의 프로젝트/스택/PROGRESS 우선 확인 규약 유지.

### 2026-10-24 시온 실사 촬영 느낌 보정

- 사용자 요청: 모카 코스프레 사진처럼 실제 촬영한 느낌으로 변경. 시온 v1은 인물/의상 참조, 모카 editorial은 스튜디오 조명/사진 질감만 참조해 image_gen 편집으로 v2를 생성했다. 어두운 성 배경·적청 조명 대신 밝은 회색 스튜디오, 부드러운 중립광, 자연스러운 피부/머리카락/직물 질감을 적용. 시온의 검은 머리·차가운 인상·검은 북부대공 코스프레를 유지했다.
- 산출물 `.local/creator-concepts/sion/portrait-v2-realistic.png`; 정확한 프롬프트·참조 역할·원본 경로는 같은 폴더 `generation-v2.json`. v1 보존. 생성 사진을 사용자에게 표시했고 단일 성인 남성·손·의상·텍스트 없음·밝은 사진 스타일을 육안 검수. PNG 해상도·원본 복사 일치·SHA는 `docs/audit/sion-realistic-20261024.json`.
- 기획 시안 수정 단계이며 목업 데이터·운영 배포는 하지 않았다. 다음 작업은 사용자 반응에 따라 v2 스타일로 추가 사진 또는 목업 연결. 제품 코드는 불변이라 제품 테스트는 해당 없음. AGENTS의 기존 프로젝트/스택/진행 로그 우선 확인 규약 유지, 문서 검토 후 snapshot 검사만 갱신한다.

### 2026-10-24 시온 목업 크리에이터 추가

- 사용자 승인한 시온 v2 실사 사진을 `public/illustrations/creators/sion/portrait-v1.png`로 그대로 복사하고, 같은 얼굴/조명을 참조해 image_gen으로 얼굴 중심 `avatar-v1.png`를 생성했다. 생성 경로/참조/프롬프트는 같은 폴더 `generation.json`. 기존 콘셉트 원본은 유지한다.
- `lib/content/landing.ts`의 두 번째 크리에이터 시온(sion.noir), 코스프레/아트·소개·커버·아바타를 추가. 모카 대표/첫 카드와 기존 하단 콜라주 인물은 유지했다. `components/preview/service/fixtures.ts`에 공개 화보(사진2장), 멤버십 전용 텍스트 촬영 노트, 노아르 클럽 Lv.1(목업9,900원)을 연결. 랜딩·탐색·홈·프로필·미디어·소개·멤버십·내구독은 기존 공통 표시 컴포넌트 사용. 추가 화면 복제나 실제 서비스 API/DB 변경 없음.
- 검증: 레이어/TypeScript/283검사 PASS. 초기 텍스트 fixture의 필수 image/position 누락을 기존 빈 이미지 계약에 맞춰 보정 후 전체 check 재통과. 직접 fixture 검사로 크리에이터8명·시온게시물2·멤버십1·이미지2 경로/해시·중복ID없음, 비가입/타크리에이터구독/유효가입/해지예약/만료의 목업 공개행렬 확인.
- 로컬 브라우저1280×720/390×844에서 프로필사진·공개화보 확대/다음사진, 소개/미디어, 가입전 잠금·가입후 본문/내구독, 랜딩2번째카드/이름검색, 코스프레필터 모카·시온2명, 홈피드 연결 확인. 이미지깨짐·가로넘침·수집된 콘솔오류 없음. 새로고침으로 초기 비가입 상태 복원, viewport 원복, 시온 프로필 탭을 남겼다. 증거 `docs/audit/mock-sion-20261024.json`, 로그/화면 `.local/sion-preview-20261024/`.
- 현재 로컬 추가 완료, 운영은 기존 모카 릴리스 유지. 배포 요청 시 프론트 에셋/fixture 범위만 검증해 반영하면 된다. 가격/통계는 운영 정책이 아니며 실제 결제·계정 생성 없음. docs/preview-pages.md와 manifest를 검토 후 docs:record/check:docs로 갱신한다. AGENTS의 기존 공유 UI·데이터 격리·진행 로그 규약을 그대로 적용한다.

### 2026-10-24 시온 목업 운영 배포

- 사용자 운영 배포 요청에 따라 `crefans-front:mock-sion-20261024`를 beta.crefans.com 프론트에 반영. 이전 운영 대비 랜딩 데이터·preview fixture 2파일 변경, 시온 사진2장·생성기록1개 추가만 확인. 새 amd64 이미지의 런타임 코드/설정/에셋473개가 로컬과 일치했다. 직전 레이어/타입/283검사 증거의 관련 소스 해시가 유지되어 전체 단위검사는 불필요하게 재실행하지 않았다.
- 운영용 Docker build 종료0, 격리3013 컨테이너4경로200·사진2장 바이트 일치 확인 후 제거. 운영 전송·checksum·load·프론트 교체 모두 종료0. health 및9개 preview/service 페이지200, 새 사진2장 SHA 일치. frontend running/restart0, API·worker·DB·admin·proxy 컨테이너 ID 유지. 실제 계정/결제/DB·미디어 보안 설정 변경 없음.
- 운영 PC1280×720·모바일390×844에서 프로필·멤버십 진입·가격/사진, 랜딩2번째 카드·이름 검색, 코스프레 필터의 모카/시온 카드와 홈 피드 연결을 확인. 비가입 촬영 노트 잠금 유지, 이미지깨짐·가로넘침·수집된 콘솔오류 없음. 운영에서 실제/가상 가입은 실행하지 않았으며 가입 전후 검사는 직전 로컬 증거 범위다.
- 임시 SSH 규칙 삭제 및 기존 권한 복원 확인. 복구 설정 `/opt/crefans-backup-mock-sion-20261024`. 배포 증거 `docs/audit/mock-sion-deployment-20261024.json`, 실행로그/운영 스크린샷 `.local/sion-deployment-20261024/`. 기존 미커밋 변경을 보존했고 commit/push 없음. 앞선 로컬만 완료라는 항목은 당시 상태 기록이다. 문서/manifest 검토 후 docs:record/check:docs로 참조·증거를 갱신하며 제품 검증과 구분한다. 기존 AGENTS 규약 유지.

### 2026-10-24 멤버십 상단 크리에이터 표시 개선·운영 반영

- 요청한 `(이름)의 프로필` 링크를 원형 프로필사진48px+이름의 가운데 정렬 행으로 교체. 별도 프로필 복귀 링크는 정상/멤버십 없음 화면에서 제거했다. 제목은 중복 이름 없이 ‘멤버십에 가입하세요’. 기존 공용 Avatar를 재사용하고 새 표시 컴포넌트는 만들지 않았다. 목업/실서비스 양쪽 ServiceRouter가 동일 MembershipPage를 사용하므로 함께 적용된다.
- 변경 범위는 `CreatorPages.tsx`, `creator.module.css` 2개 런타임 파일. 구독·결제 로직은 유지. `npm run check` 레이어/타입/283검사 통과, 로컬 모바일390×844·PC1280×720에서 사진/이름·복귀 링크 없음·깨짐/가로넘침 없음과 선택 확인창·동의 전 비활성 확인. 실제/가상 가입은 실행하지 않았다.
- 프론트 `crefans-front:membership-identity-20261024` 운영 배포. amd64빌드 통과·이미지473파일 로컬 일치, 격리4경로200 후 제거, 운영health/9경로200·frontend running/restart0. API·worker·DB·admin·proxy는 같은 컨테이너 유지. 운영 PC/모바일에서도 사진/이름·복귀 링크0·이미지/가로넘침/수집된 콘솔오류0 확인. 운영 시온 멤버십 탭을 남겼다.
- 임시SSH 규칙 제거·원래 권한 복원. 복구 설정 `/opt/crefans-backup-membership-identity-20261024`. 증거 `docs/audit/membership-identity-20261024.json`, 로그/스크린샷 `.local/membership-identity-20261024/`. 기존 미커밋 작업 보존, commit/push 없음. 관련 페이지 문서/manifest 검토 후 docs:record/check:docs로 현행화. 기존 AGENTS 규약 유지. 이 요청의 추가 미해결 작업 없음.

### 2026-10-24 모바일 14px 비교 브랜치·임시 운영 배포

- 새 `feat/mobile-14px-typography` 브랜치를 현재 운영 작업에서 생성. 원격 dev 최신 SHA를 읽어 현재 HEAD보다2커밋 뒤인 것을 확인했고 기존 미커밋 운영 변경을 그대로 보존했다. 브랜치만 생성했으며 commit/push는 하지 않았다.
- 조사: ServiceShell 기본은 이미14px지만 개별본문/라벨/보조정보에는8~13px 지정이 많았다. 팬/랜딩/카탈로그 root에서767px 이하에만 기존 body14px 토큰을 `--cf-mobile-font-min`으로 상속; 공용 UI·서비스 CSS의 작은 font-size는 `max(원래크기, 최소값)`으로 처리.22CSS·265선언과 카탈로그 표시1파일 변경. 큰 제목·PC 기본값·구형 앱·모바일 미지원 스튜디오는 유지. 목업 안내 띠11px는 제품 UI 밖이라 그대로다.
- 검수 중 기존701~767px 멤버십 안내 영역의 음수여백이 공통패딩보다8px 커지는 문제를 발견해 경계767px로 통일. 320px 랜딩 CTA는 세로, 모바일 혜택은 아이콘 아래 문구로 배치해14px 줄바꿈을 보정. 첫빌드를 이 수정 때문에 의도적으로 중단하고 최종 소스로 다시 성공했다.
- 검증: npm run check 레이어/타입/283검사 PASS. 로컬12화면×모바일390/PC1280 전후글자 대조,320/767/768 경계36회와 보정한2화면×5폭 재검수. 본문/조작부14px, PC폰트 유지, 가로넘침/이미지깨짐 없음, 멤버십 확인창14px·동의전 비활성 유지. 운영에서도12화면×2폭24조합 확인. 초기 로딩 중 측정은 완료 증거에서 제외하고 networkidle/요소표시 후 다시 측정했다. 인증 라벨은 dev12/운영13의 기존CSS순서 차이여서 이전운영이미지3014로 대조, 구/신운영 모두13px 확인 후 컨테이너 제거. 실제/service 피드·로그인·랜딩도14px 적용 확인. 물리iPhone/Safari 검증은 아님.
- 운영 `crefans-front:mobile-14px-20261024`, 이미지473파일 소스일치, 격리4HTTP경로/운영health·9경로 통과. frontend running/restart0, 타5컨테이너ID 유지. 임시SSH 삭제·기존권한복원. 복구 이미지 `crefans-front:membership-identity-20261024`, 설정백업 `/opt/crefans-backup-mobile-14px-20261024`. 운영 피드 탭 유지, 수집된 콘솔오류0.
- 근거 `docs/audit/mobile-14px-20261024.json`, 로그/스크린샷 `.local/mobile-14px-20261024/`. 디자인 시스템 설명 및 현재상태/manifest 검토 후 docs:record/check:docs 갱신. 기존 AGENTS 규약 유지. 다음 단계는 사용자가 모바일 체감 후14px 버전 유지/복구를 결정하는 것. 자동복구시간은 지정되지 않아 예약하지 않았다.
