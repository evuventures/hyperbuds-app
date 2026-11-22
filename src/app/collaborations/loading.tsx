import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { CardGridSkeleton } from "@/components/ui/AppSkeletons";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <CardGridSkeleton count={4} columns={2} />
      </div>
    </DashboardLayout>
  );
}
