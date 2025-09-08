"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Statistic,
  Avatar,
  List,
  Divider,
} from "antd";
import {
  HeartOutlined,
  UserOutlined,
  DollarOutlined,
  MessageOutlined,
  GiftOutlined,
  StarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import CreatorCenterLayout from "@/components/layout/CreatorCenterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCreatorGuard } from "@/hooks/useCreatorGuard";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// 목업 데이터
const mockDonations = [
  {
    id: 1,
    donorName: "김후원자",
    donorAvatar: null,
    amount: 50000,
    message: "항상 응원하고 있어요! 좋은 콘텐츠 감사합니다.",
    date: "2024-01-15",
    status: "completed",
    isAnonymous: false,
    tier: "gold",
  },
  {
    id: 2,
    donorName: "익명 후원자",
    donorAvatar: null,
    amount: 25000,
    message: "",
    date: "2024-01-14",
    status: "completed",
    isAnonymous: true,
    tier: "silver",
  },
  {
    id: 3,
    donorName: "이후원자",
    donorAvatar: null,
    amount: 100000,
    message: "크리에이터님의 열정이 느껴져요. 더 멋진 콘텐츠 기대합니다!",
    date: "2024-01-13",
    status: "completed",
    isAnonymous: false,
    tier: "platinum",
  },
  {
    id: 4,
    donorName: "박후원자",
    donorAvatar: null,
    amount: 15000,
    message: "응원합니다!",
    date: "2024-01-12",
    status: "pending",
    isAnonymous: false,
    tier: "bronze",
  },
];

const mockDonationStats = {
  totalDonations: 190000,
  monthlyDonations: 190000,
  totalDonors: 4,
  averageDonation: 47500,
  topDonor: "이후원자",
  topDonationAmount: 100000,
};

const donationTiers = {
  bronze: { min: 0, max: 29999, color: "#cd7f32", name: "브론즈" },
  silver: { min: 30000, max: 99999, color: "#c0c0c0", name: "실버" },
  gold: { min: 100000, max: 299999, color: "#ffd700", name: "골드" },
  platinum: { min: 300000, max: 999999, color: "#e5e4e2", name: "플래티넘" },
};

export default function DonationsPage() {
  // 로그인 및 크리에이터 권한 필수
  const { isLoading, hasAccess } = useCreatorGuard({ 
    requiresLogin: true, 
    requiresCreator: true 
  });

  const [donations, setDonations] = useState(mockDonations);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [form] = Form.useForm();

  const donationColumns = [
    {
      title: "후원자",
      key: "donor",
      render: (_: any, record: any) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            src={record.donorAvatar}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.isAnonymous ? "익명 후원자" : record.donorName}
            </div>
            {record.isAnonymous && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                익명
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "금액",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: any) => (
        <div>
          <Text strong style={{ color: "#3f8600", fontSize: "16px" }}>
            {amount.toLocaleString()}원
          </Text>
          <div>
            <Tag
              color={
                donationTiers[record.tier as keyof typeof donationTiers]?.color
              }
              style={{ fontSize: "10px", marginTop: "4px" }}
            >
              {donationTiers[record.tier as keyof typeof donationTiers]?.name}
            </Tag>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
    {
      title: "메시지",
      dataIndex: "message",
      key: "message",
      render: (message: string) => (
        <div style={{ maxWidth: 200 }}>
          {message ? (
            <Text ellipsis={{ tooltip: message }}>{message}</Text>
          ) : (
            <Text type="secondary">메시지 없음</Text>
          )}
        </div>
      ),
    },
    {
      title: "날짜",
      dataIndex: "date",
      key: "date",
      sorter: (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "completed" ? "green" : "orange"}>
          {status === "completed" ? "완료" : "대기중"}
        </Tag>
      ),
    },
    {
      title: "액션",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          {record.message && (
            <Button
              type="text"
              icon={<MessageOutlined />}
              onClick={() => handleViewMessage(record)}
            />
          )}
          <Button
            type="text"
            icon={<HeartOutlined />}
            onClick={() => handleThankYou(record)}
          />
        </Space>
      ),
    },
  ];

  const handleViewMessage = (donation: any) => {
    Modal.info({
      title: "후원 메시지",
      content: (
        <div>
          <Text strong>{donation.donorName}님의 메시지:</Text>
          <div
            style={{
              marginTop: "8px",
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: "6px",
            }}
          >
            {donation.message}
          </div>
        </div>
      ),
    });
  };

  const handleThankYou = (donation: any) => {
    setSelectedDonation(donation);
    form.resetFields();
    setIsThankYouModalOpen(true);
  };

  const handleThankYouSubmit = async () => {
    try {
      const values = await form.validateFields();
      message.success("감사 메시지가 전송되었습니다.");
      setIsThankYouModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("폼 검증 실패:", error);
    }
  };

  const filteredDonations = donations.filter((donation) => {
    if (selectedStatus !== "all" && donation.status !== selectedStatus) {
      return false;
    }
    return true;
  });

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
            후원 관리
          </Title>
          <Text type="secondary">
            후원자들의 후원 내역을 확인하고 감사 메시지를 전송하세요
          </Text>
        </div>

        {/* 필터 */}
        <Card style={{ marginBottom: "24px" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Text strong>기간 선택:</Text>
              <Select
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                style={{ width: "100%", marginTop: "8px" }}
                options={[
                  { value: "week", label: "최근 1주" },
                  { value: "month", label: "최근 1개월" },
                  { value: "quarter", label: "최근 3개월" },
                  { value: "year", label: "최근 1년" },
                ]}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Text strong>상태 필터:</Text>
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: "100%", marginTop: "8px" }}
                options={[
                  { value: "all", label: "전체" },
                  { value: "completed", label: "완료" },
                  { value: "pending", label: "대기중" },
                ]}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Text strong>날짜 범위:</Text>
              <RangePicker
                style={{ width: "100%", marginTop: "8px" }}
                placeholder={["시작일", "종료일"]}
              />
            </Col>
          </Row>
        </Card>

        {/* 통계 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="총 후원금"
                value={mockDonationStats.totalDonations}
                prefix={<DollarOutlined />}
                suffix="원"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="이번 달 후원금"
                value={mockDonationStats.monthlyDonations}
                prefix={<HeartOutlined />}
                suffix="원"
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="총 후원자"
                value={mockDonationStats.totalDonors}
                prefix={<UserOutlined />}
                suffix="명"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="평균 후원금"
                value={mockDonationStats.averageDonation}
                prefix={<GiftOutlined />}
                suffix="원"
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* 후원 등급 정보 */}
        <Card title="후원 등급" style={{ marginBottom: "24px" }}>
          <Row gutter={[16, 16]}>
            {Object.entries(donationTiers).map(([key, tier]) => (
              <Col xs={12} sm={6} key={key}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    border: `2px solid ${tier.color}`,
                    borderRadius: "8px",
                    background: `${tier.color}15`,
                  }}
                >
                  <StarOutlined
                    style={{ color: tier.color, fontSize: "24px" }}
                  />
                  <div style={{ marginTop: "8px" }}>
                    <Text strong style={{ color: tier.color }}>
                      {tier.name}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {tier.min.toLocaleString()}원 이상
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 후원 내역 테이블 */}
        <Card title="후원 내역">
          <Table
            columns={donationColumns}
            dataSource={filteredDonations}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / 총 ${total}건`,
            }}
          />
        </Card>

        {/* 감사 메시지 모달 */}
        <Modal
          title="감사 메시지 전송"
          open={isThankYouModalOpen}
          onOk={handleThankYouSubmit}
          onCancel={() => {
            setIsThankYouModalOpen(false);
            form.resetFields();
          }}
          width={500}
        >
          {selectedDonation && (
            <div style={{ marginBottom: "16px" }}>
              <Text strong>
                {selectedDonation.isAnonymous
                  ? "익명 후원자"
                  : selectedDonation.donorName}
                님께
              </Text>
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary">
                  후원금: {selectedDonation.amount.toLocaleString()}원
                </Text>
              </div>
            </div>
          )}

          <Form form={form} layout="vertical">
            <Form.Item
              name="message"
              label="감사 메시지"
              rules={[
                { required: true, message: "감사 메시지를 입력해주세요" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="후원자님께 전달할 감사 메시지를 작성해주세요..."
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </CreatorCenterLayout>
  );
}
