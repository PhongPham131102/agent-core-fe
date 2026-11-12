"use client";

import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import CacheEntity from "@ant-design/cssinjs/es/Cache";
import { useServerInsertedHTML } from "next/navigation";
import { useState } from "react";

import type { ReactNode } from "react";

/** ID cố định khi render ở server; chỉ dùng ở trình duyệt để dời style SSR vào <head>. */
const SERVER_INSTANCE_ID = "ssr";

/**
 * Thay cho `AntdRegistry` của `@ant-design/nextjs-registry`.
 * Bản gốc gọi `createCache()` → `Math.random()` trong lúc render, mà Cache Components
 * của Next 16 không cho phép khi prerender. Trên server tạo cache với ID cố định,
 * trên client vẫn dùng `createCache()` như cũ.
 */
export function AntdRegistry({ children }: { children: ReactNode }) {
  const [cache] = useState(() =>
    typeof window === "undefined" ? new CacheEntity(SERVER_INSTANCE_ID) : createCache(),
  );

  useServerInsertedHTML(() => {
    const styleText = extractStyle(cache, { plain: true, once: true });
    if (styleText.includes('.data-ant-cssinjs-cache-path{content:"";}')) return null;
    return (
      <style
        id="antd-cssinjs"
        // Chèn trước style antd sinh ra ở client.
        data-rc-order="prepend"
        data-rc-priority="-1000"
        dangerouslySetInnerHTML={{ __html: styleText }}
      />
    );
  });

  // `layer`: bọc style antd trong @layer antd để utility của Tailwind override được.
  return (
    <StyleProvider cache={cache} layer>
      {children}
    </StyleProvider>
  );
}
