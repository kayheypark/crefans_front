# UI migration plan

검증된 설치 버전: Next 14.2.28, React 18.3.1, Ant Design 5.25.1. App Router 기반.

## 현재 구조
- app/(main): MainLayout을 통해 팬 피드·탐색·프로필·글쓰기·설정을 구성한다.
- app/creator-center: 크리에이터 가입·멤버십·수익·설정·글쓰기. 대시보드·출금 등 목업 항목은 실제 API 지원 여부를 먼저 검증해야 한다.
- app/globals.css는 비어 있고 root layout이 antd reset과 ConfigProvider, AntdApp을 제공한다.
- 기존 색상/간격: lib/theme.ts, lib/constants. 새 기준은 lib/design/tokens.ts.
- features의 모델 훅과 lib/api, types는 보존한다. MainLayout의 message 어댑터, AntD Form 인스턴스, 모달·테이블 렌더링 계약은 이전 시 검토한다.

## KEEP / REPLACE / REVIEW
- KEEP: 인증·API·DTO·모델 훅·라우팅·기능. 서버 계약은 근거 없이 변경하지 않는다.
- REPLACE: 새 화면 마크업·스타일·내비게이션·토큰·반응형. AntD 래핑이나 override를 새 시스템으로 사용하지 않는다.
- REVIEW: 폼 검증 어댑터, 메시지 호출, 모달 포커스, 권한별 UI, 결제·출금 상태.

## 순서와 완료 기준
1. 현재 단계: /design-system을 자체 HTML/CSS 기반 카탈로그로 교체. 토큰·AppShell·탐색·입력·상태·Dialog/BottomSheet·콘텐츠 컴포넌트 검증. 기존 서비스 페이지에 혼합하지 않는다.
2. 팬 화면: Home → Explore → Creator Profile → Post → Membership → Messages → Profile. 실제 모델/props를 연결하고 권한·로딩·빈 상태·오류·모바일 375/390/430px를 검증한다.
3. 스튜디오: Dashboard → Content → Memberships → Subscribers → Analytics → Earnings → Payouts → Settings. 없는 API는 요구/계약을 먼저 기록한다. mock을 실제 데이터로 표시하지 않는다.
4. 새 화면 전체 전환 후 미사용 AntD 의존성을 제거한다. 현재 기존 서비스가 사용 중이므로 패키지는 유지한다.

## AntD 사용 위치 (분석 시점)

- app/(auth)/login/page.tsx
- app/(main)/board/[id]/page.tsx
- app/(main)/board/page.tsx
- app/(main)/home/SignUpModal.tsx
- app/(main)/payment-history/page.tsx
- app/(main)/profile/edit/page.tsx
- app/(main)/profile/page.tsx
- app/(main)/support/page.tsx
- app/(main)/write/page.tsx
- app/creator-center/become-creator/page.tsx
- app/creator-center/donations/page.tsx
- app/creator-center/earnings/page.tsx
- app/creator-center/memberships/page.tsx
- app/creator-center/page.tsx
- app/creator-center/settings/page.tsx
- app/creator-center/write/page.tsx
- app/email-verification/page.tsx
- app/layout.tsx
- app/not-found.tsx
- app/payment/fail/page.tsx
- app/payment/success/page.tsx
- app/post/[id]/page.tsx
- app/subscription/[creatorId]/page.tsx
- app/subscription/billing/fail/page.tsx
- app/subscription/billing/success/page.tsx
- app/subscription/manage/page.tsx
- components/auth/AuthGuard.tsx
- components/auth/LogoutModal.tsx
- components/comment/CommentList.tsx
- components/common/EmailAutoComplete.tsx
- components/common/FeedFilter.tsx
- components/common/FollowButton.tsx
- components/common/MembershipCard.tsx
- components/design-system/Controls.tsx
- components/design-system/DesignSystem.tsx
- components/design-system/Foundations.tsx
- components/design-system/Patterns.tsx
- components/design-system/PostPreview.tsx
- components/design-system/RedesignTokens.tsx
- components/design-system/ServiceComponents.tsx
- components/feed/Feed.tsx
- components/layout/CreatorCenterLayout.tsx
- components/layout/MainLayout.tsx
- components/media/MediaGallery.tsx
- components/modals/AddMembershipModal.tsx
- components/modals/ChargeModal.tsx
- components/modals/DeleteAccountModal.tsx
- components/modals/DonationModal.tsx
- components/modals/EditMembershipModal.tsx
- components/modals/HandleModal.tsx
- components/modals/LoginModal.tsx
- components/modals/MembershipJoinModal.tsx
- components/modals/MembershipManagementModal.tsx
- components/modals/NicknameModal.tsx
- components/modals/ReportModal.tsx
- components/profile/Profile.tsx
- components/settings/Settings.tsx
- features/creator-center-write/useWritePageModel.ts
- lib/design/theme.ts
- lib/theme.ts
