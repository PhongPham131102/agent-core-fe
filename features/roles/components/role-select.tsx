"use client";

import { Select } from "antd";
import { useMemo } from "react";

import { useRoleOptions } from "../hooks/use-role-options";

interface IRoleSelectProps {
  /** Được `Form.Item` truyền vào khi dùng trong form. */
  value?: string | null;
  onChange?: (value: string | undefined) => void;
  /** Role đang gán, để vẫn hiện đúng tên khi nó không còn trong danh sách. */
  current?: { uid: string; name: string } | null;
  /**
   * `assign` (mặc định): chọn role để gán, khoá những role người thao tác không được gán.
   * `filter`: chọn role để lọc, role nào cũng chọn được.
   */
  purpose?: "assign" | "filter";
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Ô chọn role dùng chung cho form người dùng và bộ lọc danh sách. */
export function RoleSelect({
  value,
  onChange,
  current,
  purpose = "assign",
  placeholder = "Chọn vai trò",
  allowClear = false,
  disabled = false,
  className,
}: IRoleSelectProps) {
  const { options, isLoading, isUnavailable } = useRoleOptions();

  const selectOptions = useMemo(() => {
    const known = options.some(({ uid }) => uid === current?.uid);
    const merged = current && !known ? [{ ...current, assignable: false }, ...options] : options;

    return merged.map(({ uid, name, assignable }) => ({
      value: uid,
      label: name,
      disabled: purpose === "assign" && !assignable,
      title: purpose === "assign" && !assignable ? "Vai trò này có nhiều quyền hơn bạn" : undefined,
    }));
  }, [options, current, purpose]);

  // Ô lọc là phần phụ: không tải được danh sách thì ẩn đi thay vì hiện ô bị khoá.
  if (isUnavailable && purpose === "filter") return null;

  return (
    <Select<string>
      value={value ?? undefined}
      onChange={onChange}
      options={selectOptions}
      loading={isLoading}
      disabled={disabled || isUnavailable}
      allowClear={allowClear}
      showSearch={{ optionFilterProp: "label" }}
      placeholder={isUnavailable ? "Không tải được danh sách vai trò" : placeholder}
      className={className}
    />
  );
}
