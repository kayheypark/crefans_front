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
  Input,
  Divider,
  Dropdown,
  Menu,
  Modal,
  Radio,
  Form,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  CrownOutlined,
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  ShareAltOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
} from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "./LoginModal";

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
    }의 내용입니다. 더미 데이터로 생성된 내용이며, 실제 데이터로 대체될 예정입니다. 이 게시글은 여러 줄의 텍스트를 포함하고 있어 펼치기 기능을 테스트하기에 적합합니다. 

여러 줄의 텍스트가 계속됩니다. 이 부분은 펼치기를 클릭해야 볼 수 있는 내용입니다. 실제 서비스에서는 이 부분에 더 많은 내용이 들어갈 것입니다. 예를 들어, 크리에이터의 생각이나 경험, 팁이나 조언 등이 포함될 수 있습니다.

또한 이미지나 동영상이 포함될 수도 있고, 다른 사용자들과의 상호작용을 위한 내용도 포함될 수 있습니다. 이렇게 긴 내용은 펼치기 기능을 통해 접근할 수 있도록 하는 것이 사용자 경험에 더 좋습니다.`,
    isMembershipOnly: Math.random() > 0.5,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }));
};

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>(
    {}
  );
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [reportForm] = Form.useForm();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
  const [relativeDatePosts, setRelativeDatePosts] = useState<{
    [key: number]: boolean;
  }>({});

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

  const handleLike = (postId: number) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleCommentChange = (postId: number, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleCommentSubmit = (postId: number) => {
    // TODO: 댓글 제출 로직 구현
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  const handleCommentInputClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  const togglePostExpand = (postId: number) => {
    setExpandedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  // 날짜 표기 토글
  const toggleDateType = (postId: number) => {
    setRelativeDatePosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // 정확한 날짜 포맷 함수
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  // 펼치기 메뉴 아이템
  const getMoreMenu = (postId: number) => (
    <Menu>
      <Menu.Item
        key="share"
        icon={<ShareAltOutlined />}
        onClick={() => {
          setSelectedPostId(postId);
          setIsShareModalVisible(true);
        }}
      >
        공유하기
      </Menu.Item>
      <Menu.Item
        key="report"
        icon={<ExclamationCircleOutlined />}
        danger
        onClick={() => {
          setSelectedPostId(postId);
          setIsReportModalVisible(true);
        }}
      >
        신고하기
      </Menu.Item>
    </Menu>
  );

  const handleShare = (type: string) => {
    // TODO: 실제 공유 기능 구현
    message.success(`${type}로 공유되었습니다.`);
    setIsShareModalVisible(false);
  };

  const handleReport = (values: any) => {
    // TODO: 실제 신고 기능 구현
    message.success("신고가 접수되었습니다.");
    setIsReportModalVisible(false);
    reportForm.resetFields();
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
              <div style={{ flex: 1 }}>
                <Text strong>{post.creator.name}</Text>
                <br />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {relativeDatePosts[post.id] !== false
                      ? formatDate(post.createdAt)
                      : formatFullDate(post.createdAt)}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    style={{ padding: 0, fontSize: 12 }}
                    onClick={() => toggleDateType(post.id)}
                  >
                    {relativeDatePosts[post.id] !== false ? "정확히" : "간단히"}
                  </Button>
                </div>
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
              <Dropdown
                overlay={getMoreMenu(post.id)}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  style={{ marginLeft: 8 }}
                />
              </Dropdown>
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
                <Button
                  type="primary"
                  style={{
                    marginTop: 8,
                    background:
                      "linear-gradient(90deg, #6a5af9 0%, #f857a6 100%)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    fontSize: 12,
                    boxShadow: "0 2px 8px rgba(100,0,200,0.08)",
                  }}
                >
                  월 3,900원에 크리에이터1의 영상보기
                </Button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    marginBottom: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: expandedPosts.includes(post.id)
                      ? "initial"
                      : 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "pre-line",
                    lineHeight: "1.5",
                    fontSize: "14px",
                  }}
                >
                  {post.content}
                </div>
                {/* 2줄 제한일 때만 그라데이션 오버레이 표시 */}
                {!expandedPosts.includes(post.id) && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 60,
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0) 0%, #fff 100%)",
                      pointerEvents: "none",
                      borderRadius: "0 0 8px 8px",
                    }}
                  />
                )}
                {post.content.length > 100 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Button
                      type="link"
                      onClick={() => togglePostExpand(post.id)}
                      style={{
                        padding: 0,
                        height: "auto",
                        fontSize: "13px",
                        color: "#666",
                        zIndex: 1,
                      }}
                    >
                      {expandedPosts.includes(post.id) ? "접기" : "펼치기"}
                    </Button>
                    <Button
                      type="link"
                      style={{
                        padding: 0,
                        height: "auto",
                        fontSize: "13px",
                        color: "#666",
                        zIndex: 1,
                      }}
                      onClick={() => {}}
                    >
                      크리에이터 홈에서 크게보기
                    </Button>
                  </div>
                )}
              </div>
            )}

            <Divider style={{ margin: "12px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space size="small">
                <Button
                  type="text"
                  icon={
                    likedPosts.includes(post.id) ? (
                      <HeartFilled style={{ color: "#ff4d4f" }} />
                    ) : (
                      <HeartOutlined />
                    )
                  }
                  onClick={() => handleLike(post.id)}
                >
                  좋아요 {likedPosts.includes(post.id) ? "1" : "0"}
                </Button>
                <Button type="text" icon={<MessageOutlined />}>
                  댓글 1
                </Button>
              </Space>
            </div>

            {/* 최근 댓글 1개 표시 */}
            <div
              style={{
                marginTop: 16,
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Avatar
                  size="small"
                  src="/profile-90.png"
                  style={{ marginRight: 8 }}
                />
                <Text strong style={{ fontSize: 12 }}>
                  사용자1
                </Text>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  방금 전
                </Text>
              </div>
              <Text style={{ fontSize: 13 }}>훈훈한 결말 👍</Text>
            </div>

            {/* 댓글 입력 UI */}
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <Avatar src={"/profile-90.png"} size={32} />
                <div style={{ flex: 1 }}>
                  <Input.TextArea
                    placeholder={
                      user
                        ? "댓글을 입력하세요..."
                        : "로그인하고 댓글을 작성해보세요"
                    }
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      handleCommentChange(post.id, e.target.value)
                    }
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    style={{ marginBottom: 8 }}
                    onClick={handleCommentInputClick}
                    readOnly={!user}
                  />
                  {user && (
                    <div
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <Button
                        type="default"
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentInputs[post.id]}
                      >
                        댓글 작성
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </InfiniteScroll>

      {/* 공유하기 모달 */}
      <Modal
        title="공유하기"
        open={isShareModalVisible}
        onCancel={() => setIsShareModalVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ textAlign: "center" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Input
                value={`https://seconid.com/post/${selectedPostId}`}
                readOnly
                suffix={
                  <Button
                    type="text"
                    icon={<LinkOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://seconid.com/post/${selectedPostId}`
                      );
                      message.success("링크가 복사되었습니다.");
                    }}
                  />
                }
              />
            </div>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "24px" }}
            >
              <Button
                type="text"
                icon={
                  <FacebookOutlined
                    style={{ fontSize: "24px", color: "#1877F2" }}
                  />
                }
                onClick={() => handleShare("Facebook")}
              />
              <Button
                type="text"
                icon={
                  <TwitterOutlined
                    style={{ fontSize: "24px", color: "#1DA1F2" }}
                  />
                }
                onClick={() => handleShare("Twitter")}
              />
              <Button
                type="text"
                icon={
                  <InstagramOutlined
                    style={{ fontSize: "24px", color: "#E4405F" }}
                  />
                }
                onClick={() => handleShare("Instagram")}
              />
            </div>
          </Space>
        </div>
      </Modal>

      {/* 신고하기 모달 */}
      <Modal
        title="신고하기"
        open={isReportModalVisible}
        onCancel={() => {
          setIsReportModalVisible(false);
          reportForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form form={reportForm} onFinish={handleReport} layout="vertical">
          <Form.Item
            name="reason"
            label="신고 사유"
            rules={[{ required: true, message: "신고 사유를 선택해주세요" }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="spam">스팸/홍보성 게시물</Radio>
                <Radio value="inappropriate">부적절한 콘텐츠</Radio>
                <Radio value="harassment">욕설/비하</Radio>
                <Radio value="copyright">저작권 침해</Radio>
                <Radio value="other">기타</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="detail"
            label="상세 설명"
            rules={[{ required: true, message: "상세 설명을 입력해주세요" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="신고 사유에 대한 상세 설명을 입력해주세요"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: "100%",
              }}
            >
              신고하기
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
