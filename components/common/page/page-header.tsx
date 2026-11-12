"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import Link from "next/link";

import type { ReactNode } from "react";

interface IPageHeaderProps {
  title: string;
  description?: string;
  extra?: ReactNode;
  /** Trang con (chi tiết, tạo mới): hiện nút quay lại trang này. */
  backHref?: string;
}

export function PageHeader({ title, description, extra, backHref }: IPageHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2">
        {backHref && (
          <Link href={backHref} aria-label="Quay lại">
            <Button type="text" icon={<ArrowLeftOutlined />} tabIndex={-1} />
          </Link>
        )}
        <div className="min-w-0">
          <Typography.Title level={4} className="mb-0! break-words">
            {title}
          </Typography.Title>
          {description && <Typography.Text type="secondary">{description}</Typography.Text>}
        </div>
      </div>
      {extra && <div className="flex gap-2">{extra}</div>}
    </div>
  );
}
