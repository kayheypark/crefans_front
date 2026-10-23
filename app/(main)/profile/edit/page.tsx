"use client";
import { message as uiMessage } from "antd";

import LoginModal from "@/components/modals/LoginModal";
import ReportModal from "@/components/modals/ReportModal";
import { useProfileEditModel } from "@/features/profile-edit/useProfileEditModel";
import { LOADING_TEXTS } from "@/lib/constants/loadingTexts";
import Spacings from "@/lib/constants/spacings";
import { CustomUploadRequest } from "@/types/common";
import { SaveOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import Avatar from "antd/lib/avatar";
import Button from "antd/lib/button";
import Input from "antd/lib/input";
import TextArea from "antd/lib/input/TextArea";
import Space from "antd/lib/space";
import Typography from "antd/lib/typography";
import Upload from "antd/lib/upload";

const { Title, Paragraph, Text } = Typography;

export default function ProfileEdit() {
  const model = useProfileEditModel({ message: uiMessage });
  return <ProfileEditView model={model} />;
}

function ProfileEditView({
  model,
}: {
  model: ReturnType<typeof useProfileEditModel>;
}) {
  const {
    user,
    isReportModalVisible,
    setIsReportModalVisible,
    isLoginModalOpen,
    setIsLoginModalOpen,
    bannerImage,
    bio,
    setBio,
    tempNickname,
    setTempNickname,
    tempHandle,
    setTempHandle,
    isEditingNickname,
    setIsEditingNickname,
    isEditingHandle,
    setIsEditingHandle,
    isNicknameSaving,
    isHandleSaving,
    isBioSaving,
    handleReport,
    handleBannerUpload,
    handleProfileImageUpload,
    saveBio,
    saveNickname,
    saveHandle,
  } = model;

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
      {/* 커버 이미지 */}
      <div
        style={{
          width: "100%",
          height: 200,
          background: bannerImage ? `url(${bannerImage})` : "#f0f0f0",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          marginBottom: 16,
        }}
      >
        {!bannerImage && (
          <div style={{ color: "#999", fontSize: 14 }}>커버 이미지</div>
        )}

        {/* 커버 이미지 변경 버튼 */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        >
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={({ file, onSuccess }: CustomUploadRequest) => {
              setTimeout(() => {
                onSuccess?.("ok");
              }, 0);
            }}
            onChange={handleBannerUpload}
          >
            <Button type="primary" icon={<UploadOutlined />} size="middle">
              커버 이미지 업로드
            </Button>
          </Upload>
        </div>
      </div>

      {/* 프로필 정보 - 편집 가능한 상태 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 24,
          position: "relative",
        }}
      >
        <div style={{ position: "relative" }}>
          <Avatar
            size={80}
            src={user?.attributes?.picture || "/profile-90.png"}
            icon={<UserOutlined />}
          />
          {/* 프로필 사진 업로드 버튼 */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
          >
            <Upload
              accept="image/*"
              showUploadList={false}
              customRequest={({ file, onSuccess }: CustomUploadRequest) => {
                setTimeout(() => {
                  onSuccess?.("ok");
                }, 0);
              }}
              onChange={handleProfileImageUpload}
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                size="small"
                shape="circle"
                style={{
                  width: 28,
                  height: 28,
                  minWidth: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </Upload>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            {/* 닉네임 편집 영역 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              {isEditingNickname ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flex: 1,
                  }}
                >
                  <Input
                    value={tempNickname}
                    onChange={(e) => setTempNickname(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    style={{ fontSize: 18, fontWeight: "bold" }}
                    maxLength={10}
                  />
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={saveNickname}
                      loading={isNicknameSaving}
                      disabled={isNicknameSaving}
                    >
                      {isNicknameSaving ? LOADING_TEXTS.SAVING : "저장"}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setTempNickname(user?.attributes?.nickname || "");
                        setIsEditingNickname(false);
                      }}
                    >
                      취소
                    </Button>
                  </Space>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text
                    strong
                    style={{
                      fontSize: 20,
                      color: "#222",
                    }}
                  >
                    {user?.attributes?.nickname || "-"}
                  </Text>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setTempNickname(user?.attributes?.nickname || "");
                      setIsEditingNickname(true);
                    }}
                  >
                    편집
                  </Button>
                </div>
              )}
            </div>

            {/* 핸들 편집 영역 */}
            <div style={{ marginBottom: 8 }}>
              {isEditingHandle ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 16, color: "#8c8c8c" }}>@</Text>
                  <Input
                    value={tempHandle}
                    onChange={(e) => setTempHandle(e.target.value)}
                    placeholder="핸들을 입력하세요"
                    style={{ fontSize: 16 }}
                    maxLength={15}
                  />
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={saveHandle}
                      loading={isHandleSaving}
                      disabled={isHandleSaving}
                    >
                      {isHandleSaving ? LOADING_TEXTS.SAVING : "저장"}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setTempHandle(
                          user?.attributes?.preferred_username || "",
                        );
                        setIsEditingHandle(false);
                      }}
                    >
                      취소
                    </Button>
                  </Space>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 16,
                      color: "#8c8c8c",
                    }}
                  >
                    {user?.attributes?.preferred_username
                      ? "@" + user.attributes.preferred_username
                      : "@-"}
                  </Text>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setTempHandle(user?.attributes?.preferred_username || "");
                      setIsEditingHandle(true);
                    }}
                  >
                    편집
                  </Button>
                </div>
              )}
            </div>

            {/* 편집 가능한 소개글 */}
            <div style={{ marginBottom: 16 }}>
              <TextArea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                style={{ marginBottom: 8 }}
                placeholder="소개글을 입력하세요"
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={saveBio}
                  loading={isBioSaving}
                  disabled={isBioSaving}
                >
                  {isBioSaving ? LOADING_TEXTS.SAVING : "소개글 저장"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 신고하기 모달 */}
      <ReportModal
        open={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        onSubmit={handleReport}
      />

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </Layout>
  );
}
