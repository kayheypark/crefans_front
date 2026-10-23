import { MembershipItem } from "@/lib/api/membership";
export interface Membership extends Omit<MembershipItem, "benefits"> {
  benefits: string[]; // 필수 필드로 변경
}

export interface MembershipManagementModalProps {
  open: boolean;
  onClose: () => void;
  onMembershipsUpdate: (memberships: MembershipItem[]) => void;
  currentMemberships?: MembershipItem[];
}
