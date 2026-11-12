import type { IAiApiKeyListQuery } from "../types/ai-api-key.types";

export const aiApiKeyKeys = {
  all: ["ai-api-keys"] as const,
  lists: () => [...aiApiKeyKeys.all, "list"] as const,
  list: (query: IAiApiKeyListQuery) => [...aiApiKeyKeys.lists(), query] as const,
  /** Danh mục cố định bên BE, không phụ thuộc key nào. */
  catalog: () => [...aiApiKeyKeys.all, "catalog"] as const,
  providers: () => [...aiApiKeyKeys.catalog(), "providers"] as const,
  models: (provider: string) => [...aiApiKeyKeys.catalog(), "models", provider] as const,
};
