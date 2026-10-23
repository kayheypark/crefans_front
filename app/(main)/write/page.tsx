"use client";
import { message as uiMessage } from "antd";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MediaGallery from "@/components/media/MediaGallery";
import MembershipManagementModal from "@/components/modals/MembershipManagementModal";
import { useWritePageModel } from "@/features/write/useWritePageModel";
import { LOADING_TEXTS } from "@/lib/constants/loadingTexts";
import Spacings from "@/lib/constants/spacings";
import { CustomUploadRequest } from "@/types/common";
import {
  CrownOutlined,
  LockOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SendOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Divider,
  Input,
  InputNumber,
  Layout,
  Radio,
  Space,
  Switch,
  Typography,
  Upload,
} from "antd";

const { Title, Text } = Typography;

const { TextArea } = Input;

export default function WritePage() {
  const model = useWritePageModel({ message: uiMessage });
  return <WritePageView model={model} />;
}

function WritePageView({
  model,
}: {
  model: ReturnType<typeof useWritePageModel>;
}) {
  const {
    isEditMode,
    isCreator,
    title,
    setTitle,
    content,
    setContent,
    images,
    videos,
    isMembershipOnly,
    setIsMembershipOnly,
    selectedMembershipLevel,
    setSelectedMembershipLevel,
    memberships,
    allowIndividualPurchase,
    setAllowIndividualPurchase,
    purchasePrice,
    setPurchasePrice,
    allowComments,
    setAllowComments,
    scheduledPublish,
    setScheduledPublish,
    publishDate,
    setPublishDate,
    publishTime,
    setPublishTime,
    sensitiveContent,
    setSensitiveContent,
    isSubmitting,
    isMembershipModalOpen,
    setIsMembershipModalOpen,
    isSavingDraft,
    isLoadingPost,
    isImageUploading,
    isVideoUploading,
    openMembershipModal,
    handleMembershipsUpdate,
    handleImageUpload,
    removeImage,
    handleVideoUpload,
    removeVideo,
    moveImage,
    moveVideo,
    handleSaveDraft,
    handleUpdate,
    handlePublish,
  } = model;

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
        {/* 로딩 상태 */}
        {isLoadingPost ? (
          <Card
            style={{
              marginBottom: 24,
              textAlign: "center",
              padding: "60px 20px",
            }}
          >
            <div style={{ fontSize: 16, color: "#666" }}>
              {isEditMode ? "게시글을 불러오는 중..." : "로딩 중..."}
            </div>
          </Card>
        ) : (
          <>
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
                    customRequest={({
                      file,
                      onSuccess,
                    }: CustomUploadRequest) => {
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
                    최대 1개 • mp4, mov, avi, mkv, webm • 최대 1080p • 최대
                    500MB
                  </Text>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Upload
                    accept="video/*"
                    showUploadList={false}
                    customRequest={({
                      file,
                      onSuccess,
                    }: CustomUploadRequest) => {
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
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
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
                              <div
                                key={membership.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "12px",
                                  border:
                                    selectedMembershipLevel === membership.level
                                      ? "2px solid #1890ff"
                                      : "1px solid #d9d9d9",
                                  borderRadius: "8px",
                                  backgroundColor:
                                    selectedMembershipLevel === membership.level
                                      ? "#f0f8ff"
                                      : "#fff",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  setSelectedMembershipLevel(membership.level)
                                }
                              >
                                <Radio
                                  name="membershipLevel"
                                  value={membership.level}
                                  checked={
                                    selectedMembershipLevel === membership.level
                                  }
                                  onChange={() =>
                                    setSelectedMembershipLevel(membership.level)
                                  }
                                  style={{ marginRight: 12 }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text strong style={{ fontSize: 16 }}>
                                      {membership.name}
                                    </Text>
                                    <Text
                                      style={{
                                        color: "#faad14",
                                        fontSize: 16,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {typeof membership.price === "string"
                                        ? parseFloat(membership.price) || 0
                                        : membership.price}
                                      원
                                    </Text>
                                  </div>
                                  {membership.description && (
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: 14, marginTop: 4 }}
                                    >
                                      {membership.description}
                                    </Text>
                                  )}
                                </div>
                              </div>
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
                            onChange={(value) =>
                              setPurchasePrice(Number(value))
                            }
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
                      <Switch
                        checked={allowComments}
                        onChange={setAllowComments}
                      />
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

              {/* 버튼 */}
              <div style={{ display: "flex", gap: 16 }}>
                {!isEditMode && (
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
                )}
                <Button
                  type="primary"
                  icon={isEditMode ? <SaveOutlined /> : <SendOutlined />}
                  onClick={isEditMode ? handleUpdate : handlePublish}
                  loading={isSubmitting}
                  disabled={!title.trim() || !content.trim()}
                  size="large"
                  style={{ flex: 1, height: "48px", borderRadius: "24px" }}
                >
                  {isEditMode
                    ? "수정 완료"
                    : isCreator && scheduledPublish
                      ? "예약 발행"
                      : "발행"}
                </Button>
              </div>
            </Card>
          </>
        )}

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
