"use client";

import { Form, Input } from "antd";

import { FormActions, FormModal } from "@/components/common";
import { changedFields, hasChanges, zodRule } from "@/lib/form";

import { useUpdateProfile } from "../../api/auth.queries";
import { AUTH_LIMITS, profileSchema } from "../../schemas/auth.schema";

import type { ProfileValues } from "../../schemas/auth.schema";
import type { IAuthUser } from "../../types/auth.types";

interface IProfileModalProps {
  open: boolean;
  user: IAuthUser;
  onClose: () => void;
}

function ProfileForm({ user, onClose }: Omit<IProfileModalProps, "open">) {
  const updateProfile = useUpdateProfile();

  const handleFinish = (values: ProfileValues) => {
    // Xoá trắng họ tên hoặc ảnh đại diện là gửi "" (BE hiểu là xoá giá trị).
    const { fullName = "", avatar = "" } = profileSchema.parse(values);
    const body = changedFields(user, { fullName, avatar });
    if (!hasChanges(body)) return onClose();
    updateProfile.mutate(body, { onSuccess: onClose });
  };

  return (
    <Form<ProfileValues>
      layout="vertical"
      initialValues={{ fullName: user.fullName, avatar: user.avatar }}
      disabled={updateProfile.isPending}
      onFinish={handleFinish}
    >
      <Form.Item label="Email">
        <Input value={user.email} disabled />
      </Form.Item>
      <Form.Item label="Họ tên" name="fullName" rules={[zodRule(profileSchema.shape.fullName)]}>
        <Input maxLength={AUTH_LIMITS.fullNameMaxLength} autoFocus />
      </Form.Item>
      <Form.Item
        label="Ảnh đại diện (URL)"
        name="avatar"
        rules={[zodRule(profileSchema.shape.avatar)]}
      >
        <Input maxLength={AUTH_LIMITS.avatarMaxLength} placeholder="https://..." />
      </Form.Item>
      <FormActions onCancel={onClose} submitting={updateProfile.isPending} />
    </Form>
  );
}

export function ProfileModal({ open, user, onClose }: IProfileModalProps) {
  return (
    <FormModal title="Hồ sơ của tôi" open={open} onClose={onClose}>
      <ProfileForm user={user} onClose={onClose} />
    </FormModal>
  );
}
