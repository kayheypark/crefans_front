import { apiClient } from './client';
import { ApiResponse } from '@/types/api';

// Updated interface to match backend structure
export interface MembershipItem {
  id: string;           // For billing system
  name: string;         // Membership tier name
  description: string;  // Membership description
  benefits: string;     // Benefits text
  level: number;        // Membership level
  price: string;        // Monthly/billing price (Decimal as string)
  billing_unit: string; // MONTH, YEAR, etc.
  billing_period: number; // Billing period number
  trial_unit: string;   // Trial period unit
  trial_period: number; // Trial period length
  is_active: boolean;   // Active status
  created_at: string;   // Creation timestamp
  // Legacy fields for compatibility
  creator_id?: string;
  is_deleted?: boolean;
  updated_at?: string;
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
  // Get membership items for a specific creator (from user profile)
  async getMembershipsByCreatorId(creatorId: string): Promise<ApiResponse<MembershipItem[]>> {
    const response = await apiClient.get(`/membership/creator/${creatorId}`);
    return response.data;
  },

  // Get membership items from user profile (includes membershipItems array)
  async getMembershipsFromProfile(handle: string): Promise<ApiResponse<MembershipItem[]>> {
    const response = await apiClient.get(`/user/profile/${handle}`);
    // Extract membershipItems from profile response
    if (response.data.success && response.data.data?.membershipItems) {
      return {
        success: true,
        data: response.data.data.membershipItems,
        message: response.data.message
      };
    }
    return {
      success: false,
      data: [],
      message: 'No membership items found'
    };
  },

  // Legacy methods for backward compatibility
  async getMemberships(): Promise<ApiResponse<MembershipItem[]>> {
    const response = await apiClient.get('/membership');
    return response.data;
  },

  async getMembership(id: string | number): Promise<ApiResponse<MembershipItem>> {
    const response = await apiClient.get(`/membership/${id}`);
    return response.data;
  },

  async createMembership(data: CreateMembershipRequest): Promise<ApiResponse<MembershipItem>> {
    const response = await apiClient.post('/membership', data);
    return response.data;
  },

  async updateMembership(id: string | number, data: UpdateMembershipRequest): Promise<ApiResponse<MembershipItem>> {
    const response = await apiClient.put(`/membership/${id}`, data);
    return response.data;
  },

  async deleteMembership(id: string | number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/membership/${id}`);
    return response.data;
  },

  async toggleMembershipActive(id: string | number): Promise<ApiResponse<MembershipItem>> {
    const response = await apiClient.patch(`/membership/${id}/toggle-active`);
    return response.data;
  },
};