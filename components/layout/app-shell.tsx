"use client";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Grid, Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
const SIDER_COLLAPSED_WIDTH = 80;

/** Tìm item có href khớp dài nhất với pathname hiện tại. */
const resolveSelectedKey = (items: IAppMenuItem[], pathname: string) =>
  items
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.key ?? pathname;

/** Khung trang: sidebar + header. Chỉ lo bố cục, không biết gì về phiên hay quyền. */
export function AppShell({ menuItems, headerExtra, children }: IAppShellProps) {
  const pathname = usePathname();
  const savedCollapsed = useAppStore.use.sidebarCollapsed();
  const toggleSaved = useAppStore.use.toggleSidebar();
  // Màn hình hẹp (dưới lg): sidebar mặc định ẩn hẳn, khi mở thì nổi đè lên nội dung thay vì
  // đẩy nội dung tràn ra ngoài. Trạng thái đóng/mở ở đây là tạm thời, không ghi đè lựa chọn
  // đã lưu cho màn hình rộng.
  const isNarrow = Grid.useBreakpoint().lg === false;
  const [narrowOpen, setNarrowOpen] = useState(false);
  const collapsed = isNarrow ? !narrowOpen : savedCollapsed;
  const toggleSidebar = isNarrow ? () => setNarrowOpen((open) => !open) : toggleSaved;
  const closeNarrow = () => setNarrowOpen(false);

  return (
    <Layout className="min-h-screen">
      <Layout.Sider
        width={SIDER_WIDTH}
        collapsed={collapsed}
        collapsible
        collapsedWidth={isNarrow ? 0 : SIDER_COLLAPSED_WIDTH}
        trigger={null}
        className={`border-r border-black/5 ${isNarrow ? "fixed! inset-y-0 start-0 z-50" : ""}`}
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
          // Chọn trang xong thì đóng sidebar nổi trên màn hình hẹp.
          onClick={isNarrow ? closeNarrow : undefined}
        />
      </Layout.Sider>
      {isNarrow && narrowOpen && (
        <div aria-hidden className="fixed inset-0 z-40 bg-black/45" onClick={closeNarrow} />
      )}
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
