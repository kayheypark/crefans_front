import axios from "axios";
import { getApiUrl } from "@/utils/env";

export interface MediaMetadata {
  duration?: number;
  width?: number;
  height?: number;
  fileSize?: number;
  codec?: string;
}

export interface MediaVersions {
  "1080p"?: string;
  "720p"?: string;
  "480p"?: string;
}

export interface Media {
  id: string;
  userSub: string;
  mediaUrl: string;
  status: "uploading" | "processing" | "completed" | "failed";
  versions: MediaVersions;
  thumbnails: string[];
  metadata: MediaMetadata;
  createdAt: string;
  processedAt?: string;
}

export interface CreateMediaDto {
  fileName: string;
  contentType: string;
  fileSize?: number;
}

export interface PrepareUploadResponse {
  mediaId: string;
  uploadUrl: string;
  s3Key: string;
}

export interface ProcessingStatus {
  status: string;
  progress?: number;
}

export const mediaAPI = {
  // 업로드 준비
  prepareUpload: async (
    data: CreateMediaDto
  ): Promise<PrepareUploadResponse> => {
    const response = await axios.post(
      `${getApiUrl()}/media/prepare-upload`,
      data,
      { withCredentials: true }
    );
    return response.data.data;
  },

  // 업로드 완료 알림
  completeUpload: async (mediaId: string, s3Key: string): Promise<Media> => {
    const response = await axios.post(
      `${getApiUrl()}/media/complete-upload`,
      {
        mediaId,
        s3Key,
      },
      { withCredentials: true }
    );
    return response.data.data;
  },

  // 내 미디어 목록 조회
  getMyMedia: async (
    limit: number = 20,
    offset: number = 0
  ): Promise<Media[]> => {
    const response = await axios.get(
      `${getApiUrl()}/media/my-media`,
      {
        params: { limit, offset },
        withCredentials: true,
      }
    );
    return response.data.data;
  },

  // 특정 미디어 조회
  getMedia: async (mediaId: string): Promise<Media> => {
    const response = await axios.get(
      `${getApiUrl()}/media/${mediaId}`,
      { withCredentials: true }
    );
    return response.data.data;
  },

  // 처리 상태 조회
  getProcessingStatus: async (mediaId: string): Promise<ProcessingStatus> => {
    const response = await axios.get(
      `${getApiUrl()}/media/${mediaId}/status`,
      { withCredentials: true }
    );
    return response.data.data;
  },

  // 공개 미디어 조회 (게시글에서 사용)
  getPublicMedia: async (mediaId: string): Promise<Media> => {
    const response = await axios.get(
      `${getApiUrl()}/media/public/${mediaId}`
    );
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
  onProgress?: (progress: number) => void
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
