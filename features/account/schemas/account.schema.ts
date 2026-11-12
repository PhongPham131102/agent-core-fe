import { z } from "zod";

import { currentPasswordSchema, fullNameSchema, passwordSchema } from "@/features/auth";

export const profileInfoSchema = z.object({ fullName: fullNameSchema });
export type ProfileInfoValues = z.infer<typeof profileInfoSchema>;

export const changePasswordSchema = z.object({
  oldPassword: currentPasswordSchema,
  newPassword: passwordSchema,
});
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
