"use client";

import { Button, Form, Input } from "antd";

import { AUTH_LIMITS } from "@/features/auth";
import { changedFields, hasChanges, zodRule } from "@/lib/form";

import { useUpdateProfile } from "../api/account.queries";
import { profileInfoSchema } from "../schemas/account.schema";

import type { ProfileInfoValues } from "../schemas/account.schema";
import type { IAuthUser } from "@/features/auth";

/** Tab "Thông tin cá nhân": sửa họ tên. Email là định danh đăng nhập nên chỉ xem. */
export function ProfileInfoForm({ user }: { user: IAuthUser }) {
  const [form] = Form.useForm<ProfileInfoValues>();
  const updateProfile = useUpdateProfile();
  // Chỉ bật nút Lưu khi giá trị khác với dữ liệu hiện tại.
  const fullName = Form.useWatch("fullName", form) ?? user.fullName;
  const isDirty = fullName.trim() !== user.fullName;

  const handleFinish = (values: ProfileInfoValues) => {
    // Xoá trắng họ tên là gửi "" (BE hiểu là xoá giá trị).
    const { fullName: next = "" } = profileInfoSchema.parse(values);
    const body = changedFields(user, { fullName: next });
    if (hasChanges(body)) updateProfile.mutate(body);
  };

  return (
    <Form<ProfileInfoValues>
      form={form}
      layout="vertical"
      className="max-w-lg"
      initialValues={{ fullName: user.fullName }}
      disabled={updateProfile.isPending}
      onFinish={handleFinish}
    >
      <Form.Item label="Họ tên" name="fullName" rules={[zodRule(profileInfoSchema.shape.fullName)]}>
        <Input maxLength={AUTH_LIMITS.fullNameMaxLength} placeholder="Ví dụ: Nguyễn Văn A" />
      </Form.Item>
      <Form.Item label="Email" extra="Email dùng để đăng nhập. Liên hệ quản trị viên nếu cần đổi.">
        <Input value={user.email} disabled />
      </Form.Item>
      <Form.Item label="Vai trò" extra="Vai trò do quản trị viên gán.">
        <Input value={user.role.name} disabled />
      </Form.Item>
      <div className="flex gap-2">
        <Button
          type="primary"
          htmlType="submit"
          loading={updateProfile.isPending}
          disabled={!isDirty}
        >
          Lưu thay đổi
        </Button>
        <Button disabled={!isDirty || updateProfile.isPending} onClick={() => form.resetFields()}>
          Hoàn tác
        </Button>
      </div>
    </Form>
  );
}
