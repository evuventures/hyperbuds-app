import { CardGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Skeleton className="mb-8 h-10 w-48 rounded-lg" />
        <CardGridSkeleton count={6} columns={3} />
      </div>
    </div>
  );
}
