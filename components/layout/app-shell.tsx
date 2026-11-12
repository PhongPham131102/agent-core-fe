"use client";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppStore } from "@/stores/app.store";

import { appMenuItems } from "./menu-items";

import type { ReactNode } from "react";

const SIDER_WIDTH = 232;

/** Tìm item có href khớp dài nhất với pathname hiện tại. */
const resolveSelectedKey = (pathname: string) =>
  appMenuItems
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.key ?? pathname;

export function AppShell({ children }: { children: ReactNode }) {
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
        <div className="flex h-14 items-center px-6 text-base font-semibold">
          {collapsed ? "AC" : "Agent Core"}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[resolveSelectedKey(pathname)]}
          items={appMenuItems.map(({ key, href, label, icon }) => ({
            key,
            icon,
            label: <Link href={href}>{label}</Link>,
          }))}
          className="border-e-0!"
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="flex items-center border-b border-black/5">
          <Button
            type="text"
            aria-label={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
          />
        </Layout.Header>
        <Layout.Content className="p-6">{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
