"use client";

import { Modal } from "antd";

import type { ReactNode } from "react";

interface IFormModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  width?: number;
  /** Form bên trong, tự có nút submit (xem `FormActions`). */
  children: ReactNode;
}

/**
 * Modal chứa form. Nội dung bị huỷ khi đóng (`destroyOnHidden`), nên mỗi lần mở
 * form được mount lại với `initialValues` mới, không phải reset bằng tay.
 */
export function FormModal({ title, open, onClose, width, children }: IFormModalProps) {
  return (
    <Modal title={title} open={open} onCancel={onClose} footer={null} width={width} destroyOnHidden>
      {children}
    </Modal>
  );
}
