import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    </DashboardLayout>
  );
}

