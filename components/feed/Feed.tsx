"use client";

import React, { useState, useEffect, useRef, MouseEvent } from "react";
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
  Tabs,
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
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/modals/LoginModal";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function Feed() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [filter, setFilter] = useState<"all" | "membership" | "public">(
    (searchParams.get("feedFilter") as "all" | "membership" | "public") || "all"
  );
  const [isSticky, setIsSticky] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [coverProgress, setCoverProgress] = useState<{ [key: number]: number }>(
    {}
  );

  // JSON에서 데이터 fetch
  const fetchFeedData = async (page: number, pageSize: number) => {
    const res = await fetch("/mock/feed.json");
    const data: Post[] = await res.json();
    // 페이지네이션 흉내
    return data.slice((page - 1) * pageSize, page * pageSize);
  };

  const loadMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const newPosts = await fetchFeedData(page, pageSize);
    setPosts((prev) => [...prev, ...newPosts]);
    if (newPosts.length < pageSize) {
      setHasMore(false);
    } else {
      setPage((prev) => prev + 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMoreData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([e]) => setIsSticky(!e.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
    );
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
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

  // 필터링된 피드
  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    if (filter === "membership") return post.isMembershipOnly;
    if (filter === "public") return !post.isMembershipOnly;
    return true;
  });

  // id 중복 제거
  const uniqueFilteredPosts = Array.from(
    new Map(filteredPosts.map((post) => [post.id, post])).values()
  );

  // 멤버십 카드 마우스 이동 핸들러
  const handleMembershipMouseMove = (
    postId: number,
    e: MouseEvent<HTMLDivElement>
  ) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    // progress: 카드 상단(0)~하단(1)
    let progress = mouseY / rect.height;
    progress = Math.max(0, Math.min(1, progress));
    // 최대 절반까지만 벗겨짐
    progress = Math.min(progress, 0.5);
    setCoverProgress((prev) => ({ ...prev, [postId]: progress }));
  };
  const handleMembershipMouseLeave = (postId: number) => {
    setCoverProgress((prev) => ({ ...prev, [postId]: 0 }));
  };

  // 쿼리 파라미터(filter) 변경 시 filter 상태 동기화 (새로고침/뒤로가기 등 대응)
  useEffect(() => {
    const filterParam = searchParams.get("feedFilter") as
      | "all"
      | "membership"
      | "public";
    if (filterParam && filterParam !== filter) {
      setFilter(filterParam);
    }
    if (!filterParam && filter !== "all") {
      setFilter("all");
    }
  }, [searchParams]);

  return (
    <div style={{ width: 600, margin: "0", paddingLeft: 32, paddingRight: 32 }}>
      {/* sticky 감지용 sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {/* 피드 타이틀+필터 sticky 슬리버 */}
      <div
        ref={stickyRef}
        style={{
          position: "sticky",
          top: 72,
          zIndex: 10,
          background: isSticky ? "rgba(255,255,255,0.7)" : "transparent",
          backdropFilter: isSticky ? "blur(8px)" : "none",
          boxShadow: isSticky ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
          padding: "16px 0 12px 0",
          marginBottom: 8,
          width: "100%",
          transition: "background 0.2s, backdrop-filter 0.2s, box-shadow 0.2s",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            type={filter === "all" ? "primary" : "default"}
            style={{
              fontSize: 10,
            }}
            onClick={() => {
              setFilter("all");
              const params = new URLSearchParams(searchParams.toString());
              params.set("feedFilter", "all");
              router.push(`?${params.toString()}`);
            }}
          >
            전체
          </Button>
          <Button
            type={filter === "membership" ? "primary" : "default"}
            style={{
              fontSize: 10,
            }}
            onClick={() => {
              setFilter("membership");
              const params = new URLSearchParams(searchParams.toString());
              params.set("feedFilter", "membership");
              router.push(`?${params.toString()}`);
            }}
          >
            멤버십 전용
          </Button>
          <Button
            type={filter === "public" ? "primary" : "default"}
            style={{
              fontSize: 10,
            }}
            onClick={() => {
              setFilter("public");
              const params = new URLSearchParams(searchParams.toString());
              params.set("feedFilter", "public");
              router.push(`?${params.toString()}`);
            }}
          >
            공개
          </Button>
        </div>
      </div>
      <InfiniteScroll
        dataLength={uniqueFilteredPosts.length}
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
        {uniqueFilteredPosts.map((post) => (
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
                    {relativeDatePosts[post.id] === true
                      ? formatFullDate(post.createdAt)
                      : formatDate(post.createdAt)}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    style={{ padding: 0, fontSize: 12 }}
                    onClick={() => toggleDateType(post.id)}
                  >
                    {relativeDatePosts[post.id] === true ? "간단히" : "정확히"}
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
                  padding: "8px 12px",
                  borderRadius: 8,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 100,
                }}
                onMouseMove={(e) => handleMembershipMouseMove(post.id, e)}
                onMouseLeave={() => handleMembershipMouseLeave(post.id)}
              >
                {/* 샘플 이미지와 더미 텍스트 */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    filter: `blur(${Math.max(
                      3,
                      8 - 10 * (coverProgress[post.id] || 0)
                    )}px)`,
                    transition: "filter 0.3s",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                    alt="샘플"
                    style={{
                      width: "100%",
                      height: 48,
                      objectFit: "cover",
                      borderRadius: 6,
                      marginBottom: 4,
                    }}
                  />
                  <Paragraph
                    style={{
                      margin: 0,
                      color: "#444",
                      fontWeight: 500,
                      fontSize: 11,
                      lineHeight: 1.4,
                    }}
                  >
                    이 게시물은 블러 처리를 위한 샘플 텍스트입니다.🔥
                    <br />
                    실제 상품과는 관련이 없습니다.
                  </Paragraph>
                </div>
                {/* 블러/반투명 덮개 레이어 */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "calc(100% + 100px)",
                    background: "rgba(255,255,255,0.4)",
                    backdropFilter: `blur(${
                      8 - 8 * (coverProgress[post.id] || 0)
                    }px)`,
                    WebkitBackdropFilter: `blur(${
                      8 - 8 * (coverProgress[post.id] || 0)
                    }px)`,
                    transform: `translateY(${
                      (coverProgress[post.id] || 0) * 100
                    }%)`,
                    opacity: 1 - (coverProgress[post.id] || 0) * 1.2,
                    transition:
                      "transform 0.3s cubic-bezier(.4,2,.6,1), opacity 0.3s, backdrop-filter 0.3s",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                />
                {/* 안내 문구와 버튼 */}
                <div style={{ position: "relative", zIndex: 3, marginTop: 8 }}>
                  <LockOutlined style={{ fontSize: 18, color: "#999" }} />
                  <Paragraph
                    style={{
                      marginTop: 4,
                      color: "#666",
                      fontSize: 12,
                      lineHeight: 1.4,
                    }}
                  >
                    읽기 권한 없음
                  </Paragraph>
                  <Button
                    type="primary"
                    style={{
                      marginTop: 4,
                      background:
                        "linear-gradient(90deg, #6a5af9 0%, #f857a6 100%)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 12,
                      boxShadow: "0 2px 8px rgba(100,0,200,0.08)",
                      height: 28,
                      padding: "0 10px",
                    }}
                  >
                    한달에 콩 30개로 해당 크리에이터의 유료 콘텐츠 보기
                  </Button>
                </div>
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
                    원문보기
                  </Button>
                </div>
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
                        ? "댓글을 입력하세요"
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
