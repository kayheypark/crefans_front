"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Divider,
  message,
  Card,
  Tag,
} from "antd";
import {
  CrownOutlined,
  HeartOutlined,
  CreditCardOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { getParticle } from "@/lib/utils/koreanUtils";

const { Title, Text } = Typography;

interface Membership {
  id: number;
  name: string;
  level: number;
  price: number;
  description?: string;
  benefits: string[];
  billing_unit: "DAY" | "WEEK" | "MONTH" | "YEAR";
  billing_period: number;
}

interface MembershipJoinModalProps {
  open: boolean;
  onClose: () => void;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar?: string;
  memberships: Membership[];
  defaultSelectedMembershipId?: number;
  onJoin?: (membershipId: number, paymentMethod: string) => void;
}

// 결제 수단 옵션
const PAYMENT_METHODS = [
  { value: "card", label: "신용카드", icon: "💳" },
  { value: "kakao", label: "카카오페이", icon: "💛" },
  { value: "naver", label: "네이버페이", icon: "🟢" },
  { value: "toss", label: "토스페이", icon: "🔵" },
];

export default function MembershipJoinModal({
  open,
  onClose,
  creatorName,
  creatorHandle,
  creatorAvatar,
  memberships,
  defaultSelectedMembershipId,
  onJoin,
}: MembershipJoinModalProps) {
  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 열릴 때마다 내용 초기화
  useEffect(() => {
    if (open) {
      // defaultSelectedMembershipId가 있으면 해당 멤버십 선택, 없으면 첫 번째 멤버십 선택
      if (defaultSelectedMembershipId) {
        const defaultMembership = memberships.find(
          (m) => m.id === defaultSelectedMembershipId
        );
        setSelectedMembership(
          defaultMembership || (memberships.length > 0 ? memberships[0] : null)
        );
      } else if (!selectedMembership && memberships.length > 0) {
        setSelectedMembership(memberships[0]);
      }
      setSelectedPaymentMethod("card");
      setIsSubmitting(false);
    }
  }, [open, memberships, defaultSelectedMembershipId]);

  // 멤버십 가입 처리
  const handleJoin = async () => {
    if (!selectedMembership) {
      message.error("멤버십을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: 실제 결제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 임시 딜레이

      onJoin?.(selectedMembership.id, selectedPaymentMethod);
      message.success(`${selectedMembership.name}에 가입되었습니다!`);
      handleClose();
    } catch (error) {
      message.error("멤버십 가입 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    onClose();
  };

  // 결제 주기 텍스트 변환
  const getBillingText = (unit: string, period: number) => {
    const unitMap: { [key: string]: string } = {
      DAY: "일",
      WEEK: "주",
      MONTH: "개월",
      YEAR: "년",
    };
    return `${period}${unitMap[unit] || unit}`;
  };

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
            <CrownOutlined style={{ marginRight: 8, color: "#faad14" }} />
            멤버십 선택
          </Title>

          <div style={{ width: "100%" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              {memberships.map((membership) => (
                <div
                  key={membership.id}
                  style={{
                    width: "100%",
                    display: "block",
                    marginBottom: 0,
                  }}
                  onClick={() => {
                    setSelectedMembership(membership);
                  }}
                >
                  <Card
                    size="small"
                    style={{
                      width: "100%",
                      marginTop: 8,
                      marginLeft: 0,
                      marginRight: 0,
                      border:
                        selectedMembership?.id === membership.id
                          ? "2px solid #faad14"
                          : "1px solid #d9d9d9",
                      backgroundColor:
                        selectedMembership?.id === membership.id
                          ? "#fffbe6"
                          : "#fff",
                    }}
                    bodyStyle={{
                      padding: "12px",
                      width: "100%",
                    }}
                  >
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
                          <Text strong style={{ fontSize: 16 }}>
                            {membership.name}
                          </Text>
                          <Tag color="gold" style={{ margin: 0, fontSize: 12 }}>
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
                                color="blue"
                                style={{ fontSize: 11 }}
                              >
                                {benefit}
                              </Tag>
                            )
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <Text strong style={{ fontSize: 18, color: "#faad14" }}>
                          {membership.price.toLocaleString()}원
                        </Text>
                        <div style={{ fontSize: 12, color: "#999" }}>
                          /{" "}
                          {getBillingText(
                            membership.billing_unit,
                            membership.billing_period
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </Space>
          </div>
        </div>

        <Divider />

        {/* 결제 수단 선택 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <CreditCardOutlined style={{ marginRight: 8, color: "#52c41a" }} />
            결제 수단 선택
          </Title>

          <Row gutter={[8, 8]}>
            {PAYMENT_METHODS.map((method) => (
              <Col span={12} key={method.value}>
                <Button
                  type={
                    selectedPaymentMethod === method.value
                      ? "primary"
                      : "default"
                  }
                  size="large"
                  block
                  style={{
                    height: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background:
                      selectedPaymentMethod === method.value
                        ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                        : undefined,
                    borderColor:
                      selectedPaymentMethod === method.value
                        ? "transparent"
                        : "#d9d9d9",
                  }}
                  onClick={() => setSelectedPaymentMethod(method.value)}
                >
                  {/* <span style={{ fontSize: 16 }}>{method.icon}</span> */}
                  <span style={{ fontSize: 14 }}>{method.label}</span>
                </Button>
              </Col>
            ))}
          </Row>
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
                    selectedMembership.billing_period
                  )}
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
              background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
              border: "none",
              fontWeight: "600",
            }}
          >
            {selectedMembership
              ? `@${creatorHandle}의 ${selectedMembership.name}${getParticle(
                  selectedMembership.name
                )} ${selectedMembership.price.toLocaleString()}원/${getBillingText(
                  selectedMembership.billing_unit,
                  selectedMembership.billing_period
                )} 정기결제`
              : "멤버십 가입하기"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
