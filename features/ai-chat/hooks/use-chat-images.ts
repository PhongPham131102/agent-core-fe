"use client";

import { useRef, useState } from "react";

import { useImageUpload, validateImageFile } from "@/features/uploads";

import { AI_CHAT_LIMITS } from "../constants";

/**
 * Ảnh gửi kèm tin đang soạn. Ảnh được tải lên ngay khi chọn hoặc dán (BE chỉ nhận ảnh đã
 * tải qua app), từng ảnh một; lỗi hiện ngay dưới ô soạn thay cho toast chung.
 */
export const useChatImages = () => {
  const { upload, isUploading } = useImageUpload({ silentError: true });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  // Chặn lượt chọn mới trong lúc lượt trước còn đang tải.
  const lockRef = useRef(false);

  const addImages = async (files: File[]) => {
    if (files.length === 0 || lockRef.current) return;
    setError("");
    if (files.length > AI_CHAT_LIMITS.maxImages - imageUrls.length) {
      setError(`Chỉ đính kèm tối đa ${AI_CHAT_LIMITS.maxImages} ảnh.`);
      return;
    }
    const invalid = files.map(validateImageFile).find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }

    lockRef.current = true;
    try {
      for (const file of files) {
        const uploaded = await upload(file).catch(() => null);
        if (uploaded) setImageUrls((current) => [...current, uploaded.url]);
        else setError("Không tải được ảnh. Vui lòng thử lại.");
      }
    } finally {
      lockRef.current = false;
    }
  };

  return {
    imageUrls,
    error,
    isUploading,
    addImages,
    removeImage: (url: string) => setImageUrls((current) => current.filter((item) => item !== url)),
    /** Gửi đi thì xoá; gửi lỗi thì trả lại danh sách cũ. */
    setImageUrls,
  };
};
