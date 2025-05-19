"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Avatar,
  Tag,
  Space,
  Spin,
  Empty,
  Button,
} from "antd";
import { UserOutlined, LockOutlined, CrownOutlined } from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";

const { Title, Paragraph, Text } = Typography;

interface Post {
  id: number;
  creator: {
    id: number;
    name: string;
    avatar: string;
  };
  title: string;
  content: string;
  isMembershipOnly: boolean;
  createdAt: string;
}

// 더미 데이터 생성
const generateDummyPosts = (start: number, count: number): Post[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: start + i,
    creator: {
      id: (i % 5) + 1,
      name: `크리에이터${(i % 5) + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    },
    title: `게시글 제목 ${start + i}`,
    content: `이것은 게시글 ${
      start + i
    }의 내용입니다. 더미 데이터로 생성된 내용이며, 실제 데이터로 대체될 예정입니다.`,
    isMembershipOnly: Math.random() > 0.5,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }));
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadMoreData = () => {
    if (loading) return;
    setLoading(true);

    // 더미 데이터 로딩 시뮬레이션
    setTimeout(() => {
      const newPosts = generateDummyPosts((page - 1) * pageSize, pageSize);

      if (page >= 5) {
        // 5페이지 이후에는 더 이상 데이터가 없다고 가정
        setHasMore(false);
      } else {
        setPosts([...posts, ...newPosts]);
        setPage(page + 1);
      }

      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadMoreData();
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

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <InfiniteScroll
        dataLength={posts.length}
        next={loadMoreData}
        hasMore={hasMore}
        loader={
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        }
        endMessage={
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Empty
              description="더 이상 확인할 게시글이 없습니다."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        }
      >
        {posts.map((post) => (
          <Card
            key={post.id}
            style={{ marginBottom: 16, borderRadius: 8 }}
            bodyStyle={{ padding: 16 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Avatar
                src={post.creator.avatar}
                icon={<UserOutlined />}
                style={{ marginRight: 12 }}
              />
              <div>
                <Text strong>{post.creator.name}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(post.createdAt)}
                </Text>
              </div>
              {post.isMembershipOnly && (
                <Tag
                  color="gold"
                  style={{ marginLeft: "auto" }}
                  icon={<CrownOutlined />}
                >
                  멤버십 전용
                </Tag>
              )}
            </div>
            <Title level={4} style={{ marginBottom: 12 }}>
              {post.title}
            </Title>
            {post.isMembershipOnly ? (
              <div
                style={{
                  background: "#f5f5f5",
                  padding: 16,
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <LockOutlined style={{ fontSize: 24, color: "#999" }} />
                <Paragraph style={{ marginTop: 8, color: "#666" }}>
                  이 게시글은 멤버십 구독자만 볼 수 있습니다.
                  <br />
                  멤버십에 가입하여 더 많은 컨텐츠를 즐겨보세요!
                </Paragraph>
                <Button type="primary" style={{ marginTop: 8 }}>
                  멤버십 가입하기
                </Button>
              </div>
            ) : (
              <Paragraph>{post.content}</Paragraph>
            )}
          </Card>
        ))}
      </InfiniteScroll>
    </div>
  );
}
