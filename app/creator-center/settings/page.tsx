"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Switch,
  Button,
  Upload,
  Avatar,
  Divider,
  Space,
  message,
  Tabs,
  Select,
  InputNumber,
  Alert,
} from "antd";
import {
  UserOutlined,
  CameraOutlined,
  SettingOutlined,
  BellOutlined,
  DollarOutlined,
  LockOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import CreatorCenterLayout from "@/components/layout/CreatorCenterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function CreatorCenterSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("설정이 저장되었습니다.");
    } catch (error) {
      console.error("설정 저장 실패:", error);
      message.error("설정 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info("설정이 초기화되었습니다.");
  };

  return (
    <CreatorCenterLayout>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{ marginBottom: "24px" }}>
          <Title level={2} style={{ margin: 0 }}>
            크리에이터 설정
          </Title>
          <Text type="secondary">크리에이터 센터의 설정을 관리하세요</Text>
        </div>

        <Tabs defaultActiveKey="profile" type="card">
          {/* 프로필 설정 */}
          <TabPane
            tab={
              <span>
                <UserOutlined />
                프로필
              </span>
            }
            key="profile"
          >
            <Card>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  displayName: "크리에이터",
                  bio: "안녕하세요! 크리에이터입니다.",
                  website: "https://example.com",
                  location: "서울, 대한민국",
                  isPublic: true,
                }}
              >
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                      <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        style={{ marginBottom: "16px" }}
                      />
                      <div>
                        <Upload
                          showUploadList={false}
                          beforeUpload={() => false}
                          onChange={(info) => {
                            if (info.file.status === "done") {
                              message.success(
                                "프로필 사진이 업로드되었습니다."
                              );
                            }
                          }}
                        >
                          <Button icon={<CameraOutlined />}>
                            프로필 사진 변경
                          </Button>
                        </Upload>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="displayName"
                      label="표시 이름"
                      rules={[
                        { required: true, message: "표시 이름을 입력해주세요" },
                      ]}
                    >
                      <Input placeholder="크리에이터 이름" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="handle"
                      label="핸들"
                      rules={[
                        { required: true, message: "핸들을 입력해주세요" },
                      ]}
                    >
                      <Input addonBefore="@" placeholder="creator_handle" />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item name="bio" label="소개">
                      <TextArea
                        rows={4}
                        placeholder="크리에이터에 대한 소개를 작성해주세요"
                        maxLength={500}
                        showCount
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="website" label="웹사이트">
                      <Input placeholder="https://example.com" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="location" label="위치">
                      <Input placeholder="서울, 대한민국" />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name="isPublic"
                      label="공개 프로필"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="공개"
                        unCheckedChildren="비공개"
                      />
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      공개로 설정하면 다른 사용자들이 프로필을 볼 수 있습니다.
                    </Text>
                  </Col>
                </Row>
              </Form>
            </Card>
          </TabPane>

          {/* 알림 설정 */}
          <TabPane
            tab={
              <span>
                <BellOutlined />
                알림
              </span>
            }
            key="notifications"
          >
            <Card>
              <Form
                layout="vertical"
                initialValues={{
                  emailNotifications: true,
                  pushNotifications: true,
                  membershipNotifications: true,
                  donationNotifications: true,
                  commentNotifications: true,
                  marketingEmails: false,
                }}
              >
                <Title level={4}>이메일 알림</Title>
                <Form.Item
                  name="emailNotifications"
                  label="이메일 알림 수신"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="membershipNotifications"
                  label="멤버십 관련 알림"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="donationNotifications"
                  label="후원 알림"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="commentNotifications"
                  label="댓글 알림"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Divider />

                <Title level={4}>푸시 알림</Title>
                <Form.Item
                  name="pushNotifications"
                  label="푸시 알림 수신"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Divider />

                <Title level={4}>마케팅</Title>
                <Form.Item
                  name="marketingEmails"
                  label="마케팅 이메일 수신"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          {/* 수익 설정 */}
          <TabPane
            tab={
              <span>
                <DollarOutlined />
                수익
              </span>
            }
            key="earnings"
          >
            <Card>
              <Form
                layout="vertical"
                initialValues={{
                  currency: "KRW",
                  taxId: "",
                  bankAccount: "",
                  minimumPayout: 10000,
                  payoutSchedule: "monthly",
                  autoPayout: true,
                }}
              >
                <Title level={4}>결제 정보</Title>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="currency" label="통화">
                      <Select>
                        <Select.Option value="KRW">한국 원 (KRW)</Select.Option>
                        <Select.Option value="USD">
                          미국 달러 (USD)
                        </Select.Option>
                        <Select.Option value="EUR">유로 (EUR)</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="taxId" label="사업자등록번호">
                      <Input placeholder="123-45-67890" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="bankAccount" label="출금 계좌">
                  <Input placeholder="은행명 - 계좌번호" />
                </Form.Item>

                <Divider />

                <Title level={4}>출금 설정</Title>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="minimumPayout" label="최소 출금 금액">
                      <InputNumber
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) =>
                          Number(value!.replace(/\$\s?|(,*)/g, ""))
                        }
                        placeholder="10000"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="payoutSchedule" label="출금 주기">
                      <Select>
                        <Select.Option value="weekly">주간</Select.Option>
                        <Select.Option value="monthly">월간</Select.Option>
                        <Select.Option value="quarterly">분기별</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="autoPayout"
                  label="자동 출금"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  자동 출금이 활성화되면 설정된 주기에 따라 자동으로 출금됩니다.
                </Text>
              </Form>
            </Card>
          </TabPane>

          {/* 보안 설정 */}
          <TabPane
            tab={
              <span>
                <LockOutlined />
                보안
              </span>
            }
            key="security"
          >
            <Card>
              <Form
                layout="vertical"
                initialValues={{
                  twoFactorAuth: false,
                  loginAlerts: true,
                  sessionTimeout: 30,
                }}
              >
                <Title level={4}>계정 보안</Title>

                <Form.Item
                  name="twoFactorAuth"
                  label="2단계 인증"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  2단계 인증을 활성화하면 계정 보안이 강화됩니다.
                </Text>

                <Form.Item
                  name="loginAlerts"
                  label="로그인 알림"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  새로운 기기에서 로그인할 때 이메일 알림을 받습니다.
                </Text>

                <Form.Item name="sessionTimeout" label="세션 타임아웃 (분)">
                  <InputNumber
                    min={5}
                    max={1440}
                    style={{ width: "100%" }}
                    placeholder="30"
                  />
                </Form.Item>

                <Divider />

                <Title level={4}>비밀번호 변경</Title>
                <Alert
                  message="비밀번호 변경"
                  description="비밀번호를 변경하려면 계정 설정 페이지로 이동하세요."
                  type="info"
                  showIcon
                  action={
                    <Button size="small" type="primary">
                      비밀번호 변경
                    </Button>
                  }
                />
              </Form>
            </Card>
          </TabPane>

          {/* 개인정보 설정 */}
          <TabPane
            tab={
              <span>
                <GlobalOutlined />
                개인정보
              </span>
            }
            key="privacy"
          >
            <Card>
              <Form
                layout="vertical"
                initialValues={{
                  profileVisibility: "public",
                  showEarnings: false,
                  allowMessages: true,
                  dataSharing: false,
                }}
              >
                <Title level={4}>프로필 공개 설정</Title>

                <Form.Item name="profileVisibility" label="프로필 공개 범위">
                  <Select>
                    <Select.Option value="public">전체 공개</Select.Option>
                    <Select.Option value="followers">팔로워만</Select.Option>
                    <Select.Option value="private">비공개</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="showEarnings"
                  label="수익 정보 공개"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  수익 정보를 다른 사용자에게 공개할지 설정합니다.
                </Text>

                <Form.Item
                  name="allowMessages"
                  label="메시지 수신 허용"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Divider />

                <Title level={4}>데이터 사용</Title>

                <Form.Item
                  name="dataSharing"
                  label="데이터 공유 동의"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  서비스 개선을 위한 익명 데이터 사용에 동의합니다.
                </Text>
              </Form>
            </Card>
          </TabPane>
        </Tabs>

        {/* 저장 버튼 */}
        <div style={{ marginTop: "24px", textAlign: "right" }}>
          <Space>
            <Button onClick={handleReset}>초기화</Button>
            <Button type="primary" loading={loading} onClick={handleSave}>
              저장
            </Button>
          </Space>
        </div>
      </div>
    </CreatorCenterLayout>
  );
}
