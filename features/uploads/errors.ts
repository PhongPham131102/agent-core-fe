import { registerErrorMessages } from "@/lib/http";

/** Khớp `UploadErrors` bên agent-core-be. */
export const UploadErrorCode = {
  fileRequired: "ERR_2300",
  unsupportedImage: "ERR_2301",
  notFound: "ERR_2302",
} as const;

registerErrorMessages({
  [UploadErrorCode.fileRequired]: "Vui lòng chọn ảnh để tải lên",
  [UploadErrorCode.unsupportedImage]:
    "Ảnh không đọc được hoặc không đúng định dạng JPG, PNG, WebP, GIF",
  [UploadErrorCode.notFound]: "Không tìm thấy ảnh",
});
