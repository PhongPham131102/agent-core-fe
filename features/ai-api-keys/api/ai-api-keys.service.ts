import { compactParams, http } from "@/lib/http";

import type {
  IAiApiKey,
  IAiApiKeyListQuery,
  IAiCatalogOption,
  ICreateAiApiKeyBody,
  IUpdateAiApiKeyBody,
} from "../types/ai-api-key.types";
import type { IPaginated } from "@/lib/http";

const BASE = "/ai-api-keys";

export const aiApiKeyService = {
  list: (query: IAiApiKeyListQuery) =>
    http.get<IPaginated<IAiApiKey>>(BASE, { params: compactParams(query) }),
  create: (body: ICreateAiApiKeyBody) => http.post<IAiApiKey>(BASE, body),
  update: (uid: string, body: IUpdateAiApiKeyBody) => http.patch<IAiApiKey>(`${BASE}/${uid}`, body),
  remove: (uid: string) => http.delete(`${BASE}/${uid}`),

  /** Nhà cung cấp mà app hỗ trợ. */
  providers: () => http.get<IAiCatalogOption[]>(`${BASE}/providers`),
  /** Model mà app hỗ trợ cho một nhà cung cấp; không cần key, không gọi ra ngoài. */
  models: (provider: string) => http.get<IAiCatalogOption[]>(`${BASE}/models/${provider}`),
};
