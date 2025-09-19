// Membership Request DTOs (matching server exactly)
export interface CreateMembershipRequest {
  name: string;
  description?: string;
  benefits: string;
  level: number;
  price: number;
  billing_unit: PeriodUnit;
  billing_period: number;
  trial_unit?: PeriodUnit;
  trial_period?: number;
}

export interface UpdateMembershipRequest {
  name?: string;
  description?: string;
  benefits?: string;
  level?: number;
  price?: number;
  billing_unit?: PeriodUnit;
  billing_period?: number;
  trial_unit?: PeriodUnit;
  trial_period?: number;
}

// Period Unit enum (matching server Prisma schema)
export type PeriodUnit = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

// Membership Response interfaces
export interface MembershipResponse {
  id: string;
  name: string;
  description?: string;
  benefits: string;
  level: number;
  price: number;
  billing_unit: PeriodUnit;
  billing_period: number;
  trial_unit?: PeriodUnit;
  trial_period?: number;
  creatorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMembershipResponse {
  success: boolean;
  data: {
    id: string;
    message: string;
  };
  message?: string; // Optional message field for frontend use
}

export interface UpdateMembershipResponse {
  success: boolean;
  data: MembershipResponse;
  message: string;
}

export interface MembershipListResponse {
  success: boolean;
  data: {
    memberships: MembershipResponse[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  message?: string; // Optional message field for frontend use
}

export interface MembershipDetailResponse {
  success: boolean;
  data: MembershipResponse;
}

// Legacy DTOs for backwards compatibility
export type CreateMembershipDto = CreateMembershipRequest;
export type UpdateMembershipDto = UpdateMembershipRequest;