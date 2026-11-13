import { http } from "@/lib/http";

import type { IAiMemory } from "../types/ai-memory.types";

const BASE = "/ai-memories";

/** Chỉ thấy ghi nhớ của chính mình; agent tự lưu trong lúc chat nên không có API tạo. */
export const aiMemoryService = {
  list: (agentUid: string) => http.get<IAiMemory[]>(BASE, { params: { agentUid } }),
  remove: (uid: string) => http.delete(`${BASE}/${uid}`),
};
