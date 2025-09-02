"use client";

import React from "react";
import { Button } from "antd";
import { useResponsive } from "@/hooks/useResponsive";

interface FeedFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  filters: { key: string; label: string }[];
  type: "feed" | "explore";
  style?: React.CSSProperties;
}

export default function FeedFilter({
  filter,
  onFilterChange,
  filters,
  type,
  style,
}: FeedFilterProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (type === "feed") {
    return (
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        {filters.map((filterItem) => (
          <Button
            key={filterItem.key}
            type={filter === filterItem.key ? "primary" : "default"}
            style={{
              fontSize: 14,
            }}
            onClick={() => onFilterChange(filterItem.key)}
          >
            {filterItem.label}
          </Button>
        ))}
      </div>
    );
  }

  // explore 타입
  return (
    <div style={{ marginBottom: 30, ...style }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {filters.map((filterItem) => (
          <Button
            key={filterItem.key}
            type={filter === filterItem.key ? "primary" : "default"}
            onClick={() => onFilterChange(filterItem.key)}
            style={{
              borderRadius: "20px",
              height: "32px",
              padding: "0 16px",
              fontSize: "14px",
            }}
          >
            {filterItem.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
