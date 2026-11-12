"use client";

import { Form, Input } from "antd";

import { zodRule } from "@/lib/form";

import { passwordSchema } from "../../schemas/auth.schema";

interface INewPasswordItemProps {
  /** Tên field trong form. */
  name?: string;
  label?: string;
  autoFocus?: boolean;
}

const CONFIRM_FIELD = "confirmPassword";

/** Ô nhập mật khẩu mới kèm gợi ý và kiểm tra theo chính sách mật khẩu của BE. */
export function NewPasswordItem({
  name = "newPassword",
  label = "Mật khẩu mới",
  autoFocus = false,
}: INewPasswordItemProps) {
  return (
    <Form.Item label={label} name={name} required rules={[zodRule(passwordSchema)]}>
      <Input.Password autoComplete="new-password" autoFocus={autoFocus} />
    </Form.Item>
  );
}

/**
 * Cặp "mật khẩu mới" + "nhập lại" cho form đổi và đặt lại mật khẩu.
 * Field nhập lại (`confirmPassword`) chỉ để đối chiếu ở client, không gửi lên BE.
 */
export function NewPasswordFields({ name = "newPassword", ...itemProps }: INewPasswordItemProps) {
  return (
    <>
      <NewPasswordItem name={name} {...itemProps} />
      <Form.Item
        label={`Nhập lại ${(itemProps.label ?? "mật khẩu mới").toLowerCase()}`}
        name={CONFIRM_FIELD}
        required
        dependencies={[name]}
        rules={[
          ({ getFieldValue }) => ({
            validator: (_rule, value: unknown) =>
              value === getFieldValue(name)
                ? Promise.resolve()
                : Promise.reject(new Error("Mật khẩu nhập lại không khớp")),
          }),
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
    </>
  );
}
