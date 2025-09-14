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
          justifyContent: isMobile ? "flex-start" : "center",
          overflowX: isMobile ? "auto" : "visible",
          overflowY: "hidden",
          paddingBottom: isMobile ? "8px" : "0",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: "#d9d9d9 transparent",
          ...style,
        }}
      >
        {filters.map((filterItem) => (
          <Button
            key={filterItem.key}
            type={filter === filterItem.key ? "primary" : "default"}
            style={{
              fontSize: 14,
              flexShrink: 0,
              whiteSpace: "nowrap",
              touchAction: "pan-x",
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
    <div style={{ ...style }}>
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: isMobile ? "auto" : "visible",
          overflowY: "hidden",
          paddingBottom: isMobile ? "8px" : "0",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: "#d9d9d9 transparent",
        }}
      >
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
              flexShrink: 0,
              whiteSpace: "nowrap",
              touchAction: "pan-x",
            }}
          >
            {filterItem.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
