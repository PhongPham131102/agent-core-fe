import { AiApiKeysPage } from "@/features/ai-api-keys";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "API key" };

export default function Page() {
  return <AiApiKeysPage />;
}
