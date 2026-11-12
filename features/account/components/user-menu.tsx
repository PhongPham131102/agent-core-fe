"use client";

import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown } from "antd";
import { useRouter } from "next/navigation";

import { useAccess, useLogout } from "@/features/auth";

import { ProfileTab, profileTabHref } from "../profile-tabs";

import type { MenuProps } from "antd";

const LOGOUT_KEY = "logout";

/** Nút tài khoản ở header: mở trang hồ sơ hoặc đăng xuất. */
export function UserMenu() {
  const router = useRouter();
  const { user } = useAccess();
  const logout = useLogout();

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
        </div>
      ),
    },
    { type: "divider" },
    { key: profileTabHref(ProfileTab.info), icon: <UserOutlined />, label: "Hồ sơ của tôi" },
    { type: "divider" },
    { key: LOGOUT_KEY, icon: <LogoutOutlined />, label: "Đăng xuất", danger: true },
  ];

  // Key của các mục điều hướng chính là đường dẫn đích.
  const handleClick: MenuProps["onClick"] = ({ key }) => {
    if (key === LOGOUT_KEY) logout.mutate();
    else router.push(key);
  };

  return (
    <Dropdown menu={{ items, onClick: handleClick }} trigger={["click"]} placement="bottomRight">
      <Button type="text" className="h-10! px-2!" loading={logout.isPending}>
        <Avatar size="small" src={user.avatar || undefined} icon={<UserOutlined />} />
        <span className="max-w-40 truncate">{displayName}</span>
      </Button>
    </Dropdown>
  );
}
