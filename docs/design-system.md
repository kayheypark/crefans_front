# 디자인 시스템 카탈로그

경로: `/design-system` · 로컬 개발 미리보기: `http://127.0.0.1:3010/design-system`

현재 진입점은 `CustomDesignSystem`이다. 기본 요소는 `components/ui/`, 서비스 패턴은 `components/crefans/`의 공통 컴포넌트를 직접 사용한다. 아래 **현재 사용 안내**가 신규 UI의 기준이며, 초기 카탈로그와 V1·랜딩 개편 설명은 기존 작업의 기록으로 보존한다.

## 현재 사용 안내

| 카탈로그 메뉴 | 확인할 내용 | 등록 위치 |
| --- | --- | --- |
| 미리보기 | 공통 로고·브랜드 색상, 실제 크리에이터·멤버십 카드 | `CustomDesignSystem.tsx` |
| 디자인 토큰 | 색상·타이포그래피·간격·모션 검색과 JSON 다운로드 | `CustomDesignSystem.tsx`, `lib/design/tokens.ts` |
| 입력·선택 | 아바타·버튼, 입력 형식, 도움말·오류·비활성·읽기 전용, 단일·다중 선택 | `FormControlsCatalog.tsx`, `CustomDesignSystem.tsx` |
| 표·페이지 | 3단계 정렬, 페이지 크기 변경, 일반·로딩·빈 표, 여러 페이지·한 페이지·데이터 없음 | `DataDisplayCatalog.tsx` |
| 서비스 UI | 실제 서비스 카드·피드·스튜디오 지표·정산·API 상태, 화면별 목업 미리보기 | `ServicePatternCatalog.tsx` |
| 상태·피드백 | 모달·바텀시트·토스트·로딩·오류·빈 상태 | `CustomDesignSystem.tsx` |

새 UI는 공통 컴포넌트로 구현하고, 정상·빈 값/목록·오류·disabled·readOnly·loading 중 해당하는 상태를 카탈로그에 등록한 다음 같은 컴포넌트를 목업에서 재사용한다. 지원하지 않는 상태를 샘플 처리 결과로 꾸미지 않는다. 목업·카탈로그마다 같은 UI를 별도 JSX와 CSS로 복제하지 않는다.

### 입력과 여러 줄 입력

`components/ui/Field.tsx`에서 `Field`, `TextAreaField`를 가져온다. 기존 `components/ui/Primitives.tsx` 경로도 두 컴포넌트를 다시 export한다.

- `Field`: `label`, `error?`, `hint?`와 기존 `InputHTMLAttributes<HTMLInputElement>`를 받는다. `text`, `email`, `tel`, `url`, `password`, `search`, `number` 등 네이티브 입력 형식을 유지한다. `value`, `defaultValue`, `name`, `required`, `disabled`, `readOnly`, `min`, `step` 등의 속성과 `onChange(event)`를 그대로 전달한다.
- `prefix?`, `suffix?`는 아이콘·프로필 주소·금액 단위처럼 입력 앞뒤 내용을 표시한다. `type="search"`에는 검색 아이콘이 기본으로 들어가며 브라우저 기본 지우기 버튼과 중복하지 않는다.
- 지우기는 `clearable`과 `onClear`를 함께 전달해야 사용할 수 있다. 값이 있을 때 버튼을 표시하며, 실제 값 변경은 `onClear`의 호출부가 처리한다. `disabled`나 `readOnly`이면 실행하지 않는다.
- `showPasswordToggle`의 기본값은 `false`다. `type="password"`와 함께 켜면 보기/숨기기 버튼을 표시한다. 기존 화면에 별도 보기 버튼이 있으면 중복해서 켜지 않는다.
- `TextAreaField`: `label`, `error?`, `hint?`와 `TextareaHTMLAttributes<HTMLTextAreaElement>`를 받는다. `showCount`로 글자 수를 표시하며, `maxLength`가 있으면 현재 글자 수와 제한을 함께 보여 준다.
- label은 입력 요소와 `htmlFor`로 연결하고, 지우기·보기 버튼을 label 안에 넣지 않는다. 외부 `aria-describedby`는 내부 도움말·글자 수 ID와 함께 유지한다. 입력 오류는 `aria-invalid`와 `role="alert"`로 전달한다.

이 컴포넌트는 값을 자동 포맷하거나 빈 값에 목업 데이터를 채우지 않는다. 검증·저장·서버 오류 해석은 호출부 모델에서 수행한다.

### 목록 선택

### Chip·ChipRow

분류 필터(탐색 카테고리, 알림 분류 등)는 `components/ui/Primitives`의 `Chip`을 `components/ui/ChipRow.tsx`의 `ChipRow` 안에 둔다. 화면별 버튼 CSS를 만들지 않는다.

- `ChipRow`: `label`(그룹 aria-label), `children`, `className?`. 항상 한 줄(`nowrap`)이며 넘치면 좌우 스크롤. 터치는 기본 스크롤, 마우스는 끌어서 스크롤(6px 이상 움직이면 드래그로 보고 그 직후 클릭은 무시). 스크롤바는 숨기고 모바일(≤700px)에서는 본문 좌우 여백까지 확장해 끝까지 보이게 한다.
- 카탈로그: 입력·선택 탭 "탐색과 선택" 섹션(칩 14개로 넘침 상태 확인).

### 체크박스·라디오

동의·옵션 선택에는 `components/ui/Choice.tsx`의 `Checkbox`, `Radio`를 사용한다. 브라우저 기본 모양(`accent-color`)이나 화면별 CSS로 체크박스를 직접 만들지 않는다.

- 공통 props: `label`(ReactNode), `description?`, `checked`(boolean), `onChange(checked:boolean)`, `disabled?`, `className?`와 나머지 네이티브 `<input>` 속성(`name`, `value`, `required` 등). 네이티브 인풋을 `<label>`로 감싸므로 텍스트 클릭·스크린리더 라벨이 그대로 동작한다.
- `Radio`는 같은 `name`으로 묶고, 각 옵션의 `checked`에 선택 여부를 넣는다. 그룹 제목은 호출하는 쪽에서 `<fieldset><legend>`로 감싼다.
- 상태: 기본·선택·비활성(선택/미선택)·포커스(브랜드색 외곽선). 읽기 전용 상태는 없으므로 변경 불가 항목은 `disabled`로 표현한다.
- 카탈로그: 입력·선택 탭 "체크박스와 라디오" 섹션. 비활성 토글이 두 컴포넌트에도 적용된다.
- 사용처: 회원가입 동의 3종, 로그인 상태 유지, 멤버십 가입 동의, 회원 탈퇴 확인, 크리에이터 시작하기 공개 프로필 확인.

신규 목록 선택에는 `components/ui/SelectField.tsx`의 `SelectField`를 사용한다. `Primitives.tsx`에서도 다시 export하며, 네이티브 `<select>`의 `<option>` children이나 변경 이벤트를 받는 방식과는 계약이 다르다.

- 옵션은 `options: {value:string; label:string; disabled?:boolean}[]`로 전달한다. 단일 선택은 `value:string`, `onChange(value:string)`을 사용한다. `multiple`을 켜면 `value:string[]`, `onChange(value:string[])`을 사용한다.
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

`ServicePatternCatalog.tsx`는 `components/crefans/`의 `FollowButton`(팔로우/팔로우 하는중 토글, 해제 시 확인 모달), `CreatorCard`, `MembershipPlanCard`, `PostCard`, `MetricCard`, `LedgerRow`, `AmountRows`, `Action`, `Empty`, `Notice`, `PageTitle`, `ApiState`를 직접 사용한다. 카탈로그가 옵션·목업 데이터·콜백을 주입하며, 표시 컴포넌트는 API나 fixture를 직접 읽지 않는다.

팔로우·멤버십 선택·게시물 잠금·좋아요·저장·API 로딩/오류/성공 상태를 해당 공통 컴포넌트에서 전환한다. 화면별 헤더·탭·메시지·알림·목록의 전체 구성은 `/preview` 페이지를 iframe과 새 탭 링크로 확인한다. 실제 서비스 연결은 동일 표시 컴포넌트에 실제 모델을 주입하는 방식이며, 카탈로그 조작이 실제 발행·결제·정산을 실행하지 않는다.

- `BenefitsField`는 `value:string[]`와 `onChange`를 받아 혜택을 개별 입력·추가·삭제한다. 저장 시 빈 항목 정리와 필수 검증은 호출부에서 수행한다. 입력·선택 메뉴에 기본·빈 목록·오류·비활성·읽기 전용 상태가 등록되어 있다. 멤버십 편집 미리보기 기능은 요청 취소로 추가하지 않았다.
- `PinField`는 같은 `Field`에 숫자 6자리 마스킹·숫자 키보드를 적용한다. 값·변경 콜백·오류·disabled/readOnly를 주입하며 설정·출금 확인에서 재사용한다. 입력·선택 카탈로그에서 상태별로 확인한다.
- `AmountPresets`는 금액 문자열·가용 잔액·증액 단위와 콜백을 받는다. 1만/5만/10만/50만/100만 더하기, 전액, 초기화를 제공한다. 빼기 모드는 최종 요청으로 제거했다. 빈 값·가용 금액 0·disabled도 카탈로그에서 확인한다.
- `ImageUpload`는 이미지 주소·파일 선택·제거 콜백·업로드 상태/오류를 받는다. 파일 검증과 업로드 처리는 모델에서 담당한다. `OptionalImage`를 스튜디오/팬 멤버십 카드에서 공유하여 없거나 깨진 이미지에서는 기본 카드 상태를 유지한다. `Toggle`은 동일 활성화 플래그를 표시하고 변경 콜백만 호출한다. 두 UI는 입력·선택 카탈로그에 등록한다.
- `Charts.tsx`의 `Trend`와 `BarChart`는 데이터에 따른 선·막대를 표시한다. 화면에 처음 들어오면 `motion.chart` 600ms 동안 나타나며, 데이터 변경 시 현재 표시 값에서 새 값으로 이동한다. 같은 내용의 새 배열은 다시 시작하지 않고, 모션 감소 설정에서는 즉시 값을 표시한다. `BarChart.items`의 `id`는 데이터가 바뀌어도 같은 항목을 식별할 수 있도록 유지한다.
- 서비스 UI 메뉴의 차트 예시에서 증가·감소·0·빈 데이터와 첫 진입을 확인한다. 스튜디오 순수익·구독자·팔로워 리포트도 화면별 목록에 등록한다. 리포트는 주입된 `ApiResult<StudioReport>`를 표시하고 표 정렬·페이지 상태만 화면에서 관리한다.

### 모션과 확인 항목

일반 본문 이동 링크는 `components/ui/TextLink.tsx`를 사용한다. Next Link의 `href` 등 기존 속성을 받으며 파란색 글자와 밑줄로 표시한다. 메뉴·로고·카드 전체 링크·주요 CTA 버튼은 각 역할에 맞는 형태를 유지한다.

모달·바텀시트·토스트·선택 목록은 `lib/design/tokens.ts`의 `motion.normal` **200ms 진입**, `motion.fast` **120ms 종료**를 공유한다. 닫힘 애니메이션 동안 내용을 유지하고, 종료 중인 표면의 추가 조작을 막은 뒤 닫거나 제거한다. `prefers-reduced-motion: reduce`에서는 애니메이션·전환을 끄고 종료 대기를 생략한다. `Dialog`는 Escape·배경 클릭·포커스 복귀·본문 스크롤 잠금을 유지한다.

- 모달·바텀시트 하단 액션은 `components/ui/DialogActions.tsx`를 사용한다. 취소·확인 또는 단독 닫기·저장 버튼을 오른쪽으로 정렬하며, 좁은 화면에서도 정렬을 유지한 채 필요한 경우 줄을 바꾼다.
- `Toast` 하단의 3px 막대는 자동 닫힘까지 남은 4초를 표시한다. 새 메시지에서는 막대와 타이머를 함께 다시 시작하며, 부모의 일반 재렌더링이나 콜백 변경은 남은 시간을 초기화하지 않는다. 모션 감소 설정에서는 연속 축소 대신 1초 단위로 줄어든다. 시간 막대는 보조 장식으로 처리해 알림 문구의 음성 안내를 반복하지 않는다.
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
- `Primitives`: Button, Chip, Badge, EmptyState, Dialog/BottomSheet, Toast. Field, TextAreaField, SelectField는 전용 파일에서 구현하고 이 경로에서도 다시 export한다. AntD 래핑 없음.
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

### 공통 프로필 아바타

- `components/ui/Avatar.tsx`에 사진 주소·이름·크기·사진 위치를 주입한다. `components/crefans/ServiceUI.tsx`의 `Avatar`는 기존 `creator` 데이터를 이 공통 컴포넌트에 연결한다.
- 사진이 없거나 로딩에 실패하면 동일한 사람 모양 SVG를 표시한다. 사진 주소가 변경되면 다시 로딩한다. 목업 이름이나 이니셜로 대체하지 않는다.
- 사진과 기본 아이콘은 같은 정원 컨테이너를 사용하며 flex 레이아웃에서도 크기를 유지한다. 반응형 크기 조정은 `--avatar-size-override` 하나로 가로·세로를 함께 변경한다.
- 메시지, 프로필, 댓글, 알림, 구독 목록, 스튜디오의 프로필 사진에 재사용한다. `/design-system`의 **입력·선택 → 서비스 공통 아바타**에서 24~80px 크기와 사진 유무를 확인할 수 있다.

### 현재 브랜드 — 두 조각의 하트

첨부 로고 시안의 **3행 2번째**를 기준으로 비대칭 하트 심볼과 소문자 워드마크를 SVG로 재구성했다. `Brand`는 랜딩·팬·스튜디오·인증·디자인 카탈로그에서 공유하며, 가입 화면처럼 사진 위에 놓일 때는 `inverse`로 심볼과 워드마크 모두 흰색인 단색 로고를 사용한다. `public/brand/`에 기본 로고·반전 로고·심볼이 있고, 글자도 벡터 윤곽이므로 설치된 폰트에 영향을 받지 않는다. 심볼과 워드마크의 높이를 맞춘 로고 비율은 약 5.6:1이며 `--cf-brand-height`로 높이를 조절한다. 미리보기와 카탈로그의 파비콘도 같은 심볼이다.

| 역할 | 색상 | 토큰 |
| --- | --- | --- |
| 주요 버튼·선택·포커스 | 블루 `#2563EB` | `color.accent` / `service.brand` |
| 보조 강조 | 딥 블루 `#1E40AF` | `color.complementary` |
| 선택 배경 | 라이트 블루 `#EFF6FF` | `color.accentSoft` |
| 제목·본문 | 잉크 네이비 `#202333` | `color.text` |

일반적이고 쉽게 이해할 수 있는 UI를 위해 테마는 블루 계열로 통일한다. `lib/design/tokens.ts`에서 hover·active·focus·보조색·아바타 색상을 함께 관리한다. 랜딩의 색상 이름 토큰은 `landing.accent` / `landing.accentSoft`로 교체했다. 기본 아바타는 블루 계열, 성공·오류 상태는 별도 의미 색상을 사용한다. `/design-system` 첫 화면에서 두 로고와 역할별 색상을 비교할 수 있다. 이전 AntD 화면의 테마는 이 개편 범위에 포함되지 않는다.
