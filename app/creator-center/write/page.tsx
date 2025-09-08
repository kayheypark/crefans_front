"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Select,
  Card,
  message,
  Switch,
  DatePicker,
  Upload,
  Space,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { postingApi } from "@/lib/api/posting";
import { CreatePostingDto, PostingStatus } from "@/types/posting";
import { useCreatorGuard } from "@/hooks/useCreatorGuard";

const { Option } = Select;

export default function WritePage() {
  const router = useRouter();
  
  // 로그인 및 크리에이터 권한 필수
  const { isLoading, hasAccess } = useCreatorGuard({ 
    requiresLogin: true, 
    requiresCreator: true 
  });

  // 권한이 없으면 로딩 표시 또는 리다이렉트 처리
  if (isLoading || !hasAccess) {
    return <div>Loading...</div>;
  }
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
      const formData = new FormData();
      formData.append("file", file as File);

      // 미디어 업로드 API 호출
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/media/upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("파일 업로드에 실패했습니다.");
      }

      const result = await response.json();

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
      (file) => !info.fileList.some((newFile) => newFile.uid === file.uid)
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

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>업로드</div>
    </div>
  );

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 포스팅 작성</h1>
        <p className="text-gray-600 mt-2">
          팬들과 소통할 콘텐츠를 작성해보세요.
        </p>
      </div>

      <Card className="mb-6">
        <div className="space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <Input
              size="large"
              placeholder="포스팅 제목을 입력하세요"
              value={form.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              maxLength={100}
              showCount
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <Input.TextArea
              placeholder="포스팅 내용을 입력하세요"
              value={form.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              rows={10}
              maxLength={5000}
              showCount
            />
          </div>

          {/* 미디어 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              미디어 첨부
            </label>
            <Upload
              listType="picture-card"
              fileList={fileList}
              customRequest={handleUpload}
              onChange={handleFileListChange}
              multiple
              accept="image/*,video/*"
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                const isVideo = file.type.startsWith("video/");

                if (!isImage && !isVideo) {
                  message.error("이미지 또는 비디오 파일만 업로드 가능합니다.");
                  return false;
                }

                const isLt50M = file.size / 1024 / 1024 < 50;
                if (!isLt50M) {
                  message.error("파일 크기는 50MB 이하여야 합니다.");
                  return false;
                }

                return true;
              }}
            >
              {fileList.length >= 10 ? null : uploadButton}
            </Upload>
            <p className="text-sm text-gray-500 mt-2">
              최대 10개의 파일을 업로드할 수 있습니다. (이미지, 비디오 지원,
              50MB 이하)
            </p>
          </div>

          {/* 멤버십 설정 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  멤버십 전용 콘텐츠
                </h3>
                <p className="text-sm text-gray-600">
                  이 포스팅을 멤버십 구독자만 볼 수 있도록 설정
                </p>
              </div>
              <Switch
                checked={form.is_membership}
                onChange={(checked) =>
                  handleInputChange("is_membership", checked)
                }
              />
            </div>

            {form.is_membership && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  멤버십 레벨
                </label>
                <Select
                  style={{ width: 200 }}
                  placeholder="레벨 선택"
                  value={form.membership_level}
                  onChange={(value) =>
                    handleInputChange("membership_level", value)
                  }
                >
                  <Option value={1}>레벨 1</Option>
                  <Option value={2}>레벨 2</Option>
                  <Option value={3}>레벨 3</Option>
                  <Option value={4}>레벨 4</Option>
                  <Option value={5}>레벨 5</Option>
                </Select>
              </div>
            )}
          </div>

          {/* 개별 구매 설정 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  개별 구매 허용
                </h3>
                <p className="text-sm text-gray-600">
                  일회성 결제로 콘텐츠에 접근할 수 있도록 설정
                </p>
              </div>
              <Switch
                checked={form.allow_individual_purchase}
                onChange={(checked) =>
                  handleInputChange("allow_individual_purchase", checked)
                }
              />
            </div>

            {form.allow_individual_purchase && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  개별 구매 가격
                </label>
                <Input
                  type="number"
                  style={{ width: 200 }}
                  placeholder="가격 입력"
                  suffix="원"
                  value={form.individual_purchase_price}
                  onChange={(e) =>
                    handleInputChange(
                      "individual_purchase_price",
                      Number(e.target.value)
                    )
                  }
                />
              </div>
            )}
          </div>

          {/* 공개 설정 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">공개 설정</h3>
                <p className="text-sm text-gray-600">
                  비공개 시 링크를 통해서만 접근 가능
                </p>
              </div>
              <Switch
                checked={form.is_public}
                onChange={(checked) => handleInputChange("is_public", checked)}
                checkedChildren="공개"
                unCheckedChildren="비공개"
              />
            </div>
          </div>

          {/* 예약 발행 설정 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              발행 일정
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공개 시작 일시
                </label>
                <DatePicker
                  showTime
                  placeholder="선택하지 않으면 즉시 공개"
                  style={{ width: "100%" }}
                  onChange={(date, dateString) =>
                    handleInputChange(
                      "publish_start_at",
                      dateString || undefined
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공개 종료 일시
                </label>
                <DatePicker
                  showTime
                  placeholder="무제한"
                  style={{ width: "100%" }}
                  onChange={(date, dateString) =>
                    handleInputChange("publish_end_at", dateString || undefined)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex justify-between">
        <Button size="large" onClick={() => router.back()}>
          취소
        </Button>
        <Space size="middle">
          <Button
            type="default"
            size="large"
            loading={loading}
            onClick={() => handleSubmit(false)}
          >
            임시저장
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={() => handleSubmit(true)}
          >
            발행하기
          </Button>
        </Space>
      </div>
    </div>
  );
}
