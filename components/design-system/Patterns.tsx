"use client";

import { useState } from "react";
import {
  Alert,
  App,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Collapse,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Menu,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  Result,
  Segmented,
  Skeleton,
  Space,
  Spin,
  Statistic,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { creatorRows } from "@/features/design-system/catalog";
import { CatalogSection, Specimen } from "./Primitives";
import styles from "./design-system.module.css";

export function FeedbackSection({ disabled }: { disabled: boolean }) {
  const { message, notification } = App.useApp();
  return (
    <CatalogSection
      id="feedback"
      number="06"
      title="알림과 상태 피드백"
      description="짧은 스낵바부터 지속적인 알림, 진행 상태와 결과 화면까지 확인합니다."
    >
      <div className={styles.grid}>
        <Specimen
          title="스낵바 / Toast"
          spec="App.message · success / info / warning / error / loading"
        >
          <Space wrap>
            {(["success", "info", "warning", "error"] as const).map((type) => (
              <Button
                key={type}
                disabled={disabled}
                onClick={() =>
                  message[type]({
                    content: {
                      success: "변경 사항이 저장되었습니다.",
                      info: "새로운 소식이 도착했습니다.",
                      warning: "입력 내용을 확인해 주세요.",
                      error: "저장하지 못했습니다. 다시 시도해 주세요.",
                    }[type],
                    duration: 3,
                  })
                }
              >
                {type}
              </Button>
            ))}
            <Button
              disabled={disabled}
              onClick={() => {
                message.loading({
                  key: "catalog-task",
                  content: "처리 중입니다...",
                  duration: 0,
                });
                setTimeout(
                  () =>
                    message.success({
                      key: "catalog-task",
                      content: "처리가 완료되었습니다.",
                      duration: 3,
                    }),
                  1200,
                );
              }}
            >
              Loading → Success
            </Button>
          </Space>
          <p className={styles.note}>
            페이지 상단에 나타나며 3초 후 사라집니다. 중복 메시지는 같은 key로
            갱신할 수 있습니다.
          </p>
        </Specimen>
        <Specimen
          title="알림 / Notification"
          spec="App.notification · title / description / placement"
        >
          <Space wrap>
            <Button
              disabled={disabled}
              onClick={() =>
                notification.success({
                  message: "콘텐츠 업로드 완료",
                  description:
                    "새로운 이야기를 멤버들에게 공개할 준비가 되었습니다.",
                  placement: "topRight",
                })
              }
            >
              성공 알림
            </Button>
            <Button
              disabled={disabled}
              onClick={() =>
                notification.error({
                  message: "연결을 확인해 주세요",
                  description:
                    "변경 사항을 저장하지 못했습니다. 네트워크 연결 후 다시 시도해 주세요.",
                  duration: 0,
                })
              }
            >
              지속 오류 알림
            </Button>
            <Button
              disabled={disabled}
              onClick={() =>
                notification.info({
                  message: "새로운 멤버가 함께합니다",
                  description: "프로필에서 새로운 소식을 확인해 보세요.",
                  placement: "bottomRight",
                })
              }
            >
              하단 알림
            </Button>
          </Space>
        </Specimen>
        <Specimen
          title="인라인 Alert"
          spec="Alert · type / showIcon / closable"
        >
          <div className={styles.stack}>
            <Alert
              type="info"
              showIcon
              message="안내"
              description="현재 선택한 설정은 미리보기에만 적용됩니다."
            />
            <Alert
              type="success"
              showIcon
              message="변경 사항을 저장했습니다."
            />
            <Alert
              type="warning"
              showIcon
              message="멤버십 정보를 확인해 주세요."
              closable
            />
            <Alert
              type="error"
              showIcon
              message="내용을 불러오지 못했습니다."
              description="잠시 후 다시 시도해 주세요."
              action={
                <Button
                  size="small"
                  danger
                  disabled={disabled}
                  onClick={() => message.info("다시 시도하는 예시입니다.")}
                >
                  재시도
                </Button>
              }
            />
          </div>
        </Specimen>
        <Specimen title="로딩·진행률" spec="Spin · Skeleton · Progress">
          <div className={styles.stack}>
            <Space size={28}>
              <Spin size="small" />
              <Spin />
              <Spin size="large" />
              <Progress type="circle" percent={65} size={64} />
            </Space>
            <Progress percent={42} status="active" />
            <Progress percent={100} />
            <Progress percent={70} status="exception" />
            <Skeleton avatar active paragraph={{ rows: 2 }} />
          </div>
        </Specimen>
        <Specimen title="빈 상태" spec="Empty · description / action">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="아직 등록된 콘텐츠가 없습니다."
          >
            <Button
              type="primary"
              disabled={disabled}
              onClick={() => message.info("첫 콘텐츠를 만드는 예시입니다.")}
            >
              첫 콘텐츠 만들기
            </Button>
          </Empty>
        </Specimen>
        <Specimen title="작업 결과" spec="Result · success / error / warning">
          <Tabs
            size="small"
            items={(["success", "error", "warning"] as const).map((status) => ({
              key: status,
              label: status,
              children: (
                <Result
                  status={status}
                  title={
                    {
                      success: "설정이 완료되었습니다",
                      error: "요청을 처리하지 못했습니다",
                      warning: "추가 확인이 필요합니다",
                    }[status]
                  }
                  subTitle="결과를 설명하고 다음 행동을 안내합니다."
                  extra={
                    <Button
                      disabled={disabled}
                      onClick={() => message.info("다음 행동 예시")}
                    >
                      확인
                    </Button>
                  }
                />
              ),
            }))}
          />
        </Specimen>
      </div>
    </CatalogSection>
  );
}

export function OverlaysSection({ disabled }: { disabled: boolean }) {
  const { message, modal } = App.useApp();
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <CatalogSection
      id="overlays"
      number="07"
      title="모달과 확인창"
      description="포커스 이동, 배경 마스크, 확인·취소, 닫기와 진행 중 상태를 직접 확인하세요."
    >
      <div className={styles.grid}>
        <Specimen
          title="안내 · Alert dialog"
          spec="Modal.info / success / warning / error"
        >
          <Space wrap>
            <Button
              disabled={disabled}
              onClick={() =>
                modal.info({
                  title: "안내",
                  content: "정책과 안내 사항을 확인해 주세요.",
                  okText: "확인",
                })
              }
            >
              알림창 열기
            </Button>
            <Button
              disabled={disabled}
              onClick={() =>
                modal.success({
                  title: "완료되었습니다",
                  content: "모든 변경 사항이 적용되었습니다.",
                  okText: "확인",
                })
              }
            >
              완료
            </Button>
            <Button
              disabled={disabled}
              onClick={() =>
                modal.error({
                  title: "처리하지 못했습니다",
                  content: "잠시 후 다시 시도해 주세요.",
                  okText: "확인",
                })
              }
            >
              오류
            </Button>
          </Space>
        </Specimen>
        <Specimen
          title="확인 · Confirm dialog"
          spec="Modal.confirm · cancel / destructive action"
        >
          <Space wrap>
            <Button
              disabled={disabled}
              onClick={() =>
                modal.confirm({
                  title: "변경 사항을 적용할까요?",
                  content: "이 동작은 미리보기 안에서만 실행됩니다.",
                  icon: <ExclamationCircleOutlined />,
                  okText: "적용",
                  cancelText: "취소",
                  onOk: () => {
                    message.success("확인 동작이 실행되었습니다.");
                  },
                })
              }
            >
              컨펌 열기
            </Button>
            <Button
              danger
              disabled={disabled}
              onClick={() =>
                modal.confirm({
                  title: "콘텐츠를 삭제할까요?",
                  content:
                    "실제 데이터는 삭제되지 않습니다. 위험 행동의 확인 UI 예시입니다.",
                  okText: "삭제",
                  cancelText: "유지",
                  okButtonProps: { danger: true },
                  onOk: () => {
                    message.info("삭제 확인 예시입니다.");
                  },
                })
              }
            >
              삭제 컨펌
            </Button>
          </Space>
        </Specimen>
        <Specimen
          title="일반 모달·사이드 패널"
          spec="Modal · confirmLoading · Drawer"
        >
          <Space wrap>
            <Button disabled={disabled} onClick={() => setOpen(true)}>
              일반 모달 열기
            </Button>
            <Button disabled={disabled} onClick={() => setDrawer(true)}>
              드로어 열기
            </Button>
          </Space>
          <Modal
            title="멤버십 설정"
            open={open}
            confirmLoading={saving}
            okText="저장"
            cancelText="취소"
            onCancel={() => setOpen(false)}
            onOk={() => {
              setSaving(true);
              setTimeout(() => {
                setSaving(false);
                setOpen(false);
                message.success("저장 동작이 완료되었습니다.");
              }, 1000);
            }}
          >
            <p>설명, 폼 또는 추가 정보를 담는 기본 모달입니다.</p>
            <Alert
              type="info"
              showIcon
              message="저장 버튼을 누르면 로딩 상태를 확인할 수 있습니다."
            />
          </Modal>
          <Drawer
            title="상세 정보"
            open={drawer}
            onClose={() => setDrawer(false)}
            width={380}
          >
            <Descriptions
              column={1}
              items={[
                {
                  key: "name",
                  label: "크리에이터",
                  children: "소연의 스튜디오",
                },
                { key: "plan", label: "멤버십", children: "베이직" },
                {
                  key: "state",
                  label: "상태",
                  children: <Tag color="success">활성</Tag>,
                },
              ]}
            />
            <Divider />
            <p>목록의 맥락을 유지하면서 상세 내용을 보여줍니다.</p>
            <Button block onClick={() => setDrawer(false)}>
              닫기
            </Button>
          </Drawer>
        </Specimen>
        <Specimen
          title="툴팁·팝오버·간단 확인"
          spec="Tooltip · Popover · Popconfirm"
        >
          <Space wrap>
            <Tooltip title="입력한 정보는 공개 프로필에 표시됩니다.">
              <Button icon={<InfoCircleOutlined />} disabled={disabled}>
                툴팁
              </Button>
            </Tooltip>
            <Popover
              title="멤버십 안내"
              content={
                <p style={{ margin: 0 }}>매월 새로운 콘텐츠를 만나보세요.</p>
              }
              trigger="click"
            >
              <Button disabled={disabled}>팝오버 열기</Button>
            </Popover>
            <Popconfirm
              title="선택을 해제할까요?"
              description="다시 선택할 수 있습니다."
              okText="해제"
              cancelText="취소"
              disabled={disabled}
              onConfirm={() => message.success("선택 해제 예시입니다.")}
            >
              <Button disabled={disabled}>간단 확인</Button>
            </Popconfirm>
          </Space>
        </Specimen>
      </div>
    </CatalogSection>
  );
}

export function DataSection({ disabled }: { disabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const columns = [
    { title: "크리에이터", dataIndex: "name", key: "name" },
    { title: "분류", dataIndex: "category", key: "category" },
    {
      title: "멤버",
      dataIndex: "members",
      key: "members",
      sorter: (
        a: (typeof creatorRows)[number],
        b: (typeof creatorRows)[number],
      ) => a.members - b.members,
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "활성"
              ? "success"
              : status === "검토 중"
                ? "warning"
                : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];
  return (
    <CatalogSection
      id="data"
      number="08"
      title="데이터 표시"
      description="레코드·상태·수치에 따라 내용과 강조가 달라지는 기본 표시 요소입니다."
    >
      <div className={styles.grid}>
        <Specimen title="아바타·배지·태그" spec="Avatar · Badge · Tag">
          <div className={styles.stack}>
            <Space size={22}>
              <Avatar size={48} icon={<UserOutlined />} />
              <Avatar
                size={40}
                style={{ background: "#e8f3ff", color: "#1890ff" }}
              >
                SY
              </Avatar>
              <Badge count={8}>
                <Avatar shape="square" icon={<UserOutlined />} />
              </Badge>
              <Badge dot>
                <Avatar icon={<UserOutlined />} />
              </Badge>
            </Space>
            <Space wrap>
              <Tag>기본</Tag>
              <Tag color="processing">처리 중</Tag>
              <Tag color="success">완료</Tag>
              <Tag color="warning">주의</Tag>
              <Tag color="error">실패</Tag>
              <Tag closable>닫기 가능</Tag>
            </Space>
            <Space wrap>
              <Badge status="success" text="정상" />
              <Badge status="processing" text="처리 중" />
              <Badge status="error" text="오류" />
            </Space>
          </div>
        </Specimen>
        <Specimen title="카드·수치·속성" spec="Card · Statistic · Descriptions">
          <Card size="small" title="월간 활동" extra={<MoreOutlined />}>
            <Space size={32} wrap>
              <Statistic title="새로운 멤버" value={128} suffix="명" />
              <Statistic title="월간 수익" value={1284900} prefix="₩" />
            </Space>
            <Divider />
            <Descriptions
              size="small"
              column={1}
              items={[
                { key: "plan", label: "플랜", children: "베이직 멤버십" },
                {
                  key: "state",
                  label: "상태",
                  children: <Tag color="success">활성</Tag>,
                },
              ]}
            />
          </Card>
        </Specimen>
        <Specimen
          title="테이블 · 정렬·선택·로딩"
          spec="Table · rowSelection / sorter / pagination / loading"
          wide
        >
          <Space style={{ marginBottom: 16 }}>
            <Button
              disabled={disabled}
              onClick={() => setLoading((value) => !value)}
            >
              {loading ? "로딩 해제" : "로딩 표시"}
            </Button>
            <span className={styles.note}>
              행을 선택하거나 멤버 수를 정렬해 보세요.
            </span>
          </Space>
          <Table
            size="small"
            columns={columns}
            dataSource={creatorRows}
            loading={loading}
            rowSelection={{ getCheckboxProps: () => ({ disabled }) }}
            pagination={{ pageSize: 3, total: 3 }}
            scroll={{ x: 560 }}
          />
        </Specimen>
        <Specimen title="타임라인" spec="Timeline · state / color">
          <Timeline
            items={[
              { color: "green", children: "가입 완료 · 09:00" },
              { color: "blue", children: "프로필 설정 · 09:05" },
              {
                dot: <CheckCircleOutlined />,
                children: "첫 콘텐츠 공개 · 10:00",
              },
              { color: "gray", children: "다음 이야기를 기다립니다" },
            ]}
          />
        </Specimen>
        <Specimen title="접기·펼치기" spec="Collapse · activeKey / accordion">
          <Collapse
            defaultActiveKey={["one"]}
            items={[
              {
                key: "one",
                label: "멤버십은 어떻게 이용하나요?",
                children:
                  "좋아하는 크리에이터를 선택하고 멤버 전용 콘텐츠를 만나보세요.",
              },
              {
                key: "two",
                label: "결제 주기는 어떻게 되나요?",
                children: "선택한 멤버십의 결제 주기에 따라 안내됩니다.",
              },
              {
                key: "three",
                label: "사용할 수 없는 항목",
                collapsible: "disabled",
                children: "비활성 항목",
              },
            ]}
          />
        </Specimen>
      </div>
    </CatalogSection>
  );
}

export function NavigationSection({ disabled }: { disabled: boolean }) {
  return (
    <CatalogSection
      id="navigation"
      number="09"
      title="탐색과 구조"
      description="선택한 위치와 진행 단계를 전달하는 탐색 요소입니다."
    >
      <div className={styles.grid}>
        <Specimen title="탭과 분할 선택" spec="Tabs · Segmented">
          <Tabs
            defaultActiveKey="one"
            items={[
              {
                key: "one",
                label: "콘텐츠",
                children: "선택한 탭의 콘텐츠가 표시됩니다.",
              },
              {
                key: "two",
                label: "소개",
                children: "소개 탭의 콘텐츠입니다.",
              },
              { key: "three", label: "비활성", disabled: true, children: null },
            ]}
          />
          <Segmented
            style={{ marginTop: 16 }}
            options={["전체", "공개", "멤버십"]}
            disabled={disabled}
          />
        </Specimen>
        <Specimen title="경로·페이지네이션" spec="Breadcrumb · Pagination">
          <div className={styles.stack}>
            <Breadcrumb
              items={[
                { title: "홈" },
                { title: "크리에이터" },
                { title: "멤버십" },
              ]}
            />
            <Pagination
              defaultCurrent={2}
              total={50}
              size="small"
              disabled={disabled}
            />
            <Divider plain>콘텐츠 구분</Divider>
          </div>
        </Specimen>
        <Specimen title="메뉴와 드롭다운" spec="Menu · Dropdown">
          <Menu
            style={{ borderInlineEnd: 0 }}
            defaultSelectedKeys={["home"]}
            items={[
              { key: "home", label: "홈" },
              { key: "feed", label: "피드" },
              { key: "disabled", label: "비활성 메뉴", disabled: true },
            ]}
          />
          <Dropdown
            menu={{
              items: [
                { key: "edit", label: "편집" },
                { key: "copy", label: "링크 복사" },
                { type: "divider" },
                { key: "delete", label: "삭제", danger: true },
              ],
            }}
            disabled={disabled}
          >
            <Button style={{ marginTop: 12 }} disabled={disabled}>
              작업 메뉴 <DownOutlined />
            </Button>
          </Dropdown>
        </Specimen>
        <Specimen title="진행 단계" spec="Steps · current / status">
          <Steps
            direction="vertical"
            size="small"
            current={1}
            items={[
              { title: "정보 입력", description: "기본 정보를 확인했습니다." },
              {
                title: "플랜 선택",
                description: "원하는 플랜을 선택해 주세요.",
              },
              { title: "완료", description: "모든 설정이 완료됩니다." },
            ]}
          />
        </Specimen>
      </div>
    </CatalogSection>
  );
}
