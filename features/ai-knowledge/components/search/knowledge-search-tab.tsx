"use client";

import { Button, Card, Empty, Form, Input, Tag, Typography } from "antd";

import { zodRule } from "@/lib/form";

import { useSearchAiKnowledge } from "../../api/ai-knowledge.queries";
import { AI_KNOWLEDGE_LIMITS } from "../../constants";
import { knowledgeSearchSchema } from "../../schemas/ai-knowledge-base.schema";

import type { KnowledgeSearchValues } from "../../schemas/ai-knowledge-base.schema";

const scoreFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 });

/** Tìm thử theo ngữ nghĩa trong một kho, để xem agent sẽ nhận được đoạn nào. */
export function KnowledgeSearchTab({ baseUid }: { baseUid: string }) {
  const search = useSearchAiKnowledge();

  const handleFinish = (values: KnowledgeSearchValues) =>
    search.mutate({ uid: baseUid, body: knowledgeSearchSchema.parse(values) });

  return (
    <div className="flex flex-col gap-4">
      <Form<KnowledgeSearchValues> layout="vertical" onFinish={handleFinish}>
        <Form.Item name="query" rules={[zodRule(knowledgeSearchSchema.shape.query)]}>
          <Input.TextArea
            aria-label="Câu hỏi"
            maxLength={AI_KNOWLEDGE_LIMITS.queryMaxLength}
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="Nhập câu hỏi"
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={search.isPending}>
          Tìm
        </Button>
      </Form>
      {search.data?.length === 0 && <Empty description="Không có đoạn phù hợp" />}
      {search.data?.map((hit) => (
        <Card key={`${hit.documentUid}-${hit.chunkIndex}`} size="small">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Typography.Text strong ellipsis>
              {hit.fileName} · đoạn {hit.chunkIndex + 1}
            </Typography.Text>
            <Tag className="me-0!">{scoreFormatter.format(hit.score)}</Tag>
          </div>
          <Typography.Paragraph className="mb-0! whitespace-pre-wrap">
            {hit.content}
          </Typography.Paragraph>
        </Card>
      ))}
    </div>
  );
}
