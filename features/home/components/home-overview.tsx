"use client";

import { Card, Typography } from "antd";

export function HomeOverview() {
  return (
    <Card>
      <Typography.Title level={4}>Agent Core</Typography.Title>
      <Typography.Paragraph type="secondary" className="mb-0!">
        Phần nền đã sẵn sàng. Thêm tính năng mới trong <code>features/&lt;domain&gt;</code> theo
        hướng dẫn ở AGENTS.md.
      </Typography.Paragraph>
    </Card>
  );
}
