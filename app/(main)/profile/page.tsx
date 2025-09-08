"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import Spacings from "@/lib/constants/spacings";
import { Layout } from "antd";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.attributes?.preferred_username) {
      // 본인 프로필인 경우 /@handle로 리다이렉트
      router.replace(`/@${user.attributes.preferred_username}`);
    } else if (user === null) {
      // 로그인하지 않은 경우 홈으로 리다이렉트
      router.replace("/");
    }
  }, [user, router]);

  // 로딩 중 표시
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
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Spin size="large" />
      </div>
    </Layout>
  );
}
