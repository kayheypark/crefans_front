"use client";

import { useEffect, useState } from "react";
import { App, Button, Empty, Input, Select, Space, Switch, theme } from "antd";
import PostPreview from "./PostPreview";
import EmailAutoComplete from "@/components/common/EmailAutoComplete";
import { FollowButtonView } from "@/components/common/FollowButton";
import MembershipCard from "@/components/common/MembershipCard";
import PaymentHistoryItem from "@/components/common/PaymentHistoryItem";
import CategoryTag from "@/components/common/CategoryTag";
import FeedFilter from "@/components/common/FeedFilter";
import MediaGallery from "@/components/media/MediaGallery";
import type { createComponentFixtures } from "@/features/design-system/catalog";
import { CatalogSection, Specimen } from "./Primitives";
import styles from "./design-system.module.css";

type Fixtures = ReturnType<typeof createComponentFixtures>;

export function ServiceComponentsSection({ fixtures }: { fixtures: Fixtures }) {
  const { message, modal } = App.useApp();
  const [selected, setSelected] = useState("sample-basic");
  const [filter, setFilter] = useState("all");
  const [email, setEmail] = useState("");
  const [following, setFollowing] = useState(false);
  const [media, setMedia] = useState(fixtures.media);
  const [mediaLoading, setMediaLoading] = useState(false);
  useEffect(() => {
    setMedia(fixtures.media);
  }, [fixtures.media]);
  const filters = [
    { key: "all", label: "전체" },
    { key: "public", label: "공개 콘텐츠" },
    { key: "membership", label: "멤버십 전용" },
  ];
  return (
    <CatalogSection
      id="components"
      number="10"
      title="데이터 기반 컴포넌트"
      description="서비스에서 사용하는 실제 컴포넌트입니다. 상단의 데이터 전환으로 기본·긴 문구와 큰 금액·빈 목록을 비교하세요."
    >
      <div className={styles.grid}>
        <Specimen
          title="게시글 카드 · 공개와 접근 상태"
          spec="PostView · isMembershipOnly / isGotMembership / isLiked · injected model"
          wide
        >
          <PostPreview />
          <p className={styles.note}>
            공개·멤버십 잠금·멤버 열람 상태에 따라 같은 컴포넌트의 모습이
            달라집니다. 댓글 영역은 슬롯으로 비워두며 서버 요청은 발생하지
            않습니다.
          </p>
        </Specimen>
        <Specimen
          title="팔로우 버튼 · 데이터 상태"
          spec="FollowButtonView · currentFollowing / buttonType / loading"
        >
          <Space wrap>
            <FollowButtonView
              targetUserId="catalog-user"
              isFollowing={following}
              model={{
                currentFollowing: following,
                loading: false,
                handleFollowToggle: async () => setFollowing((value) => !value),
              }}
            />
            <FollowButtonView
              targetUserId="catalog-user"
              isFollowing
              buttonType="following"
              model={{
                currentFollowing: true,
                loading: false,
                handleFollowToggle: async () => {},
              }}
            />
            <FollowButtonView
              targetUserId="catalog-user"
              isFollowing={false}
              model={{
                currentFollowing: false,
                loading: true,
                handleFollowToggle: async () => {},
              }}
            />
          </Space>
          <p className={styles.note}>
            상태를 직접 주입해 팔로우 전·후와 로딩 중 모습을 비교합니다.
          </p>
        </Specimen>
        <Specimen
          title="이메일 자동완성 · 실제 공통 컴포넌트"
          spec="EmailAutoComplete · value / onChange / disabled"
        >
          <div className={styles.stack}>
            <EmailAutoComplete
              value={email}
              onChange={setEmail}
              placeholder="이메일을 입력해 보세요"
            />
            <EmailAutoComplete value="sample@example.com" disabled />
          </div>
        </Specimen>

        <Specimen
          title="멤버십 카드 · 선택형"
          spec="MembershipCard · membership / selected / showRadio / onSelect"
        >
          <div className={styles.stack}>
            {fixtures.memberships.length ? (
              fixtures.memberships.map((item) => (
                <MembershipCard
                  key={item.id}
                  membership={item}
                  selected={selected === item.id}
                  showRadio
                  onSelect={(value) => setSelected(value.id)}
                />
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="등록된 멤버십이 없습니다."
              />
            )}
          </div>
          <p className={styles.note}>
            선택 여부는 테두리·배경·라디오를 바꾸고, 가격·설명·혜택은 주입된
            데이터로 표현합니다.
          </p>
        </Specimen>
        <Specimen
          title="멤버십 카드 · 관리형"
          spec="MembershipCard · showActions / onEdit / onDelete"
        >
          <div className={styles.stack}>
            {fixtures.memberships.length ? (
              fixtures.memberships.map((item) => (
                <MembershipCard
                  key={item.id}
                  membership={item}
                  showActions
                  onEdit={() => message.info("멤버십 편집 콜백 예시입니다.")}
                  onDelete={() =>
                    message.success(
                      "삭제 콜백 예시입니다. 실제 멤버십은 변경하지 않습니다.",
                    )
                  }
                />
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="관리할 멤버십이 없습니다."
              />
            )}
          </div>
          <p className={styles.note}>
            같은 데이터에 관리 액션을 주입하면 편집·삭제 UI가 나타납니다.
          </p>
        </Specimen>
        <Specimen
          title="결제내역 행"
          spec="PaymentHistoryItem · amount / description / paymentMethod / date / merchant"
        >
          <div className={styles.stack}>
            {fixtures.payments.length ? (
              fixtures.payments.map((payment) => (
                <PaymentHistoryItem key={payment.id} {...payment} />
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="결제 내역이 없습니다."
              />
            )}
          </div>
          <p className={styles.note}>
            금액·날짜·설명은 실제 컴포넌트의 포맷팅을 사용합니다. 현재 이
            컴포넌트는 status 값에 따른 별도 배지를 표시하지 않습니다.
          </p>
        </Specimen>
        <Specimen
          title="카테고리 태그"
          spec="CategoryTag · category / color_code / size"
        >
          <div className={styles.stack}>
            {(["small", "default", "large"] as const).map((size) => (
              <Space key={size} wrap>
                {[
                  {
                    id: "art",
                    name: "일러스트",
                    color_code: "#8470ce",
                    icon: "✦",
                  },
                  {
                    id: "music",
                    name: "음악",
                    color_code: "#368b87",
                    icon: "♪",
                  },
                  {
                    id: "life",
                    name: "라이프",
                    color_code: "#ba745a",
                    icon: "",
                  },
                ].map((category) => (
                  <CategoryTag
                    key={category.id}
                    size={size}
                    category={{ ...category, description: "", sort_order: 0 }}
                  />
                ))}
                <span className={styles.note}>{size}</span>
              </Space>
            ))}
          </div>
        </Specimen>
        <Specimen
          title="미디어 갤러리"
          spec="MediaGallery · items / isLoading / onReorder / onRemove / onPreview"
          wide
        >
          <Space style={{ marginBottom: 18 }} wrap>
            <Switch
              checked={mediaLoading}
              onChange={setMediaLoading}
              aria-label="갤러리 로딩 상태"
            />
            <span>로딩 상태</span>
            <Button onClick={() => setMedia(fixtures.media)}>
              미디어 초기화
            </Button>
            <span className={styles.note}>
              삭제·순서 변경은 현재 예시 목록에만 적용됩니다.
            </span>
          </Space>
          <MediaGallery
            items={media}
            isLoading={mediaLoading}
            gridCols={3}
            onRemove={(index) =>
              setMedia((items) => items.filter((_, at) => at !== index))
            }
            onReorder={(from, to) =>
              setMedia((items) => {
                const next = [...items];
                const [item] = next.splice(from, 1);
                next.splice(to, 0, item);
                return next;
              })
            }
            onPreview={(index) =>
              modal.info({
                title: "미디어 미리보기",
                content: (
                  <img
                    src={media[index].url}
                    alt="샘플 미디어 미리보기"
                    style={{ width: "100%", borderRadius: 6 }}
                  />
                ),
                okText: "닫기",
              })
            }
          />
        </Specimen>
        <Specimen
          title="피드·탐색 필터"
          spec="FeedFilter · filters / filter / type / onFilterChange"
          wide
        >
          <div className={styles.stack}>
            <FeedFilter
              filter={filter}
              filters={filters}
              type="feed"
              onFilterChange={setFilter}
            />
            <FeedFilter
              filter={filter}
              filters={filters}
              type="explore"
              onFilterChange={setFilter}
            />
          </div>
          <p className={styles.note}>
            같은 옵션 배열과 선택 값을 받아도 type에 따라 기본형·필형으로
            표시됩니다.
          </p>
        </Specimen>
      </div>
    </CatalogSection>
  );
}

export function StatesSection() {
  const { token } = theme.useToken();
  return (
    <CatalogSection
      id="states"
      number="11"
      title="상태 비교표"
      description="모든 상태를 한 화면에서 비교합니다. 이 표는 상단 비활성 스위치와 독립적으로 유지됩니다."
    >
      <div className={styles.grid}>
        <Specimen
          title="기본 / 비활성 / 오류 / 로딩"
          spec="Explicit state matrix · keyboard focus / pointer interaction"
          wide
        >
          <div className={styles.tableScroll}>
            <table className={styles.stateTable}>
              <thead>
                <tr>
                  <th>요소</th>
                  <th>기본</th>
                  <th>Disabled</th>
                  <th>Error / Warning</th>
                  <th>Loading / Read-only</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Button</td>
                  <td>
                    <Button type="primary">확인</Button>
                  </td>
                  <td>
                    <Button type="primary" disabled>
                      확인
                    </Button>
                  </td>
                  <td>
                    <Button danger>삭제</Button>
                  </td>
                  <td>
                    <Button loading>처리 중</Button>
                  </td>
                </tr>
                <tr>
                  <td>Input</td>
                  <td>
                    <Input
                      aria-label="표 기본 입력"
                      placeholder="입력"
                      style={{ width: 120 }}
                    />
                  </td>
                  <td>
                    <Input
                      aria-label="표 비활성 입력"
                      disabled
                      value="비활성"
                      style={{ width: 120 }}
                    />
                  </td>
                  <td>
                    <Input
                      aria-label="표 오류 입력"
                      status="error"
                      defaultValue="오류 값"
                      style={{ width: 120 }}
                    />
                  </td>
                  <td>
                    <Input
                      aria-label="표 읽기전용 입력"
                      readOnly
                      value="읽기전용"
                      style={{ width: 120 }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Select</td>
                  <td>
                    <Select
                      aria-label="표 기본 선택"
                      defaultValue="one"
                      options={[{ value: "one", label: "선택 값" }]}
                      style={{ width: 120 }}
                    />
                  </td>
                  <td>
                    <Select
                      aria-label="표 비활성 선택"
                      disabled
                      placeholder="비활성"
                      style={{ width: 120 }}
                    />
                  </td>
                  <td>
                    <Select
                      aria-label="표 경고 선택"
                      status="warning"
                      placeholder="확인 필요"
                      style={{ width: 120 }}
                    />
                  </td>
                  <td>
                    <Select
                      aria-label="표 로딩 선택"
                      loading
                      placeholder="조회 중"
                      style={{ width: 120 }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Switch</td>
                  <td>
                    <Switch defaultChecked aria-label="표 기본 스위치" />
                  </td>
                  <td>
                    <Switch
                      disabled
                      defaultChecked
                      aria-label="표 비활성 스위치"
                    />
                  </td>
                  <td>—</td>
                  <td>
                    <Switch
                      loading
                      defaultChecked
                      aria-label="표 로딩 스위치"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Specimen>
        <Specimen
          title="상태에 사용되는 실제 토큰"
          spec="Hover / Active / Disabled / Error"
          wide
        >
          <div className={styles.swatches}>
            {[
              ["Hover", token.colorPrimaryHover],
              ["Active", token.colorPrimaryActive],
              ["Disabled text", token.colorTextDisabled],
              ["Disabled background", token.colorBgContainerDisabled],
              ["Error", token.colorError],
              ["Warning", token.colorWarning],
            ].map(([name, color]) => (
              <div key={name} className={styles.swatch}>
                <div
                  className={styles.swatchColor}
                  style={{ background: color }}
                />
                <strong>{name}</strong>
                <code>{color}</code>
              </div>
            ))}
          </div>
          <p className={styles.note}>
            Tab / Shift+Tab으로 포커스 순서를 확인하고 Enter / Space로 실행해
            보세요. Disabled는 입력·실행이 막히며, Read-only는 값의 선택과
            복사가 가능합니다.
          </p>
        </Specimen>
      </div>
    </CatalogSection>
  );
}
