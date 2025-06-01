"use client";

import React, { useState, useEffect } from "react";
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
import PhotoResultItem from "@/components/search/PhotoResultItem";
import VideoResultItem from "@/components/search/VideoResultItem";

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

  const [searchResults, setSearchResults] = useState<SearchResult>({
    creators: [],
    posts: [],
    photos: [],
    videos: [],
  });

  useEffect(() => {
    fetch("/mock/searchResult.json")
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data);
      });
  }, []);

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
              <PhotoResultItem
                key={photo.id}
                photo={photo}
                authorAvatar={DEFAULT_PROFILE_IMG}
              />
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
                <VideoResultItem
                  video={video}
                  authorAvatar={DEFAULT_PROFILE_IMG}
                />
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
