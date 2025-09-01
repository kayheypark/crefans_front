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

const { Title, Paragraph, Text } = Typography;

export default function ProfileEdit() {
  const { user } = useAuth();
  const router = useRouter();
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 프로필 편집 관련 상태
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [introduction, setIntroduction] = useState(
    "내 프로필과 콘텐츠들을 확인할 수 있습니다. 다양한 활동과 관심사를 공유하고 있습니다."
  );
  const [tempIntroduction, setTempIntroduction] = useState(introduction);

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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text
                strong
                style={{
                  fontSize: 20,
                  color: "#222",
                }}
              >
                {user?.attributes?.nickname || "-"}
              </Text>
            </div>
            <Text
              type="secondary"
              style={{
                fontSize: 16,
                color: "#8c8c8c",
                marginBottom: 4,
                display: "block",
              }}
            >
              {user?.attributes?.preferred_username
                ? "@" + user.attributes.preferred_username
                : "@-"}
            </Text>

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
