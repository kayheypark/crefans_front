import React from "react";
import Tag from "antd/lib/tag";
import { CreatorCategory } from "@/types/creator";

interface CategoryTagProps {
  category: CreatorCategory;
  size?: "small" | "default" | "large";
  style?: React.CSSProperties;
  className?: string;
}

export default function CategoryTag({
  category,
  size = "default",
  style = {},
  className,
}: CategoryTagProps) {
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { fontSize: 10, padding: "2px 6px" };
      case "large":
        return { fontSize: 14, padding: "4px 12px" };
      default:
        return { fontSize: 12, padding: "2px 8px" };
    }
  };

  return (
    <Tag
      style={{
        ...getSizeStyles(),
        backgroundColor: category.color_code || "#666",
        borderColor: category.color_code || "#666",
        color: "#fff",
        margin: 0,
        ...style,
      }}
      className={className}
    >
      {category.icon && <span style={{ marginRight: 4 }}>{category.icon}</span>}
      {category.name}
    </Tag>
  );
}
