"use client";

import { parseAsString, useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";

import { clampPagination, DEFAULT_PAGE, paginationParsers, searchParser } from "@/lib/url";

import type { IUserListQuery } from "../types/user.types";

const parsers = { ...paginationParsers, search: searchParser, roleUid: parseAsString };

type UserFilters = Pick<IUserListQuery, "search" | "roleUid">;

/** Filter và phân trang của trang người dùng, lưu trên URL để reload và chia sẻ link được. */
export const useUserFilters = () => {
  const [params, setParams] = useQueryStates(parsers, { history: "replace" });

  const query = useMemo(
    () => ({
      ...clampPagination(params),
      search: params.search,
      roleUid: params.roleUid ?? undefined,
    }),
    [params],
  );

  /** Đổi filter thì quay về trang đầu. */
  const setFilters = useCallback(
    (filters: UserFilters) =>
      void setParams({
        ...filters,
        // nuqs dùng null để xoá tham số khỏi URL.
        ...("roleUid" in filters ? { roleUid: filters.roleUid ?? null } : {}),
        page: DEFAULT_PAGE,
      }),
    [setParams],
  );
  const setPagination = useCallback(
    (page: number, limit: number) => void setParams({ page, limit }),
    [setParams],
  );

  return { query, setFilters, setPagination };
};
