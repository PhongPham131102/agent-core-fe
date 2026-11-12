"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { uploadService } from "../api/uploads.service";

/**
 * Tải một ảnh lên và theo dõi tiến độ (0–100). Lỗi được toast bởi MutationCache;
 * component chỉ cần `await upload(file)` rồi dùng `url` trả về.
 */
export const useImageUpload = () => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file: File) => {
      setProgress(0);
      return uploadService.uploadImage(file, { onProgress: setProgress });
    },
  });

  return { upload: mutation.mutateAsync, isUploading: mutation.isPending, progress };
};
