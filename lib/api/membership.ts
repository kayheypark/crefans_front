import { apiClient } from './client';
import {
  CreateMembershipRequest,
  UpdateMembershipRequest,
  MembershipResponse,
  MembershipListResponse,
  MembershipDetailResponse,
  CreateMembershipResponse,
  UpdateMembershipResponse
} from '@/types/membership';
import { BaseApiResponse } from '@/types/api';

// Legacy interface for backward compatibility
export interface MembershipItem extends MembershipResponse {
  // Legacy fields for compatibility
  creator_id?: string;
  is_deleted?: boolean;
}


export const membershipAPI = {
  // Get membership items for a specific creator (from user profile)
  async getMembershipsByCreatorId(creatorId: string): Promise<MembershipListResponse> {
    const response = await apiClient.get(`/membership/creator/${creatorId}`);
    return response.data;
  },

  // Get membership items from user profile (includes membershipItems array)
  async getMembershipsFromProfile(handle: string): Promise<MembershipListResponse> {
    const response = await apiClient.get(`/user/profile/${handle}`);
    // Extract membershipItems from profile response
    if (response.data.success && response.data.data?.membershipItems) {
      return {
        success: true,
        data: {
          memberships: response.data.data.membershipItems
        },
        message: response.data.message
      };
    }
    return {
      success: false,
      data: {
        memberships: []
      },
      message: 'No membership items found'
    };
  },

  // Legacy methods for backward compatibility
  async getMemberships(): Promise<MembershipListResponse> {
    const response = await apiClient.get('/membership');
    return response.data;
  },

  async getMembership(id: string): Promise<MembershipDetailResponse> {
    const response = await apiClient.get(`/membership/${id}`);
    return response.data;
  },

  async createMembership(data: CreateMembershipRequest): Promise<CreateMembershipResponse> {
    const response = await apiClient.post('/membership', data);
    return response.data;
  },

  async updateMembership(id: string, data: UpdateMembershipRequest): Promise<UpdateMembershipResponse> {
    const response = await apiClient.put(`/membership/${id}`, data);
    return response.data;
  },

  async deleteMembership(id: string): Promise<BaseApiResponse<void>> {
    const response = await apiClient.delete(`/membership/${id}`);
    return response.data;
  },

  async toggleMembershipActive(id: string): Promise<UpdateMembershipResponse> {
    const response = await apiClient.patch(`/membership/${id}/toggle-active`);
    return response.data;
  },
};