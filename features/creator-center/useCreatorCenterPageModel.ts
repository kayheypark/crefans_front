"use client";
import type { Feedback } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { useCreatorGuard } from "@/hooks/useCreatorGuard";
import { postingApi } from "@/lib/api/posting";
import { userAPI } from "@/lib/api/user";
import { PostingResponse } from "@/types/posting";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// 목업 데이터
const mockStats = {
  totalEarnings: 1250000,
  monthlyEarnings: 180000,
  totalMembers: 245,
  totalDonations: 320000,
  growthRate: 12.5,
  topEarningMonth: "2024년 1월",
};

const mockRecentEarnings = [
  {
    id: 1,
    type: "membership",
    amount: 50000,
    member: "김크리에이터",
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: 2,
    type: "donation",
    amount: 25000,
    member: "이후원자",
    date: "2024-01-14",
    status: "completed",
  },
  {
    id: 3,
    type: "membership",
    amount: 30000,
    member: "박구독자",
    date: "2024-01-13",
    status: "completed",
  },
];
export function useCreatorCenterPageModel({ message }: { message: Feedback }) {
  const { user, refreshUser } = useAuth();

  const router = useRouter();

  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "dashboard";

  // 로그인 필수, 크리에이터 권한은 필요 없음 (홈은 누구나 접근 가능)
  const { isLoading, hasAccess } = useCreatorGuard({
    requiresLogin: true,
    requiresCreator: false,
  });

  const [loading, setLoading] = useState(false);

  const [postings, setPostings] = useState<PostingResponse[]>([]);

  const [postingsLoading, setPostingsLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 탭 변경 함수
  const handleTabChange = (key: string) => {
    router.push(`/creator-center?tab=${key}`);
  };

  // 크리에이터 전환 함수
  const handleBecomeCreator = async () => {
    setLoading(true);
    try {
      // TODO: 카테고리 선택 UI 구현 필요, 임시로 기본값 사용
      const response = await userAPI.becomeCreator("default-category-id");
      if (response.success) {
        message.success("크리에이터로 전환되었습니다!");
        await refreshUser();
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

  // 포스팅 목록 조회
  const fetchPostings = async (page: number = 1, pageSize: number = 10) => {
    setPostingsLoading(true);
    try {
      const response = await postingApi.getMyPostings({
        page,
        limit: pageSize,
      });

      if (response.success) {
        setPostings(response.data.postings);
        setPagination({
          current: response.data.page,
          pageSize: response.data.limit,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error("포스팅 목록 조회 실패:", error);
    } finally {
      setPostingsLoading(false);
    }
  };

  // 포스팅 삭제
  const handleDeletePosting = async (id: string) => {
    try {
      await postingApi.deletePosting(id);
      fetchPostings(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("포스팅 삭제 실패:", error);
    }
  };

  // 포스팅 탭 활성화 시 데이터 로드
  useEffect(() => {
    if (user?.isCreator && activeTab === "posts") {
      fetchPostings();
    }
  }, [user?.isCreator, activeTab]);

  return {
    mockStats,
    mockRecentEarnings,
    user,
    router,
    activeTab,
    postings,
    postingsLoading,
    pagination,
    handleTabChange,
    fetchPostings,
    handleDeletePosting,
  };
}
