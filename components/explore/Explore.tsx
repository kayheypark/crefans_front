"use client";

import React, { useState, useEffect } from "react";
import Avatar from "antd/lib/avatar";
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Typography from "antd/lib/typography";
import Tag from "antd/lib/tag";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useResponsive } from "@/hooks/useResponsive";

const { Title, Text } = Typography;

// 흘러가는 텍스트 컴포넌트
const ScrollingText = ({
  children,
  maxLength = 15,
  style = {},
}: {
  children: string;
  maxLength?: number;
  style?: React.CSSProperties;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const needsScrolling = children.length > maxLength;

  if (!needsScrolling) {
    return <span style={style}>{children}</span>;
  }

  return (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        width: "100%",
        position: "relative",
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          display: "inline-block",
          transform: isHovered
            ? `translateX(-${(children.length - maxLength) * 0.6}em)`
            : "translateX(0)",
          transition: "transform 2s ease-in-out",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface Creator {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followerCount: number;
  postCount: number;
  category?: string;
  isNew?: boolean;
  bannerImage?: string;
}

interface ExploreData {
  newCreators: Creator[];
  popularCreators: {
    [key: string]: Creator[];
  };
}

interface ExploreMoreData {
  [key: string]: Creator[];
}

export default function Explore() {
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [exploreData, setExploreData] = useState<ExploreData | null>(null);
  const [exploreMoreData, setExploreMoreData] =
    useState<ExploreMoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayCounts, setDisplayCounts] = useState<{ [key: string]: number }>(
    {
      ASMR: 6,
      버튼버: 6,
      먹방: 6,
      운동: 6,
      게임: 6,
      주식: 6,
    }
  );
  const [expandedBios, setExpandedBios] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [activeFilter, setActiveFilter] = useState<string>("모든 카테고리");

  const categories = ["ASMR", "버튜버", "먹방", "운동", "게임", "주식"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exploreResponse, moreResponse] = await Promise.all([
          fetch("/mock/explore.json"),
          fetch("/mock/explore_more.json"),
        ]);

        const exploreData = await exploreResponse.json();
        const moreData = await moreResponse.json();

        setExploreData(exploreData);
        setExploreMoreData(moreData);
      } catch (error) {
        console.error("Failed to fetch explore data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}천`;
    }
    return num.toString();
  };

  const handleLoadMore = (category: string) => {
    setDisplayCounts((prev) => ({
      ...prev,
      [category]: prev[category] + 6,
    }));
  };

  const toggleBioExpansion = (creatorId: string) => {
    setExpandedBios((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId],
    }));
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const getDisplayCreators = (category: string) => {
    if (!exploreData || !exploreMoreData) return [];

    const initialCreators = exploreData.popularCreators[category] || [];
    const moreCreators = exploreMoreData[category] || [];
    const displayCount = displayCounts[category];

    const allCreators = [...initialCreators, ...moreCreators];
    return allCreators.slice(0, displayCount);
  };

  const hasMoreCreators = (category: string) => {
    if (!exploreData || !exploreMoreData) return false;

    const initialCount = exploreData.popularCreators[category]?.length || 0;
    const moreCount = exploreMoreData[category]?.length || 0;
    const totalCount = initialCount + moreCount;

    return displayCounts[category] < totalCount;
  };

  if (loading) {
    return (
      <div
        style={{
          width: isMobile ? "100%" : isTablet ? "90%" : "800px",
          margin: "0 auto",
          padding: isMobile ? "16px" : "20px",
        }}
      >
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!exploreData) {
    return (
      <div
        style={{
          width: isMobile ? "100%" : isTablet ? "90%" : "800px",
          margin: "0 auto",
          padding: isMobile ? "16px" : "20px",
        }}
      >
        <div>데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: isMobile ? "100%" : isTablet ? "90%" : "800px",
        margin: "0 auto",
        padding: isMobile ? "16px" : "20px",
      }}
    >
      {/* 필터 버튼 */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {["모든 카테고리", "신규", "버튜버", "주식"].map((filter) => (
            <Button
              key={filter}
              type={activeFilter === filter ? "primary" : "default"}
              onClick={() => handleFilterChange(filter)}
              style={{
                borderRadius: "20px",
                height: "32px",
                padding: "0 16px",
                fontSize: "14px",
              }}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* 신규 크리에이터 섹션 */}
      {activeFilter === "신규" && (
        <div style={{ marginBottom: 40 }}>
          <Title level={3} style={{ marginBottom: 20 }}>
            신규 크리에이터
          </Title>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : isTablet
                ? "repeat(2, 1fr)"
                : "repeat(3, 1fr)",
              gap: isMobile ? "12px" : "16px",
            }}
          >
            {exploreData.newCreators.map((creator) => (
              <Card
                key={creator.id}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  aspectRatio: "4/5",
                  position: "relative",
                  cursor: "pointer",
                }}
                styles={{ body: { padding: 0 } }}
                onClick={() => router.push("/profile")}
                cover={
                  <div
                    style={{
                      height: isMobile ? "80px" : isTablet ? "100px" : "120px",
                      background: creator.bannerImage
                        ? `url(${creator.bannerImage})`
                        : "linear-gradient(135deg, #667eea 0%,rgb(178, 175, 182) 100%)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {!creator.bannerImage && (
                      <div
                        style={{
                          color: "rgba(255, 255, 255, 0.2)",
                          fontSize: "24px",
                          fontWeight: "bold",
                          letterSpacing: "2px",
                          userSelect: "none",
                          textTransform: "uppercase",
                        }}
                      >
                        crefans
                      </div>
                    )}
                    <Tag
                      color="red"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontSize: 10,
                        margin: 0,
                      }}
                    >
                      NEW
                    </Tag>
                  </div>
                }
              >
                <div style={{ padding: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 12,
                      position: "relative",
                    }}
                  >
                    <Avatar
                      size={40}
                      src={creator.avatar}
                      icon={<UserOutlined />}
                      style={{
                        marginRight: 12,
                        border: "2px solid white",
                        marginTop: "-20px",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 2,
                        }}
                      >
                        <ScrollingText maxLength={12}>
                          {creator.name}
                        </ScrollingText>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {creator.handle}
                      </Text>
                    </div>
                  </div>

                  <Text
                    style={{
                      fontSize: 13,
                      marginBottom: 12,
                      lineHeight: "1.4",
                      height: "35px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {creator.bio}
                  </Text>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                      fontSize: 11,
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      팔로워 {formatNumber(creator.followerCount)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      게시물 {creator.postCount}개
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 카테고리별 인기 크리에이터 섹션 */}
      {(activeFilter === "모든 카테고리" ||
        activeFilter === "버튜버" ||
        activeFilter === "주식") && (
        <div>
          <Title level={3} style={{ marginBottom: 20 }}>
            카테고리별 인기 크리에이터
          </Title>
          {categories
            .filter((category) => {
              if (activeFilter === "모든 카테고리") return true;
              if (activeFilter === "버튜버") return category === "버튜버";
              if (activeFilter === "주식") return category === "주식";
              return false;
            })
            .map((category) => (
              <div key={category} style={{ marginBottom: 40 }}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  {category}
                </Title>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "repeat(2, 1fr)"
                      : isTablet
                      ? "repeat(2, 1fr)"
                      : "repeat(3, 1fr)",
                    gap: isMobile ? "12px" : "16px",
                    marginBottom: 20,
                  }}
                >
                  {getDisplayCreators(category).map((creator) => (
                    <Card
                      key={creator.id}
                      style={{
                        borderRadius: 16,
                        overflow: "hidden",
                        aspectRatio: "4/5",
                        position: "relative",
                        cursor: "pointer",
                      }}
                      styles={{ body: { padding: 0 } }}
                      onClick={() => router.push("/profile")}
                      cover={
                        <div
                          style={{
                            height: isMobile
                              ? "80px"
                              : isTablet
                              ? "100px"
                              : "120px",
                            background: creator.bannerImage
                              ? `url(${creator.bannerImage})`
                              : "rgb(154, 154, 154)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {!creator.bannerImage && (
                            <div
                              style={{
                                color: "rgba(255, 255, 255, 0.2)",
                                fontSize: "24px",
                                fontWeight: "bold",
                                letterSpacing: "2px",
                                userSelect: "none",
                                textTransform: "uppercase",
                              }}
                            >
                              crefans
                            </div>
                          )}
                          <Tag
                            color="blue"
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              fontSize: 10,
                              margin: 0,
                            }}
                          >
                            {category}
                          </Tag>
                        </div>
                      }
                    >
                      <div style={{ padding: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 12,
                            position: "relative",
                          }}
                        >
                          <Avatar
                            size={52}
                            src={creator.avatar}
                            icon={<UserOutlined />}
                            style={{
                              marginRight: 2,
                              border: "2px solid white",
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >
                              <ScrollingText maxLength={12}>
                                {creator.name}
                              </ScrollingText>
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {creator.handle}
                            </Text>
                          </div>
                        </div>

                        <Text
                          style={{
                            fontSize: 13,
                            marginBottom: 12,
                            lineHeight: "1.4",
                            height: "35px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {creator.bio}
                        </Text>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "auto",
                            fontSize: 11,
                          }}
                        >
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            팔로워 {formatNumber(creator.followerCount)}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            게시물 {creator.postCount}개
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                {hasMoreCreators(category) && (
                  <div style={{ textAlign: "center" }}>
                    <Button
                      type="default"
                      onClick={() => handleLoadMore(category)}
                      style={{ marginTop: 16 }}
                    >
                      더 보기
                    </Button>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
