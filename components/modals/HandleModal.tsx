"use client";
import { Form as UiForm, message as uiMessage } from "antd";

import { HandleModalProps } from "@/features/modals-handle-modal/types";
import { useHandleModalModel } from "@/features/modals-handle-modal/useHandleModalModel";
import { LOADING_TEXTS } from "@/lib/constants/loadingTexts";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import { getHandleValidationRule } from "@/lib/utils/validation";
import { Form, Input, Modal } from "antd";

export default function HandleModal(props: HandleModalProps) {
  const [form] = UiForm.useForm();
  const model = useHandleModalModel(props, { message: uiMessage, form });
  return <HandleModalView {...props} model={model} />;
}

function HandleModalView({
  open,
  onClose,
  currentHandle,
  model,
}: HandleModalProps & { model: ReturnType<typeof useHandleModalModel> }) {
  const { form, isLoading, handleSave, handleCancel } = model;

  return (
    <Modal
      title="핸들 변경"
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
          label="새 핸들"
          name="preferred_username"
          rules={[
            { required: true, message: "핸들을 입력해주세요" },
            getHandleValidationRule(),
          ]}
          initialValue={currentHandle}
        >
          <Input
            placeholder="새 핸들을 입력하세요"
            size="large"
            addonBefore="@"
            maxLength={15}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
