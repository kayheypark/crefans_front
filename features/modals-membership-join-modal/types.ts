export interface Membership {
  id: string; // Updated to string for billing system
  name: string;
  level: number;
  price: number;
  description?: string;
  benefits: string[];
  billing_unit: "DAY" | "WEEK" | "MONTH" | "YEAR";
  billing_period: number;
  trial_unit?: string;
  trial_period?: number;
}

export interface MembershipJoinModalProps {
  open: boolean;
  onClose: () => void;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar?: string;
  memberships: Membership[];
  defaultSelectedMembershipId?: string;
  subscribedMembershipIds?: string[];
}
