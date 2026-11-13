import { compactParams, http } from "@/lib/http";

import type {
  IAiKnowledgeBase,
  IAiKnowledgeBaseListQuery,
  IAiKnowledgeBaseOption,
  IAiKnowledgeDocument,
  IAiKnowledgeSearchHit,
  ISaveAiKnowledgeBaseBody,
  ISearchAiKnowledgeBody,
} from "../types/ai-knowledge.types";
import type { IPaginated, IPaginationQuery } from "@/lib/http";

const BASE = "/ai-knowledge-bases";
/** Tên field multipart BE đọc (`AI_KNOWLEDGE_FILES_FIELD`). */
const FILES_FIELD = "files";
/** BE tách đoạn và tạo embedding ngay trong request nên cần lâu hơn mặc định. */
const PROCESSING_TIMEOUT_MS = 300_000;

export const aiKnowledgeService = {
  list: (query: IAiKnowledgeBaseListQuery) =>
    http.get<IPaginated<IAiKnowledgeBase>>(BASE, { params: compactParams(query) }),
  /** Mọi kho, cho ô chọn kho của agent. Cần quyền `ai-agent:read`. */
  options: () => http.get<IAiKnowledgeBaseOption[]>(`${BASE}/options`),
  create: (body: ISaveAiKnowledgeBaseBody) => http.post<IAiKnowledgeBase>(BASE, body),
  update: (uid: string, body: Partial<ISaveAiKnowledgeBaseBody>) =>
    http.patch<IAiKnowledgeBase>(`${BASE}/${uid}`, body),
  remove: (uid: string) => http.delete(`${BASE}/${uid}`),
  search: (uid: string, body: ISearchAiKnowledgeBody) =>
    http.post<IAiKnowledgeSearchHit[]>(`${BASE}/${uid}/search`, body),

  documents: (uid: string, query: IPaginationQuery) =>
    http.get<IPaginated<IAiKnowledgeDocument>>(`${BASE}/${uid}/documents`, {
      params: compactParams(query),
    }),
  uploadDocuments: (uid: string, files: File[]) => {
    const body = new FormData();
    files.forEach((file) => body.append(FILES_FIELD, file));
    return http.post<IAiKnowledgeDocument[]>(`${BASE}/${uid}/documents`, body, {
      timeout: PROCESSING_TIMEOUT_MS,
    });
  },
  removeDocument: (uid: string, documentUid: string) =>
    http.delete(`${BASE}/${uid}/documents/${documentUid}`),
};
