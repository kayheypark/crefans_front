"use client";
import { message as uiMessage } from "antd";

import { ChargeModalProps } from "@/features/modals-charge-modal/types";
import { useChargeModalModel } from "@/features/modals-charge-modal/useChargeModalModel";
import { CHARGE_PRODUCTS } from "@/lib/constants/chargeProducts";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import { Modal, Spin, Typography } from "antd";

const { Text } = Typography;

export default function ChargeModal(props: ChargeModalProps) {
  const model = useChargeModalModel(props, { message: uiMessage });
  return <ChargeModalView {...props} model={model} />;
}

function ChargeModalView({
  open,
  onClose,
  model,
}: ChargeModalProps & { model: ReturnType<typeof useChargeModalModel> }) {
  const {
    selectedChargeAmount,
    selectedPrice,
    isPaymentLoading,
    paymentInstance,
    handleProductSelect,
    handleCharge,
    handleCancel,
  } = model;

  return (
    <Modal
      title="콩 충전"
      open={open}
      onOk={handleCharge}
      onCancel={handleCancel}
      okText={isPaymentLoading ? "결제 처리 중..." : "결제하기"}
      cancelText="취소"
      okButtonProps={{
        disabled: !selectedChargeAmount || !paymentInstance || isPaymentLoading,
        loading: isPaymentLoading,
      }}
      width={800}
      zIndex={1002}
      style={MODAL_STYLES.mobile.style}
      styles={MODAL_STYLES.mobile.styles}
    >
      <div style={{ marginBottom: 16 }}>
        <Text>충전할 콩을 선택해주세요:</Text>
      </div>

      {/* 상품 선택 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {CHARGE_PRODUCTS.map((product) => (
          <div
            key={product.beans}
            style={{
              border:
                selectedChargeAmount === product.beans
                  ? "2px solid #6a5af9"
                  : "1px solid #d9d9d9",
              borderRadius: 8,
              padding: 16,
              cursor: "pointer",
              background:
                selectedChargeAmount === product.beans ? "#f0f0ff" : "white",
              transition: "all 0.2s",
            }}
            onClick={() => handleProductSelect(product.beans, product.price)}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#6a5af9",
                  marginBottom: 4,
                }}
              >
                {product.beans.toLocaleString()} 콩
              </div>
              <div style={{ fontSize: 14, color: "#666" }}>
                {product.price.toLocaleString()}원
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 선택된 상품 정보 */}
      {selectedChargeAmount && selectedPrice && (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            background: "#f6f6f6",
            borderRadius: 8,
          }}
        >
          <Text strong>
            선택된 상품: {selectedChargeAmount.toLocaleString()} 콩 (
            {selectedPrice.toLocaleString()}원)
          </Text>
        </div>
      )}

      {/* 결제 안내 */}
      {selectedPrice && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              padding: 16,
              background: "#f9f9f9",
              borderRadius: 8,
              border: "1px solid #e0e0e0",
            }}
          >
            <Text>
              '결제하기' 버튼을 누르면 토스페이먼츠 결제창이 열립니다.
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              카드, 계좌이체, 간편결제 등 다양한 결제수단을 사용할 수 있습니다.
            </Text>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isPaymentLoading && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin size="large" />
          <div style={{ marginTop: 10 }}>
            <Text>결제를 처리하고 있습니다...</Text>
          </div>
        </div>
      )}
    </Modal>
  );
}
