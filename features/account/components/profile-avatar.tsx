"use client";

import { AvatarUpload } from "@/features/uploads";

import { useUpdateAvatar } from "../api/account.queries";

import type { IAuthUser } from "@/features/auth";

/** Ảnh đại diện của chính mình: tải lên hay xoá là lưu ngay, không cần bấm "Lưu". */
export function ProfileAvatar({ user }: { user: IAuthUser }) {
  const updateAvatar = useUpdateAvatar();

  const handleChange = (avatar: string) => {
    if (avatar !== user.avatar) updateAvatar.mutate({ avatar });
  };

  return (
    <AvatarUpload
      value={user.avatar}
      onChange={handleChange}
      size={88}
      saving={updateAvatar.isPending}
    />
  );
}
