export const aiMemoryKeys = {
  all: ["ai-memories"] as const,
  list: (agentUid: string) => [...aiMemoryKeys.all, agentUid] as const,
};
