"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ArrowLeft, Loader2 } from "lucide-react";

/**
 * 404 page for routes under (app) - e.g. /dashboard/ss.
 * Renders as a fixed full-viewport overlay (z-9999) so it sits above
 * DashboardLayout and captures all clicks. Without this, the 404 would
 * be inside the main content area and layout overlays could block clicks.
 */
export default function NotFound() {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/");
  }, [router]);

  const navigateTo = (path: string) => {
    setNavigating(true);
    router.push(path);
  };

  const handleGoBack = () => {
    setNavigating(true);
    if (globalThis.window != null && globalThis.window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-50 via-white to-purple-50/10 px-6 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10"
      aria-labelledby="not-found-heading"
      aria-describedby="not-found-description"
    >
      {/* Decorative elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-500/10" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-500/10" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* 404 display */}
        <div className="mb-6">
          <span className="text-8xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 sm:text-9xl">
            404
          </span>
        </div>

        <h1 id="not-found-heading" className="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Page not found
        </h1>
        <p id="not-found-description" className="mb-10 text-gray-600 dark:text-gray-400">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or
          doesn&apos;t exist.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigateTo("/dashboard")}
            disabled={navigating}
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-600 dark:to-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 cursor-pointer disabled:opacity-70 disabled:cursor-wait min-w-[140px]"
          >
            {navigating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Home className="h-4 w-4" aria-hidden />
            )}
            Go to Dashboard
          </button>
          <button
            type="button"
            onClick={handleGoBack}
            disabled={navigating}
            className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 cursor-pointer disabled:opacity-70 disabled:cursor-wait dark:border-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 dark:hover:border-gray-500 min-w-[140px]"
          >
            {navigating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ArrowLeft className="h-4 w-4" aria-hidden />
            )}
            Go back
          </button>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <button
            type="button"
            onClick={() => navigateTo("/")}
            disabled={navigating}
            className="font-medium text-purple-600 underline-offset-4 hover:underline dark:text-purple-400 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
          >
            Return to home
          </button>
        </p>
      </div>
    </div>
  );
}
