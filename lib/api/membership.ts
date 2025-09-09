import { API_BASE_URL } from './config';
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

class MembershipAPI {
  private getRequestOptions(method: string, data?: any): RequestInit {
    const options: RequestInit = {
      method,
      credentials: 'include', // 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    return options;
  }

  async getMemberships(): Promise<ApiResponse<MembershipItem[]>> {
    const response = await fetch(`${API_BASE_URL}/membership`, this.getRequestOptions('GET'));
    return response.json();
  }

  async getMembership(id: number): Promise<ApiResponse<MembershipItem>> {
    const response = await fetch(`${API_BASE_URL}/membership/${id}`, this.getRequestOptions('GET'));
    return response.json();
  }

  async createMembership(data: CreateMembershipRequest): Promise<ApiResponse<MembershipItem>> {
    const response = await fetch(`${API_BASE_URL}/membership`, this.getRequestOptions('POST', data));
    return response.json();
  }

  async updateMembership(id: number, data: UpdateMembershipRequest): Promise<ApiResponse<MembershipItem>> {
    const response = await fetch(`${API_BASE_URL}/membership/${id}`, this.getRequestOptions('PUT', data));
    return response.json();
  }

  async deleteMembership(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/membership/${id}`, this.getRequestOptions('DELETE'));
    return response.json();
  }

  async toggleMembershipActive(id: number): Promise<ApiResponse<MembershipItem>> {
    const response = await fetch(`${API_BASE_URL}/membership/${id}/toggle-active`, this.getRequestOptions('PATCH'));
    return response.json();
  }
}

export const membershipAPI = new MembershipAPI();