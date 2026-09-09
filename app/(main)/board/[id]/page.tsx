"use client";
import { message as uiMessage } from "antd";

import { useBoardViewPageModel } from "@/features/board-id/useBoardViewPageModel";
import Spacings from "@/lib/constants/spacings";
import {
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Divider, Layout, Space, Spin, Tag, Typography } from "antd";

const { Title, Text } = Typography;

export default function BoardViewPage() {
  const model = useBoardViewPageModel({ message: uiMessage });
  return <BoardViewPageView model={model} />;
}

function BoardViewPageView({
  model,
}: {
  model: ReturnType<typeof useBoardViewPageModel>;
}) {
  const {
    isMobile,
    post,
    loading,
    error,
    formatDate,
    getCategoryLabel,
    getCategoryColor,
  } = model;

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
            <Tag color={getCategoryColor(post.category)}>
              {getCategoryLabel(post.category)}
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
                  ? formatDate(post.published_at || post.created_at)
                  : `발행일: ${formatDate(
                      post.published_at || post.created_at,
                    )}`}
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
