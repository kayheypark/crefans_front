"use client";

import React, { useEffect, useState } from "react";
import { Tabs, Typography, Card } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

const { Title, Paragraph, Text } = Typography;

function TermsContent() {
  return (
    <Card bordered={false} style={{ background: "#fff", borderRadius: 16 }}>
      <Title level={3} style={{ marginTop: 0 }}>
        서비스 이용약관
      </Title>
      <Paragraph>
        본 약관은 CREFANS(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의
        권리, 의무 및 책임사항을 규정합니다.
      </Paragraph>
      <Title level={4}>제1조 (목적)</Title>
      <Paragraph>
        본 약관은 서비스의 이용조건 및 절차, 회사와 이용자의 권리·의무 및
        책임사항 등을 규정함을 목적으로 합니다.
      </Paragraph>
      <Title level={4}>제2조 (용어의 정의)</Title>
      <Paragraph>
        - "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.
        <br />- "회원"이란 서비스에 회원가입을 하고 지속적으로 서비스를 이용할
        수 있는 자를 말합니다.
      </Paragraph>
      <Title level={4}>제3조 (약관의 게시와 개정)</Title>
      <Paragraph>
        회사는 본 약관을 서비스 초기화면 또는 연결화면에 게시합니다. 회사는 관련
        법령을 위배하지 않는 범위에서 약관을 개정할 수 있습니다.
      </Paragraph>
      <Paragraph type="secondary">
        본 문서는 서비스 운영에 따라 수시로 업데이트될 수 있습니다.
      </Paragraph>
    </Card>
  );
}

function PrivacyContent() {
  return (
    <Card bordered={false} style={{ background: "#fff", borderRadius: 16 }}>
      <Title level={3} style={{ marginTop: 0 }}>
        개인정보처리방침
      </Title>
      <Paragraph>
        회사는 개인정보보호법 등 관련 법령을 준수하며 이용자의 개인정보를
        안전하게 관리합니다.
      </Paragraph>
      <Title level={4}>수집하는 개인정보 항목</Title>
      <Paragraph>
        회원가입 시: 이메일, 비밀번호, 이름(선택), 닉네임, 휴대폰번호(선택)
        <br />
        서비스 이용 과정에서: 접속 IP, 쿠키, 접속 로그, 결제기록 등
      </Paragraph>
      <Title level={4}>개인정보의 이용 목적</Title>
      <Paragraph>
        회원 식별 및 관리, 서비스 제공, 요금 정산, 민원처리, 서비스 개선 및
        맞춤형 서비스 제공 등에 이용합니다.
      </Paragraph>
      <Title level={4}>보관 및 파기</Title>
      <Paragraph>
        법령에 따른 보존 의무가 있는 경우를 제외하고 목적 달성 시 지체 없이
        파기합니다.
      </Paragraph>
      <Paragraph type="secondary">
        자세한 사항은 추후 고지되는 개별 공지 및 정책을 따릅니다.
      </Paragraph>
    </Card>
  );
}

function RefundContent() {
  return (
    <Card bordered={false} style={{ background: "#fff", borderRadius: 16 }}>
      <Title level={3} style={{ marginTop: 0 }}>
        환불 정책
      </Title>
      <Paragraph>
        디지털 콘텐츠 특성상 다운로드 또는 열람이 가능한 상품의 경우 결제 완료
        후 환불이 제한될 수 있습니다. 단, 관련 법령에 따른 청약철회가 가능한
        경우에는 예외로 합니다.
      </Paragraph>
      <Title level={4}>일반 원칙</Title>
      <Paragraph>
        - 중대한 하자나 서비스 장애로 인해 이용이 불가능한 경우 결제일로부터 7일
        이내 환불 요청 시 검토 후 환불합니다.
        <br />- 단순 변심에 의한 환불은 제한될 수 있습니다.
      </Paragraph>
      <Title level={4}>처리 절차</Title>
      <Paragraph>
        고객센터를 통해 주문번호와 환불 사유를 접수해 주세요. 접수 후 3~7영업일
        내에 처리 결과를 안내드립니다.
      </Paragraph>
      <Paragraph type="secondary">
        법정 환불 기준 및 전자상거래법을 준수합니다.
      </Paragraph>
    </Card>
  );
}

export default function SupportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const readKeyFromParams = (): "terms" | "privacy" | "refund" => {
    const k = (searchParams.get("category") || "").toLowerCase();
    if (k === "privacy") return "privacy";
    if (k === "refund") return "refund";
    return "terms";
  };

  const [activeKey, setActiveKey] = useState<"terms" | "privacy" | "refund">(
    "terms"
  );

  // 쿼리스트링 변화 감지하여 탭 동기화
  useEffect(() => {
    setActiveKey(readKeyFromParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        고객센터
      </Title>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => {
          const nextKey = key as "terms" | "privacy" | "refund";
          setActiveKey(nextKey);
          const params = new URLSearchParams(searchParams as any);
          params.set("category", nextKey);
          router.replace(`/support?${params.toString()}`);
        }}
        items={[
          {
            key: "terms",
            label: "서비스 이용약관",
            children: <TermsContent />,
          },
          {
            key: "privacy",
            label: "개인정보처리방침",
            children: <PrivacyContent />,
          },
          {
            key: "refund",
            label: "환불정책",
            children: <RefundContent />,
          },
        ]}
      />
    </div>
  );
}
