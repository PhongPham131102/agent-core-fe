"use client";

import { Form, Select } from "antd";

import { getErrorMessage } from "@/lib/http";

import { useAiModelsQuery } from "../api/ai-api-keys.queries";

interface IDefaultModelItemProps {
  /** `id` nhà cung cấp; chưa chọn thì ô này khoá. */
  provider?: string;
}

/** Ô "Model mặc định": chọn trong danh mục model mà BE hỗ trợ cho nhà cung cấp. */
export function DefaultModelItem({ provider }: IDefaultModelItemProps) {
  const models = useAiModelsQuery(provider);

  return (
    <Form.Item
      label="Model mặc định"
      name="defaultModel"
      tooltip="Dùng khi agent không chỉ định model"
      extra={
        models.isError
          ? `Không tải được danh sách model: ${getErrorMessage(models.error)}`
          : undefined
      }
    >
      <Select
        showSearch={{ optionFilterProp: ["label", "value"] }}
        allowClear
        disabled={!provider}
        loading={models.isFetching}
        placeholder={provider ? "Chọn model" : "Chọn nhà cung cấp trước"}
        options={models.data?.map(({ id, name }) => ({ value: id, label: name }))}
        notFoundContent={models.isFetching ? "Đang tải..." : "Không có model phù hợp"}
      />
    </Form.Item>
  );
}
