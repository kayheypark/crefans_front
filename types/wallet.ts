export interface WalletData {
  // id: number;
  address: string;
  tokenType: {
    // id: number;
    symbol: string;
    name: string;
    price: number;
  };
  amount: number;
  ownedSince: string;
}

export interface WalletResponse {
  success: boolean;
  data: {
    wallets: WalletData[];
    totalValue: number;
  };
}
