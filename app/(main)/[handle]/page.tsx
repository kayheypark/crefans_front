"use client";

import React, { use } from "react";
import Profile from "@/components/profile/Profile";

interface ProfilePageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default function ProfileByHandlePage(props: ProfilePageProps) {
  const params = use(props.params);
  // URL 디코딩을 통해 @%40 형태의 인코딩된 핸들을 올바르게 처리
  const decodedHandle = decodeURIComponent(params.handle);
  return <Profile handle={decodedHandle} />;
}
