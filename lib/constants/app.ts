/** Thông tin nhận diện của ứng dụng, dùng ở metadata, trang login và sidebar. */
export const appConfig = {
  name: "Agent Core",
  description: "Bảng điều khiển quản lý AI agent",
  logo: "/assets/common/logo.svg",
  /** Email gợi ý trong các ô nhập email (đăng nhập, tạo người dùng). */
  emailPlaceholder: "ten@happyuid.com",
} as const;
