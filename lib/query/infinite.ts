import type { IPaginated } from "@/lib/http";

/** `getNextPageParam` cho `useInfiniteQuery` trên API phân trang `{ items, total, page, limit }`. */
export const nextPageOf = ({ page, limit, total }: IPaginated<unknown>) =>
  page * limit < total ? page + 1 : undefined;
