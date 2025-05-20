import React from "react";
import { Avatar } from "antd";

interface Photo {
  id: number;
  title: string;
  imageUrl: string;
  author: string;
  createdAt: string;
  likes: number;
}

interface PhotoResultItemProps {
  photo: Photo;
  authorAvatar: string;
  onClick?: () => void;
}

export default function PhotoResultItem({
  photo,
  authorAvatar,
  onClick,
}: PhotoResultItemProps) {
  return (
    <div
      key={photo.id}
      style={{ marginBottom: 24, position: "relative" }}
      onClick={onClick}
    >
      <div
        style={{
          position: "relative",
          cursor: "pointer",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <img
          alt={photo.title}
          src={photo.imageUrl}
          style={{ width: "100%", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 10,
            color: "#fff",
          }}
        >
          <div
            style={{
              fontSize: 14,
              marginBottom: -2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {photo.title}
          </div>
          <div
            style={{
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Avatar src={authorAvatar} size={24} />
            {photo.author}
          </div>
        </div>
      </div>
    </div>
  );
}
