import { HomeOutlined, SafetyCertificateOutlined, TeamOutlined } from "@ant-design/icons";

import { Permission } from "@/features/auth";
import { routes } from "@/lib/constants/routes";

import type { IAppMenuItem } from "@/components/layout";
import type { PermissionKey } from "@/features/auth";

export interface IShellMenuItem extends IAppMenuItem {
  /** Quyền cần có để thấy mục này; bỏ trống thì ai đăng nhập cũng thấy. */
  permission?: PermissionKey;
}

/** Menu sidebar. Thêm trang mới: thêm một dòng ở đây kèm quyền xem của trang đó. */
export const shellMenuItems: IShellMenuItem[] = [
  { key: routes.home, href: routes.home, label: "Tổng quan", icon: <HomeOutlined /> },
  {
    key: routes.users,
    href: routes.users,
    label: "Người dùng",
    icon: <TeamOutlined />,
    permission: Permission.userRead,
  },
  {
    key: routes.roles,
    href: routes.roles,
    label: "Vai trò",
    icon: <SafetyCertificateOutlined />,
    permission: Permission.roleRead,
  },
];
