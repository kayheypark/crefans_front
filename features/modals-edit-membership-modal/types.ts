import { MembershipItem } from "@/lib/api/membership";
export interface EditMembershipModalProps {
  open: boolean;
  onClose: () => void;
  membership: MembershipItem | null;
  onMembershipUpdated: (updatedMembership: MembershipItem) => void;
}
