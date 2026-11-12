import type { IAiApiKeyListQuery } from "../types/ai-api-key.types";

export const aiApiKeyKeys = {
  all: ["ai-api-keys"] as const,
  lists: () => [...aiApiKeyKeys.all, "list"] as const,
  list: (query: IAiApiKeyListQuery) => [...aiApiKeyKeys.lists(), query] as const,
};
