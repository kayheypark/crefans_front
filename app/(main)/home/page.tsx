"use client";

import React, { useState } from "react";
import { Typography, Button, Row, Col, Card, Space, Tooltip } from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  SafetyOutlined,
  RocketOutlined,
  AimOutlined,
  CloudDownloadOutlined,
  FlagOutlined,
  ProjectOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  SketchOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useResponsive } from "@/hooks/useResponsive";
import SignUpModal from "./SignUpModal";

const { Title, Text, Paragraph } = Typography;

export default function HomePage() {
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [isEarlybirdModal, setIsEarlybirdModal] = useState(false);

  const features = [
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      tags: ["크리에이터"],
      title: "안전한 보안",
      detail:
        "크레팬스는 AWS와 함께하는 보안 시스템으로 크리에이터의 소중한 자산을 안전하게 보호합니다.",
    },
    {
      icon: <DollarOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      tags: ["크리에이터"],
      title: "멤버십 수익창출",
      detail:
        "원하는 가격으로 멤버십을 설정하고, 낮은 수수료로 더 많은 수익을 창출하세요.",
    },
    {
      icon: <TeamOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      tags: ["크리에이터"],
      title: "유대감 형성",
      detail:
        "포스팅, 채팅을 통해 팬들과 유대감을 형성할 수 있습니다. 팬들과 더 가깝게 만나보세요.",
    },
    {
      icon: <AimOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      tags: ["팬"],
      title: "콘텐츠 개별 구매",
      detail:
        "멤버십은 부담스러울 수 있죠. 개별 구매 시스템을 통해 원하는 컨텐츠를 구매할 수 있습니다.",
    },
    {
      icon: <RocketOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      tags: ["팬"],
      title: "로켓 포인트 충전",
      detail:
        "느리고 복잡한 충전, 이제 그만. 클릭 한번으로 충전하고 당장 콘텐츠를 확인하세요. (카드 등록 이후 기준)",
    },
    {
      icon: (
        <CloudDownloadOutlined style={{ fontSize: 32, color: "#1677ff" }} />
      ),
      tags: ["팬"],
      title: "컨텐츠 다운로드",
      detail:
        "구매한 컨텐츠는 다운로드가 가능합니다. (크리에이터가 다운로드를 허용한 경우)",
    },
  ];

  const benefits = [
    {
      icon: <FlagOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "신규 크리에이터 지원",
      description:
        "신규 크리에이터 님들을 위해 가입 즉시 무료로 크리에이터님을 홍보해드립니다.",
    },
    {
      icon: <PercentageOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "점점 낮아지는 수수료",
      description:
        "볼륨 디스카운트(Volume Discount) 운영 정책에 따라 멤버십 구독자가 많을수록 정산 수수료가 점점 낮아집니다.",
    },
    {
      icon: <VideoCameraOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "창작에만 몰입하세요.",
      description:
        "기본 정보만 등록하시면 나머지는 크레팬스가 알아서 해드립니다. (저작권 관리, 상품 판매 통계 등)",
    },
    {
      icon: <ProjectOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
      title: "CrefansAlgorithm™",
      description:
        "크리에이터님의 판매량, 활동 카테고리 등을 분석하여 구매율 높은 팬에게 노출합니다.",
    },
  ];

  return (
    <div
      style={{
        maxWidth: isMobile ? "100%" : isTablet ? "100%" : 1200,
        margin: "0 auto",
        padding: isMobile ? "20px 16px" : isTablet ? "30px 20px" : "40px 20px",
        background: "#fff",
      }}
    >
      {/* 히어로 섹션 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: isMobile ? 60 : 120,
          padding: isMobile
            ? "40px 0 60px 0"
            : isTablet
            ? "60px 0 80px 0"
            : "80px 0 110px 0",
          borderRadius: isMobile ? 24 : 50,
          border: "1px solid rgba(0, 0, 0, 0.1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Title
          level={1}
          style={{
            marginBottom: 24,
            marginTop: isMobile ? 40 : 100,
            fontSize: isMobile ? 48 : isTablet ? 64 : 80,
          }}
        >
          Creator + Fan
        </Title>

        <Paragraph
          style={{
            fontSize: 16,
            color: "#666",
            maxWidth: 600,
            margin: "0 auto 40px",
          }}
        >
          crefans. 크리에이터와 팬이 만나다.
        </Paragraph>
        <Space
          size={isMobile ? "middle" : "large"}
          direction={isMobile ? "vertical" : "horizontal"}
        >
          <Button
            type="primary"
            size={isMobile ? "middle" : "large"}
            onClick={() => setSignUpOpen(true)}
            style={{
              height: isMobile ? 40 : 48,
              padding: isMobile ? "0 24px" : "0 32px",
              fontSize: isMobile ? 14 : 16,
              borderRadius: isMobile ? 20 : 24,
            }}
          >
            시작하기
          </Button>
          <Button
            size={isMobile ? "middle" : "large"}
            onClick={() => router.push("/explore")}
            style={{
              height: isMobile ? 40 : 48,
              padding: isMobile ? "0 24px" : "0 32px",
              fontSize: isMobile ? 14 : 16,
              borderRadius: isMobile ? 20 : 24,
            }}
          >
            생태계 둘러보기
          </Button>
        </Space>
      </div>

      {/* 특징 섹션 */}
      <div style={{ marginBottom: isMobile ? 60 : 120 }}>
        <Title
          level={2}
          style={{
            textAlign: "center",
            marginBottom: isMobile ? 40 : 80,
            fontSize: isMobile ? "24px" : "32px",
          }}
        >
          크리에이터, 팬, 플랫폼이 연결된 지속 가능한 창작 생태계
          <br />
          <Text type="secondary" style={{ textAlign: "center" }}>
            이 모든 것들이 유기적으로 연결되어 하나의 생태계를 이룹니다.
          </Text>
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
                      background: feature.tags.includes("크리에이터")
                        ? "#e6f4ff"
                        : "#f6ffed",
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: feature.tags.includes("크리에이터")
                          ? "#1677ff"
                          : "#52c41a",
                        fontWeight: 500,
                      }}
                    >
                      {feature.tags.join(", ")}
                    </Text>
                  </div>
                  <Title level={4} style={{ marginBottom: 12 }}>
                    {feature.title}
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
      <div style={{ marginBottom: isMobile ? 60 : 120 }}>
        <Title
          level={2}
          style={{
            textAlign: "center",
            marginBottom: isMobile ? 40 : 80,
            fontSize: isMobile ? "24px" : "32px",
          }}
        >
          크리에이터 지원 프로그램
          <br />
          <Text type="secondary" style={{ textAlign: "center" }}>
            크레팬스는 창작자의 재능 발전을 위해 무엇을 해야할지 알고있습니다.
          </Text>
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
          marginTop: isMobile ? 60 : 120,
          padding: isMobile ? "40px 20px" : isTablet ? "60px 40px" : "80px",
          background: "#f5f5f5",
          borderRadius: isMobile ? 16 : 24,
          textAlign: "center",
        }}
      >
        <Title
          level={2}
          style={{
            marginBottom: isMobile ? 32 : 48,
            fontSize: isMobile ? "24px" : "32px",
          }}
        >
          숫자로 보는 크레팬스의 목표
          <Tooltip title="크레팬스 프로젝트의 목표 데이터이므로 실제 데이터와 다를 수 있습니다.">
            <InfoCircleOutlined style={{ marginLeft: 8 }} />
          </Tooltip>
        </Title>
        <Row gutter={isMobile ? [24, 24] : [48, 48]}>
          <Col xs={24} sm={8}>
            <Title level={2} style={{ color: "#1677ff" }}>
              92%
            </Title>
            <Text style={{ fontSize: 18, color: "#666" }}>
              멤버십 구독 유지 비율
            </Text>
            <Paragraph style={{ color: "#666", marginTop: 16 }}>
              당신의 콘텐츠로 충성 고객을 만드세요. (활동 지속 크리에이터 100명
              대상 3개월간 산출값)
            </Paragraph>
          </Col>

          <Col xs={24} sm={8}>
            <Title level={2} style={{ color: "#1677ff" }}>
              9,420,337원+
            </Title>
            <Text style={{ fontSize: 18, color: "#666" }}>
              월 평균 정산 금액
            </Text>
            <Paragraph style={{ color: "#666", marginTop: 16 }}>
              최근 12개월간 활동한 1,000명의 사용자 데이터를 기반으로 산정한
              평균 정산금액입니다.
            </Paragraph>
          </Col>
          <Col xs={24} sm={8}>
            <Title level={2} style={{ color: "#1677ff" }}>
              1,000,000+
            </Title>
            <Text style={{ fontSize: 18, color: "#666" }}>활동 팬</Text>
            <Paragraph style={{ color: "#666", marginTop: 16 }}>
              더 많은 도파민을 갈망하는 전 세계 팬들이 크레팬스에서 당신을
              기다리고 있습니다.
            </Paragraph>
          </Col>
        </Row>
      </div>

      {/* 얼리버드 섹션 */}
      <div
        style={{
          marginTop: 120,
          textAlign: "center",
          padding: "80px 0",
        }}
      >
        <Title level={2} style={{ marginBottom: 24 }}>
          남들보다 먼저 시작하세요.
        </Title>
        <Text
          style={{
            fontSize: 18,
            color: "#666",
            display: "block",
          }}
        >
          2025년 하반기 베타 서비스 시작 예정
        </Text>
        <div
          style={{
            margin: isMobile ? "20px auto" : "40px auto",
            maxWidth: isMobile ? "100%" : 600,
          }}
        >
          <ul
            style={{
              listStyle: "none",
              padding: isMobile ? "20px" : 100,
              textAlign: "left",
              display: "inline-block",
              backgroundColor: "#f0f0f0",
              borderRadius: isMobile ? 12 : 16,
            }}
          >
            <li
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <SketchOutlined style={{ color: "#722ed1", fontSize: 20 }} />
              <Text style={{ fontSize: 16 }}>
                크리에이터 얼리버드에게{" "}
                <Text strong>[정산 수수료 zero 쿠폰]</Text> 1매 제공
              </Text>
            </li>
            <li
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <SketchOutlined style={{ color: "#722ed1", fontSize: 20 }} />
              <Text style={{ fontSize: 16 }}>
                팬 얼리버드에게 <Text strong>[한정판 얼리버드 뱃지]</Text> 제공
              </Text>
            </li>
          </ul>
        </div>
        <Paragraph
          style={{ color: "#666", maxWidth: 600, margin: "0 auto 32px" }}
        >
          서비스를 끝까지 읽어주셔서 감사합니다. 감사의 마음을 담아 얼리버드
          혜택을 준비했어요.
        </Paragraph>
        <Button
          type="primary"
          size={isMobile ? "middle" : "large"}
          onClick={() => {
            setIsEarlybirdModal(true);
            setSignUpOpen(true);
          }}
          style={{
            height: isMobile ? 40 : 48,
            padding: isMobile ? "0 24px" : "0 32px",
            fontSize: isMobile ? 14 : 16,
            borderRadius: isMobile ? 20 : 24,
          }}
        >
          얼리버드로 시작
        </Button>
      </div>

      {/* 유의사항 섹션 */}
      <div
        style={{
          marginTop: isMobile ? 60 : 120,
          padding: isMobile ? "30px 0" : "60px 0",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Text
          type="secondary"
          style={{ fontSize: 14, display: "block", marginBottom: 16 }}
        >
          [유의사항]
        </Text>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          <li style={{ marginBottom: 1 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              '얼리버드로 시작'은 당사 사정에 따라 조기 마감될 수 있습니다.
            </Text>
          </li>
          <li style={{ marginBottom: 1 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              얼리버드 혜택 관련 내용은 당사 사정에 따라 바뀔 수 있습니다.
            </Text>
          </li>
          <li>
            <Text type="secondary" style={{ fontSize: 14 }}>
              정식 및 베타 서비스 예정일은 당사 사정에 따라 바뀔 수 있습니다.
            </Text>
          </li>
        </ul>
        <div style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            © {new Date().getFullYear()} CREFANS. All rights reserved.
          </Text>
        </div>
      </div>
      <SignUpModal 
        open={signUpOpen} 
        onClose={() => {
          setSignUpOpen(false);
          setIsEarlybirdModal(false);
        }}
        isEarlybird={isEarlybirdModal}
      />
    </div>
  );
}
