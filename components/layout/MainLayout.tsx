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
  ArrowLeftOutlined,
  PlusOutlined,
  MenuOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import LoginModal from "@/components/modals/LoginModal";
import ChargeModal from "@/components/modals/ChargeModal";
import Masonry from "react-masonry-css";
import SignUpModal from "@/app/(main)/home/SignUpModal";
import Colors from "@/lib/constants/colors";
import axios from "axios";
import { getApiUrl } from "@/utils/env";
import Spacings from "@/lib/constants/spacings";
import { useResponsive } from "@/hooks/useResponsive";
import { responsiveStyles } from "@/lib/constants/breakpoints";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Paragraph } = Typography;

const MAX_NOTIFICATIONS_DISPLAY = 30;
const DEFAULT_PROFILE_IMG = "/profile-30.png";

interface MainLayoutProps {
  children: React.ReactNode;
}

const pageTitles: { [key: string]: string } = {
  "/feed": "피드",
  "/explore": "둘러보기",
  "/search": "검색",
  "/settings": "설정",
  "/profile": "프로필",
  "/profile/edit": "프로필 관리",
  "/write": "글쓰기",
  "/board": "게시판",
  "/payment-history": "결제이력",
};

// 동적 라우팅을 위한 페이지 제목 매칭 함수
const getPageTitle = (pathname: string): string | undefined => {
  // 정확한 매칭 먼저 시도
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  // 동적 라우팅 패턴 매칭
  if (pathname.startsWith("/board/") && pathname.split("/").length === 3) {
    return "게시글 상세";
  }

  return undefined;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [selectedMenu, setSelectedMenu] = useState<string>(() => {
    if (pathname === "/" || pathname === "/home") return "home";
    if (pathname === "/feed") return "feed";
    if (pathname === "/explore") return "explore";
    if (pathname === "/search") return "search";
    return "home";
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
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
  const [activeNotificationTab, setActiveNotificationTab] = useState("all");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [openMenuKeys, setOpenMenuKeys] = useState<string[]>([
    "membershipGroup",
    "followGroup",
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // 클라이언트 마운트 후 로컬스토리지에서 상태 불러오기
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar_open_keys");
      if (stored) {
        setOpenMenuKeys(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("로컬스토리지 불러오기 실패:", error);
    }
  }, []);

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

  const handleLogout = async () => {
    try {
      await axios.post(
        `${getApiUrl()}/auth/signout`,
        {},
        { withCredentials: true }
      );
      logout();
      message.success("로그아웃 되었습니다.");
    } catch (error) {
      message.error("로그아웃 중 오류가 발생했습니다.");
    }
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
    // 모바일과 태블릿에서 사이드바 닫기
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    message.success("메시지가 삭제되었습니다.");
  };

  const renderNotificationList = (items: any[], category: string) => {
    const displayItems = items.slice(0, MAX_NOTIFICATIONS_DISPLAY);
    return (
      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
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
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              extra={
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "delete",
                        icon: <DeleteOutlined />,
                        label: "삭제하기",
                        onClick: () => {
                          handleDeleteNotification(item.id);
                        },
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
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleNotificationDateType(item.id);
                      }}
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

  const notificationMenu = {
    items: [
      {
        key: "notifications",
        label: (
          <div
            style={{ width: 400, padding: "16px" }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Tabs
              activeKey={activeNotificationTab}
              onChange={setActiveNotificationTab}
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
            />
          </div>
        ),
      },
    ],
  };

  const userMenu = {
    items: [
      {
        key: "write",
        icon: <EditOutlined />,
        label: "글쓰기",
        onClick: () => {
          router.push("/write");
          // 모바일과 태블릿에서 사이드바 닫기
          if (isMobile || isTablet) {
            setIsSidebarOpen(false);
          }
        },
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "설정",
        onClick: () => {
          router.push("/settings");
          // 모바일과 태블릿에서 사이드바 닫기
          if (isMobile || isTablet) {
            setIsSidebarOpen(false);
          }
        },
      },
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "프로필",
        onClick: () => {
          router.push("/profile");
          // 모바일과 태블릿에서 사이드바 닫기
          if (isMobile || isTablet) {
            setIsSidebarOpen(false);
          }
        },
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "로그아웃",
        onClick: handleLogout,
        style: {
          backgroundColor: "#ff4d4f",
          color: "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      },
    ],
  };

  const footerLinks = [
    { label: "소개" },
    { label: "크리에이터 센터" },
    { label: "서비스 이용 약관", href: "/support?category=terms" },
    {
      label: "개인 정보 처리 방침",
      strong: true,
      href: "/support?category=privacy",
    },
    { label: "환불 정책", href: "/support?category=refund" },
    { label: "공지사항", href: "/board?category=notice" },
  ];

  const sideBarWidth = isMobile ? 335 : isTablet ? 335 : 335;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        {/* 태블릿용 축소된 사이드바 (기본 표시) */}
        {isTablet && !isMobile && (
          <Sider
            width={80}
            style={{
              backgroundColor: "white",
              borderRight: "1px solid #f0f0f0",
              position: "fixed",
              height: "100vh",
              left: 0,
              top: 0,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              zIndex: 999,
            }}
          >
            {/* 햄버거 메뉴 버튼 */}
            <div
              style={{
                padding: "32px 16px 16px 16px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={toggleSidebar}
                style={{
                  fontSize: 20,
                  padding: 0,
                  height: "auto",
                }}
              />
            </div>

            {/* 축소된 메뉴 아이템들 (아이콘만) */}
            <Menu
              mode="inline"
              selectedKeys={[selectedMenu]}
              style={{ border: "none" }}
              onClick={handleMenuChange}
              items={[
                {
                  key: "home",
                  icon: <HomeOutlined style={{ fontSize: 20 }} />,
                  label: "",
                  style: { fontSize: 20, textAlign: "center" },
                },
                {
                  key: "feed",
                  icon: <LayoutOutlined style={{ fontSize: 20 }} />,
                  label: "",
                  style: { fontSize: 20, textAlign: "center" },
                },
                {
                  key: "explore",
                  icon: <CompassOutlined style={{ fontSize: 20 }} />,
                  label: "",
                  style: { fontSize: 20, textAlign: "center" },
                },
                {
                  key: "search",
                  icon: <SearchOutlined style={{ fontSize: 20 }} />,
                  label: "",
                  style: { fontSize: 20, textAlign: "center" },
                },
              ]}
            />
          </Sider>
        )}

        {/* 모바일과 태블릿 PC 버전 사이드바 오버레이 */}
        {(isMobile || isTablet) && isSidebarOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 998,
            }}
            onClick={toggleSidebar}
          />
        )}

        {/* PC 버전 사이드바 (모바일과 태블릿에서 오버레이로 표시) */}
        <Sider
          width={sideBarWidth}
          style={{
            backgroundColor: "white", // 사이드바 배경색
            borderRight: isTablet ? "none" : "1px solid #f0f0f0",
            position: "fixed",
            height: "100vh",
            left: isMobile
              ? isSidebarOpen
                ? 0
                : -sideBarWidth
              : isTablet
              ? isSidebarOpen
                ? 0
                : -sideBarWidth
              : 0,
            top: 0,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            zIndex: isMobile || isTablet ? 1001 : 999,
            transition:
              isMobile || isTablet ? "left 100ms ease-in-out" : "none",
            boxShadow:
              isMobile || isTablet ? "2px 0 8px rgba(0,0,0,0.1)" : "none",
          }}
        >
          <div
            style={{
              padding: "32px 16px 16px 16px",
              borderBottom: "1px solid #f0f0f0",
              //   background: "#fff",
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
                src="/logo.png"
                alt="crefans"
                height={28}
                style={{
                  marginRight: 8,
                  cursor: "pointer",
                }}
                onClick={() => router.push("/")}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {user ? (
                <>
                  <div
                    style={{
                      width: "100%",
                      //   background: "#fff",
                      borderRadius: 16,
                      padding: "20px 20px 16px 5px",
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                      }}
                    >
                      <Dropdown menu={userMenu} trigger={["click"]}>
                        <Avatar
                          src={user.attributes.picture || "/profile-90.png"}
                          size={48}
                          style={{
                            border: "1px solid #eee",
                            cursor: "pointer",
                          }}
                          onClick={() => {}}
                        />
                      </Dropdown>
                      {(isDesktop || isTablet || isMobile) && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <Text
                            strong
                            style={{
                              fontSize: 14,
                              color: "#222",
                              marginBottom: 0,
                            }}
                          >
                            {user.attributes.nickname}
                          </Text>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 15,
                              color: "#8c8c8c",
                              marginTop: 0,
                            }}
                          >
                            {user.attributes.preferred_username
                              ? "@" + user.attributes.preferred_username
                              : "핸들이 없습니다."}
                          </Text>
                        </div>
                      )}
                      <Dropdown
                        menu={notificationMenu}
                        trigger={["click"]}
                        placement="bottomRight"
                        overlayClassName="notification-dropdown"
                      >
                        <Badge count={unreadNotifications} size="small">
                          <Button type="text" icon={<BellOutlined />} />
                        </Badge>
                      </Dropdown>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 18,
                        border: "1px solid #f0f0f0",
                        borderRadius: 15,
                        overflow: "hidden",
                        height: 44,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flex: 1,
                          padding: "0 18px",
                          fontSize: 20,
                          color: "#f857a6",
                          fontWeight: 600,
                          height: "100%",
                          gap: 8,
                        }}
                      >
                        {user.points?.toLocaleString() || 0}
                      </div>
                      <Button
                        type="primary"
                        onClick={() => setShowChargeModal(true)}
                        style={{
                          borderRadius: 15,
                          height: "100%",
                          fontWeight: 600,
                          fontSize: 15,
                          background:
                            "linear-gradient(90deg, #6a5af9 0%, #f857a6 100%)",
                          border: "none",
                          minWidth: 90,
                        }}
                      >
                        <PlusOutlined />콩 충전
                      </Button>
                    </div>
                  </div>
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
                    onClick={() => setIsSignUpModalOpen(true)}
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
            openKeys={openMenuKeys}
            onOpenChange={(keys) => {
              const newKeys = keys as string[];
              setOpenMenuKeys(newKeys);
              // 로컬스토리지에 상태 저장
              try {
                localStorage.setItem(
                  "sidebar_open_keys",
                  JSON.stringify(newKeys)
                );
              } catch (error) {
                console.warn("로컬스토리지 저장 실패:", error);
              }
            }}
            items={[
              {
                key: "home",
                icon: <HomeOutlined style={{ fontSize: 20 }} />,
                label: "홈",
                style: { fontSize: 20 },
              },
              {
                key: "feed",
                icon: <LayoutOutlined style={{ fontSize: 20 }} />,
                label: "피드",
                style: { fontSize: 20 },
              },
              {
                key: "explore",
                icon: <CompassOutlined style={{ fontSize: 20 }} />,
                label: "둘러보기",
                style: { fontSize: 20 },
              },
              {
                key: "search",
                icon: <SearchOutlined style={{ fontSize: 20 }} />,
                label: "검색",
                style: { fontSize: 20 },
              },
              {
                type: "divider",
              },
              {
                key: "membershipGroup",
                label: (
                  <Text
                    style={{ paddingLeft: 16, fontSize: 14, fontWeight: 700 }}
                  >
                    멤버십
                  </Text>
                ),
                children: user
                  ? membershipCreators.map((creator) => ({
                      key: creator.key,
                      label: (
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
                      ),
                      style: { padding: 0 },
                    }))
                  : [
                      {
                        key: "membershipLoginRequired",
                        label: (
                          <div
                            style={{
                              padding: "8px 0 8px 32px",
                              color: "#8c8c8c",
                              fontSize: 13,
                            }}
                          >
                            로그인 후 이용 가능합니다.
                          </div>
                        ),
                      },
                    ],
              },
              {
                type: "divider",
              },
              {
                key: "followGroup",
                label: (
                  <Text
                    style={{ paddingLeft: 16, fontSize: 14, fontWeight: 700 }}
                  >
                    팔로우
                  </Text>
                ),
                children: user
                  ? followCreators.map((creator) => ({
                      key: creator.key,
                      label: (
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
                      ),
                      style: { padding: 0 },
                    }))
                  : [
                      {
                        key: "followLoginRequired",
                        label: (
                          <div
                            style={{
                              padding: "8px 0 8px 32px",
                              color: "#8c8c8c",
                              fontSize: 13,
                            }}
                          >
                            로그인 후 이용 가능합니다.
                          </div>
                        ),
                      },
                    ],
              },
            ]}
          />

          <div
            style={{
              padding: "16px",
              color: "#8c8c8c",
              fontSize: "13px",
              borderTop: "1px solid #f0f0f0",
              paddingBottom: isMobile ? "80px" : "16px",
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
                  onClick={() => {
                    if (item.href) {
                      router.push(item.href);
                      // 모바일과 태블릿에서 사이드바 닫기
                      if (isMobile || isTablet) {
                        setIsSidebarOpen(false);
                      }
                    }
                  }}
                >
                  {item.label}
                </Text>
              ))}
            </div>
            <div style={{ paddingLeft: 16 }}>
              <Paragraph style={{ marginBottom: 8, color: "#8c8c8c" }}>
                크레팬스
              </Paragraph>
              <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                대표 : 박경호
              </Paragraph>
              <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                이메일 : no-reply@crefans.com (추후 변경)
              </Paragraph>
              {/* <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                전화번호 : 010-0000-0000
              </Paragraph> */}
              {/* <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                주소 : 서울시 00구 00동 00길 00호
              </Paragraph> */}
              {/* <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                통신판매업신고번호 : 2025-서울시-00000
              </Paragraph> */}
              {/* <Paragraph style={{ marginBottom: 2, color: "#8c8c8c" }}>
                사업자 등록번호 : 000-00-00000
              </Paragraph> */}
              <Text
                style={{
                  display: "block",
                  marginTop: 16,
                  color: "#b0b0b0",
                  fontSize: 12,
                }}
              >
                © {new Date().getFullYear()} CREFANS, Inc. All rights reserved
              </Text>
            </div>
          </div>
        </Sider>

        <Layout
          style={{
            marginLeft: isMobile ? 0 : isTablet ? 80 : sideBarWidth,
          }}
        >
          {/* 앱바 (App Bar) */}
          {getPageTitle(pathname) && (
            <div
              style={{
                width: isMobile
                  ? "100%"
                  : isTablet
                  ? "100%"
                  : Spacings.CONTENT_LAYOUT_WIDTH,
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: Colors.APP_BAR_BACKGROUND, // 메인 컨텐츠 네비게이션 배경색
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: isMobile
                  ? "16px"
                  : isTablet
                  ? "24px 16px"
                  : "24px 16px",
                marginBottom: 0,
                minHeight: 64,
                transition: isTablet ? "width 0.3s ease-in-out" : "none",
              }}
            >
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                style={{ marginRight: 8 }}
              />
              <Title
                level={2}
                style={{
                  margin: 0,
                  flex: 1,
                  fontSize: isMobile ? "18px" : "24px",
                  lineHeight: isMobile ? "1.2" : "1.4",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {getPageTitle(pathname)}
              </Title>
              {isMobile && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    // flex: 1,
                    maxWidth: isSearchFocused ? "190px" : "100px",
                    transition: "max-width 0.3s ease",
                  }}
                >
                  <Input
                    placeholder={isSearchFocused ? "무엇이든 찾으세요" : "검색"}
                    size="middle"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => {
                      if (!searchValue) {
                        setIsSearchFocused(false);
                      }
                    }}
                    allowClear
                    style={{
                      width: isSearchFocused ? "220px" : "120px",
                      transition: "width 0.3s ease",
                      borderRadius: 20,
                      height: 40,
                    }}
                  />
                  {isSearchFocused && (
                    <Button
                      type="text"
                      size="middle"
                      icon={<SearchOutlined />}
                      style={{
                        borderRadius: 20,
                        minWidth: 40,
                        height: 40,
                        color: "#666",
                        border: "1px solid #d9d9d9",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
          <Content
            style={{
              width: isMobile
                ? "100%"
                : isTablet
                ? "100%"
                : pathname === "/home"
                ? "1200px"
                : Spacings.CONTENT_LAYOUT_WIDTH,
              paddingLeft: isMobile ? 0 : 15,
              paddingRight: isMobile ? 0 : 15,
              paddingTop: isMobile ? 0 : 12,
              paddingBottom: isMobile ? "80px" : 12,
              minHeight: 280,
              backgroundColor: Colors.BACKGROUND, // 메인 컨텐츠 배경색
              transition: isTablet ? "width 0.3s ease-in-out" : "none",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignUpClick={() => setIsSignUpModalOpen(true)}
      />
      <SignUpModal
        open={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
      />

      <ChargeModal
        open={showChargeModal}
        onClose={() => setShowChargeModal(false)}
      />

      {/* 모바일 하단 네비게이션 */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#fff",
            borderTop: "1px solid #f0f0f0",
            padding: "4px 0",
            zIndex: 1002,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: "20px" }} />}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                color: "#666",
                fontSize: "12px",
                height: "auto",
                padding: "6px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}
            >
              메뉴
            </Button>
            <Button
              type="text"
              icon={<LayoutOutlined style={{ fontSize: "20px" }} />}
              onClick={() => {
                router.push("/feed");
                // 모바일/태블릿에서 사이드바가 열려있다면 닫기
                if ((isMobile || isTablet) && isSidebarOpen) {
                  setIsSidebarOpen(false);
                }
              }}
              style={{
                color: selectedMenu === "feed" ? "#1890ff" : "#666",
                fontSize: "12px",
                height: "auto",
                padding: "6px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}
            >
              피드
            </Button>
            <Button
              type="text"
              icon={<CompassOutlined style={{ fontSize: "20px" }} />}
              onClick={() => {
                router.push("/explore");
                // 모바일/태블릿에서 사이드바가 열려있다면 닫기
                if ((isMobile || isTablet) && isSidebarOpen) {
                  setIsSidebarOpen(false);
                }
              }}
              style={{
                color: selectedMenu === "explore" ? "#1890ff" : "#666",
                fontSize: "12px",
                height: "auto",
                padding: "6px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}
            >
              둘러보기
            </Button>
            {user ? (
              <Dropdown
                menu={userMenu}
                trigger={["click"]}
                placement="top"
                overlayStyle={{
                  position: "fixed",
                  zIndex: 1003,
                }}
              >
                <Avatar
                  src={user.attributes.picture || "/profile-90.png"}
                  size={44}
                  style={{
                    border: "2px solid #f0f0f0",
                    cursor: "pointer",
                  }}
                />
              </Dropdown>
            ) : (
              <Button
                type="text"
                icon={<LoginOutlined style={{ fontSize: "20px" }} />}
                onClick={() => setIsLoginModalOpen(true)}
                style={{
                  color: "#666",
                  fontSize: "12px",
                  height: "auto",
                  padding: "6px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
