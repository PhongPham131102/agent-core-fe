"use client";

import { Tag, Typography } from "antd";

import { actionLabel, groupPermissions, subjectLabel } from "@/features/auth";

import type { IAuthUser } from "@/features/auth";

/** Quyền của người dùng hiện tại, gom theo đối tượng: "Người dùng: Xem, Tạo". */
export function PermissionList({ user }: { user: IAuthUser }) {
  if (user.role.isSuperAdmin) {
    return <Tag color="gold">Toàn quyền trên hệ thống</Tag>;
  }
  if (user.permissions.length === 0) {
    return <Typography.Text type="secondary">Vai trò này chưa có quyền nào.</Typography.Text>;
  }

  return (
    <dl className="m-0 flex flex-col gap-2">
      {groupPermissions(user.permissions).map(({ subject, actions }) => (
        <div key={subject} className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <dt className="min-w-24 text-black/65">{subjectLabel(subject)}</dt>
          <dd className="m-0 flex flex-wrap gap-1">
            {actions.map((action) => (
              <Tag key={action} className="me-0!">
                {actionLabel(action)}
              </Tag>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
