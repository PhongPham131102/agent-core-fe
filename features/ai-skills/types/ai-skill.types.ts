import type { IPaginationQuery } from "@/lib/http";

/** Khớp `IAiSkillResponse` bên agent-core-be. */
export interface IAiSkill {
  uid: string;
  code: string;
  /** `name` trong frontmatter của SKILL.md. */
  name: string;
  /** Tên hiển thị trong `agents/openai.yaml`; "" là không có. */
  displayName: string;
  description: string;
  /** "" là không có icon. */
  iconUrl: string;
  /** Đường dẫn các file trong gói skill. */
  files: string[];
  createdAt: string;
  updatedAt: string;
}

/** `GET /ai-skills/:uid`: thêm phần hướng dẫn agent sẽ nhận (markdown). */
export interface IAiSkillDetail extends IAiSkill {
  content: string;
}

/** Một mục của ô chọn skill (`GET /ai-skills/options`), cũng là dạng skill gắn trong agent. */
export interface IAiSkillOption {
  code: string;
  name: string;
  description: string;
  iconUrl: string;
}

export interface IAiSkillListQuery extends IPaginationQuery {
  /** Tìm theo code, name, displayName. */
  search?: string;
}

export interface IUploadAiSkillBody {
  file: File;
  /** Bỏ trống thì BE lấy slug của `name` trong SKILL.md. */
  code?: string;
}
