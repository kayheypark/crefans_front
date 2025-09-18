"use client";

import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Card,
  List,
  Tag,
  Space,
  Select,
  message,
} from "antd";
import { CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import Spacings from "@/lib/constants/spacings";
import { boardApi, BoardPost } from "@/lib/api/board";

const { Title, Text } = Typography;
const { Option } = Select;

export default function BoardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "NOTICE";

  const [boardList, setBoardList] = useState<BoardPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // 게시글 목록 로드
  useEffect(() => {
    const loadBoardList = async () => {
      try {
        setLoading(true);
        const response = await boardApi.getPosts({
          category: selectedCategory,
          page: pagination.page,
          limit: pagination.limit,
        });

        if (response.success) {
          setBoardList(response.data.posts);
          setPagination(response.data.pagination);
        } else {
          message.error("게시글 목록을 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("게시글 목록을 불러오는데 실패했습니다:", error);
        message.error("게시글 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadBoardList();
  }, [selectedCategory, pagination.page]);

  // 카테고리 변경 시 URL 업데이트
  useEffect(() => {
    const newUrl = `/board?category=${selectedCategory}`;
    router.replace(newUrl);
  }, [selectedCategory, router]);

  const handlePostClick = (post: BoardPost) => {
    router.push(`/board/${post.id}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 없음";

    try {
      const date = new Date(dateString);

      // Invalid Date 체크
      if (isNaN(date.getTime())) {
        return "날짜 형식 오류";
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 오류";
    }
  };

  // 카테고리 한글 변환 함수
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      NOTICE: "공지사항",
      notice: "공지사항",
      EVENT: "이벤트",
      event: "이벤트",
    };
    return categoryMap[category] || category;
  };

  // 카테고리 색상 반환 함수
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      NOTICE: "blue",
      notice: "blue",
      EVENT: "green",
      event: "green",
    };
    return colorMap[category] || "default";
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
            <Option value="NOTICE">공지사항</Option>
            <Option value="EVENT">이벤트</Option>
          </Select>
        </Space>
      </Card>

      {/* 게시글 목록 */}
      <Card>
        <List
          loading={loading}
          dataSource={boardList}
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
                  <Tag color={getCategoryColor(post.category)}>
                    {getCategoryLabel(post.category)}
                  </Tag>
                  {post.is_important && <Tag color="red">중요</Tag>}
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
                      {formatDate(post.published_at || post.created_at)}
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
