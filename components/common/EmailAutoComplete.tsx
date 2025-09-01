"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";

// 자주 사용되는 이메일 도메인들
const COMMON_DOMAINS = [
  "gmail.com",
  "naver.com",
  "kakao.com",
  "hanmail.net",
  "nate.com",
];

interface EmailAutoCompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  prefix?: React.ReactNode;
  size?: "small" | "middle" | "large";
  style?: React.CSSProperties;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  suffix?: React.ReactNode;
}

export default function EmailAutoComplete({
  value = "",
  onChange,
  placeholder = "이메일",
  disabled = false,
  onKeyPress,
  prefix = <UserOutlined />,
  size = "middle",
  style,
  onBlur,
  suffix,
}: EmailAutoCompleteProps) {
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [emailInput, setEmailInput] = useState(value);
  const [filteredDomains, setFilteredDomains] = useState(COMMON_DOMAINS);
  const emailInputRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // value prop이 변경되면 내부 상태도 업데이트
  useEffect(() => {
    setEmailInput(value);
  }, [value]);

  // 이메일 입력 처리
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setEmailInput(inputValue);
    onChange?.(inputValue);

    // @ 기호가 있는지 확인
    const atIndex = inputValue.indexOf("@");
    if (atIndex !== -1) {
      const localPart = inputValue.substring(0, atIndex);
      const domainPart = inputValue.substring(atIndex + 1);

      // 도메인 부분에 따라 필터링
      const filtered = COMMON_DOMAINS.filter((domain) =>
        domain.toLowerCase().startsWith(domainPart.toLowerCase())
      );
      setFilteredDomains(filtered);
      setShowDomainDropdown(filtered.length > 0);
    } else {
      // @ 기호가 없어도 아이디 입력 중이면 모든 도메인을 보여줌
      if (inputValue.length > 0) {
        setFilteredDomains(COMMON_DOMAINS);
        setShowDomainDropdown(true);
      } else {
        setShowDomainDropdown(false);
      }
    }
  };

  // 도메인 선택 처리
  const handleDomainSelect = (domain: string) => {
    const atIndex = emailInput.indexOf("@");
    const localPart =
      atIndex !== -1 ? emailInput.substring(0, atIndex) : emailInput;
    const fullEmail = `${localPart}@${domain}`;

    setEmailInput(fullEmail);
    onChange?.(fullEmail);
    setShowDomainDropdown(false);

    // 포커스를 이메일 입력 필드로 유지
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  };

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDomainDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <Input
        ref={emailInputRef}
        prefix={prefix}
        placeholder={placeholder}
        value={emailInput}
        onChange={handleEmailChange}
        onKeyPress={onKeyPress}
        onBlur={onBlur}
        disabled={disabled}
        size={size}
        style={style}
        suffix={suffix}
      />
      {showDomainDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 1000,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {filteredDomains.map((domain) => {
            // 현재 입력된 아이디 부분 추출
            const atIndex = emailInput.indexOf("@");
            const localPart =
              atIndex !== -1 ? emailInput.substring(0, atIndex) : emailInput;
            const fullEmail = `${localPart}@${domain}`;

            return (
              <div
                key={domain}
                onClick={() => handleDomainSelect(domain)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <span style={{ color: "#666", fontSize: "12px" }}>
                  {domain}
                </span>
                <span style={{ color: "#1890ff", fontWeight: "500" }}>
                  {fullEmail}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
