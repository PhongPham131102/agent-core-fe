"use client";

import { Button, Image } from "antd";
import { X } from "lucide-react";

/** Ảnh đã đính kèm cho tin đang soạn, mỗi ảnh có nút bỏ. */
export function ImagePreviews({
  urls,
  onRemove,
}: {
  urls: string[];
  onRemove: (url: string) => void;
}) {
  if (urls.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 px-1 pb-2">
      {urls.map((url) => (
        <div key={url} className="relative size-16">
          <Image
            src={url}
            alt="Ảnh đính kèm"
            width={64}
            height={64}
            preview={false}
            className="rounded-lg object-cover"
          />
          <Button
            shape="circle"
            size="small"
            icon={<X size={11} />}
            aria-label="Bỏ ảnh đính kèm"
            onClick={() => onRemove(url)}
            className="absolute! -end-1 -top-1 size-5! min-w-5!"
          />
        </div>
      ))}
    </div>
  );
}
