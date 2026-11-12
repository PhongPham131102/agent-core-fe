import type { IAiSkill } from "./types/ai-skill.types";

/** Tên để hiện: tên hiển thị trong `agents/openai.yaml` nếu có, không thì `name` của SKILL.md. */
export const skillTitle = ({ displayName, name }: Pick<IAiSkill, "displayName" | "name">) =>
  displayName || name;
