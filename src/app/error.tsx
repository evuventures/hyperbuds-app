'use client'; 

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // You can log the error to an error reporting service here
    console.error(error);
  }, [error]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="mb-4">We’re sorry — an unexpected error occurred.</p>
      <button
        onClick={() => reset()} // try to recover
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
