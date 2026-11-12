"use client";

import { Alert, Form, Input } from "antd";

import { FormActions, FormModal } from "@/components/common";
import { zodRule } from "@/lib/form";

import { useChangePassword } from "../../api/auth.queries";
import { changePasswordSchema } from "../../schemas/auth.schema";
import { NewPasswordFields } from "../password/new-password-fields";

import type { ChangePasswordValues } from "../../schemas/auth.schema";

interface IChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

function ChangePasswordForm({ onClose }: Pick<IChangePasswordModalProps, "onClose">) {
  const changePassword = useChangePassword();

  const handleFinish = ({ oldPassword, newPassword }: ChangePasswordValues) => {
    changePassword.mutate({ oldPassword, newPassword });
  };

  return (
    <Form<ChangePasswordValues>
      layout="vertical"
      disabled={changePassword.isPending}
      onFinish={handleFinish}
    >
      <Alert
        type="warning"
        showIcon
        className="mb-4!"
        title="Sau khi đổi mật khẩu, bạn sẽ bị đăng xuất trên mọi thiết bị."
      />
      <Form.Item
        label="Mật khẩu hiện tại"
        name="oldPassword"
        required
        rules={[zodRule(changePasswordSchema.shape.oldPassword)]}
      >
        <Input.Password autoComplete="current-password" autoFocus />
      </Form.Item>
      <NewPasswordFields />
      <FormActions
        onCancel={onClose}
        submitting={changePassword.isPending}
        submitText="Đổi mật khẩu"
      />
    </Form>
  );
}

export function ChangePasswordModal({ open, onClose }: IChangePasswordModalProps) {
  return (
    <FormModal title="Đổi mật khẩu" open={open} onClose={onClose}>
      <ChangePasswordForm onClose={onClose} />
    </FormModal>
  );
}
