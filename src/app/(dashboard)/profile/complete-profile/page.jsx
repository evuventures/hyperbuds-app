"use client";

import nextDynamic from "next/dynamic";
import { FaSpinner } from "react-icons/fa";

// Load form only on client to avoid SSR prerender error ("number 0 is not iterable")
const MultiStepProfileForm = nextDynamic(
  () => import("./MultiStepProfileForm").then((mod) => mod.MultiStepProfileForm),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
        <div className="flex flex-col gap-3 items-center text-gray-500">
          <FaSpinner className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    ),
  }
);

export const dynamic = "force-dynamic";

export default function CompleteProfilePage() {
  return <MultiStepProfileForm />;
}
