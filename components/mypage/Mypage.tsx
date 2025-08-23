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

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;

export default function Mypage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [nicknameForm] = Form.useForm();
  const [handleForm] = Form.useForm();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // 쿼리스트링에서 탭 정보 가져오기, 기본값은 "basic"
  const selectedMenu = searchParams.get("tab") || "basic";

  const handleNicknameSave = async () => {
    try {
      const values = await nicknameForm.validateFields();
      // TODO: API 호출로 닉네임 업데이트
      message.success("닉네임이 성공적으로 변경되었습니다.");
      setShowNicknameModal(false);
      nicknameForm.resetFields();
    } catch (error) {
      message.error("닉네임 변경에 실패했습니다.");
    }
  };

  const handleHandleSave = async () => {
    try {
      const values = await handleForm.validateFields();
      // TODO: API 호출로 핸들 업데이트
      message.success("핸들이 성공적으로 변경되었습니다.");
      setShowHandleModal(false);
      handleForm.resetFields();
    } catch (error) {
      message.error("핸들 변경에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    logout();
    message.success("로그아웃 되었습니다.");
    router.push("/home");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "삭제") {
      message.error("정확히 '삭제'를 입력해주세요.");
      return;
    }
    // TODO: 계정 삭제 API 호출
    message.success("계정이 삭제되었습니다.");
    setShowDeleteModal(false);
    setDeleteConfirmText("");
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
                      {user?.attributes.phone_number || "미인증"}
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

      {/* 닉네임 변경 모달 */}
      <Modal
        title="닉네임 변경"
        open={showNicknameModal}
        onOk={handleNicknameSave}
        onCancel={() => {
          setShowNicknameModal(false);
          nicknameForm.resetFields();
        }}
        okText="변경"
        cancelText="취소"
      >
        <Form form={nicknameForm} layout="vertical">
          <Form.Item
            label="새 닉네임"
            name="nickname"
            rules={[{ required: true, message: "닉네임을 입력해주세요" }]}
            initialValue={user?.attributes.nickname || ""}
          >
            <Input placeholder="새 닉네임을 입력하세요" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 핸들 변경 모달 */}
      <Modal
        title="핸들 변경"
        open={showHandleModal}
        onOk={handleHandleSave}
        onCancel={() => {
          setShowHandleModal(false);
          handleForm.resetFields();
        }}
        okText="변경"
        cancelText="취소"
      >
        <Form form={handleForm} layout="vertical">
          <Form.Item
            label="새 핸들"
            name="preferred_username"
            rules={[
              { required: true, message: "핸들을 입력해주세요" },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "영문, 숫자, 언더스코어만 사용 가능합니다",
              },
            ]}
            initialValue={user?.attributes.preferred_username || ""}
          >
            <Input
              placeholder="새 핸들을 입력하세요"
              size="large"
              addonBefore="@"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 계정 삭제 확인 모달 */}
      <Modal
        title="계정 삭제 확인"
        open={showDeleteModal}
        onOk={handleDeleteAccount}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText("");
        }}
        okText="삭제"
        cancelText="취소"
        okButtonProps={{
          danger: true,
          disabled: deleteConfirmText !== "삭제",
        }}
      >
        <Paragraph>
          정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든
          데이터가 영구적으로 삭제됩니다.
        </Paragraph>
        <Paragraph>계정을 삭제하면:</Paragraph>
        <ul>
          <li>모든 개인 정보가 삭제됩니다</li>
          <li>업로드한 콘텐츠가 삭제됩니다</li>
          <li>보유한 콩이 환불되지 않습니다</li>
          <li>구독 정보가 모두 해지됩니다</li>
        </ul>
        <Divider />
        <div>
          <Paragraph style={{ marginBottom: 8 }}>
            계정을 삭제하려면 아래에 <Text strong>"삭제"</Text>를 입력하세요:
          </Paragraph>
          <Input
            placeholder="삭제"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            style={{ marginBottom: 16 }}
          />
        </div>
      </Modal>
    </Layout>
  );
}
