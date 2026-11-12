import type { ApiError } from "@/lib/http";
import type { QueryKey } from "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    /** Mọi lỗi từ queryFn/mutationFn đều đã được chuẩn hoá thành ApiError. */
    defaultError: ApiError;
    queryMeta: {
      /** Có giá trị thì toast lỗi toàn cục; mặc định query im lặng, UI tự hiển thị lỗi. */
      errorMessage?: string;
    };
    mutationMeta: {
      /** Các key bị invalidate sau khi mutation thành công. */
      invalidates?: QueryKey[];
      successMessage?: string;
      /** Ghi đè message lỗi mặc định. */
      errorMessage?: string;
      /** Không toast lỗi (component tự xử lý). */
      silentError?: boolean;
    };
  }
}
