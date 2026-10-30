import type {ServiceEvent} from '@/types/crefans-events';

const participationNotes:ServiceEvent['notes'][number]={
 "title": "참여 대상과 지급 기준",
 "items": [
  "운영자가 참여를 확정한 만 19세 이상 테스터가 대상입니다. 크리에이터 3명과 팬 13명으로 구성하며, “참여자 전원”은 이 테스터를 뜻합니다. 회원가입만으로 혜택이 자동 지급되지는 않습니다.",
  "같은 혜택은 1인 1회 지급하며, 각 이벤트에 안내된 참여 역할과 대상 기준에 따라 제공합니다. 여러 계정으로 중복 수령할 수 없습니다.",
  "참여 기간, 참여 방법과 완료 기준, 혜택 지급일은 아직 미정입니다. 확정 후 이 페이지에 안내하며, 안내되지 않은 활동 조건을 나중에 소급해 적용하지 않습니다."
 ]
};
const contactNotes:ServiceEvent['notes'][number]={
 "title": "개인정보·부정 참여·문의",
 "items": [
  "이벤트 참여가 광고성 정보 수신이나 프로필·피드백의 외부 광고 활용 동의를 뜻하지는 않습니다.",
  "중복 수령, 타인 계정 도용, 참여 기록 조작이 확인되면 해당 신청의 혜택 지급이 제한될 수 있습니다. 제한 사유의 확인과 이의 제기는 고객센터에서 접수합니다.",
  "일정이나 제공 방식의 변경이 필요하면 사유와 변경 내용을 이 페이지에 안내합니다. 이미 충족한 지급 조건을 소급해 불리하게 변경하지 않습니다. 지급 누락이나 안내와 다른 내용도 고객센터로 알려주세요."
 ]
};
const campaign={
 campaignTitle:'크레팬스 오픈베타',
 campaignSubtitle:'함께 만들어 주셔서 감사합니다',
 schedule:"참여 기간과 혜택 지급일은 아직 미정이며, 확정 후 이 페이지에서 안내합니다.",
};

/** Published editorial content, shared by preview and service routes. No reward grants occur here. */
export const serviceEvents:readonly ServiceEvent[]=[
 {
  ...campaign,
  "id": "beta-feedback",
 "title": "네이버페이 1만원 상품권 이벤트",
 "summary": "유용한 피드백을 주신 분 중 최대 3명에게 드립니다.",
 "theme": "gift",
 "banner": {
  "title": "네이버페이\n1만원 상품권",
  "description": "유용한 피드백 제공자 최대 3명"
 },
 "image": "/brand/events/beta-first/naverpay-10000-cropped-v2.png",
 "imageWidth": 211,
 "imageHeight": 123,
 "rewards": [
  {
   "audience": "유용한 피드백 제공자 최대 3명",
   "title": "네이버페이\n1만원 상품권",
   "image": "/brand/events/beta-first/naverpay-10000-cropped-v2.png",
   "details": [
    "유용한 피드백을 주신 분 중 최대 3명에게 드립니다."
   ]
  }
 ],
  notes:[participationNotes,
{
 "title": "유용한 피드백 선정",
 "items": [
  "참여 확정 테스터 중 운영자가 피드백의 구체성, 문제의 재현 가능성, 서비스 개선 기여도를 종합해 최대 3명을 선정합니다. 칭찬 여부나 결제 금액은 평가 기준이 아니며, 불편 사항과 비판적인 의견도 같은 기준으로 검토합니다.",
  "크리에이터와 팬 모두 선정 대상이며, 피드백 상품권은 기본 참여 혜택과 별도로 1인 1회 받을 수 있습니다. 선정 결과와 지급 방법은 대상자에게 개별 안내합니다.",
  "피드백 접수·선정 일정은 아직 미정이며, 확정 후 이 페이지에서 안내합니다."
 ]
},
{
 "title": "네이버페이 1만원 상품권",
 "items": [
  "선정된 분께 네이버페이 1만원 상품권을 제공합니다. 등록 기한, 사용처, 유효기간, 연장·환불 가능 여부는 실제 발급 상품의 조건을 지급 전에 안내합니다. 모든 상품권의 조건이 동일한 것은 아닙니다.",
  "네이버페이 계정에 포인트 쿠폰을 등록해 사용하는 상품권입니다. 계정 이용과 포인트 등록 등 발행사의 사용 조건을 충족해야 합니다. 연락처 오류, 미수신 또는 등록 문제는 고객센터로 문의해 주세요.",
  "상품권 발송에 추가 정보가 필요하면 선정된 분께 필요한 최소한의 정보만 요청하며, 수집 목적·항목·보유 기간과 제공 거부 시 영향을 먼저 안내합니다."
 ]
},
  contactNotes],
 },
 {
  ...campaign,
  "id": "beta-creator-advertising",
 "title": "주목할 크리에이터 광고상품 30일 이벤트",
 "summary": "크리에이터 3명에게 드립니다.",
 "theme": "advertising",
 "banner": {
  "title": "주목할 크리에이터\n광고상품 30일",
  "description": "크리에이터 3명"
 },
 "image": "/brand/events/beta-first/color-cards-v1/crown.webp",
 "imageWidth": 512,
 "imageHeight": 512,
 "rewards": [
  {
   "audience": "크리에이터 3명",
   "title": "주목할 크리에이터\n광고상품 30일",
   "image": "/brand/events/beta-first/color-cards-v1/crown.webp",
   "details": [
    "크리에이터 3명에게 드립니다.",
    "주목할 크리에이터 광고상품 이용권을 제공합니다."
   ]
  }
 ],
  notes:[participationNotes,
{
 "title": "주목할 크리에이터 광고상품",
 "items": [
  "참여가 확정된 크리에이터 3명에게 “주목할 크리에이터” 영역의 광고상품 30일 이용권을 제공합니다. 노출 시작·종료 일정과 적용 방식은 제공 전에 안내합니다.",
  "특정 순위의 고정 노출, 노출 횟수, 팔로워·구독자 증가나 매출을 보장하는 혜택은 아닙니다."
 ]
},
  contactNotes],
 },
 {
  ...campaign,
  "id": "beta-promotion-beans",
 "title": "프로모션 100콩 이벤트",
 "summary": "팬 참여자 13명에게 지급합니다.",
 "theme": "beans",
 "banner": {
  "title": "프로모션 100콩",
  "description": "팬 참여자 13명"
 },
 "image": "/brand/events/beta-first/color-cards-v1/beans.webp",
 "imageWidth": 512,
 "imageHeight": 512,
 "rewards": [
  {
   "audience": "팬 참여자 13명",
   "title": "프로모션 100콩",
   "image": "/brand/events/beta-first/color-cards-v1/beans.webp",
   "details": [
    "팬 참여자 13명에게 지급합니다.",
    "프로모션 콩은 후원받은 사람이 출금할 수 있습니다."
   ],
   "notice": "이벤트로 지급받은 프로모션콩은 직접 출금할 수 없습니다. 후원 수익은 최소 1,000콩·수수료 20% 조건이 적용되며, 현재 베타에서는 실제 은행 출금을 제공하지 않습니다."
  }
 ],
  notes:[participationNotes,
{
 "title": "프로모션 100콩과 출금",
 "items": [
  "참여가 확정된 팬 13명에게 100콩씩 지급합니다. 현금 지급 혜택은 아닙니다. 이벤트로 지급받은 프로모션 콩은 직접 출금할 수 없으며 후원에 사용할 수 있습니다. 지급받은 프로모션콩은 지급일로부터 5년간 쓸 수 있고 만료 30일 전에 알려 드리며, 만료되거나 탈퇴하면 남은 콩은 사라집니다. 본인 계정에 대한 후원은 허용되지 않습니다.",
  "프로모션 콩을 후원받은 크리에이터의 수익은 출금 대상에 포함됩니다. 출금 조건을 충족한 후원 수익이 1,000콩(수수료 차감 전 10만원) 이상이어야 하며, 수수료 20%를 차감합니다. 1,000콩 출금 시 실지급액은 8만원입니다.",
  "후원·지급 이력과 본인 계좌 확인이 필요하며, 보류·동결된 수익은 출금 가능액에서 제외됩니다. 이벤트 100콩만 후원받은 경우에는 최소 출금 수량을 충족하지 않습니다.",
  "현재 베타에서는 실제 은행 출금을 제공하지 않습니다. 실제 출금 서비스 개시 일정은 별도 안내합니다."
 ]
},
  contactNotes],
 },
 {
  ...campaign,
  "id": "beta-founding-badge",
 "title": "원년멤버 한정판 뱃지 이벤트",
 "summary": "참여가 확정된 테스터 전원에게 드립니다.",
 "theme": "badge",
 "banner": {
  "title": "원년멤버 한정판 뱃지",
  "description": "참여 확정 테스터 전원"
 },
 "image": "/brand/events/beta-first/color-cards-v1/badge.webp",
 "imageWidth": 512,
 "imageHeight": 512,
 "rewards": [
  {
   "audience": "참여 확정 테스터 전원",
   "title": "원년멤버 한정판 뱃지",
   "image": "/brand/events/beta-first/color-cards-v1/badge.webp",
   "details": [
    "참여가 확정된 테스터 전원에게 드립니다.",
    "배지 지급 후 프로필 페이지에 표시됩니다.",
    "표시 여부는 직접 선택할 수 있습니다."
   ]
  }
 ],
  notes:[participationNotes,
{
 "title": "원년멤버 한정판 배지",
 "items": [
  "참여 확정 테스터 전원에게 제공하는 기념 배지입니다. 크리에이터 인증이나 서비스의 품질·신뢰를 보증하는 표시는 아닙니다.",
  "배지는 지급 시 프로필에서 표시하거나 숨길 수 있도록 제공할 예정이며, 제공 일정은 별도 안내합니다."
 ]
},
  contactNotes],
 },
];
