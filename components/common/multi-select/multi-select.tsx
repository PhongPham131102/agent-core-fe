"use client";

import { Select } from "antd";

import type { SelectProps } from "antd";

export interface IMultiSelectOption {
  value: string;
  label: string;
}

interface IMultiSelectProps extends Omit<SelectProps<string[]>, "mode" | "options"> {
  options?: IMultiSelectOption[];
}

/** Chọn nhiều, tìm theo nhãn, xoá được hết. Dùng trong `Form.Item` như ô thường. */
export function MultiSelect(props: IMultiSelectProps) {
  return (
    <Select<string[]>
      mode="multiple"
      allowClear
      showSearch={{ optionFilterProp: "label" }}
      {...props}
    />
  );
}
