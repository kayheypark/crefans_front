"use client";
import { Form as UiForm, message as uiMessage } from "antd";

import { NicknameModalProps } from "@/features/modals-nickname-modal/types";
import { useNicknameModalModel } from "@/features/modals-nickname-modal/useNicknameModalModel";
import { LOADING_TEXTS } from "@/lib/constants/loadingTexts";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import { getNicknameValidationRule } from "@/lib/utils/validation";
import { Form, Input, Modal } from "antd";

export default function NicknameModal(props: NicknameModalProps) {
  const [form] = UiForm.useForm();
  const model = useNicknameModalModel(props, { message: uiMessage, form });
  return <NicknameModalView {...props} model={model} />;
}

function NicknameModalView({
  open,
  onClose,
  currentNickname,
  model,
}: NicknameModalProps & { model: ReturnType<typeof useNicknameModalModel> }) {
  const { form, isLoading, handleSave, handleCancel } = model;

  return (
    <Modal
      title="닉네임 변경"
      open={open}
      onOk={handleSave}
      onCancel={handleCancel}
      okText={isLoading ? LOADING_TEXTS.SAVING : "변경"}
      cancelText="취소"
      confirmLoading={isLoading}
      zIndex={1002}
      style={MODAL_STYLES.mobile.style}
      styles={MODAL_STYLES.mobile.styles}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="새 닉네임"
          name="nickname"
          rules={[
            { required: true, message: "닉네임을 입력해주세요" },
            getNicknameValidationRule(),
          ]}
          initialValue={currentNickname}
        >
          <Input
            placeholder="한글, 영문, 숫자 2-10자"
            size="large"
            maxLength={10}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
