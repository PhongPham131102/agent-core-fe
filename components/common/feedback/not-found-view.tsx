"use client";

import { Button, Result } from "antd";
import Link from "next/link";

import { routes } from "@/lib/constants/routes";

export function NotFoundView() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Trang bạn tìm không tồn tại."
      extra={
        <Link href={routes.home}>
          <Button type="primary">Về trang chủ</Button>
        </Link>
      }
    />
  );
}
