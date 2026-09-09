"use client";
import type { Feedback } from "@/types/presentation";

import { demoAPI } from "@/lib/api/demo";

import { useAuth } from "@/contexts/AuthContext";
import { MainLayoutProps } from "@/features/main-layout/types";
import { useResponsive } from "@/hooks/useResponsive";
import { useWallet } from "@/hooks/useWallet";
import { authAPI } from "@/lib/api/auth";
import { followApi, type FollowUser } from "@/lib/api/follow";
import { subscriptionBillingAPI } from "@/lib/api/subscriptionBilling";
import { formatRelativeDate } from "@/lib/utils/dateUtils";
import { FollowCreator, MembershipCreator, Notification } from "@/types/common";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useMainLayoutModel(
  { children }: MainLayoutProps,
  { message }: { message: Feedback },
) {
  const { user, logout } = useAuth();

  const router = useRouter();

  const searchParams = useSearchParams();

  const pathname = usePathname();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const {
    wallets,
    getTokenAmount,
    loading: walletLoading,
    refetch: refetchWallet,
  } = useWallet();

  const [selectedMenu, setSelectedMenu] = useState<string>(() => {
    if (pathname === "/" || pathname === "/home") return "home";
    if (pathname === "/feed") return "feed";
    if (pathname === "/explore") return "explore";
    if (pathname === "/search") return "search";
    return "home";
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [notificationDateType, setNotificationDateType] = useState<{
    [key: string]: boolean;
  }>({});

  const [membershipCreators, setMembershipCreators] = useState<
    MembershipCreator[]
  >([]);

  const [followCreators, setFollowCreators] = useState<FollowCreator[]>([]);

  const [openGroups, setOpenGroups] = useState({
    membership: true,
    follow: true,
  });

  const [activeSearchTab, setActiveSearchTab] = useState<
    "creators" | "posts" | "photos" | "videos"
  >("creators");

  const [searchPage, setSearchPage] = useState({
    creators: 1,
    posts: 1,
    photos: 1,
    videos: 1,
  });

  const [activeNotificationTab, setActiveNotificationTab] = useState("all");

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [showChargeModal, setShowChargeModal] = useState(false);

  const [openMenuKeys, setOpenMenuKeys] = useState<string[]>([
    "membershipGroup",
    "followGroup",
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  // 클라이언트 마운트 후 로컬스토리지에서 상태 불러오기
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar_open_keys");
      if (stored) {
        setOpenMenuKeys(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("로컬스토리지 불러오기 실패:", error);
    }
  }, []);

  useEffect(() => {
    // 알림 mock 데이터 fetch
    demoAPI.getNotifications().then((apiResponse) => {
      setNotifications(apiResponse.data);
      setUnreadNotifications(apiResponse.data.length);
    });

    // 사용자가 로그인한 경우에만 구독/팔로우 데이터 fetch
    if (user) {
      // 구독 중인 멤버십 조회 (billing API 사용)
      subscriptionBillingAPI
        .getMyBillingSubscriptions()
        .then((apiResponse) => {
          if (apiResponse.success && apiResponse.data) {
            console.log("Subscription Billing API Response:", apiResponse.data);

            // 서버 응답 구조에 맞게 수정: data는 직접 배열
            const subscriptions = Array.isArray(apiResponse.data)
              ? apiResponse.data
              : [];

            const membershipCreators = subscriptions
              .filter((sub) => sub.isActive) // 활성 구독만 표시
              .map((sub) => ({
                key: sub.creatorId,
                name: sub.membershipName,
                price: sub.amount,
                membershipType: sub.membershipName,
                creatorHandle: sub.creator.handle,
                unread: false,
              }));

            setMembershipCreators(membershipCreators);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch billing subscriptions:", error);
          setMembershipCreators([]);
        });

      // 팔로우 중인 사용자 조회
      followApi
        .getMyFollowing()
        .then((apiResponse) => {
          if (apiResponse.success && apiResponse.data?.items) {
            setFollowCreators(
              apiResponse.data.items.map((follow: FollowUser) => ({
                key: follow.userId,
                nickname: follow.nickname,
                avatar: follow.avatar,
                handle: follow.handle,
                unread: false,
              })),
            );
          }
        })
        .catch((error) => {
          console.error("Failed to fetch following:", error);
          setFollowCreators([]);
        });
    } else {
      // 로그아웃 상태일 때는 빈 배열로 초기화
      setMembershipCreators([]);
      setFollowCreators([]);
    }
  }, [user]);
  // user 상태 변화에 따라 다시 실행

  // 사용자가 로그인했을 때 지갑 정보 조회
  useEffect(() => {
    if (user) {
      refetchWallet();
    }
  }, [user]);
  // refetchWallet을 dependency에서 제거

  useEffect(() => {
    // 현재 경로에 따라 메뉴 선택
    if (pathname === "/" || pathname === "/home") {
      setSelectedMenu("home");
    } else if (pathname === "/feed") {
      setSelectedMenu("feed");
    } else if (pathname === "/explore") {
      setSelectedMenu("explore");
    } else if (pathname === "/search") {
      setSelectedMenu("search");
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await authAPI.signout();
      logout();
      message.success("로그아웃 되었습니다.");
    } catch (error) {
      message.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const handleMenuChange = (info: { key: string }) => {
    setSelectedMenu(info.key);
    switch (info.key) {
      case "home":
        router.push("/home");
        break;
      case "feed":
        router.push("/feed");
        break;
      case "explore":
        router.push("/explore");
        break;
      case "search":
        router.push("/search");
        break;
      case "creator-center":
        router.push("/creator-center");
        break;
      case "write":
        router.push("/write");
        break;
    }
    // 모바일과 태블릿에서 사이드바 닫기
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // dateUtils의 함수를 사용하도록 변경
  const formatDate = (dateString: string) => {
    return formatRelativeDate(dateString);
  };

  const toggleNotificationDateType = (id: string) => {
    setNotificationDateType((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    setUnreadNotifications((prev) => Math.max(0, prev - 1));
    message.success("메시지가 삭제되었습니다.");
  };

  // 사용자 메뉴 공통 스타일
  const userMenuCommonStyle = {
    height: "48px",
    fontSize: "16px",
    fontWeight: "500",
  };

  // 로그아웃 버튼 전용 스타일
  const logoutButtonStyle = {
    ...userMenuCommonStyle,
    backgroundColor: "#ff4d4f",
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const footerLinks = [
    { label: "소개" },
    { label: "크리에이터 센터", href: "/creator-center" },
    { label: "서비스 이용 약관", href: "/support?category=terms" },
    {
      label: "개인 정보 처리 방침",
      strong: true,
      href: "/support?category=privacy",
    },
    { label: "환불 정책", href: "/support?category=refund" },
    { label: "공지사항", href: "/board?category=NOTICE" },
  ];

  const sideBarWidth = isMobile ? 335 : isTablet ? 335 : 335;

  return {
    user,
    router,
    pathname,
    isMobile,
    isTablet,
    isDesktop,
    wallets,
    getTokenAmount,
    walletLoading,
    selectedMenu,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isSignUpModalOpen,
    setIsSignUpModalOpen,
    unreadNotifications,
    notifications,
    notificationDateType,
    membershipCreators,
    followCreators,
    activeNotificationTab,
    setActiveNotificationTab,
    showChargeModal,
    setShowChargeModal,
    openMenuKeys,
    setOpenMenuKeys,
    isSidebarOpen,
    setIsSidebarOpen,
    searchValue,
    setSearchValue,
    isSearchOverlayOpen,
    setIsSearchOverlayOpen,
    handleLogout,
    handleMenuChange,
    toggleSidebar,
    formatDate,
    toggleNotificationDateType,
    handleDeleteNotification,
    userMenuCommonStyle,
    logoutButtonStyle,
    footerLinks,
    sideBarWidth,
  };
}
