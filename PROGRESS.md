## 2026-11-03 모바일 내 프로필 스튜디오 바로가기 — 수정·검증 완료, 운영 미배포
- 요청: 크리에이터인 경우 상단 오른쪽 설정 왼쪽에 제목 ‘스튜디오’ 버튼. ownCreatorIds로 표시 조건을 정하고 basePath/studio로 이동한다. 모바일767px 이하에만 표시, 기존 흰색 커버 버튼/44px 높이·포커스 규칙을 재사용한다. 지갑이 비활성이어도 오른쪽 설정 옆에 배치한다.
- 최신origin/prod88237ff에서 feat/my-profile-studio 생성 후 직전 프로필 수정00207ee를 fast-forward로 보존. 원래 두 브랜치와 다른 작업 체크아웃은 유지한다. 운영 미배포.
- 검증: npm run check(계층·타입·516단위)·운영 빌드35페이지 통과. 모바일WebKit320/390·지갑 없는 크리에이터·일반팬·비로그인·PC Chromium1440의6상태에서 표시 조건,44px높이·8px간격·겹침/가로넘침 없음 확인. 목업 스튜디오 버튼 클릭→대시보드 표시, 서비스 href=/service/studio 확인. 브라우저 런타임 오류0,320/390 및 도착 화면 육안 확인. 실제 운영 로그인/물리 iPhone 검증·배포는 미실행. API 대역과 목업을 사용했고 새 영구 테스트는 추가하지 않았다.
- 증거: [바로가기 검증](docs/audit/my-profile-studio-20261103.json), 캡처/실행 자료 `.local/my-profile-studio-20261103/`. 다음: 배포 요청 시 이 feature(직전 프로필 수정 포함)를 dev→prod 순으로 통합하고 운영 화면 대조. 기타 별도 feature는 포함하지 않는다.

## 2026-11-03 내 프로필 피드·미디어 0 재제보 — 최신 prod 기준 수정·검증 완료, 운영 미배포
- 첨부 화면: 공개 프로필 게시물1/피드1/미디어1, 내 프로필 게시물1/피드0/미디어0 및 빈 상태. 원격 최신prod88237ff 확인: 기존 수정31a3c92와 미디어 타일77555b4가 미통합·미배포여서 운영 AccountPages는 탭0·빈 화면 고정, me 경로는 본인 게시물 조회가 없었다.
- 기존 작업 폴더를 재사용해 최신origin/prod88237ff에서 feat/my-profile-feed-current 생성. 원래 feat/my-profile-posts(77555b4) 보존. 두 수정의 소스·테스트·관련문서를 이식했고 최신 멤버십 TypedConfirmCatalog/문서와 프로필 미디어 카탈로그 충돌은 양쪽을 유지해 해소. 다른 미배포 기능·기본 체크아웃 미커밋은 포함하지 않는다.
- 합격 조건: 본인 작성자 ID로 최초/더보기 조회, 본인 피드·미디어 개수/내용/썸네일 일치, 텍스트 전용 미디어 제외, 공개 프로필/상세 이동·재진입 유지, 저장/좋아요 컬렉션·팬·비로그인 분리, 조회 실패에 가짜 빈 상태/다른 글 미표시. PC Chromium과 iPhone13 WebKit 확인.
- 이전 API 대역 회귀에 더해 실제 격리 API/DB 세션으로 로그인→사진 업로드/게시물 연결→내 프로필 피드/미디어→상세→공개 프로필→재진입/새로고침 시험을 추가했다. 서버는 현재prod d4238d9와 동일한 crefans_server-membership-release 사용. 운영 데이터/실결제/실SMTP/배포는 수행하지 않았다.
- 검증: npm run check(계층·타입·516단위), 운영 빌드(35페이지), 브라우저14건(PC7·iPhone13 WebKit7) 통과. 브라우저 중 실제 API/격리DB2건·API대역12건이며 원래prod코드 대조검사3실패→수정복원3통과. 사진·영상 썸네일/유형별 개수, 저장·좋아요 분리, 오류 안내, 더보기 작성자 필터 확인. 최초 모바일 시험은 전체 문서 전환 중 지갑/후원 요청 취소로 런타임 오류를 탐지했으며 요청 완료 후 이동하도록 시험만 보완, 오류 감지는 유지하고 최종14통과. 물리 iPhone·운영 로그인 검증은 미실행.
- 증거: [이번 검증 기록](docs/audit/my-profile-current-20261103.json), 상세 `.local/my-profile-current-20261103/`. 최신 멤버십 수정 보존, 서버 소스·DB 구조 변경 없음. 다음: 배포 요청 시 이 feature를 dev→prod에 통합하고 운영 소스/화면을 대조한다. 원래 31a3c92/77555b4를 다시 중복 적용하지 않는다.

## 2026-11-03 멤버십 이미지·삭제 확인·공제율 예상 수익 — 운영 배포 완료
- 사용자 “다되면 배포” 승인. feature→dev 통합(358be1c)→prod(73fbc85), 서버 dev fefc3ee→prod d99e010. 실제 배포 소스는 이 두 prod 커밋이며 이후 배포 증거 커밋은 문서만 변경한다. 별도 미배포 feature는 포함하지 않았다.
- 운영 release `membership-20261103`: API·worker·front 교체. 멤버십 사진 폼 공통 MediaUpload, 이름 직접 입력 삭제 확인, 실제 개인 공제율 기반 월 구독료 예상 수익 적용. 원천징수 도움말 제거. DB 구조·기존 구독/수익 원장 변경 없음.
- 검증: dev 프론트 typecheck·관련30건/서버 build·관련6건 통과. Linux amd64 API·프론트 빌드 통과, 이미지 소스/컴파일 해시와 운영 컨테이너 일치. 운영 목업의 공용 UI PC Chromium4·iPhone13 WebKit4 총8건 통과·화면 검토, 운영6경로200, 재시작0/OOM없음. 실제 계정의 생성·삭제/실결제·물리 iPhone 검증은 미실행.
- 설정·DB 백업 확보, 실패 롤백 준비. admin/DB/proxy 미교체, 결제·출금 스위치 유지. Docker 이미지 정리 계획은 최신3/직전운영 보호이나 자동 승인 검토가 이전 로컬10개 삭제를 별도 파괴적 변경으로 거절하여 미실행. 원격10개 계획도 실행하지 않고 이미지 보존. 배포 정상 완료와 별개인 승인 대기 정리다.
- 증거: [배포·검증 기록](docs/audit/membership-deployment-20261103.json), 상세 로그·캡처 `.local/membership-deploy-20261102/`. 이전 로컬 검증 기록은 아래에 보존.

## 2026-11-02 멤버십 삭제 직접 입력·개별 공제율 예상 수익 — 로컬 완료·미배포
- 최신 origin/prod feef422에서 feat/membership-confirmation 생성. 직전 이미지 폼 커밋 0f2e6ff를 5944793으로 가져와 이번 멤버십 변경과 함께 보존했다. 기본 체크아웃/다른 feature 미커밋은 건드리지 않았다.
- 공통 TypedConfirmDialog: 운영 콘솔의 exact phrase 규칙을 기존 Dialog/Field/Button/DialogActions로 구현, 확인 문구·콜백·busy/error를 주입한다. 멤버십 이름 정확히 입력(공백 포함), 자동 제출 없음, 취소/재진입·대상 변경 초기화, 요청 중 닫기·중복 클릭 차단, 실패 입력 유지. 디자인 시스템 예시 추가. API와 목업에 confirmation 전달/검사, 유효 구독 보호 유지.
- 월 구독료 도움말은 `나의 공제율: N% · 예상 수익: N원 / 결제 1건`. 원천징수 문구 제거. 실제 creatorTerms.platformFeeBps에 기반해 서버와 같은 공제액 원 미만 버림 후 차감. 0% 보존, 누락/잘못된 공제율이면 확인 필요·예상액 미노출. 목업은 명시적 예시 조건 주입. 예상 수익 문자열/함수 검색 결과 이 공통 함수만 사용한다.
- 서버 짝 작업: /Users/ethan/repository/crefans_server-membership-confirmation, 같은 feature명. 개별 조건 없는 회원에도 DB 현재 기본값을 반환하도록 studioTerms 수정(기존 null→클라이언트 고정20% 불일치 해결). 삭제는 잠금 후 이름/소유권/삭제 상태/유효 구독 재확인. 기존 결제·구독 원장은 재계산하지 않는다. DB 변경 없음.
- 검증: check 계층·타입·510 단위 통과, PC Chromium/모바일 WebKit 8건(이번 삭제/가격2 + 이전 이미지폼6) 통과, build35페이지 통과. 서버 build·직접 입력/공제율6 및 OpenAPI11 통과. 잘못된 확인 허용·고정20% 회귀를 주입한 대조 검사에서 프론트2/서버3 실패 확인 후 복원. PC/모바일 캡처 육안 확인. 실기기/운영API/실결제/실DB 동시성 검증은 미실행.
- 증거: docs/audit/membership-confirmation-20261102.json 및 .local/membership-confirmation-20261102/. 문서 검사에서 source hash 만료 검토 후 스냅샷을 갱신한다(제품 테스트 증거와 별도).
- 다음: 요청 시 이 프론트·서버를 dev 통합 검증→prod 승격→함께 배포. 구형 클라이언트의 confirmation 없는 삭제는 새 서버에서 거절됨. 현재 미푸시·미통합·미배포. 기존 업로드 설명 간소화49c507d/프로필/운영 no-data 등 별도 미배포 작업은 이 feature에 미포함.

## 2026-11-02 멤버십 이미지 등록 폼 통일 — 로컬 완료·미배포
- 요청: 멤버십 생성 모달의 이미지 폼을 게시물 작성 화면과 같은 디자인으로 교체한다. 생성·수정과 실제/목업이 공통 화면을 사용하므로 함께 적용했다.
- 공통 MediaUpload의 회색 사진 추가 버튼·0/1 카운터·정사각 썸네일·X 삭제 버튼을 재사용한다. 멤버십은 max=1·이미지 전용 accept·사진 추가 라벨, 파일 선택 multiple=false. 이미지 삭제 후 다시 선택한다. 도움말은 JPG·PNG·WebP 5MB 이하. 기존 게시물 다중 미디어·순서 변경 동작 유지. 디자인 시스템 예시도 같은 컴포넌트로 교체했다.
- 확인 중 발견: 실서비스 uploadMembershipImage는 공통 미디어 API를 사용하여 accept를 우회한 동영상이 업로드 단계에서 거절되지 않았다(서버 멤버십 저장에서는 IMAGE만 허용). 실서비스 모델에도 기존 목업과 같은 유형·0바이트·5MB 상한 검사를 추가해 업로드 전에 안내한다. 서버 정책·API·결제·멤버십 가격/레벨은 변경하지 않는다.
- 검증: npm run check 계층·타입·506 단위 PASS, PC Chromium/모바일 WebKit(iPhone 13 화면) 목업 E2E 6/6 PASS. 생성/수정·선택·삭제·저장, 잘못된 형식/크기 오류 후 재선택, 취소 초안 초기화, 게시물 다중 선택 보존. 실서비스 모델은 API 대역 단위로 유효 경계/잘못된 파일의 요청 0건 확인. 원본 picker·실서비스 모델 각각 대조 검사 실패 확인. npm run build 35페이지 PASS. 실제 기기·운영 업로드는 미실행.
- PC·모바일 empty/selected 화면 육안 확인. 상세 로그·명령/시각·소스 해시·검증 화면은 `.local/membership-upload-20261102/`, 공개 검증 요약은 `docs/audit/membership-image-upload-20261102.json`. 문서 검사 결과는 해당 증거에 기록한다.
- 기준 origin/prod feef422에서 feat/membership-image-upload, 작업 폴더 /Users/ethan/repository/crefans_front-membership-upload. 선행 업로드 안내 간소화는 별도 feat/upload-hint-compact 49c507d에 있으며 이 작업은 그 게시물 문구를 덮어쓰지 않는다.
- 다음: 요청 시 미배포 작업과 함께 dev 통합 검증 → prod 승격 → 배포. 현재 커밋만 준비하며 운영 배포 없음. 기존 체크아웃의 미커밋 파일 보존.

# PROGRESS: crefans_front

## 2026-11-01 크리에이터 게시물 워터마크 — 운영 배포 완료
- 새로 업로드한 크리에이터 게시물 사진·영상만 오른쪽 아래 주소 워터마크 적용. 기존 파일·프로필/배경/멤버십 이미지는 제외. 사진 파생 파일은 긴 변 최대2560px, 원본 보존.
- MediaUpload·스튜디오 목록은 사진 처리 중 파일 요청 대신 상태 표시. 업로드 도움말에 적용 범위 안내.
- 검증: dev에서 npm run check489건(계층·타입 포함), 실제 배포 이미지 변환4건, 배포된 공용 작성 화면 PC·모바일2건 통과. 서버 회귀48건·운영 워커/S3 비공개 시험2건 통과 후 시험 데이터 정리. 실기기 전체 가입·업로드·게시 E2E는 미실시.
- origin/prod → feat/creator-media-watermark → dev 검증 → prod push 완료(front4360c2e, serveread6288). 운영 watermark-20261101 API·worker·front 배포, additive migration 하나 적용, admin/DB/proxy 보존. 현재+직전2 이미지·롤백 유지.
- [검증 증거](../crefans_server/docs/watermark-20261101.json), 사본·로그·캡처 `.local/watermark-deploy-20261101/`.


## 2026-11-01 스튜디오 모바일 메뉴 첫 화면 닫힘 + 약관 시행일 선택 시안
- b8dfd43 → studio-menu-20261101 프론트만 배포(사용자 승인): 모바일 드로어 CSS가 data-mobile(화면 크기 감지 후에만 붙음)을 요구 → 첫 프레임에 메뉴가 열려 보이지 않음. 운영 CSS에 규칙 반영 확인, 검증 studio-navigation 7 pass(되돌리면 2 fail), 전체 487 pass.
- 약관·운영정책·개인정보처리방침 시행일 선택: be8573b → legal-version-20261101 프론트 배포(사용자 '배포'). 기본은 최신 시행일(공지된 개정본 포함, 사용자 최초 지시), 옵션 '(예정)·(현재)' 텍스트 표기, 버전 1개면 표기 없음, 기존 '개정본 보기' 제거. 검증 crefans-common 9 pass(되돌리면 1 fail), 전체 488 pass, 로컬 API+목업과 운영 화면에서 기본 11.30 확인. 이전 기록(시안 단계): 제목 오른쪽 위 셀렉트박스, 최신 시행일(2026.11.30) 기본, '예정·현재'는 뱃지 대신 회색 텍스트(사용자 지시). 시안 .local/legal-version-mock-20261101/. 실제 버전은 약관·운영정책 2개(10.30 현재, 11.30 예정), 개인정보처리방침 1개뿐 — 그 이전 시행본은 코드에 없음. 미결: 기본 선택을 최신(예정본)으로 할지 현재 시행본으로 할지 확인 필요.

## 2026-11-01 밤 전체 배포·스튜디오 개선·푸터 (운영 배포 완료)
- full-sync-20261101(사용자 '다 배포'): API·워커·프론트·관리자를 운영 원본+커밋된 변경으로 교체(레퍼럴 출금 불가, 이벤트 주소 301, 로딩 일괄, 스튜디오 수정, 관리자 소멸 문구). 서버 4·프론트 30·관리자 2 파일, 마이그레이션 없음. 운영 진단 기동 성공, 배포 후 릴리스 태그·주요 경로 200·옛 이벤트 주소 301 확인.
- Caddy www→crefans.com 301: 운영 APP_DOMAIN=beta.crefans.com 확인(충돌 없음), 운영 Caddyfile이 384f5ea 직전본과 해시 일치 확인 후 검증·리로드, www 301·apex/beta/admin/guide 200. 증거 .local/full-sync-deploy-20261101/(caddy-www.sh, caddy-deploy.log).
- 통계 요약 차트(017df46): 서버가 원래 30일 일별 데이터를 보내 모바일에서 숫자·날짜가 겹침(오늘 배포와 무관). 막대 12개 초과 시 막대 위 숫자 숨김(툴팁·접근성 유지), 날짜 MM.DD 7일 간격+마지막.
- 스튜디오 콩(bd6b951): /studio/beans 개요(잔액·출금하기 버튼·세부 내역 접힘·받은 후원/출금 내역 링크·안내 최하단), /withdraw·/tips·/payouts 전용 페이지. 팬 출금 경로는 기존 한 페이지.
- 리포트 탭(eb50f5a): 공용 ChipLink(selected 추가)로 교체, TextLink 밑줄 제거.
- 모바일 글쓰기 미리보기(ca5ca2d): 1000px 이하에서 하단 미리보기 숨김, 저장 버튼 위 테두리 버튼 → 전용 모달.
- 위 4건 studio-polish-20261101, 푸터 2열(91a3914) footer-grid-20261101로 프론트만 교체·확인. 각 커밋 대조 검사(되돌리면 실패)·전체 486 pass·tsc 0.
- 발견(미수정): 스튜디오 셸의 모바일 메뉴가 첫 렌더에서 열림 상태(isMobile 초기값 false → data-open=true)라 실제 기기에서 첫 프레임에 메뉴가 잠깐 보일 수 있음. 테스트 브라우저에서는 열린 채로 남는 경우가 반복됨.

## 2026-11-01 '더 보기' 버튼의 '불러오는 중…'도 지연 로딩 (커밋, 미배포)
- 사용자 지시 '불러오는중…도 지연로딩 해'. 피드·크리에이터 피드·댓글 더 보기: 라벨 유지+비활성, 1초 뒤 inline 스피너(components/ui/DelayedSpinner.tsx의 DelayedInlineSpinner). 커밋은 위 로그 참조.
- 검증: tests/crefans-social.test.cjs 시점 측정(0~999ms 문구 없음, 1000ms 스피너), HEAD로 되돌리면 실패, 전체 479 pass, tsc 0.
- 운영에는 아직 스튜디오·약관·출금·광고·댓글 등의 즉시 '불러오는 중…'이 남아 있음 — 로딩 일괄 커밋 fd3fba7이 미배포이기 때문. 구형 화면(app/(main)/write, MembershipManagementModal, profile/Profile.tsx)의 '...불러오는 중...'은 서비스 경로가 아니어서 손대지 않음.

## 2026-11-01 스튜디오 진입 시 '화면을 불러오지 못했습니다' 순간 노출 수정 (/ux-spinner) — studio-loading-20261101 운영 배포
- 원인: useStudioModel이 로그인 확인 전 loading=false로 바꾼 뒤, 로그인 후 요청 시작 때 true로 돌리지 않아 StudioRouter가 응답 전에 오류 화면을 표시. 커뮤니티 실패는 오류 문구 없음.
- 수정: features/service/useStudioModel.ts 두 곳(로그아웃 상태 loading=true 유지, 커뮤니티 실패 문구). 새 테스트 tests/studio-loading.test.cjs(실제 훅+실제 라우터).
- 검증: 4 pass, 수정 전으로 되돌리면 4 fail(0~2500ms 오류 노출 재현), 전체 478 pass, tsc 0. 증거: .local/ux-spinner-20261101-studio/README.md. 브라우저·운영 캡처는 미확인.
- 커밋 bd5c989. 배포(사용자 승인 '1'): 운영 프론트(video-harden) 원본에 이 수정 4줄만 얹어 프론트만 교체, API·워커·DB·프록시·관리자 유지. 기준선 일치 확인, deploy.sh 'Frontend ready', FRONTEND_IMAGE=crefans-front:studio-loading-20261101, /service/studio·/service/feed 200, 운영 스튜디오 청크에서 로그아웃 분기 loading=true 확인. 이미지 정리(롤백용 video-harden 보호). 증거: .local/studio-loading-deploy-20261101/. 실제 로그인 화면 캡처는 미확인. 커밋된 다른 프론트 변경(레퍼럴 문구·이벤트 주소·로딩 일괄)은 이번 배포에 포함하지 않음.

## 2026-11-01 저녁 /pilot-work 결정 동기화 (커밋 완료·배포 대기)
- 결정(클릭 답): 보상 출금 불가·남은 만큼 회수·일부 환불 전체 회수(약관 명시 예정)·비활성 소멸·상한 초과 종결·내역 고지·부정 문구 완화, 원천징수는 회사가 플랫폼 수수료 안에서 부담, 가이드 틀린3+누락5, SEO 새 주소+301·www→apex, 로딩 일괄 정리, 업로드 상한+감시, 재시도+안내, 오프사이트 백업 나중에, 관리자 수수료 그대로.
- 커밋: 서버 ebb3406(레퍼럴 출금 불가)·46fe73e(관리자 소멸 상태)·b65f083(API 설명 7건·설계 문서)·384f5ea(Caddy www 301), 프론트 d2af2a6(초대 카드·내역)·0c1d481(이벤트 주소 301), 관리자 93f4c28, 가이드 ee0aed7·053ac97. 미커밋 유지: 계약 폴더(docs/contracts 전체가 미추적), 프론트 docs/audit manifest·evidence(다른 세션 변경과 섞임).
- 검증: 서버 referrals+beans+openapi 57 pass(보상 로트 되돌리면 3 fail), 프론트 초대 테스트 5 pass(HEAD 카드면 1 fail), 이벤트 301 테스트(302면 1 fail)·개발 서버 curl 301, Caddy validate(APP_DOMAIN=www면 실패), 가이드 사본 check-guides 링크·앵커 1345(앵커 훼손 대조 검출), 계약 PDF v2.36 7쪽 자동 PASS·전 쪽 육안, check:docs PASS.
- 배포 대기: video-harden-20261101(API·워커·프론트, 이미지 운영 서버 적재·진단 기동 성공, deploy.sh 실행은 승인 필요로 미실행), 레퍼럴·이벤트 주소·Caddy·가이드는 아직 빌드 전.
- 미해결: ① 약관 개정(11-30 시행본은 10-30 공지 완료 — 레퍼럴 조항·원천징수 문구를 여기에 넣을지 별도 개정으로 할지) ② 운영 APP_DOMAIN이 www가 아닌지 배포 전 확인(같으면 Caddy 기동 실패) ③ 가이드 check:guides 소스 잠금 52건 차이(전체 재검토 필요), beans/referral 가이드 매핑 없음 ④ 배포·미커밋 67개(night-work/drift-20261101.md) ⑤ 로딩 규칙 12곳 진행 중.
- 사고: 18:33 서버 docs/platform-api.md를 스크립트 실수로 0바이트로 만듦 → 10/31 사본+codex 기록 1건 재적용으로 복원, 기록 해시 f27e3b36 일치 확인 후 행 추가.
- 19:10 추가: 사용자 결정 '기능 묶음별 커밋'으로 배포·미커밋 67개 정리 → 재측정 결과 세 저장소 모두 0개(남은 운영≠HEAD는 커밋 후 배포 대기분). 서버 2c3e5ae·e6472c9·fd999f0·910bf63·3b56003, 프론트 f81a056~fca06d0(9개)·5f95e58, 관리자 514e53c·4de157b·be481cc. 각 커밋은 배포 사본 SHA-256 일치 확인, 스냅숏 검사: 서버 tsc·build·openapi 11 pass, 프론트 tsc·전체 455 pass, 관리자 tsc·11 pass. 다른 세션의 미배포 테스트(서버 tests/*, platform-categories·new-creators 테스트)는 아직 미커밋.
- 로딩 규칙 12곳(서브에이전트): 프론트 fd3fba7, 관리자 b04aaf7. 스냅숏 474 pass, ApiState 되돌리면 2 fail. 프론트 e2e/advertising 문구는 미실행.
- 약관: 사용자 결정 '별도 개정으로 새로 공지' — 레퍼럴 조항·원천징수 회사 부담 문구를 담은 새 개정본(30일 전 공지)을 준비할 차례. 공지 게시·시행일은 사용자 확인 필요.
- 19:25 video-harden-20261101 운영 배포 완료(사용자 '배포' 승인): API·워커·프론트 교체, 관리자·DB·프록시 유지, 마이그레이션 없음. 배포 직전 기준선 API save-fix·프론트 message-read 일치, 진단 기동 성공. 배포 후 APP_RELEASE=video-harden-20261101, /service/feed·/api/v1/health 200, media status 무인증 401, api healthy, 워커 5분 로그 오류 0건. 이미지 정리 --keep 3(롤백용 save-fix·message-read·ad-form 보호) 로컬·원격 각 3개 삭제. 증거: crefans_front/.local/video-harden-deploy-20261101/. 실제 아이폰 영상 업로드·10분/4K 거부·재시도는 운영에서 직접 시험하지 않음.


## 2026-11-01 15:43 night-work 조사 문서

- 위치: `crefans_front/.local/night-work/2026-11-01-1543.md`(읽기 전용 조사, 코드 변경 없음).
- 상위: ① 변환 중 아이폰 영상이 든 게시물 저장 시 409(studio.service 트랜잭션 재검사가 COMPLETED만 허용, 운영 반영) ② 운영 코드 76개 파일이 git에 없음 ③ 변환이 384MB 워커에서 돌고 감시 없음 ④ 서버 밖 백업 꺼짐 ⑤ 친구 초대 내역·약관·계약 제6조③·회수 알림 정합성과 보상 결함(G1·G3·G7).

## 2026-11-01 메시지 전송됨·읽음 표시 — message-read-20261101 운영 배포(API·프론트)

- 내 메시지 아래 체크 1개+"전송됨", 상대가 읽으면 체크 2개+"읽음"(브랜드 색). 상대 메시지는 표시 없음. 서버 inbox가 내 메시지에 read(read_at 존재)를 붙임.
- 커밋: 프론트 e3f6df5, 서버 a407be3. 검증: 프론트 npm test 451(대조: 읽음 분기 제거 시 실패), 운영 서버 진단 기동 후 배포, 운영 /preview에서 "전송됨" 체크 확인.
- 한계: 실시간 갱신 없음(대화 다시 열기·새로고침 시 읽음 반영). 실제 두 계정 확인 미실시. 증거 `.local/message-read-deploy-20261101/`.

## 2026-11-01 친구 초대 카드 '보상 콩 출금하기'를 받은 보상 행 오른쪽 끝으로 — referral-withdraw-20261101 운영 배포

- ReferralCard의 받은 보상 행(금액 옆, 행 오른쪽 끝)에 버튼을 넣고 카드 아래 별도 버튼은 제거. 모바일·PC에서 행 오른쪽 끝·같은 줄·가로 넘침 없음 확인, 운영 /preview에서 확인.
- 미커밋: ReferralCard·referral.module.css는 다른 세션의 미커밋(배포된) 코드라 이 변경도 커밋하지 않음. 증거 `.local/referral-withdraw-20261101/`, `.local/referral-withdraw-deploy-20261101/`.

## 2026-11-01 친구 초대 내역(A안)·초대 페이지 로딩 규칙 — referral-history-20261101 운영 배포(API·프론트)

- 사용자 결정: 초대 내역 화면은 시안 A(요약 3칸+상태 칩+초대별 행). 가입자 이름은 앞 세 글자+별 10개로 가림.
- 서버 a7637e8: GET /api/v1/me/referral/history(status=joined|waiting|rewarded, page, 20개). 본인 초대만, 마스킹 닉네임·상태·가입일·확정 예정일·지급일·보상 콩만 반환(이메일·회원 ID·결제 정보 없음), 스위치 꺼지면 404. OpenAPI 계약 포함.
- 프론트 2cc2e29: ReferralHistoryPage(로딩 규칙: 이전 목록 유지·1초 뒤 스피너·마지막 요청만 반영), 모델 액션, 목업 데이터. 99fc856: 친구 초대 응답 전 undefined.
- 미커밋(다른 세션 미커밋 코드 위): /beans/referral-history 경로 허용·제목(app/service, app/preview), 두 ServiceRouter 분기, 초대 페이지 "초대 내역 보기" 링크, 초대 페이지 로딩 분기(BeanReferralPage)와 그 테스트, 서버 tests/platform-openapi.test.cjs 개수(185/78/46).
- 검증: 서버 referrals·openapi 21건(대조: 마스킹 제거 시 실패), 프론트 npm test 450(대조: 마지막 요청 검사 제거 시 실패), 모바일 WebKit 목업 화면. 증거 `.local/referral-history-20261101/`, `.local/ux-spinner-referral-20261101/`.
- 배포: 운영 서버에서 진단 기동 확인 후 전환. 운영 확인: 내역 API 비로그인 401, /preview 초대 내역 4행 마스킹, /service/beans/referral-history 200, 초대 페이지 링크 표시. 증거 `.local/referral-history-deploy-20261101/`.
- 남은 일: 처리방침에 "초대한 회원에게 가입자 닉네임 앞 세 글자와 진행 상태를 보여 줌" 고지 필요(현재 처리방침은 집계만 보여 준다고 되어 있을 수 있음, 확인 필요). 운영 레퍼럴 스위치는 꺼져 있어 배포해도 화면은 "이용할 수 없음".

## 2026-11-01 변환 중 영상 표시·목록 이동·로딩 규칙 — video-optimizing-20261101 운영 배포(API·프론트)

- 사용자 요청: 업로드 타일은 썸네일+작은 "영상 최적화 중", 변환 끝나면 사라짐. 변환 중에도 게시·예약 가능, 보는 화면은 "영상 최적화 중". 게시·예약·수정 저장 후 목록 이동(임시저장은 머묾). 목록 사진이 크게 보임(동영상 썸네일 미제한). 메시지 빈 화면을 알림과 같게. /ux-spinner 마이페이지 내 지갑 버튼.
- 커밋: 프론트 8da329d(타일·폴링·보는 화면·목록 이동·목록 56x48), 6d2f5d5(메시지 빈 화면), c5f5884(LoadingSpinner inline), 99fc856(친구 초대 응답 전 undefined). 서버 5f6f92f(게시물에 processing 영상, GET media/:id/status), f4e70c9(OpenAPI 계약 추가).
- 첫 배포 실패·자동 롤백: 새 상태 API가 OpenAPI 계약에 없어 installPlatformOpenApi가 기동 중단. 계약 추가 후 운영 서버에서 진단 컨테이너로 기동 확인한 뒤 재배포 성공. 교훈: 라우트 추가 시 tests/platform-openapi.test.cjs를 반드시 실행.
- 미커밋(배포됨 또는 대기): 내 지갑 버튼 로딩(BeanPages, 다른 세션 미커밋 아이콘 버튼 위) 배포됨, 테스트 tests/bean-wallet-link.test.cjs 미커밋. 친구 초대 페이지 로딩 규칙(BeanReferralPage) 미배포·미커밋. 서버 tests/platform-openapi.test.cjs 개수(184/77/46) 미커밋(HEAD 개수가 이미 낡음).
- 증거: `.local/video-optimizing-deploy-20261101/`, `.local/ux-spinner-wallet-link-20261101/`, `.local/ux-spinner-referral-20261101/`. 친구 초대 내역 시안 5종 `.local/referral-history-drafts-20261101/` 선택 대기(마스킹: 앞 3글자+별 10개).
- 남은 결정: 친구 초대 내역 시안 선택(서버가 지금은 집계만 반환하므로 초대별 목록 API와 처리방침 고지 필요), 친구 초대 페이지 로딩 수정 배포.

## 2026-11-01 아이폰 .mov 업로드 서버 변환 — mov-transcode-20261101 운영 배포(API·워커·프론트)

- 사용자 제보: 아이폰에서 동영상 선택 시 "JPG·PNG·WebP·MP4·WebM 파일만 지원" 오류(아이폰은 QuickTime .mov, 주로 HEVC). 사용자 결정: 서버에서 MP4로 변환.
- 서버 c7aee2e: 업로드가 video/quicktime(또는 .mov octet-stream, QuickTime 아톰 검사)을 받아 원본을 `MEDIA_ROOT/<id>.source`에 두고 PROCESSING. 워커 별도 루프(15초)가 한 번에 하나씩 ffmpeg로 H.264/AAC MP4(긴 변 1280, 메타데이터 제거, faststart, nice·1스레드) 변환 후 S3 `platform/<id>` 저장, COMPLETED. 실패는 FAILED, 원본은 끝나면 삭제. 게시물 저장은 변환 중 영상 허용, 게시물에는 COMPLETED만 표시. API 이미지에 ffmpeg 설치.
- 프론트 938a813: accept에 video/quicktime·.mov, 타일 "동영상 변환 중"/"변환 실패", 팬 미리보기에서 제외.
- 검증: 서버 tests/platform-video-transcode.test.cjs 3건(대조 2종 실패), 기존 media·studio·jobs 회귀 통과, Docker와 운영 워커 컨테이너에서 HEVC .mov → H.264 720p 실제 변환·위치 태그 제거 확인. 프론트 npm test 442.
- 미확인: 실제 아이폰 업로드부터 게시·재생까지(사용자 실기기 시험 필요), 긴 4K 영상의 변환 시간과 서버 부하(2코어). 증거 `.local/mov-transcode-deploy-20261101/`.

## 2026-11-01 글쓰기 화면 다듬기·후원 정렬 — editor-polish-20261101 운영 배포

- 커밋: 657bdef(저장 전 새 글 임시저장 뱃지 숨김, 입력 안내 '제목을 입력하세요'/'내용을 입력하세요'), 1539f44(미디어 입력 제목 '파일 업로드'), 8cecf9b(후원 `.postTip` align-items:center; 미리보기에서 비활성 span일 때 숫자가 약 4px 위).
- 미커밋(배포됨): 예약 박스 배경 제거, 박스 하단 안내 문구 삭제, 예약 시각이 있으면 주 버튼이 '예약하기'로 바뀌고 예약 저장(별도 예약하기 버튼 제거, 예약 사용만 켜고 시각이 없으면 주 버튼 비활성). 예약 토글 코드 자체가 다른 세션의 미커밋 작업이라 함께 커밋하지 않음. 관련 테스트(`tests/crefans-studio-management.test.cjs`)도 미커밋.
- 검증: npm test 440, tsc, 대조(버튼 저장 상태·라벨 되돌리면 실패), 운영 /preview 모바일 WebKit에서 뱃지 0·안내 문구·'파일 업로드'·배경 투명·시각 입력 시 '예약하기' 확인. 증거 `.local/editor-polish-deploy-20261101/`.
- 업로드 영역 심플 시안 5개(`.local/upload-drafts-20261101/upload-drafts.png`) 중 사용자가 B(회색 버튼 한 줄) 선택. 6db00ab: 버튼 맨 위·안내 '이미지 5MB · 동영상 300MB · 최대 10개'·작은 썸네일(72~88px), '끌어서 순서 변경' 문구 제거(드래그 정렬 기능은 유지). 운영 `upload-b-20261101` 배포, 운영 /preview 모바일 확인.

## 2026-11-01 아이폰 동영상 미리보기 첫 프레임 — video-frame-20261101 운영 배포 (메인 ba125ac, 브랜치 feat/video-upload-first-frame ff30831 미푸시)

- 작업 폴더 `/Users/ethan/repository/crefans_front-video-thumb`(origin/prod 기준 worktree), 커밋 ff30831. `MediaVideo` `firstFrame`(src#t=0.001)을 업로드 타일·피드·넓게 보기·스튜디오 목록에 적용.
- .mov는 프론트 accept와 서버 허용 목록(`video/mp4`,`video/webm`)에서 거부되므로 서버 썸네일 단계는 해당 없음. 서버에 썸네일 생성 API 없음(백엔드 필요 시 별도 결정).
- 메인 ba125ac(MediaOverlay 포함 5곳)을 직전 운영(og-simple) 소스에 얹어 배포. 운영 번들에 #t=0.001 포함 확인, 운영 피드에 비로그인 동영상 게시물이 없어 실영상 화면은 미확인. 아이폰 실기기 미확인. 증거 `.local/video-frame-deploy-20261101/`, worktree `.local/video-first-frame-20261101/README.md`.

## 2026-11-01 공개 페이지 검색 노출·공유 미리보기(OG) — seo-og-20261101 운영 배포

- 사용자 결정(클릭형): 공개 페이지만 색인 / 크리에이터별 동적 미리보기 / 공개 게시물은 본문 사용 / 대표 문구 '크레팬스 crefans - 크리에이터 멤버십·후원 플랫폼'.
- 구현(f4ce014): `lib/seo/site.ts`(사이트 상수·`shareMetadata`·비로그인 `publicApi`), `lib/seo/service-metadata.ts`(화면별 메타·JSON-LD), `app/robots.ts`, `app/sitemap.ts`(검색 허용 크리에이터 포함, 요청 시 생성), 루트 `metadataBase`·OG·트위터 카드, 대표 이미지 `public/og/crefans-og.png`(원본 `scripts/og/`, `node scripts/render-og.cjs`).
- 색인: 홈(feed)·탐색·크리에이터·멤버십·공개 게시물·이벤트·이용안내·약관·공지·고객센터. 그 외(지갑·설정·메시지·결제·팬 프로필·로그인 등)는 noindex. 검색 비허용(`searchable=false`)·팬 프로필·없는 프로필은 noindex. 게시물은 비로그인 `canAccess=true`일 때만 본문·이미지, 잠긴(유료·성인·숨김) 게시물은 크리에이터 정보만·noindex.
- Next 15.5는 동적 메타를 스트리밍하므로 `next.config.js` `htmlLimitedBots`에 카카오톡·다음·네이버·라인·텔레그램·밴드 스크래퍼 추가.
- 검증: npm test 437 통과, tsc 0, 대조(잠금 판정 제거·robots `/service/me` 접두어 오류 시 실패), 로컬 가짜 API 카카오 UA 추출, 운영 카카오/구글 UA 메타·robots.txt·sitemap(15)·og.png 200. 증거 `.local/seo-og-deploy-20261101/`.
- 사용자 조치 필요: 네이버 서치어드바이저·구글 서치콘솔 사이트 등록과 sitemap 제출(소유 확인 코드는 사용자 계정에서 발급), 이미 카톡에 공유된 링크는 카카오 공유 디버거에서 캐시 초기화.
- 남은 일: 이벤트 URL id에 `beta-` 접두어가 남아 sitemap에 노출됨(주소 변경 여부 결정 필요). `npm run check:docs`는 기존 레퍼럴·프로필 사진 API 설명 누락으로 실패(이번 변경과 무관, 미해결).

## 2026-11-01 지갑·화면 전환·탐색 로딩 규칙(/ux-spinner)과 탐색 카드 빈 배경 — card-wallet / explore-spinner 배포

- 커밋: 2eeedee(탐색 카드 배경 사진, 없으면 연회색+흰 로고), e28ad9b(지갑 잔액 1초 지연 스피너), a0062e0(ServiceRouter 화면 전환 문구 → 지연 스피너; 사용자 제보: 모바일 하단 탭마다 '불러오는 중…'), fcc3a19(탐색 '크리에이터를 불러오는 중…' → 지연 스피너).
- 운영 프론트 `card-wallet-20261101` → `explore-spinner-20261101`: 직전 운영 소스에 위 변경만 적용. 운영 모바일 확인: 탐색 진입 시 문구 없음, '크레팬스' 카드 연회색+로고.
- 측정·대조: `.local/ux-spinner-20261101/`(지갑 5경우, 하단 탭·탐색 빠른/2.5초, 수정 전 코드 대조).
- 남은 일: StudioRouter·BeanWithdrawContainer·CommonPages·BeanChargePage의 '불러오는 중…' 문구는 범위 밖.

## 2026-11-01 레퍼럴 디자인 폴리싱·복사 하단 스낵바 (로컬 완료·미배포)
- 요청/합격 기준: 팬 친구 초대와 콘솔 레퍼럴 관리가 각 서비스의 기존 톤앤매너를 따르며, 복사 성공은 본문 이동 없이 하단 스낵바로 표시한다. PC·모바일 레이아웃과 실패·반복 복사를 검증하고 기존 정책·권한·API를 유지한다.
- 구현: 기존 콩 이미지·연한 초록 보상 영역, 링크 복사 아이콘/44px 버튼, 분리된 세 가지 참여 지표, 안내 간격을 적용. holdDays는 응답값을 표시한다. 공통 SnackbarProvider/Toast를 재사용하여 복사 완료를4초 표시하며 오류는 링크 옆에 유지. 카탈로그에 참여 있음/없음 예시 추가.
- 검증: npm run check 통과(레이어·TypeScript·단위430/430). 별도 loopback 개발 서버에서 Playwright PC Chromium/iPhone13 WebKit 2/2 PASS. 클립보드 성공/거부 대역, 재복사·자동/수동 닫기, 링크 내용·가로 넘침 및 본문 높이 불변 확인. 화면 캡처 육안 점검. 물리 iPhone·OS 클립보드 및 실운영/실공급사 검증 아님.
- 최초 실패/보완: 관리자 기존 테스트가 모바일 메뉴를 열지 않았고 Next route-announcer까지 alert로 선택해 실패. 검증 selector를 보정 후 재통과. 캡처 전 스낵바 opacity=1 대기 추가, 모바일 표 이메일 줄바꿈 보완 후 최종 재검증. 제품의 결제/보상/계정 정책 변경 없음.
- 증거: `.local/referral-polish-20261101/verification.json`에 HEAD·미커밋 상태·변경 파일 SHA256·명령/시각/종료코드·캡처 위치. before/원본, ui-first 및 results-first 실패 증거, check-final/ui-final 최종 로그 보존. AGENTS의 공통 스낵바 규약 유지. 기존 타 작업 변경을 보존했고 커밋/푸시/운영 배포 없음.
- 다음: 운영 반영 요청 시 최신 운영 소스·이미지 기준을 확인해 해당 변경만 배포. 미결정 정책 없음. 프론트 docs:record/check:docs는 기존 server/docs/referral-design-20261101.md 미분류, 레퍼럴4개·프로필 사진1개 API 설명 누락 및 생성 계약 만료로 실패했다. UI 수정 범위 밖의 기존 계약 문서를 임의 갱신하지 않았으며 문서 현행화 작업이 남았다. 상세는 같은 증거 폴더 docs-checks.json.


## 2026-10-31 20:49 KST 자기 팔로우·로그인 필요 공통 모달 복구 및 운영 배포
- 요구/합격 조건: 자기 팔로우 오류가 페이지 맨 위 텍스트·다시 불러오기 버튼으로 출력되는 문제를 없애고 기존 공통 Dialog 디자인으로 표시한다. 비로그인 팔로우·좋아요·저장은 로그인/나중에 안내, 만료 세션도 로그인 이동과 원래 화면 복귀를 지원한다. 기존 정상 팔로우·해제와 페이지 위치를 유지한다.
- 원인/변경: useServiceModel.toggle이 거절 응답을 조회 오류용 전역 error에 넣고 ServiceRouter가 이를 임시 div로 출력했다. 동작 안내 actionNotice를 구분하고 같은 Dialog/DialogActions/Action을 재사용했다. 조회 오류도 닫기/다시 불러오기 모달로 표시한다. 비로그인 토글은 쓰기 요청을 보내지 않고, 지난 화면의 늦은 응답을 무시한다. 경로가 바뀐 첫 렌더는 loadedPath로 초기 조회 완료 전까지 표시를 보류하여 이전 signedIn 상태로 로그인 화면에서 튕기던 현상을 수정했다. 서버 거절·권한 규칙 및 공통 모달 CSS는 변경하지 않았다.
- 로컬 검증: npm run check(레이어·TypeScript·단위430/430) PASS. 격리 DB·실제 API E2E Desktop Chromium/iPhone13 WebKit 6/6 PASS: 실제 SELF_FOLLOW400, 페이지 위치 유지, 제목 포커스, 확인/ESC 닫기, 정상 팔로우·해제, 비로그인3동작 쓰기0회, 로그인 후 요청 화면 복귀, 실제 세션 만료401 안내. 브라우저 오류0, 물리 iPhone은 미검증. 캡처는 모달 애니메이션 종료 후 육안 확인했다.
- 최초 실패/조치: 새 단위검사의 document 복원 순서 오류는 unmount 후 복원으로 수정했다. E2E에서 만료 세션의 이전 로그인 상태로 돌아가던 제품 문제는 loadedPath로 수정했다. 로그인 폼을 닫히는 native dialog의 inert 해제 전 채우던 자동화는 dialog[open] 제거를 기다리도록 보정했다. 모달 등장 중 찍힌 첫 캡처를 보존하고 애니메이션 종료 후 재촬영했다. 최종 E2E 재검사도6/6 통과했다.
- 배포: crefans-front:action-dialog-20261031, 2026-10-31 20:49:36 KST. profile-round 운영 스냅샷704파일 중 런타임2파일만 변경, amd64 이미지 빌드·내부 SHA·전송 체크섬 대조 후 frontend만 교체했다. 배포 직전6컨테이너 ID 재대조, API/worker/admin/DB/proxy 유지·마이그레이션 없음·재시작0/OOM없음·health/화면200. 이전 배포 복구 설정과 이미지를 보존했다.
- 운영 검증: PC·iPhone13 WebKit 에뮬레이션2/2 PASS. 공식 프로필의 비로그인 팔로우→로그인 모달(쓰기0회), 승인된 합성 계정 로그인→원래 프로필 복귀, 해당 계정 공개 회원 프로필의 실제 SELF_FOLLOW400→공통 모달·확인/ESC·위치 유지 확인. 운영 데이터의 성공한 팔로우 변경/콘텐츠/금융 쓰기0회. 테스트 계정은 크리에이터 전환 전이므로 첫 ownCreatorIds 기대를 일반 회원 프로필로 수정했다. WebKit에서 로그인 직후 강제 탐색으로 진행 중 요청을 중단한 최초 기록도 보존했고, 화면 로딩 완료 후 같은 검증을 다시 실행하여 페이지 오류0을 확인했다. 실제 크리에이터 자기 팔로우는 로컬 격리 DB로 검증한 범위다.
- 증거: .local/action-dialog-20261031/의 before·check-final-run/log·첫 실패 및 최종 E2E JSON/log/캡처·verification.json; .local/action-dialog-deploy-20261031/의 source-delta/manifest·builds·source-freeze·deployment-command·runtime-after·production-browser(최초 실패 포함)·운영 PC/모바일 캡처·retention JSON. HEAD553540e 위 미커밋 변경이며 기존 다른 작업을 보존했고 커밋/푸시하지 않았다. AGENTS·docs/preview-pages의 오류 모달/경로 상태 설명을 갱신했다. 문서 snapshot은 제품 통과 증거로 취급하지 않는다.

## 2026-10-31 19:27 KST 프로필 지갑·설정 버튼 3번 라운드 아이콘 적용·운영 배포
- 사용자 결정: 앞서 제안한 5종 중 3번을 선택했다. 이전 로그의 미선택/미적용 상태는 이 배포로 해소됐다. 합격 조건은 흰색 지갑 pill에 콩 아이콘+사용 가능 잔액만 표시, 오른쪽 설정은 원형 아이콘만 표시, PC·모바일 모두44px 클릭 영역과 기존 이동·잔액 조회 유지다.
- 변경: AccountPages의 설정 링크를 접근성 이름 ‘설정’인 원형 버튼으로 표시, BeanPages의 지갑 링크에 기존 콩 이미지20px와 잔액을 표시한다. 조회 전에는 ‘내 지갑’으로 안내하고 사용 가능 잔액의 기존 계산/마운트당1회 조회를 유지했다. creator.module.css에44px 높이/원형44×44px,18px 설정 아이콘, 흰 배경·얕은 그림자·키보드 focus를 적용했다. 목업과 실서비스가 같은 표시 컴포넌트를 쓴다. 결제/후원/권한/서버 변경 없음.
- 로컬 검증: npm run check(레이어·TypeScript·단위429/429) PASS. 첫 검사1건은 ‘설정’이 눈에 보이는 텍스트라는 기존 선택자를 접근성 이름 기준으로 바꾼 후 통과, 실패 로그 보존. 브라우저 PC Chromium1280px·iPhone13 WebKit390px·좁은320px 3/3 PASS: 이미지 로딩, 잔액 표시, 흰 배경/테두리0, 버튼44px, 아이콘18px, 넘침 없음, 지갑·설정 페이지 이동. 수집된 페이지 오류0, 물리 iPhone은 미검증.
- 운영 배포: crefans-front:profile-round-20261031, 2026-10-31 19:27:39 KST 완료. 직전 studio-polish 운영 스냅샷에 위 런타임3파일만 반영,704파일 immutable manifest·amd64 이미지 내부 SHA 대조 후 배포. frontend만 교체, API/worker/admin/DB/proxy 컨테이너 유지, 마이그레이션 없음, health/관련 화면200·재시작0·OOM없음. 현재와 직전2개 프론트 이미지를 보존하고 오래된 handle-sync 프론트 태그만 로컬·운영에서 정리했다.
- 운영 확인: PC·모바일 각각 /preview/me 및 승인된 합성 팬 계정의 /service/me 총4조합 PASS. 실제 잔액0콩/목업2,600콩, 버튼 치수·이미지·페이지 이동 확인, 폰트 loaded·가로 넘침/수집 페이지 오류0. 운영 프로필 저장·결제0회. 운영 캡처를 육안 확인했다.
- 증거: .local/profile-round-20261031/의 before·check-final-run/check-final.log·local-browser/production-browser JSON·PC/모바일 캡처·verification.json, .local/profile-round-deploy-20261031/의 소스 manifest/delta·빌드/전송/배포·runtime-after·retention JSON. HEAD553540e 위 미커밋 변경이며 기존 다른 작업 보존, 이 작업 커밋/푸시 없음. docs/preview-pages.md의 프로필 설명을 갱신하고 docs:record/check:docs 결과를 증거에 남긴다. 기존 AGENTS 규약을 계속 적용하며 새 정책·미결정 사항은 없다.

## 2026-10-31 스튜디오 예약 UI·아바타·이미지 로고·핸들 확인 배치 운영 배포
- 요청/합격 조건: 예약 사용 스위치로 게시 시각을 활성/비활성화하고 값 지우기·재입력을 지원한다. 저장된 예약은 명시적 임시저장 성공 시에만 취소한다. 대시보드 인사 왼쪽 아바타, 콘솔 톤의 symbol+studio 이미지 로고, 핸들 인풋 바깥 오른쪽의 중복 확인 버튼을 PC·모바일에 적용한다. 프로필 지갑/설정 버튼은 5종 실제 화면 시안을 먼저 제안한다.
- 구현: ManagementPages의 scheduleEnabled와 공통 Toggle/Field.clearable을 사용, 끄면 편집 값 초기화·비활성화하고 예약 제출을 차단한다. 기존 예약 취소는 status=draft/scheduledAt=null 저장 성공 후 확정하며 날짜는 기기 시간대에서 기존 ISO 변환을 사용한다. OverviewPages 인사는 Avatar44px+MarqueeText로 묶었다. 공통 Field.action은 테두리 있는 입력과 같은 행의 외부 버튼이며 AccountPages와 카탈로그에 적용했다. API/DB/권한 정책 변경 없음.
- 로고: 운영 콘솔 console-logo.png를 참조해 built-in image_gen으로 studio 워드마크를 생성했다. 원본 alpha 이미지는 투명 여백 trim/840×170 리사이즈 후 public/brand/studio-logo-v1.png로 저장, 정확한 프롬프트·참조·원본·후처리는 studio-logo-v1.generation.json에 기록했다. StudioShell의 브랜드 링크는 스튜디오 대시보드로 연결된다.
- 검증: npm run check 레이어·TypeScript·단위429/429 PASS. 격리 DB E2E PC Chromium/iPhone13 WebKit 4/4 PASS: 로고·아바타·외부 버튼 배치·실제 중복 조회, 예약 값 지우기·off/on 초기화·예약 저장·다시 열어 명시적 임시저장 취소·재조회 확인. 실제 iPhone은 미검증. 첫 단위2건은 기존 첫 switch 선택자를 댓글 허용 기준으로 수정하고 CSS mock에 의존한 구조 검사를 실제 노드 형제로 보정했다. 첫 E2E2건은 이미지 없는 테스트 크리에이터의 정상 fallback 아바타를 기대하도록 수정했다. 실패 기록도 보존한다.
- 배포: crefans-front:studio-polish-20261031, 2026-10-31 19:13:06 KST 완료. 직전 handle-check 운영 스냅샷에 런타임13파일만 반영, immutable manifest704파일·이미지 내부 SHA 일치 및 amd64 빌드 PASS. 배포 직전 운영 기준선 재대조, frontend만 교체하고 API/worker/admin/DB/proxy ID 유지, 마이그레이션 없음. health·관련 페이지·로고200, 재시작0/OOM없음. 직전 복구 설정/이미지 보존. 로컬·운영 이미지 keep3 정리로 오래된 front:new-creators 태그1개씩 제거, 오류0.
- 운영 확인: PC·모바일 모두 PASS. 운영 호스트의 공통 preview 스튜디오에서 로고·아바타·예약 편집 UI를 확인하고, 승인된 합성 팬 계정의 실제 설정에서 외부 중복 확인 버튼과 중복 거부를 검증했다. 운영 콘텐츠/프로필 저장0회이며 실제 예약 저장·취소는 격리 DB 검증 범위다. 수집 브라우저 오류0. 최초 모바일 캡처는 웹폰트 대기로 timeout, 재검사에서 전체 폰트 대기만 비활성화하고 별도로 font status loaded/Pretendard ready를 확인했다. 운영 예약 worker 실행 검증으로 확대하지 않는다.
- 프로필 버튼 시안: output/design/studio-polish-20261031/comparison.html 및 comparison.png, profile-controls-1~5.png. 실제 프로필 화면을 바탕으로 화이트 아웃라인/차콜 글라스/라운드 아이콘/소프트 스퀘어/라일락 포인트를 비교하며 최소44px 조작영역을 유지한다. 사용자 선택 질문을 보냈고 아직 미선택이므로 이 디자인은 미적용·미배포다.
- 증거: .local/studio-polish-20261031/의 before·check-final2.log·e2e-final.log·results·verification.json, .local/studio-polish-deploy-20261031/의 source-delta/manifests·builds·source-freeze·deployment-command·runtime-after·production-browser·운영 캡처·retention JSON. front HEAD553540e 위 미커밋 변경이며 기존 다른 세션 변경을 보존했다. 커밋/푸시는 하지 않았다. AGENTS에 예약 취소 확정 시점을 기록했고 디자인/화면 문서를 갱신했다. docs:record/check:docs 결과는 verification.json에 기록하며 문서 스냅샷을 제품 테스트 증거로 간주하지 않는다.

## 2026-10-31 18:55 KST 프로필 핸들 중복 확인·설정 하단 스튜디오 링크 운영 배포
- 요청/합격 조건: 프로필 수정에서 핸들 사용 가능 여부를 확인하고, 변경한 핸들은 최신 확인 성공 후에만 저장한다. 중복·잘못된 형식·요청 실패·늦은 응답·저장 직전 선점은 거부한다. 설정 하단에서 PC·모바일 모두 스튜디오로 이동한다. 앞선 사용자명/활동명/소개 우선순위 툴팁도 함께 배포한다.
- 구현: 인증된 GET /api/v1/me/handle-availability?handle=..., private/no-store, 본인 제외 회원 핸들과 크리에이터 주소를 함께 조회하며 타인 정보는 반환하지 않는다. 저장 시 재확인 및 DB 고유 제약을 유지하고 실제 Prisma P2002 충돌을 HANDLE_TAKEN으로 변환한다. 스키마/마이그레이션 변경 없음. 프론트는 공통 Field에 중복 확인 버튼·상태 문구, 입력/재진입 시 확인 무효화·늦은 응답 무시, 실패 재시도, 변경 없는 기존 핸들 호환을 적용했다. 하단 링크는 현재 basePath의 /studio를 사용한다.
- 호환 보완: 현행 핸들 형식(소문자·숫자·밑줄3~24자)과 다른 기존 핸들은 그대로 두고 이름·소개를 수정할 수 있다. 바꾸는 경우에만 새 형식과 중복 확인을 요구한다. 목업은 fixture 중복만 확인하며 실서비스 API 성공으로 간주하지 않는다.
- 근거 조사(2026-10-31): Prisma6 공식 API https://www.prisma.io/docs/orm/v6/reference/prisma-client-reference 및 예외 처리 https://docs.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors . 조회 결과는 예약이 아니므로 최종 저장의 unique/P2002 처리를 유지한다는 기술적 판단이다.
- 로컬 검증: server npm run build PASS, handle-unify5건+OpenAPI11건 총16/16 PASS. front npm run check(레이어·TS·단위426/426) PASS. 격리 DB E2E PC Chromium/iPhone13 WebKit 총4/4 PASS(툴팁2·중복확인/실제 저장/공개 주소/스튜디오 이동2). 저장 전 다른 계정 선점409, 인증 없음401, 유효하지 않은 핸들400, 본인 핸들 허용, 응답 불일치/지연/오류·입력 변경 무효화 포함. 실제 iPhone은 검사하지 않았다.
- 최초 실패/조치: 새 링크와 API 때문에 예전 링크 목록/177→178·73→74 OpenAPI 기대값 갱신. E2E가 기존 형식 핸들의 저장 비활성화를 발견해 제품 호환 수정 및 단위 회귀 추가. 로그인 effect 이동 대기, 운영 goto/waitForURL의 전체 load 대기를 DOM 및 실제 UI 표시 대기로 바꿔 재실행했다. 실패 로그도 보존했다.
- 배포: handle-check-20261031, 2026-10-31 18:52:36 KST 완료. 직전 실제 운영 handle-sync-20261031 소스에서 front10·server3파일만 반영, immutable source manifest·이미지 내부 파일 SHA-256·amd64 확인 후 배포 직전 6컨테이너 ID/image 기준선 대조. API/worker/frontend 교체, admin/DB/proxy 동일 ID 유지, 재시작0·OOM없음, health/페이지200·비로그인 중복조회401. env 변경은 API_IMAGE/FRONTEND_IMAGE/APP_RELEASE만, 자동 복구 스크립트·직전 이미지 보존.
- 운영 검증: 승인된 합성 팬 테스트 계정으로 crefans.com PC Chromium·iPhone13 WebKit 각각 기능 시나리오 PASS. 중복 핸들 거부·사용 가능 표시·재입력 시 저장 비활성·기존값 불변·툴팁·스튜디오 이동 확인. 운영 프로필 저장0회, 로컬에서만 실제 변경 검증. WebKit에서 요청 범위 밖 explore/messages의 Next RSC 사전 로딩 access-control 오류2건 관찰, 기능 검증과 분리해 그대로 기록했으며 원인은 미확정이다. 전체 사이트 오류0 주장 아님.
- 증거: 프론트 .local/handle-check-20261031/ (before, 최종 테스트 로그, results 캡처, verification.json), .local/handle-check-deploy-20261031/ (source-delta/manifests, builds, source-freeze, images, deployment-command, runtime-after, production-browser 및 PC·모바일 캡처, retention JSON). 프론트553540e·서버ba8df97 위 미커밋 변경이며 다른 세션 파일 보존, 이 작업의 커밋/푸시 없음. 문서 계약과 의미 설명을 갱신한 뒤 docs:record/check:docs 결과를 verification.json에 기록한다. 기록 갱신은 제품 테스트를 대체하지 않는다.

## 2026-10-31 18:36 KST 프로필 사용자명·크리에이터 활동명·핸들 구분과 소개 우선순위 툴팁 (미배포)
- 요청/합격 조건: 일반 회원과 크리에이터 이름·소개 입력란에 공개 프로필 표시 우선순위를 안내하고 고유 @주소는 핸들로 통일한다. 기존 값 저장·표시 우선순위는 유지하며 PC·모바일에서 공통 툴팁을 사용할 수 있어야 한다.
- 근거: server `src/platform/service.ts` publicProfile은 Creator.display_name/bio/about 우선, 없으면 Member.nickname/UserProfile.bio로 대체한다. 일반 프로필 수정은 원래 회원 값, 스튜디오는 Creator 값을 편집한다. 서버 로직·DB 변경 없음.
- 변경: `AccountPages` 프로필 수정에 사용자명(전환 전 표시)·소개(크리에이터 우선) 툴팁, `OverviewPages` 전환·설정에 크리에이터 활동명/소개/소개 글 툴팁과 읽기 전용 핸들. 구독자 검색 placeholder도 사용자명/핸들로 구분. 공통 Field/TextAreaField의 선택 tooltip 속성으로 기존 InfoTooltip을 재사용하며 버튼은 label 밖에 둔다. 카탈로그·디자인 문서·화면 설명 및 기존 테스트의 이름 선택자만 갱신했다. 가입 화면의 닉네임은 이번 프로필 수정 범위 밖이다.
- 검증: npm run check(레이어·TS·단위423/423) PASS. 기존 handle-studio E2E 2/2(격리 DB·PC: 스튜디오 진입, 잘못된 핸들 거부→정상 저장→공개/스튜디오 동기화) PASS. 목업 UI PC Chromium·iPhone13 WebKit 2/2 PASS: 프로필 수정/전환/설정 툴팁 6개씩, Escape가 부모 모달을 닫지 않음, 입력 접근 이름, 읽기 전용 핸들, 가로 넘침 없음·페이지 오류0. PC·모바일 캡처 4장 육안 확인. 실제 iPhone·운영은 미검증.
- 최초 실패: 단위 테스트의 기존 닉네임 선택자1건을 사용자명으로 수정 후 전체 PASS. E2E 임시 백업 폴더 수집 오류를 제외 설정으로 수정, 이후 필수표시 별표가 포함된 getByLabel exact 선택자2건을 textbox 접근 이름으로 고쳐 UI만 재실행 PASS. 제품 코드로 실패를 숨기지 않았다.
- 문서: check:docs에서 직전 핸들 통합 migration의 계약 목록 누락을 발견, 실제 migration과 차이가 이 한 줄뿐임을 확인해 docs:contracts 갱신. 상세 문서 검사 결과는 증거 JSON/로그에 기록한다.
- 증거: `.local/profile-field-guidance-20261031/` before·check-final.log·e2e-final.log(기존2건 PASS)·e2e-ui-final.log(UI2건 PASS)·results 캡처·verification.json. 기존 미커밋 변경 보존, 이번 작업 커밋·푸시·운영 배포 없음.

## 2026-10-31 18:25 KST 사용자 이름 단일화·스튜디오 깜빡임·대시보드 문구 — handle-sync-20261031 운영 배포, 프로필 사진 수정 시안
- 요청: ①공식 계정(khpark@gmail.com) 전환 후 핸들이 예전 회원 핸들로 고정되고 프로필 주소는 따로 받음 → 하나로, 프로필 수정에서 변경, 전환 시 별도 설정 없음 ②'로그인이 필요해요' 깜빡임 ③대시보드 '반가워요' 아래 설명 삭제 ④프로필 페이지에서 배경·프로필 사진 수정(시안 먼저).
- 원인: members.preferred_username(가입 시 임의, 수정 불가)과 creators.handle(전환·스튜디오에서 입력)이 별도. 깜빡임은 StudioRouter가 회원 정보 로딩 전에 signedIn(빈 기본값 false)을 먼저 검사.
- 변경: server ba8df97(PUT /me/profile handle, 크리에이터 주소 동기화, HANDLE_TAKEN/INVALID_HANDLE, 스튜디오 저장은 사용자 이름 사용, 마이그레이션 20261031180000_unify_handles: 직접 정한 크리에이터 주소를 사용자 이름으로(중복 제외) 후 모든 크리에이터 주소 일치), front 553540e(설정 > 프로필 수정의 사용자 이름 편집, 전환·스튜디오 '프로필 주소' 읽기 전용, StudioRouter 로딩 우선, 대시보드 설명 삭제, e2e/handle-studio, qa-journey 갱신).
- 검증: server platform-handle-unify 3/3(주소 동기화 제거 대조 FAIL), openapi 11/11, legal 11/11, 스테이징 스냅숏 tsc 0. front tsc 0, unit 423/423, e2e handle-studio 2/2(로딩 순서 되돌리면 깜빡임 검사 FAIL), 관련 E2E 38 통과.
- 배포(`crefans_front/.local/handle-sync-deploy-20261031/`): 폴더 생성 전 운영 확인 결과 다른 세션 배포로 API/front=new-creators-20261031, admin=financial-tooltip-20261031 → 이를 기준으로 사용. new-creators가 service.ts·openapi-contract.ts를 바꿨으므로 운영본에 제 수정분만 patch(충돌 없음), 나머지 front 5파일은 운영본=수정 전 커밋 대조 후 교체. ship 직전 운영 태그=기준 확인(BASELINE OK). 마이그레이션 적용(deploy.sh가 직전 DB 백업). 18:22 KST 완료. 운영 확인: 크리에이터 목록 '관악구 실시간 @crefans' 주소로 프로필 조회 성공, newCreators 필드 유지, health·스튜디오·콘솔 200. 이미지 정리 keep 3+new-creators·financial-tooltip 보호.
- 미검증: 공식 계정으로 로그인한 상태의 설정 화면·스튜디오(운영 계정 필요).
- 시안(미구현·미배포): `crefans_front/.local/profile-photo-mock-20261031/` 4장. 내 프로필 배경 오른쪽 아래 '배경 사진 변경', 프로필 사진 카메라 배지, '프로필 사진 변경' 창(PC 가운데·모바일 하단 시트, 프로필 원형·배경 3:1 미리보기, 사진 선택·삭제, JPG·PNG·WEBP 5MB(서버 이미지 제한과 동일), 저장 시 크리에이터 프로필에도 같은 사진). 현재 서버·스튜디오 모두 프로필·배경 업로드 API 없음 → 구현 시 서버 저장 API·스튜디오 반영 필요.

## 2026-10-31 17:39 KST 검색 신규 크리에이터 섹션·새싹 아이콘 운영 배포
- 요청/기준: 팬 검색의 목업·실서비스에 신규 크리에이터 섹션과 이미지젠 새싹을 추가한다. 기존 주목할 섹션 아래/전체 목록 위, 같은 CreatorCard·프로필 링크·팔로우를 재사용한다. 기준은 크리에이터 등록일 최신6명(기간 제한 없음); 검색어·분야·공개 조건을 적용한다.
- 구현: `ExplorePage` 공통 표시, `useDirectoryModel.newCreators`에 첫 검색 응답 저장 및 페이지 추가 때 유지/이전 검색 응답 무시. 목업은 fixtures의 newCreatorIds로 지우·모카·시온 주입, 실서비스에 대체 샘플을 섞지 않는다. 녹색 라운드 그라데이션 새싹을 built-in image_gen으로 제작, 제목 왼쪽22px. 원본 `public/brand/new-creators-sprout-v1.png`(1254px/alpha), 프롬프트·원본 경로는 같은 이름 `.generation.json`에 저장했다.
- 검증: npm run check(레이어·TS·단위423) PASS. 신규 E2E PC/Pixel7 4/4 PASS: 목업/실서비스 API 대역의 아이콘·카드·필터·프로필 링크·더 보기 유지·빈 결과·가로 넘침/페이지 오류 확인. 서버 실제 HTTP·격리 DB 신규3+OpenAPI11 PASS. 최초 UI 테스트 파일의 괄호 누락은 테스트 수집 단계에서 발견·수정했고 실행되지 않은 첫 로그를 보존했다. PC·모바일 캡처 육안 확인, 실제 iPhone은 미실행.
- 운영: `new-creators-20261031` API/worker·프론트 17:39 KST 배포. 진행 중이던 별도 policy-sync2 배포 완료를 확인하고 그 소스 manifest/image label 기준에 본 작업 server2/front7 파일만 적용했다. amd64 빌드·내부 소스·전송 SHA 일치, 콘솔/DB/proxy 컨테이너 유지, 마이그레이션 없음.
- 실제 운영: `/creators.newCreators`가 DB의 활성·검색 공개·회원 활성 조건 최신순 조회와 일치. 해당 조건을 만족하는 운영 크리에이터는 현재0명으로 빈 목록을 표시하며, 운영에 목업을 삽입하지 않았다. 운영 서버의 목업 PC/모바일에서는 신규3명·새싹 정상 표시, 가로 넘침/페이지 오류0. 실서비스의 비어 있지 않은 목록은 로컬 API/브라우저 대역으로 검증한 범위를 구분한다.
- 증거: `.local/new-creators-20261031/`의 baseline/check/tests·E2E results·screenshots·verification, 배포 `.local/new-creators-deploy-20261031/`의 source-delta/builds/deployment-command/after/browser-after 및 캡처. 기존 변경 보존, 본 작업 커밋·푸시 없음.

## 2026-10-31 17:37 KST /pilot-work 확정 정책 동기화 + 운영 배포 policy-sync2-20261031·가이드 (사용자 결정)
- 결정(/pilot-work 질문): ①실결제 문구는 약관 '시행 예정본+공지' 방식, ②시행일은 토스 승인 후 확정, ③원천징수 회사 부담·출금 화요일 마감은 안내·가이드에 지금 반영하고 약관 제6조는 실결제 개정본에, ④beta.crefans.com 링크는 crefans.com으로 지금 교체. 추가 지시: 초대제 안내 '베타기간(~26년 11월)'→'현재 기간(~26년 11월)'.
- 변경·커밋(푸시 없음): server 20563e4(마케팅 메일 기본 주소·설정 예시 crefans.com, 초대 안내 문구, live-payment-launch 원천징수 조사·결정·약관 제6조 개정 초안), front c0b8c6c(payoutTaxNote: 스튜디오 정산 안내·FAQ·서비스 가이드, 명함 소개 링크 crefans.com, 테스트 기대 문구), guide 9259cf6(수익과 출금·출금 설정·서비스 소개·소개서 PDF·가입 안내·문제 해결, beta 링크 22파일→crefans.com, 링크 검사기, 원본 잠금).
- 약관(`legal-documents.ts`)은 미변경: 개정 초안은 server docs/live-payment-launch-20261031.md 4절 표(4조·6조 세금·일정·실결제). 시행일·공지는 토스 승인 후.
- 검증: server build, platform-beta-policy 11/11·platform-legal 11/11(처음 실행은 다른 세션의 테스트 DB 점유로 실패→재실행 통과), front tsc 0·check 422/422, guide check:guides 통과(서비스 링크 44)·빌드 28쪽·소개서 PDF 13쪽 넘침 검사 통과·10쪽 육안 확인.
- **사고와 교정**: 첫 배포 policy-sync-20261031(17:2x KST)이 payout-cutoff/beta-closed 기준 소스로 빌드됨. 그사이 다른 세션이 category-management-20261031(분야 관리, 마이그레이션 없음)을 배포해 두었고, capture_before가 배포 직전 상태를 새 기준으로 기록해 guard가 막지 못함 → 분야 관리 변경이 약 10분간 운영에서 빠짐. 즉시 category-management 소스를 기준으로 제 6파일만 얹은 policy-sync2-20261031을 17:33 KST에 재배포(운영본=수정 전 커밋 대조, 분야 관리 콘솔 API 4개 경로 존재 확인(비로그인 400, 404 아님)). DB 변경 없음. 재발 방지: 배포 폴더 생성 직전과 ship 직전에 release-before의 이미지 태그가 기준 릴리스와 같은지 확인할 것.
- 운영 확인(policy-sync2): API health 200, crefans.com 탐색 200, 콘솔 로그인 200, FAQ 원천징수·화요일 마감 문구, 명함→crefans.com/service/landing 이동, API·worker MARKETING_PUBLIC_ORIGIN=https://crefans.com(deploy.sh 검사). 이미지 정리 keep 3+category-management 보호. 가이드(`crefans_guide/.local/deploy-policy-sync-20261031/`): 운영 44파일 해시 일치, 컨테이너·Caddy 불변, 가입 안내에 전체 동의·로그인하러 가기.
- 남은 것: 프론트 docs:record는 다른 세션의 분야 아이콘 API 설명 누락으로 실패(그 세션 몫), guide check:guides는 다른 세션의 미배포 '새 크리에이터' 변경(CreatorPages·service.ts)으로 잠금 불일치(그 세션 몫). 원천징수 gross-up·지급명세서 운영·주민번호 수집은 세무사 확인 후.

## 2026-10-31 17:23 KST 운영 활동 분야 순서·아이콘 연결 및 3개 앱 배포
- 요청/합격 기준: 콘솔에서 활동 분야를 목업 순서 또는 임의 순서로 저장하고 아이콘을 업로드·교체한다. 실제 홈·탐색·프로필의 같은 CategoryChip에 반영하며 목업 기본 이미지를 유지한다.
- `ServiceData.categoryIcons`를 선택 속성으로 추가하고 `CategoryChip`·`ProfileHeader`·`CreatorPages`·`SocialPages`에 전달했다. 업로드 API 이미지는 unoptimized로 표시, 응답이 없는 목업은 기존 round-flat 이미지를 사용한다. 정렬은 서버가 저장한 순서대로 전달하며 스튜디오의 활동 분야 선택에도 적용된다. 기존 등록 분야 자체를 이번 배포에서 추가/재정렬하지 않았다.
- 검증: `npm run check` TypeScript·레이어·단위422 PASS, `e2e/category-icons.spec.ts` PC/Pixel7 2/2 PASS(API 대역으로 홈·탐색·프로필 사용자 아이콘과 목업 기본값 확인). 콘솔 PC/모바일8·서버 실제 HTTP/격리 DB29 PASS. S3 업로드·읽기·삭제는 대역이며 운영 버킷 신규 업로드와 실제 iPhone 검증은 미실행. 캡처·최초 실패/조치·최종 결과는 각 저장소 `.local/category-management-20261031/`에 보존했다.
- 배포: `category-management-20261031` API/worker·콘솔·프론트 17:23 KST 완료. 직전 검증된 API payout-cutoff, 콘솔 modal-layer, 프론트 beta-closed 소스에서 본 작업 server9/admin14/front5 파일만 적용. 플랫폼amd64·이미지 내부 소스/런타임 파일·전송 SHA 일치. 서비스 탐색/목업/콘솔/health200, bootstrap.categoryIcons 계약 및 6개 기존 기본 아이콘200, 새 관리자 API 비로그인401. DB/proxy 컨테이너 보존, 전체 running/restart0/OOM없음. 스키마 변경 없음. 직전 이미지·설정 롤백 보존.
- 증거: `.local/category-management-20261031/verification.json`; `.local/category-management-deploy-20261031/{source-delta,source-freeze,builds,deployment-command,after,verification}.json` 및 로그. 기준 HEAD 3f5e3e5, 기존 타 작업 변경 보존, 본 작업 커밋·푸시 없음. 문서 검사는 snapshot-only이며 기능 테스트 결과와 구분한다.

## 2026-10-31 16:53 KST beta-closed-20261031 운영 배포 (사용자 지시 '배포')
- 커밋 3f5e3e5(베타 종료 안내 모달 6파일, 다른 세션 변경 없음 확인). 푸시 없음.
- 배포(`.local/beta-closed-deploy-20261031/`): 기준 프론트 payout-cutoff-20261031에 5파일 덮어씀(각 운영본=HEAD 확인), 699파일 이미지 내부 해시 대조, 프론트만 교체(API·worker·콘솔·DB·proxy 유지). 배포 조건 E2E qa/results.json PC 2·Pixel 7 2 통과.
- 운영 확인(PC·Pixel 7): beta.crefans.com/service/feed 모달 표시, 체험하기→beta.crefans.com/preview/explore(모달 없음), 본 서비스로 이동하기→https://crefans.com/service/explore(모달 없음), 페이지 오류 0, beta.crefans.com/api/v1/health 200. 캡처 qa/prod-pc.png·prod-mobile.png. 이미지 정리 keep 3+직전 보호.
- 위 '베타 호스트 종료 안내 모달 (미커밋·미배포)' 항목은 이 배포로 완료.

## 2026-10-31 16:47 KST 베타 호스트 종료 안내 모달 (사용자 지시, 미커밋·미배포)
- 요구: beta.crefans.com 접속 시 "비공개 베타 서비스가 종료되었습니다" 모달, 버튼 '본 서비스로 이동하기'·'체험하기'(목업 탐색 /preview/explore).
- 구현: 표시 `components/crefans/BetaClosedDialog.tsx`(공용 Dialog·Action, designVariables 자체 적용 — 서비스 셸 밖에 마운트되어 색상 변수가 없던 결함을 캡처로 발견·수정), 컨테이너 `components/service/BetaClosedNotice.tsx`(location.hostname==='beta.crefans.com'일 때만 열림, 본 서비스=https://crefans.com+현재 경로·쿼리, 체험하기=/preview/explore, 닫기(X)도 본 서비스 이동), `app/service/layout.tsx`에 마운트(/service만, /preview 제외라 체험 화면에서 다시 뜨지 않음), `lib/content/business.ts` mainServiceOrigin·closedBetaHost, 디자인 카탈로그 '베타 종료 안내 보기'.
- 검증: tsc 0, unit 422/422, `e2e/beta-closed.spec.ts` Chromium(PC) 2/2·Pixel 7 2/2(Chromium host-resolver로 beta.crefans.com→로컬, crefans.com 응답은 route 대역), preview.spec 21/21. 대조: 호스트 조건 제거 시 2건 FAIL→복원 PASS. 캡처 `.local/beta-closed-pc.png`·`-mobile.png`. WebKit은 호스트 매핑 불가로 미실행. 모바일에서는 긴 제목이 공용 Dialog의 흐르는 제목(marquee)으로 표시됨.
- 주의: API·관리자 연결도 beta.crefans.com을 쓰므로 이 변경은 /service 화면에만 적용(API 경로 영향 없음). 베타 호스트의 로그인 세션은 crefans.com으로 넘어가지 않아 다시 로그인 필요.

## 2026-10-31 16:40 KST payout-cutoff-20261031 운영 배포 (사용자 지시 '커밋과 배포')
- 커밋: server 569ea97(출금 화요일 23:59 KST 마감), front 4769848(출금 안내 문구), admin 6e34949(수동 지급 패널 안내). 다른 세션 미커밋 변경 제외(서버는 수정 전 사본 대비 패치·API 문서는 해당 문단만), 서버 스테이징 스냅숏 tsc 0. 푸시 없음.
- 배포(`crefans_front/.local/payout-cutoff-deploy-20261031/`): 기준 API payout-switch, 프론트 signup-page, 콘솔 mobile-table-sticky(다른 세션 배포본) 소스에 server 4·front 3·admin 1 파일만 덮어씀(나머지 manifest 일치, 각 파일의 운영본=수정 전 커밋본 확인). 마이그레이션 없음. deploy.sh 자체 검사 통과(신규 콘솔 API 비로그인 401/403, 결제 스위치 꺼짐, DB·proxy 유지). 배포 후 .env/runtime 세 이미지·APP_RELEASE=payout-cutoff-20261031. 운영 확인: 고객센터 FAQ·크리에이터 가이드에 '화요일 23:59' 문구. 이미지 정리 keep 3+직전 3개 보호, signup-success·qa-categories 삭제, 오류 0.
- 미검증: 실제 수요일 처리(다음 수요일 11-04), 로그인한 스튜디오 출금 안내 화면.
- 세무(원천징수) 조사 결과는 server `docs/live-payment-launch-20261031.md` 5절에 출처·확인일과 함께 기록. 결론 미확정(세무사·서면질의 필요).

## 2026-10-31 16:31 KST 출금 신청 마감·공휴일 지급일 확정 및 반영 (사용자 결정)
- 결정(사용자, 16:31 KST): 출금 신청 마감 화요일 23:59(KST), 매주 수요일 지급, 수요일 공휴일이면 다음 영업일(추천안). 참고 사례: 포스타입 매월 1일 마감·10일 지급·휴일이면 이전 영업일(help.postype.com '수익 입금 날짜', 2026-10-31 확인) — 수동 이체 운영이라 다음 영업일 선택.
- server: `beta-policy.ts` payoutCutoff/inPayoutBatch/payoutQueue/PAYOUT_SCHEDULE_MESSAGE, `finance.service.ts`·`beans.service.ts` payout 검사와 작업자 큐, `jobs.service.ts` 큐가 수요일 0시 이전 접수분만 처리. 테스트 `tests/payout-cutoff.test.cjs`(경계 2건), `platform-manual-payouts` +1(수요일 접수분 거부). 검증: cutoff 2/2, manual-payouts 5/5, beans 32/32, provider-lifecycle 17/17. 대조: 마감 조건 제거 시 cutoff 1건·manual 1건 FAIL, 복원 후 PASS. 문서: platform-api.md 출금 마감 절, live-payment-launch 약관 제6조 행.
- front: `lib/crefans/creator-payout-policy.ts` payoutScheduleNote(스튜디오 멤버십·콩 출금 안내), `support.ts` FAQ, `ServiceGuidePage.tsx` 가이드 문장. 같은 문장 속 '베타에서는 실제 송금하지 않습니다'는 실결제 문구 개정 때 별도. 검증 tsc 0, unit 422/422.
- admin: `ManualPayouts.tsx` 안내문에 마감·공휴일. tsc 0.
- 계약서 v2.34 별지 A 확정 문구, PDF sha256 40f63f95ceda80e5ba5021c40b636f7666dfa549812ebedbd5000da1ec55794d, 6쪽 확대 확인.
- 미완: 커밋·배포 안 함. 약관 본문(제6조)은 개정 시행 때. 공휴일 판정은 코드에 없음(운영자 처리).

## 2026-10-31 15:26 KST 가입 전체 동의·완료 전용 페이지·로그인 후 복귀·지갑 세부내역 접힘 (signup-page-20261031 운영 배포)
- 사용자 요청: 가입 체크박스 로직, 가입 완료 모달→전용 페이지, 로그인 후 로그인 화면에 머무는 현상, (작업 중 추가) 지갑 콩 세부내역 기본 접힘. /ask-me 답: 전체 동의 추가, 모달 내용 그대로 페이지화(가입 즉시 로그인 아님), 로그인 후 원래 화면·없으면 홈.
- 원인: 로그인 성공 시 비밀번호만 비우고 이동 없음. 체크박스 자체 동작은 정상(운영 PC·Pixel 7 확인), 전체 동의 없음.
- 변경(커밋 011a24a, 푸시 없음): 전체 동의(보이는 필수·선택 항목 일괄, 하나 해제 시 해제). `/service/signup/complete`·`/preview/signup/complete` 전용 페이지(`SignupCompletePage`, 같은 탭 sessionStorage `crefans-signup-complete`가 있을 때만, 직접 진입은 가입 화면으로, 로그인 이메일 미리 채움, 제목 포커스). 로그인 후 `next`(같은 서비스 경로만, 백슬래시·공백·외부·인증 화면 거부) 또는 피드, 실서비스에서 이미 로그인한 회원은 로그인 화면에서 이동. 로그인 안내·헤더 로그인 링크가 현재 화면을 next로 전달(`useCurrentLoginHref`, 마운트 후 주소에서 읽음). 규약(표시 컴포넌트는 직접 이동 안 함, tests/crefans-account)에 따라 이동·next는 라우터가 주입. 지갑만 콩 세부 내역 기본 접힘(스튜디오 콩 화면은 기존 펼침). 다른 세션의 완료 모달(SignupCompleteDialog, 운영 배포됐던 것)은 페이지로 대체하며 삭제(원본은 ~/.codex/worktrees/crefans-signup-success 브랜치에 남음). Dialog의 illustration 옵션·CSS(다른 세션 미커밋)는 이제 사용처가 없지만 손대지 않음.
- 검증(로컬 14:55~15:23 KST): tsc 0, npm run check 422/422, signup E2E(playwright.signup.config: PC·Pixel 7·iPhone 13 WebKit) 15/15, 실서비스 가입 테스트 4회 반복 12/12(WebKit 이동 중 요청 중단 오류를 테스트 대기로 안정화), 지갑·셸·미리보기 E2E 57 통과/1 skip. 대조 검사: next 무시·전체 동의 선택 항목 누락 시 해당 테스트 FAIL, 지갑 접힘 지정 제거 시 beans 2건 FAIL, 복원 후 PASS. 첫 구현의 제목 포커스 미동작(화면 표시 전 포커스)·테스트 대상 화면 착오를 테스트로 발견해 수정.
- 운영 배포(`.local/signup-page-deploy-20261031/`): 기준 프론트 payout-switch-20261031에 15파일 덮어쓰기·완료 모달 1파일 삭제, 이미지 내부 697파일 해시 대조, 프론트만 교체(API·worker·콘솔·DB·proxy 유지), 15:26 KST 완료. 운영 확인(PC·Pixel 7, 비로그인): 전체 동의 5개 일괄 체크·선택 해제 시 전체 동의 해제, 완료 주소 직접 진입→가입 화면, 내 프로필 로그인 안내 링크 next=/service/me, 미리보기 지갑 세부 내역 접힘, 미리보기 완료 페이지 표시, 페이지 오류 0. 이미지 정리 keep 3+직전 보호.
- 미검증: 운영에서 실제 가입→완료 페이지→로그인→원래 화면 복귀(운영 계정 필요), 로그인한 실서비스 지갑 화면(미리보기와 같은 컴포넌트·같은 지정).
- 참고 질문: /ux-spinner는 ~/.claude/skills에 스킬로 등록돼 있지 않음(2026-10-27 대화에서 규칙과 함께 요청된 기록만 있음).

## 2026-10-31 14:45 KST 커밋 정리·탈퇴 회원 재초대 수정·payout-switch-20261031 운영 배포
- /ask-me 결정(14:05 KST): 이 세션 변경만 기능별 커밋(푸시 없음), 스위치 끈 채 운영 배포, 이메일 실제 SMTP QA는 나중에, QA 보고서 v1.2는 이메일 QA 후 한 번에.
- 사용자 요청(작업 중): 운영콘솔 초대→가입→본인/콘솔 탈퇴 후 같은 이메일 재초대 불가 → 수정. 원인: 본인 탈퇴는 30일 파기 전까지 회원 행이 이메일·본인확인값(둘 다 unique)을 보유해 MEMBER_EXISTS, 콘솔 삭제는 사용 완료 초대가 남아 INVITE_USED. 수정: 탈퇴 회원 이메일 재초대 시 사용 완료 초대 재발급(admin.signup_invite_reissued), 30일 전이면 탈퇴 회원의 이메일·identity_hash만 즉시 해제(member.email_released), 나머지 개인정보는 기존 30일 파기 유지. 약관·처리방침에 재가입 제한 약속 없음 확인.
- 커밋: server 8f686f2(실결제·수동 지급 스위치·대기 사유)·71ae325(재초대), admin 50833e5(수동 지급 패널), front 7d27533(settledShot·QA-F01·이메일 QA 규약)·6fd7109(대기 사유 표시·통신판매업 번호 자리). 다른 세션의 미커밋 변경(분야 관리 categories, 콩 sourceType 필터, 코호트·통합 테스트, 갤러리·공유 스펙, 가입 완료 화면 등)은 hunk 단위로 제외, 스테이징 스냅숏 tsc 0(server·admin·front). 계약서 폴더(docs/contracts, 미추적)와 PROGRESS·manifest(혼합)는 커밋 안 함.
- 결함 수정: OpenAPI 테스트와 콘솔 manual-payouts 스펙에서 주석이 같은 줄 코드(경로 목록 비교, 마지막 스크린샷)를 삼키던 것.
- 검증(로컬 13:55~14:30 KST): signup-invites 8/8(신규 테스트는 수정 전 MEMBER_EXISTS로 FAIL→수정 후 PASS), openapi 11/11, manual-payouts 4/4, hold-reasons 1/1, beans 32/32(CREFANS_E2E=true), provider-lifecycle 17/17, admin-console 14/14, pilot-followups 4/4, server tsc 0, 콘솔 manual-payouts E2E 1/1, admin tsc 0.
- 운영 배포 payout-switch-20261031(14:41 KST 완료, 프론트 `.local/payout-switch-deploy-20261031/`): 기준 API invite-fix, 콘솔 qa-categories, 프론트 signup-success(다른 세션 14:17 배포본)에 이 세션 파일만 얹음(server 12·admin 3·front 4 파일, 나머지 manifest 일치). 마이그레이션 없음. deploy.sh 자체 검사 통과: 신규 콘솔 API 비로그인 401/403, API·worker의 LIVE_PAYMENTS_ENABLED·MANUAL_PAYOUTS_ENABLED 꺼짐, DB·proxy 미재생성. 배포 후 .env/runtime: 세 이미지·APP_RELEASE=payout-switch-20261031. 공개 화면 12개(PC·Pixel 7) 배포 전후 픽셀 비교 11개 동일, 모바일 소개 1개는 같은 배포본 두 번 촬영에서도 같은 영역이 달라 움직이는 요소로 판단. 이미지 정리 keep 3 + 직전 릴리스 보호, 로컬·원격 guide-sync·signup-open 3개 삭제, 오류 0.
- 미검증: 운영에서 실제 탈퇴→재초대→재가입(운영 계정 필요), 로그인 화면의 대기 사유 표시(운영 크리에이터 정산 필요). 스위치는 꺼져 있어 실결제·수동 지급은 동작하지 않음.

## 2026-10-31 가입 완료 로그인 링크 점검만 수행
- 사용자 요청: 가입 완료 CTA가 목업으로 연결되는지 점검만. 제품 코드 수정·운영 배포·신규 가입·로그인 제출 없음.
- 운영 `crefans-front:signup-success-20261031` 컨테이너의 실제 소스 확인: live 모델 `basePath:'/service'` → SignupPage의 `${basePath}/login` → 공용 모달 Link `href={loginHref}`. 실제 가입은 `/service/login`, 목업은 `/preview/login`으로 분기한다. AccountPages SHA-256 `eddb8becd6754684f37db4aa670002b8abfba3e3d680484c8d98a528851c47e4`, SignupCompleteDialog `fee4d92104c2097dbc759c8cc8e3a5e1c3aa70733800baf720871d020b549012`.
- 새 Chromium 세션에서 운영 두 URL을 조회(exit 0): 모두 HTTP 200·원래 URL 유지·로그인 입력창 노출. `/service/login`에는 목업 안내 없음, `/preview/login`에만 안내 있음. 이전 실제 로컬 가입→로그인 3환경 통과 증거도 확인. 이번에는 운영 가입을 재실행하지 않았다.
- 결론: 현재 배포 코드에서 실제 가입 CTA가 목업 로그인으로 연결되는 문제는 발견되지 않음. 근거 `.local/signup-link-check-20261031/result.json`. 후속 수정 없음.


## 2026-10-31 회원가입 완료 모달 개선·운영 배포
- 선택한 4안 v3를 공용 `SignupCompleteDialog`로 구현. 흰 모달, 88px 파란 원형 체크(내부 SVG 50px), 가운데 제목·환영 안내·48px 로그인 CTA. 스파클·하늘색 박스 없음. 실제 `/service/signup`, 목업 `/preview/signup`, 디자인 시스템에서 재사용한다.
- 공통 Dialog의 선택적 illustration만 추가해 기존 일반 모달을 보존. 초기 포커스는 제목, Tab·Escape·닫기 및 키보드 복귀 검증. 가입 성공 후 입력 초기화로 비밀번호 오류가 다시 나타나는 기존 미커밋 보완도 포함.
- 검증: `npm run check` 421/421, 최종 typecheck, 로컬 PC·모바일 Chromium·모바일 WebKit E2E 9/9, 운영 동일 3환경 UI 검사 6/6 통과. 320px 화면 넘침·잘못된 인증 코드·CTA 이동 포함. 첫 검사 실패는 중복 alert 선택, 전환 애니메이션·hover·키보드 시뮬레이션 대기 문제였으며 테스트를 수정한 최종 실행을 기록했다.
- 배포: `signup-success-20261031`, 기존 운영 프론트 스냅샷에 대상 6파일만 적용. 이미지 소스 695개 SHA-256 일치 확인. 프론트만 교체하고 API·worker·admin·DB·proxy 동일 ID 유지. 운영 회원가입·목업·피드·API health·관리자 로그인 HTTP 200. 이전 프론트 롤백 이미지 보존.
- 증거: `docs/audit/signup-complete-deployment-20261031.json`, `.local/signup-success-20261031/`의 로그·결과·PC/Mobile 화면. 구현 커밋 `5b354a5`, 브랜치 `feat/signup-success-dialog`; 원래 작업 트리의 무관한 변경 보존.
- 검증 경계: 실제 iPhone 기기·운영 신규가입·SMTP 재전송은 이번 디자인 작업에서 미실행. `check:docs`는 기존 서버 미분류 문서 4개 때문에 실패했으며 전체 문서 검증 통과로 표시하지 않는다.


## 2026-10-31 가입 완료 모달 4안 스파클 제거 시안
- 사용자 요청대로 4안 v2의 반짝임 아이콘 제거, 기존 파란 원형 체크만 가로 가운데 정렬. 하늘색 배경 박스 없이 흰 모달 유지. 문구·로그인 CTA·닫기·모달 구성 보존.
- 내장 image_gen 편집 결과 `output/imagegen/signup-complete-20261031/04-soft-color-v3.png`; 입력/출력·전체 프롬프트·SHA-256은 `04-soft-color-v3.generation.json`. 앞선 시안 모두 보존.
- 검증: 생성 결과 육안 대조로 스파클 제거·체크 가운데·텍스트 유지 확인, PNG 형식/크기·원본/복사본 해시 일치 검사(exit 0). 제품 코드·배포 미적용, 기존 미커밋 변경 보존. 다음: 사용자 확정 후 공용 Dialog에 구현.

## 2026-10-31 가입 완료 모달 4안 배경 박스 제거 시안
- 사용자 선택·수정: 04 소프트 컬러형에서 아이콘 뒤 반투명 하늘색 헤더 배경만 제거. 모달 전체를 흰색으로 연결하고 파란 반짝임·체크 아이콘, 제목·설명·로그인 CTA·닫기 배치 유지.
- 내장 image_gen 편집, 원본 보존. 산출물 `output/imagegen/signup-complete-20261031/04-soft-color-v2.png`, 전체 편집 프롬프트·입력/출력·SHA-256은 같은 폴더 `04-soft-color-v2.generation.json`.
- 검증: 원본/수정 이미지 육안 대조로 하늘색 패널 제거와 문구·배치 유지 확인. PNG 형식·크기·생성본/복사본 해시 일치·원본 보존 확인(exit 0). 제품 코드·배포 미적용, 기능 테스트는 이번 시안 범위에서 미실행. 기존 미커밋 변경 보존. 다음: 시안 확정 후 공용 모달 구현.

## 2026-10-31 회원가입 완료 모달 5종 이미지 시안 (선택 전, 제품 코드·운영 미적용)
- 사용자 요청: 부실한 가입 완료 모달을 심플한 아이콘으로 꾸민 디자인 5종을 먼저 사진으로 비교. 현재 공용 `components/crefans/AccountPages.tsx:91`은 Dialog+Feedback+로그인 링크이며, `lib/design/tokens.ts`의 파란색 #2563EB·흰 배경·중립 텍스트·둥근 모서리를 참고.
- 내장 image_gen으로 각각 독립 생성: 01 기본 체크형, 02 브랜드 하트형, 03 미니멀 라인형, 04 소프트 컬러형, 05 웰컴 티켓형. 가입 완료·환영 안내·‘로그인하러 가기’와 테두리 없는 닫기 아이콘을 공통으로 유지. 추천은 기존 UI와 가까운 01, 브랜드 강조 대안은 02.
- 산출물: `output/imagegen/signup-complete-20261031/`의 PNG 5개·`prompts.json`(전체 생성 프롬프트)·`manifest.json`(생성 원본 경로·크기·SHA-256·검토 범위). 채팅에서 5종 모두 이미지로 표시. 원본 생성 이미지는 보존하고 프로젝트 폴더에 복사.
- 검증: 5종 육안으로 문구·CTA·아이콘·잘림 확인; Python PNG 헤더·파일 개수·원본/복사본 SHA-256 일치 확인(exit 0). 실제 웹 모달·폰트 파일·반응형 동작 검증은 선택 후 구현 범위. 제품 코드·배포·가입 데이터 변경 및 제품 테스트 실행 없음.
- 기준선: front HEAD `5dcf63c7eb6197d00ed4ea15595e36b4f8613ceb`, 작업 전 다수 미커밋 변경 존재·보존. AccountPages SHA-256 `41c3b75b978bab9db91802d78e933dc5162aa040fdd0303b7dad36973fb65fd2`, tokens SHA-256 `66eea7bc6d97eacd0d4b9f2c66c3b7e32c7c9547de2c1a2c882ff1463221fc9d`. 다음: 사용자 시안 선택 후 공용 Dialog 기반으로 실제/목업 동일 적용하고 모바일·PC 검증.

## 2026-10-31 베타 실결제·수동 지급 준비 구현 (로컬, 미커밋·미배포)
- 결정(/ask-me): 토스 일반결제·자동결제·지급대행 신청(심사 중), 송금은 운영자 수동 이체+콘솔 기록, 통신판매업은 토스 등록 시 신고, 문구 개정·공지 후 개시(토스 승인·신고번호 확인 후), BETA_MODE 유지+스위치, 원천징수 없이 지급(세무 확인 필요 위험 기록).
- server: `beta-policy.ts` livePayments/manualPayouts — LIVE_PAYMENTS_ENABLED면 베타에서 live_ck/live_sk만(섞인 키 LIVE_KEYS_REQUIRED), 아니면 기존 test 키만. `bank-provider.ts` 수동 모드: 계좌 확인 MANUAL_ACCOUNT_REVIEW 안내, 이체는 pending 반환(동기 오류 동작 유지). `finance.service.ts` manualResult/manualVerifyAccount, payout 베타 차단은 수동 모드면 허용. `beans.service.ts` manualResult(기존 payout 클레임+finishPayout 원장 경로 재사용). `jobs.service.ts`·콩 작업자 수동 모드에서 수요일 처리 중 전환. admin API 4개(withdrawals/:id/manual-result, settlement-accounts 목록·verify, beans withdrawals/:id/manual-result), /admin/me livePayments·manualPayouts, /admin/withdrawals?status=open(+note·account_label). 권한 revenue.create·beans.update. openapi(171 operations)·platform-api.md 갱신.
- admin: `ManualPayouts.tsx`(매출·정산 아래 수동 지급 패널: 확인 대기 계좌, 이체할 멤버십 출금, 이체 완료 기록·반려 양식, table-wrap), Beans "이체 완료 기록", Console Admin 타입·연결. `e2e/manual-payouts.spec.ts`(ADMIN_E2E_MANUAL_PAYOUTS=1일 때만, tests/admin-console-server.cjs가 그때만 시드).
- front: `lib/content/business.ts` mailOrderNumber(null) — 값이 있으면 BusinessInfo 하단에 통신판매업 신고번호 표시.
- 문서: `crefans_server/docs/live-payment-launch-20261031.md`(결정·스위치·운영 절차·문구 개정 초안·남은 위험), manifest 등록.
- 검증: tests/platform-manual-payouts 4/4(대조: 수동 허용 제거 시 FAIL→복원 PASS), platform-beans 32/32(수동 콩 지급 추가), provider-lifecycle 17/17(transfer async 회귀 발견·수정), openapi 11/11, 서버 전체 416 PASS·0 FAIL(레거시 DB·실 AWS 2파일 제외), 콘솔 manual-payouts PC·Mobile PASS(최초 권한 이름·모바일 표 넘침 결함 발견·수정), front check 422/422, admin tsc, check:docs PASS. 콘솔 전체 E2E(PC) 38 PASS·1 FAIL(기존 QA-P03 대시보드 축소 넘침)·1 skip(수동 지급 스펙은 전용 환경에서만).
- 미적용: 약관·가이드·화면·계약서 문구 개정(초안만), 운영 배포, 운영 키 교체(사용자 직접), 통신판매업 번호 입력.

## 2026-10-31 /ask-me 베타 실결제·송금 개시 결정 (구현 전)
- 사용자 결정: ① 토스페이먼츠 일반결제(콩 충전)·자동결제(빌링·구독)·지급대행 모두 신청, 아직 심사 중 ② 크리에이터 송금은 운영자 수동 이체 + 콘솔 지급 기록(토스 지급대행 미연동: bank-provider.ts는 자체 규격만) ③ 통신판매업은 토스 등록 과정에서 신고(번호 미보유) ④ 약관·안내·계약서 문구 개정·공지 후 개시, 시행은 토스 승인·통신판매 번호 확인 후 ⑤ BETA_MODE 유지 + 실결제·수동 지급 스위치 별도 추가 ⑥ 출금 시 원천징수 없이 지급.
- 확인된 사실: assertBetaPayment가 BETA_MODE에서 test_ck/test_sk만 허용, 출금은 BETA_PAYOUT_DISABLED·BANK_PAYOUTS_ENABLED로 차단. 약관 4조·계약서 별지 B·화면 안내는 '베타 실제 청구·송금 없음'.
- 위험(미확정): 소득세법 127조·129조상 원천징수 대상 사업소득(인적용역) 지급자는 3%(+지방 0.3%) 원천징수·지급명세서 의무(2차 자료, 확인 2026-10-31: taxly.kr/post/326, watax.kr/employment/business-income-withholding). 크레팬스는 멤버십 판매자=크리에이터(회사=중개)라 멤버십 정산금·콩 후원 수익 지급의 원천징수 대상 여부는 세무사 확인 필요. '원천징수 없이 지급'은 사업자 결정으로 기록하며 확정 법적 판단 아님. 2026-08 인적용역 원천세율 2.2% 인하 입법예고 보도 있음(미확정).
- 운영 키 입력: 실 운영 시크릿 키(live_sk)는 사용자가 서버 env에 직접 입력(수행자는 운영 키를 입력하지 않음).
- 다음 작업 후보: 서버 LIVE_PAYMENTS·MANUAL_PAYOUTS 스위치와 수동 지급 기록(처리자·이체 참조·시각·감사), 약관 4조·계약서 별지 B·화면 안내 개정안(시행일 미정), 통신판매업 번호 표시 자리.

## 2026-10-31 /pilot-work 계약서 v2.1 재검사·보류 사유 표시 (계약서 수정, 코드 로컬·미커밋·미배포)
- 재검사: 약관·정산 정책 원본(legal-documents·bean-policy·beta-policy·creator-payout-policy)은 v2 이후 변경 없음, 계약 핵심 값 11개 일치. v2 이후 변경(초대 재등록 수정·분야 관리·미수금 알림 배포·운영 정책 20%/7일 사용자 확인)은 계약과 충돌 없음(8③ 소급·자동 우대 없음과 같은 방향, 9③ 알림 약속 이행).
- 결정(클릭): ① 7⑥ 보류 사유 → 코드로 이행 ② 2①·12④ 사본 제공 → "요청 시 고객센터를 통해 전자문서로" 명시.
- 계약서 v2.1: 2①·12④ 문구, 표제 v2.1, README 변경 기록. PDF 재생성·verify PASS(7쪽·13조·별지2), 전 쪽 육안 확인. PDF sha256 cdc075cf…55d6, TXT d607a252…a875.
- 코드: server `settlement-receipts.ts` settlementHoldReasons(period/receipt, settlementPending과 같은 규칙), `finance.service.ts` settlements[].holdReasons, openapi-contract·platform-api.md 갱신. front 타입·`studio/FinancePages.tsx` 건별 "대기 사유" 표시(사유 없는 응답은 기존 종료일 문구).
- 검증: tests/settlement-hold-reasons.test.cjs 1/1, platform-finance 9/9, openapi 11/11, pilot-followups 4/4, front check 422/422, qa-journey J10 PC·Mobile PASS(사유 표시 단언 추가). 대조: 서버 holdReasons 제거 시 J10 FAIL → 복원 PASS. docs:record·check:docs PASS. 운영 배포는 2026-10-31 사용자 결정으로 "다음 배포에 포함"(서버 settlement-receipts·finance.service·openapi-contract + 프론트 FinancePages·타입).

## 2026-10-31 실제 SMTP·Gmail 수신 QA 및 기존 보고서 v1.2 보강 (Codex 현재 세션)
- 범위: 기존 Astra 회원가입 / Opus 후속 E2E 이력은 보존하고 이메일 증거만 보강. 로컬 실제 DB·API·도메인·큐 + Google SMTP, 수신 주소는 승인된 Gmail 1개로 고정. PG 대역이며 운영 결제·기존 회원 암호·수신 설정 변경 없음.
- 11개 시나리오(인증 3, 업무 알림 4, 광고/수신 설정 4), fixture 교정 재발송 1통 포함 12통 모두 외부 Gmail INBOX. Message-ID·SPF/DKIM/DMARC·From·CID 로고·앰대시 미포함 대조. 실제 받은편지함 화면 첨부, OTP·토큰 비공개.
- 실제 베타 PC/Mobile 비밀번호 재설정 요청은 코드 입력 단계까지 확인. test-fan-1/2 별칭의 발송 사본은 있으나 받은편지함 검색 0건: 독립 수신 BLOCKED. 기존 계정 비밀번호 변경 제출 안 함.
- 수신 MIME HTML 390px Chromium/WebKit 22건 가로 넘침·깨진 이미지 0. 실기기 메일 앱은 BLOCKED로 구분. 관련 회귀 67/67 PASS. 임시 회원 정리 후 잔여 0.
- 최초 MAIL-05 시간 fixture가 베타 복구 기한보다 짧아 실패 → 5일 경과로 교정하여 재검증 PASS. 최초 로컬 operations outbox Telegram RATE_LIMITED 2건 확인 후 재실행은 봇 설정·작업 시작 hook 격리. 성공 전송은 확인되지 않음.
- 미구현 발견: account-changed/payment-completed/renewal-upcoming/subscription-cancelled/subscription-ended/refund-completed/withdrawal-received/withdrawal-completed/withdrawal-failed 9종은 템플릿만 있고 실제 이벤트 발송 연결 없음. 이번에 제품 코드/운영 배포는 하지 않음.
- 산출물: front `output/pdf/crefans-qa-pcmo-20261031-mail-v1.2/`의 PC·Mobile·통합 HTML/PDF. 기존 PDF 원본을 뒤에 보존하며 신규 증거는 `mail/`. 실행 증거·비공개 원본: server `.local/mail-qa-20261031/`. 기존 코드 미커밋 변경 보존.
- 최종 PDF PC 282쪽·Mobile 362쪽·통합 24쪽(전체 668쪽 렌더). 새 45쪽 검토, 기존 623쪽 원본과 픽셀 일치. check:docs는 동시 작업 포함 기존 문서/소스와 이번 문서 추가의 증거 해시 만료로 exit 1; 무조건 스냅샷 갱신하지 않고 mail/docs-check.log에 기록.

## 2026-10-31 QA-F01 원인 확인·테스트 수정 (미커밋)
- 진단(6회): /preview/post/morning 로드 직후(domcontentloaded)에는 숨은 PC용 textarea만 있고 휴대폰 하단 입력(INPUT aria-label 댓글 남기기)은 하이드레이션 후 생성. 테스트가 그 전에 입력해 숨은 textarea를 잡으면 15초 대기 후 실패하는 테스트 대기 조건 문제. 제품 결함 아님.
- 수정: e2e/mobile-comments.spec.ts에서 `[data-comment-dock] input` 표시를 기다린 뒤 입력. 검증: Mobile Chromium·WebKit 각 10회 반복 20/20 PASS(front-f01-fix).
- 이메일 범위 확인: 이번 실행은 로컬 대역만(템플릿 18/18, SMTP 흐름 통합 12/12 — "no live SMTP", 프론트 mail.spec 2건, 광고 동의·수신거부). 실제 SMTP 발송·수신, 발신자 표시는 미실행. 메일 소스 엠대시 0건(정적 확인). 실제 수신은 Codex Astra 가입 메일 16/16만 기록.

## 2026-10-31 QA 보고서 화면 증거 보정 (사용자 지적: 갤러리 오버레이 반투명 캡처)
- 원인: trace에서 시간상 처음·중간·끝 프레임을 그대로 쓰고, 테스트 종료 시 자동 캡처가 오버레이 전환 중에 찍힘.
- 조치: ① trace 프레임은 같은 페이지에서 다음 변화까지 150ms 이상 멈춘 안정 프레임만 사용, 로딩만 보이는 프레임 제외 ② `e2e/qa-settled.ts`(settledShot)를 base test 스펙 19개에 test.afterEach로 등록, fixtures page 훅·qa-journey 단계 캡처도 애니메이션 완료 대기(모두 QA_SETTLED_SHOT=1일 때만) ③ 프론트 전체 최종 재실행(front). 1차(front-run1)·훅 누락 중간 실행(front-run2-partial-settled)은 보존.
- 최종: PC 177건 PASS 173·FAIL 1(QA-P03)·N/A 3 / Mobile 190건 PASS 178·FAIL 1(QA-F01)·BLOCKED 1(QA-T02)·N/A 10. 최종 화면 258건이 애니메이션 완료 후 캡처(콘솔·여정 등 나머지는 자동 캡처/단계 캡처).
- 신규 QA-F01: 목업 /preview/post/morning 재진입 직후 휴대폰 하단 댓글 입력창 미표시로 mobile-comments 갤러리 케이스 간헐 실패(훅 없는 대조 반복에서도 재현, 약 30%). 원인 미확정·미수정.
- 테스트 인프라 변경은 미커밋(qa-settled.ts·fixtures·19개 스펙 import 한 줄·qa-journey 대기). post-*/preview 스펙에는 다른 세션 미커밋 변경이 섞여 있어 일괄 커밋하지 않음.

## 2026-10-31 /ask-me 결정 반영·운영 배포 qa-categories-20261031
- 사용자 결정(클릭): ① QA 수정분 커밋 먼저 ② 분야 관리 서버·콘솔 배포 ③ QA-P01·P02는 다음 배포에 포함 ④ 운영 금융 정책 20%·7일 맞음(사용자 확인, QA-E01 해소 기록).
- 커밋(푸시 없음): front 0b24a4e fix(메시지 대화방 유지·KST 시각), 5dcf63c test(qa-journey·qa-cohort·QA 설정·모바일 현행화) / server 1734563 test(e2e-server QA 동작) / admin 197a780 test(QA 설정). 다른 세션 변경(post-*/preview 스펙, AccountPages, PROGRESS·docs/audit, beans.spec 등)은 제외.
- 배포: 기준선 guide-sync-20261031(배포 직전 운영 확인) 위에 승인 파일만 덧씌움 — server admin.controller·openapi-contract(분야 GET/POST)·finance·beans.service(미수금 알림 원거래·이의 안내), admin Categories·Console·Operators·globals.css, front useServiceModel·SocialPages·studio 3·display-time. 미배포 제외: front AccountPages.tsx(다른 세션 가입 화면 수정). 이미지 내부 소스 해시 대조·amd64 확인, 배포 스크립트 확인(새 API, 비로그인 /admin/categories 401, 설정 변경 범위, DB·프록시 유지) 통과. 배포 후 실제 베타 비로그인 11화면 PC·Mobile 200, /admin/categories 404→401. 공개 분야는 0건 → 운영자 콘솔에서 분야 추가 필요.
- 이미지 보관: 로컬·원격 keep 3 적용(원격은 직전 콘솔 guide-sync를 --protect). 증거 `crefans_front/.local/qa-categories-deploy-20261031/`.
- QA-P03 원인: 콘솔 대시보드 recharts 숨은 툴팁이 넓은 화면 위치(right 460)에 남아 축소 시 가로 넘침. 분야 변경과 무관, 미수정(후속).
- QA 보고서 v1.1로 결정·배포 결과 반영, PDF 전 쪽 재검사(빈 쪽·영역 밖 글자 0, 케이스 ID 누락 0). /ask-me 스킬 신설(~/.claude/skills/ask-me).

## 2026-10-31 회원가입 이후 전체 시나리오 PC·Mobile E2E QA (qa-pcmo-20261031-0743, 수행 Claude Opus 5.5 medium, 미커밋·미배포)
- 범위: 기존 가입 검증(Codex Astra, .local/signup-qa-20261031)은 선행조건으로만 사용하고 결과 합산 안 함. 로컬 격리(A) 전체 E2E를 PC(Chromium 1440×900)·Mobile(Chromium Pixel7 390×844 에뮬레이션)·WebKit iPhone13 일부로 실행. 실제 베타(B)는 비로그인만 PC·Mobile 실행(11화면·보호 API 9건). 로그인 이후 실제 베타는 BLOCKED(운영 서비스 비밀번호·OTP 입력 불가, 저장 세션 없음). 실공급사(C) NOT_RUN.
- 결과(최종): PC 177건 PASS 173·FAIL 1(콘솔 QA-P03)·N/A 3 / Mobile 190건 PASS 179·BLOCKED 1(WebKit 종료 단계 비정상 종료)·N/A 10. 서버 49파일 412테스트 409 PASS(2파일 NOT_RUN: 레거시 _test DB·실 AWS opt-in, 2파일은 API 3005 기동 후 19/19). 프론트 check 422/422.
- 제품 수정(로컬): QA-P01 모바일 메시지 전송 후 대화방 닫힘 → `features/service/useServiceModel.ts` 메시지 전송만 refresh({quiet:true}). QA-P02 실서비스 시각 ISO UTC 원문 표시 → `lib/crefans/display-time.ts`(KST) + SocialPages·스튜디오 3화면. 각각 최초 실패 증거·대조 검사(되돌리면 FAIL) 보존.
- 테스트: 신규 `e2e/qa-journey.spec.ts`(J01~J10 역할별 독립 컨텍스트·단계 캡처), `playwright.qa.config.ts`(pc/mobile/mobile-webkit), `tests/display-time.test.cjs`. 현행화: bean-refund-closing(휴대폰 스튜디오 메뉴), comment-social(PC 입력 전제 → 휴대폰 제외 사유), mobile-shell(긴 목업 이름).
- 미해결: QA-B02 실제 베타 분야 0건·콘솔 분야 API 미배포(404)로 크리에이터 등록 불가. QA-E01 격리 DB 정책 10%/0일 ≠ 약관 20%/7일, 운영 DB 값 미확인. QA-P03 콘솔 대시보드 1440→390 축소 시 scrollWidth 460. 다음: 사용자 세션 수집(.local/qa-20261030-2351/beta/collect-sessions.cjs) 후 실제 베타 로그인 시나리오, QA-P01·P02 커밋·배포 결정.
- 원시 증거 `crefans_front/.local/qa-pcmo-20261031-0743/`(명령·시각·종료 코드·로그 SHA-256: logs/*.json, 소스 상태 source-state.json), 보고서 `crefans_front/output/pdf/crefans-qa-pcmo-20261031-0743/`(PC·Mobile·통합 HTML/PDF, traceability CSV/JSON, README, SHA256SUMS).

## 2026-10-31 QA 후속 활동 분야 콘솔 추가: 계약·증거 갱신 (미배포)
- 서비스 프론트 제품 코드는 이번 작업에서 변경하지 않았다. 형제 admin의 운영 설정에 분야 목록·추가 UI, server에 보호된 GET /admin/categories와 생성·수정 분리 검증을 추가했다. 상세 결정/검증은 두 리포 PROGRESS 최신 항목.
- 연결 근거: `components/crefans/studio/OverviewPages.tsx`의 ProfileFields가 model.categories를 선택지로 사용한다. 서버 격리 통합 검사에서 신규 분야가 studio/overview·bootstrap에 나타나고 studio/start로 저장되는 것을 확인했다. 실제 서비스 프론트의 가입 브라우저 시나리오나 실베타 검증 완료로 확대하지 않는다.
- 서버 관련32/32, 콘솔 단위11/11·전체E2E39/39(실API+대역)·빌드 통과. PC/390px 콘솔 화면 육안 확인. 원시 증거 형제 admin `.local/creator-categories-20261031/`. 기존 QA PDF는 당시 실행의 기록으로 유지한다.
- `../crefans_server/docs/platform-api.md` 의미 계약과 current-contracts.md 갱신 후 docs:record·check:docs를 수행한다. 해시 스냅샷은 제품 검사와 별개이며 범위 밖 기존 작업의 재검증을 뜻하지 않는다. 운영 배포·실베타 분야 추가/크리에이터 등록은 아직 미실행.

## 2026-10-31 시나리오별 QA 재검증·외부 검토용 보고서 (qa-20261031-final, 미커밋·미배포)
- 합격 기준: 기존97+확장23=120개 요구사항에 실행 테스트·실제 결과를 연결하고 로컬/실베타/실공급사 판정을 분리. ISO/IEC/IEEE29119-3 공개 개요, ISTQB CTFL4.0.1, OWASP 권한 교차, Playwright 세션 격리 공식 자료를 참고했으며 인증·완전 준수나 출시 승인을 주장하지 않는다.
- 최종 로컬: front check421/421, server433/433(48파일·결제키 환경 추가로49실행), admin check11/11, front E2E161통과·3건 데스크톱 제외(동일 모바일 검사 통과), admin E2E37/37. 초기 공유DB 충돌 실행은 제외·보존하고 서버→콘솔→갤러리 순차 재검증. 구형 auth_test 스키마/runner 환경변수 문제 보정 후 인증12/12·실MySQL 보안19/19. 실AWS opt-in 미실행.
- 제품 수정은 가입 성공 콜백의 submitted 상태 초기화 1곳. 완료 뒤 비밀번호 오류 노출을 수정 전 실패 대조 후 검증. 테스트만 현행화: 잠긴 글 후원 거부/구독 선행, 갤러리 기본 단계1, 콘솔 전용 관리자 분리, API 키 유무·필수값 계약. 권한 로직 완화 없음. 기존 다른 세션 작업 보존, commit/push/배포 없음.
- 실제 베타: 지정16회원의 분리된 쿠키로 로그인·본인 이메일·마케팅off·지갑 조회, 팔로우 원복, 비공개 팔로워/팔로잉 타인403·본인200, QA메시지1건, 회원의 관리자401, 테스트키환경, 10콩1100원 미결제 주문 멱등성·타인404, 로그아웃 격리 확인. HTTP27통과·1실패(활동 분야0개). 최초 잘못된 개인정보 목록 경로404 검사는 경로 수정 후 다시 검증. 비로그인8공개화면·15보호API·5헤더 확인. 앞선 실제SMTP 가입16/16 증거 연결.
- 차단/잔여: 실베타 분야0개로 크리에이터 등록과 구독자0/2/10명 구성이 중단. 테스트 분야1개 추가 승인받았으나 관리자 TOTP2회 거부로 재시도 중지. 현재 콘솔에 카테고리 추가 UI도 확인되지 않음(API 존재). 사용자 모바일 경로 admin.crefans.com/login, 로그인 후 /console/me#totp 안내. 실토스 승인·빌링·갱신·환불·은행·운영S3/CDN·복구·부하 미완료. npm audit 프로덕션 의존성 front7(critical1/high4/moderate2), server8(high2/moderate6), admin0. 악용 도달 가능성·호환 패치 평가 미완료로 종료기준 실패.
- 잔여 베타 데이터: 테스트 회원16개, 팬1→팬2 QA메시지1개, 미결제 충전주문1개. 팔로우/공개설정 원복·HTTP 검사 세션 로그아웃. 실제 승인·충전·프로모션 지급·후원·송금·운영DB 직접 수정 없음.
- 산출물: output/pdf/crefans-qa-20261031/ 의 PDF34쪽·HTML·요구사항 CSV/JSON·테스트 인덱스·공식 근거·증거 해시 목록. 원시 증거 .local/qa-20261031-final/ 및 signup-qa-20261031/. 120개 중 로컬 기준35PASS·80PARTIAL·4NOT_RUN·1FAIL이며 검사건수와 요구사항 완료율을 혼합하지 않는다. 전체 페이지 렌더, ID/수치/비밀 미포함/해시 대조와 문서 검증은 같은 증거폴더의 verification.json·logs/docs-*에 기록. 문서 해시 갱신은 제품 검사와 구분한다.

## 2026-10-31 초대된 16개 테스트 회원 가입 검수 완료 (실제 베타·실 SMTP)
- 범위는 회원가입과 가입 직후 로그인 확인만. test-creator-1~3/test-fan-1~13 총16주소의 코드 요청·실제 Gmail 수신·이메일 인증·회원가입 완료·로그인·본인 닉네임 프로필·로그아웃 모두16/16 확인. 첫 creator1 잘못된 인증코드 1회 거부도 확인. 초대 설정 변경 없음.
- 사용자에게16계정 필수 동의·만19세 조건·계정별 임의 비밀번호 비공개 저장을 묶어 확인받은 뒤 가입 제출. 시행일2026-10-30 약관/개인정보 필수 체크, 마케팅 모두off. PASS는 email-only UI에 없고 실제 본인/연령 인증 완료를 뜻하지 않는다. 크리에이터용 주소도 일반 회원가입까지만 완료했으며 크리에이터 신청/심사는 수행하지 않았다.
- 계정마다 서로 다른 테스트 비밀번호는 `.local/signup-qa-20261031/private/credentials.json`(디렉터리0700/파일0600/Git제외)에만 저장. 비밀번호·OTP는 공개 문서/증거에 미포함. 후속 QA 세션은 이 파일을 로컬에서 읽고 값을 채팅·로그로 출력하지 않는다. 기존 사람 비밀번호 재사용/변경 없음.
- Chrome 동일 프로필에서 계정별 순차 로그인→본인 프로필(닉네임)→설정 로그아웃→로그인 보호 확인. 동시 격리 세션 검증은 아님. 최종 브라우저는 로그아웃 상태. 결제/구독/후원/크리에이터 활동·DB 직접 변경·운영 배포 미실행. Gmail 수신함/스팸 분류는 미판정.
- 발견사항 `SIGNUP-UI-01`(경미,미수정): 가입 완료 모달 뒤 비밀번호 초기화에 따른 “비밀번호를8자 이상” 오류가 함께 보임. 가입/로그인 성공과 구분하여 추후 UI 수정 대상으로 남겼다.
- 증거 `.local/signup-qa-20261031/verification.json`, 계정별 `*-verified.txt`/`*-created.txt`/`*-login.txt`/`*-logout.txt`, `signup-complete.png`.16개 대상·필수/마케팅 동의·각 완료/본인 프로필/로그아웃 DOM·파일 권한/Git제외/비밀 미노출 대조 검증 종료0. 최초 증거검사에서 범위 밖 지갑잔액까지 단정한 assertion은 비동기 로드전 내 지갑 문구로 실패하여 잔액 완료 주장을 제거했다. 문서 검사 결과는 같은 폴더 `docs-record.log`/`docs-check.log`. 기존 타 세션 미커밋 작업 보존, 신규 commit/push 없음.

## 2026-10-31 오픈베타 역할별 QA 실행 (runId qa-20261030-2351, 테스트 코드만 수정·미커밋, 배포 없음)
- 지시: `.local/qa-handoff-20261030/prompt.txt`. 증거·보고서 `.local/qa-20261030-2351/`(report.html·report.pdf·trace.csv/json·defects.json·environment.json·logs·local·beta, 비밀 `private/` 700).
- 결과: 서버 49파일 410건 중 405 PASS·2 FAIL(QA-D03 결제 키 환경 결합)·2 NOT_RUN(구형 _test DB, 실 AWS)·1 skip. 프론트 단위 421/421, 콘솔 단위 11/11. 프론트 E2E 128건 → 124 PASS·1 FAIL(QA-D04)·3 skip(첫 실행 8 FAIL 중 7건은 의도된 UI 변경 뒤 낡은 기대값, QA-D06로 갱신). 콘솔 E2E 36/37(QA-D05 로그인 제한, 단독 PASS).
- 신규 `e2e/qa-cohort.spec.ts` + 서버 `tests/e2e-server.cjs` `cohort`·`cohort-expire`: C0/C2/C10·S01~S12·N0·G0 독립 BrowserContext 권한표(본문·미디어 GET/HEAD/Range 40조합, URL 공유·캐시 후 접근, 로그아웃 격리, 해지예약·만료·미사용 환불·열람 후 환불, 타인 주문·게시물, 잠긴 글 후원, 이중 결제) PASS. 대조: 서버 미디어 권한 검사 제거 시 FAIL 확인 후 복원.
- 실제 베타: 비로그인 G0만(공개 화면 8·보호 API 15 거부·보안 헤더 5) PASS. 지정 이메일 16개 계정 가입·로그인·콘솔 2차 인증·Gmail은 운영 서비스 계정 생성/비밀번호 입력이라 BLOCKED(사용자 직접). 실공급사(PASS·Toss 창·은행·SMTP 수신·Telegram) NOT_RUN.
- 2026-10-31 베타 로그인 QA 준비(실행 전): 사용자가 원격이라 Mac 로그인 불가 → "로그인만 사용자, 나머지 자동" 방식. `.local/qa-20261030-2351/beta/collect-sessions.cjs`(계정별 수동 로그인 → storageState를 `private/sessions/` 700/600에 저장, `--verify`), `beta/role-qa.cjs`(setup 크리에이터 3·멤버십 9·게시물 15 / subscribe 팬 12 토스 테스트 결제창 / card / checks 권한·미디어·공유URL·해지·환불·경합·로그아웃 / console 읽기 전용), 순서는 `beta/RUNBOOK.md`. 비밀번호·OTP·카드 입력은 하지 않음(사용자가 OTP를 제시했으나 사용 안 함). 선행 조건: 콘솔에서 16개 초대 등록·가입(폰 가능) 후 Mac에서 세션 수집. 만료(S05)는 베타 NOT_RUN 고정.
- 테스트 수정(미커밋): e2e/post-detail-gallery(닫기 24px)·post-share(Toast)·post-views(그려진 요소만 측정)·preview(긴 이름). Codex 미커밋 `e2e/beans.spec.ts` 후원 필터 테스트는 10-31 '볼 수 없는 글 후원 금지'와 충돌(QA-D04) — 손대지 않음.

## 2026-10-30 다른 세션용 역할별 전체 QA 실행 지시문
- 사용자 요청으로 `.local/qa-handoff-20261030/prompt.txt` 작성. 기존 별칭16개와 C0/C2/C10·12구독자·N0·기존 A0·격리 A1·G0 배정, 계정별 독립 BrowserContext/context.request·소유권 교차, 기존 출시 시나리오 ID 추적, 단위/DB/HTTP/E2E·실베타·공급사 대역 구분을 포함했다.
- 최신 정책 확인점을 명시: 초대 가입·email-only의 성인인증 아님, 프로모션 후원수익 출금 허용, 직접 충전/지급 잔액과 구분, 110원 충전/100원 가치·20%·10만원, 잠긴 게시물 후원 차단, 기존 snapshot·유효 법률문서 우선. 현재 배포/설정을 새 세션이 재조회하도록 했다.
- 승인 범위 제안은 지정 QA 계정·기능성 메일·토스 테스트 환경으로 한정. 실제 청구/송금·현금화 가능 프로모션 지급·운영 DB 직접 변경/장애주입·권한 확대·운영 배포는 자동 실행 대상에서 제외. HTML/PDF 보고·금액 대사·비밀정보 분리·잔여 QA 데이터 목록 요구.
- 이번 턴은 코드/공식 문서 대조와 지시문 작성만 수행. 제품 테스트·회원 생성·메일 발송·금융 실행 없음. 확인 근거/파일 해시/명령 결과는 `.local/qa-handoff-20261030/verification.json` 및 docs-check.log. 다음 세션은 해당 지시문을 읽고 사전 확인 후 실제 QA를 시작한다.

## 2026-10-30 QA 이메일 별칭 16개 생성 완료
- 사용자 요청으로 기존 Workspace 사용자에 test-creator-1~3/test-fan-1~13의 @crefans.com 별칭16개 추가. crefans.com은 grade.im의 사용자 별칭 도메인이므로 grade.im에 기본 별칭을 만들고 자동 생성된 crefans.com 주소16개를 확인했다. 기존 기본 별칭은 noreply/support/no-reply 3개로, 추가 후19/30개·11개 여유. 유료 사용자 추가0건.
- Google Admin 저장 성공 후 목록 반영 지연이 있었으며, 중복 검증에서 동일 사용자 소유로 확인된 재입력은 취소했다. 최종 새로고침한 기본19개 목록과 자동 생성된 crefans.com16개를 전체 대조, 누락0·중복0·저장 버튼 비활성(미저장 변경 없음) 확인. 실제 메일 발송/실수신·크레팬스 가입/초대는 실행하지 않았다. 공급사 안내상 이메일 반영은 최대24시간 소요 가능.
- 증거 front `.local/workspace-test-aliases-20261030/verified-aliases.json`, `verified-alias-section.txt`, `google-admin-crefans-aliases.png`, `status.json`. 관련 역할 배정은 docs/beta-role-test-plan.md. 제품 코드·운영 배포 변경 없이 기존 미커밋 작업 보존. 문서 검사 결과는 같은 폴더 docs-record.log/docs-check.log에 기록.

## 2026-10-30 QA 이메일 최소 수 산정 (조사·설계만)
- 기존0/2/10구독자와97개 출시시나리오/콩·콘솔 추가 기능을 대조. 신규 별칭16개=크리에이터3+팬13(12구독자/1비구독), 기존 최고 관리자 이메일 포함 고유 주소17개. 제한 운영자는 N0와 같은 이메일로 독립 Admin 계정 생성 가능(회원/관리자 테이블·인증 분리), 따라서 실제 로그인18계정. 기존17계정 표와 추가 운영자를 구분. 기존 별칭2개라면 총18/30,12개 여유.
- 조건: 초기 역할은 분리, 권한 교차 두 세션 유지, 상태·주문별 증거 기록, 정지/탈퇴는 마지막 또는 격리 fixture. 모든 상태 동시보존/상시 기준점 유지라면 별도 계정 추가. 선택 여유2개는 최소 아님. +주소 지원은 Google 공식문서와 normalizeEmail 코드로 확인, 실수신 미검증.
- 근거·실행경계: front docs/beta-role-test-plan.md 최신 산정절과 `.local/qa-mail-account-count-20261030/verification.json`.97개ID 누락0/산식 확인, 제품테스트·계정/메일별칭 생성·초대·운영변경 없음. PASS/실PG/은행·부하/복구 완료를 계정수로 주장하지 않음. 다음은 사용자가 생성 요청하면16개 또는 여유포함18개만 별칭으로 구성하고 초대·실수신 확인.

## 2026-10-31 /pilot-work: 앱 도움말·약관 개정본 표시·잠긴 게시물 후원·최소 출금 (운영 배포 guide-sync-20261031, 커밋 완료·푸시 안 함)
- FAQ 3문항 추가(콩 환불·유효기간, 구독·후원 정보 제공 동의 이유, 탈퇴 후 재가입 30일), 구독 FAQ에 동의, 신고 FAQ에 결과 알림. 서비스 안내에 '콩 후원' 카드·구독 동의 단계. 명칭 '오픈베타(가입은 초대 이메일)'. 이벤트에 프로모션콩 유효기간 5년·만료 알림·소멸 문장.
- 약관 화면: `/common` legal의 `terms-next`/`policy-next`를 '2026.11.30 시행 개정본 보기' 접이식으로 표시(`CommonPages.LegalPage`).
- 잠긴 게시물 카드: 후원 버튼 대신 후원 수만(`SocialPages.PostActions`, 서버 POST_ACCESS_REQUIRED와 짝).
- 멤버십 출금 화면 최소 금액: `creatorTerms.minimumWithdrawalKrw`(없으면 기본 10만 원). `tests/withdrawal-pin-ui.test.cjs` 신규(하드코딩 복원 대조 시 1건 실패).
- 검증: `npm run -s check` 421/421, 로컬 e2e 서버로 약관 개정본 표시 확인(390px), check:docs PASS. Codex 세션의 미커밋 후원 내역 작업과 `docs/audit/evidence.json`(그 작업 문서까지 반영해 재생성됨)은 커밋하지 않음. 배포는 운영 기준 bean-tip-filter-20261030 위에 이 세션 파일만 덮음(server PROGRESS 같은 날짜).

## 2026-10-30 밤 night-work: 소개서·가이드 ↔ 정책·코드 동기화 조사 (문서만, 코드 변경 없음)
- 문서: `crefans_front/.local/night-work/2026-10-30-2213.md` (22:13~22:21, 범위 소진으로 조기 종료).
- 숫자·소개서 수익 계산은 코드와 일치. 상위: 콩 규칙이 시행 약관에 없음(개정 공지 시점 결정), 구독·후원 제공 동의·보관 기간·즉시 삭제·재가입 30일 제한이 가이드·앱 FAQ에 없음, 세금 문구 약관 불일치, 전용 게시물 비구독자 후원 가능(가이드와 다름), 회사 귀책 환불은 운영자만, 가이드 검사가 원본 변경을 감지 못함, `FinancePages.tsx:67` 최소 출금 하드코딩. 결정 필요 9건은 문서 요약 참조.

## 2026-10-30 보낸 후원 구분 필터 운영 배포 (bean-tip-filter-20261030)
- 사용자 배포 요청으로 전체 후원/게시물 후원/프로필 후원 셀렉트와 API sourceType 필터를 프론트·API/worker에 반영. 직전 bean-history-20261030 대비 제품 소스 프론트3파일·서버3파일. DB migration·금융 정책 변경 없음, admin/DB/proxy 컨테이너 보존.
- 직전 구현 검증(front check420개, server build+beans31/openapi11=42개, E2E10개)의 제품·테스트 소스 SHA 일치를 확인하여 기존 결과를 사용. amd64 빌드2개 종료0, 이미지 내부 소스해시 서버230/프론트692파일 일치, 전송 checksum·이미지 검증·전환 종료0.
- 격리 빌드 및 운영 Chromium390/1280에서 전체28건→게시물14건/프로필14건, 2페이지→조건 변경 시1페이지, 검색 교집합0건, 초기화 전체복원, 가로넘침·페이지오류0 확인. 운영 /service/beans/tips 로그인 보호와 sourceType post/profile 비로그인 API401 확인. 모바일 캡처 육안 검수. 운영 회원의 실제 후원 내역은 조회하지 않았으며 실API 필터·타인 격리 검증은 로컬 격리DB/E2E 결과다. PG/은행은 대역, 운영 금융 쓰기 없음.
- 증거 front `.local/bean-tip-filter-deploy-20261030/verification.json`, 빌드·배포·운영 브라우저 로그와 스크린샷. 복구 설정 `/opt/crefans-backup-bean-tip-filter-20261030`, 직전 bean-history 이미지 보존. 이미지 keep3 정리 로컬·운영 각2개 삭제·오류0. 새 commit/push 없이 기존 미커밋 작업 보존. 앞선 미배포 항목은 당시 기록이며 이번 릴리스로 필터 배포 완료.

## 2026-10-30 보낸 후원 구분 셀렉트 필터 (로컬, 운영 미배포)
- 공용 SelectField로 기간 아래 전체 후원/게시물 후원/프로필 후원 추가. sourceType 상태·쿼리·초기화·빈 결과 연결, 선택 변경 시1페이지 복귀. 목업과 실제 API 모두 전체 내역에서 필터 후20건씩 페이지네이션·total 계산. 기존 검색/기간과 AND, 지갑 잔액/다른 내역 필터 불변.
- 서버 `beanHistoryFilter`가 post/profile만 허용(배열·객체·잘못된 문자열400). `BeansService.tips`에 post_id 유무 조건을 추가하며 본인 sender조건 유지. 제목/게시물 삭제 상태와 무관하게 후원구분 유지. OpenAPI와 관련 문서 갱신, DB 변경 없음.
- 검증: front check420개/타입/레이어, server build+beans31/openapi11=42개, E2E10개 모두 종료0. 27건 게시물 후원의20+7페이지/4건 프로필/타인내역/기간·검색 교집합/빈 결과/잘못된값 검사. 390/1280에서 공용 셀렉트 선택·2페이지→필터 변경 복귀·검색0건·초기화·실API query전달 확인, 가로넘침없음. 최초 단위 테스트 작성 중 잘못 중복된 기대값(profile)을 post로 수정 후 전체 재통과. 모바일 캡처는 셀렉트 애니메이션 완료 후 재촬영·육안검수.
- 증거 front `.local/bean-tip-source-filter-20261030/verification.json`, 실행로그·select/filtered 스크린샷. 실제 DB/API+PG/은행 대역 검증이며 운영 결제 없음. 현재 운영은 bean-history-20261030으로 이 필터는 미포함. 요청 시 프론트와 API/worker 함께 배포 필요. 기존 미커밋 변경 보존, commit/push 없음.

## 2026-10-30 콩 내역·후원 구분/신원 표시 운영 배포 (bean-history-20261030)
- 사용자 배포 요청으로 누적된 충전 주문·콩 이동·보낸 후원의 모바일 전체너비/간격, 아바타·인증배지·핸들, 아바타 위 후원 구분·18px 동전·메시지 위16px를 반영. 목업/실서비스 공용 표시 컴포넌트. 서버 후원목록 creatorAvatar/creatorHandle/creatorIsVerified 추가. 이전 tip-consent 기준 프론트6파일·서버1파일만 변경.
- 검증: front check 레이어/타입/419검사, server build+후원30검사, beans E2E7검사 모두 종료0. 추가 격리 DB에서 신원 필드 값·미등록null/false·타인내역0 확인(초기 검사 fixture의 필수 message 누락 수정 후 통과; 데이터는 롤백). PG·은행은 대역이며 운영 결제/후원은 실행하지 않음.
- amd64 API/프론트 순차 빌드 종료0, 이미지 내부 서버230/프론트692파일 소스해시 일치. 격리 빌드 컨테이너3페이지200·390/1280 메시지 간격/동전/배지 확인 후 제거. 운영 전송 checksum·이미지 검증·전환 종료0. API/worker/frontend 교체, admin/DB/proxy 컨테이너 보존, migration/정책 변경 없음. 건강검사200·비로그인후원목록401·기존가입/개인정보버전 유지.
- 운영 Chromium390/767/1280 ×3페이지9조합: 모바일 끝맞춤/16px 내부여백, 후원 구분 위치·동전18px·아바타·배지·핸들·메시지16px, 가로넘침/페이지오류0. /service 세페이지 로그인 보호 확인. 실제 운영 회원 후원내역을 로그인해서 열어보지는 않음. 모바일 운영 스크린샷 육안 확인.
- 증거 front `.local/bean-history-deploy-20261030/verification.json`, 빌드/검사/운영로그·스크린샷 같은 폴더. 복구 설정 `/opt/crefans-backup-bean-history-20261030`, 직전 이미지 tip-consent-20261030 보존. 이미지 보존규칙 keep3 적용: 로컬·운영 각2개 삭제, 오류0. 집IP SSH 지속허용 유지. 이번 배포에서 새 commit/push 없음; 기존 미커밋 작업 보존. 앞선 미배포 기록은 해당 시점 상태이며 이 항목으로 배포 완료.

## 2026-10-30 후원 구분 라벨에 동전 아이콘 (미배포, 커밋 완료·푸시 안 함)
- 사용자 요청: '게시물 후원'·'프로필 후원' 구분 라벨(`BeanAttribution.BeanTipKind`) 왼쪽에 기존 후원 동전 아이콘(`/brand/post-actions/support-coin-flat-v1.png`, 18px, 장식용 alt "")을 넣음. 보낸 후원·지갑 내역·스튜디오 받은 후원에 함께 적용.
- 검증: 390·1280px 캡처(보낸 후원 20개·스튜디오 받은 후원 2개 아이콘 표시), `npm run -s check`, e2e beans(아래 커밋 메시지 참조).

## 2026-10-30 후원 구분 왼쪽 동전 이미지
- 공용 BeanTipKind에 기존 포스팅 후원 동전 에셋 `/brand/post-actions/support-coin-flat-v1.png`를18px로 재사용. 게시물 후원·프로필 후원 문구 왼쪽6px 간격·세로중앙 정렬, 장식이미지 alt빈값·aria-hidden. 보낸 후원과 콩 이동 내역의 공유 구분 표시에 적용. 메시지 위16px 간격 유지.
- 검증: 관련 단위7개 PASS. 로컬 Chromium390/1280에서 tips/history4조합의 보이는 동전 로드·18×18px·문구 왼쪽6px·가로넘침없음 확인, 모바일 육안검수. 증거 `.local/bean-history-edge-20261030/coin-tests.log`, `coin-verification.json`, `coin-390.png`, `coin-1280.png`. 운영 미배포.

## 2026-10-30 보낸 후원 메시지 위 간격 수정
- 원인: 서비스 셸 `.root p`의 margin-top:0이 `.tipMessage`보다 우선해 모바일·PC 모두 실제 간격0px. `.historyItem>.tipMessage`에 margin16px 0 0을 적용하고 기존 모바일8px 선언 제거. 게시물 제목 링크 또는 프로필 정보와 메시지 박스 사이를 공통16px로 보정. 메시지 없는 항목에는 여백 추가 없음.
- 검증: 로컬 Playwright Chromium390/767/1280에서 게시물·프로필 후원 메시지 전 항목의 실제 간격16px, 가로넘침없음 확인(종료0). 모바일 스크린샷 육안검수. CSS만 수정하여 단위검사/빌드 반복 안 함. 증거 `.local/bean-history-edge-20261030/message-gap-verification.json`, `message-gap-390.png`, `message-gap-1280.png`. 목업/실서비스 공용 CSS이며 운영 미배포.

## 2026-10-30 보낸 후원 구분을 아바타 위로 이동
- 게시물 후원·프로필 후원을 각 항목 맨 위에 표시. 그 아래 아바타·이름·인증배지·핸들·콩 수량, 게시물 링크·메시지·시각 순으로 배치. 공용 BeanTipKind를 분리하고 BeanTipSource의 기본 동작은 유지하여 다른 사용처의 구분 표시는 보존.
- 관련 단위7개 종료0. 로컬 Chromium390/1280 각20항목에서 구분 위치가 아바타 위이며 중복 구분0, 아바타20개 로드·배지/핸들·가로넘침없음 확인. 모바일 스크린샷 육안 검수. 증거 `.local/bean-history-edge-20261030/kind-verification.json`, `kind-tests.log`, 최신 `identity-*.png`/`identity-browser.json`. 운영 미배포.

## 2026-10-30 보낸 후원 인증배지·핸들
- 아바타 옆 이름에 공용 CreatorName 인증배지, 아래 @핸들에 공용 MarqueeText 적용. BeanTip creatorHandle/creatorIsVerified를 목업 초기내역·새후원 및 실제 서버 후원목록 응답에 연결. 미인증은 배지없음, 핸들없음은 행생략.
- 단위9개·프론트typecheck·서버build 통과. 목업 PC/모바일 표시 검증은 front `.local/bean-history-edge-20261030/identity-*`. 운영 미배포·실API 응답 검증 미실행.


## 2026-10-30 보낸 후원 크리에이터 아바타
- 공용 BeanHistoryView 크리에이터 링크에 공용 Avatar36px 추가. creatorAvatar 선택필드를 BeanTip 및 목업 초기내역/새후원 데이터에 연결. 서버 후원목록 creators조회에서 avatar를 선택해 creatorAvatar로 반환(미등록null), 기존권한/결제/후원처리 불변.
- 검증: 프론트 bean-history/bean-wallet-pages 9검사·typecheck 종료0, 서버 npm run build 종료0. 목업 Chromium390/1280에서 각20항목 아바타20개·이미지로드·가로넘침없음 확인, 모바일 육안확인. 증거 front `.local/bean-history-edge-20261030/avatar-*`. 실API 수신 검증과 운영 배포는 미실행.


## 2026-10-30 콩 이력 모바일 세로 간격 후속 보정
- 필터 내부12px, 필터→건수20px, 건수→첫 항목16px. 항목 상하24px(첫 항목 위16px), 날짜→정보12px, 금액4px/메타6px/후원 내용8px/버튼12px로 관련정보 묶음. 기존 전체너비·좌우16px 유지, PC는 변경하지 않음.
- Playwright 3페이지×390/767/1280px9조합에서 양끝·내부패딩·가로넘침 확인, PC전후 동일. 후원 목록 육안검수. CSS전용 수정으로 제품 단위검사 반복 안 함. 증거 `.local/bean-history-edge-20261030/spacing-verification.json`, `spacing-after.json`, 최신 after-*.png. 운영 미배포.

## 2026-10-30 콩 이력 3페이지 모바일 전체 너비 목록
- 충전 주문·콩 이동 내역·보낸 후원의 공용 BeanHistoryView에 historyPage 클래스 추가. 767px 이하에서 래퍼 최대너비 해제, 목록 좌우-16px, 항목 간격0/테두리0/모서리0/내부16px. 메시지·알림 모바일 목록과 같은 좌우 패딩이며 PC는 유지. 목업·실서비스 공용 표시 컴포넌트에 적용.
- 검증: 로컬 Playwright 3페이지×390/767/1280px 전후9조합. 모바일 양끝0/viewport·안쪽16px·테두리/모서리0·가로넘침없음, PC전후측정동일. 충전 주문 스크린샷 육안확인. 기존 bean-history/bean-wallet-pages 검사 로그 및 소스SHA·HEAD·측정증거는 `.local/bean-history-edge-20261030/`. 운영 배포 요청 없음, 로컬만 수정.

## 2026-10-30 후원 창 닉네임·핸들 간격 축소 (운영 배포 tip-consent-20261030, 커밋 완료·푸시 안 함)
- 사용자 지적: 아바타 오른쪽 닉네임과 아래 핸들 사이가 너무 넓음. 측정 결과 margin 4px에 닉네임 줄높이 1.6(25.6px)·핸들 줄높이 1.6(22.4px)의 위아래 여백이 더해져 글자 사이가 약 13px.
- `beans.module.css`: 핸들 margin-top 0·line-height 1.4, 닉네임(내부 마키 포함) line-height 1.35. 측정 후 상자 간격 0px(닉네임 23px·핸들 20px), 390·1280px 후원 입력·확인 창 캡처 확인. 아래 안내 문구 간격은 그대로.
- 검증: `npm run -s check` 통과, e2e beans·marquee-text 통과(아래 커밋 메시지 참조).

- 운영 배포 2026-10-30 KST `tip-consent-20261030`(`crefans_front/.local/tip-consent-deploy-20261030/`): build·capture_before·ship exit 0, 마이그레이션 없음, 관리자 콘솔 소스 변경 없음. 배포 스크립트가 비로그인 후원 401/403, signupReady=true, 처리방침 2026-10-30.3을 확인. 외부 확인: signupReady True, 처리방침 2026-10-30.3에 후원 제공 문단, 비로그인 POST /creators/x/tips 401. 이미지 정리 로컬·운영 보존9·삭제3·오류0. 실제 회원 후원 1건은 미실행.
## 2026-10-30 후원 확인창 크리에이터 제공 동의 + 확인 항목 상단 정렬 (운영 배포 tip-consent-20261030, 커밋 완료·푸시 안 함)
- 후원 확인 대화상자에 받는 사람·항목·목적·보유 기간과 '(필수) 제공 동의' 체크, 체크 전 '확인하고 후원하기' 비활성. 요청에 creatorProvision(TIP_PROVISION 버전) 전송.
- 사용자 요청 "vertical align top": 멤버십 확인창 `.summaryRows` 행과 후원 동의 `.provisionRows` 행을 align-items:flex-start로 맞춰 여러 줄 값 옆 라벨이 위에 붙도록 함.
- 검증: `npm run -s check` 419/419, e2e beans 7/7(목업 동의 전 비활성 확인 + 실 API 후원이 동의 체크 후 성공), marquee-text 17/17, 390·1280px 후원 확인창 캡처 확인, check:docs PASS.

## 2026-10-30 구독 시 크리에이터 정보 제공 동의 화면 + 초대 가입 개방 (운영 배포 signup-open-20261030, 커밋 완료·푸시 안 함)
- 멤버십 선택 확인창에 받는 사람·제공 항목·목적·보유 기간과 '(필수) 크리에이터 제공 동의' 체크 추가, 두 체크가 모두 있어야 '확인하고 계속'. 주문 요청에 creatorProvision 버전(`lib/crefans/creator-provision.ts`, 서버와 같은 문구) 전송.
- 검증: `npm run -s check` 419/419, crefans-creator 단위에 동의 필수 검사 추가(동의 무시 대조 시 1건 실패), marquee-text e2e 17/17 + 375px 확인창 캡처 확인. 문서 check:docs PASS(release-test-scenarios·service-api-binding 갱신).
- 서버 쪽 결정·근거·배포는 server PROGRESS 같은 날짜 항목.

## 2026-10-30 /pilot-work K2~K14 합의·반영 (운영 배포 totp-pilot-20261030 + 가이드, 커밋 완료·푸시 안 함)
- 결정: 운영자 TOTP 즉시(미등록 7일 유예) / 세금 문구 중립("세금 처리 방식(원천징수 여부 포함)은 정식 정산 전에 안내합니다.") / 콩 10% 공제·만료 소멸은 현행 유지 / 처리방침 개정은 약관 초안에 묶음 / 탈퇴자 문의 3년 보존·DM 상대방 쪽 보존 / 콩 미수금만 콩 출금 차단 / 백업 최대 7일 / 탈퇴 시 충전콩은 지갑 환불 안내(프로모션콩 소멸) / 멤버십은 중개 구조 유지+고지 보강 / 다음: 요청량 제한 → 옛 경로 리다이렉트 → 덤프 정리 자동화·배포 전 테스트.
- 반영: server TOTP(`admin-totp-core.ts`·`admin-totp.ts`, 마이그레이션 `20261030230000_admin_totp`, 로그인 2단계·복구코드·재사용 거부·5분 5회 제한·유예 후 self 경로만), 콩 미수금만 콩 출금 차단, 탈퇴 시 콩 버킷별 안내, 파기(DM 보존·문의 3년 후 삭제·CI 해시 삭제). admin TOTP 화면(로그인 2단계·등록·복구코드·유예 배너·403 이동). front 탈퇴 창(크리에이터 조건은 크리에이터에게만, 충전 내역 환불 링크), 콩 미수금 시 출금 버튼 비활성, 세금 문구. guide 콩 환불·유효기간, 미수금·탈퇴 전 출금, 저작권 수령인(전화·주소)·임시조치 안내, 세금 문구, 소개서 PDF 재생성. 덤프 정리 스크립트 `crefans_front/infra/platform/backup-retention.py`(운영 계획 실행: 21개 142MB 모두 7일 이내 → 삭제 0). 런북 백업 리전 서울. 약관 초안 13~18번·법령 원문 확인 절.
- 법령 원문(첨부 다운로드·추출, 2026-10-30): 표준약관 제3조제4항 7일/불리 30일, 소분기준 별표Ⅱ에 충전 캐시 환급 공제 근거 없음(10%는 구독 해지), 신유형 상품권 표준약관 제5·7·8조(90/95%·5년), 시행령 별표(유료 판매 주목적 제외 가능), 통신판매업 면제 50회 미만·간이과세자.
- 검증(2026-10-30 KST): server 관련 10파일 전부 통과(admin-totp 3·beans 30·pilot-followups 4·openapi 11·admin-operators 7·admin-console 12·auth-hardening 4·moderation 7·finance 9·beta-policy 11·jobs 2), 대조 TOTP 3종·미수금/탈퇴/파기 3종 실패 확인. front check 419/419(탈퇴 창 대조), e2e 15/15. admin npm test 11/11, e2e 25/25(에이전트 대조 8종). 문서검사 PASS, 가이드 격리 빌드·check 통과.
- 배포: API/worker/admin/front(마이그레이션 admin_totp 적용, DB·proxy 보존), 가이드 정적(44파일 SHA 일치). 운영 확인: health 200, 콘솔 로그인 200, 비로그인 TOTP 등록 401. 이미지 정리 각 3개.
- 커밋: front 8·server 8·admin 3 커밋(파일 단위 목적별), 가이드 `git init`(main) 첫 커밋. 현재 브랜치 이름(feat/iphone-input-zoom 등)은 내용과 다름 — 정리 미결. 푸시 안 함. 커밋 제외: front 루트 스크린샷·prod.json·output/pdf(QA 산출물).
- 미확인·남은 일: 실제 인증 앱으로 운영 콘솔 TOTP 등록(사용자 직접, 7일 유예), 실제 토스 부분취소·메일 발송, 덤프 정리의 정기 실행(다음 묶음), 원천징수 세무 확정.

## 2026-10-30 콩 환불 동결 핫픽스 (운영 배포: refund-hotfix-20261030, 미커밋)
- 원인(오후 night-work 1순위, 격리 DB 재현): 우리 부분취소로 토스 상태가 PARTIAL_CANCELED/CANCELED가 되면 `beans.service.ts` applyProvider가 무조건 freezeCharge → 충전 disputed·후원받은 lot 동결·미수금.
- 수정(server `src/platform/beans.service.ts`): 취소액(totalAmount−balanceAmount) ≤ refunded_amount+처리 중 환불액이면 정상, 넘을 때만 동결. 결과 불명 환불 대사(tick `beans-refund`, `reconcileRefund`: PG 기록에 취소가 있으면 완료, 없으면 같은 멱등키 `bean-refund-${id}`로 재요청). 완료·복원은 bean_refunds 행 FOR UPDATE 후 processing 재확인(동시 처리 1회). 같은 requestId 재요청이 failed면 409 BEAN_REFUND_FAILED. 환불은 판매 승인과 분리(`keyEnvironment`). front: `beanRefundOutcome`(lib/crefans/bean-refund.ts)으로 done만 "환불했어요", processing은 "확인하고 있어요", 확정 거절 시 새 requestId. admin Beans.tsx: 처리 중 표시·확정 거절 시 새 requestId.
- 검증(14:52 KST): server platform-beans 28/28(2회), 신규 3테스트(모니터 정상 유지·외부 취소는 동결 / 대사 완료·재요청·동시 2회 1회 반영·거절 후 409 / 판매 승인 off에도 환불). 대조 4종(옛 판정·재확인 제거·판매 승인 의존·failed 재요청) 모두 실패 확인 후 원복. front check 418/418(대조 1종), e2e 14/14. admin npm test 8/8, e2e 21/21(신규 1, 대조 2종).
- 배포(14:5x KST): API/worker/admin/front, 마이그레이션 없음, DB·proxy 보존. 운영 확인: health 200, 비로그인 refund-quote 401, 베타 목업 환불 흐름 정상·오류 0. 이미지 정리 로컬·운영 각 3개.
- 미확인: 실제 토스 부분취소. 이미 동결된 충전 여부는 사용자 결정(2026-10-30 "안해도됨")으로 운영 DB를 조회하지 않음 — 베타 테스트 결제라 환불 사용자가 없다고 판단. 동결 문의가 오면 수동 복구.

## 2026-10-30 오후 night-work 조사 문서 (문서만, 코드 변경 없음)
- 위치: `crefans_front/.local/night-work/2026-10-30-1414.md` (14:14~14:32, 결정 질문 K1~K14).
- 상위: ① 정상 콩 환불 뒤 PG 감시가 충전을 차지백으로 동결(pilot-followups 회귀, 재현) ② 안전성 확보조치 유예 조항 10/31 시행 — 운영자 2차 인증 없음 ③ 콩 환불 processing 대사 없음·프론트/콘솔이 실패를 완료로 안내 ④ 운영 코드 미커밋·가이드 git 없음 ⑤ 운영 IP 요청량 제한 없음 ⑥ 원천징수 의무 가능성 vs 세금 문구.

## 2026-10-30 콩 환불·유효기간 안내·미수금·탈퇴 전 전액 출금 화면 (미커밋, 운영 배포 pilot-followups-20261030)
- 배포(2026-10-30 KST 사용자 "배포"): API/worker/admin/front `pilot-followups-20261030`, 마이그레이션 `20261030200000_pilot_followups` 운영 적용(배포 스크립트가 직전 mysqldump 백업), DB·proxy 컨테이너 보존. 폴더 `crefans_front/.local/pilot-followups-deploy-20261030/`(server 15·admin 4·front 18 파일). 운영 확인: 비로그인 refund-quote·admin receivables 401, health 200, 베타 목업 충전 내역 환불 신청 버튼 10·대화상자, 충전 화면 10%·5년 안내, 콘솔 로그인 안내 문구 없음, 페이지 오류 0. 이미지 정리 로컬·운영 완료. 미확인: 운영 worker의 새 작업(member-notices·bean-expiry·receivables) 실행 결과(운영 DB/로그 읽기는 권한 정책상 하지 않음), 실제 토스 부분취소·메일 발송.
- 지갑 충전 주문: 결제 완료 주문에 "환불 신청"(환불된 수량<주문 수량일 때) → refund-quote 대화상자(환불 콩 수·결제 금액 기준·공제액·환불 예정 금액·원결제수단/카드 3~4영업일 안내) → refund(requestId는 대화상자당 1개 유지) → 스낵바·지갑 재조회. 환불된 주문은 "환불 N콩 · 금액". 지갑 첫 화면에 expiringSoon 한 줄. 충전 화면에 환불·유효기간 4줄(`beanRefundNotes`).
- 스튜디오 수익 현황·출금 신청·콩 후원·출금: 미수금·탈퇴 준비(closingBlockers) 안내, closingBlockers가 빈 배열일 때만 "탈퇴 전 전액 출금"(금액=전액, closing:true). 회원 탈퇴 창에 크리에이터 조건 한 줄(서버 오류 문구는 기존 오류 영역에 표시).
- 목업: `lib/crefans/bean-refund.ts`(서버 beanPolicy D6 규칙 복제, 오래된 충전부터 사용된 것으로 미사용분 계산), useMockBeans 환불·만료·closing, useMockFinance closing 차단 규칙(판매 중 멤버십·남은 구독 기간·미수금, 보류/처리 중 수익 EARNINGS_PENDING), 하늘 페르소나 멤버십 미수금 1건. 기존 버그 수정: 목업 콩 refresh가 매번 새 query 객체를 저장해 /preview/studio/beans에서 무한 갱신·이동 불가였음.
- 검증(13:01~13:03 KST): tsc 0, check 417/417(신규 tests/bean-refund.test.cjs 11), e2e bean-refund-closing 4 + beans 7 + promotion-payout 3 + comment-social 7 = 21 통과(서버 dist 재빌드 없이 임시 설정으로 실행). 대조 4종(공제 0·만료 줄 제거·closing 항상 허용·항상 금지) 각각 실패 후 원복 cmp 일치.
- 미확인/차이: 실제 API·토스 부분취소 연결 화면 미검증, 서버는 콩 출금을 모든 종류의 미수금에 막지만 목업 콩 출금은 미수금을 모름, 목업 회원 탈퇴는 크리에이터 차단 규칙 미반영.

## 2026-10-30 /pilot-work 정책 동기화 (운영 배포: pilot-sync-20261030 + 가이드 pilot-sync-20261030, 미커밋)
- 조사: 읽기 전용 3갈래(콩·정산/세무/약관·댓글/알림). 주의: 조사 지시 오류로 나온 "후원받은 프로모션콩 출금 불가"는 오탐 — 10/26 승인대로 후원받은 프로모션콩은 출금 가능(회사 부담), 운영자 직접 지급분만 불가. 상호 '좋아하는일해야지'도 정상.
- 합의(사용자 클릭): ① 약관·운영정책·처리방침은 한 번에 새 버전 초안만(`crefans_server/docs/terms-draft-20261030.md`, 운영 미반영, 시행 전 개발 표시) ② 세금 문구 = "크레팬스는 정산 금액에서 세금을 떼지 않으며, 소득 신고·납부는 크리에이터 본인이 합니다." ③ 후원받은 콩(일반·프로모션) 보류 = 후원 시점+7일 ④ 댓글·알림 안내 전부 ⑤ 권리침해·불법촬영물·저작권 신고 접수 = 대표 박경호·khpark@crefans.com ⑥ 서버·프론트·콘솔 배포+가이드 반영.
- 반영: server `beanPolicy.tipHoldDays=7`, `beans.service.ts` tip lot release_at=후원+7일(이전엔 충전 lot 상속, 후원 프로모션콩 즉시 출금 가능했음). 세금 문구: front support.ts·creator-payout-policy.ts·ServiceGuidePage.tsx, guide payouts·payout-setup·income-scenarios·service-introduction.mdx, 소개서 HTML+PDF 재생성(13쪽 경계검사). 보류 문구: 스튜디오 출금 안내·가이드·소개서·콘솔 초대 툴팁·platform-api.md·admin README. 댓글·알림: 알림 탭 고정 목록 멤버십·댓글·메시지·새 게시물, 알림 설정 안내, FAQ 4문항, 서비스 안내, 가이드 4문서(게시물·메시지/알림·커뮤니티·고객센터), types·preview-pages 태그 10명.
- 검증(2026-10-30 KST): server platform-beans 22/22(신규 "후원 후 7일" 테스트; 기존 지급 테스트는 7일 경과 헬퍼), 대조(옛 상속 규칙으로 되돌리면 신규 테스트 실패) 확인. front check 406/406, e2e comment-social·comment-edit-delete·beans·promotion-payout 21/21, 알림 탭 대조 실패 확인. admin tsc·invites e2e 3/3. 문서검사 PASS(초안 manifest 등록). 가이드 격리 빌드(Node 22.23.4)·check:guides 0, 결과물에 '원천징수' 없음.
- 배포: API/worker/admin/front pilot-sync-20261030(마이그레이션 없음, DB·proxy 보존), 가이드 정적 102파일(8페이지·PDF·검색색인 변경, 44파일 SHA 일치, 6컨테이너·Caddy 불변, 원복 guide-before-pilot-sync-20261030). 운영 확인: 알림 탭 4종, FAQ 댓글·차단·세금 새 문구(원천징수 없음), 스튜디오 "후원 후 7일 보류", 가이드 payouts 새 문구, health 200. 가이드 capture_before의 이전 릴리스 경로를 bean-wording으로 고친 뒤 실행(첫 시도는 사전검사에서 중단, 변경 없음).
- 미결(약관 초안 시행 전 개발): 콩 환불·유효기간·만료 안내, 지급 후 미수금, 조치 알림·공개 사유, 크리에이터 탈퇴 조건, 메시지·문의·CI 해시 파기, 등급 변경, 통신판매업 신고 후 번호 표시. 지급자 원천징수 의무는 세무사 확인 전 미확정. 댓글 요청량 제한(분당5·시간당60)은 미구현. service-hierarchy.md(사용자 원문 계층도)의 알림 분류는 손대지 않음.

## 2026-10-30 피드·프로필·사진 크게 보기 댓글에 신고·태그 연결 + 댓글 버튼 44px (운영 배포: comment-touch-20261030, 미커밋)
- 원인: 피드 카드가 넘기는 댓글 묶음(`SocialPages.tsx` PostCard inline)에 reportComment·mentionCandidates·basePath가 빠져 상세 화면에만 신고·"@" 목록·태그 링크가 있었음. 묶음과 PostCardModel 타입에 추가.
- 터치 기기(pointer:coarse)에서 답글 달기·수정·삭제·신고 버튼 최소 44×44px(줄이 커짐, 겹치지 않음). PC는 그대로.
- 검증(11:24 KST): check 406/406, e2e comment-social 6 + comment-edit-delete 4. 대조: 묶음 연결 제거→피드 테스트 실패, 44px 규칙 제거→터치 테스트 실패, 원복 확인.
- 배포(11:27 KST): 프론트만 교체, API/admin/DB/proxy 보존. 운영 확인: 상세·피드·프로필 각각 신고 버튼 8·태그 링크 21, 휴대폰 신고 버튼 44.2×44px, health 200(`.local/comment-touch-deploy-20261030/live-touch.png`). 이미지 정리 로컬·운영 완료.

## 2026-10-30 D9 댓글 묶음 + 답글의 답글 — 운영 배포 완료 comment-social-20261030 (미커밋)
- 배포(2026-10-30 10:42 KST): API/worker/admin/front `comment-social-20261030`, 마이그레이션 없음("No pending migrations"), DB·proxy 보존. 폴더 `crefans_front/.local/comment-social-deploy-20261030/`(source-delta: server 6·admin 1·front 10 파일, next-env.d.ts는 e2e 생성물이라 제외). 운영 확인: 비로그인 mention-candidates·reports·admin 댓글 숨김 401, health 200, 베타 /preview/post/morning 태그 링크 21·댓글 신고 버튼 8·답글의 답글 버튼 3·"@하" 태그 후보 4·페이지 오류 0(live-preview.png). 이미지 정리 로컬·운영 각 3개 삭제·오류 0. 실회원 계정 실사용은 미확인.
- 차단: 게시물 작성자가 차단한 회원은 새 댓글·답글 403 COMMENT_BLOCKED, 기존 댓글은 유지.
- 알림(type comment, 목록 분류 '댓글'): 댓글→게시물 작성자, 답글→원 댓글 작성자(스튜디오 답글 포함), 태그→태그된 사람. 1인 1건, 작성자 본인·차단 관계 제외. bootstrap 알림 type은 한글 분류명으로 변환(subscription→멤버십, message→메시지, content→새 게시물, comment→댓글) — 이전엔 영어 값이 칩으로 보였음.
- 멘션: 서버가 본문 "@이름"에서 판별(게시물 작성자 페이지 이름·닉네임 + 보이는 댓글 작성자, 같은 이름 2명 이상·본인 제외, 최대 10). 수정 시 재판별. GET /posts/:id/mention-candidates({name,image}, 열람 기록 없음). 프론트: "@" 입력 시 목록(↑↓·Enter/Tab·Esc, 모바일은 입력창 위), 본문 안 파란 링크(/creator/:id). 팬 화면 칩 목록 대신 본문 표시(스튜디오 칩은 그대로).
- 댓글 신고: POST /reports kind=COMMENT, 댓글 행 "신고" + 사유 대화상자. 콘솔 신고 목록에 댓글 내용, "댓글 숨기고 처리 완료". POST/GET /admin/comments/:id/moderation(숨김 시 목록 제외·댓글 수 감소).
- 결정(D9): 해지 회원 자기 댓글 삭제는 선택 안 됨(현행 유지).
- 검증(2026-10-30 10:25 KST): server tests/platform-comment-social 6/6, moderation 7/7, studio-replies 5/5, beta-policy 11/11, openapi 11/11(158 경로). 대조 5종(차단·작성자 제외·동명 태그·숨김 신고·스튜디오 알림) 모두 실패 확인 후 원복. front check 406/406, e2e comment-social 4 + comment-edit-delete 4, 대조 4종(링크·신고 버튼·모바일 위치·Enter 선택) 실패 확인. admin e2e 7/7(신고 숨김 대조 1종 실패 확인), typecheck·lint·npm test 8/8. docs check PASS.
- 미검증: 실제 iPhone 한글 IME에서의 "@" 목록 동작(Playwright는 IME 조합 미재현), 운영 DB 반영.
- 근거: server `src/platform/service.ts`(addComment·resolveMentions·mentionCandidates·report), `moderation.ts`(moderateComment), `studio.service.ts`(createReply 알림); front `components/crefans/CommentMention.tsx`, `SocialPages.tsx`, `CommentComposer.tsx`; admin `src/components/console/Console.tsx`.

## 2026-10-30 답글의 답글 (comment-social-20261030으로 배포됨, 미커밋)
- 답글마다 "답글 달기" 버튼(삭제된 원댓글 스레드 제외 — API가 INVALID_PARENT). 같은 스레드(원댓글 parentId)에 "@이름 "을 미리 채운 입력창이 답글 목록 아래 열림. 서버 변경 없음, mentions 필드는 쓰지 않음(D9 멘션 본 구현 때 연결).
- 근거: `components/crefans/SocialPages.tsx` CommentItem(replyButton/replyForm), e2e `e2e/comment-edit-delete.spec.ts` 4번째 테스트.
- 검증(09:53 KST): `npm run -s check` 406/406, e2e 4/4. 대조: 답글 버튼 제거·"@이름" 미입력 변형 각각 실패 확인 후 원복. SHA-256 SocialPages.tsx 0564b3ca…, spec 035f7b25…
- night-work D1~D11 사용자 답변은 night-work 문서 "결정 결과" 절에 기록. D5: 통신판매업 신고는 회사, 세금 신고는 크리에이터 각자(플랫폼 원천징수 안 함; 지급자 의무 여부는 세무사 확인 전 미확정).

## 2026-10-30 night-work 조사 문서 (문서만, 코드 변경 없음)
- 위치: `crefans_front/.local/night-work/2026-10-30-0714.md` (07:14~07:48, 주제 39, 결정 질문 D1~D11).
- 상위: 서버 밖 DB 백업 없음 / 멤버십 PG 입금 대사 화면 없음(공개 후 수익이 출금 가능으로 안 넘어감) / 불법촬영물·권리침해·저작권 수령인 절차 없음 / 지급 후 환불 회수 장치 없음·후원 콩이 충전일 보류 승계 / 원천징수·통신판매업 미비 / 콩 실판매 전 약관·고지·환불·잔액 집계 필요 / 운영자 2차 인증·내부 관리계획 없음 / 크리에이터 탈퇴·파기 범위 / 댓글 차단·신고·열람기록·알림 / 옛 화면 경로 노출.

## 2026-10-30 팬 답글 달기 (댓글 아래 인라인 입력, 운영 배포: reply-20261030, 미커밋)
- 운영 배포(프론트만, 2026-10-30 07:1x KST): FRONTEND_IMAGE만 교체, API·콘솔·DB 유지. beta /preview/post/morning에서 답글 달기 9개(삭제 자리표시 제외)·입력창 열림 확인. 이미지 정리 로컬·운영 오류 0. 근거 `.local/reply-deploy-20261030/`. 실회원 계정으로 답글 등록은 직접 확인하지 않았다.
- 요청: 특정 댓글에 답글을 달 수 있게, 입력은 1번안(그 댓글 바로 아래 입력창). 서버는 이미 `parentId`(최상위·삭제/숨김 아닌 댓글만, 2뎁스)를 받으므로 변경 없음.
- `SocialPages.tsx`: 살아 있는 최상위 댓글의 시간 줄에 "답글 달기"(삭제 자리표시·답글·readOnly에는 없음). 누르면 아래에 textarea(1000자, 자동 포커스, "○○님에게 답글")+취소/등록. 등록 성공 시 입력 닫고 그 댓글의 답글을 다시 불러와 펼친다.
- `addComment(postId, body, parentId?)`: 실모델은 `{body,parentId}` POST 후 목록 재조회(답글 수 갱신). 목업은 부모 아래에 추가·replyCount·댓글 수 +1, 삭제된 부모는 INVALID_PARENT. 목업 loadReplies가 직전 렌더의 답글을 읽던 문제를 ref로 고침(답글 등록·수정·삭제 직후 목록이 바로 맞음).
- 검증: `npm run -s check` 406/406, crefans-social 33, service-access-state 4, e2e comment-edit-delete chromium 3/3(상세·피드 답글 흐름 추가). 대조: readOnly 답글 허용·UI parentId 누락·실모델 parentId 누락·목업 삭제 부모 허용 → 단위 실패, 목업 옛 답글 읽기 → e2e 실패. 삭제 부모 가드 제거는 실패하지 않음(자리표시 행은 시간 줄을 그리지 않아 이중 방어). docs check PASS.

## 2026-10-30 댓글 수정·삭제·수정됨·삭제된 댓글 표시 (운영 배포: comment-edit-20261030, 미커밋)
- 운영 배포(2026-10-30 06:55 KST, comment-edit-20261030): API·worker·콘솔·프론트 교체, 마이그레이션 20261030140000_comment_edited 적용(로그 확인), DB 백업 /opt/crefans-backup-comment-edit-20261030. 확인: 로그인 없는 댓글 DELETE 401, beta /preview/post/morning에서 이탤릭 삭제 표시·수정됨·수정/삭제 버튼, 콘솔 CSS에 새 스낵바. 이미지 정리 로컬·운영 각 3개 삭제·오류 0. 근거 front `.local/comment-edit-deploy-20261030/`. 실회원 계정으로 댓글 수정·삭제는 아직 직접 확인하지 않았다. 폰트 되돌리기 스크립트(rollback-font.sh)는 이전 콘솔(스낵바·로딩 규칙 이전)로 돌아간다.
- 요청: 피드·갤러리 오버레이·프로필·상세 어디서든 내 댓글을 수정·삭제할 수 없었고, "수정됨"과 이탤릭 "삭제된 댓글입니다."가 목업에 없었다.
- `SocialPages.tsx` CommentRow: 내 댓글·답글(`own`)이고 readOnly가 아니면 시간 뒤에 수정·삭제 텍스트 버튼. 수정은 같은 자리 textarea(1000자)+취소/저장, 삭제는 확인 Dialog. `edited`면 "· 수정됨", `deleted`면 작성자 없이 이탤릭 "삭제된 댓글입니다."(답글 토글 유지). 답글을 바꾸면 그 답글 목록을 다시 불러온다. 피드 카드·오버레이용 inline 모델에도 edit/delete를 넘긴다(빠뜨리면 피드·오버레이·프로필에서 버튼이 사라짐 — e2e로 대조 확인).
- 실모델 `useServiceModel`: PUT/DELETE `/posts/:id/comments/:commentId` 후 댓글 목록 재조회, 삭제 성공 시에만 게시물 댓글 수 -1. 목업 `useMockSocial`: 답글을 상태로 옮기고 같은 규칙(본인만, 답글 남은 부모는 자리표시, 답글 0개가 된 자리표시는 제거). 목업 데이터에 내 댓글(팬지민)·수정됨·삭제된 부모를 넣었다.
- 검증: `npm run -s check` 404/404, `tests/crefans-social` 31(신규 2), `tests/service-access-state` 4(신규 1), e2e `comment-edit-delete.spec.ts` chromium 2/2(상세 수정·삭제 흐름, 피드·오버레이·프로필 표시). 대조 8건 모두 실패 확인: own 조건 제거, 자리표시 제거, 수정됨 제거, 목업 작성자 검사 제거, 목업 자리표시 제거, 실패한 삭제에도 수 감소, PUT→POST, inline 모델에서 edit/delete 누락. docs:contracts/record/check PASS(routes 155).
- 남은 것: 서버(마이그레이션 20261030140000_comment_edited)와 함께 배포 승인 대기. 실서비스 화면 수동 확인은 배포 후. 같은 작업 트리에 /ux-spinner 변경(콩 내역·스튜디오 리포트)도 미커밋으로 있다.

## 2026-10-30 로그인 필요 화면 모바일 좌우 여백을 홈과 같게 (운영 배포: signin-gutter-20261030)

- 사용자 제보(스크린샷): 로그인이 필요해요 화면의 좌우 여백이 홈의 약 2배. 원인 `account.module.css` `.signInPrompt{padding:48px 16px}`가 본문 여백 16px 위에 16px를 더함. 모바일(767px 이하)에서 padding-inline:0.
- 검증: 신규 `e2e/signin-prompt-gutter.spec.ts`(390px에서 푸터 링크 줄 좌우 16px) 통과, 대조(16px 복원 시 실패), 390px 캡처 확인, front check 401/401.
- 배포: 프론트만, 기준 like-hover 소스에 CSS 1파일. 운영 CSS에 규칙 반영 확인. 증거 `.local/signin-gutter-deploy-20261030/`.

## 2026-10-30 게시물 카드 좋아요 후 분홍 배경 제거 (운영 배포: like-hover-20261030)

- 사용자 제보(스크린샷): 좋아요를 누르면 하트 주변이 분홍 상자로 남음. 원인 `social.module.css` `.postActions button.liked:not(:disabled):hover{background:dangerSoft}` — 터치 기기는 탭 후 :hover가 유지됨. 배경 제거(빨간 색만 유지, 후원·댓글 버튼과 동일하게 배경 없음).
- 검증: 신규 `e2e/post-like-hover.spec.ts`(390px 피드에서 좋아요 탭+hover 후 배경 투명) 통과, 대조(옛 규칙이면 rgb(254,242,242)로 실패). front check 401/401.
- 배포: 프론트만, 기준 profile-chips 소스에 이 CSS 1파일만 덮음. .env FRONTEND_IMAGE만 변경. 운영 CSS에서 해당 규칙이 배경 없이 적용된 것 확인. 증거 `.local/like-hover-deploy-20261030/`.

## 2026-10-30 칩 줄 화면 끝까지·프로필 지갑/설정 칩·목록 제목 숫자·목업 뱃지 (운영 배포: profile-chips-20261030)

- 배포 완료(사용자 "배포해"): 프론트만 `crefans-front:profile-chips-20261030`, 기준 signup-prep 소스에 12파일만 덮음(next-env.d.ts·테스트 제외). .env FRONTEND_IMAGE만 변경, API·admin·DB 유지. 운영 응답 200, 이미지 안 번들에 뱃지 설명·칩 줄 CSS 포함. 증거 `.local/profile-chips-deploy-20261030/`.
- 프로필 뱃지 툴팁(사용자 요청): `CreatorName`의 `explain`(프로필 헤더에서만)으로 뱃지를 누르면 공용 `InfoTooltip`이 짧은 뜻 표시("인증 크리에이터: 운영자가 확인한 크리에이터예요.", "원년멤버: 크레팬스 오픈베타 원년멤버 기념 배지예요."). `InfoTooltip`에 `trigger`(뱃지 그림) 추가, 다시 누르기·바깥·Esc로 닫힘. 다른 목록의 이름 뱃지는 링크 안이라 그대로 그림. 테스트 creator-verification 5/5, 390px 캡처 확인.
- 발견·수정한 버그: 지갑 칩의 '한 번 불러오기'가 목업 모델(렌더마다 새 refresh)에서 무한 반복 → 화면 초기화가 끝나지 않아 main이 계속 inert(아무것도 누를 수 없음). 마운트당 1회(ref)로 수정, 재렌더 시 재요청 없음 테스트 추가(대조: 옛 코드면 실패). 배포 전 발견.
- 최종: front check 401/401, chip-row-bleed e2e 통과.

- 충전 주문·콩 이동내역·보낸 후원(공통 HistoryFilters) 기간 칩 줄: `beans.module.css`의 `.historyFilters .historyPeriods{margin:0;padding:0}`가 ChipRow 모바일 좌우 확장(-16px/16px)을 지워 16~374px에 갇혔음 → margin-block/padding-block만 0. 신규 `e2e/chip-row-bleed.spec.ts`(390px에서 설정·세 화면 칩 줄 0~390) 통과, 대조(옛 CSS면 16~374로 실패).
- 프로필 상단 '내 지갑'·'설정' 링크를 카테고리 칩 모양으로: 새 `components/ui/ChipLink.tsx`(Chip과 같은 클래스의 Link, Primitives에 next/link 의존을 넣지 않으려 분리). 지갑은 "내 지갑(1,000콩)"(사용 가능 콩 = spendableBeans, 없으면 충전·프로모션 합), 로그인 시 지갑을 한 번 불러옴. `creator.module.css` `.coverChip`으로 표지 위 크기·모서리 복원. 테스트: account 18/18(잔액 표시·1회 로드·두 링크가 ChipLink).
- 팔로워·팔로잉 목록 제목 숫자 `<small>`이 브라우저 기본(작게)이던 것 → `.pageTitle h1 small{font-size:inherit}`(24px=제목과 동일, 캡처 확인).
- 목업 팔로워 56명에 뱃지 다양화(`components/preview/service/fixtures.ts`): 인증 8·원년 14·둘 다 6·없음 28.
- 검증: front check 400/400, 390px 캡처(프로필 칩 40px·999px 둥근 모양, 목록 제목 숫자 24px, 뱃지 섞임).

## 2026-10-30 모바일 갤러리 오버레이 시작 단계 = 미디어 작게 보기 (운영 배포: signup-prep-20261030)

- 사용자 요청: 모바일 갤러리 오버레이의 하단 상세 패널을 처음 열 때 '미디어 작게 보기'(상세 전체 보기 바로 아래 단계, panelStops[1]=0.22)로. `SocialPages.tsx` PostOverlay 초기값 1, 열릴 때마다 1로 재설정. 단계 순서·드래그·키보드·PC 동작은 그대로.
- 검증: social 29/29(시작 단계 1 단언 추가, 기존 3개 테스트의 시작 가정 조정), 대조: 초기값 0으로 되돌리면 실패, 복구 후 통과. front check 400/400. 실기기·브라우저 캡처 미확인.

## 2026-10-30 가입 전 개발 2~4(미검수 목록·신고 사유·탈퇴 후 파기) + 멤버십 콩 환산 철회 (운영 배포)

- 배포 완료(사용자 "배포", 2026-10-30): `signup-prep-20261030` API·worker·admin·front. DB 백업 후 migration 4개(report_privacy_reason, post_review, member_purge, backfill_withdrawn) 적용. 운영 확인: 6컨테이너, 처리방침 2026-10-30.1·30일 파기 문구(beta·crefans.com), 프론트 빌드 '콩 상당' 0건·'개인정보 노출' 포함, 검수 API 비인증 차단. 폰트만 되돌리기 `sudo bash /opt/crefans-backup-signup-prep-20261030/rollback-font.sh`(대기 crefans-admin:signup-prep-plex-20261030). 기존 탈퇴자 30일 파기 기산일 = 이번 배포 시각. 증거 front `.local/signup-prep-deploy-20261030/`.

- 미검수 목록(사용자 선택: 바로 공개+사후 숨김): migration `20261030090000_post_review` postings.reviewed_at/reviewed_by·인덱스. `POST /admin/posts/:id/review`(content.update), `GET /admin/posts?review=pending`(공개·미삭제·미숨김·미검수). 작성자 저장 시 reviewed_at 초기화(`studio.service.ts`), 숨김도 검수로 기록. 콘솔 콘텐츠 '검수 상태' 필터·'검수 완료' 버튼. 기존 게시물은 모두 미검수로 시작.
- 신고 사유(사용자 선택: 기본 6개): migration `20261029190000_report_privacy_reason`(enum PRIVACY 추가). `POST /reports` reason 검증(INAPPROPRIATE·COPYRIGHT·SPAM·HARASSMENT·PRIVACY·OTHER, 생략 시 OTHER, 잘못된 값 400). 프론트 신고 창 라디오 6개(선택 전 신고 버튼 비활성, `lib/crefans/report-reasons.ts`), 콘솔 신고 목록 한글 사유.
- 탈퇴 후 파기(사용자 선택: 게시물 삭제·댓글 익명화·30일 유예): migration `20261030100000_member_purge` members.withdrawn_at/purged_at. 탈퇴 시 withdrawn_at 기록·결제 카드 빌링키 즉시 해지 대상(기존 retryBilling). 잡 `member-purge`(`member-purge.ts`, 50건씩): 30일 경과 시 게시물 삭제, 회원 이메일·실명·닉네임('탈퇴한 사용자')·전화·사진·비밀번호·본인확인 해시·로그인 ID 제거, 크리에이터 프로필·핸들, 사용자 소개, 정산 계좌번호·예금주, 출금 PIN, 본인확인 실명, 가입 인증 기록 정리, 감사 로그. 댓글은 원문 유지·표시 익명화(기존). 주문·구독·출금·동의 기록은 회원 ID로 보존. 미디어 원본 삭제는 기존 MEDIA_DELETE 설정 따름(미연결). 이 기능 이전 탈퇴자(withdrawn_at 없음)는 자동 파기 대상 아님 — 처리 방법 결정 필요.
- 처리방침 7조를 실제 파기 절차로 갱신(30일 유예·파기 항목·게시물 삭제·댓글 익명 표시·첨부 원본 삭제 시점 별도), 문서 버전 2026-10-30.1. blocker '탈퇴·보유기간·실제 파기 절차 보완'은 사업자 확인 전까지 유지.
- 사용자 지시로 '미구독 게시물 콩 참고 환산'(bean-notice-20261029로 운영 배포됨) 철회: PostMembershipNotice·membership-plans·bean-pricing·테스트를 커밋 상태(환산 이전)로 복원, CSS lockedMembershipPrice 제거, 전 저장소 '콩 상당/참고 환산' 0건. 대신 게시물 머리 둘째 줄에 `시각 · 멤버십 전용 · 월 ₩가격`(볼 수 있는 판매 중 최저가, 여러 개면 '부터'). AGENTS에 콩 환산 금지 규칙 추가.
- 검증: server `platform-moderation` 6/6(검수 큐·작성자 수정 복귀·숨김=검수, 신고 사유, 30일 유예·파기 항목·댓글 익명 표시·1회 실행), 대조(수정 시 미검수 복귀 제거·유예 0일 각각 실패), legal 9/9, openapi 11/11(153경로), auth·admin-console·beans·security·signup-invites·studio-replies·finance·billing·payment-lifecycle 통과. admin typecheck·lint 오류 0·e2e moderation 4/4+control-heights 2/2. front check 399+social 29(머리줄 가격 신규).

## 2026-10-29 관리자 게시물 숨김·회원 이용 제한 (가입 전 개발 1/4, 운영 배포)

- 배포 완료(사용자 "지금 배포"): `moderation-20261029` API·worker·admin·front, DB 백업 후 migration `20261029180000_moderation` 적용. 첫 빌드에서 콘솔 린트(no-explicit-any) 실패 → 타입 지정 후 콘솔만 재빌드. 서버는 빌드 시점 사본 기준(이후 작업본의 신고 사유 변경은 제외). 운영 확인: 6컨테이너 정상, 조치 API 비로그인 401, 콘솔 번들에 운영 조치·이용 제한·조치 사유·애플 고딕 포함, 피드 200. 폰트만 되돌리기: `sudo bash /opt/crefans-backup-moderation-20261029/rollback-font.sh`(대기 이미지 crefans-admin:moderation-plex-20261029 보존). 증거 front `.local/moderation-deploy-20261029/`.

- 약관 8조가 약속한 "게시물 비공개·계정 제한"이 없던 문제(가입 미시행 점검) 해결. migration `20261029180000_moderation`: postings.hidden_at/hidden_reason/hidden_by, members.suspended_at/suspended_until/suspension_reason, append-only `moderation_actions`(대상·조치·사유·기간·처리자·일시).
- 서버 `src/platform/moderation.ts`(API 4개, content.update / members.update, 사유 필수, 감사 로그), `suspension.ts`. 숨김: `service.access()`에서 작성자 외 차단 + 피드·프로필·상세·저장목록 쿼리 `hidden_at:null`, 미디어 제한 대상, 게시물 후원 차단, 스튜디오 목록 `hiddenByOperator`. 제한: 세션 즉시 삭제, 로그인은 비밀번호 일치 후 403 ACCOUNT_SUSPENDED("이용이 제한된 계정입니다(…까지). 문의: khpark@crefans.com"), 토큰 검증·갱신 거부, 기간 지나면 자동 해제. 게시물은 회원 제한과 별개로 숨김.
- 콘솔 `Moderation.tsx`: 콘텐츠 표 '운영 조치'(숨기기/해제·사유·이력), 회원 표 '이용 제한'(7일·30일·무기한·사유·이력). 조회 권한만 있으면 이력만. 권한표 설명 갱신. 프론트 스튜디오 게시물 목록에 '운영 정책에 따라 숨김'.
- 검증: server 신규 `tests/platform-moderation.test.cjs` 3/3, 대조(숨김 검사 제거·제한 검사 제거 각각 1건 실패, 복구 후 통과), 관련 auth 3·auth-hardening 4·admin-console 12·admin-operators 7·beans 21·signup-invites 6·legal 8·openapi 11(152경로)·security 18 통과. `platform.integration`·`platform-access.integration`(별도 서버 필요 fetch failed)·`local-members`(전용 _test DB 필요)는 이 환경에서 실행 불가로 미검증. admin typecheck, e2e moderation 3/3+control-heights 2/2(스크린샷 확인). front check 401/401(신규 숨김 표시 테스트).
- 미결: 신고 처리 화면에서 바로 숨기기 연결(현재 콘텐츠 표에서 별도), 이의제기 접수 경로, 정지 회원의 공개 프로필·게시물 노출 정책(현재 유지).

## 2026-10-29 콩 출금 대상 문구 정리 + 멤버십 예상 수익에 개별 수수료 (운영 배포)

- 배포 완료(사용자 "API·프론트·가이드 모두 배포"): `terms-text-20261029` API·worker·front. 기준 API terms-history·front bean-notice 소스에 server 2·front 7파일만 덮음. .env 이미지 2키·APP_RELEASE만 변경, admin·DB·proxy 유지. 운영 /api/v1/common에서 약관 2026-10-29.3·개별 합의 조항·'2026년 11월까지' 확인(beta·crefans.com). 가이드는 bean-wording-20261029로 별도 배포. 증거 front `.local/terms-text-deploy-20261029/`.

- 사용자 선택: "지급받은 콩"을 "운영자가 지급한 프로모션콩"으로 분명하게(후원받은 프로모션콩과 혼동 방지). 프론트 `creator-payout-policy.ts`·`lib/content/events.ts`(이벤트는 "이벤트로 지급받은 프로모션콩"), 가이드 3문서·소개서 2곳 수정. 옛 표현 전체 검색 0건.
- 사용자 선택: 스튜디오 멤버십 만들기 예상 수익을 개별 수수료로. `membershipRevenuePreview/membershipPriceHint(price,terms)`가 서버와 같은 반올림(결제액×bps/10000 원 미만 버림)으로 계산, `useStudioModel`이 정산 응답의 `creatorTerms`를 관리 모델에 전달. 개별 조건 없으면 기존 20% 그대로.
- 검증: `npm run check` 400/400, `tests/creator-payout-terms.test.cjs` 2/2(0%·15.5%·기본값). 가이드 `check:guides` 통과(소개서 PDF는 배포 시 재생성 필요).

## 2026-10-29 미구독 게시물 콩 참고 환산 안내 운영 배포 + 콩 출금 대상 문구 대조

- 배포(사용자 "운영배포부터 진행"): admin·API는 운영과 저장소가 이미 같아 대상 없음. 프론트만 `crefans-front:bean-notice-20261029`: 운영 invites-terms 소스에 다른 세션의 "미구독 게시물 원화·콩 참고 환산 안내"(로컬 완료) 4파일(PostMembershipNotice, social.module.css, bean-pricing, membership-plans; 3개는 그 검증 기록 해시와 동일, CSS는 이전 푸터 정리 반영본)과 이전 푸터 테스트 1개만 덮음. 배포 전 `npm run check` 399/399, post-membership-offer 8/8. .env FRONTEND_IMAGE만 변경, 6컨테이너 정상, beta·crefans.com feed 200, 이미지 안 번들에 '상당'·lockedMembershipPrice 포함. 증거 `.local/bean-notice-deploy-20261029/`.
- 문구 대조("직접 충전하거나 지급받은 콩은 출금할 수 없으며, 후원받은 일반콩·프로모션콩이 출금 대상"): 서버 코드와 일치. 근거 `bean-policy.ts` withdrawableBuckets=['earned-paid','earned-promotion'], purchasedCashWithdrawal·promotionCashWithdrawal=false, `beans.service.ts` eligible/fundedLots. 단 문구에 없는 조건: 등록 크리에이터만, 실결제(live) 충전에서 온 일반콩은 PG 입금 대사 확인·입금액이 충전액의 80% 이상·충전 7일 보류 경과, 후원받은 프로모션콩은 운영자 지급분을 보낸 팬 본인이 후원한 경우만, 동결 lot 제외, 최소 출금·수수료(회원별 조건), 베타·BANK_PAYOUTS_ENABLED≠true면 실제 은행 지급 불가(BETA_PAYOUT_DISABLED). "지급받은 콩"은 운영자 프로모션 지급을 뜻하나 "후원받은 프로모션콩"과 혼동 가능.
- 미결: 충전 콩의 환불·청약철회 규칙이 서버·가이드 어디에도 없음("출금 불가"와 "환불 불가"는 다름). 법적 판단은 공식 근거 조사 후 사업자 결정 필요.

## 2026-10-29 스튜디오 정산·콩 출금 안내에 크리에이터 개별 조건 표시 (운영 배포)

- 배포 완료(사용자 "배포해", 2026-10-29): `invites-terms-20261029` API·worker·admin·front 한 릴리스. 기준 소스 API/front invite-notice, admin advertising에 변경 파일만 덮음(server 14·admin 5·front 5). DB 백업 후 migration `20261029120000_signup_invites` 적용(운영 29개, 두 테이블 0행). DB·proxy 유지, .env 이미지 3키·runtime APP_RELEASE만 변경. 운영 확인: beta·crefans.com 비초대 가입 코드 403, `/admin/invites` 비로그인 401, 콘솔 /console/invites 200·번들에 초대 화면 포함. 운영 로그인 후 실제 초대 등록·조건 저장은 미확인(운영자 비밀번호 필요). 첫 빌드 시 로컬 Docker 멈춤 → 강제 재시작 후 빌드, 운영 영향 없음. 이미지 보존 3개(로컬·운영 각 3개 삭제). 백업 `/opt/crefans-backup-invites-terms-20261029`, 증거 front `.local/invites-terms-deploy-20261029/`.

- 서버가 콘솔에서 정한 개별 조건(creatorTerms/콩 policy)을 내려주면 정산·출금 기준 문구, 최소 출금 안내, 콩 출금 최소 수량을 그 값으로 표시. 없으면 기존 기본 문구 그대로. `lib/crefans/creator-payout-policy.ts`에 `*For(terms)` 함수 추가, `FinancePages.tsx`·`BeanPages.tsx`·타입 2개 수정.
- 검증: `npm run check` 398 통과 + 신규 `tests/creator-payout-terms.test.cjs` 1/1, docs check PASS. 콩 기본 안내 문구가 "1,000콩(총액 10만 원)" → "1,000콩(총액 100,000원)"으로 표기만 바뀜.
- 미검증·남은 것: 실제 가입 완료까지의 E2E는 약관 미시행(POLICY_NOT_PUBLISHED)이라 불가 — 초대 소진은 함수 단위로 검증. 멤버십 상품 만들기 화면의 가격 안내(`membershipPriceHint`)는 아직 기본 20% 기준. 개별 조건은 크리에이터 약관 6조(기본 20%·7일·10만 원)와 다를 수 있어 별도 개별 합의서가 필요한지 사업자 결정 필요. 커밋·푸시 없음.

## 2026-10-29 가입 "인증 코드 받기" 초대 확인 알림 (운영 배포)
- 배포 완료(사용자 "해", 2026-10-29): API·worker·front `invite-notice-20261029` 한 릴리스. 기준 소스 API privacy-ci(214파일)·front signup-notice(684파일)에 auth.service.ts·signup-policy.ts·AccountPages.tsx 3파일만 덮어씀(매니페스트 차이 3파일만 확인). admin·DB·proxy 유지, .env 이미지 2키·runtime APP_RELEASE만 변경. 운영 확인: beta·crefans.com·www에 비초대 이메일로 `POST /api/v1/auth/signup/email/request` → 403 SIGNUP_INVITE_REQUIRED + 베타 안내 문구(배포 전 503 POLICY_NOT_PUBLISHED). beta /service/signup 브라우저에서 인증 코드 받기 → "가입 안내" 다이얼로그 표시·확인으로 닫힘. 운영 SIGNUP_EMAIL_ALLOWLIST 비어 있어 전원 안내 표시. 이미지 보존 3개 정리(로컬·운영 각 2개 삭제). 증거 front `.local/invite-notice-deploy-20261029/`.

- `components/crefans/AccountPages.tsx` SignupPage: 약관 시행 전(policiesReady=false)에도 이메일 형식이 맞으면 "인증 코드 받기" 활성. 서버가 SIGNUP_INVITE_REQUIRED를 주면 인라인 오류 대신 "가입 안내" 다이얼로그에 서버 문구 표시(확인으로 닫힘). 가입 제출 버튼 비활성 조건은 그대로.
- 검증: `npm run check` 398 통과, 다이얼로그 테스트 추가(대조: 분기 제거 시 실패). 서버 변경은 server PROGRESS 같은 날 항목.

## 2026-10-29 회원가입 화면 베타 안내 영역 미노출 (운영 배포 signup-notice-20261029)

- 사용자 지시: 회원가입 위·아래의 베타 내용 영역 미노출.
- 변경(`components/crefans/AccountPages.tsx` SignupPage): 상단 Notice(서버 `agreements.blockingMessage` "약관은 공개되어 있습니다… 초대 베타 준비를 마친 뒤 회원가입을 시작합니다.")와 하단 Guidance(서버 `guidance.signup` "초대된 이메일로 참여하는 2주 베타입니다…") 렌더 제거. 가입 가능 여부 판정(policiesReady·버튼 비활성)은 그대로라 준비 전에는 여전히 가입이 막힌다(안내 문구만 없음). 서버 응답 문구는 다른 화면용으로 유지.
- 검증: `npm run check` 397 통과, 라이브 가입 테스트에 두 문구 미표시 검사 추가(대조: Guidance 재삽입 시 실패).
- 추가(사용자 지시): 폼 위 안내 "만 19세 이상만 가입할 수 있습니다. 가입 정보의 처리 목적·항목·보유기간은 개인정보 처리 안내에서…" 문단 제거. 처리 안내는 "개인정보 처리방침 확인" 체크박스 옆 화살표로 계속 열림. 만19세 확인 체크박스는 유지. 고아가 된 `.legalLink` CSS 제거. 테스트에 문구 미표시 추가(대조: 재삽입 시 실패), check 397 통과.
- 배포(사용자 "배포"): mobile-footer-ad-20261029 기준에 AccountPages.tsx·account.module.css 2파일만 덮어씀(작업본=기준+내 수정만임을 대조). frontend만 교체, 소스 683 일치. 운영 /service/signup 본문에 세 안내 문구 없음 확인(제목·입력란·동의 체크박스·버튼만). 증거 `.local/signup-notice-deploy-20261029/`.

## 2026-10-29 모바일 하단 사업자 정보·약관 머리말·AD 배지 (운영 배포 mobile-footer-ad-20261029)

- AD 배지(사용자 요청): 공통 `Badge`에 `tone="outline"`(테두리만, borderStrong 테두리·textSecondary 글자, 10px)와 `label`(접근 이름) 추가, 탐색 "주목할 크리에이터" 제목 오른쪽에 `<Badge tone="outline" label="광고">AD</Badge>`. 디자인 시스템 카탈로그에 배지 종류 행 추가. 테스트(대조: 배지 제거 시 실패).
- 배포(사용자 "운영배포"): 다른 세션의 card-charcoal-20261029를 기준으로 11파일 덮어씀. social.module.css는 작업본에 다른 세션 WIP(lockedMembershipPrice)가 있어 운영본에서 feedFooter 4줄만 제거해 반영. frontend만 교체, 소스 683 일치. 운영 확인: crefans.com 모바일 피드 하단·비로그인 /me 하단 사업자 정보 표시, 처리방침 머리말 "시행일 2026년 10월 29일"만, 목업 탐색 HTML에 AD 배지. 실서비스 탐색은 크리에이터 0명이라 해당 영역 미노출. 증거 `.local/mobile-footer-ad-deploy-20261029/`.
- 심사표 7번 Y 기입 → 필수 23항목 모두 채움.
- 추가(사용자 지시 "처리방침은 타이틀과 시행일만, 공개본·버전 등 불필요"): `LegalDocumentBody` 머리말을 "시행일 YYYY년 M월 D일" 하나로 축소(effectiveAt 없으면 최종 수정일 updatedAt 표시). 공개본·공개일·작성·수정일·버전 표시와 notice 안내 박스 제거. 이용약관·운영정책·가입 동의 창에도 같은 구성요소라 동일 적용. 테스트 추가(대조: 버전 표시 재삽입 시 실패). 로컬은 API 없어 화면 미확인.
- 사용자 결정: 심사표 7번(홈페이지 계약주체 일치)을 위해 모바일에서도 로그인 없이 사업자 정보가 보이게 "둘 다" 넣음.
- 변경: 공용 `components/crefans/ServiceFooter.tsx`+`service-footer.module.css`(서비스 링크+BusinessInfo, 768px 이상 숨김; `always`면 PC에서도 링크만 표시). 홈 피드 비어있지 않을 때 FeedEnd 뒤에 추가, 빈 피드의 기존 링크 푸터를 대체(feedFooter CSS 제거). `SignInPrompt`(비로그인 me·설정·메시지 등 보호 화면) 하단에 추가. `ServiceLinks`에 `motionControl` 옵션 — 피드 무입력 규칙 때문에 푸터에서는 텍스트 움직임 토글 제외(설정에 유지).
- 검증: `npm run check` 394 + 신규 2(피드·로그인 안내 푸터) 통과, 대조: 두 푸터 제거 시 2건 실패·복원 시 통과. 로컬 375px 피드 하단 링크9·사업자 정보 표시, 1280px 숨김 확인. 비로그인 실제 화면은 로컬 API 미구동으로 단위 테스트만.

## 2026-10-29 차콜 디지털 명함 및 QR 인쇄 버전

- 요청: 선택09 차콜 명함으로 공개 명함 페이지 갱신·배포, who=khpark QR 버전 제작. 앞면 Apple SD Gothic Neo·khpark@crefans.com, 기존 차콜 뒷면. 이미지 URL 버전 갱신 및 화면/재생제어 차콜 색상 적용. 기존 재생·자동입장 로직 유지.
- 운영 배포 완료: `crefans-front:card-charcoal-20261029`. 운영 소스681파일·양면 에셋SHA 일치, API/worker/admin/DB/proxy5컨테이너 보존. Chromium390/1280·WebKit390에서 차콜 표시/새 이메일/넘침없음/재생 및 자동입장 확인. JavaScript 비활성 운영 앞면 표시·who누락/unknown/중복404 확인. 로컬 dev의 JS비활성은 Loading fallback으로 실패했으나 운영 검사 통과; 이 차이를 기록함. 명함 PNG4해상도·PDF300dpi QR 디코딩 PASS. 증거 `docs/audit/card-charcoal-20261029.json`.
- 운영 legal-email-20261029 소스를 기준으로 명함 관련 4파일만 격리해 빌드. 다른 세션 미배포 변경은 포함하지 않는다. 명함 11개 기존 검사 PASS, amd64 운영 빌드 PASS. 배포 후 검증은 위 결과 및 audit 참고.
- QR 뒷면: 25mm 검정 QR/흰 배경, 4모듈 여백·M 오류정정. PNG 4해상도(1364/1063/708/360px) 및300dpi PDF 렌더 디코딩 PASS. 인쇄 작업92×52mm·재단90×50mm·CMYK·문자 윤곽선. 실제 인쇄물 스캔은 미실행. 맥북 Documents/크레팬스/명함/09-애플고딕-QR버전에 PNG·PDF·원본HTML·ZIP·안내·검증 저장.

## 2026-10-29 목업 약관을 운영 원문으로 + 이메일 변경 운영 배포 (legal-email-20261029)

- 후속(미배포): 사용자 확인 — 실물 명함은 khpark@crefans.com으로 이미 제작됨, 웹 명함 앞면 이미지도 이미 crefans.com. 남은 grade.im은 `components/business-card/BusinessCard.tsx` 이미지 alt뿐이라 수정(business-card 테스트 11 통과). 웹 뒷면 이미지(분홍)는 실물(어두운 회색)과 다름.
- 사용자 요청: 목업(/preview)에서도 운영과 같은 이용약관·개인정보처리방침을 표시, 즉시 배포.
- 변경: `lib/api/legal.ts`(공개 `/api/v1/common`을 쿠키 없이 조회) → `features/preview/legal.ts` 재노출 → `components/preview/service/useMockCommon.ts`가 legal을 그 응답으로 채움. 실패 시 예시 문구로 대체하지 않고 `legalStatus` loading/error로 `LegalPage`에 "불러오는 중…"/"문서를 불러오지 못했어요" 표시. `CommonModel.legal`을 Partial로, `previewLegal` 픽스처는 가입 동의(previewAgreements)에만 사용.
- 검증: `npm run check` 394 통과(레이어 규칙: HTTP는 lib/api). 로컬(API 없음)에서 오류 상태 확인. 운영: /preview/legal/terms·privacy와 /service/legal/privacy 모두 khpark@crefans.com, grade.im 0, 버전 2026-10-29.1.
- 배포: API·worker(server 2파일)+front(7파일) 한 릴리스, 이미지/컨테이너 소스 일치(front 681, api·worker 211), admin·DB·proxy 유지, .env 이미지 2키·runtime APP_RELEASE만 변경. 다른 세션 미배포 front 4파일(PostMembershipNotice 등)은 제외. 이미지 보존 3개 정리(로컬·운영 각 4개 삭제). 증거 `.local/legal-email-deploy-20261029/`.
- 참고: 숨겨진 브라우저 패널에서는 백그라운드 탭이라 화면이 "불러오는 중…"에 멈춘 것처럼 보였음(패널 표시 후 정상).

## 2026-10-29 사이드바·설정 하단 사업자 정보와 약관 링크 (운영 배포 footer-business-20261029)

- 후속 배포 footer-email-20261029: 사용자 지시로 고객지원 이메일을 khpark@crefans.com으로 변경(`lib/content/business.ts`). 약관·처리방침 원문(server legal-documents)은 아직 khpark@grade.im이라 불일치 — 문서 개정은 법률문서 버전이 바뀌므로 별도 결정 필요.
- 후속 배포 guide-link-20261029(사용자 "배포" 지시): PC 사이드바 링크 끝과 설정 '서비스 안내'에 `크레팬스 가이드 ↗`(https://guide.crefans.com/, 새 탭) 추가. `npm run check` 394 통과, 로컬 PC·모바일 확인, 이미지·컨테이너 소스 679 일치, frontend만 교체. 증거 `.local/footer-email-deploy-20261029/`, `.local/guide-link-deploy-20261029/`.
- 사용자 요청: PC 사이드바 하단에 푸터 내용(약관·이벤트·공지 링크 + 사업자 정보), 모바일은 설정 화면 하단에 사업자 정보. 배포 지시 받음. 목적은 KG이니시스 심사표 7번(홈페이지 하단 사업자 정보 = 계약 사업자).
- 변경: `lib/content/business.ts`(공개 약관·처리방침 원문과 같은 상호·대표·사업자등록번호·주소·고객지원), `components/crefans/BusinessInfo.tsx`+`business-info.module.css`, `ServiceLinks`에 이용약관·개인정보처리방침·운영정책 링크, `ServiceShell` 사이드바 하단에 BusinessInfo, `SettingsPage` 맨 아래 BusinessInfo(768px 이상 숨김, 사이드바와 중복 방지). 통신판매업 신고번호는 약관에 "확인 중"이라 표시하지 않음.
- 검증: `npm run check` 394 통과(설정 링크 테스트를 사업자 정보 mailto/tel 제외+존재 검사로 보강). 대조: 설정 하단 제거 시 해당 테스트 실패, 복원 시 통과. 로컬 /preview PC·모바일 육안 확인.
- 배포: event-guide 배포 소스에 8개 파일만 덮어 빌드(manifest 680), 이미지 내부 소스 해시 일치, frontend만 교체(API·worker·admin·DB·proxy 유지, 재시작 0), 컨테이너 소스 679 일치. 6개 도메인 피드 HTML에 사업자등록번호 포함 확인. 운영 www-dev PC 사이드바 링크 8개·사업자 정보 확인. 이미지 보존 3개 정리(로컬·운영 각 1개 삭제). 증거 `.local/footer-business-deploy-20261029/`.
- 한계: 모바일 설정 화면은 로그인 필요라 비로그인 모바일 방문자에게는 사업자 정보가 보이지 않는다(로그인 상태 모바일은 로컬 목업으로만 확인).

## 2026-10-29 KG이니시스 심사용 로고 프롬프트 준비

- 이어서(같은 날): 사용자 요청으로 에이전트가 원본 SVG를 sharp로 렌더해 최종 PNG 2종 생성(`좋아하는일해야지_168x168.png`, `좋아하는일해야지_834x192.png`, 흰 배경 불투명, 크기·alpha·육안 확인). 프롬프트는 참고용으로만 남김.
- 사용자 결정: 로고 PNG 2종은 사용자가 ChatGPT 이미지 생성으로 만들고 크기를 맞춘다. 에이전트는 프롬프트·참고 이미지·저장 위치만 준비.
- `docs/inicis-logo-prompts.md`: 복붙용 프롬프트 2개(정사각 심볼, 가로형 심볼+글자), 규격, 생성 후 확인 절차.
- 참고 PNG(원본 SVG를 sharp로 렌더): `public/brand/inicis/reference/crefans-mark-reference.png`(1024²), `crefans-logo-reference.png`(1470×320). 육안 확인.
- 최종 저장 위치: `public/brand/inicis/좋아하는일해야지_168x168.png`, `좋아하는일해야지_{가로}x192.png`. 저장되면 크기·원본 대비 형태를 검사하고 심사표 14~17번을 채운다.

## 2026-10-29 이벤트4종·서비스소개서 운영 배포 (event-guide-20261029)

- 사용자가 이벤트 분리와 서비스소개서 함께 배포 요청. 프론트 post-coin 운영사본에 이벤트9파일만 덧씌워 고정(677개 중668동일). 원화+콩 참고환산 안내는 이번 범위에서 제외하여 로컬 미배포 유지. 이벤트4개 목록·각상세/전용유의사항·공통문구 반복 및 beta-first→목록 이동을 preview/service에 동일 적용.
- 가이드도 기존운영사본+변경8파일로 고정 후 배포. 팬딩 포함28항목3사 비교·크레팬스 로고열·실제제목·오른쪽위 비움 및13쪽PDF 반영. 가이드 상세 증거는 ../crefans_guide/docs/event-guide-deployment-20261029.json. 운영44정적파일SHA동일·브라우저25조건 통과.
- 프론트 사전 여유공간/Docker/운영상태 기록→amd64빌드0→이미지안소스확인/직접스트림→컨테이너기준고정/설정백업→FRONTEND_IMAGE만 변경. 단위6/6, 로컬·운영Chromium/WebKit375/1280 각각56조건 최종통과·오류0. 운영소스676파일 일치, 나머지5컨테이너ID/Caddy/compose유지, 재시작0. 운영검증은 공개API 읽기이며 DB쓰기/혜택지급/외부발송 없음.
- 초기 브라우저의 동적 제목/이미지/목록 대기 오류는 검사만 보완. 로컬의 빠른 legacy→없는ID 이동 React419는 별도 진단·실패기록 보존, 새탭404와 일반14경로/최종검사는 통과했으나 원인해결로 단정하지 않음. 운영설정 검사기의 오래된Caddy해시는 배포전수집값과 저장소/운영동일 확인 후 기준수정. 제품 재수정 없음.
- 이미지보존계획 사용자보고 후 로컬/운영 각최신3개+사용중 보호, 오래된프론트 security-20261029 각각1개만 비강제삭제·오류0. 임시검증컨테이너2개·가이드4322종료, Docker Desktop종료0. 사용자기존서버/SSH허용유지. 물리iPhone·실공급자/금융/운영로그인 미검증, 기존미커밋보존·커밋/푸시없음.
- 근거 docs/audit/event-guide-deployment-20261029.json, .local/event-guide-deploy-20261029/(source-delta·고정해시·실행로그·검사/실패결과·캡처·정리계획/결과). 필수 docs:record/check:docs는 같은 폴더 docs-checks.json 참조. 동시진행한 KG회신조사는 server PROGRESS 및 기존조사문서 상단에 기록.

## 2026-10-29 가이드 비교표 로고 변경 문서 확인

- 프론트 제품 코드 변경 없음. 가이드 표2개·PDF3쪽 로고 변경에 따른 필수 문서검사 실행. 결과 ../crefans_guide/.local/comparison-logo-20261029/docs-checks.json. 기존 프론트 미배포작업·브랜치 보존, 운영배포 없음.

## 2026-10-29 가이드 비교 제목 변경 문서 확인

- 프론트 제품 코드 변경 없음. 가이드 웹/PDF 비교제목 변경에 따른 docs:record/check:docs 실행 기록은 ../crefans_guide/.local/comparison-heading-20261029/docs-checks.json. 기존 미배포작업·브랜치 보존, 운영배포 없음.

## 2026-10-29 가이드 소개서 전체 제목 정리 문서 확인

- 프론트 제품 코드 변경 없음. 마지막 쪽 제외 가이드 PDF제목 일괄 변경·표지/목차 동기화에 따른 공통 문서검사 실행. 결과 ../crefans_guide/.local/brochure-section-titles-20261029/docs-checks.json. 기존 프론트 미배포 작업 보존, 운영배포 없음.

## 2026-10-29 가이드 소개서 제목 변경 문서 확인

- 프론트 제품 코드 변경 없음. 가이드 PDF2쪽 제목 이동·오른쪽 위 비움 검증 후 공통 규약의 docs:record/check:docs 실행. 결과는 ../crefans_guide/.local/brochure-title-20261029/docs-checks.json. 기존 프론트 미커밋·미배포 작업 보존.

## 2026-10-29 가이드 팬딩 비교 확장에 따른 문서 확인

- 가이드 웹28항목 3사 비교·PDF13쪽 로컬 반영. 본 프론트의 제품 코드 변경 없음. 원화 구독료+콩 참고환산 선택을 사용자가 다시 확인했으며 기존 로컬 구현·미배포 상태 유지. 이벤트4종 분리도 미배포 유지.
- 가이드 검증은 ../crefans_guide/docs/fanding-comparison-verification-20261029.json 참조. 이번 프론트 변경은 이 인계 기록과 docs:record 산출물뿐이며 check:docs는 문서 스냅샷 검증이다. 실행 결과는 가이드 .local/fanding-comparison-20261029/docs-checks.json에 기록. 기존 dirty/브랜치 보존, 커밋·푸시·운영 배포 없음.

## 2026-10-29 미구독 게시물 원화·콩 참고 환산 안내 (로컬 완료·미배포)

- 사용자 선택 확정: 원화 구독료 + 1콩=100원 기준 참고 환산. 공용 PostMembershipNotice와 혜택 모달에 표시. 원화 카드 정기결제·콩 결제 불가를 명시하며 모달에는 충전가110원(VAT포함)과 참고가100원의 차이를 설명한다. 실제 콩 구독·결제 금액 변경 없음.
- 판매 중인 적격 상품을 이름·사진·가격의 동일 기준으로 선택해 종료된 하위 상품명과 다른 가격이 섞이지 않도록 보완. 정확한 상품 전용·판매종료·빈 목록은 대체 구독료를 만들지 않는다. 소수 환산(9,999원→99.99콩 상당)을 실제 구매 수량으로 반올림하지 않음.
- 검증: 관련 단위8/8, 레이어·타입 종료0. 격리소스3013에서 Chromium/WebKit×375/1280의 목업·서비스 대역 24조건 통과, 페이지오류0. 모바일·PC 캡처 검수. 초기 검사 정규식이 9,900을19,900의 부분문자로 잡는 오류는 검사만 수정해 재통과. 증거 docs/audit/membership-notice-price-20261029.json, .local/membership-notice-price-20261029/.
- 운영 배포·실기기·실PG/DB쓰기 없음. 현재 가이드 배포 요청과 별도 프론트 작업으로 유지. 이벤트4종 분리도 여전히 프론트 운영 미배포. 기존 미커밋 보존, 커밋/푸시 없음. 문서 기록·검사 결과는 가이드 비교 작업의 docs-checks.json 참고.


## 2026-10-29 미구독 게시물 멤버십 가격 표시 (단위 확인 대기·코드 미변경)

- 사용자 요청: 미구독 게시물 안내에 멤버십 이름뿐 아니라 필요한 콩 개수도 표시. PostMembershipNotice/getPostMembershipOffer 및 서버 finance.service.createOrder를 조사했다. 현재 멤버십은 plan.price 원화 카드 정기결제이며 콩 구독은 지원하지 않는다. 콩 충전가는 VAT포함110원, 후원/출금 기준가치는100원으로 서로 다르다.
- 사용자에게 선택 질문 제출: 원화 구독료+1콩100원 기준 참고환산액(예:월19,900원·199콩상당), 원화만 표시, 실제 콩 결제 전환. 실제 결제 가능 수량으로 오해할 수 있어 응답 전 금액 표시/결제 로직은 수정하지 않는다.
- 후속: 답변에 맞춰 공용 안내를 수정. 현재 getPostMembershipOffer는 이름은 판매종료 상품을 포함한 최저등급, 이미지/제안은 판매중 첫 상품을 사용하므로 가격 추가 시 상품명과 가격의 대응 확인 필요. 특정상품 전용·등급형·판매종료·빈목록·긴이름·readOnly 검증, 모바일/PC 목업/서비스 공통 적용. 운영 배포는 이번 요청에 없음.
- 근거: `.local/membership-notice-price-20261029/before.json`과 before/ 원본. 읽기 조사/백업만 수행했으며 제품 테스트·배포·커밋·푸시 없음. 기존 이벤트4종 분리 변경은 그대로 로컬 배포 대기. AGENTS의 현재 스택/PROGRESS 우선 규약 유지.

## 2026-10-29 이벤트4종 분리·유의사항 구분 (로컬 완료·운영 미배포)

- 기존 통합 상세의 승인 혜택을 네이버페이1만원 상품권→크리에이터 광고상품30일→팬 프로모션100콩→원년멤버 배지 순의4개 배너/상세로 분리. 경로는 events/beta-feedback, beta-creator-advertising, beta-promotion-beans, beta-founding-badge. preview/service 동일한 EventPages·공개 원문을 사용하며 기존 beta-first 공유 링크는 각 모드의 events 목록으로 연결한다.
- 참여 대상·혜택별1인1회·기간/완료기준 미정·소급불이익 금지·광고동의 구분·부정참여/문의는 공통 원문2개 그룹으로4개 상세에 반복. 상품권 피드백선정/사용/발송개인정보, 광고 노출/성과미보장, 콩 후원/최소1,000콩/20%수수료/실지급8만원/베타 실출금제한, 배지 표시숨김/인증구분은 해당 상세에만 표시. 기존 혜택 금액·대상·지급 조건을 바꾸거나 날짜를 신설하지 않음.
- 각 배너에 기존 개별 이미지를 사용. 순번 CSS 대신 theme 주입으로 광고 하늘색·콩 민트색·배지 라벤더색 유지. 디자인 카탈로그에서4개 상세 선택, 화면 목록·프로모션 출금 E2E의 이벤트 경로·문서 갱신.
- 검증: 기존 코드로 신규/수정 단위검사5실패 확인→최종6/6 통과, 레이어381·타입검사0. 분리소스3013에서 Chromium/WebKit ×375/1280 ×preview/service의 목록·4상세·기존링크·없는ID56/56, 페이지오류0. 모든 상세의 공통/전용 유의사항 원문·노출·메타제목·이미지·우측정렬·가로넘침·왕복이동 확인, 모바일/PC 캡처 육안 검수. 제품/검사9파일 검증사본 SHA 일치.
- 실제 서비스 bootstrap은 브라우저 대역으로 로그인·운영DB 쓰기·금융/혜택지급 없음. 물리iPhone·전체금융 E2E·운영배포 미실행. 명시적인 배포 요청은 이번에 없어 로컬까지 완료. 기존 미커밋 및 동시 이니시스 문서 변경 보존, 커밋/푸시 없음.
- 근거: `docs/audit/event-split-20261029.json`, `.local/event-split-20261029/`(원본·변경diff·실패대조·명령로그·브라우저56건·캡처). 문서계약/기록/검사와 검증서버 종료 결과는 증거 JSON 참조.

## 2026-10-29 게시물 후원 동전 누락 보완 (운영: post-coin-20261029)

- 사용자가 게시물 카드의 동전 누락 점검·배포를 요청. 공용 TipButton이 본인·읽기 전용·Context 없음에서 통째로 숨던 원인을 확인했다. 본인 게시물·스튜디오 미리보기·디자인 카탈로그에는 기존24px 노란 동전+후원 수를 비상호작용 span으로 표시. 일반 팬은 기존 후원 모달 버튼, 자기후원/게시물 후원 OFF/전체 기능 OFF 차단은 유지. 스튜디오 미리보기의 기존 supporterCount도 보존한다.
- SocialPages 공용 PostActions→피드/프로필피드/상세/갤러리를 조사하고 저장·좋아요 썸네일에서 진입한 상세도 확인. 쓰이지 않는 ui/Content PostCard·프로필 콩 버튼·스튜디오 금융 메뉴는 대상이 아니다. 후원 실행/API/금융 정책은 수정하지 않았다. 제품3파일(BeanPages,beans.module.css,studio/ContentPostPreview), 테스트2파일만 event-priority 운영 사본에 반영했다.
- 검증: 기존 코드 누락 회귀2실패 재현, 최종 합친 배포본 레이어381·타입·관련45/45 통과, amd64 빌드0. Chromium/WebKit ×375/1280 로컬64·운영64 상태 통과, 페이지 오류0. 서비스 회원/자기후원/기능 OFF는 브라우저 API대역이며 실제 금융/운영 DB 쓰기 없음. 공개 HTTP8·동전 에셋 해시·운영 소스676파일 일치. 모바일 본인 상세/스튜디오 동전 캡처 확인. 물리 iPhone 미검증.
- 최초 브라우저 검사의 피드 첫 작성자 가정·체크박스 접근성 이름·썸네일 목록을 카드로 가정·갤러리 등장 중 크기 측정은 검사 수정 후 통과했으며 실패 로그 보존. 독립 읽기 검토에서 기능 OFF 예외를 제거하도록 제안받아 반영 후 재빌드했다. 초기 빌드/검사도 보존.
- .env/runtime.env 백업 후 FRONTEND_IMAGE만 교체, API/worker/콘솔/DB/proxy·Caddy·compose 그대로. 백업 `/opt/crefans-backup-post-coin-20261029`. 최신3개 보존 계획 보고 후 로컬/운영 각각 미사용 front advertising 태그1개 일반 삭제. Docker 종료 결과와 문서검사 결과는 아래 증거 폴더에 기록한다. 기존 미커밋 보존·커밋/푸시 없음.
- 근거: `docs/audit/post-coin-deployment-20261029.json`, `.local/post-coin-deploy-20261029/`(source-delta·source-delta.patch·coverage-inventory·local/production-browser·docs-checks). 현재 AGENTS의 스택/규약/PROGRESS 우선 읽기 지침 유지. 다음: 실기기 확인 필요 시 운영 하늘/시온 게시물에서 확인 가능.

## 2026-10-29 KG이니시스 통합인증 문의 초안 (미제출)

- 사용자 요청: 이니시스 초안 작성. 기존 문서를 먼저 비교했다.
  - 기존 `docs/nice-identity-inquiry.md`(NICE 휴대폰 본인확인+계좌 인증, 2026-10-23, 미제출)의 사업자·서비스·베타 규모 표현을 재사용했다.
- 산출물: `docs/inicis-identity-inquiry.md`
  - 비교표, 신청 경로, 복사용 본문(UTF-8 1,846바이트), 제출 전 확인 항목
  - 성인 업종 아님(2026-10-29 사업자 확정)을 명시했다.
  - 본문에 목업(팬 피드·스튜디오)과 가이드(guide.crefans.com) 링크를 추가했다. 세 곳 모두 200 응답을 확인했다.
  - 사용자 요청으로 본문을 다시 썼다. 매뉴얼에 있는 기술 질문은 빼고, "도입 희망, 필요한 확인·준비사항 회신 요청" 취지로 바꿨다. 기술 질문은 회신 후 따로 묻는다.
- 미결정: 가입 연령 19세 기준 재검토 여부, 연간 예상 건수, 처리방침 개정 문구.
- 상태: 사업자 정보는 문서에 적지 않았다. 문의·신청 발송은 하지 않았다.

## 2026-10-29 이벤트 강조·원년멤버 목업 배지 운영 배포 (event-priority-20261029)

- 최신 security-20261029 운영 사본에 이벤트·배지 코드17개, 공식 상품권 크롭1개, 관련 테스트/도우미4개만 반영(22파일). 혜택 제목 우측 정렬·최소18px 여백, 네이버페이1만원권 최상단/진입배너, 원년멤버 배지 최하단. 하늘·지우·팬지민 목업 프로필·게시물·댓글·답글에 기념 배지 표시. 실제 회원 지급/표시 설정·운영 DB 쓰기는 범위 밖이다.
- Node22.23.4, Next15.5.28/React19.1.10은 직전 보안 배포 기준을 유지. 합친 배포 소스에서 레이어381·타입검사·관련 단위34/34 통과(전체385 재실행 아님), amd64 빌드0, 빌드 이미지 브라우저16/16. 최초 테스트 도우미 누락 및 컨테이너 준비 전 접속은 도우미 포함/준비 대기 후 해결, 최초 로그 보존.
- 운영 전송 약659MB 직접 스트리밍, 소스674파일 대조. .env/runtime.env 백업 후 FRONTEND_IMAGE만 교체. API·worker·콘솔·DB·proxy 컨테이너와 Caddy/compose/나머지 설정 유지. 백업 `/opt/crefans-backup-event-priority-20261029`.
- 운영 검증: HTTP10/10·상품권 원본 SHA 일치, Chromium/WebKit ×375/1280 이벤트 목록·상세·프로필·댓글36/36, 페이지 오류0. 제목 정렬/혜택 순서/여백/배너 이미지, 대상3명과 미지급 모카, 목업 새 댓글/답글 배지 확인. 모바일 캡처4장 육안 확인. 실기기/실회원 지급·외부 발송·금융은 미실행.
- 보존 계획 보고 후 로컬·운영 각 최신9개 보존, 미사용 `crefans-front:npay-reward-20261029` 각1개 일반 삭제. Docker Desktop 종료 및 backend/Desktop 프로세스 없음 확인. 상태 명령의 종료앱 오류는 프로세스 검사로 확인했다. 기존 미커밋 보존, 커밋·푸시 없음.
- 근거: `docs/audit/event-priority-deployment-20261029.json`, `.local/event-priority-deploy-20261029/`. 문서 기록/검사의 명령·종료코드·결과는 해당 폴더 `docs-checks.json` 참고. 앞선 이벤트/크롭 절의 미배포 상태는 이 배포로 해소했다.

## 2026-10-29 보안 점검 항목 보완 (운영 반영: security-20261029)

- 보고서 `docs/security-review-20261029.md` 8절에 항목별 조치·검증을 기록했다. 서버 상세는 `crefans_server/PROGRESS.md`, 증거는 `docs/audit/security-remediation-20261029.json`에 있다.
- 프론트 변경은 AUTH-01 하나다. 설정 > 이메일 변경 요청에 현재 비밀번호 입력을 추가했다(`AccountPages.tsx`, `useServiceModel.ts`, `types/crefans-account.ts`, `e2e/mail.spec.ts`).
- 검증: `npm run check` 385/385, `check:docs` 통과.
- 미검증: 3012 테스트 API가 필요한 mail.spec E2E는 실행하지 않았다. 저장소 내 `next build`도 아직 다시 실행하지 않았다(Next 15 절 참조).
- 운영 배포(사용자 "운영배포 진행"):
  - advertising 운영 사본에 server 21·front 18파일만 반영했다. 다른 세션의 미배포 front 작업 17파일은 제외했다.
  - 조합본은 typecheck를 통과했다. 단위 테스트 실패 3건은 제외한 미배포 기능의 테스트다.
  - 교체: API/worker·front. 유지: 콘솔·DB·proxy 컨테이너.
  - runtime.env 3개 키, API healthcheck, Caddy(validate 후 reload).
  - 운영 확인: HTTP 8화면과 출처 규칙, 컨테이너 소스(front669/api211/worker211) 일치, API healthy, 브라우저 4화면 정상.
  - 이미지 보존: 로컬·운영 각 2개 삭제. Docker 종료.
  - 증거: `docs/audit/security-deployment-20261029.json`, `.local/security-deploy-20261029/`.
- WAF 조회(읽기 전용): beta CloudFront ACL은 규칙 0·기본 허용, 콘솔·가이드·원본은 WAF 경로 밖이다. 규칙 적용은 별도 승인이 필요하다.
- 미검증: 로그인한 운영 흐름(이메일 변경, 콘솔 세션 만료). 감시 적체 사전 조회는 권한 검사에서 거부됐다. 커밋은 하지 않았다.

## 2026-10-29 Next.js 15.5.28·React 19.1.10 업그레이드 (DEP-01, 로컬 완료·미커밋·운영 미배포)

- 버전 고정: next 15.5.28(15.x 최신·GHSA-2464-fhr4-w9xw 등 수정본, Next 15는 Maintenance LTS로 2027-01-31까지 보안 지원), react/react-dom 19.1.10(create-next-app 15.5.28 기본 19.1 계열 최신), @types/react 19.1.17, @types/react-dom 19.1.11, react-test-renderer 19.1.10, antd v5 공식 호환 패치 @ant-design/v5-patch-for-react-19 1.0.3. Node 22.7.0은 next 15 engines(^18.18/^19.8/>=20) 충족. ESLint 설정·의존성이 원래 없어 eslint-config-next는 추가하지 않음. next.config 변경 없음.
- 코드: 동적 params/searchParams Promise화(preview/service 화면·스튜디오 page 4개, card, (main)/[handle] client use(), /api/v1 프록시 route), React 19 타입(RefObject null, useRef 인자), antd 정적 message/Modal용 패치 import(lib/AntdRegistry). React 19에서 `inert=''`가 false로 바뀌어 ServiceShell·StudioShell의 hydration 전/닫힌 메뉴 inert가 사라지는 회귀를 dev 경고로 발견해 `inert:true`로 수정. 테스트 3개(card async, creator-verification act, studio-navigation inert=true) 갱신, 새 단언은 기존 코드에서 3건 실패 대조 확인.
- 검증: `npm run check` 레이어381·typecheck·385/385 통과. 저장소 `.next`/`.next-e2e`는 기존 3010과 다른 세션의 3011 dev 서버가 사용 중이라 저장소 내 최종 `next build`는 동시 쓰기로 `/_not-found` invariant 실패(서버 기동 확인 후 중단). 동일 소스 APFS 복제본(scratchpad)에서 build 0, 같은 조건 Next14 기준선도 build 0. 3012 API가 필요 없는 E2E 12개 spec(Chromium+Pixel7) 15:95통과/10실패, 14 기준선:97/8 — 공통 8건은 업그레이드 전부터 실패, 추가 2건(팔로우 해제 chromium/mobile)은 Next15에서 hydration이 load 이후(~360ms)로 늦어져 inert main 상태에서 즉시 count()하는 spec 타이밍 문제(hydration 대기 시 8/8 통과, spec은 미수정). preview/service 주요 36경로 상태코드·제목·페이지오류 14와 동일, /api/v1 프록시 경로·쿼리·POST 전달 동일, next/image 최적화 200 webp·외부 URL 400.
- audit(--omit=dev): 전 7건(critical2/high4/moderate1) → 후 7건(critical1/high4/moderate2). next 직접 권고는 해소, next는 내장 postcss 8.4.31 경유 moderate만 남음. 잔여: axios·form-data·follow-redirects(axios 직접 의존), postcss·nanoid·source-map-js(next 15.5.28 고정 postcss) — 이번 범위 밖.
- 미검증: 3012 테스트 API 필요 E2E(login·checkout·후원·출금·signup 등 8 spec), 실제 PG/본인확인/운영, antd 정적 메시지 런타임 표시(번들 포함만 확인), Docker 이미지 빌드. 3010 dev 서버는 node_modules 교체 후 15.5.28로 재기동된 상태. AGENTS.md·docs/frontend-architecture.md의 Next14/React18 표기 갱신 필요. 근거: `.local/next15-upgrade-20261029/`. 커밋·브랜치 변경·배포 없음.

## 2026-10-29 이벤트 상품권 우선 배치·목업 원년멤버 배지 (로컬·운영 미배포)

- 공용 이벤트 목록 배너에 공식 초록 네이버페이1만원권 크롭 PNG와 HTML 제목을 넣고 최대3명 선정 조건을 유지. 상세 순서는 상품권→광고상품30일→100콩→원년멤버 배지. 혜택 제목 오른쪽 정렬, 최소18px 안쪽·이미지/텍스트 간격. 기존 지급 조건·유의사항은 유지.
- 공용 CreatorName에 명시적 isFoundingMember 기념 배지를 추가. 기존 보라색 별 에셋 재사용, 파란 인증 배지와 독립. 목업 하늘·지우·팬지민의 프로필/게시물/댓글·답글과 새 팬 댓글에 적용. 실제 회원 지급/DB/부여 API/숨김 설정은 변경하지 않음. 디자인 카탈로그에 인증+기념/팬/미지급/긴 이름 예시 추가.
- 검증: 최초 Node22/Next14 환경 레이어381·typecheck·단위385 통과. 동시 작업의 Next15/React19 갱신 뒤 관련34개 재검증, 별도 소스 사본3013에서 Chromium/WebKit ×375/1280 ×목록·상세(preview/service)·프로필4종·댓글 등록/답글36건 통과·pageerror0. 현재 제품 파일17개와 검증 사본 SHA 일치. 최초 import 순서·모바일 배너 가로넘침은 수정; 개발 캐시 경합·검사 선택자/댓글 페이지네이션 오류는 격리와 검사 수정 후 통과. 실제 iPhone/운영/보상 지급 미검증.
- 증거 `docs/audit/event-priority-badges-20261029.json`, 세부 로그·초기 실패·스크린샷·원본 백업 `.local/event-priority-badges-20261029/`. docs:record와 check:docs는 동시 작업의 신규 server/infra/platform/resilience-runbook.md 미등록·생성 계약 갱신 필요로 각각 exit1. 관련 원인/결과는 docs-checks.json, 작업 문서 자체는 갱신했으며 다른 작업 문서는 덮어쓰지 않음. 격리3013 종료, 기존3010 미변경. 기존/동시 미커밋 변경 보존, 커밋·푸시·배포 없음.

## 2026-10-29 이벤트 네이버페이 상품권 원본 크롭 (로컬 완료·운영 미배포)

- 사용자 첨부 공식 쇼핑 화면의 초록색1만원권을 원본 좌표49,335/211×123으로 정확히 추출. 둥근 모서리 바깥144픽셀만 투명 처리, 보이는 RGB 원본 변경0·흰/옅은 배경0. ImageGen 시안은 글자 비율/거친 가장자리 문제로 미사용. 새 PNG `public/brand/events/beta-first/naverpay-10000-cropped-v2.png`와 공용 `lib/content/events.ts` 경로만 변경하여 preview/service 모두 반영. 이벤트 문구·혜택·레이아웃 유지. 기존검정원본/가이드·PDF는 이번 범위에서 변경하지 않음.
- 검증: 기존 이벤트3/3, Chromium/WebKit ×375/1280×preview/service8/8 통과. 이미지211×123·object-fit contain·투명 모서리·가로넘침/페이지오류0·혜택4개 유지. 이전 흰배경 이미지를 넣은 대조는 옅은픽셀133017개로 거부. 모바일/PC 항목 스크린샷 육안 확인. 기존3010 유지, 분리3011 사용 후 종료.
- 증거 `docs/audit/npay-event-crop-20261029.json`, 상세 `.local/npay-event-crop-20261029/`에 입력원본·크롭 코드·파일SHA·실행명령/시각/종료코드 보존. 프론트 docs:record/check:docs 결과는 docs-checks.json(제품검증과 구분). 기존dirty·현재후속브랜치 유지, 커밋/푸시/운영배포 없음. 다음: 명시적인 배포 요청 시 반영. 물리기기 미검증.

## 2026-10-29 가이드 정적 운영 배포 확인 (프론트 앱 배포 없음)

- guide.crefans.com 소개서 이미지 프레임 수정과 최신 광고상품 안내 반영. 실제 구매·결제 준비 중/목업 예시 구분. 가이드27문서·53화면·1263링크·수익3계산 검사, 운영44파일 해시·브라우저24화면·검색1 통과. 기존4서비스/6컨테이너/Caddy 유지. 프론트 소스·이미지 배포 없음.
- 근거: `../crefans_guide/docs/image-frames-deployment-20261029.json`, `../crefans_guide/.local/deploy-image-frames-20261029/`. 프론트 docs:record/check:docs 결과는 해당 폴더 docs-checks.json에 별도 기록. 기존 미커밋 보존·커밋/푸시 없음.

## 2026-10-29 보안·장애 대응 점검 (광고상품 배포 후, 개선 미적용)

- 인증/권한·금융/미디어·장애복구 AI 검토 3개를 통합하고 운영/AWS 읽기와 격리 검증을 수행. 보고서: `crefans_front/docs/security-review-20261029.md`, 증거: `crefans_front/docs/audit/security-review-20261029.json` 및 프론트 `.local/security-review-20261029/`. 실제 외부 감사/공인 인증 아님.
- P1: 지원 종료 Next14/패치 지연, 이메일 재인증 누락, 비밀번호 회수-로그인 경쟁, PG 조회 제한 오분류/외부 멤버십 취소 대사, 동일EBS 백업 의존, watchdog off/독립 감시 부재. 기타 PIN 콩승인 회수·배치 격리·Origin/비밀번호/세션·로그/미디어복원 보완을 기록. 실제 침해·이중 청구가 발생했다고 단정하지 않음.
- 검증: 서버 빌드0·격리 E2E/대역100통과·1skip·0실패, 신규 메모리 재현/실패 대조 주 담당 재실행0, 관리자43업무경로 권한 및 누락 대조. 운영 GET9/9, 실행소스/28migration 대조, AWS/호스트 설정 읽기. front audit7/server25 package 경고(exit1), admin/guide0(exit0); 도달 가능한 공격 수와 구분. 문서검사 명령·최종 결과는 위 증거 JSON의 documentationValidation 참조.
- 한계: 제품 보안 수정/운영 설정 변경·실제 로그인/외부 발송/금융/운영 공격·부하·복원은 미실행. Toss test, 베타·실은행/광고메일off 유지. 기존 미커밋 변경 보존, 커밋/푸시 없음. 다음: 보고서 P1 수정과 실패경로 회귀, 외부백업/복원·감시, RPO/RTO/보유정책 결정. Docker Desktop 종료 및 backend 없음 확인.

## 2026-10-29 광고상품·공통 UI 운영 배포 (advertising-20261029)

- 사용자 “운영배포후 보안 및 장애 대응 점검” 승인으로 front41·server8·admin7 파일만 직전 운영 소스에 반영. 새 DB 테이블 ad_products 1개, 총28 migration 해시 일치. 광고상품 등록/수정/노출·판매 개별 설정/소프트삭제 API·콘솔, 스튜디오 목록·목업 적용. 공통 하단 스낵바·모바일 갤러리 이미지 탭·포스팅 후원 플랫 동전도 함께 반영. 무관한 PSD/Finder 파일 제외.
- 이전 로컬 검증 소스 해시 일치 확인, amd64 API/콘솔/프론트 순차 빌드 통과. 내부 소스·콘솔 실행 산출물 대조 후 약799MB 직접 스트리밍. 설정/DB 백업→migrate deploy→API/worker→admin→front. DB/proxy 컨테이너와 나머지 환경설정 보존. 백업 /opt/crefans-backup-advertising-20261029.
- 운영검증: 6컨테이너 정상·재시작0, frontend669/API211/worker211 소스 해시 일치, HTTP10건(광고목록 비로그인401 포함). PC Chromium·iPhone WebKit 프론트18/18, 콘솔4/4 통과. 콘솔 및 서비스 쓰기는 브라우저 API대역으로 운영 DB에 저장하지 않음. 최초 콘솔 테스트 도구 중복 로드 실패는 콘솔 저장소 도구로 분리해 해결, 제품 코드 변경 없음.
- 이미지 계획 보고 후 로컬·운영 각각 최신9개 보존, 이전 faq-payout(front)/operators(api/admin)3개씩 일반 삭제. DB/볼륨/강제삭제 없음. Mac Docker Desktop 종료 확인. 기존 dirty 변경 보존, 커밋·푸시 없음.
- **실제 광고 구매·PG·자동 노출·매출 미구현이며 서비스 구매 비활성**. 결제수단·시작/연장 방식 사용자 선택 대기. 운영 비밀번호 로그인·실PG/송금/발송·실기기 미검증. guide 소개서 프레임 별도 미배포 변경은 이번에 포함하지 않음.
- 근거: front docs/audit/advertising-deployment-20261029.json 및 .local/advertising-deploy-20261029/. 후속 보안 점검 결과는 별도 최신 절과 보고서에 기록.

## 2026-10-29 광고상품 화면·목업·실제 상품 조회 (구매 처리 미완료·운영 미배포)

- `/preview/studio/advertising`와 `/service/studio/advertising` 추가. 공용 `AdvertisingPage`가 상품 카드·구매 안내·구매 내역을 렌더링하며 스튜디오 홍보 메뉴에서 진입. 목업은 예시 7/30/90일 상품으로 안내→구매 완료 내역을 로컬 상태에서 체험하고 실제 결제·광고 노출은 하지 않음. 디자인 시스템에서도 같은 표시부의 일반/빈 목록/로딩/오류/구매 비활성 상태를 제공.
- 실제 서비스는 `GET /api/v1/studio/advertising/products`에 연결하고 API 실패를 목업으로 대체하지 않음. **실제 주문 생성·PG 승인·결제 내역·광고 노출기간 적용은 아직 구현하지 않았으며 구매 버튼은 비활성화**. 사용자에게 결제수단(권장: 기존 토스 단건결제)과 시작 방식(권장: 결제 직후 시작, 추가 구매는 기간 연장)을 질문했고 답변 대기. 예시 가격은 운영 가격으로 등록하지 않음.
- 검증: `npm run check` 레이어380·typecheck·382/382 통과. Chromium PC1280/WebKit iPhone390에서 목업 구매·실서비스 API 대역 정상/실패/재시도·카탈로그5상태 6/6 통과. 콘솔4/4 포함 브라우저10/10. 실제 서버/격리 MySQL의 광고상품 HTTP 및 기존 권한/Swagger는23/23 통과. 최초 타입 Chip 속성, 테스트의 Next 알림/스낵바 중복 locator는 수정 후 재검증했으며 브라우저 최초 실패 로그 보존.
- 실제 상품 목록 외 금융·노출 처리, 실PG, 실기기, 운영 검증은 미실행. 기존3010 개발 서버 유지, 검증용3011/3004 종료. 기존 미커밋 보존, 커밋·푸시·배포 없음. 다음: 사용자 두 선택을 받아 구매 주문 스냅샷·서버 결제 검증/중복방지·결과불명 복구·노출기간과 매출 조회를 연결하고 검증. `docs/audit/advertising-20261029.json`, 각 저장소 `.local/advertising-20261029/`에 근거 보존.

## 2026-10-29 완료 안내 공용 하단 스낵바 (로컬 완료·운영 미배포)

- 설정·프로필·고객 문의·구독·결제수단·메시지·게시물 메뉴·공유·스튜디오 콘텐츠/멤버십/댓글/계좌/PIN·콩 출금/주문 재개 등의 일시 안내를 본문 대신 공용 Toast로 표시. 입력 오류·로딩·상시 상태·가입/충전/후원/출금 전용 결과 화면은 유지.
- Toast를 독립 모듈로 추출하고 기존 Primitives 재노출 유지. SnackbarProvider/useSnackbarMessage로 팬·스튜디오·preview/service 공용 상태 관리. 실서비스 API 저장의 refresh가 페이지를 다시 그려도 안내 유지, 같은 메시지 재실행·4초 자동 닫힘·수동 닫기·경로 이동 초기화 지원. 모바일 GNB/safe-area 회피, native dialog 내부 portal+popover로 잘림 없이 닫기 조작 가능.
- 검증: 기존 AccountPages로 신규 회귀 1건 실패 재현 후 복원. 최종 `npm run check` 382/382·레이어375·typecheck 통과. Playwright Chromium/WebKit ×375/1280 ×3시나리오=12/12 통과. 본문 높이 불변·GNB 비중첩·포커스 보존·타이머/닫기·스튜디오·공유 모달·service 성공/실패(API 대역) 검증. WebKit 모바일·Chromium PC 스크린샷 육안 확인.
- 초기 검사의 실제 서비스 완료 안내 소실은 공용 호스트로 보완, 기존 단위검사 모듈 대역/포털 타이밍 문제도 수정 후 재검증. 초기 실패 로그 보존. 격리3011/.next-e2e만 사용했으며 기존3010 유지. 실제 API/DB·금융 실행·외부 발송·실기기·운영 검증은 하지 않음. 운영 콘솔 별도 저장소는 수정하지 않음.
- 증거: `docs/audit/snackbar-20261029.json`, `.local/snackbar-20261029/`. 문서 기록·검사 결과는 해당 폴더 `docs-checks.json` 참고(해시 스냅샷과 제품 테스트 구분). 기존 미커밋 보존, 운영 배포·커밋·푸시 없음. 앞선 갤러리 이미지 탭·후원 동전 에셋과 함께 배포 대기.



## 2026-10-29 모바일 갤러리 이미지 탭 전체 보기 (로컬 완료·운영 미배포)

- 공용 MediaOverlay 이미지 탭 콜백을 PostOverlay의 기존 확대·축소 상태에 연결.767px 이하에서 이미지 탭→상세 패널 숨김·미디어100%, 다시 탭→이전 패널 크기 복원. 기존 우하단 버튼·원본 비율·미디어 인덱스 유지. 한 장짜리 사진도 지원.
- 스와이프/6px 이상 이동/수직 이동/포인터 취소/다중 터치 후 click은 확대하지 않으며, 동영상·PC·프로필 사진 전용 뷰어 유지. 제품 변경은 MediaOverlay.tsx·SocialPages.tsx·social.module.css3개. 목업/서비스 공용.
- 검증: 기존 코드에 신규 회귀2건 실패 재현 후 관련45건 통과. 레이어373·typecheck 통과. Chromium/WebKit×375/1280×3시나리오=12/12통과(혼합 미디어·단일 사진/프로필·service API대역), 터치/스와이프·이전 패널 복원·비디오 DOM 유지 확인. WebKit 안정 화면 확대/복원 육안 확인. 신규 e2e/gallery-image-tap.spec.ts와 mobile 프로젝트 연결.
- 최초3010검사는8통과/4실패: service JS 청크404·ChunkLoadError. 기존서버를 유지한 채 격리3011/.next-e2e로 재실행하여12/12통과. 원본실패로그 보존. 실서비스는 브라우저API대역이며 실제API·DB·물리iPhone·운영검증과 구분. 운영 배포·커밋/푸시 없음.
- 문서 docs:record/check:docs 통과(60문서/137라우트/397로컬대상, snapshot-only). 제품 동작 검증과 구분.
- 증거: docs/audit/gallery-image-tap-20261029.json, .local/gallery-image-tap-20261029/. 기존 미커밋 보존. 다음 배포 대기에는 이3파일과 앞선 후원 동전 아이콘3파일이 있으며, 가이드 소개서 프레임 수정은 guide에 별도로 남아 있음.

## 2026-10-29 게시물 후원 플랫 동전 아이콘 (로컬 완료·운영 미배포)

- 사용자 첨부 카카오 쇼핑의 노란 동전을 참고해 기본 image_gen으로 신규 투명 PNG 생성·평면화 수정(2회). 최종 원본을 public/brand/post-actions/support-coin-flat-v1.png에 그대로 저장. 생성 프롬프트/출처는 docs/design/post-support-icon-v1.generation.json.
- 공용 BeanPages TipButton의 게시물 분기만 NavIcon coin → Next Image24px로 변경, 고정 크기·축소 방지. 피드/프로필피드/상세/갤러리 및 목업·실서비스 공유. 후원 카운트/권한/금융처리·프로필 콩 버튼·스튜디오 coin SVG 유지. 관련 변경 제품 파일3개뿐, 기존미커밋 보존·커밋/푸시 없음.
- 검증: 레이어373파일·타입검사·기존관련35테스트 통과. Chromium/WebKit ×375/1280 ×피드/프로필피드/상세/좋아요·저장/갤러리20상태 통과.24px·클릭높이44px이상·이미지로드/투명도·후원모달열고닫기·인원수/좋아요색상 보존 확인. 최적화된 이미지응답1,881B. 후원최종제출·실서비스API·실기기·운영검증은 미실행.
- 문서 docs:record/check:docs 통과(60문서/137라우트/396로컬대상, snapshot-only). 제품 검증과 구분.
- 증거: docs/audit/post-support-icon-20261029.json, 상세 .local/post-support-icon-20261029/. 다음: 사용자가 배포 지시하면 기존 운영사본에 제품파일3개만 적용해 배포. 서비스 소개서 프레임 수정도 guide에서 별도로 미배포 상태다.

## 2026-10-29 감사 이벤트 네이버페이 상품권으로 변경 (운영 완료: npay-reward-20261029)

- 사용자 요청으로 preview/service 공용 이벤트 원문·유의사항의 배민 1만원 상품권을 네이버페이 1만원 상품권으로 교체. 실제 판매처(기프티쇼 비즈) 1만원권 JPEG 원본 사용. 금액·최대3명·다른혜택/선정기준 유지. 가이드 이벤트·소개서 PDF도 별도 정적 배포 완료.
- 이벤트 테스트3·레이어373·typecheck·amd64 빌드 통과. 로컬12/운영16 브라우저 사례(Chromium/WebKit,375/1440), 공개 소스·빌드657텍스트 파일 구표기0, PDF10쪽 중9쪽만 변경/다른9쪽 픽셀 동일. guide44파일·상품이미지 HTTP SHA 일치. 로컬service는 API미실행으로 완료불가였고 운영service에서 통과. PDF 첫 넘침은 배포 전 수정.
- 직전 studio-input-console 운영 소스 + 이벤트원문/JPG/기존테스트3파일만 포함. .env/runtime.env 백업 후 FRONTEND_IMAGE만 교체, API/worker/admin/DB/proxy 유지. guide 정적 배포/Caddy 변경없음. 최신3개 보존 계획 안내 후 로컬·운영 미사용 bean-notes 이미지 각1개 정리, Docker Desktop 종료.
- 증거: docs/audit/npay-event-deployment-20261029.json, .local/npay-reward-deploy-20261029/, guide docs/npay-event-20261029.md. 공급사 이미지 공개 출처와 별도 이용허락은 구분(허락 취득 주장 안 함). 상품권 실제구매/발송·운영DB 쓰기 없음. apex/www DNS 조회불가, 활성4도메인 확인. 기존dirty변경 보존·커밋/푸시 없음.

## 미배포 개선 3건 운영 반영 (2026-10-29, 완료: studio-input-console-20261029)

- 사용자 “배포해” 승인에 따라 스튜디오 답글 작성자·수정·삭제, 터치 입력 최소16px·수동 확대 허용, 콘솔 마이페이지 맨 아래 로그아웃을 반영. 운영 기준 front faq-payout / API·admin admin-accounts 사본에 front11·server3·admin2 파일만 덮었고 그 외 제품 소스 변경 없음. 이전 절의 미배포 상태는 이번 배포로 해소.
- 검증: front check379/379, server build+답글·OpenAPI·운영자권한23/23, admin check8/8. amd64 3이미지 빌드·소스/레이어/라벨 대조, 콘솔 build-stage 소스59개와 실행 산출물122개 대조. 운영 front658·API/worker각208 소스 해시 일치. HTTP11건(9개200+신규답글 PUT/DELETE 비로그인401), 6컨테이너 정상·재시작0·DB/proxy ID 유지.
- 운영 브라우저: 목업 답글3조건(모카/하늘·모바일/PC) 작성자 사진·이름·인증·등록→수정→삭제·취소·팬 버튼 미노출 확인. 입력13화면×4조건=52조합, 모바일106개16px 이상·가로넘침 없음·PC 글자 유지. 실서비스 로그인/가입4조건도 정상(모바일16px/PC13px). 콘솔 PC/모바일 로그아웃 마지막 요소·24px 간격·1회 요청·로그인 이동 확인(API는 브라우저 대역).
- 운영 절차: capture→변경 파일만 사본 반영→preflight(약49.6GiB)→순차 빌드→소스 검증 후 약798MB 직접 스트리밍→DB/설정 백업→migrate deploy(27개·추가없음)→API/worker→admin→front→운영 검증. 백업 `/opt/crefans-backup-studio-input-console-20261029`. 베타/콩/실판매·송금·광고메일 플래그와 기존 migration 체크섬 유지, 배치 failures={}.
- 정리: 로컬·운영 계획을 먼저 보고하고 최신3개씩(총9개) 보존, messages-back(front)/payout-policy(api)/console-drawer(admin) 3개씩 일반 삭제. 로컬에서 목록에 있지만 태그로 조회하지 못하는 현상을 확인(이미지가 삭제된 것은 아니었음, 원인은 미확정)해 보존 도구에 정확한 ID·단일 태그·동일 저장소 digest·미사용 조건의 fallback 추가. 정상5조건과 사용중 보호 제거 대조 실패 확인. 강제삭제·볼륨삭제 없음. 최종 운영 여유 약34.2GiB. 정리 후 6컨테이너 동일·정상 재확인, 빌드용 Mac Docker Desktop 종료 완료.
- 최초 검사 실패/수정: Docker index ID와 플랫폼 manifest ID 직접 비교 실패는 빌드의 amd64 manifest·운영 tag ID·레이어·소스해시 일치 검사로 수정. React 자동생성 ID의 dev/prod 차이는 글자 비교에서 제외. 팬 프로필 모달의 옛 폭은 애니메이션 중 측정값이라 폭 동일 주장에서 제외하고 글자·넘침은 검증(다른12화면 폭 동일). 최초 실패 원본 보존. 전송 단계 분리 제안은 자동 승인 검토 거절되어 적용하지 않고 기존 ship→archive 필수 호출 유지. 제품 코드 재수정·재배포는 없었음.
- 경계: 실제 iPhone 키보드/핀치·운영 비밀번호 로그인·운영 회원 답글 쓰기는 미실행. 권한/저장 검증은 로컬 격리MySQL, 운영 콘솔 내부는 API대역이며 운영 실계정 종단 검증으로 간주하지 않음. 커밋/푸시 없음, 기존 변경 보존. 다음: 실기기 검수·별도 승인 시 운영 계정 실사용 확인.
- 증거: front `docs/audit/studio-input-console-deployment-20261029.json`, 상세 front `.local/studio-input-console-deploy-20261029/`. 공통 AGENTS 규약 유지, 보존 도구 fallback 경계만 추가. 문서 기록·검사 결과는 해당 폴더 docs-checks.json에 기록.

## 아이폰 입력 자동 확대 대응 (2026-10-28, 운영 미배포)

- 원인: 팬·스튜디오 입력란 14px, 콘솔 입력란 13px. iPhone Safari의 기본 배율에서 16px 미만 입력 글자에 자동 확대가 발생한다. 웹 근거: [Telerik 공식 기술 문서](https://www.telerik.com/products/aspnet-ajax/documentation/knowledge-base/common-disable-autozoom-input-safari-iphone), 확인2026-10-28. 수동 확대 허용 근거: [W3C ACT viewport 규칙](https://www.w3.org/WAI/standards-guidelines/act/rules/b4f0c3/).
- 변경: front `app/globals.css`, admin `src/app/globals.css`에 `(hover:none) and (pointer:coarse)` 입력 최소 `max(16px,1em)` 적용. 컴포넌트 font 재정의보다 우선하게 하여 모달·검색·본문·PIN까지 공통 적용하고, 버튼/체크박스/라디오/파일/범위/색상/숨김 입력 제외. front `app/layout.tsx`의 maximumScale1·userScalablefalse 제거. 팬·목업·서비스·스튜디오·카탈로그는 같은 전역 규칙 사용. 가로 화면도 폭 대신 포인터 조건으로 적용.
- 검증: 변경 전 WebKit 모바일 입력 35개에서 16px 미만 탐지. 변경 후 WebKit390·844가로·1280 PC와 Chromium390에서 13화면/상태×4=52조합, 모바일106개 입력 전부16px 이상·가로 넘침 없음. PC 입력 글자 동일, 너비차1px 미만(모달 모션 측정 오차 최대 약0.2px). 팬 설정/스튜디오 답글/콘솔 정책 확인 모달 포함. 프론트 check379/379, 콘솔 check8/8·타입 검사 통과. 실서비스는 동일 전역 CSS를 사용하나 로그인 화면 별도 동작 검증은 아래 경계로 남김.
- 검증 경계: macOS Playwright의 모바일 WebKit/Chromium 에뮬레이션과 CSS 계산값 검증이다. 실제 iPhone의 네이티브 키보드·핀치 동작은 미검증. 콘솔 정책 화면은 브라우저 안에서만 API 대역을 사용했고 로그인/정책 저장/운영 데이터 변경 없음. 로컬 `/service/login`은 API 대역 주입 후에도 `불러오는 중…` 상태여서 해당 경로의 입력 실측은 미완료(목업 로그인·회원가입의 동일 표시 컴포넌트는 검증). 최종 PC 비교는 모달 애니메이션의 미세한 너비차를 구분하고 글자는 완전 일치·너비1px 미만 기준을 적용했다.
- `feat/iphone-input-zoom` 브랜치, 기존 미커밋 작업 보존. 운영 배포·커밋·푸시 미실행. 다음: 두 프론트 배포 후 실제 iPhone Safari에서 입력·키보드 닫기·가로 화면 확인. 증거 front `docs/audit/iphone-input-zoom-20261028.json`, 상세 측정/스크린샷/재실행 스크립트 front `.local/iphone-input-20261028/`; 콘솔 `.local/iphone-input-20261028/`에는 변경 전 사본과 기준 기록.


## 스튜디오 답글 작성자 표시·수정·삭제 (2026-10-28, 운영 미배포)

- 요청: 댓글 관리에서 내 답글에도 프로필 사진·이름을 표시하고 수정·삭제 제공. 기존 Avatar·CreatorName(긴 이름/인증 배지)·Dialog를 재사용하는 `StudioCommentReply`를 목업·실서비스·디자인 시스템에 연결. 작성자 표시, 수정 초안/실패 유지, 빈값·변경 없는 제출 차단, 삭제 확인·중복 제출 방지. 팬 답글에는 수정·삭제 없음.
- 목업은 선택한 크리에이터의 활동명·사진·인증 여부를 사용(모카 로그인 포함). 서비스는 `CommunityReply.author/fromCreator`와 PUT/DELETE `/studio/comments/:id/replies/:replyId`에 연결. 서버가 게시물 소유자·답글 작성자·부모 관계·삭제 상태를 검증하고 소프트 삭제·댓글 수 1회 변경·감사를 같은 트랜잭션에서 처리. DB 마이그레이션 없음.
- 검증: 프론트 `npm run check` 379/379(타입/레이어 포함), 서버 build 및 답글 HTTP·OpenAPI 16/16. 실제 로컬 격리 MySQL·회원 세션으로 타 계정/부모 불일치/삭제 대상/빈값 거절, 동시 삭제 200·404와 카운트 1회 감소 확인. Chromium 375/1280(모카), WebKit 375(하늘)에서 아바타 로드·등록→수정→삭제·취소 보존·팬 버튼 미노출·가로 넘침 없음·페이지 오류 없음 확인.
- `feat/studio-comment-replies`에서 작업, 기존 미커밋 변경 보존. 운영 배포·커밋·푸시 미실행. 운영 반영 시 프론트와 신규 답글 API를 함께 반영해야 함. 근거·해시·범위: 프론트 `docs/audit/studio-comment-replies-20261028.json`, 각 리포 `.local/studio-replies-20261028/`. 문서 계약·표는 구현과 대조 후 갱신하며 docs:record는 문서 해시 기록일 뿐 제품 테스트 증명이 아님.













## FAQ 최소 출금 금액 불일치 수정 (2026-10-28, 운영 배포 완료: faq-payout-20261028)

- 고객센터 FAQ '크리에이터 수수료와 출금 기준'이 '최소 1만 원'으로 현재 정책(10만 원)과 달랐음. `lib/crefans/support.ts` 답변을 `creatorPayoutPolicy`(수수료·보류일·최소금액·지급요일) 상수로 생성하도록 변경해 재발 방지. 저장소 전체에서 옛 금액 문구는 이 한 곳뿐(서비스 가이드 화면은 이미 10만 원).
- 검증: 새 `tests/support-faq-policy.test.cjs`(정책 값 포함·옛 문구 금지) 통과, 옛 문구로 되돌린 대조 실행에서 실패 확인 후 복원. check 373/373. 로컬·운영 `/preview/support`, `/service/support`에서 '최소 10만 원부터 수요일' 표시·옛 문구 없음. 프론트만 교체(1파일), 보존 단계로 front motion-back 삭제. 증거 `.local/faq-payout-deploy-20261028/`.

## 콩 출금 안내 점 목록·기간 선택 프리셋 (2026-10-28, 운영 배포 완료: bean-notes-20261028)

- 콩 후원·출금 안내 문단을 수익 현황 "정산·출금 기준"과 같은 점 목록 상자로: 공용 `components/crefans/PolicyNotes.tsx`(+`policy-notes.module.css`)로 분리해 두 화면이 사용, 기존 finance `.policy`·beans `.policyText` CSS 제거. 제목은 '콩 출금 기준'. 제목은 전용 클래스라 페이지 `h2` 규칙(beans `.page h2`)에 덮이지 않음.
- 기간 선택기: 단일 달력 선택 칩 배경 accent(아래 절) + 열 때 선택 칩을 칩 줄 가운데로 자동 스크롤(`DateRangePicker` 열림 효과, 페이지 스크롤 없이 칩 줄만).
- 검증: tsc, check 372/372, E2E beans+promotion-payout 10/10, 로컬·운영 측정(375 선택 칩 열자마자 보임 inView=true, 12조합 대비 5.17, 콩5·정산4 항목 점 목록·가로넘침 없음). 운영 프론트만 교체(8파일), 다른 컨테이너 유지. 보존 단계로 front studio-spacing 삭제. 증거 `.local/bean-notes-deploy-20261028/`, `.local/report-preset-20261028/`.

## 리포트 기간 선택 프리셋 글자색 (2026-10-28, 운영 미배포)

- 사용자 보고: 스튜디오 리포트 기간 선택기를 열자마자 선택된 프리셋 글자가 흰색. 원인: 단일 달력(좁은 화면, data-panels=1) 칩 스타일 `.popup[data-panels="1"] .preset{background:surface}`가 선택 상태 배경(accent)을 덮어 흰 글자/흰 배경(대비 1:1). 2달력은 정상.
- 수정: `components/ui/date-range-picker.module.css` 단일 달력 선택 칩에 accent 배경·onAccent 글자 지정(테두리 유지).
- 검증: `.local/report-preset-20261028/measure.cjs` Chromium·WebKit × 375/768/1280 × 라이트/다크 12조합 측정. 수정 전 375 4조합 대비 1.00, 수정 후 전부 5.17(흰 글자/파란 배경). `npm run check` 통과. 참고: 375에서 선택 칩('최근 한달')은 열었을 때 가로 칩 줄의 보이는 범위 밖(오른쪽)에 있음 — 자동 스크롤은 미적용.

## 프로모션 출금 E2E 날짜 의존 해소 (2026-10-28)

- `e2e/promotion-payout.spec.ts`가 쓰는 서버 테스트 런타임(`crefans_server/tests/e2e-server.cjs`)의 출금 처리 시각을 고정 2026-10-28에서 실행 시점 기준 다음 KST 수요일로 변경. 3/3 통과. 원인·근거는 서버 PROGRESS 같은 날짜 절. `beans.spec` 3건도 수정(사용자 승인): 후원 대화상자가 바뀐 현재 흐름(프로필 '후원하기' → '직접 입력 (콩)'·'응원 메시지 (선택)' → 'N콩 후원하기' → '확인하고 후원하기' → 'N콩 후원을 보냈어요' → '보낸 후원 보기')에 맞게 선택자·문구 기대값 갱신, 대화상자 안으로 범위 한정. 제품 코드 변경 없음. `npx playwright test e2e/beans.spec.ts` 7/7(수정 전 4/7), promotion-payout 3/3.

## 텍스트 움직임 스위치 통일·스튜디오 뒤로가기 (2026-10-28, 운영 배포 완료)

- 요청: 팬·스튜디오 PC/모바일의 "텍스트 움직임 끄기" 글자 버튼을 단순한 스위치로 바꾸고 주변 간격 점검, 스튜디오 각 페이지에 팬과 같은 뒤로가기 추가.
- 스위치: `MarqueeMotionControl`은 공용 `Toggle`(role=switch)만 렌더(variant·글자버튼·`.control` CSS 제거). 라벨은 주변 링크와 같은 보통 굵기·보조색. 팬 사이드바 `.sidebarBottom>label`(위8px), 스튜디오 `.sidebarFooter` flex gap12, 랜딩 inline-flex gap16, 모바일 설정 행은 메뉴 행과 같은 54px·5px 패딩. 측정(375/1280): 스위치 높이38(설정54), 위 요소와 간격 8~12px, 가로넘침 없음. 모바일 팬 피드는 원래 사이드바가 없어 설정 화면에서만 노출.
- 뒤로가기: 공용 `BackButton`을 `PageTitle.back`에 배치. 사이드바 최상위 화면(게시물·댓글·멤버십·구독자·통계·콩·수익 현황·정산 계좌·크리에이터 설정)은 대시보드로, 출금 신청·출금 내역은 수익 현황으로. 기존 정산 내역·PIN·리포트·게시물 작성은 유지. 대시보드(스튜디오 첫 화면, 팬 피드처럼 없음)와 메시지(팬과 공용 메신저 2단 레이아웃)는 이번에 넣지 않음.
- 검증: tsc 통과, check 372/372. E2E 전체 108 통과/12 실패. 그중 marquee 2건은 버튼 전제였던 테스트라 스위치 기준으로 갱신 후 marquee 17/17 통과. 나머지 10건(콩 후원 버튼명 "후원하기" 변경 전 기대, 갤러리 닫기 아이콘 36px, 조회수 아이콘, 모바일 댓글 키보드, 프로필 확대2, promotion-payout 날짜 고정)은 운영 기준 대비 이번 변경 13파일과 무관한 영역이며 미해결로 남김.
- 운영 배포 `crefans-front:motion-back-20261028`(직전 `studio-spacing` 소스 사본 + 13파일). 빌드·이미지 소스 대조·deploy.sh 통과, 프론트만 교체·다른 5컨테이너 유지. 운영 PC/모바일에서 스위치 노출·글자버튼 0·뒤로가기 목적지 확인(`prod-verify.json`). 보존 단계로 로컬·운영 `crefans-front:studio-nav-20261028`만 삭제(운영 여유 34.3GB). 증거 `.local/motion-back-deploy-20261028/`, 화면 `.local/motion-switch-20261028/`. commit/push 없음.
- 후속(미배포): 스튜디오 메시지에도 뒤로가기(대시보드). 공용 `MessagesPage`에 선택 `back` 슬롯 추가, 넘기지 않는 팬 메시지는 그대로. `.listTitle` gap12, 아래 검색창과 20~21px, 375/1280 가로넘침 없음(`msg-*.png`). tsc·check 372/372, 메시지 관련 E2E 5파일 30통과/1건너뜀(기존 실패 4파일 제외).
- 운영 배포 `crefans-front:messages-back-20261028`(직전 `motion-back` 사본 + 3파일). 빌드·이미지 소스 대조·deploy.sh 통과, 프론트만 교체. 운영 375/1280에서 스튜디오 메시지 뒤로가기(대시보드)·팬 메시지 무변경·가로넘침 없음 확인. 보존 단계로 로컬·운영 `crefans-front:studio-type-20261028`만 삭제(운영 여유 34.3GB). 증거 `.local/messages-back-deploy-20261028/`. commit/push 없음.

## 스튜디오 전체 간격 감사·수정 (2026-10-28, 운영 배포 완료)

- 사용자 보고: 구독자 필터(모든 멤버십·모든 상태) 아래 요소가 붙음, 전체 간격 조사 후 배포. 감사 스크립트 `.local/spacing-audit2-20261028/audit.cjs`(테두리·배경 상자/버튼/입력 기준 8px 미만 인접, 20화면×375/1280) + 화면 확인으로 설계상 인접(표 머리칸, 구분선 목록 행, 세그먼트 탭, 페이지네이션, 멘션 태그, 메뉴 목록, 프로필 미리보기 겹침)은 제외.
- 실제 문제와 원인: 스튜디오 `.root p{margin-top:0}`가 문단 위 여백을 지움 → 구독자 필터→총 N명 0px, 멤버십 카드→안내 상자 0px, 수익 구성 구분선→계산식 0px, 출금 확인 금액표→안내 0px. 리포트 칩 간격 5~7px(팬 ChipRow 8px).
- 수정: management `.page .count{margin-top:24px}`, `.planGrid{margin-bottom:16px}`; finance `.summaryGrid+.helper{margin-top:13px}`, `.confirm .amountRows{margin-bottom:16px}`; report `.navigation{gap:8px}`.
- 검증: check 372/372, E2E preview·service 54중 52(기존 프로필 확대 2 허용), 로컬 재감사에서 대상 전부 해소·신규 0·문서 폭 정상, 출금 확인 16px. 운영 배포 `studio-spacing-20261028`(3파일), 운영 감사 결과가 로컬 수정 후와 동일, health 200. 보존 단계로 front studio-buttons 1개 삭제(운영·로컬 오류0, 운영 여유36.9GB). 커밋 없음.

## 스튜디오 글자 확대·리포트 칩 통일 (2026-10-28, 운영 배포 완료)

- 사용자 요청: 순수익 리포트 칩이 팬 홈 칩보다 작음(11~12px·39~41px vs 14px·40px), 스튜디오 전체 글자와 정책 안내글을 팬 홈 확대 기준(2026-10-24 모바일 최소14px)처럼 키움.
- 원인: 리포트 칩은 공용 Chip이 아닌 report CSS 링크, 스튜디오는 당시 모바일 차단이라 14px 기준에서 제외되어 10~12px 고정 글자 약130곳 존재, 공용 선택 상자·기간 선택기 필드는 라벨 토큰13px를 max 없이 사용.
- 수정: 스튜디오 루트 `--cf-mobile-font-min` PC13px/≤767px 14px, 스튜디오·beans CSS의 14px 미만 font-size 131곳을 `max(Npx,var(--cf-mobile-font-min,0px))`로 일괄 변환(목록 `.local/studio-type-20261028/converted.json`), select/date-range 필드 font도 max 적용(팬 PC 무변화·팬 모바일14px), 리포트 칩을 Chip 규격으로, 정책 안내 본문14px·제목15px(모바일 축소 규칙 제거), 콩 출금 안내·원화/콩 안내 14px, 리포트 하단 관련 화면 링크 2개를 ActionLink secondary로(누락분). design-system 문서에 스튜디오 기준 추가.
- 검증: check 372/372, E2E preview·service 54중 52(기존 프로필 확대 2 허용), 글자 감사(운영 전 vs 로컬 후, 20화면): 이전 최소 8~13px·기준 미만 최대198개 → 이후 PC 전 화면 최소13px·미만0, 모바일 전 화면 최소14px·미만0, 문서 폭 정상·pageerror0. 리포트 칩 40px·14px.
- 운영 배포 `studio-type-20261028`(운영 사본 studio-nav에 13파일, 656파일 로컬 SHA 일치, FRONTEND_IMAGE만 교체). 운영 글자 감사 20화면×2폭: 기준 미만 0, 최소 PC13/모바일14px, 넘침·pageerror 0, 리포트 칩 40px·14px, health 200. 보존 단계로 front studio-tabs 1개 삭제(운영·로컬, 오류0, 운영 여유36.9GB). 커밋 없음.

## 콩·출금 간격, 영역 이동 링크 버튼화 (2026-10-28, 운영 배포 완료)

- 사용자 요청: 콩 후원·출금/출금 신청의 붙은 간격 수정(배포 없이), 대시보드 리포트 더보기 버튼화, "콘텐츠 관리·소통 관리 같은 더보기"에도 버튼 디자인.
- 간격 원인: 스튜디오 `.root h2/p{margin-top:0}`이 콩 CSS의 제목 위 여백을 같은 우선순위로 덮음, 이전/다음 후원 버튼 묶음 간격 없음, 원화↔콩 안내 문구(BeanIncomeLink) 전용 스타일 없음. 수정: `.page>section>h2,.page>form>h2{margin-top:32px}`, `.pager{gap:8px;margin-top:16px}`, `.incomeLink.incomeLink{margin-top:24px;13px+}`. 측정: 출금 내용 확인→받은 후원 32px, 이전↔다음 8px, 버튼→콩 출금 내역 32px, 출금 신청 버튼→안내 문구 24px.
- 버튼화: 공용 `ActionLink variant="secondary"`로 대시보드 리포트 보기×3·통계 더보기·콘텐츠 관리·소통 관리, 수익 현황 정산 내역 보기, 출금 신청 제목 출금 내역·정산 계좌 관리, 정산 계좌 출금 요청으로 이동, 게시물 빈 상태 첫 게시물 작성하기, 콩 화면 출금 PIN 설정·정산 계좌 관리. 지표 카드 버튼은 설명 아래 줄로. 미사용 CSS 제거(overview .metricDetail/.sectionTitle a, finance .sectionHeading a/.textLink, management .textLink). 댓글 게시물 제목·리포트 탭·문장 속 링크는 유지.
- 검증(`.local/spacing-fix-20261028/`): check 372/372(시험 대역 ActionLink 추가), E2E preview·service 54중 52(기존 프로필 확대 2 허용; promotion-payout은 2026-10-28T00:00Z 고정 시각 의존 결함으로 별도 실패), 로컬 375/1280 모든 대상 44px·14px·테두리·밑줄 없음·문서 폭 정상·pageerror0.
- 운영 배포 `studio-nav-20261028`(운영 사본 studio-buttons에 8파일, 656파일 로컬 SHA 일치, FRONTEND_IMAGE만 교체). 운영 375/1280: 버튼 12개 동일 규격, 콩 화면 간격 32/8/32px, pageerror0, health 200. 보존 단계로 front studio-drawer 1개 삭제(운영·로컬, 오류0, 운영 여유36.9GB). 커밋 없음.

## 스튜디오 제목 주요 버튼 통일 (2026-10-28, 운영 배포 완료)

- 사용자 보고: 멤버십 만들기·새 게시물 작성 등 버튼 크기가 모바일에서 제각각. 원인: 이동 버튼을 화면별 CSS(overview/management .primaryLink, finance .brandLink)로 복제하고 모바일 축소 규칙이 767/600/520px로 달라 37~44px·11~14px, 게시물 버튼만 남색. 공용 Action은 button만 렌더해 링크용이 없었음. 또 Action variant="brand"는 로고 클래스 .brand(26px)와 이름 충돌.
- 수정: ServiceUI에 `ActionLink`(next/link + Action 클래스, font 상속으로 button과 동일) 추가, 제목 버튼 6곳(대시보드·게시물·수익 현황·출금 내역 링크, 멤버십·정산 계좌 버튼)을 Action/ActionLink primary로 통일, 정산 계좌의 variant=brand 제거, 미사용 management .primaryLink 제거(대시보드 시작 화면·정산 대화창 등 비제목 버튼은 유지). 시험 대역에 ActionLink 추가.
- 검증: check 372/372, E2E preview·service 54중 52(기존 프로필 확대 2 허용), 로컬·운영 375/1280 모두 6개 버튼 44px·14px·padding 10/20·같은 파랑·제목과 같은 줄·문서 폭375. 운영 배포 `studio-buttons-20261028`(운영 사본에 6파일), 보존 단계 실행. 커밋 없음.

## 스튜디오 탭 모바일 균등 분할 (2026-10-28, 운영 배포 완료)

- 사용자 보고: 멤버십 활성화/비활성화 탭이 모바일에서 좌우 끝에 붙음. 원인: 공용 컴포넌트가 아니라 게시물 상태 탭과 `.tabs` CSS 클래스만 공유하는 개별 마크업이고, 600px 이하 규칙(2026-10-07)이 `justify-content:space-between;gap:0`으로 버튼 폭은 그대로 둔 채 양 끝으로 벌림 → 2개 탭은 양 끝, 4개 탭만 고르게 보임. 스튜디오가 오늘 아침까지 모바일 차단이라 드러나지 않았음.
- 수정: 600px 이하 `.tabs{width:100%;flex-wrap:nowrap;gap:4px}.tabs button{flex:1 1 0;min-width:0;text-align:center}`. 375px 멤버십 166/166, 게시물 81×4, PC 무변화, 320px 잘림 없음(게시물 탭은 숫자가 둘째 줄로). check 372/372.
- 운영 배포 `studio-tabs-20261028`(운영 사본 studio-drawer에 1파일만), 운영 375/1280 측정 로컬과 동일, 보존 단계로 front studio-mobile 1개 삭제(운영·로컬, 오류0), health 200. 커밋 없음.

## 스튜디오 모바일 메뉴 플로팅 서랍 (2026-10-28, 운영 배포 완료)

- 사용자 요청: 햄버거 메뉴를 페이지를 밀어내지 않고 덮는 floating 구조로. 767px 이하에서 사이드바를 `position:fixed` 서랍(헤더 하단~화면 끝, 폭 min(320px,86vw), 내부 스크롤)으로 띄우고 나머지를 반투명 배경(클릭 시 닫힘)으로 덮음. 열린 동안 body 스크롤 잠금, 헤더가 화면 밖이면 0px부터 덮음(열 때 헤더 하단 측정), 페이지 이동·Esc·PC 전환 시 닫힘. PC는 기존 사이드바 그대로.
- 검증(`.local/studio-drawer-20261028/`): check 372/372(배경 클릭 닫힘 단위 검사 추가), E2E preview·service 54중 52(기존 프로필 확대 2 허용). 로컬·운영 375px: 서랍 fixed·top=헤더 하단90·높이 722·본문 위치 불변(90)·배경 있음·스크롤 잠금/해제·Esc 닫힘, 스크롤40→top50, 스크롤250→top0, PC static·배경 없음, pageerror0.
- 운영 배포 `studio-drawer-20261028`: 운영 사본(studio-actions)에 2파일만 덮은 656파일(로컬 SHA 일치), FRONTEND_IMAGE만 교체, 나머지 컨테이너 유지. 보존 단계 첫 정식 실행: 운영·로컬 모두 crefans-front:payout-policy-20261028 1개만 삭제(오류0), 운영 여유 36.9GB, health·studio 200. 커밋 없음.

## 배포 이미지 보존 단계 (2026-10-28, 적용 완료)

- 사용자 요청: 반복되는 디스크 부족 해결을 위해 배포 후 자동 정리 단계 추가. `infra/platform/image-retention.py`: crefans-front/api/admin 저장소별 최신 N(기본3)개 ID + 컨테이너 사용 중(정지 포함) + `--protect` 태그 보존, 기본 계획만 출력, `--apply`에서 태그 재확인 후 `docker rmi`(force 없음). 원격은 ssh로 stdin 실행. AGENTS 배포 규칙과 server infra README에 절차·근거 추가.
- 검증: `--self-test` 통과, 대조 사본(사용 중 보호 제거, 보존 개수+1) 모두 AssertionError. 계획(삭제 없음, `.local/image-retention-20261028/`): 로컬 여유11.1GB·보존9·삭제예정119, 운영 여유8.1GB·보존9(사용 중 front/api/admin 3 포함)·삭제예정32. 양쪽 보존 목록 동일(운영 롤백 이미지 로컬 재전송 가능).
- 적용(사용자 승인, 직전 계획과 동일 재확인 후): 운영 32개 삭제·오류0, 디스크 여유 8.1→35.8GB(사용 30%), 남은 crefans 이미지 9개(front studio-actions/studio-mobile/payout-policy, api payout-policy/promotion-payout/tip-attribution, admin promotion-payout/tip-attribution/beans). 로컬 119개 삭제·오류0, 맥 실제 여유 12.3→91.5GB. 운영 컨테이너6 실행·재시작0, health·feed·studio·admin 200. 결과 `.local/image-retention-20261028/{remote,local}-apply.json`.
- 남은 것: 다음 배포부터 검증 후 보존 단계 실행. 레지스트리·Gitea Actions는 미결정.

## 게시물 관리 버튼·테이블 정렬 아이콘 (2026-10-28, 운영 배포 완료)

- 사용자 요청: 스튜디오 게시물 목록의 미리보기·수정·삭제를 링크 모양이 아닌 버튼으로, 테이블 정렬 표시를 이모지/기호 대신 아이콘으로.
- 미리보기·삭제는 공용 `Action` secondary 버튼(행용 32px, 모바일 40px), 수정은 이동 동작이라 next/link를 유지하되 같은 테두리 버튼 모양. 삭제는 위험 색. 사용하지 않게 된 `.rowActions/.dangerText` 스타일 제거(탭 hover 규칙은 유지).
- 공용 `components/ui/DataTable`의 ↑↓↕ 텍스트를 인라인 SVG 위·아래 꺾쇠로 교체(기본은 둘 다 연하게, 오름/내림은 해당 방향만 진하게). aria-sort·aria-label 정렬 안내는 그대로라 모든 DataTable(게시물·리포트 등)에 함께 적용.
- 검증(`.local/studio-actions-20261028/`): npm run check 372/372, E2E preview·service 54건 중 52 통과(실패2는 기존 프로필 확대 시험, 사용자 허용). 로컬 PC에서 버튼 3개 테두리·밑줄 없음·SVG 정렬 아이콘·오름차순 표시, 375px에서 버튼 40px·문서 폭375·미리보기/삭제 확인창 열림·수정 이동 확인. 
- 운영 배포 `studio-actions-20261028`(front만, 기준 studio-mobile-20261028에 4파일만 덮음·656파일 로컬 SHA 일치). 운영 서버 여유 5.3GB→9.0GB: 사용자 승인으로 로컬에 같은 ID가 있는 옛 이미지 중 오래된 5개(swagger 3·feed-inbox·creator-verification API)만 삭제. FRONTEND_IMAGE만 변경, API/worker/admin/DB/proxy 유지.
- 운영 확인(`.local/studio-actions-deploy-20261028/prod-check.json`): PC1280·모바일375 모두 버튼3개 테두리·밑줄 없음(32/40px), 정렬 SVG 4열·화살표 기호 없음·오름차순 표시, 삭제 확인창·수정 이동, 모바일 문서 폭375, pageerror0. 커밋 없음.

## 크리에이터 스튜디오 모바일 개방 (2026-10-28, 운영 배포 완료)

- 사용자 요청: 스튜디오를 모바일에서 공개하고 운영 배포. StudioShell의 모바일 차단 화면을 제거하고, 767px 이하에서 헤더 메뉴 버튼(44px, aria-expanded/controls, 열기·닫기 라벨)으로 기존 사이드바를 본문 위 패널로 여닫게 했다. 닫힘 상태는 aria-hidden+inert, 페이지 이동·Esc로 닫힘. 차단 화면 전용 CSS와 정책 목록 표시는 제거(정산 기준은 각 정산 화면 하단에 그대로 표시).
- 기존 결함 수정: 게시물 작성·수정 화면의 1000px 이하 단일 열 규칙이 뒤쪽 2열 기본 규칙에 덮여 400px 미리보기로 문서가 452px까지 넘치던 문제를 management.module.css 끝에서 재선언해 해결.
- 검증(로그 `.local/studio-mobile-20261028/`): 375px로 스튜디오 21개 경로 순회 시 문서 폭 모두 375px, 남은 넓은 요소는 표·차트·갤러리 자체 가로 스크롤 영역 안(잘림 0), pageerror 0. 모바일 메뉴 열기→수익 현황 이동→자동 닫힘 확인. npm run check 372/372(단위 시험을 새 동작으로 교체). E2E preview·service·promotion-payout·creator-verification 59건 중 56 통과: 실패 2는 기존 프로필 확대(허용), 1은 promotion-payout 시험 서버가 지급 시각을 2026-10-28T00:00Z로 고정해 그 이후 생성된 콩이 release_at>now로 막히는 시각 의존 결함(서버 코드 무변경, 오늘 08시 KST 실행은 통과).
- 운영 배포 `studio-mobile-20261028`(front만): 사용자 승인으로 10/21~23 생성 이미지 압축16개(7.25GB, 원본 이미지는 로컬 Docker 유지) 삭제 후 빌드. 운영 기준 payout-policy-20261028에 3파일만 덮은 656파일(로컬 SHA 일치)·이미지 내부 소스 대조. FRONTEND_IMAGE만 변경, .env 백업 `/opt/crefans-backup-studio-mobile-20261028`, API/worker/admin/DB/proxy 컨테이너 유지.
- 운영 확인: beta.crefans.com 375px 스튜디오 21경로 모두 문서 폭375·메뉴 버튼·차단 화면 없음·pageerror0, 메뉴→수익 현황 이동 후 자동 닫힘·정산 기준 표시, PC1280은 메뉴 버튼 없음·사이드바 표시. 증거 `.local/studio-mobile-deploy-20261028/production-verification.json`. 미검증: 실제 크리에이터 로그인 /service 스튜디오, 실기기 Safari/Android. 커밋 없음.

## 출금 최소액·스튜디오 정산 안내 운영 배포 (2026-10-28, 완료)

- 사용자 배포 요청. 운영 기준(API promotion-payout-20261026, front moka-demo-button-deploy-20261027)에 검증된 변경만 덮어 `payout-policy-20261028` 배포: server 3파일(beta-policy 최소 100,000원, finance 오류문구, 약관 6조 "최소10만원부터"·version 2026-10-27.1), front 10파일(스튜디오 정산·출금 기준, 출금 확인 ₩0, 멤버십 예상 수익, 콩 수요일, 모바일 차단 화면 기준 표시, 목업 20%). admin·DB 스키마·migration·금융 데이터 변경 없음.
- 빌드 소스 front656/server206 모두 로컬 검사 통과 트리와 SHA 일치, 이미지 내부 소스 대조·amd64. 운영 디스크 456MB→8.8GB 확보(현재·최근 롤백 보존, 로컬에 같은 ID가 있는 옛 이미지22개만 삭제, 볼륨 미접촉). 배포 전 컨테이너 불변 확인·.env/runtime.env/DB 덤프 백업 `/opt/crefans-backup-payout-policy-20261028`, DB/proxy/admin 컨테이너 유지.
- 운영 확인: API·worker 최소 100,000원·문구·약관 버전, 플래그(BETA true·실송금/실판매 off·email-only)·migration25·DB 2000bps/7일 불변, 운영 PC 목업 스튜디오 기준·수수료 476,200·출금가능 962,800, 콩 수요일, 크리에이터 안내 10만 원, 모바일375 차단 화면 9개 기준·가로 넘침 없음. 증거 `crefans_front/.local/payout-policy-deploy-20261028/production-verification.json`.
- 미검증: 실제 크리에이터 계정의 /service 출금 화면(로그인 필요, 베타 실송금 차단). 약관 버전 변경 고지 기간은 미결정. 커밋/푸시 없음.

## 스튜디오 정산·출금 정책 안내 정합화 (2026-10-28, 로컬)

- 사용자 요청: 스튜디오를 약관 6조·서버 정책에 맞추고 모바일에서도 확인 가능하게. 기준 문구는 `lib/crefans/creator-payout-policy.ts` 한 곳(20% 결제 시 공제·부가세 포함/세금 별도, 7일 보류+PG 대사, 최소 100,000원, 수요일 지급, 원화 출금 추가 수수료 없음, 본인 명의 계좌, 콩 1,000콩·출금 수수료20%·수요일). 정산 API가 정책값을 내려주지 않으므로 약관 버전과 함께 수정해야 한다.
- 화면: 수익 현황·정산 내역·출금 신청·출금 내역·정산 계좌 하단 `Policy`에 "정산·출금 기준" 목록, 원화 출금 확인·PIN 창에 "출금 수수료 ₩0"과 결제 시 이미 공제 안내, 정산 계좌 부제 "본인 명의", 멤버십 월 구독료에 20% 공제 후 예상 수익(서버와 같은 원 미만 절사), 콩 출금 안내에 수요일 지급. 스튜디오는 모바일 진입을 차단하므로 차단 화면에 멤버십·콩 정산 기준을 표시(스튜디오 전체 모바일 개방은 미결정).
- 목업: 수익 수수료 10%→20%(278,200/100,000/98,000), 보류 종료 9/7·10/7, 반려 출금 100,000원. 관련 단위시험 기대값 갱신과 99,999원 거부 경계 추가.
- 검증(로그 `.local/studio-policy-20261028/`): npm run check 372/372, E2E service·promotion-payout·preview 57건 중 55 통과(실패2는 기존 프로필 확대 시험, 사용자 허용), 로컬 PC·375px 모바일에서 문구·가로 넘침 없음·9,900원→예상 수익 7,920원·출금 확인 ₩0 표시 확인. 운영 미배포·커밋 없음.
- 남은 것: 베타 기간 "실제 출금 미처리" 안내는 스튜디오가 베타 여부를 모르므로 미반영(API 노출 필요). 999콩 입력 시 버튼만 비활성이고 오류 문구 없음.

## 모카로 로그인 버튼 운영 배포 (2026-10-27, 완료)

- 사용자 배포 요청에 따라 기존 운영 moka-preview-ready 기준에 검증된 버튼 관련4파일만 덮어 moka-demo-button-deploy-20261027 배포. 로컬372검사 대상 SHA 일치, 이미지654소스/manifest/RootFS 대조 및 운영 빌드 통과. 기존 미배포 금융·약관·QA 작업 제외.
- 운영 Chromium에서 모카만 버튼 표시, 모바일44px 이상, 클릭→모카 스튜디오, 새로고침 유지, 로그아웃된 모카 재진입 확인. API0·pageerror0. HTTPS12경로와 API/worker/admin/DB/proxy5개 ID·재시작 수 보존 확인. 실제 회원 인증/DB·운영 금융 변경 없음. 집 SSH 규칙 유지. 준비 중502횟수 등 실제 결과는 docs/audit/moka-demo-button-deployment-20261027.json과 .local/moka-demo-button-deploy-20261027/에 기록. 물리 iOS Safari 미실행, 스튜디오는 기존 PC 전용.

## 모카로 로그인 목업 버튼 (2026-10-27, 로컬)

- 요청: 모카에 한해 ‘모카로 로그인’ 버튼. `/preview/creator/moka`의 프로필 정보 아래에 기존 secondary Action을 사용해 추가. 목업 라우터만 액션을 주입하고 공유 프로필은 mode=mock일 때만 표시. 다른 크리에이터·실서비스에는 미노출.
- 버튼은 비밀번호나 비교값을 갖지 않고 PreviewProvider의 모카 페르소나/로그인 플래그만 선택한 뒤 `/preview/studio` 이동. 실제 회원 인증/쿠키/토큰/DB 변경과 API 호출 없음. 기존 지정 자격정보 입력 로그인 경로는 그대로 유지. 이미 모카로 선택된 뒤 로그아웃한 경우도 signedIn을 명시적으로 복구. 새로고침 시 기존 탭 선택 유지.
- 검증: npm run check372/372(타입·레이어 포함), 액션 위임·live/액션 없음 미노출 단위 검사, 로컬 Chromium에서 하늘 미노출/모카 표시·모바일44px 이상·원클릭 스튜디오·새로고침·로그아웃된 모카 재진입 통과. API0·pageerror0. docs/audit/moka-demo-button-20261027.json 및 .local/moka-demo-button-20261027/. 운영 배포 없음. 기존 미커밋·금융/서버 설정 보존. 다음: 필요 시 이번 버튼 변경만 별도 배포.


## 모카 목업 로그인 운영 배포 (2026-10-27, 완료)

- 사용자 배포 요청에 따라 현재 운영 landing-ready-20261027에서 검증된 목업/서버 경로9파일과 날짜 표시1파일만 분리해 moka-preview-ready-20261027 배포. 변경10파일이 로컬371검사 대상 소스 SHA와 일치함을 격리 이미지에서 대조, amd64 빌드/타입검사 통과. 실제 /service 계정 생성·인증·Nest API/DB 변경 없음. 비공개 비교값은 Compose frontend 환경변수로만 전달. 초기 공개 비교값 배포는 자동 검토에서 거절되어 배포하지 않았고 서버 전용 방식으로 교체 후 재검증. 기존 미배포 출금/약관·QA 작업 제외.
- 운영 https://beta.crefans.com/preview/login 에서 모카 지정 자격정보 성공→studio, 오입력 거절, 모카 게시물·멤버십·프로필 및 새로고침 유지, 일반 팬 전환 확인. 목업 확인 경로2호출·실제 회원 API0·pageerror0. 자격정보는 임시 시험 후 삭제하고 증거에 원문 미포함.
- 운영 이미지654소스 해시·RootFS/manifest 대조·공개에셋 비밀값 미포함/주입 대조 검사·운영 외부출처403/정상출처 오입력401/쿠키미발급 확인, HTTPS12경로 통과, API/worker/admin/DB/proxy5개 컨테이너 ID·재시작 수 보존. 콘텐츠 목록의 UTC서버/KST브라우저 날짜 표시 불일치를 실패 검사로 재현 후 Asia/Seoul 표시로만 보완(예약/금융 계산 불변). 최종 빌드 중 기본8GiB 여유검사 실패를 기록했으며, 빌드는 완료되어 추가 빌드 없이 1GiB 전송 단계 검사 후 스트리밍했다. 오래된 캐시와 동일 이미지로 복구 가능한 중복 소스 사본만 정리, 복구 이미지/저장소/DB 유지. 배포 설정 스크립트 문법 오류로 최초 중단 후 기존 컨테이너 ID 보존을 확인하고 수정·사전 AST/쉘 검사 뒤 재개. 최초 운영 브라우저는 CloudFront 원본 Host 때문에403이어서 목업 경로에만 공개 Host 전달하도록 보완하고 최종 재검증. 배포 준비502횟수는 증거에 기록. 기존 집 SSH 규칙 유지. 증거 docs/audit/moka-preview-deployment-20261027.json 및 .local/moka-preview-ready-20261027/(초기 조치는 .local/moka-preview-deploy-20261027/). 다음: 사용자 목업 검수. 실제 인증 기능으로 간주하지 않으며 스튜디오 금융 수치는 예시 유지.


## 모카 목업 로그인 배포 보안 보완 (2026-10-27, 완료)

- 배포 자동 검토가 초기 클라이언트 비밀번호 비교값 공개를 거절했으며 운영 반영 전 중단. 우회하지 않고 해당 비교값을 클라이언트에서 제거. Next 서버 전용 비공개 환경변수의 무작위 salt+scrypt로 /api/preview/v1/login에서만 확인하며 성공해도 목업 ID만 반환, 쿠키/토큰/실제 회원 권한/DB 변경 없음.
- 서버 변수 CREFANS_PREVIEW_LOGIN_HASH는 NEXT_PUBLIC 접두사 없이 Compose frontend에만 전달, 기본 빈 값은503. 동일 출처 검사·작업 프로세스당20회/분·입력 길이 제한·응답 no-store. 실제 회원 로그인 /api/v1과 분리. 로컬 수정 후 전체370검사와 브라우저 목업 로그인/오입력/모카 데이터/새로고침 통과. 원래 ‘API0’은 초기안 기록이며 현재 목업 검증 경로 호출만 생기고 실제 회원 API0 유지.
- 공식 근거 확인2026-10-27: Next14 Environment Variables https://nextjs.org/docs/14/app/building-your-application/configuring/environment-variables 및 Route Handlers https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers, Node crypto https://nodejs.org/api/crypto.html (scrypt/무작위 salt/timingSafeEqual). 브라우저 공개 에셋에서 비밀번호·구형 비교값·서버 설정 미포함과 주입 대조 검사를 배포 전에 확인했고 최종 배포 증거에 기록했다. 비공개 env 원문은 증거/빌드 소스/로그에 보존하지 않음.


## 모카 목업 스튜디오 로그인 (2026-10-27, 초기 로컬안·서버 전용안으로 대체)

- 요청: 지정한 모카 이메일·비밀번호로 목업에서만 모카 크리에이터 스튜디오 진입. 실제 계정 생성/서비스 인증/DB/운영 배포 없음. 자격정보 원문은 문서·증거에 남기지 않고 프론트 목업은 비교용 digest만 보관(실인증 수단 아님).
- 구현: preview login 전용 분기, 오입력은 세션/이동 전 거절. 성공 시 /preview/studio, Viewer/ownCreatorIds/스튜디오 프로필·게시물·멤버십을 모카로 선택. 한 탭 sessionStorage에는 선택 ID/로그인 여부만 저장해 새로고침 유지. 일반 팬 로그인 시 기존 하늘 스튜디오 목업으로 복귀. 콩 목업의 본인 후원 제한도 선택된 소유자 ID 사용. 금융/보고서 수치는 기존 예시이며 실제 모카 수익 아님. 목업 편집 내용은 이전처럼 새로고침 시 초기화.
- 합격 조건/증거: npm run check368/368(타입·레이어 포함), 오입력 시 상태/이동 불변 단위검사, 로컬 Chromium1440에서 제공 자격정보 성공·오입력 거절·모카 게시물/멤버십/설정·새로고침 유지·일반 팬 전환 확인. 실제 API 요청0·pageerror0. 활동분야 초기화에서 tags 없는 구형 단위 fixture1건 실패를 optional 기본값으로 수정 후368건 재통과. docs/audit/moka-preview-login-20261027.json 및 .local/moka-preview-login-20261027/. 비밀번호는 브라우저 시험에만 사용하고 보존하지 않음. 기존 미커밋/금융 정책 보존. 당시 다음 단계였던 배포는 위 서버 전용 보완 후 완료.


## PC 서비스 소개 준비 화면 정지 조사 (2026-10-27)

- 신고: PC에서 ‘화면을 준비하고 있어요.’가 계속 표시됨. 사용자는 business.crefans.com/card에서 발생했다고 확인. 실제 PC Chrome은 정상 명함→소개 이동, PC Chromium/WebKit 명함8장애조건에서도 표시됨. 현재 명함200응답에는 신고 문구가 없고 cache private/no-store. 정확한 당사자 원인은 미확정. 해당 문구는 service/preview Suspense에 있고 명함 컴포넌트에는 없음. 서비스 소개는 공통 ServiceProvider의 useSearchParams로 정적 HTML이 로딩 fallback만 제공되는 구조.
- 최소 수정: service/landing만 Next14 force-dynamic으로 요청 시 HTML을 렌더해 에셋 소개 본문을 스크립트 실행 전에 제공. 회원/금융 API와 인증을 바꾸지 않고 기존 데이터 플래그와 표시 컴포넌트 유지. JS 없는 환경에서 버튼 동작까지 보장하지 않음.
- 근거 확인2026-10-27: https://nextjs.org/docs/14/app/api-reference/functions/use-search-params 의 Static/Dynamic Rendering 및 force-dynamic 예시. 합격 조건: PC Chromium/WebKit 정상·JS 비활성·스크립트 차단 모두 소개 본문 표시, 정상 탐색과 명함 자동 입장 유지, 격리 배포 소스/운영 이미지 확인. 운영 landing-ready-20261027 배포 완료. 수정 전 소개 PC 정상2조건 통과/JS 비활성·차단4조건 본문없음 재현, 수정 후 로컬·운영 Chromium/WebKit6조건 모두 본문표시·로딩문구없음·pageerror0. amd64 빌드/타입검사·HTTPS12건·명함제어4조건 회귀 통과, API/worker/admin/DB/proxy5컨테이너 ID·재시작수 유지. 운영 준비502횟수·공간정리는 증거에 기록. 전체 단위/제품 회귀는 이번 한줄 라우트 설정 변경에서 반복하지 않음. 증거 docs/audit/landing-ready-20261027.json 및 .local/landing-ready-20261027/. 소개 보완을 신고된 명함 증상의 실제 원인 규명으로 간주하지 않음. 기존 미배포 금융/법률 변경 보존.



## 명함 미노출 조사·복구 (2026-10-27)

- 신고: 타인 접속 시 명함이 보이지 않음, 느린 인터넷 가능성 질문. 사용자 확인: 인사말만 보이고 명함은 보이지 않았음. 실제 당사자 기기/브라우저/네트워크 원인은 미확정. 운영 Chromium에서① 뒷면 PNG 지연 시 앞면 완료에도 opacity0,② JS 비활성 시 완료된 앞면도 opacity0,③ 합성8초 프레임 정지 후 연출 건너뛰고 서비스 이동 재현. 이전 정상 회선 검증은 이 조건을 포함하지 않았음.
- 자산은 앞면60KiB/뒷면27KiB. 지난60분 프록시4000행 범위 business 상태200:59/404:3/304:4/499:1/302:1. 경로·IP를 출력/저장하지 않았으며 검사 요청도 섞여 개인의 원인을 이 집계로 판단하지 않음.
- 보완: 로딩 상태가1.2초 넘으면 앞면 정적 표시(CSS, JS 없이도 작동), JS/양면 준비 뒤 기존 연출. 프레임 간격100ms 상한·hidden 시간 제외·visibilitychange 기준시각 재설정으로 보이지 않던 시간에 바로 입장하지 않도록 함. 정상 연출·제어 유지.
- 근거 확인2026-10-27: MDN requestAnimationFrame https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame (백그라운드 중단), Page Visibility https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API (가시성 처리), HTMLImageElement.complete https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/complete (완료만으로 정상 이미지 판정 불가; 기존 naturalWidth 검사 유지). 해당 현상이 당사자의 실제 원인이라는 뜻은 아님.
- 합격 조건: 뒷면 지연/JS 비활성·스크립트 차단에서도 받은 앞면이 보임, 프레임 정지/hidden 구간이 타이머를 건너뛰지 않음, 정상 회전/중지/재생/다시보기/5초 입장 회귀. 운영 card-visible-20261027 배포 완료. npm run check367/367(명함11개)·긴 프레임 상한 제거 대조 검사 실패 및 원복 확인·amd64 빌드·HTTPS12건 통과. Chromium/WebKit에서 뒷면 지연·JS 비활성·스크립트 차단·8.1초 프레임 지연8조건 및 정상 회전/제어/자동입장4조건 통과. 스크립트/스타일 모두 실패해도 SSR의 영구 inline 숨김은 제거(양쪽 실패 시 디자인 육안인증은 아님). 다른5컨테이너 ID/재시작 수 유지. 배포 준비 중502 발생 수는 증거에 기록. 증거 docs/audit/card-visible-20261027.json, 원본 .local/card-visible-20261027/. 실제 당사자 원인과 실기기 미확인 한계 유지. 타 미커밋·금융 정책 보존.


## 명함 인사말 확정 (2026-10-27)

- 요청: 상단 인사를 ‘안녕하세요, 만나서 반갑습니다.’로 변경하고 운영 배포. 문구와 기존 렌더링 검사 기대값·현재 문서만 갱신. fade-up/명함 연출/중지·재생·다시보기·자동 입장 유지.
- 합격 조건: 정확한 문구, 모바일/PC 줄 넘침 없음, 운영 소스 동일성과 HTTPS. 운영 card-greeting-20261027 배포 완료. 기존 명함8검사 통과, amd64 빌드/타입검사 통과, HTTPS12건·Chrome320/390/1280 및 WebKit390에서 정확한 문구/넘침 없음/제어3개 유지/pageerror0 확인. API/worker/admin/DB/proxy5컨테이너ID·재시작수 유지. 증거 docs/audit/card-greeting-20261027.json 및 .local/card-greeting-20261027/. 문구 변경이므로 기존 명함 검사와 운영 화면 확인을 사용하고 신규 테스트 추가 없음. 타 미커밋 변경은 배포에서 제외.


## 명함 최소 UI·재생 제어 (2026-10-27)

- 요청: 연락처부터 계속 보기까지 하단 UI 모두 제거, 제목은 fade-up(AOS 형식) ‘반가워요’, 진행 막대 오른쪽 중지/재생/다시보기 아이콘, 운영 배포. 시간대 인사·전화/메일·입장 링크·상태 문구 제거. 아이콘3개는44px 클릭 영역과 접근 가능한 이름 제공.
- 동작: 단일 requestAnimationFrame 시간축으로 등장0.8초/뒷면1초/flip0.7초/진행5초를 관리. 중지는 진행뿐 아니라 등장·뒤집기까지 현재 위치에서 정지, 재생은 남은 구간을 이어가며 다시보기는 제목/명함/진행 모두 처음부터 시작. 동작 줄이기 설정은 입체/제목 이동을 생략. 외부 라이브러리 추가 없음.
- 합격 조건: 삭제 UI 미노출·제목/아이콘3개·중지/이어재생/연속 다시보기·타이머 중복 없음·양면 로드/실패·최종 고정 주소 입장·모바일/PC/WebKit·reduced-motion·운영 이미지 동일성. 운영 card-controls-20261027 배포 완료. npm run check364/364(타입·레이어 포함), pause guard 제거 시 회전정지 대조 시험 실패·원복, HTTPS12건과 Chromium390/1280·WebKit390·동작 줄이기390에서 UI제거/반가워요/아이콘3개·44px·오른쪽위치/회전·진행정지/재생/다시보기·자동입장/넘침없음/pageerror0 확인. API/worker/admin/DB/proxy5컨테이너ID·재시작수 보존. 첫 배포는 용량 부족으로 전송 전 중단, 로컬 동일 복구본을 확인한 미사용 과거 frontend 이미지만 정리하고 현재·직전/DB/볼륨 보존 후 재배포. 증거 docs/audit/card-controls-20261027.json 및 .local/card-controls-20261027/. 기존 미배포 금융 정책과 타 작업 보존.


## PC·모바일 프로필 동기화 및 시간대 명함 (2026-10-27)

- 요청: PC 프로필의 구형 내 콩 지갑 링크를 모바일과 동기화, 모바일 전용 누락 기능 대조. 별도 PC 지갑 wrapper를 제거하고 배경사진 위의 동일 지갑/설정 버튼만 사용. 설정 서비스 안내 그룹·카테고리도 PC에서 동일하게 표시하며 화면 크기 변경 시 카테고리를 강제로 리셋하는 코드를 제거. 프로필 사진·인증/공개 목록·후원·탭은 기존 공유 JSX이며 여백/배열 같은 반응형 차이는 유지.
- 명함: 맨 위 영어 문구 제거, 서비스 소개 버튼으로 단축. 기기 Date.getHours 기준05~10시 아침/11~16시 점심/17~04시 저녁. 클라이언트 마운트 후 결정하고1분마다 갱신해 서버 시간/시간대 추정 및 hydration 차이 방지. 기존3D 연출/앞면5초/중지 동작 유지.
- 합격 조건: PC/모바일 지갑 단일 버튼·동일 목적지 및 서비스 안내 접근, 기기 시간 경계 인사/영어 미노출/버튼 명칭, 기존3D/타이머 회귀. 운영 profile-card-sync-20261027 배포 완료. npm run check362/362(타입·레이어 포함), 기기시간 경계 오류 대조 시험 실패·원복 확인, HTTPS12건, Chromium390/1280·WebKit390에서 지갑1개/44px/동일 목적지·서비스 안내·카테고리 크기변경 유지·아침/점심/저녁·영어 제거·버튼 문구 통과. 초기 WebKit의 진행 중 RSC 미리읽기 오류를 별도 명함 페이지/네트워크 종료 대기로 재확인. 충전 페이지 preview/beans/charge의 미리읽기 경고1건이 남아 브라우저 결과에 그대로 기록했고 콘솔 무오류를 주장하지 않음. 관련 충전 컴포넌트는 이번 변경 대상이 아니며 별도 후속 확인 항목. API/worker/admin/DB/proxy5컨테이너ID·재시작수 유지. 첫 준비 중502 한 번 후 정상화. 증거 docs/audit/profile-card-sync-20261027.json 및 .local/profile-card-sync-20261027/. 기존 미커밋 출금 정책·QA 산출물 보존.


## 명함 3D 등장·뒤집기 및 진행 막대 (2026-10-27)

- 요청: 숨겨진 명함이 아래에서 회전하며 등장, 뒷면1초 후 앞면 뒤집기, 진행 막대5초 후 입장. 기존 박경호 핑크 앞·뒷면 자산을 재사용하고 새 이미지 생성은 하지 않음.
- 순서: 양면 로드(캐시 완료 감지 포함) → 0.8초 3D 등장 → 뒷면1초 → 0.7초 flip → 앞면/진행 막대5초 → 고정된 서비스 소개 주소 replace. 총 연출 약7.5초, 네트워크 로드 별도. 계속 보기는 막대·입장만 정지하고 명함 등장/앞면 전환은 끝까지 진행. 바로 보기 유지. reduced-motion은 입체 이동/전환을 생략하고 상태 순서/시간·진행 정보 유지.
- 변경 범위: `components/business-card/BusinessCard.tsx`, CSS, `public/brand/business-cards/khpark-back.png`, 관련 검사·문서. 명함 뒷면은 기존 핑크09 원본, 기존 운영 release의3파일만 덮어써 별도 출금 정책 미배포 변경 제외. 서버/DB/API/Caddy 변경 없음.
- 합격 조건: 양면 로드 전 숨김·뒷면1초·앞면 이후5초·막대 흐름/정지·캐시 이미지·즉시 이동·모바일/PC/WebKit/reduced-motion·넘침/브라우저 오류 없음. 운영 `business-card-animation-20261027` 배포 완료. check360/360·신규5시험/시간축 대조 실패 확인·HTTPS12건·운영 Chromium390/1280/WebKit390/동작 줄이기390에서 순서/막대 진행·정지/즉시 이동/자동 입장/넘침 없음/pageerror0 확인. WebKit 이미지 면의 거울상 잔류를 발견해 div 양면 구조와 앞면 상태의 뒷면 숨김으로 보완, 최종 캡처로 앞면 확인. 배포 준비 중502 한 번 후 정상화, 나머지5컨테이너 ID·재시작 수 유지. 공개 증거 `docs/audit/business-card-animation-20261027.json`, 비공개 증거 디렉터리 `.local/business-card-animation-20261027/`.


## 공개 명함 QR 페이지 (2026-10-27)

- 요청: `business.crefans.com/card?who=khpark`에서 박경호 대표 핑크 명함 표시 후 서비스 소개 홈 이동, 운영 배포. 명함 이미지 로드 후5초, 계속 보기로 중지, 바로 보기로 즉시 고정 주소 `https://beta.crefans.com/service/landing` 이동. 임의 redirect 파라미터는 사용하지 않는다. 잘못된/누락/중복 who는 middleware404. 공개 업무 연락처·명함만 제공하고 회원/결제 데이터는 사용하지 않는다.
- 구현: front `app/card/page.tsx`, `components/business-card/`, 명함 PNG와 두 공통 Provider의 구형 인증/테마 제외. server `infra/platform/Caddyfile`의 별도 business 호스트는 명함/관련 이미지/Next정적파일만 허용, 다른 경로404. Route53 A는 기존 EC2 원본 연결, Caddy HTTPS 자동 발급. 기존 관리 SSH 규칙 보존.
- 검증: front check360/360(타입·레이어 포함). 신규5검사에서5초/중지/unknown·중복/캐시 이미지 처리 확인, 캐시 감지 제거 시 해당 시험 실패·원복 확인. 첫 운영 WebKit 캐시 이미지 자동 이동 실패를 발견하여 수정했고 최종 운영 검증은 아래 증거로 보완한다. 최초 교체 중 health 재시도에서502 한 번 발생 후 정상화, 무중단 보장은 하지 않는다.
- 배포 범위: 기존 운영 source `notice-category-20261026`에서 명함 관련7파일만 반영. 미커밋 출금 최소액/약관/QA 산출물 변경은 배포에서 제외했고 원본 작업 파일은 보존. 회원 DB/API/worker/admin 컨테이너 및 금융/가입 정책 유지. 커밋/푸시 없음.
- 최종 상태: `business-card-fix-20261027` 운영 배포 완료. HTTPS12검사·Chromium390/1280·WebKit390에서 자동 이동5.1~5.3초/중지/즉시 이동/가로 넘침 없음·pageerror0 확인. API/worker/admin/DB/proxy5개 컨테이너ID·재시작 수 보존. 최종 증거 front `docs/audit/business-card-20261027.json`. macOS의 DNS 이전 음성 캐시로 최종 검사는 공개/권한 DNS의 A를 명시해 연결했고 TLS검증은 유지했다. 공개 DNS5개 정상 및 Route53 INSYNC. 비공개 실행·소스해시·로그는 front `.local/business-card-fix-20261027/`, 최초 배포 이력은 `.local/business-card-20261027/`. 실제 인쇄물의 휴대폰 QR 스캔은 별도.



## 출금 최소액 10만원 상향 (2026-10-27, 로컬)

- 사용자 결정(2026-10-27): 출금 최소액을 "둘 다 10만원"으로. 콩 출금은 이미 1,000콩=총액100,000원이라 불변, 멤버십 원화 수익 출금 최소액만 10,000→100,000원. 화면 시험 실패 9건은 사용자가 허용(실패해도 됨)으로 결정.
- 서버: `beta-policy.ts` minimumWithdrawal 100000, `finance.service.ts` 오류문구, 약관 `legal-documents.ts` 6조 "최소10만원부터"·version 2026-10-27.1·updatedAt 2026-10-27(effectiveAt=null 유지). 시험: platform-finance 금액×10과 경계시험(99,999 거부·100,000 허용) 추가, platform-provider-http 금액×20·PG 대사 완료 필드 추가·지급일을 수요일로 고정(기존에 금액·대사 필드·요일 3중으로 낡아 있었음), e2e-server fixture 200,000원.
- 프론트: 스튜디오 출금 min/버튼/안내 100,000원, 목업 검사·문구, 크리에이터 안내 "최소 10만 원". 시험 crefans-finance·service.spec 금액 갱신. 문서 platform-api·platform-implementation·provider-contracts·beta-role-test-plan·service-api-binding·release-test-scenarios.
- 검증(로그 `crefans_front/.local/min-withdrawal-20261027/`): server build0, 서버 12개 파일 97/97 PASS, 대조검사(최소액 10,000 원복 시 경계시험만 실패, 원복 SHA 확인), front check 355/355, E2E 기준4파일 17/17. 운영 배포·커밋 없음.
- 주의: 운영 베타 가입자가 약관 2026-10-25.1에 동의했을 수 있다. 운영 반영 시 신규 버전 동의 흐름(POLICY_VERSION_CHANGED)과 크리에이터 대상 사전 고지 기간을 정해야 한다(공정위 시정 사례상 불리한 변경은 개별 통지·충분한 기간 필요, 근거 확인 2026-10-27 언론보도 수준이라 법령 원문 확인 필요). 10-27 QA 보고서의 INC-04는 이 변경 전 기록이다.

## 현재 커밋 기준 QA 재시험·보고서 (2026-10-27)

- 사용자 요청: 10-24 QA 보고서와 같은 지침(AGENTS 외부 제출 QA 규약, R01~R04 동일 명령)으로 현재 커밋을 재시험하고 산출물 전달. 기준선 front 94f8ff0 / server 0d6044e / admin 8cf5025, 세 트리 미커밋0(실행 전후 동일). 원격 push되지 않은 로컬 브랜치다.
- 산출물: `output/pdf/crefans-qa-report-20261027.pdf`(15쪽)·`.html`, 증거 `output/pdf/crefans-qa-evidence-20261027.zip`(로그12·CSV856·OpenAPI·incidents). 생성/검증 스크립트와 원본은 `.local/qa-report-20261027/`(build_report.py, verify_report.py, verification.json).
- 결과: 기준 회귀418건(front355·backend46·browser17) 통과(R09는 환경조치 후 재시험). 확장438건: 통과·재시험통과 다수, 재현 실패11(INC-04 provider-http 출금 최소액 5,000 vs 정책10,000 2건, INC-05 프론트 E2E 9건: beans3·post-detail-gallery2·post-views1·preview 프로필확대2·mobile-comments1), 차단19(INC-03 platform/access integration은 3001 dev API 필요, dev 설정이 실제 SMTP라 기동 안 함), 건너뜀4.
- 환경조치: 로컬3307 crefans_platform_dev에 10-25~26 migration8개 deploy(운영DB 무관), 회원시험은 AUTH_TEST_DATABASE_URL=crefans_auth_test. 다음 QA 진입 조건에 `prisma migrate status` 확인을 넣을 것. 콘솔 E2E 후반 로그인 재시도 응답은 단독 재실행 통과(로그인 제한 추정, 미검증).
- 검증: verify_report.py exit0 — zip 해시·CSV 856건/결과별 수·로그 사례 수 대조, 대조검사4종(사례삭제·실패→통과·ID중복·로그변조) 거부, 비밀값 패턴0, PDF15쪽 쪽번호·HTML 해시, 전 페이지 렌더 육안 확인. 실공급자·운영·실기기·실제 베타97개는 미실행.
- 다음: INC-04/05 기대 동작 결정(시험 갱신 vs 제품 수정) 후 재시험, 메일 대역 설정으로 dev API 띄워 차단19 재실행, 검토자/승인자 지정. 제품 코드·배포·커밋 변경 없음(보고서 산출물은 미커밋).

## 미커밋 변경 정리 (2026-10-26)

- 사용자 요청으로 feat/bean-support의 누적 소스·에셋·검증 문서 변경을 보존해 리포별 커밋으로 정리. 로컬 비밀 설정/실행 폴더는 제외하고 .DS_Store/TypeScript 빌드캐시는 파일을 삭제하지 않고 추적만 해제. AGENTS 규약 보존.
- 알려진 실제 비밀번호·개인키·AWS 액세스키·Telegram 토큰·Toss 운영 비밀키 패턴 검사에서 후보 없음(이 패턴 검사는 모든 비밀정보 부재의 보장이 아님). 검증 결과와 커밋 후 clean 확인은 /tmp/crefans-commit-cleanup-20261026에 저장.
- 이번 정리 검증: npm run check: 레이어·타입·단위355건 통과. 추가 실금융/E2E 재실행은 하지 않음.
- 이번 작업은 소스 보존/커밋 정리이며 운영 배포·원격 push·브랜치 병합을 수행하지 않음. 현재 기능/배포 상태와 미결정 정책은 아래 로그 유지. 다음: 운영 피드백 및 별도 요청 시 통합/푸시.


## 공지사항 카테고리 제거 (2026-10-26, 운영 배포 완료)

- 공통 NoticesPage/NoticeDetailPage의 카테고리 표시 제거, 검색은 제목만 사용. 중요 공지·날짜·본문·기존 데이터 계약 유지. 목업/실서비스 공유.
- 관련 단위8검사·amd64 빌드 통과. 직전 운영 대비 CommonPages.tsx1파일 변경, 운영646파일 해시/이미지 일치·HTTPS12경로·6컨테이너 정상. API/worker/admin/DB/proxy 유지.
- 운영 Chromium390/1280 목업/실서비스 목록·존재하는 첫 상세에서 카테고리 미노출 확인. 증거 docs/audit/notice-category-deployment-20261026.json. 복구본 /opt/crefans-backup-notice-category-20261026. AGENTS/누적 변경 유지·커밋/푸시 없음. 다음 운영 피드백.

## 이벤트 유의사항 운영 배포 (2026-10-26, 완료)

- 사용자 운영 배포 요청으로 직전 유의사항 개선본을 frontend `event-terms-20261026`에 반영. 참여 확정 테스터·혜택별1인1회·피드백 기준·7개 유의사항과 카드의 최소출금/수수료/베타 은행출금 제한을 목업/실서비스 동일 적용. 상세한 정책 승인·공식 근거는 아래 검토 기록과 docs/audit/event-terms-20261026.json.
- 직전 운영 대비 runtime4파일만 변경. 누적 미커밋 전체를 임의 배포하지 않고 기존 운영647파일 목록과 대조해 격리 빌드. amd64 빌드, 이미지 내부/운영 실행646파일 SHA 및 RootFS·manifest 일치 확인. 이전 로컬 이벤트3검사·레이어/타입 검증은 소스해시로 연결.
- 운영 HTTPS12경로 정상,6컨테이너 정상. frontend만 교체하고 API/worker/admin/DB/proxy5개 ID·이미지·재시작 수 유지. BETA=true·은행/실판매 승인=false 유지. 시작 중 health 재시도에서502가2회 있었으나 이후 통과, 후속 HTTPS/브라우저 재검증 정상. 복구본 /opt/crefans-backup-event-terms-20261026, 이전 이미지 유지.
- 운영 Chromium 목업320/390/1280·실서비스390/1280와 WebKit목업390에서 문구·7소제목/18항목·14px본문·혜택4제목크기·가로넘침없음·JS오류0, 목록↔상세·고객센터 경로 확인. 모바일 유의사항 항목별 스크롤/콩카드 육안검증. 공개 이벤트 조회만 수행, 실제 혜택지급/금융/개인정보/DB 변경·외부 메시지 발송 없음.
- 증거 docs/audit/event-terms-deployment-20261026.json. AGENTS·기존 미커밋 보존, 커밋/푸시 없음. 다음: 운영 피드백 및 아래에 남긴 행사 기간/완료 기준/지급일·광고 실행·상품권 발급 조건·실제 배지 지급 준비. 배포가 미정사항 확정이나 실제 혜택지급 완료를 뜻하지 않음.

## 오픈베타 이벤트 유의사항 검토 (2026-10-26, 당시 로컬 검증·현재 상단 배포로 반영)

- 사용자 요청: 마케팅 책임자 관점의 혜택 안내 허점 개선. 사용자 선택 확정: 운영자가 참여를 확정한 크리에이터3명·팬13명, 혜택별1인1회. 피드백은 구체성·재현 가능성·개선 기여도로 최대3명 선정하며 칭찬/결제금액은 제외. 기본 참여혜택과 피드백 혜택은 구분.
- 공유 이벤트 콘텐츠/페이지를 7개 유의사항으로 정리. 만19세·대상범위·중복수령 제한, 배지와 인증배지 구분, 광고30일의 범위와 성과 비보장, 상품권의 발급별 조건 사전 안내, 최소 개인정보·광고활용 별도 동의, 부정참여 사유 확인/이의·소급 불이익 제한을 명시. 제목/4개 일러스트/혜택 금액/인원 유지.
- 서버 확정 정책과 대조: 직접 받은 프로모션콩 출금불가·후원수익만 가능, 최소1,000콩(총액10만원)·20% 수수료·실지급8만원, 보류/동결/본인계좌 확인, 베타 실제 은행송금 비활성. 100콩만으로 최소 출금 미달. 중요한 제한은 콩 혜택 카드에도14px로 표시하고, 유의사항은 소제목·14px 본문으로 표시.
- 공식 근거: 기만적인 표시·광고 심사지침(핵심 제한 누락/축소), 개인정보 보호법15·16조(2026-09-11 시행), 배민선물하기 상품권약관(발급 방식별 유효기간/연장/환불 조건 차이). 적용 판단/확인일·사용자 결정과 운영 미정사항은 docs/audit/event-terms-20261026.json. 법률 적합성 전체 검수라고 주장하지 않음.
- 검증: 기존 이벤트 unit3, 레이어/타입 검사 통과. 로컬3010 Chromium 목업320/390/1280·서비스390/1280 및 WebKit목업390에서7소제목/18항목·카드 제한·동일 제목 크기·14px 본문·가로넘침없음·JS오류0·목록↔상세/고객센터 경로 확인. 모바일7항목·콩카드 육안 확인. 첫 브라우저 실패는 문장 일부만 exact로 찾은 검증 선택자 오류였고, 전체문장 선택으로 수정 후6조건 통과. 긴 내부스크롤 영역의 단일 캡처는 전체 육안증거로 사용하지 않고 항목별 스크롤 캡처로 보완.
- 미정/다음: 행사 기간·참여방법/완료기준·접수/선정/지급일, 광고 시작/종료·적용/장애 처리, 상품권 발급상품/등록기한/유효기간·연락/재발송 절차, 실제 지급용 개인정보 안내, 중복참여 확인/지급 기록 운영. 베타 배지 지급·표시 설정 및 광고30일 적용 실행은 이 안내 변경으로 구현된 것이 아님. 모집/지급 전 별도 준비 필요.
- 운영 배포·계정/금융/DB/실제 혜택 지급·메시지 발송 없음. AGENTS와 기존 미커밋 보존, 커밋/푸시 없음. 문서 현행화·소스 해시·실행 결과는 위 증거 파일 참조. 운영은 직전 promotion-payout-20261026 상태를 유지.

## 모든 프로모션 후원 수익 출금 (2026-10-26, 운영 배포 완료)

- 사용자 확정: 이번 이벤트 한정이 아닌 모든 프로모션콩 후원 수익 출금 허용. 과거 수신 lot도 지급·후원 출처가 검증되면 포함. 직접 구매/지급받은 잔액은 출금 불가, 수수료20%·최소1,000콩(총액10만원/실지급8만원)·PIN/본인계좌·수요일·BETA/BANK 가드 유지.
- 일반/프로모션 후원 원본을 보존해 예약·관리자/은행 반려·완료·중복·동시 요청을 처리. 기존 `reserved-paid` 공동 예약 계정과 lot allocation으로 정확히 원종류 복원. 공통 지갑/스튜디오/목업과 별도 콘솔의 회사 부담 출금 재원 표시 일치. 이벤트에 “* 프로모션 콩은 후원받은 사람이 출금할 수 있습니다.” 우측하단 보조 문구 반영.
- 서버 빌드/격리MySQL·PG/은행 대역·Swagger36, front 레이어/타입/단위355, admin 타입/단위5 통과. 프론트 E2E 고유3개(첫2개+실패1개 selector 보정 재시험), admin E2E2개 통과. 순수 프로모션·혼합 출금·출처 누락/동결/보류·직접 출금/자기후원 차단·중복과 잔액 보존 검사. 실제 은행/PG 송금 검증 아님.
- API/worker/front/admin `promotion-payout-20261026` 운영 반영. 기존 운영 대비 runtime server5/front6/admin1 파일 변경. 3 amd64 빌드, 실행소스server203/front646 SHA·3이미지 RootFS/manifest, 16HTTPS·6컨테이너·새worker 정상. DB25 migration·금융건수·잔액해시·수수료정책 불변. DB/proxy 유지, 백업 `/opt/crefans-backup-promotion-payout-20261026`.
- 운영 Chromium390/1280·WebKit390에서 목업지갑3,050콩/프로모션50콩, 목업·실서비스 이벤트 우측 보조문구/넘침없음 확인. PC 목업3,050콩 혼합출금에 일반3,000·프로모션50·실지급244,000 표시. WebKit 최초 강제 페이지 전환 중 미리읽기 중단 오류는 독립 페이지 진단에서 해당 요청200·오류0 확인 후 요청 종료를 기다리는 검사로 전체 재통과; 제품 코드 변경/오류 숨김 없음.
- BETA=true, 실제 판매승인/은행출금=false 및 가입 gate 보존. 운영 콩후원/출금 실이력0건이므로 금융 종단은 격리DB·대역 범위. 실제 지급·메일·회원정보 변경 없음. 관리자 내부 화면은 격리 E2E와 배포이미지 동일성, 운영은 로그인 보호 검사 범위.
- 증거: front `docs/audit/promotion-payout-20261026.json`; 코드/근거는 server `docs/platform-api.md` 최신 절. 과거 이벤트 정책 질문은 이번 승인·배포로 해소. 용량은 로컬 동일 복구본이 있는 미사용 구이미지6개만 정리, 현재/최근복구본·DB볼륨 유지. 세 리포 누적 미커밋·AGENTS 보존, 커밋/푸시 없음. 다음: 운영 피드백, 별도 실판매/은행 개방 검수.

## 이벤트 프로모션 콩 출금 보조 문구 (2026-10-26, 당시 보류·상단 배포로 해소)

- 사용자 요청: 프로모션 100콩 카드에 “프로모션 콩은 후원받은 사람이 출금할 수 있습니다.” 추가. 기존 공통 rewardDetails로 별표 시작·오른쪽 정렬·작고 옅은 문구 유지. 하단 주의 문구는 지급받은 참여자의 직접 출금 불가와 후원 사용을 구분하도록 정리.
- **당시 운영 배포 보류(현재 해소)**: 당시 server bean-policy.ts promotionCashWithdrawal=false, bean-ledger.ts는 earned-paid만 허용, beans.service.ts eligible도 earned-promotion 제외. UI 문구 수정으로 출금 기능이 완성된 것이 아님. 관련 unit의 기대 문구만 갱신하고 출금/DB/정책·운영 변경 없음.
- 사용자에게 이번 이벤트 지급콩만 허용할지 전체 프로모션콩 후원수익을 허용할지 선택 질문 전달. 응답 전 금전 정책 확대 금지. 다음: 범위 확정 후 서버·원장/출금반려/집계·안내를 일치시키고 관련 검증 후 게시. 기존20%수수료/최소출금 조건 유지.
- 이벤트 기존 검사3건 통과. 로컬 Chrome390에서 문구·11px·우측정렬·옅은색·가로넘침없음 확인. 금융 검증·운영 배포 미실행. 검증/코드 해시·미커밋 상태: docs/audit/event-promotion-note-20261026.json. AGENTS 불변·누적 변경 보존.

## 이벤트 목록 배너 꺾쇠 제거 (2026-10-26, 운영 배포 완료)

- 배너 우측 꺾쇠만 제거한 built-in image_gen 결과를 적용. 오픈베타 제목·설명·일러스트·3:1 구도 유지 육안확인. 원본/프롬프트는 design/beta-event-concepts/20261026/09-event-list-no-chevron-v3.png 및 generation.json. 공통 공개콘텐츠가 list-banner-openbeta-v3.webp를 참조해 목업/서비스 동일 반영, 전체 배너 상세링크 유지.
- 레이어/타입/단위353·격리 amd64 빌드 통과. 로컬390/1280 및 운영 목업/서비스390/1280에서 새이미지 로딩·가로넘침없음·화살표없음, 배너→상세→뒤로 확인. 운영콘솔오류0·공개이미지HTTP해시 일치. 화살표 제거/그림 보존 판단은 육안검토이며 픽셀동일성 자동검사로 주장하지 않음.
- frontend event-banner-clean-20261026 배포. 기존운영 대비콘텐츠참조1개+이미지/출처2개만 변경.646실행파일 SHA·이미지레이어 일치,12HTTPS·6컨테이너 정상. API/worker/admin/DB/proxy 보존. 복구 /opt/crefans-backup-event-banner-clean-20261026. 증거 docs/audit/event-banner-clean-20261026.json.
- 현재 디자인문서·검증증거 현행화, AGENTS·누적미커밋 유지. 혜택·계정·금융·DB 변경 없음. 다음 운영피드백.

## 행사명 크레팬스 오픈베타 통일 (2026-10-26, 운영 배포 완료)

- 공통 이벤트 제목·본문제목·탭제목·화면 카탈로그·배너 이미지를 크레팬스 오픈베타로 통일. 목업/서비스 동일반영. 기존 /events/beta-first URL·행사혜택·디자인 유지. 과거 시안/생성프롬프트/배포증거는 역사기록으로 보존.
- built-in image_gen text-localization으로 기존 배너 첫줄만 변경. design/beta-event-concepts/20261026/08-event-list-openbeta-v2.png와 generation.json에 원본/프롬프트 보관. public/brand/events/beta-first/list-banner-openbeta-v2.webp로 웹최적화(2172×724,87,384바이트), 새파일명으로 캐시 구분.
- 활성 소스·현재 화면문서·서버 생성계약에서 구명칭0건 확인. 레이어/타입/단위353·격리 amd64 빌드 통과. 로컬 모바일320/390·PC1280 및 운영 목업/실서비스390/1280 목록/상세에서 새제목·탭제목·배너·기존상세이동 확인, 가로넘침/운영콘솔오류없음.
- frontend openbeta-name-20261026 운영 배포. 기존운영 대비소스2개+새배너/출처2개만 반영,644실행파일 SHA 및 이미지레이어 일치,12HTTPS·6컨테이너 정상. 배너 운영HTTP해시 일치. API/worker/admin/DB/proxy 유지. 복구 /opt/crefans-backup-openbeta-name-20261026.
- 현재 문서와 생성계약 현행화, 증거 docs/audit/openbeta-name-20261026.json. AGENTS/누적미커밋 보존. 실제혜택지급·금융/DB 변경 없음. 다음 운영피드백.

## 이벤트 단일 배너·컬러 상세 운영 배포 (2026-10-26, 완료)

- 승인한3:1 목록 배너 하나를 전체 상세 진입 링크로 적용. 별도 제목/설명/기간 박스를 제거하고 접근성 이름·공통 서비스 안내 유지. WebP2172×724·86,310바이트로 최적화, 원본·변환 해시 보존.
- 앞서 구현한 네 컬러 카드 HTML 상세·Pretendard Black/Regular·투명 일러스트4개 동시 반영. 목업/실서비스/디자인시스템 공통 UI. 아래 시안·컬러상세의 당시 미배포 상태는 이번 배포로 해소.
- 레이어/타입/단위353·격리 amd64 운영빌드 통과. 로컬 목록320/390/1280 및서비스390, 상세390/1280 검증. 운영 Chrome 목업/실서비스 목록·상세390/1280, 서비스320 목록·상세에서 배너1개/3:1/이미지로딩/가로넘침없음, 제목4개 동일크기/900/#080d3b, 조건문구 작고우측정렬 확인. 배너→상세→뒤로 이동·콘솔오류없음 확인.
- frontend beta-event-banners-20261026 운영배포. 기존운영 대비소스4개+에셋/폰트11개만 반영.642실행파일 SHA·이미지레이어 일치,12HTTPS·6컨테이너 정상, 배너/일러스트/폰트7개 운영HTTP해시 일치. API/worker/admin/DB/proxy 보존. 복구 /opt/crefans-backup-beta-event-banners-20261026.
- 증거 docs/audit/beta-event-banners-deployment-20261026.json. 로컬API 오프라인 안내는 기존상태이며 운영서비스에서는 정상 렌더 확인. 실제 보상지급/정책/금융/DB 변경 없음, AGENTS·누적 미커밋 보존. 다음 운영피드백.

## 이벤트 목록 단일 배너 시안 (2026-10-26, 디자인·미적용)

- 사용자: 이벤트 안내 목록은 배너 하나만 두되 먼저 배너 디자인. 현 단계는 시안 제작만 진행하며 기존 목록 JSX/CSS와 상세 구현은 변경하지 않음.
- 3:1 가로 배너: 좌측 별배지·상품권·콩2개, 우측 ‘크레팬스 베타 1기 / 참여 감사 이벤트’ 남색 큰 제목. 라벤더→옅은민트 배경, 작은 우측하단 ‘* 한정판 배지와 참여 혜택을 확인해 보세요.’, 우측 화살표.
- built-in ImageGen, design/beta-event-concepts/20261026/07-event-list-banner-v1.png 및 .generation.json에 원본·프롬프트 기록.2172×724·복사SHA 확인, 문구/단일배너/일러스트 육안검토. 증거 docs/audit/beta-event-list-banner-20261026.json.
- AGENTS 유지, 제품검사/배포 없음. 컬러 카드 상세도 직전 구현 완료·미배포 상태 유지. 다음: 디자인 피드백 후 목록을 이 배너 한 개의 상세 진입 링크로 변경(기존 추가 설명 박스 제거).

## 베타 이벤트 컬러 카드 HTML 구현 (2026-10-26, 구현·검증 완료 / 미배포)

- 승인 시안06-color-banner-v1을 공통 이벤트 상세에 적용. 네 파스텔 라운드 카드, 좌측 개별 일러스트·우측 같은 크기 남색 제목·우측하단 작은 조건 문구. 광고상품30일은 제목에 표시, 실제 혜택/대상/금액 유지.
- 이벤트 영역 전용 Pretendard v1.3.9 원본 Black/Regular 서브셋을 로컬 제공해 PC·모바일 글꼴 일치. 공식 출처·OFL LICENSE 보관. image_gen으로 시안 일러스트4개를 투명 분리, color-cards-v1/512px WebP와 generation.json 보관.
- 공통 EventDetailPage 및 목업·실서비스·디자인시스템 동일 UI 유지. 합격조건: 제목 네 개 computed 크기/굵기/색 일치, 조건문구 우측정렬·제목보다 작음, 모바일320/390/PC1280 가로넘침 없음,4에셋 및 글꼴 로딩, 목록/상세 복귀 정상.
- 레이어·타입·단위353검사 통과. Chrome 목업320/390/1280 및 로컬실서비스390/1280에서 제목 동일크기/900굵기/#080d3b, 보조문구우측정렬/#626b8b/작은크기,4색배경·에셋 로딩·가로넘침없음 확인. 목록↔상세 이동·하단안내 스크롤 확인. 글꼴2·WebP4 로컬HTTP 해시 일치. 증거 docs/audit/beta-event-cards-implementation-20261026.json.
- 로컬API는 기존처럼 오프라인이라 실서비스 경로에 연결안내가 있지만 공개이벤트는 렌더됨. 이번 요청은 코드 구현, 운영은 앞선 beta-event-html-20261026 유지. 결제/계정/보상지급 로직 변경 없음. AGENTS 유지. 다음: 사용자 검토 또는 배포 요청시 이번 카드 버전 배포.

## 배달앱 카드형 참고 이벤트 시안 (2026-10-26, 제안 이미지·미배포)

- 사용자 첨부 배민 이벤트 목록을 시각 분석: 가로형 라운드 카드, 좌측 큰 일러스트·우측 굵은 제목, 카드별 배경색, 작은 보조조건. 이를 크레팬스 보라/하늘/민트/핑크 네 카드로 재구성.
- 기존 확정 혜택 유지: 원년멤버 한정판 뱃지 / 크리에이터3명 주목할 크리에이터 광고상품30일 / 팬13명 프로모션100콩 / 유용한 피드백최대3명 배민1만원. 모든 보조문구는 별표+우측하단 작고옅게.
- built-in ImageGen 시안 design/beta-event-concepts/20261026/06-color-banner-v1.png 및 .generation.json에 프롬프트·참조·원본 보존.1024×1536·복사SHA 확인,4카드/문구/인원/조건 육안검토. 래스터 글자크기 동일성은 시각 판단만, 정밀 폰트 측정 주장 없음.
- 코드·운영배포·실제지급 변경 없음. 현재 운영은 앞선 HTML 상세 beta-event-html-20261026 유지. 증거 docs/audit/beta-event-color-banner-20261026.json. AGENTS 유지. 다음: 사용자 디자인 피드백 후 적용 요청시 공통 HTML/CSS와 분리에셋으로 구현.

## 베타 이벤트 HTML 상세·에셋 분리 (2026-10-26, 운영 배포 완료)

- 최신v7시안 기준 통이미지 및 중복 혜택표를 공통 EventDetailPage HTML·CSS로 교체. 모든 혜택 제목은 같은 CSS 크기, 보조문구 우측하단 작고옅게. 목업/서비스/디자인시스템 같은 컴포넌트 사용.
- 배지·왕관·콩2개·상품권을 ImageGen 투명 개별 에셋으로 분리 후512px WebP로 최적화(합164386바이트). public/brand/events/beta-first/의 generation.json에 프롬프트·원본·해시 보존. 목록도 배지 에셋 사용, 기존 통이미지 파일은 기록용으로 보존.
- 콘텐츠 현행화: 원년멤버 한정판 뱃지 / 크리에이터3명 광고상품30일 / 팬13명 프로모션100콩 / 피드백최대3명 배민1만원. 일정·선정·실제 지급은 기존 별도안내 유지.
- 레이어·타입·단위353/운영빌드 통과. Chrome 로컬320/390/1280·운영서비스320/390/1280/목업390/1280에서 제목동일크기(모바일18/PC32)·작은우측정렬안내·가로넘침없음·이미지4개 로딩·통이미지미사용 확인. 목록→상세→뒤로·카탈로그빈/없는상태 확인. 로컬API는 오프라인 배너가 있었으나 공개상세는 렌더됨, 운영에서는 오류안내/콘솔오류없음.
- frontend beta-event-html-20261026 운영 배포. 631실행파일 SHA·이미지레이어 일치,9HTTPS·6컨테이너 정상, 개별에셋 HTTP해시 일치. API/worker/admin/DB/proxy 보존. 복구 /opt/crefans-backup-beta-event-html-20261026. 검증 docs/audit/beta-event-html-20261026.json. AGENTS 유지. 실제지급/일정확정은 별도, 다음 운영피드백.

## 베타 이벤트 광고상품 명시·제목 크기 통일 (2026-10-26, 수정 시안·미배포)

- 두 번째 항목 제목을 ‘주목할 크리에이터 광고상품’으로 변경하고 크리에이터3명·30일 이용권 제공을 우측하단 작은 안내로 명시. 직전 시안의 두 번째 배민상품권 표기를 대체. 맨 아래 피드백 최대3명 배민1만원 유지.
- 네 혜택 제목 크기/굵기를 시각적으로 통일, 특히 ‘프로모션 100콩’ 과대 강조 축소. 상단행사 제목/감사부제·4개 일러스트·작고옅은 우측하단 보조문구 유지.
- ImageGen 최신 시안 design/beta-event-concepts/20261026/03-editorial-ad-v7.png 및 .generation.json.1024×1536·복사SHA·문구/제목위계 육안검토, 증거 docs/audit/beta-event-ad-v7-20261026.json. 래스터 결과에 정확한 원본 폰트크기 동일성을 주장하지 않음.
- 운영포스터 SHA 유지, 코드변경/제품테스트/배포 없음. 다음 적용 요청시 최신v7와 HTML혜택/검사를 함께 현행화. AGENTS 유지.

## 베타 이벤트 피드백 상품권 변경 (2026-10-26, 수정 시안·미배포)

- 사용자 명시: 맨 아래 유용한 피드백 최대3명 혜택 ‘5천원 상품권’을 ‘배민 1만원 상품권’으로 변경. 크리에이터 혜택은 직전 시안 유지. 현재 시안에는 두 혜택 모두 배민1만원으로 표기.
- ImageGen 편집 최신 시안 design/beta-event-concepts/20261026/03-editorial-feedback-v6.png 및 .generation.json에 원본/프롬프트 보존. 작은 옅은 우측하단 보조문구·타이틀·일러스트·100프로모션콩 유지.
- 1024×1536·복사SHA·변경문구와 유지영역 육안검토. 증거 docs/audit/beta-event-feedback-v6-20261026.json. 운영포스터 SHA 유지, 코드변경/제품테스트/배포 없음. 다음 적용시 최신v6와 HTML 혜택설명·검사를 함께 현행화. AGENTS 유지.

## 베타 이벤트 보조 문구 위계·정렬 수정 (2026-10-26, 수정 시안·미배포)

- 사용자 기준: 표시여부 선택 등 혜택 보조 문구는 모두 각 혜택 영역 오른쪽 아래, 작은 글씨·옅은 회색·우측정렬로 표시. 대상인원/프로필노출/30일노출/일정 안내도 같은 원칙 적용. 기존 별표와 자연어 문구 유지.
- ImageGen 편집 최신 시안 design/beta-event-concepts/20261026/03-editorial-footnotes-v5.png 및 .generation.json. 상단 타이틀·감사부제·4개 일러스트·혜택 제목/금액 유지. 배민1만원·100프로모션콩·5천원상품권 그대로.
- 1024×1536·원본복사 SHA 확인, 모든 보조문구 우측하단/작고옅게·한글내용·일러스트 육안검토. 증거 docs/audit/beta-event-footnotes-v5-20261026.json. 운영포스터 SHA 유지, 코드변경/제품테스트/운영배포 없음. 다음 적용 요청시 최신v5와 이벤트 설명의 배민 문구를 함께 반영. AGENTS 유지.

## 베타 이벤트 크리에이터 선물 문구 수정 (2026-10-26, 수정 시안·미배포)

- 크리에이터3명 혜택을 ‘1만원 상당 선물’에서 ‘배민 1만원 상품권’으로 변경. 기존 타이틀·배치·일러스트4개·30일 노출·팬100프로모션콩·피드백5천원 상품권 유지.
- ImageGen 편집 최신 시안 design/beta-event-concepts/20261026/03-editorial-baemin-v4.png 및 .generation.json에 원본·프롬프트 보존.1024×1536·복사SHA 확인, 변경문구/일러스트/나머지혜택 육안대조.
- 증거 docs/audit/beta-event-baemin-v4-20261026.json. 운영포스터 SHA 유지, 앱코드/제품테스트/배포 변경 없음. 향후 적용시 이벤트 데이터·관련검사도 배민 문구로 함께 반영. AGENTS 유지.

## 베타 이벤트 첨부 시안 유지·텍스트만 수정 (2026-10-26, 수정 시안·미배포)

- 사용자 정정: 앞선 텍스트 전용 03-typography-v2는 원하는 디자인이 아님. 사용자가 첨부한 초기3번 시안의 상단 타이틀/감사 부제·별배지/왕관/콩2개/상품권 이미지·좌측이미지 우측텍스트 배치·보라색·구분선·배경을 유지하고 문구만 변경해야 함.
- 첨부 기준 ImageGen 텍스트 편집: ‘원년멤버 한정판 뱃지’ 한줄, ‘* 프로필 페이지에 노출됩니다.’, 혜택 보조 문구 모두 별표+자연어. 팬13명 우측하단 작은 문구. 상단 타이틀/부제는 최신 유지 지시를 우선해 별표 없이 원문 유지. 혜택/대상/금액 불변.
- 최신 시안 design/beta-event-concepts/20261026/03-editorial-text-v3.png, .generation.json. 사용자 첨부 원본 03-editorial-user-reference.jpg 보존. 1024×1536·복사해시 확인, 제목/일러스트4개/배치·문구 육안대조. 생성 편집 결과를 픽셀 단위 동일하다고 보장하지 않음.
- 증거 docs/audit/beta-event-editorial-text-v3-20261026.json. 기존 운영포스터/소비코드 SHA 유지, 제품 테스트/운영 배포 미실행. 다음: 이 최신 시안을 기준으로 후속 피드백/적용. 앞선 텍스트전용v2로 되돌리지 말 것. AGENTS 유지.


## 베타 이벤트 타이포그래피 전환 (2026-10-26, 수정 시안·미배포)

- 사용자 후속 요청: 플랫 수정본의 문구를 유지하고 타이포그래피 중심으로 변경. 큰 일러스트/색상카드 제거, 흰 배경·네이비 제목·보라 수치·얇은 구분선으로 구성.
- ‘원년멤버 한정판 뱃지’ 한줄, 프로필 노출 안내, 모든 보조문구 별표+문장형, 팬13명 우측하단 유지. 기존4개 혜택/인원/표시 선택/일정 별도 안내 문구 육안 대조.
- ImageGen으로 design/beta-event-concepts/20261026/03-typography-v2.png 제작. 동일 경로 .generation.json에 입력/프롬프트 보존.1024×1536·원본복사 SHA 확인. 증거 docs/audit/beta-event-typography-v2-20261026.json.
- 운영포스터·소비코드 유지, 앱 테스트/재배포 미실행. 다음: 시안 피드백 또는 운영 적용 요청 시 문구/이미지 함께 반영. AGENTS 유지.


## 베타 이벤트 플랫 시안 문구 수정 (2026-10-26, 수정 시안·미배포)

- 사용자 선택: 5개 중 라운드 플랫. 배지 영역 큰 제목을 ‘원년멤버 한정판 뱃지’ 한 줄로 변경, ‘* 프로필 페이지에 노출됩니다.’ 추가. 모든 보조 문구(인원·지급·노출·일정·상단 감사 문장)를 별표(*)로 시작하는 자연어 문장으로 통일.
- 참여자 전원·표시숨김 선택·크리에이터3명/1만원/30일·팬13명/100프로모션콩·피드백최대3명/5천원 정책 유지. 팬13명은 팬 혜택 영역 우측하단 작은 보조 문구 유지.
- ImageGen 편집으로 design/beta-event-concepts/20261026/02-round-flat-v2.png 및 .generation.json 저장. 1024×1536, 제목 한줄·별표·정확한 한글·혜택 육안 검토, 원본복사 해시 일치. 증거 docs/audit/beta-event-flat-v2-20261026.json.
- 운영 포스터/소비코드는 아직 기존 이미지 유지(운영 배포본 SHA 대조). 앱 로직 변경/제품 테스트/운영 재배포 없음. 다음: 이미지 후속 피드백 또는 배포 요청 시 HTML 혜택 설명과 함께 적용. AGENTS 유지.


## 베타 이벤트 이미지 5개 비교 시안 (2026-10-26, 선택 전·미배포)

- 사용자 수정: 팬 참여자13명을 제목/배지로 강조하지 않고 팬 혜택 영역 오른쪽 아래 작은 보조 문구로 이동. 프로모션100콩 및 기존 모든 혜택·대상 수 유지.
- ImageGen 내장 도구로 ①소프트3D ②라운드플랫 ③타이포그래피 ④민트·콩 ⑤딥퍼플 5개 제작. design/beta-event-concepts/20261026/ 에 PNG5개와 prompts.json 보존, 대화에 번호별 이미지 표시. 각1024×1536, 한글·혜택4개·13명 우측하단 배치 육안 확인.
- 운영 이벤트 이미지/페이지는 기존 beta-events-20261026 유지(원본 SHA-256 일치). 비교 시안 요청으로 아직 소비 코드에 연결/배포하지 않음. 선택 후 해당 이미지를 교체하고 브라우저 확인·배포하면 됨. 추천1번(현재 브랜드 분위기 연속성).
- 증거 docs/audit/beta-event-concepts-20261026.json: 이미지5개 크기/해시·복사동일성·프롬프트·육안검토 범위. 제품 로직 변경 없음, 앱 테스트/운영 재배포 미실행. AGENTS 유지. 다음: 사용자가 시안 선택, 기존 일정/혜택 지급 기능 미결정은 계속 별도.


## 베타 1기 감사 이벤트 안내 (2026-10-26, 운영 배포 완료)

- 사용자가 확정한 혜택: 참여자 전원 ‘크레팬스 베타 1기’ 선택 표시 배지, 크리에이터3명 각1만원 선물+주목할 크리에이터30일 노출권, 팬13명 각100프로모션콩, 유용한 피드백 최대3명 각5천원 상품권. 아래 이전 미확정 제안의 금액·기간을 대체한다. 기간·지급일·선정기준은 아직 별도 안내이며 임의로 정하지 않음.
- ImageGen으로 보라·분홍 선물/배지·초록콩 상세 포스터1024×1536 제작, 한글·4개 혜택 육안검토. public/brand/events/beta-first.png 및 generation.json에 원본 프롬프트 기록.
- /preview/events 목록, /preview/events/beta-first 상세와 /service 동일 경로. 공통 EventPages에 공식 정적 편집 콘텐츠(lib/content/events.ts)를 주입. 공지사항 별도, PC사이드바·빈피드푸터·모바일설정·공통 서비스안내 링크. 상세 HTML 혜택·일정·프로모션콩 출금불가 안내, 미등록 상세는 notFound 화면. Next.js14 스트리밍은 HTTP200을 유지할 수 있어 상태코드와 화면을 구분해 검사([공식 문서](https://nextjs.org/docs/14/app/api-reference/file-conventions/not-found), 확인2026-10-26).
- 배지 실제 발급·표시숨김 기능, 혜택 지급·선정·30일 노출 실행은 이번 안내 작업에 포함하지 않음. 이미지의 배지 표현은 행사 시안이며 인증배지와 별도. 금융·DB·계정 정책 변경 없음.
- 공통 레이어/타입/단위353 통과. 로컬 Chrome320/390/1280 가로 넘침 없음, 목록→상세→뒤로·모바일설정 진입·4혜택·이미지로드 확인. 운영 Chrome390/1280에서도 목록→상세→뒤로·설정·PC사이드바·실서비스 비로그인 상세·4혜택·이미지 로드 확인. 로컬 실서비스 API 오프라인 안내는 관측했으나 운영 실서비스는 오류안내 없음. AGENTS 유지.
- frontend beta-events-20261026 배포. 실행626파일 해시·이미지레이어 일치,6HTTPS·6컨테이너 정상, API/worker/admin/DB/proxy 보존. 복구 /opt/crefans-backup-beta-events-20261026. 문서60·카탈로그52 계약 확인. 증거 docs/audit/beta-events-20261026.json. 다음: 참여기간/지급·선정 일정 확정 및 실제 배지·혜택 지급 구현은 별도.


## 좋아요·저장 선택 색상 유지 (2026-10-26, 운영 배포 완료)

- 운영 시온 게시물에서 좋아요→저장 후 aria-pressed=true인데 하트 color/fill이 rgb(84,91,112)로 남는 현상 재현. 후원 버튼 제외용 :not 속성이 공통 기본색 선택자의 우선순위를 높여 .liked/.saved 상태 색상을 덮음. hover 때만 빨간색이 보였음.
- 공통 social.module.css 기본 버튼 선택자에 :where를 적용해 상태 색상 우선. 좋아요 빨강·저장 테마색·댓글 열림 상태 유지. 데이터/후원/결제/권한 로직 변경 없음. 목업·서비스·피드·상세·갤러리 공통 PostActions에 적용.
- front 레이어/타입/단위350 통과. 로컬 Chrome390/1280 상세·갤러리에서 저장 및 후원 모달 열고 닫은 뒤 빨간 하트 유지, 저장 선택색 및 좋아요 취소 빈 하트 확인. e2e/preview.spec.ts에 같은 회귀 시나리오 추가, PC/모바일2개 검사 목록 등록 확인. 이번 브라우저 검증은 cua_repl 직접 실행이며 Playwright 테스트 러너 본 실행으로 표기하지 않음.
- frontend post-action-colors-20261026 운영 배포. 이전 운영 소스와 비교해 CSS1개 변경만 포함. 620개 실행 파일 해시 일치·4HTTPS·6컨테이너 정상. API/worker/admin/DB/proxy 컨테이너 유지, DB변경·실후원 없음. 운영 Chrome390/1280 상세·갤러리 동일 연속조작 재검증 완료.
- 배포 전 로컬 공간 부족으로 미사용 Docker 빌드캐시만 정리. 실행 컨테이너·배포/복구 이미지·DB볼륨 보존. 복구 /opt/crefans-backup-post-action-colors-20261026. 증거 docs/audit/post-action-colors-20261026.json. AGENTS 유지, 다음 운영 피드백.

## 베타 참여 감사 혜택 조사·제안 (2026-10-26, 미확정)

- 사용자 질문에 대한 제안이며 지급·기능 구현·운영 정책 변경은 하지 않음. 기존 20% 수수료 및 프로모션콩 출금 불가 유지. `../crefans_server/src/platform/bean-policy.ts`에서 promotionCashWithdrawal=false 확인.
- 권장안: 참여 완료자 전원 선택 표시 가능한 베타 파트너 기념배지(인증배지와 구분). 크리에이터3명은 각3만원 선물+정식오픈 후 주목할 크리에이터7일 순환노출. 팬13명(구독자12+비구독자1)은 각5천원 선물+100프로모션콩. 유용한 피드백 최대3명 추가1만원. 선물은 베타 종료 후 지급, 향후 노출은 출시 후 진행하는 제안.
- 가정 계산: 내부 관리자 제외16명, 3×30000+13×5000=155000원; 추가보상 상한30000원 포함185000원. 프로모션콩1300개는 별도 비현금 지급이며 받은 크리에이터도 출금 불가라 현금성 사례비와 동일시하지 않음. 실제 상품 구매가격/발송비 별도 확인 필요.
- 기준 제안: 역할별 핵심 체크리스트 및 종료설문 완료, 버그 발견·긍정 평가·실결제를 지급 조건으로 삼지 않음. 금액·대상·기간·지급일·중복 지급 기준은 사용자 결정 후 공지. 영구 수수료 할인 대신 필요시 기간·상한을 둔 추가 혜택 검토.
- 공식 근거 확인2026-10-26: [Discord Early Supporter](https://support.discord.com/hc/en-us/articles/44369363856663-Discord-Profile-Badges-What-Each-Badge-Means)는 초기 후원자 감사 기념배지 사례. [Patreon Founders](https://support.patreon.com/hc/en-us/articles/9943809610253-What-is-the-Founders-plan)는 초기 창작자 우대요금 사례이며 크레팬스 보상금액의 업계표준 근거는 아님. 권장 금액은 초기 규모·예산을 고려한 자체 제안.
- 조사 증거: `docs/audit/beta-rewards-recommendation-20261026.json`. 다음: 사용자 선택 후 세부 지급기준 확정. AGENTS 유지.

## 후원 유형·출금 출처 운영 배포 (2026-10-26, 완료)

- API/worker/프론트/독립 관리자 콘솔 `tip-attribution-20261026` 배포 완료. 게시물·프로필 후원, 당시 게시물 제목, 유형별 받은후원, 출금에 실제 포함된 후원 출처와 수수료·실지급 표시 반영. 아래 구현 당시 미배포 기록은 이번 배포로 해소됨.
- DB·설정 백업 후 nullable 제목 snapshot migration `20261026120000_tip_attribution` 적용(총25개). 기존24개 checksum·금융건수·정책 유지. 6컨테이너 정상, 재시작/OOM 없음, 새worker failures={} 확인. 운영 실행소스 server203/front620 SHA 및 세 이미지 RootFS·릴리스·소스manifest 일치. DB/proxy 컨테이너 보존.
- 3개 amd64 운영빌드·14HTTPS검사 통과. 운영 Chrome 모바일390 보낸후원 제목검색/이동내역 구분, PC1280 스튜디오 집계/목업출금1,200콩의 게시물1,200·프로필0·수수료24,000·실지급96,000 표시 확인. 실제 금융 실행 없음. 관리자 운영 로그인 보호 확인; 로그인 세션 부재로 내부 화면은 이전 격리 E2E와 배포 이미지 동일성으로 범위를 구분함. 실제 운영 후원·출금은0건이므로 실데이터 종단 검증으로 확대하지 않음.
- 기존 초대가입 gate(signupReady=false)·실판매/은행출금 비활성 유지. 복구 `/opt/crefans-backup-tip-attribution-20261026`(DB/.env/runtime.env). 디스크 사전 확보는 동일 레이어가 로컬 보존된 미사용 이미지5개만 정리; 현재·최근 복구 이미지/DB 볼륨 유지.
- 증거: front `docs/audit/tip-attribution-deployment-20261026.json`; 구현 검증은 `tip-attribution-20261026.json`의 당시 기록 유지. 누적 미커밋 보존, AGENTS 변경 없음. 다음: 운영 피드백 및 별도 실결제/은행출금 개방 검수.

## 후원 유형·게시물·출금 출처 표시 (2026-10-26, 운영 미배포)

- 게시물 후원/프로필 후원을 팬 보낸후원·지갑이동, 공통 스튜디오 받은후원 및 별도 관리자 콘솔에서 구분. 후원 당시 글 제목 저장·연결, 과거 미기록은 현재 제목/정보 없음으로 명시하고 원장 사유 불변. 신규 사유는 유형별 기록.
- 스튜디오 유형별 일반/프로모션 총수·건수, 관리자 live/test/promotion별 사용량. 출금 allocation을 따라 게시물/프로필 포함 수량을 표시하고, 총액·20%수수료·실지급은 기존 저장금액 사용. 충전·후원 중복합산/권한·금융 정책 변경 없음.
- 서버 build·격리 MySQL/결제·은행 대역18개(신규2), Swagger11, front 레이어/타입/단위350, admin 타입/단위5 통과. 대역 1,000일반+50프로모션 게시물후원/500일반 프로필후원→1,200출금에서 게시물1,000/프로필200·수수료24,000·실지급96,000·지급1회·확정수수료1회 확인. 제목 수정·삭제 후 보존/기존 current fallback/프로모션 출금거절도 검사.
- Chromium390/1280·WebKit390 팬 목록/검색·지갑 및PC 스튜디오 목업출금 표시 검증. 관리자 브라우저2개(격리 실API 프로모션/원장 + 응답fixture 후원분류·출금배분·지갑) 및390/1280 화면 확인. 실제 PG/은행·운영회원 금융 실행 없음.
- 초기 검증에서는 콘솔 타입 이름 오기, 브라우저 검색 role 불일치와 모달 닫힘 애니메이션 중 캡처를 수정 후 재검증했다. 테스트 성공을 실공급자/운영 검증으로 취급하지 않는다.
- 증거: front docs/audit/tip-attribution-20261026.json. 다음 운영 배포 시 API/프론트/독립콘솔과 migration20261026120000 필요. 현재 운영 이미지·DB는 변경하지 않음. 누적 미커밋 보존, AGENTS 유지.

## 팔로워·팔로잉 공개 설정 (2026-10-26, 운영 배포 완료)

- 기존 팔로잉 공개에 팔로워 공개 추가. 설정→개인정보 관리에서 각각 저장. 일반팬/크리에이터 공통, showFollowers optional로 구클라이언트 생략시 기존값보존; 잘못된타입 거절. DB show_followers 기존컬럼 사용, 새migration없음.
- API bootstrap/publicProfile에 followersPublic/followingPublic 전달. 타인의 비공개 팔로워 숫자/카운트 미전달, 비공개팔로잉 기존처리 유지. 목록403은 기존 서버정책. 본인 마이페이지도 비공개 항목 자물쇠·링크없음으로 일치.
- 격리DB4·Swagger11 통과. 모바일390/PC1280 설정 두스위치 off저장·재열기보존·개별on 통과. front 공통자물쇠 라벨 검사 갱신 후348통과.
- front/API/worker follow-privacy-20261026 운영 배포. 실행소스front619/server201 일치,14HTTPS·6컨테이너·신규worker 정상. migration24개/금융건수·정책불변. 운영목업390/1280 설정저장·독립스위치, Chromium390/1280·WebKit390 시온자물쇠/모카공개링크 통과. 실제회원 설정은 변경하지 않음. 복구 /opt/crefans-backup-follow-privacy-20261026, 증거 front docs/audit/follow-privacy-20261026.json. 다음 운영피드백. AGENTS 유지.

## 비공개 프로필 카운트 자물쇠 (2026-10-26, 운영 배포 완료)

- 공통 ProfileHeader의 private 카운트는 숫자·Link 대신16px 자물쇠와 비공개 접근성 라벨. 크리에이터/일반회원 공개 프로필에서 followersPublic=false, followingPublic=false 또는 followingCount없음 조건 적용. 본인 마이페이지 목록은 유지.
- 시온 목업 두 항목은 자물쇠·클릭불가, 모카 공개 링크 유지. front check348, Chromium390/1280·WebKit390 확인 통과.
- frontend private-count-lock-20261026 운영 배포,619소스해시 일치·기타컨테이너 유지. 운영 Chromium390/1280·WebKit390 시온 자물쇠2개/링크없음·모카공개링크 통과. API/DB 변경 없음. 복구 /opt/crefans-backup-private-count-lock-20261026, 증거 docs/audit/private-count-lock-20261026.json. 다음 운영피드백. AGENTS 유지.

## 게시물 후원 허용 설정 (2026-10-26, 운영 배포 완료)

- 스튜디오 작성/수정에 공통 Checkbox ‘이 게시물에서 후원 받기’. 기존/신규 기본허용. tipsEnabled 공통 Post/StudioContent 응답, 목업 설정 및 팬화면 연결. 전체공개 후원 가능 유지, 자기후원 차단 유지.
- postings.allow_tips 기본true migration20261026110000. saveContent 생략시 기존설정 유지, 잘못된 타입400. 후원시 게시물 행 잠금 후 비허용409 POST_TIPS_DISABLED; 기존 성공 요청 재시도는 멱등 응답 보존. UI도 비허용 글 버튼 미노출.
- front348/server build/beans16/Swagger11 통과. 격리DB 전체공개후원·설정해제차단/잔액·원장불변·재허용·생략보존·잘못된타입 검사. PC 브라우저 체크박스 기본/해제저장/재허용저장 및 공개글모달 통과.
- 운영 front/API/worker post-tip-setting-20261026 배포. DB백업후 migration적용 총24개. 실행 소스front619/server201 해시일치·6컨테이너·신규worker 정상·금융건수/설정보존·14HTTPS 통과. 운영목업PC 체크박스 저장/공개후원 및 Chromium390/1280·WebKit390 후원확인·완료·중복1명 통과. 실제금융실행 없음. 복구 /opt/crefans-backup-post-tip-setting-20261026, 증거 front docs/audit/post-tip-setting-20261026.json. 다음 운영 피드백. AGENTS 유지.

## 후원·프로필 목록 통합 운영 배포 (2026-10-26, 완료)

- frontend/API/worker social-tips-20261026 운영 반영. 후원 확인 모달, 게시물별 고유 후원자·전용모달·충전복귀, 프로필 팔로워/팔로잉 목록 및 시온 목업 비공개. PC 좌우26px·모바일 기존폭·44px높이 유지. 아래 미배포 기록은 당시 상태로 현재 모두 배포됨.
- front check348, server build, 격리DB19, Swagger11 통과. 운영 Chromium390/1280·WebKit390 반복목업후원→1명/확인완료, 충전복귀2화면, 시온·지우 관계목록8회, 너비390/700/701/1280 검증. 실제 운영 관계목록 양방향200·잘못된query400 확인. 비공개403/소유자 허용은 격리DB 검사. 실제 금융 실행 없음.
- DB 백업 후 migration20261026090000 및20261026100000 적용, 총23개. 실행중 소스 front619/server200 해시일치, 6컨테이너 정상·신규worker heartbeat확인, 금융기록 건수·20%/7일·베타/live판매/출금gate 보존,14HTTPS검사 통과. 관리자/DB/proxy 컨테이너 유지.
- 최초 전송은 서버 디스크100%로 중단(운영교체 전). 미완료 압축 제거 및 로컬 동일레이어가 보존된 오래된 미사용 프론트이미지14개만 정리해10GB 확보 후 재전송 성공. 현재/오늘 복구이미지·DB·볼륨 보존. 향후 서버 디스크도 전송 전 점검 필요.
- 복구 /opt/crefans-backup-social-tips-20261026(.env/runtime.env/database.sql), 추가 컬럼·인덱스는 앱 롤백시 유지. 증거 front docs/audit/social-tips-deployment-20261026.json, 상세 front .local/social-tips-20261026. 다음: 사용자 운영 확인. 기존 AGENTS 유지.

## PC 프로필 후원 버튼 여백 (2026-10-26, 운영 배포 완료)

- beans.module.css에서 701px 이상만 좌우26px, width calc(100% - 52px). 700px 이하 기존 모바일 너비와 높이44px 유지. 멤버십 영역과 정렬.
- Chromium390/700/701/1280 실제 치수 검사 통과. 현재 운영 profile-tip-44 소스616개 SHA-256 검증 후 해당 CSS만 추가한 격리 빌드. 미배포 프로필 목록/게시물 후원/확인 모달 작업은 포함하지 않음. 운영 API/DB 변경 없음.
- 배포 스크립트 /tmp/deploy-tip-padding.py, 결과 .local/profile-tip-padding-20261026. 운영 Chromium390/700/701/1280 재검증 통과. frontend profile-tip-padding-20261026, 기타 컨테이너 유지. 복구 /opt/crefans-backup-profile-tip-padding-20261026. 증거 docs/audit/profile-tip-padding-20261026.json.

## 프로필 팔로워·팔로잉 목록 (2026-10-26, 미배포)

- 공통 프로필 숫자 링크: 본인 기존 목록, 타인 ?profile= 경로. 공개 목록 페이지는 목업·서비스 공통. 시온 목업만 followersPublic/followingPublic=false; 다른 목업 및 운영 계정 설정 변경 없음.
- GET profiles/:id/connections: 20명 페이지, 양방향 조회, 비활성 회원 제외. 비공개는 익명/타인403, 소유자 허용. show_followers 기본true migration 추가, 기존 show_following 재사용.
- front check348, backend build, 격리DB3, Swagger11 통과. Chromium390/1280 시온·지우 양방향 진입8회 통과. 증거 front docs/audit/profile-connections-20261026.json. 운영 미배포; 다음 배포 front/API/migration 필요.

## 게시물 후원·고유 후원자 집계 (2026-10-26, 미배포)

- 기존 post_id 후원 연결 활용. 게시물 응답 및 후원 성공/멱등 응답 supporterCount=COUNT DISTINCT sender_id. 프로필 후원 제외, 개인 식별정보 미노출. post_id/sender_id 인덱스 migration20261026090000 추가.
- 공통 TipButton 게시물은 동전 아이콘+후원자 수, 전용 제목/대상게시물 카드/확인/완료 화면. 공유 모델 집계로 반복 후원1명 유지. 게시물 후원 유입 충전 완료도 같은 게시물 모달 복귀. 기존 프로필 후원 유지.
- front check348통과, server build·격리DB beans16통과. 고유회원1/2·멱등·프로필후원 제외·잘못된게시물 거절/잔액유지 확인. 기존 탈퇴테스트계정 재사용 오류는 독립fixture로 수정. Chromium390/1280·WebKit390 반복목업후원1명 유지/전용모달/확인완료 및390/1280 충전복귀 통과. 모바일 스크린샷 검토.
- 운영/실PG미실행. 다음 배포 API+front+해당migration 필요. 증거 front docs/audit/post-tipping-20261026.json. 기존 AGENTS 유지.

## 후원 제출 확인 모달 (2026-10-26, 미배포)

- 후원하기 제출은 공통 Dialog 확인창을 열며 아바타/인증/이름/핸들·수량·메시지 표시. 취소 시 입력 유지, 확인하고 후원하기만 기존 send 실행. 전송중 버튼/닫기 비활성, 기존 busy·멱등 키 유지. 오류 시 입력창으로 복귀해 오류 표시.
- check348통과. Chromium390/1280·WebKit390 목업에서 최초제출 확인창·미완료, 취소 후 입력/2600잔액 유지, 승인 후30콩 완료 및2570잔액 확인. 실제후원/배포 없음. 증거 docs/audit/tip-confirm-20261026.json. AGENTS 규약 유지. 다음 사용자 검토/배포 요청.

## 프로필 후원44px·충전복귀 운영 배포 (2026-10-26)

- 프로필 버튼 border-box 높이/min/max44px, 세로패딩4px, 콩 이미지28px.16px글자·그라데이션 유지. 앞선 후원유입 충전복귀도 함께 배포.
- check348통과. 운영 Chromium320/390/1280 높이44px·이미지·문구·모달 확인. 운영목업390/1280 후원→충전→완료→같은프로필 모달 및 일반충전 복귀버튼없음 확인. 실제PG/후원 미실행.
- frontend profile-tip-44-20261026,616이미지소스 해시일치, 기타컨테이너 유지. 복구 /opt/crefans-backup-profile-tip-44-20261026. 증거 docs/audit/profile-tip-44-20261026.json. AGENTS 유지, 다음 운영 피드백.

## 후원 유입 충전 후 복귀 (2026-10-26, 미배포)

- 후원 모달 충전 링크 tipCreator와 탭 세션 크리에이터 표시정보 저장. 충전 결제 시작 전 주문ID에 표시정보 연결해 완료 화면은 해당 주문의 정보만 참조. 성공+paid에만 지갑 위 아바타/닉네임(CreatorName 마키)/계속 후원하러가기 표시. 프로필 ?tip=1은 모달 열고 파라미터 제거. 일반충전에는 없음. 금융 승인/전송 입력으로 사용하지 않음.
- check348통과. Chromium390/1280 목업 후원→충전→완료→같은프로필 모달 및 일반충전 재진입시 버튼없음 확인. 초기 테스트 브라우저전용 전역 접근은 가드로 수정, 라디오카드 라벨/모달닫힘 대기 테스트로 보정. 증거 docs/audit/tip-charge-return-20261026.json.
- 실제PG/운영배포 미실행. 동일 탭 sessionStorage 기준으로 유지하며 저장소 차단/소실시 복귀 버튼 생략. AGENTS 규약 유지. 다음 사용자 검토/배포 요청.

## 후원 버튼16px·모달 미배포분 운영 반영 (2026-10-26)

- 프로필 후원하기14→16px. 앞선 모달 아바타/인증/핸들 및9개3행프리셋 함께 배포. frontend profile-tip-final-20261026,615소스 해시 일치, 기타 컨테이너 유지. 복구 /opt/crefans-backup-profile-tip-final-20261026.
- check348통과. 운영 Chromium320/390/1280에서16px·아바타·인증배지·9개·이미지로드·1000/5000/10000선택·잔액부족 차단·가로넘침 없음 확인. 실제후원 없음. 증거 docs/audit/profile-tip-final-20261026.json. AGENTS 유지. 다음 운영 피드백.

## 후원 모달3행 프리셋 (2026-10-26, 미배포)

- 기존6개에1000/5000/10000콩 추가, 충전 화면과 동일한 보따리/나무상자/트럭 에셋 사용. 공통 모달9개3열 구성.
- check348통과, 로컬 Chromium320/390/1280에서9개·이미지로드·세번째행 수량선택·만콩 잔액부족 비활성·가로넘침 없음 확인. 실제후원 없음. 증거 docs/audit/tip-nine-presets-20261026.json. 앞선 아바타/인증 표시와 함께 미배포. AGENTS 유지, 다음 배포 요청.

## 후원 대상 아바타·인증 배지 (2026-10-26, 미배포)

- 프로필/게시물의 creator 데이터를 TipButton으로 전달해 공통 Avatar·CreatorName 재사용. 모달 상단 프로필사진/이름/인증배지/핸들 표시. isVerified true만 배지, 사진 없는 경우 기본 아바타.
- check348통과. 이후 CSS minmax열로 긴이름 모바일 넘침 보정, 최종 Chromium320/390/1280×프로필모카/게시물모카/미인증서연9조합 아바타로딩·배지true/false·넘침0 확인. 애니메이션 종료 후 스크린샷 확인. 실제후원/배포 없음. 증거 docs/audit/tip-identity-20261026.json. AGENTS 유지, 다음 사용자 검토/배포 요청.

## 프로필 콩 이미지 + 후원하기 운영 배포 (2026-10-26)

- 공통 TipButton 프로필에 기존 soft3d-v2/10.png 콩 이미지와 후원하기 표시. 기존 그라데이션/너비 유지. check348통과, 로컬·운영 Chromium320/390/1280 이미지 로딩·문구·너비·색·모달 열기 확인. 실제 후원 없음.
- frontend profile-tip-icon-20261026 배포, 이미지615파일 해시 일치, 다른 컨테이너 유지. 복구 /opt/crefans-backup-profile-tip-icon-20261026. 디스크 사전검사 차단 후 미사용 빌드 캐시만 정리해12.8GB 확보 및 재검사 통과. 소스·볼륨·복구이미지 유지. 증거 docs/audit/profile-tip-icon-20261026.json. AGENTS 기존 규약 유지. 다음 운영 피드백.

## 프로필 후원 버튼 너비·초록 그라데이션 운영 반영 (2026-10-26)

- 프로필 버튼 추가 좌우16px 제거, width100%로 부모 콘텐츠와 일치. 지갑 walletCharge 기존 초록 그라데이션 재사용, 흰글자·48px높이·hover 유지. 게시물 후원 보조 버튼 유지.
- check348통과. 로컬 및 운영 Chromium320/390/1280 너비 일치·그라데이션·흰글자·모달 열기 통과. frontend profile-tip-green-20261026,615파일 이미지 소스해시 대조, 기타 컨테이너 유지. 복구 /opt/crefans-backup-profile-tip-green-20261026. 실제후원 없음. 증거 docs/audit/profile-tip-green-20261026.json. 사전검사 실패시 즉시 종료하는 배포 스크립트 적용. AGENTS 규약 유지, 다음 운영 피드백.

## 후원 모달 운영 배포 완료 (2026-10-26)

- frontend tip-dialog-20261026 배포,615파일 이미지 소스해시 일치. 다른 컨테이너 유지, 복구 /opt/crefans-backup-tip-dialog-20261026.
- 운영 목업 Chromium320/390/1280·WebKit390 프리셋/0·잔액부족 비활성/30콩 성공·메시지·완료·재열기 통과, 가로넘침/JS오류0. 실제 후원 실행 없음. 증거 docs/audit/tip-dialog-deployment-20261026.json.
- 최초 디스크 사전점검 실패 뒤 셸이 빌드를 계속한 실행 순서 오류 있음. 과거 생성 front-source 복사본만 정리하고10.49GB 사전점검 재통과 후 전송. 원본·해시기록·복구이미지 보존. 다음 배포는 사전검사 실패시 즉시 종료하도록 연결할 것. AGENTS 규약 유지. 다음 작업: 운영 피드백.

## 후원 모달·완료 화면 디자인 (2026-10-26, 운영 미배포)

- 공용 TipButton 모달을 콩 에셋/초록톤으로 구성. 충전의 같은 수량 이미지 재사용10/30/50/100/300/500프리셋, 직접 입력·잔액·충전 링크·메시지·전송 버튼. 기존 멱등 키/중복클릭 방지/서버 결과 처리 보존. 성공 시 BeanTip 응답 수량·메시지로 완료 화면 및 보낸 후원 링크, 확인 버튼 표시.
- postActions 일반 버튼 스타일은 직계 항목에만 적용하여 내부 공통 모달 버튼 스타일 간섭 방지. 목업/실서비스 동일 표시.
- check348통과. Chromium320/390/1280 및 WebKit390에서6프리셋·직접입력·잔액부족/0비활성·목업30콩 성공·완료/메시지/재열기·가로넘침0·pageerror0. 390px 입력/완료 스크린샷 시각 검토. 최초 브라우저 다중버튼 locator 오류는 프로필 버튼으로 좁혀 재검증. 증거 docs/audit/tip-dialog-20261026.json 및 .local/tip-dialog-20261026. 실제후원/운영배포 없음. 다음: 사용자 검토 후 배포 요청. AGENTS 기존 규약 유지.

## 후원 버튼 운영 배포 완료 (2026-10-26)

- frontend crefans-front:tip-buttons-20261026 배포. 게시물 후원 secondary 테두리+텍스트, 프로필 콩 후원 가로 확장 반영. 사전 디스크/Docker 점검 및 amd64 빌드 성공, 이미지615소스 파일 해시 대조 통과. API/worker/DB/admin/proxy 컨테이너 유지. 복구 /opt/crefans-backup-tip-buttons-20261026.
- 운영 Chromium390/1280 피드·게시물 상세·프로필 6조합에서 문구/테두리/44px높이/전체너비/후원창 열기 통과. 실제후원 실행 없음. 증거 docs/audit/tip-buttons-deployment-20261026.json, 상세 로그 .local/tip-buttons-20261026. 기존 AGENTS 배포 규약 유지, commit/push 없음. 다음: 운영 피드백.

## 후원 버튼 문구·너비 개선 (2026-10-26, 운영 미배포)

- 공용 TipButton: 게시물은 후원으로 표시하며 기존 secondary 테두리가 postActions 스타일에 제거되지 않도록 제외. 아이콘 없이 테두리+텍스트, 최소 클릭 높이44px. 프로필은 콩 후원을 유지하고 양옆16px를 제외한 너비로 확장. 목업/실서비스 동일 컴포넌트 사용.
- npm run check 348검사 통과. 로컬 Chromium390/1280에서 피드·상세·프로필 6조합 문구/테두리/높이/너비/후원창 열기 확인. 본인 하늘 대상 초기 검증은 후원 제한으로 타임아웃하여 모카로 수정 후 통과. 실제 후원·운영배포 미실행. 증거 docs/audit/tip-buttons-20261026.json.

## 이력 필터 운영 배포·로컬 저장소 최적화 완료 (2026-10-26)

- frontend/API/worker를 bean-history-20261026로 배포 완료. 주문 생성 KST CF번호·목업20/41/28예시·3이력 기간/상태/방향/검색·총수/페이지 적용. 이전 미배포 기록은 당시 상태이며 현재는 운영 반영됨.
- 로컬 Docker 디스크 부족 이미지에서 빈 파일을 소스 해시 검사로 발견해 전송 전 차단. 멈춘 backend 재시작·과거 생성압축 추가5.864GB·24시간 이상 미사용 빌드캐시5.846GB 정리. 여유9.3GiB 확인. 소스/DB볼륨/운영복구본 보존. 캐시 없는 순차 재빌드 후197server+615front 파일 해시 모두 통과.
- 운영6컨테이너 정상,14HTTPS응답,새worker heartbeat,21migration·금융건수·20%/7일·live판매/송금gate 유지. Chromium320/390/1280·WebKit390 운영 목업 필터/검색/페이지/초기화/번호/가로넘침0·pageerror0 통과. 실제결제/송금 없음.
- front infra/platform/deploy-preflight.py 추가:8GiB/엔진 사전검사, 정상·공간부족 대조 통과. 배포 build.py 연결/순차빌드, 압축 직접스트리밍, AGENTS 재발방지 기록. 증거 front docs/audit/bean-history-deployment-20261026.json 및 .local/bean-history-deploy-20261026. 복구 /opt/crefans-backup-bean-history-20261026. 다음: 운영 피드백; 새 이미지 빌드 전 사전점검 필수.

## 이력 필터 운영 배포 시도 (2026-10-26, 미배포)

- 사용자 운영 배포 승인. front/API linux/amd64 이미지 bean-history-20261026 빌드 모두 성공. 전송 전 이미지 소스 검사에서 로컬 디스크90MiB 및 Docker metadata.db I/O 오류 발생. 운영 전송/교체 전 실패하여 운영은 front bean-wallet-ui-20261026, API/worker bean-vat-20261025 그대로 실행 중임을 SSH로 재확인.
- 과거 생성 압축파일6개만 정리해2927447446bytes 확보, 소스/검증/운영복구본 보존. Docker 재시작 및 멈춘 로컬 backend/UI 종료·재실행 후 엔진은 아직 연결 불가. Docker 초기화·볼륨삭제 수행하지 않음.
- 다음: 로컬 Docker 엔진 복구 후 front .local/bean-history-deploy-20261026/probe.py와 before.json 기준선 재확인, ship.py → verify.py → browser.cjs. 빌드 컨텍스트/해시·복구 포함 deploy.sh 준비됨. 배포 완료로 보고하면 안 됨. 공개 증거 front docs/audit/bean-history-deployment-20261026.json.

## 주문번호·지갑 이력 필터 (2026-10-26, 운영 미배포)

- 공용 BeanHistoryView와 완료 영수증의 UUID 본문을 주문 생성일(KST, 초 단위) CF-YYYYMMDDHHmmss로 교체. 실제 UUID/결제/권한/멱등성 보존, 생성일 누락은 확인 불가. 목업/카탈로그 생성일 주입.
- 3이력에 전체·최근1/3/6개월·1년 칩, 주문 결제상태/이동 적립·사용/후원 크리에이터·메시지 검색과 초기화·결과총수. 서버/목업 전체 필터 후20건 페이지, 조건 변경 첫 페이지, 이전 필터 늦은 응답 제외. 카탈로그도 같은 UI와 필터 데이터 주입.
- 프론트 check348·서버 build/콩+원장+OpenAPI31검사 통과. Chromium320/390/1280·WebKit390에서 기간+상태/빈결과/초기화/페이지전환·필터 리셋/UUID 미표시·영수증번호일치/넘침0·pageerror0·실제콩API요청0 확인. 서버 격리DB에서26개주문·25개후원과 날짜 경계·소유권·잘못된 입력·와일드카드 확인. 최초 테스트의 전체버튼 가정/Date 비교/탈퇴테스트 계정 재사용을 수정 후 재검사. 증거 docs/audit/bean-history-filters-20261026.json.
- 쿠팡 공식 흐름·2025년 모바일 캡처를 조사해 참조. 현재 쿠팡 로그인UI 전체 실조작을 주장하지 않음. 실제PG/송금/운영배포 없음. 다음 배포는 API/프론트 모두 필요. 현재운영 front bean-wallet-ui-20261026 / API bean-vat-20261025 유지.

## 지갑 내역3종 목업 데이터 (2026-10-26, 운영 미배포)

- 충전 주문20건/콩 이동41건/보낸 후원28건을 새 bean-fixtures.ts에서 생성해 useMockBeans에1회 주입. 모카·지우·시온으로 연결하며 길고 여러 줄인 메시지·메시지 없음/여섯 주문 상태/다양한 수량·VAT 포함금액 포함. 공용 표시 컴포넌트와 실제 서비스/API/DB 변경 없음.
- 사용가능2,600/출금가능3,000 초기 잔액 유지. 완료충전4,000-일반후원1,500=일반2,500, 프로모션200-후원100=100으로 이력 대조. 받은일반3,000/프로모션50도 별도기록. 목록20개씩 페이지와 이후 신규충전/후원 추가 유지; 완료 주문 상세·대기 주문 이어가기 확인. 기존 목업 E2E의 상세 링크 선택만 최신항목으로 한정(예시 완료주문 다수로 변경됨).
- npm run check343개 통과. 최초 TS iterator(target ES5)오류를 forEach로 수정한 뒤 재검사. 브라우저 Chromium320/390/1280·WebKit390에서3목록/6상태·20/20/1 및20/8페이지·완료상세/대기결제/재조회 중복적립없음·가로넘침0·pageerror0·실제콩API 요청0 확인. 캡처 검수 및 초기 잔액/금액/ID유일성 별도 검사. 증거 docs/audit/bean-history-fixtures-20261026.json.
- 이번 변경은 로컬만 반영. 운영은 bean-wallet-ui-20261026로 이전 지갑UI 배포 상태 유지. 실제PG/송금/전체 금융E2E 재실행 없음, commit/push 없음. 다음: 요청 시 프론트 배포. 목업 전체 새로고침 초기화는 유지한다.

## 지갑·충전 완료·초록 CTA 운영 배포 (2026-10-26)

- 사용자 배포 지시로 프론트 bean-wallet-ui-20261026 반영. 지갑 제목·기본 펼침·한알 아이콘/초록4색 CTA/플러스 제거·2열3내역 진입/전용 페이지와 충전 완료/저장 주문 조회 개선 포함. 직전 운영 대비16실행파일 수정·3추가, mock/service/catalog 공용 유지.
- npm run check343개 및 linux/amd64 운영 빌드 통과. 새 이미지 Chromium390/1280에서 목업 충전→완료→지갑/주문 상세 및 전용내역3개 확인. 운영 Chromium320/390/1280·WebKit390에서 같은 흐름과 실제 지갑5경로 비로그인 보호 확인, 최종pageerror0. 캡처 직접 검수.22HTTPS·실행소스613파일SHA·한알PNG SHA·6컨테이너 restart0/OOMfalse 확인.
- 검증 harness 보완: 시작직후 readiness 미대기, 최적화CSS의0%/100%생략, 숨긴radio 직접클릭을 각각 서버대기/동등값 비교/보이는라벨 클릭으로 수정. WebKit 빠른 연속탐색 중 login/signup prefetch 취소는 페이지별networkidle 대기 후 전수 재실행해0 확인. 제품 코드 추가 변경 없음.
- API/worker bean-vat-20261025 유지; admin/DB/proxy 포함 나머지5컨테이너 ID·runtime.env·21migration·금융건수·20%/7일정책·가입/실판매/실출금gate 불변. 집IP SSH지속허용 유지. 복구 /opt/crefans-backup-bean-wallet-ui-20261026(front bean-vat-20261025).
- 증거 docs/audit/bean-wallet-ui-deployment-20261026.json, 재현 .local/bean-wallet-ui-deploy-20261026. 현재 이미지/소스/로그 보존, Docker 이미지로 재생성 가능한 과거 전송압축본3개(1.56GB)만 정리. 신규 전송은576,699,405바이트 privateSSH 직송 후 원격압축 삭제. 로컬 검수용 컨테이너 종료.
- 실제PG·송금·운영 로그인 계정의 금융 변경·물리iPhone 검증 미실행. 이전7개 격리DB/공급사대역검사와 이번 검증을 구분. commit/push 없음. 아래 미배포 표기는 과거시점이며 현재 지갑/완료 UI 배포 완료. 다음: 운영 피드백 대응.

## 콩 충전 버튼 초록 다색 그라데이션 (2026-10-26, 운영 미배포)

- 후속 색상 지정에 따라 풀빛 초록→그린→에메랄드→청록의4색으로 변경. 그림자/키보드 포커스도 초록. 한알 콩·흰 글씨·플러스 없음·60px·공용 목업/서비스/카탈로그 유지.
- 로컬3010 Chromium390/1280·WebKit390 표시/이미지/가로넘침/충전 이동/pageerror0 확인. 기본·hover 색상 지점 대비 최소4.65. 증거 docs/audit/bean-charge-green-blend-20261026.json. CSS만 변경해 금융검사 재실행 없음.
- 운영 배포/commit/push 없음. 기존 지갑/충전 완료 화면과 함께 배포 요청 대기; 직전 색상 검증은 당시 기록이다.

## 콩 충전 버튼 다색 그라데이션 (2026-10-26, 운영 미배포)

- 사용자 후속 요청으로 초록 CTA를 보라·자주·분홍·코랄 4색으로 변경했다. 구형 components/post/Post.tsx·components/layout/MainLayout.tsx의 보라→분홍 그라데이션을 참고하되 흰 글씨 가독성에 맞게 명도를 조정. 한 알 콩/플러스 없음/60px/동일 충전 경로와 공용 UI 유지.
- 로컬3010 Chromium390/1280·WebKit390에서4색·흰 글씨·한알 이미지·플러스 없음·60px·가로넘침 없음·충전 이동·pageerror0 확인. 캡처 검수. 색상 지점 대비 계산은 기본/hover 모두4.5 이상; 초기 hover1.04의 코랄 대비4.41을 확인해1.02로 낮췄다. 증거 docs/audit/bean-charge-multicolor-20261026.json.
- CSS만 변경. 직전 단위검사4개 결과는 당시 기록이며 이번에는 브라우저 표시/이동을 재검증했다. 금융 로직/API/PG·운영 배포/commit/push 변경 없음. 기존 지갑/완료 화면과 함께 배포 요청 대기.

## 콩 충전 버튼 초록색 적용 (2026-10-26, 운영 미배포)

- 공용 BeanChargeLink를 초록 그라데이션·초록 그림자/키보드 포커스 테두리로 변경하고 플러스 아이콘을 제거했다. 한 알 콩 이미지·흰 글씨·60px 버튼·충전 경로 유지. 목업/서비스/카탈로그에 같은 컴포넌트 적용.
- 기존 지갑 UI 단위검사4개 통과. 로컬3010 Chromium390/1280·WebKit390에서 초록 배경/흰 글씨·플러스 없음/이미지 정상·60px 높이·가로넘침 없음·충전 화면 이동·pageerror0 확인. PC/모바일 캡처 직접 검수. 증거 docs/audit/bean-charge-green-20261026.json.
- 색상/아이콘만 변경하여 금융 E2E·실PG 검증은 반복하지 않았다. 기존 미커밋 보존, commit/push·운영 배포 없음. 직전 지갑/충전 완료 화면과 함께 요청 시 배포 대기.

## 지갑 첫 화면·전용 내역 페이지 (2026-10-26)

- 제목을 지갑으로 변경하고 목업/서비스 metadata·카탈로그도 일치시켰다. 공용 BeanWalletPages.tsx: 잔액2종+36px 한 알 콩 아이콘(기존 soft3d-v2/10.png 재사용),60px 파랑/보라 그라데이션 충전 CTA, 한 행 최대2개의 충전 주문/콩 이동 내역/보낸 후원 박스 링크. 반복 애니메이션 대신 정적 그라데이션 선택. 콩 세부 내역은 기본 펼침이며 접기 가능; 공용 요약의 스튜디오에도 반영된다.
- /preview 및 /service의 beans/charges, beans/history, beans/tips 전용 화면을 추가했다. 최근 충전20건(기존 API 한계 명시), 상태·저장금액·재결제/재조회/완료 상세; 이동·보낸후원20개 페이지 이동, 사유/메시지/일시·긴 크리에이터명 공용 CreatorName 표시. 각 화면 공용 뒤로가기/로그인·기능 가드 유지. mock/live/디자인 카탈로그에서 같은 UI를 사용하며 일반/빈/로딩/오류/버튼 비활성을 등록했다.
- 보낸 후원 API 실패 시 이전 데이터를 비우고 오류를 표시하며 재조회 가능하게 보정. 목업 모델은 충전 완료 이동 기록·후원 상대 이름과 페이지 단위를 제공한다. 원장/후원/출금 계산·API/DB·운영 환경 변경 없음. 실제 충전 금액은 기존 저장값 사용.
- 최종 npm run check 343개 통과. 첫 신규 UI검사1실패는 툴팁 이미지까지 포함해 단일 img를 찾은 테스트 범위 문제를 콩 이미지로 한정해 수정. Playwright7시나리오 PASS; 최초 PC1실패는 페이지 이동 전 지갑 프로모션100콩을 클릭한 harness 경쟁을 충전 제목 대기로 수정했다. 마지막 CreatorName 재사용 후 관련 목업2시나리오/전체343검사를 다시 통과. 격리 DB·PG/은행 대역이며 실결제/실송금 아님.
- Chromium320/390/1280·WebKit390에서 기본 펼침/접기,3개 박스2열,60px충전버튼,그라데이션/한알PNG,3개 전용경로와 뒤로가기,가로넘침0/깨진이미지0/pageerror0 확인. PC/모바일 지갑 상하단 및 충전주문·후원 화면 직접 검수. 증거 docs/audit/bean-wallet-pages-20261026.json, 재현 .local/bean-wallet-pages-20261026/.
- 현재 로컬 반영 완료, 이번 요청에는 운영 배포를 수행하지 않았다. 직전 콩 완료 화면과 함께 배포 대기이며 운영은 bean-vat-20261025 유지. 다음: 요청 시 프론트 운영 배포. 기존 dirty 작업 보존/commit·push 없음. 실기기와 실제 PG 검증은 미실행. AGENTS의 공유 UI/증거 규약 유지, 문서 의미 검토 후 계약·해시 재기록.


## 콩 충전 완료 화면 (2026-10-26)

- 공용 BeanPaymentResultPage 신설: 기존 콩 이미지, 충전 수량·VAT 포함 저장 결제 금액·주문번호, 지갑/탐색 CTA. mock/live/디자인 카탈로그 같은 UI, 카탈로그에 완료/로딩/미확정/중단/실패 상태 등록. `/preview/beans/success` 직접 미리보기와 목업 충전 후 주문별 이동 연결.
- 실제 결과는 서버 소유자 주문을 먼저 조회하고 paid만 완료 표시. 콜백 결제키는 URL에서 제거하고 pending/processing만 기존 승인 경로 이용, 새로고침은 저장된 주문 조회로 복원. 기존 가격 주문 금액 유지·연속 확인 중복 호출 방지·지갑 갱신 실패와 승인 성공 분리. API/DB/금융 정책 변경 없음.
- `npm run check` 339검사 통과. 첫 실행3실패는 신규 receipt 검사에서 React 텍스트 노드 분할을 문자열 결합으로 검사하지 않은 부분과 기존 Provider 테스트2개의 navigation 대역 누락으로 수정. 최종 재검사 종료0. Playwright6시나리오 통과(격리 DB·PG/은행 대역): 목업 충전→완료→지갑/후원, 실제 승인·새로고침·잔액 단일 반영, 승인 전 직접 접근·금액 변조·타인 주문 거부, 기존 출금/PIN 회귀.
- Chromium320/390/1280·WebKit390 로컬 브라우저4조합의 수량/가격·48px버튼·이미지 정상/가로넘침0/pageerror0 확인, 모바일/PC 캡처 직접 검수. 증거 `docs/audit/bean-completion-20261026.json`, 로그·캡처 `.local/bean-completion-20261026/`. 토스 공식 성공 콜백/승인 분리 근거를 docs/service-api-binding에 기록.
- 현재 로컬 구현·검증 완료. 운영은 직전 bean-vat-20261025이며 이번 변경은 미배포. 실제 PG 결제와 물리 iPhone 검수는 하지 않았다. 다음 작업은 요청 시 운영 프론트 배포. 기존 미커밋 변경 보존, commit/push 없음. 목업 전체 새로고침 시 주문이 사라지는 기존 메모리 모델 한계 유지; 실제 주문 복원은 검증했다.


## 콩 충전 VAT포함 가격·30/50이미지 교환 운영 배포 (2026-10-25)

- 사용자 지시: 배수표기 제거,30콩=꼬치·50콩=지퍼백으로 교환. 공용 BeanChargePage의9개 카드와 접근성 이름에 VAT 포함 가격 표시,1콩 충전110원으로10% 인상. 목업 주문/요약과 실제 서버 신규 주문이 일치한다. 공개 PNG 재생성 없이 기존 원본 재사용.
- bean-pricing.ts에 프론트 공통 충전 단가/툴팁 안내, 서버 beanPolicy.chargeKrwPerBean=110. 후원·출금 가치100원/20%/최소1000콩은 보존. 기존 주문의 저장된 amount를 재시도/PG창/승인에서 그대로 사용하며 이전 주문 재산정·DB migration 없음.
- 프론트329검사/서버30검사 및 Playwright4시나리오 통과. 새가격·구가격 금액변조 거부/중복충전 방지·기존 주문 snapshot·후원·PIN/출금 지급을 격리DB와 공급사 대역으로 검증했다. 로컬/운영 각각 Chromium360/390/767/1280·WebKit390에서9이미지/9가격/VAT라벨/배수0·키보드/선택/목업충전·비로그인 가드·넘침없음,pageerror0,캡처 직접검수.
- bean-vat-20261025 프론트/API/worker 운영 반영,amd642빌드·동결소스/운영실행806파일SHA 일치,14HTTPS·9이미지SHA·6컨테이너정상·새worker heartbeat failures={} 확인. DB/admin/proxy ID·21migration·금융건수·20%/7일정책·비공개설정(이미지/APP_RELEASE 제외) 불변. 집IP SSH 유지.
- 증거 docs/audit/bean-vat-deployment-20261025.json, 재현 .local/bean-vat-deploy-20261025. Toss공식 세금/결제창문서 확인; 가격정책 구현과 세무분류/실제PG승인은 구분,판매/지급gate유지. 실결제/메일/커밋 없음. 용량확보는 과거 생성 전송압축본8개만 삭제,소스/로그/현재복구이미지 보존. 복구 /opt/crefans-backup-bean-vat-20261025(front bean-icons-v7/API bean-wallet). 문서 의미검토 후 docs:record/check:docs. 다음: 운영 화면 피드백 대응.


## 콩 최신 시안 v7 공용 화면·운영 배포 (2026-10-25)

- 사용자 운영배포 요청에 따라 BeanChargePage 경로를 최신9종으로 연결:10흩어진콩·30지퍼백(v6),50꼬치·300바구니·5000나무상자(v5),100컵·500종이상자·1000비단보따리·10000택배트럭(v7).50만 공용 ×10 표시.500/1000은 이전 반대 수량 이미지의 바이트동일 복사이며 수량/가격·결제 로직은 그대로다.
- 레이어·타입·328검사, linux/amd64 빌드 통과. 직전 운영 대비 실행코드1개 변경·PNG7개 추가·삭제0; 동결610파일/운영실행609파일 SHA일치. PNG9개의 알파/규격·운영 바이트 일치, 로컬/운영 각 Chromium360/390/767/1280·WebKit390에서9가격/선택/미선택차단·50배수만·넘침없음·비로그인 가드 통과,pageerror0. PC/모바일 캡처 직접검수.
- 운영 프론트 crefans-front:bean-icons-v7-20261025.14 HTTPS응답 정상,6컨테이너 running/restart0/OOMfalse,API/worker/admin/DB/proxy5개 ID와 runtime.env 보존.21migration/금융건수·수수료20%/7일보류·실판매/송금 gate 불변. 집IP SSH규칙 유지. 복구 /opt/crefans-backup-bean-icons-v7-20261025 및 이전 bean-soft3d-20261025.
- 증거 docs/audit/bean-icons-v7-deployment-20261025.json, 재현 .local/bean-icons-v7-deploy-20261025. 최초 브라우저 검사에서 로그인 문단을 heading으로 찾던 harness만 수정 후 전체 재실행. 로컬 API연결 불가는 로컬 범위 한계로 기록, 운영 API별도 확인. 실제 PG·지급/메일·실기기 시험/커밋 없음. 문서 의미 검토 후 docs:record/check:docs. 아래 v6로컬/v7시안만 기록은 과거 시점이며 이번 배포로 대체된다. 다음: 운영 화면 피드백 대응.


## 콩 컵·택배 트럭 및500/1000교환 v7 시안 (2026-10-25)

- 사용자 시안 요청으로100콩=크림/민트 컵(큰콩4개),10000콩=콩 심벌 택배 트럭을 기본 image_gen 각각1회 생성. 기존500보따리→1000,기존1000종이박스→500으로 바이트동일 복사. public/brand/beans/soft3d-v7/{100,500,1000,10000}.png. 컵/트럭 투명PNG1254px,RGBA알파0~255/원본SHA 확인.
- 전체9종 시안은10/30(v6),50/300/5000(v5),새4종(v7) 조합.100의×10 제거·50만×10 유지. docs/design/bean-soft3d-v7.preview.html/.png와 generation.json에 정확한프롬프트·참조/생성원본/매핑/해시 저장. Chromium930/390에서18이미지로드,9가격/라벨,50배수만,80px크기,넘침/오류없음 검사,큰비교판/모바일80px 직접확인.
- 이번 요청은 시안만: 공용 BeanChargePage는 이전v6해시동일,운영은bean-soft3d-20261025(v5)유지.제품검사/배포/실금융/커밋 없음. 증거 docs/audit/bean-soft3d-v7-20261025.json, 재현 .local/bean-soft3d-v7-20261025. AGENTS 유지, 문서검토 후 docs:record/check:docs. 다음: 사용자 시안 피드백/선택 후 요청 범위에서 공용UI 경로와×10 조건 반영.


## 콩10/30/100 모티프 수정 v6 (2026-10-25, 로컬 적용)

- 최신 요청:10콩은 흩어진 콩,30콩은 지퍼백,100콩은 이전10콩의5개꼬치2개×10. 기본 image_gen 개별2회로10/30의5개 콩을 간결하게 제작,100은 public/brand/beans/soft3d-v5/10.png를 바이트 동일 복사. 새 public/brand/beans/soft3d-v6/{10,30,100}.png.5개는 복잡함을 줄인 상품 상징이며 실제 수량은 카드 라벨/가격 기준.
- 공용 BeanChargePage의 해당3개만 v6 경로,30의×10 제거;50/100만 기존 공용 CSS×10 유지. 나머지6이미지/모든 수량·가격·주문/결제/재시도 동작 불변. 정확한 프롬프트·참조/생성원본·SHA/알파는 docs/design/bean-soft3d-v6.generation.json. 내장 도구 사용, CLI 미사용.
- npm run check의 레이어/타입·328테스트 통과. Chromium390/1280 및 WebKit390에서9이미지로드/가격·이미지선택·선택전 제출비활성·50/100배수글꼴동일·30배수없음·가로넘침없음 확인,3캡처 직접 검토,pageerror0. 새3PNG1254px·RGBA알파0~255 및 원본복사 SHA 검증. docs/design/bean-soft3d-v6.preview.png는 실제 로컬 모바일 그리드 캡처.
- 증거 docs/audit/bean-soft3d-v6-20261025.json, 재현 .local/bean-soft3d-v6-20261025. AGENTS 기존규약 유지. 제품 공유UI는 로컬 적용, 운영은 bean-soft3d-20261025 유지이며 이번 요청에서 배포하지 않음. 실PG/외부발송/커밋 없음. 문서 대조 후 docs:record/check:docs. 다음: 사용자 시안 피드백 또는 운영배포 요청 대응.


## 선택한 명함 A안·작은 Pretendard 적용 v4 (2026-10-25)

- 사용자가 위쪽 A안을 선택하고 더 작은 글씨·많이 쓰는 글꼴을 요청. A의 상단 로고/회사명과 하단 이름/연락처 배치를 유지하고 Pretendard1.3.9 Regular/Medium으로 교체. 이름16.5→12pt, 연락처8.5→7.5pt, 웹주소8→7.5pt, 회사명7.6→7pt, CEO7.5→6.8pt. 이름 자간1.15→0.5pt 및 CEO 간격도 축소. 원본 로고 크기·제공 연락처는 유지.
- Pretendard 공식 저장소 README/라이선스 확인, 버전고정 원본 woff2와 OFL 라이선스를 HTML에 포함. 산출물 output/design/crefans-business-card/crefans-business-card-front-v4.html/.png/.pdf 및 front-v4-specification.json. 이전 시안 보존.
- DOM 필드·로고·경계, 실제 custom font(Pretendard), PDF1페이지90×50mm·연락처 추출/글꼴내장 확인, PNG/최종 Poppler180dpi PDF 렌더 검수 통과. 증거 docs/audit/business-card-front-pretendard-20261025.json, 재현 .local/business-card-front-v4-20261025. RGB 시안, 실물 인쇄/CMYK 미검증. 제품/운영/커밋 변경 없음. AGENTS 유지, 문서검토 후 docs:record/check:docs. 다음: 앞면 피드백 또는 뒷면 요청 대응.


## 명함 앞면 서체·배치 재설계 v3 (2026-10-25)

- 사용자 서체 불만에 따라 앞면을 새로 구성. A는 SUIT Medium 이름16.5pt/Regular 연락처8.5pt와 상단 브랜드·하단 정보2열, B는 마루 부리 Regular 이름17pt와 SUIT 연락처의 대안. 기존 로고 SVG·연락처는 유지하고 이름 굵기/자간·정보 묶음을 조정. A를 권장, 사용자 최종 선택 전 상태.
- MOO 미니멀 명함 원문, Sun SUIT 공식 사이트·현재 sun-typeface 저장소, 네이버 글꼴모음·라이선스 재확인. 공식 배포 파일을 내려받아 HTML에 원본 글꼴·라이선스를 함께 포함. 구 SUIT 경로 대신 현행 sun-typeface 경로를 사용했고 마루 부리는 네이버 공식 ZIP 사용. 출처·파일해시·적용 판단은 output/design/crefans-business-card/front-v3-specification.json.
- 산출물: 같은 폴더 crefans-business-card-front-v3-a/b.html/.png/.pdf 및 comparison.html/.png. PDF 스킬 시작마커, DOM 제공정보·로고 로드·요소 경계, Chromium 실제 custom font(시스템대체 없음), PDF 각1페이지90×50mm·연락처 추출·글꼴 내장 검증 통과. 비교 PNG와 두 최종 PDF Poppler180dpi 렌더 직접 확인. RGB 시안이며 실물 인쇄·CMYK 색교정은 미진행.
- 증거 docs/audit/business-card-front-typography-20261025.json, 재현 .local/business-card-front-v3-20261025. AGENTS 기존 규약 유지, 이전 시안 보존. 제품·운영 변경/배포/커밋 없음. PROGRESS 변경을 검토 후 docs:record/check:docs 수행. 다음: 사용자 시안 선택·조정 요청에 따라 앞면 확정.


## 실제 명함 사례 웹조사·앞면 v2 재디자인 (2026-10-25)

- 사용자 요청으로 MOO의 minimal-business-cards 글(2022-07-01, Fos&Co. 포함)과 Jukebox Print의 typography-first 사례집(2026-01-23 갱신)을 웹검색·원문 확인했다. 인앱 브라우저에서 Fos&Co.·Hugh McCarthy·Animis 사진을 직접 열어 확인. 두 인쇄업체가 소개한 사례이며 모든 디자인의 원제작자가 해당 인쇄업체라고 주장하지 않는다. 원문/날짜·관찰과 적용 판단은 output/design/crefans-business-card/front-v2-research.json.
- 앞면만 새2열 그리드로 제작. 왼쪽 원본 SVG 로고·회사명·도메인, 오른쪽 이름16pt·CEO와 M/E 연락정보8.4pt. 여백7mm·흰바탕·남색 텍스트·로고의 청보라 라벨. 직접 관찰한 정보 블록/정렬·크기 위계를 크레팬스에 맞춰 독립 구성했으며 타사 그림이나 사진은 복제하지 않았다. 기존 앞뒷면 시안/뒷면은 보존했다.
- 산출물 output/design/crefans-business-card/crefans-business-card-front-v2.html/.png/.pdf. PDF 스킬 시작마커 실행, 1페이지90×50mm·벡터 로고/Type3 글리프 확인. DOM 제공정보 일치/로고로드/모든 요소 카드내부, PDF 연락처 추출(공백정규화)·실제규격 및 최종 Poppler180dpi 렌더 육안검토 통과. RGB 시안이며 인쇄소 색교정 미실행.
- 증거 docs/audit/business-card-front-research-20261025.json, 재현 .local/business-card-front-v2-20261025. 기존 AGENTS 유지·제품/운영/외부발송 불변·제품검사/배포/커밋 없음. 문서 검토 후 docs:record/check:docs. 다음: 사용자 앞면 피드백 후 필요시 후면 톤 조정/인쇄소 규격 대응.


## CEO 양면 명함 디자인 (2026-10-25)

- 사용자가 제공한 이름·CEO·회사명·전화·이메일로 크레팬스 양면 명함을 제작했다. 전화는 구분 하이픈만 추가, 추가 정보는 브랜드 도메인 crefans.com. 기존 public/brand/crefans-logo.svg와 inverse.svg를 그대로 재사용해 정확한 로고·타이포그래피를 유지했다. 흰 앞면의 연락처/이름·얇은 분홍/보라/파랑 그라데이션, 짙은남색 뒷면의 흰 로고·확대 심벌 구성. 새 로고 생성/이미지젠은 필요 없어 수행하지 않았다.
- 산출물 output/design/crefans-business-card: self-contained HTML, 앞/뒤/양면 PNG 시안, 90×50mm 양면2페이지 PDF, 3mm 재단여유의96×56mm/TrimBox90×50mm PDF, design-specification.json. PDF 스킬 적용·시작 마커 실행. 원본 SVG와 Type3 벡터 글리프 내장, RGB 시안이며 인쇄소 CMYK/실물색교정은 미진행.
- DOM에서 제공 정보와 이미지 로드 확인, PDF2종×2페이지에서 실제크기/TrimBox·연락정보 텍스트(추출기 공백정규화)·독립 글리프 검사. 최종 PDF4페이지를 Poppler180dpi 렌더해 모두 직접 확인. 증거 docs/audit/business-card-design-20261025.json, 재현 스크립트 .local/business-card-20261025. 연락처 원문은 요청 산출물에만 두고 감사기록에는 재기재하지 않았다.
- 기존 AGENTS/제품코드·API·운영은 불변, 제품 단위/E2E 재시험/배포·발송·커밋 없음. 문서 검토 후 docs:record/check:docs 수행. 다음: 사용자 시안 피드백 반영 또는 인쇄소 규격에 맞춘 색상 교정. 운영 프론트는 bean-soft3d-20261025 유지.


## 소프트3D 콩9종·배수 글자 통일 및 운영 배포 (2026-10-25)

- 30/50/100콩 이미지의 기존 ×10 글자만 기본 image_gen으로 제거하고 공용 CSS 텍스트로 표시했다. 세 곳 모두 ×와 숫자를 한 span에 같은 글꼴·굵기700·줄높이1·우하단 위치로 적용, 모바일14px/PC16px. PNG 콩 개수3/5/10·꼬치 유지 여부는 직접 검수했다. 정확한 프롬프트/원본/해시: docs/design/bean-soft3d-series-v5.generation.json.
- 공용 BeanChargePage의9카드를 public/brand/beans/soft3d-v5로 전환. 10=5개꼬치2개,30=3개×10,50=5개×10,100=10개×10,300소쿠리,500비단,1000종이,5000나무,10000금상자. 나머지6개는 v4 바이트 동일 복사. /preview와/service 동일 표시, 수량/가격·주문재시도/중복차단 API 로직 보존. 과거 시안은 이력으로 보존.
- front 레이어/타입·328검사 및 linux/amd64 빌드 통과. 운영 기준 대비 실행코드2개만 변경·이전 파일 삭제0,신규 콩 PNG39개(이전 미배포 v2~v4와 최종v5 포함). 동결603파일·이미지/운영 실행602파일 SHA 일치, 운영v5 PNG9개 SHA 일치.
- 로컬/운영 각각 Chromium360/390/767/1280·WebKit390에서9이미지/9가격·배수3개의 계산된 글꼴/크기/위치 동일·이미지클릭/키보드·선택 전 제출차단·3열/가로넘침없음·목업30콩 충전/잔액·실제 비로그인 가드7검사 통과. 로컬·운영 PC/모바일 캡처 직접 확인,pageerror0. 물리 iPhone/실 PG 시험은 아님.
- 운영 프론트 crefans-front:bean-soft3d-20261025 배포. API/worker는 bean-wallet-20261025 유지, 나머지5컨테이너 ID·runtime.env 바이트 동일.14 HTTPS경로/6컨테이너 정상·restart0/OOMfalse,21migration/금융건수·20%/7일보류·worker failures={} 불변. 집IP SSH 지속허용 보존. 복구: bean-clay-20261025와 /opt/crefans-backup-bean-soft3d-20261025.
- 증거 docs/audit/bean-soft3d-deployment-20261025.json, 원본 .local/bean-soft3d-deploy-20261025. Mac 용량 확보는 생성된 과거 전송압축본3개 약1.56GB만 삭제, 소스/로그/캡처/DB 보존. 새 압축본은 SSH 직접전송·해시검증/적재 후 생성 원격본만 삭제. 실금융/메일·가입/실판매 gate 변경·커밋/푸시 없음. 아래 미적용 문구는 과거 시점이며 최신 적용 상태는 본 항목이 우선한다. 다음: 운영 화면 피드백 대응.


## 50콩5개×10 확정·v4전체9종 시안 완성 (2026-10-25, 운영 미적용)

- 사용자가50콩=5개꼬치×10 권장안에 ‘응’으로확정. 기본image_gen1회로기존5개꼬치에×10을추가한실제투명PNG 제작·5개/1꼬치/×10육안확인,PNG/알파0~255/원본복사SHA검증. 정확한프롬프트·원본은 docs/design/bean-skewer-v4-fifty.generation.json.
- 전체9종선택을완성했다:10=5개꼬치2개,30=3개×10,50=5개×10,100=10개×10,300소쿠리,500비단,1000종이,5000나무,10000금상자. public/brand/beans/soft3d-v4/{수량}.png,4소량은v4개별생성·나머지5개는검증된v3복사.은색없음,9개서로다른SHA·새복사원본일치·처음4개수산술일치 확인.관찰개수는수동검수이며자동객체인식아님.
- docs/design/bean-soft3d-series-v4.selection.json과 .preview.html/.preview.png로최종비교판생성. Chromium9카드/36이미지·9라벨/은색0·80/112px정확크기·PC/390가로넘침없음/오류0 확인,9종/80px캡처직접검토.검은×10은밝은배경용이며어두운배경문자가독성완료를주장하지않는다.
- 증거 docs/audit/bean-series-v4-complete-20261025.json,원본 .local/bean-series-v4-complete-20261025.이전50확인대기/v4부분완료기록은그시점의이력이며이제해소됨.현재디자인선택은완전v4지만공유충전UI/운영은여전히clay-v1·bean-clay-20261025,실금융/API/정책/메일/배포/커밋없음.제품코드불변으로단위/E2E재실행없음;문서검사별도.다음:요청시v4로공용충전카드경로교체/시각검수·운영배포.기존AGENTS/스킬규약유지.


## 소량 꼬치·×10 수정3종/50콩 수량 확인 대기 (2026-10-25)

- 최신 요청에 따라10콩=5개꼬치2개(실제10개),30콩=3개꼬치1개+×10,100콩=10개꼬치1개+×10을 기본image_gen 개별3회+100개수보정1회로 제작했다. 이 명시요청은 해당모티프에 한해 이전10개이상금지를 대체한다. 규칙적인꼬치/간격은 유지.100초기이미지9개는 편집해10개로 보정,원본보존.
- 50콩의 ‘10개꼬치×10’은100콩과같아 비동기질문으로5개×10 권장안 또는 요청그대로를 확인중이다. 답변 전50이미지는 생성하지 않았으며 임의수정/선택확정하지 않는다. 전체v4완료가 아니고,기존v3의 나머지구성도 변경하지 않았다.
- public/brand/beans/soft3d-v4/{10,30,100}.png 저장,정확한프롬프트3+보정·참조·PNG/알파/해시·관찰개수는 docs/design/bean-skewer-v4.generation.json. 꼬치별개수·×10을 직접검토,원본복사SHA/PNG/알파0~255확인. 정적HTML/비교캡처 bean-skewer-v4.preview.html/.png,80/112px정확크기·9이미지로드·390가로넘침없음/오류0 확인. 작은크기의개수판독 사용자시험은 아님.
- 증거 docs/audit/bean-skewer-v4-20261025.json,원본 .local/bean-skewer-v4-20261025. UI/운영은clay-v1·bean-clay-20261025 유지,상품수량/가격·결제/API/금융/외부발송·배포/커밋 없음. 제품검사 재실행 없음;문서검사별도. 다음:50콩 답변받아해당이미지 제작 후 v3의300/500/1000종이/5000나무/10000금색과9종비교판 통합. AGENTS/스킬규약 유지.


## 콩 시안1천=종이박스·5천=나무상자 재배치 (2026-10-25)

- 사용자 지시로 현재 소프트3D 선택본에서 은색상자를 제외,1000콩은 기존 종이상자 대안·5000콩은 기존1000나무상자로 바꿨다. 나머지7수량 유지. 종이상자가 기본에 포함되어 대안은2꼬치묶음1개만 남긴다. 새로운 그림 생성/픽셀편집 없이 검수된 PNG를 재사용했다.
- 현재 선택 public/brand/beans/soft3d-v3/{수량}.png9개+alternatives/double-skewer.png. 이전v2/은색은 과거 시안·증거로 보존하며 현재 선택에는 포함하지 않는다. docs/design/bean-soft3d-series-v3.selection.json에 원본/새경로/해시 기록. 원본SHA10개일치·RGBA알파0~255·은색SHA선택0 확인.
- v3.preview.html/.preview.png/.alternatives.png 갱신,Chromium에서9카드/1대안·1000종이박스/5000나무상자라벨·은색라벨0·40이미지로드·80/112px·PC/390가로넘침없음/오류0 확인,최종9종판 직접검토. 증거 docs/audit/bean-soft3d-remap-20261025.json,원본 .local/bean-soft3d-remap-20261025.
- UI/운영은 기존clay-v1/bean-clay-20261025 유지,상품금액/API·금융·외부발송·배포/커밋 없음. 제품코드 불변으로 단위/E2E 재실행 불필요;문서검사 별도. 다음: 요청시 현재v3선택으로 공유충전카드 적용·검수·배포. 기존AGENTS/진행로그 규약 유지.


## 콩10~10000 소프트3D 개별에셋9종·대안2종 (2026-10-25, 제작 완료·운영 미적용)

- 사용자 요청으로 기본 image_gen 개별11회(최대3개 병행)와 꼬치개수 보정1회,총12회로 실제 투명 PNG를 제작했다. 기본 매핑:10=1개,30=2개,50=3개,100=5개꼬치,300=나무소쿠리,500=비단보따리,1000=나무보물상자,5000=은색보물상자,10000=금색보물상자. 열린용기 안은3~5개, 다량무더기/쏟아짐 금지. 이는 이미지 선택안이며 상품수량/가격/API 정책은 변경하지 않았다.
- public/brand/beans/soft3d-v2/{수량}.png9장, alternatives/paper-box.png·double-skewer.png2장 저장. 종이상자는500대안,2꼬치×3콩=총6개는300대안. 기본 관찰개수1/2/3/5/5/5/4/5/5, 대안5/6. 나무상자프롬프트5→실제4는 사용자3~5범위 충족. 최초 꼬치4개는 별도 편집으로5개 수정, 원본 보존. 개수는 수동 육안검토이며 자동객체인식 아님.
- 정확한11프롬프트+보정·레퍼런스/출력경로/SHA/PNG정보는 docs/design/bean-soft3d-series-v2.generation.json.11개 원본복사SHA 일치·서로다른해시11·RGBA알파0~255·9수량누락0 확인. 최초 Pillow.verify를 알파읽기 후 호출한 검사절차 오류는 분리open/verify로 고쳤고 이미지 픽셀은 수정하지 않았다.
- 개별 PNG를 그대로 참조하는 비교 HTML·브라우저 캡처를 docs/design/bean-soft3d-series-v2.preview.html/.preview.png/.alternatives.png로 제작했다(상품UI 아님). Chromium에서9기본/2대안라벨·44이미지로드·80/112px정확치·PC/390가로넘침없음/오류0 확인. 두크기/밝고어두운배경·최종비교판 직접 검토. 원본이미지 리사이즈/합성편집이 아니라 HTML표시의 캡처다.
- 증거 docs/audit/bean-soft3d-series-20261025.json, 원본 .local/bean-soft3d-series-20261025. UI/운영은 여전히 clay-v1·bean-clay-20261025, 배포/실금융/메일/프로모션/커밋 없음. 제품코드 불변으로 단위/결제E2E 재실행 없음. 문서검사 별도. 다음: 사용자 시리즈/대안 선택 후 공용 충전카드의에셋경로 교체/시각검수·요청시 배포. 기존AGENTS/스킬규약 유지.


## 꼬치·소쿠리 추가/열린 용기8종 소프트3D 시안 (2026-10-25)

- 최신 사용자 요청이 이전 닫힌용기 규칙을 대체한다. 콩1/2/3개·꼬치·나무소쿠리·열린보따리·열린종이상자·열린나무보물상자8종2×4 비교보드로 재구성. 용기 내용물은 큼직한콩3~5개만 보이는 방향, 실제 상품 수량/가격 매핑은 미지정이다.
- 기본 image_gen으로 이전6종 보드 참조 편집1회, 최초 보따리에2개만 보이는 문제를 국소편집1회로3개 수정했다. 최종 육안개수:상단1/2/3·꼬치3,소쿠리4·보따리3·종이상자4·보물상자4. 프롬프트의 보물상자5개 목표와는 다르나 사용자3~5범위 만족, 자동 객체인식검사가 아닌 직접관찰이다.8라벨·열린형태/재질·성긴구성 확인.
- 최종 docs/design/bean-soft3d-open-eight-v1.png, 최초 -initial.png 보존. 정확한2프롬프트·레퍼런스/원본/해상도/SHA는 동명.generation.json, 증거 docs/audit/bean-soft3d-open-eight-20261025.json. PNG원본복사SHA/규격 검증 통과, 사용자에게 이미지 제시.
- 단일 흰배경 비교보드로 개별투명에셋·모바일80/PC112px·공유UI 적용은 아직 아니다. 운영 bean-clay-20261025 유지, 배포/금융/외부발송/커밋 없음. 제품코드 불변으로 단위/E2E 재실행 없음; 문서검사 별도. 다음: 사용자 디자인 선택 후 수량매핑·개별에셋·공유카드 적용검수. 기존 AGENTS/스킬규약 유지.


## 콩1·2·3개/보따리/종이상자/나무보물상자6종 시안 (2026-10-25)

- 사용자 지정6모티프를 기존 소프트3D 보드 참조로 기본 image_gen1회 생성,2×3 비교보드로 제시. 상단 콩1/2/3개, 하단 매듭 보따리·테이프 종이상자·둥근뚜껑 나무보물상자. 모든 용기는 닫힘·무더기/쏟아짐 없음, 민트/크림에 나무색 추가. 실제 충전수량/가격 대응은 지정하지 않았다.
- 최종 docs/design/bean-soft3d-six-v1.png, 정확한프롬프트/참조·원본·SHA는 동명.generation.json.6라벨/개체수/재료 구별을 직접 검토,PNG규격/해상도·원본복사SHA 확인. 증거 docs/audit/bean-soft3d-six-20261025.json.
- 단일 비교보드이며 개별투명에셋·카드검수·UI/운영배포 미수행. 기존 시안 보존·운영 bean-clay-20261025 유지,금융/외부발송/커밋 없음. 제품검사 재실행 불필요,문서검사 별도. 다음: 사용자 선택 후 수량별 매핑과 개별에셋/공유UI 적용 진행. 기존 AGENTS/스킬규약 유지.


## 콩 소프트3D 비교 보드 추가 (2026-10-25, 시안 제시·운영 미적용)

- 사용자 요청으로 기존 플랫 보드의9수량/구성/민트·크림/여백을 유지하며 기본 image_gen style-transfer1회로 소프트3D 대안1장을 생성했다. 콩1/2/3개·닫힌주머니/선물상자1개, 매끈한 둥근볼륨·부드러운음영. 무더기/쏟아짐/직물·실사주름·촘촘한장식은 배제했다. 플랫과 소프트3D 최종 채택은 사용자 피드백 대기다.
- docs/design/bean-soft3d-sheet-v1.png, 정확한프롬프트/레퍼런스·원본/SHA는 같은이름.generation.json.9라벨·개체수·닫힌용기·스타일을 직접 검토, PNG규격/해상도·원본복사SHA 일치 확인. 증거 docs/audit/bean-soft3d-preview-20261025.json.
- 비교보드1장으로 개별투명9종/80·112px카드검수는 아직 아니다. 기존 플랫/클레이 원본 보존, UI·운영배포·금융·외부발송·커밋 없음. 운영은 bean-clay-20261025 유지. 이미지 작업이라 제품검사 재실행 없음; 문서/manifest 검토 후 docs:record/check:docs 갱신. 공통 AGENTS/스킬규약 유지.
- 다음: 선택된 방향의 개별운영에셋 제작·공유카드 적용 검수. 승인 전 기존 운영이미지를 교체하지 않는다.


## 콩 플랫9종 비교 보드 시안 (2026-10-25, 사용자 제시·운영 미적용)

- 사용자 ‘응 보여줘’에 따라 기본 image_gen 스킬로9수량3×3 비교 보드1장을 생성했다. 콩1/2/3개, 닫힌주머니1개, 선물상자1개와 단순 리본/별만 표시. 민트/크림·큰 여백·수량 라벨, 무더기/쏟아짐/다수개체 없음. 첫 보드의 잔음영을 줄이는 style-transfer1회 후 최종 보드를 사용자에게 표시했다.
- docs/design/bean-flat-sheet-v1.png가 최종, -initial.png는 첫 시안 보존. 정확한2프롬프트·레퍼런스·원본경로/해시는 bean-flat-sheet-v1.generation.json. PNG규격/해상도·원본과복사본SHA 일치와9라벨/1~3개체·닫힌용기·여백을 직접 확인했다. 픽셀 전체가 균일한 벡터라고 주장하지 않는다.
- 증거 docs/audit/bean-flat-preview-20261025.json. 흰 배경의 비교 보드이며9개 투명 개별 운영에셋은 아직 제작하지 않았다. 표시/UI/운영·금융/외부발송/커밋 변경 없음, 운영은 bean-clay-20261025 유지. 제품코드 불변으로 단위/E2E 재실행 없음.
- 다음: 사용자 디자인 피드백 후 개별 투명9종을 제작하고 모바일80px/PC112px·공유 충전카드 적용을 검수한다. 공통 AGENTS의 스택/PROGRESS·공유UI·이미지/검증 규약 유지, 문서/manifest 검토 후 docs:record/check:docs 갱신.


## 콩 플랫 재설계 공식 사례 조사 (2026-10-25, 조사 완료·제작/배포 전)

- 사용자 피드백: 운영 클레이가 징그럽고 밀집되어 보임. 완전 플랫/아기자기함/많은 콩 무더기 금지를 새 디자인 방향으로 채택. 먼저 팬트리·게임 재화 공식 자료를 조사했다. 기존 운영은 bean-clay-20261025 유지, 이번에는 생성/UI/금융/배포 변경 없음.
- 공식 Duolingo 도형/실루엣/여백 설명·NN/G/Google 간결한 아이콘 원칙, 실제 Roblox 상점의 동일 심볼+9수량/가격 중심을 확인했다. 팬트리는 웹 리더 로그인/로컬403으로 현행 충전 미확인, Supercell도 공개 프로모션만 확인. 업계가 플랫만 쓴다거나 팬트리 충전 화면을 직접 봤다고 주장하지 않는다.
- 권장: 콩 개체는 최대3개, 큰 수량은 닫힌 주머니/선물상자1개·콩문양/리본/작은별로 표현. 질감/광택/실사 홈·주름/쏟아지는 무더기 금지, 민트/크림2D와 충분한 여백. 구체적인 최대개수/색은 사용자 요구에 맞춘 제안이며 공인 표준이 아니다. 정확한 수량/가격은 기존 텍스트로 유지한다.
- 다음: 대표 플랫 시안을 실제80/112px로 비교한 뒤9수량 시리즈/공유 충전카드 적용을 진행. 이번 요청은 먼저 조사이므로 아직 이미지 생성/적용/운영 배포하지 않았다. 별도 로그인/결제/외부 발송/커밋 없음.
- 증거 docs/audit/bean-flat-research-20261025.json(공식6출처·확인시각·방법·한계·파일SHA), 원본 .local/bean-flat-research-20261025. docs/design-system.md에 재사용할 설계 근거 기록, 관련 manifest 검토 후 docs:record/check:docs. 제품 코드 불변이라 단위/금융/E2E 재실행은 하지 않았다. AGENTS의 공유UI·조사/증거·PROGRESS 우선 규약을 그대로 유지한다.


## 클레이 콩 충전 카드 적용·운영 배포 (2026-10-25)

- 승인한 클레이 시리즈를 공용 BeanChargePage의9개 충전 카드에 적용했다. 수량별 투명 PNG·수량/가격을 함께 표시하고 장식 이미지 alt는 빈 값, 선택/키보드 조작은 기존 Radio를 유지했다. 모바일80px·PC112px 이미지와3열 카드,1콩100원·주문 재사용/중복차단 로직 보존. public의1콩은 기본 에셋으로 제공하며 충전 옵션에는 추가하지 않았다.
- 지갑의 개별 노란 목업 안내 제거도 함께 반영. 공용 preview 상단 띠는 유지하며 /preview와/service는 같은 표시 컴포넌트를 쓴다. 운영 기준 대비3실행파일 변경·10이미지 추가만 확인했다.
- front 레이어/타입·328단위검사, linux/amd64 빌드 통과. 소스564개 동결·이미지/운영 실행563파일 SHA 일치, 이미지10개 운영 바이트 SHA 일치. 로컬 및 운영 각각 Chromium360/390/767/1280·WebKit390에서9이미지/9가격·이미지클릭/키보드·선택전 제출차단·3열/가로넘침없음·목업충전/잔액·지갑안내제거와 실제 비로그인 가드7검사 통과. PC/모바일 캡처 직접 확인, 수집 pageerror0.
- 운영 프론트 crefans-front:bean-clay-20261025로 교체. API/worker/admin/DB/proxy5개 ID 보존, .env FRONTEND_IMAGE만 변경·runtime.env 바이트 동일.14 HTTPS경로/6컨테이너 running·restart0/OOMfalse,21migration/금융건수/20%·7일보류정책·배치 failures={} 유지. SSH 집IP 지속 허용 보존. 복구 이미지 bean-wallet-20261025·설정 /opt/crefans-backup-bean-clay-20261025.
- Mac 용량 확보는 과거 생성한 전송압축본6개(약3.13GB)만 삭제했으며 소스·로그/캡처·Docker 복구이미지·DB볼륨 보존. 새 압축본532,715,646바이트는 SSH로 직접 전송,검증/적재 후 원격 생성본만 삭제했다.
- 증거 docs/audit/bean-clay-deployment-20261025.json, 원본 front .local/bean-clay-deploy-20261025. 실PG/송금·후원·프로모션·메일 시험발송/물리iPhone 검수는 수행하지 않았다. 가입·실판매/은행/광고메일 차단 유지, 기존 미커밋 보존·커밋/푸시 없음. 아래 미배포 문구는 각 제작 시점 기록이며 현재 적용/배포는 본 항목이 우선한다. 다음: 사용자 화면 피드백 대응.


## 클레이 콩 전체 수량 이미지 제작 (2026-10-25, 제작 완료·운영 미배포)

- 사용자 선택②클레이로1/10/30/50/100/300/500/1000/5000/10000콩 총10종을 준비했다. 기존1콩은 승인 원본 그대로 재사용, 나머지9종은 같은 로컬 이미지를 편집 대상/스타일 기준으로 기본 image_gen에서 개별 생성했다(3개 병행). 원본/이전 시안 보존.
- public/brand/beans/clay-v1/{수량}.png 저장. 작은 수량은 콩 모음,100/300/500은1/2/3개 크림 주머니,1000은상자,5000은보물상자,10000은큰상자+주머니로 차등 표현. 콩 수는 상징적이며 이미지 안 숫자/문자 없음. 모두 투명 PNG, 스타일/구성 직접 검토 및10종 누락0·알파0~255·서로다른해시10개·1콩 원본SHA 일치 검증 완료.
- 정확한 프롬프트9개/기존1개·원본경로·해시/크기·기본 도구/레퍼런스는 docs/design/bean-clay-series-v1.generation.json. 증거 docs/audit/bean-clay-series-20261025.json, 계획 .local/bean-clay-series-20261025/plan.json.
- 이미지 제작만 수행, 아직 충전 카드 UI에 적용하지 않았고 운영 배포/금융/외부 발송·커밋 없음. 이전 지갑 개별 목업 안내 제거도 운영 미배포다. 다음: 요청 시 전체 이미지 충전 카드 적용·소형 표시 검수 후 안내 제거와 함께 프론트 배포.


## 1콩 추가 스타일4종 비교 시안 (2026-10-25, 운영 미배포)

- 사용자 요청으로 기본 image_gen에서 각각 독립 생성4회:①플랫(flat),②클레이(clay),③라인 스티커(sticker),④픽셀(pixel). 모두 단일 초록 콩·크림색 홈·투명 배경으로 콘셉트를 맞추고 스타일을 비교할 수 있게 했다. 기존 광택 시안은 보존, 현재 총5종이다. 수량별10~10000콩 이미지를 만든 것은 아니다.
- docs/design/bean-one-{flat,clay,sticker,pixel}-v1.png에 비파괴 복사, 각 .generation.json과 bean-style-variants-v1.generation.json에 정확한 프롬프트/기본도구·원본/경로·SHA 저장.4개 그림 직접 검토·PNG알파0~255/서로 다른 해시4개 검사 통과.
- 증거 docs/audit/bean-style-variants-20261025.json. UI적용/배포·제품 로직/금융/외부 발송·커밋 없음. 이전 지갑 목업 안내 제거도 여전히 운영 미배포다. 다음: 사용자 스타일 선택 후 수량별 시리즈/충전 카드 적용.


## 1콩 이미지 시안·지갑 중복 목업 안내 제거 (2026-10-25, 운영 미배포)

- 기본 image_gen으로1콩 단일 시안만 생성했다. 초록 콩1개·크림색 홈·둥근 음영 스타일/투명 배경, 글자/얼굴/추가 물체 없음. docs/design/bean-one-v1.png에 원본을 비파괴 복사했고 정확한 프롬프트·생성방식·SHA/알파 검사는 동명의 .generation.json에 저장했다. 충전 카드에 아직 적용하지 않았고 수량별 시리즈는 생성하지 않았다.
- 지갑 안 노란 목업 지갑입니다 안내를 제거했다. 상단 공용 목업 페이지입니다 띠는 유지한다. 로컬3010 모바일 브라우저에서 해당 안내 미존재·공통 띠·두 잔액 요약 유지를 확인했다. 수정은 해당 JSX조건1개 제거뿐이다.
- 증거 docs/audit/bean-icon-draft-20261025.json, 로컬 캡처/검사 .local/bean-icon-draft-20261025. 단일 콩 구성 직접 확인·PNG알파 검증(시스템 Python의 Pillow 미설치는 번들 Python으로 검사해 해결, 이미지 편집 없음). 실금융/외부 발송·운영 배포/커밋 없음. 다음: 사용자 시안 피드백 후 수량별 이미지/충전 화면 적용, 요청 시 안내 제거와 함께 프론트 배포.


## 지갑·충전·잔액 계층 운영 배포 (2026-10-25)

- 사용자 배포 지시로 앞선 지갑 툴팁/모바일 커버 내지갑·9수량3열 전용충전·사용가능/출금가능 주요2지표/접힌 계층과 서버 응답 확장을 모두 bean-wallet-20261025에 반영했다. API/worker 및 프론트만 교체, 독립 콘솔·DB·프록시 컨테이너 ID 보존. 목업/서비스 공유 유지.
- server196/front553 실행파일 SHA와2이미지 linux/amd64/전체RootFS 일치. 컨텍스트 server199/front554 작업본 해시 불변, 변경은 beans.service와 요청UI/라우터·타입/목업 및2컴포넌트 추가다. build2개 통과 후712,538,906바이트를 개인 SSH로 직접 전송해 SHA 검증/적재했다. Mac에 큰 압축본을 만들지 않았고 적재 후 생성한 원격 압축본만 삭제했다.
- .env의 API_IMAGE/FRONTEND_IMAGE, runtime.env의 APP_RELEASE만 변경. /opt/crefans-backup-bean-wallet-20261025에 비공개 설정 백업, 복구 이미지는 API/front beans-20261025. DB migration없음,21개 체크섬·수수료20%/보류7일 version2·금융 주문/충전/후원/출금 건수 불변. 집IP SSH 지속 허용 보존.
- 운영 HTTPS14개(정상200/인증필수401), 브라우저14개(360/390/767/1280 잔액/계층·목업충전, 스튜디오 목업예약20%견적,390/1280 프로필 진입/툴팁·9가격, 실제충전 비로그인 차단) 통과. 모바일 지갑/충전/프로필 캡처 직접 확인. 6컨테이너 restart0/OOMfalse, 새 worker 시작 이후 heartbeat failures={} 확인. 실제PG·후원·프로모션·송금/메일/별도봇 시험 발송 없음.
- 신규 실제 지갑 필드의 인증 운영 호출은 미실행이며, 격리DB/공급사 대역29검사·프론트328검사와 실제 운영 소스/가드 검사를 구분한다. 가입 signupReady=false/빈 초대 명단, email-only/beta/live콩판매false/실출금false/광고메일false 유지.
- 증거 front docs/audit/bean-wallet-deployment-20261025.json, 원본 server .local/bean-wallet-deploy-20261025. 두 리포 feat/bean-support 누적미커밋 보존·커밋/푸시 없음. 아래 미배포 로그는 이전 시점 기록이며 현재 배포 상태는 이 로그가 우선한다. 다음: 사용자 화면 확인·버그 대응.


## 콩 잔액 주요 지표·세부 계층 (2026-10-25, 운영 미배포)

- 지갑/스튜디오 공용 BeanBalanceSummary에서 사용 가능한 콩·출금 가능한 콩 두 지표만 크게 표시한다. 일반/프로모션·출금조건충족 일반후원·사용보류/출금제외 후원/받은프로모션/출금처리중은 기존 AccordionItem의 기본 접힘 안 계층 리스트다. 총합과 하위 분류가 혼동되지 않게 출금 제외 그룹을 별도로 명시한다.
- 서버 wallet 응답에 spendableBreakdown과 withdrawableBeans를 추가했다. 사용가용은 미동결 구매/프로모션 lot group 합, 출금가용은 스튜디오/견적의 기존 eligible(live/실입금/보류완료/미동결 일반후원) 재사용. raw 원장잔액을 가용액으로 표시하지 않으며 누락값은 미확인으로 표시한다. API 경로/DB/출금 정책·최소액/수수료/PIN/은행 검증은 변경 없다.
- 서버 build+격리DB/PG·은행 대역 콩/원장/Swagger29검사 통과(동결 구매 제외·입금 전0/후1100·보류/동결0·예약1000 후가용100). front 레이어356파일·타입·328검사 통과(신규 요약3개 포함). 로컬3010 브라우저9개:360/390/767/1280 요약/계층/목업충전 반영8개+스튜디오 예약·20%견적1개. 모바일/PC 캡처 확인.
- 처음 브라우저의 region 다중일치 locator를 명시 패널로 수정했고, 펼침 중 캡처는 애니메이션 최종 높이를 기다려 다시 생성했다. 증거 docs/audit/bean-balance-hierarchy-20261025.json, 원본 양 리포 .local/bean-balance-hierarchy-20261025. 실금융/외부발송·운영배포·커밋 없음.
- 다음: 요청 시 서버 추가 응답과 직전 충전/지갑 UI를 함께 배포. 운영 신규 필드 미반영 상태에서 합계를 임의 추정하지 않는다. 기존 가입/실금융 차단·외부 준비 미완료는 유지한다.


## 콩 충전 전용 페이지 (2026-10-25, 운영 미배포)

- /preview/beans/charge와 /service/beans/charge를 공용 BeanChargePage로 추가했다. 옛 ChargeModal의 수량·가격 카드/선택 요약 구도만 참고하고 현재 블루 토큰·기존 Radio/InfoTooltip을 재사용한다. 10/30/50,100/300/500,1000/5000/10000콩3열, 현재1콩100원 유지. 구형110원 상품표·PG 훅은 호출하지 않는다.
- 지갑의 입력 충전 폼을 전용 페이지로 옮기고 충전 진입 버튼을 제공한다. 후원 레이어 충전도 새 페이지로 연결, 기존 success/fail 결과 경로와 미완료 주문 결제/processing 재조회는 보존했다. 선택 전 제출 차단·진행중 중복 무시·주문 생성 후 수량 잠금/같은 주문 재시도. mock 주문도 지갑 내역에서 보이게 했다.
- npm run check의 레이어355파일/타입/325검사(신규 충전4개 포함) 통과. 로컬3010 브라우저11개(360/390/767/1280 각9가격/3열·선택 가드/목업충전/잔액·내역, 후원진입·실페이지 비로그인·기존 결과/미정의 경로404화면)와 키보드 라디오 이동·초점 표시 통과. 모바일/PC 캡처 직접 확인. 첫 locator 다중일치와 Next 스트리밍404의 HTTP200 검사 가정을 고친 재검사이며 로그 보존.
- 카탈로그46화면·문서/자동계약 갱신. e2e/beans.spec.ts 목업 충전 진입을 새 경로로 바꿨지만 실제 DB/공급사 E2E 전체는 재실행하지 않았다. 증거 docs/audit/bean-charge-page-20261025.json, 원본 .local/bean-charge-page-20261025. 기존 dev 서버 사용·실금융/외부 발송/운영배포·커밋 없음.
- 다음: 사용자 확인 후 요청 시 직전 지갑 툴팁/모바일 프로필 버튼 변경과 함께 프론트 운영 배포. 기존 법률/초대·live PG/은행 차단 조건은 유지한다.


## 콩 지갑 툴팁·모바일 내 프로필 진입 (2026-10-25, 운영 미배포)

- 콩 지갑의 상시 단위 설명을 제목 옆 기존 InfoTooltip으로 이동했다. 내용은 1콩=100원·프로모션콩 우선 사용 그대로다. 공용 BeanWalletPage로 preview/service 동시 적용, 충전·후원·출금 API 변경 없음.
- 모바일(<=767px) 내 프로필 배경 왼쪽 위에 내 지갑, 오른쪽 위에 설정을 배치했다. 양쪽44px 이상 클릭영역, 기존 기능 활성화 조건·basePath를 유지한다. PC 기존 지갑 링크·설정 위치 보존, 모바일에서 중복 링크 미노출.
- 타입 검사·354파일 레이어 검사 및 계정 기존12개 통과. 로컬3010 브라우저8개(360/390/767/1280 각각 지갑이동·툴팁 열기/닫기·화면 이탈 없음) 통과, 모바일 캡처 직접 확인. 기존 dev 서버 사용, 별도 금융 실행/운영 배포·커밋 없음.
- 증거 docs/audit/bean-wallet-ui-20261025.json, 원본 .local/bean-wallet-ui-20261025. 다음: 사용자 확인 후 요청 시 프론트 배포. 기존 가입/실금융 차단·외부 준비 미완료는 이전 기록과 동일하다.


## 잔여 미배포 대조·PASS 보류 설정 반영 (2026-10-25)

- 전체 실행 입력801개(server197/front547/admin57)를 이전 배포 문맥과 대조하여 누락·차이0건, 운영 DB21개 migration checksum과 활성 인프라4개 SHA 일치를 확인했다. 베타 정책·광고 동의/철회·안내/FAQ·콩 상품 및 공유 UI/독립 콘솔 코드는 이미 beans-20261025에 반영되어 있었다. 앱 코드·이미지를 불필요하게 재배포하지 않았다.
- 빠져 있던 운영 SIGNUP_IDENTITY_MODE=email-only를 추가하고 API/worker만 재생성했다. 설정 원본을 /opt/crefans-backup-release-completeness-20261025에 비공개 백업하고 다른 runtime 값·이미지 설정 바이트 보존을 검사했다. 첫 시도의 백업 권한·따옴표 사전검사 실패는 변경 전에 중지됐고 수정 후 성공했다. SSH 지속 허용 규칙은 유지했다.
- 운영 HTTP16개, 브라우저8개(기존 콩6개와390/1280 실제 가입 화면 PASS 미노출·연령 확인·약관 차단2개), 서버196/프론트551 실행 파일 SHA·3이미지 전체 RootFS, 6컨테이너 restart0/OOMfalse 및 배치 failures={}를 재검사했다. DB/프록시 ID 유지, 실제 원장 균형·회사1억·정책 version2 수수료20%/보류7일 확인. 캡처 직접 확인.
- 가입은 빈 초대 명단·signupReady=false로 아직 닫혀 있다. 실결제·은행출금·광고메일 비활성화 유지. 이메일 연령 체크를 본인/성인인증으로 간주하지 않는다. 실제 금융·프로모션·메일·별도봇 테스트 발송 없음. 실PG 승인/은행 bridge·실제 개인정보 처리 사실/시행일·초대 명단 및 부하/복원 검수는 남아 있다.
- 증거: front docs/audit/release-completeness-20261025.json, 원본 server .local/release-completeness-20261025. 문서에 남아 있던 PASS 미적용·DB정책/결제migration 미적용 현재 설명을 갱신했다. 과거 실행 기록은 당시 상태로 보존한다. 세 리포 feat/bean-support의 누적 미커밋 보존, 커밋/푸시 없음.


## 콩 기능 운영 테스트 배포 (2026-10-25)

- 사용자 운영배포 지시로 API/worker·팬 프론트·독립 콘솔을 beans-20261025로 반영했다. 콩 지갑/충전·후원·스튜디오·콘솔 진입과 기존 목업 링크 유지. beta.crefans.com/preview/beans, /preview/studio/beans, /service/beans, admin.crefans.com/console/beans. 실제 서비스/콘솔은 기존 로그인·역할 가드를 유지한다.
- 운영 백업 /opt/crefans-backup-beans-20261025에 설정·단일 트랜잭션 MySQL dump/SHA를600/700으로 보존. migration17→21(베타/광고claim/콩원장/콩상품4개), 회사초기1억/발행대조-1억·genesis1회·증감0 확인. 승인 정책 DB version2=20%/보류7일(기존 version1=20%/0일). 기존 주문·출금0건, 테스트 자금을 실제 매출/자본금으로 기록하지 않는다.
- 운영 BETA_MODE=true/BEAN_LEDGER_ENABLED=true, BEAN_LIVE_PAYMENTS_APPROVED=false/BANK_PAYOUTS_ENABLED=false/MARKETING_MAIL_ENABLED=false, test_ck/test_sk와 CREFANS_E2E=false를 확인. 다른 비밀값/설정 보존. 가입 법률/초대 gate는 해제하지 않았고 실제 PG·PASS/은행 연결 완료/가입 개방으로 보고하지 않는다.
- local검증728소스 일치와3개linux/amd64 이미지 빌드, private SSH archive739,548,464바이트/SHA 대조. 운영 서버196/프론트551파일 SHA와3이미지 RootFS/아키텍처/릴리스 일치. HTTP16개(정상200/인증필수401), 실제 운영 브라우저6개(390/1280 목업충전·프로필후원·최소1000콩/20%견적·실지갑/콘솔로그인보호) 통과. 변경 전 새 지갑 미존재 대조 검사 통과. 실제 DB 원장재계산·21migration·배치heartbeat failures={}·6컨테이너 restart0/OOM false, DB/proxy ID 유지.
- 준비 중 Mac 디스크 부족으로 압축 실패·로컬 Docker 응답 중단 발생: 불완전 압축본/명시한 오래된 생성물·비활성 테스트 캐시만 정리하고 볼륨 초기화 없이 복구, 직접 SSH 스트리밍으로 전환했다. 운영 디스크97%→70%(15GB여유), 현재/직전복구이미지·소스/증거·DB/미디어볼륨 보존. 임시 패키징의 middleware 누락도 최종 rebuild 전 수정·이미지/실행파일 해시로 검증했다.
- 배포 초기에 sudo가 이미지 환경 덮어쓰기를 제거해 migration이 구버전으로 실행됨을 발견했다. bash stdin/compose interactive 소비 문제도 확인해 명시적 sudo env·--interactive=false로21migration이미지를 실행,4개실적용/재시작/원장·배치정상까지 재검사했다. 초기 오류 이력을 삭제하지 않는다. HTTP200만으로 DB완료를 선언하지 않는다. OCI index와runtime ID 차이는 전체RootFS레이어로 확인한다. 로그인 안내는 heading이 아닌 기존텍스트여서 브라우저locator를 수정하고 재검사했다.
- 복구: API/worker post-views-20261025, frontend gallery-close-soft-20261025, admin creator-verification-20261024와 백업설정으로 앱4개만 복구한다. 추가 DB테이블·원장·정책감사이력은 보존한다. down/볼륨삭제/seed/DB reset 금지. 집IP SSH 지속규칙 유지. 커밋/푸시 없음, 누적미커밋보존.
- 증거 front docs/audit/bean-deployment-20261025.json, 원본 server .local/bean-deploy-20261025. 다음은 사용자 실제화면 확인·버그수정이며 실PG 업종승인·법정환급/충전동의·은행연동/실입금·실출금 및 운영 부하/복원 검수는 별도다. 이번 배포검사에서 실제 사용자 충전/후원/프로모션/출금·메일·별도봇테스트 발송은 수행하지 않았다.


## 콩 상품 전체 연결·배포 준비 (2026-10-25, 운영 미배포)

- 팬 지갑/충전·결과/보낸 후원, 프로필·게시물·갤러리의 후원 레이어, 스튜디오 받은 후원·출금/PIN·내역, 독립 관리자 콩 지표·프로모션 지급·원주문 실입금 대사·출금 승인/사유 반려·개인지갑 출처 추적을 연결했다. BeanContext/BeanPages는 preview/service 공유, 기존 목업 URL 유지. 새 카탈로그 /preview/beans와 /preview/studio/beans, 실제 /service/beans 및 /service/studio/beans.
- 원장4+상품8모델/추가 migration2개·123 API(콩19개, Swagger 유저66/스튜디오42/콘솔34·공통 중복)·45화면. 기존 멤버십 원화 매출과 콩 충전/후원/확정 출금수수료를 합산하지 않으며 test/live/promotion을 구분한다. 회사초기1억·일반/프로모션 출처·프로모션 우선·구매잔액/프로모션 출금불가·받은일반콩1000콩 총액10만원부터/출금시20%를 적용했다.
- 회사 지갑 선행 잠금·원장/lot/예약·outbox 원자 저장, 요청키/내용 충돌·자기후원/타인주문·금액 검증, PG 승인 응답 유실/DB 실패 재조회, 신뢰하지 않는 웹훅 재조회 신호, 입금/7일 보류·PIN6자리/5회30초·2분 수량/계좌버전 인증, 은행 불확실 예약 유지·확정 반려 반환, 지급시 콩전량 회사복귀·수수료1회, 출처 취소 동결·미지급 보류·잔액/미완료건 탈퇴 차단을 구현했다. 신규 실제 출금 직전 PG 원결제 재조회 실패도 거부한다.
- 서버 build 및 실제 격리 MySQL/공급사 대역·금융/정기결제/베타/원장/Swagger86개, 프론트 레이어/타입321개, 콘솔 타입5개와 두 프론트의 배포용 빌드 통과. 새 콩4개+가입1개 및 기존 구독/환불/카드복구/유료미디어/베타18개 브라우저 검사 통과. 콘솔 브라우저11개도 통과하여 고유 브라우저 총34개를 확인했다. 캡처는 각 리포 .local/bean-product-20261025/screens에 보관한다.
- 초기 실패와 수정: 공유 AccountPages/BeanPages 순환 import 분리, 회사지갑 선행 잠금으로 동시 지갑생성 충돌 제거, 대역 결제검증 필드/제어 주입 수정, 목업 링크 이동으로 상태 보존, 동결잔액을 제외한 경합 테스트 준비, 관리자 strict locator 범위·nullable/DTO 타입 보완. 오래된 결제 수명주기 검사가 개발 DB의 미적용 열에서 실패하여 해당 테스트도 격리 E2E DB·정책 백업/복원으로 전환했다. 신규7일 환불 snapshot과 과거 계약 보존, 미입금 환불예약·수요일 검사 기대를 현행 계약으로 수정하고 재검사했다. 운영/개발 DB migration·환경 수정·실결제/송금/메일/봇 발송은 하지 않았다.
- feature BEAN_LEDGER_ENABLED/live 판매 BEAN_LIVE_PAYMENTS_APPROVED 기본false, actual 환경 미활성화. beta 은행송금 차단과 테스트콩 실제출금 금지를 유지한다. 실제 PG 충전/후원/환금성 업종 승인·판매약관/충전동의·법정 환급/유효기간·일한도, 은행/계좌검증 bridge·실입금 대사/실송금, 운영 migration/배포·부하/장애복구 검수는 남아 있다. 이 조건 없이 실금융 개방 완료/출시 무결함을 주장하지 않는다.
- 증거: 프론트 docs/audit/bean-product-20261025.json, 의미/근거/배포 순서는 서버 docs/platform-api.md·docs/platform-implementation.md·infra/platform/README.md 및 별도 콘솔 README. 세 리포 feat/bean-support의 기존 누적 미커밋 보존, 커밋/푸시·운영배포 없음. 과거 아래의 상품 미연결/정책 답변대기 기록은 이 로그와 정책 확정 기록으로 대체한다.


## 콩 정책 확정·최소 출금10만원 (2026-10-25)

- 사용자가 권장3안을 수락: 프로모션콩 우선 사용, 프로모션콩 후원 가능/현금출금 불가, 본인 구매콩 출금 불가·후원받은 일반콩만 수익출금. 콩 최소 출금은 수수료 차감 전 신청액100,000원=1,000콩으로 해석·안내했다. 수수료20% 20,000원/실지급80,000원. 기존 멤버십 원화 출금 정책은 이번 콩 정책 변경에 자동 합치지 않는다.
- `server/src/platform/bean-policy.ts`에 정책을 모으고 `beanWithdrawalQuote`가 받은일반콩 계정/최소1,000콩을 검사한다. 999콩 거부,1,000콩/1,001콩 견적, 구매·프로모션·프로모션수익·예약/회사지갑 거부를 검사했다. 일반 가치계산 beanCashQuote는 최소 출금액과 분리한다.
- 상세 설계의 답변대기/최소액 미정 부분을 확정값으로 갱신했다. 상품 충전/후원/은행 API·UI·집계는 여전히 후속 구현이며 운영 배포/DB/외부 금융 변경은 없다. 다음: 확정 정책에 따라 충전주문/재고예약/출처lot→후원/프로모션 우선 소비→출금/은행→공용UI·스튜디오/콘솔·대사 순서. PG/법정환급 조건과 실금융 검증은 별도다.
- 증거: front `docs/audit/bean-policy-confirmed-20261025.json`. 이전 로그의 답변대기는 이 기록으로 해소한다. 기존 미커밋과 feat/bean-support 유지.


## 콩 후원 설계·원장 기반 (2026-10-25, 상품 기능 미연결)

- 사용자 요청:1콩100원·출금시20%·회사초기1억·일반/프로모션 구분·이동/사유이력·가입지갑. 세 리포 feat/bean-support로 기존 누적 미커밋을 보존하고 분기했다. 신규 기능을 dev로 초기화하지 않았다.
- 구형Wallet/Transfer는 신규platform 미연결·Cognito/Decimal 구조여서 신규 BeanWallet/Account/Movement/Entry로 격리했다. 내부 균형원장·멱등키/내용해시·지갑순 잠금/ReadCommitted·잔액부족/동결/발행대조 보호·회사1억 초기이력을 구현했다. 출금 원화20% 정수 견적 함수와 BEAN_LEDGER_ENABLED 기본false의 가입 지갑/5계정 생성을 연결했다.
- 상세 DB·화면·API·매출 중복방지·충전lot/출금예약·실패복구·작업순서/합격조건·공식근거는 server docs/platform-implementation.md의 콩 후원 확장 설계. 팬 지갑/충전/후원레이어, 스튜디오 후원/출금, 독립콘솔 지갑/수불/대사/매출 변경을 계획했다. 실제 화면/충전/후원/출금 API와 집계는 아직 미연결이다.
- **답변 대기:** 프로모션콩 현금화/회사부담, 구매자 자기충전잔액 출금 범위, 사용순서. 권장 묶음을 질문했으며 임의 채택하지 않는다. 후원 취소 UI 미제공과 법정 충전금 환급·오결제·차지백을 분리해야 한다. PG 충전/후원/환금성 계약 및 법적 분류 미확인. 출금 최소액 총액/실지급액 기준 등도 결정 필요.
- 새 migration은 격리 E2E DB만 적용, 운영/개발 DB·환경·배포·외부 발송/결제/지급 없음. 원장 코드에는 공개 API/기존 수익원 연결이 없어 기존 매출을 늘리지 않는다. 검증: 서버 build·Prisma validate, 원장4+OpenAPI11개와 실제 격리API/DB 가입 Chromium1개(지갑1/계정5) 통과. 증거 front docs/audit/bean-support-20261025.json. 다음: 답변 확정 후 충전주문/회사재고예약/출처lot→후원→출금예약/은행→공용UI/콘솔/3Swagger→기존구독회귀 순서.


## 확정 베타 정책 구현·검증 (2026-10-25, 운영 미배포)

- 사용자 선택7.C/10.C/13.B/16.C·나머지A를 구현했다. 베타 빈 초대명단 거부·일반 콘텐츠·테스트 키만 허용·실송금 차단, 신규 미사용7일 환불과 기존 계약 보존,24시간 간격 추가3회 갱신, 테스트→실과금 차단, PG 입금 대사/미확인잔액 제외·최소1만원·수요일 신규 지급(기처리 송금 확인은 매일)을 적용했다. 수수료/보류 원본은 기존 DB version/감사 경로이며 운영 선택값2000bps/7일 적용은 배포 단계에서 수행한다.
- 광고 선택 동의/철회 버전·이력, 최고 관리자 캠페인 대기열, 발송 직전 동의 재검사·경합 잠금, 무료 비로그인 수신거부, 처리결과/2년 확인, SMTP 결과불명·중단 발송 자동 재전송 금지를 구현했다. 필수 인증/거래 안내와 분리하며 광고 실제 발송은 하지 않았다. 목업/실서비스 공용 팬·크리에이터 이용안내2화면과 FAQ, 설정/출금/결제 정책 표시를 연결했다.
- 서버 build 및 정책·17계정 역할·금융·법률·OpenAPI46개, 프론트 레이어/타입·단위321개, 브라우저19개 고유 시나리오 통과. PC/모바일 안내 캡처 확인, 실제 격리 MySQL·SMTP/PG/PASS/은행 대역이다. 초기 Swagger 개수2건·5천원 출금 시나리오·스위치 접근성 이름 기대값을 새 계약에 맞춰 수정했다. 수신거부 HTML POST의 이중응답 오류는 실제 브라우저에서 발견하여 수정하고 서버 지속응답까지 재검사했다. 실패한 E2E의3명/2문서 등 해당 fixture만 추적해 정리했다.
- 새 migration2개는 전용 crefans_platform_e2e에만 적용했다. 개발/운영 DB migration·환경값 변경·배포·실외부발송·커밋/푸시는 없다. 두 리포 feat/beta-signup의 누적 미커밋 변경을 보존했다. 테스트 통과를 실서비스 개방/무결함 보장으로 보고하지 않는다.
- **개방 전 남음:** 초대 이메일·베타 시작일, 실제 탈퇴/항목별 보유·파기, AWS/Google/Telegram 계약·국가·보유기간, 사업자/PG·세무 사실 확인. 법률문서 effectiveAt=null/signupReady=false 유지. 광고 서명키/발송 활성화·실SMTP/DKIM, 실제 PG/은행·수요일 공휴일/마감은 별도 확인한다. 실제17명 동시 사용·운영 부하는 미검증이다.
- 최신 근거는 front `docs/audit/beta-policy-implementation-20261025.json`, 선택표/개방 조건은 front `docs/beta-role-test-plan.md`, 적용 절차는 server `docs/platform-api.md`의 확정 베타 정책 절이다. 문서 계약104 API(유저58/스튜디오37/콘솔28),43화면,19migration·60문서 검증과 잘못된 링크/누락/변경 탐지 대조 검사도 통과했다. 다음은 실제 처리 사실·초대명단 준비와 가입 시행본 확인 후 별도 운영 적용이다.


## 정책 결정 당시 기록 (2026-10-25, 아래 구현 대기는 상단 최신 로그로 대체)

- 사용자 답변: **7.C, 10.C, 13.B, 16.C, 나머지 A**. 초기17계정 초대·일반 콘텐츠·테스트 결제만·2주 베타, 판매자/중개 기본안 검토, 총20%에 PG비용/수수료VAT 포함, 미사용7일 전액환불(법정 권리 별도), 이용후 해지예약/개별환불, 실패후24시간 간격3회 추가, 보류7일·최소1만원·수요일 지급·초기 이체비 플랫폼 부담, 판매중단시 신규/갱신중단·기결제기간 제공, 테스트금융 분리·실과금 새 동의로 기록했다.
- Telegram은 IP/사건 식별자를 유지하되 실제 계약·국외이전 요건 확인, 고객지원 평일10~18시/2영업일 첫답변 목표, 팬/크리에이터 안내 각1페이지+공통FAQ, 광고메일은 베타부터 선택적 사전 동의·수신거부 절차를 갖춰 운영한다. 만19세 이상·약관 코드관리·미사용환불 별도 진입버튼 없음 유지.
- [확정 정책·미구현 항목](docs/beta-role-test-plan.md)과 [원문 선택·조사 기록](docs/audit/beta-policy-questionnaire-20261025.json)에16개 답을 보존했다. 환불 API의7일 기한, 정산 DB정책/실입금 대사/주별지급/최소액, 갱신 횟수·기한 경계, 광고 동의/수신거부/발송 제외 등은 후속 구현·검수 대상이다. 현재 제품 동작과 선택을 혼동하지 않는다.
- 조사 당시 운영 signupReady=false·시행일null. 초대 이메일, 시행/시작일, 보유·파기 실처리, AWS/Google/Telegram 실제 국외이전 사실, 신고·공개 사업자 정보 및 PG·세무 조건은 추가 확인한다. 일반 콘텐츠 베타 선택만으로 법률 게이트를 해제하지 않는다. 실청구/실출금 없음.
- 이번 범위는 정책/검수 문서 갱신이다. 질문 답안16개와 사람이 읽는 정책표의 일치 검사를 실행하고 문서 계약·참조·스냅샷을 검사한다. 제품 테스트·운영 설정·외부 발송·배포·커밋/푸시는 수행하지 않는다. 검증 결과는 front `.local/beta-policy-decisions-20261025/verification.json`에 기록한다. 다음: 확정 정책에 맞는 구현·실제 처리/공식 근거 확인 후 약관·개인정보처리방침·안내를 정리하고 검수한다.

## 갤러리 닫기 1번 시안 운영 배포 (2026-10-25)

- 선택한 은은한 원형을 공용 MediaOverlay에 반영: SVG36→24px, 버튼40→44px, 반투명 검정40% 원형/hover55%, 모바일 상단·오른쪽12px와 안전영역. 사진 단독 확대도 같은 스타일을 공유하며 전체 상세 패널의 밝은 배경/진한 아이콘 예외는 유지한다. 목업·실서비스 게시물과 프로필/배경 확대에 함께 적용한다.
- `crefans-front:gallery-close-soft-20261025` 운영 반영. 실제 운영535소스와 기준본을 대조한 후2파일만 변경했고 나머지533파일은 동일하다. 빌드/타입·레이어 검사 통과, 검수 이미지/운영 각각 Chromium320·390·1280/WebKit390의18상태 실측·색상/위치/클릭·Escape 검사 통과. 운영 변경 전 검사는24px 기대/실제36px로 실패하여 변경 탐지를 확인했다. PC/모바일 캡처 육안 확인. 단순 SVG/CSS 변경으로 전체 제품/금융 검사는 반복하지 않았다.
- 운영535파일 SHA 일치,6HTTPS200, frontend restart0/OOM없음, 다른5컨테이너ID·이미지 유지. 집SSH 지속 허용·기존 미커밋 보존, 커밋/푸시 없음. 롤백 `crefans-front:ui-batch-ready-20261025`, 환경 백업 `/opt/crefans-backup-gallery-close-soft-20261025`.
- [배포·검증 증거](docs/audit/gallery-close-soft-deployment-20261025.json), 원본 `.local/gallery-close-soft-20261025/`. 초기 준비 중 이전 소스의 .dockerignore 부재로 중단한 뒤 로컬 빌드 제외파일을 만들고535소스를 다시 대조했다. 물리 iPhone/기존 WebKit 포커스 복귀 미확인은 별도이며 이번 시각 수정으로 해결됐다고 주장하지 않는다. 다음: 사용자 운영 화면 확인. AGENTS의 공용 UI·PROGRESS·검증 규약 유지.

## 갤러리 닫기 버튼 비교 시안 (2026-10-25)

- 운영의36px 닫기 아이콘을 줄인3개 시안을 실제 목업 갤러리의 브라우저 표시만 변경하여 캡처했다. ①24px 반투명 원형(추천), ②24px 배경 없음, ③22px 밝은 둥근 사각형. 세 안 모두44×44px 터치 영역이며 Chromium390×844에서 아이콘/버튼 크기를 실측하고 비교 이미지의 잘림·표시를 육안 확인했다.
- 제안 전용으로 제품 소스·운영 배포 변경 없음. 원본/비교 HTML·PNG는 `.local/gallery-close-proposals-20261025/`, [측정·파일 지문](docs/audit/gallery-close-proposals-20261025.json). 기존 미커밋 보존. 다음: 사용자 선택 후 공용 MediaOverlay에 적용한다. 실제 기기/상호작용 전체 검증은 이번 시안 범위 밖이다.

## 공용 UI 일괄 운영 배포 완료 (2026-10-25)

- `crefans-front:ui-batch-ready-20261025`를 운영에 반영했다. 초기화 전 클릭 손실 방지를 위해 공통 본문을 초기화 완료까지 inert로 유지한다. 설정 텍스트 움직임의 오른쪽 스위치, 멤버십 안내/차단 사진, 상세 갤러리 진입·댓글쓰기 숨김·닫기36px, 피드 댓글 닫기, 알림 라이브칩 제거, 공통 뒤로가기 및 공유 레이어를 포함한다. 목업/실서비스 동일 표시 컴포넌트다. 카카오 앱 키 미설정으로 해당 선택지는 준비 중이며 실제 카카오 발송은 미검증이다.
- 운영 기준529파일에21수정·6추가, 최종535파일 SHA가 검수 이미지/운영과 일치한다. frontend만 교체했고 API/worker/DB/admin/proxy의 ID·이미지는 보존,6개HTTPS 경로200·frontend restart0/OOM없음. 집SSH 지속 허용 규칙은 그대로다. PASS보류 가입/초대·약관 gate 등 다른 로컬 정책 변경은 제외했다. 기존 미커밋 보존, 커밋/푸시 없음.
- 전체321단위·레이어/타입, 선택 이미지126관련 단위 통과(배포하지 않는 PASS보류 계약 시험1개 명시 제외). 최종 이미지77브라우저 통과·기기별 기존3조건 제외. 운영 최초75통과/2실패 후 관련4조건 재검·3회반복12건 통과로77개 고유 조건을 확인했다. 이동경로79건·알림4조건 각각 통과. 지연JS로 키보드·클릭을 막고 초기화 후 동작하는 회귀시험도 이미지/운영 각각8건 통과(기존2건 실패 재현). PC/모바일 캡처 육안 확인. 서비스 API 응답은 대역이며 실제 회원·결제·외부 공유 실행을 뜻하지 않는다.
- 통합 중 오래된 OptionalImage 대역2건을 수정했고, 새 게시물 미리보기의 UTC/한국 시간 차이로 발생한 React425/422를 재현한 뒤 Asia/Seoul 명시로 해결했다. 시간대 단위시험 및 JS유무/시간대4조건 확인. 운영 지연JS 회귀에서 초기클릭 손실도 확인하여 공용 본문 inert 보완 후 재배포했다. React18 inert 문자열 타입은 기존 StudioShell 패턴으로 정정했다. 문서 전환 프리패치 취소는 원본 오류와 구분해 기록했다. 문서 load/빈 font set의 ready 대기가 멈추는 자동화 현상은 UI 직접 검사와 검사 프로세스의 폰트 대기 제외로 검수했으며 실제 폰트/화면도 확인했다. 최종 운영의 카탈로그 준비시점 실패는 load 대기로 정정했고 PC 목업 댓글 입력1회 일시실패는 단독/반복 재검에서 재현되지 않았다. 해당 원인은 확정하지 않았으며 최초 실패를 보존했다. 상위 브라우저 원인·물리 iOS 검증을 완료로 주장하지 않는다.
- 운영 공간 확보를 위해 미사용 이전 프론트 이미지3개만 로컬 복구 아카이브SHA·사용 여부 확인 후 삭제했다. 현재/직전 이미지 및 다른 서비스 보존. 직전 롤백 `crefans-front:ui-batch-20261025`(초기화 보완 전), 최초 기준 `crefans-front:post-views-icon-20261025`, 환경 백업 `/opt/crefans-backup-ui-batch-ready-20261025`. [배포 검증 기록](docs/audit/ui-batch-deployment-20261025.json), 원본 `.local/ui-batch-deploy-20261025/`. 아래 각 로컬 작업 기록의 미배포 표시는 당시 상태이며 이번 범위는 이 기록으로 대체한다.
- 다음: 사용자 운영 화면 확인, 카카오 키/허용 도메인 연결 시 실제 공급자 공유 검증. 조회수 자동집계·기존 WebKit 갤러리 진입 버튼 포커스 복귀 미확인·물리기기 공유창은 이번 범위 밖의 기존 제한으로 남긴다. AGENTS의 공용UI·PROGRESS우선·검증증거 규약 유지.

## 설정 텍스트 움직임 스위치 (2026-10-25, 로컬 반영)

- 설정 페이지의 텍스트 움직임 버튼을 왼쪽 라벨·오른쪽 기존 Toggle로 교체했다. 공용 MarqueeMotionControl의 switch 변형을 사용하며 켜짐=움직임, 꺼짐=정지·줄바꿈이다. 목업·서비스의 SettingsPage를 공유하며 다른 화면의 버튼과 같은 localStorage 설정/변경 이벤트를 사용한다. 디자인시스템에도 동일 스위치를 추가했다.
- 합격 조건: PC·모바일 오른쪽 스위치 배치, 즉시 상태 동기화, 이동/새로고침 후 유지, 키보드 Space로 재활성화, 기존 동작 줄이기 및 전체 문자열 표시 보존. 관련 계정 단위12건·레이어·타입 통과, Chromium320/390/1280·WebKit390에서 브라우저12건 통과. 서비스 API/실계정 변경 없이 공용 컴포넌트와 목업·카탈로그에서 검증했다.
- 증거 [검증 기록](docs/audit/text-motion-switch-20261025.json), 원본 `.local/text-motion-switch-20261025/`, 기존 `e2e/marquee-text.spec.ts`를 갱신했다. 첫 모바일 전체 화면 캡처는 내부 스크롤 아래의 스위치를 담지 못해 스위치로 스크롤한 캡처로 해당4건을 재검사해 통과했고 PC·WebKit 모바일 화면을 육안 확인했다. 기존 미커밋·AGENTS 규약 보존, 커밋/푸시·운영 배포 없음. 앞선 배포 대기 작업/공유 레이어 미배포 상태 유지. 물리기기·운영 검증은 미실행.

## 멤버십 안내·차단 영역 이미지 표시 (2026-10-25, 로컬 반영)

- 공용 PostMembershipNotice의 차단 영역에는 가입 가능한 최저 등급 상품의 image를 배경으로 표시하고 밝기를40%로 낮춰 기존 잠금/문구/CTA를 유지한다. 안내 모달은 각 상품 카드 상단에16:9 멤버십 이미지를 표시한다. 상품 전용은 지정 상품만 대상, 판매 중단 상품은 제외한다. 게시물 원본·썸네일을 대체 이미지로 사용하지 않는다.
- 기존 OptionalImage 재사용으로 이미지 없음/실패는 기존 그라데이션 안내로 복귀하고 모달에도 빈 이미지 자리를 남기지 않는다. Plan.image는 기존 백엔드 service.plan DTO와 서비스 모델에서 이미 전달하므로 서버/API 변경은 필요하지 않았다. 디자인시스템 카탈로그도 해당 크리에이터의 멤버십을 주입하고 이미지 있음/없음/실패 상태를 추가했다. 피드·상세·목업·실서비스가 같은 컴포넌트를 쓴다.
- 레이어/타입·관련40단위, 최종 Chromium320/390/1280·WebKit390 브라우저12건 통과. 최저등급/상품전용/판매중단/이미지없음/404실패·기존가격/혜택/가입링크·가로넘침없음·비공개 게시물 이미지 요청0을 확인했다. WebKit 모바일 차단영역/모달과 PC모달 스크린샷 육안 확인. 최초8브라우저 통과 후 카탈로그 상태 추가에 따라12건 재실행. 서비스 API는 GET 대역, 실회원·운영 변경 없음.
- 증거 [검증 기록](docs/audit/membership-offer-images-20261025.json), 원본 `.local/membership-offer-images-20261025/`, 단위 `tests/post-membership-offer.test.cjs`, 브라우저 `e2e/membership-offer-images.spec.ts`. 기존 미커밋·AGENTS 규약 보존, 커밋/푸시·배포 없음. 다음 배포는 PostMembershipNotice의 이미지2곳·social CSS·카탈로그의 관련 옵션만 선택한다. 기존 상세 갤러리/댓글쓰기 미노출/닫기36px/라이브칩 미노출도 배포 대기이며 미배포 공유 레이어를 섞지 않는다. 물리기기·운영 검증은 미실행.

## 알림 라이브 필터 칩 미노출 (2026-10-25, 로컬 반영)

- 사용자 요청대로 NotificationsPage의 필터 선택지에서 라이브만 제외했다. 데이터에서 동적으로 유형을 모아 만드는 공통 UI이므로 목업/실서비스 모두 동일하게 적용한다. 기존 알림 데이터·전체 목록·다른 유형/읽음 처리는 변경하지 않는다.
- Chromium390/1280 × 목업/서비스4조건에서 라이브 버튼0개, 기본5분류 표시·댓글 필터/전체 복귀·기존 라이브유형 알림 보존·페이지 예외0을 확인. 서비스는 GET 응답 대역, 실제 알림 변경 없음. 모바일 스크린샷 육안 확인. 단일 필터 표시 변경으로 신규 영구 시험/전체 제품검사는 추가하지 않았다.
- 증거 [검증 기록](docs/audit/notification-live-chip-20261025.json), 원본 `.local/notification-live-chip-20261025/`. 기존 미커밋·AGENTS 보존, 커밋/푸시·배포 없음. 다음 배포에 알림 filters 한 줄을 선별한다. 이전 상세 갤러리·댓글쓰기 숨김·닫기36px도 배포 대기이며 미배포 공유 레이어는 별도다. 운영/물리기기 검증은 미실행.

## 게시물 상세 갤러리 진입 연결 (2026-10-25, 로컬 반영)

- 원인: PostDetailPage는 PostMedia에 onOpen을 주입하지 않아 사진이 일반 이미지로 표시되고 갤러리 진입이 없었다. 피드와 같은 PostOverlay를 연결하여 클릭한 사진의 미디어 인덱스부터 열고 이미지/동영상을 넘긴다. 본문 동영상은 기존 재생 컨트롤을 유지한다. 이전/다음 게시물 문맥은 상세에 임의 추가하지 않았다.
- 잠김·읽기 전용·미디어 없음 진입 차단 유지. ID/권한/readOnly 변경 시 열린 갤러리를 닫고 선택 게시물도 초기화한다. 최초 권한 복구 단위시험에서 닫힘 애니메이션이 남아 closing 갤러리가 재등장하는 경우를 탐지해 postId 초기화로 수정했으며 재시험 통과. 기존 닫기 애니메이션·댓글 입력/오류 초안·36px X·댓글 쓰기 미노출은 유지한다.
- 수정 전 회귀시험은 상세 확대 버튼0개로 실패(피드와 같은 사진2개 확대 버튼을 기대). 최종 레이어/타입·관련 단위24건, Chromium320/390/1280·WebKit390 브라우저15건 통과, PC에 해당하지 않는 모바일 전용1건 제외. 클릭 인덱스/이미지·영상 넘김/닫기·Escape/스크롤 잠금 복원/목업 및 서비스 GET 대역/잠긴 이미지 요청0/텍스트 전용/기존 갤러리 댓글을 확인. 최초 스크린샷은 미디어 슬라이드 전환 중이어서 전환 완료 대기 후 상세8검사를 재실행·캡처해 통과/육안 확인했다. 물리기기·운영·실회원 검증은 아니다. 앞선 WebKit 포커스 복귀 미확인은 이번 범위에서 완료로 주장하지 않는다.
- 증거 [검증 기록](docs/audit/post-detail-gallery-20261025.json), 원본 `.local/post-detail-gallery-20261025/`, 회귀 `tests/crefans-social.test.cjs`, `e2e/post-detail-gallery.spec.ts`. 기존 미커밋·AGENTS 규약 보존, 커밋/푸시·배포 없음. 다음 운영 배포는 상세/갤러리 댓글쓰기 미노출·X36px·상세 갤러리 연결을 선별하며 SocialPages의 미배포 공유 레이어 변경은 섞지 않는다. 운영 마지막 확인은 post-views-icon-20261025다.

## 갤러리 닫기 아이콘 확대 (2026-10-25, 로컬 반영)

- 공용 MediaOverlay의 닫기 X SVG만28×28→36×36px로 확대했다. PC·모바일 게시물 갤러리와 같은 컴포넌트를 쓰는 프로필 사진/배경 확대에 함께 적용. 버튼 배경·위치·클릭 크기·닫기/Escape/포커스 동작은 유지했다.
- Chromium390/1280·WebKit390에서 게시물 기본·모바일 패널전체·미디어전체·프로필 확대10상태의36px 실측, 버튼 내부/화면 내 표시와 클릭/Escape 닫기·페이지 예외0을 확인. 단순 SVG 크기 수정으로 새 영구 테스트나 전체 제품검사는 추가하지 않았다. 최초 검사3건은 시험 경로/패널 순서/준비 시점 오류로 정정했다. WebKit의 원래 진입 버튼 포커스 복귀는 명시적 사전 focus로도 추가2회 실패했다. 이번 아이콘 변경과 무관한 핸들러는 수정하지 않았으며 포커스 복귀는 통과로 주장하지 않는다. 최종 검사는 크기/표시/클릭/Escape로 한정했고 최초 로그도 보존한다.
- 증거 [검증 기록](docs/audit/gallery-close-icon-20261025.json), 원본 `.local/gallery-close-icon-20261025/`. 기존 미커밋·AGENTS 규약 보존, 커밋/푸시·운영 배포 없음. 상세·갤러리 댓글쓰기 미노출과 이번36px 아이콘은 배포 대기. 다음 배포 때 관련 부분만 선별하며 공유 레이어 미배포 변경은 섞지 않는다. 물리기기/운영 검증은 미실행이다.

## 갤러리 댓글 쓰기 링크 미노출 (2026-10-25, 로컬 반영)

- 직전 상세 화면 변경을 갤러리 오버레이에도 적용했다. social.module.css의 숨김 선택자에 `.overlay .commentWrite`만 추가하여 목업·실서비스 공통 갤러리의 댓글 쓰기 링크를 숨긴다. 댓글 목록·모바일 플로팅 입력·PC textarea·등록·피드 초안 전환용 링크는 유지한다.
- 기존 Playwright 갤러리 시나리오에 목업/서비스의 링크 미노출 확인을 추가했다. Chromium320/390/1280·WebKit390에서 14통과, PC에 해당하지 않는 모바일 전용2조건 제외. 상세/피드 회귀, 갤러리 입력·등록·오류 초안·중복 방지·목록 접기/펼치기·패널 크기·확대/축소·게시물 전환·닫힌 댓글을 확인했다. 서비스 API는 대역이며 실제 회원/운영 댓글 등록은 하지 않았다. 단일 CSS 표시 변경으로 새 단위시험이나 전체 제품시험은 추가하지 않았다.
- 증거 [검증 기록](docs/audit/gallery-comment-link-20261025.json), 원본 `.local/gallery-comment-link-20261025/`. 기존 미커밋·AGENTS 규약 보존, 커밋/푸시·운영 배포 없음. 상세+갤러리 미노출은 모두 배포 대기이며 운영은 마지막 확인한 post-views-icon-20261025다. 다음 배포 요청 시 이전 상세 data 표식과 CSS의 상세/갤러리 숨김 규칙만 선택하고 미배포 공유 레이어 변경은 섞지 않는다.

## 포스팅 상세 댓글 쓰기 링크 미노출 (2026-10-25, 로컬 반영)

- 요청 범위를 독립 게시물 상세(`/preview/post/:id`, `/service/post/:id`)로 한정했다. 공용 PostDetailPage 루트에 data-post-detail을 표시하고 해당 화면의 commentWrite 버튼만 CSS로 숨긴다. 댓글 목록·PC textarea·모바일 플로팅 입력 및 등록은 유지한다. 여러 피드 댓글 초안 전환용 댓글 쓰기와 갤러리 동작은 변경하지 않았다.
- 합격 조건: 목업/실서비스 상세에서 링크 미노출, 입력·등록/오류 초안·중복 방지·잠김/닫힘 보존, 피드 게시물별 초안 전환 유지. 타입검사 통과, 기존 모바일 댓글 Playwright3시나리오×4환경(Chromium320/390/1280·WebKit390) 중11통과·PC의 모바일 전용1조건 제외. 서비스 API는 GET/POST 대역이며 실제 운영 댓글 등록은 하지 않았다. WebKit 모바일 입력바 스크린샷 육안 확인. 단순 표시 범위 변경으로 신규 단위시험/전체 제품시험은 추가하지 않았다.
- 증거 [검증 기록](docs/audit/post-detail-comment-link-20261025.json), 시작본/로그/화면 `.local/post-detail-comment-link-20261025/`. 기존 미커밋 보존, 커밋/푸시·운영 배포 없음. 마지막 확인 운영은 post-views-icon-20261025이며 이번 변경은 배포 대기다. 다음 운영 배포 때 SocialPages의 루트 표식1곳과 social CSS1규칙만 선별한다. 공용 UI·증거·PROGRESS 우선 확인 AGENTS 규약은 유지했다.

## 조회수 눈 아이콘 공용 SVG 교체·운영 반영 (2026-10-25)

- 사용자 요청대로 생성 PNG 대신 기존 비밀번호 입력창의 FieldIcon(show) SVG를 재사용했다. FieldIcon에 export만 추가하고 PostViews에서 호출해21×21px로 표시한다.0/만·억 숫자·접근성 이름·6px 간격은 유지. 공개 에셋의 post-views-round-flat-v1.png와 generation.json을 삭제했고 과거 검증 기록은 당시 기록으로 보존했다.
- 최종 레이어·타입·316단위 통과. 로컬/선별 이미지/운영 각각12브라우저 검사(Chromium320/390/1280·WebKit390): 피드·프로필·상세·갤러리·카탈로그 및 서비스 GET 대역에서 기존 SVG/21px, img 없음,0/일반/큰 값/미제공, 버튼 겹침·가로넘침 없음 확인. 운영 PC/모바일 스크린샷 육안 검수. 실제 회원 활동·물리기기 검증은 아니며 조회수 자동 집계는 기존 미구현 상태다.
- `crefans-front:post-views-icon-20261025` 운영 배포. 기존531파일을 운영과 대조해3소스수정/2에셋삭제만 선별, 이미지·운영529파일 SHA 일치. 생성 PNG/기록의 운영 직접 URL404 확인,6HTTPS/health200·프론트 restart0/OOM없음. API/worker/DB/admin/proxy ID·집SSH규칙 보존, 운영 DB·새 의존성·디스크 이미지 정리 없음. 로컬 검수 컨테이너 제거.
- 최초 Ant Design React 아이콘 후보는 공용 서비스의 기존 의존성 제한과 DOM 없는 단위테스트에 맞지 않아 사용하지 않았다. 기존 FieldIcon을 찾고 해당 공용 SVG로 확정, 임시 테스트 환경 변경도 원복했다. 최초 실패 로그와 최종 성공을 구분해 보존하며 규약/검사를 완화하지 않았다.
- 증거 [검증 기록](docs/audit/post-views-icon-20261025.json), 원본 `.local/post-views-icon-20261025/`, 롤백 `crefans-front:post-views-20261025` 및 `/opt/crefans-backup-post-views-icon-20261025`. 기존 미커밋·공유 레이어 미배포 상태 보존, 커밋/푸시 없음. AGENTS의 공용 UI·증거·진행기록 규약 유지. 이번 수정 미해결 없음, 다음은 사용자 운영 화면 확인.

## 게시물 조회수 누락 운영 수정 (2026-10-25)

- 운영에서 조회수/눈 아이콘이 안 보이는 원인은 로컬 구현이 앞선 선택 배포에서 제외된 것이었다. 운영527파일/서버184파일 기준선을 실제 컨테이너와 대조하고 조회수 관련 프론트6수정·4추가 및 서버 DTO/Swagger2파일을 반영했다. 공용 PostViews로 피드·프로필·상세·갤러리·관련 미리보기를 공유한다. 프론트/서버 이미지 `post-views-20261025`, API/worker/프론트 교체. 다른 로컬 변경·공유 레이어는 포함하지 않았다.
- 선별 소스31단위·서버 build 및 실제 격리DB/HTTP3+OpenAPI11 통과, 두 amd64 이미지 빌드 성공. 이미지/운영 각각12브라우저 검사(Chromium320/390/1280·WebKit390)에서0/일반/만·억/미제공, 눈 이미지 로딩·겹침/가로넘침 없음 확인. 운영 PC/WebKit 모바일 스크린샷 육안 검수. 서비스 화면 데이터는 GET 대역이며 운영 공개 posts는0건으로 실제 게시물의 누적값 대조는 격리DB 시험에 한정한다.
- 운영 프론트531/서버184소스 SHA 일치,6페이지/health200·눈 에셋 바이트 일치, 교체3서비스 restart0/OOM 없음. admin/DB/proxy ID·집SSH규칙 보존, migration/seed/실회원 변경 없음. 복구 아카이브를 확인한 미사용 category-icons/gnb-unread 과거 프론트 이미지2개만 정리했고 최신/직전 이미지 유지. 배포후2.52GiB 여유, 로컬 검수 컨테이너 제거.
- 최초 선별 카탈로그 문맥 차이와 서버 Dockerfile 경로를 수정해 재검증했다. 최초 이미지 브라우저2건은 컨테이너 준비 전 접속(ERR_EMPTY_RESPONSE)으로 실패했고 HTTP 준비 확인 후12개 통과했다. 갤러리 조회수 행이 실제 캡처에 들어오도록 스크롤한 최종 검사도12개 통과. 최초 실패 로그/trace를 보존한다.
- 증거 [배포 검증](docs/audit/post-views-deployment-20261025.json), 원본 `.local/post-views-deploy-20261025/`, 설정 복구 `/opt/crefans-backup-post-views-20261025`. 커밋/푸시 없음, 기존 AGENTS 규약 유지. **저장된 조회수 표시만 배포했으며 신규 v1 자동 증가·중복 집계는 아직 미구현**이다. 물리기기·실제 회원 활동/공급사 검증은 아니다. 다음 별도 집계 작업에서는 노출/상세/반복 기준을 먼저 확정한다.

## 메시지·알림 구분선 제거 운영 배포 (2026-10-25)

- `crefans-front:inbox-dividers-20261025` 운영 반영. 직전 profile-category의527파일을 실제 운영과 대조하고 공용 social CSS에서 알림/모바일 메시지·알림의 border-bottom 선언2개만 제거했다. 아래 로컬 작업의 미배포 상태를 해소했다. 노란 미확인 배경·빨간 점·기존 패딩·PC 메시지 패널 테두리와 다른 UI는 유지한다.
- amd64 빌드/타입검사 통과, 선별 이미지·운영527소스해시 일치. 운영 변경 전12/선별 이미지12/운영 변경 후12브라우저 조건(Chromium320/1280·WebKit390 × 목업/실서비스 GET대역 메시지·알림)을 확인했다. 하단 테두리0px·배경/패딩/가로위치/간격 동일·모바일 전체폭/16px 내부여백·빨간 점·가로넘침 없음. 이미지와 운영 모바일/PC 스크린샷 육안 검토. 단순CSS로 전체 단위검사 반복 없음, 실회원 변경·물리기기 검증은 아니다.
- 서버 여유 공간1.85GiB에서, 로컬 복구 아카이브 SHA와 컨테이너 미사용을 확인한 gnb-clear/gnb-flat 과거 프론트 이미지2개만 정리했다. 당시 현행 profile-category·직전 marquee-names 및 모든 컨테이너/볼륨은 보존했다. 배포 후 여유2.54GiB.6HTTPS200/API health, 프론트 restart0/OOM 없음, 다른5컨테이너ID/이미지·집SSH규칙 유지. 로컬 검수 컨테이너 제거.
- 증거 `docs/audit/inbox-dividers-deployment-20261025.json`, 원본 `.local/inbox-dividers-deploy-20261025/`, 복구 이미지 `crefans-front:profile-category-20261025`, 설정 백업 `/opt/crefans-backup-inbox-dividers-20261025`. 기존 미커밋과 조회수/공유 로컬 변경 보존·이번 배포 제외. 커밋/푸시 없음, AGENTS 규약 유지. 이번 요청 미해결 항목 없음; 다음은 사용자 운영 확인.

## 메시지·알림 목록 구분선 제거 (2026-10-25, 로컬 구현)

- 공용 `social.module.css`에서 알림 행의 하단 테두리와 모바일 메시지/알림 행의 하단 테두리 선언2개만 제거했다. PC 메시지 행은 기존부터 테두리가 없어 그대로 유지한다. 메시지 패널 외곽·대화방 헤더·GNB 구분선은 항목 사이 구분선이 아니므로 변경하지 않았다.
- 변경 전후 각각12브라우저 조건(Chromium320/1280·WebKit390 × 목업/실서비스 GET대역의 메시지·알림)에서 행 테두리1→0px, 그림자 없음, 기존 배경·패딩·가로위치·간격 동일, 모바일16px 내부여백/디바이스 끝까지 배경·빨간 미확인 점·가로넘침 없음을 확인했다. 모바일 메시지/알림 스크린샷 육안 검토. 단순CSS2속성 제거로 신규 단위검사·전체 제품검사 반복 없음.
- 증거 `docs/audit/inbox-dividers-20261025.json`, 원본·변경 전후 측정 `.local/inbox-dividers-20261025/`. 목업과 실서비스가 같은 스타일을 사용한다. 실회원 변경·실기기 검증은 아니며, 이번 요청에는 배포 지시가 없어 운영 미배포. 운영은 `crefans-front:profile-category-20261025` 유지. 다음 배포 요청 시 CSS2선언 제거만 선별 반영한다. 기존 미커밋·AGENTS 규약 보존, 커밋/푸시 없음.

## 프로필 카테고리 아이콘 운영 배포 (2026-10-25)

- 프로필의 `#카테고리` 표기에서 #을 제거하고 검색·홈 필터와 같은 `CategoryIcon` 매핑/이미지젠 원본을 재사용했다. 아이콘20px·글자 간격6px, 기존 작은 표시용 칩 유지. 캠핑·브이로그 등 미등록 태그는 이름만 표시하고 빈 목록은 생략한다. 공용 ProfileHeader로 목업·실서비스·관련 프로필 미리보기에 적용, 디자인시스템에 등록/미등록/빈 태그 예시를 추가했다.
- `crefans-front:profile-category-20261025` 운영 배포. 직전 marquee-names의527파일을 실제 운영과 대조한 뒤 CategoryChip/ProfileHeader/creator CSS/카탈로그4파일만 선별했다. 조회수·공유 레이어의 앞선 로컬 변경은 이번 배포에 포함하지 않았다. 프론트 외5컨테이너ID/이미지·집SSH규칙 유지, 커밋/푸시 없음.
- 레이어·타입·316단위 및 amd64 빌드 통과. 로컬18/선별 이미지18/운영18브라우저 조건(Chromium320/1280·WebKit390)에서 모카/지우 프로필·실서비스 GET대역·탐색 선택 동작·빈 팬 프로필·카탈로그를 확인했다.20px/6px·동일 에셋·# 없음·미등록 이름 보존·가로넘침 없음. 로컬/이미지/운영 모바일과 운영PC 스크린샷 육안 검수. 실회원 변경·물리 iPhone 검증은 아니다.
- 최초 카탈로그 패치는 기존 로컬 미배포 문맥 때문에 중단되어 운영 기준선에 정확한2개 치환으로 재구성했다. 초기 브라우저 기대값의 flex blockification 및 지우 실제 태그(여행/캠핑/브이로그)를 바로잡고 재검증했으며 제품 변경·실패 이력 은폐 없음.
- 이미지·운영527파일 해시 일치,6HTTPS경로200/API health, 프론트 restart0/OOM 없음. 배포후 디스크1.85GiB 여유, 디스크 정리 없음. 로컬 검수 컨테이너 제거. 증거 `docs/audit/profile-category-20261025.json`, 실행 원본 `.local/profile-category-20261025/`, 이전 이미지 `crefans-front:marquee-names-20261024`, 복구 설정 `/opt/crefans-backup-profile-category-20261025`.
- 이번 요청의 미해결 항목 없음. 다음은 운영 프로필 체감 확인이며, 카카오 앱 연결/조회수 집계와 앞선 로컬 기능 배포는 별도 후속 상태를 유지한다. AGENTS의 공용 표시 계층·선별 배포·검증 규약을 보존했다.

## 게시물 공유 레이어 (2026-10-25, 로컬 구현)

- 공용 PostMenu의 즉시 복사를 공유 레이어로 교체했다. 목업·실서비스의 피드/상세/갤러리에서 복사·카카오톡·더보기 세 항목을 표시한다. 복사를 눌러 성공한 뒤에만 완료 문구를 표시하며, 실패하면 직접 선택할 주소를 제공한다. 더보기는 지원 기기의 Web Share API를 클릭 안에서 호출하고 취소는 조용히 처리한다.
- 카카오 공식 SDK2.8.4/SRI·텍스트 템플릿·공식 버튼 이미지를 사용한다. 제목·정규 게시물 페이지 주소만 전달하고 본문·미디어 주소·현재 쿼리는 제외한다. 앱 키가 없으면 SDK를 요청하지 않고 준비 중으로 표시한다. 디자인시스템에 동일 컴포넌트의 준비/미연결/로딩/오류/처리 중 상태를 등록했다.
- 프론트 레이어·타입·316개 단위검사 통과(신규 공유8개 포함). Chromium320/390/1280·WebKit390 브라우저27개 통과, WebKit 클립보드 권한 검사1개는 명시적으로 제외. 실제 Chromium 클립보드 쓰기/읽기3조건, native API 클릭 활성화·취소·실패·중복 호출 방지, 갤러리 안의 모달 닫기/포커스 복원, 서비스 GET 대역의 공유 정보 제한과 모바일/PC 배치를 확인했다. 기기 공유 및 카카오 호출은 대역 검증이며 물리 기기 공유창·실제 카카오 전송 검증이 아니다.
- 연결 절차는 `docs/third-party-setup.md`. 다음 작업은 사용할 카카오 앱의 JavaScript 키와 SDK/제품 링크 도메인을 등록하고 재빌드하여 실기기에서 확인하는 것이다. 기존 앱 유무 질문에 대한 답변은 아직 없다. 운영 배포·외부 메시지 발송·커밋·푸시 없음, 기존 미커밋과 직전 조회수 로컬 변경 보존.
- 증거 `docs/audit/post-share-20261025.json`, 시작본/로그/화면 `.local/post-share-20261025/`. 문서 계약은 공개 카카오 키 이름 추가만 재생성하며 API·DB 변경은 없다.

## 게시물 조회수 표시 (2026-10-25, 로컬 구현)

- 사용자 요청으로 imagegen 스킬/내장 image_gen에서 투명 회색 눈 아이콘을 생성해 `public/brand/post-views-round-flat-v1.png`에 원본 alpha 보존. 프롬프트·참조 역할·원본 SHA는 옆 generation.json. 공용 PostViews/PostActions로 피드·프로필 피드·상세·갤러리·저장/좋아요·스튜디오 미리보기를 일원화하고 카탈로그 상태를 등록했다.
- Post.views 선택 속성은 기존 DB total_view_count를 전달한다.0 표시/미제공·잘못된 값 숨김,1만부터 만·억 축약/정확한 접근성 이름·툴팁. 좁은 모바일 간격을 조정했다. 목업15개는 예시 조회수를 주입하고 초안은0, 기존 글은 제공된 값을 보존한다.
- 프론트 레이어/타입/308단위, 서버 build·실제 격리DB/HTTP3+OpenAPI11, Chromium320/390/1280·WebKit390 브라우저12 통과.0/미제공/큰 값·잠긴글 본문 비노출·DB 값 불변·이미지 로딩·겹침/가로넘침 없음 확인. 모바일/PC 갤러리·320서비스 화면 육안 검수. 최종 문서 기록/검사 결과는 증거를 확인한다.
- **경계:** 신규 v1에서 조회수를 증가시키는 로직은 기존에 없으며 이번 표시 변경에 새 집계 정책/추적 API를 추가하지 않았다. 저장된 누적값 표시만 완료한 것으로 자동 집계 완료가 아니다. 운영 배포/실회원/실기기 검증·커밋·푸시 없음, 기존 미커밋 보존.
- 증거 `docs/audit/post-views-20261025.json`, 시작본/원본로그/화면 `.local/post-views-20261025/`. 다음 집계 작업 시 노출/상세/반복 기준을 정하고 bootstrap 사전 조회가 조회수로 오인되지 않게 해야 한다.

## 모카 긴 이름 마키·프로필 설정 아이콘16px 운영 배포 (2026-10-24~25)

- 모카 닉네임 `모카의 분홍빛 코스프레와 일상이야기`, 핸들 `moka_cosplay_story_daily`, 멤버십2개를 긴 이름으로 교체했다. 기존 ID·가격·등급·공개 조건은 유지. 메시지/알림/만료 구독·결제 예시로 긴 이름을 확인할 수 있다. 실제 DB 계정/상품은 수정하지 않았다.
- 공용 `MarqueeText`가 넘치는 문자열만 양 끝에서 멈추며 왕복한다. `CreatorName` 배지는 고정하고 탐색·랜딩·프로필·피드/상세/갤러리·멤버십/안내 레이어·구독/결제·팔로잉/팔로워·댓글/태그·메시지/알림 및 관련 스튜디오 표시부에 적용. 입력/URL/ID/alt/aria/본문 별칭은 원문 유지. 설정/사이드바/랜딩/스튜디오의 공용 정지 버튼은 기기에 저장하고, 동작 줄이기에서도 전체 텍스트를 줄바꿈한다. 320px 작성자 그리드와 정지 시 미디어 타일 세로 잘림을 보정. 프로필 설정 아이콘은 모든 폭16×16px, 문구14px 유지.
- 레이어/타입/304검사 통과. 로컬60브라우저+최종타일4검사, 선택한 운영 이미지64검사 및 최종갤러리4검사 통과(Chromium320/390/1280·WebKit390). 폭 측정/이동 끝점/고정 배지/정지 저장·재방문/reduced-motion/가입 동의 전 비활성/결제 상세/팔로잉/갤러리/API GET 대역을 확인. 실제 PG·회원 변경·물리 iPhone 검증은 아니다. 설정 아이콘은 로컬/이미지/운영에서 각각3조건16px 확인.
- `crefans-front:marquee-names-20261024`를 운영 반영. 직전gnb-clear의525소스해시 확인 후33파일변경/2추가만 선택했다. 시작부터 로컬과 운영이 달랐던8파일은 작업 시작 해시까지 역대조한 뒤 이번 편집만 운영 기준선에 적용하여 무관한 변경 제외. amd64빌드·이미지/운영527해시·HTTPS6경로200·frontend restart0/OOM없음, 다른5컨테이너/집SSH규칙 유지. 로컬QA컨테이너 제거. 커밋/푸시 없음.
- 운영30브라우저검사와 최종스크린샷 확인. 첫 WebKit 운영 검사는 검사 도구의 빠른 문서 교체로 RSC prefetch 취소 예외를 잡았다. 빠른 교체1예외/62cancelled, 요청 정리 후0예외/2cancelled 대조 후, 최종30검사0페이지예외 확인. 초기 갤러리 캡처가 전환 중이어서 opacity1 대기 후 다시 검수했다. 초기실패/재시험을 증거에 남겼으며 물리 기기나 일반 사용의 모든 오류가 없다는 뜻은 아니다.
- 증거 `docs/audit/marquee-names-20261024.json`, 원본 `.local/marquee-names-20261024/`, 복구 이미지 `crefans-front:gnb-clear-20261024`, 설정백업 `/opt/crefans-backup-marquee-names-20261024`. 디자인시스템/화면 문서와 manifest를 검토 후 docs:record/check:docs로 갱신한다. 기존 AGENTS 규약 유지. 다음은 사용자의 운영 모카 프로필 체감 확인이며 이 요청의 미해결 구현 없음.

## GNB 선택 배경 제거 운영 배포 (2026-10-24)

- 사용자 요청으로 공용 service.module.css의 모바일GNB·PC사이드바 `aria-current` 배경 선언2개만 제거했다. 라운드플랫 선택 아이콘/텍스트 색상·미선택회색·프로필선택테두리·숫자배지·키보드포커스·모바일56×48px 클릭영역 유지. 목업/실서비스 같은셸 적용.
- `crefans-front:gnb-clear-20261024` 운영 배포. 직전gnb-flat 운영525소스대조 후CSS1파일만선택변경, 이미지/운영525해시일치. amd64빌드·타입검사 통과. 변경전/로컬/이미지/운영 각각9브라우저검사(Chromium320/1280·WebKit390 ×목업탐색/서비스탐색GET대역/목업프로필): 선택배경rgb(239,246,255)→투명,5링크/아이콘선택상태·사진/링·빨간1/99+·56×48px·포커스·가로넘침없음 확인. 스크린샷육안검토. 최초기준검사 network-idle/웹폰트 스크린샷 대기초과는 DOM/내비게이션이미지 준비 대기·캡처시간 제한으로 재검증, 최초로그와 캡처제한은 증거에 보존. 단순CSS로 새단위/전체제품검사 없음.
- 증거 `docs/audit/gnb-clear-deployment-20261024.json`, 원본 `.local/gnb-clear-deploy-20261024/`, 복구 `/opt/crefans-backup-gnb-clear-20261024`. HTTPS6경로200/APIhealth·frontend restart0/OOM없음, 다른5컨테이너·집SSH규칙 유지. 서버디스크정리없음, 로컬QA컨테이너정리. 기존미커밋/AGENTS보존·커밋/푸시없음. 실회원/물리기기 검증아님. 다음은 사용자 운영화면 확인.

## 라운드 플랫 GNB 아이콘 운영 배포 (2026-10-24)

- 선택한01스타일로 내장 image_gen에서 홈·탐색·빈 말풍선·알림·기본 프로필5종을 개별 제작했다. `public/brand/navigation/*-round-flat-v1.png`에 투명 원본 보존. 공용 NavigationIcon/NavigationAvatar로 모바일GNB·PC사이드바/상단알림·서비스UI카탈로그를 일원화했다. 선택 파랑·보라/미선택 회색, 모바일28px·PC21px 레이아웃박스·광학크기보정, 기존56×48px 링크 유지. 실제 프로필사진은 유지하고 없거나 실패할때만 생성 기본아이콘 사용. 빨간숫자배지0숨김/99+와 접근성이름 유지.
- `crefans-front:gnb-flat-20261024` 운영 배포. 운영518파일 대조후4파일변경/7추가, 이미지·운영525소스해시일치. 기존미커밋중 관련변경만 선택했고 다른5컨테이너ID/이미지·집SSH규칙 유지. 커밋/푸시없음.
- 관련7단위·레이어·amd64빌드/타입검사 통과. PNG5종 alpha0~255·투명모서리·원본해시 검증. 로컬/이미지/운영 각각53브라우저검사(Chromium320/1280·WebKit390):5메뉴활성상태/목적지·사진없음/실패/복원·빨간0/1/9/99/100/125배지·읽음실패유지/성공감소·로그아웃/목업/카탈로그·44px이상클릭영역·넘침없음 확인. 각환경 원본PNG해시/최적화10KB미만5종 추가확인, 실제화면 스크린샷 육안검토. 실회원변경/물리iPhone 검증은 아니다.
- 증거 `docs/audit/gnb-flat-deployment-20261024.json`, 원본 `.local/gnb-flat-deploy-20261024/`, 복구 `/opt/crefans-backup-gnb-flat-20261024`. HTTPS6경로200/APIhealth·frontend restart0/OOM없음. 디스크확보를 위해 로컬복구아카이브SHA와 미사용을 확인한 featured-tooltip/follow-toggle/featured-icon 이전프론트3개만 정리했다. 당시현행category-icons/직전gnb-unread·모든컨테이너/볼륨보존, 로컬QA컨테이너정리. 다음은 사용자 운영화면 확인.

## GNB 아이콘 5가지 스타일 시안 (2026-10-24)

- 사용자 요청으로 imagegen 스킬·내장 image_gen에서 GNB 스타일 비교보드1장을 생성했다. 라운드 플랫/볼드 라인/소프트 듀오톤/브랜드 그라데이션/미니 클레이5안, 각 홈·탐색·메시지(빈 말풍선)·알림·마이 기본아이콘5개와 하단바 축소예시를 나란히 비교한다. 홈 선택배경·메시지2/알림5 빨간배지·아이콘전용 구성을 유지한다. 마이는 기존 프로필사진 유지, 시안의 사람아이콘은 사진없을 때의 대체표시다.
- 원본/전체프롬프트·해시/크기·육안검수는 `docs/audit/gnb-icon-styles-20261024.json`, 작업기록 `.local/gnb-icon-styles-20261024/`. 5개섹션·25확대아이콘·5하단바·문구/잘림없음 확인. 03은 약한색조/볼륨이 있고 일부비활성색상은 완전통일되지 않은 스타일선택안이다. 투명개별에셋·정확한28px/44px·실제UI상태 검증은 미실행이다.
- 디자인판단상01은 기존카테고리와 통일감,02는 메뉴형태의 선명함을 권장한다. 이번은 시안제작만 완료했고 앱코드/운영변경없음. 운영은category-icons-20261024 유지, 기존미커밋·AGENTS보존/커밋·푸시없음. 다음은 사용자선택 후 개별아이콘/활성·비활성 상태를 제작하고 공용 GNB에 적용하는 작업이다.

## 라운드 플랫 카테고리 아이콘 운영 배포 (2026-10-24)

- 사용자 선택에 따라 내장 image_gen으로 투명 아이콘10종을 개별 생성했다. 전체(네칸)·라이프스타일(집)·뷰티(립스틱)·코스프레(리본)·피트니스(덤벨)·음악(음표)·여행(가방)·게임(패드)·아트(팔레트)·일상(머그)이다. `public/brand/categories/*-round-flat-v1.png`에 원본을 보존하고 공용 CategoryChip/Chip으로 홈·탐색·카탈로그/목업·실서비스를 일원화했다.20px/6px간격·텍스트라벨/선택콜백 유지, 미등록분류는 텍스트만 표시한다.
- `crefans-front:category-icons-20261024` 운영 배포. 직전 요청 빨간 꽉찬 좋아요 하트도 함께 반영하여 아래 하트 로컬미배포 상태를 해소했다. 운영507소스 대조후7파일변경/11추가, 이미지·운영518해시일치. 탐색 margin shorthand가 공용 모바일 좌우여백을 덮어쓰는 문제를 margin-block으로 수정했다. 첫칩16px·스크롤영역화면전체폭을 확인했다.
- 관련31단위·레이어·amd64빌드/타입검사 통과. 생성PNG10종1254²·alpha0~255·원본해시/투명모서리/100px·20px육안확인. 로컬19/이미지19/운영19 검사(Chromium320/1280·WebKit390 ×목업/서비스 홈·탐색12+하트6+카탈로그1)에서 아이콘/간격·최적화10KB미만·선택/필터·가로스크롤/마우스드래그·미등록분류·하트를 검증했다. 각환경 스크린샷 육안검토. 최초잘못된 PC스크롤거리 가정과 서비스필터 재렌더중 드래그 검사경합은 검수절차 수정후 전체재검증, 최초기록 보존. 배포준비에서 로컬전용 카탈로그삽입점 가정을 운영기준으로 정정했다.
- 증거 `docs/audit/category-icons-deployment-20261024.json`에 전체프롬프트·에셋·소스해시·명령/시각/종료·최초실패를 저장. 원본 `.local/category-icons-deploy-20261024/`, 복구 `/opt/crefans-backup-category-icons-20261024`. HTTPS6경로200/APIhealth·frontend restart0/OOM없음, 다른5컨테이너·집SSH규칙 유지. 임시검수컨테이너 정리, 서버디스크 정리없음. 기존미커밋·AGENTS보존,커밋/푸시없음.
- 서비스GET/좋아요PUT 대역과 목업검증으로 실회원/물리iPhone 검증은 아니다. 이번범위 미해결오류없음. 다음은 사용자운영화면 확인.

## 카테고리 칩 아이콘 스타일 제안 (2026-10-24)

- 현재10카테고리/40px칩을확인하고 imagegen 스킬·내장image_gen으로 라운드플랫/컬러라인/소프트3D 3행비교보드1장을생성했다. 같은코스프레리본·음악음표·여행가방·게임패드4모티프를각행의확대아이콘과칩왼쪽축소예시로비교한다. 현재화면에는01라운드플랫을추천한다(디자인판단).
- PNG1536×1024·해시검사,3스타일·12확대/12칩예시·한국어라벨/잘림없음 육안검토. 최초2행에도약한색조변화가있으며 실제20px래스터가독성/투명개별에셋검수는미실행이다. 비교안원본 `/Users/ethan/.codex/generated_images/01a09da4-33f8-7420-9cc4-0fdd1e10eb69/exec-11a6c2d4-398b-4f9a-93e9-2348c5e26397.png`, 전체프롬프트/증거 `docs/audit/category-icon-styles-20261024.json` 및 `.local/category-icon-styles-20261024/prompt.txt`.
- 제안/미리보기만완료,서비스코드·에셋교체·운영변경없음. 사용자스타일선택후 전체10종개별제작/20px칩검수를진행한다. 기존좋아요하트는로컬반영·운영미배포상태유지. 기존미커밋·AGENTS규약보존·커밋/푸시없음.

## 포스팅 좋아요 하트 채움 (2026-10-24)

- 좋아요 선택된 하트 내부가 옅은분홍색이던 공용 `.liked svg`의 fill을 currentColor로 바꿔 테두리와동일한 danger빨강으로 꽉채운다. 선택해제는기존빈하트,21px/개수/토글유지. SocialPages 공용 PostActions를쓰는 피드·상세·갤러리·카탈로그와서비스/목업에같이적용한다.
- 변경전 fill rgb(254,242,242)/stroke rgb(220,38,38)확인. 변경후10브라우저검사(Chromium390/1280목업피드·상세·갤러리6, 서비스GET/PUT대역3, 카탈로그1)에서 빨강fill/stroke·hover·취소시none·21px확인. 모바일피드/PC갤러리하트스크린샷육안확인. 증거 `docs/audit/liked-heart-20261024.json`, 원본 `.local/liked-heart-20261024/`. 단일CSS속성으로전체제품/새단위검사없음.
- 로컬반영·운영미배포. 운영은gnb-unread-20261024유지, 다음배포요청시 social.module.css의 fill한속성만선택반영한다. 실회원/물리기기검증아님. 기존미커밋·AGENTS규약보존,커밋/푸시없음.

## GNB 미확인 개수 배지 운영 배포 (2026-10-24)

- 메시지·알림 빨간점을 공용 `UnreadBadge` 숫자배지로 바꿨다. 0숨김,1~99그대로,100이상99+. 메시지는 여러 대화의 수신미확인 메시지 수를 합산하고 내가보낸/읽은 메시지를 제외한다. 비로그인시숨김·접근성이름은 실제개수를 제공한다. 모바일GNB·PC사이드바/상단알림·디자인시스템이 같은컴포넌트다. 목록내빨간점/노란배경은 유지한다. 직전요청 프로필설정22px도 함께 운영반영했다.
- `crefans-front:gnb-unread-20261024` 배포. 운영505파일대조 후5파일선택변경+공용배지2파일추가, 이미지/운영507파일해시일치. 관련2단위·레이어·amd64빌드/타입검사통과. 로컬31/이미지31/운영31검사(Chromium320/1280·WebKit390)에서0/1/9/99/100/125·화면넘침없음/44px이상클릭영역·읽음성공시3→1→0·알림읽음실패유지/성공시0·비로그인/목업/카탈로그·설정22px를 확인했다. 각3스크린샷육안검토. 초기이미지검사는 기능31건은통과했으나 WebKit의빠른페이지전환중signup RSC미리요청 오류를기록했다. 요청종료대기후전체재검증통과, 최초기록보존·제품변경없음.
- 증거 `docs/audit/gnb-unread-deployment-20261024.json`, 원본 `.local/gnb-unread-deploy-20261024/`, 복구 `/opt/crefans-backup-gnb-unread-20261024`. 6HTTPS200/APIhealth·frontend restart0/OOM없음, 다른5컨테이너ID/이미지·집SSH규칙 유지. 디스크정리없이 배포후3.28GiB여유. 임시검수컨테이너정리. 기존미커밋/AGENTS규약보존, 커밋/푸시없음.
- 서비스GET/PUT대역과목업상태검증으로 실회원메시지/알림변경·물리기기검증아님. 기존데이터계산만사용하며 실시간푸시/폴링추가없음. 이번요청범위 미해결오류없음. 다음은사용자운영화면확인.

## 프로필 설정 아이콘 소폭 축소 (2026-10-24)

- 사용자 요청으로 내 프로필 배경의 설정 톱니바퀴만24→22px로 줄였다. 공용 AccountPages/creator CSS를 목업·실서비스가 함께 사용한다. 글자최소14px·버튼높이36px·패딩/설정목적지와 팔로우24px 규칙은 유지한다.
- 로컬3010의 Chromium320/1280·WebKit390 목업과 Chromium390 서비스GET대역4환경에서 변경전24px/변경후22px·버튼높이/글자/패딩 동일·설정페이지 이동·넘침없음을 확인했다. 모바일/PC스크린샷 육안검토. 증거 `docs/audit/profile-settings-icon-20261024.json`, 원본 `.local/profile-settings-icon-20261024/`. 단순크기변경으로 전체제품검사/새단위테스트 없음.
- 로컬반영·운영미배포, 기존미커밋/AGENTS규약보존·커밋/푸시없음. 운영은 featured-tooltip-20261024 유지. 다음 배포요청시 AccountPages의설정SVG크기와 creator CSS의 coverLink SVG22px 두 변경만 선택반영한다. 실회원/물리기기검증아님.

## 주목할 크리에이터 툴팁 운영 배포 (2026-10-24)

- `crefans-front:featured-tooltip-20261024`를 운영 배포했다. 이미지젠 info아이콘20px·44px클릭영역과 공용툴팁, 정정문구 “홍보성 프로모션이 적용된 크리에이터나 해당 광고 상품을 이용중인 크리에이터가 노출될 수 있습니다.”를 탐색 목업/실서비스와 디자인시스템에 반영했다. 아래 최초작업/문구정정의 운영미배포 상태는 해소됐다.
- 운영502소스 대조 후 제목·CSS·카탈로그3파일변경/공용툴팁2파일·PNG추가로505파일 릴리스를 구성했다. 선택본2단위·레이어·amd64빌드/타입검사 통과. 이미지10/운영10환경(Chromium320/390/1280·WebKit390 ×목업/서비스GET대역8+카탈로그2)에서 정정문구·20/44/14px·키보드/Escape포커스유지/터치/hover/검색숨김복원·넘침없음·아이콘최적화10KB미만을 검증했다. 최초카탈로그검사는 화면밖lazy이미지대기에서 중단되어 검수절차에스크롤/시간제한을추가하고 전체재검증했다(최초로그보존·제품변경없음). 모바일/PC각3스크린샷 육안검토. 이미지/운영505소스해시·공개PNG원본해시·6HTTPS200/APIhealth·frontend restart0/OOM없음 확인.
- 디스크가2.6GiB만 남아 로컬복구아카이브SHA와 미사용을 확인한 collection-back/settings-divider-color/settings-categories 이전프론트이미지3개만 정리해 약2.0GiB확보했다. 당시현행follow-toggle/직전featured-icon·모든컨테이너/볼륨보존. 배포후 여유공간은3.96GiB. 이전아카이브 경로/해시는 증거의 retained-archives에 보존했다. 향후배포시디스크여유를 먼저 확인한다.
- 증거 `docs/audit/featured-tooltip-deployment-20261024.json`, 원본 `.local/featured-tooltip-deploy-20261024/`, 복구 `/opt/crefans-backup-featured-tooltip-20261024`. 프론트만교체·다른5컨테이너ID/이미지·집SSH규칙유지, 임시검수컨테이너정리. 기존미커밋/AGENTS규약보존·커밋/푸시없음. 실회원/물리기기검증아님. 이번범위 미해결오류없음, 다음은 사용자운영화면 확인.

## 주목할 크리에이터 안내 문구 정정 (2026-10-24)

- 사용자 정정 문구 “홍보성 프로모션이 적용된 크리에이터나 해당 광고 상품을 이용중인 크리에이터가 노출될 수 있습니다.”를 공용 탐색과 디자인시스템 예시, 현행 디자인문서에 반영했다. 아래 최초툴팁 기록의 이전 문구는 당시 이력이며 현재 문구는 이 항목을 따른다. 아이콘/동작은 유지했다.
- Chromium320의 목업/서비스GET대역/카탈로그와1280목업4화면에서 정확한 문구와 툴팁 화면내 배치·가로넘침없음을 확인했다.320px스크린샷육안검토. 증거 `docs/audit/featured-tooltip-copy-20261024.json`, 원본 `.local/featured-tooltip-copy-20261024/`. 단순문구정정으로 전체제품검사 반복없음, 이전동작·에셋검증은 해당범위에서 유지한다.
- 로컬반영·운영미배포, 기존미커밋/AGENTS규약보존, 커밋/푸시없음. 다음배포시 최초툴팁과 이정정문구를 함께 선택반영한다.

## 주목할 크리에이터 안내 툴팁 (2026-10-24)

- 제목 오른쪽에 이미지젠 투명 info아이콘을20px/44px클릭영역으로 추가했다. 요청한 “홍보성 프로모션 혹은 광고상품을 구매한 크리에이터가 노출됩니다” 문구를14px 툴팁으로 표시한다. 공용 InfoTooltip을 목업/실서비스 탐색과 디자인시스템이 재사용한다. 기존 제목왼쪽 별빛은 유지하고 주목목록이 없으면 제목/설명아이콘을 함께 숨긴다.
- hover/키보드포커스/터치로 열기, 팝업 위 hover유지, Enter·재터치·바깥선택·Escape닫기와 포커스유지, 화면내 위치를 구현했다. W3C hover/focus 지침·작업중 APG 참고, 세부근거와 적용판단은 증거에 저장했다. 기존 AGENTS 공용UI/검증 규약을 유지한다.
- 타입·레이어·기존탐색2단위 통과. Chromium320/390/1280·WebKit390 × 목업/서비스GET대역8환경과 카탈로그2환경, 총10검사에서 문구/20px/44px/14px·터치/키보드/hover·검색숨김/복원·넘침없음을 확인했다. 모바일/PC3스크린샷 육안확인. 생성PNG1254×1254/alpha0~255·원본바이트보존·Next최적화32px/1173bytes를 검증했다.
- 원본 `public/brand/tooltip-info-v1.png`, 전체생성프롬프트 `public/brand/tooltip-info-v1.generation.json`, 증거 `docs/audit/featured-tooltip-20261024.json`, 원본검사 `.local/featured-tooltip-20261024/`. 로컬반영·운영미배포, 커밋/푸시없음. 실회원/물리기기/스크린리더 검증아님. 다음배포요청시 InfoTooltip2파일·PNG·탐색제목/CSS·카탈로그만 선택반영한다. 기존 무관한 미커밋 보존.

## 팔로우 버튼·프로필 설정 운영 배포 (2026-10-24)

- `crefans-front:follow-toggle-20261024`를 운영 배포했다. 미팔로우 파란 배경/흰 글자, 팔로우 중 흰 배경/진한 글자와 테두리, 공용 더하기/체크24px, 프로필 설정24px·최소14px를 반영했다. 목업/실서비스·카탈로그에 함께 적용하고 해제확인/취소를 유지한다. 아래 로컬작업의 운영미배포 상태는 해소됐다.
- 운영502소스 대조 후 FollowButton/creator CSS/AccountPages 설정 아이콘3파일만 선택했다. 선택본4단위·레이어·amd64운영빌드/타입검사 통과. 이미지34/운영34검사(Chromium320/390/1280·WebKit390의 목업/서비스GET대역 탐색·프로필·팔로잉·내프로필32경로와카탈로그2)에서 색상·24px·설정14px·한줄/넘침없음·설정이동·목업해제확인/취소를 확인했다. 모바일/PC스크린샷 육안검토. 이미지/운영502파일해시일치·6HTTPS200/APIhealth·frontend restart0/OOM없음 확인.
- 증거 `docs/audit/follow-toggle-deployment-20261024.json`, 원본 `.local/follow-toggle-deploy-20261024/`, 복구 `/opt/crefans-backup-follow-toggle-20261024`. 프론트만교체·다른5컨테이너ID/이미지·집SSH규칙유지, 임시검수컨테이너정리. 기존미커밋/AGENTS규약보존, 커밋/푸시없음. 실회원/물리기기검증아님. 이번범위 미해결오류없음, 다음은 사용자 운영화면 확인.

## 팔로우 색상 반전·아이콘과 프로필 설정 크기 (2026-10-24)

- 공용 FollowButton은 미팔로우 파란 배경·흰 글자, 팔로우 중 흰 배경·진한 글자·테두리로 변경했다. 탐색 카드·프로필·팔로잉 목록·디자인 카탈로그의 더하기/체크 아이콘은24px, 프로필 설정도24px·글자최소14px로 통일했다. 모바일 카드 간격/좌우패딩2px로320px 한 줄을 유지한다. 해제 확인/취소 동작은 보존했다. 이전 로컬 팔로우 아이콘20px·프로필12px 설명은 이번 변경으로 대체한다.
- 관련4단위·타입·레이어 통과. Chromium320/390/1280·WebKit390 × 목업/서비스GET대역의 탐색·프로필·팔로잉·내프로필32경로와 카탈로그2검사에서 색상·24px·설정14px·넘침없음·설정이동을 확인했다. 목업에서 팔로우/해제취소·확인도 검증했다. 모바일/PC4스크린샷 육안검토. 최초브라우저검사의 카테고리칩 오선택은 검수 선택자만 수정하여 해소, 로그 보존.
- 증거 `docs/audit/follow-toggle-20261024.json`, 원본/작업전후차이 `.local/follow-toggle-20261024/`. 로컬반영·운영미배포, 기존미커밋보존, 커밋/푸시없음. 실제회원·물리기기 검증아님. 배포 요청시 이번 공용팔로우/프로필설정 차이만 선택 반영한다.

## 주목할 크리에이터 아이콘 운영 배포 (2026-10-24)

- 사용자 승인 이미지젠 별빛PNG를 탐색의 주목할 크리에이터 제목 왼쪽에22px/6px간격으로 적용하고 `crefans-front:featured-icon-20261024`를 운영 배포했다. 공용 ExplorePage여서 목업/실서비스에 함께 적용한다. alt빈값/aria-hidden 장식이미지, Next Image 최적화로 작은이미지만 전송하고 원본은 보존한다. 주목목록이없으면 제목·아이콘을 같이 숨긴다.
- 운영501파일대조후 표시컴포넌트/CSS2파일과승인PNG1개만선택, 이미지/운영502소스해시일치. 기존인물데이터검사는 장식이미지를제외해유지. 레이어/관련2단위·운영빌드/타입검사, 배포전2환경·이미지6/운영6환경(Chromium320/1280·WebKit390 ×목업/서비스GET대역)에서22px/6px·세로정렬·투명도·최적화64px이하/10KB미만·검색조건별숨김/복원·넘침/JS오류없음 확인. 최초검사의 축소alpha255 고정가정(실측253)은 불투명본문범위검사로 수정후전체재검증했고 최초실패로그보존. 모바일/PC스크린샷육안검토, 원본공개PNG SHA일치·6HTTPS200/APIhealth·frontend restart0/OOM없음 확인.
- 증거 `docs/audit/featured-icon-deployment-20261024.json`, 원본 `.local/featured-icon-deploy-20261024/`, 복구 `/opt/crefans-backup-featured-icon-20261024`. 프론트만교체·다른5컨테이너/집SSH규칙유지·임시검수컨테이너정리. 기존미커밋/AGENTS규약보존, 커밋/푸시없음. 실회원·물리기기검증아님. 다음은 사용자운영화면확인.

## 주목할 크리에이터 제목용 아이콘 제작 (2026-10-24)

- 사용자 요청으로 built-in image_gen에서 분홍·보라·파랑 그라데이션의 큰별빛+작은별빛 아이콘1개를 생성했다. 투명 원본을 `public/brand/featured-creators-v1.png`에 변경없이 복사하고 전체 프롬프트·생성방식을 `public/brand/featured-creators-v1.generation.json`에 저장했다. 인증/등급 표시는 아닌 제목 장식용이다.
- 원본과복사본바이트일치·1254×1254/432011bytes·alpha0~255·투명픽셀 확인. 별도HTML에서22px아이콘/6px간격/14px제목 표시·가로넘침없음을 확인하고 스크린샷 육안검토했다. 최초PIL부재/로컬파일canvasorigin제한은 브라우저 동일PNG data URL 검수로 해결, 증거에 기록했다.
- 증거 `docs/audit/featured-creator-icon-20261024.json`, 제목배치미리보기 `.local/featured-creator-icon-20261024/heading-preview.png`. 이번요청은 이미지제작으로 완료, 실제페이지코드·운영변경없음. 다음 적용요청시 탐색의 공용제목에 재사용한다. 기존미커밋/AGENTS규약보존, 커밋/푸시없음.

## 항목 모아보기 뒤로가기 운영 배포 (2026-10-24)

- 저장한 게시물·좋아요한 게시물·팔로잉·팔로워 목록의 제목 왼쪽에 공용 원형 뒤로가기 버튼을 운영 반영했다. 내 프로필 복귀 목적지와 목업/실서비스 경로를 유지한다. 로컬에는 이전 전수 작업으로 구현돼 있었으나 운영에 텍스트 링크가 남아 있어 이번에 해당4화면을 선택 배포했다.
- 운영499소스 대조 후4파일 수정·공용 BackButton2파일 추가, `crefans-front:collection-back-20261024` 배포. 기존 목록3단위·운영빌드/타입검사 통과. 배포전4화면 재현, 이미지24/운영24검사(Chromium320/1280·WebKit390 ×목업/서비스GET대역 ×4목록)에서44px 클릭영역·22px 화살표·제목왼쪽12px 간격·키보드복귀·가로넘침/JS오류없음 확인. 이미지/운영 모바일·PC 스크린샷 육안검토. 이미지/운영501소스해시·6HTTPS200/APIhealth·frontend restart0/OOM없음 대조.
- 증거 `docs/audit/collection-back-deployment-20261024.json`, 원본 `.local/collection-back-deploy-20261024/`, 복구 `/opt/crefans-backup-collection-back-20261024`. 프론트만 교체, 다른5컨테이너ID/이미지·집SSH규칙 유지. 기존 미커밋과 나머지 미배포 UI 작업 보존, 커밋/푸시없음. 실회원·물리iPhone 검증아님. 임시검수컨테이너 정리. 다음은 사용자 운영화면 확인.

## 설정 구분띠 테두리 제거 운영 배포 (2026-10-24)

- 사용자 요청으로 `https://beta.crefans.com` 프론트를 `crefans-front:settings-divider-color-20261024`로 배포했다. 모바일 설정의 화면전체폭 구분띠는 상하테두리 없이 옅은배경색만 표시한다. 아래 로컬작업의 운영미배포 상태는 해소됐다.
- 운영499파일 대조후 account.module.css의 border-block 선언1개만 제거했다. amd64운영빌드/타입검사·이미지/운영499소스해시 일치. 배포전4/이미지4/운영4환경(Chromium390목업/서비스GET대역·Chromium1280목업·WebKit390목업)에서 모바일6개띠 상하0px, 높이8px/배경색/전체폭/항목좌표와PC동일·넘침없음을 확인했다. 이미지/운영모바일스크린샷 육안검토. HTTPS6경로200·APIhealth·frontend restart0/OOM없음 확인.
- 프론트만교체하고 다른5컨테이너ID/이미지·집SSH규칙 유지. 복구 `/opt/crefans-backup-settings-divider-color-20261024`. 증거 `docs/audit/settings-divider-color-deployment-20261024.json`, 원본 `.local/settings-divider-color-deploy-20261024/`. 임시검수컨테이너 정리. 기존미커밋/AGENTS규약 보존, 커밋/푸시없음. 실회원/물리iPhone검증아님. 다음은 사용자확인, 이번범위 미해결오류없음.

## 설정 구분띠 테두리 제거 (2026-10-24)

- 사용자 요청으로 모바일 설정 그룹/로그아웃 영역 사이 구분띠의 상하1px border-block 선언만 제거했다. 옅은배경색·8px높이·화면전체폭·내용여백을 유지한다. 목업/실서비스 공용CSS이고 PC는 그대로다.
- 수정전4/후4 브라우저환경(Chromium390목업/서비스GET대역·Chromium1280·WebKit390)에서 모바일6개띠 상하0px, 전후좌표/크기/배경/폭 동일·넘침없음, PC동일을 확인했다. WebKit390스크린샷 육안검토. 단일CSS변경으로 전체유닛/새영구테스트 없음.
- 증거 `docs/audit/settings-divider-color-20261024.json`, 원본 `.local/settings-divider-color-20261024/`. 로컬반영, 운영미배포(운영은 settings-categories-20261024 유지). 기존미커밋/AGENTS규약보존, 커밋/푸시없음. 다음배포요청시 이CSS선언삭제1건만선택반영. 물리기기/실회원 검증아님.

## 설정 카테고리·전체폭 구분선 운영 배포 (2026-10-24)

- `https://beta.crefans.com` 프론트를 `crefans-front:settings-categories-20261024`로 배포했다. 설정 상단 전체(기본)/카테고리 칩, 선택그룹 필터·계정관리의 로그아웃/탈퇴, 모바일 서비스안내/PC전환복귀와 화면양끝8px 구분띠를 반영했다. 목업/실서비스 공용이다. 아래 설정카테고리/구분선의 운영미배포 상태는 해소됐다.
- 운영499파일 기준을 대조하고 AccountPages.tsx의 SettingsPage/필요수입과 account.module.css의 설정그룹규칙만 선택했다. 미배포 PASS가입·팔로우/댓글닫기·전수뒤로가기 등 별도변경은 제외했다. 선택본4단위검사·amd64 운영빌드/타입검사·이미지/운영499파일해시 일치. 프론트만 교체, API·worker·admin·DB·proxy5컨테이너ID/이미지와집SSH규칙 유지. 복구 `/opt/crefans-backup-settings-categories-20261024`.
- 이미지12/운영12환경(Chromium320/390/767/768/1280·WebKit390 × 목업/서비스GET대역)에서 전체·개별필터·전체복귀·설정모달/딥링크·드래그/키보드·탐색동일스타일·모바일6개경계좌우0px/8px·PC전환·넘침없음을 검증했다. 운영모바일/PC 화면 육안검토. 실제공개API로390/1280 비로그인설정 접근보호, HTTPS6경로200·APIhealth·frontend restart0/OOM없음을 확인했다. 이미지 첫접속은 서버준비전 ERR_EMPTY_RESPONSE였고 readiness 확인후 전체재검증통과, 최초기록보존. 실회원변경/물리iPhone검증아님.
- 증거 `docs/audit/settings-categories-deployment-20261024.json`, 원본 `.local/settings-categories-deploy-20261024/`. 임시로컬검수컨테이너 정리. 기존미커밋/AGENTS공유UI·검증규약 보존, 커밋/푸시 없음. 이번배포 범위의 미해결 오류 없음. 다음은 사용자운영화면 확인, 다른로컬변경 배포는 별도요청시 선택반영한다.

## 설정 카테고리 칩 필터 (2026-10-24)

- 설정 제목 아래에 탐색과 같은 공용 Chip/ChipRow를 추가했다. 전체를 기본으로 계정 설정·항목 모아보기·공개 설정·알림과 결제·계정 관리·서비스 안내를 선택하면 해당 항목만 표시한다. 로그아웃/탈퇴는 전체 또는 계정관리에서만 표시한다. 서비스안내는 기존대로 모바일전용이고 선택한 채 PC너비로 바꾸면 전체로 돌아간다. 기존 모달/section딥링크와 모바일 전체폭 구분띠를 유지한다. PC에도 카테고리칩이 추가된다.
- 레이어/타입·계정12/ChipRow2 단위검사 통과. Chromium320/390/767/768/1280·WebKit390 ×목업/서비스GET대역12환경에서 그룹필터·전체복귀·계정관리액션·링크·크기전환·마우스드래그(넘침시)·키보드선택·모달·딥링크·탐색과동일스타일·넘침없음을 확인했다. 모바일 전체/선택·PC선택 화면 육안확인. 최초 브라우저검사의 드래그직후 합성키보드입력은 기존 한이벤트루프 클릭억제가 끝난후 실행하도록 보완해 통과했고 로그를 보존했다. 공용ChipRow 동작변경 없음.
- 증거 `docs/audit/settings-categories-20261024.json`, 원본 `.local/settings-categories-20261024/`. 로컬반영, 운영미배포. 기존미커밋보존, 커밋/푸시없음. 물리터치/실회원/운영검증아님. 다음배포요청시 이번설정필터와앞선전체폭구분 변경을 선택반영한다. AGENTS의 공용UI/PROGRESS/증거규약은 기존대로 유지.

## 모바일 설정 화면 전체 너비 구분 (2026-10-24)

- 모바일 설정의 그룹 사이와 로그아웃 영역 앞을 화면 양끝까지 이어지는8px 옅은 배경띠·1px 상하 경계로 나눴다. 내용의16px 안쪽여백을 유지하고767px 이하 설정 최대폭만 해제해 넓은 모바일에서도 경계가 화면 끝에 닿는다. 목업/실서비스 공용CSS이며 PC는 유지한다.
- 수정 전12/후12환경(Chromium320/390/767/768/1280·WebKit390 × 목업/서비스API대역)에서 모바일6개구분띠의 좌우0px·8px높이·여백·넘침없음, PC좌표/크기 전후일치, 모달 열기/닫기12회와 오류없음을 확인했다. 모바일/PC스크린샷 육안 검토. 검증기 첫두실행의 로그아웃버튼폭 가정과NaN직렬화차이를 보완한 뒤 통과했고 최초로그를 보존했다. 제품은CSS만 변경해 전체유닛 반복 없음.
- 증거 `docs/audit/settings-edge-dividers-20261024.json`, 원본 `.local/settings-edge-dividers-20261024/`. 로컬반영·운영미배포, 실회원/물리기기 검증아님. 기존미커밋 작업보존, 커밋·푸시없음. 이전 서비스안내 단일구분선의 모바일스타일은 이번공통그룹구분으로 대체한다.

## 닫기 아이콘 여백 비교·축소 (2026-10-24)

- 댓글 입력바·갤러리·공통모달·토스트·선택팝업5종을 브라우저에서 비교했다. 댓글 X의44px 터치영역을 유지하고 아이콘22→28px, 왼쪽바깥여백16→4px(안전영역 우선), 입력칸과간격8→4px로 줄였다.390px화면의 입력시작68→52px·입력너비254→274px를 실측했다. 갤러리는 셸에서14px로 상속되던 × 글자를28px 공용SVG로 교체하고 버튼패딩6→0px로 맞췄다. 모달·토스트·선택팝업은 비교만하고 유지했다.
- 타입·관련27단위검사, 기존댓글16브라우저검사 통과(PC모바일전용2제외). Chromium320/390·WebKit390에서44px터치·가로넘침없음·닫기동작/3종밀도확인,320px스크린샷육안검토. 첫 비교의진입애니메이션 중간좌표는참고로남기고 완료후값으로 전후대조했다. API대역/VisualViewport키보드대역이며 실제회원·물리기기 검증은아니다.
- 증거 `docs/audit/close-spacing-20261024.json`, 원본 `.local/close-spacing-20261024/`. 로컬반영, 운영미배포. 아래댓글닫기기록의 당시크기값은 이번후속수정으로대체한다. 기존미커밋보존, 커밋·푸시없음. 다음배포시 CommentComposer/MediaOverlay/social CSS의해당변경을 선택한다.

## 현재 화면 복귀 링크 전수 점검·아이콘 통일 (2026-10-24)

- 신규팬·스튜디오·공통UI/preview/service라우터의TS/TSX101파일과탐색후보121곳을검토했다. 텍스트복귀13곳을공용BackButton으로교체하고 기존게시물상세/모바일대화2곳도합쳐15호출부를통일했다. 공지상세·없는공지,팔로잉/팔로워,저장/좋아요,로그인하단,비밀번호재설정,결제복귀,스튜디오작성/수정/없는글·정산·PIN·리포트3종을포함한다. 구형앱과별도관리콘솔은제외했다.
- 원형44px·화살표22px·목적지접근성이름을공유하고 기존href/화면내닫기동작을보존했다. PageTitle.back은제목왼쪽, 로그인하단은기존가운데위치다. 성공후CTA·작성단계·미디어넘김·페이지네이션·메뉴/관련링크는유지한다. 카탈로그는실제링크와화면내복귀둘다시연한다. AGENTS에공용복귀규칙추가.
- 레이어/타입·관련84단위통과. Chromium320/1280·WebKit390에서목업/서비스API대역79브라우저경로검증을완료했고 닫기여백후속변경후관련19검사를다시통과했다.44px/22px/원형·텍스트미노출·목적지/Enter이동·로그인가운데·PC대화버튼미노출·카탈로그를확인했다. 첫단위3실패는PageTitle/NextLink테스트대역보완후해소했고 첫브라우저에서발견된PC대화버튼노출은CSS우선순위를명시해수정했다. 최초실패로그보존.
- 후보별분류/파일목록 `docs/audit/back-navigation-inventory-20261024.json`, 실행증거 `docs/audit/back-navigation-20261024.json`, 원본 `.local/back-navigation-20261024/`. 실API/물리기기/운영검증아님. 로컬반영·운영미배포, 커밋·푸시없음. 이전팔로우아이콘·댓글X와별도PASS가입변경등기존미커밋보존. 배포요청시이목적의선택차이만적용한다.

## 모바일 피드 댓글 입력창 닫기 (2026-10-24)

- 공용 CommentComposer의 입력창 왼쪽에 44×44px X 버튼을 추가하고 피드 카드의 기존 댓글 접기 동작에 연결했다. 해당 카드가 화면 밖에 있어도 댓글과 입력창을 닫을 수 있으며 입력 포커스를 해제해 키보드 영역을 복원한다. 여러 댓글을 연 경우 기존 우선순위에 따라 남은 입력창으로 전환한다. 닫힌 카드의 초안은 기존 접기와 동일하게 초기화되고 다른 열린 카드의 초안은 유지한다.
- 목업/실서비스의 PostCard·CommentsSection 공용 구현에 적용했다. PC와 상세/갤러리의 기존 입력 방식은 유지한다. 레이어·타입검사와 관련 단위27개 통과, Chromium PC/모바일·WebKit 모바일 브라우저16개 통과(PC의 모바일전용2개 제외). 추가3검사에서320/390/767px 폭·44px 터치영역·입력폭·넘침없음·스크롤후닫기/재열기·키보드영역복원을 확인했다. WebKit 화면 육안 검토.
- 증거 `docs/audit/comment-close-20261024.json`, 원본 `.local/comment-close-20261024/`. 실서비스 회귀검사는 API대역이고 키보드는 VisualViewport 대역이므로 실제회원 댓글·물리iPhone 검증은 아니다. 로컬 반영, 운영 미배포. 기존 미커밋/팔로우아이콘 작업과 공통 AGENTS 규약 보존, 커밋·푸시 없음. 배포 요청 시 제품4파일의 이번 변경만 선택한다.

## 탐색 팔로우 상태 아이콘 확대 (2026-10-24)

- 공용 FollowButton의 더하기/체크 아이콘을16→20px로 확대하고 shrink를 막았다. 모바일 탐색 카드의12px override를 제거하고 아이콘/문구 간격을8→4px로 조정해320px 두열 카드에서도 문구가 한 줄을 유지한다. 카드 버튼 높이44.39px는 유지하며 팔로잉 목록/디자인시스템도20px를 공유한다. 프로필커버의 기존12px compact표시는 유지했다. 검색의 일반 텍스트행에는 원래 팔로우버튼이 없어서 새버튼을 추가하지 않았다.
- 기존팔로우/해제확인 단위2개 통과. 로컬3010 Chromium320/390/1280·WebKit390 ×목업/서비스대역8환경에서20px/동일높이/문구한줄/넘침없음, 목업팔로우/해제취소 동작을 확인했다. 별도390/1280 카탈로그2환경과 프로필compact/팔로잉목록2환경도 확인하고 모바일화면 육안검토. 실제회원 팔로우는 변경하지 않았다.
- 검증 보조스크립트의 fixture수입 초기화 오류와 상태변경 후 동적locator 오류를 수정해 재검증했다. 제품동작의 실패로 간주하지 않으며 최초기록 보존. 증거 `docs/audit/follow-icon-20261024.json`, 원본 `.local/follow-icon-20261024/`.
- 로컬 반영, 운영 미배포. 운영은 `support-spacing-20261024` 유지. 기존 미커밋/AGENTS규약 보존, 커밋·푸시 없음. 배포 요청 시 FollowButton.tsx와 creator.module.css의 해당부분만 선택한다. 물리기기 검수는 별도다.

## 고객센터 문의 내역 여백·설정 구분선 운영 배포 (2026-10-24)

- 공통 셸의 제목 margin-top 초기화가 문의 화면의 지정 여백을 덮어써 실제0px였음을390/1280에서 확인했다. `.support .subheading`으로 범위를 지정해 문의 등록 영역과 내 문의 내역 사이32px를 복원했다. 이전 요청의 모바일 설정 구분선(1px/22px 안쪽여백)도 함께 운영 반영했다. 목업/실서비스는 같은 CSS를 사용한다.
- 운영499파일 대조 후 account.module.css의2규칙만 선택해 `crefans-front:support-spacing-20261024`로 배포했다. amd64빌드/타입검사·이미지/운영499소스해시 일치. 프론트만 교체했고 API·worker·admin·DB·proxy의ID/이미지와 집SSH규칙은 보존했다. 복구 `/opt/crefans-backup-support-spacing-20261024`.
- 로컬/이미지/운영 각8환경(Chromium320/390/1280·WebKit390 × 목업/서비스대역)에서32px 실측·문의 빈목록·목업등록후간격·버튼필수입력·모바일설정구분선/PC미노출·가로넘침없음을 확인했다. 모바일/PC스크린샷 육안 검토. 실제 운영 공개API의 고객센터390/1280 화면도32px, TLS6경로200·APIhealth·frontend restart0/OOM없음 확인. 실제 문의는 발송하지 않았다.
- 이미지 첫검사의 WebKit에서 강제 페이지이동 중 Next RSC 사전로딩 취소 오류가 기록됐다. 검사에 네트워크완료 대기를 추가해8환경을 재검증했으며 최초실패를 보존했다. 제품CSS는 바꾸지 않았고 브라우저 사전로딩 자체의 수정으로 주장하지 않는다.
- 증거 `docs/audit/support-spacing-deployment-20261024.json`, 원본 `.local/support-spacing-deploy-20261024/`. 단순CSS2규칙으로 새영구테스트/전체유닛반복 없음. 기존미커밋/AGENTS규약 유지, 커밋·푸시 없음. 앞선 설정구분선의 운영미배포는 이번 배포로 해소됐다. 물리iPhone 검수는 별도다.

## 모바일 설정 그룹 사이 구분선 (2026-10-24)

- 모바일 설정의 계정 관리와 서비스 안내 사이에 기존 경계색 토큰의1px 구분선을 추가했다. 서비스 안내 상단22px 여백을 두고767px 이하에서만 표시한다. 공용 CSS1규칙 변경으로 목업/실서비스에 적용하며 PC는 유지한다.
- 기존3010 서버의 Chromium320/390/767/768/1280 및 WebKit390 총6환경에서 선 두께·스타일·위아래22px 여백·6개 링크 유지·가로넘침 없음·PC미노출을 확인하고 모바일 화면을 육안 검토했다. 단순CSS변경으로 전체유닛/새영구테스트는 수행하지 않았다. 실회원·물리기기 검증은 아니다.
- 증거 `docs/audit/settings-divider-20261024.json`, 원본 `.local/settings-divider-20261024/`. 로컬 반영, 운영 미배포. 기존 미커밋 작업과 AGENTS 공통규약 보존, 커밋/푸시 없음. 배포 요청 시 CSS1규칙만 반영한다.

## 모바일 설정 서비스 안내 운영 배포 (2026-10-24)

- 사용자 배포 요청으로 `https://beta.crefans.com` 프론트를 `crefans-front:mobile-settings-20261024`로 교체했다. 모바일 설정의 서비스 안내6개 링크(서비스 소개·공지사항·고객센터·이용약관·개인정보처리방침·운영정책)가 목업/실서비스 공용으로 표시된다. PC의 기존5그룹은 유지한다.
- 운영499파일 대조 후 AccountPages.tsx/settings 영역과 account.module.css 모바일 규칙만 선택했다. 미배포 PASS/가입 변경을 제외하고 선택본 계정설정1검사·amd64 운영빌드/타입검사·이미지/운영499파일해시를 확인했다. 프론트만 교체했고 다른5컨테이너의ID/이미지와 집SSH규칙을 보존했다. 복구 `/opt/crefans-backup-mobile-settings-20261024`.
- 이미지12환경/운영12환경에서 Chromium320/390/767/768/1280·WebKit390의 목업/실서비스를 검사했다. 모바일6링크의53~54px 터치영역·가로넘침 없음, PC미노출, 각24회 링크이동/설정복귀를 확인했다. 실서비스 로그인 상태는 API대역이며 실제회원/운영계정 변경은 없다. 모바일/PC 화면 육안 확인, HTTPS6경로200·APIhealth·frontend running/restart0/OOM없음 확인. 실제 공개API를 사용한 공지사항/약관/개인정보/운영정책4개 화면도 정상200과본문제목을 확인했다.
- 증거 `docs/audit/mobile-settings-deployment-20261024.json`, 원본 `.local/mobile-settings-deploy-20261024/`. 커밋·병합·푸시 없음, 기존 미커밋 작업/AGENTS공유UI·증거 규약 보존. 아래 모바일설정 작업의 운영미배포 상태는 이번 배포로 해소됐다. 물리iPhone 검수는 별도다.

## 모바일 설정의 서비스 안내 진입 경로 (2026-10-24)

- 모바일(767px 이하) 설정의 계정 관리 다음에 서비스 안내를 추가했다. 서비스 소개·공지사항·고객센터·이용약관·개인정보처리방침·운영정책 6개를 기존 메뉴 행/화살표로 표시하고 basePath를 사용해 목업과 실서비스의 기존 화면에 연결한다. PC 5개 그룹과 로그아웃·회원 탈퇴는 유지한다. 법률 본문/API/권한은 변경하지 않았다.
- 검증: 레이어336파일·타입 검사·기존 계정 테스트11개 통과. 기존3010 서버에서 Chromium320/390/767/768/1280 및 WebKit390의 목업/실서비스 총12환경, 모바일 링크 높이53~54px·가로넘침 없음·PC미노출과 모바일24회 링크 이동/설정 복귀를 확인했다. 실제 서비스 UI는 API대역으로 검증했고 실제 회원·운영 API·물리iPhone 검증이 아니다. WebKit390 목업 화면 육안 확인.
- 증거 `docs/audit/mobile-settings-links-20261024.json`, 원본 `.local/mobile-settings-links-20261024/`. **로컬 반영, 운영 미배포**. 기존 미커밋 작업/PASS 가입 변경과 공통 AGENTS 규약을 보존했다. 커밋·병합·푸시 없음. 다음 배포 요청 시 이 설정 변경만 운영에 선택 반영한다.

## 댓글 없음 문구·모바일 정렬 운영 배포 (2026-10-24)

- 공통 CommentsSection의 빈 댓글 문구를 `댓글이 없습니다`로 변경하고767px 이하의 해당 안내만 가로 가운데 정렬했다. 피드·게시물 상세·갤러리와 목업/실서비스에 공유 적용된다. PC 정렬은 유지했다.
- 기존 운영499파일 대조 후 SocialPages.tsx 문구1개/social.module.css 모바일 규칙1개만 선택해 `crefans-front:empty-comments-20261024`로 배포했다. amd64 운영 빌드·타입 검사와 이미지/실운영499파일해시·이미지ID 대조 통과. 프론트만 교체, 나머지5개 컨테이너ID/이미지와 집SSH규칙 유지. 복구 `/opt/crefans-backup-empty-comments-20261024`.
- 수정 전/후·운영용 이미지·운영 각각 Chromium320/390/1280·WebKit390의4환경에서 상세/피드/갤러리3표면을 검증했다. 실제 텍스트 중심 좌표가 모바일 안내영역 중심과1px미만 차이, PC기존정렬·문구·목업댓글 등록후안내소멸·플로팅입력 하단위치를 확인했다. 모바일/PC 화면 육안 검토. HTTPS6경로200·restart0/OOM없음 확인.
- 증거 `docs/audit/empty-comments-deployment-20261024.json`, 원본 `.local/empty-comments-deploy-20261024/`. 문구/CSS범위로 새영구유닛/전체유닛 반복 없음. 실계정댓글 게시·물리iPhone검수는 하지 않았다. 미커밋 작업/AGENTS공유UI·증거 규약 보존, 커밋·병합·푸시 없음. 이번 요청 운영 반영 완료, 다음은 사용자 확인이다.

## 갤러리·모바일 댓글 입력 운영 배포 (2026-10-24)

- 사용자 배포 요청으로 `https://beta.crefans.com` 프론트를 `crefans-front:gallery-comments-20261024`로 교체했다. 갤러리 진입 즉시 하단 댓글 입력, 목록 접기/패널3단계·미디어 확대 복원 시 초안 유지, 모바일 상세/피드 공용 입력바도 함께 반영했다. PC는 기존 펼친 목록의 textarea다. 아래 갤러리 및 모바일댓글 입력바의 운영 미배포 기록은 이번 배포로 해소됐다.
- 기존 운영498파일을 대조하고 변경6파일+공통컴포넌트1파일만 선정했다. 선정 소스 레이어/타입/관련32검사, amd64 운영 빌드 통과. 이미지/실운영499파일해시·이미지ID 일치. 프론트만 교체했고 API·worker·admin·DB·proxy5개 컨테이너ID/이미지와 집SSH규칙은 유지했다. 별도 PASS/가입 미배포 변경은 제외했다.
- 운영용 이미지24개/운영24개 브라우저 검사 통과(각 PC의 모바일전용3개 제외). Chromium PC/모바일·WebKit 모바일에서 하단고정·320/390/767폭·초안/등록·중복 방지/실패 재시도·댓글 닫힘/잠긴글·목록조회 지연·이전/다음글·갤러리3단계/확대/넘김·GNB/메시지·프로필 확대 회귀를 확인했다. 카탈로그390/1280 네 상태, 운영 실제 비로그인 피드GET/health/로그인, HTTPS6경로200·restart0/OOM없음 확인. 배포 전후 모바일/PC 화면 육안 검토.
- 검증 보조 스크립트의 파일명 치환으로 카탈로그 첫 실행이 문법오류였다. 제품 코드 변경 없이 보조 스크립트만 수정해 통과했고 최초 실패 로그를 보존했다. 증거 `docs/audit/gallery-comments-deployment-20261024.json`, 원본 `.local/gallery-comments-deploy-20261024/`, 복구 `/opt/crefans-backup-gallery-comments-20261024`.
- 실서비스 댓글 동작은 API대역이며 실계정 댓글을 게시하지 않았다. 물리 iPhone 키보드 검수는 별도다. 커밋·병합·푸시 없음, 기존 미커밋 작업과 AGENTS의 공유UI/검증 규약 유지. 다음은 사용자 운영 화면 확인이며 이번 배포 범위에 남은 오류 없음.

## 갤러리 모바일 댓글 입력 항상 표시 (2026-10-24)

- 모바일 갤러리를 열면 기존 공용 댓글 입력바를 바로 표시한다. 댓글 목록은 펼칠 때 조회하며 접기/펼치기에도 초안을 보존한다. 패널3단계/미디어 확대·복원과 키보드 높이 보정은 기존 CommentDock을 그대로 사용한다. 이전/다음 게시물은 새 입력 상태로 전환하고 댓글 닫힘/잠긴 글 제한을 유지한다. PC는 목록을 펼쳐야 textarea가 나타난다. 목업·실서비스 공용이다.
- 수정 전 입력창 누락을 브라우저 실패로 재현하고 수정 후 레이어·타입·300개 단위 검사와19개 브라우저 검사(PC 모바일전용2개 제외)를 통과했다. Chromium PC/모바일·WebKit 모바일의320/390/767폭, 초안/접기/3단계/확대·키보드 대역, 서비스 API대역 실패/중복 전송/재시도/다음글/닫힌댓글/잠긴글, 기존 갤러리·프로필 확대 회귀를 확인했다. 모바일/PC 초기 화면 육안 검토.
- 증거 `docs/audit/gallery-comment-dock-20261024.json`, 원본 `.local/gallery-comment-dock-20261024/`. **로컬 반영, 운영 미배포**. 기존 모바일댓글 입력바 전체도 아직 운영에 포함되지 않았다. 현재 운영은 `message-time-20261024`. 실계정 댓글 게시·물리 iPhone 키보드 검수는 하지 않았다. 기존 미커밋 작업 보존, 커밋·병합·푸시 없음. 공유UI/검증 지침 유지.

## 메시지 날짜·시간 색상 운영 배포 (2026-10-24)

- 사용자 운영 배포 요청으로 `https://beta.crefans.com` 프론트를 `crefans-front:message-time-20261024`로 교체했다. 선택된 대화의 시간만 파랗게 하던 CSS1규칙을 제거해 목록/대화방 날짜·시간이 공통 회색을 사용한다. 목업·실서비스·스튜디오가 동일한 MessagesPage/CSS를 사용한다.
- 운영498파일을 대조하고 social.module.css의1규칙 삭제만 선정했다. amd64 운영 빌드/타입 검사 통과, 이미지/운영498파일해시·이미지ID 일치. 프론트만 교체했으며 API·worker·admin·DB·proxy5컨테이너의ID/이미지는 유지했다. DB/회원/실메시지 변경·SSH규칙 변경 없음. 별도 모바일댓글/PASS 작업은 제외했다.
- 이미지4/운영4 브라우저 검사 통과: Chromium390/1280·WebKit390 팬 메시지와 Chromium1280 스튜디오 메시지. 선택/비선택·대화 전환 후 회색, 대화방 날짜/시간, 읽지 않은 행 노란 배경/빨간 점, 가로넘침 확인. 운영 모바일/PC 화면 육안 검토. HTTPS6경로200·API health, 프론트 running/restart0/OOM없음 확인. 날짜/시간 브라우저 검사는 운영 목업 데이터로 진행했으며 실제 회원 대화를 열지 않았다.
- 증거 `docs/audit/message-time-deployment-20261024.json`, 원본 `.local/message-time-deploy-20261024/`, 복구 `/opt/crefans-backup-message-time-20261024`. 아래 로컬 기록의 미배포 상태는 해소됐다. 기존 미커밋 작업·AGENTS 공용UI/검증 규약 유지. 단순CSS로 전체 유닛 반복 없음, 커밋·병합·푸시 없음. 다음은 사용자 화면 확인이며 이번 범위의 미해결 사항 없음.

## 메시지 날짜·시간 색상 통일 (2026-10-24)

- 사용자 요청에 따라 메시지 목록에서 선택된 대화의 시간만 파랗게 만드는 CSS1규칙을 제거했다. 선택/비선택 모두 기존 `--cf-color-textMuted` 회색을 사용하고 대화방의 날짜·시간도 동일 색상을 유지한다. 공용 MessagesPage/CSS라 목업·실서비스·스튜디오에 함께 적용된다.
- 기존3010 서버의 수정 전4/후4 검사 통과: Chromium390/1280·WebKit390 팬 메시지와 Chromium1280 스튜디오 메시지. 선택 시간 rgb(37,99,235)→rgb(108,114,131), 대화 변경 후 회색·대화방 날짜/시간·가로넘침 확인. 초기 목록의 미확인 노란 배경·빨간 점·선택 상태는 색상 외 전후 일치. 모바일 화면 육안 검토했다.
- 증거 `docs/audit/message-time-color-20261024.json`, 원본 `.local/message-time-color-20261024/`. 단순CSS1규칙으로 전체 유닛을 반복하지 않았다. **로컬 완료, 운영 미배포**. 커밋·병합·푸시 없음, 기존 미커밋 작업 보존. AGENTS의 공용 컴포넌트/검증 규약 유지. 다음 배포 요청 시 반영하며 이번 범위의 미해결 사항 없음.

## 홈·탐색 검색 디자인 운영 배포 (2026-10-24)

- 사용자 배포 요청에 따라 `https://beta.crefans.com`의 프론트를 `crefans-front:creator-search-20261024`로 교체했다. 홈의 검색창 디자인을 공용 CreatorSearch로 탐색/카탈로그에도 적용하며 목업·실서비스가 같은 구현을 사용한다. 홈은 링크, 탐색은 실제 입력으로 기존 검색·필터 동작을 유지한다.
- 운영496파일을 기준으로 변경5개/추가2개만 선택했고 amd64 운영 빌드·타입 검사를 통과했다. 이미지/운영498파일해시와 이미지ID 일치. API·worker·admin·DB·proxy5개 컨테이너는 ID/이미지가 그대로이며 DB migration/실계정 변경은 없다. 집SSH 규칙과 기존 미배포 댓글입력/PASS 작업을 유지했다.
- 이미지7개/운영10개 브라우저 시나리오 통과. Chromium320/390/1280·WebKit390의 목업, 실제 모델 API대역390/1280, 카탈로그4상태 및 운영 실API Chromium390/1280·WebKit390에서 스타일·검색·이동을 검증했다. 운영 실검색은 정상200·success이며 결과0명으로, 데이터 있는 필터 동작은 목업/대역 증거와 구분한다. HTTPS6경로200·API health, 프론트 running/restart0/OOM없음 확인. 배포 이미지와 운영 모바일/PC 화면을 육안 검토했다.
- 첫 준비 검사에서 카탈로그의 미배포 댓글 작업과 인접한 문맥 때문에 패치 검사가 실패했다. 변경 범위는 그대로 두고 문맥을 좁혀 다시 대조했다. 실패 기록 보존, 운영 영향 없음. 증거 `docs/audit/creator-search-deployment-20261024.json`, 원본 `.local/creator-search-deploy-20261024/`, 복구 `/opt/crefans-backup-creator-search-20261024`.
- 아래 검색 디자인의 운영 미배포 상태는 이번 배포로 해소됐다. AGENTS의 공유 UI/검증 규약 유지. 물리기기/전체 서비스 회귀 검수는 별도이며 커밋·병합·푸시는 하지 않았다. 다음은 사용자 화면 확인이며 이번 범위의 미해결 항목은 없다.

## 홈·탐색 검색 디자인 통일 (2026-10-24)

- 홈 검색 디자인을 탐색에도 적용해 달라는 요청. `CreatorSearch`와 전용 CSS를 공용으로 만들고 홈/탐색의 중복 표시 스타일을 교체했다. 홈의46px 높이·24px 모서리·14px 글자·20px 아이콘·11px/14px 여백을 유지하며 목업/실서비스에 함께 적용한다. 홈은 이동 링크, 탐색은 검색 입력으로 동작한다. 페이지별 콘텐츠 폭·기존 검색/필터 모델은 유지한다.
- 디자인 시스템 서비스 UI에 같은 컴포넌트의 링크·입력·읽기 전용·비활성4상태를 등록했다. 카탈로그의 상위 링크 색상이 검색창을 덮어쓰던 문제도 해당 컴포넌트 안에서 보완했다. AGENTS의 공용 UI·카탈로그·증거 규약을 그대로 따른다.
- 검증: 레이어·타입·관련 기존31개 검사 통과. 기존3010 서버에서 Chromium320/390/1280·WebKit390 목업4환경, 실제 서비스 모델 API대역390/1280, 카탈로그1환경 통과. 변경 전 홈과 높이·여백·간격·모서리·배경·테두리·글자·아이콘 수치 일치, 검색/빈 결과 초기화/카테고리/URL검색·키보드 이동·포커스·가로넘침을 확인했다. 모바일/PC·카탈로그 화면 육안 검토. 최초 포커스 검사는 보이지 않는 outline의 너비를0으로 가정해 실패하여 outline-style:none 판정으로 교정했고 실패 기록을 보존했다.
- 증거 `docs/audit/creator-search-20261024.json`, 원본 `.local/creator-search-20261024/`. **로컬 완료, 이번 검색 변경은 운영 미배포.** 서비스 동작 검사는 API응답 대역으로 실서버·실기기 검증이 아니다. 기존 미커밋 작업 보존, 커밋·병합·푸시 없음. 다음 운영 배포 요청 시 이 범위를 반영한다.

## 모바일 GNB 아이콘28px 운영 배포 (2026-10-24)

- 사용자 배포 요청으로 `crefans-front:gnb-size-20261024`를 운영 반영했다. 모바일 공용 GNB 아이콘21→28px, 프로필 사진24→28px. 56×48px 클릭 영역·간격·미확인 빨간 점·PC21px는 유지한다.
- 기존 운영496파일을 대조하고 `service.module.css`의 모바일 크기2규칙만 선정했다. amd64 Next production build/타입 검사 통과, 이미지·운영496파일해시 일치. 프론트만 교체했으며 API·worker·admin·DB·proxy의 컨테이너ID/이미지와 집SSH 규칙을 보존했다. DB migration/회원 변경 없음. 별도 미배포 댓글입력/PASS 작업은 제외했다.
- 이미지10/운영10 브라우저 검사: Chromium320/390/767/1280·WebKit390의 목업/실서비스 셸에서5개 아이콘·아바타28px, 터치영역·하단위치·가로넘침·PC불변 및 모바일 탐색 이동/active 확인. 운영6개 HTTPS경로200·실API health·서비스 연결오류 없음, 프론트 running/restart0/OOM없음. 운영390px 화면2개 육안 확인. 이미지 최초 검사는 기동 전 접근 ERR_EMPTY_RESPONSE여서 준비 완료 후10개 재검증했으며 실패 로그를 보존했다.
- 증거 `docs/audit/gnb-icon-size-deployment-20261024.json`, 원본 `.local/gnb-icon-size-deploy-20261024/`, 복구 설정 `/opt/crefans-backup-gnb-size-20261024`. 단순CSS2규칙으로 전체 유닛은 반복하지 않았고 물리기기 검수는 아니다. 커밋·병합·푸시 없음. 아래 GNB 확대의 미배포 상태는 해소됐으며 별도 미결정 사항 없음.

## 모바일 GNB 아이콘 확대 (2026-10-24)

- 요청에 따라 공용 모바일 하단 GNB의 아이콘21px·프로필 사진24px를 모두28px로 확대했다. service.module.css의767px 이하 규칙2개만 추가해 목업·실서비스·사진 없는 기본 아바타에 동일 적용했다. 56×48px 클릭 영역·간격·빨간 미확인 점·PC 사이드바21px는 보존한다.
- 검증: 기존3010 서버에서 수정 전10/후10 레이아웃 검사. Chromium320/390/767/1280·WebKit390에서 목업/실서비스 셸의5개 크기·44px이상 터치영역·화면하단·가로넘침·PC불변을 측정했다. 모바일 탐색 이동/active도 확인하고390px 두 화면을 육안 검토했다. 실제 서비스는 로컬API 미접속 오류 상태여서 레이아웃/기본 아바타만 검증했으며 API정상연동으로 확대하지 않는다.
- 증거 `docs/audit/gnb-icon-size-20261024.json`, 원본 `.local/gnb-icon-size-20261024/`. 단순CSS크기 변경으로 새로운 영구테스트·전체유닛재실행은 하지 않았다. **로컬 반영, 운영 미배포**, 커밋·푸시 없음. 기존 미커밋 작업 보존. 별도 미결정 사항은 없으며 운영 반영은 다음 배포 요청 시 진행한다.

## 인증 크리에이터 배지 운영 배포 (2026-10-24)

- 사용자 요청으로 `creator-verification-20261024` API·worker·독립 관리자·프론트를 운영 반영했다. 목업 모카·지우·북부대공(시온), 기존 하늘의 닉네임 오른쪽 배지가 프로필·피드·탐색·랜딩 등 공용 UI에 표시된다. 운영 콘솔에서 활성 ADMIN/SUPER_ADMIN이 부여·해제할 수 있으며 PASS와 별개다.
- 직전 운영 front493/server183파일을 대조한 뒤 배지 범위만 선택했다. 프론트12변경/3추가, 서버6변경/1migration추가, 관리자 Console.tsx를 반영했다. 운영에 `20261024120000_creator_verification` 하나만 적용했으며 기본false·NOT NULL 확인. 실제 크리에이터0명이라 계정 부여/해제는 수행하지 않았다. 별도 모바일 댓글 입력바·PASS 보류 가입 작업은 배포에 포함하지 않았다.
- 선택 소스 검사: front299, API/권한·감사·Swagger23, admin5와 격리DB 실제API 관리자 E2E1 통과. 세 amd64 이미지 빌드 및 이미지 브라우저6 통과. 운영 PC/모바일 Chromium·WebKit 브라우저6과 TLS HTTP18 통과. 서비스 화면의 인증/해제 브라우저 검사는 API 대역이며 운영 실계정 검증과 구분한다. 운영 front496/server184소스해시·이미지 일치, DB/proxy ID 유지·교체4서비스 running/restart0/OOM 없음, 집 SSH 지속 규칙 보존.
- 첫 운영 WebKit 검사에서 빠른 페이지 전환의 Next 사전 로딩 취소가 검출되어 로딩 완료 후 이동하도록 검사를 보완하고6개를 재검증했다. 실패 로그/trace를 보존했고 제품 사전 로딩 오류 자체를 수정했다는 주장은 하지 않는다. 검증 스크립트의 compiled 경로 오기와 증거 파일명 충돌도 교정해 재실행했다. PC·모바일 화면 육안 확인.
- 배포 증거: `crefans_front/docs/audit/creator-verification-deployment-20261024.json`, 원본 `crefans_front/.local/creator-verification-deploy-20261024/`. 복구 설정 `/opt/crefans-backup-creator-verification-20261024`. 이전 관리자 standalone에는 원본소스가 없어서 과거감사17파일+이미지로 비교했다는 한계를 기록했다. 커밋·병합·푸시 없음. 아래 배지 구현/목업의 미배포 기록은 이번 배포로 해소됐다. 물리기기·실계정 인증 판정 정책·기타 출시 검수는 별도다.

## 목업 인증 배지 대상 추가 (2026-10-24)

- 요청한 모카·지우·북부대공(시온)의 공통 목업 데이터를 확인했다. 모카·지우는 이미 인증 true였으며 시온도 true로 바꿨다. 기존 하늘의 인증은 유지했다. 랜딩·탐색·프로필·피드는 같은 크리에이터 데이터를 사용한다. 실제 운영 계정 상태는 바꾸지 않았다.
- 기존 배지 브라우저 검사의 인증 예시에 세 인물을 포함하고, 미인증 대조 대상을 서연으로 바꿨다. PC·모바일 Chromium·모바일 WebKit의 기존 브라우저 검사 3개 통과. 검증 기록: `docs/audit/creator-badge-fixtures-20261024.json`. 배지의 이전 구현 기록은 당시 결과이며 이 목업 데이터 변경의 최신 증거는 새 기록을 따른다.
- 로컬 반영, 운영 미배포. 다음 배포 시 앞서 완성한 배지 기능과 함께 반영한다. 별도 미결정 사항 없음.


## 인증 크리에이터 배지 (2026-10-24, 로컬 구현)

- 사용자 결정: 운영자가 직접 부여·해제하며 PASS 본인인증과 분리한다. 생성형 이미지로 파란 체크 배지를 만들고 공통 CreatorName에 적용했다. 목업 하늘·모카·지우 예시와 미인증 비교 예시, 프로필·피드·탐색·멤버십·메시지·댓글·팔로잉/팔로워 및 디자인 카탈로그를 공유한다.
- 서버 Creator.is_verified 기본 false + migration, 활성 ADMIN/SUPER_ADMIN 전용 PUT /api/v1/admin/creators/:id/verification, 수정 필드 허용목록, 트랜잭션/행 잠금/변경 이력과 공개 isVerified 응답을 연결했다. 별도 관리자 콘솔에서 부여/해제 확인, 저장 실패 표시와 재조회. 일반 회원/PASS/광고 상태로 자동 부여되지 않는다.
- 검증 범위: 프론트300검사, API/권한/감사/Swagger23검사, 관리자5검사, 실제 API·격리 DB 관리자 E2E1 및 프론트 PC/모바일 Chromium·WebKit 6개. 화면·긴 이름·미인증·해제·실패/취소·권한 거부·중복 해제 감사 이력 대조. 문서 계약은 API100개(유저56/스튜디오37/콘솔26), migration17개. 증거는 front/docs/audit/creator-verification-20261024.json.
- 로컬 개발 DB와 격리 테스트 DB에 새 migration을 적용했다. 운영 DB/앱 미배포, 커밋·푸시 없음. 기존 모바일 댓글 입력바 등 미커밋 작업 보존. 운영 배포는 migration → API·콘솔·프론트 순서이며 기존 화면 인증 상태는 다음 조회 시 갱신된다. 실제 기기 검수·인증 판정 정책 자체는 검증 범위 밖이다.


## 최신 UI 수정 (2026-10-24) — 모바일 댓글 하단 한 줄 입력바

- 공용 `CommentComposer`와 `CommentDock`을 추가해 767px 이하에서 게시글 상세/피드 댓글은 GNB 바로 위, 갤러리는 상세 패널 하단에 한 줄 입력을 고정했다. 44px 위 화살표 등록 버튼, 빈 값/등록 중 비활성, 한글 조합 Enter 방지, 실패 초안/오류 유지, 성공 초안 초기화. 여러 피드 댓글은 하나의 입력바와 게시물별 초안을 사용하며 각 목록의 댓글 쓰기로 전환한다.
- 모바일 키보드가 보이는 영역을 줄이는 경우 VisualViewport로 셸/갤러리 높이를 보정하고 팬 GNB를 잠시 숨긴다. 갤러리 확대/축소에서도 초안을 유지한다. 입력은 모달 DOM 안에 있으며 Tab/Shift+Tab 순환을 명시적으로 처리해 WebKit에서 등록 버튼을 건너뛰지 않도록 했다. PC textarea, 읽기 전용 작성 미리보기, 잠긴/댓글 닫힌 게시물의 제한은 유지했다. 목업/실서비스/디자인 카탈로그 공용이다.
- 검증: 레이어/타입 및 기존298검사 통과. Chromium PC·모바일과 WebKit 모바일에서 21개 E2E 통과(PC에 해당하지 않는 모바일 전용3개 제외). 상세·스크롤·320/767폭·다중 글 초안·갤러리3모드/확대·키보드 높이 대역·IME·중복 전송 방지·API 실패/재시도·권한/댓글 닫힘·기존 GNB/메시지/프로필 확대 회귀 확인. 카탈로그390/1280 네 상태 및 모바일/PC 화면 육안 검토. 실서비스 검사는 API 대역을 사용했고 실제 댓글을 외부에 게시하지 않았다.
- 최초 검사에서 React provider로 인한 테스트 트리 조회 변경, Next route announcer까지 잡힌 오류 selector, 갤러리 진입 애니메이션 중 좌표 비교를 수정했다. WebKit Tab 이동 문제는 제품 코드를 보완했다. 실패 원본과 최종 결과를 보존했다. 증거 `docs/audit/mobile-comment-composer-20261024.json`, 원본 `.local/mobile-comment-composer-20261024/`. **로컬 완료·운영 미배포**, 물리 iPhone 키보드 미검증. 커밋/병합/푸시 없음. AGENTS 공유 UI/검증 규약 유지. 다음은 사용자 확인 후 해당 범위의 배포다.

## 최신 운영 배포 (2026-10-24) — 지우 v2·멤버십 안내·상세 뒤로가기

- 사용자 운영배포 요청에 따라 `https://beta.crefans.com` 프론트를 `crefans-front:membership-ui-20261024`로 교체했다. 지우 사진5장 v2, 잠긴 게시물의 멤버십 이름/가격·혜택 레이어, 게시글 상세 아바타 왼쪽 뒤로가기 및 공통 Dialog 키보드 동작이 반영됐다. 아래 세 로컬 미배포 기록은 이번 배포로 해소됐다.
- 기존 운영486개 실행 파일 해시를 대조하고 변경10파일+신규7파일만 선정했다. 선택된 소스의 레이어·타입·297개 검사와 amd64 빌드 통과, 새 이미지/운영493파일 및 공개 PNG10개(v1 보존+v2) 해시 일치. 가입/PASS 등 미선택 변경은 제외했다. 프론트만 교체했고 API/worker/DB/admin/proxy 컨테이너 ID 및 집 SSH 규칙을 보존했다. 복구 설정 `/opt/crefans-backup-membership-ui-20261024`.
- 배포 이미지와 운영 각각 지우/멤버십 안내/뒤로가기의 Chromium320/390/1280·WebKit390 검증, 서비스 모델 API 대역의 멤버십320/1280·뒤로가기390/1280, 카탈로그4상태·기존 결제 상세 모달 키보드 회귀 통과. 운영 실제 API의 비로그인 피드/로그인은 Chromium390/1280·WebKit390에서 확인했다. 서버 health/10경로200·프론트 running/restart0·OOM 없음 확인. 모바일/PC 화면도 육안 검토했다.
- 증거 `docs/audit/membership-ui-deployment-20261024.json`, 원본 `.local/membership-ui-deploy-20261024/`. 생성 사진은 목업/에셋 랜딩에 적용되며 실제 운영 DB 인물/글 추가는 없다. 실계정 구매·카드 실행·물리 iPhone 검수는 이번 범위 밖이다. 커밋/병합/푸시는 수행하지 않았다. AGENTS 공유 UI·검증 규약 유지. 다음은 사용자 운영 확인 후 남은 별도 작업을 이어간다.

## 최신 목업 사진 수정 (2026-10-24) — 지우 자연스러운 배경 v2

- 운영 배포 전 지우 사진의 AI 같은 배경을 개선해 달라는 요청. built-in imagegen으로 기존5장(프로필·배경·바닷길·캠핑·커피)을 각각 참조 편집했다. 얼굴/의상/포즈를 유지하면서 강한 역광·과도한 물빛·알프스형 산세를 평범한 산책로·해안길·저수지 캠핑장과 부드러운 자연광으로 바꿨다. 결과5장 육안 확인. 사실적인 느낌은 시각 판단이며 실사진으로 주장하지 않는다.
- `public/illustrations/creators/jiwoo/*-v2.png`와 `generation-v2.json`에 저장했고 v1/생성 원본을 보존했다. 공유 landing.ts와 게시물 fixture는 이미지 경로만 갱신했다. 인원/게시물 수·문구·권한 변경 없음. 랜딩·탐색·프로필·피드에서 사용한다.
- 검증: 레이어·타입 통과, 원본/프로젝트 복사/로컬 HTTP5장 해시 일치, Chromium320/390/1280·WebKit390의 프로필/배경 확대·캠핑 갤러리·피드/미디어/소개·여행 필터·탐색·preview/service 에셋 랜딩·상세3경로 확인 및 모바일/PC 육안 검토. 최초 브라우저 검사의 응답 변수 오류는 스크립트 수정 후 네 환경 재검증했고 실패 로그 보존. 이미지 참조 변경이므로 제품 단위 테스트를 추가/전체 재실행하지 않았다.
- 증거 `docs/audit/jiwoo-natural-20261024.json`, 원본 `.local/jiwoo-natural-20261024/`, 제작 기록 `docs/creator-image-variety.md`. **로컬 완료·운영 미배포.** 운영은 jiwoo-20261024(v1), 직전 멤버십 안내 레이어·상세 뒤로가기 수정도 미배포다. 커밋/병합/푸시 없음. 다음은 사용자 확인 후 준비된 범위의 운영 배포이며 AGENTS의 공유 UI/증거 규약을 유지했다.

## 최신 UI 수정 (2026-10-24) — 게시물 상세 뒤로가기 위치

- 게시물 상세의 원형 뒤로가기 버튼을 작성자 아바타 왼쪽 같은 줄로 이동했다. 기존 공용 버튼의 44×44px 클릭 영역·22px 화살표·피드 복귀 경로를 유지하고 아바타 간격10px, 더보기 메뉴 오른쪽 정렬을 적용했다. 목업/실서비스가 같은 PostHeading/PostDetailPage를 사용한다.
- 검증: 레이어·타입 검사와 관련 기존 검사27개 통과. Chromium320/390/1280·WebKit390에서 공개/잠긴 상세의 좌표·간격·화면 넘침·피드 이동, 피드/갤러리에 추가 복귀 버튼 없음·없는 게시물 복귀를 확인했다. 실제 서비스 모델/라우터는 API 대역390/1280에서 같은 배치와 /service/feed 이동을 확인했다. 모바일/PC 스크린샷 육안 검토 완료.
- 증거 `docs/audit/post-detail-back-20261024.json`, 원본 `.local/post-detail-back-20261024/`. **로컬 반영 완료, 운영 미배포.** 실기기·실계정 검증은 아니며 커밋/병합/푸시 없음. 기존 미커밋 변경과 지우 운영 배포는 보존했다.

## 최신 UI 수정 (2026-10-24) — 멤버십 이름·가격/혜택 안내 레이어

- 잠긴 게시물의 숫자 레벨 안내를 크리에이터가 설정한 멤버십 이름(예: 백스테이지 이상)으로 바꿨다. `getPostMembershipOffer`를 피드/상세와 프로필 미디어 탭에서 공유하며 상품 전용은 해당 상품만, 최소 레벨은 같은 크리에이터의 해당 레벨 이상 상품만 안내한다. 이름이 없으면 일반 안내, 비활성/빈 상품은 가입 링크 없이 표시한다.
- `PostMembershipNotice`의 멤버십 안내 버튼은 공통 Dialog를 연다. PC 중앙 레이어/모바일 바텀시트에 월 가격·설명·혜택을 표시하고 선택 시 기존 멤버십 페이지의 plan 쿼리로 이어진다. 안내 열기로 결제/구독 요청을 보내지 않는다. 실제 서비스·목업 공용이며 스튜디오의 최소 레벨 작성 미리보기에도 현재 상품 목록을 전달한다.
- 실제 API는 이미 작성자 profile.plans를 반환하지만 프론트 피드/더 보기/게시물 상세에서 갱신하지 않던 부분을 보완했다. bootstrap의 오래된 이름/가격보다 해당 응답의 최신 정보(빈 목록 포함)를 사용한다. 서버/API 계약·접근권한·구독 snapshot은 변경하지 않았다.
- 디자인 카탈로그에 가입 가능/판매 중단/빈 목록/읽기 전용을 등록했다. 공통 Dialog의 키보드 순환과 WebKit 닫힘 후 버튼 복귀를 보완했다. 첫 브라우저 검사에서 발견한 포커스 이탈과 단계별 재시험 실패는 원본 로그로 보존하고 최종 검사를 통과했다. W3C APG 모달 문서(2026-10-24)를 참고했으며 닫기 자동 강조 대신 제목 초기 포커스는 유지한다.
- 검증: check 레이어/타입/298개, Chromium320/390/1280·WebKit390 목업4환경, 실서비스 어댑터 API대역320/1280의 피드/상세·상품 전용/판매 중단/빈 목록, 카탈로그4상태·기존 결제 상세 Dialog 키보드 회귀 통과. 가격/혜택·열기 시 URL 유지·선택 상품 경로·Escape/외부 클릭/닫기·양방향 Tab·포커스 복귀·화면 넘침 확인 및 모바일/PC 육안 검토.
- 증거 `docs/audit/membership-offer-20261024.json`, 로그/화면 `.local/membership-offer-20261024/`. **로컬 완료, 운영 미배포**(현재 운영은 지우 배포). 실기기·실계정·금융 실행/커밋/병합/푸시는 하지 않았다. 다음은 사용자 검토 후 해당 범위의 운영 배포다. AGENTS의 공유 컴포넌트·증거 규약 유지.

## 최신 운영 배포 (2026-10-24) — 지우 여행·캠핑 콘텐츠만 반영

- 사용자 요청에 따라 `https://beta.crefans.com`에 프론트 `crefans-front:jiwoo-20261024`를 배포했다. 지우 프로필·전용 배경·사진5장, 소개/태그와 공개2개·레벨1전용1개 게시물이 랜딩·탐색·프로필·피드에 반영됐다. 기존 travel 경로 유지, 다른 인물과 인원수8명은 그대로다.
- 운영 기준480개 런타임 파일을 대조한 뒤 데이터2파일과 지우 에셋/생성기록6파일만 선택했다. 새 이미지/운영486파일·공개PNG5개 해시 일치, amd64 빌드 통과. 프론트만 교체했고 API·worker·DB·관리콘솔·프록시 컨테이너 ID와 집 SSH 규칙을 보존했다. 복구 설정 `/opt/crefans-backup-jiwoo-20261024`.
- 배포 이미지와 운영 각각 Chromium320/390/1280·WebKit390 네 환경에서 사진/배경 확대·갤러리 다음 사진·피드/미디어/소개·여행 필터3글·탐색·preview/service 에셋 랜딩·게시물3경로를 확인했다. 운영10경로200·API health·프론트 running/restart0, 모바일/PC 화면 육안 확인. 실제 iPhone 검수는 아니다.
- 첫 WebKit 검사는 급속한 전체 페이지 이동 중 Next 사전로딩 요청 취소로 실패했다. 배포 전 기존 운영본에서도 같은 오류를 재현했고, 전환 전 요청 완료를 기다리는 검사로 네 환경을 통과했다. 제품 사전로딩 자체를 수정한 것은 아니다. 초기 파일 인벤토리에서 Dockerfile을 빠뜨린 준비 검사도 교정했으며 실패 로그를 증거에 보존한다.
- 증거 `docs/audit/jiwoo-deployment-20261024.json`, 원본 `.local/jiwoo-deploy-20261024/`. 운영 목업/에셋 랜딩 배포이며 실제 운영 DB 크리에이터·게시물을 추가하지 않았다. 가입 개방 등 미선택 작업과 커밋/병합/푸시는 그대로 미실행. 아래 지우 로컬 미배포 기록은 이번 배포로 해소됐다.

## 최신 목업 콘텐츠 (2026-10-24) — 인물 구성 조사·지우 여행/캠핑

- 요청: 먼저 목업 크리에이터의 추가 필요 인원을 조사하고 지우의 실사 여행/캠핑 프로필·배경·게시물을 보강. 조사 시작8명/13게시물, 뷰티·게임 인물0명, 예린(피트니스/라이프스타일) 게시물0개, 서연은 멤버 전용1개, 민지·수아도0개였다.6명은 전용 cover 없이 프로필 사진을 배경으로 재사용했다. 수아는 민지의 기존 원본 사진을 사용한다.
- 권장: 기존 테마를 유지할 때 신규 뷰티1명+게임1명으로 총10명. 현재 카테고리 범위에 근거한 콘텐츠 구성 판단이며 업계 의무 기준은 아니다. 인원 증가보다 예린·서연 콘텐츠 보강 우선, 하늘은 배경만, 시온은 별도 배경/보조 사진, 민지·수아는 후속 정리. 수아의 빈 프로필을 QA 사례로 남길 수 있다. 신규 인물은 생성하지 않았다.
- 지우의 가상 성인 얼굴 참조를 유지한 built-in image_gen 사진5장(트레일 프로필/호숫가 배경/바닷길/캠핑/커피)을 `public/illustrations/creators/jiwoo/`에 원본과 동일하게 저장했다. 전체 프롬프트/원본 경로는 generation.json. landing.ts 공유 지우 데이터와 fixture만 변경해 소개·태그·프로필·배경 및 공개2/레벨1전용1 게시물로 구성했다. 기존 travel 경로 유지, 총8명/15게시물. 다른 인물·멤버십 가격·권한·공통 UI는 변경하지 않았다.
- npm run check 레이어/타입/292개 통과. Chromium320/390/1280·WebKit390에서 프로필/배경 확대·갤러리 다음 사진·피드/미디어/소개 탭·여행 필터3글·탐색 q검색·preview/service 에셋 랜딩·3게시물 경로를 확인했다. 생성사진5장과 모바일/PC 화면 육안 확인, 원본/프로젝트 복사본 바이트·해시 일치. 초기 조사 로더/브라우저 selector 오류와 WebKit 초기 검색 입력 타이밍 실패는 원본 로그에 보존하고 AST 조사/범위·실제 이름/q경로 검증으로 보완했다. 검색 입력 타이밍 자체를 수정했다고 주장하지 않는다.
- 문서: `docs/creator-image-variety.md`; 증거 `docs/audit/jiwoo-content-20261024.json`, 원본 로그·화면 `.local/jiwoo-content-20261024/`. **로컬 반영만 완료, 운영 미배포·커밋/병합/푸시 없음.** 직전 운영은 feed-inbox-20261024다. 기존 AGENTS 규약 유지. 다음은 사용자 검토 후 이 이미지의 운영 반영 여부와 예린/서연·신규2명 제작 순서를 이어갈 수 있다.

## 최신 운영 배포 (2026-10-24) — 홈 검색·카테고리 및 메시지·알림 미확인 표시

- 사용자 배포 요청에 따라 `https://beta.crefans.com`에 `feed-inbox-20261024`를 반영했다. 홈 검색 진입/ChipRow 카테고리 필터·페이지 넘김, 모바일 메시지/알림 제목24px, 빨간 미확인 점/노란 미확인 행, 표시된 수신 메시지의 읽음 처리를 공용 목업·실서비스·스튜디오에 적용했다.
- 운영 기준 소스 front475/server183개 해시를 먼저 대조한 뒤 front11/server4파일만 선택 반영했다. 준비중 PASS 보류 가입·법률 게이트·금융/미디어 설정은 이번 배포 범위에서 제외했다. DB migration/seed는 없으며 프론트·API·worker만 교체했다. DB·관리콘솔·프록시 컨테이너와 집 SSH 규칙은 보존했다. 복구 설정은 `/opt/crefans-backup-feed-inbox-20261024`.
- 선택된 배포 소스로 front23개, server17개(격리DB/HTTP·OpenAPI) 및 두 amd64 이미지 빌드 통과. API 이미지의99개 계약(유저56/스튜디오37/콘솔25)과 모든 런타임 파일 해시 확인. 배포 이미지와 운영에서 각각 목업5환경×2기능, 실제 어댑터 API대역3경우 통과. 별도 운영 실API Chromium390/1280·WebKit390에서 빈 피드·검색 이동·비로그인 안내 확인. 운영10경로200·읽음 API 비로그인401·Swagger3문서 비로그인401, 세 교체 컨테이너 running/restart0 확인.
- 운영 DB의 카테고리/게시물은 비어 있다. 초기 검사는 카테고리 존재를 가정해 실패했고 실제 bootstrap 응답과 맞게 빈 목록 기대값을 수정해 재검증했다. 운영에는 전체 칩만 표시되며 데이터 있는 필터·읽음 성공 동작은 목업/응답 대역/격리DB로 검증했다. 실제 회원 메시지·외부 금융 실행·실기기 검수는 하지 않았다.
- 배포 증거: `docs/audit/feed-inbox-deployment-20261024.json`(front), 양쪽 `.local/feed-inbox-deploy-20261024/`의 원본 로그·화면·소스 해시. 아래 구현 시점의 미배포 기록은 이 배포로 해소됐으며 가입 개방의 미결정 사항은 그대로다. 커밋/병합/푸시는 하지 않았다.

## 최신 UI 수정 (2026-10-24) — 홈 검색·카테고리 바

- 홈 FeedPage 상단에 검색창 모양의 탐색 링크와 기존 Chip/ChipRow 관심 카테고리 단일 선택을 추가했다. 검색은 현재 basePath의 /explore로 이동하고 별도 입력/가상 키보드를 열지 않는다. 칩은 전체/분야 선택이며 장기 관심사 저장 설정은 아니다. 모바일 첫칩16px·한줄 가로 스크롤/마우스 드래그, 기존 최대480px 피드 폭을 유지한다.
- 목업은 전체 주입 목록의 크리에이터 태그로 필터한다. 실서비스는 feedCategory 모델과 /posts category 쿼리로 서버 페이지를 받으며 더 보기에도 같은 필터를 전달한다. 필터 변경 후 과거 응답 혼입·실패 시 다른 분야 bootstrap 표시를 막고, 빈 결과에는 전체 피드 복귀와 기존 안내 푸터를 제공한다. 오버레이 문맥도 필터된 게시물 목록이다.
- front check292개, 서버 build 및 카테고리2개/OpenAPI11개 통과. 실제 격리DB/HTTP에서 분야별20+2개 페이징·잠긴 본문 비노출·미공개/비활성 제외·전체/빈/잘못된 값·프로필 영향 없음 확인. Chromium320/390/767/1280 및 WebKit390 목업5환경, 실제 모델/라우터에 API응답을 주입한390/1280 두 환경에서 표시·필터·초기화·더 보기·검색 이동을 확인했다. 실기기/운영 검증은 아니다.
- 최초 브라우저 검사는 767px에서도 피드가 화면 폭 전체라는 잘못된 기대값으로 중단됐다. 기존480px 피드와 좌우16px 스크롤 확장 범위로 검사 기준을 수정한 뒤5환경 통과했다. 모바일390/PC1280 화면 육안 확인. 증거 `docs/audit/feed-toolbar-20261024.json`, 양쪽 `.local/feed-toolbar-20261024/` 로그·화면.
- **로컬 구현·검증 완료, 운영 미배포.** 앞선 메시지 읽음 개선도 아직 미배포이며 기존 배포/QA 기록은 당시 기준으로 보존한다. 커밋/병합·실데이터 변경은 미실행. AGENTS의 공유 UI·계층·증거 규약 유지.

## 최신 UI 수정 (2026-10-24) — 메시지·알림 미확인 표시

- 모바일 메시지21px/알림24px를 모두 공통24px로 통일했다. GNB·헤더·사이드바·목록의 미확인 점은 빨간색, 미확인 행은 옅은 노란색이다. 선택된 대화와 안읽음을 구분하며 기존 모바일 전폭 배경·구분선과 내부16px 여백, PC 제목 크기를 유지한다.
- 메시지에 실제 DB ID와 unread 상태를 연결했다. 대화가 보일 때만 요청한 ID를 읽음 처리하며 모바일 목록만 열었을 때/숨겨진 탭/실패 응답에서는 유지한다. 팬·스튜디오·목업·실서비스는 같은 MessagesPage를 쓴다. API는 수신자·대화 상대·ID 범위를 검사한다.
- front check289개, server build 및 OpenAPI11개/격리 DB·HTTP4개 통과. Chromium320/390/767/1280, WebKit390 다섯 경우의 제목·색·읽음 전환을 확인했다. 실제 서비스 어댑터의 API 대역 검사에서 실패 유지→재진입 재시도→성공 제거→재조회 상태 반영을 확인했다. 최초 서비스 브라우저 검사는 Next의 보조 alert와 locator가 중복돼 중단됐고 메시지 오류 요소로 한정한 재검사에서 통과했다.
- 증거 `docs/audit/inbox-unread-20261024.json`, 양쪽 `.local/inbox-unread-20261024/` 로그·화면. **운영 배포·실계정 메시지·실기기 iPhone·커밋/병합은 미실행**이다. 이전 배포/QA 기록은 당시 기준으로 보존하며 AGENTS의 공유 UI·검증 규약을 유지했다.

## 최신 운영 배포 (2026-10-24) — GNB 메시지 댓글 아이콘

- 게시물 내부의 댓글 SVG를 `CommentIcon.tsx`로 분리하고 `NavIcon`의 메시지 분기에서 재사용한다. 모바일 GNB와 PC 사이드바의 메시지가 동일한 둥근 댓글 말풍선으로 표시된다. 목업·실서비스·카탈로그가 같은 구현을 사용하며 이름/경로/선택 상태/클릭 영역은 유지한다.
- `npm run check` 레이어·타입·289개 및 amd64 빌드 통과. 로컬/배포 이미지/운영 각각 Chromium320/390/1280·WebKit390에서 preview/service 두 경로의 댓글 아이콘 일치·44px 이상 클릭 영역·메시지 이동·선택 상태를 확인했다. 각8경로 검사, pageerror0, 모바일 화면 육안 확인. 실기기 검수·실메시지 발송은 하지 않았다.
- 운영 `crefans-front:gnb-comment-20261024`, 이미지 `sha256:7c51ea1c10784df0bfc03eba1f55a5a5762bea980e367d22652530e95f6d530e`. 직전 운영에서2파일 변경/1파일 추가만 반영,475런타임 파일 해시 일치. 준비중 가입 변경 제외. health/10경로 정상, 프론트 running/restart0 및 다른5컨테이너/집 SSH 규칙 보존. 복구 설정 `/opt/crefans-backup-gnb-comment-20261024`; 증거 `docs/audit/gnb-comment-deployment-20261024.json`, 실행 로그·화면 `.local/gnb-comment-deploy-20261024/`.
- 요청한 교체·배포 완료. 기존 AGENTS의 공유 UI·검증 규약 유지. 커밋/병합/푸시는 미실행이며 가입 개방의 미해결 조건은 아래 기록을 따른다.

## 최신 운영 배포 (2026-10-24) — 공통 모달 초기 포커스·닫기 아이콘

- 공통 `Dialog`를 열 때 닫기 대신 제목에 초기 포커스를 둔다. 상단 닫기는 테두리 없는44×44px 영역과28px SVG X로 변경했다. 키보드 이동 시 포커스 표시·Escape·배경 클릭·닫은 뒤 호출 버튼 복귀·본문 스크롤 잠금은 유지한다. 목업/실서비스/스튜디오/디자인 카탈로그가 같은 구현을 사용한다.
- `npm run check` 레이어·타입·289개 검사와 amd64 빌드 통과. 로컬/배포 이미지/운영 각각 Chromium320/390/1280 및 WebKit390에서 결제 상세·확인 모달·바텀시트의 초기 포커스, X/하단 닫기/배경/Escape, 다시 열기,44px 영역·28px 아이콘·테두리 없음, 키보드 이동/복귀를 확인했다. 수집 pageerror0, 모바일 화면 육안 확인. 최초 검사에서 애니메이션 중 크기 측정·네이티브 브라우저 탭 경계·WebKit Option+Tab 차이를 바로잡은 재검사와 원본 실패 로그를 보존했다.
- 운영 `crefans-front:dialog-close-20261024`, 이미지 `sha256:9764f4b57fdfc3c99aee69052b158e8fc1049d2e4c661a26f33472de8ff4ee8c`. 이전 운영에서 추출한474개 런타임 파일 중 `Primitives.tsx`/`ui.module.css` 두 파일만 교체하고 이미지 해시 대조했다. 준비중 가입 변경은 배포하지 않았다. 운영 health/10경로 정상, 프론트 running/restart0, 나머지5컨테이너 및 집 SSH 규칙 유지. `/opt/crefans-backup-dialog-close-20261024`와 이전 이미지로 복구 가능.
- 증거 `docs/audit/dialog-close-deployment-20261024.json`, 로그·브라우저 화면 `.local/dialog-close-deploy-20261024/`. 실제 iPhone·실결제 검증, 커밋/병합/푸시는 미실행. 별도 미디어 오버레이는 이번 범위에 포함하지 않는다. 기존 QA 보고서와 AGENTS의 공유 UI·증거 규약 유지. 이 UI 요청의 수정·운영 반영은 완료했으며 가입 개방 조건은 아래 기록대로 남아 있다.

## 최신 운영 배포 (2026-10-24) — 피드·메시지 화살표 버튼

- 게시물 상세의 “피드로 돌아가기” 텍스트 링크를 44×44px 원형 왼쪽 화살표로 변경했다. 게시물 없음 화면에도 동일하게 적용하고 readOnly 콘텐츠 미리보기에서는 숨긴다. 메시지의 목록 복귀와 같은 `backButton` 스타일을 재사용한다. 앞선 메시지 위 화살표 보내기·원형 뒤로가기도 함께 반영했다.
- 실제 운영 이미지 `mobile-shell-20261024`를 기준으로 소스를 추출하고 Icon.tsx/SocialPages.tsx/social.module.css 세 파일만 덧씌워 새 릴리스를 구성했다. 미완료 PASS 보류 가입 변경은 배포하지 않았다. `crefans-front:back-buttons-20261024`, 이미지 `sha256:757f7a1cc5e84c6371a649e12d0e540d5bd87d3f62578b863752ab2b3868fecc`; 런타임474파일 대조 일치, 기존 대비 정확히3파일 변경.
- 타입·관련24개 회귀·amd64 빌드 통과. 로컬/배포 이미지/운영 각각 Chromium320/390/1280 + WebKit390 네 경우에서 44px 원형·화살표·피드 복귀·없는 게시물·메시지 비활성/전송/비우기·목록 복귀를 확인했다. 각 수집 pageerror0, 운영 모바일 화면 육안 확인. 미리보기의 로컬 상태 전송만 사용했고 실제 계정 메시지는 보내지 않았다.
- 운영 health 및10경로 정상, 프론트 running/restart0. API/worker/DB/admin/proxy 컨테이너 ID와 집 SSH 지속 허용 규칙을 보존했다. 직전 이미지·`/opt/crefans-backup-back-buttons-20261024` 설정으로 복구 가능. 로컬3013 검사 컨테이너 제거. 증거 `docs/audit/back-buttons-deployment-20261024.json`, 로그·화면 `.local/back-buttons-deploy-20261024/`.
- 이번 버튼 수정·배포는 완료. 실기기 검수·커밋/병합/푸시는 미실행이며 이전 QA 보고서는 기존 소스 기준의 기록으로 유지한다. 가입 개방 관련 미결정/차단 사항은 아래와 같다. AGENTS의 공유 UI·검증·운영 SSH 규약을 유지했다.

## 최신 UI 수정 (2026-10-24) — 메시지 화살표 버튼

- 공용 `Icon`에 위/왼쪽 화살표를 추가하고 `MessagesPage`의 비행기 보내기 아이콘을 위쪽 화살표로 변경했다. 모바일 대화 목록 복귀는 44×44px 원형 배경·왼쪽 화살표·hover/키보드 포커스로 개선했다. 보내기/목록 복귀 로직은 유지하며 팬·스튜디오·목업·실서비스가 같은 컴포넌트를 사용한다. 디자인 시스템은 기존 메시지 iframe에 반영된다.
- 타입 검사와 기존 social19개 검사 통과. 로컬 목업 Chromium320/390/1280px에서 아이콘·원형44px·빈 입력 비활성·입력 후 보내기·전송 후 비우기·모바일 목록 복귀를 확인했고 수집된 pageerror는 없었다. 최초 브라우저 확인은 전송 본문과 목록 요약이 같은 문구여서 locator가 중복되어 중단됐고, 대화 본문으로 범위를 제한한 후 세 크기 모두 재확인했다.
- 증거 `docs/audit/message-buttons-20261024.json`, 수정 전후 화면·측정·로그 `.local/message-buttons-20261024/`. 운영 배포·실계정 발송·커밋은 미실행이다. 앞선 QA 보고서는 당시 소스 기준의 역사적 산출물로 유지하며 이번 아이콘 변경의 검증으로 간주하지 않는다. 기존 AGENTS의 공유 UI·증거 규약을 유지했다.

## 최신 산출물 (2026-10-24) — 기관 제출용 QA 보고서

- ISO/IEC/IEEE 29119-3:2021 공식 공개 개요와 ISTQB CTFL v4.0.1의 5.3.2 종료 보고·추적성·형상·사건 기록 항목을 조사했다. 표준 전문 대조나 공인 인증이 아닌 내부 결과보고서로 작성했으며 검토자·승인자는 미지정/미완료로 명시했다.
- `output/pdf/crefans-qa-report-20261024.html` 원본에서 15쪽 A4 PDF를 변환했다. 범위·종료 기준·환경·17계정 배정·432권한 조합·금액 대사·요구사항 추적성·상세 결과·최초 실패/조치·미실행97개·증거 해시·참고 기준을 포함한다. `output/pdf/crefans-qa-evidence-20261024.zip`에는 351개 사례 CSV, 실제 베타97개 상태 CSV, 원본 로그와 실행·소스 지문을 포함하며 비밀값/환경 파일은 제외했다.
- 로그 보완을 위해 동일 소스에서 KST10:27:24~10:28:44 순차 재실행: front check 289건, server build, 선택 backend45건, Chromium E2E17건 모두 통과. 총351건과 사례 내부432권한 검사를 별도 집계했다. front455/server219개 대상 파일은 실행 전후 동일했다. 공급사 대역/격리 DB 기준이며 실제 참가자·실기기·PG/PASS/은행·운영CDN·부하/복구 검수는 아니다.
- PDF15쪽 전체 렌더와 한글/페이지 번호/표 경계/본문 넘침, HTML 내장 폰트·로고, 시험/첨부 해시를 확인했다. 초안에서 발견한 페이지 넘침은 분할·간격 수정 후 재검증했다. 증거는 `docs/audit/qa-report-20261024.json`, 생성 스크립트와 로그는 `.local/qa-report-20261024/`에 있다.
- 제품 코드·운영 설정·배포·커밋/병합/푸시 변경 없음. 아래 PASS 보류 가입의 운영 개방 조건은 그대로 미완료다. 다음 작업은 제출 담당자의 보고서 검토·승인과 실제 베타 인수검수 준비다.

## 현재 작업 (2026-10-24) — PASS 보류 가입·역할별 베타 검수

- front/server `feat/beta-signup`에서 공용 가입 화면을 서버 `signupRequirements`에 연결했다. 이메일 가입 모드는 PASS 행/모달을 숨기고 이메일 인증·만19세 이상 확인·필수 동의 후 제출한다. 서버 정보가 없으면 PASS 필수로 처리한다. preview는 이메일 모드, 실제 서비스는 서버 설정에 따른다. 민감 콘텐츠·출금 본인확인은 유지하며 자기 확인을 인증 완료로 저장하지 않는다.
- 모집 기준은 **17계정+비로그인 환경1개**, 관리자 본인 제외16명이다. C0/C2/C10와 구독자12명(2+10), N0/A0/G0를 연결한19개 흐름과 기존 출시97개 대응을 `docs/beta-role-test-plan.md`·`docs/audit/beta-cohort-plan-20261024.json`에 저장했다.
- 검증: front check 레이어/타입/289개 통과; 서버 build·가입/인증/법률/OpenAPI23개, 관리자·금융 정책19개, 신규17계정 cohort3개 통과. cohort는 실제 격리 DB/서비스 호출로 432권한 조합·0/2/10 구독·12회 승인·20% 수수료·해지예약/만료/갱신/환불 원장을 대조했다. E2E는 기존 결제/환불/분실카드/메일/세션16개와 PASS 없는 가입→로그인1개 통과. 로컬 preview/signup도 PASS 없음/연령확인·필수값 전 제출 비활성 확인. 최초 DB정지/테스트 대기·공급사 대역 누락 실패와 보완 재검사를 모두 보존한다.
- **실제 가입은 아직 개방하지 않았다.** 가입 범위(초대 이메일/일반 이메일) 답변 대기, 법률문서 signupReady=false 및 시행일·개인정보 처리 절차 미완료 상태 유지. 실제 환경변수 전환·운영 배포·커밋/병합/푸시 없음. 대역 테스트를 실제 PASS/은행/카드·17명 실사용·97개 출시검수 통과로 해석하지 않는다.
- 증거 `docs/audit/beta-signup-20261024.json`, 양쪽 `.local/beta-signup-20261024/`. 다음은 가입 범위 및 시행 문서/처리 절차 정합화 후 실제 설정·운영 검증이다. 기존 모바일 GNB 운영 배포 상태는 아래 기록과 같다.


다른 에이전트가 이 파일만 읽고 이어받을 수 있도록 유지한다. 규약은 `AGENTS.md`.

## 운영 SSH 결정 (2026-10-24)

- 사용자 요청으로 현재 집 공인 IPv4 한 개(/32)의 TCP 22를 AWS `crefans-beta`에서 지속 허용했다. 규칙 `sgr-0042cbcbcd1b74b35`은 임시 배포 규칙이 아니므로 배포 정리 시 삭제하지 않는다. 기존 웹·관리 접속 규칙은 보존했다.
- AWS 규칙 재조회·기존 키/호스트 검증을 사용하는 SSH 접속 성공 확인. 정확한 주소는 server `.local/home-ssh-20261024/verification.json`에 보관한다. 공개 증거: server `docs/home-ssh-access-20261024.json`.
- 크레팬스 규칙 삭제 자동화는 발견되지 않았다. 별개 NHN 엔씨솔루션의 한 달 SSH 종료 일정은 유지했다. 이후 집 IP가 달라지면 그 시점에 새 주소를 확인해야 한다.

## 최신 운영 배포 (2026-10-24) — 짧은 본문에서 모바일 GNB 위치 유지

- 사용자 스크린샷의 GNB 아래 빈 공간/상향 이동에 대응하여 모바일 팬 셸을 `100dvh` 안의 본문 스크롤 영역+하단 메뉴 행으로 변경했다. 기존 `fixed` GNB를 일반 flex 마지막 행으로 두고 짧은 콘텐츠도 화면 끝에 유지한다. 목업 안내 띠를 화면 높이에 포함하고 경로 변경 시 본문 스크롤 초기화, 모달 열림 중 본문 잠금을 적용했다. 메시지방의 고정 최소 높이를 가용 높이로 교체했다. `/preview`·`/service` 공유 구조이며 PC·인증·랜딩·스튜디오 배치는 유지한다.
- WebKit 공식 이슈에서 iOS 주소창/키보드 변화 후 fixed 요소 위치 이상 사례를 확인했다. 사용자 기기의 동일 원인을 확정하지는 않았고, JS 오프셋 보정 대신 해당 레이아웃 의존성을 제거했다. 기존 운영의 짧은 알림에서도 문서가 viewport보다26px 길어 새 회귀 검사에 실패하는 대조 증거를 남겼다. 이는 실제 iPhone 합성/주소창 문제 재현을 뜻하지 않는다.
- `npm run check` 레이어·타입·288개 검사 통과. 로컬·배포 이미지·운영에서 각각 PC Chromium/모바일 Chromium/모바일 WebKit의11개 E2E 통과, 데스크톱에서 모바일 전용1개는 의도적으로 제외. 짧은 알림/내프로필·긴 피드·320/390/767px 및 높이 변화·경로 초기화·대화 입력/복귀·모달 스크롤 잠금·기존 갤러리 상호작용을 확인했다. 첫 WebKit 검사에서 지원하지 않는 wheel 입력을 제외하고 스크롤/크기 검사를 유지해 통과했다.
- 운영 프론트 `crefans-front:mobile-shell-20261024` (`sha256:ee3a8489953f3a0d262c03076d2f868cbbaacd5d87fa4295b0a05480d2fa7fa5`). amd64 빌드 성공, 런타임474파일 소스일치·이전 운영 대비7파일 변경. 격리3013 검사 컨테이너 제거. health/9경로 정상, frontend running/restart0, 나머지5컨테이너 ID 보존. 집 SSH 규칙 변경 없음. 직전 이미지와 `/opt/crefans-backup-mobile-shell-20261024` 설정 보존.
- 운영 모바일390×844에서 문서 높이·GNB 하단이 모두844px임을 확인했다. 실제 서비스 빈 피드/로그인 필요 알림도 동일. PC768/1280 메시지·알림4경우는 직전 운영 측정과 완전히 동일. 수집된 콘솔 오류 없음. 물리 iPhone의 브라우저 주소창/소프트웨어 키보드는 직접 검증하지 않았다. 실제 계정/결제 변경·커밋/병합/푸시 없음.
- 증거 `docs/audit/mobile-shell-20261024.json`, 개발 로그 `.local/mobile-shell-20261024/`, 빌드·배포·운영 화면 `.local/mobile-shell-deploy-20261024/`. 디자인 시스템/화면 문서와 manifest를 검토 후 docs:record/check:docs로 대조한다. 기존 AGENTS의 공유 UI·증거 규약 유지. 이 요청의 구현/배포 작업은 완료했다.

## 직전 운영 배포 (2026-10-24) — 모바일 메시지·알림 목록

- 사용자 요청으로 목록 패딩16px·전폭 배경/구분선을 `https://beta.crefans.com`에 반영했다. 프론트 이미지 `crefans-front:mobile-inbox-20261024` (`sha256:d0c408e9fe47d584e91b40adbb8402e930e7a0ad7bb0d90644f21bd8c1e45f51`). 직전 운영 대비 런타임 변경은 `social.module.css` 한 파일이다.
- amd64 빌드/타입 검사 성공. 이미지 런타임474파일이 검증 소스와 일치. 빌드 이미지390/768/1280px 두 페이지6경우·27항목을 실측했고, 운영320/390/767/768/1280px 두 페이지10경우·45항목도 로컬 확인값과 동일하다. PC768/1280px은 배포 직전 운영 측정값과 완전히 같음을 확인했다.
- 운영 대화 진입/목록 복귀·알림 모두 읽음 정상, 수집된 콘솔 오류 없음. 첫1280px 메시지 측정은 로딩 중 DOM 미완성으로 중단되어 제목 표시 후 이어서 측정했다. 제품 변경이나 HTTP 장애는 없었다. 운영 API 상태·주요9경로 정상, 프론트 재시작0회이며 API/DB/worker/admin/proxy는 유지했다. 집 SSH 지속 허용 규칙은 변경하지 않았다.
- 직전 이미지와 `/opt/crefans-backup-mobile-inbox-20261024` 복구 설정 보존. 증거 `docs/audit/mobile-inbox-deployment-20261024.json`, 로그·화면 `.local/mobile-inbox-deploy-20261024/`. CSS 변경 범위에 맞춰 브라우저 검사로 검증했으며 실계정 목록/실기기 검증·커밋/병합/푸시는 하지 않았다.

## 최신 UI 수정 (2026-10-24) — 모바일 메시지·알림 목록 여백

- 공유 `social.module.css`에서 모바일 메시지·알림 항목의 내부 패딩을 모두16px, 아바타/본문 간격을12px로 통일했다. 배경과 하단 구분선은 화면 양끝까지 확장하고 제목·검색·필터는 기존 본문 여백을 유지한다. 메시지 목록에도 같은 전폭 구분선을 적용했다. 메시지방 내부는 기존 좌우16px 유지.
- 메시지·알림 모바일 기준을 서비스 셸과 같은767px 이하로 맞춰 701~767px에서 메시지 목록만 PC 분할 배치가 되던 불일치를 없앴다. 게시물의 별도700px 규칙과 PC768px 이상 스타일은 보존했다. `/preview`·`/service`에서 동일 표시 컴포넌트/CSS 사용.
- 로컬 브라우저320/390/700/701/767px 두 페이지10경우·45항목의 좌우0/화면폭·패딩16px·구분선1px·가로 넘침 없음을 실측했다. PC768/1280px 두 페이지4경우의 위치·크기·패딩·배경·구분선이 수정 전 JSON과 동일하다. 수정 전 모바일8경우는 같은 합격 조건에서 실패하는 대조 확인. 대화 진입/복귀·검색·알림 모두 읽음/댓글 필터도 확인.
- 증거 `docs/audit/mobile-inbox-spacing-20261024.json`, 화면·측정·검증 명령 `.local/mobile-inbox-spacing-20261024/`. CSS 변경이므로 별도 단위 테스트는 추가하지 않았다. 아래 운영 배포까지 완료했다. 실기기 검증·커밋은 미실행.

## 최신 UI 작업 (2026-10-24) — 프로필 사진·배경 확대

- 공유 `ProfileHeader`에서 프로필 사진과 배경사진을 누르면 전체 화면 미디어 오버레이를 연다. 크리에이터 프로필과 내 프로필, `/preview`·`/service`에 같은 표시 컴포넌트를 사용한다. 제공된 이미지 원본을 비율 유지로 표시하며, 사진 없음/로딩 실패에는 확대 진입을 제공하지 않는다. 새 이미지로 교체되면 다시 진입 가능하다.
- 기존 `PostOverlay`의 미디어·스와이프·이전/다음·닫기 화면을 `components/crefans/MediaOverlay.tsx`로 분리했다. 게시물은 상세 패널/확대 버튼을 슬롯으로 주입하고 프로필은 사진만 표시한다. CSS도 같은 규칙을 공유한다. 공용 오버레이에서 Escape·포커스 순환/복원·본문 스크롤 잠금을 처리한다. 키보드로 댓글 입력 중에는 좌우 화살표로 미디어가 넘어가지 않는다.
- 디자인 시스템 서비스 컴포넌트에 동일 `ProfileHeader`의 사진 있음/없음 예시를 추가했다. 아바타/배경 클릭 영역과 팔로우·설정 버튼을 분리했다.
- 검증: `npm run check` 288개 통과. 기존 갤러리와 새 프로필 시나리오를 PC Chromium·모바일 Chromium·모바일 WebKit에서 총6개 검사해 통과. 원본 URL·상세 패널 없음·44px 닫기·Tab/Escape·스크롤/포커스 복원·내 프로필 및 기존 갤러리 드래그/확대/패널/댓글 보존 확인. WebKit의 클릭 시 포커스 미획득을 실제로 발견해 진입 버튼 포커스를 명시한 뒤 재검사했다.
- 개발 증거 `docs/audit/profile-media-20261024.json`, 화면·로그 `.local/profile-media-20261024/`. 아래 운영 배포까지 완료했다. 실제 iPhone 기기와 실계정 사진 변경은 미검증이며 커밋/병합/푸시는 하지 않았다.

## 직전 운영 배포 (2026-10-24) — 프로필 사진·배경 확대

- 사용자 요청으로 공용 미디어 뷰어와 프로필 확대를 `https://beta.crefans.com`에 배포했다. 이미지 `crefans-front:profile-media-20261024` (`sha256:156e90d919a522761021a822a02f578fdc0276937b7b0510259ca8adeece51cc`). 목업·실서비스 공용 표시 컴포넌트에 적용했다.
- 기존 코드·단위 검사288개 이후 대상 소스9파일 해시가 같아 증거 유효성을 확인했다. amd64 운영 빌드 성공, 이미지 런타임474파일이 로컬 소스와 일치하고 직전 운영 대비6파일 변경. 빌드 이미지·운영에서 각각 PC Chromium/모바일 Chromium/모바일 WebKit 총6개 E2E 통과. 프로필·배경/내 프로필 확대·닫기·포커스 복원 및 기존 게시물 갤러리 드래그·패널·확대·댓글을 확인했다.
- 운영 모바일390×844에서 모카 프로필/배경 원본 표시·비율 유지·44px 닫기·스크롤 잠금/복귀 확인, 수집된 콘솔 오류 없음. API 상태·주요9경로 응답 정상, 프론트 재시작0회. API/DB/worker/admin/proxy 컨테이너를 유지하고 집 SSH 지속 허용 규칙은 변경하지 않았다.
- 직전 이미지와 `/opt/crefans-backup-profile-media-20261024` 복구 설정 보존. 증거 `docs/audit/profile-media-deployment-20261024.json`, 로그·화면 `.local/profile-media-deploy-20261024/`. 실기기 iPhone 및 실계정 사진 수정은 미검증. 기능 브랜치의 미커밋 상태를 유지한다.

## 직전 운영 배포 (2026-10-24) — 모바일 GNB·갤러리·칩

- 사용자 배포 요청으로 GNB 아이콘 전용/56×48px, 갤러리 우하단 확대·축소/패널 복원, 모바일 칩 첫 여백16px/전폭 스크롤을 함께 배포했다. `https://beta.crefans.com`, 프론트 이미지 `crefans-front:mobile-ui-20261024` (`sha256:bfc045fcd9776fd5767f21c0efcc70b696c2cde611a6343144bd85f5decb362c`).
- 검증: 코드·타입·단위 검사286개, amd64 운영 빌드 성공. 이미지 런타임473파일이 로컬 검증 소스와 일치하고 직전 운영 대비7파일 변경. 빌드 이미지와 운영에서 각각 PC Chromium·모바일 Chromium·모바일 WebKit 갤러리 E2E3개 통과. 운영320/390/767px GNB56×48px·텍스트 없음·칩16px·가로 넘침 없음, 768px PC 전환 확인. 실제 `/service/feed`도 정상 조회·아이콘 메뉴 확인.
- 첫 빌드 이미지 검사에서 애니메이션 중 서로 다른 프레임의 버튼/부모 좌표를 비교해 1건 실패했다. 두 좌표를 같은 시점에 측정하고 기존10px±1px 기준을 기다리도록 테스트만 수정한 후3개 재검사 및 운영3개 모두 통과했다. 최초 실패 로그·trace도 보존한다.
- 운영 API 상태·9경로 응답 정상, 프론트 재시작0회. API/DB/worker/admin/proxy 컨테이너 유지. 사용자 집 SSH 지속 허용 규칙은 변경하지 않았다. 직전 이미지와 `/opt/crefans-backup-mobile-ui-20261024` 복구 설정 보존.
- 증거 `docs/audit/mobile-ui-deployment-20261024.json`, 로그·화면 `.local/mobile-ui-deploy-20261024/`. 실제 iPhone 기기 검증·실계정/결제 변경은 하지 않았다. 기능 브랜치는 미커밋 상태이며 병합·푸시는 수행하지 않았다.

## 최신 UI 수정 (2026-10-24) — 모바일 GNB 아이콘

- 공유 `ServiceShell`의 모바일 하단 메뉴에서 표시 텍스트를 제거했다. 다섯 링크 모두 동일한 56×48px 터치 영역이며 `aria-label`로 메뉴 이름·읽지 않은 알림 수를 제공한다. 선택 강조, 프로필 사진/기본 아바타, 알림 점과 PC 사이드바는 유지한다.
- 검증: 타입 검사 통과. 실제 브라우저 320/390/767px에서 아이콘만 표시·56×48px·가로 넘침 없음, 768/1280px에서 PC 전환 확인. 홈·내 프로필·탐색 이동 및 현재 메뉴 표시 확인. `/service/feed` 비로그인 메뉴도 같은 크기·기본 아바타를 확인했으나 로컬 API 연결 오류가 있어 데이터 기능 검증은 제외했다.
- 증거 `docs/audit/mobile-gnb-icons-20261024.json`, 화면·로그 `.local/mobile-gnb-icons-20261024/`. 당시에는 로컬 범위만 검증했다. 이후 위 통합 검사와 운영 배포 완료; 실기기 검증·커밋은 미실행.

## 최신 UI 수정 (2026-10-24) — 모바일 칩 시작 여백

- 공용 `ChipRow`의 첫 칩이 초기 스냅 때문에 16px 자동 스크롤되어 화면 왼쪽에 붙는 현상을 실측했다. `scroll-padding-inline:16px`을 기존 내부 패딩과 맞춰 첫 칩을 본문 16px에 정렬하고, 스크롤 뷰포트는 디바이스 양 끝까지 유지했다. 모바일 기준은 서비스 셸과 같은 767px 이하로 맞췄다.
- 알림의 별도 `padding`이 공용 좌우 여백을 덮어쓰던 것도 `padding-block`으로 제한했다. 탐색·알림·디자인 시스템은 같은 ChipRow 사용.
- 검증: 기존 ChipRow 단위 검사 2개 통과, 실브라우저 320/390/701/767px 첫 칩16px·전체 너비, 768/1280px PC 유지, 알림 첫 칩16px, 마우스 드래그 후 양끝 노출·선택 유지 확인. 증거 `docs/audit/chip-row-inset-20261024.json`, 화면·실측 `.local/chip-row-inset-20261024/`. CSS 수정 범위만 검증했고 실기기 iPhone은 확인하지 않았다.
- 위 모바일 UI 통합 배포에 포함했다. 미커밋 상태는 유지한다.

## 현재 작업 (2026-10-24) — 모바일 미디어 확대·축소

- 최신 위치 수정: 확대·축소 아이콘을 갤러리 내부 오른쪽 아래(기본 10px, 확대 시 안전 여백 반영)로 옮겼다. 버튼 누름을 미디어 드래그로 처리하지 않는다. 상세 전체 모드에서는 갤러리와 함께 숨겨지며 기존 손잡이로 미디어를 다시 표시한다.
- 위치 수정 검증: 기본/확대의 오른쪽·아래 간격 10px 확인. 혼합 미디어의 확대 시 가로 밀림을 재현한 후 모바일 `overflow:clip`으로 수정, PC/모바일 Chromium·모바일 WebKit 최종 E2E 3개 통과. 코드·단위 검사 286개는 마지막 CSS 한 줄 수정 전에 통과했고 그 CSS는 최종 E2E로 확인했다. 증거 `docs/audit/mobile-gallery-corner-20261024.json`, 로그·화면 `.local/mobile-gallery-corner-20261024/`. 이후 위 모바일 UI 통합 배포에 포함했다.
- 같은 `feat/mobile-gallery-sheet`에서 공유 `PostOverlay`에 모바일 전용 확대·축소 아이콘 버튼을 추가했다. 확대 시 상세 패널을 숨겨 미디어 영역을 브라우저 표시 높이 100%로 사용하고, 원본 비율은 유지한다. 축소하면 직전 3단계 패널 높이로 복원한다. 브라우저 도구막대를 숨기는 OS 전체 화면 기능은 아니다.
- 패널·동영상 DOM을 보존하여 미디어 위치와 댓글 초안을 유지한다. 확대 중에도 미디어 넘김·닫기 가능, 닫고 다시 열면 기본 모드다. PC는 기존 좌우 배치와 버튼 숨김 유지. 공용 아이콘과 디자인 시스템의 동일 PostCard 예시에도 반영했다.
- 검증: `npm run check` 286개 통과, Chromium PC/모바일·WebKit 모바일 E2E 3개 통과. 모카 실제 브라우저 확대/복원·오류 없음, 320/390/767px 전체 높이와 768/1280px PC 전환·가로 넘침 없음 확인. 실기기 iPhone Safari는 미검증.
- 증거 `docs/audit/mobile-gallery-expand-20261024.json`, 로그·화면 `.local/mobile-gallery-expand-20261024/`. 이후 위 모바일 UI 통합 배포에 포함했다. 커밋은 하지 않았다.

## 직전 운영 기준 (2026-10-24) — 모바일 갤러리 상세 패널

- 작업 브랜치 `feat/mobile-gallery-sheet`는 병합 완료된 원격 `dev`에서 생성했다. `/preview`와 `/service`가 공유하는 `PostOverlay`를 변경했다.
- 767px 이하에서 손잡이를 위아래로 드래그하면 기본(미디어 56%), 미디어 축소(22%), 상세 전체(0%) 세 위치 중 가까운 곳에 고정한다. 처음 열면 기본이며, 이전/다음 게시물 이동 시 높이는 유지한다. 손잡이 클릭·위/아래 방향키·Home/End도 지원한다.
- 본문·댓글은 별도 스크롤 영역으로 유지하고, 손잡이에만 Pointer Capture와 `touch-action:none`을 적용했다. 가로 제스처·다른 포인터는 높이를 바꾸지 않으며 취소/창 크기 변경은 마지막 고정 위치로 복원한다. 전체 높이에서도 닫기 버튼은 계속 노출한다. PC는 좌우 레이아웃 유지.
- 검증 완료: `npm run check` 285개 통과. Playwright PC Chromium·모바일 Chromium·모바일 WebKit 3개 통과. 포인터 추종·세 위치·경계·취소·가로 입력·PC 제외·클릭 중복 방지·키보드, 미디어 넘김·댓글 스크롤·재진입 초기화를 확인했다. Chromium은 실제 합성 터치 이벤트, WebKit은 포인터와 입력란 포커스에 따른 스크롤을 검사했다. iPhone 실기 Safari 검증은 하지 않았다. 디자인 시스템에서도 같은 PostCard로 확인 가능하다.
- 운영 배포 완료: `https://beta.crefans.com`, 프론트 이미지 `crefans-front:mobile-gallery-sheet-20261024` (`sha256:3d3922a2a4e315014cb464554c050c781f7a1d475686f0f4329eb26eac2a1e0a`). amd64 빌드 후 런타임 473파일 일치, 빌드 이미지·운영 각각 Playwright 3개 통과, 운영 API 상태·9경로 응답·모카 모바일 세 단계 드래그를 확인했다. API/DB/worker/admin/proxy 컨테이너는 유지했고 임시 SSH 규칙은 제거했다.
- 검증 증거: `docs/audit/mobile-gallery-sheet-20261024.json`, 배포 증거 `docs/audit/mobile-gallery-deployment-20261024.json`. 상세 로그·화면은 `.local/mobile-gallery-sheet-20261024/`, `.local/mobile-gallery-deploy-20261024/`. 이전 14px 이미지와 복구 설정 `/opt/crefans-backup-mobile-gallery-sheet-20261024` 유지. 현재 기능 브랜치 변경은 미커밋 상태이며 병합·푸시는 수행하지 않았다.

## 직전 운영 기준 (2026-10-24) — 모바일 14px 채택

- 사용자 확인으로 모바일 14px 버전을 채택했다. 767px 이하 팬 서비스·랜딩·공용 UI·디자인 카탈로그의 작은 글자를 14px 기준으로 표시하고 768px 이상은 기존 크기를 유지한다. 목업과 실제 서비스는 같은 CSS를 사용한다.
- 이 시점의 운영 프론트는 `crefans-front:mobile-14px-20261024`였다. 이후 위 모바일 갤러리 배포가 대체했다. 당시 브랜치 통합은 배포된 화면을 바꾸지 않았다. API/DB/admin도 변경하지 않는다. 이전 이미지 `crefans-front:membership-identity-20261024`와 복구 설정 `/opt/crefans-backup-mobile-14px-20261024`는 유지한다.
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

## 2026-10-31 프로필·배경 사진 변경 (미배포)
- 사용자 요청: 내 프로필 페이지에서 프로필 사진·배경 사진 수정, 시안에서 색은 빼고. 카메라 배지가 아바타 원형 영역(overflow hidden)에 잘리지 않게 바깥에 둠.
- 서버 7aa2568: `PUT me/profile/photos`(본인 업로드 이미지만, null=삭제), 원본은 members.picture·user_profiles.cover(신규 컬럼, 마이그레이션 20261031230000_profile_cover), 크리에이터면 creators.avatar/cover 동기화. 사용 중인 사진만 공개 조회. 테스트 tests/platform-profile-photos.test.cjs(대조 검사 포함).
- 프론트 df17378: ProfilePhotoDialog + ProfileHeader onEditPhotos, viewer.cover, accountActions.updatePhotos(실서비스·목업). 캡처 crefans_front/.local/profile-photo-20261031/.
- 남은 일: 운영 배포(사용자 승인 필요, 다른 세션의 미커밋 변경이 같은 파일에 있어 배포 기준선 확인 필수), 로그인 상태 실서비스 업로드 확인.
- 2026-10-31 22:5x KST 운영 배포 `profile-photo-20261031`(API·worker·front, admin 유지). 기준선 API charge-expiry·front action-dialog 위에 이 변경만 얹음(배포 직전 BASELINE OK). DB 백업 후 마이그레이션 20261031230000_profile_cover 적용. 추가 반영: 배경 없을 때 연회색(#dde1e7)+흰 로고(27be9e7), 삭제 버튼 항상 표시·없으면 비활성(8665df1). 운영 /preview/me PC·모바일 동작 확인, 이미지 보존 정리(--protect charge-expiry/action-dialog). 증거 crefans_front/.local/profile-photo-deploy-20261031/. 미확인: 로그인한 실계정 업로드.
- 2026-10-31 23:0x KST 운영 배포 `nobeta-20261031`(front만, 기준 profile-photo). 사용자 /ask-me 결정: 가이드·소개서·이벤트 안내를 계약서(오픈 서비스) 기준으로 쓰고 베타·테스트 문구 제거, 미개시 결제·출금·초대제는 '결제·출금 개시 전'·'현재 기간' 한 줄로만, 오픈베타 감사 이벤트 → '오픈 기념 원년멤버 이벤트'(대상 '참여 확정 회원', 혜택·주소 beta-first 유지). 커밋 7fdedbb(이벤트·FAQ·서비스 이용안내·배지 툴팁). 운영 이벤트·FAQ·이용안내 5개 화면 베타 문구 0건 확인. 증거 .local/nobeta-deploy-20261031/.
- 2026-11-01 레퍼럴 프론트 1단계 커밋 659e630: ?ref= 코드 세션 보관→가입 요청에 referralCode 전달, 콩 지갑 '친구 초대' 카드(링크 복사·집계·보상 조건 고지, /me/referral 404면 숨김). 팬 출금 화면(/beans/withdraw: 콩 출금+정산 계좌+출금 PIN 재사용)은 진행 중. 미배포.
- 2026-11-01 팬 콩 출금 화면 커밋(위 커밋): /beans/withdraw = 콩 출금+정산 계좌+출금 PIN(embedded). 지갑 친구 초대 카드의 '보상 콩 출금하기'(받은 보상>0)에서 진입. 미확인: 실제 비크리에이터 보상 계정의 /service 동작, 목업은 크리에이터 재무 목업을 재사용해 미수금·탈퇴 준비 안내가 보임. 미배포.
- 2026-11-01 운영 배포 `referral-20261101`(API·worker·front·admin). 기준 API profile-photo·front nobeta·admin handle-sync. 1차 시도는 배포 스크립트 내 파이썬 문법 오류(빈 for)로 자동 롤백(이전 이미지 복구, 마이그레이션 3개는 추가 테이블만이라 유지), 수정·내장 파이썬 블록 컴파일 검사 후 2차 성공. DB 백업 후 마이그레이션 referrals·referral_hold·platform_settings, platform_settings 0행(스위치 꺼짐) 확인. 운영: /me/referral·/admin/referrals 비로그인 401, /service/beans/withdraw·/console/referrals 200, 목업 초대 카드·출금 화면 확인, 이미지 보존 정리. 미확인: 운영자 로그인 상태 콘솔 레퍼럴 화면, 실제 보상 계정 출금. 증거 crefans_front/.local/referral-deploy-20261101/.

## 2026-11-01 레퍼럴 디자인 운영 배포 완료
- 릴리스 `referral-polish-20261101`: 운영 기준 `referral-20261101`의 불변 소스에 프론트 3개·콘솔 2개 파일만 반영. 초대 카드/관리 표 디자인과 복사 성공 하단 스낵바 적용. API·worker·DB·proxy 컨테이너 ID 유지, 정책 활성화/마이그레이션 없음.
- 09:40 KST 배포 명령 exit 0. 실제 운영 이미지 PC Chromium·모바일 WebKit 10건 PASS(API/clipboard 대역); 운영 `/preview/beans` 2건 PASS(clipboard 대역). 운영 프론트·콘솔 정적 파일 SHA-256과 배포 이미지 파일 일치. 실제 로그인한 콘솔/보상 지급 검증은 이번 범위 아님.
- 빌드 2건 exit 0. 로컬/운영 최신 3개 이미지 및 직전 롤백 보존 정리 완료. 테스트 도구 중복 로드·자산 URL 인코딩 경로·검사 중 임시컨테이너 삭제에 따른 초기 검증 실패는 실행 방식 수정 후 재검증, 제품 수정 없음.
- 증거: `/Users/ethan/repository/crefans_front/.local/referral-polish-deploy-20261101/verification.json`, `deployment-command.json`, `image-ui-checks.json`, `production-front.log`, `served-assets.json`, `runtime-after.json`, `retention-*-apply.json`. 소스 manifest와 hash는 같은 폴더.
- 기존 미커밋 변경 보존. 앞선 문서 검사에서 확인된 referral/profile API 설명 및 문서 계약 미갱신 문제는 남아 있으며 문서 검사 통과로 보고하지 않음.

## 2026-11-01 2차 인증 03안·붙여넣기 자동 제출 운영 배포
- 릴리스 `crefans-admin:totp-polish-20261101`. 운영 기준 referral-polish-20261101의 불변 소스 위에 login/page.tsx와 해당 CSS만 반영, 이전 검증 SHA 일치 확인. admin만 교체했고 frontend/API/worker/database/proxy ID·이미지 유지. 정책·DB 변경 없음.
- 빌드 exit0. 실제 운영용 이미지 PC Chromium·iPhone13 WebKit 6건, 운영 admin.crefans.com 화면 같은 6건 PASS. 인증 API 응답·붙여넣기는 대역이며 실제 운영 계정 로그인/물리 iOS 클립보드 검증은 아님. 빈/5자리/7자리/문자혼합 요청 차단, 연속 붙여넣기 중복 방지, 오류 후 재시도·복구 코드·429 검증. 운영 스크린샷 육안 확인, 정적 파일 SHA256 배포 이미지와 일치.
- 서버 health 및 로그인 HTTP200, admin restart0/OOM없음. 직전 롤백 포함 최신3개 이미지 로컬·운영 보존 정리. 기존 미커밋 변경 보존.
- 증거 `/Users/ethan/repository/crefans_front/.local/totp-polish-deploy-20261101/verification.json` 및 builds/source-delta/deployment-command/runtime-after/served-assets/retention JSON. UI 명령·시각·로그·캡처는 admin `.local/totp-polish-20261101/`의 image-ui-check.json, production-ui-check.json과 *results. 다음: 실제 운영자 사용 피드백 확인.

## 2026-11-01 2차 인증 간소화 운영 배포 완료
- `crefans-admin:totp-clean-20261101`: 방패52px, 푸터/붙여넣기 설명 제거. 자동제출 함수 유지. admin만 재생성, 다른5컨테이너 보존.
- 최초 운영 이미지 검사에서 SVG 공통20px 규칙이 속성을 덮어쓰는 문제 검출(PC/모바일 실패). `.login-security-icon svg`에52px 명시 후 재빌드 및 같은 검사2건 PASS. 초기 실패로그 보존. 빌드 exit0, 운영 정적자산 SHA256 일치, 실제 운영 화면 PC/모바일2건 PASS 및 캡처 확인(인증응답 대역, 실계정 인증 아님).
- 증거 front `.local/totp-clean-deploy-20261101/` source-delta/builds/deployment-command/runtime-after/served-assets/verification.json, admin `.local/totp-clean-20261101/` image-ui-first.log/image-ui.log/production.log 및 스크린샷. 로컬·운영 최신3이미지/직전롤백 보존 정리. 기존 AGENTS 유지·미커밋 변경 보존. 요청 변경 운영반영 완료.

## 2026-11-01 iPhone OTP 기본 입력·6자리 자동제출 운영 배포
- `crefans-admin:totp-native-20261101`, 운영 기준 totp-clean 위 login/page.tsx·전용 CSS만 반영. 기존 opacity0 입력+가상6칸을 제거하고 숫자가 직접 보이는 단일 native text input으로 교체. user-select:text/touch-callout:default, numeric 키보드·one-time-code 유지. 시스템 메뉴 노출을 JS로 강제하거나 클립보드를 상시 읽지 않음.
- 타이핑/자동완성/붙여넣기 6자리 완료 시 자동1회 요청. pending ref와 마지막 자동전송값으로 중복·오류 후 자동반복 방지. 명시적 다시 붙여넣기/제출은 재시도 가능, 6자리 미만으로 수정 시 자동값 초기화. 복구코드는 수동. AGENTS 규칙 갱신.
- 검증: check 타입·단위11 PASS, 로컬·운영용 이미지·운영 URL PC Chromium/iPhone13 WebKit 각8건 PASS(인증API·paste 대역). 5자리 무요청/6번째 입력1회, 재붙여넣기, 기본 input opacity1/선택 범위, 오류·429·복구, 가로넘침 검사. 운영 정적자산 SHA256 일치. 물리 iPhone의 OS 붙여넣기 메뉴는 미검증이며 탭1회에 메뉴가 열림을 보장하지 않음.
- Apple one-time-code 문서 및 WebKit invisible-input 이슈302876 조사(2026-11-01), 적용 판단은 admin `.local/totp-native-20261101/evidence.json`. 로컬 테스트의 프리패치가 미실행 API 3001에 ECONNREFUSED를 남겼지만 대역 시나리오는 통과, 운영 실제인증 검증으로 확대하지 않음.
- 배포 증거 front `.local/totp-native-deploy-20261101/verification.json`, source-delta/builds/deployment-command/runtime-after/served-assets. admin `.local/totp-native-20261101/` check-final.log/ui-final.log/image-ui.log/production.log 및 캡처. admin만 교체·나머지5컨테이너 유지, 최신3 이미지/롤백 보존 정리. 기존 변경 보존·tsconfig 개발서버 부수변경만 복원. 다음은 사용자 실기기 메뉴 확인.

## 2026-11-01 광고상품 폼 운영 배포 완료
- 릴리스 `crefans-admin:ad-form-20261101`, 운영 totp-native 기준에서 Advertising.tsx 한 파일만 반영. 광고 지면 select(주목할 크리에이터) 및 스튜디오에 광고상품으로 판매 개시 문구·설명. visible/onSale 별도 계약 유지.
- 빌드 exit0, 운영 이미지 PC/모바일4건 및 운영 URL4건 PASS(API 대역). 지면 옵션1개·저장 featured_creator·등록/수정/삭제·조회권한 검증, 운영 캡처 점검. 실제 운영 상품 생성/수정 없음. 정적자산 SHA256 이미지 일치, admin 재시작0/OOM없음, 다른5컨테이너 유지. 최신3이미지/직전롤백 보존 정리.
- 증거 front `.local/ad-form-deploy-20261101/verification.json`, source-delta/builds/deployment-command/runtime-after/served-assets/retention JSON. admin `.local/advertising-form-20261101/` image-ui-check.json·image-ui.log·production.log·캡처. 기존 AGENTS 규약·미커밋 변경 유지, e2e/advertising.spec.ts는 새 문구·지면검증으로 갱신. 요청 배포 완료.

## 2026-11-01 지갑 친구 초대 전용 페이지 운영 배포
- `crefans-front:referral-page-20261101`: 지갑에 보낸 후원과 같은 친구 초대 진입 타일을 배치하고 `/preview/beans/referral`, `/service/beans/referral` 전용 페이지로 기존 초대 카드 이동. 페이지 제목·지갑 뒤로가기 적용, 기존 기능 노출·로그인 조건 유지.
- 운영 불변 기준 referral-polish 소스에 런타임6파일만 반영. 프론트만 교체, API·worker·admin·DB·proxy 유지. 빌드/배포 exit0, 타입·레이어·단위431건 PASS, 운영 이미지 및 운영 URL PC/모바일 각2건 PASS(목업·clipboard 대역). 진입·복사 성공/실패·뒤로가기 확인, 운영 정적자산 SHA256 일치. 실계정 보상 지급은 검증 범위 아님.
- check:docs는 기존 referral API 설명/문서 인벤토리·계약 누락으로 실패, 미해결 상태 유지. 기존 미커밋 작업 보존. 최신3이미지 및 직전 롤백 보존 정리 완료.
- 증거 `.local/referral-page-deploy-20261101/verification.json`, source-delta/front-source/builds/deployment-command/runtime-after/served-assets, production.log·캡처. UI 출력 경로가 직전 배포 폴더를 가리켜 이번 실행 결과를 현재 폴더로 복사하고 설정 경로 수정함.

## 2026-11-01 친구 초대 디자인 시안 5종
- 사용자 요청은 심플한 비교 시안. 기존 ReferralCard 구성 확인 후 built-in imagegen으로 01기본/02링크강조/03보상요약/04단계안내/05미니멀리스트 5개 생성·인라인 표시·시각 확인. 런타임 변경/배포 없음. 추천 02, 다음은 사용자 선택 후 실제 동적 보상값·전체 약관·기존 스낵바 유지하여 구현.
- 이미지 원본: ~/.codex/generated_images/01a1868d-8a63-7433-8e79-7b033059a555/exec-{8ada58a5-3368-4379-8eaf-01327fe92565,a984a21e-443e-41c6-a1e0-e2b8c1b2d571,64570c45-4257-4506-8f07-150806289a61,7af335eb-07b1-4519-b9f5-3ceea8415389,24589abc-9995-4d40-8052-3b5757b9cd87}.png (01~05 순서). 시안의 요약 안내는 최종 정책문서 아님; 03의 0콩은 생성된 예시이며 실제 보상 설정으로 대체해야 함.

## 2026-11-01 친구 초대 05 미니멀 디자인 운영 배포 완료
- 사용자 선택 5번 적용. 카드 테두리·컬러 배경 제거, 보상 제목 옆 기존 콩 이미지, 복사 링크/버튼, 현황3개 세로 라벨·숫자 목록과 얇은 구분선. 실제 rewardPerInvite/monthlyCap/holdDays 유지. 기존 유의사항4개 원문을 byte-for-byte 비교 확인; 서버 referrals/bean-policy/beta-policy 값 대조. 정책 변경 없음.
- `crefans-front:referral-minimal-20261101`: 직전 운영 referral-page 불변 소스에서 ReferralCard.tsx·referral.module.css만 반영. frontend만 교체, 나머지 컨테이너 유지. npm run check exit0, 빌드/배포 exit0; 운영 이미지 PC·모바일2건 및 운영 preview URL2건 PASS(clipboard 대역), 복사 성공·실패·스낵바·뒤로가기·가로넘침·유의사항 확인. 실제 계정 보상지급 검증 아님. 운영 파일 SHA256 일치.
- 증거 `.local/referral-minimal-deploy-20261101/verification.json`, source-delta/front-source/builds/deployment-command/runtime-after/served-assets, check.log·production.log·PC/모바일 캡처. 기존 미커밋 변경 유지. 이미지 정리 첫 계획은 검증용 임시 컨테이너 삭제와 경합해 실패; 검증 종료 후 재계획·검토·적용 성공. 최신3개/직전롤백 보존. 기존 docs 계약 누락은 이번 변경 범위 밖으로 미해결 유지.

## 2026-11-01 OG 심플 버전 준비 — 배포하지 않음
- 사용자 요청: OG 태그 단순화·이미지 재생성, 배포 아직. 공통 제목 크레팬스 / 설명 크리에이터와 팬을 잇는 플랫폼. 기본 OG·Twitter 이미지 `/og/crefans-og-simple-v1.png` 신규 경로, 기존 이미지 보존. 생성 원본 실제1730×909를 메타데이터에도 반영. 개별 프로필/게시물 메타 정책 유지.
- built-in image_gen 기존 OG 이미지 참조 편집: 흰 배경 중앙 기존 로고와 소개 한 줄, 콩/상자/장문/배경 그라데이션 제거. 원본 exec-06e4d9db-018b-4ea4-a8b6-1854bff86e2c.png, public/og에 복사. 생성 이미지 시각 확인 및 sips 치수 확인. SEO 기존4테스트 PASS. 증거 `.local/og-simple-20261101/verification.json`·test.log (HEAD/dirty/hash 포함). 운영 미반영·카카오 캐시/실제 공유 미검증. 다음은 사용자 확인 후 배포 요청 대기.

## 2026-11-01 OG 심플 버전 운영 배포 완료
- 사용자 배포 승인 후 최신 운영 `seo-og-20261101` 소스·이미지 레이어/manifest 라벨 대조. 이전 referral-minimal 기준은 운영 변경 감지로 중단하고 최신 기준으로 재동결. `lib/seo/site.ts`, 신규 `public/og/crefans-og-simple-v1.png` 2파일만 배포. 릴리스 `crefans-front:og-simple-20261101`.
- 최초 디스크8GiB 사전검사 실패; 재생성 가능한 1시간 이상 미사용 Docker build cache·10/29 .next-e2e/cache 정리 후16.9GB로 통과. 운영 데이터/롤백 이미지 유지. 빌드·배포 exit0, SEO4테스트 PASS. 운영용 이미지 및 실제 crefans.com /·/service/feed HTML의 OG/Twitter 제목=크레팬스, 설명=크리에이터와 팬을 잇는 플랫폼, 이미지경로·1730×909 및 이미지 바이트 일치 검증 PASS. API·worker·admin·DB·proxy 유지.
- 증거 `.local/og-simple-deploy-20261101/verification.json` 및 source-state/source-delta/front-source/builds/deployment-command/runtime-after/local-meta/production-meta. 이미지 보존 계획 검토 후 로컬/운영 최신3개 및 직전 seo-og 롤백 유지. 실제 카카오 공유·캐시 갱신은 미검증. 기존 미커밋 변경 보존, AGENTS 규약 변경 불필요.

## 2026-11-01 공식 SNS 마케팅 계획 조사
- 사용자 요청: X·Threads·Instagram 공식계정 운영 계획/기대효과 분석. 계정 생성·게시·DM·결제·배포는 수행하지 않음. 추천: 동일 핸들 확보(사용 가능 여부 미확인), X 크리에이터 모집/팬 연결, Instagram 작품·신뢰, Threads 운영 대화. 90일은 크리에이터3명 기반 콘텐츠·팬 유입 검증 후 확대, 주6~8시간/현금 월10~30만원은 제안 가정이며 승인 예산 아님.
- 2026-11-01 공식자료: https://help.x.com/en/rules-and-policies/adult-content (일반 게시 경고표시·노출영역 제한), https://help.x.com/en/business-and-advertising/adult-or-sexual-products-and-services (광고/수익화 성인성적 콘텐츠 제한), https://help.x.com/en/rules-and-policies/paid-partnerships-policy (보상성 협업도 별도 정책), https://about.fb.com/news/2021/07/introducing-sensitive-content-control/ (Instagram 삭제/추천제외 구분), https://about.fb.com/news/2025/03/new-threads-features-more-personalized-experience-you-control/ (Threads 링크/Insights). Meta community standard 직접페이지2건429로 본문 확인 불가, 준수/광고승인 보장하지 않음.
- 목표 제안: 실제활동 크리에이터3→5~8명, 채널별UTM 및 가입/첫결제/갱신 추적. 90일 유입500/1500/3000명 × 가입8/12/15% × 가입후결제10/15/20%=유료4/27/90명은 업계벤치마크나 예측 아닌 민감도 가정. 평균 월1만원×20%=인당 수수료매출2천원(비용공제전), 각각8천/5.4만/18만원; 인건비·PG·인프라·환불·프로모션 제외, 흑자 주장 금지. 결제개시 미확정시 결제 목표는 관심/재방문 측정으로 대체. 다음은 사용자 운영방향 선택 후 계정 생성 단계 요청 범위 확인.

## 2026-11-01 스튜디오 광고상품 디자인 5종 시안
- 사용자 첨부 모바일 화면을 참고해 built-in image_gen으로 5종 생성·인라인 제시·시각 확인. 가격3900원 VAT포함/1일/구매준비중 유지. 01기본 리스트/02컴팩트카드/03지면미리보기/04가격강조카드/05미리보기+정보구획. 생성결과01은 요청보다 카드형,04는02와 유사,05는미리보기 중심으로 나옴. 구현 시 선택안 기준으로 정교화 필요. 코드·운영 변경 없음. 추천02(간결) 또는03(노출위치 이해).
- 원본 ~/.codex/generated_images/01a1868d-8a63-7433-8e79-7b033059a555/ 에 보관: 02 exec-5f722dc4-a168-4d6b-89f3-27a3a781b7c2.png, 03 exec-7a603267-66dc-4468-91ce-16b8ce19af5e.png, 04 exec-424195b4-ff88-4877-9f36-38e91c779660.png, 05 exec-e96351fa-439e-45b6-822e-177e7fe1e8bc.png; 01 exec-63dac5fa-149a-* 파일. 다음은 선택 후 구현 요청 대기.

## 2026-11-01 광고상품 시안 심플 재제작
- 사용자가 이전5종보다 단순한 디자인 요청. 큰 이미지/파란 배경/반복 설명을 제거한 01텍스트리스트,02한줄상품,03가격타이포,04작은카드,05정렬형 시안5개 built-in image_gen 생성·인라인 표시·시각 확인. 가격3900/VAT포함/1일/구매준비중 유지. 05는 생성결과 가격이 반복되어 구현시 중복 제거 필요. 추천02(목록 확장성) 또는03(단일상품). 코드·배포 변경 없음.
- 원본 generated_images/01a1868d-8a63-7433-8e79-7b033059a555/: exec-94976def-ba11-4833-97ac-5f87b4ab948d.png, exec-f57476a7-57de-4604-b498-6a3b12884d98.png, exec-8e6cfcd1-978b-4d77-a489-9ed5782aed29.png, exec-609658de-7f21-42d5-887c-b048d981bb72.png, exec-a9ece2f4-5f30-46e0-af6a-43d4c8979588.png (01~05 순서). 다음은 선택 대기.

## 2026-11-01 광고상품 이미지 통일 시안
- 사용자 지시: 기존 주목할 크리에이터 생성 에셋 재사용. CreatorPages.tsx에서 `/brand/featured-creators-v1.png` 사용 확인, 이미지 시각 확인. 같은 별빛 에셋을 참조해 심플 한줄상품 시안 재생성 exec-bac74d63-0472-4e3b-b2f9-1acfc5cb553f.png (generated_images 동일 세션 폴더). 실제 구현 시 상품 아이콘에 원본 PNG 직접 재사용. 생성 시안에서 studio 헤더까지 별빛으로 바뀐 것은 채택하지 않고 기존 studio-logo-v1 유지해야 함. 코드·운영 미변경. 다음: 디자인 선택/구현 요청.

## 2026-11-01 스튜디오 광고상품 심플 디자인 운영 배포
- 사용자 승인에 따라 컴팩트 상품 행으로 개선하고 기존 `/brand/featured-creators-v1.png`를 재사용. Studio 헤더 로고 유지, 상품명·기간·가격은 기존 데이터 사용, 상세 설명/구매 안내/판매 상태 로직 유지.
- 최신 운영 legal-version-20261101 동결 소스 기준으로 TSX/CSS 2파일만 배포: `crefans-front:ad-minimal-20261101`. 다른 서비스 유지. 기존 미커밋 작업 보존.
- typecheck/build/deploy exit0. 운영용 이미지 PC·모바일4테스트 및 실제 운영 주소4테스트 통과(서비스 API 대역 포함, 실결제 미실행). 실제 제공 JS/CSS SHA256과 검증 이미지 일치. 최초 문자열 검증은 압축 JS 이스케이프 문장부호로 실패하여 부분문구 검사로 수정 후 통과.
- 로컬/운영 이미지 보존 계획 확인 후 최신3개 및 직전 legal-version 보호하여 정리 완료. 증거 `.local/ad-minimal-deploy-20261101/verification.json`, 스크린샷 front-ui-results/production-results. AGENTS 규약 변경 불필요.

## 2026-11-01 광고상품 탭 활성 배경 제거
- 공통 Chip의 selected:hover 배경이 광고상품 탭 스타일보다 우선하여 터치 후 파란 박스가 남음. 광고상품 범위 CSS에서 hover 우선순위를 높여 투명 처리, 활성 글씨·밑줄 유지.
- 실제 운영 페이지에 로컬 CSS 규칙만 주입해 Chromium PC/WebKit iPhone13 두 탭 클릭·hover 배경 rgba(0,0,0,0) 총4건 확인 exit0. 증거 `.local/ad-tabs-transparent-20261101/verification.json`, results.json, PC/mobile 스크린샷. 코드 수정 완료, 이번 요청에 배포 명시 없어 운영 미배포. AGENTS 규약 변경 없음.

## 2026-11-01 광고상품 탭 투명 배경 운영 배포 완료
- 사용자 배포 승인. 최신 운영 ad-minimal-20261101 이미지/소스 대조 후 advertising.module.css 1파일만 동결하여 `crefans-front:ad-tabs-20261101` 배포.
- 빌드/배포 exit0, 운영용 이미지 및 실제 운영에서 PC Chromium·iPhone13 WebKit 각각2테스트 통과: 양쪽 탭 클릭·hover 투명 배경/활성 밑줄 확인. 실제 제공 CSS SHA256 검증 이미지와 일치. 실물 iPhone 확인은 미실행.
- 다른 서비스 유지, 이미지 보존 계획 확인 후 최신3개·직전 ad-minimal 보호 정리 완료. 증거 `.local/ad-tabs-deploy-20261101/verification.json`, production-results 스크린샷. 기존 미커밋 보존, AGENTS 규약 변경 없음.

## 2026-11-01 스튜디오 받은 후원·콩 출금 내역 빈 상태 개선
- 단순 좌측 문구를 기존 공통 Empty 컴포넌트로 교체: 중앙 정렬/공통 여백/보조색/설명. 받은 후원: 아직 받은 후원이 없습니다 + 팬이 보내준 후원이 이곳에 표시됩니다. 출금: 아직 출금 내역이 없습니다 + 콩 출금을 신청하면 이곳에서 내역을 확인할 수 있습니다.
- 빈 출금 목록의 최근50건 문구, 첫 페이지 빈 후원 목록의 이전/다음 버튼 숨김. 2페이지 이상은 이전으로 돌아가는 버튼 유지. 데이터·금융로직 변경 없음.
- npm run typecheck exit0 및 두 분기/공통 스타일 소스 확인. 증거 `.local/studio-beans-empty-20261101/verification.json`. 브라우저 시각검증·운영배포 미실행. AGENTS 변경 없음. 다음: 배포 요청 시 현재 운영 기준으로 해당 변경만 분리.

## 2026-11-01 받은 후원·콩 출금 빈 상태 운영 배포 완료
- 사용자 승인 후 최신 ad-tabs-20261101 운영 이미지/소스 확인, BeanPages.tsx만 분리해 `crefans-front:beans-empty-20261101` 배포. 다른 서비스 유지.
- 빌드/배포 exit0. 배포 이미지 및 운영 주소에서 각각 PC Chromium·모바일 WebKit 2테스트 통과(각 테스트 두 화면): 중앙 정렬, 빈 목록 불필요 문구/버튼 숨김, 가로 넘침 없음. 빈 금융 API 대역이며 실제 금융 작업은 수행하지 않음. 모바일 캡처 시각 확인.
- 최신3개·직전 ad-tabs 보호하여 로컬/운영 이미지 정리. 증거 `.local/beans-empty-deploy-20261101/verification.json`, production-results 및 front-ui-results. 기존 미커밋 보존, AGENTS 변경 없음.

## 2026-11-01 prod 기준 작업·dev 통합·prod 승격 전환
- 사용자 명시 요청에 따라 새 작업 기준을 dev에서 prod로 변경. docs/branch-workflow.md와 AGENTS.md 동기화. 기존 변경은 먼저 보존 커밋, backup/branch-workflow-20261101 태그·로컬 패치 저장 후 prod에서 feat/prod-dev-workflow를 생성하여 기존 개발 이력을 병합.
- 관리자 콘솔은 origin/main을 보존 기준으로 prod/dev 초기 생성. 생성 캐시/개인 QA 파일은 삭제 없이 Git 제외. 이번 작업은 Git 통합이며 운영 배포 아님. 다음: 통합 검사 후 dev→prod 및 원격 동기화.

### 통합 검증 및 승격 절차
- 기존 이력 병합에 충돌 없음. 관리자 타입검사+11단위 통과, 서버 Nest 빌드 통과. 프론트 기존488검사 중 빈 출금의 최근50건 표시를 기대하던1건은 최신 빈 상태 요구사항에 맞춰 수정 후 재검사. 제품 코드 변경 없이 테스트 기대값 정정. 문서 계약의 이벤트 slug 4개를 현재 카탈로그와 동기화, Git 제외 QA 출력 README는 문서 인벤토리에서 제거(파일 보존).
- 과거 별도 프론트 signup-success 모달은 최신 SignupCompletePage로 대체됨, video-first-frame은 현행 MediaVideo에 반영되어 개선 유지. 이 과거 브랜치/작업트리는 삭제·역병합하지 않고 보존.
- 이번 검증은 Git 이력·소스 보존/타입·단위·빌드·문서 검사 범위. 전체 E2E/실결제/운영 재배포는 수행하지 않음. dev에 통합 후 동일 트리를 prod에 일반 병합하고 원격 push, dev를 prod로 fast-forward 동기화한다. 최종 SHA/원격 일치/clean 증거는 `.local/branch-workflow-20261101/after.json`에 기록한다.

### 원격 통합 완료 확인
- dev→prod 승격 및 dev fast-forward 동기화 완료. 최초 검증 SHA `f2b59c1065044cd142bfd0f86ced8d54102707ce`: 로컬 dev/prod와 origin/dev/origin/prod 동일, 미커밋 없음 확인. 본 완료 기록도 같은 작업 브랜치→dev→prod 순서로 통합한다.
- 최종 검사: 프론트488/관리자11 단위와 타입·백엔드빌드 통과, 문서75개 계약/링크 검사 및 검사기 대조검사 통과. 문서 증거는 snapshot-only로 전체 제품 QA 증명이 아님. 다음 새 작업은 최신 origin/prod에서 새 feat 브랜치를 만든다. 이전 작업트리는 보존했으며 그 위치에서 후속 작업할 때도 이 지침을 적용한다.

## 2026-11-01 설정 닫기·내 프로필 이동
- 요청: 설정 페이지 우측 상단 X를 기존 톤앤매너로 추가하고 내 프로필로 이동. 최신 origin/prod(d38d8c4)에서 feat/settings-close-profile 분기. 이전 대시보드 시안 기록은 feat/studio-dashboard-designs(09c0fcf)에 별도 보존.
- 공용 AccountPages.SettingsPage의 PageTitle.action에 링크 추가. 기존 back-button.module.css 원형44px·회색 배경·hover·키보드 포커스 스타일과 Icon(close)24px 재사용. basePath에 따라 /preview/me 또는 /service/me로 이동. 설정 수정 모달의 닫기 동작은 유지.
- 합격 조건/검증: 로컬 PC Chromium·iPhone13 WebKit 에뮬레이션에서 제목 우측 정렬,44×44 클릭 영역,24px 아이콘,가로 넘침 없음,PC Enter/모바일 tap 후 /preview/me 이동,프로필 수정 모달만 닫으면 설정 유지 모두 통과. npm run typecheck exit0. 증거 `.local/settings-close-20261101/verification.json`, verify.cjs, PC/mobile 화면 캡처. 모바일 캡처 시각 확인. 실제 운영·실물 iPhone 검증 및 배포는 미실행.
- AGENTS 규약 변경 없음. 다음: 운영 배포 요청 시 dev 통합·검증→prod 승격 후 배포 절차 진행.

## 2026-11-01 모바일 당겨서 새로고침 개선·배포 준비
- 요청: 아이폰 Chrome에서 홈·탐색·내 프로필을 위에서 아래로 당겨 새로고침 가능하도록 수정·운영 배포. 최신 prod에서 feat/mobile-pull-refresh 분기 후 이전 미배포 설정 X 버튼(462d302)을 포함. 대시보드 시안 구현은 포함하지 않음.
- 원인: ServiceShell의100dvh 내부 스크롤·overscroll-behavior-y:none으로 브라우저 새로고침에 도달하지 못함. GNB/댓글 키보드 기존 동작을 보존하기 위해 공용 PullToRefresh 추가. 홈·탐색·내/공개 프로필,모바일 coarse pointer,최상단,단일 아래 당김96px 이상을 놓을 때 현재 URL reload. 짧은/가로/위쪽/취소/다중 터치·중첩 스크롤·입력·댓글 초안·모달은 제외. WebKit/Chrome·W3C 근거 및 적용 판단은 docs/design-system.md와 `.local/pull-refresh-20261101/research.json`에 기록.
- 검증: 로컬 관련 E2E13통과/기기조건5제외, 댓글·갤러리7통과/PC2제외. Chromium CDP 터치와 WebKit 합성 TouchEvent 구분. 최초 CDP 검사에서는 관성 스크롤 종료 전 다음 제스처를 시작하여 실패→관성 종료 대기 후 통과. 후속 병렬 테스트 출력 폴더 경합 ENOENT는 출력 경로 분리·순차 재실행으로 해결. 전체 검사489중 설정 링크 기대값1건 실패는 새 X 링크를 포함하도록 수정하고 해당 계정 검사 재통과. 운영용 빌드 exit0, 이미지 검증 진행 중.
- 배포 기준: 현재 운영 watermark-20261101의 이미지 레이어·원본 소스 해시 대조 후 AccountPages/ServiceShell/PullToRefresh 및 전용CSS 총4제품파일만 동결. `.local/pull-refresh-deploy-20261101/`에 빌드/배포/검증 증거. API·worker·관리자·DB·정책 변경 없음. 실물 아이폰 Chrome 동작은 미검증이며 자동화 결과로 대체 주장하지 않음. 다음: dev 통합검사→prod 승격→운영 배포·운영 URL 재검증. AGENTS 규칙 변경 없음.

## 2026-11-02 모바일 새로고침·설정 닫기 운영 배포 검증 완료
- 기능 커밋 ab69280과 기존 설정 닫기를 dev(c8402c8) 통합 후 prod(7290747) 승격·원격 동기화. 2026-11-01 23:57 KST에 `crefans-front:pull-refresh-20261101` 운영 반영. 현재 페이지 URL을 유지한 reload로 홈·탐색·내/공개 프로필을 다시 요청하며, 설정 우측 X는 내 프로필로 이동한다.
- dev 통합 `npm run check` exit0(계층·타입·489검사), 문서75개 검사 통과. 실제 빌드 이미지와 운영 호스트에서 각각 E2E15통과/기기 조건6제외/실패0. 하단 GNB·모달·작성 중 댓글 보존 포함. PC Chromium/모바일 Chromium CDP 실제 터치 입력/WebKit 합성 TouchEvent를 사용했으며 실물 아이폰 Chrome은 미검증이다.
- 운영 `/service/feed`, `/service/explore`와 `/preview/feed`, `/preview/explore`, `/preview/me` 5경로에서 콘텐츠 로딩 완료 후 당김 표시·현재 URL reload·HTTP200 확인. 최초 스크린샷은 로딩 중 화면이어서 콘텐츠 표시/네트워크 안정 후 재촬영했다. 운영 preview 설정은 PC Enter·모바일 tap,44px 클릭 영역,24px 아이콘,수정 모달 닫기 유지 등2환경 통과. 로그인된 실제 운영 내 프로필은 직접 검사하지 않았으며 같은 공용 셸을 쓰는 운영 preview로 검증했다.
- 운영 JS/CSS50파일이 검증한 이미지와 SHA-256 일치. 프론트만 재생성, API/worker/관리자/DB/proxy 기존 컨테이너 동일·정상 실행, 마이그레이션 없음. 최신3이미지/사용중/직전 watermark 복구 이미지 보호를 확인한 뒤 로컬·운영의 오래된 ad-tabs 이미지 각1개 정리. Docker Desktop은 유지.
- 증거: `.local/pull-refresh-deploy-20261101/verification.json`, `deployment-command.json`, `source-delta.json`, `served-assets.json`, `live-page-verification.json`, `settings-verification.json`, `image-ui/results.json`, `production-ui/results.json`, 화면 PNG 및 retention 결과. Playwright 상대 출력은 설정 폴더 아래 생성되어 원본을 보존하고 증거 폴더에 그대로 복사했다. 본 문서 기록도 prod 기준 신규 feat에서 dev→prod로 통합하며 제품 파일은 배포 이미지와 동일하다. AGENTS 변경 없음.

## 2026-11-02 지갑·전체 조회 화면 당겨서 새로고침 확대
- 요청: 지갑도 새로고침되지 않으므로 나머지 페이지를 전수 조사해 같은 문제 개선·운영 배포. 최신 prod(6809708)에서 feat/mobile-refresh-pages 분기. 라우트 파일39개, 팬 화면 분류27개, 스튜디오 분류18개의 등록/스크롤 호스트 조사. 전체 기능 QA가 아닌 모바일 스크롤 경계 조사이며 별도 운영콘솔은 범위 밖. 목록·제외 이유·소스 해시·등록 누락 대조 검사는 docs/audit/mobile-refresh-route-audit-20261102.json.
- 기존5개 화면 한정 정책을 지갑/충전 주문/콩 이동/보낸 후원/친구초대·이력, 알림, 메시지 목록, 팔로우 목록, 구독/결제 이력, 게시물, 설정/결제수단 목록, FAQ·공지·이벤트·정책·가이드 조회로 확대. 결제·출금·가입/인증·멤버십 선택/공급사 결과 처리는 제외. 문의 tab=qna도 전체 제외.
- 메시지 목록은 별도 contacts 스크롤의 최상단 경계를 명시적으로 공유. 대화방·전송 중·다른 대화의 보관 초안도 보호. 기존 댓글·모달·포커스·가로 스와이프 제외 유지. 지갑 이력/구독/결제수단/설정 변경 요청 중에는 보호 표시를 사용. 스튜디오·랜딩·레거시는 문서 스크롤이므로 같은 문제가 아니며 구조 유지. API/금융/정책 변경 없음.
- 로컬 npm run check exit0(489검사/타입/레이어), 브라우저99통과/기기조건48제외/실패0: 모바일 조회 경로37개 각각 Chromium/WebKit, 문의·메시지 초안, 내부 목록 경계,PC·스튜디오/랜딩 문서 스크롤,실제 Chromium CDP 지갑 터치,기존 GNB/모달/댓글. `.local/mobile-refresh-pages-20261102/ui/results.json` 및 각 경로 화면 캡처. 실물 iPhone Chrome·로그인된 운영 지갑 미검증이며 운영 preview 검사를 실계정 금융 검증으로 간주하지 않는다.
- AGENTS에 내부 스크롤 경로 정책·초안/진행 상태 보호 규칙1줄 추가. 현재 운영 pull-refresh-20261101 기준 제품7파일만 동결하여 `.local/pull-refresh-pages-deploy-20261102/`에 빌드 중. 다음: 이미지 브라우저검사→dev 통합·검사→prod 승격→프론트 운영 배포·운영 재검증.

### 운영 반영 및 최종 검증
- feat603df7e→dev87e33f0 통합 검사(489통과)→prod734fca1 승격/원격 동기화 후 2026-11-02 00:15 KST `crefans-front:pull-refresh-pages-20261102` 운영 배포. 빌드/배포 exit0, frozen source manifest SHA-256 a52852771b6459aeaed9b692cd08a6c3936c8c08d75f28e503afed48cf02baa2. 제품 변경7파일만 반영.
- 빌드 이미지 대표 회귀21통과/기기9제외, 운영 주소의 전체 관련 브라우저99통과/기기48제외/실패0(37조회 경로×모바일2환경 및 보호·PC·GNB 등). 별도9경로에서 로딩 완료 후 당김 안내와 reload/URL 유지 확인, 운영 JS/CSS50파일이 검사한 이미지와 해시 일치. 지갑·대화 목록 화면 캡처 보존. 서비스 지갑 직접 검사는 비로그인 안내 화면이며 실제 로그인 잔액 조회는 미실행; 운영 preview 지갑은 fixture. 실물 아이폰 Chrome 미검증.
- 운영6서비스 실행 정상, 프론트만 교체하고 API·worker·관리자·DB·proxy 컨테이너 동일. 로컬/운영 최신3개 및 사용중·직전복구 이미지 보호 후 오래된 beans-empty 이미지 각1개 정리. 임시 로컬 검사 컨테이너 중지, Docker Desktop 유지.
- 증거 `.local/pull-refresh-pages-deploy-20261102/verification.json`, `deployment-git.json`, `deployment-command.json`, `source-delta.json`, `image-ui/results.json`, `production-ui/results.json`, `live-page-verification.json`, `served-assets.json`, retention 결과. 본 완료 기록도 최신 prod 기준 feat→dev→prod로 통합. 코드·테스트·문서 범위 완료, 물리 iPhone/실계정 금융 검증은 별도 범위로 남김.

## 2026-11-02 놓으면 새로고침 안내 아이콘 교체
- 사용자 요청: 놓으면 새로고침 안내를 새로고침 아이콘으로 표시. 최신 origin/prod(5dfaca3)에서 feat/pull-refresh-ready-icon 분기. 공용 Icon에 기존 선 굵기·색상을 따르는 원형 화살표 refresh 추가, PullToRefresh의 준비 완료 상태에22px로 사용. 당기는 중 아래 화살표·임계값·reload 로직은 유지. 공용 셸 대상 화면에 동일 적용.
- npm run typecheck exit0. 로컬 격리 dev3011/.next-e2e에서 홈·지갑 각각 mobile Chromium/ iPhone13 WebKit 합성 TouchEvent 검사4건 통과: 짧은 당김 초기화, 준비 상태 원형 화살표·22px·회전 없음, 놓은 뒤 현재 URL reload. Chromium 홈·WebKit 지갑 캡처 시각 확인. `.local/pull-refresh-ready-icon-20261102/`의 verify.cjs/results.json/PNG 및 verification.json에 증거 보존.
- 최초 검증은 reload 중 잠깐 나타나는 기존 LoadingSpinner를 기다리다 실패(탐색 대기·DOM 미관측). 이번 변경 대상인 준비 상태 아이콘과 실제 reload를 분리하여 재검증 통과했으며 로딩 표시의 실제 노출은 확인하지 못함. 제품 코드에서 기존 로딩 분기는 변경하지 않음. 실물 iPhone·운영 검증/배포는 미실행. 임시 서버 종료·next-env 자동 변경 원복. AGENTS 불변 규약 변경 없음. 다음: 운영 반영 요청 시 dev 통합→prod 승격·배포.

## 2026-11-02 지갑 메뉴 명칭·순서 및 가이드 동기화
- 최신 origin/prod(5dfaca3)에서 feat/wallet-navigation-labels 분기. 지갑 메뉴를 친구 초대 이벤트 → 충전 내역 → 콩 내역 → 후원 내역 순서로 변경. 친구 초대 기능 이용 가능 여부 조건 유지. 같은 공용 화면을 사용하는 서비스·목업의 제목/접근성 이름/브라우저 제목, 후원 완료 이동 링크, 카탈로그, 팬 이용안내와 현재 설명 문서를 동기화. 320px에서 이벤트가 글자 단위로 나뉘지 않도록 메뉴에 word-break:keep-all 적용.
- URL·API·주문번호·금융 로직 유지. 후원 내역은 여전히 내가 보낸 후원만 조회. 실제 충전 주문을 설명하는 오류/재결제 문구, 관리자 용어, 타사 친구 초대 기능명, 과거 검증 기록은 메뉴 이름과 구분해 유지.
- 타입검사·기존 지갑 단위6건 통과. PC Chromium1440/모바일 WebKit390/모바일 Chromium320에서 네 메뉴 순서·링크·제목·브라우저 제목·2열·넘침 및 가이드4페이지를 검증(경로 확인24건 통과). 실제 운영/실물 기기/금융 실행 미검증. 첫 WebKit 검사는 이전 화면 복귀 완료 전 외부 가이드로 이동해 경합했으며 복귀 완료 대기 후 통과. 증거 `.local/wallet-navigation-labels-20261102/`의 ui-results.json, 화면 PNG, typecheck.log, unit.log, verification.json.
- crefans_guide의 지갑/콩/문제해결/소개서 자료, 소개서 HTML·PDF13쪽 갱신. PDF7쪽만 본문·픽셀 변경, 나머지12쪽 동일·전체 렌더/변경쪽 시각 확인. 가이드 빌드28페이지·링크/앵커1350개·정책 숫자15개·서비스 링크45개 검사 통과. 전체 check:guides는 작업 전부터 있던 소스 잠금 불일치31건 때문에 실패 상태 유지; 이번에 새로 달라진 ServiceGuidePage 잠금1개만 검토·갱신. 이를 가이드 전체 현행화 통과로 간주하지 않음.
- 백엔드는 생성 문서 current-contracts.md의 화면명4개·순서만 동기화. 이전 새로고침 아이콘(2c2a784), 대시보드 작업 및 디자인 시안은 각 브랜치에 보존. 이번 작업 운영 배포 없음. 다음: 요청 시 필요한 미배포 작업을 dev 통합·검증→prod 승격 후 배포. AGENTS 불변 규약 변경 없음.

## 2026-11-02 확정된 지갑 메뉴·새로고침 아이콘 운영 배포
- 사용자 “결정된 사항은 배포” 요청. 지갑 명칭/순서(f0bcbfc)와 놓으면 새로고침 원형 화살표(2c2a784)를 dev d85aeb3 통합·검증 후 prod f6de415 승격/원격 동기화. 백엔드는 화면 계약 문서만 prod 1f1a82f에 반영. 가이드는 원격이 없으므로 로컬 dev→prod e91325e 승격. 미선택 시안·출금 바로가기 결정이 남은 대시보드 브랜치는 제외.
- 2026-11-02 04:42 KST 프론트 crefans-front:wallet-release-20261102 및 guide.crefans.com 정적 파일102개 운영 반영. 기존 운영 pull-refresh-pages-20261102의 동결 소스/운영 레이어 일치 확인 후 승인된 제품12파일만 교체. 친구 초대 이벤트 → 충전 내역 → 콩 내역 → 후원 내역 순서와 제목·팬 이용안내·가이드·소개서 PDF를 동기화. URL·API·금융 로직 변경 없음.
- dev npm run check exit0(489검사·타입·계층), check:docs 75문서 통과. 실제 빌드 이미지에서 PC1440/WebKit390/Chromium320 지갑/가이드24경로 확인 및 모바일2엔진×2경로 새로고침4건 통과. 운영 호스트에서도 같은24+4건, 공개 /service/guide/fan PC·WebKit2건 통과. 지갑은 운영 preview fixture, 실계정 잔액 변경·실물 iPhone Chrome 검증 아님. 새로고침 중 순간 스피너 표시는 별도 미확인, 이번 변경 대상은 ready 아이콘.
- 운영 JS/CSS48파일과 가이드/PDF44파일 SHA-256 일치. 소개서13쪽은 이전 검증 산출물과 동일, 변경쪽은7쪽뿐. 가이드의 기존 소스 잠금 불일치31건은 미해결로 유지(전체 검사 실패); 링크1350·경로57·정책문구15·서비스링크45의 범위 검증, 본문 미변경24HTML/CSS 비교·수정4페이지 검증은 통과.
- 초기 빌드 컨테이너 준비 전 접속 실패는 HTTP 준비 대기 후 통과. 추가 서비스 가이드 검사에서 미등록 /service/guide 경로를 사용한 검증 스크립트를 카탈로그의 /service/guide/fan으로 정정 후 통과. 최초 로그도 보존. API/worker/admin/DB/proxy5개 ID 불변, 운영6서비스 정상, DB migration 없음. 현재·직전 복구 이미지 보호 후 최신3개 유지 정책 적용.
- 증거 .local/wallet-release-20261102/verification.json, deployment-git.json, source-delta.json, deployment-command.json, served-assets.json, service-guide-results.json, image-ui/, production-ui/, retention JSON. 가이드 .local/deploy-wallet-release-20261102/의 배포·파일 해시·범위 검증 및 PDF 이전 렌더 증거. 가이드 기존 미커밋 PROGRESS30줄은 보존하며 본 완료 기록만 별도 커밋. 이 기록도 prod 기준 feat→dev→prod로 반영. AGENTS 변경 없음.

## 2026-11-02 영상 최적화 표시 선택 시안 적용
- 요청: 작성1안·목록2안·피드1안 확정 조합을 구현·운영 배포. 최신 origin/prod7943011에서 feat/video-processing-status-ui 분기. 합격 조건은 작성 썸네일 아래 상태 문구, 제목 아래 최적화 칩/게시 상태 구분, 피드 중앙 카메라·스피너·보조문구, 완료/실패·로컬 미리보기·삭제/순서변경 보존이다.
- 공용 VideoProcessing을 통해 서비스·목업·갤러리에 동일한 상태 표시. 작성 중 로컬 영상 미리보기는 유지하고 미완성 서버 파일 요청을 차단한다. 진행률/예상시간을 만들지 않으며 reduced-motion에서는 회전하지 않는다. 카탈로그에 처리 중/미리보기/완료/실패/빈 상태 등록. API·worker 변환/DB/금융 로직 변경 없음.
- 레이어·타입·단위490건 통과. 최초 타입검사에서 카탈로그 accept 누락을 보완했다. 브라우저 최초 실패는 기존 오류 문구를 별도 DOM/마침표로 잘못 기대한 테스트 선택자였으며 실제 span 내용을 기준으로 정정하고 재검증한다. PC1440/WebKit390/Chromium320 공용 컴포넌트 및 정상 목업 경로·운영 이미지 검증 증거는 .local/video-processing-ui-20261102/. 실물 아이폰·실제 운영 업로드/변환은 검증 범위 밖이다.
- 현재 운영 wallet-release-20261102 레이어와 동결 소스를 대조하고 제품9파일만 반영할 예정. 다음: 브라우저·빌드검사→dev 통합검증→prod 승격·프론트 배포 후 운영 재검증. AGENTS 변경 없음.
- 후속 검증: PC1440·iPhone13 WebKit·Chromium320에서 선택 UI/상태 전환 및 기존 편집기·목록·게시물 경로6건 통과. 모든 미완성 미디어 요청0건, reduced-motion 회전 중지, 본문 가로 넘침 없음 확인. 카탈로그 캡처에서는 검수 도구의 고정 내비게이션만 숨겼으며 제품 컴포넌트는 수정하지 않았다. dev 통합 코드 검사490건 통과. docs:record 당시 개발 서버가 자동 변경한 next-env.d.ts를 원복한 뒤 문서 해시 증거를 재기록했다.

### 운영 배포 및 검증 완료
- dev2ce2e96 검증 후 prod235461b 승격·원격 동기화. 2026-11-02 07:14 KST 프론트 `crefans-front:video-processing-ui-20261102` 배포 완료. 기존 wallet-release 운영 소스·레이어 일치 확인 후 제품9파일만 변경, source manifest SHA-256 f60e6d64e047dcbc704383b41916ff0e3aebcf29c864247d22c696b7c07da16c.
- 로컬·실제 빌드 이미지·운영 주소에서 각각 브라우저6건 통과: PC Chromium1440, iPhone13 WebKit390, Chromium320. 작성 문구 위치/목록 칩과 게시 상태 분리/피드 중앙 정렬/미완성 파일 요청0건/완료·실패·삭제/감소된 모션 및 기존 목업 정상 미디어 경로 확인. 코드490건·문서75개·운영 빌드 통과. 실제 운영 업로드·worker 변환 및 실물 iPhone Chrome 검증은 수행하지 않았다.
- 운영 공개 페이지5경로 HTTP200, JS/CSS57파일이 검증 이미지와 SHA-256 일치. 운영6서비스 정상, API·worker·admin·DB·proxy5개 ID 불변·마이그레이션 없음. 현재·직전 wallet-release 복구 이미지 보호 후 오래된 pull-refresh-20261101 로컬/원격 각1개만 정리. 임시 검사 컨테이너/3011 서버 종료, Docker Desktop과 기존 guide4321 유지.
- 증거 `.local/video-processing-ui-20261102/verification.json`, deployment-git.json, source-delta.json, deployment-command.json, served-assets.json, runtime-after.json, local-ui-final/, image-ui/, production-ui/, production-settled/ 및 retention JSON. 초기 캡처에서 아바타가 로딩 중이어서 이미지·폰트 로딩 후 PC/모바일6장 재촬영했다. 이 완료 기록은 prod 기준 새 feat→dev→prod 통합하며 제품 소스는 동일하다. AGENTS 변경 없음.

## 2026-11-02 설정 서비스 안내를 공용 2열 푸터로 통일
- 요청: 설정의 서비스 안내에 별도 링크 행을 두는 대신 최근2열 버전 푸터 표시. 최신 origin/prod7fa8418에서 feat/settings-service-footer 분기. 기존 ServiceFooter/ServiceLinks를 그대로 재사용하고 설정 하단에 배치했다. 전체·서비스 안내 카테고리에서 표시하며, 중복 스튜디오 행/사업자 정보는 제거했다. 모바일은2열·44px 링크, PC는 기존 푸터 배치/사이드바 사업자 정보 기준을 유지한다.
- 합격 조건: 안내 링크9개 목적지 유지, 푸터/스튜디오 진입 중복 없음, 카테고리 필터 유지, 모바일2열/가로넘침 없음, 공지사항 이동·프로필 수정 모달·설정 닫기 동작 유지. PC1440 Chromium·iPhone13 WebKit390·Chromium320에서 모두 확인하고 캡처했다. 기존 계정 단위22건·타입·레이어 검사 통과. 단위 기대값 수정 중 비로그인 안내의 무관한 검사가 함께 바뀐 것을 되돌린 뒤22건 재통과.
- 증거 `.local/settings-service-footer-20261102/`의 verify.cjs, results.json, PC/모바일 PNG, typecheck.log, account-test-final.log, layers.log, verification.json. 로컬 공용/목업 화면 검증이며 실물 기기·로그인된 운영 화면·운영 배포는 미실행. API·권한·금융·푸터 공통 링크 정의는 변경하지 않았다. 임시3011 서버 종료·next-env 자동변경 원복. AGENTS 불변 규약 변경 없음. 소스는 기존 dev→prod 통합 순서를 따르며 다음 운영 배포 시 제품2파일만 포함하면 된다.

## 2026-11-02 로그인 필요 화면 모바일 푸터 여백 수정
- 요청: 모바일 로그인 필요 화면의 과도한 좌우 여백 개선. 최신 origin/prod b2b0830에서 feat/signin-footer-mobile-width 분기. 공용 SignInPrompt의 그리드 가운데 정렬로 푸터가 내용 폭에 맞춰 축소되는 현상을 확인했다. 390px에서 좌우54.55px였던 푸터를 본문과 같은16px로 맞췄다. 모바일에만 너비100%·최대폭 제한 해제를 적용하고 기존2열/사업자 정보/로그인·가입 링크/PC 배치를 유지한다.
- 합격 조건: 320/390/767px 좌우16px·2열9개 링크·사업자 정보·가로 넘침 없음, 로그인 복귀 URL/가입 링크 유지, PC 사이드바/본문 유지. Chromium·WebKit 브라우저8건(모바일3크기×공용화면3경로, PC 회귀)·계정 단위22건·타입검사 통과. 이전 CSS를 브라우저에 다시 적용하면54.55px로 돌아오고 제거 시16px로 복원됨을 확인했다. 첫 PC 검사는 헤더/본문의 로그인 링크2개를 단일 선택해 실패했으며 본문으로 범위를 정정 후8건 재통과했다.
- 검증은 격리3011/.next-e2e의 비로그인 목업 모델로 공용 UI를 확인했다. 최초 실제 서비스 경로는 로컬 API 미연결로503 오류 모달이 나와 완료 근거에서 제외하고 정상 목업에서 전후 측정·캡처했다. 실물 iPhone Chrome·운영 서비스/배포 검증은 미실행. 증거 `.local/signin-footer-mobile-20261102/`의 before-preview.json, e2e.log/e2e-results.json, visual-results.json, PC/모바일PNG, 단위/타입 로그, verification.json. 제품 변경은 account.module.css 한 파일이며 이전 설정 공용 푸터와 함께 운영 미배포 상태다. 작업 서버만 종료하고 자동 next-env 변경을 원복한다. AGENTS 불변 규약 변경 없음. dev 통합검증→prod 소스 승격 순서를 따른다.

## 2026-11-02 설정 공용 푸터·로그인 안내 모바일 여백 운영 배포
- 사용자 배포 요청에 따라 dev 통합 검증 후 prod에 반영된 설정 공용 푸터(b2b0830)와 로그인 필요 화면 좌우16px 수정(65d293b)을 함께 운영 반영했다. 최신 origin/prod65d293b에서 feat/service-footer-release를 분기해 배포 기록을 남긴다. 기존 운영 video-processing-ui-20261102의 동결 소스/실행 레이어 일치 확인 후 AccountPages.tsx·account.module.css 제품2파일만 교체했다.
- 2026-11-02 07:56 KST 프론트 `crefans-front:service-footer-20261102` 배포 완료. source manifest SHA-256 b437ffd9b448b95b03bec5a03f6fd7ce9556ede4307647da52430b11f48b9a4b. API·worker·admin·DB·proxy5개 컨테이너 ID 유지,6서비스 실행 정상, DB migration 없음. 직전 복구 이미지는 video-processing-ui-20261102다.
- 실제 빌드 이미지·운영 주소에서 각각 로그인 안내 브라우저8건과 설정3개 환경(PC1440/ iPhone13 WebKit390/Chromium320) 통과. 로그인 안내는320/390/767px·PC1440에서 푸터16px/2열9개 링크/사업자 정보/복귀 URL·기존 PC 배치 확인. 설정은 목업 모델로 공용 UI의 링크·카테고리·프로필 수정 모달·설정 닫기 동작 확인했다. 추가로 운영 실제 비로그인 /service/me·beans·settings·messages·notifications의 PC/모바일15건 및 preview2경로 HTTP200 검증, 실제 API 오류 모달 없음 확인. 실계정 로그인 설정·실물 iPhone Chrome·금융 실행은 미검증.
- 운영 JS/CSS50파일 SHA-256이 검증 이미지와 일치. 빌드·문서75개 검사 통과. 기존 소스 검증은 계정22건·타입·레이어·브라우저 기록을 참조한다. 현재/직전 복구 이미지 보호 후 최신3개 유지, 오래된 pull-refresh-pages-20261102 로컬/원격 각1개 정리. 임시 검사 컨테이너 제거·Docker Desktop 유지, 다른 개발 서버 미변경.
- 증거 `.local/service-footer-20261102/verification.json`, source-delta.json, source-freeze.json, builds.json, deployment-command.json, runtime-after.json, served-assets.json, image-signin/, image-settings/, production-signin/, production-settings/, production-service/ 및 retention JSON. 배포 기록도 dev→prod로 통합한다. AGENTS 불변 규약 변경 없음. 이번 요청의 미배포 사항 없음.

## 2026-11-02 로그인 필요 화면 심플 디자인 시안5종
- 요청: 실제 화면 구현 전에 이미지젠으로 심플한 디자인5종 비교. 최신 origin/prod f9b76e6에서 feat/signin-prompt-designs 분기. imagegen SKILL의 기본 내장 도구로 별도 이미지5장을 생성했다. 01 중앙 정렬(윤곽 사용자 아이콘)·02 왼쪽 정렬(전폭 로그인 버튼)·03 텍스트 중심·04 컴팩트 패널(자물쇠)·05 가로 배치(아이콘/안내 나란히). 파란 CTA·흰 배경·2열 서비스 링크·하단 내비게이션을 공통 방향으로 유지한다.
- 이미지5장을 직접 확인하고 로그인/가입 문구·서로 다른 배치·2열 푸터가 있는 것을 확인했다. 생성 시안의 폰트/여백은 실제 CSS 검증이 아니며,04번 번호는 이미지 자체에서 생략되어 캡션/파일명으로 식별한다. 원본은 Codex generated_images에 보존하고 복사본은 `.local/signin-prompt-designs-20261102/01-centered.png`부터05-horizontal.png까지 저장했다. prompts.json에 최종 프롬프트5개, brief.json/verification.json에 범위·파일크기·SHA-256과 시각 확인을 기록했다.
- 제품 코드·운영 화면/배포 변경 없음. 현재 운영 이미지는 service-footer-20261102 유지. 1안을 기존 화면과 자연스럽게 연결되는 기본 추천으로 제시. 다음은 사용자가 선택한 번호를 기준으로 공용 SignInPrompt 구현·반응형 검증 진행이며 아직 선택되지 않았다. 디자인 기록만 dev→prod 통합하고 운영 재배포는 하지 않는다. AGENTS 불변 규약 변경 없음.

## 2026-11-02 로그인 안내 디자인 요청 정정: 아이콘 이미지젠5종
- 사용자 정정: 전체 화면을 이미지로 만드는 것이 아니라 페이지에 사용할 아이콘 자체를 이미지젠하라는 의미였다. 직전 레이아웃 시안은 확정안이 아니다. 최신 origin/prod c4e2a75에서 feat/signin-icon-concepts 분기. 기존 featured-creators/new-creators-sprout 에셋을 보고 둥근 형태·파랑/보라/분홍·은은한 입체감으로 맞춘 아이콘5종을 내장 image_gen으로 제작했다.
- 번호:01 프로필,02 로그인 도어,03 열쇠,04 멤버 카드,05 열린 자물쇠. 문구/전체 페이지/외부 배경 박스 없는 단독 투명 PNG. 각 번호별 최종 프롬프트는 `.local/signin-icon-concepts-20261102/prompts.json`,04번 가장자리 보정 프롬프트는 revision-prompt.txt. 최종5개 파일은 같은 폴더에 저장하고 ZIP에 모았다. 생성 원본은 Codex generated_images에 보존한다.
- 이미지5종 직접 확인, RGBA·투명 모서리·알파0~255·해시 검증. 시스템 Python에 Pillow가 없어 첫 검사는 실행 실패했고, 번들 Python으로 읽기 전용 검사 통과했다.04번은 내장 이미지 편집 도구로 외부 흰 흔적 대부분을 줄인04-member-card-v2.png가 최신이다. 확대 시 약한 가장자리 흔적은 남아 있어 선택 후 실제 사용 크기/배경에서 최종 점검해야 한다. 픽셀 조작/자동 후처리는 하지 않았다. 증거 verification.json, 원본5개·수정1개, 프롬프트 및 crefans-login-icon-concepts.zip.
- 단독 아이콘 시안 제시까지 완료, 제품 코드·운영 배포 변경 없음. 다음은 사용자가 선택한 아이콘을 실제 로그인 안내 디자인에 결합하는 것이며 아직 선택되지 않았다. 1번 프로필을 가장 단순한 기본안으로 권장. AGENTS 불변 규약 변경 없음. 작업 기록만 dev→prod로 통합한다.

## 2026-11-02 자물쇠 아이콘 로그인 안내 시안
- 요청: 이미지젠으로 만든 열린 자물쇠를 넣은 로그인 필요 화면 시안 제시. origin/prod50ff18c에서 feat/signin-lock-preview 분기. 선택한05-open-lock.png 원본을 그대로 포함한 독립 HTML을 `.local/signin-lock-preview-20261102/preview.html`에 구성했다. 이미지젠으로 전체 화면을 다시 만들지 않고 DOM 텍스트와 기존 색상·내비게이션 에셋을 사용했다.
- 아이콘104px·배경 박스 없음, 제목24px, 좌우16px, 로그인/회원가입48px, 서비스 안내9개2열과 사업자 정보. WebKit390×920·Chromium320×920에서 이미지6개 로딩·가로넘침 없음·푸터와 하단 내비게이션 미겹침을 확인하고 PNG로 캡처했다. 아이콘 원본·HTML·PNG의 SHA-256과 명령·시각·측정값은 verification.json, 생성/검증 스크립트는 render.cjs에 보존한다.
- 단독 디자인 시안이며 실제 공용 컴포넌트 적용·인증 이동 동작·실물 iPhone·운영 배포 검증은 범위 밖이다. 현재 운영 service-footer-20261102 유지. 사용자 선택 후 구현할 수 있으며 아직 구현 지시는 없다. 제품 코드 변경 없음, 작업 기록만 dev→prod 통합한다. AGENTS 불변 규약 변경 없음.

## 2026-11-02 자물쇠 아이콘 단순화 시안3종
- 사용자 피드백: 기존 파랑·보라 그라데이션 입체 자물쇠가 과함. 최신 origin/prod6098968에서 feat/signin-lock-simple-icons 분기. 내장 image_gen으로01 선형·02 플랫·03 은은한 입체를 각각 생성했다. 세 안 모두 열린 자물쇠·차분한 파랑·배경 박스/장식 없음이며 기존 원본은 보존했다. 가장 담백한01을 권장, 최종 선택/제품 적용은 미정이다.
- `.local/signin-lock-simple-20261102/`에 원본과 동일한 PNG3개, 최종 prompts.json, 비교용 comparison.html/PNG, compare.cjs, verification.json 저장. RGBA1254×1254·알파0~255·모서리 투명 및 SHA-256을 읽기 전용으로 확인했다. 생성 이미지와 흰 배경 비교판을 직접 확인했다. 확대 시 일부 가장자리의 미세한 색/흰 흔적이 있어 실제 적용 크기에서 선택 후 재확인해야 한다. 자동 픽셀 보정 없이 원본 그대로 사용했다.
- 시안 제작만 수행, 제품 코드·로그인 동작·운영 배포 변경 없음. 현재 운영 service-footer-20261102 유지. 기록은 dev→prod 순서로 통합하고 AGENTS 불변 규약은 유지한다.

## 2026-11-02 은은한 입체 자물쇠 로그인 안내 시안
- 사용자 선택:03 은은한 입체 아이콘으로 화면 시안 요청. 최신 origin/prod95168c5에서 feat/signin-soft-lock-preview 분기. 기존 독립 HTML 시안의 PNG만03-soft.png로 교체하고 표시 영역을104px에서88px로 줄였다. 원본 투명 여백을 포함하므로 눈에 보이는 자물쇠 높이는 약54px다. 좌우16px·로그인/회원가입·2열 푸터는 유지했다.
- `.local/signin-soft-lock-preview-20261102/`에 HTML·render.cjs·390/320px PNG·verification.json을 저장했다. WebKit390/Chromium320에서 이미지 로딩, 가로 넘침 없음, 안내 링크9개, 푸터/GNB 비겹침 확인. 390px 시안을 직접 시각 검수했다. 원본 에셋/HTML/PNG 해시·측정값·명령/시각을 보존한다.
- 디자인 시안만 완료, 실제 공용 컴포넌트 적용·인증 동작·운영 배포는 미실행. 다음은 시안 확정 후 구현 요청 시 적용이며 현재 운영 service-footer-20261102 유지. AGENTS 불변 규약 변경 없음. 작업 기록만 dev→prod 순서로 통합한다.

## 2026-11-02 3D 자물쇠 흰색·투명 열쇠구멍 변형4종
- 요청: 이전3D 자물쇠의 열쇠구멍을 흰색 또는 투명으로 바꾼 변형 시안. 최신 origin/prod9c5cf0e에서 feat/signin-lock-keyhole-variants 분기. 기존 선명한3D와 은은한 입체 원본을 내장 image_gen 편집에 전달해 각각 흰색/투명4종 생성. 원본은 보존하고 `.local/signin-lock-keyholes-20261102/`에 PNG4개·최종 prompts.json·comparison.html/PNG·compare.cjs·verification.json 저장했다.
- RGBA1254×1254·모서리 투명·해시 확인. 흰색01/03의 구멍 중앙 샘플은 약RGB253·알파254, 투명02/04의 중앙은알파0이다. 중앙 사각영역 완전 투명 비율은92.1%/85.2%로, 생성 결과의 가장자리 잔흔까지 완전히 제거됐다고 보장하지 않는다. 이미지젠 외 픽셀 후처리는 수행하지 않았다. 체크 배경 비교판으로 구멍을 통한 배경 투과와 흰색의 차이를 직접 확인했다. 실제 운영 적용 전 선택 에셋의 작은 크기/경계 재검수가 필요하다.
- 디자인 비교만 완료, 사용자 선택/제품 적용·배포는 미정. 제품 코드 변경 없음·현재 운영 service-footer-20261102 유지. AGENTS 불변 규약 변경 없음. 기록만 dev→prod 순서로 통합한다.

## 2026-11-02 선택한 로그인 자물쇠·스튜디오 빠른 작업 적용
- 최신 origin/prod fb38605에서 feat/signin-lock-quick-dashboard 분기. 사용자 선택한 기존3D 가운데 투명02 원본을 공용 SignInPrompt에88px로 적용, 로그인 복귀 URL·회원가입·모바일16px 여백/2열 서비스 푸터 유지. PNG SHA-256 0d3309a1261bb10edee709f6389ef09a11ba2d27f9646e5d686981c9c03e9ad5, 생성 출처 JSON 포함. 이미지 재생성/재가공 없음.
- 보류되었던 feat/studio-quick-dashboard의 제품/검증 변경을 현재 prod에 복구하고 사용자 확정대로 빠른 작업을2열3행(게시물·댓글·메시지·출금 신청·콩 후원·출금·크리에이터 설정)으로 구성. 멤버십 출금/콩 후원 출금은 기존 목적지를 유지, API·금융 계산 변경 없음. 데이터 주입형 공용 화면을 목업·실제 서비스·디자인 시스템에서 재사용하고 빈 목록/긴 활동명 상태 등록.
- 합격 기준: 선택 에셋 일치·깨짐 없음, 로그인/가입 경로 보존, 모바일320/390/767px 좌우16px/가로 넘침 없음, PC 사이드바 유지, 빠른 작업6개/2×3 및 각 실제 메뉴 목적지, 서버 주입 데이터/빈 목록/긴 활동명. 근거: components/crefans/SignInPrompt.tsx, studio/DashboardPage.tsx, e2e/signin-prompt-gutter.spec.ts, e2e/studio-dashboard.spec.ts, docs/design-system.md.
- 검증: npm run check491건 통과(계층408파일·타입 포함). 로컬3011 Playwright 대시보드9건(Chromium PC·모바일/WebKit), 로그인10건(Chromium/WebKit) 통과. PC·모바일 캡처 육안 확인. 최초 실패: 테스트 HTMLCollection 순회 타입 오류→Array.from 수정; 목업 settings를 보호 경로로 오인한 테스트→목업3경로와 실제 ServiceRouter5경로 API대역 검증으로 분리. 실패 로그 보존.
- 증거: .local/signin-dashboard-20261102/의 check-final.log, dashboard-e2e.log, signin-e2e-final.log, results/, signin-ui-final/. 로컬 대역/브라우저 검증이며 실계정 로그인·실아이폰·실금융 시험은 아님. 다음: dev 통합 검사→prod 승격→사용자 승인 운영 배포/서빙 검증. AGENTS 불변 규약 변경 없음.
- 추가 요청 PC UX: 현재 상단 아바타는 프로필 링크뿐, 로그아웃은 설정의 계정 관리에만 있음 확인. 사용자에게 상단 아바타 메뉴/사이드바/둘 다 중 첫 위치 결정을 질문, 답변 대기. 아직 관련 코드 변경 없음.

## 2026-11-02 PC 계정 메뉴·로그인 깜빡임 수정, 광고상품 등록
- 최신 origin/prod1b78290→feat/desktop-account-menu. 사용자 선택대로 PC 상단 아바타에 내 프로필·설정·로그아웃 disclosure 메뉴. 44px 동작 영역·기존 디자인 토큰·공통 오류 모달/스낵바·모바일 프로필 링크 유지. 회원 인증/세션 API 자체 변경 없음. ServiceRouter loading을 헤더에 전달해 인증 확인 중 로그인/가입 노출 차단, 기존1초 지연 훅 스피너 재사용.
- 합격 기준: 조회 전·999ms 비로그인 링크/스피너 없음→1000ms 스피너→인증결과 메뉴, 빠른 비로그인 결과 지연 스피너 없음. PC 메뉴 키보드(Chrome Tab, macOS WebKit Option+Tab)·Escape/포커스·바깥닫기·2개 경로·로그아웃 성공/실패·pending 중복 방지·모바일기존진입.
- check492건/타입·계층 통과, API대역 Chromium/WebKit8개 브라우저 시나리오 통과. 최초 실패는 카탈로그 ApiResult 접근 타입·기존 unit의 신규 메뉴 의존 목·브라우저 헤더 선택자/빈Toast status 선택자·WebKit 기본 Tab 설정을 각각 고쳐 재검사. .local/desktop-account-20261102/{check.log,e2e-final.log,local-final/}에 실패와 최종검증 보존. 메모리에서만 authLoading gate를 제거한 음성대조로 unit 실패 확인(negative.log), 소스/배포파일 변조 없음. 실로그인/실아이폰 검증은 아님.
- 이전 로그인 자물쇠02/빠른작업6개는 prod1b78290까지 통합되었으나 아직 운영 service-footer-20261102이다. 이번 계정메뉴와 함께 동결소스 빌드/운영배포 예정. 로그인 WebKit 테스트의 연속 hard navigation 중 load/prefetch abort 실패는 DOM 준비조건과 각 경로 networkidle 완료 후 이동으로 조정. Chromium/WebKit10개 전체 재통과(signin-local.log), 최종 check492건 재통과(check-final.log).
- 운영콘솔 광고상품: 사용자 최신 명시 승인가격 VAT포함1일3900(기존유지),3일11700,7일27300,30일117000. 정상 UI에서3·7·30일만 신규등록, 정렬0/1/2/3·주목할 크리에이터 지면·노출/판매중4건 확인. .local/advertising-products-20261102/{registered.jpg,verification.json}. 별도 앱배포 불필요한 운영 데이터 변경이며 실제구매/결제 실행 없음.
- 장기할인 조사(2026-11-02): 와디즈 공식2026.1H 소개서는 반복집행 별도할인·제안시점별 변동, 크몽2024광고안은 주단위CPT와 당시 한정50%프로모션. 공통 업계표준 할인율을 확인하지 못함. 사업제안3일10%10530원·7일20%21840원·30일30%81900원(VAT포함), 확정 정책으로 적용하지 않고 최근승인가격 유지. 출처/구분은 위verification.json.

## 2026-11-02 로그인 자물쇠·빠른 작업·PC 계정 메뉴 운영 배포 완료
- PC 기능 feat4d1d3e8/75cc4e4→devab27411→prod5be13c5, 각 브랜치 일반push 완료. dev check492건/문서75개 검사 통과. 앞서 미배포였던 로그인02 자물쇠·2×3빠른작업과 이번 PC헤더5파일을 합쳐 운영 service-footer 소스에서 승인된16파일만 동결. 실제 제품 소스 커밋5be13c5.
- crefans-front:pc-account-20261102 amd64 빌드 통과, manifest55f973142a20d40c889b8ff8071c7b36ecf11f3417ff2628a8cf2382ee4302a2. 이미지 내부 소스 대조 및 전송 체크섬 확인. 09:19 KST 프론트만 운영 교체, API/worker/admin/DB/proxy5개 ID·이미지 유지, 마이그레이션 없음.
- 최종 이미지 브라우저 헤더8·로그인10·대시보드9사례 확인. 최초 헤더1건은 서버준비 전 ERR_EMPTY_RESPONSE(7통과/1실패), HTTP 준비확인 뒤 해당1건 통과. 로그인 이전후보의WebKit load/prefetch abort는 테스트 경로 이동 전 networkidle 대기 후 최종이미지10건 통과. 실패 로그 보존, 숨김/필터링 없음.
- 운영 Chromium PC·모바일 WebKit 비로그인5경로/목업대시보드 각6개=12사례 및 잠금원본SHA 일치. 실제 사용자 Chrome의 로그인된 상단메뉴에서 내프로필·설정·로그아웃 직접 확인·캡처, 사용중 계정을 실제로 로그아웃하지 않음. 실제 제공JS/CSS57개가 테스트이미지와 SHA일치. 모바일실물·실결제/출금은 범위 밖.
- 가이드 별도복구 완료: prod087e4ff 기준Pagefind메타1파일만 변경, 101파일유지·운영102파일SHA일치. PC/모바일 검색4종·결과이동·빈결과12사례, 실제Chrome 결제22결과 확인. guide PROGRESS와 .local/search-20261102/ 참조.
- 증거 .local/pc-account-20261102/{verification.json,builds.json,source-delta.json,images.json,deployment-command.json,runtime-after.json,production-smoke.json,served-assets.json,production-account-menu.jpg} 및 -image/-ready 테스트로그·캡처. 기존 미배포 후보 이미지1개와 완료한전용서버 정리, 로컬/운영 최신3이미지·명시보호태그 유지(retention-*-apply.json). 이전 운영 service-footer 복구이미지/설정 보존. AGENTS 불변규약 유지.

## 2026-11-02 미배포 사항 재점검 — 대시보드·로그인 요구 화면 반영 확인
- 사용자 요청: 미배포 변경 전부 확인·배포, 특히 대시보드와 로그인 요구 디자인. 최신 origin/prod12cc441에서 feat/deployment-audit-20261102 분기. 합격 기준은 최신 승인 제품 소스와 운영 이미지 일치, 선택한 로그인 자물쇠의 실제 제공 파일 일치, 실제 로그인 대시보드의 빠른 작업6개와 PC/모바일 배치 확인이다.
- 프론트733·서버247·콘솔83개 동결 소스와 현재 저장소 SHA-256 전부 일치. 각 운영 이미지의 RootFS 레이어도 배포 증거와 일치, 6서비스 실행/OOM없음 확인. 가이드 본문·정적 원본/빌드 설정57개 일치, 실제 배포102파일 동일. 운영 프론트 JS/CSS57개 및 선택한 로그인02 자물쇠 PNG도 기존 검증 산출물과 동일하다. 누락된 승인 제품 변경이 없어 새 빌드·서비스 재시작은 수행하지 않았다.
- 실제 Chrome 로그인 계정으로 /service/studio 확인: 새 게시물 작성, 게시물·댓글·메시지·출금 신청·콩 후원·출금·크리에이터 설정과 각 실제 경로. PC/390px에서 빠른 작업2열3행, 모바일 가로넘침없음. 임시 viewport 복원. 실제 로그인 데이터로 표시했으며 게시물·금융 변경은 수행하지 않음. 로그인 요구 화면은 직전 PC/WebKit 운영12사례와 현재 서빙 파일 동일성으로 재확인; 실물 iPhone 시험은 아님.
- 제외: 런타임 미참조 원본 디자인3개(inicis/reference PNG2개, logo_icon.psd), 대체 구현이 이미 반영된 과거 signup-success/video-thumb 보존 작업트리, 가이드 기존 PROGRESS 미커밋30줄. 금융 개방 스위치·미확정 약관/가격 정책을 배포 요청만으로 변경하지 않음. 프론트·서버·콘솔 dev/prod 원격 일치, 가이드 로컬 dev/prod 일치(원격 없음).
- 증거 .local/deployment-audit-20261102/{audit.py,audit.log,audit.json,dashboard-live.json,dashboard-production-pc.jpg,dashboard-production-mobile.jpg}. audit.py exit0, 총1120개 배포 관련 소스 대조. 기존 제품 검증492개/이미지 브라우저27사례는 동일 제품 소스이므로 유효, 새로 재실행했다고 주장하지 않는다. 이번 완료 상태는 승인·구현된 변경 모두 운영 반영이며 추가 배포할 제품 파일 없음. AGENTS 불변 규약 유지, 이 기록도 dev→prod로 통합한다.

## 2026-11-02 llms.txt 공개 AI 안내 파일 — feat/llms-txt, 미배포
- 사용자 요청 `Llm.txt`를 사이트 AI 안내 파일로 해석. 최신 origin/prod ff91bff에서 별도 작업트리 `/Users/ethan/repository/crefans_front-llms`·feat/llms-txt 분기. 기존 dev의 결제 작업·Search Console 기록 보존. AGENTS의 프로젝트/스택/PROGRESS 우선 읽기 규약 유지.
- public/llms.txt: H1·요약·서비스 개요·H2별 공식 링크19개. 팬/크리에이터 이용법·정책/지원·공지/이벤트를 연결하고 목업·비공개 콘텐츠 구분. 변동하는 금융 수치를 복제하지 않음. middleware가 확장자 파일을 통과시키므로 로직/robots/사이트맵 변경 없이 정적 파일만 추가. manifest에 신규 공개 문서를 등록.
- 근거(2026-11-02): https://llmstxt.org/ 의 제안 형식(v2, 2026-08-10 수정). https://developers.google.com/search/docs/fundamentals/ai-optimization-guide 는 Google Search가 llms.txt를 사용하지 않으며 순위에 영향이 없다고 명시. Search Console 제출 대상이나 robots 접근 제어로 취급하지 않음. 공식 가이드 start/about·fans/beans·fans/membership·creators/start 내용과 설명 대조.
- 합격 조건/실제 검증: 형식·중복 없는 HTTPS 공식 링크19개 확인, 공개 링크19/19 HTTP200. 격리 Next15.5.28 dev 서버3126의 비로그인 GET/HEAD 모두200·text/plain UTF-8·리디렉션 없음·GET 원본3261바이트 SHA 일치. 운영 /llms.txt는 아직200 HTML, guide는404(운영 미적용). 포트 바인딩 첫 시도 EPERM 후 권한 승인 실행으로 검증 완료. 새 제품 테스트/빌드는 정적 문서 변경에 불필요해 미실행.
- npm run check:docs exit1: 기존 결제 묶음의 문서 증거34항목 만료가 기준선에 존재하고 신규 llms/manifest도 스냅샷 갱신 필요. 문서 inventory/계약/로컬 링크 부분 검사는 오류0(전체76문서), 공개 링크 실제 확인은 위 별도 검사. unrelated 전체 증거를 무조건 재생성하지 않으며 전체 문서 검사 통과라고 보고하지 않음.
- 증거 작업트리 .local/llms-20261102/{public-links.json,http-response.json,docs-structure.json,docs-baseline.log,docs-check.log,verification.json}. 다음: dev PR 통합·검증→prod 승격→운영배포 시 /llms.txt 실제 응답 재검증. 현재 브랜치 구현만 완료, 다른 결제 변경을 함께 배포하지 않음.

## 2026-11-02 llms.txt 운영 배포 완료
- 사용자 배포 승인 후 PR4로 feat/llms-txt0c1096e→dev3e5367d 통합, 동일 트리/파일 SHA 검증 후 PR5로 prode7c2f3e 승격. 결제 묶음은 이미 prod에 있지만 미배포 상태이므로 운영 전체 재빌드 대신 현재 pc-account-20261102 이미지의10개 레이어를 그대로 보존하고 llms.txt 한 파일 레이어만 추가.
- 운영 crefans-front:llms-20261102, 이미지57ae20e8978688500f8a5cb891bc6a3ac0aeef23f71f6fb72c5f9b2a42a0d3b0. 13:58 KST 프론트만 교체. API·worker·admin·DB·proxy5개 컨테이너 ID/이미지/재시작 상태 불변, migration 없음. .env는 FRONTEND_IMAGE 한 줄만 변경, 직전 설정/이미지 복구본 보존.
- 검증: 후보 컨테이너와 운영 서버 및 맥북 외부 HTTPS에서 GET/HEAD200·text/plain UTF-8, GET3261바이트 원본 SHA4c70a78ab2fbd9f11e1fa0aba0abfef959e9cf90175e2bd425afc01e3d843905 일치. 피드·탐색·API상태·관리자로그인·가이드5경로200. 콩/결제·계정 데이터 변경 없음. 이전19공식 링크 검증 유효; 이번 작업은 검색 순위나 AI 수집 결과를 증명하지 않음.
- 실패/한계: 로컬 Docker의 이전 태그 이름 조회 실패로 실제 운영 이미지의 정확한 ID/레이어를 검증한 서버에서 네트워크 없는 단일COPY 빌드 수행. 후보 통과 후 배포. 기존 결제 묶음의 전체 check:docs 증거 만료는 별도 미해결이며 새 파일 목록·계약·링크 검사 오류0과 구분. 전체 앱 회귀/실금융 시험은 정적 파일 변경 범위 밖.
- 증거 `/Users/ethan/repository/crefans_front-llms/.local/llms-deploy-20261102/`: baseline.json, dev-verification.json, image-verification.json, production-verification.json, external-verification.json, deployment-command.json 및 실제 실행 스크립트/로그. 운영 https://crefans.com/llms.txt 정상 제공. 다음은 통상 서비스/가이드 변경 때 파일 안내를 함께 검토; Search Console 추가 제출은 불필요. AGENTS 불변 규약 유지.
