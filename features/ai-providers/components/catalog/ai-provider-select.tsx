"use client";

import { Select } from "antd";

import { getErrorMessage } from "@/lib/http";

import { useAiProvidersQuery } from "../../api/ai-catalog.queries";

import type { SelectProps } from "antd";

interface IAiProviderSelectProps extends Omit<SelectProps<string>, "options" | "loading"> {
  /** `id` các nhà cung cấp không được chọn (ví dụ đã có key). */
  disabledIds?: readonly string[];
  /** Ghi chú cạnh tên nhà cung cấp bị khoá, ví dụ "đã có key". */
  disabledNote?: string;
}

/** Ô chọn nhà cung cấp AI, lấy từ danh mục của BE. Dùng trong `Form.Item` như ô thường. */
export function AiProviderSelect({
  disabledIds = [],
  disabledNote,
  ...selectProps
}: IAiProviderSelectProps) {
  const providers = useAiProvidersQuery();

  return (
    <Select<string>
      placeholder="Chọn nhà cung cấp"
      notFoundContent={
        providers.isError
          ? `Không tải được danh sách nhà cung cấp: ${getErrorMessage(providers.error)}`
          : undefined
      }
      {...selectProps}
      loading={providers.isFetching}
      options={providers.data?.map(({ id, name }) => {
        const disabled = disabledIds.includes(id);
        return {
          value: id,
          label: disabled && disabledNote ? `${name} (${disabledNote})` : name,
          disabled,
        };
      })}
    />
  );
}
