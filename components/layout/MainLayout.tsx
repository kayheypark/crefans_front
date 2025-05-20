"use client";

import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Button,
  Avatar,
  Menu,
  Space,
  Modal,
  Dropdown,
  Badge,
  Card,
  Tabs,
  List,
  message,
  Input,
  Pagination,
  Empty,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  HomeOutlined,
  LogoutOutlined,
  BellOutlined,
  MoreOutlined,
  DeleteOutlined,
  LayoutOutlined,
  CompassOutlined,
  SettingOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import LoginModal from "@/components/modals/LoginModal";
import Masonry from "react-masonry-css";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Paragraph } = Typography;

const MAX_NOTIFICATIONS_DISPLAY = 30;
const DEFAULT_PROFILE_IMG = "/profile-30.png";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selectedMenu, setSelectedMenu] = useState<string>(() => {
    if (pathname === "/" || pathname === "/home") return "home";
    if (pathname === "/feed") return "feed";
    if (pathname === "/explore") return "explore";
    if (pathname === "/search") return "search";
    return "home";
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationDateType, setNotificationDateType] = useState<{
    [key: number]: boolean;
  }>({});
  const [membershipCreators, setMembershipCreators] = useState<any[]>([]);
  const [followCreators, setFollowCreators] = useState<any[]>([]);
  const [openGroups, setOpenGroups] = useState({
    membership: true,
    follow: true,
  });
  const [activeSearchTab, setActiveSearchTab] = useState<
    "creators" | "posts" | "photos" | "videos"
  >("creators");
  const [searchPage, setSearchPage] = useState({
    creators: 1,
    posts: 1,
    photos: 1,
    videos: 1,
  });

  useEffect(() => {
    // 알림 mock 데이터 fetch
    fetch("/mock/notifications.json")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setUnreadNotifications(data.length);
      });

    // 크리에이터 데이터 fetch
    fetch("/mock/membershipCreators.json")
      .then((res) => res.json())
      .then(setMembershipCreators);

    fetch("/mock/followCreators.json")
      .then((res) => res.json())
      .then(setFollowCreators);
  }, []);

  useEffect(() => {
    // 현재 경로에 따라 메뉴 선택
    if (pathname === "/" || pathname === "/home") {
      setSelectedMenu("home");
    } else if (pathname === "/feed") {
      setSelectedMenu("feed");
    } else if (pathname === "/explore") {
      setSelectedMenu("explore");
    } else if (pathname === "/search") {
      setSelectedMenu("search");
    }
  }, [pathname]);

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

  const handleMenuChange = (info: { key: string }) => {
    setSelectedMenu(info.key);
    switch (info.key) {
      case "home":
        router.push("/home");
        break;
      case "feed":
        router.push("/feed");
        break;
      case "explore":
        router.push("/explore");
        break;
      case "search":
        router.push("/search");
        break;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleNotificationDateType = (id: number) => {
    setNotificationDateType((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    setUnreadNotifications((prev) => Math.max(0, prev - 1));
    message.success("알림이 삭제되었습니다.");
  };

  const renderNotificationList = (items: any[], category: string) => {
    const displayItems = items.slice(0, MAX_NOTIFICATIONS_DISPLAY);
    return (
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <List
          size="small"
          dataSource={displayItems}
          locale={{ emptyText: "새로운 메시지가 없습니다." }}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "0px 0px",
                alignItems: "center",
                borderBottom: "1px solid #f0f0f0",
                background: "#fff",
                borderRadius: 0,
                minHeight: 64,
              }}
              extra={
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "delete",
                        icon: <DeleteOutlined />,
                        label: "삭제하기",
                        onClick: () => handleDeleteNotification(item.id),
                      },
                    ],
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    size="small"
                    style={{ color: "#8c8c8c" }}
                  />
                </Dropdown>
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  width: "100%",
                }}
              >
                <Avatar src={DEFAULT_PROFILE_IMG} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: 15,
                      color: "#222",
                      marginBottom: 2,
                    }}
                  >
                    {item.message}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8c8c8c",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {notificationDateType[item.id]
                      ? formatFullDate(item.createdAt)
                      : formatDate(item.createdAt)}
                    <Button
                      type="text"
                      size="small"
                      style={{ padding: 0, fontSize: 12 }}
                      onClick={() => toggleNotificationDateType(item.id)}
                    >
                      {notificationDateType[item.id] ? "간단히" : "정확히"}
                    </Button>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
        <List.Item
          style={{
            padding: "16px 0 8px",
            textAlign: "center",
            color: "#8c8c8c",
            fontSize: 13,
            background: "#fff",
            borderBottom: "none",
          }}
        >
          최근 14일 동안 받은 알림을 모두 확인했습니다.
        </List.Item>
      </div>
    );
  };

  const notificationMenu = (
    <Card
      style={{ width: 400, padding: 0, maxHeight: "500px", overflow: "hidden" }}
    >
      <Tabs
        defaultActiveKey="all"
        items={[
          {
            key: "all",
            label: "전체",
            children: renderNotificationList(notifications, "all"),
          },
          {
            key: "messages",
            label: "메시지",
            children: renderNotificationList(
              notifications.filter((n) => n.type === "message"),
              "messages"
            ),
          },
          {
            key: "payments",
            label: "결제 및 구독",
            children: renderNotificationList(
              notifications.filter((n) => n.type === "payment"),
              "payments"
            ),
          },
          {
            key: "activities",
            label: "활동",
            children: renderNotificationList(
              notifications.filter((n) => n.type === "activity"),
              "activities"
            ),
          },
        ]}
        onChange={(key) => {
          const displayedNotifications = notifications.slice(
            0,
            MAX_NOTIFICATIONS_DISPLAY
          );
          setUnreadNotifications((prev) =>
            Math.max(0, prev - displayedNotifications.length)
          );
        }}
      />
    </Card>
  );

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

  const footerLinks = [
    { label: "소개" },
    { label: "크리에이터 센터" },
    { label: "서비스 이용 약관" },
    { label: "개인 정보 처리 방침", strong: true },
    { label: "환불 정책" },
  ];

  const sideBarWidth = 335;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Sider
          width={sideBarWidth}
          style={{
            background: "#fff",
            position: "fixed",
            height: "100vh",
            left: 0,
            top: 0,
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            zIndex: 999,
          }}
        >
          <div
            style={{
              padding: "32px 16px 16px 16px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 24,
                paddingLeft: 16,
              }}
            >
              <img
                src="/seconid-logo.png"
                alt="seconid"
                height={28}
                style={{ marginRight: 8 }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {user ? (
                <>
                  <Dropdown
                    overlay={notificationMenu}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Badge count={unreadNotifications} size="small">
                      <Button type="text" icon={<BellOutlined />} />
                    </Badge>
                  </Dropdown>
                  <Dropdown overlay={userMenu} trigger={["click"]}>
                    <span
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text strong>{user.nickname}</Text>
                      <Text type="secondary">
                        🪱{user.points.toLocaleString()}
                      </Text>
                    </span>
                  </Dropdown>
                </>
              ) : (
                <>
                  <Button
                    type="text"
                    icon={<LoginOutlined />}
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    로그인
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => router.push("/signup")}
                    style={{
                      color: "#fff",
                      border: "none",
                      fontSize: 15,
                      boxShadow: "0 2px 8px rgba(100,0,200,0.08)",
                    }}
                  >
                    회원가입
                  </Button>
                </>
              )}
            </div>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            style={{ border: "none" }}
            onClick={handleMenuChange}
          >
            <Menu.Item key="home" icon={<HomeOutlined />}>
              홈
            </Menu.Item>
            <Menu.Item key="feed" icon={<CompassOutlined />}>
              피드
            </Menu.Item>
            <Menu.Item key="explore" icon={<CompassOutlined />}>
              둘러보기
            </Menu.Item>
            <Menu.Item key="search" icon={<SearchOutlined />}>
              검색
            </Menu.Item>

            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                marginTop: 10,
                marginBottom: 10,
              }}
            ></div>

            <Menu.ItemGroup
              key="membershipGroup"
              title={
                <Text
                  style={{ paddingLeft: 16, fontSize: 14, fontWeight: 700 }}
                >
                  멤버십
                </Text>
              }
            >
              {user ? (
                membershipCreators.map((creator) => (
                  <Menu.Item key={creator.key} style={{ padding: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 16px",
                      }}
                    >
                      <Avatar
                        src={creator.avatar}
                        size={24}
                        style={{ marginRight: 8 }}
                      />
                      <span style={{ flex: 1 }}>{creator.name}</span>
                      {creator.unread && (
                        <Badge
                          color="#1677ff"
                          dot
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </div>
                  </Menu.Item>
                ))
              ) : (
                <div
                  style={{
                    padding: "8px 0 8px 32px",
                    color: "#8c8c8c",
                    fontSize: 13,
                  }}
                >
                  로그인 후 이용 가능합니다.
                </div>
              )}
            </Menu.ItemGroup>

            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                marginTop: 10,
                marginBottom: 10,
              }}
            ></div>

            <Menu.ItemGroup
              key="followGroup"
              title={
                <Text
                  style={{ paddingLeft: 16, fontSize: 14, fontWeight: 700 }}
                >
                  팔로우
                </Text>
              }
            >
              {user ? (
                followCreators.map((creator) => (
                  <Menu.Item key={creator.key} style={{ padding: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 16px",
                      }}
                    >
                      <Avatar
                        src={creator.avatar}
                        size={24}
                        style={{ marginRight: 8 }}
                      />
                      <span style={{ flex: 1 }}>{creator.name}</span>
                      {creator.unread && (
                        <Badge
                          color="#1677ff"
                          dot
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </div>
                  </Menu.Item>
                ))
              ) : (
                <div
                  style={{
                    padding: "8px 0 8px 32px",
                    color: "#8c8c8c",
                    fontSize: 13,
                  }}
                >
                  로그인 후 이용 가능합니다.
                </div>
              )}
            </Menu.ItemGroup>
          </Menu>

          <div
            style={{
              padding: "16px",
              color: "#8c8c8c",
              fontSize: "13px",
              borderTop: "1px solid #f0f0f0",
              marginTop: 10,
            }}
          >
            <div style={{ marginBottom: 8, paddingLeft: 16 }}>
              {footerLinks.map((item, idx) => (
                <Text
                  key={item.label}
                  strong={item.strong}
                  style={{
                    display: "inline-block",
                    marginRight: idx !== footerLinks.length - 1 ? 12 : 0,
                    cursor: "pointer",
                    letterSpacing: "-0.05em",
                  }}
                >
                  {item.label}
                </Text>
              ))}
            </div>
            <div style={{ paddingLeft: 16 }}>
              <Paragraph style={{ marginBottom: 8, color: "#8c8c8c" }}>
                (주) 세컨아이디
              </Paragraph>
              <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                대표이사 : 000
              </Paragraph>
              <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                이메일 : support@domain.com
              </Paragraph>
              <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                전화번호 : 000-0000-0000
              </Paragraph>
              <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                주소 : 서울시 00구 00동 00길 00호
              </Paragraph>
              <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                통신판매업신고번호 : 2025-서울시-00000
              </Paragraph>
              <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                사업자 등록번호 : 000-00-00000
              </Paragraph>
              <Text
                style={{
                  display: "block",
                  marginTop: 16,
                  color: "#b0b0b0",
                  fontSize: 12,
                }}
              >
                © {new Date().getFullYear()} SECONID, Inc. All rights reserved
              </Text>
            </div>
          </div>
        </Sider>

        <Layout style={{ marginLeft: sideBarWidth }}>
          <Content style={{ margin: "24px 16px", padding: 24, minHeight: 280 }}>
            {children}
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
