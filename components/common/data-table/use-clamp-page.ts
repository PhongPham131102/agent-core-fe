import { useEffect } from "react";

import { lastPageOf } from "@/lib/url";

import type { IPaginated } from "@/lib/http";

export const useClampPage = (
  data: IPaginated<unknown> | undefined,
  query: { page: number; limit: number },
  setPagination: (page: number, limit: number) => void,
) => {
  const lastPage = data ? lastPageOf(data.total, query.limit) : undefined;

  useEffect(() => {
    if (lastPage !== undefined && query.page > lastPage) setPagination(lastPage, query.limit);
  }, [lastPage, query.page, query.limit, setPagination]);
};
