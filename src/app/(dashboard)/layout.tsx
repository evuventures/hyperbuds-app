import DashboardLayout from "@/components/layout/Dashboard/Dashboard";

/**
 * Shared layout for all dashboard routes. DashboardLayout mounts once;
 * only the main content (children) changes on navigation, so sidebar and header do not reload.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
