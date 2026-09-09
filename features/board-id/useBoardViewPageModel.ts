"use client";
import type { Feedback } from "@/types/presentation";

import { useResponsive } from "@/hooks/useResponsive";
import { boardApi, BoardPost } from "@/lib/api/board";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useBoardViewPageModel({ message }: { message: Feedback }) {
  const router = useRouter();

  const params = useParams();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const postId = params.id as string;

  const [post, setPost] = useState<BoardPost | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // 게시글 상세 데이터 로드
  useEffect(() => {
    const loadPostDetail = async () => {
      try {
        setLoading(true);
        const response = await boardApi.getPost(postId);

        if (response.success) {
          setPost(response.data);
          // 조회수 증가
          try {
            await boardApi.incrementViews(postId);
          } catch (viewError) {
            console.warn("조회수 증가 실패:", viewError);
          }
        } else {
          setError("게시글을 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("게시글 상세를 불러오는데 실패했습니다:", error);
        setError("게시글을 불러오는데 실패했습니다.");
        message.error("게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPostDetail();
    }
  }, [postId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 없음";

    try {
      const date = new Date(dateString);

      // Invalid Date 체크
      if (isNaN(date.getTime())) {
        return "날짜 형식 오류";
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 오류";
    }
  };

  // 카테고리 한글 변환 함수
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      NOTICE: "공지사항",
      notice: "공지사항",
      EVENT: "이벤트",
      event: "이벤트",
    };
    return categoryMap[category] || category;
  };

  // 카테고리 색상 반환 함수
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      NOTICE: "blue",
      notice: "blue",
      EVENT: "green",
      event: "green",
    };
    return colorMap[category] || "default";
  };

  return {
    isMobile,
    post,
    loading,
    error,
    formatDate,
    getCategoryLabel,
    getCategoryColor,
  };
}
