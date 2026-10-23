export interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar?: string;
  onSubmit?: (amount: number, message?: string) => void;
}
