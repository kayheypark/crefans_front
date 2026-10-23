"use client";
import { message as uiMessage } from "antd";

import { useBoardPageModel } from "@/features/board/useBoardPageModel";
import Spacings from "@/lib/constants/spacings";
import { CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import { Card, Layout, List, Select, Space, Tag, Typography } from "antd";

const { Title, Text } = Typography;

const { Option } = Select;

export default function BoardPage() {
  const model = useBoardPageModel({ message: uiMessage });
  return <BoardPageView model={model} />;
}

function BoardPageView({
  model,
}: {
  model: ReturnType<typeof useBoardPageModel>;
}) {
  const {
    boardList,
    selectedCategory,
    setSelectedCategory,
    loading,
    handlePostClick,
    formatDate,
    getCategoryLabel,
    getCategoryColor,
  } = model;

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
