import type { Metadata } from "next";
import { ConfigProvider } from "antd";
import StyledComponentsRegistry from "@/lib/AntdRegistry";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import "antd/dist/reset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SECON.ID - 크리에이터 플랫폼",
  description: "당신만의 크리에이터를 만나보세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <StyledComponentsRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#1890ff",
              },
            }}
          >
            <AuthProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </AuthProvider>
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
