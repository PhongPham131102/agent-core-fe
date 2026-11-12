import { ProfilePage } from "@/features/account";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hồ sơ của tôi" };

export default function Page() {
  return <ProfilePage />;
}
