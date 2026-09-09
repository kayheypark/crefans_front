import { MembershipItem } from "@/lib/api/membership";
export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  bio?: string;
  membershipItems?: MembershipItem[];
}
