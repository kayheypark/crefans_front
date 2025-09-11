"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Typography,
  Space,
  Progress,
  List,
  Avatar,
  Tag,
  Alert,
  Tabs,
  Table,
  Input,
  Select,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  HeartOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CrownOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import CreatorCenterLayout from "@/components/layout/CreatorCenterLayout";
import { postingApi } from "@/lib/api/posting";
import { PostingResponse, PostingStatus } from "@/types/posting";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/lib/api/user";
import { useCreatorGuard } from "@/hooks/useCreatorGuard";
import message from "antd/lib/message";

const { Title, Text } = Typography;

// 목업 데이터
const mockStats = {
  totalEarnings: 1250000,
  monthlyEarnings: 180000,
  totalMembers: 245,
  totalDonations: 320000,
  growthRate: 12.5,
  topEarningMonth: "2024년 1월",
};

const mockRecentEarnings = [
  {
    id: 1,
    type: "membership",
    amount: 50000,
    member: "김크리에이터",
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: 2,
    type: "donation",
    amount: 25000,
    member: "이후원자",
    date: "2024-01-14",
    status: "completed",
  },
  {
    id: 3,
    type: "membership",
    amount: 30000,
    member: "박구독자",
    date: "2024-01-13",
    status: "completed",
  },
];

export default function CreatorCenterPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";
  
  // 로그인 필수, 크리에이터 권한은 필요 없음 (홈은 누구나 접근 가능)
  const { isLoading, hasAccess } = useCreatorGuard({ 
    requiresLogin: true, 
    requiresCreator: false 
  });

  const [loading, setLoading] = useState(false);
  const [postings, setPostings] = useState<PostingResponse[]>([]);
  const [postingsLoading, setPostingsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 탭 변경 함수
  const handleTabChange = (key: string) => {
    router.push(`/creator-center?tab=${key}`);
  };

  // 크리에이터 전환 함수
  const handleBecomeCreator = async () => {
    setLoading(true);
    try {
      const response = await userAPI.becomeCreator();
      if (response.success) {
        message.success("크리에이터로 전환되었습니다!");
        await refreshUser();
      } else {
        message.error(response.message || "크리에이터 전환에 실패했습니다.");
      }
    } catch (error) {
      console.error("크리에이터 전환 실패:", error);
      message.error("크리에이터 전환에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 포스팅 목록 조회
  const fetchPostings = async (page: number = 1, pageSize: number = 10) => {
    setPostingsLoading(true);
    try {
      const response = await postingApi.getMyPostings({
        page,
        limit: pageSize,
      });

      if (response.success) {
        setPostings(response.data.postings);
        setPagination({
          current: response.data.page,
          pageSize: response.data.limit,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error("포스팅 목록 조회 실패:", error);
    } finally {
      setPostingsLoading(false);
    }
  };

  // 포스팅 삭제
  const handleDeletePosting = async (id: string) => {
    try {
      await postingApi.deletePosting(id);
      fetchPostings(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("포스팅 삭제 실패:", error);
    }
  };

  // 포스팅 탭 활성화 시 데이터 로드
  useEffect(() => {
    if (user?.isCreator && activeTab === "posts") {
      fetchPostings();
    }
  }, [user?.isCreator, activeTab]);

  if (!user?.isCreator) {
    return (
      <CreatorCenterLayout>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
          <Card>
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <CrownOutlined
                style={{
                  fontSize: "64px",
                  color: "#1890ff",
                  marginBottom: "24px",
                }}
              />
              <Title level={2} style={{ marginBottom: "16px" }}>
                크리에이터로 전환하기
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: "16px",
                  display: "block",
                  marginBottom: "32px",
                }}
              >
                크리에이터가 되어 팬들과 소통하고 수익을 창출해보세요. 멤버십,
                후원, 콘텐츠 판매 등 다양한 수익 모델을 활용할 수 있습니다.
              </Text>

              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div style={{ textAlign: "left" }}>
                  <Title level={4}>크리에이터 혜택</Title>
                  <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
                    <li>멤버십 구독 서비스 운영</li>
                    <li>팬들의 후원 받기</li>
                    <li>프리미엄 콘텐츠 판매</li>
                    <li>상세한 수익 분석 및 통계</li>
                    <li>크리에이터 전용 도구 및 기능</li>
                  </ul>
                </div>

                <Button
                  type="primary"
                  size="large"
                  onClick={() => router.push("/creator-center/become-creator")}
                  style={{
                    height: "48px",
                    fontSize: "16px",
                    minWidth: "200px",
                  }}
                >
                  크리에이터로 전환하기
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </CreatorCenterLayout>
    );
  }

  // 포스팅 테이블 컬럼 정의
  const postingColumns = [
    {
      title: "제목",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: PostingResponse) => (
        <div>
          <div>{text}</div>
          {record.isMembership && <Tag color="gold">멤버십 전용</Tag>}
        </div>
      ),
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status: PostingStatus) => {
        const statusMap = {
          [PostingStatus.DRAFT]: { color: "default", text: "임시저장" },
          [PostingStatus.PUBLISHED]: { color: "success", text: "발행됨" },
          [PostingStatus.ARCHIVED]: { color: "warning", text: "보관됨" },
        };
        const config = statusMap[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "조회수",
      dataIndex: "total_view_count",
      key: "total_view_count",
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: "좋아요",
      dataIndex: "like_count",
      key: "like_count",
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: "작성일",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "작업",
      key: "actions",
      render: (record: PostingResponse) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/post/${record.id}`)}
          >
            보기
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              router.push(`/creator-center/write?edit=${record.id}`)
            }
          >
            수정
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePosting(record.id)}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <CreatorCenterLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{ marginBottom: "24px" }}>
          <Title level={2} style={{ margin: 0 }}>
            크리에이터 센터
          </Title>
          <Text type="secondary">
            크리에이터 활동 현황과 콘텐츠를 관리하세요
          </Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: "dashboard",
              label: "대시보드",
              children: (
                <div>
                  {/* 통계 카드 */}
                  <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="총 수익"
                          value={mockStats.totalEarnings}
                          prefix={<DollarOutlined />}
                          suffix="원"
                          valueStyle={{ color: "#3f8600" }}
                        />
                        <div style={{ marginTop: "8px" }}>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            <ArrowUpOutlined style={{ color: "#3f8600" }} />{" "}
                            {mockStats.growthRate}%
                          </Text>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="이번 달 수익"
                          value={mockStats.monthlyEarnings}
                          prefix={<DollarOutlined />}
                          suffix="원"
                          valueStyle={{ color: "#1890ff" }}
                        />
                        <div style={{ marginTop: "8px" }}>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            최고 수익: {mockStats.topEarningMonth}
                          </Text>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="총 멤버"
                          value={mockStats.totalMembers}
                          prefix={<UserOutlined />}
                          suffix="명"
                          valueStyle={{ color: "#722ed1" }}
                        />
                        <div style={{ marginTop: "8px" }}>
                          <Progress
                            percent={75}
                            size="small"
                            showInfo={false}
                            strokeColor="#722ed1"
                          />
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="총 후원"
                          value={mockStats.totalDonations}
                          prefix={<HeartOutlined />}
                          suffix="원"
                          valueStyle={{ color: "#eb2f96" }}
                        />
                        <div style={{ marginTop: "8px" }}>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            평균 후원: 15,000원
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  {/* 수익 차트 및 최근 활동 */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={16}>
                      <Card title="월별 수익 추이" style={{ height: "400px" }}>
                        <div
                          style={{
                            height: "300px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <TrophyOutlined
                              style={{
                                fontSize: "48px",
                                color: "#1890ff",
                                marginBottom: "16px",
                              }}
                            />
                            <Text type="secondary">
                              차트 컴포넌트가 여기에 표시됩니다
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              (Chart.js 또는 Recharts 등으로 구현 예정)
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                      <Card title="최근 수익" style={{ height: "400px" }}>
                        <List
                          dataSource={mockRecentEarnings}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <Avatar
                                    style={{
                                      backgroundColor:
                                        item.type === "membership"
                                          ? "#1890ff"
                                          : "#eb2f96",
                                    }}
                                    icon={
                                      item.type === "membership" ? (
                                        <UserOutlined />
                                      ) : (
                                        <HeartOutlined />
                                      )
                                    }
                                  />
                                }
                                title={
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text strong>{item.member}</Text>
                                    <Text strong style={{ color: "#3f8600" }}>
                                      +{item.amount.toLocaleString()}원
                                    </Text>
                                  </div>
                                }
                                description={
                                  <div>
                                    <Tag
                                      color={
                                        item.type === "membership"
                                          ? "blue"
                                          : "pink"
                                      }
                                    >
                                      {item.type === "membership"
                                        ? "멤버십"
                                        : "후원"}
                                    </Tag>
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: "12px" }}
                                    >
                                      {item.date}
                                    </Text>
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* 알림 */}
                  <Alert
                    message="크리에이터 센터가 성공적으로 설정되었습니다!"
                    description="이제 멤버십 관리, 후원 관리, 수익 분석 등 다양한 기능을 사용할 수 있습니다."
                    type="success"
                    showIcon
                    style={{ marginTop: "24px" }}
                  />
                </div>
              ),
            },
            {
              key: "posts",
              label: "포스팅 관리",
              children: (
                <div>
                  <div
                    style={{
                      marginBottom: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Title level={3} style={{ margin: 0 }}>
                        포스팅 관리
                      </Title>
                      <Text type="secondary">작성한 포스팅을 관리하세요</Text>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => router.push("/creator-center/write")}
                    >
                      새 포스팅 작성
                    </Button>
                  </div>

                  <Card>
                    <Table
                      columns={postingColumns}
                      dataSource={postings}
                      loading={postingsLoading}
                      rowKey="id"
                      pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        onChange: fetchPostings,
                      }}
                    />
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </div>
    </CreatorCenterLayout>
  );
}