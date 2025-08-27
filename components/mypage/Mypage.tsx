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
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import NicknameModal from "@/components/modals/NicknameModal";
import HandleModal from "@/components/modals/HandleModal";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal";
import { formatPhoneNumber } from "@/lib/utils/phoneUtils";

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;

export default function Mypage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showHandleModal, setShowHandleModal] = useState(false);

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
        width: 800,
        margin: "0",
        paddingLeft: 32,
        paddingRight: 32,
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
              router.push(`/mypage?${params.toString()}`);
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
                      {user?.attributes.preferred_username || "핸들이 없습니다"}
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
                      등록된 결제 수단
                    </div>
                    <div style={{ fontSize: 16, color: "#222" }}>
                      등록된 결제 수단이 없습니다
                    </div>
                  </div>
                  <Button type="primary" size="small">
                    추가
                  </Button>
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
    </Layout>
  );
}
