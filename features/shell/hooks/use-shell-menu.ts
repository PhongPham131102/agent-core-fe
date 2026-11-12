"use client";

import { useMemo } from "react";

import { useAccess } from "@/features/auth";

import { filterMenuByAccess, shellMenuItems } from "../menu";

/** Menu sidebar đã lọc theo quyền của người dùng hiện tại. */
export const useShellMenu = () => {
  const { can } = useAccess();
  return useMemo(() => filterMenuByAccess(shellMenuItems, can), [can]);
};
