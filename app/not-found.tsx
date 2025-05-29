"use client";

import React, { useEffect, useState } from "react";
import { Button, Typography } from "antd";
import { useRouter } from "next/navigation";

const { Title } = Typography;

export default function NotFound() {
  const router = useRouter();
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    // localStorage에서 방문 횟수 가져오기
    const count = parseInt(localStorage.getItem("404_visit_count") || "0");
    const lastVisitDate = localStorage.getItem("404_last_visit_date");
    const today = new Date().toDateString();

    // 오늘 날짜가 아니면 카운트 리셋
    if (lastVisitDate !== today) {
      localStorage.setItem("404_visit_count", "1");
      localStorage.setItem("404_last_visit_date", today);
      setVisitCount(1);
    } else {
      // 오늘 날짜면 카운트 증가
      const newCount = count + 1;
      localStorage.setItem("404_visit_count", newCount.toString());
      setVisitCount(newCount);
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <Title level={1} style={{ fontSize: "80px", margin: 0, color: "#666" }}>
        404
      </Title>
      <Title level={4} style={{ margin: "20px 0", color: "#999" }}>
        {visitCount >= 10
          ? "페이지를 찾을 수 없습니다. 비정상 접근이 반복됨이 감지되어 서비스 개선을 위해 접속기록을 저장합니다."
          : "페이지를 찾을 수 없습니다."}
      </Title>
      <Button
        type="primary"
        onClick={() => router.push("/")}
        style={{
          background: "#1890ff",
          border: "none",
        }}
      >
        홈으로
      </Button>
    </div>
  );
}
