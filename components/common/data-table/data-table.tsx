"use client";

import { Table } from "antd";

import { ErrorView } from "../feedback";

import { toTablePagination } from "./table-pagination";
import { useClampPage } from "./use-clamp-page";

import type { ApiError, IPaginated } from "@/lib/http";
import type { UseQueryResult } from "@tanstack/react-query";
import type { TableProps } from "antd";

const MIN_SCROLL_WIDTH = 720;

interface IDataTableProps<T> extends Omit<TableProps<T>, "dataSource" | "loading" | "pagination"> {
  result: Pick<
    UseQueryResult<IPaginated<T>, ApiError>,
    "data" | "error" | "isFetching" | "refetch"
  >;
  query: { page: number; limit: number };
  onPaginationChange: (page: number, limit: number) => void;
}

export function DataTable<T extends object>({
  result,
  query,
  onPaginationChange,
  ...tableProps
}: IDataTableProps<T>) {
  const { data, error, isFetching, refetch } = result;

  useClampPage(data, query, onPaginationChange);

  if (error && !data) return <ErrorView error={error} retry={() => void refetch()} />;

  return (
    <Table<T>
      rowKey="uid"
      scroll={{ x: MIN_SCROLL_WIDTH }}
      {...tableProps}
      dataSource={data?.items}
      loading={isFetching}
      pagination={toTablePagination(data, query, onPaginationChange)}
    />
  );
}
