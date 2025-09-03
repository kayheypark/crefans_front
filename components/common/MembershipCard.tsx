"use client";

import React from "react";
import { Button, Tag, Typography, Radio, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Membership {
  id: number;
  name: string;
  level: number;
  price: number;
  description: string;
  benefits: string[];
}

interface MembershipCardProps {
  membership: Membership;
  selected?: boolean;
  showRadio?: boolean;
  showActions?: boolean;
  onSelect?: (membership: Membership) => void;
  onEdit?: (membership: Membership) => void;
  onDelete?: (id: number) => void;
}

export default function MembershipCard({
  membership,
  selected = false,
  showRadio = false,
  showActions = false,
  onSelect,
  onEdit,
  onDelete,
}: MembershipCardProps) {
  const handleClick = () => {
    if (showRadio && onSelect) {
      onSelect(membership);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px",
        border: selected ? "2px solid #1890ff" : "1px solid #d9d9d9",
        borderRadius: "8px",
        backgroundColor: selected ? "#f0f8ff" : "#fff",
        cursor: showRadio ? "pointer" : "default",
      }}
      onClick={handleClick}
    >
      {showRadio && (
        <Radio
          name="membershipLevel"
          value={membership.level}
          checked={selected}
          onChange={() => onSelect?.(membership)}
          style={{ marginRight: 12 }}
        />
      )}

      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <Text strong style={{ fontSize: 16 }}>
            {membership.name}
          </Text>
          <Tag color="default" style={{ margin: 0, fontSize: 12 }}>
            레벨 {membership.level}
          </Tag>
          <Tag color="default" style={{ margin: 0, fontSize: 12 }}>
            {membership.price.toLocaleString()}원
          </Tag>
        </div>

        <Text
          type="secondary"
          style={{
            fontSize: 12,
            display: "block",
            marginBottom: 4,
          }}
        >
          {membership.description}
        </Text>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginBottom: showActions ? 8 : 0,
          }}
        >
          {membership.benefits.map((benefit: string, index: number) => (
            <Tag key={index} color="blue">
              {benefit}
            </Tag>
          ))}
        </div>

        {showActions && onEdit && onDelete && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(membership);
              }}
              size="small"
            >
              수정
            </Button>
            <Popconfirm
              title="멤버십을 삭제하시겠습니까?"
              onConfirm={(e) => {
                e?.stopPropagation?.();
                onDelete(membership.id);
              }}
              okText="삭제"
              cancelText="취소"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={(e) => e.stopPropagation()}
              >
                삭제
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </div>
  );
}
