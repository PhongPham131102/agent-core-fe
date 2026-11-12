import type { IPaginated } from "@/lib/http";
import type { TablePaginationConfig } from "antd";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const toTablePagination = (
  data: IPaginated<unknown> | undefined,
  query: { page: number; limit: number },
  onChange: (page: number, limit: number) => void,
): TablePaginationConfig => ({
  current: query.page,
  pageSize: query.limit,
  total: data?.total ?? 0,
  showSizeChanger: true,
  pageSizeOptions: PAGE_SIZE_OPTIONS,
  showTotal: (total) => `Tổng ${total}`,
  onChange,
});
