import type { IAiSkillListQuery } from "../types/ai-skill.types";

export const aiSkillKeys = {
  all: ["ai-skills"] as const,
  lists: () => [...aiSkillKeys.all, "list"] as const,
  list: (query: IAiSkillListQuery) => [...aiSkillKeys.lists(), query] as const,
  details: () => [...aiSkillKeys.all, "detail"] as const,
  detail: (uid: string) => [...aiSkillKeys.details(), uid] as const,
  options: () => [...aiSkillKeys.all, "options"] as const,
};
