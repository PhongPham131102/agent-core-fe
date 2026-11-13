import type { IPaginationQuery } from "@/lib/http";

/** Khớp `IAiKnowledgeBaseResponse` bên agent-core-be. */
export interface IAiKnowledgeBase {
  uid: string;
  name: string;
  description: string;
  /** Chỉ đếm tài liệu đã xử lý xong. */
  documentCount: number;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Một mục của ô chọn kho (`GET /ai-knowledge-bases/options`), cũng là dạng kho gắn trong agent. */
export interface IAiKnowledgeBaseOption {
  uid: string;
  name: string;
  description: string;
}

export const KnowledgeDocumentStatus = {
  processing: "processing",
  ready: "ready",
  failed: "failed",
} as const;

export type KnowledgeDocumentStatus =
  (typeof KnowledgeDocumentStatus)[keyof typeof KnowledgeDocumentStatus];

/** Khớp `IAiKnowledgeDocumentResponse` bên agent-core-be. */
export interface IAiKnowledgeDocument {
  uid: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  chunkCount: number;
  status: { id: KnowledgeDocumentStatus; name: string };
  /** Lý do xử lý lỗi khi `status` là `failed`. */
  errorMessage: string;
  createdAt: string;
}

/** Một đoạn tìm được khi tìm thử trong kho. */
export interface IAiKnowledgeSearchHit {
  documentUid: string;
  fileName: string;
  chunkIndex: number;
  content: string;
  /** Độ giống, càng gần 1 càng khớp. */
  score: number;
}

export interface IAiKnowledgeBaseListQuery extends IPaginationQuery {
  /** Tìm theo tên hoặc mô tả. */
  search?: string;
}

export interface ISaveAiKnowledgeBaseBody {
  name: string;
  description?: string;
}

export interface ISearchAiKnowledgeBody {
  query: string;
  topK?: number;
}
