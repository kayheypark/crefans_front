"use client";

import React, { useState } from "react";
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Button,
  Avatar,
  Tag,
  Menu,
  Space,
  Modal,
  Dropdown,
  Badge,
  Tabs,
  List,
  message,
  Input,
  Empty,
  Pagination,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  SearchOutlined,
  StarOutlined,
  CrownOutlined,
  HomeOutlined,
  FireOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MoreOutlined,
  DeleteOutlined,
  DownOutlined,
  RightOutlined,
  CompassOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import LoginModal from "../components/LoginModal";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;

type SearchTabKey = "creators" | "posts" | "photos" | "videos";

interface Notification {
  id: number;
  title: string;
  time: string;
}

interface NotificationList {
  all: Notification[];
  messages: Notification[];
  subscriptions: Notification[];
}

export default function Landing() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [notificationsList, setNotificationsList] = useState<NotificationList>({
    all: [
      { id: 1, title: "멤버십 가입해주셔서 감사합니다!", time: "방금 전" },
      { id: 2, title: "구독이 갱신되었습니다.", time: "1시간 전" },
    ],
    messages: [
      { id: 1, title: "멤버십 가입해주셔서 감사합니다!", time: "방금 전" },
    ],
    subscriptions: [
      { id: 2, title: "구독이 갱신되었습니다.", time: "1시간 전" },
    ],
  });
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTab, setActiveSearchTab] =
    useState<SearchTabKey>("creators");
  const [searchPage, setSearchPage] = useState<Record<SearchTabKey, number>>({
    creators: 1,
    posts: 1,
    photos: 1,
    videos: 1,
  });
  const pageSize = 10;

  const handleLogout = () => {
    Modal.confirm({
      title: "로그아웃",
      content: "정말 로그아웃 하시겠습니까?",
      onOk: () => {
        logout();
        router.push("/");
      },
    });
  };

  const userMenu = (
    <Menu
      items={[
        {
          key: "myInfo",
          icon: <UserOutlined />,
          label: "내 정보",
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "로그아웃",
          onClick: handleLogout,
          style: { backgroundColor: "#ff4d4f", color: "#fff" },
        },
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "0 50px",
          position: "fixed",
          width: "100%",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            seconid
          </Title>
          <div style={{ marginTop: "-5px" }}></div>
          <Text
            style={{
              fontSize: 10,
              color: "#666",
              marginTop: 0,
            }}
          >
            인플루언서의 두번째 계정
          </Text>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: 320,
              height: 32,
              cursor: "pointer",
              background: "#f5f5f5",
              borderRadius: 24,
              padding: "2px 16px 2px 12px",
              transition: "box-shadow 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
            onClick={() => setIsSearchModalOpen(true)}
          >
            <SearchOutlined
              style={{ fontSize: 18, color: "#888", marginRight: 8 }}
            />
            <input
              type="text"
              placeholder="지금 핫한 @크리에이터2를 검색해보세요"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 15,
                color: "#222",
                width: "100%",
                cursor: "pointer",
              }}
              readOnly
              tabIndex={-1}
            />
          </div>
          {user ? (
            <Space>
              <Dropdown overlay={userMenu} trigger={["click"]}>
                <Space style={{ cursor: "pointer" }}>
                  <Text strong>{user.nickname}</Text>
                  <Text type="secondary">
                    {user.points.toLocaleString()} 캐시
                  </Text>
                </Space>
              </Dropdown>
            </Space>
          ) : (
            <Space>
              <Button
                type="text"
                icon={<UserOutlined />}
                onClick={() => setIsLoginModalOpen(true)}
              >
                로그인 해주세요
              </Button>
              <Button
                type="primary"
                onClick={() => router.push("/signup")}
                style={{
                  background:
                    "linear-gradient(90deg, #6a5af9 0%, #f857a6 100%)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: "0 2px 8px rgba(100,0,200,0.08)",
                }}
              >
                회원가입
              </Button>
            </Space>
          )}
        </div>
      </Header>

      <Layout style={{ marginTop: 64 }}>
        <Sider
          width={250}
          style={{
            background: "#fff",
            position: "fixed",
            height: "calc(100vh - 64px)",
            left: 0,
            top: 64,
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            style={{ flex: 1, borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<HomeOutlined />}>
              피드보기
            </Menu.Item>
            <Menu.Item key="2" icon={<CompassOutlined />}>
              탐색
            </Menu.Item>
          </Menu>

          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #f0f0f0",
              color: "#8c8c8c",
              fontSize: "12px",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <div>고객센터</div>
              <div>평일 09:00 - 18:00</div>
              <div>주말 및 공휴일 휴무</div>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <div>회사명: 세컨아이디</div>
              <div>대표: 홍길동</div>
            </div>

            <div style={{ marginTop: "16px" }}>
              ©{new Date().getFullYear()} seconid
            </div>
          </div>
        </Sider>

        <Layout style={{ marginLeft: 250 }}>
          <Content style={{ padding: "24px 50px" }}>
            {/* 메인 배너 */}
            <div
              style={{
                height: "300px",
                background: "linear-gradient(45deg, #1890ff, #722ed1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                marginBottom: "50px",
                borderRadius: "8px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Title
                  level={2}
                  style={{ color: "#fff", marginBottom: "20px" }}
                >
                  당신만의 크리에이터를 만나보세요
                </Title>
                <Paragraph style={{ color: "#fff", fontSize: "18px" }}>
                  다양한 분야의 크리에이터들과 함께 특별한 경험을 시작하세요
                </Paragraph>
              </div>
            </div>

            {/* 서비스 소개 */}
            <div
              style={{
                maxWidth: 800,
                margin: "0 auto",
                padding: "40px 20px",
                textAlign: "center",
              }}
            >
              <Title level={4} style={{ marginBottom: 24 }}>
                당신만의 특별한 경험을 시작하세요
              </Title>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "32px",
                  marginTop: 32,
                }}
              >
                <div>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
                  <Title level={5}>다양한 크리에이터</Title>
                  <Paragraph style={{ color: "#666" }}>
                    게임, 음악, 아트 등 다양한 분야의 크리에이터들과 함께하세요
                  </Paragraph>
                </div>
                <div>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>💡</div>
                  <Title level={5}>특별한 경험</Title>
                  <Paragraph style={{ color: "#666" }}>
                    크리에이터와 함께하는 독특하고 특별한 경험을 만나보세요
                  </Paragraph>
                </div>
                <div>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
                  <Title level={5}>즐거운 소통</Title>
                  <Paragraph style={{ color: "#666" }}>
                    크리에이터와 팬들이 함께 만들어가는 즐거운 커뮤니티
                  </Paragraph>
                </div>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </Layout>
  );
}
