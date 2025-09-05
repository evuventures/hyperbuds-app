import DashboardLayout from '@/components/layout/Dashboard/Dashboard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
