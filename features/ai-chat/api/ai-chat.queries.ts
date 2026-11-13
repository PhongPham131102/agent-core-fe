"use client";

import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { nextPageOf } from "@/lib/query";
import { DEFAULT_PAGE } from "@/lib/url";

import { aiChatKeys } from "./ai-chat.keys";
import { aiChatService } from "./ai-chat.service";

export const aiChatQueries = {
  agents: () => queryOptions({ queryKey: aiChatKeys.agents(), queryFn: aiChatService.agents }),
  threads: (agentUid: string) =>
    infiniteQueryOptions({
      queryKey: aiChatKeys.threadList(agentUid),
      queryFn: ({ pageParam }) => aiChatService.threads(agentUid, pageParam),
      initialPageParam: DEFAULT_PAGE,
      getNextPageParam: nextPageOf,
    }),
  messages: (threadUid: string) =>
    infiniteQueryOptions({
      queryKey: aiChatKeys.messages(threadUid),
      queryFn: ({ pageParam }) => aiChatService.messages(threadUid, pageParam),
      initialPageParam: DEFAULT_PAGE,
      getNextPageParam: nextPageOf,
    }),
};

export const useChatAgentsQuery = () => useQuery(aiChatQueries.agents());

export const useChatThreadsQuery = (agentUid: string | null) =>
  useInfiniteQuery({ ...aiChatQueries.threads(agentUid ?? ""), enabled: Boolean(agentUid) });

export const useChatMessagesQuery = (threadUid: string | null) =>
  useInfiniteQuery({ ...aiChatQueries.messages(threadUid ?? ""), enabled: Boolean(threadUid) });

export const useDeleteChatThread = () =>
  useMutation({
    mutationFn: aiChatService.removeThread,
    meta: { invalidates: [aiChatKeys.threads()], successMessage: "Đã xoá cuộc chat" },
  });

export const useRenameChatThread = () =>
  useMutation({
    mutationFn: ({ threadUid, title }: { threadUid: string; title: string }) =>
      aiChatService.renameThread(threadUid, title),
    meta: { invalidates: [aiChatKeys.threads()], successMessage: "Đã đổi tên cuộc chat" },
  });
