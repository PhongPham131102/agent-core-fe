import { http } from "@/lib/http";

import type { IAiCatalogOption } from "../types/ai-catalog.types";

const BASE = "/ai-api-keys";

export const aiCatalogService = {
  /** Nhà cung cấp mà app hỗ trợ. */
  providers: () => http.get<IAiCatalogOption[]>(`${BASE}/providers`),
  /** Model mà app hỗ trợ cho một nhà cung cấp; không cần key, không gọi ra ngoài. */
  models: (provider: string) => http.get<IAiCatalogOption[]>(`${BASE}/models/${provider}`),
};
