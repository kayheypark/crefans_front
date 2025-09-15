"use client";

import React from "react";
import { Modal, Typography, Space } from "antd";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface LogoutModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function LogoutModal({ isVisible, onClose }: LogoutModalProps) {
  const router = useRouter();

  const handleConfirm = () => {
    onClose();
    router.push("/");
  };

  return (
    <Modal
      open={isVisible}
      onCancel={handleConfirm}
      onOk={handleConfirm}
      closable={false}
      centered
      width={400}
      okText="확인"
      cancelText={null}
      maskClosable={false}
      keyboard={false}
      destroyOnClose
    >
      <Space
        direction="vertical"
        size="middle"
        style={{ width: "100%", textAlign: "center", padding: "24px 0" }}
      >
        <Title level={4} style={{ margin: 0, color: "#262626" }}>
          로그인이 만료되었습니다
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", lineHeight: "1.5" }}>
          보안을 위해 자동으로 로그아웃되었습니다.
          <br />
          다시 로그인해 주세요.
        </Text>
      </Space>
    </Modal>
  );
}
