"use client";

import { useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";

import { clampPagination, DEFAULT_PAGE, paginationParsers, searchParser } from "./list-params";

const parsers = { ...paginationParsers, search: searchParser };

/**
 * Tìm kiếm và phân trang của một trang danh sách, lưu trên URL để reload và chia sẻ link
 * được. Trang có thêm filter riêng (ví dụ lọc theo vai trò) thì tự viết hook của nó.
 */
export const useSearchListParams = () => {
  const [params, setParams] = useQueryStates(parsers, { history: "replace" });

  const query = useMemo(() => ({ ...clampPagination(params), search: params.search }), [params]);

  /** Đổi từ khoá thì quay về trang đầu. */
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
