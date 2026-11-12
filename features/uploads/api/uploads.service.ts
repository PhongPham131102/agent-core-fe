import { http } from "@/lib/http";

import type { IUploadedImage } from "../types/upload.types";

const BASE = "/uploads";
/** Tên field multipart BE đọc (`UPLOAD_FILE_FIELD`). */
const FILE_FIELD = "file";
/** Ảnh lớn qua mạng chậm cần lâu hơn timeout mặc định 30 giây. */
const UPLOAD_TIMEOUT_MS = 120_000;

export interface IUploadOptions {
  /** Tiến độ gửi file, từ 0 đến 100. */
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export const uploadService = {
  uploadImage: (file: File, { onProgress, signal }: IUploadOptions = {}) => {
    const body = new FormData();
    body.append(FILE_FIELD, file);
    return http.post<IUploadedImage>(`${BASE}/images`, body, {
      timeout: UPLOAD_TIMEOUT_MS,
      signal,
      onUploadProgress: ({ loaded, total }) => {
        if (total) onProgress?.(Math.round((loaded / total) * 100));
      },
    });
  },
  remove: (uid: string) => http.delete(`${BASE}/${uid}`),
};
