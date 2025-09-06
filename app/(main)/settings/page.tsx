"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Typography } from "antd";
import Settings from "@/components/settings/Settings";
import { useAuth } from "@/contexts/AuthContext";

const { Text } = Typography;

export default function SettingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // 로그인 확인
  useEffect(() => {
    if (user === null) {
      // 로그아웃 상태
      router.push('/auth/signin');
    }
  }, [user, router]);

  // 로딩 중이거나 비로그인 상태일 때 로딩 화면
  if (user === undefined) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>로딩 중...</Text>
      </div>
    );
  }

  if (user === null) {
    return null; // 리디렉트 중
  }

  return <Settings />;
}
