"use client";

import { Select } from "antd";

import { useAiSkillOptionsQuery } from "../api/ai-skills.queries";

import type { SelectProps } from "antd";

/** Chọn nhiều skill theo `code`. Dùng trong `Form.Item` như ô thường. */
export function AiSkillSelect(props: Omit<SelectProps<string[]>, "mode" | "options" | "loading">) {
  const skills = useAiSkillOptionsQuery();

  return (
    <Select<string[]>
      mode="multiple"
      allowClear
      showSearch={{ optionFilterProp: ["label", "value"] }}
      placeholder="Chọn skill"
      {...props}
      loading={skills.isFetching}
      options={skills.data?.map(({ code, name }) => ({ value: code, label: name }))}
    />
  );
}
