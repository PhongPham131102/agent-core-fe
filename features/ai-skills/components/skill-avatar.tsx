"use client";

import { ThunderboltOutlined } from "@ant-design/icons";
import { Avatar } from "antd";

/** Icon của skill; skill không có icon thì dùng icon mặc định. */
export function SkillAvatar({ iconUrl, size = 32 }: { iconUrl: string; size?: number }) {
  return (
    <Avatar
      shape="square"
      size={size}
      src={iconUrl || undefined}
      icon={<ThunderboltOutlined />}
      className="shrink-0"
    />
  );
}
