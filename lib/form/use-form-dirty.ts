"use client";

import { Form } from "antd";

import { isDirty } from "./changed-fields";

import type { FormInstance } from "antd";

/** Theo dõi form có khác `initialValues` không; dùng cho nút Lưu và Hoàn tác. */
export const useFormDirty = <T extends object>(form: FormInstance<T>, initialValues: object) => {
  const values = Form.useWatch((all: T) => all, form);
  return values !== undefined && isDirty(initialValues, values);
};
