import { AiMcpServersPage } from "@/features/ai-mcp-servers";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "MCP server" };

export default function Page() {
  return <AiMcpServersPage />;
}
