import type { IPost } from "@/types/post";

export const demoCreator = {
  id: "landing-demo-seoyun",
  name: "서윤의 데일리 무브",
  handle: "seoyun-move-demo",
  avatar: "/illustrations/fitness/seoyun-selfie.png",
};

export const demoMemberships = [
  { id: "demo-basic", name: "함께 움직이기", level: 1, price: 9900,
    description: "나만의 운동 습관을 만들어가는 멤버십",
    benefits: ["멤버십 전용 운동 기록", "주간 루틴 콘텐츠"] },
  { id: "demo-plus", name: "조금 더 꾸준하게", level: 2, price: 19900,
    description: "더 다양한 운동 콘텐츠를 만나보세요",
    benefits: ["레벨 1 혜택 포함", "심화 루틴 콘텐츠"] },
];

export function createDemoPost(member: boolean): IPost {
  const content = member
    ? "오늘의 등 운동 기록을 멤버들과 나눠요. 덤벨 로우를 하면서 느꼈던 점과 이번 주 루틴을 정리했어요. 쉽지만은 않았지만, 함께하니 조금 더 꾸준해집니다."
    : "마지막 세트는 정말 그만하고 싶었지만, 오늘도 나와의 약속을 지켰어요. 잘하는 날도, 힘든 날도 솔직하게 기록해볼게요. 여러분은 오늘 어떤 운동을 했나요?";
  return {
    id: member ? "demo-member-post" : "demo-public-post", creator: demoCreator,
    title: member ? "멤버들과 나누는 등 운동 루틴과 기록" : "힘들어도 웃으면서, 오늘의 운동 완료",
    content, isMembershipOnly: member, isGotMembership: true,
    allowComments: false, createdAt: "2026-09-11T09:00:00+09:00",
    textLength: content.length, imageCount: 1, videoCount: 0, commentCount: 0,
    likeCount: 24, isLiked: false,
    media: [{ id: "demo-fitness-photo", type: "IMAGE", originalName: "seoyun-gym-row.png",
      mediaUrl: "/illustrations/fitness/seoyun-gym-row.png", processingStatus: "COMPLETED" }],
  };
}
