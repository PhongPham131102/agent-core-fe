"use client";

import { Alert, Button, Form, Input } from "antd";

import { appConfig } from "@/lib/constants/app";
import { zodRule } from "@/lib/form";
import { getErrorMessage } from "@/lib/http";

import { useLogin } from "../../api/auth.queries";
import { AUTH_LIMITS, loginSchema } from "../../schemas/auth.schema";

import type { LoginValues } from "../../schemas/auth.schema";

export function LoginForm() {
  const login = useLogin();

  const handleFinish = (values: LoginValues) => {
    // Parse lại để lấy giá trị đã chuẩn hoá (trim email) trước khi gửi.
    login.mutate(loginSchema.parse(values));
  };

  return (
    <Form<LoginValues>
      layout="vertical"
      requiredMark={false}
      disabled={login.isPending}
      onFinish={handleFinish}
    >
      {login.error && (
        <Alert type="error" showIcon className="mb-4!" title={getErrorMessage(login.error)} />
      )}
      <Form.Item
        label="Email"
        name="email"
        validateTrigger="onBlur"
        rules={[zodRule(loginSchema.shape.email)]}
      >
        <Input
          size="large"
          type="email"
          autoComplete="username"
          autoFocus
          maxLength={AUTH_LIMITS.emailMaxLength}
          placeholder={appConfig.emailPlaceholder}
        />
      </Form.Item>
      <Form.Item
        label="Mật khẩu"
        name="password"
        validateTrigger="onBlur"
        rules={[zodRule(loginSchema.shape.password)]}
      >
        <Input.Password size="large" autoComplete="current-password" placeholder="Nhập mật khẩu" />
      </Form.Item>
      <Button type="primary" htmlType="submit" size="large" block loading={login.isPending}>
        Đăng nhập
      </Button>
    </Form>
  );
}
