"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { MembershipManagementModalProps } from "@/features/modals-membership-management-modal/types";
import { membershipAPI, MembershipItem } from "@/lib/api/membership";
import { useEffect, useState } from "react";

export function useMembershipManagementModalModel(
  {
    open,
    onClose,
    onMembershipsUpdate,
    currentMemberships = [],
  }: MembershipManagementModalProps,
  { message, form }: { message: Feedback; form: FormController },
) {
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [previewBenefits, setPreviewBenefits] = useState<string[]>([]);

  const [inputValue, setInputValue] = useState("");

  const [showAddMembership, setShowAddMembership] = useState(false);

  const [showEditMembership, setShowEditMembership] = useState(false);

  const [editingMembership, setEditingMembership] =
    useState<MembershipItem | null>(null);

  // 멤버십 목록 로드
  const loadMemberships = async () => {
    if (!open) return;

    setIsLoading(true);
    try {
      const response = await membershipAPI.getMemberships();
      if (response.success) {
        const memberships = response.data.memberships || [];
        setMemberships(memberships);
        onMembershipsUpdate(memberships);
      } else {
        message.error(
          response.message || "멤버십 목록을 불러오는데 실패했습니다.",
        );
      }
    } catch (error) {
      console.error("멤버십 목록 로드 실패:", error);
      message.error("멤버십 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemberships();
  }, [open]);

  // 멤버십 추가
  const handleMembershipAdded = (newMembership?: MembershipItem) => {
    loadMemberships(); // 새로고침하여 최신 데이터 로드
    setShowAddMembership(false); // 멤버십 추가 모달 닫기
  };

  // 멤버십 수정
  const handleMembershipUpdated = (updatedMembership: MembershipItem) => {
    loadMemberships(); // 새로고침하여 최신 데이터 로드
    setShowEditMembership(false); // 멤버십 수정 모달 닫기
  };

  // 멤버십 수정 시작
  const startEditing = (membership: MembershipItem) => {
    setEditingMembership(membership);
    setShowEditMembership(true);
  };

  // 멤버십 삭제
  const handleDelete = async (id: string | number) => {
    try {
      const response = await membershipAPI.deleteMembership(String(id));
      if (response.success) {
        message.success("멤버십이 삭제되었습니다.");
        loadMemberships(); // 새로고침하여 최신 데이터 로드
      } else {
        message.error(response.message || "멤버십 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("멤버십 삭제 실패:", error);
      message.error("멤버십 삭제에 실패했습니다.");
    }
  };

  // 취소
  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
    setEditingId(null);
    setPreviewBenefits([]);
    setInputValue("");
  };

  return {
    memberships,
    isLoading,
    showAddMembership,
    setShowAddMembership,
    showEditMembership,
    setShowEditMembership,
    editingMembership,
    handleMembershipAdded,
    handleMembershipUpdated,
    startEditing,
    handleDelete,
  };
}
