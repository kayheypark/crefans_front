"use client";
import { Form as UiForm, message as uiMessage } from "antd";

import MembershipCard from "@/components/common/MembershipCard";
import AddMembershipModal from "@/components/modals/AddMembershipModal";
import EditMembershipModal from "@/components/modals/EditMembershipModal";
import { MembershipManagementModalProps } from "@/features/modals-membership-management-modal/types";
import { useMembershipManagementModalModel } from "@/features/modals-membership-management-modal/useMembershipManagementModalModel";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Spin, Typography } from "antd";

const { Text } = Typography;

export default function MembershipManagementModal(
  props: MembershipManagementModalProps,
) {
  const [form] = UiForm.useForm();
  const model = useMembershipManagementModalModel(props, {
    message: uiMessage,
    form,
  });
  return <MembershipManagementModalView {...props} model={model} />;
}

function MembershipManagementModalView({
  open,
  onClose,
  onMembershipsUpdate,
  currentMemberships = [],
  model,
}: MembershipManagementModalProps & {
  model: ReturnType<typeof useMembershipManagementModalModel>;
}) {
  const {
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
  } = model;

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
                    // price를 number로 변환
                    price:
                      typeof membership.price === "string"
                        ? parseFloat(membership.price) || 0
                        : membership.price,
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
