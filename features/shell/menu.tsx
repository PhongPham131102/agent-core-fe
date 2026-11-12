import { KeyOutlined, SafetyCertificateOutlined, TeamOutlined } from "@ant-design/icons";

import { Permission } from "@/features/auth";
import { routes } from "@/lib/constants/routes";

import type { IAppMenuItem } from "@/components/layout";
import type { PermissionKey } from "@/features/auth";

export interface IShellMenuItem extends IAppMenuItem {
  /** Quyền cần có để thấy mục này; bỏ trống thì ai đăng nhập cũng thấy. */
  permission?: PermissionKey;
}

/**
 * Menu sidebar. Thêm trang mới: thêm một dòng ở đây kèm quyền xem của trang đó.
 * Thứ tự cũng là thứ tự ưu tiên khi vào `/`: người dùng được đưa tới mục đầu tiên họ thấy.
 */
export const shellMenuItems: IShellMenuItem[] = [
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
  {
    key: routes.aiApiKeys,
    href: routes.aiApiKeys,
    label: "API key",
    icon: <KeyOutlined />,
    permission: Permission.aiApiKeyRead,
  },
];

/** Các mục người dùng được thấy, giữ nguyên thứ tự khai báo. */
export const filterMenuByAccess = (
  items: IShellMenuItem[],
  can: (permission: PermissionKey) => boolean,
) => items.filter(({ permission }) => !permission || can(permission));

/**
 * Trang đích khi vào `/`: mục menu đầu tiên được thấy. Không thấy mục nào thì về hồ sơ,
 * trang ai đăng nhập cũng vào được.
 */
export const resolveLandingRoute = (visibleItems: IShellMenuItem[]) =>
  visibleItems[0]?.href ?? routes.profile;
