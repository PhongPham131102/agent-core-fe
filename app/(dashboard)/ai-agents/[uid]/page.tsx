import { AiAgentEditPage } from "@/features/ai-agents";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Agent" };

export default async function Page({ params }: PageProps<"/ai-agents/[uid]">) {
  const { uid } = await params;
  return <AiAgentEditPage uid={uid} />;
}
