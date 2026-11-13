/** Khớp `AI_KNOWLEDGE_LIMITS` và `AI_KNOWLEDGE_FILE_EXTENSIONS` bên agent-core-be. */
export const AI_KNOWLEDGE_LIMITS = {
  nameMaxLength: 150,
  descriptionMaxLength: 500,
  searchMaxLength: 150,
  queryMaxLength: 2000,
  maxFilesPerUpload: 10,
  fileMaxBytes: 2 * 1024 * 1024,
} as const;

export const KNOWLEDGE_FILE_EXTENSIONS = [".txt", ".md", ".markdown", ".csv", ".json"];

export const KNOWLEDGE_FILE_ACCEPT = KNOWLEDGE_FILE_EXTENSIONS.join(",");

const extensionOf = (fileName: string) => fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

/** Kiểm tra nhanh một lượt tải ở client; BE vẫn kiểm tra lại. Trả thông báo lỗi, hoặc null. */
export const validateKnowledgeFiles = (files: File[]): string | null => {
  if (files.length > AI_KNOWLEDGE_LIMITS.maxFilesPerUpload) {
    return `Tối đa ${AI_KNOWLEDGE_LIMITS.maxFilesPerUpload} file mỗi lần`;
  }
  const wrongType = files.find(
    ({ name }) => !KNOWLEDGE_FILE_EXTENSIONS.includes(extensionOf(name)),
  );
  if (wrongType) return `${wrongType.name}: chỉ nhận ${KNOWLEDGE_FILE_EXTENSIONS.join(", ")}`;
  const tooLarge = files.find(({ size }) => size > AI_KNOWLEDGE_LIMITS.fileMaxBytes);
  if (tooLarge) return `${tooLarge.name}: vượt quá 2 MB`;
  return null;
};
