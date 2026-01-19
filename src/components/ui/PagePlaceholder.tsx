"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { ComingSoon } from "@/components/ui/ComingSoon";

interface PagePlaceholderProps {
  title: string;
  description?: string;
  icon?: "sparkles" | "calendar" | "bell" | "rocket" | "trending" | "zap";
}

const PagePlaceholder: React.FC<PagePlaceholderProps> = ({
  title,
  description,
  icon = "sparkles",
}) => {
  return (
    <DashboardLayout>
      <div className="min-h-full bg-gray-50 dark:bg-slate-900">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                  {title}
                </h1>
                {description ? (
                  <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            <ComingSoon
              title={title}
              description={
                description || "We’re polishing this experience for launch."
              }
              icon={icon}
              variant="feature"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PagePlaceholder;
