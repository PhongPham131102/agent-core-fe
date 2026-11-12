import { z } from "zod";

export const AUTH_LIMITS = {
  emailMaxLength: 254,
  fullNameMaxLength: 150,
  avatarMaxLength: 2048,
  passwordMinLength: 8,
  passwordMaxBytes: 72,
} as const;

const SYMBOL_PATTERN = /[-#!$@£%^&*()_+|~=`{}[\]:";'<>?,./\\ ]/;

const byteLength = (value: string) => new TextEncoder().encode(value).length;

export const PASSWORD_POLICY_HINT = `Từ ${AUTH_LIMITS.passwordMinLength} ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt`;

export const emailSchema = z
  .string({ error: "Vui lòng nhập email" })
  .trim()
  .min(1, "Vui lòng nhập email")
  .max(AUTH_LIMITS.emailMaxLength, `Email tối đa ${AUTH_LIMITS.emailMaxLength} ký tự`)
  .pipe(z.email("Email không hợp lệ"));

export const passwordSchema = z
  .string({ error: "Vui lòng nhập mật khẩu" })
  .min(AUTH_LIMITS.passwordMinLength, PASSWORD_POLICY_HINT)
  .refine((value) => byteLength(value) <= AUTH_LIMITS.passwordMaxBytes, "Mật khẩu quá dài")
  .refine(
    (value) =>
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value) &&
      SYMBOL_PATTERN.test(value),
    PASSWORD_POLICY_HINT,
  );

export const currentPasswordSchema = z
  .string({ error: "Vui lòng nhập mật khẩu" })
  .min(1, "Vui lòng nhập mật khẩu")
  .refine((value) => byteLength(value) <= AUTH_LIMITS.passwordMaxBytes, "Mật khẩu quá dài");

export const fullNameSchema = z
  .string()
  .trim()
  .max(AUTH_LIMITS.fullNameMaxLength, `Họ tên tối đa ${AUTH_LIMITS.fullNameMaxLength} ký tự`)
  .optional();

export const avatarSchema = z
  .union([
    z.literal(""),
    z
      .url({ protocol: /^https?$/, error: "Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://" })
      .max(AUTH_LIMITS.avatarMaxLength, "Đường dẫn ảnh quá dài"),
  ])
  .optional();

export const loginSchema = z.object({
  email: emailSchema,
  password: currentPasswordSchema,
});
export type LoginValues = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  fullName: fullNameSchema,
  avatar: avatarSchema,
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z.object({
  oldPassword: currentPasswordSchema,
  newPassword: passwordSchema,
});
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
