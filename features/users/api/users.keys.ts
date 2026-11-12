import type { IUserListQuery } from "../types/user.types";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (query: IUserListQuery) => [...userKeys.lists(), query] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (uid: string) => [...userKeys.details(), uid] as const,
};
