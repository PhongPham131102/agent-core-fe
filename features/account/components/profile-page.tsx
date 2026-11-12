"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Tabs } from "antd";

import { PageHeader } from "@/components/common";
import { useAccess } from "@/features/auth";

import { useProfileTab } from "../hooks/use-profile-tab";
import { ProfileTab } from "../profile-tabs";

import { ChangePasswordForm } from "./change-password-form";
import { ProfileInfoForm } from "./profile-info-form";
import { ProfileSummaryCard } from "./profile-summary-card";

/** Trang hồ sơ: thông tin, ảnh đại diện, quyền và đổi mật khẩu của chính mình. */
export function ProfilePage() {
  const { user } = useAccess();
  const [tab, setTab] = useProfileTab();

  // Trang nằm sau AuthGuard nên luôn có user; kiểm tra để TypeScript thu hẹp kiểu.
  if (!user) return null;

  return (
    <>
      <PageHeader
        title="Hồ sơ của tôi"
        description="Quản lý thông tin cá nhân và bảo mật tài khoản."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <ProfileSummaryCard user={user} />
        <Card>
          <Tabs
            activeKey={tab}
            onChange={(key) => void setTab(key as ProfileTab)}
            items={[
              {
                key: ProfileTab.info,
                label: "Thông tin cá nhân",
                icon: <UserOutlined />,
                // `key` theo thời điểm cập nhật: lưu xong thì form nhận lại giá trị mới.
                children: <ProfileInfoForm key={user.updatedAt} user={user} />,
              },
              {
                key: ProfileTab.security,
                label: "Bảo mật",
                icon: <LockOutlined />,
                children: <ChangePasswordForm />,
              },
            ]}
          />
        </Card>
      </div>
    </>
  );
}
