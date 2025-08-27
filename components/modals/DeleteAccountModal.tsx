"use client";

import React, { useState } from "react";
import { Modal, Input, Typography, Divider, message } from "antd";
const { Text, Paragraph } = Typography;

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteAccountModal({
  open,
  onClose,
  onDelete,
}: DeleteAccountModalProps) {
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleDelete = () => {
    if (deleteConfirmText !== "삭제") {
      message.error("정확히 '삭제'를 입력해주세요.");
      return;
    }
    onDelete();
    setDeleteConfirmText("");
  };

  const handleCancel = () => {
    onClose();
    setDeleteConfirmText("");
  };

  return (
    <Modal
      title="계정 삭제 확인"
      open={open}
      onOk={handleDelete}
      onCancel={handleCancel}
      okText="삭제"
      cancelText="취소"
      okButtonProps={{
        danger: true,
        disabled: deleteConfirmText !== "삭제",
      }}
    >
      <Paragraph>
        정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든
        데이터가 영구적으로 삭제됩니다.
      </Paragraph>
      <Paragraph>계정을 삭제하면:</Paragraph>
      <ul>
        <li>모든 개인 정보가 삭제됩니다</li>
        <li>업로드한 콘텐츠가 삭제됩니다</li>
        <li>보유한 콩이 환불되지 않습니다</li>
        <li>구독 정보가 모두 해지됩니다</li>
      </ul>
      <Divider />
      <div>
        <Paragraph style={{ marginBottom: 8 }}>
          계정을 삭제하려면 아래에 <Text strong>"삭제"</Text>를 입력하세요:
        </Paragraph>
        <Input
          placeholder="삭제"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      </div>
    </Modal>
  );
}
