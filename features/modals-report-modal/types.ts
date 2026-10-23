export interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (values: any) => void;
}
