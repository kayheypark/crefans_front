"use client";

import React from "react";
import Profile from "@/components/profile/Profile";

interface ProfilePageProps {
  params: {
    handle: string;
  };
}

export default function ProfileByHandlePage({ params }: ProfilePageProps) {
  // URL 디코딩을 통해 @%40 형태의 인코딩된 핸들을 올바르게 처리
  const decodedHandle = decodeURIComponent(params.handle);
  return <Profile handle={decodedHandle} />;
}
