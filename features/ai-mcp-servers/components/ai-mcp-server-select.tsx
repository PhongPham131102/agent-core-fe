"use client";

import { MultiSelect } from "@/components/common";

import { useAiMcpServerOptionsQuery } from "../api/ai-mcp-servers.queries";

import type { ComponentProps } from "react";

/** Chọn nhiều MCP server theo `code`. */
export function AiMcpServerSelect(
  props: Omit<ComponentProps<typeof MultiSelect>, "options" | "loading">,
) {
  const servers = useAiMcpServerOptionsQuery();

  return (
    <MultiSelect
      placeholder="Chọn MCP server"
      {...props}
      loading={servers.isFetching}
      options={servers.data?.map(({ code, name }) => ({ value: code, label: name }))}
    />
  );
}
