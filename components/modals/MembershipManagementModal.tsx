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

interface Membership {
  id: number;
  name: string;
  level: number;
  price: number;
  description: string;
  benefits: string[];
}

interface MembershipManagementModalProps {
  open: boolean;
  onClose: () => void;
  onMembershipsUpdate: (memberships: Membership[]) => void;
  currentMemberships: Membership[];
}

export default function MembershipManagementModal({
  open,
  onClose,
  onMembershipsUpdate,
  currentMemberships,
}: MembershipManagementModalProps) {
  const [form] = Form.useForm();
  const [memberships, setMemberships] =
    useState<Membership[]>(currentMemberships);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewBenefits, setPreviewBenefits] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showAddMembership, setShowAddMembership] = useState(false);
  const [showEditMembership, setShowEditMembership] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(
    null
  );

  useEffect(() => {
    setMemberships(currentMemberships);
  }, [currentMemberships]);

  // 멤버십 추가
  const handleMembershipAdded = (newMembership: Membership) => {
    const updatedMemberships = [...memberships, newMembership];
    setMemberships(updatedMemberships);
    onMembershipsUpdate(updatedMemberships);
  };

  // 멤버십 수정
  const handleMembershipUpdated = (updatedMembership: Membership) => {
    const updatedMemberships = memberships.map((membership) =>
      membership.id === updatedMembership.id ? updatedMembership : membership
    );
    setMemberships(updatedMemberships);
    onMembershipsUpdate(updatedMemberships);
  };

  // 멤버십 수정 시작
  const startEditing = (membership: Membership) => {
    setEditingMembership(membership);
    setShowEditMembership(true);
  };

  // 멤버십 삭제
  const handleDelete = (id: number) => {
    const updatedMemberships = memberships.filter(
      (membership) => membership.id !== id
    );
    setMemberships(updatedMemberships);
    message.success("멤버십이 삭제되었습니다.");
    onMembershipsUpdate(updatedMemberships);
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
          {memberships.length > 0 ? (
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
                  membership={membership}
                  showActions={true}
                  onEdit={startEditing}
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
