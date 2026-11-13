import type { IAiKnowledgeBaseListQuery } from "../types/ai-knowledge.types";
import type { IPaginationQuery } from "@/lib/http";

export const aiKnowledgeKeys = {
  all: ["ai-knowledge-bases"] as const,
  lists: () => [...aiKnowledgeKeys.all, "list"] as const,
  list: (query: IAiKnowledgeBaseListQuery) => [...aiKnowledgeKeys.lists(), query] as const,
  options: () => [...aiKnowledgeKeys.all, "options"] as const,
  documents: (baseUid: string) => [...aiKnowledgeKeys.all, "documents", baseUid] as const,
  documentList: (baseUid: string, query: IPaginationQuery) =>
    [...aiKnowledgeKeys.documents(baseUid), query] as const,
};
