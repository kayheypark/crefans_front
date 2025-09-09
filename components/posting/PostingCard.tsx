"use client";

import { useState } from "react";
import { Card, Avatar, Button, Space, Typography, Divider, message } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { PostingResponse } from "@/types/posting";
import { postingApi } from "@/lib/api/posting";
import { useAuth } from "@/contexts/AuthContext";
import { formatRelativeDate } from "@/lib/utils/dateUtils";

const { Text, Title } = Typography;

interface PostingCardProps {
  posting: PostingResponse;
  onUpdate?: (posting: PostingResponse) => void;
}

export default function PostingCard({ posting, onUpdate }: PostingCardProps) {
  const { user } = useAuth();
  const [localPosting, setLocalPosting] = useState(posting);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!user) {
      message.warning("로그인이 필요합니다.");
      return;
    }

    if (liking) return;

    try {
      setLiking(true);
      
      if (localPosting.is_liked) {
        await postingApi.unlikePosting(localPosting.id);
        const updatedPosting = {
          ...localPosting,
          is_liked: false,
          like_count: localPosting.like_count - 1,
        };
        setLocalPosting(updatedPosting);
        onUpdate?.(updatedPosting);
        message.success("좋아요를 취소했습니다.");
      } else {
        await postingApi.likePosting(localPosting.id);
        const updatedPosting = {
          ...localPosting,
          is_liked: true,
          like_count: localPosting.like_count + 1,
        };
        setLocalPosting(updatedPosting);
        onUpdate?.(updatedPosting);
        message.success("좋아요를 눌렀습니다.");
      }
    } catch (error: any) {
      console.error("Failed to toggle posting like:", error);
      const errorMessage = error.message || "좋아요 처리에 실패했습니다.";
      message.error(errorMessage);
    } finally {
      setLiking(false);
    }
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <Avatar icon={<UserOutlined />} style={{ marginRight: 12 }} />
        <div style={{ flex: 1 }}>
          <Text strong>크리에이터</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              @creator • {formatRelativeDate(localPosting.created_at)}
            </Text>
          </div>
        </div>
      </div>

      <Title level={4} style={{ marginBottom: 8 }}>
        {localPosting.title}
      </Title>
      
      <div style={{ marginBottom: 12, whiteSpace: "pre-line" }}>
        {localPosting.content}
      </div>

      {/* 미디어 표시 */}
      {localPosting.medias && localPosting.medias.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {localPosting.medias.map((media) => (
            <div key={media.id} style={{ marginBottom: 8 }}>
              {media.type === "IMAGE" ? (
                <img
                  src={media.original_url}
                  alt={media.original_name}
                  style={{
                    width: "100%",
                    maxHeight: "400px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : media.type === "VIDEO" ? (
                <video
                  src={media.original_url}
                  controls
                  style={{
                    width: "100%",
                    maxHeight: "400px",
                    borderRadius: "8px",
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Space>
          <Button
            type="text"
            icon={
              localPosting.is_liked ? (
                <HeartFilled style={{ color: "#ff4d4f" }} />
              ) : (
                <HeartOutlined />
              )
            }
            onClick={handleLike}
            loading={liking}
            style={{
              color: localPosting.is_liked ? "#ff4d4f" : undefined,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {localPosting.like_count}
          </Button>
          <Button
            type="text"
            icon={<MessageOutlined />}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {localPosting.comment_count}
          </Button>
        </Space>
      </div>
    </Card>
  );
}