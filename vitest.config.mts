import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    // Cùng origin với API test để jsdom không gửi CORS preflight (OPTIONS).
    environmentOptions: { jsdom: { url: "http://api.test" } },
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    // Test nằm riêng trong tests/unit, cây thư mục giống hệt mã nguồn.
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    env: { NEXT_PUBLIC_API_URL: "http://api.test/api" },
  },
});
