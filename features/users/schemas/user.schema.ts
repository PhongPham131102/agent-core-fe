import { z } from "zod";

import { avatarSchema, emailSchema, fullNameSchema, passwordSchema } from "@/features/auth";

export const USER_SEARCH_MAX_LENGTH = 200;

const roleUidSchema = z.string({ error: "Vui lòng chọn vai trò" }).min(1, "Vui lòng chọn vai trò");

export const createUserSchema = z.object({
  email: emailSchema,
  fullName: fullNameSchema,
  roleUid: roleUidSchema,
  password: passwordSchema,
  avatar: avatarSchema,
});
export type CreateUserValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.pick({
  fullName: true,
  roleUid: true,
  avatar: true,
});
export type UpdateUserValues = z.infer<typeof updateUserSchema>;
