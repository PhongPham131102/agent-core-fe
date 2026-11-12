import type { IRoleListQuery } from "../types/role.types";

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (query: IRoleListQuery) => [...roleKeys.lists(), query] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (uid: string) => [...roleKeys.details(), uid] as const,
  options: () => [...roleKeys.all, "options"] as const,
  permissionCatalog: () => [...roleKeys.all, "permission-catalog"] as const,
};
