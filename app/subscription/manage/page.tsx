"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Row,
  Col,
  message,
  Spin,
  Avatar,
  Table,
  Popconfirm,
  Empty,
  Statistic,
  Modal,
} from "antd";
import {
  CrownOutlined,
  UserOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionBillingAPI, MyBillingSubscription } from "@/lib/api/subscriptionBilling";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

export default function MySubscriptionsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [subscriptions, setSubscriptions] = useState<MyBillingSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);

  // 구독 목록 로드
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await subscriptionBillingAPI.getMyBillingSubscriptions();

        if (response.success && response.data) {
          setSubscriptions(response.data.subscriptions);
        } else {
          message.error(response.message || "구독 목록을 불러오는데 실패했습니다.");
        }
      } catch (error: any) {
        console.error("Failed to load subscriptions:", error);
        message.error("구독 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  // 구독 취소 처리
  const handleCancelSubscription = async (subscription: MyBillingSubscription) => {
    confirm({
      title: '구독을 취소하시겠습니까?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p><strong>{subscription.creator.name}</strong>의 <strong>{subscription.membershipItem.name}</strong> 멤버십 구독을 취소합니다.</p>
          <p>취소 후에는 다음 결제일부터 결제가 중단되며, 현재 결제 기간이 끝날 때까지는 멤버십 혜택을 이용할 수 있습니다.</p>
        </div>
      ),
      onOk: async () => {
        try {
          setCanceling(subscription.subscriptionId);

          const response = await subscriptionBillingAPI.cancelBillingSubscription(subscription.subscriptionId);

          if (response.success) {
            message.success('구독이 취소되었습니다.');

            // 구독 목록 새로고침
            const updatedResponse = await subscriptionBillingAPI.getMyBillingSubscriptions();
            if (updatedResponse.success && updatedResponse.data) {
              setSubscriptions(updatedResponse.data.subscriptions);
            }
          } else {
            message.error(response.message || '구독 취소에 실패했습니다.');
          }
        } catch (error: any) {
          console.error("Failed to cancel subscription:", error);
          message.error('구독 취소에 실패했습니다.');
        } finally {
          setCanceling(null);
        }
      },
    });
  };

  // 결제 주기 텍스트 변환
  const getBillingText = (unit: string, period: number) => {
    const unitMap: { [key: string]: string } = {
      DAY: "일",
      WEEK: "주",
      MONTH: "개월",
      YEAR: "년",
    };
    return `${period}${unitMap[unit] || unit}`;
  };

  // 구독 상태별 필터링
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'ACTIVE');
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'CANCELLED');
  const expiredSubscriptions = subscriptions.filter(sub => sub.status === 'EXPIRED');

  // 통계 계산
  const totalMonthlyAmount = activeSubscriptions.reduce((sum, sub) => sum + sub.membershipItem.price, 0);

  const columns = [
    {
      title: "크리에이터",
      key: "creator",
      render: (_: any, record: MyBillingSubscription) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            src={record.creator.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#f56a00" }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.creator.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              @{record.creator.handle}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "멤버십",
      key: "membership",
      render: (_: any, record: MyBillingSubscription) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.membershipItem.name}
          </div>
          <Text style={{ fontSize: 16, color: "#faad14", fontWeight: "bold" }}>
            {record.membershipItem.price.toLocaleString()}원
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {" "}/ {getBillingText(record.membershipItem.billing_unit, record.membershipItem.billing_period)}
          </Text>
        </div>
      ),
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: MyBillingSubscription) => {
        const statusMap = {
          ACTIVE: { color: "green", text: "활성" },
          CANCELLED: { color: "red", text: "취소됨" },
          EXPIRED: { color: "default", text: "만료됨" },
        };

        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: "default", text: status };

        return (
          <div>
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            {status === 'ACTIVE' && (
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                자동 갱신: {record.autoRenew ? "ON" : "OFF"}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "다음 결제일",
      key: "nextBilling",
      render: (_: any, record: MyBillingSubscription) => {
        if (record.status !== 'ACTIVE') {
          return record.cancelledAt
            ? new Date(record.cancelledAt).toLocaleDateString()
            : '-';
        }

        return (
          <div>
            <CalendarOutlined style={{ marginRight: 4, color: "#1890ff" }} />
            {new Date(record.nextBillingDate).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      title: "총 결제액",
      dataIndex: "totalPaidAmount",
      key: "totalPaidAmount",
      render: (amount: number) => (
        <Text style={{ color: "#52c41a", fontWeight: "500" }}>
          {amount.toLocaleString()}원
        </Text>
      ),
    },
    {
      title: "액션",
      key: "action",
      render: (_: any, record: MyBillingSubscription) => {
        if (record.status !== 'ACTIVE') {
          return '-';
        }

        return (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            loading={canceling === record.subscriptionId}
            onClick={() => handleCancelSubscription(record)}
          >
            취소
          </Button>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            <CrownOutlined style={{ marginRight: 8, color: "#faad14" }} />
            구독 관리
          </Title>
          <Text type="secondary">
            내가 구독 중인 멤버십을 관리하고 결제 내역을 확인하세요
          </Text>
        </div>

        {/* 통계 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="활성 구독"
                value={activeSubscriptions.length}
                prefix={<CrownOutlined />}
                suffix="개"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="월 구독료"
                value={totalMonthlyAmount}
                prefix={<DollarOutlined />}
                suffix="원"
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="총 구독 수"
                value={subscriptions.length}
                suffix="개"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        {/* 구독 목록 */}
        {subscriptions.length === 0 ? (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4} style={{ color: "#999" }}>
                    구독 중인 멤버십이 없습니다
                  </Title>
                  <Paragraph type="secondary">
                    다양한 크리에이터의 멤버십을 구독해보세요!
                  </Paragraph>
                </div>
              }
            >
              <Button type="primary" onClick={() => router.push('/')}>
                크리에이터 둘러보기
              </Button>
            </Empty>
          </Card>
        ) : (
          <div>
            {/* 활성 구독 */}
            {activeSubscriptions.length > 0 && (
              <Card
                title={
                  <Space>
                    <Tag color="green">활성</Tag>
                    <Text>구독 중인 멤버십</Text>
                  </Space>
                }
                style={{ marginBottom: 24 }}
              >
                <Table
                  columns={columns}
                  dataSource={activeSubscriptions}
                  rowKey="subscriptionId"
                  pagination={false}
                />
              </Card>
            )}

            {/* 취소된 구독 */}
            {cancelledSubscriptions.length > 0 && (
              <Card
                title={
                  <Space>
                    <Tag color="red">취소됨</Tag>
                    <Text>취소된 구독</Text>
                  </Space>
                }
                style={{ marginBottom: 24 }}
              >
                <Table
                  columns={columns}
                  dataSource={cancelledSubscriptions}
                  rowKey="subscriptionId"
                  pagination={false}
                />
              </Card>
            )}

            {/* 만료된 구독 */}
            {expiredSubscriptions.length > 0 && (
              <Card
                title={
                  <Space>
                    <Tag>만료됨</Tag>
                    <Text>만료된 구독</Text>
                  </Space>
                }
              >
                <Table
                  columns={columns}
                  dataSource={expiredSubscriptions}
                  rowKey="subscriptionId"
                  pagination={false}
                />
              </Card>
            )}
          </div>
        )}

        {/* 안내 메시지 */}
        <Card style={{ marginTop: 24, backgroundColor: "#f9f9f9" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <strong>구독 관리 안내:</strong>
            <br />
            • 구독을 취소하면 다음 결제일부터 자동결제가 중단됩니다.
            <br />
            • 취소 후에도 현재 결제 기간이 끝날 때까지는 멤버십 혜택을 이용할 수 있습니다.
            <br />
            • 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
          </Text>
        </Card>
      </div>
    </ProtectedRoute>
  );
}