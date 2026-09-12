import type { ComponentProps } from "react";
import type MembershipCard from "@/components/common/MembershipCard";
import type PaymentHistoryItem from "@/components/common/PaymentHistoryItem";
import type MediaGallery from "@/components/media/MediaGallery";

export const catalogSections = [
  {
    id: "tokens",
    title: "디자인 토큰",
    label: "01",
    keywords: "색상 color 간격 spacing radius shadow 모션 motion breakpoint",
  },
  {
    id: "typography",
    title: "타이포그래피",
    label: "02",
    keywords: "글꼴 font 제목 heading 본문 text 링크 숫자",
  },
  {
    id: "actions",
    title: "버튼과 아이콘",
    label: "03",
    keywords: "button icon loading hover focus active disabled",
  },
  {
    id: "inputs",
    title: "입력과 선택",
    label: "04",
    keywords:
      "input password search textarea number select 셀렉트 checkbox radio switch slider date time upload",
  },
  {
    id: "validation",
    title: "폼과 오류 메시지",
    label: "05",
    keywords:
      "form validation error 에러 helper required success warning disabled",
  },
  {
    id: "feedback",
    title: "알림과 상태 피드백",
    label: "06",
    keywords:
      "snackbar toast message 스낵바 alert 알랏 notification progress loading skeleton empty result error",
  },
  {
    id: "overlays",
    title: "모달과 확인창",
    label: "07",
    keywords: "modal dialog confirm 컨펌 drawer tooltip popover popconfirm",
  },
  {
    id: "data",
    title: "데이터 표시",
    label: "08",
    keywords:
      "table list avatar badge tag card descriptions statistic timeline collapse",
  },
  {
    id: "navigation",
    title: "탐색과 구조",
    label: "09",
    keywords:
      "tabs breadcrumb menu dropdown steps pagination segmented divider",
  },
  {
    id: "components",
    title: "데이터 기반 컴포넌트",
    label: "10",
    keywords:
      "membership 멤버십 payment 결제 media 미디어 category 카테고리 feed filter 데이터 주입 긴 empty",
  },
  {
    id: "states",
    title: "상태 비교표",
    label: "11",
    keywords:
      "default hover focus active loading disabled readOnly error warning 기본 비활성 읽기전용",
  },
] as const;

export type FixtureScenario = "normal" | "long" | "empty";

export function createComponentFixtures(scenario: FixtureScenario) {
  const long = scenario === "long";
  const memberships: ComponentProps<typeof MembershipCard>["membership"][] =
    scenario === "empty"
      ? []
      : [
          {
            id: "sample-basic",
            name: long
              ? "함께 만드는 이야기를 가장 먼저 만나는 크리에이터 멤버십"
              : "베이직 멤버십",
            level: 1,
            price: long ? 1250000 : 9900,
            description: long
              ? "글과 사진, 영상으로 기록한 창작의 과정을 함께 나눕니다. 긴 설명이 들어왔을 때 줄바꿈과 카드 높이가 어떻게 달라지는지 확인할 수 있습니다."
              : "매주 새로운 이야기와 멤버 전용 콘텐츠를 만나보세요.",
            benefits: long
              ? [
                  "멤버 전용 콘텐츠와 창작 과정 전체 공개",
                  "매월 라이브 Q&A 및 비하인드 이야기",
                  "신규 프로젝트 선공개와 참여 기회",
                ]
              : ["멤버 전용 콘텐츠", "월 1회 라이브"],
            billing_unit: "MONTH",
            billing_period: 1,
          },
          {
            id: "sample-plus",
            name: "플러스 멤버십",
            level: 2,
            price: 19900,
            description: "조금 더 가까이, 더 깊은 이야기를 나눠요.",
            benefits: [
              "베이직 혜택 포함",
              "비하인드 스토리",
              "라이브 다시보기",
            ],
            billing_unit: "MONTH",
            billing_period: 1,
          },
        ];
  const payments: ComponentProps<typeof PaymentHistoryItem>[] =
    scenario === "empty"
      ? []
      : [
          {
            id: "sample-payment",
            type: "membership",
            amount: long ? 1250000 : 9900,
            currency: "KRW",
            status: "completed",
            description: long
              ? "크리에이터의 모든 순간을 함께하는 프리미엄 멤버십 정기 결제"
              : "베이직 멤버십 정기 결제",
            paymentMethod: "카드 · 1234",
            date: "2026-09-10T12:00:00+09:00",
            merchant: long
              ? "아주 긴 이름을 가진 크리에이터 스튜디오"
              : "소연의 스튜디오",
          },
        ];
  const media: ComponentProps<typeof MediaGallery>["items"] =
    scenario === "empty"
      ? []
      : [
          {
            id: "sample-image-a",
            url: "/image_4_400x240.png",
            type: "image",
            order: 0,
          },
          {
            id: "sample-image-b",
            url: "/image_5_480x320.png",
            type: "image",
            order: 1,
          },
          {
            id: "sample-image-c",
            url: "/image_6_640x480.png",
            type: "image",
            order: 2,
          },
        ];
  return { memberships, payments, media };
}

export const creatorRows = [
  {
    key: "one",
    name: "소연의 스튜디오",
    category: "일러스트",
    members: 128,
    status: "활성",
  },
  {
    key: "two",
    name: "지우의 작은 기록",
    category: "라이프",
    members: 64,
    status: "검토 중",
  },
  {
    key: "three",
    name: "민준의 뮤직룸",
    category: "음악",
    members: 32,
    status: "비활성",
  },
];
