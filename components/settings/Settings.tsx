"use client";

import React, { useState } from "react";
import {
  Typography,
  Button,
  Avatar,
  Card,
  Form,
  Input,
  Space,
  message,
  Modal,
  Row,
  Col,
  Tag,
  Divider,
  Layout,
  Menu,
  Checkbox,
  Dropdown,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import {
  UserOutlined,
  EditOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useResponsive } from "@/hooks/useResponsive";
import NicknameModal from "@/components/modals/NicknameModal";
import HandleModal from "@/components/modals/HandleModal";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal";
import { formatPhoneNumber } from "@/lib/utils/phoneUtils";
import Spacings from "@/lib/constants/spacings";

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;

export default function Settings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // 디버깅용: 모달 상태 변화 모니터링
  React.useEffect(() => {
    console.log("결제수단 모달 상태 변경:", showPaymentMethodModal);
  }, [showPaymentMethodModal]);

  // 결제수단 데이터 로드
  React.useEffect(() => {
    setLoadingPaymentMethods(true);
    fetch("/mock/paymentMethods.json")
      .then((res) => res.json())
      .then((data) => {
        setPaymentMethods(data);
        setLoadingPaymentMethods(false);
      })
      .catch((error) => {
        console.error("결제수단 데이터 로드 실패:", error);
        setLoadingPaymentMethods(false);
      });
  }, []);

  // 쿼리스트링에서 탭 정보 가져오기, 기본값은 "basic"
  const selectedMenu = searchParams.get("tab") || "basic";

  const handleLogout = () => {
    logout();
    message.success("로그아웃 되었습니다.");
    router.push("/home");
  };

  const handleDeleteAccount = () => {
    // TODO: 계정 삭제 API 호출
    message.success("계정이 삭제되었습니다.");
    setShowDeleteModal(false);
    logout();
    router.push("/home");
  };

  const handleAddPaymentMethod = (values: any) => {
    // TODO: 결제수단 추가 API 호출
    console.log("결제수단 추가:", values);

    // 기본 결제수단으로 설정하는 경우, 기존 기본 결제수단을 false로 변경
    if (values.isDefault) {
      setPaymentMethods((prev) =>
        prev.map((method) => ({ ...method, isDefault: false }))
      );
    }

    // 새 결제수단 추가 (목업데이터에 추가)
    const newPaymentMethod = {
      id: Date.now(), // 임시 ID 생성
      type: "card",
      cardType: "unknown",
      cardNumber: `****-****-****-${values.cardNumber.slice(-4)}`,
      cardholderName: values.cardholderName,
      expiryDate: values.expiryDate,
      alias: values.cardAlias || "새 카드",
      isDefault: values.isDefault,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setPaymentMethods((prev) => [...prev, newPaymentMethod]);
    message.success("결제수단이 추가되었습니다.");
    setShowPaymentMethodModal(false);
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "50px 20px" }}>
        <Title level={3}>로그인이 필요합니다</Title>
        <Button type="primary" onClick={() => router.push("/home")}>
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <Layout
      style={{
        width: "100%",
        margin: "0",
        paddingLeft: Spacings.CONTENT_LAYOUT_PADDING,
        paddingRight: Spacings.CONTENT_LAYOUT_PADDING,
        background: "transparent",
      }}
    >
      {/* 프로필 섹션 */}
      <Card
        style={{
          marginBottom: 16,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar
            src={user.attributes.picture || "/profile-90.png"}
            size={64}
            style={{ border: "3px solid #f0f0f0" }}
          />
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
              {user.attributes.nickname}
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              @{user.attributes.preferred_username || "핸들이 없습니다"}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="blue" style={{ fontSize: 11 }}>
                일반 회원
              </Tag>
            </div>
          </div>
        </div>
      </Card>

      {/* 모바일/태블릿용 가로 메뉴 */}
      {isMobile || isTablet ? (
        <Card
          style={{
            marginBottom: 16,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              padding: "4px 0",
            }}
          >
            {[
              {
                key: "basic",
                icon: <UserOutlined />,
                label: "기본정보",
              },
              {
                key: "payment",
                icon: <CreditCardOutlined />,
                label: "결제",
              },
              {
                key: "danger",
                icon: <ExclamationCircleOutlined />,
                label: "위험구역",
              },
            ].map((item) => (
              <Button
                key={item.key}
                type={selectedMenu === item.key ? "primary" : "default"}
                icon={item.icon}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("tab", item.key);
                  router.push(`/settings?${params.toString()}`);
                }}
                style={{
                  whiteSpace: "nowrap",
                  minWidth: "auto",
                  padding: "8px 16px",
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </Card>
      ) : (
        /* 데스크톱용 세로 메뉴 */
        <Layout style={{ background: "transparent" }}>
          <Sider
            width={200}
            style={{
              background: "transparent",
              marginRight: 24,
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[selectedMenu]}
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                background: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              onClick={({ key }) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("tab", key);
                router.push(`/settings?${params.toString()}`);
              }}
              items={[
                {
                  key: "basic",
                  icon: <UserOutlined />,
                  label: "기본정보",
                },
                {
                  key: "payment",
                  icon: <CreditCardOutlined />,
                  label: "결제",
                },
                {
                  key: "danger",
                  icon: <ExclamationCircleOutlined />,
                  label: "위험구역",
                },
              ]}
            />
          </Sider>

          <Content style={{ background: "transparent" }}>
            {selectedMenu === "basic" && (
              <Card
                title={
                  <Space>
                    <UserOutlined />
                    <span>기본 정보</span>
                  </Space>
                }
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ width: "100%" }}>
                  {/* 닉네임 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#8c8c8c",
                          marginBottom: 4,
                        }}
                      >
                        닉네임
                      </div>
                      <div style={{ fontSize: 16, color: "#222" }}>
                        {user?.attributes.nickname || "닉네임이 없습니다"}
                      </div>
                    </div>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => setShowNicknameModal(true)}
                    >
                      변경
                    </Button>
                  </div>

                  {/* 핸들 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#8c8c8c",
                          marginBottom: 4,
                        }}
                      >
                        핸들
                      </div>
                      <div style={{ fontSize: 16, color: "#222" }}>
                        @
                        {user?.attributes.preferred_username ||
                          "핸들이 없습니다"}
                      </div>
                    </div>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => setShowHandleModal(true)}
                    >
                      변경
                    </Button>
                  </div>

                  {/* 휴대폰 번호 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#8c8c8c",
                          marginBottom: 4,
                        }}
                      >
                        휴대폰 번호
                      </div>
                      <div style={{ fontSize: 16, color: "#222" }}>
                        {user?.attributes.phone_number
                          ? formatPhoneNumber(user.attributes.phone_number)
                          : "미인증"}
                      </div>
                    </div>
                    <Tag color="orange">미인증</Tag>
                  </div>

                  {/* 이메일 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#8c8c8c",
                          marginBottom: 4,
                        }}
                      >
                        이메일
                      </div>
                      <div style={{ fontSize: 16, color: "#222" }}>
                        {user?.attributes.email || "이메일이 없습니다"}
                      </div>
                    </div>
                    <Tag color="green">인증됨</Tag>
                  </div>

                  {/* 보유 콩 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#8c8c8c",
                          marginBottom: 4,
                        }}
                      >
                        보유 콩
                      </div>
                      <div style={{ fontSize: 16, color: "#222" }}>
                        {user.points?.toLocaleString() || 0} 콩
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {selectedMenu === "payment" && (
              <Card
                title={
                  <Space>
                    <CreditCardOutlined />
                    <span>결제</span>
                  </Space>
                }
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ width: "100%" }}>
                  {/* 결제 수단 */}
                  <div
                    style={{
                      padding: "16px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        color: "#8c8c8c",
                        marginBottom: 16,
                      }}
                    >
                      등록된 결제 수단
                    </div>
                    {loadingPaymentMethods ? (
                      <div style={{ fontSize: 16, color: "#222" }}>
                        로딩 중...
                      </div>
                    ) : paymentMethods.length > 0 ? (
                      <div>
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 8,
                              padding: "8px 12px",
                              border: "1px solid #f0f0f0",
                              borderRadius: "6px",
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: 14,
                                  color: "#222",
                                  fontWeight: 500,
                                }}
                              >
                                {method.alias}
                                {method.isDefault && (
                                  <Tag
                                    color="blue"
                                    style={{ marginLeft: 8, fontSize: 11 }}
                                  >
                                    기본
                                  </Tag>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: "#666" }}>
                                {method.cardNumber} • {method.cardholderName} •{" "}
                                {method.expiryDate}
                              </div>
                            </div>
                            <Dropdown
                              menu={{
                                items: [
                                  ...(!method.isDefault
                                    ? [
                                        {
                                          key: "setDefault",
                                          label: "기본으로 설정",
                                        },
                                      ]
                                    : []),
                                  {
                                    key: "delete",
                                    label: "삭제",
                                    danger: true,
                                  },
                                ],
                              }}
                              trigger={["click"]}
                              placement="bottomRight"
                            >
                              <Button
                                type="text"
                                icon={<MoreOutlined />}
                                style={{
                                  color: "#666",
                                  width: "32px",
                                  height: "32px",
                                }}
                              />
                            </Dropdown>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 16, color: "#222" }}>
                        등록된 결제 수단이 없습니다
                      </div>
                    )}

                    {/* 추가 버튼을 목록 아래에 별도로 배치 */}
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <Button
                        type="primary"
                        size="middle"
                        onClick={() => {
                          console.log("결제수단 추가 버튼 클릭됨");
                          setShowPaymentMethodModal(true);
                        }}
                        style={{
                          borderRadius: "20px",
                          paddingLeft: "24px",
                          paddingRight: "24px",
                        }}
                      >
                        + 결제수단 추가
                      </Button>
                    </div>
                  </div>

                  {/* 결제 이력 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#8c8c8c",
                          marginBottom: 4,
                        }}
                      >
                        결제 이력
                      </div>
                      <div style={{ fontSize: 16, color: "#222" }}>
                        결제 이력이 없습니다
                      </div>
                    </div>
                    <Button type="text" size="small">
                      전체보기
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {selectedMenu === "danger" && (
              <Card
                title={
                  <Space>
                    <ExclamationCircleOutlined />
                    <span>위험구역</span>
                  </Space>
                }
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="default"
                    size="large"
                    block
                    style={{ textAlign: "left", height: 48 }}
                    onClick={handleLogout}
                  >
                    로그아웃
                  </Button>
                  <Button
                    type="text"
                    danger
                    size="large"
                    block
                    style={{ textAlign: "left", height: 48 }}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    계정 삭제
                  </Button>
                </Space>
              </Card>
            )}
          </Content>
        </Layout>
      )}

      {/* 모바일/태블릿용 컨텐츠 영역 */}
      {(isMobile || isTablet) && (
        <div style={{ background: "transparent" }}>
          {selectedMenu === "basic" && (
            <Card
              title={
                <Space>
                  <UserOutlined />
                  <span>기본 정보</span>
                </Space>
              }
              style={{
                marginBottom: 16,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ width: "100%" }}>
                {/* 닉네임 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#8c8c8c",
                        marginBottom: 4,
                      }}
                    >
                      닉네임
                    </div>
                    <div style={{ fontSize: 16, color: "#222" }}>
                      {user?.attributes.nickname || "닉네임이 없습니다"}
                    </div>
                  </div>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => setShowNicknameModal(true)}
                  >
                    변경
                  </Button>
                </div>

                {/* 핸들 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#8c8c8c",
                        marginBottom: 4,
                      }}
                    >
                      핸들
                    </div>
                    <div style={{ fontSize: 16, color: "#222" }}>
                      @
                      {user?.attributes.preferred_username || "핸들이 없습니다"}
                    </div>
                  </div>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => setShowNicknameModal(true)}
                  >
                    변경
                  </Button>
                </div>

                {/* 휴대폰 번호 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#8c8c8c",
                        marginBottom: 4,
                      }}
                    >
                      휴대폰 번호
                    </div>
                    <div style={{ fontSize: 16, color: "#222" }}>
                      {user?.attributes.phone_number
                        ? formatPhoneNumber(user.attributes.phone_number)
                        : "미인증"}
                    </div>
                  </div>
                  <Tag color="orange">미인증</Tag>
                </div>

                {/* 이메일 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#8c8c8c",
                        marginBottom: 4,
                      }}
                    >
                      이메일
                    </div>
                    <div style={{ fontSize: 16, color: "#222" }}>
                      {user?.attributes.email || "이메일이 없습니다"}
                    </div>
                  </div>
                  <Tag color="green">인증됨</Tag>
                </div>

                {/* 보유 콩 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#8c8c8c",
                        marginBottom: 4,
                      }}
                    >
                      보유 콩
                    </div>
                    <div style={{ fontSize: 16, color: "#222" }}>
                      {user.points?.toLocaleString() || 0} 콩
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {selectedMenu === "payment" && (
            <Card
              title={
                <Space>
                  <CreditCardOutlined />
                  <span>결제</span>
                </Space>
              }
              style={{
                marginBottom: 16,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ width: "100%" }}>
                {/* 결제 수단 */}
                <div
                  style={{
                    padding: "16px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: "#8c8c8c",
                      marginBottom: 16,
                    }}
                  >
                    등록된 결제 수단
                  </div>
                  {loadingPaymentMethods ? (
                    <div style={{ fontSize: 16, color: "#222" }}>
                      로딩 중...
                    </div>
                  ) : paymentMethods.length > 0 ? (
                    <div>
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                            padding: "8px 12px",
                            border: "1px solid #f0f0f0",
                            borderRadius: "6px",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 14,
                                color: "#222",
                                fontWeight: 500,
                              }}
                            >
                              {method.alias}
                              {method.isDefault && (
                                <Tag
                                  color="blue"
                                  style={{ marginLeft: 8, fontSize: 11 }}
                                >
                                  기본
                                </Tag>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: "#666" }}>
                              {method.cardNumber} • {method.cardholderName} •{" "}
                              {method.expiryDate}
                            </div>
                          </div>
                          <Dropdown
                            menu={{
                              items: [
                                ...(!method.isDefault
                                  ? [
                                      {
                                        key: "setDefault",
                                        label: "기본으로 설정",
                                      },
                                    ]
                                  : []),
                                {
                                  key: "delete",
                                  label: "삭제",
                                  danger: true,
                                },
                              ],
                            }}
                            trigger={["click"]}
                            placement="bottomRight"
                          >
                            <Button
                              type="text"
                              icon={<MoreOutlined />}
                              style={{
                                color: "#666",
                                width: "32px",
                                height: "32px",
                              }}
                            />
                          </Dropdown>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: "#222" }}>
                      등록된 결제 수단이 없습니다
                    </div>
                  )}

                  {/* 추가 버튼을 목록 아래에 별도로 배치 */}
                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <Button
                      type="primary"
                      size="middle"
                      onClick={() => {
                        console.log("모바일 결제수단 추가 버튼 클릭됨");
                        setShowPaymentMethodModal(true);
                      }}
                      style={{
                        borderRadius: "20px",
                        paddingLeft: "24px",
                        paddingRight: "24px",
                      }}
                    >
                      + 결제수단 추가
                    </Button>
                  </div>
                </div>

                {/* 결제 이력 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#8c8c8c",
                        marginBottom: 4,
                      }}
                    >
                      결제 이력
                    </div>
                    <div style={{ fontSize: 16, color: "#222" }}>
                      결제 이력이 없습니다
                    </div>
                  </div>
                  <Button type="text" size="small">
                    전체보기
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {selectedMenu === "danger" && (
            <Card
              title={
                <Space>
                  <ExclamationCircleOutlined />
                  <span>위험구역</span>
                </Space>
              }
              style={{
                marginBottom: 16,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="default"
                  size="large"
                  block
                  style={{ textAlign: "left", height: 48 }}
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
                <Button
                  type="text"
                  danger
                  size="large"
                  block
                  style={{ textAlign: "left", height: 48 }}
                  onClick={() => setShowDeleteModal(true)}
                >
                  계정 삭제
                </Button>
              </Space>
            </Card>
          )}
        </div>
      )}

      <NicknameModal
        open={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        currentNickname={user?.attributes.nickname || ""}
      />

      <HandleModal
        open={showHandleModal}
        onClose={() => setShowHandleModal(false)}
        currentHandle={user?.attributes.preferred_username || ""}
      />

      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteAccount}
      />

      {/* 결제수단 추가 모달 */}
      <Modal
        title="결제수단 추가"
        open={showPaymentMethodModal}
        onCancel={() => setShowPaymentMethodModal(false)}
        footer={null}
        width={500}
        style={{ top: 20 }}
      >
        <Form layout="vertical" onFinish={handleAddPaymentMethod}>
          <Form.Item
            label="카드 번호"
            name="cardNumber"
            rules={[
              { required: true, message: "카드 번호를 입력해주세요" },
              {
                pattern: /^\d{4}-\d{4}-\d{4}-\d{4}$/,
                message:
                  "올바른 카드 번호 형식이 아닙니다 (XXXX-XXXX-XXXX-XXXX)",
              },
            ]}
          >
            <Input
              placeholder="0000-0000-0000-0000"
              maxLength={19}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const formatted = value.replace(/(\d{4})(?=\d)/g, "$1-");
                e.target.value = formatted;
              }}
            />
          </Form.Item>

          <Form.Item
            label="카드 소유자명"
            name="cardholderName"
            rules={[
              { required: true, message: "카드 소유자명을 입력해주세요" },
            ]}
          >
            <Input placeholder="카드에 표시된 이름" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="만료일"
                name="expiryDate"
                rules={[
                  { required: true, message: "만료일을 입력해주세요" },
                  {
                    pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                    message: "MM/YY 형식으로 입력해주세요",
                  },
                ]}
              >
                <Input
                  placeholder="MM/YY"
                  maxLength={5}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length >= 2) {
                      const month = value.substring(0, 2);
                      const year = value.substring(2, 4);
                      e.target.value = `${month}/${year}`;
                    } else {
                      e.target.value = value;
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="보안코드 (CVC)"
                name="cvc"
                rules={[
                  { required: true, message: "보안코드를 입력해주세요" },
                  {
                    pattern: /^\d{3,4}$/,
                    message: "3-4자리 숫자를 입력해주세요",
                  },
                ]}
              >
                <Input
                  placeholder="123"
                  maxLength={4}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="카드 별칭 (선택사항)" name="cardAlias">
            <Input placeholder="예: 개인카드, 회사카드" />
          </Form.Item>

          <Form.Item
            name="isDefault"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>이 카드를 기본 결제수단으로 설정</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setShowPaymentMethodModal(false)}>
                취소
              </Button>
              <Button type="primary" htmlType="submit">
                결제수단 추가
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
