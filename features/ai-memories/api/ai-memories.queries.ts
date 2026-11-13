"use client";

import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { aiMemoryKeys } from "./ai-memories.keys";
import { aiMemoryService } from "./ai-memories.service";

export const aiMemoryQueries = {
  /** Agent có thể vừa ghi thêm trong lúc chat, nên luôn đọc lại khi mở. */
  list: (agentUid: string) =>
    queryOptions({
      queryKey: aiMemoryKeys.list(agentUid),
      queryFn: () => aiMemoryService.list(agentUid),
      staleTime: 0,
    }),
};

export const useAiMemoriesQuery = (agentUid: string) => useQuery(aiMemoryQueries.list(agentUid));

export const useDeleteAiMemory = () =>
  useMutation({
    mutationFn: aiMemoryService.remove,
    meta: { invalidates: [aiMemoryKeys.all], successMessage: "Đã xoá ghi nhớ" },
  });
