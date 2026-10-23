"use client";
import { Form as UiForm, message as uiMessage } from "antd";

import CreatorCenterLayout from "@/components/layout/CreatorCenterLayout";
import { useMembershipsPageModel } from "@/features/creator-center-memberships/useMembershipsPageModel";
import {
  CrownOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";

const { Title, Text } = Typography;

export default function MembershipsPage() {
  const [form] = UiForm.useForm();
  const model = useMembershipsPageModel({ message: uiMessage, form });
  return <MembershipsPageView model={model} />;
}

function MembershipsPageView({
  model,
}: {
  model: ReturnType<typeof useMembershipsPageModel>;
}) {
  const {
    isLoading,
    hasAccess,
    memberships,
    subscribers,
    isModalOpen,
    setIsModalOpen,
    editingMembership,
    form,
    handleAdd,
    handleEdit,
    handleDelete,
    handleModalOk,
    totalSubscribers,
    totalRevenue,
  } = model;

  const membershipColumns = [
    {
      title: "레벨",
      dataIndex: "level",
      key: "level",
      render: (level: number) => (
        <Tag color="blue" icon={<CrownOutlined />}>
          Level {level}
        </Tag>
      ),
    },
    {
      title: "이름",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "가격",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <Text strong style={{ color: "#3f8600" }}>
          {price.toLocaleString()}원
        </Text>
      ),
    },
    {
      title: "구독자",
      dataIndex: "subscriberCount",
      key: "subscriberCount",
      render: (count: number) => (
        <Space>
          <UserOutlined />
          {count}명
        </Space>
      ),
    },
    {
      title: "월 수익",
      dataIndex: "monthlyRevenue",
      key: "monthlyRevenue",
      render: (revenue: number) => (
        <Text strong style={{ color: "#1890ff" }}>
          {revenue.toLocaleString()}원
        </Text>
      ),
    },
    {
      title: "상태",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "활성" : "비활성"}
        </Tag>
      ),
    },
    {
      title: "액션",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="멤버십을 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subscriberColumns = [
    {
      title: "이름",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "이메일",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "멤버십",
      dataIndex: "membershipName",
      key: "membershipName",
      render: (name: string, record: any) => (
        <Tag color="blue">
          Level {record.membershipLevel} - {name}
        </Tag>
      ),
    },
    {
      title: "가입일",
      dataIndex: "joinDate",
      key: "joinDate",
    },
    {
      title: "다음 결제일",
      dataIndex: "nextBillingDate",
      key: "nextBillingDate",
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "활성" : "취소됨"}
        </Tag>
      ),
    },
    {
      title: "총 결제액",
      dataIndex: "totalPaid",
      key: "totalPaid",
      render: (amount: number) => (
        <Text strong style={{ color: "#3f8600" }}>
          {amount.toLocaleString()}원
        </Text>
      ),
    },
  ];

  // 권한이 없으면 로딩 표시 또는 리다이렉트 처리
  if (isLoading || !hasAccess) {
    return <div>Loading...</div>;
  }

  return (
    <CreatorCenterLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{ marginBottom: "24px" }}>
          <Title level={2} style={{ margin: 0 }}>
            멤버십 관리
          </Title>
          <Text type="secondary">
            멤버십 등급을 설정하고 구독자를 관리하세요
          </Text>
        </div>

        {/* 통계 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="총 구독자"
                value={totalSubscribers}
                prefix={<UserOutlined />}
                suffix="명"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="월 수익"
                value={totalRevenue}
                prefix={<DollarOutlined />}
                suffix="원"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="활성 멤버십"
                value={memberships.filter((m) => m.isActive).length}
                suffix={`/ ${memberships.length}개`}
                valueStyle={{ color: "#722ed1" }}
              />
              <Progress
                percent={
                  (memberships.filter((m) => m.isActive).length /
                    memberships.length) *
                  100
                }
                size="small"
                showInfo={false}
                strokeColor="#722ed1"
              />
            </Card>
          </Col>
        </Row>

        {/* 멤버십 관리 */}
        <Card
          title="멤버십 등급"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              멤버십 추가
            </Button>
          }
          style={{ marginBottom: "24px" }}
        >
          <Table
            columns={membershipColumns}
            dataSource={memberships}
            rowKey="id"
            pagination={false}
          />
        </Card>

        {/* 구독자 관리 */}
        <Card title="구독자 목록">
          <Table
            columns={subscriberColumns}
            dataSource={subscribers}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / 총 ${total}명`,
            }}
          />
        </Card>

        {/* 멤버십 추가/수정 모달 */}
        <Modal
          title={editingMembership ? "멤버십 수정" : "멤버십 추가"}
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              isActive: true,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="멤버십 이름"
                  rules={[
                    { required: true, message: "멤버십 이름을 입력해주세요" },
                  ]}
                >
                  <Input placeholder="예: 베이직, 프리미엄" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="level"
                  label="레벨"
                  rules={[{ required: true, message: "레벨을 입력해주세요" }]}
                >
                  <InputNumber
                    min={1}
                    max={10}
                    style={{ width: "100%" }}
                    placeholder="1-10"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="price"
              label="월 가격 (원)"
              rules={[{ required: true, message: "가격을 입력해주세요" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="10000"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="설명"
              rules={[{ required: true, message: "설명을 입력해주세요" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="멤버십 혜택을 설명해주세요"
              />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="활성 상태"
              valuePropName="checked"
            >
              <Switch checkedChildren="활성" unCheckedChildren="비활성" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </CreatorCenterLayout>
  );
}
