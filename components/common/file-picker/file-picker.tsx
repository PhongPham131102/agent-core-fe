"use client";

import { InboxOutlined } from "@ant-design/icons";
import { Upload } from "antd";

import type { UploadFile } from "antd";

interface IFilePickerProps {
  /** `Form.Item` tự truyền `value`/`onChange`. */
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  text: string;
}

/** antd cần `uid` cho từng mục; dùng vị trí trong danh sách để xoá đúng file. */
const toUploadFile = (file: File, index: number): UploadFile => ({
  uid: String(index),
  name: file.name,
  status: "done",
});

/**
 * Chọn hoặc kéo thả file, chỉ giữ `File` trong form; gửi lên là việc của form khi submit.
 * Một file (`multiple` tắt) thì chọn file mới sẽ thay file cũ.
 */
export function FilePicker({
  value = [],
  onChange,
  accept,
  multiple = false,
  text,
}: IFilePickerProps) {
  return (
    <Upload.Dragger
      accept={accept}
      multiple={multiple}
      fileList={value.map(toUploadFile)}
      beforeUpload={(file, batch) => {
        // antd gọi một lần cho mỗi file của lượt chọn: chỉ xử lý ở file cuối để gom cả lượt.
        if (file === batch.at(-1)) onChange?.(multiple ? [...value, ...batch] : [file]);
        // Không để antd tự gửi file.
        return false;
      }}
      onRemove={({ uid }) => onChange?.(value.filter((_, index) => String(index) !== uid))}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{text}</p>
    </Upload.Dragger>
  );
}
