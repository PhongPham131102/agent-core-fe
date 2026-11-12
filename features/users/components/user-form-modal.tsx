"use client";

import { Form, Input } from "antd";

import { FormActions, FormModal } from "@/components/common";
import { AUTH_LIMITS, NewPasswordItem, useAccess } from "@/features/auth";
import { RoleSelect } from "@/features/roles";
import { AvatarUpload } from "@/features/uploads";
import { appConfig } from "@/lib/constants/app";
import { changedFields, fieldErrorHandler, hasChanges, zodRule } from "@/lib/form";

import { useCreateUser, useUpdateUser } from "../api/users.queries";
import { UserErrorCode } from "../errors";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema";

import type { CreateUserValues } from "../schemas/user.schema";
import type { IUser } from "../types/user.types";

interface IUserFormModalProps {
  open: boolean;
  /** Có giá trị là đang sửa; không có là tạo mới. */
  user?: IUser;
  onClose: () => void;
}

/** Form dùng chung cho tạo và sửa; khi sửa thì không có email và mật khẩu. */
type UserFormValues = Partial<CreateUserValues>;

const fields = createUserSchema.shape;

function UserForm({ user, onClose }: Omit<IUserFormModalProps, "open">) {
  const [form] = Form.useForm<UserFormValues>();
  const { user: currentUser } = useAccess();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const submitting = createUser.isPending || updateUser.isPending;
  const isSelf = user?.uid === currentUser?.uid;

  const handleFinish = (values: UserFormValues) => {
    const callbacks = {
      onSuccess: onClose,
      onError: fieldErrorHandler(form, { [UserErrorCode.emailExists]: "email" }),
    };

    if (user) {
      // Xoá trắng họ tên hoặc ảnh đại diện là gửi "" (BE hiểu là xoá giá trị).
      const { fullName = "", roleUid, avatar = "" } = updateUserSchema.parse(values);
      const body = changedFields(user, { fullName, roleUid, avatar });
      if (!hasChanges(body)) return onClose();
      updateUser.mutate({ uid: user.uid, body }, callbacks);
      return;
    }
    const { fullName, avatar, ...rest } = createUserSchema.parse(values);
    createUser.mutate(
      { ...rest, fullName: fullName || undefined, avatar: avatar || undefined },
      callbacks,
    );
  };

  return (
    <Form<UserFormValues>
      form={form}
      layout="vertical"
      initialValues={
        user ? { fullName: user.fullName, roleUid: user.roleUid, avatar: user.avatar } : undefined
      }
      disabled={submitting}
      onFinish={handleFinish}
    >
      {user ? (
        <Form.Item label="Email">
          <Input value={user.email} disabled />
        </Form.Item>
      ) : (
        <Form.Item label="Email" name="email" required rules={[zodRule(fields.email)]}>
          <Input
            type="email"
            autoComplete="off"
            autoFocus
            maxLength={AUTH_LIMITS.emailMaxLength}
            placeholder={appConfig.emailPlaceholder}
          />
        </Form.Item>
      )}
      <Form.Item label="Họ tên" name="fullName" rules={[zodRule(fields.fullName)]}>
        <Input maxLength={AUTH_LIMITS.fullNameMaxLength} autoFocus={Boolean(user)} />
      </Form.Item>
      <Form.Item label="Vai trò" name="roleUid" required rules={[zodRule(fields.roleUid)]}>
        <RoleSelect current={user?.role} disabled={isSelf} />
      </Form.Item>
      {!user && <NewPasswordItem name="password" label="Mật khẩu" />}
      <Form.Item label="Ảnh đại diện" name="avatar">
        <AvatarUpload size={64} />
      </Form.Item>
      <FormActions
        onCancel={onClose}
        submitting={submitting}
        submitText={user ? "Lưu thay đổi" : "Tạo người dùng"}
      />
    </Form>
  );
}

export function UserFormModal({ open, user, onClose }: IUserFormModalProps) {
  return (
    <FormModal title={user ? "Sửa người dùng" : "Thêm người dùng"} open={open} onClose={onClose}>
      <UserForm user={user} onClose={onClose} />
    </FormModal>
  );
}
