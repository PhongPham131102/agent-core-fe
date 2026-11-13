"use client";

import { MultiSelect } from "@/components/common";

import { useAiKnowledgeBaseOptionsQuery } from "../api/ai-knowledge.queries";

import type { ComponentProps } from "react";

/** Chọn nhiều kho tri thức theo `uid`. */
export function AiKnowledgeBaseSelect(
  props: Omit<ComponentProps<typeof MultiSelect>, "options" | "loading">,
) {
  const bases = useAiKnowledgeBaseOptionsQuery();

  return (
    <MultiSelect
      placeholder="Chọn kho tri thức"
      {...props}
      loading={bases.isFetching}
      options={bases.data?.map(({ uid, name }) => ({ value: uid, label: name }))}
    />
  );
}
