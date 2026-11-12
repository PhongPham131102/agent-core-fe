"use client";

import { keepPreviousData, queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { aiSkillKeys } from "./ai-skills.keys";
import { aiSkillService } from "./ai-skills.service";

import type { IAiSkillListQuery } from "../types/ai-skill.types";

export const aiSkillQueries = {
  list: (query: IAiSkillListQuery) =>
    queryOptions({
      queryKey: aiSkillKeys.list(query),
      queryFn: () => aiSkillService.list(query),
      placeholderData: keepPreviousData,
    }),
  detail: (uid: string) =>
    queryOptions({ queryKey: aiSkillKeys.detail(uid), queryFn: () => aiSkillService.detail(uid) }),
  options: () => queryOptions({ queryKey: aiSkillKeys.options(), queryFn: aiSkillService.options }),
};

export const useAiSkillsQuery = (query: IAiSkillListQuery) => useQuery(aiSkillQueries.list(query));

export const useAiSkillQuery = (uid: string) => useQuery(aiSkillQueries.detail(uid));

export const useAiSkillOptionsQuery = () => useQuery(aiSkillQueries.options());

// Mọi thay đổi skill làm mới cả danh sách, chi tiết và ô chọn skill (cùng nằm dưới `all`).
export const useCreateAiSkill = () =>
  useMutation({
    mutationFn: aiSkillService.create,
    meta: { invalidates: [aiSkillKeys.all], successMessage: "Đã tải skill lên" },
  });

export const useReplaceAiSkillFiles = () =>
  useMutation({
    mutationFn: ({ uid, file }: { uid: string; file: File }) =>
      aiSkillService.replaceFiles(uid, file),
    meta: { invalidates: [aiSkillKeys.all], successMessage: "Đã thay file skill" },
  });

export const useDeleteAiSkill = () =>
  useMutation({
    mutationFn: aiSkillService.remove,
    meta: { invalidates: [aiSkillKeys.all], successMessage: "Đã xoá skill" },
  });
