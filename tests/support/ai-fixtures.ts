import type { IAiAgent } from "@/features/ai-agents/types/ai-agent.types";

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
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});
