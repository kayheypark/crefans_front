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
} from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "./contexts/AuthContext";
import { useRouter } from "next/navigation";
import LoginModal from "./components/LoginModal";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;

// 임시 크리에이터 데이터
const creators = [
  {
    id: 1,
    name: "김크리에이터",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    category: "게임",
    followers: "10.5K",
    description: "게임 실황 및 리뷰 전문 크리에이터",
    isSubscribed: true,
  },
  {
    id: 2,
    name: "이스트리머",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    category: "음악",
    followers: "8.2K",
    description: "일렉트로닉 음악 프로듀서",
    isSubscribed: false,
  },
  {
    id: 3,
    name: "박아티스트",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    category: "아트",
    followers: "15.3K",
    description: "디지털 아트 및 일러스트레이션",
    isSubscribed: true,
  },
  {
    id: 4,
    name: "최요리사",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
    category: "요리",
    followers: "12.7K",
    description: "홈쿠킹 레시피 전문가",
    isSubscribed: false,
  },
];

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

export default function Home() {
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
    <Menu>
      <Menu.Item key="myInfo" icon={<UserOutlined />}>
        내 정보
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        로그아웃
      </Menu.Item>
    </Menu>
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
        <Title level={3} style={{ margin: 0 }}>
          SECON.ID
        </Title>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <Button type="text" icon={<SearchOutlined />}>
            검색
          </Button>
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
                로그인
              </Button>
              <Button type="primary" onClick={() => router.push("/signup")}>
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
              홈
            </Menu.Item>
            <Menu.Item key="2" icon={<CrownOutlined />}>
              구독 중인 크리에이터
            </Menu.Item>
            <Menu.Item key="3" icon={<FireOutlined />}>
              인기 크리에이터
            </Menu.Item>
            <Menu.Item key="4" icon={<TeamOutlined />}>
              크리에이터 찾기
            </Menu.Item>
            <Menu.Item key="5" icon={<SettingOutlined />}>
              설정
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
            <div style={{ marginBottom: "8px" }}>
              <div>Instagram</div>
              <div>Facebook</div>
            </div>
            <div style={{ marginTop: "16px" }}>
              ©{new Date().getFullYear()} 세컨아이디
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

            {/* 구독 중인 크리에이터 */}
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Title level={2}>
                  <CrownOutlined style={{ marginRight: "10px" }} />
                  구독 중인 크리에이터
                </Title>
              </Col>
              {creators
                .filter((creator) => creator.isSubscribed)
                .map((creator) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={creator.id}>
                    <Link
                      href={`/creator/${creator.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Card hoverable>
                        <div style={{ textAlign: "center" }}>
                          <Avatar
                            size={80}
                            src={creator.avatar}
                            style={{ marginBottom: "16px" }}
                          />
                          <Title level={4}>{creator.name}</Title>
                          <Tag color="blue" style={{ marginBottom: "8px" }}>
                            {creator.category}
                          </Tag>
                          <Paragraph>{creator.description}</Paragraph>
                          <div style={{ marginTop: "8px" }}>
                            <StarOutlined /> {creator.followers} 팔로워
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </Col>
                ))}
            </Row>

            {/* 추천 크리에이터 */}
            <Row gutter={[24, 24]} style={{ marginTop: "50px" }}>
              <Col span={24}>
                <Title level={2}>
                  <StarOutlined style={{ marginRight: "10px" }} />
                  추천 크리에이터
                </Title>
              </Col>
              {creators
                .filter((creator) => !creator.isSubscribed)
                .map((creator) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={creator.id}>
                    <Link
                      href={`/creator/${creator.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Card hoverable>
                        <div style={{ textAlign: "center" }}>
                          <Avatar
                            size={80}
                            src={creator.avatar}
                            style={{ marginBottom: "16px" }}
                          />
                          <Title level={4}>{creator.name}</Title>
                          <Tag color="blue" style={{ marginBottom: "8px" }}>
                            {creator.category}
                          </Tag>
                          <Paragraph>{creator.description}</Paragraph>
                          <div style={{ marginTop: "8px" }}>
                            <StarOutlined /> {creator.followers} 팔로워
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </Col>
                ))}
            </Row>
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
