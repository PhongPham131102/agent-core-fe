/**
 * Giữ access token trong bộ nhớ (không ghi localStorage để giảm rủi ro XSS).
 * Khi BE auth sẵn sàng: lúc tải trang gọi refresh (cookie httpOnly) để lấy lại token.
 * Mọi chỗ đọc/ghi token đều đi qua đây, nên đổi chiến lược lưu trữ chỉ sửa một file.
 */
let accessToken: string | null = null;

export const tokenHolder = {
  get: () => accessToken,
  set: (token: string) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};
