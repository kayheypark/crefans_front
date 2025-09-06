"use client";

import React, { useState } from "react";
import Avatar from "antd/lib/avatar";
import Button from "antd/lib/button";
import Space from "antd/lib/space";
import Typography from "antd/lib/typography";
import Modal from "antd/lib/modal";
import Input from "antd/lib/input";
import message from "antd/lib/message";
import Upload from "antd/lib/upload";
import TextArea from "antd/lib/input/TextArea";
import ReportModal from "@/components/modals/ReportModal";
import LoginModal from "@/components/modals/LoginModal";
import {
  UserOutlined,
  ShareAltOutlined,
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import Spacings from "@/lib/constants/spacings";
import { Layout } from "antd";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api/auth";
import { LOADING_TEXTS } from "@/lib/constants/loadingTexts";

const { Title, Paragraph, Text } = Typography;

export default function ProfileEdit() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 프로필 편집 관련 상태
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [introduction, setIntroduction] = useState(
    "내 프로필과 콘텐츠들을 확인할 수 있습니다. 다양한 활동과 관심사를 공유하고 있습니다."
  );
  const [tempIntroduction, setTempIntroduction] = useState(introduction);
  
  // 닉네임과 핸들 편집 상태
  const [tempNickname, setTempNickname] = useState("");
  const [tempHandle, setTempHandle] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  
  // 로딩 상태
  const [isNicknameSaving, setIsNicknameSaving] = useState(false);
  const [isHandleSaving, setIsHandleSaving] = useState(false);

  const handleReport = (values: any) => {
    message.success("신고가 접수되었습니다.");
    setIsReportModalVisible(false);
  };

  // 커버 이미지 업로드 처리
  const handleBannerUpload = (info: any) => {
    if (info.file.status === "done") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerImage(e.target?.result as string);
        message.success("커버 이미지가 업로드되었습니다.");
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // 프로필 사진 업로드 처리
  const handleProfileImageUpload = (info: any) => {
    if (info.file.status === "done") {
      const reader = new FileReader();
      reader.onload = (e) => {
        // 여기서 실제로는 API를 통해 프로필 사진을 업데이트해야 합니다
        message.success("프로필 사진이 업로드되었습니다.");
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // 소개글 저장
  const saveIntroduction = () => {
    setIntroduction(tempIntroduction);
    message.success("소개글이 저장되었습니다.");
  };

  // 닉네임 저장
  const saveNickname = async () => {
    if (!tempNickname.trim()) {
      message.error("닉네임을 입력해주세요.");
      return;
    }
    
    setIsNicknameSaving(true);
    try {
      await authAPI.updateNickname(tempNickname.trim());
      message.success("닉네임이 변경되었습니다.");
      setIsEditingNickname(false);
      // 사용자 정보를 새로 가져와서 업데이트
      await refreshUser();
    } catch (error: any) {
      message.error(error.response?.data?.message || "닉네임 변경에 실패했습니다.");
    } finally {
      setIsNicknameSaving(false);
    }
  };

  // 핸들 저장
  const saveHandle = async () => {
    if (!tempHandle.trim()) {
      message.error("핸들을 입력해주세요.");
      return;
    }
    
    setIsHandleSaving(true);
    try {
      await authAPI.updateHandle(tempHandle.trim());
      message.success("핸들이 변경되었습니다.");
      setIsEditingHandle(false);
      // 사용자 정보를 새로 가져와서 업데이트
      await refreshUser();
    } catch (error: any) {
      message.error(error.response?.data?.message || "핸들 변경에 실패했습니다.");
    } finally {
      setIsHandleSaving(false);
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
            customRequest={({ file, onSuccess }: any) => {
              setTimeout(() => {
                onSuccess("ok");
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
              customRequest={({ file, onSuccess }: any) => {
                setTimeout(() => {
                  onSuccess("ok");
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <Input
                    value={tempNickname}
                    onChange={(e) => setTempNickname(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    style={{ fontSize: 18, fontWeight: "bold" }}
                    maxLength={20}
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
                    maxLength={30}
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
                        setTempHandle(user?.attributes?.preferred_username || "");
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
                value={tempIntroduction}
                onChange={(e) => setTempIntroduction(e.target.value)}
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
                  onClick={saveIntroduction}
                >
                  소개글 저장
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
