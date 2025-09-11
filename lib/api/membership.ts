import { apiClient } from './client';
import { ApiResponse } from '@/types/api';

export interface MembershipItem {
  id: number;
  name: string;
  description?: string;
  level: number;
  creator_id: string;
  price: number;
  billing_unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  billing_period: number;
  trial_unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  trial_period?: number;
  benefits: string; // 콤마로 구분된 혜택 문자열
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMembershipRequest {
  name: string;
  description?: string;
  level: number;
  price: number;
  billing_unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  billing_period: number;
  trial_unit?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  trial_period?: number;
  benefits: string; // 콤마로 구분된 혜택 문자열
}

export interface UpdateMembershipRequest extends Partial<CreateMembershipRequest> {
  is_active?: boolean;
}


export const membershipAPI = {
  async getMemberships(): Promise<ApiResponse<MembershipItem[]>> {
    const response = await apiClient.get('/membership');
    return response.data;
  },

  async getMembership(id: number): Promise<ApiResponse<MembershipItem>> {
    const response = await apiClient.get(`/membership/${id}`);
    return response.data;
  },

  async createMembership(data: CreateMembershipRequest): Promise<ApiResponse<MembershipItem>> {
    const response = await apiClient.post('/membership', data);
    return response.data;
  },

  async updateMembership(id: number, data: UpdateMembershipRequest): Promise<ApiResponse<MembershipItem>> {
    const response = await apiClient.put(`/membership/${id}`, data);
    return response.data;
  },

  async deleteMembership(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/membership/${id}`);
    return response.data;
  },

  async toggleMembershipActive(id: number): Promise<ApiResponse<MembershipItem>> {
    const response = await apiClient.patch(`/membership/${id}/toggle-active`);
    return response.data;
  },
};