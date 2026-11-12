"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { AntdProvider } from "./antd-provider";
import { ClientBootstrap } from "./client-bootstrap";
import { QueryProvider } from "./query-provider";

import type { ReactNode } from "react";

/** Chỉ chứa hạ tầng. UI nghiệp vụ (panel, widget) đặt ở layout của khu vực dùng nó. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <AntdProvider>
          <ClientBootstrap />
          {children}
        </AntdProvider>
      </QueryProvider>
    </NuqsAdapter>
  );
}
