"use client";

import { keepPreviousData, queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { aiApiKeyKeys } from "./ai-api-keys.keys";
import { aiApiKeyService } from "./ai-api-keys.service";

import type { IAiApiKeyListQuery, IUpdateAiApiKeyBody } from "../types/ai-api-key.types";

export const aiApiKeyQueries = {
  list: (query: IAiApiKeyListQuery) =>
    queryOptions({
      queryKey: aiApiKeyKeys.list(query),
      queryFn: () => aiApiKeyService.list(query),
      placeholderData: keepPreviousData,
    }),
};

export const useAiApiKeysQuery = (query: IAiApiKeyListQuery) =>
  useQuery(aiApiKeyQueries.list(query));

export const useCreateAiApiKey = () =>
  useMutation({
    mutationFn: aiApiKeyService.create,
    meta: { invalidates: [aiApiKeyKeys.lists()], successMessage: "Đã lưu API key" },
  });

export const useUpdateAiApiKey = () =>
  useMutation({
    mutationFn: ({ uid, body }: { uid: string; body: IUpdateAiApiKeyBody }) =>
      aiApiKeyService.update(uid, body),
    meta: { invalidates: [aiApiKeyKeys.lists()], successMessage: "Đã cập nhật API key" },
  });

export const useDeleteAiApiKey = () =>
  useMutation({
    mutationFn: aiApiKeyService.remove,
    meta: { invalidates: [aiApiKeyKeys.lists()], successMessage: "Đã xoá API key" },
  });
