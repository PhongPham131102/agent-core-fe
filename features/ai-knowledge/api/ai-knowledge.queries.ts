"use client";

import { keepPreviousData, queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { aiKnowledgeKeys } from "./ai-knowledge.keys";
import { aiKnowledgeService } from "./ai-knowledge.service";

import type {
  IAiKnowledgeBaseListQuery,
  ISaveAiKnowledgeBaseBody,
  ISearchAiKnowledgeBody,
} from "../types/ai-knowledge.types";
import type { IPaginationQuery } from "@/lib/http";

export const aiKnowledgeQueries = {
  list: (query: IAiKnowledgeBaseListQuery) =>
    queryOptions({
      queryKey: aiKnowledgeKeys.list(query),
      queryFn: () => aiKnowledgeService.list(query),
      placeholderData: keepPreviousData,
    }),
  options: () =>
    queryOptions({ queryKey: aiKnowledgeKeys.options(), queryFn: aiKnowledgeService.options }),
  documents: (uid: string, query: IPaginationQuery) =>
    queryOptions({
      queryKey: aiKnowledgeKeys.documentList(uid, query),
      queryFn: () => aiKnowledgeService.documents(uid, query),
      placeholderData: keepPreviousData,
    }),
};

export const useAiKnowledgeBasesQuery = (query: IAiKnowledgeBaseListQuery) =>
  useQuery(aiKnowledgeQueries.list(query));

export const useAiKnowledgeBaseOptionsQuery = () => useQuery(aiKnowledgeQueries.options());

export const useAiKnowledgeDocumentsQuery = (uid: string, query: IPaginationQuery) =>
  useQuery(aiKnowledgeQueries.documents(uid, query));

// Kho, tài liệu và ô chọn kho cùng nằm dưới `all`: thay đổi nào cũng làm mới cả cụm,
// vì số tài liệu, số đoạn của kho đổi theo tài liệu.
export const useCreateAiKnowledgeBase = () =>
  useMutation({
    mutationFn: aiKnowledgeService.create,
    meta: { invalidates: [aiKnowledgeKeys.all], successMessage: "Đã tạo kho tri thức" },
  });

export const useUpdateAiKnowledgeBase = () =>
  useMutation({
    mutationFn: ({ uid, body }: { uid: string; body: Partial<ISaveAiKnowledgeBaseBody> }) =>
      aiKnowledgeService.update(uid, body),
    meta: { invalidates: [aiKnowledgeKeys.all], successMessage: "Đã cập nhật kho tri thức" },
  });

export const useDeleteAiKnowledgeBase = () =>
  useMutation({
    mutationFn: aiKnowledgeService.remove,
    meta: { invalidates: [aiKnowledgeKeys.all], successMessage: "Đã xoá kho tri thức" },
  });

/** Không có `successMessage`: kết quả từng file (xong hay lỗi) do nơi gọi báo. */
export const useUploadKnowledgeDocuments = () =>
  useMutation({
    mutationFn: ({ uid, files }: { uid: string; files: File[] }) =>
      aiKnowledgeService.uploadDocuments(uid, files),
    meta: { invalidates: [aiKnowledgeKeys.all] },
  });

export const useDeleteKnowledgeDocument = () =>
  useMutation({
    mutationFn: ({ uid, documentUid }: { uid: string; documentUid: string }) =>
      aiKnowledgeService.removeDocument(uid, documentUid),
    meta: { invalidates: [aiKnowledgeKeys.all], successMessage: "Đã xoá tài liệu" },
  });

export const useSearchAiKnowledge = () =>
  useMutation({
    mutationFn: ({ uid, body }: { uid: string; body: ISearchAiKnowledgeBody }) =>
      aiKnowledgeService.search(uid, body),
  });
