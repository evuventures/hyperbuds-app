// app/not-found.tsx
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl px-8 py-12 flex flex-col items-center max-w-md w-full border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-tr from-purple-500 to-blue-500 mb-6 shadow-lg">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600 mb-2">Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Sorry, we couldn&apos;t find that page.<br />The page you are looking for does not exist or is temporarily unavailable.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-md hover:from-purple-600 hover:to-blue-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
