import { walletAPI } from "@/lib/api/wallet";
import type { WalletData } from "@/types/wallet";
import { useCallback, useEffect, useState } from "react";

export const useWallet = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await walletAPI.getWallet();

      if (response.success) {
        setWallets(response.data.wallets);
        setTotalValue(response.data.totalValue);
      }
    } catch (err: any) {
      console.error("지갑 정보 조회 실패:", err);
      setError(
        err.response?.data?.message || "지갑 정보를 불러올 수 없습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // 사용자가 로그인되어 있을 때만 지갑 정보 조회
  useEffect(() => {
    // 사용자 인증 정보는 AuthContext에서 확인해야 하므로,
    // 이 hook을 사용하는 컴포넌트에서 조건부로 호출하도록 수정
  }, []);

  // 특정 토큰의 보유량 조회
  const getTokenAmount = (symbol: string) => {
    const wallet = wallets.find((w) => w.tokenType.symbol === symbol);
    return wallet?.amount || 0;
  };

  return {
    wallets,
    totalValue,
    loading,
    error,
    refetch: fetchWallet,
    getTokenAmount,
  };
};
