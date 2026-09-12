"use client";

import { Button, Input, Space, Table, Typography, theme } from "antd";
import { useMemo, useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import Colors from "@/lib/constants/colors";
import { BREAKPOINTS } from "@/lib/constants/breakpoints";
import Spacings from "@/lib/constants/spacings";
import { CatalogSection, Specimen } from "./Primitives";
import styles from "./design-system.module.css";

export function TokensSection() {
  const { token } = theme.useToken();
  const [tokenSearch, setTokenSearch] = useState("");
  const tokenRows = useMemo(
    () =>
      Object.entries(token)
        .filter(([, value]) =>
          ["string", "number", "boolean"].includes(typeof value),
        )
        .filter(([key, value]) =>
          `${key} ${value}`.toLowerCase().includes(tokenSearch.toLowerCase()),
        )
        .map(([key, value]) => ({
          key,
          value: String(value),
          type: typeof value,
        })),
    [token, tokenSearch],
  );
  const colors = [
    ["colorPrimary", token.colorPrimary],
    ["colorPrimaryHover", token.colorPrimaryHover],
    ["colorPrimaryActive", token.colorPrimaryActive],
    ["colorPrimaryBg", token.colorPrimaryBg],
    ["colorSuccess", token.colorSuccess],
    ["colorWarning", token.colorWarning],
    ["colorError", token.colorError],
    ["colorInfo", token.colorInfo],
    ["colorText", token.colorText],
    ["colorTextSecondary", token.colorTextSecondary],
    ["colorTextDisabled", token.colorTextDisabled],
    ["colorBorder", token.colorBorder],
    ["colorBgContainer", token.colorBgContainer],
    ["colorBgContainerDisabled", token.colorBgContainerDisabled],
    ["colorBgLayout", token.colorBgLayout],
    ["Colors.BACKGROUND", Colors.BACKGROUND],
  ];
  function exportTokens() {
    const data = JSON.stringify(
      {
        theme: token,
        layout: Spacings,
        breakpoints: BREAKPOINTS,
        colors: Colors,
      },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([data], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "crefans-design-tokens.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <CatalogSection
      id="tokens"
      number="01"
      title="디자인 토큰"
      description="현재 공통 테마에서 계산된 실제 값입니다. 서비스별 인라인 스타일은 아래 실제 컴포넌트에서 함께 확인하세요."
    >
      <div className={styles.grid}>
        <Specimen
          title="색상 · 역할에 따라 사용하는 팔레트"
          spec="theme.useToken() · lib/theme.ts · lib/constants/colors.ts"
          wide
        >
          <div className={styles.swatches}>
            {colors.map(([name, value]) => (
              <div key={name} className={styles.swatch}>
                <div
                  className={styles.swatchColor}
                  style={{ background: value }}
                />
                <strong>{name}</strong>
                <code>{value}</code>
              </div>
            ))}
          </div>
          <p className={styles.note}>
            Primary는 주요 행동, Success / Warning / Error는 상태 전달에
            사용합니다. 색상만으로 상태를 구분하지 않고 문구·아이콘을 함께
            표시합니다.
          </p>
        </Specimen>
        <Specimen
          title="간격과 컨트롤 높이"
          spec="padding / margin · controlHeight"
        >
          <div className={styles.specRows}>
            {[
              ["paddingXXS", token.paddingXXS],
              ["paddingXS", token.paddingXS],
              ["paddingSM", token.paddingSM],
              ["padding", token.padding],
              ["paddingLG", token.paddingLG],
              ["paddingXL", token.paddingXL],
              ["controlHeightSM", token.controlHeightSM],
              ["controlHeight", token.controlHeight],
              ["controlHeightLG", token.controlHeightLG],
            ].map(([name, value]) => (
              <div className={styles.specRow} key={name}>
                <code>{name}</code>
                <div
                  className={styles.spacingBar}
                  style={{ width: Number(value) * 2 }}
                />
                <span>{value}px</span>
              </div>
            ))}
          </div>
        </Specimen>
        <Specimen
          title="모서리·테두리·그림자"
          spec="borderRadius · lineWidth · boxShadow"
        >
          <div className={styles.row}>
            {[
              ["SM", token.borderRadiusSM],
              ["base", token.borderRadius],
              ["LG", token.borderRadiusLG],
            ].map(([name, value]) => (
              <div key={name}>
                <div
                  className={styles.shape}
                  style={{ borderRadius: Number(value) }}
                >
                  {value}px
                </div>
                <p className={styles.note}>{name}</p>
              </div>
            ))}
          </div>
          <div className={styles.row} style={{ marginTop: 22 }}>
            <div
              className={styles.shape}
              style={{ boxShadow: token.boxShadow }}
            >
              shadow
            </div>
            <div
              className={styles.shape}
              style={{ boxShadow: token.boxShadowSecondary }}
            >
              secondary
            </div>
            <span className={styles.note}>
              기본 선 {token.lineWidth}px · {token.lineType}
            </span>
          </div>
          <p className={styles.note}>
            <code>{token.boxShadow}</code>
          </p>
        </Specimen>
        <Specimen
          title="레이아웃과 반응형 기준"
          spec="BREAKPOINTS · CONTENT_LAYOUT_WIDTH"
        >
          <div className={styles.specRows}>
            {Object.entries(BREAKPOINTS).map(([name, value]) => (
              <div key={name} className={styles.specRow}>
                <strong>{name}</strong>
                <div
                  className={styles.spacingBar}
                  style={{ width: `${value / 12}%`, maxWidth: "100%" }}
                />
                <code>{value}px</code>
              </div>
            ))}
          </div>
          <p className={styles.note}>
            기존 서비스 콘텐츠 기준 폭 {Spacings.CONTENT_LAYOUT_WIDTH}px. 실제
            화면은 모바일·태블릿·데스크톱 분기와 개별 컴포넌트 스타일을 함께
            사용합니다.
          </p>
        </Specimen>
        <Specimen
          title="모션과 내보내기"
          spec="motionDurationFast / Mid / Slow · JSON export"
        >
          <div className={styles.specRows}>
            {[
              ["Fast", token.motionDurationFast],
              ["Mid", token.motionDurationMid],
              ["Slow", token.motionDurationSlow],
            ].map(([name, value]) => (
              <div className={styles.specRow} key={name}>
                <span>{name}</span>
                <div
                  className={styles.motion}
                  style={{ transitionDuration: value }}
                />
                <code>{value}</code>
              </div>
            ))}
          </div>
          <p className={styles.note}>
            막대 위에 포인터를 올려 속도를 비교하세요. 운영체제의 모션 줄이기
            설정에서는 움직이지 않습니다.
          </p>
          <Button
            icon={<DownloadOutlined />}
            onClick={exportTokens}
            style={{ marginTop: 18 }}
          >
            현재 토큰 JSON 다운로드
          </Button>
        </Specimen>

        <Specimen
          title="전체 토큰 사전"
          spec="Resolved theme tokens · searchable name / value / type"
          wide
        >
          <Input
            aria-label="전체 토큰 검색"
            value={tokenSearch}
            onChange={(event) => setTokenSearch(event.target.value)}
            placeholder="fontSize, controlOutline, borderRadius…"
            allowClear
            style={{ maxWidth: 380, marginBottom: 18 }}
          />
          <Table
            size="small"
            dataSource={tokenRows}
            pagination={{
              pageSize: 8,
              showSizeChanger: false,
              showTotal: (total) => `총 ${total}개 토큰`,
            }}
            scroll={{ x: 540 }}
            columns={[
              {
                title: "토큰",
                dataIndex: "key",
                width: 240,
                render: (name: string) => <code>{name}</code>,
              },
              {
                title: "값",
                dataIndex: "value",
                render: (value: string) => (
                  <span
                    style={{
                      overflowWrap: "anywhere",
                      fontFamily: "monospace",
                      fontSize: 11,
                    }}
                  >
                    {value}
                  </span>
                ),
              },
              { title: "타입", dataIndex: "type", width: 80 },
            ]}
          />
        </Specimen>
      </div>
    </CatalogSection>
  );
}

export function TypographySection() {
  const { token } = theme.useToken();
  const rows = [
    {
      label: "Heading 1",
      size: token.fontSizeHeading1,
      line: token.lineHeightHeading1,
      weight: token.fontWeightStrong,
      text: "좋아하는 이야기가 만나는 곳",
    },
    {
      label: "Heading 2",
      size: token.fontSizeHeading2,
      line: token.lineHeightHeading2,
      weight: token.fontWeightStrong,
      text: "창작자와 팬을 더 가깝게",
    },
    {
      label: "Heading 3",
      size: token.fontSizeHeading3,
      line: token.lineHeightHeading3,
      weight: token.fontWeightStrong,
      text: "소연의 새로운 이야기를 만나보세요",
    },
    {
      label: "Heading 4",
      size: token.fontSizeHeading4,
      line: token.lineHeightHeading4,
      weight: token.fontWeightStrong,
      text: "우리의 작은 기록이 쌓이는 시간",
    },
    {
      label: "Heading 5",
      size: token.fontSizeHeading5,
      line: token.lineHeightHeading5,
      weight: token.fontWeightStrong,
      text: "멤버십을 선택해 주세요",
    },
    {
      label: "Body large",
      size: token.fontSizeLG,
      line: token.lineHeightLG,
      weight: 400,
      text: "좋아하는 창작자의 다음 이야기를 함께 만들어갑니다.",
    },
    {
      label: "Body",
      size: token.fontSize,
      line: token.lineHeight,
      weight: 400,
      text: "창작의 과정과 일상의 기록을 나눕니다. Create, connect, together.",
    },
    {
      label: "Caption",
      size: token.fontSizeSM,
      line: token.lineHeightSM,
      weight: 400,
      text: "결제일 2026.09.10 · 멤버 1,284명 · 월 9,900원",
    },
  ];
  return (
    <CatalogSection
      id="typography"
      number="02"
      title="타이포그래피"
      description="제목·본문·보조 문구의 크기, 굵기, 행간과 실제 텍스트 상태를 비교합니다."
    >
      <div className={styles.grid}>
        <Specimen
          title="타입 스케일"
          spec={`fontFamily: ${token.fontFamily}`}
          wide
        >
          {rows.map((row) => (
            <div className={styles.typeSample} key={row.label}>
              <div className={styles.typeMeta}>
                <strong>{row.label}</strong>
                {row.size}px / {row.weight}
                <br />
                line-height {row.line.toFixed(3)}
              </div>
              <div
                className={styles.typeContent}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: row.size,
                  lineHeight: row.line,
                  fontWeight: row.weight,
                }}
              >
                {row.text}
              </div>
            </div>
          ))}
        </Specimen>
        <Specimen
          title="강조와 의미별 텍스트"
          spec="Typography.Text · type / strong / mark / delete / disabled"
        >
          <Space direction="vertical">
            <Typography.Text>기본 본문입니다.</Typography.Text>
            <Typography.Text strong>중요한 정보를 강조합니다.</Typography.Text>
            <Typography.Text type="secondary">
              보조 설명을 전달합니다.
            </Typography.Text>
            <Typography.Text type="success">
              저장이 완료되었습니다.
            </Typography.Text>
            <Typography.Text type="warning">
              내용을 한 번 더 확인해 주세요.
            </Typography.Text>
            <Typography.Text type="danger">
              입력한 이메일을 확인해 주세요.
            </Typography.Text>
            <Typography.Text disabled>
              현재 사용할 수 없는 항목입니다.
            </Typography.Text>
            <Space>
              <Typography.Text mark>하이라이트</Typography.Text>
              <Typography.Text delete>이전 가격 19,900원</Typography.Text>
              <Typography.Text code>membershipId</Typography.Text>
            </Space>
          </Space>
        </Specimen>
        <Specimen
          title="링크·숫자·말줄임"
          spec="Typography.Link / Paragraph · ellipsis / copyable"
        >
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <Space>
              <Typography.Link href="#components">
                컴포넌트로 이동
              </Typography.Link>
              <Typography.Link disabled>비활성 링크</Typography.Link>
            </Space>
            <Typography.Text
              style={{
                fontSize: 28,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ₩ 1,284,900
            </Typography.Text>
            <Typography.Paragraph
              ellipsis={{ rows: 2, expandable: true, symbol: "더 보기" }}
              style={{ maxWidth: 300, margin: 0 }}
            >
              아주 긴 콘텐츠가 들어왔을 때 카드의 높이와 텍스트가 어떻게
              처리되는지 확인하는 예시입니다. 창작자의 이야기가 길어져도 읽기
              편한 흐름을 유지하고, 필요할 때 전체 내용을 펼쳐볼 수 있어야
              합니다.
            </Typography.Paragraph>
            <Typography.Text copyable>crefans-design-system</Typography.Text>
          </Space>
        </Specimen>
      </div>
    </CatalogSection>
  );
}
