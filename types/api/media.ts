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
