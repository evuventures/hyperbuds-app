'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';

export default function NotFound() {
  return (
    <DashboardLayout>
      <div className="flex overflow-hidden relative flex-col justify-center items-center px-4 min-h-screen">
        {/* Decorative background elements */}
        <div className="absolute top-8 right-8 w-20 h-20 rounded-full blur-xl bg-purple-300/20 dark:bg-purple-500/10"></div>
        <div className="absolute bottom-8 left-8 w-32 h-32 rounded-full blur-2xl bg-pink-300/20 dark:bg-pink-500/10"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 max-w-lg text-center"
        >
          {/* 404 Heading with gradient */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 sm:text-9xl"
          >
            404
          </motion.h1>

          {/* Page Not Found message */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl"
          >
            Page Not Found
          </motion.h2>

          {/* Descriptive text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-400"
          >
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
          </motion.p>

          {/* Navigation buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col gap-4 justify-center cursor-pointer sm:flex-row"
          >
            <Link
              href="/"
              className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl transition-all duration-200 transform cursor-pointer hover:from-purple-700 hover:to-pink-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 font-semibold text-purple-600 bg-white rounded-xl border-2 border-purple-500 transition-all duration-200 transform cursor-pointer dark:bg-gray-800 dark:text-purple-400 dark:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Go Back
            </button>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
