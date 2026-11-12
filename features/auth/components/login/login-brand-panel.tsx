"use client";

import { RobotOutlined, SafetyCertificateOutlined, TeamOutlined } from "@ant-design/icons";
import { theme } from "antd";
import Image from "next/image";

import { appConfig } from "@/lib/constants/app";

import type { ReactNode } from "react";

interface IHighlight {
  icon: ReactNode;
  title: string;
  description: string;
}

const HIGHLIGHTS: IHighlight[] = [
  {
    icon: <RobotOutlined />,
    title: "Một nơi cho mọi AI agent",
    description: "Cấu hình, theo dõi và vận hành agent trên cùng một bảng điều khiển.",
  },
  {
    icon: <TeamOutlined />,
    title: "Quản lý người dùng tập trung",
    description: "Cấp tài khoản, đặt lại mật khẩu và thu hồi phiên đăng nhập khi cần.",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Phân quyền theo vai trò",
    description: "Mỗi người chỉ thấy và làm được đúng phần việc của mình.",
  },
];

/** Tông tối của màu chủ đạo, dùng làm điểm cuối gradient của panel. */
const PANEL_GRADIENT_END = "#0b1b4d";

/** Panel thương hiệu bên trái trang đăng nhập; chỉ hiện từ màn hình lớn (lg) trở lên. */
export function LoginBrandPanel() {
  const { token } = theme.useToken();

  return (
    <aside
      className="relative hidden w-[46%] max-w-2xl flex-col justify-between overflow-hidden p-12 text-white lg:flex"
      style={{
        background: `linear-gradient(145deg, ${token.colorPrimary} 0%, ${PANEL_GRADIENT_END} 100%)`,
      }}
    >
      {/* Hai vòng sáng trang trí ở góc. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 size-112 rounded-full bg-white/5 blur-2xl"
      />

      <div className="relative flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-white shadow-lg">
          <Image src={appConfig.logo} alt="UID" width={30} height={30} unoptimized priority />
        </span>
        <span className="text-xl font-semibold tracking-tight">{appConfig.name}</span>
      </div>

      <div className="relative">
        <h2 className="mb-3 text-4xl leading-tight font-bold tracking-tight">
          Vận hành AI agent
          <br />
          gọn gàng và an toàn
        </h2>
        <p className="mb-10 max-w-md text-base text-white/75">{appConfig.description}.</p>
        <ul className="flex flex-col gap-5">
          {HIGHLIGHTS.map(({ icon, title, description }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/15 text-lg">
                {icon}
              </span>
              <div>
                <div className="font-medium">{title}</div>
                <div className="text-sm text-white/70">{description}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative text-sm text-white/60">UID · {appConfig.name}</div>
    </aside>
  );
}
