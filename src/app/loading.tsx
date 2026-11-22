import { PageShellSkeleton } from '@/components/ui/AppSkeletons';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950">
      <PageShellSkeleton />
    </div>
  );
}
