"use client";

import React, { useState } from "react";
import Card from "antd/lib/card";
import Avatar from "antd/lib/avatar";
import Button from "antd/lib/button";
import Space from "antd/lib/space";
import Typography from "antd/lib/typography";
import Divider from "antd/lib/divider";
import Dropdown from "antd/lib/dropdown";
import Input from "antd/lib/input";
import Tag from "antd/lib/tag";
import message from "antd/lib/message";
import Paragraph from "antd/lib/typography/Paragraph";
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  MoreOutlined,
  ShareAltOutlined,
  ExclamationCircleOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  PictureOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useResponsive } from "@/hooks/useResponsive";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";

const { Title, Text } = Typography;

interface PostImage {
  url: string;
  isPublic: boolean;
}

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  images?: PostImage[];
  isMembershipOnly: boolean;
  isGotMembership: boolean;
  textLength: number;
  imageCount: number;
  videoCount: number;
  creator: {
    name: string;
    handle: string;
    avatar: string;
  };
}

interface PostProps {
  post: Post;
  likedPosts: number[];
  expandedPosts: number[];
  relativeDatePosts: { [key: number]: boolean };
  openReplies: { [key: number]: boolean };
  onLike: (postId: number) => void;
  onToggleExpand: (postId: number) => void;
  onToggleDateType: (postId: number) => void;
  onToggleReplies: (postId: number) => void;
  onCommentInputClick: () => void;
  onCommentSubmit: (postId: number) => void;
  onShare: (postId: number) => void;
  onReport: (postId: number) => void;
  formatDate: (date: string) => string;
  formatFullDate: (date: string) => string;
}

export default function Post({
  post,
  likedPosts,
  expandedPosts,
  relativeDatePosts,
  openReplies,
  onLike,
  onToggleExpand,
  onToggleDateType,
  onToggleReplies,
  onCommentInputClick,
  onCommentSubmit,
  onShare,
  onReport,
  formatDate,
  formatFullDate,
}: PostProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const noCopyGuideText =
    "crefans에 등록된 모든 포스팅 콘텐츠의 캡쳐 및 배포/재배포는 이용약관과 관련 법령에 의거하여 엄격히 금지되어있고, 민/형사상 처벌의 대상이 됩니다.";

  const getMoreMenu = (postId: number) => ({
    items: [
      {
        key: "share",
        icon: <ShareAltOutlined />,
        label: "공유하기",
        onClick: () => onShare(postId),
      },
      {
        key: "report",
        icon: <ExclamationCircleOutlined />,
        label: "신고하기",
        danger: true,
        onClick: () => onReport(postId),
      },
    ],
  });

  return (
    <Card style={{ marginBottom: 16, borderRadius: 8, padding: "25px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginBottom: 12,
          padding: isMobile ? "0 12px" : "0 16px",
        }}
      >
        <Avatar
          src={post.creator.avatar}
          icon={<UserOutlined />}
          style={{ marginRight: 12, cursor: "pointer" }}
          onClick={() => router.push("/profile")}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text
              strong
              style={{ fontSize: 18, lineHeight: 1.2, cursor: "pointer" }}
              onClick={() => router.push("/profile")}
            >
              {post.creator.name}
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text
              type="secondary"
              style={{ fontSize: 14, lineHeight: 1.2, cursor: "pointer" }}
              onClick={() => router.push("/profile")}
            >
              @{post.creator.handle}
            </Text>
          </div>

          {/* 모바일에서 멤버십 태그를 핸들 아래에 배치 */}
          {(isMobile || isTablet) && (
            <div style={{ marginTop: 8 }}>
              {post.isMembershipOnly && (
                <Tag
                  color="gold"
                  icon={<CrownOutlined />}
                  style={{ marginRight: 8 }}
                >
                  멤버십 전용
                </Tag>
              )}
              {post.isMembershipOnly && post.isGotMembership && (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  멤버십 구독중
                </Tag>
              )}
            </div>
          )}
        </div>

        {/* 데스크톱에서 멤버십 태그를 오른쪽에 배치 */}
        {isDesktop && (
          <>
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
          </>
        )}
        <Dropdown
          menu={getMoreMenu(post.id)}
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

      <Title
        level={4}
        style={{
          marginBottom: 12,
          padding: isMobile ? "0 12px" : "0 16px",
          fontSize: isMobile ? "16px" : "18px",
        }}
      >
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
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
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
                background: "linear-gradient(90deg, #6a5af9 0%, #f857a6 100%)",
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
                padding: isMobile ? "0 12px" : "0 16px",
              }}
            >
              {post.content}
            </div>
            {/* 2줄 제한일 때만 그라데이션 오버레이 표시 (텍스트에만 적용) */}
            {!expandedPosts.includes(post.id) && post.content.length > 120 && (
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
              <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
              <span
                onClick={() => onToggleExpand(post.id)}
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
              <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
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
                <PictureOutlined style={{ fontSize: 16, marginRight: 2 }} />
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
          padding: isMobile ? "0 12px" : "0 16px",
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
          onClick={() => onToggleDateType(post.id)}
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
            onClick={() => onLike(post.id)}
          >
            {likedPosts.includes(post.id) ? "1" : "0"}
          </Button>
          <Button type="text" icon={<MessageOutlined />}>
            1
          </Button>
        </Space>
      </div>

      {/* 댓글 리스트 - 인스타그램 스타일 */}
      <div style={{ marginTop: 16, padding: isMobile ? "0 12px" : "0 16px" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text strong style={{ fontSize: 13, color: "#222" }}>
                팬이에요
              </Text>
              <Text type="secondary" style={{ fontSize: 13, color: "#888" }}>
                @iamfan
              </Text>
              <Text style={{ fontSize: 13, marginLeft: 4 }}>헐 진짜?</Text>
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
                onClick={() => onToggleReplies(post.id)}
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
        <div style={{ marginTop: 16, padding: isMobile ? "0 12px" : "0 16px" }}>
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
                  user ? "답글을 입력하세요" : "로그인하고 답글을 작성해보세요"
                }
                autoSize={{ minRows: 1, maxRows: 3 }}
                style={{ marginBottom: 8, border: "none" }}
                onClick={onCommentInputClick}
                readOnly={!user}
              />
              {user && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="default"
                    onClick={() => onCommentSubmit(post.id)}
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
  );
}
