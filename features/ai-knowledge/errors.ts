import { registerErrorMessages } from "@/lib/http";

/** Khớp `AiKnowledgeErrors` bên agent-core-be. */
export const AiKnowledgeErrorCode = {
  notFound: "ERR_2800",
  documentNotFound: "ERR_2801",
  filesRequired: "ERR_2802",
  fileTypeNotSupported: "ERR_2803",
  documentEmpty: "ERR_2804",
  documentTooLarge: "ERR_2805",
} as const;

registerErrorMessages({
  [AiKnowledgeErrorCode.notFound]: "Không tìm thấy kho tri thức",
  [AiKnowledgeErrorCode.documentNotFound]: "Không tìm thấy tài liệu",
  [AiKnowledgeErrorCode.filesRequired]: "Vui lòng chọn ít nhất một file",
  [AiKnowledgeErrorCode.fileTypeNotSupported]: "Chỉ nhận file .txt, .md, .markdown, .csv, .json",
  [AiKnowledgeErrorCode.documentEmpty]: "File không có nội dung chữ",
  [AiKnowledgeErrorCode.documentTooLarge]: "File có quá nhiều chữ",
});

/** Lỗi BE gắn với ô chọn file của form tải tài liệu. */
export const DOCUMENT_FIELD_BY_ERROR: Record<string, "files"> = Object.fromEntries(
  [AiKnowledgeErrorCode.filesRequired, AiKnowledgeErrorCode.fileTypeNotSupported].map((code) => [
    code,
    "files",
  ]),
);
