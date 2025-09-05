"use client";

import React, { useState, useEffect } from "react";
import { Layout, Typography, Card, List, Tag, Space, Select } from "antd";
import { CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import Spacings from "@/lib/constants/spacings";

const { Title, Text } = Typography;
const { Option } = Select;

interface BoardPost {
  id: number;
  title: string;
  category: string;
  createdAt: string;
  views: number;
  isImportant: boolean;
  excerpt: string;
}

export default function BoardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "notice";

  const [boardList, setBoardList] = useState<BoardPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [loading, setLoading] = useState(true);

  // 목업 데이터 로드
  useEffect(() => {
    const loadBoardList = async () => {
      try {
        const response = await fetch("/mock/boardList.json");
        const apiResponse = await response.json();
        setBoardList(apiResponse.data.posts);
      } catch (error) {
        console.error("게시글 목록을 불러오는데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBoardList();
  }, []);

  // 카테고리 변경 시 URL 업데이트
  useEffect(() => {
    const newUrl = `/board?category=${selectedCategory}`;
    router.replace(newUrl);
  }, [selectedCategory, router]);

  // 현재 카테고리에 맞는 게시글 필터링
  const filteredPosts = boardList.filter(
    (post) => post.category === selectedCategory
  );

  const handlePostClick = (post: BoardPost) => {
    router.push(`/board/${post.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <Layout
      style={{
        width: "100%",
        margin: "0",
        paddingLeft: Spacings.CONTENT_LAYOUT_PADDING,
        paddingRight: Spacings.CONTENT_LAYOUT_PADDING,
        background: "transparent",
      }}
    >
      {/* 카테고리 선택 */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text strong>카테고리</Text>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 200 }}
          >
            <Option value="notice">공지사항</Option>
            <Option value="event">이벤트</Option>
          </Select>
        </Space>
      </Card>

      {/* 게시글 목록 */}
      <Card>
        <List
          loading={loading}
          dataSource={filteredPosts}
          renderItem={(post) => (
            <List.Item
              style={{
                padding: "16px 0",
                cursor: "pointer",
                borderBottom: "1px solid #f0f0f0",
              }}
              onClick={() => handlePostClick(post)}
            >
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Tag color={post.category === "notice" ? "blue" : "green"}>
                    {post.category === "notice" ? "공지사항" : "이벤트"}
                  </Tag>
                  {post.isImportant && <Tag color="red">중요</Tag>}
                </div>
                <Title level={4} style={{ margin: "8px 0", fontSize: 16 }}>
                  {post.title}
                </Title>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 13,
                    lineHeight: 1.4,
                  }}
                >
                  {post.excerpt}
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(post.createdAt)}
                    </Text>
                  </Space>
                  <Space>
                    <EyeOutlined />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      조회 {post.views}
                    </Text>
                  </Space>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </Layout>
  );
}
