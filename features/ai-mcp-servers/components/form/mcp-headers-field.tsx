"use client";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";

import { IconAction } from "@/components/common";
import { zodRule } from "@/lib/form";

import { AI_MCP_SERVER_LIMITS as L } from "../../constants";
import { aiMcpServerHeaderSchema, aiMcpServerSchema } from "../../schemas/ai-mcp-server.schema";

const header = aiMcpServerHeaderSchema.shape;

/** Danh sách header gửi kèm request tới server MCP, mỗi dòng một cặp tên / giá trị. */
export function McpHeadersField() {
  return (
    <Form.List name="headers" rules={[zodRule(aiMcpServerSchema.shape.headers)]}>
      {(rows, { add, remove }, { errors }) => (
        <Form.Item label="Header">
          <div className="flex flex-col gap-2">
            {rows.map(({ key, name }) => (
              <div key={key} className="flex items-start gap-2">
                <Form.Item
                  name={[name, "key"]}
                  rules={[zodRule(header.key)]}
                  className="mb-0! w-2/5"
                >
                  <Input
                    aria-label="Tên header"
                    placeholder="Authorization"
                    maxLength={L.headerKeyMaxLength}
                  />
                </Form.Item>
                <Form.Item
                  name={[name, "value"]}
                  rules={[zodRule(header.value)]}
                  className="mb-0! flex-1"
                >
                  <Input
                    aria-label="Giá trị header"
                    placeholder="Bearer ..."
                    maxLength={L.headerValueMaxLength}
                    autoComplete="off"
                  />
                </Form.Item>
                <IconAction
                  label="Xoá header"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => remove(name)}
                />
              </div>
            ))}
            {rows.length < L.headersMax && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add({ key: "", value: "" })}
                className="self-start"
              >
                Thêm header
              </Button>
            )}
            <Form.ErrorList errors={errors} />
          </div>
        </Form.Item>
      )}
    </Form.List>
  );
}
