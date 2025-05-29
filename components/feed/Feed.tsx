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
  Image as AntdImageComponent,
  Watermark,
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
  PictureOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/modals/LoginModal";
import { useRouter, useSearchParams } from "next/navigation";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";

const { Title, Paragraph, Text } = Typography;

interface Post {
  id: number;
  creator: {
    id: number;
    handle: string;
    name: string;
    avatar: string;
  };
  title: string;
  content: string;
  isMembershipOnly: boolean;
  isGotMembership: boolean;
  createdAt: string;
  images?: {
    url: string;
    width?: number;
    height?: number;
    isPublic?: boolean;
  }[];
  textLength: number;
  imageCount: number;
  videoCount: number;
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
  const [openReplies, setOpenReplies] = useState<{ [key: number]: boolean }>(
    {}
  );

  //무단 복제금지 문구
  const noCopyGuideText =
    "crefans에 등록된 모든 포스팅 콘텐츠의 캡쳐 및 배포/재배포는 이용약관과 관련 법령에 의거하여 엄격히 금지되어있고, 민/형사상 처벌의 대상이 됩니다.";

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

  const handleCommentSubmit = (postId: number) => {
    // TODO: 답글 제출 로직 구현
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
    <div style={{ width: 800, margin: "0", paddingLeft: 32, paddingRight: 32 }}>
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
              fontSize: 14,
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
              fontSize: 14,
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
              fontSize: 14,
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
            bodyStyle={{ padding: "25px 0" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 12,
                padding: "0 16px",
              }}
            >
              <Avatar
                src={post.creator.avatar}
                icon={<UserOutlined />}
                style={{ marginRight: 12 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Text strong style={{ fontSize: 18, lineHeight: 1.2 }}>
                    {post.creator.name}
                  </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 14, lineHeight: 1.2 }}
                  >
                    @{post.creator.handle}
                  </Text>
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
              {post.isMembershipOnly && post.isGotMembership && (
                <Tag
                  color="green"
                  style={{ marginLeft: "auto" }}
                  icon={<CheckCircleOutlined />}
                >
                  멤버십 구독중
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
            <Title level={4} style={{ marginBottom: 12, padding: "0 16px" }}>
              {post.title}
            </Title>
            {post.isMembershipOnly && !post.isGotMembership ? (
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "150px 12px",
                  borderRadius: 8,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
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
                  <LockOutlined style={{ fontSize: 24, color: "#999" }} />
                  <Paragraph
                    style={{
                      marginTop: 4,
                      color: "#666",
                      fontSize: 16,
                      lineHeight: 1.4,
                    }}
                  >
                    읽기 권한 없음
                  </Paragraph>
                  {/* 컨텐츠 개수 표시 추가 */}
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      justifyContent: "center",
                      gap: "16px",
                      color: "#999",
                      fontSize: 12,
                    }}
                  >
                    <span>텍스트 {post.textLength}자</span>
                    <span>이미지 {post.imageCount}장</span>
                    <span>동영상 {post.videoCount}개</span>
                  </div>
                  <Button
                    type="primary"
                    style={{
                      marginTop: 12,
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
                {/* 텍스트 영역 */}
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
                      padding: "0 16px",
                    }}
                  >
                    {post.content}
                  </div>
                  {/* 2줄 제한일 때만 그라데이션 오버레이 표시 (텍스트에만 적용) */}
                  {!expandedPosts.includes(post.id) &&
                    post.content.length > 120 && (
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
                </div>
                {/* 펼치기/접기 UI - 100% 가로, 양쪽 선, 텍스트만 클릭 */}
                {post.content.length > 120 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      margin: "16px 0",
                    }}
                  >
                    <div
                      style={{ flex: 1, height: 1, background: "#e0e0e0" }}
                    />
                    <span
                      onClick={() => togglePostExpand(post.id)}
                      style={{
                        cursor: "pointer",
                        color: "#888",
                        fontWeight: 400,
                        fontSize: 14,
                        padding: "0 24px",
                        userSelect: "none",
                        background: "transparent",
                        lineHeight: 1.2,
                        zIndex: 1,
                      }}
                    >
                      {expandedPosts.includes(post.id) ? "접기" : "더보기"}
                    </span>
                    <div
                      style={{ flex: 1, height: 1, background: "#e0e0e0" }}
                    />
                  </div>
                )}
                {/* 미디어는 항상 텍스트 아래에 노출 */}
                {post.isGotMembership && post.images?.length && (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      marginTop: 16,
                    }}
                  >
                    <LightGallery
                      speed={500}
                      plugins={[lgThumbnail]}
                      download={false}
                      elementClassNames="custom-wrapper-class"
                    >
                      {/* 썸네일용 첫 번째 이미지 */}
                      {post.images
                        .filter((img) => img.isPublic)
                        .map((img, idx) => (
                          <a
                            key={`${post.id}-${img.url}-${idx}`}
                            className="gallery-item"
                            data-src={img.url}
                            href={img.url}
                          >
                            <img
                              src={img.url}
                              alt={noCopyGuideText}
                              style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          </a>
                        ))}
                      {/* 프리뷰용 나머지 이미지들 (숨김) */}
                      {post.images
                        .filter((img) => !img.isPublic)
                        .map((img, idx) => (
                          <a
                            key={`${post.id}-${img.url}`}
                            className="gallery-item"
                            data-src={img.url}
                            href={img.url}
                            style={{ display: "none" }}
                          >
                            <img
                              src={img.url}
                              alt={noCopyGuideText}
                              style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "cover",
                                borderRadius: 8,
                                display: "none",
                              }}
                            />
                          </a>
                        ))}
                    </LightGallery>
                    {/* 미디어 개수 표시 UI */}
                    <div
                      style={{
                        position: "absolute",
                        right: 12,
                        bottom: 12,
                        background: "rgba(20, 24, 40, 0.8)",
                        borderRadius: 16,
                        padding: "2px 10px 2px 8px",
                        display: "flex",
                        alignItems: "center",
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: 18,
                        gap: 4,
                      }}
                    >
                      <PictureOutlined
                        style={{ fontSize: 16, marginRight: 2 }}
                      />
                      <span style={{ fontSize: 16, fontWeight: 400 }}>
                        {post.images.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 16px",
                marginTop: 12,
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                {relativeDatePosts[post.id] === true
                  ? formatFullDate(post.createdAt)
                  : formatDate(post.createdAt)}{" "}
                작성됨
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
            <Divider style={{ margin: "12px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 3px",
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
                  {likedPosts.includes(post.id) ? "1" : "0"}
                </Button>
                <Button type="text" icon={<MessageOutlined />}>
                  1
                </Button>
              </Space>
            </div>

            {/* 댓글 리스트 - 인스타그램 스타일 */}

            <div style={{ marginTop: 16, padding: "0 16px" }}>
              {/* 단일 댓글 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <Avatar size={32} src="/profile-90.png" />
                <div style={{ flex: 1 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Text strong style={{ fontSize: 13, color: "#222" }}>
                      팬이에요
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, color: "#888" }}
                    >
                      @iamfan
                    </Text>
                    <Text style={{ fontSize: 13, marginLeft: 4 }}>
                      헐 진짜?
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 2,
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      17시간
                    </Text>
                    {post.isGotMembership && (
                      <Button
                        type="link"
                        size="small"
                        style={{ padding: 0, fontSize: 13, height: "auto" }}
                      >
                        답글 달기
                      </Button>
                    )}

                    <Button
                      type="link"
                      size="small"
                      style={{
                        padding: 0,
                        fontSize: 13,
                        height: "auto",
                        color: "#999",
                      }}
                    >
                      <HeartOutlined />
                    </Button>
                  </div>
                  {/* 대댓글 접기/펼치기 */}
                  <div style={{ marginLeft: 0, marginTop: 4 }}>
                    <Button
                      type="text"
                      size="small"
                      style={{ color: "#999", padding: 0, fontSize: 13 }}
                      onClick={() =>
                        setOpenReplies((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }))
                      }
                    >
                      ─── 답글 보기(1개)
                    </Button>
                  </div>
                  {/* 대댓글 목록 (펼침 시) */}
                  {openReplies[post.id] && (
                    <div style={{ marginTop: 8, marginLeft: 36 }}>
                      {/* 대댓글 1 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <Avatar size={28} src="/profile-90.png" />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Text strong style={{ fontSize: 14 }}>
                              reply_user1
                            </Text>
                            <Text style={{ fontSize: 14 }}>
                              저도 그렇게 생각했어요!
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginTop: 2,
                            }}
                          >
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              15시간
                            </Text>
                            {post.isGotMembership && (
                              <Button
                                type="link"
                                size="small"
                                style={{
                                  padding: 0,
                                  fontSize: 12,
                                  height: "auto",
                                }}
                              >
                                답글 달기
                              </Button>
                            )}

                            <Button
                              type="link"
                              size="small"
                              style={{
                                padding: 0,
                                fontSize: 12,
                                height: "auto",
                                color: "#999",
                              }}
                            >
                              <HeartOutlined />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 답글 입력 UI */}
            {post.isGotMembership && (
              <div style={{ marginTop: 16, padding: "0 16px" }}>
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
                      key={post.id}
                      placeholder={
                        user
                          ? "답글을 입력하세요"
                          : "로그인하고 답글을 작성해보세요"
                      }
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      style={{ marginBottom: 8, border: "none" }}
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
                        >
                          답글 작성
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                value={`https://www.crefans.com/post/${selectedPostId}`}
                readOnly
                suffix={
                  <Button
                    type="text"
                    icon={<LinkOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://www.crefans.com/post/${selectedPostId}`
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
