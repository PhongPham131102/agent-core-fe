import { UsersPage } from "@/features/users";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Người dùng" };

export default function Page() {
  return <UsersPage />;
}
