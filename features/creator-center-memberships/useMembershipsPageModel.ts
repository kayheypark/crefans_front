"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { useCreatorGuard } from "@/hooks/useCreatorGuard";
import { useState } from "react";

// 목업 데이터
const mockMemberships = [
  {
    id: 1,
    name: "베이직",
    level: 1,
    price: 10000,
    description: "기본 멤버십 혜택",
    subscriberCount: 45,
    monthlyRevenue: 450000,
    isActive: true,
    benefits: ["기본 콘텐츠", "댓글 작성"],
  },
  {
    id: 2,
    name: "프리미엄",
    level: 2,
    price: 30000,
    description: "프리미엄 멤버십 혜택",
    subscriberCount: 23,
    monthlyRevenue: 690000,
    isActive: true,
    benefits: ["모든 콘텐츠", "우선 댓글", "1:1 채팅"],
  },
  {
    id: 3,
    name: "VIP",
    level: 3,
    price: 50000,
    description: "VIP 멤버십 혜택",
    subscriberCount: 8,
    monthlyRevenue: 400000,
    isActive: false,
    benefits: ["모든 콘텐츠", "우선 댓글", "1:1 채팅", "개인화 서비스"],
  },
];

const mockSubscribers = [
  {
    id: 1,
    name: "김구독자",
    email: "subscriber1@example.com",
    membershipLevel: 2,
    membershipName: "프리미엄",
    joinDate: "2024-01-15",
    nextBillingDate: "2024-02-15",
    status: "active",
    totalPaid: 30000,
  },
  {
    id: 2,
    name: "이구독자",
    email: "subscriber2@example.com",
    membershipLevel: 1,
    membershipName: "베이직",
    joinDate: "2024-01-10",
    nextBillingDate: "2024-02-10",
    status: "active",
    totalPaid: 10000,
  },
  {
    id: 3,
    name: "박구독자",
    email: "subscriber3@example.com",
    membershipLevel: 3,
    membershipName: "VIP",
    joinDate: "2024-01-05",
    nextBillingDate: "2024-02-05",
    status: "cancelled",
    totalPaid: 50000,
  },
];

export function useMembershipsPageModel({
  message,
  form,
}: {
  message: Feedback;
  form: FormController;
}) {
  // 로그인 및 크리에이터 권한 필수
  const { isLoading, hasAccess } = useCreatorGuard({
    requiresLogin: true,
    requiresCreator: true,
  });

  const [memberships, setMemberships] = useState(mockMemberships);

  const [subscribers, setSubscribers] = useState(mockSubscribers);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingMembership, setEditingMembership] = useState<any>(null);

  const handleAdd = () => {
    setEditingMembership(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (membership: any) => {
    setEditingMembership(membership);
    form.setFieldsValue(membership);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setMemberships(memberships.filter((m) => m.id !== id));
    message.success("멤버십이 삭제되었습니다.");
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingMembership) {
        // 수정
        setMemberships(
          memberships.map((m) =>
            m.id === editingMembership.id ? { ...m, ...values } : m,
          ),
        );
        message.success("멤버십이 수정되었습니다.");
      } else {
        // 추가
        const newMembership = {
          id: Math.max(...memberships.map((m) => m.id)) + 1,
          ...values,
          subscriberCount: 0,
          monthlyRevenue: 0,
          isActive: true,
        };
        setMemberships([...memberships, newMembership]);
        message.success("멤버십이 추가되었습니다.");
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("폼 검증 실패:", error);
    }
  };

  const totalSubscribers = memberships.reduce(
    (sum, m) => sum + m.subscriberCount,
    0,
  );

  const totalRevenue = memberships.reduce(
    (sum, m) => sum + m.monthlyRevenue,
    0,
  );

  return {
    isLoading,
    hasAccess,
    memberships,
    subscribers,
    isModalOpen,
    setIsModalOpen,
    editingMembership,
    form,
    handleAdd,
    handleEdit,
    handleDelete,
    handleModalOk,
    totalSubscribers,
    totalRevenue,
  };
}
