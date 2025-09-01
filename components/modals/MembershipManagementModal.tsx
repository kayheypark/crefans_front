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

  useEffect(() => {
    setMemberships(currentMemberships);
  }, [currentMemberships]);

  // 멤버십 추가/수정
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);

    try {
      if (isEditing && editingId) {
        // 수정
        const updatedMemberships = memberships.map((membership) =>
          membership.id === editingId
            ? {
                ...membership,
                ...values,
                benefits: values.benefits
                  .split(",")
                  .map((benefit: string) => benefit.trim())
                  .filter((benefit: string) => benefit),
              }
            : membership
        );
        setMemberships(updatedMemberships);
        message.success("멤버십이 수정되었습니다.");
      } else {
        // 추가
        const newMembership: Membership = {
          id: Date.now(), // 임시 ID 생성
          ...values,
          benefits: values.benefits
            .split(",")
            .map((benefit: string) => benefit.trim())
            .filter((benefit: string) => benefit),
        };
        setMemberships([...memberships, newMembership]);
        message.success("멤버십이 추가되었습니다.");
      }

      form.resetFields();
      setIsEditing(false);
      setEditingId(null);
      setPreviewBenefits([]);
      setInputValue("");
      onMembershipsUpdate(memberships);
    } catch (error) {
      message.error("멤버십 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 멤버십 수정 시작
  const startEditing = (membership: Membership) => {
    setIsEditing(true);
    setEditingId(membership.id);
    form.setFieldsValue({
      name: membership.name,
      level: membership.level,
      price: membership.price,
      description: membership.description,
      benefits: membership.benefits.join(", "),
    });
    setPreviewBenefits(membership.benefits);
    setInputValue("");
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
    <Modal
      title="멤버십 관리"
      open={open}
      onCancel={onClose}
      footer={null}
      // width={600}
      style={{ top: 20 }}
    >
      <Divider style={{ margin: "32px 0" }} />
      {/* 멤버십 추가/수정 폼 */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 20, color: "#1890ff", fontSize: 18 }}>
          {isEditing ? "멤버십 수정" : "새 멤버십 추가"}
        </h3>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            level: 1,
            price: 5000,
          }}
        >
          <Form.Item
            name="name"
            label="멤버십 이름"
            rules={[{ required: true, message: "멤버십 이름을 입력하세요" }]}
            extra={
              <Text
                type={INPUT_STYLES.text.color}
                style={{ fontSize: INPUT_STYLES.text.fontSize }}
              >
                구독자들이 쉽게 이해할 수 있는 멤버십의 이름을 입력하세요
              </Text>
            }
          >
            <Input
              placeholder={INPUT_STYLES.placeholder.name}
              size={INPUT_STYLES.size}
            />
          </Form.Item>

          <Form.Item
            name="level"
            label="멤버십 레벨"
            rules={[{ required: true, message: "멤버십 레벨을 입력하세요" }]}
            extra={
              <Text
                type={INPUT_STYLES.text.color}
                style={{ fontSize: INPUT_STYLES.text.fontSize }}
              >
                구독자들이 멤버십 전용 포스팅을 열람할 때, 크리에이터님이 해당
                포스팅에 설정한 최소 멤버십 레벨 이상이여야합니다
              </Text>
            }
          >
            <InputNumber
              min={1}
              max={10}
              placeholder={INPUT_STYLES.placeholder.level}
              size={INPUT_STYLES.size}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="가격 (원)"
            rules={[{ required: true, message: "가격을 입력하세요" }]}
            extra={
              <Text
                type={INPUT_STYLES.text.color}
                style={{ fontSize: INPUT_STYLES.text.fontSize }}
              >
                월 구독료를 원 단위로 입력하세요 (예: 5000)
              </Text>
            }
          >
            <InputNumber
              min={0}
              step={100}
              placeholder={INPUT_STYLES.placeholder.price}
              size={INPUT_STYLES.size}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="설명"
            rules={[{ required: true, message: "설명을 입력하세요" }]}
            extra={
              <Text
                type={INPUT_STYLES.text.color}
                style={{ fontSize: INPUT_STYLES.text.fontSize }}
              >
                구독자들이 멤버십의 가치를 이해할 수 있도록 자세히 설명하세요
              </Text>
            }
          >
            <TextArea
              rows={2}
              placeholder={INPUT_STYLES.placeholder.description}
              size={INPUT_STYLES.size}
            />
          </Form.Item>

          <Form.Item
            name="benefits"
            label="제공 혜택"
            rules={[{ required: true, message: "제공 혜택을 입력하세요" }]}
            extra={
              <Text
                type={INPUT_STYLES.text.color}
                style={{ fontSize: INPUT_STYLES.text.fontSize }}
              >
                구독자들이 받을 수 있는 구체적인 혜택을 콤마(,)로 구분하여
                입력하세요
              </Text>
            }
          >
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                padding: "8px 12px",
                minHeight: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                {previewBenefits.map((benefit, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => {
                      const newBenefits = previewBenefits.filter(
                        (_, i) => i !== index
                      );
                      setPreviewBenefits(newBenefits);
                      form.setFieldValue("benefits", newBenefits.join(", "));
                    }}
                    style={{ margin: 0 }}
                  >
                    {benefit}
                  </Tag>
                ))}
                <Input
                  placeholder={
                    previewBenefits.length === 0
                      ? INPUT_STYLES.placeholder.benefits
                      : INPUT_STYLES.placeholder.benefitsAdd
                  }
                  size="small"
                  style={{
                    border: "none",
                    boxShadow: "none",
                    flex: 1,
                    minWidth: "120px",
                  }}
                  value={inputValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInputValue(value);

                    // 콤마가 감지되면 즉시 혜택 추가
                    if (value.includes(",")) {
                      const parts = value.split(",");
                      const newBenefit = parts[0].trim();
                      if (newBenefit) {
                        const newBenefits = [...previewBenefits, newBenefit];
                        setPreviewBenefits(newBenefits);
                        form.setFieldValue("benefits", newBenefits.join(", "));
                      }
                      // 콤마 이후 텍스트를 입력 필드에 유지
                      const remainingText = parts.slice(1).join(",").trim();
                      setInputValue(remainingText);
                    }
                  }}
                  onKeyDown={(e) => {
                    // 백스페이스로 마지막 혜택 삭제
                    if (
                      e.key === "Backspace" &&
                      e.currentTarget.value === "" &&
                      previewBenefits.length > 0
                    ) {
                      e.preventDefault();
                      const newBenefits = previewBenefits.slice(0, -1);
                      setPreviewBenefits(newBenefits);
                      form.setFieldValue("benefits", newBenefits.join(", "));
                    }
                  }}
                />
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                icon={isEditing ? <EditOutlined /> : <PlusOutlined />}
                size="large"
              >
                {isEditing ? "수정중인 멤버십 저장" : "새 멤버십 저장"}
              </Button>
              {isEditing && (
                <Button onClick={handleCancel} size="large">
                  멤버십 수정 취소
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </div>

      <Divider style={{ margin: "32px 0" }} />

      {/* 멤버십 목록 */}
      <div>
        <h3 style={{ marginBottom: 20, color: "#1890ff", fontSize: 18 }}>
          현재 멤버십 ({memberships.length}개)
        </h3>

        {memberships.length > 0 ? (
          <div
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {memberships.map((membership, index) => (
              <div key={membership.id}>
                <Collapse
                  defaultActiveKey={[]}
                  ghost
                  style={{ background: "transparent" }}
                >
                  <Panel
                    key={membership.id}
                    header={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <Text strong style={{ fontSize: 16 }}>
                          {membership.name}
                        </Text>
                        <Tag
                          color="default"
                          style={{ margin: 0, fontSize: 12 }}
                        >
                          레벨 {membership.level}
                        </Tag>
                        <Tag
                          color="default"
                          style={{ margin: 0, fontSize: 12 }}
                        >
                          {membership.price.toLocaleString()}원
                        </Tag>
                      </div>
                    }
                    extra={
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(membership);
                          }}
                          size="small"
                        >
                          수정
                        </Button>
                        <Popconfirm
                          title="멤버십을 삭제하시겠습니까?"
                          onConfirm={() => handleDelete(membership.id)}
                          okText="삭제"
                          cancelText="취소"
                          onCancel={(e) => e?.stopPropagation?.()}
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
                    }
                  >
                    <div style={{ marginBottom: 0 }}>
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          lineHeight: 1.6,
                          fontSize: 14,
                        }}
                      >
                        {membership.description}
                      </Text>
                    </div>

                    <div>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                      >
                        {membership.benefits.map((benefit, index) => (
                          <Tag
                            key={index}
                            color="default"
                            style={{
                              margin: 0,
                              fontSize: 12,
                            }}
                          >
                            {benefit}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </Panel>
                </Collapse>
                {index < memberships.length - 1 && (
                  <Divider style={{ margin: 0 }} />
                )}
              </div>
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
  );
}
