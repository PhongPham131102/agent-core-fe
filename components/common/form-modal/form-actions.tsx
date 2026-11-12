"use client";

import { Button } from "antd";

interface IFormActionsProps {
  onCancel: () => void;
  submitting?: boolean;
  submitText?: string;
  cancelText?: string;
}

/** Hàng nút cuối form trong modal: Huỷ + nút submit của form bao ngoài. */
export function FormActions({
  onCancel,
  submitting = false,
  submitText = "Lưu",
  cancelText = "Huỷ",
}: IFormActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button onClick={onCancel} disabled={submitting}>
        {cancelText}
      </Button>
      <Button type="primary" htmlType="submit" loading={submitting}>
        {submitText}
      </Button>
    </div>
  );
}
