"use client";

import { useState } from "react";
import { Layout, Menu, Button, Avatar, Typography, Space, Badge } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  DollarOutlined,
  HeartOutlined,
  SettingOutlined,
  MenuOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

interface CreatorCenterLayoutProps {
  children: React.ReactNode;
}

export default function CreatorCenterLayout({
  children,
}: CreatorCenterLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, isTablet } = useResponsive();

  const menuItems = [
    {
      key: "/creator-center",
      icon: <DashboardOutlined />,
      label: "대시보드",
    },
    {
      key: "/creator-center/earnings",
      icon: <DollarOutlined />,
      label: "수익 관리",
    },
    {
      key: "/creator-center/memberships",
      icon: <UserOutlined />,
      label: "멤버십 관리",
    },
    {
      key: "/creator-center/donations",
      icon: <HeartOutlined />,
      label: "후원 관리",
    },
    {
      key: "/creator-center/settings",
      icon: <SettingOutlined />,
      label: "설정",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
    // 모바일/태블릿에서 메뉴 클릭 시 사이드바 닫기
    if (isMobile || isTablet) {
      setCollapsed(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleBackToCrefans = () => {
    router.push("/");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 모바일 헤더 */}
      {(isMobile || isTablet) && (
        <Header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "18px" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/logo_icon.png"
              alt="크레팬스"
              style={{
                width: "22px",
                height: "22px",
                objectFit: "contain",
              }}
            />
            <Text strong style={{ fontSize: "15px", color: "#333" }}>
              크리에이터 센터
            </Text>
          </div>
          <div style={{ width: "32px" }} />
        </Header>
      )}

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          position: isMobile || isTablet ? "fixed" : "relative",
          left: 0,
          top: isMobile || isTablet ? "64px" : 0,
          bottom: 0,
          zIndex: 999,
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
        }}
        width={280}
        collapsedWidth={isMobile || isTablet ? 0 : 80}
      >
        {/* 데스크톱 헤더 */}
        {!isMobile && !isTablet && (
          <div
            style={{
              padding: "24px 16px",
              borderBottom: "1px solid #f0f0f0",
              textAlign: "center",
            }}
          >
            {collapsed ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src="/logo_icon.png"
                  alt="크레팬스"
                  style={{
                    width: "28px",
                    height: "28px",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <img
                  src="/logo_icon.png"
                  alt="크레팬스"
                  style={{
                    width: "36px",
                    height: "36px",
                    objectFit: "contain",
                  }}
                />
                <Text strong style={{ fontSize: "14px", color: "#666" }}>
                  크리에이터 센터
                </Text>
              </div>
            )}
          </div>
        )}

        {/* 사용자 정보 */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Avatar
            size={collapsed ? 32 : 40}
            src={user?.attributes?.picture}
            icon={<UserOutlined />}
          />
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ display: "block", fontSize: "14px" }}>
                {user?.attributes?.nickname || user?.attributes?.name}
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                크리에이터
              </Text>
            </div>
          )}
        </div>

        {/* 메뉴 컨테이너 */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              border: "none",
              marginTop: "16px",
            }}
          />
        </div>

        {/* 하단 버튼들 */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToCrefans}
            style={{
              width: "100%",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            {!collapsed && "크레팬스로 돌아가기"}
          </Button>

          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              width: "100%",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            {!collapsed && "로그아웃"}
          </Button>
        </div>
      </Sider>

      {/* 메인 콘텐츠 */}
      <Layout>
        <Content
          style={{
            margin: isMobile || isTablet ? "64px 0 0 0" : "0",
            padding: "24px",
            background: "#f5f5f5",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </Content>
      </Layout>

      {/* 모바일 오버레이 */}
      {(isMobile || isTablet) && !collapsed && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 998,
          }}
          onClick={() => setCollapsed(true)}
        />
      )}
    </Layout>
  );
}
