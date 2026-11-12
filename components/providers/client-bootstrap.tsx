"use client";

import { useEffect } from "react";

import { initSessionLifecycle } from "@/lib/auth";
import { rehydratePersistedStores } from "@/lib/store";

/** Khởi tạo phần chỉ chạy ở trình duyệt: hydrate store persisted, session lifecycle. */
export function ClientBootstrap() {
  useEffect(() => {
    void rehydratePersistedStores();
    return initSessionLifecycle();
  }, []);
  return null;
}
