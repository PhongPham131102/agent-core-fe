"use client";

import { Button, Form, Input } from "antd";

import { NewPasswordFields } from "@/features/auth";
import { zodRule } from "@/lib/form";

import { useChangePassword } from "../api/account.queries";
import { changePasswordSchema } from "../schemas/account.schema";

import type { ChangePasswordValues } from "../schemas/account.schema";

/** Tab "Bảo mật": đổi mật khẩu. Thành công thì BE đăng xuất mọi thiết bị. */
export function ChangePasswordForm() {
  const changePassword = useChangePassword();

  const handleFinish = ({ oldPassword, newPassword }: ChangePasswordValues) => {
    changePassword.mutate({ oldPassword, newPassword });
  };

  return (
    <Form<ChangePasswordValues>
      layout="vertical"
      className="max-w-lg"
      disabled={changePassword.isPending}
      onFinish={handleFinish}
    >
      <Form.Item
        label="Mật khẩu hiện tại"
        name="oldPassword"
        required
        rules={[zodRule(changePasswordSchema.shape.oldPassword)]}
      >
        <Input.Password autoComplete="current-password" />
      </Form.Item>
      <NewPasswordFields />
      <Button type="primary" htmlType="submit" loading={changePassword.isPending}>
        Đổi mật khẩu
      </Button>
    </Form>
  );
}
