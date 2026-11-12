"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { aiCatalogKeys } from "./ai-catalog.keys";
import { aiCatalogService } from "./ai-catalog.service";

/** Danh mục chỉ đổi khi BE deploy bản mới, nên giữ suốt phiên. */
export const aiCatalogQueries = {
  providers: () =>
    queryOptions({
      queryKey: aiCatalogKeys.providers(),
      queryFn: aiCatalogService.providers,
      staleTime: Infinity,
    }),
  models: (provider: string) =>
    queryOptions({
      queryKey: aiCatalogKeys.models(provider),
      queryFn: () => aiCatalogService.models(provider),
      staleTime: Infinity,
    }),
};

export const useAiProvidersQuery = () => useQuery(aiCatalogQueries.providers());

export const useAiModelsQuery = (provider: string | undefined) =>
  useQuery({ ...aiCatalogQueries.models(provider ?? ""), enabled: Boolean(provider) });
