"use client";

import React, { useState, useEffect } from "react";
import { Layout, Typography, Card, Tag, Space, Divider, Spin, message } from "antd";
import {
  CalendarOutlined,
  EyeOutlined,
  UserOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { useResponsive } from "@/hooks/useResponsive";
import Spacings from "@/lib/constants/spacings";
import { boardApi, BoardPost } from "@/lib/api/board";

const { Title, Text } = Typography;

export default function BoardViewPage() {
  const router = useRouter();
  const params = useParams();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const postId = params.id as string;

  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 게시글 상세 데이터 로드
  useEffect(() => {
    const loadPostDetail = async () => {
      try {
        setLoading(true);
        const response = await boardApi.getPost(postId);

        if (response.success) {
          setPost(response.data);
          // 조회수 증가
          try {
            await boardApi.incrementViews(postId);
          } catch (viewError) {
            console.warn("조회수 증가 실패:", viewError);
          }
        } else {
          setError("게시글을 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("게시글 상세를 불러오는데 실패했습니다:", error);
        setError("게시글을 불러오는데 실패했습니다.");
        message.error("게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPostDetail();
    }
  }, [postId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  if (loading) {
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (error || !post) {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
          }}
        >
          <Text type="secondary">{error || "게시글을 찾을 수 없습니다."}</Text>
        </div>
      </Layout>
    );
  }

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
      {/* 게시글 상세 */}
      <Card>
        {/* 게시글 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Tag color={post.category === "NOTICE" ? "blue" : "green"}>
              {post.category === "NOTICE" ? "공지사항" : "이벤트"}
            </Tag>
            {post.is_important && <Tag color="red">중요</Tag>}
          </div>
          <Title level={2} style={{ margin: "0 0 16px 0" }}>
            {post.title}
          </Title>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              color: "#8c8c8c",
              fontSize: 14,
            }}
          >
            <Space>
              <UserOutlined />
              <Text type="secondary">{post.author}</Text>
            </Space>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">
                {isMobile
                  ? formatDate(post.created_at)
                  : `작성일: ${formatDate(post.created_at)}`}
              </Text>
            </Space>
            {post.updated_at && post.updated_at !== post.created_at && (
              <Space>
                <EditOutlined />
                <Text type="secondary">
                  {isMobile
                    ? formatDate(post.updated_at)
                    : `수정일: ${formatDate(post.updated_at)}`}
                </Text>
              </Space>
            )}
            <Space>
              <EyeOutlined />
              <Text type="secondary">
                {isMobile ? post.views : `조회 ${post.views}`}
              </Text>
            </Space>
          </div>
        </div>

        <Divider />

        {/* 게시글 내용 */}
        <div
          style={{
            whiteSpace: "pre-line",
            lineHeight: 1.8,
            fontSize: 16,
            minHeight: "400px",
          }}
        >
          {post.content}
        </div>
      </Card>
    </Layout>
  );
}
