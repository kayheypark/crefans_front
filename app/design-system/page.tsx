import type { Metadata } from "next";
import DesignSystem from "@/components/design-system/CustomDesignSystem";

export const metadata: Metadata = {
  title: "Design system · crefans",
  description: "Crefans 디자인 토큰, UI 상태, 데이터 기반 컴포넌트 카탈로그",
  robots: { index: false, follow: false },
  icons: { icon: { url: '/brand/crefans-mark.svg', type: 'image/svg+xml' } },
};

export default function DesignSystemPage() {
  return <DesignSystem />;
}
