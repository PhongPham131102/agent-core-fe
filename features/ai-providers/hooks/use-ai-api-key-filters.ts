"use client";

import { useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";

import { clampPagination, paginationParsers } from "@/lib/url";

import type { IAiApiKeyListQuery } from "../types/ai-api-key.types";

/**
 * Phân trang của trang API key, lưu trên URL. Không có ô tìm kiếm: mỗi nhà cung cấp
 * chỉ có một key nên danh sách luôn ngắn.
 */
export const useAiApiKeyFilters = () => {
  const [params, setParams] = useQueryStates(paginationParsers, { history: "replace" });

  const query = useMemo<Required<IAiApiKeyListQuery>>(() => clampPagination(params), [params]);

  const setPagination = useCallback(
    (page: number, limit: number) => void setParams({ page, limit }),
    [setParams],
  );

  return { query, setPagination };
};
