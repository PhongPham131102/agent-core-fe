"use client";

import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { aiMcpServerKeys } from "./ai-mcp-servers.keys";
import { aiMcpServerService } from "./ai-mcp-servers.service";

import type { IAiMcpServerListQuery, IUpdateAiMcpServerBody } from "../types/ai-mcp-server.types";

export const aiMcpServerQueries = {
  list: (query: IAiMcpServerListQuery) =>
    queryOptions({
      queryKey: aiMcpServerKeys.list(query),
      queryFn: () => aiMcpServerService.list(query),
      placeholderData: keepPreviousData,
    }),
  detail: (uid: string) =>
    queryOptions({
      queryKey: aiMcpServerKeys.detail(uid),
      queryFn: () => aiMcpServerService.detail(uid),
    }),
  tools: (uid: string) =>
    queryOptions({
      queryKey: aiMcpServerKeys.tools(uid),
      queryFn: () => aiMcpServerService.tools(uid),
    }),
  options: () =>
    queryOptions({ queryKey: aiMcpServerKeys.options(), queryFn: aiMcpServerService.options }),
};

export const useAiMcpServersQuery = (query: IAiMcpServerListQuery) =>
  useQuery(aiMcpServerQueries.list(query));

export const useAiMcpServerQuery = (uid: string) => useQuery(aiMcpServerQueries.detail(uid));

export const useAiMcpToolsQuery = (uid: string) => useQuery(aiMcpServerQueries.tools(uid));

export const useAiMcpServerOptionsQuery = () => useQuery(aiMcpServerQueries.options());

// Danh sách, chi tiết, tool và ô chọn server cùng nằm dưới `all`: thay đổi nào cũng làm mới
// cả cụm, vì số tool và quyền gọi tool đổi theo server.
export const useCreateAiMcpServer = () =>
  useMutation({
    mutationFn: aiMcpServerService.create,
    meta: { invalidates: [aiMcpServerKeys.all], successMessage: "Đã thêm MCP server" },
  });

export const useUpdateAiMcpServer = () =>
  useMutation({
    mutationFn: ({ uid, body }: { uid: string; body: IUpdateAiMcpServerBody }) =>
      aiMcpServerService.update(uid, body),
    meta: { invalidates: [aiMcpServerKeys.all], successMessage: "Đã cập nhật MCP server" },
  });

export const useDeleteAiMcpServer = () =>
  useMutation({
    mutationFn: aiMcpServerService.remove,
    meta: { invalidates: [aiMcpServerKeys.all], successMessage: "Đã xoá MCP server" },
  });

/** Lỗi kết nối vẫn làm mới cụm, để `lastSyncError` BE vừa lưu hiện ra. */
export const useSyncAiMcpTools = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiMcpServerService.syncTools,
    onError: () => queryClient.invalidateQueries({ queryKey: aiMcpServerKeys.all }),
    meta: { invalidates: [aiMcpServerKeys.all], successMessage: "Đã đồng bộ tool" },
  });
};

export const useCallAiMcpTool = () =>
  useMutation({
    mutationFn: ({
      uid,
      toolName,
      args,
    }: {
      uid: string;
      toolName: string;
      args: Record<string, unknown>;
    }) => aiMcpServerService.callTool(uid, toolName, args),
  });
