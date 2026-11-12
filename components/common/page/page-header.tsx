"use client";

import { Typography } from "antd";

import type { ReactNode } from "react";

interface IPageHeaderProps {
  title: string;
  description?: string;
  extra?: ReactNode;
}

export function PageHeader({ title, description, extra }: IPageHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <Typography.Title level={4} className="mb-0!">
          {title}
        </Typography.Title>
        {description && <Typography.Text type="secondary">{description}</Typography.Text>}
      </div>
      {extra && <div className="flex gap-2">{extra}</div>}
    </div>
  );
}
