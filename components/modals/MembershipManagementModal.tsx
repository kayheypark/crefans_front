"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  message,
  List,
  Popconfirm,
  Tag,
  Divider,
  Card,
  Typography,
  Collapse,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import MembershipCard from "@/components/common/MembershipCard";
import AddMembershipModal from "./AddMembershipModal";
import EditMembershipModal from "./EditMembershipModal";
import { membershipAPI, MembershipItem } from "@/lib/api/membership";

const { TextArea } = Input;
const { Text } = Typography;
const { Panel } = Collapse;

// 일관된 스타일을 위한 상수
const INPUT_STYLES = {
  size: "large" as const,
  placeholder: {
    name: "예: 기본 멤버십",
    level: "1",
    price: "5000",
    description: "멤버십에 대한 설명을 입력하세요",
    benefits: "혜택을 입력하고 콤마(,)로 구분하세요",
    benefitsAdd: "혜택 추가...",
  },
  text: {
    fontSize: 12,
    color: "secondary" as const,
  },
  spacing: {
    marginTop: 8,
    marginBottom: 16,
  },
};

// 기존 Membership 인터페이스를 MembershipItem으로 대체하고, 호환성을 위해 확장
interface Membership extends Omit<MembershipItem, "benefits"> {
  benefits: string[]; // 필수 필드로 변경
}

interface MembershipManagementModalProps {
  open: boolean;
  onClose: () => void;
  onMembershipsUpdate: (memberships: MembershipItem[]) => void;
  currentMemberships?: MembershipItem[];
}

export default function MembershipManagementModal({
  open,
  onClose,
  onMembershipsUpdate,
  currentMemberships = [],
}: MembershipManagementModalProps) {
  const [form] = Form.useForm();
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
        setMemberships(response.data);
        onMembershipsUpdate(response.data);
      } else {
        message.error(
          response.message || "멤버십 목록을 불러오는데 실패했습니다."
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
  const handleMembershipAdded = (newMembership: MembershipItem) => {
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
  const handleDelete = async (id: number) => {
    try {
      const response = await membershipAPI.deleteMembership(id);
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

  return (
    <>
      <Modal
        title="멤버십 관리"
        open={open}
        onCancel={onClose}
        footer={
          <div style={{ textAlign: "center" }}>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setShowAddMembership(true)}
              style={{ height: "48px", fontSize: "16px", minWidth: "200px" }}
            >
              새 멤버십 생성
            </Button>
          </div>
        }
        style={{
          top: 20,
          ...MODAL_STYLES.mobile.style,
        }}
        styles={MODAL_STYLES.mobile.styles}
      >
        {/* 멤버십 목록 */}
        <div
          style={{
            maxHeight: "calc(90vh - 200px)",
            overflowY: "auto",
            paddingRight: "8px",
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">멤버십 목록을 불러오는 중...</Text>
              </div>
            </div>
          ) : memberships.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {memberships.map((membership) => (
                <MembershipCard
                  key={membership.id}
                  membership={{
                    ...membership,
                    // benefits를 안전하게 배열로 변환
                    benefits: Array.isArray(membership.benefits)
                      ? membership.benefits
                      : membership.benefits
                      ? membership.benefits.split(",").map((b) => b.trim())
                      : [],
                  }}
                  showActions={true}
                  onEdit={() => startEditing(membership)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#999",
                background: "#fafafa",
                borderRadius: "8px",
                border: "1px dashed #d9d9d9",
              }}
            >
              등록된 멤버십이 없습니다.
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                새 멤버십을 추가해보세요.
              </Text>
            </div>
          )}
        </div>
      </Modal>

      {/* 멤버십 추가 모달 */}
      <AddMembershipModal
        open={showAddMembership}
        onClose={() => setShowAddMembership(false)}
        onMembershipAdded={handleMembershipAdded}
      />

      {/* 멤버십 수정 모달 */}
      <EditMembershipModal
        open={showEditMembership}
        onClose={() => setShowEditMembership(false)}
        membership={editingMembership}
        onMembershipUpdated={handleMembershipUpdated}
      />
    </>
  );
}
