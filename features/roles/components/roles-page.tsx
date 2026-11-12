"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tag, Tooltip, Typography } from "antd";

import {
  DataTable,
  FilterBar,
  IconAction,
  PageHeader,
  SearchInput,
  useConfirmDelete,
} from "@/components/common";
import {
  Can,
  hasPermissions,
  Permission,
  PermissionGuard,
  permissionLabel,
  useAccess,
} from "@/features/auth";
import { useDisclosure } from "@/lib/hooks";
import { formatDateTime } from "@/lib/utils/format";

import { useDeleteRole, useRolesQuery } from "../api/roles.queries";
import { useRoleFilters } from "../hooks/use-role-filters";
import { ROLE_LIMITS } from "../schemas/role.schema";

import { RoleFormModal } from "./role-form-modal";

import type { IRole } from "../types/role.types";
import type { TableColumnsType } from "antd";

function PermissionSummary({ role }: { role: IRole }) {
  if (role.isSuperAdmin) return <Tag color="gold">Toàn quyền</Tag>;
  if (role.permissions.length === 0) {
    return <Typography.Text type="secondary">Chưa có</Typography.Text>;
  }
  return (
    <Tooltip title={role.permissions.map(permissionLabel).join(", ")}>
      <Tag>{role.permissions.length} quyền</Tag>
    </Tooltip>
  );
}

function RolesContent() {
  const { can, user } = useAccess();
  const { query, setSearch, setPagination } = useRoleFilters();
  const roles = useRolesQuery(query);
  const deleteRole = useDeleteRole();
  const confirmDelete = useConfirmDelete();
  const form = useDisclosure<IRole>();

  const canEdit = can(Permission.roleUpdate);
  const canDelete = can(Permission.roleDelete);
  // BE chỉ cho sửa/xoá role khi người thao tác có đủ mọi quyền của role đó (ERR_2204).
  const blockedReason = (role: IRole) =>
    !hasPermissions(user, role.permissions) && "Vai trò này có quyền mà bạn không có";

  const handleDelete = (role: IRole) =>
    confirmDelete({
      title: `Xoá vai trò "${role.name}"?`,
      content: "Chỉ xoá được vai trò chưa gán cho người dùng nào.",
      onConfirm: () => deleteRole.mutateAsync(role.uid),
    });

  const columns: TableColumnsType<IRole> = [
    {
      title: "Tên vai trò",
      dataIndex: "name",
      render: (name: string, role) => (
        <Space size={8}>
          <span className="font-medium">{name}</span>
          {role.isSuperAdmin && <Tag color="blue">Hệ thống</Tag>}
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      render: (description: string) => description || "—",
    },
    {
      title: "Quyền",
      key: "permissions",
      width: 140,
      render: (_, role) => <PermissionSummary role={role} />,
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      width: 170,
      render: (updatedAt: string) => formatDateTime(updatedAt),
    },
    {
      title: "",
      key: "actions",
      width: 96,
      align: "right",
      hidden: !canEdit && !canDelete,
      // Role hệ thống không sửa, không xoá được (BE trả ERR_2202).
      render: (_, role) =>
        !role.isSuperAdmin && (
          <Space size={4}>
            {canEdit && (
              <IconAction
                label="Sửa"
                ariaLabel={`Sửa vai trò ${role.name}`}
                icon={<EditOutlined />}
                disabledReason={blockedReason(role)}
                onClick={() => form.show(role)}
              />
            )}
            {canDelete && (
              <IconAction
                label="Xoá"
                ariaLabel={`Xoá vai trò ${role.name}`}
                icon={<DeleteOutlined />}
                danger
                disabledReason={blockedReason(role)}
                onClick={() => handleDelete(role)}
              />
            )}
          </Space>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Vai trò"
        extra={
          <Can permission={Permission.roleCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => form.show()}>
              Thêm vai trò
            </Button>
          </Can>
        }
      />
      <Card>
        <FilterBar>
          <SearchInput
            value={query.search}
            onSearch={setSearch}
            placeholder="Tìm theo tên vai trò"
            maxLength={ROLE_LIMITS.nameMaxLength}
            className="w-full max-w-xs"
          />
        </FilterBar>
        <DataTable<IRole>
          columns={columns}
          result={roles}
          query={query}
          onPaginationChange={setPagination}
        />
      </Card>
      <RoleFormModal open={form.open} role={form.payload} onClose={form.hide} />
    </>
  );
}

export function RolesPage() {
  return (
    <PermissionGuard permission={Permission.roleRead}>
      <RolesContent />
    </PermissionGuard>
  );
}
