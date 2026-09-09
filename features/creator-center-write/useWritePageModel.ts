"use client";
import type { Feedback } from "@/types/presentation";

import { useCreatorGuard } from "@/hooks/useCreatorGuard";
import { mediaAPI } from "@/lib/api/media";
import { postingApi } from "@/lib/api/posting";
import { CreatePostingDto, PostingStatus } from "@/types/posting";
import type { UploadFile, UploadProps } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useWritePageModel({ message }: { message: Feedback }) {
  const router = useRouter();

  // 로그인 및 크리에이터 권한 필수
  const { isLoading, hasAccess } = useCreatorGuard({
    requiresLogin: true,
    requiresCreator: true,
  });

  const [form, setForm] = useState<CreatePostingDto>({
    title: "",
    content: "",
    status: PostingStatus.DRAFT,
    is_membership: false,
    membership_level: undefined,
    allow_individual_purchase: false,
    individual_purchase_price: undefined,
    is_public: true,
  });

  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [uploadedMediaIds, setUploadedMediaIds] = useState<string[]>([]);

  const handleInputChange = (field: keyof CreatePostingDto, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    setUploading(true);

    try {
      const result = await mediaAPI.uploadFile(file as File);

      if (result.success) {
        setUploadedMediaIds((prev) => [...prev, result.data.id]);
        onSuccess?.(result, file as File);
        message.success("파일이 성공적으로 업로드되었습니다.");
      } else {
        throw new Error(result.message || "업로드 실패");
      }
    } catch (error) {
      console.error("Upload error:", error);
      onError?.(error as Error);
      message.error("파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileListChange: UploadProps["onChange"] = (info) => {
    setFileList(info.fileList);

    // 파일이 제거된 경우, uploadedMediaIds에서도 제거
    const removedFiles = fileList.filter(
      (file) => !info.fileList.some((newFile) => newFile.uid === file.uid),
    );

    if (removedFiles.length > 0) {
      // 실제 구현에서는 서버의 미디어 ID를 추적해서 제거해야 함
      // 여기서는 간단히 전체를 다시 설정
      const currentMediaIds = info.fileList
        .filter((file) => file.status === "done" && file.response?.success)
        .map((file) => file.response.data.id);
      setUploadedMediaIds(currentMediaIds);
    }
  };

  const handleSubmit = async (publishNow: boolean = false) => {
    if (!form.title.trim()) {
      message.error("제목을 입력해주세요.");
      return;
    }

    if (!form.content.trim()) {
      message.error("내용을 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const postingData: CreatePostingDto = {
        ...form,
        status: publishNow ? PostingStatus.PUBLISHED : PostingStatus.DRAFT,
        media_ids: uploadedMediaIds,
      };

      const response = await postingApi.createPosting(postingData);

      if (response.success) {
        message.success(response.data.message);
        router.push("/creator-center?tab=posts");
      } else {
        message.error("포스팅 생성에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Create posting error:", error);
      message.error(error.message || "포스팅 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return {
    router,
    isLoading,
    hasAccess,
    form,
    loading,
    uploading,
    fileList,
    handleInputChange,
    handleUpload,
    handleFileListChange,
    handleSubmit,
  };
}
