import { PageContentSkeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="p-4 pb-16 lg:p-6 lg:pb-34">
      <PageContentSkeleton />
    </div>
  );
}
