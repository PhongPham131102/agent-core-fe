"use client";

import { Button, Drawer } from "antd";

import type { ReactNode } from "react";

const DEFAULT_WIDTH = 720;

interface IFormDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  /** `id` của thẻ form bên trong: nút lưu ở chân drawer submit form qua id này. */
  formId: string;
  submitText?: string;
  submitting?: boolean;
  /** Chỉ xem: không có nút lưu. */
  readOnly?: boolean;
  width?: number;
  children: ReactNode;
}

/**
 * Drawer chứa form dài (nhiều khối field). Giống `FormModal`: nội dung bị huỷ khi đóng
 * nên form mount lại với `initialValues` mới. Khác ở chỗ nút nằm cố định ở chân drawer.
 */
export function FormDrawer({
  title,
  open,
  onClose,
  formId,
  submitText = "Lưu",
  submitting = false,
  readOnly = false,
  width = DEFAULT_WIDTH,
  children,
}: IFormDrawerProps) {
  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      size={width}
      destroyOnHidden
      styles={{ body: { background: "var(--ac-color-bg-layout)" } }}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={submitting}>
            {readOnly ? "Đóng" : "Huỷ"}
          </Button>
          {!readOnly && (
            <Button type="primary" htmlType="submit" form={formId} loading={submitting}>
              {submitText}
            </Button>
          )}
        </div>
      }
    >
      {children}
    </Drawer>
  );
}
