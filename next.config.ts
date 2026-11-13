import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  // Cache Components (và Partial Prefetching, vốn phụ thuộc nó) đang TẮT:
  // @ant-design/cssinjs gọi Date.now()/Math.random() khi load module, Next 16 coi là lỗi
  // khi prerender. App là dashboard sau đăng nhập, data lấy ở client, nên static shell
  // không mang lại nhiều lợi ích. Xem docs/MODULES.md mục 1.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
