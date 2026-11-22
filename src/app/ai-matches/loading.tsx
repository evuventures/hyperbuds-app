import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { CardGridSkeleton } from "@/components/ui/AppSkeletons";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <CardGridSkeleton count={6} columns={3} />
      </div>
    </DashboardLayout>
  );
}
