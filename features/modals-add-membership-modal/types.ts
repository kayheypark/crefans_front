import { MembershipItem } from "@/lib/api/membership";
export interface AddMembershipModalProps {
  open: boolean;
  onClose: () => void;
  onMembershipAdded: (membership?: MembershipItem) => void; // Make membership optional since we'll refresh the list
}
