/** Danh mục nhà cung cấp và model: cố định bên BE, không phụ thuộc key nào. */
export const aiCatalogKeys = {
  all: ["ai-catalog"] as const,
  providers: () => [...aiCatalogKeys.all, "providers"] as const,
  models: (provider: string) => [...aiCatalogKeys.all, "models", provider] as const,
};
