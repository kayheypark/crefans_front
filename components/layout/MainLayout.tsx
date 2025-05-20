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
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import LoginModal from "@/components/modals/LoginModal";
import Masonry from "react-masonry-css";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const MAX_NOTIFICATIONS_DISPLAY = 30;
const DEFAULT_PROFILE_IMG = "/profile-30.png";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState<string>(
    searchParams.get("menu") || "home"
  );
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
  const pageSize = 10;

  useEffect(() => {
    const menuParam = searchParams.get("menu");
    if (menuParam && menuParam !== selectedMenu) {
      setSelectedMenu(menuParam);
    }
    if (!menuParam && selectedMenu !== "home") {
      setSelectedMenu("home");
    }
  }, [searchParams]);

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

  const handleMenuChange = (menuKey: string) => {
    setSelectedMenu(menuKey);
    const params = new URLSearchParams(searchParams.toString());
    params.set("menu", menuKey);
    router.push(`?${params.toString()}`);
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
      <>
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
        <div
          style={{
            textAlign: "center",
            color: "#8c8c8c",
            fontSize: 13,
            padding: "16px 0 8px",
          }}
        >
          최근 14일 동안 받은 알림을 모두 확인했습니다.
        </div>
      </>
    );
  };

  const searchResults = {
    creators: searchQuery
      ? membershipCreators.filter(
          (creator) =>
            creator.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            creator.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
      : membershipCreators,
    posts: [
      {
        id: 1,
        title: "오늘의 일상",
        content: "오늘은 정말 좋은 날이에요!",
        author: "크리에이터1",
        createdAt: "2024-03-20T10:00:00",
        likes: 120,
        comments: 15,
      },
      {
        id: 2,
        title: "새로운 프로젝트",
        content: "새로운 프로젝트를 시작했어요",
        author: "크리에이터2",
        createdAt: "2024-03-19T15:30:00",
        likes: 85,
        comments: 8,
      },
    ],
    photos: [
      {
        id: 1,
        title: "일출 사진",
        imageUrl: "https://picsum.photos/800/1200",
        author: "크리에이터1",
        createdAt: "2024-03-20T08:00:00",
        likes: 200,
      },
      {
        id: 2,
        title: "자연 풍경",
        imageUrl: "https://picsum.photos/1200/800",
        author: "크리에이터2",
        createdAt: "2024-03-19T14:20:00",
        likes: 150,
      },
      {
        id: 3,
        title: "도시 야경",
        imageUrl: "https://picsum.photos/600/900",
        author: "크리에이터3",
        createdAt: "2024-03-18T20:15:00",
        likes: 180,
      },
      {
        id: 4,
        title: "바다 풍경",
        imageUrl: "https://picsum.photos/900/600",
        author: "크리에이터4",
        createdAt: "2024-03-17T16:30:00",
        likes: 220,
      },
      {
        id: 5,
        title: "산 정상",
        imageUrl: "https://picsum.photos/1000/1500",
        author: "크리에이터5",
        createdAt: "2024-03-16T11:45:00",
        likes: 190,
      },
      {
        id: 6,
        title: "꽃밭",
        imageUrl: "https://picsum.photos/1500/1000",
        author: "크리에이터6",
        createdAt: "2024-03-15T09:20:00",
        likes: 170,
      },
    ],
    videos: [
      {
        id: 1,
        title: "동영상 게시글 1",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터1",
        createdAt: "2024-03-20T09:00:00",
        views: 1200,
        duration: "03:12",
        tags: ["태그1", "태그2", "태그3"],
      },
      {
        id: 2,
        title: "동영상 게시글 2",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터2",
        createdAt: "2024-03-19T16:00:00",
        views: 800,
        duration: "01:18",
        tags: ["게임", "리그오브레전드"],
      },
      {
        id: 3,
        title: "동영상 게시글 3",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터3",
        createdAt: "2024-03-18T14:30:00",
        views: 1500,
        duration: "02:26",
        tags: ["요리", "하이라이트"],
      },
      {
        id: 4,
        title: "동영상 게시글 4",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터4",
        createdAt: "2024-03-17T21:15:00",
        views: 2000,
        duration: "04:44",
        tags: ["일상", "브이로그"],
      },
      {
        id: 5,
        title: "동영상 게시글 5",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터5",
        createdAt: "2024-03-16T19:45:00",
        views: 950,
        duration: "10:09",
        tags: ["게임", "하이라이트"],
      },
      {
        id: 6,
        title: "동영상 게시글 6",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터6",
        createdAt: "2024-03-15T17:30:00",
        views: 1100,
        duration: "02:08",
        tags: ["일상", "브이로그"],
      },
      {
        id: 7,
        title: "동영상 게시글 7",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터7",
        createdAt: "2024-03-14T17:30:00",
        views: 1300,
        duration: "03:40",
        tags: ["게임", "하이라이트"],
      },
      {
        id: 8,
        title: "동영상 게시글 8",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터8",
        createdAt: "2024-03-13T17:30:00",
        views: 1600,
        duration: "08:45",
        tags: ["요리", "브이로그"],
      },
      {
        id: 9,
        title: "동영상 게시글 9",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터9",
        createdAt: "2024-03-12T17:30:00",
        views: 900,
        duration: "05:04",
        tags: ["일상", "브이로그"],
      },
      {
        id: 10,
        title: "동영상 게시글 10",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터10",
        createdAt: "2024-03-11T17:30:00",
        views: 2100,
        duration: "06:38",
        tags: ["게임", "하이라이트"],
      },
    ],
  };

  const renderSearchResults = () => {
    const tab = activeSearchTab;
    const data = searchResults[tab] || [];
    const pagedData = data.slice(
      (searchPage[tab] - 1) * pageSize,
      searchPage[tab] * pageSize
    );

    if (tab === "creators") {
      return (
        <>
          <List
            dataSource={pagedData}
            renderItem={(creator) => (
              <List.Item
                style={{
                  padding: 0,
                  background: "transparent",
                  marginBottom: 24,
                }}
              >
                <Card
                  hoverable
                  style={{
                    borderRadius: 14,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                    minHeight: 120,
                    padding: "24px 40px",
                    width: "100%",
                  }}
                  bodyStyle={{
                    width: "100%",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    size={80}
                    src={creator.avatar}
                    style={{ marginRight: 40, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 22 }}>
                        {creator.name}
                      </span>
                    </div>
                    <div style={{ color: "#444", fontSize: 16 }}>
                      {creator.description}
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="검색 결과가 없습니다" /> }}
          />
          <Pagination
            current={searchPage[tab]}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, [tab]: page }))
            }
            style={{ textAlign: "center", marginTop: 24 }}
            showSizeChanger={false}
          />
        </>
      );
    }

    if (tab === "posts") {
      return (
        <>
          <List
            dataSource={pagedData}
            renderItem={(post) => (
              <List.Item
                style={{
                  padding: 0,
                  background: "transparent",
                  marginBottom: 24,
                }}
              >
                <Card
                  hoverable
                  style={{
                    borderRadius: 14,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    padding: "24px",
                    width: "100%",
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Avatar size={32} src={DEFAULT_PROFILE_IMG} />
                      <span style={{ fontWeight: 500 }}>{post.author}</span>
                    </div>
                    <Title level={4} style={{ margin: "8px 0" }}>
                      {post.title}
                    </Title>
                    <Text style={{ color: "#666" }}>{post.content}</Text>
                  </div>
                  <div style={{ display: "flex", gap: 16, color: "#8c8c8c" }}>
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="검색 결과가 없습니다" /> }}
          />
          <Pagination
            current={searchPage[tab]}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, [tab]: page }))
            }
            style={{ textAlign: "center", marginTop: 24 }}
            showSizeChanger={false}
          />
        </>
      );
    }

    if (tab === "photos") {
      return (
        <>
          <Masonry
            breakpointCols={{
              default: 3,
              1100: 3,
              700: 2,
              500: 1,
            }}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {pagedData.map((photo) => (
              <div
                key={photo.id}
                style={{ marginBottom: 24, position: "relative" }}
              >
                <div
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <img
                    alt={photo.title}
                    src={photo.imageUrl}
                    style={{
                      width: "100%",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0) 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: 16,
                      color: "#fff",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        marginBottom: 8,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {photo.title}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Avatar src={DEFAULT_PROFILE_IMG} size={24} />
                      {photo.author}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Masonry>
          <style jsx global>{`
            .masonry-grid {
              display: flex;
              margin-left: -24px;
              width: auto;
            }
            .masonry-grid_column {
              padding-left: 24px;
              background-clip: padding-box;
            }
            .masonry-grid_column > div {
              margin-bottom: 24px;
            }
          `}</style>
          <Pagination
            current={searchPage[tab]}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, [tab]: page }))
            }
            style={{ textAlign: "center", marginTop: 24 }}
            showSizeChanger={false}
          />
        </>
      );
    }

    if (tab === "videos") {
      return (
        <>
          <List
            grid={{ gutter: [24, 32], column: 4 }}
            dataSource={pagedData}
            renderItem={(video) => (
              <List.Item>
                <div style={{ cursor: "pointer" }}>
                  <div style={{ position: "relative", marginBottom: 12 }}>
                    <img
                      alt={video.title}
                      src={video.thumbnailUrl}
                      style={{
                        width: "100%",
                        aspectRatio: "16/9",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.8)",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      {video.duration}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <Avatar src={DEFAULT_PROFILE_IMG} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 500,
                          marginBottom: 4,
                          color: "#222",
                        }}
                      >
                        {video.title}
                      </div>
                      <div
                        style={{ fontSize: 14, color: "#666", marginBottom: 4 }}
                      >
                        {video.author}
                      </div>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {video.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            style={{
                              background: "#f5f5f5",
                              padding: "2px 8px",
                              borderRadius: 12,
                              fontSize: 13,
                              color: "#666",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <Pagination
            current={searchPage[tab]}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, [tab]: page }))
            }
            style={{ textAlign: "center", marginTop: 32 }}
            showSizeChanger={false}
          />
        </>
      );
    }

    return <Empty description="검색 결과가 없습니다" />;
  };

  const notificationMenu = (
    <Card style={{ width: 400, padding: 0 }}>
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
            children: renderNotificationList(notifications, "messages"),
          },
          {
            key: "subscriptions",
            label: "결제 및 구독",
            children: renderNotificationList(notifications, "subscriptions"),
          },
        ]}
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
          zIndex: 999,
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
          <Text style={{ fontSize: 10, color: "#666", marginTop: "-5px" }}>
            인플루언서의 두번째 계정
          </Text>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 20,
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
                <Space style={{ cursor: "pointer" }}>
                  <Text strong>{user.nickname}</Text>
                  <Text type="secondary">🪱{user.points.toLocaleString()}</Text>
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
                  color: "#fff",
                  border: "none",
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
            overflowY: "auto",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            style={{ flex: 1, borderRight: 0 }}
          >
            <Menu.Item
              key="home"
              icon={<HomeOutlined />}
              onClick={() => handleMenuChange("home")}
            >
              홈
            </Menu.Item>
            <Menu.Item
              key="feed"
              icon={<LayoutOutlined />}
              onClick={() => handleMenuChange("feed")}
            >
              피드보기
            </Menu.Item>
            <Menu.Item
              key="explore"
              icon={<CompassOutlined />}
              onClick={() => handleMenuChange("explore")}
            >
              탐색
            </Menu.Item>

            <Menu.ItemGroup
              key="membershipGroup"
              title="멤버십 구독 크리에이터"
            >
              {membershipCreators.map((creator) => (
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
              ))}
            </Menu.ItemGroup>

            <Menu.ItemGroup key="followGroup" title="팔로우 크리에이터">
              {followCreators.map((creator) => (
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
              ))}
            </Menu.ItemGroup>
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
          <Content style={{ margin: "24px 16px", padding: 24, minHeight: 280 }}>
            {children}
          </Content>
        </Layout>
      </Layout>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <Modal
        title={
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Title level={4} style={{ margin: 0 }}>
              검색
            </Title>
          </div>
        }
        open={isSearchModalOpen}
        onCancel={() => {
          setIsSearchModalOpen(false);
          setSearchQuery("");
        }}
        width={800}
        footer={null}
        style={{ top: 20 }}
      >
        <div style={{ padding: "0 20px" }}>
          <Input.Search
            placeholder="크리에이터 또는 포스팅을 검색해보세요"
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "24px" }}
          />
          <Tabs
            activeKey={activeSearchTab}
            onChange={(key) =>
              setActiveSearchTab(
                key as "creators" | "posts" | "photos" | "videos"
              )
            }
            items={[
              {
                key: "creators",
                label: "크리에이터",
                children: renderSearchResults(),
              },
              {
                key: "posts",
                label: "게시글",
                children: renderSearchResults(),
              },
              {
                key: "photos",
                label: "사진",
                children: renderSearchResults(),
              },
              {
                key: "videos",
                label: "동영상",
                children: renderSearchResults(),
              },
            ]}
            style={{ marginTop: "8px" }}
          />
        </div>
      </Modal>
    </Layout>
  );
}
