import { BaseApiResponse } from "@/types/api";
import {
  CreateMembershipRequest,
  CreateMembershipResponse,
  MembershipDetailResponse,
  MembershipListResponse,
  UpdateMembershipRequest,
  UpdateMembershipResponse,
} from "@/types/membership";
import { apiClient } from "./client";
export type { MembershipItem } from "@/types/api/membership";

export const membershipAPI = {
  // Get membership items for a specific creator (from user profile)
  async getMembershipsByCreatorId(
    creatorId: string,
  ): Promise<MembershipListResponse> {
    const response = await apiClient.get(`/membership/creator/${creatorId}`);
    return response.data;
  },

  // Get membership items from user profile (includes membershipItems array)
  async getMembershipsFromProfile(
    handle: string,
  ): Promise<MembershipListResponse> {
    const response = await apiClient.get(`/user/profile/${handle}`);
    // Extract membershipItems from profile response
    if (response.data.success && response.data.data?.membershipItems) {
      return {
        success: true,
        data: {
          memberships: response.data.data.membershipItems,
        },
        message: response.data.message,
      };
    }
    return {
      success: false,
      data: {
        memberships: [],
      },
      message: "No membership items found",
    };
  },

  // Legacy methods for backward compatibility
  async getMemberships(): Promise<MembershipListResponse> {
    const response = await apiClient.get("/membership");
    return response.data;
  },

  async getMembership(id: string): Promise<MembershipDetailResponse> {
    const response = await apiClient.get(`/membership/${id}`);
    return response.data;
  },

  async createMembership(
    data: CreateMembershipRequest,
  ): Promise<CreateMembershipResponse> {
    const response = await apiClient.post("/membership", data);
    return response.data;
  },

  async updateMembership(
    id: string,
    data: UpdateMembershipRequest,
  ): Promise<UpdateMembershipResponse> {
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
