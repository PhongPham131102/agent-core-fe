"use client";

import { Button } from "antd";
import { TriangleAlert, X } from "lucide-react";

/** Lỗi gửi tin hoặc lượt lỗi không có tin trả lời; bấm X để ẩn. */
export function ChatErrorBanner({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      role="alert"
      className="mb-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm"
      style={{
        borderColor: "var(--ac-color-error-border)",
        background: "var(--ac-color-error-bg)",
        color: "var(--ac-color-error-text)",
      }}
    >
      <TriangleAlert size={16} className="mt-0.5 shrink-0" />
      <span className="min-w-0 flex-1 break-words">{message}</span>
      <Button
        type="text"
        size="small"
        icon={<X size={15} />}
        aria-label="Đóng thông báo lỗi"
        onClick={onClose}
        className="size-5! min-w-5! p-0!"
      />
    </div>
  );
}
