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
import FeedFilter from "@/components/common/FeedFilter";
import {
  exploreAPI,
  Creator,
  CreatorCategory,
  NewCreatorsResponse,
  CreatorsByCategoryResponse
} from "@/lib/api/explore";

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

  // Real API state
  const [categories, setCategories] = useState<CreatorCategory[]>([]);
  const [newCreators, setNewCreators] = useState<Creator[]>([]);
  const [creatorsData, setCreatorsData] = useState<{ [key: string]: Creator[] }>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState<{ [key: string]: boolean }>({});
  const [cursors, setCursors] = useState<{ [key: string]: string | undefined }>({});
  const [hasMore, setHasMore] = useState<{ [key: string]: boolean }>({});
  const [displayCounts, setDisplayCounts] = useState<{ [key: string]: number }>({});
  const [expandedBios, setExpandedBios] = useState<{ [key: string]: boolean }>({});
  const [activeFilter, setActiveFilter] = useState("모든 카테고리");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log("Fetching explore data...");

        // Fetch categories and new creators in parallel
        const [categoriesData, newCreatorsData] = await Promise.all([
          exploreAPI.getCategories(),
          exploreAPI.getNewCreators(20),
        ]);

        console.log("Categories loaded:", categoriesData);
        console.log("New creators loaded:", newCreatorsData);

        setCategories(categoriesData);
        setNewCreators(newCreatorsData.creators);

        // Initialize state for each category
        const initialDisplayCounts: { [key: string]: number } = {};
        const initialHasMore: { [key: string]: boolean } = {};
        const initialCursors: { [key: string]: string | undefined } = {};
        const initialCreatorsData: { [key: string]: Creator[] } = {};

        categoriesData.forEach((category) => {
          initialDisplayCounts[category.name] = 6;
          initialHasMore[category.name] = true;
          initialCursors[category.name] = undefined;
          initialCreatorsData[category.name] = [];
        });

        setDisplayCounts(initialDisplayCounts);
        setHasMore(initialHasMore);
        setCursors(initialCursors);
        setCreatorsData(initialCreatorsData);

      } catch (error) {
        console.error("Failed to fetch explore data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}천`;
    }
    return num.toString();
  };

  // Function to load creators for a specific category
  const loadCategoryCreators = async (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) {
      console.log(`Category not found: ${categoryName}`);
      return;
    }

    console.log(`Loading creators for category: ${categoryName} (ID: ${category.id})`);

    try {
      const response = await exploreAPI.getCreatorsByCategory(
        category.id,
        displayCounts[categoryName] || 6,
        cursors[categoryName]
      );

      console.log(`API response for ${categoryName}:`, response);

      setCreatorsData(prev => ({
        ...prev,
        [categoryName]: response.creators
      }));

      setHasMore(prev => ({
        ...prev,
        [categoryName]: response.hasMore
      }));

      setCursors(prev => ({
        ...prev,
        [categoryName]: response.nextCursor
      }));
    } catch (error) {
      console.error(`Failed to load creators for ${categoryName}:`, error);
      // Set empty array to prevent infinite retry
      setCreatorsData(prev => ({
        ...prev,
        [categoryName]: []
      }));
      setHasMore(prev => ({
        ...prev,
        [categoryName]: false
      }));
    }
  };

  const handleLoadMore = async (categoryName: string) => {
    if (loadingMore[categoryName]) return;

    setLoadingMore(prev => ({
      ...prev,
      [categoryName]: true
    }));

    try {
      const category = categories.find(cat => cat.name === categoryName);
      if (!category) return;

      const response = await exploreAPI.getCreatorsByCategory(
        category.id,
        6, // Load 6 more
        cursors[categoryName]
      );

      setCreatorsData(prev => ({
        ...prev,
        [categoryName]: [...(prev[categoryName] || []), ...response.creators]
      }));

      setDisplayCounts(prev => ({
        ...prev,
        [categoryName]: (prev[categoryName] || 0) + 6
      }));

      setHasMore(prev => ({
        ...prev,
        [categoryName]: response.hasMore
      }));

      setCursors(prev => ({
        ...prev,
        [categoryName]: response.nextCursor
      }));
    } catch (error) {
      console.error(`Failed to load more creators for ${categoryName}:`, error);
    } finally {
      setLoadingMore(prev => ({
        ...prev,
        [categoryName]: false
      }));
    }
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

  // Load category data when filter changes to a specific category
  useEffect(() => {
    console.log(`Filter changed to: ${activeFilter}`);
    console.log(`Categories available:`, categories.map(cat => cat.name));
    console.log(`Current creators data:`, creatorsData);

    if (activeFilter === "모든 카테고리" && categories.length > 0) {
      // Load data for all categories when "모든 카테고리" is selected
      categories.forEach(category => {
        if (!creatorsData[category.name]?.length) {
          console.log(`Loading data for category: ${category.name}`);
          loadCategoryCreators(category.name);
        }
      });
    } else if (activeFilter !== "신규" && categories.length > 0) {
      const category = categories.find(cat => cat.name === activeFilter);
      if (category && !creatorsData[activeFilter]?.length) {
        console.log(`Triggering API call for category: ${activeFilter}`);
        loadCategoryCreators(activeFilter);
      } else if (category && creatorsData[activeFilter]?.length) {
        console.log(`Category ${activeFilter} already has data:`, creatorsData[activeFilter]);
      } else if (!category) {
        console.log(`Category ${activeFilter} not found in categories list`);
      }
    }
  }, [activeFilter, categories]);

  const getDisplayCreators = (categoryName: string) => {
    return creatorsData[categoryName] || [];
  };

  const hasMoreCreators = (categoryName: string) => {
    return hasMore[categoryName] || false;
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

  if (!loading && categories.length === 0) {
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
      <FeedFilter
        filter={activeFilter}
        onFilterChange={handleFilterChange}
        filters={[
          { key: "모든 카테고리", label: "모든 카테고리" },
          { key: "신규", label: "신규" },
          ...categories.map(category => ({
            key: category.name,
            label: category.name
          }))
        ]}
        type="explore"
        style={{ marginBottom: 30 }}
      />

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
            {newCreators.map((creator) => (
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
                onClick={() => router.push(`/${creator.handle}`)}
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
                          {creator.nickname}
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
        categories.some(cat => cat.name === activeFilter)) && (
        <div>
          <Title level={3} style={{ marginBottom: 20 }}>
            카테고리별 인기 크리에이터
          </Title>

          {/* 모든 카테고리 선택 시 카테고리 버튼들 */}
          {activeFilter === "모든 카테고리" && (
            <div style={{ marginBottom: 30 }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  overflowX: "auto",
                  paddingBottom: "8px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d9d9d9 transparent",
                }}
              >
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    type="default"
                    size="large"
                    onClick={() => handleFilterChange(category.name)}
                    style={{
                      borderRadius: "25px",
                      height: "44px",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      fontSize: "14px",
                      fontWeight: "500",
                      border: "2px solid #d9d9d9",
                      backgroundColor: "#fff",
                      color: "#666",
                      transition: "all 0.3s ease",
                      minWidth: "100px",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = category.color_code || "#1890ff";
                      e.currentTarget.style.color = category.color_code || "#1890ff";
                      e.currentTarget.style.backgroundColor = "#f0f8ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#d9d9d9";
                      e.currentTarget.style.color = "#666";
                      e.currentTarget.style.backgroundColor = "#fff";
                    }}
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {categories
            .filter((category) => {
              if (activeFilter === "모든 카테고리") return true;
              return category.name === activeFilter;
            })
            .map((category) => (
              <div key={category.id} style={{ marginBottom: 40 }}>
                <Title level={4} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
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
                  {getDisplayCreators(category.name).length > 0 ? (
                    getDisplayCreators(category.name).map((creator) => (
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
                        onClick={() => router.push(`/${creator.handle}`)}
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
                                backgroundColor: category.color_code || "#1890ff",
                                borderColor: category.color_code || "#1890ff",
                              }}
                            >
                              {category.name}
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
                                  {creator.nickname}
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
                    ))
                  ) : (
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "#999",
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: "16px" }}>
                        {category.name} 카테고리의 크리에이터가 없습니다.
                      </Text>
                    </div>
                  )}
                </div>
                {hasMoreCreators(category.name) && (
                  <div style={{ textAlign: "center" }}>
                    <Button
                      type="default"
                      onClick={() => handleLoadMore(category.name)}
                      style={{ marginTop: 16 }}
                      loading={loadingMore[category.name]}
                    >
                      {category.name} 더보기
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
