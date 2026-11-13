/**
 * Nhãn tiếng Việt cho danh mục quyền. Danh mục lấy động từ BE (GET /permissions),
 * nên quyền mới chưa có nhãn vẫn hiển thị được bằng tên gốc.
 */
const SUBJECT_LABELS: Record<string, string> = {
  user: "Người dùng",
  role: "Vai trò",
  upload: "Ảnh tải lên",
  "ai-api-key": "API key AI",
  "ai-agent": "AI agent",
  "ai-skill": "Skill",
  "ai-knowledge": "Kho tri thức",
  "ai-chat": "Chat AI",
};

const ACTION_LABELS: Record<string, string> = {
  read: "Xem",
  create: "Tạo",
  update: "Sửa",
  delete: "Xoá",
  use: "Dùng",
};

export const subjectLabel = (subject: string) => SUBJECT_LABELS[subject] ?? subject;
export const actionLabel = (action: string) => ACTION_LABELS[action] ?? action;

/** "user:create" → "Tạo người dùng". */
export const permissionLabel = (key: string) => {
  const [subject = "", action = ""] = key.split(":");
  return `${actionLabel(action)} ${subjectLabel(subject).toLowerCase()}`;
};

/** Gom danh sách quyền theo đối tượng, giữ thứ tự xuất hiện: "user:read" → { user: ["read"] }. */
export const groupPermissions = (keys: readonly string[]) => {
  const groups = new Map<string, string[]>();
  for (const key of keys) {
    const [subject = "", action = ""] = key.split(":");
    groups.set(subject, [...(groups.get(subject) ?? []), action]);
  }
  return [...groups].map(([subject, actions]) => ({ subject, actions }));
};
