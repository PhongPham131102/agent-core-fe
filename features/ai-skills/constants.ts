/** Khớp `AI_SKILL_LIMITS` bên agent-core-be. */
export const AI_SKILL_LIMITS = {
  codeMaxLength: 64,
  searchMaxLength: 150,
  zipMaxBytes: 5 * 1024 * 1024,
} as const;

export const SKILL_ZIP_ACCEPT = ".zip";

/** Kiểm tra nhanh ở client; BE vẫn kiểm tra nội dung gói. Trả thông báo lỗi, hoặc null. */
export const validateSkillZip = (file: File): string | null => {
  if (!file.name.toLowerCase().endsWith(SKILL_ZIP_ACCEPT)) return "Chỉ nhận file .zip";
  if (file.size > AI_SKILL_LIMITS.zipMaxBytes) return "File vượt quá 5 MB";
  return null;
};
