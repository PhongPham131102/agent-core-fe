"use client";

import { Button, Result } from "antd";
import Link from "next/link";

import { routes } from "@/lib/constants/routes";

export function ForbiddenView() {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Bạn không có quyền truy cập trang này."
      extra={
        <Link href={routes.home}>
          <Button type="primary">Về trang chủ</Button>
        </Link>
      }
    />
  );
}
