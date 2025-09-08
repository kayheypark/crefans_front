import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UseCreatorGuardOptions {
  requiresLogin?: boolean;
  requiresCreator?: boolean;
  redirectTo?: string;
}

export function useCreatorGuard(options: UseCreatorGuardOptions = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    requiresLogin = false,
    requiresCreator = false,
    redirectTo = '/creator-center'
  } = options;

  useEffect(() => {
    // 로그인 확인
    if (requiresLogin && !user) {
      router.push('/login?redirect=' + encodeURIComponent(pathname));
      return;
    }

    // 크리에이터 권한 확인
    if (requiresCreator && user && !user.isCreator) {
      router.push(redirectTo);
      return;
    }
  }, [user, router, pathname, requiresLogin, requiresCreator, redirectTo]);

  return {
    isLoading: requiresLogin && !user,
    hasAccess: requiresLogin ? (user ? (requiresCreator ? user.isCreator : true) : false) : true,
  };
}