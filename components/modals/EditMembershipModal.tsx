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
  Tag,
  Typography,
  Divider,
  Popconfirm,
  Select,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import {
  membershipAPI,
  MembershipItem,
  UpdateMembershipRequest,
} from "@/lib/api/membership";

const { TextArea } = Input;
const { Text } = Typography;

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

interface EditMembershipModalProps {
  open: boolean;
  onClose: () => void;
  membership: MembershipItem | null;
  onMembershipUpdated: (updatedMembership: MembershipItem) => void;
}

export default function EditMembershipModal({
  open,
  onClose,
  membership,
  onMembershipUpdated,
}: EditMembershipModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewBenefits, setPreviewBenefits] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (membership && open) {
      form.setFieldsValue({
        name: membership.name,
        level: membership.level,
        price: membership.price,
        description: membership.description,
        billing_unit: membership.billing_unit,
        billing_period: membership.billing_period,
        trial_unit: membership.trial_unit || "DAY",
        trial_period: membership.trial_period,
        benefits: membership.benefits,
      });
      // 혜택을 안전하게 배열로 변환하여 프리뷰에 표시
      if (membership.benefits) {
        const benefitsArray = Array.isArray(membership.benefits)
          ? membership.benefits.filter((b) => b)
          : membership.benefits
              .split(",")
              .map((b) => b.trim())
              .filter((b) => b);
        setPreviewBenefits(benefitsArray);
      } else {
        setPreviewBenefits([]);
      }
      setInputValue("");
    }
  }, [membership, open, form]);

  // 멤버십 수정
  const handleSubmit = async (values: any) => {
    if (!membership) return;

    setIsSubmitting(true);

    try {
      // 입력 중인 혜택이 있다면 마지막에 추가
      let finalBenefits = [...previewBenefits];
      if (inputValue.trim()) {
        finalBenefits.push(inputValue.trim());
      }

      const membershipData: UpdateMembershipRequest = {
        name: values.name,
        description: values.description,
        level: values.level,
        price: values.price,
        billing_unit: values.billing_unit,
        billing_period: values.billing_period,
        trial_unit: values.trial_unit,
        trial_period: values.trial_period,
        benefits: finalBenefits.join(","),
      };

      const response = await membershipAPI.updateMembership(
        membership.id,
        membershipData
      );

      if (response.success) {
        onMembershipUpdated(response.data);
        message.success("멤버십이 수정되었습니다.");
        handleClose();
      } else {
        message.error(response.message || "멤버십 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("멤버십 수정 실패:", error);
      message.error("멤버십 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 폼 변경 감지
  const handleFormChange = () => {
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      // Popconfirm이 자동으로 처리하므로 여기서는 아무것도 하지 않음
      return;
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    form.resetFields();
    setPreviewBenefits([]);
    setInputValue("");
    setHasChanges(false);
    onClose();
  };

  if (!membership) return null;

  return (
    <>
      <Modal
        title="멤버십 수정"
        open={open}
        onCancel={handleClose}
        maskClosable={false}
        closable={true}
        footer={null}
        style={{
          top: 20,
          ...MODAL_STYLES.mobile.style,
        }}
        styles={MODAL_STYLES.mobile.styles}
      >
        {/* 멤버십 수정 폼 */}
        <div>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
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
                placeholder={INPUT_STYLES.placeholder.description}
                rows={3}
                size={INPUT_STYLES.size}
              />
            </Form.Item>

            <Form.Item
              name="benefits"
              label="혜택"
              rules={[{ required: true, message: "혜택을 입력하세요" }]}
              extra={
                <Text
                  type={INPUT_STYLES.text.color}
                  style={{ fontSize: INPUT_STYLES.text.fontSize }}
                >
                  구독자들이 받을 수 있는 혜택을 콤마(,)로 구분하여 입력하세요
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
                        form.setFieldValue("benefits", newBenefits.join(","));
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
                          form.setFieldValue("benefits", newBenefits.join(","));
                        }
                        // 콤마 이후 텍스트를 입력 필드에 유지
                        const remainingText = parts.slice(1).join(",").trim();
                        setInputValue(remainingText);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Enter 키로 혜택 추가
                      if (e.key === "Enter" && inputValue.trim()) {
                        e.preventDefault();
                        const newBenefit = inputValue.trim();
                        if (newBenefit) {
                          const newBenefits = [...previewBenefits, newBenefit];
                          setPreviewBenefits(newBenefits);
                          form.setFieldValue("benefits", newBenefits.join(","));
                        }
                        setInputValue("");
                      }
                      // 백스페이스로 마지막 혜택 삭제
                      else if (
                        e.key === "Backspace" &&
                        e.currentTarget.value === "" &&
                        previewBenefits.length > 0
                      ) {
                        e.preventDefault();
                        const newBenefits = previewBenefits.slice(0, -1);
                        setPreviewBenefits(newBenefits);
                        form.setFieldValue("benefits", newBenefits.join(","));
                      }
                    }}
                  />
                </div>
              </div>
            </Form.Item>

            <Form.Item
              name="billing_unit"
              label="결제 주기 단위"
              rules={[
                { required: true, message: "결제 주기 단위를 선택하세요" },
              ]}
              extra={
                <Text
                  type={INPUT_STYLES.text.color}
                  style={{ fontSize: INPUT_STYLES.text.fontSize }}
                >
                  멤버십 구독료 결제 주기의 단위를 선택하세요
                </Text>
              }
            >
              <Select
                size={INPUT_STYLES.size}
                placeholder="결제 주기 단위 선택"
              >
                <Select.Option value="DAY">일</Select.Option>
                <Select.Option value="WEEK">주</Select.Option>
                <Select.Option value="MONTH">월</Select.Option>
                <Select.Option value="YEAR">년</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="billing_period"
              label="결제 주기"
              rules={[{ required: true, message: "결제 주기를 입력하세요" }]}
              extra={
                <Text
                  type={INPUT_STYLES.text.color}
                  style={{ fontSize: INPUT_STYLES.text.fontSize }}
                >
                  결제가 반복되는 주기를 입력하세요 (예: 1개월, 3개월, 1년)
                </Text>
              }
            >
              <InputNumber
                min={1}
                max={12}
                size={INPUT_STYLES.size}
                style={{ width: "100%" }}
                placeholder="1"
              />
            </Form.Item>

            <Form.Item
              name="trial_unit"
              label="무료 체험 기간 단위"
              extra={
                <Text
                  type={INPUT_STYLES.text.color}
                  style={{ fontSize: INPUT_STYLES.text.fontSize }}
                >
                  무료 체험 기간의 단위를 선택하세요
                </Text>
              }
            >
              <Select
                size={INPUT_STYLES.size}
                placeholder="무료 체험 기간 단위 선택"
              >
                <Select.Option value="DAY">일</Select.Option>
                <Select.Option value="WEEK">주</Select.Option>
                <Select.Option value="MONTH">월</Select.Option>
                <Select.Option value="YEAR">년</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="trial_period"
              label="무료 체험 기간"
              extra={
                <Text
                  type={INPUT_STYLES.text.color}
                  style={{ fontSize: INPUT_STYLES.text.fontSize }}
                >
                  무료 체험 기간을 입력하세요 (0은 무료 체험 없음)
                </Text>
              }
            >
              <InputNumber
                min={0}
                max={30}
                size={INPUT_STYLES.size}
                style={{ width: "100%" }}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  size="large"
                >
                  수정 완료
                </Button>
                <Popconfirm
                  title="변경사항 저장 안함"
                  description="이대로 나가면 내용이 저장되지 않습니다. 정말로 나가시겠습니까?"
                  onConfirm={closeModal}
                  okText="이전으로 나가기"
                  cancelText="계속 수정"
                  okButtonProps={{ danger: true, ghost: true }}
                >
                  <Button size="large">취소</Button>
                </Popconfirm>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}
