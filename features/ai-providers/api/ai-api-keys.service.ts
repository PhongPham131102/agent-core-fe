import { compactParams, http } from "@/lib/http";

import type {
  IAiApiKey,
  IAiApiKeyListQuery,
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
};
