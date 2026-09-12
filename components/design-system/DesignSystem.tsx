"use client";

import { ConfigProvider, Empty, Input, Segmented, Select, Switch } from "antd";
import koKR from "antd/locale/ko_KR";
import { SearchOutlined } from "@ant-design/icons";
import { useDesignSystemModel } from "@/features/design-system/useDesignSystemModel";
import { TokensSection, TypographySection } from "./Foundations";
import { ActionsSection, InputsSection, ValidationSection } from "./Controls";
import {
  DataSection,
  FeedbackSection,
  NavigationSection,
  OverlaysSection,
} from "./Patterns";
import { ServiceComponentsSection, StatesSection } from "./ServiceComponents";
import styles from "./design-system.module.css";

export default function DesignSystem() {
  const model = useDesignSystemModel();
  return <DesignSystemView model={model} />;
}

function DesignSystemView({
  model,
}: {
  model: ReturnType<typeof useDesignSystemModel>;
}) {
  const {
    search,
    setSearch,
    size,
    setSize,
    disabled,
    setDisabled,
    scenario,
    setScenario,
    fixtures,
    visibleSections,
  } = model;
  const has = (id: string) =>
    visibleSections.some((section) => section.id === id);
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <strong>crefans</strong>
          <span>Design system</span>
        </div>
        <div className={styles.headerNote}>
          DESIGN REFERENCE / COMPONENT LIBRARY
        </div>
      </header>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLabel}>Foundations & components</div>
          <nav className={styles.nav} aria-label="디자인 시스템 목차">
            {visibleSections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                <span>{section.label}</span>
                {section.title}
              </a>
            ))}
          </nav>
          <div className={styles.sidebarFoot}>
            실제 테마와 컴포넌트
            <br />
            상태별 UI 미리보기
            <br />
            샘플 데이터만 사용
          </div>
        </aside>
        <main className={styles.main}>
          <div className={styles.hero}>
            <div className={styles.eyebrow}>CREFANS / DESIGN LIBRARY</div>
            <h1>하나의 기준, 다양한 모습.</h1>
            <p>
              타이포그래피와 디자인 토큰부터 데이터에 반응하는 컴포넌트까지.
              <br />
              구성 요소와 상태를 비교하고, 다음 디자인의 기준을 함께 만듭니다.
            </p>
            <div className={styles.heroMeta}>
              <span>11 SECTIONS</span>
              <span>LIVE COMPONENTS</span>
              <span>INTERACTIVE STATES</span>
            </div>
          </div>
          <div className={styles.controls}>
            <div className={`${styles.control} ${styles.search}`}>
              <label htmlFor="catalog-search">컴포넌트 찾기</label>
              <Input
                id="catalog-search"
                prefix={<SearchOutlined />}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                allowClear
                placeholder="버튼, 입력, 스낵바, typography…"
              />
            </div>
            <div className={styles.control}>
              <label>기본 UI 크기</label>
              <Segmented
                aria-label="미리보기 크기"
                value={size}
                onChange={setSize}
                options={[
                  { label: "S", value: "small" },
                  { label: "M", value: "middle" },
                  { label: "L", value: "large" },
                ]}
              />
            </div>
            <div className={styles.control}>
              <label htmlFor="catalog-disabled">기본 UI 비활성</label>
              <Switch
                id="catalog-disabled"
                checked={disabled}
                onChange={setDisabled}
                aria-label="기본 UI 비활성 전환"
                style={{ alignSelf: "flex-start", margin: "5px 0" }}
              />
            </div>
            <div className={styles.control}>
              <label htmlFor="catalog-scenario">컴포넌트 데이터</label>
              <Select
                id="catalog-scenario"
                aria-label="컴포넌트 데이터"
                value={scenario}
                onChange={setScenario}
                style={{ width: 145 }}
                options={[
                  { label: "기본 데이터", value: "normal" },
                  { label: "긴 문구 · 큰 금액", value: "long" },
                  { label: "빈 데이터", value: "empty" },
                ]}
              />
            </div>
          </div>
          <p className={styles.controlHint}>
            크기·비활성은 지원하는 기본 UI에 적용됩니다. 데이터 전환은 10번 실제
            서비스 컴포넌트에 적용되며, 개별 상태 예시는 고정됩니다.
          </p>
          <ConfigProvider componentSize={size} locale={koKR}>
            {has("tokens") && <TokensSection />}
            {has("typography") && <TypographySection />}
            {has("actions") && <ActionsSection disabled={disabled} />}
            {has("inputs") && <InputsSection disabled={disabled} />}
            {has("validation") && <ValidationSection disabled={disabled} />}
            {has("feedback") && <FeedbackSection disabled={disabled} />}
            {has("overlays") && <OverlaysSection disabled={disabled} />}
            {has("data") && <DataSection disabled={disabled} />}
            {has("navigation") && <NavigationSection disabled={disabled} />}
            {has("components") && (
              <ServiceComponentsSection fixtures={fixtures} />
            )}
            {has("states") && <StatesSection />}
          </ConfigProvider>
          {!visibleSections.length && (
            <Empty
              style={{ padding: "80px 0" }}
              description="일치하는 구성 요소가 없습니다. 다른 검색어를 입력해 주세요."
            />
          )}
          <footer className={styles.catalogFooter}>
            <span>crefans · Design system</span>
            <span>
              실제 결제·업로드·회원 데이터와 연결되지 않은 미리보기입니다.
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
