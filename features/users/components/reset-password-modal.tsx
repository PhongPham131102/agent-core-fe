"use client";

import { Alert, Form } from "antd";

import { FormActions, FormModal } from "@/components/common";
import { NewPasswordFields } from "@/features/auth";

import { useResetUserPassword } from "../api/users.queries";

import type { IUser } from "../types/user.types";

interface IResetPasswordModalProps {
  open: boolean;
  user?: IUser;
  onClose: () => void;
}

function ResetPasswordForm({ user, onClose }: { user: IUser; onClose: () => void }) {
  const resetPassword = useResetUserPassword();

  const handleFinish = ({ newPassword }: { newPassword: string }) => {
    resetPassword.mutate({ uid: user.uid, newPassword }, { onSuccess: onClose });
  };

  return (
    <Form layout="vertical" disabled={resetPassword.isPending} onFinish={handleFinish}>
      <NewPasswordFields autoFocus />
      <FormActions
        onCancel={onClose}
        submitting={resetPassword.isPending}
        submitText="Đặt lại mật khẩu"
      />
    </Form>
  );
}

export function ResetPasswordModal({ open, user, onClose }: IResetPasswordModalProps) {
  return (
    <FormModal title="Đặt lại mật khẩu" open={open} onClose={onClose}>
      {user && <ResetPasswordForm user={user} onClose={onClose} />}
    </FormModal>
  );
}
