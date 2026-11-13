/** Khớp `IAiMemoryResponse` bên agent-core-be: điều agent ghi nhớ về người dùng hiện tại. */
export interface IAiMemory {
  uid: string;
  content: string;
  createdAt: string;
}
