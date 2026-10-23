"use client";

import { useProfilePageModel } from "@/features/profile/useProfilePageModel";
import Spacings from "@/lib/constants/spacings";
import { Layout, Spin } from "antd";

export default function ProfilePage() {
  const model = useProfilePageModel();
  return <ProfilePageView model={model} />;
}

function ProfilePageView({
  model,
}: {
  model: ReturnType<typeof useProfilePageModel>;
}) {
  const {} = model;

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
