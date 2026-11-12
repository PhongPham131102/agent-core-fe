import type { ThemeConfig } from "antd";

export const antdTheme: ThemeConfig = {
  cssVar: { prefix: "ac" },
  token: {
    colorPrimary: "#1d4ed8",
    borderRadius: 8,
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
  components: {
    Layout: { headerBg: "#ffffff", siderBg: "#ffffff", headerPadding: "0 16px" },
  },
};
