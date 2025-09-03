// 모달 스타일을 위한 공통 상수
export const MODAL_STYLES = {
  mobile: {
    style: {
      maxHeight: "90vh",
      overflow: "auto" as const,
    },
    styles: {
      body: {
        maxHeight: "calc(90vh - 120px)",
        overflow: "auto" as const,
      },
    },
  },
};
