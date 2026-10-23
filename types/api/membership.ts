import { MembershipResponse } from "@/types/membership";
export interface MembershipItem extends MembershipResponse {
  // Legacy fields for compatibility
  creator_id?: string;
  is_deleted?: boolean;
}
