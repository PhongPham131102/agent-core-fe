import { parseAsInteger, parseAsString } from "nuqs";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 200;

export const paginationParsers = {
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
  limit: parseAsInteger.withDefault(DEFAULT_LIMIT),
};

export const searchParser = parseAsString.withDefault("");

export const clampPagination = ({ page, limit }: { page: number; limit: number }) => ({
  page: Math.max(DEFAULT_PAGE, page),
  limit: Math.min(MAX_LIMIT, Math.max(1, limit)),
});

export const lastPageOf = (total: number, limit: number) =>
  Math.max(DEFAULT_PAGE, Math.ceil(total / limit));
