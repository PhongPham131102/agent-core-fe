"use client";

import { MultiSelect } from "@/components/common";

import { useAiSkillOptionsQuery } from "../api/ai-skills.queries";

import type { ComponentProps } from "react";

/** Chọn nhiều skill theo `code`. */
export function AiSkillSelect(
  props: Omit<ComponentProps<typeof MultiSelect>, "options" | "loading">,
) {
  const skills = useAiSkillOptionsQuery();

  return (
    <MultiSelect
      placeholder="Chọn skill"
      {...props}
      loading={skills.isFetching}
      options={skills.data?.map(({ code, name }) => ({ value: code, label: name }))}
    />
  );
}
