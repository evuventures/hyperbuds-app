import React from "react";
import { MessagesContent } from "./components/MessagesContent";

export default function MessagesPage() {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900">
      <div className="p-4 pb-16 lg:p-6 lg:pb-34">
        <MessagesContent />
      </div>
    </div>
  );
}
