"use client";

import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Tag, Typography } from "antd";

import {
  DataTable,
  FilterBar,
  PageHeader,
  SearchInput,
  useConfirmDelete,
} from "@/components/common";
import { Can, Permission, PermissionGuard, useAccess } from "@/features/auth";
import { RoleSelect, useRoleOptions } from "@/features/roles";
import { useDisclosure } from "@/lib/hooks";
import { formatDateTime } from "@/lib/utils/format";

import { useDeleteUser, useUsersQuery } from "../api/users.queries";
import { useUserFilters } from "../hooks/use-user-filters";
import { USER_SEARCH_MAX_LENGTH } from "../schemas/user.schema";

import { ResetPasswordModal } from "./reset-password-modal";
import { UserFormModal } from "./user-form-modal";
import { UserRowActions } from "./user-row-actions";

import type { IUser } from "../types/user.types";
import type { TableColumnsType } from "antd";

function UserIdentity({ user, isSelf }: { user: IUser; isSelf: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={user.avatar || undefined} icon={<UserOutlined />} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{user.fullName || "—"}</span>
          {isSelf && <Tag color="blue">Bạn</Tag>}
        </div>
        <Typography.Text type="secondary" className="block truncate text-xs">
          {user.email}
        </Typography.Text>
      </div>
    </div>
  );
}

function UsersContent() {
  const { canAny, user: currentUser } = useAccess();
  const { query, setFilters, setPagination } = useUserFilters();
  const users = useUsersQuery(query);
  const deleteUser = useDeleteUser();
  const confirmDelete = useConfirmDelete();
  const { isAssignable } = useRoleOptions();
  const form = useDisclosure<IUser>();
  const resetPassword = useDisclosure<IUser>();

  const handleDelete = (user: IUser) =>
    confirmDelete({
      title: `Xoá người dùng "${user.fullName || user.email}"?`,
      content: "Người này sẽ bị đăng xuất trên mọi thiết bị và không đăng nhập lại được.",
      onConfirm: () => deleteUser.mutateAsync(user.uid),
    });

  const columns: TableColumnsType<IUser> = [
    {
      title: "Người dùng",
      key: "identity",
      render: (_, user) => <UserIdentity user={user} isSelf={user.uid === currentUser?.uid} />,
    },
    {
      title: "Vai trò",
      key: "role",
      width: 200,
      render: (_, user) =>
        user.role ? <Tag>{user.role.name}</Tag> : <Tag color="red">Vai trò đã bị xoá</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 170,
      render: (createdAt: string) => formatDateTime(createdAt),
    },
    {
      title: "",
      key: "actions",
      width: 136,
      align: "right",
      hidden: !canAny(Permission.userUpdate, Permission.userDelete),
      render: (_, user) => (
        <UserRowActions
          user={user}
          // BE chỉ cho quản lý người có role không nhiều quyền hơn mình.
          manageable={isAssignable(user.roleUid)}
          onEdit={form.show}
          onResetPassword={resetPassword.show}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Người dùng"
        description="Tài khoản đăng nhập hệ thống và vai trò của từng người."
        extra={
          <Can permission={Permission.userCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => form.show()}>
              Thêm người dùng
            </Button>
          </Can>
        }
      />
      <Card>
        <FilterBar>
          <SearchInput
            value={query.search}
            onSearch={(search) => setFilters({ search })}
            placeholder="Tìm theo email hoặc họ tên"
            maxLength={USER_SEARCH_MAX_LENGTH}
            className="w-full max-w-xs"
          />
          <RoleSelect
            purpose="filter"
            value={query.roleUid}
            onChange={(roleUid) => setFilters({ roleUid })}
            placeholder="Tất cả vai trò"
            allowClear
            className="w-52"
          />
        </FilterBar>
        <DataTable<IUser>
          columns={columns}
          result={users}
          query={query}
          onPaginationChange={setPagination}
        />
      </Card>
      <UserFormModal open={form.open} user={form.payload} onClose={form.hide} />
      <ResetPasswordModal
        open={resetPassword.open}
        user={resetPassword.payload}
        onClose={resetPassword.hide}
      />
    </>
  );
}

export function UsersPage() {
  return (
    <PermissionGuard permission={Permission.userRead}>
      <UsersContent />
    </PermissionGuard>
  );
}
