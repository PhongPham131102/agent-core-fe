"use client";

import { useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";

import { clampPagination, DEFAULT_PAGE, paginationParsers, searchParser } from "@/lib/url";

import type { IAiAgentListQuery } from "../types/ai-agent.types";

const parsers = { ...paginationParsers, search: searchParser };

/** Filter và phân trang của trang agent, lưu trên URL để reload và chia sẻ link được. */
export const useAiAgentFilters = () => {
  const [params, setParams] = useQueryStates(parsers, { history: "replace" });

  const query = useMemo<Required<IAiAgentListQuery>>(
    () => ({ ...clampPagination(params), search: params.search }),
    [params],
  );

  /** Đổi filter thì quay về trang đầu. */
  const setSearch = useCallback(
    (search: string) => void setParams({ search, page: DEFAULT_PAGE }),
    [setParams],
  );
  const setPagination = useCallback(
    (page: number, limit: number) => void setParams({ page, limit }),
    [setParams],
  );

  return { query, setSearch, setPagination };
};
