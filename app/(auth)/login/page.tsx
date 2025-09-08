"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  // 이미 로그인된 사용자라면 리다이렉트
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleLogin = () => {
    // 여기서는 간단히 홈으로 이동하도록 처리
    // 실제로는 LoginModal을 열거나 다른 로그인 프로세스를 실행해야 함
    router.push('/');
  };

  if (user) {
    return <div>로그인 중...</div>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <UserOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          
          <div>
            <Title level={2}>로그인이 필요합니다</Title>
            <Text type="secondary">
              크리에이터 센터에 접근하려면 로그인해주세요.
            </Text>
          </div>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              size="large" 
              block
              onClick={handleLogin}
            >
              로그인하기
            </Button>
            
            <Button 
              size="large" 
              block
              onClick={() => router.push('/')}
            >
              홈으로 돌아가기
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}