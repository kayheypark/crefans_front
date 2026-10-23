import type { FormInstance } from "antd";

// UI adapters are supplied by the container. Models never render notifications or dialogs.
export interface Feedback {
  success(message: string): void;
  error(message: string): void;
  warning(message: string): void;
  info(message: string): void;
}

export interface ConfirmationRequest {
  title: string;
  content: string;
  okText?: string;
  okType?: "danger";
  cancelText?: string;
  onOk(): Promise<void>;
}

// Retain the existing form contract while keeping the Ant Design runtime in containers.
export type FormController = FormInstance;
