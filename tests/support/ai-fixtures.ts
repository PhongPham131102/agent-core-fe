import type { IAiAgent } from "@/features/ai-agents/types/ai-agent.types";
import type { IAiMcpServer } from "@/features/ai-mcp-servers/types/ai-mcp-server.types";
import type { IAiSkill } from "@/features/ai-skills/types/ai-skill.types";

/** Agent mẫu, khớp response của agent-core-be. */
export const buildAiAgent = (overrides: Partial<IAiAgent> = {}): IAiAgent => ({
  uid: "44444444-4444-4444-8444-444444444444",
  code: "cskh",
  name: "Chăm sóc khách hàng",
  description: "",
  provider: { id: "openai", name: "OpenAI" },
  model: { id: "gpt-4o-mini", name: "GPT-4o mini" },
  reasoningEffort: null,
  systemPrompt: "Bạn là trợ lý.",
  temperature: 0.7,
  maxOutputTokens: 4096,
  maxSteps: 8,
  historyTurnLimit: 10,
  isActive: true,
  skills: [],
  knowledgeBases: [],
  tools: [],
  mcpServers: [],
  memoryEnabled: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

/** Skill mẫu, khớp response của agent-core-be. */
export const buildAiSkill = (overrides: Partial<IAiSkill> = {}): IAiSkill => ({
  uid: "55555555-5555-4555-8555-555555555555",
  code: "tra-cuu-don-hang",
  name: "tra-cuu-don-hang",
  displayName: "Tra cứu đơn hàng",
  description: "",
  iconUrl: "",
  files: ["SKILL.md"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

/** MCP server mẫu, khớp response của agent-core-be. */
export const buildAiMcpServer = (overrides: Partial<IAiMcpServer> = {}): IAiMcpServer => ({
  uid: "66666666-6666-4666-8666-666666666666",
  code: "teeinblue",
  name: "Teeinblue",
  url: "https://mcp.example.com/mcp",
  headers: [{ key: "Authorization", value: "***abcd" }],
  allowedWriteTools: [],
  toolCount: 2,
  toolsSyncedAt: "2026-01-01T00:00:00.000Z",
  lastSyncError: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});
