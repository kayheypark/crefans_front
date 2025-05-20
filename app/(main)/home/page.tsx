"use client";

import React from "react";
import { Typography, Button, Row, Col, Card, Space } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MessageOutlined,
  HeartOutlined,
  DollarOutlined,
  DashboardOutlined,
  StarOutlined,
  TeamOutlined,
  SafetyOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Text, Paragraph } = Typography;

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: <LockOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "크리에이터",
      description: "자유로운 멤버십 비용 설정",
      detail:
        "원하는 가격으로 멤버십을 설정하고, 낮은 수수료로 더 많은 수익을 창출하세요. 세컨아이디는 최저 5%의 수수료로 운영됩니다.",
    },
    {
      icon: <MessageOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "크리에이터",
      description: "직접적인 팬 소통",
      detail:
        "실시간 채팅, 라이브 스트리밍, 그리고 직접적인 소통을 통해 팬들과 더 깊은 관계를 만들어보세요.",
    },
    {
      icon: <HeartOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "팬",
      description: "특별한 경험",
      detail:
        "좋아하는 크리에이터의 특별한 컨텐츠와 소통을 경험하세요. 공식 SNS와는 다른, 더 친근하고 진솔한 모습을 만나볼 수 있습니다.",
    },
    {
      icon: <DollarOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "크리에이터",
      description: "다양한 수익 모델",
      detail:
        "구독료, 후원, 광고 수익 등 다양한 수익 모델을 통해 안정적인 수익을 창출할 수 있습니다.",
    },
    {
      icon: <DashboardOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "팬",
      description: "편리한 결제 시스템",
      detail:
        "안전하고 간편한 결제 시스템으로 원하는 크리에이터의 멤버십을 쉽게 구독할 수 있습니다.",
    },
  ];

  const benefits = [
    {
      icon: <StarOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "프리미엄 멤버십",
      description: "특별한 혜택과 독점 컨텐츠를 누려보세요",
    },
    {
      icon: <TeamOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "커뮤니티",
      description: "같은 관심사를 가진 팬들과 소통하세요",
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "안전한 결제",
      description: "안전하고 편리한 결제 시스템",
    },
    {
      icon: <RocketOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "빠른 성장",
      description: "효과적인 마케팅과 성장 전략",
    },
  ];

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "40px 20px",
        background: "#fff",
      }}
    >
      {/* 히어로 섹션 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 80,
          padding: "60px 0",
        }}
      >
        <Title level={1} style={{ marginBottom: 24 }}>
          인플루언서의 두번째 계정
        </Title>
        <Text
          style={{
            fontSize: 20,
            color: "#666",
            display: "block",
            marginBottom: 40,
          }}
        >
          세컨아이디에서만 만나는 특별한 공간
        </Text>
        <Paragraph
          style={{
            fontSize: 16,
            color: "#666",
            maxWidth: 600,
            margin: "0 auto 40px",
          }}
        >
          인플루언서와 팬들이 더 가깝게 만날 수 있는 새로운 공간을 만들어보세요.
          공식 SNS와는 다른, 더 진솔하고 특별한 순간들을 공유하고 소통하세요.
        </Paragraph>
        <Space size="large">
          <Button
            type="primary"
            size="large"
            onClick={() => router.push("/signup")}
            style={{
              height: 48,
              padding: "0 32px",
              fontSize: 16,
              borderRadius: 24,
            }}
          >
            시작하기
          </Button>
          <Button
            size="large"
            onClick={() => router.push("/explore")}
            style={{
              height: 48,
              padding: "0 32px",
              fontSize: 16,
              borderRadius: 24,
            }}
          >
            둘러보기
          </Button>
        </Space>
      </div>

      {/* 특징 섹션 */}
      <div style={{ marginBottom: 80 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 48 }}>
          특별한 기능
        </Title>
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card
                hoverable
                style={{
                  height: "100%",
                  borderRadius: 16,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      background:
                        feature.title === "크리에이터" ? "#e6f4ff" : "#f6ffed",
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          feature.title === "크리에이터"
                            ? "#1677ff"
                            : "#52c41a",
                        fontWeight: 500,
                      }}
                    >
                      {feature.title}
                    </Text>
                  </div>
                  <Title level={4} style={{ marginBottom: 12 }}>
                    {feature.description}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {feature.detail}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 혜택 섹션 */}
      <div style={{ marginBottom: 80 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 48 }}>
          혜택
        </Title>
        <Row gutter={[32, 32]}>
          {benefits.map((benefit, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card
                hoverable
                style={{
                  height: "100%",
                  borderRadius: 16,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ marginBottom: 16 }}>{benefit.icon}</div>
                  <Title level={4} style={{ marginBottom: 12 }}>
                    {benefit.title}
                  </Title>
                  <Text style={{ color: "#666" }}>{benefit.description}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 통계 섹션 */}
      <div
        style={{
          marginTop: 80,
          padding: "60px",
          background: "#f5f5f5",
          borderRadius: 24,
          textAlign: "center",
        }}
      >
        <Title level={2} style={{ marginBottom: 48 }}>
          성장
        </Title>
        <Row gutter={[48, 48]}>
          <Col xs={24} sm={8}>
            <Title level={2} style={{ color: "#1677ff" }}>
              10,000+
            </Title>
            <Text style={{ fontSize: 18, color: "#666" }}>활성 크리에이터</Text>
            <Paragraph style={{ color: "#666", marginTop: 16 }}>
              매일 새로운 크리에이터가 세컨아이디에 합류하고 있습니다.
            </Paragraph>
          </Col>
          <Col xs={24} sm={8}>
            <Title level={2} style={{ color: "#1677ff" }}>
              1,000,000+
            </Title>
            <Text style={{ fontSize: 18, color: "#666" }}>
              월간 활성 사용자
            </Text>
            <Paragraph style={{ color: "#666", marginTop: 16 }}>
              전 세계 팬들이 세컨아이디에서 특별한 경험을 하고 있습니다.
            </Paragraph>
          </Col>
          <Col xs={24} sm={8}>
            <Title level={2} style={{ color: "#1677ff" }}>
              50억+
            </Title>
            <Text style={{ fontSize: 18, color: "#666" }}>
              월간 컨텐츠 조회수
            </Text>
            <Paragraph style={{ color: "#666", marginTop: 16 }}>
              매월 수십억 건의 컨텐츠가 세컨아이디를 통해 공유됩니다.
            </Paragraph>
          </Col>
        </Row>
      </div>

      {/* CTA 섹션 */}
      <div
        style={{
          marginTop: 80,
          textAlign: "center",
          padding: "60px 0",
        }}
      >
        <Title level={2} style={{ marginBottom: 24 }}>
          지금 바로 시작하세요
        </Title>
        <Text
          style={{
            fontSize: 18,
            color: "#666",
            display: "block",
            marginBottom: 32,
          }}
        >
          세컨아이디와 함께 특별한 공간을 만들어보세요
        </Text>
        <Paragraph
          style={{ color: "#666", maxWidth: 600, margin: "0 auto 32px" }}
        >
          지금 가입하시면 첫 달 무료 체험과 함께 다양한 혜택을 받아보실 수
          있습니다. 더 이상 망설이지 마세요. 지금 바로 시작하세요!
        </Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={() => router.push("/signup")}
          style={{
            height: 48,
            padding: "0 32px",
            fontSize: 16,
            borderRadius: 24,
          }}
        >
          무료로 시작하기
        </Button>
      </div>
    </div>
  );
}
