"use client";

import { InboxOutlined } from "@ant-design/icons";
import { Upload } from "antd";

import { SKILL_ZIP_ACCEPT } from "../../constants";

interface ISkillZipInputProps {
  /** `Form.Item` tự truyền `value`/`onChange`. */
  value?: File;
  onChange?: (file: File | undefined) => void;
}

/** Chọn một file .zip; chỉ giữ file trong form, gửi lên là việc của form khi submit. */
export function SkillZipInput({ value, onChange }: ISkillZipInputProps) {
  return (
    <Upload.Dragger
      accept={SKILL_ZIP_ACCEPT}
      maxCount={1}
      fileList={value ? [{ uid: "skill-zip", name: value.name, status: "done" }] : []}
      beforeUpload={(file) => {
        onChange?.(file);
        // Không để antd tự gửi file.
        return false;
      }}
      onRemove={() => onChange?.(undefined)}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Chọn hoặc kéo file .zip vào đây</p>
    </Upload.Dragger>
  );
}
