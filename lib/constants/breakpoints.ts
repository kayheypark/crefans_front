// 반응형 브레이크포인트 상수
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
} as const;

// 미디어 쿼리 문자열
export const MEDIA_QUERIES = {
  mobile: `@media (max-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `@media (max-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `@media (min-width: ${BREAKPOINTS.desktop}px)`,
} as const;

// 반응형 유틸리티 함수
export const getResponsiveValue = <T>(mobile: T, tablet: T, desktop: T): T => {
  if (typeof window === "undefined") return desktop;

  const width = window.innerWidth;
  if (width <= BREAKPOINTS.mobile) return mobile;
  if (width <= BREAKPOINTS.tablet) return tablet;
  return desktop;
};

// 반응형 스타일 객체 생성
export const responsiveStyles = {
  container: {
    mobile: { width: "100%", padding: "16px" },
    tablet: { width: "90%", margin: "0 auto", padding: "20px" },
    desktop: { width: "800px", margin: "0 auto", padding: "20px" },
  },
  grid: {
    mobile: { gridTemplateColumns: "repeat(1, 1fr)", gap: "12px" },
    tablet: { gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" },
    desktop: { gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
  },
  sidebar: {
    mobile: { display: "none" },
    tablet: { width: "200px", minWidth: "200px" },
    desktop: { width: "250px", minWidth: "250px" },
  },
} as const;
