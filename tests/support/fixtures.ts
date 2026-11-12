/** Dữ liệu mẫu dùng chung giữa các test, khớp response của agent-core-be. */
export const buildAuthUser = (overrides: Record<string, unknown> = {}) => ({
  uid: "11111111-1111-4111-8111-111111111111",
  email: "admin@example.com",
  fullName: "Admin",
  avatar: "",
  roleUid: "22222222-2222-4222-8222-222222222222",
  role: { uid: "22222222-2222-4222-8222-222222222222", name: "Editor", isSuperAdmin: false },
  permissions: ["user:read"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});
