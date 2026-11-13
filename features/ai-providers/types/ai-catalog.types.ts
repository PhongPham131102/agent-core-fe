/** Một mục trong danh mục của BE: `id` để gửi đi, `name` để hiển thị. */
export interface IAiCatalogOption {
  id: string;
  name: string;
}

/** Model trong danh mục của một nhà cung cấp (`GET /ai-api-keys/models/:provider`). */
export interface IAiModelOption extends IAiCatalogOption {
  /** false: model bỏ qua temperature, chỉ dùng mức suy luận. */
  acceptsTemperature: boolean;
}
