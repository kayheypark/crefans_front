"use client";
import type { Feedback } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api/auth";
import { userAPI } from "@/lib/api/user";
import {
  NICKNAME_VALIDATION_MESSAGE,
  validateHandle,
  validateNickname,
} from "@/lib/utils/validation";
import { ReportFormValues, UploadInfo } from "@/types/common";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useProfileEditModel({ message }: { message: Feedback }) {
  const { user, refreshUser } = useAuth();

  const router = useRouter();

  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 프로필 편집 관련 상태
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const [bio, setBio] = useState("");

  // 닉네임과 핸들 편집 상태
  const [tempNickname, setTempNickname] = useState("");

  const [tempHandle, setTempHandle] = useState("");

  const [isEditingNickname, setIsEditingNickname] = useState(false);

  const [isEditingHandle, setIsEditingHandle] = useState(false);

  // 로딩 상태
  const [isNicknameSaving, setIsNicknameSaving] = useState(false);

  const [isHandleSaving, setIsHandleSaving] = useState(false);

  const [isBioSaving, setIsBioSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setTempNickname(user.attributes.nickname || "");
      setTempHandle(user.attributes.preferred_username || "");
      setBio(user.profile?.bio || "");
    }
  }, [user]);

  const handleReport = (values: ReportFormValues) => {
    message.success("신고가 접수되었습니다.");
    setIsReportModalVisible(false);
  };

  // 커버 이미지 업로드 처리
  const handleBannerUpload = (info: UploadInfo) => {
    if (info.file.status === "done" && info.file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerImage(e.target?.result as string);
        message.success("커버 이미지가 업로드되었습니다.");
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // 프로필 사진 업로드 처리
  const handleProfileImageUpload = (info: UploadInfo) => {
    if (info.file.status === "done" && info.file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // 여기서 실제로는 API를 통해 프로필 사진을 업데이트해야 합니다
        message.success("프로필 사진이 업로드되었습니다.");
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // 소개글 저장
  const saveBio = async () => {
    console.log("Saving bio:", bio);
    setIsBioSaving(true);
    try {
      await userAPI.updateUserProfile(bio);
      message.success("소개글이 저장되었습니다.");
      await refreshUser();
    } catch (error: any) {
      console.error("Failed to save bio:", error);
      message.error(
        error.response?.data?.message || "소개글 저장에 실패했습니다.",
      );
    } finally {
      setIsBioSaving(false);
    }
  };

  // 닉네임 저장
  const saveNickname = async () => {
    if (!tempNickname.trim()) {
      message.error("닉네임을 입력해주세요.");
      return;
    }

    if (!validateNickname(tempNickname)) {
      message.error(NICKNAME_VALIDATION_MESSAGE);
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
      message.error(
        error.response?.data?.message || "닉네임 변경에 실패했습니다.",
      );
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

    // 클라이언트 측 검증 (백엔드 정책과 동일)
    const validation = validateHandle(tempHandle.trim());
    if (!validation.isValid) {
      message.error(validation.errors[0]);
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
      message.error(
        error.response?.data?.message || "핸들 변경에 실패했습니다.",
      );
    } finally {
      setIsHandleSaving(false);
    }
  };

  return {
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
  };
}
