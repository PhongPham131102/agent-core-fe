/** Khớp `IUploadResponse` bên agent-core-be. Ảnh luôn được BE chuyển sang WebP. */
export interface IUploadedImage {
  uid: string;
  /** URL công khai, dùng thẳng làm `avatar`. */
  url: string;
  contentType: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
}
