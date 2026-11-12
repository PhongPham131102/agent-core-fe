import type { IPaginationQuery } from "@/lib/http";

/** Một mục trong danh mục của BE: `id` để gửi đi, `name` để hiển thị. */
export interface IAiCatalogOption {
  id: string;
  name: string;
}

/** Khớp `IAiApiKeyResponse` bên agent-core-be. */
export interface IAiApiKey {
  uid: string;
  provider: IAiCatalogOption;
  /** Đã che: `***` cộng 4 ký tự cuối. BE không bao giờ trả key gốc. */
  secretKey: string;
  /** Model dùng khi agent không chỉ định; `null` là chưa đặt. */
  defaultModel: IAiCatalogOption | null;
  /** Số lượt gọi thành công bằng key này. */
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export type IAiApiKeyListQuery = IPaginationQuery;

/** Đầu vào nhận `id` thô của nhà cung cấp và model. */
export interface ICreateAiApiKeyBody {
  provider: string;
  secretKey: string;
  defaultModel?: string;
}

/** Không gửi `secretKey` là giữ key cũ; `defaultModel: ""` là bỏ model mặc định. */
export interface IUpdateAiApiKeyBody {
  secretKey?: string;
  defaultModel?: string;
}
