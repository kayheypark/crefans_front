import React from "react";
import { Avatar, Button, Tag } from "antd";

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
  author: string;
  createdAt: string;
  views: number;
  duration: string;
  tags: string[];
}

interface VideoResultItemProps {
  video: Video;
  authorAvatar: string;
  onClick?: () => void;
}

export default function VideoResultItem({
  video,
  authorAvatar,
  onClick,
}: VideoResultItemProps) {
  return (
    <div style={{ cursor: "pointer" }} onClick={onClick}>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <img
          alt={video.title}
          src={video.thumbnailUrl}
          style={{
            width: "100%",
            aspectRatio: "16/9",
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {video.duration}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Avatar src={authorAvatar} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              marginBottom: 4,
              color: "#222",
            }}
          >
            {video.title}
          </div>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
            {video.author}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {video.tags.map((tag: string, index: number) => (
              <Tag
                key={index}
                color="black"
                style={{ fontSize: 13, padding: "0 8px", borderRadius: 10 }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
