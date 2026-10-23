"use client";

import CategoryTag from "@/components/common/CategoryTag";
import FeedFilter from "@/components/common/FeedFilter";
import { useExploreModel } from "@/features/explore/useExploreModel";
import { UserOutlined } from "@ant-design/icons";
import Avatar from "antd/lib/avatar";
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Tag from "antd/lib/tag";
import Typography from "antd/lib/typography";
import React, { useState } from "react";

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

export default function Explore() {
  const model = useExploreModel();
  return <ExploreView model={model} />;
}

function ExploreView({ model }: { model: ReturnType<typeof useExploreModel> }) {
  const {
    router,
    isMobile,
    isTablet,
    categories,
    newCreators,
    loading,
    loadingMore,
    activeFilter,
    formatNumber,
    handleLoadMore,
    handleFilterChange,
    getDisplayCreators,
    hasMoreCreators,
  } = model;

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
          ...categories.map((category) => ({
            key: category.name,
            label: category.name,
          })),
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
              gap: isMobile ? "8px" : isTablet ? "12px" : "16px",
            }}
          >
            {newCreators.map((creator) => (
              <Card
                key={creator.handle}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  height: isMobile ? "280px" : isTablet ? "320px" : "360px",
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
                styles={{
                  body: {
                    padding: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  },
                }}
                onClick={() => router.push(`/@${creator.handle}`)}
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
                <div
                  style={{
                    padding: isMobile ? "12px" : "16px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: isMobile ? "8px" : "12px",
                      position: "relative",
                    }}
                  >
                    <Avatar
                      size={isMobile ? 36 : isTablet ? 40 : 40}
                      src={creator.avatar}
                      icon={<UserOutlined />}
                      style={{
                        marginRight: isMobile ? "8px" : "12px",
                        border: "2px solid white",
                        marginTop: "-20px",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: isMobile ? 13 : 14,
                          marginBottom: 2,
                        }}
                      >
                        <ScrollingText maxLength={isMobile ? 10 : 12}>
                          {creator.nickname}
                        </ScrollingText>
                      </div>
                      <Text
                        type="secondary"
                        style={{ fontSize: isMobile ? 11 : 12 }}
                      >
                        @{creator.handle}
                      </Text>
                    </div>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      marginBottom: isMobile ? "8px" : "12px",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: isMobile ? 2 : 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordBreak: "break-word",
                      }}
                    >
                      {creator.bio || "소개글을 준비중입니다."}
                    </Text>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: isMobile ? 10 : 11,
                      flexShrink: 0,
                      marginTop: "auto",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{ fontSize: isMobile ? 10 : 11 }}
                    >
                      팔로워 {formatNumber(creator.followerCount)}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: isMobile ? 10 : 11 }}
                    >
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
        categories.some((cat) => cat.name === activeFilter)) && (
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
                  gap: isMobile ? "8px" : "10px",
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
                    size="middle"
                    onClick={() => handleFilterChange(category.name)}
                    style={{
                      borderRadius: "20px",
                      height: isMobile ? "32px" : "36px",
                      paddingLeft: isMobile ? "12px" : "16px",
                      paddingRight: isMobile ? "12px" : "16px",
                      fontSize: isMobile ? "12px" : "13px",
                      fontWeight: "500",
                      border: "1px solid #d9d9d9",
                      backgroundColor: "#fff",
                      color: "#666",
                      transition: "all 0.3s ease",
                      minWidth: isMobile ? "80px" : "90px",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      touchAction: "pan-x",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        category.color_code || "#1890ff";
                      e.currentTarget.style.color =
                        category.color_code || "#1890ff";
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
                <Title
                  level={4}
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
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
                    gap: isMobile ? "8px" : isTablet ? "12px" : "16px",
                    marginBottom: 20,
                  }}
                >
                  {getDisplayCreators(category.name).length > 0 ? (
                    getDisplayCreators(category.name).map((creator) => (
                      <Card
                        key={creator.handle}
                        style={{
                          borderRadius: 16,
                          overflow: "hidden",
                          height: isMobile
                            ? "280px"
                            : isTablet
                              ? "320px"
                              : "360px",
                          position: "relative",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        styles={{
                          body: {
                            padding: 0,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          },
                        }}
                        onClick={() => router.push(`/@${creator.handle}`)}
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
                            <div
                              style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                              }}
                            >
                              <CategoryTag category={category} size="small" />
                            </div>
                          </div>
                        }
                      >
                        <div
                          style={{
                            padding: isMobile ? "12px" : "16px",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: isMobile ? "8px" : "12px",
                              position: "relative",
                            }}
                          >
                            <Avatar
                              size={isMobile ? 40 : isTablet ? 46 : 52}
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
                                  fontSize: isMobile ? 13 : 14,
                                }}
                              >
                                <ScrollingText maxLength={isMobile ? 10 : 12}>
                                  {creator.nickname}
                                </ScrollingText>
                              </div>
                              <Text
                                type="secondary"
                                style={{ fontSize: isMobile ? 11 : 12 }}
                              >
                                @{creator.handle}
                              </Text>
                            </div>
                          </div>

                          <div
                            style={{
                              flex: 1,
                              minHeight: 0,
                              marginBottom: isMobile ? "8px" : "12px",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: isMobile ? 12 : 13,
                                lineHeight: "1.4",
                                display: "-webkit-box",
                                WebkitLineClamp: isMobile ? 2 : 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                wordBreak: "break-word",
                              }}
                            >
                              {creator.bio || "소개글을 준비중입니다."}
                            </Text>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: isMobile ? 10 : 11,
                              flexShrink: 0,
                              marginTop: "auto",
                            }}
                          >
                            <Text
                              type="secondary"
                              style={{ fontSize: isMobile ? 10 : 11 }}
                            >
                              팔로워 {formatNumber(creator.followerCount)}
                            </Text>
                            <Text
                              type="secondary"
                              style={{ fontSize: isMobile ? 10 : 11 }}
                            >
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
