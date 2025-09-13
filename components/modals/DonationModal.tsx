"use client";

import React, { useState } from "react";
import {
  Modal,
  Button,
  Input,
  Typography,
  Space,
  Row,
  Col,
  Divider,
  message,
} from "antd";
import {
  GiftOutlined,
  HeartOutlined,
  DollarOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar?: string;
  onSubmit?: (amount: number, message?: string) => void;
}

// 미리 정의된 후원 금액 옵션 (콩 단위)
const DONATION_AMOUNTS = [
  { amount: 10, label: "10콩", description: "응원해요!" },
  { amount: 30, label: "30콩", description: "고마워요!" },
  { amount: 50, label: "50콩", description: "멋져요!" },
  { amount: 100, label: "100콩", description: "최고예요!" },
  { amount: 200, label: "200콩", description: "대단해요!" },
  { amount: 500, label: "500콩", description: "감동이에요!" },
];

export default function DonationModal({
  open,
  onClose,
  creatorName,
  creatorHandle,
  creatorAvatar,
  onSubmit,
}: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donationMessage, setDonationMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 후원 금액 계산 (선택된 금액 또는 직접 입력한 금액)
  const getFinalAmount = () => {
    if (selectedAmount !== null) {
      return selectedAmount;
    }
    const custom = parseInt(customAmount);
    return isNaN(custom) ? 0 : custom;
  };

  // 후원하기 처리
  const handleDonate = async () => {
    const amount = getFinalAmount();

    if (amount <= 0) {
      message.error("후원 금액을 선택하거나 입력해주세요.");
      return;
    }

    if (amount < 1) {
      message.error("최소 1콩 이상 후원해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: 실제 후원 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 임시 딜레이

      onSubmit?.(amount, donationMessage);
      message.success(`${amount}콩을 후원했습니다!`);
      handleClose();
    } catch (error) {
      message.error("후원 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 및 상태 초기화
  const handleClose = () => {
    setSelectedAmount(null);
    setCustomAmount("");
    setDonationMessage("");
    setIsSubmitting(false);
    onClose();
  };

  // 금액 선택 시 커스텀 입력 초기화
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  // 커스텀 입력 시 선택된 금액 초기화
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <GiftOutlined style={{ color: "#ff6b6b", fontSize: 20 }} />
          <span>후원하기</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={500}
      centered
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

        {/* 후원 금액 선택 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <DollarOutlined style={{ marginRight: 8, color: "#52c41a" }} />
            후원 금액 선택
          </Title>

          {/* 미리 정의된 금액 버튼들 */}
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            {DONATION_AMOUNTS.map((option) => (
              <Col span={8} key={option.amount}>
                <Button
                  type={
                    selectedAmount === option.amount ? "primary" : "default"
                  }
                  size="large"
                  block
                  style={{
                    height: 60,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      selectedAmount === option.amount
                        ? "linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)"
                        : undefined,
                    borderColor:
                      selectedAmount === option.amount
                        ? "transparent"
                        : "#d9d9d9",
                  }}
                  onClick={() => handleAmountSelect(option.amount)}
                >
                  <div style={{ fontWeight: "600", fontSize: 16 }}>
                    {option.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: selectedAmount === option.amount ? "#fff" : "#999",
                    }}
                  >
                    {option.description}
                  </div>
                </Button>
              </Col>
            ))}
          </Row>

          {/* 직접 입력 */}
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              직접 입력
            </Text>
            <Input
              type="number"
              placeholder="후원할 콩 개수를 입력하세요"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              suffix="콩"
              size="large"
              style={{ fontSize: 16 }}
              min={1}
            />
          </div>
        </div>

        <Divider />

        {/* 후원 메시지 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 12 }}>
            <HeartOutlined style={{ marginRight: 8, color: "#ff4d4f" }} />
            후원 메시지 (선택사항)
          </Title>
          <Input.TextArea
            placeholder="크리에이터에게 전하고 싶은 메시지를 작성해주세요..."
            value={donationMessage}
            onChange={(e) => setDonationMessage(e.target.value)}
            rows={3}
            maxLength={200}
            showCount
            style={{ fontSize: 14 }}
          />
        </div>

        {/* 후원 요약 */}
        {getFinalAmount() > 0 && (
          <div
            style={{
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>후원 금액:</Text>
              <Text strong style={{ color: "#52c41a", fontSize: 18 }}>
                {getFinalAmount()}콩
              </Text>
            </div>
            {donationMessage && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">메시지: {donationMessage}</Text>
              </div>
            )}
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
            icon={<GiftOutlined />}
            loading={isSubmitting}
            disabled={getFinalAmount() <= 0}
            onClick={handleDonate}
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)",
              border: "none",
              fontWeight: "600",
            }}
          >
            {getFinalAmount() > 0
              ? `${getFinalAmount()}콩 후원하기`
              : "후원하기"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
