"use client";

import { CameraOutlined, CloseOutlined, LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { App, Avatar, Button, Progress, Tooltip, Upload } from "antd";

import { IMAGE_UPLOAD, validateImageFile } from "../constants";
import { useImageUpload } from "../hooks/use-image-upload";

interface IAvatarUploadProps {
  /** URL ảnh hiện tại; "" là chưa có ảnh. `Form.Item` tự truyền khi dùng trong form. */
  value?: string;
  /** Nhận URL ảnh mới sau khi tải lên, hoặc "" khi xoá ảnh. */
  onChange?: (url: string) => void;
  size?: number;
  disabled?: boolean;
  /** Nơi dùng đang lưu giá trị (ví dụ PATCH hồ sơ): khoá thao tác và hiện vòng quay. */
  saving?: boolean;
}

/**
 * Ảnh đại diện bấm vào để chọn ảnh mới; có ảnh thì kèm nút xoá nhỏ ở góc. Chỉ lo phần ảnh
 * và trả URL qua `value`/`onChange`, nên dùng được cả trong form (lưu khi submit) lẫn nơi
 * lưu ngay (trang hồ sơ).
 */
export function AvatarUpload({
  value = "",
  onChange,
  size = 96,
  disabled = false,
  saving = false,
}: IAvatarUploadProps) {
  const { message } = App.useApp();
  const { upload, isUploading, progress } = useImageUpload();
  const locked = disabled || isUploading || saving;

  return (
    <span className="relative inline-block">
      <Upload
        accept={IMAGE_UPLOAD.accept}
        showUploadList={false}
        disabled={locked}
        beforeUpload={(file) => {
          const error = validateImageFile(file);
          if (error) void message.error(error);
          return error ? Upload.LIST_IGNORE : true;
        }}
        customRequest={({ file }) => {
          upload(file as File)
            .then(({ url }) => onChange?.(url))
            // Lỗi đã được toast ở MutationCache.
            .catch(() => undefined);
        }}
      >
        <Tooltip title={locked ? undefined : `${value ? "Đổi" : "Tải"} ảnh · ${IMAGE_UPLOAD.hint}`}>
          <span
            className={`group relative block rounded-full ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Avatar size={size} src={value || undefined} icon={<UserOutlined />} />
            {!locked && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-xl text-white opacity-0 transition-opacity group-hover:opacity-100">
                <CameraOutlined />
              </span>
            )}
            {(isUploading || saving) && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/75">
                {isUploading && progress > 0 ? (
                  <Progress type="circle" percent={progress} size={size - 24} />
                ) : (
                  <LoadingOutlined className="text-xl" />
                )}
              </span>
            )}
          </span>
        </Tooltip>
      </Upload>
      {value && !locked && (
        <Tooltip title="Xoá ảnh">
          <Button
            size="small"
            shape="circle"
            danger
            aria-label="Xoá ảnh"
            icon={<CloseOutlined />}
            className="absolute! end-0 top-0 shadow-sm"
            onClick={() => onChange?.("")}
          />
        </Tooltip>
      )}
    </span>
  );
}
