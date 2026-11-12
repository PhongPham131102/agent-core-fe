import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  // Cache Components (và Partial Prefetching, vốn phụ thuộc nó) đang TẮT:
  // @ant-design/cssinjs gọi Date.now()/Math.random() khi load module, Next 16 coi là lỗi
  // khi prerender. App là dashboard sau đăng nhập, data lấy ở client, nên static shell
  // không mang lại nhiều lợi ích. Xem docs/PLAN.md mục 6.
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
