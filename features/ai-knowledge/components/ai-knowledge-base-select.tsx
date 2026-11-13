"use client";

import { Select } from "antd";

import { useAiKnowledgeBaseOptionsQuery } from "../api/ai-knowledge.queries";

import type { SelectProps } from "antd";

/** Chọn nhiều kho tri thức theo `uid`. Dùng trong `Form.Item` như ô thường. */
export function AiKnowledgeBaseSelect(
  props: Omit<SelectProps<string[]>, "mode" | "options" | "loading">,
) {
  const bases = useAiKnowledgeBaseOptionsQuery();

  return (
    <Select<string[]>
      mode="multiple"
      allowClear
      showSearch={{ optionFilterProp: "label" }}
      placeholder="Chọn kho tri thức"
      {...props}
      loading={bases.isFetching}
      options={bases.data?.map(({ uid, name }) => ({ value: uid, label: name }))}
    />
  );
}
