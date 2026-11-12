"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

import { PROFILE_TABS, ProfileTab } from "../profile-tabs";

/** Tab đang mở của trang hồ sơ, lưu trên URL để menu tài khoản mở thẳng tới tab "Bảo mật". */
export const useProfileTab = () =>
  useQueryState(
    "tab",
    parseAsStringLiteral(PROFILE_TABS)
      .withDefault(ProfileTab.info)
      .withOptions({ history: "replace" }),
  );
