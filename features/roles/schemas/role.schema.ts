import { z } from "zod";

/** Khớp `ROLE_LIMITS` bên agent-core-be. */
export const ROLE_LIMITS = {
  nameMaxLength: 100,
  descriptionMaxLength: 500,
} as const;

export const roleSchema = z.object({
  name: z
    .string({ error: "Vui lòng nhập tên vai trò" })
    .trim()
    .min(1, "Vui lòng nhập tên vai trò")
    .max(ROLE_LIMITS.nameMaxLength, `Tên tối đa ${ROLE_LIMITS.nameMaxLength} ký tự`),
  description: z
    .string()
    .trim()
    .max(ROLE_LIMITS.descriptionMaxLength, `Mô tả tối đa ${ROLE_LIMITS.descriptionMaxLength} ký tự`)
    .optional(),
  permissions: z.array(z.string()).default([]),
});

export type RoleValues = z.input<typeof roleSchema>;
