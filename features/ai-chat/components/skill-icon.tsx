"use client";

import { Image } from "antd";
import { Sparkles } from "lucide-react";

/** Icon của skill; skill không có icon thì dùng icon mặc định. */
export function SkillIcon({ iconUrl, size = 14 }: { iconUrl?: string; size?: number }) {
  if (!iconUrl) return <Sparkles size={size} className="shrink-0" />;
  return (
    <Image
      src={iconUrl}
      alt=""
      width={size}
      height={size}
      preview={false}
      className="shrink-0 rounded object-contain"
    />
  );
}
