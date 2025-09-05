"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Typography,
  Input,
  Button,
  Upload,
  Switch,
  Space,
  message,
  Card,
  Divider,
  Tag,
  Modal,
  InputNumber,
} from "antd";
import {
  ArrowLeftOutlined,
  PictureOutlined,
  SendOutlined,
  LockOutlined,
  UnlockOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import { useRouter } from "next/navigation";
import Spacings from "@/lib/constants/spacings";
import MembershipManagementModal from "@/components/modals/MembershipManagementModal";
import MembershipCard from "@/components/common/MembershipCard";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<
    {
      id: string;
      url: string;
      order: number;
      width?: number; // 원본 이미지 너비
      height?: number; // 원본 이미지 높이
    }[]
  >([]);
  const [videos, setVideos] = useState<
    {
      id: string;
      url: string;
      duration?: string;
      order: number;
      originalFile?: File; // 원본 파일 참조 추가
    }[]
  >([]);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    type: "image" | "video";
    url: string;
    index: number;
  }>({
    isOpen: false,
    type: "image",
    url: "",
    index: 0,
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isMembershipOnly, setIsMembershipOnly] = useState(false);
  const [selectedMembershipLevel, setSelectedMembershipLevel] =
    useState<number>(1);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [allowIndividualPurchase, setAllowIndividualPurchase] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState(1000);
  const [allowComments, setAllowComments] = useState(true);
  const [scheduledPublish, setScheduledPublish] = useState(false);
  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");
  const [sensitiveContent, setSensitiveContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // 멤버십 데이터 불러오기
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await fetch("/mock/memberships.json");
        const apiResponse = await response.json();
        setMemberships(apiResponse.data);
      } catch (error) {
        console.error("멤버십 데이터를 불러오는데 실패했습니다:", error);
      }
    };

    fetchMemberships();
  }, []);

  // 멤버십 관리 모달 열기
  const openMembershipModal = () => {
    setIsMembershipModalOpen(true);
  };

  // 멤버십 업데이트 처리
  const handleMembershipsUpdate = (updatedMemberships: any[]) => {
    setMemberships(updatedMemberships);
    // 선택된 레벨이 삭제된 경우 기본값으로 설정
    if (!updatedMemberships.find((m) => m.level === selectedMembershipLevel)) {
      setSelectedMembershipLevel(
        updatedMemberships.length > 0 ? updatedMemberships[0].level : 1
      );
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = (info: any) => {
    if (info.file.status === "done") {
      // Blob URL 생성 (더 안정적)
      const blobUrl = URL.createObjectURL(info.file.originFileObj);

      // 이미지 크기 정보 가져오기
      const img = new Image();
      img.onload = () => {
        const newImage = {
          id: Date.now().toString(),
          url: blobUrl,
          order: images.length,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        setImages((prev) => [...prev, newImage]);
        message.success("이미지가 업로드되었습니다.");
      };

      img.onerror = () => {
        // 이미지 로드 실패 시 기본값으로 생성
        const newImage = {
          id: Date.now().toString(),
          url: blobUrl,
          order: images.length,
          width: 0,
          height: 0,
        };
        setImages((prev) => [...prev, newImage]);
        message.success("이미지가 업로드되었습니다.");
      };

      img.src = blobUrl;
    }
  };

  // 이미지 제거
  const removeImage = (index: number) => {
    setImages((prev) => {
      const imageToRemove = prev[index];
      if (imageToRemove) {
        // Blob URL 해제
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // 동영상 업로드 처리
  const handleVideoUpload = (info: any) => {
    if (info.file.status === "done") {
      // Blob URL 생성 (더 안정적)
      const blobUrl = URL.createObjectURL(info.file.originFileObj);

      // 동영상 재생시간 가져오기
      const video = document.createElement("video");
      video.preload = "metadata";

      // 동영상 로드 타임아웃 설정 (5초)
      const timeoutId = setTimeout(() => {
        if (video.readyState < 1) {
          // HAVE_NOTHING
          // 타임아웃 시 기본값으로 생성
          const newVideo = {
            id: `video_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            url: blobUrl,
            duration: "0:00",
            order: videos.length,
            originalFile: info.file.originFileObj,
          };

          setVideos((prev) => [...prev, newVideo]);
          message.success("동영상이 업로드되었습니다.");
        }
      }, 5000);

      video.onloadedmetadata = () => {
        clearTimeout(timeoutId); // 타임아웃 제거

        const duration = video.duration;

        // duration이 유효한 숫자인지 확인
        if (duration && !isNaN(duration) && duration > 0) {
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          const durationString = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;

          const newVideo = {
            id: `video_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`, // 더 고유한 ID 생성
            url: blobUrl,
            duration: durationString,
            order: videos.length,
            originalFile: info.file.originFileObj, // 원본 파일 참조 유지
          };

          setVideos((prev) => [...prev, newVideo]);

          if (process.env.NODE_ENV === "development") {
            console.log("동영상 업로드됨:", {
              id: newVideo.id,
              url: newVideo.url,
              order: newVideo.order,
              duration: durationString,
              originalDuration: duration,
            });
          }

          message.success("동영상이 업로드되었습니다.");
        } else {
          // duration이 유효하지 않은 경우 기본값으로 생성
          const newVideo = {
            id: `video_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            url: blobUrl,
            duration: "0:00",
            order: videos.length,
            originalFile: info.file.originFileObj,
          };

          setVideos((prev) => [...prev, newVideo]);
          message.success("동영상이 업로드되었습니다.");
        }
      };

      video.onerror = () => {
        clearTimeout(timeoutId); // 타임아웃 제거

        // 동영상 로드 실패 시 기본값으로 생성
        const newVideo = {
          id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: blobUrl,
          duration: "0:00",
          order: videos.length,
          originalFile: info.file.originFileObj,
        };

        setVideos((prev) => [...prev, newVideo]);
        message.success("동영상이 업로드되었습니다.");
      };

      video.src = blobUrl;
    }
  };

  // 동영상 제거
  const removeVideo = (index: number) => {
    setVideos((prev) => {
      const videoToRemove = prev[index];
      if (videoToRemove) {
        // Blob URL 해제
        URL.revokeObjectURL(videoToRemove.url);

        if (process.env.NODE_ENV === "development") {
          console.log("동영상 제거됨:", {
            id: videoToRemove.id,
            url: videoToRemove.url,
            index,
          });
        }
      }
      // 제거 후 순서 재정렬
      const filteredVideos = prev.filter((_, i) => i !== index);
      return filteredVideos.map((video, i) => ({ ...video, order: i }));
    });
  };

  // Blob URL 정리
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 모든 Blob URL 해제
      images.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
      videos.forEach((video) => {
        URL.revokeObjectURL(video.url);
      });
    };
  }, [images, videos]);

  // 동영상 미리보기 모달 상태 변경 감지
  useEffect(() => {
    if (
      previewModal.isOpen &&
      previewModal.type === "video" &&
      videoRef.current
    ) {
      // 모달이 열리고 동영상 타입일 때 동영상 요소 초기화
      const videoElement = videoRef.current;

      // 동영상 로드 완료 후 재생 준비
      const handleCanPlay = () => {
        if (process.env.NODE_ENV === "development") {
          console.log("동영상 재생 준비 완료:", {
            url: previewModal.url,
            index: previewModal.index,
            duration: videoElement.duration,
          });
        }
      };

      videoElement.addEventListener("canplay", handleCanPlay);

      return () => {
        videoElement.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [
    previewModal.isOpen,
    previewModal.type,
    previewModal.url,
    previewModal.index,
  ]);

  // videos 배열 변경 시 모달 상태 동기화
  useEffect(() => {
    if (previewModal.isOpen && previewModal.type === "video") {
      // 현재 모달에 표시된 동영상의 URL을 기반으로 새로운 인덱스 찾기
      const currentVideoUrl = previewModal.url;
      const newIndex = videos.findIndex(
        (video) => video.url === currentVideoUrl
      );

      if (newIndex !== -1 && newIndex !== previewModal.index) {
        // 인덱스가 변경된 경우 모달 상태 업데이트
        if (process.env.NODE_ENV === "development") {
          console.log("동영상 모달 인덱스 동기화:", {
            oldIndex: previewModal.index,
            newIndex: newIndex,
            url: currentVideoUrl,
          });
        }

        setPreviewModal((prev) => ({
          ...prev,
          index: newIndex,
        }));
      }
    }
  }, [
    videos,
    previewModal.isOpen,
    previewModal.type,
    previewModal.url,
    previewModal.index,
  ]);

  // 미리보기 모달 열기
  const openPreviewModal = (
    type: "image" | "video",
    url: string,
    index: number
  ) => {
    // 동영상의 경우 videos 배열에서 해당 URL을 가진 동영상의 실제 인덱스를 찾음
    let actualIndex = index;
    if (type === "video") {
      // 먼저 URL로 정확한 동영상 찾기
      const videoIndex = videos.findIndex((video) => video.url === url);

      if (videoIndex !== -1) {
        // URL로 찾은 경우 해당 인덱스 사용
        actualIndex = videoIndex;
      } else {
        // URL로 찾지 못한 경우 index 사용하되 범위 체크
        if (index >= 0 && index < videos.length) {
          actualIndex = index;
        } else {
          actualIndex = 0; // 기본값
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.log("동영상 모달 열기:", {
          requestedUrl: url,
          requestedIndex: index,
          actualIndex: actualIndex,
          videosCount: videos.length,
          foundVideo: videos[actualIndex],
        });
      }
    }

    setPreviewModal({
      isOpen: true,
      type,
      url,
      index: actualIndex,
    });
  };

  // 미리보기 모달 닫기
  const closePreviewModal = () => {
    // 동영상이 재생 중이면 정지
    if (videoRef.current && previewModal.type === "video") {
      videoRef.current.pause();
    }

    setPreviewModal({
      isOpen: false,
      type: "image",
      url: "",
      index: 0,
    });
  };

  // 이미지 순서 변경
  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages.map((img, index) => ({ ...img, order: index }));
    });
  };

  // 동영상 순서 변경
  const moveVideo = (fromIndex: number, toIndex: number) => {
    setVideos((prev) => {
      const newVideos = [...prev];
      const [movedVideo] = newVideos.splice(fromIndex, 1);
      newVideos.splice(toIndex, 0, movedVideo);
      // 순서만 업데이트하고 기존 객체와 URL은 유지
      const reorderedVideos = newVideos.map((video, index) => ({
        ...video,
        order: index,
      }));

      // 디버깅을 위한 로그 (개발 환경에서만)
      if (process.env.NODE_ENV === "development") {
        console.log("동영상 순서 변경:", {
          fromIndex,
          toIndex,
          videos: reorderedVideos.map((v) => ({
            id: v.id,
            url: v.url,
            order: v.order,
          })),
        });
      }

      // 모달 상태 동기화는 useEffect에서 처리됨

      return reorderedVideos;
    });
  };

  // 임시저장
  const handleSaveDraft = async () => {
    if (hasDraft) {
      // 기존 임시저장이 있는 경우 확인
      const confirmed = window.confirm(
        "이전 임시저장이 있습니다. 새로운 임시저장으로 덮어쓰시겠습니까?\n\n기존 임시저장 데이터는 유실됩니다."
      );
      if (!confirmed) return;
    }

    setIsSavingDraft(true);

    try {
      // TODO: 실제 API 호출로 임시저장
      await new Promise((resolve) => setTimeout(resolve, 500)); // 임시 딜레이

      setHasDraft(true);
      message.success("임시저장되었습니다.");
    } catch (error) {
      message.error("임시저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // 글 발행
  const handlePublish = async () => {
    if (!title.trim()) {
      message.error("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      message.error("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 실제 API 호출로 글 발행
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 임시 딜레이

      message.success("글이 발행되었습니다.");
      router.push("/profile"); // 프로필 페이지로 이동
    } catch (error) {
      message.error("글 발행에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 뒤로가기
  const handleBack = () => {
    if (title || content || images.length > 0) {
      // 내용이 있으면 확인 모달 표시
      if (window.confirm("작성 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

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
      {/* 글 작성 폼 */}
      <Card style={{ marginBottom: 24 }}>
        {/* 제목 입력 */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            제목
          </Text>
          <Input
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="large"
            style={{ fontSize: 18 }}
          />
        </div>

        {/* 내용 입력 */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            내용
          </Text>
          <TextArea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            style={{ fontSize: 16, resize: "none" }}
          />
        </div>

        {/* 이미지 업로드 */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            이미지
          </Text>
          <div style={{ marginBottom: 16 }}>
            <Upload
              accept="image/*"
              showUploadList={false}
              customRequest={({ file, onSuccess }: any) => {
                setTimeout(() => {
                  onSuccess("ok");
                }, 0);
              }}
              onChange={handleImageUpload}
            >
              <Button icon={<PictureOutlined />} size="large">
                이미지 추가
              </Button>
            </Upload>
          </div>

          {/* 업로드된 이미지 미리보기 */}
          {images.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 12,
              }}
            >
              {images.map((image, index) => (
                <div
                  key={image.id}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() => openPreviewModal("image", image.url, index)}
                >
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
                    <img
                      src={image.url}
                      alt={`이미지 ${index + 1}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>
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
                    {index + 1}번째 이미지
                  </div>
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
                      removeImage(index);
                    }}
                  >
                    ×
                  </Button>
                  {/* 순서 변경 버튼들 - 오른쪽 아래에 배치 */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      display: "flex",
                      gap: 4,
                    }}
                  >
                    {index > 0 && (
                      <Button
                        type="text"
                        size="small"
                        style={{
                          background: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          minWidth: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(index, index - 1);
                        }}
                      >
                        ↑
                      </Button>
                    )}
                    {index < images.length - 1 && (
                      <Button
                        type="text"
                        size="small"
                        style={{
                          background: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          minWidth: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(index, index + 1);
                        }}
                      >
                        ↓
                      </Button>
                    )}
                  </div>

                  {/* 원본 해상도 정보 표시 */}
                  {image.width && image.height && (
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
                      }}
                    >
                      {image.width} × {image.height}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 동영상 업로드 */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            동영상
          </Text>
          <div style={{ marginBottom: 16 }}>
            <Upload
              accept="video/*"
              showUploadList={false}
              customRequest={({ file, onSuccess }: any) => {
                setTimeout(() => {
                  onSuccess("ok");
                }, 0);
              }}
              onChange={handleVideoUpload}
            >
              <Button icon={<PlayCircleOutlined />} size="large">
                동영상 추가
              </Button>
            </Upload>
          </div>

          {/* 업로드된 동영상 미리보기 */}
          {videos.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  style={{
                    position: "relative",
                    aspectRatio: "16/9",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#f0f0f0",
                    cursor: "pointer",
                  }}
                  onClick={() => openPreviewModal("video", video.url, index)}
                >
                  <video
                    src={video.url}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
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
                    {index + 1}번째 동영상
                  </div>
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
                      removeVideo(index);
                    }}
                  >
                    ×
                  </Button>
                  {/* 순서 변경 버튼들 - 오른쪽 아래에 배치 */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      display: "flex",
                      gap: 4,
                    }}
                  >
                    {index > 0 && (
                      <Button
                        type="text"
                        size="small"
                        style={{
                          background: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          minWidth: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveVideo(index, index - 1);
                        }}
                      >
                        ↑
                      </Button>
                    )}
                    {index < videos.length - 1 && (
                      <Button
                        type="text"
                        size="small"
                        style={{
                          background: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          minWidth: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveVideo(index, index + 1);
                        }}
                      >
                        ↓
                      </Button>
                    )}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 4,
                      left: 4,
                      background: "rgba(0, 0, 0, 0.9)",
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      minWidth: "40px",
                      textAlign: "center",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {video.duration || "0:00"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* 설정 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            콘텐츠 설정
          </Title>

          {/* 멤버십 전용 설정 */}
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Text strong>멤버십 전용</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    허용한 경우, 멤버십 구독자만 볼 수 있습니다
                  </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Switch
                    checked={isMembershipOnly}
                    onChange={setIsMembershipOnly}
                    checkedChildren={<LockOutlined />}
                    unCheckedChildren={<UnlockOutlined />}
                  />
                  <Button
                    type="primary"
                    size="small"
                    onClick={openMembershipModal}
                  >
                    멤버십 추가
                  </Button>
                </div>
              </div>

              {/* 멤버십 레벨 선택 */}
              {isMembershipOnly && memberships.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    최소 멤버십 레벨
                  </Text>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {memberships.map((membership) => (
                      <MembershipCard
                        key={membership.id}
                        membership={membership}
                        selected={selectedMembershipLevel === membership.level}
                        showRadio={true}
                        onSelect={(membership) =>
                          setSelectedMembershipLevel(membership.level)
                        }
                      />
                    ))}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                    선택한 레벨 이상의 멤버십 구독자만 콘텐츠를 볼 수 있습니다
                  </Text>
                </div>
              )}
            </Space>
          </div>

          {/* 개별 구매 허용 설정 */}
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Text strong>개별 구매 허용</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    일회성 결제(언락 티켓)로 콘텐츠에 접근할 수 있습니다
                  </Text>
                </div>
                <Switch
                  checked={allowIndividualPurchase}
                  onChange={setAllowIndividualPurchase}
                />
              </div>
              {allowIndividualPurchase && (
                <div style={{ marginTop: 8 }}>
                  <InputNumber
                    min={0}
                    step={100}
                    placeholder="가격을 입력하세요"
                    value={purchasePrice}
                    suffix="원"
                    style={{ width: 200 }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) =>
                      Number(value!.replace(/\$\s?|(,*)/g, ""))
                    }
                    onChange={(value) => setPurchasePrice(Number(value))}
                  />
                </div>
              )}
            </Space>
          </div>

          {/* 댓글 설정 */}
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Text strong>댓글 허용</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    댓글 작성 상태를 허용합니다
                  </Text>
                </div>
                <Switch checked={allowComments} onChange={setAllowComments} />
              </div>
            </Space>
          </div>

          {/* 예약 발행 설정 */}
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Text strong>예약 발행</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    특정 날짜와 시간에 자동으로 발행됩니다
                  </Text>
                </div>
                <Switch
                  checked={scheduledPublish}
                  onChange={setScheduledPublish}
                />
              </div>
              {scheduledPublish && (
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <Input
                      type="date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                    />
                    <Input
                      type="time"
                      value={publishTime}
                      onChange={(e) => setPublishTime(e.target.value)}
                    />
                  </Space>
                </div>
              )}
            </Space>
          </div>

          {/* 민감한 콘텐츠 설정 */}
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Text strong>민감한 콘텐츠</Text>
                </div>
                <Switch
                  checked={sensitiveContent}
                  onChange={setSensitiveContent}
                />
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                폭력, 성적 내용 등이 포함된 경우 체크하세요
              </Text>
            </Space>
          </div>
        </div>

        <Divider style={{ margin: "32px 0" }} />

        {/* 임시저장 및 발행 버튼 */}
        <div style={{ display: "flex", gap: 16 }}>
          <Button
            type="default"
            icon={<SaveOutlined />}
            onClick={handleSaveDraft}
            loading={isSavingDraft}
            size="large"
            style={{ flex: 1, height: "48px", borderRadius: "24px" }}
          >
            임시저장
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handlePublish}
            loading={isSubmitting}
            disabled={!title.trim() || !content.trim()}
            size="large"
            style={{ flex: 1, height: "48px", borderRadius: "24px" }}
          >
            {scheduledPublish ? "예약 발행" : "발행"}
          </Button>
        </div>
      </Card>

      {/* 멤버십 관리 모달 */}
      <MembershipManagementModal
        open={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        onMembershipsUpdate={handleMembershipsUpdate}
        currentMemberships={memberships}
      />

      {/* 미디어 미리보기 모달 */}
      <Modal
        title={`${
          previewModal.type === "image" ? "이미지" : "동영상"
        } 미리보기`}
        open={previewModal.isOpen}
        onCancel={closePreviewModal}
        footer={null}
        width={800}
        style={{ top: 20 }}
        afterOpenChange={(open) => {
          // 모달이 열릴 때 동영상 소스 재설정
          if (open && previewModal.type === "video" && videoRef.current) {
            // 동영상 요소 초기화
            videoRef.current.pause();
            videoRef.current.currentTime = 0;

            // 현재 인덱스에 해당하는 동영상의 URL 가져오기
            const currentVideo = videos[previewModal.index];
            if (currentVideo && currentVideo.url) {
              videoRef.current.src = currentVideo.url;
              videoRef.current.load(); // 동영상 소스 강제 로드

              // 디버깅을 위한 로그
              if (process.env.NODE_ENV === "development") {
                console.log("동영상 모달 열림:", {
                  modalUrl: previewModal.url,
                  modalIndex: previewModal.index,
                  currentVideoUrl: currentVideo.url,
                  currentVideoIndex: previewModal.index,
                  videoElement: videoRef.current,
                });
              }
            } else {
              console.error("동영상을 찾을 수 없습니다:", {
                modalIndex: previewModal.index,
                videosCount: videos.length,
                videos: videos.map((v, i) => ({
                  index: i,
                  url: v.url,
                  id: v.id,
                })),
              });
            }
          }
        }}
      >
        <div style={{ textAlign: "center" }}>
          {previewModal.type === "image" ? (
            <img
              src={previewModal.url}
              alt={`${previewModal.type} ${previewModal.index + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "500px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          ) : (
            <video
              ref={videoRef}
              key={`${previewModal.url}-${previewModal.index}`} // URL과 인덱스를 모두 포함하여 고유한 키 생성
              src={previewModal.url}
              controls
              preload="metadata"
              onLoadedMetadata={() => {
                if (process.env.NODE_ENV === "development") {
                  console.log("동영상 메타데이터 로드됨:", {
                    url: previewModal.url,
                    index: previewModal.index,
                    duration: videoRef.current?.duration,
                  });
                }
              }}
              onError={(e) => {
                console.error("동영상 로드 오류:", {
                  url: previewModal.url,
                  index: previewModal.index,
                  error: e,
                });
              }}
              style={{
                maxWidth: "100%",
                maxHeight: "500px",
                borderRadius: "8px",
              }}
            />
          )}
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              {previewModal.type === "image" ? "이미지" : "동영상"}{" "}
              {previewModal.index + 1}
            </Text>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
