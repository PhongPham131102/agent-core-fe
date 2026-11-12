import { HomeOutlined } from "@ant-design/icons";

import { routes } from "@/lib/constants/routes";

import type { ReactNode } from "react";

export interface IAppMenuItem {
  key: string;
  href: string;
  label: string;
  icon?: ReactNode;
}

/**
 * Menu sidebar. Khi thêm feature: khai báo item trong features/<domain>/menu.ts
 * rồi thêm vào mảng này (sau này gate theo permission).
 */
export const appMenuItems: IAppMenuItem[] = [
  { key: routes.home, href: routes.home, label: "Tổng quan", icon: <HomeOutlined /> },
];
