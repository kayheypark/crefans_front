"use client";

import React, { useState, useEffect } from "react";
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
  CrownOutlined,
} from "@ant-design/icons";

import { useRouter } from "next/navigation";
import Spacings from "@/lib/constants/spacings";
import MembershipManagementModal from "@/components/modals/MembershipManagementModal";
import MembershipCard from "@/components/common/MembershipCard";
import { MembershipItem } from "@/lib/api/membership";
import MediaGallery from "@/components/media/MediaGallery";
import { LOADING_TEXTS } from "@/lib/constants/loadingTexts";
import { mediaAPI, uploadWithProgress } from "@/lib/api/media";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { postingApi } from "@/lib/api/posting";
import { PostingStatus } from "@/types/posting";
import { membershipAPI } from "@/lib/api/membership";
import { UploadInfo, CustomUploadRequest } from "@/types/common";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function WritePage() {
  const router = useRouter();
  const { user } = useAuth();

  // 크리에이터 권한 확인
  const isCreator = user?.isCreator || false;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<
    {
      id: string;
      url: string; // 블로브 URL (미리보기용)
      s3Url: string; // AWS S3 URL (필수)
      order: number;
      width?: number; // 원본 이미지 너비
      height?: number; // 원본 이미지 높이
    }[]
  >([]);
  const [videos, setVideos] = useState<
    {
      id: string;
      url: string; // 블로브 URL (미리보기용)
      s3Url: string; // AWS S3 URL (필수)
      duration?: string;
      order: number;
      originalFile?: File; // 원본 파일 참조 추가
      processingStatus?: string; // 처리 상태
    }[]
  >([]);

  const [isMembershipOnly, setIsMembershipOnly] = useState(false);
  const [selectedMembershipLevel, setSelectedMembershipLevel] =
    useState<number>(1);
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);
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

  // 미디어 로딩 상태
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  // 크리에이터인 경우 페이지 로드 시 멤버십 목록 조회
  useEffect(() => {
    const loadMemberships = async () => {
      if (!isCreator) return;

      try {
        const response = await membershipAPI.getMemberships();
        if (response.success && response.data) {
          setMemberships(response.data);
          // 기본 선택 레벨 설정
          if (response.data.length > 0 && !selectedMembershipLevel) {
            setSelectedMembershipLevel(response.data[0].level);
          }
        }
      } catch (error) {
        console.error("멤버십 목록 조회 실패:", error);
        // 에러는 조용히 처리 (사용자가 멤버십이 없을 수 있음)
      }
    };

    loadMemberships();
  }, [isCreator]);

  // 멤버십 관리 모달 열기
  const openMembershipModal = () => {
    setIsMembershipModalOpen(true);
  };

  // 멤버십 업데이트 처리
  const handleMembershipsUpdate = (updatedMemberships: MembershipItem[]) => {
    setMemberships(updatedMemberships);
    // 선택된 레벨이 삭제된 경우 기본값으로 설정
    if (!updatedMemberships.find((m) => m.level === selectedMembershipLevel)) {
      setSelectedMembershipLevel(
        updatedMemberships.length > 0 ? updatedMemberships[0].level : 1
      );
    }
  };

  // 이미지 업로드 처리 (AWS S3 + 임시 블로브 URL)
  const handleImageUpload = async (info: UploadInfo) => {
    if (info.file.status === "done") {
      // 크레팬스 정책: 최대 10개 이미지 제한
      if (images.length >= 10) {
        message.error("이미지는 최대 10개까지 업로드할 수 있습니다.");
        return;
      }

      setIsImageUploading(true);

      try {
        const file = info.file.originFileObj;
        if (!file) {
          message.error("파일을 찾을 수 없습니다.");
          setIsImageUploading(false);
          return;
        }

        // 파일 크기 검증 (50MB)
        if (file.size > 50 * 1024 * 1024) {
          message.error("이미지 파일 크기는 50MB를 초과할 수 없습니다.");
          setIsImageUploading(false);
          return;
        }

        // AWS S3 업로드 (필수)
        // 1. AWS 업로드 준비
        const { mediaId, uploadUrl, s3Key } = await mediaAPI.prepareUpload({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        });

        // 2. S3에 직접 업로드
        await uploadWithProgress(uploadUrl, file, (progress) => {
          console.log(`이미지 업로드 진행률: ${progress}%`);
        });

        // 3. 업로드 완료 알림
        const media = await mediaAPI.completeUpload(mediaId, s3Key);
        const s3Url = media.mediaUrl;

        console.log("AWS 업로드 성공:", { mediaId, s3Url });

        // 4. 로컬 상태에 추가 (블로브 URL 사용 - 미리보기용)
        const blobUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
          const newImage = {
            id: mediaId,
            url: blobUrl, // 미리보기용 블로브 URL
            s3Url: s3Url, // AWS S3 URL (필수)
            order: images.length,
            width: img.naturalWidth,
            height: img.naturalHeight,
          };

          setImages((prev) => [...prev, newImage]);
          message.success("이미지가 업로드되었습니다.");
        };

        img.onerror = () => {
          const newImage = {
            id: mediaId,
            url: blobUrl,
            s3Url: s3Url,
            order: images.length,
            width: 0,
            height: 0,
          };

          setImages((prev) => [...prev, newImage]);
          message.success("이미지가 업로드되었습니다.");
        };

        img.src = blobUrl;
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        message.error("이미지 업로드에 실패했습니다.");
      } finally {
        setIsImageUploading(false);
      }
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

  // 동영상 업로드 처리 (AWS S3 + MediaConvert + 임시 블로브 URL)
  const handleVideoUpload = async (info: UploadInfo) => {
    if (info.file.status === "done") {
      // 크레팬스 정책: 최대 1개 동영상 제한
      if (videos.length >= 1) {
        message.error("동영상은 최대 1개까지 업로드할 수 있습니다.");
        return;
      }

      setIsVideoUploading(true);

      try {
        const file = info.file.originFileObj;
        if (!file) {
          message.error("파일을 찾을 수 없습니다.");
          setIsVideoUploading(false);
          return;
        }

        // 파일 크기 검증 (500MB)
        if (file.size > 500 * 1024 * 1024) {
          message.error("동영상 파일 크기는 500MB를 초과할 수 없습니다.");
          setIsVideoUploading(false);
          return;
        }

        // 4K 해상도 검증 함수
        const check4KResolution = (file: File): Promise<boolean> => {
          return new Promise((resolve) => {
            const video = document.createElement("video");
            const url = URL.createObjectURL(file);

            video.onloadedmetadata = () => {
              URL.revokeObjectURL(url);
              const is4K = video.videoWidth > 1920 || video.videoHeight > 1080;
              resolve(is4K);
            };

            video.onerror = () => {
              URL.revokeObjectURL(url);
              resolve(false); // 오류시 허용
            };

            video.src = url;
          });
        };

        // 4K 해상도 체크
        const is4K = await check4KResolution(file);
        if (is4K) {
          message.error(
            "동영상 최대 해상도는 1080p입니다. 4K 업로드는 지원하지 않습니다."
          );
          setIsVideoUploading(false);
          return;
        }

        // AWS S3 업로드 (필수)
        // 1. AWS 업로드 준비
        const { mediaId, uploadUrl, s3Key } = await mediaAPI.prepareUpload({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        });

        // 2. S3에 직접 업로드
        await uploadWithProgress(uploadUrl, file, (progress) => {
          console.log(`동영상 업로드 진행률: ${progress}%`);
        });

        // 3. 업로드 완료 알림 (MediaConvert 시작)
        const media = await mediaAPI.completeUpload(mediaId, s3Key);
        const s3Url = media.mediaUrl;
        const processingStatus = "processing"; // MediaConvert 처리 중

        console.log("AWS 동영상 업로드 성공, MediaConvert 시작:", {
          mediaId,
          s3Url,
        });

        // 4. 로컬 비디오로 메타데이터 추출 (미리보기용)
        const blobUrl = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";

        const timeoutId = setTimeout(() => {
          const newVideo = {
            id: mediaId,
            url: blobUrl, // 미리보기용 블로브 URL
            s3Url: s3Url, // AWS S3 URL (필수)
            duration: "0:00",
            order: videos.length,
            originalFile: file,
            processingStatus: processingStatus,
          };

          setVideos((prev) => [...prev, newVideo]);
          message.success("동영상이 업로드되었습니다. 처리 중입니다...");
        }, 5000);

        video.onloadedmetadata = () => {
          clearTimeout(timeoutId);

          const duration = video.duration;
          let durationString = "0:00";

          if (duration && !isNaN(duration) && duration > 0) {
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            durationString = `${minutes}:${seconds
              .toString()
              .padStart(2, "0")}`;
          }

          const newVideo = {
            id: mediaId,
            url: blobUrl, // 미리보기용 블로브 URL
            s3Url: s3Url, // AWS S3 URL (필수)
            duration: durationString,
            order: videos.length,
            originalFile: file,
            processingStatus: processingStatus,
          };

          setVideos((prev) => [...prev, newVideo]);
          message.success("동영상이 업로드되었습니다. 처리 중입니다...");
        };

        video.onerror = () => {
          clearTimeout(timeoutId);

          const newVideo = {
            id: mediaId,
            url: blobUrl, // 미리보기용 블로브 URL
            s3Url: s3Url, // AWS S3 URL (필수)
            duration: "0:00",
            order: videos.length,
            originalFile: file,
            processingStatus: processingStatus,
          };

          setVideos((prev) => [...prev, newVideo]);
          message.success("동영상이 업로드되었습니다. 처리 중입니다...");
        };

        video.src = blobUrl;
      } catch (error) {
        console.error("동영상 업로드 실패:", error);
        message.error("동영상 업로드에 실패했습니다.");
      } finally {
        setIsVideoUploading(false);
      }
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
    if (!title.trim() && !content.trim()) {
      message.error("제목이나 내용을 입력해주세요.");
      return;
    }

    if (hasDraft) {
      // 기존 임시저장이 있는 경우 확인
      const confirmed = window.confirm(
        "이전 임시저장이 있습니다. 새로운 임시저장으로 덮어쓰시겠습니까?\n\n기존 임시저장 데이터는 유실됩니다."
      );
      if (!confirmed) return;
    }

    setIsSavingDraft(true);

    try {
      // 업로드된 미디어 ID들 수집 (모든 미디어가 AWS S3에 업로드됨)
      const imageIds = images.map((img) => img.id);
      const videoIds = videos.map((video) => video.id);

      const media_ids = [...imageIds, ...videoIds];

      // 임시저장 데이터 구성
      const draftData = {
        title: title.trim(),
        content: content.trim(),
        status: PostingStatus.DRAFT,
        media_ids: media_ids.length > 0 ? media_ids : undefined,
        // 크리에이터 전용 기능들
        ...(isCreator && {
          is_membership: isMembershipOnly,
          membership_level: isMembershipOnly
            ? selectedMembershipLevel
            : undefined,
          allow_individual_purchase: allowIndividualPurchase,
          individual_purchase_price: allowIndividualPurchase
            ? purchasePrice
            : undefined,
          publish_start_at:
            scheduledPublish && publishDate && publishTime
              ? new Date(`${publishDate}T${publishTime}`).toISOString()
              : undefined,
          is_sensitive: sensitiveContent,
        }),
        is_public: true,
      };

      // API 호출
      const response = await postingApi.createPosting(draftData);

      if (response.success) {
        setHasDraft(true);
        message.success("임시저장되었습니다.");
      } else {
        throw new Error("임시저장에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("임시저장 오류:", error);
      const errorMessage =
        error.message || "임시저장에 실패했습니다. 다시 시도해주세요.";
      message.error(errorMessage);
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
      // 업로드된 미디어 ID들 수집 (모든 미디어가 AWS S3에 업로드됨)
      const imageIds = images.map((img) => img.id);
      const videoIds = videos.map((video) => video.id);

      const media_ids = [...imageIds, ...videoIds];

      // 포스팅 데이터 구성
      const postingData = {
        title: title.trim(),
        content: content.trim(),
        status: PostingStatus.PUBLISHED,
        media_ids: media_ids.length > 0 ? media_ids : undefined,
        // 크리에이터 전용 기능들
        ...(isCreator && {
          is_membership: isMembershipOnly,
          membership_level: isMembershipOnly
            ? selectedMembershipLevel
            : undefined,
          allow_individual_purchase: allowIndividualPurchase,
          individual_purchase_price: allowIndividualPurchase
            ? purchasePrice
            : undefined,
          publish_start_at:
            scheduledPublish && publishDate && publishTime
              ? new Date(`${publishDate}T${publishTime}`).toISOString()
              : undefined,
          is_sensitive: sensitiveContent,
        }),
        is_public: true, // 기본적으로 공개
      };

      // API 호출
      const response = await postingApi.createPosting(postingData);

      if (response.success) {
        message.success("글이 발행되었습니다.");

        // 현재 사용자의 프로필 페이지로 이동
        if (user?.attributes?.preferred_username) {
          router.push(`/@${user.attributes.preferred_username}`);
        } else {
          router.push("/profile");
        }
      } else {
        throw new Error("발행에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("글 발행 오류:", error);
      const errorMessage =
        error.message || "글 발행에 실패했습니다. 다시 시도해주세요.";
      message.error(errorMessage);
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
    <ProtectedRoute>
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Text strong>이미지</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                최대 10개 • jpg, png, gif, webp • 최대 50MB
              </Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Upload
                accept="image/*"
                showUploadList={false}
                customRequest={({ file, onSuccess }: CustomUploadRequest) => {
                  setTimeout(() => {
                    onSuccess?.("ok");
                  }, 0);
                }}
                onChange={handleImageUpload}
              >
                <Button
                  icon={<PictureOutlined />}
                  size="large"
                  loading={isImageUploading}
                  disabled={isImageUploading || images.length >= 10}
                >
                  {isImageUploading
                    ? LOADING_TEXTS.UPLOADING
                    : images.length >= 10
                    ? "이미지 최대 개수 도달"
                    : "이미지 추가"}
                </Button>
              </Upload>
            </div>

            {/* 업로드된 이미지 미리보기 */}
            {images.length > 0 && (
              <MediaGallery
                items={images.map((img) => ({
                  ...img,
                  type: "image" as const,
                }))}
                onRemove={removeImage}
                onReorder={moveImage}
                isLoading={isImageUploading}
                gridCols={3}
              />
            )}
          </div>

          {/* 동영상 업로드 */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Text strong>동영상</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                최대 1개 • mp4, mov, avi, mkv, webm • 최대 1080p • 최대 500MB
              </Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Upload
                accept="video/*"
                showUploadList={false}
                customRequest={({ file, onSuccess }: CustomUploadRequest) => {
                  setTimeout(() => {
                    onSuccess?.("ok");
                  }, 0);
                }}
                onChange={handleVideoUpload}
              >
                <Button
                  icon={<PlayCircleOutlined />}
                  size="large"
                  loading={isVideoUploading}
                  disabled={isVideoUploading || videos.length >= 1}
                >
                  {isVideoUploading
                    ? LOADING_TEXTS.UPLOADING
                    : videos.length >= 1
                    ? "동영상 최대 개수 도달"
                    : "동영상 추가"}
                </Button>
              </Upload>
            </div>

            {/* 업로드된 동영상 미리보기 */}
            {videos.length > 0 && (
              <MediaGallery
                items={videos.map((video) => ({
                  ...video,
                  type: "video" as const,
                }))}
                onRemove={removeVideo}
                onReorder={moveVideo}
                isLoading={isVideoUploading}
                gridCols={2}
              />
            )}
          </div>

          <Divider />

          {/* 설정 */}
          <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ marginBottom: 16 }}>
              콘텐츠 설정
            </Title>

            {/* 멤버십 전용 설정 - 크리에이터만 접근 가능 */}
            {isCreator && (
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
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
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
                        icon={<CrownOutlined />}
                      >
                        멤버십 관리
                      </Button>
                    </div>
                  </div>

                  {/* 멤버십 레벨 선택 */}
                  {isMembershipOnly && memberships.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: 8 }}
                      >
                        최소 멤버십 레벨
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {memberships.map((membership) => (
                          <MembershipCard
                            key={membership.id}
                            membership={{
                              ...membership,
                              // price를 number로 변환
                              price: typeof membership.price === 'string' ? parseFloat(membership.price) || 0 : membership.price,
                              // benefits를 안전하게 배열로 변환
                              benefits: Array.isArray(membership.benefits)
                                ? membership.benefits
                                : membership.benefits
                                ? membership.benefits
                                    .split(",")
                                    .map((b) => b.trim())
                                : [],
                            }}
                            selected={
                              selectedMembershipLevel === membership.level
                            }
                            showRadio={true}
                            onSelect={(membership) =>
                              setSelectedMembershipLevel(membership.level)
                            }
                          />
                        ))}
                      </div>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, marginTop: 8 }}
                      >
                        선택한 레벨 이상의 멤버십 구독자만 콘텐츠를 볼 수
                        있습니다
                      </Text>
                    </div>
                  )}
                </Space>
              </div>
            )}

            {/* 개별 구매 허용 설정 - 크리에이터만 접근 가능 */}
            {isCreator && (
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
            )}

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

            {/* 예약 발행 설정 - 크리에이터만 접근 가능 */}
            {isCreator && (
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
            )}

            {/* 민감한 콘텐츠 설정 - 크리에이터만 접근 가능 */}
            {isCreator && (
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
            )}
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
              {isCreator && scheduledPublish ? "예약 발행" : "발행"}
            </Button>
          </div>
        </Card>

        {/* 멤버십 관리 모달 - 크리에이터만 접근 가능 */}
        {isCreator && (
          <MembershipManagementModal
            open={isMembershipModalOpen}
            onClose={() => setIsMembershipModalOpen(false)}
            onMembershipsUpdate={handleMembershipsUpdate}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
}
