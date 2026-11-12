"use client";

import { keepPreviousData, queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { aiAgentKeys } from "./ai-agents.keys";
import { aiAgentService } from "./ai-agents.service";

import type { IAiAgentListQuery, IUpdateAiAgentBody } from "../types/ai-agent.types";

export const aiAgentQueries = {
  list: (query: IAiAgentListQuery) =>
    queryOptions({
      queryKey: aiAgentKeys.list(query),
      queryFn: () => aiAgentService.list(query),
      placeholderData: keepPreviousData,
    }),
  detail: (uid: string) =>
    queryOptions({ queryKey: aiAgentKeys.detail(uid), queryFn: () => aiAgentService.detail(uid) }),
  reasoningEfforts: () =>
    queryOptions({
      queryKey: aiAgentKeys.reasoningEfforts(),
      queryFn: aiAgentService.reasoningEfforts,
      staleTime: Infinity,
    }),
};

export const useAiAgentsQuery = (query: IAiAgentListQuery) => useQuery(aiAgentQueries.list(query));

export const useReasoningEffortsQuery = () => useQuery(aiAgentQueries.reasoningEfforts());

export const useCreateAiAgent = () =>
  useMutation({
    mutationFn: aiAgentService.create,
    meta: { invalidates: [aiAgentKeys.lists()], successMessage: "Đã tạo agent" },
  });

/** `successMessage` khác nhau giữa lưu form và bật/tắt nhanh trên bảng. */
export const useUpdateAiAgent = (successMessage = "Đã lưu agent") =>
  useMutation({
    mutationFn: ({ uid, body }: { uid: string; body: IUpdateAiAgentBody }) =>
      aiAgentService.update(uid, body),
    meta: { invalidates: [aiAgentKeys.all], successMessage },
  });

export const useDeleteAiAgent = () =>
  useMutation({
    mutationFn: aiAgentService.remove,
    meta: { invalidates: [aiAgentKeys.lists()], successMessage: "Đã xoá agent" },
  });
