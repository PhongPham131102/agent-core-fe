import { LoginPage } from "@/features/auth";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function Page() {
  return <LoginPage />;
}
