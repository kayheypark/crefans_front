import type {
  CreateMediaDto,
  Media,
  PrepareUploadResponse,
  ProcessingStatus,
} from "@/types/api/media";
import { apiClient } from "./client";
export type {
  CreateMediaDto,
  Media,
  MediaMetadata,
  MediaVersions,
  PrepareUploadResponse,
  ProcessingStatus,
} from "@/types/api/media";

export const mediaAPI = {
  async uploadFile(
    file: File,
  ): Promise<{ success: boolean; data: { id: string }; message?: string }> {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.post("/media/upload", body);
    return response.data;
  },
  // 업로드 준비
  prepareUpload: async (
    data: CreateMediaDto,
  ): Promise<PrepareUploadResponse> => {
    const response = await apiClient.post(`/media/prepare-upload`, data, {
      withCredentials: true,
    });
    return response.data.data;
  },

  // 업로드 완료 알림
  completeUpload: async (mediaId: string, s3Key: string): Promise<Media> => {
    const response = await apiClient.post(
      `/media/complete-upload`,
      {
        mediaId,
        s3Key,
      },
      { withCredentials: true },
    );
    return response.data.data;
  },

  // 내 미디어 목록 조회
  getMyMedia: async (
    limit: number = 20,
    offset: number = 0,
  ): Promise<Media[]> => {
    const response = await apiClient.get(`/media/my-media`, {
      params: { limit, offset },
      withCredentials: true,
    });
    return response.data.data;
  },

  // 특정 미디어 조회
  getMedia: async (mediaId: string): Promise<Media> => {
    const response = await apiClient.get(`/media/${mediaId}`, {
      withCredentials: true,
    });
    return response.data.data;
  },

  // 처리 상태 조회
  getProcessingStatus: async (mediaId: string): Promise<ProcessingStatus> => {
    const response = await apiClient.get(`/media/${mediaId}/status`, {
      withCredentials: true,
    });
    return response.data.data;
  },

  // S3에 직접 업로드
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
  },
};

// 업로드 진행률 추적을 위한 헬퍼
export const uploadWithProgress = (
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed"));
    };

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
};
