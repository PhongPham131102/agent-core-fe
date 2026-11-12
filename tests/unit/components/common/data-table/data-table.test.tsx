import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DataTable } from "@/components/common/data-table/data-table";
import { ApiError } from "@/lib/http";
import { renderWithProviders } from "@/tests/support/render";

interface IRow {
  uid: string;
  name: string;
}

const columns = [{ title: "Tên", dataIndex: "name" }];
const query = { page: 3, limit: 10 };

const renderTable = (result: Partial<Parameters<typeof DataTable<IRow>>[0]["result"]>) => {
  const onPaginationChange = vi.fn();
  const refetch = vi.fn();
  renderWithProviders(
    <DataTable<IRow>
      columns={columns}
      query={query}
      onPaginationChange={onPaginationChange}
      result={{ data: undefined, error: null, isFetching: false, refetch, ...result }}
    />,
  );
  return { onPaginationChange, refetch };
};

describe("DataTable", () => {
  it("hiển thị dữ liệu của trang", () => {
    renderTable({ data: { items: [{ uid: "1", name: "Alpha" }], total: 21, page: 3, limit: 10 } });

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Tổng 21")).toBeInTheDocument();
  });

  it("lỗi và chưa có dữ liệu thì hiện lỗi kèm nút thử lại", async () => {
    const { refetch } = renderTable({ error: new ApiError(500, "ERR_1000", "Internal") });

    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));

    expect(refetch).toHaveBeenCalled();
  });

  it("lùi về trang cuối còn dữ liệu khi trang hiện tại vượt quá tổng số trang", () => {
    const { onPaginationChange } = renderTable({
      data: { items: [], total: 12, page: 3, limit: 10 },
    });

    expect(onPaginationChange).toHaveBeenCalledWith(2, 10);
  });
});
