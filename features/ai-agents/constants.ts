/** Khớp `AI_AGENT_LIMITS` và `AI_AGENT_DEFAULTS` bên agent-core-be. */
export const AI_AGENT_LIMITS = {
  nameMaxLength: 150,
  descriptionMaxLength: 500,
  systemPromptMaxLength: 20_000,
  searchMaxLength: 150,
  skillCodesMax: 50,
  temperature: { min: 0, max: 2 },
  maxOutputTokens: { min: 1, max: 32_000 },
  maxSteps: { min: 1, max: 20 },
  historyTurnLimit: { min: 0, max: 50 },
} as const;

export const AI_AGENT_DEFAULTS = {
  temperature: 0.7,
  maxOutputTokens: 4096,
  maxSteps: 8,
  historyTurnLimit: 10,
  isActive: true,
} as const;
