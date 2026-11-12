import { Geist, Geist_Mono } from "next/font/google";

import { AntdRegistry, Providers } from "@/components/providers";

import type { Metadata } from "next";

// layers.css phải đứng trước mọi CSS khác (khai báo thứ tự cascade layer).
import "./layers.css";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "vietnamese"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Agent Core", template: "%s | Agent Core" },
  description: "Bảng điều khiển quản lý AI agent",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
