import { DashboardShell } from "@/features/shell";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return <DashboardShell>{children}</DashboardShell>;
}
