"use client";

import { Button, Result } from "antd";

import { getErrorMessage } from "@/lib/http";

interface IErrorViewProps {
  error: unknown;
  retry?: () => void;
}

export function ErrorView({ error, retry }: IErrorViewProps) {
  return (
    <Result
      status="error"
      title="Đã có lỗi xảy ra"
      subTitle={getErrorMessage(error)}
      extra={
        retry && (
          <Button type="primary" onClick={retry}>
            Thử lại
          </Button>
        )
      }
    />
  );
}
