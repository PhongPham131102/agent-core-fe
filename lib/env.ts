import { z } from "zod";

/**
 * Validate biến môi trường một lần khi module được load (fail fast).
 * Biến NEXT_PUBLIC_* phải được đọc bằng tên đầy đủ để Next inline lúc build.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsed.success) {
  throw new Error(`Biến môi trường không hợp lệ:\n${z.prettifyError(parsed.error)}`);
}

export const env = {
  apiUrl: parsed.data.NEXT_PUBLIC_API_URL,
  isDev: process.env.NODE_ENV === "development",
} as const;
