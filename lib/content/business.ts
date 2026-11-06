/** Operator details shown in the service footer. Name, representative, registration number and address match the published terms/privacy text (server `src/platform/legal-documents.ts`); support email khpark@crefans.com (owner decision 2026-10-29). */
export const businessInfo={
 name:'좋아하는일해야지',
 representative:'박경호',
 registrationNumber:'377-02-02940',
 address:'서울특별시 관악구 관천로24길 43, 301호(신림동)',
 email:'khpark@crefans.com',
 phone:'010-3211-3164',
 // 통신판매업 신고번호: 2026-11-04 신고(서울특별시 관악구), 공정위 통신판매사업자 조회로 확인(2026-11-06).
 // Shown in the sidebar and footer business info (components/crefans/BusinessInfo.tsx).
 mailOrderNumber:'2026-서울관악-2144' as string|null,
 // 호스팅서비스 제공자 상호(전자상거래법 시행령 제11조의4, 시행규칙 제7조 초기 화면 표시). AWS 청구서 계약 법인명, 2026-11-06 사업자 확인.
 hostingProvider:'Amazon Web Services Korea LLC',
};

/**
 * 통신판매중개자 고지(전자상거래법 제20조①, 시행규칙 제11조의2: 초기 화면과 청약 절차에 미리 고지). 문구는 이용약관 제1조
 * (server src/platform/legal-documents.ts)와 같다. 바꾸면 약관과 함께 바꾼다. 2026-11-06 사용자 결정.
 */
export const intermediaryNotice='크레팬스는 크리에이터 멤버십 거래의 통신판매중개자로 거래 당사자가 아니며, 멤버십의 판매자는 각 크리에이터입니다. 콩은 크레팬스가 직접 판매합니다.';

/** Public product guide (crefans_guide), opened in a new tab from the sidebar and settings. */
export const guideSiteUrl='https://guide.crefans.com/';
// 2026-10-31: the closed beta host now only points visitors to the main service (components/service/BetaClosedNotice).
export const mainServiceOrigin='https://crefans.com';
export const closedBetaHost='beta.crefans.com';
