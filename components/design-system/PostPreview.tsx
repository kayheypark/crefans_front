"use client";

import { useState } from "react";
import { App, Segmented, Space } from "antd";
import { PostView } from "@/components/post/Post";
import { useResponsive } from "@/hooks/useResponsive";
import type { IPost } from "@/types/post";

export default function PostPreview() {
  const { message } = App.useApp();
  const responsive = useResponsive();
  const [access, setAccess] = useState("public");
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [exactDate, setExactDate] = useState(false);
  const notify = () => {
    message.info("미리보기 동작입니다. 실제 데이터와 연결되지 않습니다.");
  };
  const post: IPost = {
    id: "catalog-post",
    creator: {
      id: "catalog-creator",
      name: "소연의 스튜디오",
      handle: "sample-studio",
      avatar: "/profile-90.png",
    },
    title: "작은 기록들이 모여 하나의 이야기가 됩니다",
    content:
      "오늘의 창작 과정과 작은 영감을 나눕니다. 좋아하는 것을 오래 이어가는 마음으로 새로운 이야기를 만들고 있어요.\n\n함께 보고, 이야기하고, 다음 순간을 기대해 주세요.",
    isMembershipOnly: access !== "public",
    isGotMembership: access === "member",
    allowComments: false,
    createdAt: "2026-09-10T12:00:00+09:00",
    textLength: 110,
    imageCount: 0,
    videoCount: 0,
    commentCount: 0,
    likeCount: 12 + Number(liked),
    isLiked: liked,
  };
  const router = {
    push: notify,
    replace: notify,
    refresh: notify,
    back: notify,
    forward: notify,
    prefetch: async () => {},
  };
  return (
    <Space direction="vertical" size={18} style={{ width: "100%" }}>
      <Segmented
        aria-label="게시글 권한 상태"
        value={access}
        onChange={setAccess}
        options={[
          { label: "공개", value: "public" },
          { label: "멤버십 · 잠금", value: "locked" },
          { label: "멤버십 · 열람", value: "member" },
        ]}
      />
      <PostView
        post={post}
        likedPosts={liked ? [post.id] : []}
        expandedPosts={expanded ? [post.id] : []}
        relativeDatePosts={{ [post.id]: exactDate }}
        openReplies={{}}
        onLike={() => setLiked((value) => !value)}
        onToggleExpand={() => setExpanded((value) => !value)}
        onToggleDateType={() => setExactDate((value) => !value)}
        onToggleReplies={notify}
        onCommentInputClick={notify}
        onCommentSubmit={notify}
        onShare={notify}
        onReport={notify}
        formatDate={() => "방금 전"}
        formatFullDate={() => "2026.09.10 12:00"}
        comments={null}
        model={{
          user: null,
          router,
          ...responsive,
          showComments: false,
          setShowComments: notify,
          commentCount: 0,
          setCommentCount: () => {},
          lightboxOpen: false,
          setLightboxOpen: () => {},
          lightboxIndex: 0,
          getLightboxSlides: () => [],
          handleThumbnailClick: notify,
          noCopyGuideText: "샘플 콘텐츠입니다.",
          isOwnPost: false,
        }}
      />
    </Space>
  );
}
