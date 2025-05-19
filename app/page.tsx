"use client";

import React from "react";
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
} from "@ant-design/icons";
import Link from "next/link";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph } = Typography;

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

export default function Home() {
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
          <Button type="text" icon={<UserOutlined />}>
            로그인
          </Button>
          <Button type="text" icon={<HeartOutlined />}>
            구독
          </Button>
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
    </Layout>
  );
}
