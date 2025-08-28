"use client";

import React, { useState, useEffect } from "react";
import Avatar from "antd/lib/avatar";
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Typography from "antd/lib/typography";
import Tag from "antd/lib/tag";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

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
  const [exploreData, setExploreData] = useState<ExploreData | null>(null);
  const [exploreMoreData, setExploreMoreData] =
    useState<ExploreMoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayCounts, setDisplayCounts] = useState<{ [key: string]: number }>(
    {
      ASMR: 6,
      버튜버: 6,
      먹방: 6,
      운동: 6,
      게임: 6,
      주식: 6,
    }
  );
  const [expandedBios, setExpandedBios] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [activeFilter, setActiveFilter] = useState<string>("카테고리");

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
      <div style={{ width: 800, margin: "0 auto", padding: "20px" }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!exploreData) {
    return (
      <div style={{ width: 800, margin: "0 auto", padding: "20px" }}>
        <div>데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div style={{ width: 800, margin: "0 auto", padding: "20px" }}>
      {/* 필터 버튼 */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {["카테고리", "신규", "버튜버", "주식"].map((filter) => (
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
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {exploreData.newCreators.map((creator) => (
              <Card
                key={creator.id}
                style={{ borderRadius: 8 }}
                styles={{ body: { padding: 16 } }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: 12,
                    position: "relative",
                  }}
                >
                  <Avatar
                    size={48}
                    src={creator.avatar}
                    icon={<UserOutlined />}
                    style={{ marginRight: 12 }}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Text strong style={{ fontSize: 16 }}>
                      {creator.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {creator.handle}
                    </Text>
                  </div>
                  <Tag color="red" style={{ margin: 0, fontSize: 11 }}>
                    NEW
                  </Tag>
                </div>
                <Text
                  style={{ fontSize: 14, marginBottom: 12, display: "block" }}
                >
                  {creator.bio}
                </Text>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      팔로워 {formatNumber(creator.followerCount)}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      게시물 {creator.postCount}개
                    </Text>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ width: "100%" }}
                >
                  팔로우
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 카테고리별 인기 크리에이터 섹션 */}
      {(activeFilter === "카테고리" ||
        activeFilter === "버튜버" ||
        activeFilter === "주식") && (
        <div>
          <Title level={3} style={{ marginBottom: 20 }}>
            카테고리별 인기 크리에이터
          </Title>
          {categories
            .filter((category) => {
              if (activeFilter === "카테고리") return true;
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
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "16px",
                    marginBottom: 20,
                  }}
                >
                  {getDisplayCreators(category).map((creator) => (
                    <Card
                      key={creator.id}
                      style={{
                        borderRadius: 8,
                        // height: 200,
                        display: "flex",
                        flexDirection: "column",
                      }}
                      styles={{
                        body: {
                          padding: 16,
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        },
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: 12,
                          position: "relative",
                        }}
                      >
                        <Avatar
                          size={48}
                          src={creator.avatar}
                          icon={<UserOutlined />}
                          style={{ marginRight: 12 }}
                        />
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Text strong style={{ fontSize: 16 }}>
                            {creator.name}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            {creator.handle}
                          </Text>
                        </div>
                        <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                          {category}
                        </Tag>
                      </div>
                      <div style={{ flex: 1, marginBottom: 12 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: expandedBios[
                              `${category}-${creator.id}`
                            ]
                              ? "unset"
                              : 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: "1.4",
                            minHeight: "39.2px", // 2줄 높이 (14px * 1.4 * 2)
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            toggleBioExpansion(`${category}-${creator.id}`)
                          }
                        >
                          {creator.bio}
                        </Text>
                        {creator.bio.length > 50 && (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 12,
                              cursor: "pointer",
                              color: "#1890ff",
                              marginTop: 4,
                            }}
                            onClick={() =>
                              toggleBioExpansion(`${category}-${creator.id}`)
                            }
                          >
                            {expandedBios[`${category}-${creator.id}`]
                              ? "접기"
                              : "더보기"}
                          </Text>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            팔로워 {formatNumber(creator.followerCount)}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            게시물 {creator.postCount}개
                          </Text>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ width: "100%", marginTop: "auto" }}
                      >
                        팔로우
                      </Button>
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
