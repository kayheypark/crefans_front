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
  UnorderedListOutlined,
  DesktopOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "./contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import LoginModal from "./components/LoginModal";
import Feed from "./components/Feed";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;

// 목업 데이터 생성 함수
function makeArray<T>(len: number, fn: (i: number) => T): T[] {
  return Array.from({ length: len }, (_, i) => fn(i));
}

const followersList = [
  "1.5K",
  "2.3K",
  "5.7K",
  "3.2K",
  "7.8K",
  "4.1K",
  "6.9K",
  "8.4K",
  "9.2K",
  "10.0K",
];

const creators = makeArray(100, (i) => ({
  id: i + 1,
  name: `크리에이터${i + 1}`,
  avatar: "/profile-90.png",
  category: ["게임", "음악", "아트", "요리"][i % 4],
  followers: followersList[i % followersList.length],
  description: `${
    ["게임", "음악", "아트", "요리"][i % 4]
  } 전문 크리에이터입니다.`,
  isSubscribed: i % 2 === 0,
}));

const postList = makeArray(100, (i) => ({
  id: i + 1,
  title: `게시글 제목 ${i + 1}`,
  description: `이것은 게시글 ${
    i + 1
  }의 상세 내용 일부입니다. 다양한 정보가 들어갈 수 있습니다.`,
  views: Math.floor(Math.random() * 10000) + 1,
  creator: `크리에이터${(i % 100) + 1}`,
  createdAt: `2024-03-${(i % 28) + 1}`,
  thumbnail: "/noimage-50.png",
}));

const photoPosts = makeArray(100, (i) => ({
  id: i + 1,
  url: "/noimage-50.png",
  title: `사진 게시글 ${i + 1}`,
  description: `이것은 사진 게시글 ${i + 1}의 설명입니다.`,
  tags: ["여행", "풍경", "자연", "도시", "야경", "빛"][i % 6],
  creator: `크리에이터${(i % 100) + 1}`,
}));

const videoPosts = makeArray(100, (i) => ({
  id: i + 1,
  title: `동영상 게시글 ${i + 1}`,
  description: `이것은 동영상 게시글 ${i + 1}의 설명입니다.`,
  tags:
    i === 0
      ? [
          "태그1",
          "태그2",
          "태그3",
          "태그4",
          "태그5",
          "태그6",
          "태그7",
          "태그8",
          "태그9",
          "태그10",
        ]
      : i === 1
      ? ["게임", "리그오브레전드"]
      : i === 2
      ? ["요리", "하이라이트"]
      : undefined,
  creator: `크리에이터${(i % 100) + 1}`,
  thumbnail: "/noimage-50.png",
  duration: `${String(Math.floor(Math.random() * 10) + 1).padStart(
    2,
    "0"
  )}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
}));

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

const MAX_NOTIFICATIONS_DISPLAY = 30;
const DEFAULT_PROFILE_IMG =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

type SearchTabKey = "creators" | "posts" | "photos" | "videos";

export default function Landing() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState<string>(
    searchParams.get("menu") || "1"
  );
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

  const searchResults: Record<SearchTabKey, any[]> = {
    creators: searchQuery
      ? creators.filter(
          (creator) =>
            creator.name.includes(searchQuery) ||
            creator.description.includes(searchQuery)
        )
      : creators,
    posts: searchQuery
      ? postList.filter(
          (post) =>
            post.title.includes(searchQuery) ||
            post.creator.includes(searchQuery)
        )
      : postList,
    photos: searchQuery
      ? photoPosts.filter(
          (photo) =>
            photo.title.includes(searchQuery) ||
            photo.description.includes(searchQuery) ||
            (Array.isArray(photo.tags)
              ? photo.tags.some((tag: string) => tag.includes(searchQuery))
              : String(photo.tags).includes(searchQuery))
        )
      : photoPosts,
    videos: searchQuery
      ? videoPosts.filter(
          (video) =>
            video.title.includes(searchQuery) ||
            video.description.includes(searchQuery) ||
            (Array.isArray(video.tags)
              ? video.tags.some((tag: string) => tag.includes(searchQuery))
              : String(video.tags).includes(searchQuery))
        )
      : videoPosts,
  };

  const handleDeleteNotification = (
    id: number,
    category: keyof NotificationList
  ) => {
    setNotificationsList((prev) => {
      const newList = { ...prev };
      // 모든 카테고리에서 해당 알림 제거
      (Object.keys(newList) as Array<keyof NotificationList>).forEach((key) => {
        newList[key] = newList[key].filter((item) => item.id !== id);
      });
      return newList;
    });
    setUnreadNotifications((prev) => Math.max(0, prev - 1));
    message.success("알림이 삭제되었습니다.");
  };

  const getNotificationMoreMenu = (
    id: number,
    category: keyof NotificationList
  ) => (
    <Menu>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleDeleteNotification(id, category)}
      >
        삭제하기
      </Menu.Item>
    </Menu>
  );

  const handleNotificationDropdownVisibleChange = (visible: boolean) => {
    if (visible) {
      // 실제로 보여지는 전체 알림 개수만큼만 읽음 처리
      const unreadCount = Math.max(
        0,
        unreadNotifications -
          Math.min(notificationsList.all.length, MAX_NOTIFICATIONS_DISPLAY)
      );
      setUnreadNotifications(unreadCount);
    }
  };

  const renderNotificationList = (
    items: Notification[],
    category: keyof NotificationList
  ) => {
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
                  overlay={getNotificationMoreMenu(item.id, category)}
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
                      wordBreak: "break-all",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                    {item.time}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
          style={{ background: "#fff", borderRadius: "12px 12px 0 0" }}
        />
        <div
          style={{
            textAlign: "center",
            color: "#8c8c8c",
            fontSize: 13,
            padding: "16px 0 8px",
            background: "#fff",
            borderRadius: "0 0 12px 12px",
          }}
        >
          최근 14일 동안 받은 알림을 모두 확인했습니다.
        </div>
      </>
    );
  };

  const notificationMenu = (
    <Card style={{ width: 400, padding: 0 }}>
      <Tabs
        defaultActiveKey="all"
        items={[
          {
            key: "all",
            label: "전체",
            children: renderNotificationList(notificationsList.all, "all"),
          },
          {
            key: "messages",
            label: "메시지",
            children: renderNotificationList(
              notificationsList.messages,
              "messages"
            ),
          },
          {
            key: "subscriptions",
            label: "결제 및 구독",
            children: renderNotificationList(
              notificationsList.subscriptions,
              "subscriptions"
            ),
          },
        ]}
      />
    </Card>
  );

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

  const renderSearchResults = () => {
    const tab = activeSearchTab as SearchTabKey;
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
                    maxWidth: "900px",
                    margin: "0 auto",
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
                    style={{
                      marginRight: 40,
                      flexShrink: 0,
                      border: "2px solid #e6e6e6",
                    }}
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
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 22,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 240,
                        }}
                      >
                        {creator.name}
                      </span>
                      <Tag color="blue" style={{ margin: 0, fontSize: 15 }}>
                        {creator.category}
                      </Tag>
                    </div>
                    <Paragraph
                      style={{
                        margin: 0,
                        color: "#444",
                        fontSize: 16,
                        lineHeight: 1.5,
                        maxWidth: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {creator.description}
                    </Paragraph>
                  </div>
                  <div style={{ minWidth: 120, textAlign: "right" }}>
                    <span style={{ color: "#888", fontSize: 16 }}>
                      {creator.followers} 팔로워
                    </span>
                  </div>
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="검색 결과가 없습니다" /> }}
          />
          <Pagination
            current={searchPage.creators}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, creators: page }))
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
                    boxShadow: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                    minHeight: 120,
                    padding: "24px 40px",
                    width: "100%",
                    maxWidth: "900px",
                    margin: "0 auto",
                  }}
                  bodyStyle={{
                    width: "100%",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 10,
                      marginRight: 40,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 20,
                        marginBottom: 6,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 350,
                      }}
                    >
                      {post.title}
                    </div>
                    <div
                      style={{
                        color: "#444",
                        fontSize: 15,
                        marginBottom: 8,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        maxWidth: 500,
                      }}
                    >
                      {post.description}
                    </div>
                    <div style={{ color: "#888", fontSize: 14, marginTop: 2 }}>
                      조회수 {post.views.toLocaleString()}회
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="검색 결과가 없습니다" /> }}
          />
          <Pagination
            current={searchPage.posts}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, posts: page }))
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
          <List
            grid={{ gutter: 16, column: 5 }}
            dataSource={pagedData}
            renderItem={(photo) => (
              <List.Item style={{ padding: 0, background: "transparent" }}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 5,
                    boxShadow: "none",
                    border: "none",
                    padding: "0",
                    overflow: "visible",
                    width: "100%",
                    background: "#fff",
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* 썸네일 */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16/9",
                      borderRadius: 5,
                      overflow: "hidden",
                      marginBottom: 16,
                    }}
                  >
                    <img
                      src={photo.url || "/noimage-50.png"}
                      alt={photo.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                  {/* 프로필/닉네임/제목 정보 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 2,
                    }}
                  >
                    {/* 왼쪽: 프로필 썸네일 */}
                    <img
                      src={photo.profileImg || "/profile-90.png"}
                      alt={photo.creator}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                    {/* 오른쪽: 닉네임/제목 */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: "#222",
                          fontWeight: 500,
                          marginBottom: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {photo.creator}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#111",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {photo.title}
                      </div>
                    </div>
                  </div>
                  {/* 태그: 항상 한 줄 가로 스크롤만 가능 */}
                  {(Array.isArray(photo.tags) ? photo.tags : []).length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "nowrap",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                        marginTop: 4,
                        scrollbarWidth: "thin",
                      }}
                    >
                      {(Array.isArray(photo.tags) ? photo.tags : []).map(
                        (tag: any, tagIdx: number) => (
                          <span
                            key={tagIdx}
                            style={{
                              background: "#f0f0f0",
                              color: "#666",
                              borderRadius: 16,
                              padding: "2px 10px",
                              fontSize: 12,
                              fontWeight: 500,
                              display: "inline-block",
                            }}
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="검색 결과가 없습니다" /> }}
          />
          <Pagination
            current={searchPage.photos}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, photos: page }))
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
            grid={{ gutter: 16, column: 4 }}
            dataSource={pagedData}
            renderItem={(video) => (
              <List.Item style={{ padding: 0, background: "transparent" }}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 18,
                    boxShadow: "none",
                    border: "none",
                    padding: "0",
                    overflow: "visible",
                    width: "100%",
                    background: "#fff",
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* 썸네일 */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16/9",
                      borderRadius: 5,
                      overflow: "hidden",
                      marginBottom: 16,
                    }}
                  >
                    <img
                      src={video.thumbnail || "/noimage-50.png"}
                      alt={video.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {/* 영상 길이 표시 (오른쪽 하단) */}
                    <span
                      style={{
                        position: "absolute",
                        right: 4,
                        bottom: 4,
                        background: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        borderRadius: "3px",
                        padding: "2px 5px",
                        fontSize: 12,
                        zIndex: 2,
                      }}
                    >
                      {video.duration}
                    </span>
                  </div>
                  {/* 프로필/닉네임/제목 정보 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 2,
                    }}
                  >
                    {/* 왼쪽: 프로필 썸네일 */}
                    <img
                      src={video.profileImg || "/profile-90.png"}
                      alt={video.creator}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                    {/* 오른쪽: 닉네임/제목 */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: "#222",
                          fontWeight: 500,
                          marginBottom: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {video.creator}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#111",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {video.title}
                      </div>
                    </div>
                  </div>
                  {/* 태그: 항상 한 줄 가로 스크롤만 가능 */}
                  {(Array.isArray(video.tags) ? video.tags : []).length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "nowrap",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                        marginTop: 4,
                        scrollbarWidth: "thin",
                      }}
                    >
                      {(Array.isArray(video.tags) ? video.tags : []).map(
                        (tag: any, tagIdx: number) => (
                          <span
                            key={tagIdx}
                            style={{
                              background: "#f0f0f0",
                              color: "#666",
                              borderRadius: 16,
                              padding: "2px 10px",
                              fontSize: 12,
                              fontWeight: 500,
                              display: "inline-block",
                            }}
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="검색 결과가 없습니다" /> }}
          />
          <Pagination
            current={searchPage.videos}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, videos: page }))
            }
            style={{ textAlign: "center", marginTop: 24 }}
            showSizeChanger={false}
          />
        </>
      );
    }
    return null;
  };

  // 메인 콘텐츠 렌더링 함수 수정
  const renderMainContent = () => {
    switch (selectedMenu) {
      case "1":
        return (
          <div style={{ padding: "20px" }}>
            <Title level={2}>홈</Title>
          </div>
        );
      case "2":
        return <Feed />;
      case "3":
        return (
          <div style={{ padding: "20px" }}>
            <Title level={2}>탐색</Title>
          </div>
        );
      default:
        return null;
    }
  };

  // 메뉴 변경 핸들러
  const handleMenuChange = (menuKey: string) => {
    setSelectedMenu(menuKey);
    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams(searchParams.toString());
    params.set("menu", menuKey);
    router.push(`?${params.toString()}`);
  };

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
              <Dropdown
                overlay={notificationMenu}
                trigger={["click"]}
                placement="bottomRight"
                onVisibleChange={handleNotificationDropdownVisibleChange}
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
                  //   background:
                  //     "linear-gradient(90deg, #6a5af9 0%, #f857a6 100%)",
                  color: "#fff",
                  border: "none",
                  //   fontWeight: 600,
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
            selectedKeys={[selectedMenu]}
            style={{ flex: 1, borderRight: 0 }}
          >
            <Menu.Item
              key="1"
              icon={<HomeOutlined />}
              onClick={() => handleMenuChange("1")}
            >
              홈
            </Menu.Item>
            <Menu.Item
              key="2"
              icon={<BarsOutlined />}
              onClick={() => handleMenuChange("2")}
            >
              피드보기
            </Menu.Item>
            <Menu.Item
              key="3"
              icon={<CompassOutlined />}
              onClick={() => handleMenuChange("3")}
            >
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
          <Content style={{ margin: "24px 16px", padding: 24, minHeight: 280 }}>
            {renderMainContent()}
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
            onChange={(key) => setActiveSearchTab(key as SearchTabKey)}
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
            className="search-tabs"
            style={{
              marginTop: "8px",
              marginBottom: "24px",
            }}
          />
        </div>
      </Modal>
    </Layout>
  );
}
