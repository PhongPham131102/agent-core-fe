import { routes } from "@/lib/constants/routes";

export const ProfileTab = {
  info: "info",
  security: "security",
} as const;
export type ProfileTab = (typeof ProfileTab)[keyof typeof ProfileTab];

export const PROFILE_TABS = Object.values(ProfileTab);

/** Đường dẫn tới một tab của trang hồ sơ, ví dụ `/profile?tab=security`. */
export const profileTabHref = (tab: ProfileTab) =>
  tab === ProfileTab.info ? routes.profile : `${routes.profile}?tab=${tab}`;
