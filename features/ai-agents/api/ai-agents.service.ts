import { compactParams, http } from "@/lib/http";

import type {
  IAiAgent,
  IAiAgentListQuery,
  ICreateAiAgentBody,
  IUpdateAiAgentBody,
} from "../types/ai-agent.types";
import type { IAiCatalogOption } from "@/features/ai-providers";
import type { IPaginated } from "@/lib/http";

const BASE = "/ai-agents";

export const aiAgentService = {
  list: (query: IAiAgentListQuery) =>
    http.get<IPaginated<IAiAgent>>(BASE, { params: compactParams(query) }),
  detail: (uid: string) => http.get<IAiAgent>(`${BASE}/${uid}`),
  create: (body: ICreateAiAgentBody) => http.post<IAiAgent>(BASE, body),
  update: (uid: string, body: IUpdateAiAgentBody) => http.patch<IAiAgent>(`${BASE}/${uid}`, body),
  remove: (uid: string) => http.delete(`${BASE}/${uid}`),

  /** Các mức suy luận agent dùng được; mọi người đã đăng nhập đều xem được. */
  reasoningEfforts: () => http.get<IAiCatalogOption[]>(`${BASE}/reasoning-efforts`),
};
