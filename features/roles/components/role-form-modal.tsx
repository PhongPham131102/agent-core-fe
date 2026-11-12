"use client";

import { Form, Input } from "antd";

import { FormActions, FormModal } from "@/components/common";
import { changedFields, fieldErrorHandler, hasChanges, zodRule } from "@/lib/form";

import { useCreateRole, useUpdateRole } from "../api/roles.queries";
import { RoleErrorCode } from "../errors";
import { ROLE_LIMITS, roleSchema } from "../schemas/role.schema";

import { PermissionMatrix } from "./permission-matrix";

import type { RoleValues } from "../schemas/role.schema";
import type { IRole } from "../types/role.types";

interface IRoleFormModalProps {
  open: boolean;
  /** Có giá trị là đang sửa; không có là tạo mới. */
  role?: IRole;
  onClose: () => void;
}

function RoleForm({ role, onClose }: Omit<IRoleFormModalProps, "open">) {
  const [form] = Form.useForm<RoleValues>();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const submitting = createRole.isPending || updateRole.isPending;

  const handleFinish = (values: RoleValues) => {
    const { name, description = "", permissions } = roleSchema.parse(values);
    const callbacks = {
      onSuccess: onClose,
      onError: fieldErrorHandler(form, { [RoleErrorCode.nameExists]: "name" }),
    };

    if (role) {
      const body = changedFields(role, { name, description, permissions });
      if (!hasChanges(body)) return onClose();
      updateRole.mutate({ uid: role.uid, body }, callbacks);
    } else {
      createRole.mutate({ name, description: description || undefined, permissions }, callbacks);
    }
  };

  return (
    <Form<RoleValues>
      form={form}
      layout="vertical"
      initialValues={{
        name: role?.name,
        description: role?.description,
        permissions: role?.permissions ?? [],
      }}
      disabled={submitting}
      onFinish={handleFinish}
    >
      <Form.Item label="Tên vai trò" name="name" required rules={[zodRule(roleSchema.shape.name)]}>
        <Input maxLength={ROLE_LIMITS.nameMaxLength} autoFocus placeholder="Ví dụ: Biên tập viên" />
      </Form.Item>
      <Form.Item label="Mô tả" name="description" rules={[zodRule(roleSchema.shape.description)]}>
        <Input.TextArea
          maxLength={ROLE_LIMITS.descriptionMaxLength}
          autoSize={{ minRows: 2, maxRows: 4 }}
          showCount
        />
      </Form.Item>
      <Form.Item label="Quyền" name="permissions">
        <PermissionMatrix />
      </Form.Item>
      <FormActions
        onCancel={onClose}
        submitting={submitting}
        submitText={role ? "Lưu thay đổi" : "Tạo vai trò"}
      />
    </Form>
  );
}

export function RoleFormModal({ open, role, onClose }: IRoleFormModalProps) {
  return (
    <FormModal
      title={role ? "Sửa vai trò" : "Thêm vai trò"}
      open={open}
      onClose={onClose}
      width={640}
    >
      <RoleForm role={role} onClose={onClose} />
    </FormModal>
  );
}
