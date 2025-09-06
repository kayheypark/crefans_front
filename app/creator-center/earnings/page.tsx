"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Tag,
  Space,
  DatePicker,
  Select,
  Button,
  Tabs,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  HeartOutlined,
  ArrowUpOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import CreatorCenterLayout from "@/components/layout/CreatorCenterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 목업 데이터
const mockEarningsData = [
  {
    key: "1",
    date: "2024-01-15",
    type: "membership",
    member: "김크리에이터",
    amount: 50000,
    status: "completed",
    description: "프리미엄 멤버십 구독",
  },
  {
    key: "2",
    date: "2024-01-14",
    type: "donation",
    member: "이후원자",
    amount: 25000,
    status: "completed",
    description: "후원",
  },
  {
    key: "3",
    date: "2024-01-13",
    type: "membership",
    member: "박구독자",
    amount: 30000,
    status: "completed",
    description: "베이직 멤버십 구독",
  },
  {
    key: "4",
    date: "2024-01-12",
    type: "donation",
    member: "최후원자",
    amount: 15000,
    status: "completed",
    description: "후원",
  },
  {
    key: "5",
    date: "2024-01-11",
    type: "membership",
    member: "정구독자",
    amount: 50000,
    status: "pending",
    description: "프리미엄 멤버십 구독",
  },
];

const mockMonthlyStats = {
  totalEarnings: 170000,
  membershipEarnings: 130000,
  donationEarnings: 40000,
  growthRate: 15.2,
  totalTransactions: 5,
};

const columns = [
  {
    title: "날짜",
    dataIndex: "date",
    key: "date",
    sorter: (a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime(),
  },
  {
    title: "유형",
    dataIndex: "type",
    key: "type",
    render: (type: string) => (
      <Tag color={type === "membership" ? "blue" : "pink"}>
        {type === "membership" ? "멤버십" : "후원"}
      </Tag>
    ),
  },
  {
    title: "멤버",
    dataIndex: "member",
    key: "member",
  },
  {
    title: "금액",
    dataIndex: "amount",
    key: "amount",
    render: (amount: number) => (
      <Text strong style={{ color: "#3f8600" }}>
        +{amount.toLocaleString()}원
      </Text>
    ),
    sorter: (a: any, b: any) => a.amount - b.amount,
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
    title: "설명",
    dataIndex: "description",
    key: "description",
  },
];

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedType, setSelectedType] = useState("all");

  return (
    <CreatorCenterLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{ marginBottom: "24px" }}>
          <Title level={2} style={{ margin: 0 }}>
            수익 관리
          </Title>
          <Text type="secondary">
            멤버십 및 후원 수익을 확인하고 관리하세요
          </Text>
        </div>

        {/* 필터 및 액션 */}
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
              <Text strong>유형 필터:</Text>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: "100%", marginTop: "8px" }}
                options={[
                  { value: "all", label: "전체" },
                  { value: "membership", label: "멤버십" },
                  { value: "donation", label: "후원" },
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
            <Col xs={24} sm={24} md={6}>
              <Space style={{ marginTop: "32px" }}>
                <Button icon={<DownloadOutlined />}>내보내기</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 통계 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="총 수익"
                value={mockMonthlyStats.totalEarnings}
                prefix={<DollarOutlined />}
                suffix="원"
                valueStyle={{ color: "#3f8600" }}
              />
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  <ArrowUpOutlined style={{ color: "#3f8600" }} />{" "}
                  {mockMonthlyStats.growthRate}%
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="멤버십 수익"
                value={mockMonthlyStats.membershipEarnings}
                prefix={<UserOutlined />}
                suffix="원"
                valueStyle={{ color: "#1890ff" }}
              />
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  전체 수익의 76.5%
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="후원 수익"
                value={mockMonthlyStats.donationEarnings}
                prefix={<HeartOutlined />}
                suffix="원"
                valueStyle={{ color: "#eb2f96" }}
              />
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  전체 수익의 23.5%
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="총 거래 수"
                value={mockMonthlyStats.totalTransactions}
                suffix="건"
                valueStyle={{ color: "#722ed1" }}
              />
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  평균 거래액: 34,000원
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 수익 차트 및 상세 내역 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="수익 추이" style={{ height: "400px" }}>
              <div
                style={{
                  height: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <ArrowUpOutlined
                    style={{
                      fontSize: "48px",
                      color: "#1890ff",
                      marginBottom: "16px",
                    }}
                  />
                  <Text type="secondary">수익 차트가 여기에 표시됩니다</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    (Chart.js 또는 Recharts 등으로 구현 예정)
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="수익 분포" style={{ height: "400px" }}>
              <div
                style={{
                  height: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <DollarOutlined
                    style={{
                      fontSize: "48px",
                      color: "#52c41a",
                      marginBottom: "16px",
                    }}
                  />
                  <Text type="secondary">
                    수익 분포 차트가 여기에 표시됩니다
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    (파이 차트 또는 도넛 차트)
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 수익 내역 테이블 */}
        <Card title="수익 내역" style={{ marginTop: "24px" }}>
          <Tabs defaultActiveKey="all">
            <TabPane tab="전체" key="all">
              <Table
                columns={columns}
                dataSource={mockEarningsData}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} / 총 ${total}건`,
                }}
              />
            </TabPane>
            <TabPane tab="멤버십" key="membership">
              <Table
                columns={columns}
                dataSource={mockEarningsData.filter(
                  (item) => item.type === "membership"
                )}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} / 총 ${total}건`,
                }}
              />
            </TabPane>
            <TabPane tab="후원" key="donation">
              <Table
                columns={columns}
                dataSource={mockEarningsData.filter(
                  (item) => item.type === "donation"
                )}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} / 총 ${total}건`,
                }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </CreatorCenterLayout>
  );
}
