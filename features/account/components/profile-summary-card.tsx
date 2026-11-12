"use client";

import { MailOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Card, Divider, Tag, Typography } from "antd";

import { PermissionList } from "./permission-list";
import { ProfileAvatar } from "./profile-avatar";

import type { IAuthUser } from "@/features/auth";

/** Cột trái của trang hồ sơ: ảnh đại diện, danh tính, vai trò và quyền. */
export function ProfileSummaryCard({ user }: { user: IAuthUser }) {
  return (
    <Card>
      <div className="flex flex-col items-center text-center">
        <ProfileAvatar user={user} />
        <Typography.Title level={4} className="mt-4! mb-1! break-words">
          {user.fullName || "Chưa đặt họ tên"}
        </Typography.Title>
        <Typography.Text type="secondary" className="flex items-center gap-2 break-all">
          <MailOutlined />
          {user.email}
        </Typography.Text>
        <Tag
          icon={<SafetyCertificateOutlined />}
          color={user.role.isSuperAdmin ? "gold" : "blue"}
          className="me-0! mt-3"
        >
          {user.role.name}
        </Tag>
      </div>
      <Divider className="my-5!" />
      <Typography.Text strong className="mb-3 block">
        Quyền của bạn
      </Typography.Text>
      <PermissionList user={user} />
    </Card>
  );
}
