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
  Tabs,
  Statistic,
} from "antd";
import {
  HeartOutlined,
  StarOutlined,
  MessageOutlined,
  ShareAltOutlined,
  PlayCircleOutlined,
  PictureOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

// 임시 크리에이터 데이터
const creator = {
  id: 1,
  name: "김크리에이터",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
  category: "게임",
  followers: "10.5K",
  description:
    "게임 실황 및 리뷰 전문 크리에이터입니다. 다양한 게임을 플레이하고 리뷰하는 콘텐츠를 제작하고 있습니다.",
  isSubscribed: true,
  stats: {
    videos: 156,
    subscribers: "10.5K",
    totalViews: "1.2M",
  },
};

export default function CreatorHome({ params }: { params: { id: string } }) {
  return (
    <Content style={{ padding: "24px 50px" }}>
      {/* 크리에이터 프로필 섹션 */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Avatar size={120} src={creator.avatar} />
            <Title level={3} style={{ marginTop: "16px" }}>
              {creator.name}
            </Title>
            <Tag color="blue">{creator.category}</Tag>
          </Col>
          <Col xs={24} md={18}>
            <Paragraph style={{ fontSize: "16px", marginBottom: "24px" }}>
              {creator.description}
            </Paragraph>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic title="구독자" value={creator.stats.subscribers} />
              </Col>
              <Col span={8}>
                <Statistic title="영상 수" value={creator.stats.videos} />
              </Col>
              <Col span={8}>
                <Statistic title="총 조회수" value={creator.stats.totalViews} />
              </Col>
            </Row>
            <div style={{ marginTop: "24px" }}>
              <Button
                type="primary"
                icon={<HeartOutlined />}
                style={{ marginRight: "8px" }}
              >
                구독하기
              </Button>
              <Button icon={<MessageOutlined />} style={{ marginRight: "8px" }}>
                메시지
              </Button>
              <Button icon={<ShareAltOutlined />}>공유하기</Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 콘텐츠 탭 */}
      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <PlayCircleOutlined />
                영상
              </span>
            }
            key="1"
          >
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4].map((item) => (
                <Col xs={24} sm={12} md={8} lg={6} key={item}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ height: "160px", background: "#f0f0f0" }} />
                    }
                  >
                    <Card.Meta
                      title={`영상 제목 ${item}`}
                      description="2024.03.15 • 조회수 1.2K"
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
          <TabPane
            tab={
              <span>
                <PictureOutlined />
                갤러리
              </span>
            }
            key="2"
          >
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Col xs={24} sm={12} md={8} lg={6} key={item}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ height: "200px", background: "#f0f0f0" }} />
                    }
                  >
                    <Card.Meta
                      title={`갤러리 이미지 ${item}`}
                      description="2024.03.15"
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                게시글
              </span>
            }
            key="3"
          >
            <Row gutter={[16, 16]}>
              {[1, 2, 3].map((item) => (
                <Col span={24} key={item}>
                  <Card>
                    <Title level={4}>게시글 제목 {item}</Title>
                    <Paragraph>
                      게시글 내용이 여기에 들어갑니다. 크리에이터의 소식이나
                      공지사항 등을 작성할 수 있습니다.
                    </Paragraph>
                    <div style={{ color: "#8c8c8c" }}>2024.03.15</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </Content>
  );
}
