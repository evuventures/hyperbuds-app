import DashboardLayout from "@/components/layout/Dashboard/Dashboard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
