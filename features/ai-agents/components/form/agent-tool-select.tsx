"use client";

import { MultiSelect } from "@/components/common";

import { useAgentToolsQuery } from "../../api/ai-agents.queries";

import type { ComponentProps } from "react";

/** Chọn nhiều tool theo `id`. */
export function AgentToolSelect(
  props: Omit<ComponentProps<typeof MultiSelect>, "options" | "loading">,
) {
  const tools = useAgentToolsQuery();

  return (
    <MultiSelect
      placeholder="Chọn tool"
      {...props}
      loading={tools.isFetching}
      options={tools.data?.map(({ id, name }) => ({ value: id, label: name }))}
    />
  );
}
