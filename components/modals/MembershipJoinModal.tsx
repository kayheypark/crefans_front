"use client";
import { message as uiMessage } from "antd";

import { MembershipJoinModalProps } from "@/features/modals-membership-join-modal/types";
import { useMembershipJoinModalModel } from "@/features/modals-membership-join-modal/useMembershipJoinModalModel";
import { getParticle } from "@/lib/utils/koreanUtils";
import {
  CheckOutlined,
  CrownOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, Modal, Space, Tag, Typography } from "antd";

const { Title, Text } = Typography;

export default function MembershipJoinModal(props: MembershipJoinModalProps) {
  const model = useMembershipJoinModalModel(props, { message: uiMessage });
  return <MembershipJoinModalView {...props} model={model} />;
}

function MembershipJoinModalView({
  open,
  onClose,
  creatorName,
  creatorHandle,
  creatorAvatar,
  memberships,
  defaultSelectedMembershipId,
  subscribedMembershipIds = [],
  model,
}: MembershipJoinModalProps & {
  model: ReturnType<typeof useMembershipJoinModalModel>;
}) {
  const {
    selectedMembership,
    setSelectedMembership,
    isSubmitting,
    handleJoin,
    handleClose,
    getBillingText,
    getTrialText,
  } = model;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CrownOutlined style={{ color: "#faad14", fontSize: 20 }} />
          <span>멤버십 가입</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      centered
      maskClosable={false} // 모달 밖 영역 클릭으로 닫히지 않도록 설정
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: 16,
        },
      }}
    >
      <div style={{ padding: "8px 0" }}>
        {/* 크리에이터 정보 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            padding: 16,
            background: "#fafafa",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {creatorAvatar ? (
              <img
                src={creatorAvatar}
                alt={creatorName}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <HeartOutlined style={{ color: "#ff6b6b" }} />
            )}
          </div>
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
              {creatorName}
            </Title>
            <Text type="secondary">@{creatorHandle}</Text>
          </div>
        </div>

        {/* 멤버십 선택 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            멤버십 선택
          </Title>

          <div style={{ width: "100%" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              {memberships.map((membership) => {
                const isSubscribed = subscribedMembershipIds.includes(
                  membership.id,
                );
                return (
                  <div
                    key={membership.id}
                    style={{
                      width: "100%",
                      display: "block",
                      marginBottom: 0,
                    }}
                    onClick={() => {
                      if (!isSubscribed) {
                        setSelectedMembership(membership);
                      }
                    }}
                  >
                    <Card
                      size="small"
                      style={{
                        width: "100%",
                        marginTop: 8,
                        marginLeft: 0,
                        marginRight: 0,
                        border: isSubscribed
                          ? "1px solid #d9d9d9"
                          : selectedMembership?.id === membership.id
                            ? "2px solid #1890ff"
                            : "1px solid #d9d9d9",
                        backgroundColor: isSubscribed
                          ? "#f5f5f5"
                          : selectedMembership?.id === membership.id
                            ? "#e6f7ff"
                            : "#fff",
                        opacity: isSubscribed ? 0.6 : 1,
                        cursor: isSubscribed ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        boxShadow:
                          selectedMembership?.id === membership.id &&
                          !isSubscribed
                            ? "0 2px 8px rgba(24, 144, 255, 0.15)"
                            : "none",
                        position: "relative",
                      }}
                      bodyStyle={{
                        padding: "12px",
                        width: "100%",
                      }}
                    >
                      {isSubscribed && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "#52c41a",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "600",
                            zIndex: 10,
                            boxShadow: "0 2px 8px rgba(82, 196, 26, 0.3)",
                          }}
                        >
                          구독중
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 8,
                            }}
                          >
                            <Text
                              strong
                              style={{
                                fontSize: 16,
                                color: isSubscribed
                                  ? "#8c8c8c"
                                  : selectedMembership?.id === membership.id
                                    ? "#1890ff"
                                    : "#262626",
                              }}
                            >
                              {membership.name}
                            </Text>
                            <Tag
                              color={isSubscribed ? "default" : "gold"}
                              style={{
                                margin: 0,
                                fontSize: 12,
                                opacity: isSubscribed ? 0.6 : 1,
                              }}
                            >
                              레벨 {membership.level}
                            </Tag>
                          </div>

                          {membership.description && (
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 12,
                                display: "block",
                                marginBottom: 8,
                                color: isSubscribed ? "#bfbfbf" : undefined,
                              }}
                            >
                              {membership.description}
                            </Text>
                          )}

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                              marginBottom: 8,
                            }}
                          >
                            {membership.benefits.map(
                              (benefit: string, index: number) => (
                                <Tag
                                  key={index}
                                  color={isSubscribed ? "default" : "blue"}
                                  style={{
                                    fontSize: 11,
                                    opacity: isSubscribed ? 0.6 : 1,
                                  }}
                                >
                                  {benefit}
                                </Tag>
                              ),
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <Text
                            strong
                            style={{
                              fontSize: 18,
                              color: isSubscribed
                                ? "#8c8c8c"
                                : selectedMembership?.id === membership.id
                                  ? "#1890ff"
                                  : "#faad14",
                            }}
                          >
                            {membership.price.toLocaleString()}원
                          </Text>
                          <div
                            style={{
                              fontSize: 12,
                              color: isSubscribed ? "#bfbfbf" : "#999",
                            }}
                          >
                            /{" "}
                            {getBillingText(
                              membership.billing_unit,
                              membership.billing_period,
                            )}
                            {getTrialText(membership) && (
                              <div
                                style={{
                                  color: isSubscribed ? "#8c8c8c" : "#52c41a",
                                  fontSize: 11,
                                  marginTop: 2,
                                }}
                              >
                                {getTrialText(membership)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </Space>
          </div>
        </div>

        <Divider />

        {/* 정기결제 안내 */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: 16,
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 8,
            }}
          >
            <SafetyCertificateOutlined
              style={{
                color: "#52c41a",
                fontSize: 20,
                marginRight: 12,
              }}
            />
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>정기결제</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                토스페이먼츠 자동결제를 통해 안전하고 편리하게 매월
                자동결제됩니다. <br />
                언제든지 구독을 취소할 수 있습니다.
              </div>
            </div>
          </div>
        </div>

        {/* 결제 요약 */}
        {selectedMembership && (
          <div
            style={{
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, color: "#999" }}>
                  선택한 멤버십
                </Text>
                <Text style={{ fontSize: 13, color: "#666" }}>
                  {selectedMembership.name}
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, color: "#999" }}>결제 금액</Text>
                <Text
                  style={{ fontSize: 14, color: "#52c41a", fontWeight: "500" }}
                >
                  {selectedMembership.price.toLocaleString()}원
                </Text>
              </div>

              <div
                style={{
                  height: "1px",
                  backgroundColor: "#e8e8e8",
                  margin: "4px 0",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, color: "#999" }}>결제 주기</Text>
                <Text style={{ fontSize: 13, color: "#666" }}>
                  {getBillingText(
                    selectedMembership.billing_unit,
                    selectedMembership.billing_period,
                  )}{" "}
                  마다
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* 버튼들 */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button size="large" onClick={handleClose}>
            취소
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckOutlined />}
            loading={isSubmitting}
            disabled={!selectedMembership}
            onClick={handleJoin}
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              border: "none",
              fontWeight: "600",
            }}
          >
            {selectedMembership
              ? `@${creatorHandle}의 ${selectedMembership.name}${getParticle(
                  selectedMembership.name,
                )} ${selectedMembership.price.toLocaleString()}원/${getBillingText(
                  selectedMembership.billing_unit,
                  selectedMembership.billing_period,
                )} 정기결제`
              : "멤버십 가입하기"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
