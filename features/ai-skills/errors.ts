import { CommonErrorCode, registerErrorMessages } from "@/lib/http";

/** Khớp `AiSkillErrors` bên agent-core-be. */
export const AiSkillErrorCode = {
  notFound: "ERR_2600",
  codeExists: "ERR_2601",
  codeRequired: "ERR_2602",
  fileRequired: "ERR_2603",
  zipInvalid: "ERR_2604",
  invalidFilePath: "ERR_2605",
  tooManyFiles: "ERR_2606",
  fileTooLarge: "ERR_2607",
  skillMarkdownRequired: "ERR_2608",
  skillMarkdownEmpty: "ERR_2609",
  frontmatterInvalid: "ERR_2610",
  configInvalid: "ERR_2611",
} as const;

registerErrorMessages({
  [AiSkillErrorCode.notFound]: "Không tìm thấy skill",
  [AiSkillErrorCode.codeExists]: "Mã skill đã được sử dụng",
  [AiSkillErrorCode.codeRequired]: "Không tạo được mã từ tên trong SKILL.md, vui lòng nhập mã",
  [AiSkillErrorCode.fileRequired]: "Vui lòng chọn file .zip",
  [AiSkillErrorCode.zipInvalid]: "File không phải .zip hợp lệ",
  [AiSkillErrorCode.invalidFilePath]: "Gói skill có đường dẫn file không hợp lệ",
  [AiSkillErrorCode.tooManyFiles]: "Gói skill có quá 30 file",
  [AiSkillErrorCode.fileTooLarge]: "Gói skill có file lớn hơn 200 KB",
  [AiSkillErrorCode.skillMarkdownRequired]: "Gói skill phải có SKILL.md ở thư mục gốc",
  [AiSkillErrorCode.skillMarkdownEmpty]: "SKILL.md đang trống",
  [AiSkillErrorCode.frontmatterInvalid]: "Phần frontmatter của SKILL.md không phải YAML hợp lệ",
  [AiSkillErrorCode.configInvalid]: "File agents/openai.yaml không hợp lệ",
});

/** Lỗi BE gắn với một field của form tải skill: hiện ngay dưới field đó. */
export const SKILL_FIELD_BY_ERROR: Record<string, "code" | "file"> = {
  [AiSkillErrorCode.codeExists]: "code",
  [AiSkillErrorCode.codeRequired]: "code",
  [CommonErrorCode.payloadTooLarge]: "file",
  ...Object.fromEntries(
    [
      AiSkillErrorCode.fileRequired,
      AiSkillErrorCode.zipInvalid,
      AiSkillErrorCode.invalidFilePath,
      AiSkillErrorCode.tooManyFiles,
      AiSkillErrorCode.fileTooLarge,
      AiSkillErrorCode.skillMarkdownRequired,
      AiSkillErrorCode.skillMarkdownEmpty,
      AiSkillErrorCode.frontmatterInvalid,
      AiSkillErrorCode.configInvalid,
    ].map((code) => [code, "file"]),
  ),
};
