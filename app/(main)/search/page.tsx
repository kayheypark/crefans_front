"use client";

import React, { useState } from "react";
import {
  Typography,
  Input,
  Tabs,
  List,
  Card,
  Avatar,
  Empty,
  Pagination,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import Masonry from "react-masonry-css";

const { Title } = Typography;

const MAX_NOTIFICATIONS_DISPLAY = 30;
const DEFAULT_PROFILE_IMG = "/profile-30.png";

interface Creator {
  key: string;
  name: string;
  avatar: string;
  description: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
}

interface Photo {
  id: number;
  title: string;
  imageUrl: string;
  author: string;
  createdAt: string;
  likes: number;
}

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
  author: string;
  createdAt: string;
  views: number;
  duration: string;
  tags: string[];
}

type SearchResult = {
  creators: Creator[];
  posts: Post[];
  photos: Photo[];
  videos: Video[];
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeSearchTab, setActiveSearchTab] = useState<
    "creators" | "posts" | "photos" | "videos"
  >("creators");
  const [searchPage, setSearchPage] = useState({
    creators: 1,
    posts: 1,
    photos: 1,
    videos: 1,
  });
  const pageSize = 10;

  // Mock 데이터
  const membershipCreators: Creator[] = [
    {
      key: "creator1",
      name: "크리에이터1",
      avatar: DEFAULT_PROFILE_IMG,
      description: "크리에이터1의 설명입니다.",
    },
    // ... 더 많은 크리에이터 데이터
  ];

  const searchResults: SearchResult = {
    creators: searchQuery
      ? membershipCreators.filter(
          (creator) =>
            creator.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            creator.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
      : membershipCreators,
    posts: [
      {
        id: 1,
        title: "오늘의 일상",
        content: "오늘은 정말 좋은 날이에요!",
        author: "크리에이터1",
        createdAt: "2024-03-20T10:00:00",
        likes: 120,
        comments: 15,
      },
      // ... 더 많은 게시글 데이터
    ],
    photos: [
      {
        id: 1,
        title: "일출 사진",
        imageUrl: "/image_1_160x120.png",
        author: "크리에이터1",
        createdAt: "2024-03-20T08:00:00",
        likes: 200,
      },
      // ... 더 많은 사진 데이터
    ],
    videos: [
      {
        id: 1,
        title: "동영상 게시글 1",
        thumbnailUrl: "/dummy1.png",
        author: "크리에이터1",
        createdAt: "2024-03-20T09:00:00",
        views: 1200,
        duration: "03:12",
        tags: ["태그1", "태그2", "태그3"],
      },
      // ... 더 많은 동영상 데이터
    ],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  };

  const renderSearchResults = () => {
    const tab = activeSearchTab;
    const data = searchResults[tab];
    const pagedData = data.slice(
      (searchPage[tab] - 1) * pageSize,
      searchPage[tab] * pageSize
    );

    if (tab === "creators") {
      return (
        <>
          <List
            dataSource={pagedData as Creator[]}
            renderItem={(creator: Creator) => (
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
                    style={{ marginRight: 40, flexShrink: 0 }}
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
                      <span style={{ fontWeight: 700, fontSize: 22 }}>
                        {creator.name}
                      </span>
                    </div>
                    <div style={{ color: "#444", fontSize: 16 }}>
                      {creator.description}
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="검색 결과가 없습니다" /> }}
          />
          <Pagination
            current={searchPage[tab]}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, [tab]: page }))
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
            dataSource={pagedData as Post[]}
            renderItem={(post: Post) => (
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
                    padding: "24px",
                    width: "100%",
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Avatar size={32} src={DEFAULT_PROFILE_IMG} />
                      <span style={{ fontWeight: 500 }}>{post.author}</span>
                    </div>
                    <Title level={4} style={{ margin: "8px 0" }}>
                      {post.title}
                    </Title>
                    <div style={{ color: "#666" }}>{post.content}</div>
                  </div>
                  <div style={{ display: "flex", gap: 16, color: "#8c8c8c" }}>
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="검색 결과가 없습니다" /> }}
          />
          <Pagination
            current={searchPage[tab]}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, [tab]: page }))
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
          <Masonry
            breakpointCols={{
              default: 3,
              1100: 3,
              700: 2,
              500: 1,
            }}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {(pagedData as Photo[]).map((photo: Photo) => (
              <div
                key={photo.id}
                style={{ marginBottom: 24, position: "relative" }}
              >
                <div
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <img
                    alt={photo.title}
                    src={photo.imageUrl}
                    style={{
                      width: "100%",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0) 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: 10,
                      color: "#fff",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        marginBottom: -2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {photo.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Avatar src={DEFAULT_PROFILE_IMG} size={24} />
                      {photo.author}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Masonry>
          <style jsx global>{`
            .masonry-grid {
              display: flex;
              margin-left: -24px;
              width: auto;
            }
            .masonry-grid_column {
              padding-left: 24px;
              background-clip: padding-box;
            }
            .masonry-grid_column > div {
              margin-bottom: 24px;
            }
          `}</style>
          <Pagination
            current={searchPage[tab]}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, [tab]: page }))
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
            grid={{ gutter: [24, 32], column: 4 }}
            dataSource={pagedData as Video[]}
            renderItem={(video: Video) => (
              <List.Item>
                <div style={{ cursor: "pointer" }}>
                  <div style={{ position: "relative", marginBottom: 12 }}>
                    <img
                      alt={video.title}
                      src={video.thumbnailUrl}
                      style={{
                        width: "100%",
                        aspectRatio: "16/9",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.8)",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      {video.duration}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <Avatar src={DEFAULT_PROFILE_IMG} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 500,
                          marginBottom: 4,
                          color: "#222",
                        }}
                      >
                        {video.title}
                      </div>
                      <div
                        style={{ fontSize: 14, color: "#666", marginBottom: 4 }}
                      >
                        {video.author}
                      </div>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {video.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            style={{
                              background: "#f5f5f5",
                              padding: "2px 8px",
                              borderRadius: 12,
                              fontSize: 13,
                              color: "#666",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <Pagination
            current={searchPage[tab]}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) =>
              setSearchPage((prev) => ({ ...prev, [tab]: page }))
            }
            style={{ textAlign: "center", marginTop: 32 }}
            showSizeChanger={false}
          />
        </>
      );
    }

    return <Empty description="검색 결과가 없습니다" />;
  };

  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Input.Search
          placeholder="크리에이터 또는 포스팅을 검색해보세요"
          size="large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: "24px" }}
        />
        <Tabs
          activeKey={activeSearchTab}
          onChange={(key) =>
            setActiveSearchTab(
              key as "creators" | "posts" | "photos" | "videos"
            )
          }
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
          style={{ marginTop: "8px" }}
        />
      </div>
    </div>
  );
}
