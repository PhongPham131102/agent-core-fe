"use client";

import { App, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { useEffect } from "react";

import { antdTheme } from "@/lib/theme/antd-theme";
import { bindNotifyApi } from "@/lib/ui/notify";

import type { ReactNode } from "react";

/** Gắn message/notification của `<App>` cho code ngoài React (QueryCache, session). */
function AntdAppBridge() {
  const { message, notification } = App.useApp();
  useEffect(() => bindNotifyApi({ message, notification }), [message, notification]);
  return null;
}

export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={antdTheme} locale={viVN}>
      <App>
        <AntdAppBridge />
        {children}
      </App>
    </ConfigProvider>
  );
}
