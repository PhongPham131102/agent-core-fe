"use client";

import { Button, Tooltip } from "antd";

import type { ReactNode } from "react";

interface IIconActionProps {
  /** Tên hành động, hiện ở tooltip. */
  label: string;
  /** Mô tả đầy đủ cho trình đọc màn hình, ví dụ "Xoá vai trò Editor". Mặc định dùng `label`. */
  ariaLabel?: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
  /** Có giá trị thì nút bị khoá và tooltip giải thích lý do. */
  disabledReason?: string | false;
}

/** Nút icon cho hành động trên từng dòng của bảng (sửa, xoá...). */
export function IconAction({
  label,
  ariaLabel = label,
  icon,
  onClick,
  danger = false,
  disabledReason,
}: IIconActionProps) {
  return (
    <Tooltip title={disabledReason || label}>
      <Button
        type="text"
        danger={danger}
        disabled={Boolean(disabledReason)}
        aria-label={ariaLabel}
        icon={icon}
        onClick={onClick}
      />
    </Tooltip>
  );
}
