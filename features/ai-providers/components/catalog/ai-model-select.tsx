"use client";

import { Select } from "antd";

import { getErrorMessage } from "@/lib/http";

import { useAiModelsQuery } from "../../api/ai-catalog.queries";

import type { SelectProps } from "antd";

interface IAiModelSelectProps extends Omit<SelectProps<string>, "options" | "loading"> {
  /** `id` nhà cung cấp; chưa chọn thì ô này khoá. */
  provider?: string;
}

/**
 * Ô chọn model trong danh mục BE hỗ trợ cho một nhà cung cấp, tìm được theo tên lẫn mã.
 * Đổi nhà cung cấp thì nơi dùng phải tự bỏ giá trị cũ, vì model thuộc từng nhà cung cấp.
 */
export function AiModelSelect({ provider, disabled, ...selectProps }: IAiModelSelectProps) {
  const models = useAiModelsQuery(provider);

  const notFoundContent = models.isError
    ? `Không tải được danh sách model: ${getErrorMessage(models.error)}`
    : models.isFetching
      ? "Đang tải..."
      : "Không có model phù hợp";

  return (
    <Select<string>
      showSearch={{ optionFilterProp: ["label", "value"] }}
      placeholder={provider ? "Chọn model" : "Chọn nhà cung cấp trước"}
      notFoundContent={notFoundContent}
      {...selectProps}
      disabled={disabled || !provider}
      loading={models.isFetching}
      options={models.data?.map(({ id, name }) => ({ value: id, label: name }))}
    />
  );
}
