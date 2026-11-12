import { compactParams, http } from "@/lib/http";

import type {
  IAiSkill,
  IAiSkillDetail,
  IAiSkillListQuery,
  IAiSkillOption,
  IUploadAiSkillBody,
} from "../types/ai-skill.types";
import type { IPaginated } from "@/lib/http";

const BASE = "/ai-skills";
/** Tên field multipart BE đọc (`AI_SKILL_FILE_FIELD`). */
const FILE_FIELD = "file";
const UPLOAD_TIMEOUT_MS = 120_000;

const toFormData = ({ file, code }: IUploadAiSkillBody) => {
  const body = new FormData();
  body.append(FILE_FIELD, file);
  if (code) body.append("code", code);
  return body;
};

export const aiSkillService = {
  list: (query: IAiSkillListQuery) =>
    http.get<IPaginated<IAiSkill>>(BASE, { params: compactParams(query) }),
  detail: (uid: string) => http.get<IAiSkillDetail>(`${BASE}/${uid}`),
  /** Mọi skill, đã sắp theo tên, cho ô chọn skill của agent. Cần quyền `ai-agent:read`. */
  options: () => http.get<IAiSkillOption[]>(`${BASE}/options`),
  create: (body: IUploadAiSkillBody) =>
    http.post<IAiSkill>(BASE, toFormData(body), { timeout: UPLOAD_TIMEOUT_MS }),
  /** Thay toàn bộ file bằng gói mới; mã giữ nguyên. */
  replaceFiles: (uid: string, file: File) =>
    http.put<IAiSkill>(`${BASE}/${uid}/files`, toFormData({ file }), {
      timeout: UPLOAD_TIMEOUT_MS,
    }),
  remove: (uid: string) => http.delete(`${BASE}/${uid}`),
};
