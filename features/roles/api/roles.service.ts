import { compactParams, http } from "@/lib/http";

import type {
  ICreateRoleBody,
  IPermissionGroup,
  IRole,
  IRoleListQuery,
  IRoleOption,
  IUpdateRoleBody,
} from "../types/role.types";
import type { IPaginated } from "@/lib/http";

const BASE = "/roles";

export const roleService = {
  list: (query: IRoleListQuery) =>
    http.get<IPaginated<IRole>>(BASE, { params: compactParams(query) }),
  detail: (uid: string) => http.get<IRole>(`${BASE}/${uid}`),
  create: (body: ICreateRoleBody) => http.post<IRole>(BASE, body),
  update: (uid: string, body: IUpdateRoleBody) => http.patch<IRole>(`${BASE}/${uid}`, body),
  remove: (uid: string) => http.delete(`${BASE}/${uid}`),
  permissionCatalog: () => http.get<IPermissionGroup[]>("/permissions"),

  /** Mọi role, đã sắp theo tên, cho ô chọn và ô lọc. Cần quyền `user:read`. */
  options: () => http.get<IRoleOption[]>(`${BASE}/options`),
};
