import type { ReactNode } from "react";

/** Hàng bộ lọc phía trên bảng của trang danh sách. */
export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap gap-3">{children}</div>;
}
