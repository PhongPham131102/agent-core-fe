"use client";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/common";
import { useAppStore } from "@/stores/app.store";

import type { ReactNode } from "react";

export interface IAppMenuItem {
  key: string;
  href: string;
  label: string;
  icon?: ReactNode;
}

interface IAppShellProps {
  /** Các mục người dùng được thấy; việc lọc theo quyền do nơi dùng quyết định. */
  menuItems: IAppMenuItem[];
  /** Góc phải header (menu tài khoản...). */
  headerExtra?: ReactNode;
  children: ReactNode;
}

const SIDER_WIDTH = 232;

/** Tìm item có href khớp dài nhất với pathname hiện tại. */
const resolveSelectedKey = (items: IAppMenuItem[], pathname: string) =>
  items
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.key ?? pathname;

/** Khung trang: sidebar + header. Chỉ lo bố cục, không biết gì về phiên hay quyền. */
export function AppShell({ menuItems, headerExtra, children }: IAppShellProps) {
  const pathname = usePathname();
  const collapsed = useAppStore.use.sidebarCollapsed();
  const toggleSidebar = useAppStore.use.toggleSidebar();

  return (
    <Layout className="min-h-screen">
      <Layout.Sider
        width={SIDER_WIDTH}
        collapsed={collapsed}
        collapsible
        trigger={null}
        className="border-r border-black/5"
      >
        <div className={`flex h-14 items-center ${collapsed ? "justify-center" : "px-6"}`}>
          <BrandLogo size={28} showName={!collapsed} />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[resolveSelectedKey(menuItems, pathname)]}
          items={menuItems.map(({ key, href, label, icon }) => ({
            key,
            icon,
            label: <Link href={href}>{label}</Link>,
          }))}
          className="border-e-0!"
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="flex items-center justify-between border-b border-black/5">
          <Button
            type="text"
            aria-label={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
          />
          {headerExtra}
        </Layout.Header>
        <Layout.Content className="p-6">{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
