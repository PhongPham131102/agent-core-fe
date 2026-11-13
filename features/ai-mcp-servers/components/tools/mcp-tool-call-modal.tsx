"use client";

import { Alert, Form, Input } from "antd";

import { FormActions, FormModal } from "@/components/common";
import { zodRule } from "@/lib/form";

import { useCallAiMcpTool } from "../../api/ai-mcp-servers.queries";
import { mcpToolArgumentsSchema } from "../../schemas/ai-mcp-server.schema";
import { argumentsTemplate, parseArguments } from "../../tool-arguments";

import type { IAiMcpTool, IAiMcpToolCallResult } from "../../types/ai-mcp-server.types";

interface IMcpToolCallModalProps {
  open: boolean;
  serverUid: string;
  tool?: IAiMcpTool;
  onClose: () => void;
}

const PRE_CLASS =
  "m-0 max-h-80 overflow-auto rounded-md p-3 font-mono text-xs break-words whitespace-pre-wrap";

function CallResult({ result }: { result: IAiMcpToolCallResult }) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {result.isError && <Alert type="error" showIcon title="Tool trả về lỗi" />}
      <pre className={PRE_CLASS} style={{ background: "var(--ac-color-fill-quaternary)" }}>
        {result.text || "(trống)"}
      </pre>
      {result.structuredContent !== undefined && (
        <pre className={PRE_CLASS} style={{ background: "var(--ac-color-fill-quaternary)" }}>
          {JSON.stringify(result.structuredContent, null, 2)}
        </pre>
      )}
    </div>
  );
}

function ToolCallForm({
  serverUid,
  tool,
  onClose,
}: Omit<IMcpToolCallModalProps, "open"> & { tool: IAiMcpTool }) {
  const callTool = useCallAiMcpTool();

  return (
    <>
      <Form<{ args: string }>
        layout="vertical"
        initialValues={{ args: argumentsTemplate(tool.inputSchema) }}
        disabled={callTool.isPending}
        onFinish={({ args }) =>
          callTool.mutate({ uid: serverUid, toolName: tool.name, args: parseArguments(args) })
        }
      >
        <Form.Item label="Tham số" name="args" rules={[zodRule(mcpToolArgumentsSchema)]}>
          <Input.TextArea autoSize={{ minRows: 4, maxRows: 14 }} className="font-mono! text-xs!" />
        </Form.Item>
        <FormActions
          onCancel={onClose}
          submitting={callTool.isPending}
          submitText="Gọi"
          cancelText="Đóng"
        />
      </Form>
      {callTool.data && <CallResult result={callTool.data} />}
    </>
  );
}

/** Gọi thử một tool của server MCP với tham số JSON và xem kết quả. */
export function McpToolCallModal({ open, serverUid, tool, onClose }: IMcpToolCallModalProps) {
  return (
    <FormModal title={`Gọi thử ${tool?.name ?? ""}`} open={open} onClose={onClose} width={720}>
      {tool && <ToolCallForm serverUid={serverUid} tool={tool} onClose={onClose} />}
    </FormModal>
  );
}
