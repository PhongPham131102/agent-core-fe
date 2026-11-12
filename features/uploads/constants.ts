/** Khớp `IMAGE_LIMITS` và định dạng ảnh BE nhận (agent-core-be, module uploads). */
export const IMAGE_UPLOAD = {
  maxBytes: 10 * 1024 * 1024,
  mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  /** Giá trị cho thuộc tính `accept` của input file. */
  accept: ".jpg,.jpeg,.png,.webp,.gif",
} as const;

/**
 * Kiểm tra nhanh ở client để báo lỗi ngay, khỏi phải chờ gửi 10 MB lên rồi mới bị từ chối.
 * BE vẫn kiểm tra lại bằng nội dung file. Trả về thông báo lỗi, hoặc null nếu hợp lệ.
 */
export const validateImageFile = (file: File): string | null => {
  if (!(IMAGE_UPLOAD.mimeTypes as readonly string[]).includes(file.type)) {
    return "Chỉ nhận ảnh JPG, PNG, WebP hoặc GIF";
  }
  if (file.size > IMAGE_UPLOAD.maxBytes) return "Ảnh vượt quá 10 MB";
  return null;
};
