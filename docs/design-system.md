# 디자인 시스템 카탈로그

경로: `/design-system` · 로컬 개발 미리보기: `http://127.0.0.1:3010/design-system`

## 포함된 항목

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

## 데이터와 화면의 분리

- `features/design-system/catalog.ts`: 분류 목록과 기본/긴 문구·큰 금액/빈 목록 fixture 생성.
- `features/design-system/useDesignSystemModel.ts`: 검색, 크기, 비활성, fixture 시나리오 상태.
- `components/design-system/`: 섹션별 미리보기와 UI 상호작용. 선택·폼 입력·메시지 등은 로컬에서만 동작한다.
- `lib/theme.ts`: 기존 공통 테마 설정을 추출한 단일 참조. 서비스의 테마 값 자체는 바꾸지 않았다.
- `PostView`와 `FollowButtonView`의 표시 계층을 named export하여 실제 API 모델 없이도 상태를 주입한다. PostView의 `comments` 슬롯을 `null`로 전달해 카탈로그에서는 댓글 API가 실행되지 않는다. 기존 서비스는 기본 댓글 영역을 유지한다.
- 루트 `ApplicationProviders`는 `/design-system`에서 인증·알림 Context 초기화를 생략한다. 서비스 경로에서는 기존 제공자를 유지한다.

상단 크기/비활성 제어는 지원하는 기본 UI에 적용된다. 개별 크기·상태 비교 예시는 고정되어 있고, 서비스 컴포넌트의 자체 스타일은 기존 구현을 그대로 보여준다. 데이터 선택기는 10번 섹션의 멤버십·결제·미디어 데이터를 전환한다. 게시글 권한·팔로우 상태는 해당 예시 안에서 전환한다.

실제 업로드·결제·삭제·회원 API를 호출하지 않는다. 선택한 파일과 입력한 폼은 저장하지 않는다. 기존 컴포넌트가 지원하지 않는 상태를 지원하는 것처럼 추가하지 않았다. 예를 들어 PaymentHistoryItem은 현재 status별 배지가 없다.

## 검증

`npm run check`로 레이어, 타입, 회귀 테스트를 실행한다. 신규 테스트는 샘플 데이터의 독립성과 카탈로그/서비스 경로의 Provider 분기를 검사한다. 기존 46개 렌더링 파일 기준도 유지한다.

개발 서버 예시:

```sh
NEXT_PUBLIC_APP_ENV=local npm run dev -- --hostname 127.0.0.1 --port 3010
```

브라우저에서 폼 검증·초기화, 메시지, 컨펌 확인/취소, 모달 로딩, 드로어, 토큰 검색/다운로드, 비활성 전환, 긴/빈 fixture, 게시글 접근 상태를 확인한다. 모바일 가로 넘침과 이미지 로딩도 확인한다. 이 페이지의 noindex 설정은 검색 색인 방지이며 접근 통제 기능은 아니다.
