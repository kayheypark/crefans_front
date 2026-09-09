import type { WalletResponse } from "@/types/wallet";
import { apiClient } from "./client";

export const walletAPI = {
  async getWallet(): Promise<WalletResponse> {
    const response = await apiClient.get<WalletResponse>("/wallet");
    return response.data;
  },
};
