"use client";

import { KeyOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown } from "antd";

import { useDisclosure } from "@/lib/hooks";

import { useLogout } from "../../api/auth.queries";
import { useAccess } from "../../hooks/use-access";

import { ChangePasswordModal } from "./change-password-modal";
import { ProfileModal } from "./profile-modal";

import type { MenuProps } from "antd";

const MenuKey = {
  profile: "profile",
  changePassword: "change-password",
  logout: "logout",
} as const;

/** Nút tài khoản ở header: hồ sơ, đổi mật khẩu, đăng xuất. */
export function UserMenu() {
  const { user } = useAccess();
  const logout = useLogout();
  const profile = useDisclosure();
  const changePassword = useDisclosure();

  if (!user) return null;

  const displayName = user.fullName || user.email;
  const items: MenuProps["items"] = [
    {
      key: "identity",
      type: "group",
      label: (
        <div className="max-w-56 py-1">
          <div className="truncate font-medium text-black/88">{displayName}</div>
          <div className="truncate text-xs font-normal">{user.email}</div>
          <div className="truncate text-xs font-normal">Vai trò: {user.role.name}</div>
        </div>
      ),
    },
    { type: "divider" },
    { key: MenuKey.profile, icon: <UserOutlined />, label: "Hồ sơ của tôi" },
    { key: MenuKey.changePassword, icon: <KeyOutlined />, label: "Đổi mật khẩu" },
    { type: "divider" },
    { key: MenuKey.logout, icon: <LogoutOutlined />, label: "Đăng xuất", danger: true },
  ];

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    if (key === MenuKey.profile) profile.show();
    if (key === MenuKey.changePassword) changePassword.show();
    if (key === MenuKey.logout) logout.mutate();
  };

  return (
    <>
      <Dropdown menu={{ items, onClick: handleClick }} trigger={["click"]} placement="bottomRight">
        <Button type="text" className="h-10! px-2!" loading={logout.isPending}>
          <Avatar size="small" src={user.avatar || undefined} icon={<UserOutlined />} />
          <span className="max-w-40 truncate">{displayName}</span>
        </Button>
      </Dropdown>
      <ProfileModal open={profile.open} user={user} onClose={profile.hide} />
      <ChangePasswordModal open={changePassword.open} onClose={changePassword.hide} />
    </>
  );
}
