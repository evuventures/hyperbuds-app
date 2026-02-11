import { MessagingSkeleton } from "@/components/messaging/skeletons/MessagingSkeleton";

export default function MessagesLoading() {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900">
      <div className="p-4 pb-16 lg:p-6 lg:pb-34">
        <MessagingSkeleton />
      </div>
    </div>
  );
}
