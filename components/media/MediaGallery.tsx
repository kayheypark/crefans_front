"use client";

import React, { useState } from "react";
import { Button, Typography, Modal, Space } from "antd";
import {
  CloseOutlined,
  PlayCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { LOADING_TEXTS } from "@/lib/constants/loadingTexts";

const { Text } = Typography;

interface MediaItem {
  id: string;
  url: string;
  type?: "image" | "video";
  width?: number;
  height?: number;
  duration?: string;
  order?: number;
}

interface MediaGalleryProps {
  items: MediaItem[];
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onPreview?: (index: number) => void;
  isLoading?: boolean;
  gridCols?: number;
  showOrderControls?: boolean;
}

// 미디어 타입 감지 함수
const detectMediaType = (url: string): "image" | "video" => {
  const videoExtensions = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"];
  const extension = url.toLowerCase().split(".").pop();
  
  if (extension && videoExtensions.some(ext => ext.includes(extension))) {
    return "video";
  }
  return "image";
};

export default function MediaGallery({
  items,
  onRemove,
  onReorder,
  onPreview,
  isLoading = false,
  gridCols = 3,
  showOrderControls = true,
}: MediaGalleryProps) {
  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // 순서 변경 모달 열기
  const openReorderModal = (index: number) => {
    setSelectedItemIndex(index);
    setReorderModalOpen(true);
  };

  // 순서 변경 실행
  const executeReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    setIsReordering(true);
    try {
      onReorder(fromIndex, toIndex);
      setReorderModalOpen(false);
      setSelectedItemIndex(null);
    } finally {
      setIsReordering(false);
    }
  };

  // 그리드 컬럼 설정
  const getGridColumns = () => {
    switch (gridCols) {
      case 2:
        return "repeat(auto-fill, minmax(180px, 1fr))";
      case 3:
        return "repeat(auto-fill, minmax(120px, 1fr))";
      case 4:
        return "repeat(auto-fill, minmax(100px, 1fr))";
      default:
        return "repeat(auto-fill, minmax(120px, 1fr))";
    }
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          border: "2px dashed #d9d9d9",
          borderRadius: 8,
          color: "#8c8c8c",
        }}
      >
        <Text type="secondary">업로드된 미디어가 없습니다</Text>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: getGridColumns(),
          gap: 12,
          opacity: isLoading ? 0.7 : 1,
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        {items.map((item, index) => {
          const mediaType = item.type || detectMediaType(item.url);
          
          return (
            <div
              key={item.id}
              style={{
                position: "relative",
                aspectRatio: mediaType === "video" ? "16/9" : "1",
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid #f0f0f0",
              }}
              onClick={() => onPreview?.(index)}
            >
              {/* 미디어 콘텐츠 */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {mediaType === "image" ? (
                  <img
                    src={item.url}
                    alt={`미디어 ${index + 1}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                    loading="lazy"
                  />
                ) : (
                  <>
                    <video
                      src={item.url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      preload="metadata"
                    />
                    {/* 비디오 재생 아이콘 */}
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        borderRadius: "50%",
                        padding: 8,
                        color: "white",
                        fontSize: 20,
                      }}
                    >
                      <PlayCircleOutlined />
                    </div>
                  </>
                )}
              </div>

              {/* 순서 번호 */}
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  background: "rgba(0, 0, 0, 0.7)",
                  color: "#fff",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                }}
              >
                {index + 1}번째 {mediaType === "image" ? "이미지" : "동영상"}
              </div>

              {/* 삭제 버튼 */}
              <Button
                type="text"
                size="small"
                danger
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "50%",
                  width: 24,
                  height: 24,
                  minWidth: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
              >
                <CloseOutlined style={{ fontSize: 12 }} />
              </Button>

              {/* 순서 변경 버튼 - 모바일 친화적 */}
              {showOrderControls && items.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    display: "flex",
                    gap: 4,
                  }}
                >
                  <Button
                    type="text"
                    size="small"
                    style={{
                      background: "rgba(0, 0, 0, 0.8)",
                      border: "none",
                      borderRadius: 4,
                      width: 24,
                      height: 24,
                      minWidth: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openReorderModal(index);
                    }}
                  >
                    <SwapOutlined style={{ fontSize: 10 }} />
                  </Button>
                </div>
              )}

              {/* 미디어 정보 */}
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: 4,
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "#fff",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                  maxWidth: "calc(100% - 60px)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {mediaType === "image" && item.width && item.height && (
                  <span>{item.width} × {item.height}</span>
                )}
                {mediaType === "video" && item.duration && (
                  <span>{item.duration}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 순서 변경 모달 */}
      <Modal
        title="순서 변경"
        open={reorderModalOpen}
        onCancel={() => {
          setReorderModalOpen(false);
          setSelectedItemIndex(null);
        }}
        footer={null}
        width={400}
      >
        {selectedItemIndex !== null && (
          <div style={{ padding: "16px 0" }}>
            <Text style={{ display: "block", marginBottom: 16 }}>
              <strong>{selectedItemIndex + 1}번째</strong> 미디어의 순서를 변경하세요
            </Text>
            
            <Space direction="vertical" style={{ width: "100%" }}>
              {/* 맨 앞으로 이동 */}
              {selectedItemIndex > 0 && (
                <Button
                  block
                  size="large"
                  onClick={() => executeReorder(selectedItemIndex, 0)}
                  loading={isReordering}
                  disabled={isReordering}
                >
                  {isReordering ? LOADING_TEXTS.PROCESSING : "맨 앞으로 이동"}
                </Button>
              )}

              {/* 한 칸 앞으로 */}
              {selectedItemIndex > 0 && (
                <Button
                  block
                  icon={<ArrowUpOutlined />}
                  onClick={() => executeReorder(selectedItemIndex, selectedItemIndex - 1)}
                  loading={isReordering}
                  disabled={isReordering}
                >
                  {isReordering ? LOADING_TEXTS.PROCESSING : "한 칸 앞으로"}
                </Button>
              )}

              {/* 한 칸 뒤로 */}
              {selectedItemIndex < items.length - 1 && (
                <Button
                  block
                  icon={<ArrowDownOutlined />}
                  onClick={() => executeReorder(selectedItemIndex, selectedItemIndex + 1)}
                  loading={isReordering}
                  disabled={isReordering}
                >
                  {isReordering ? LOADING_TEXTS.PROCESSING : "한 칸 뒤로"}
                </Button>
              )}

              {/* 맨 뒤로 이동 */}
              {selectedItemIndex < items.length - 1 && (
                <Button
                  block
                  size="large"
                  onClick={() => executeReorder(selectedItemIndex, items.length - 1)}
                  loading={isReordering}
                  disabled={isReordering}
                >
                  {isReordering ? LOADING_TEXTS.PROCESSING : "맨 뒤로 이동"}
                </Button>
              )}
            </Space>

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Button
                type="default"
                onClick={() => {
                  setReorderModalOpen(false);
                  setSelectedItemIndex(null);
                }}
                disabled={isReordering}
              >
                취소
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}