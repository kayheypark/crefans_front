"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { CreatorCategory } from "@/features/creator-center-become-creator/types";
import { userAPI } from "@/lib/api/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useBecomeCreatorPageModel({
  message,
  form,
}: {
  message: Feedback;
  form: FormController;
}) {
  const { user, refreshUser } = useAuth();

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<CreatorCategory[]>([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // 카테고리 목록 조회
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await userAPI.getCreatorCategories();
      if (response.success) {
        setCategories(response.data);
      } else {
        message.error("카테고리 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("카테고리 조회 실패:", error);
      message.error("카테고리 목록을 불러오는데 실패했습니다.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 이미 크리에이터인 경우 리다이렉트
  useEffect(() => {
    if (user?.isCreator) {
      router.push("/creator-center");
    }
  }, [user?.isCreator, router]);

  // 크리에이터 전환 함수
  const handleBecomeCreator = async (values: { category_id: string }) => {
    setLoading(true);
    try {
      const response = await userAPI.becomeCreator(values.category_id);
      if (response.success) {
        message.success("크리에이터로 전환되었습니다!");
        await refreshUser();
        router.push("/creator-center");
      } else {
        message.error(response.message || "크리에이터 전환에 실패했습니다.");
      }
    } catch (error) {
      console.error("크리에이터 전환 실패:", error);
      message.error("크리에이터 전환에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return {
    router,
    form,
    loading,
    categories,
    categoriesLoading,
    handleBecomeCreator,
  };
}
