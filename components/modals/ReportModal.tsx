"use client";
import { Form as UiForm, message as uiMessage } from "antd";

import { ReportModalProps } from "@/features/modals-report-modal/types";
import { useReportModalModel } from "@/features/modals-report-modal/useReportModalModel";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import Button from "antd/lib/button";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import Modal from "antd/lib/modal";
import Radio from "antd/lib/radio";
import Space from "antd/lib/space";

export default function ReportModal(props: ReportModalProps) {
  const [reportForm] = UiForm.useForm();
  const model = useReportModalModel(props, { message: uiMessage, reportForm });
  return <ReportModalView {...props} model={model} />;
}

function ReportModalView({
  open,
  onClose,
  onSubmit,
  model,
}: ReportModalProps & { model: ReturnType<typeof useReportModalModel> }) {
  const { reportForm, handleReport, handleCancel } = model;

  return (
    <Modal
      title="신고하기"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={400}
      zIndex={1002}
      style={MODAL_STYLES.mobile.style}
      styles={MODAL_STYLES.mobile.styles}
    >
      <Form form={reportForm} onFinish={handleReport} layout="vertical">
        <Form.Item
          name="reason"
          label="신고 사유"
          rules={[{ required: true, message: "신고 사유를 선택해주세요" }]}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="spam">스팸/홍보성 게시물</Radio>
              <Radio value="inappropriate">부적절한 콘텐츠</Radio>
              <Radio value="harassment">욕설/비하</Radio>
              <Radio value="copyright">저작권 침해</Radio>
              <Radio value="other">기타</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="detail"
          label="상세 설명"
          rules={[{ required: true, message: "상세 설명을 입력해주세요" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="신고 사유에 대한 상세 설명을 입력해주세요"
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              width: "100%",
            }}
          >
            신고하기
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
