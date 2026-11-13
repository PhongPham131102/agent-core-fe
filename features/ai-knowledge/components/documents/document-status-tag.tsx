"use client";

import { Tag, Tooltip } from "antd";

import { KnowledgeDocumentStatus } from "../../types/ai-knowledge.types";

import type { IAiKnowledgeDocument } from "../../types/ai-knowledge.types";

const STATUS_COLOR: Record<KnowledgeDocumentStatus, string> = {
  [KnowledgeDocumentStatus.processing]: "processing",
  [KnowledgeDocumentStatus.ready]: "success",
  [KnowledgeDocumentStatus.failed]: "error",
};

/** Trạng thái xử lý của tài liệu; tài liệu lỗi thì rê chuột để xem lý do BE trả về. */
export function DocumentStatusTag({ status, errorMessage }: IAiKnowledgeDocument) {
  const tag = <Tag color={STATUS_COLOR[status.id]}>{status.name}</Tag>;
  return errorMessage ? <Tooltip title={errorMessage}>{tag}</Tooltip> : tag;
}
