"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BASE_URL } from '@/config/baseUrl';
export default function VerifyEmail() {
  const [status, setStatus] = useState("Verifying your email...");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [htmlBody, setHtmlBody] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("❌ No token found in the link");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/auth/verify-email?token=${token}`, 
          {
            method: "GET",
          }
        );

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.message || "Verification failed");
        }

        // ✅ Correct way to parse response
        const data = await res.text();

        setHtmlBody(data);

        setStatus(`✅ Email verified successfully. Redirecting to login...`);
        setTimeout(() => router.push("/auth/signin"), 2000);
      } catch (error: unknown) {
        setHtmlBody(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Failed - HyperBuds</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'] },
          colors: {
            'primary': '#A259FF',
            'secondary': '#1F2937',
            'background-light': '#F9FAFB',
          }
        }
      }
    }
  </script>
  <style>
    .card {
      box-shadow: 0 10px 25px -3px rgba(0,0,0,0.1),
                  0 4px 6px -2px rgba(0,0,0,0.05);
    }
  </style>
</head>
<body class="bg-background-light min-h-screen font-sans">
  <div class="flex fixed inset-0 z-50 justify-center items-center p-4">
    <div class="relative w-full max-w-md">
      <div class="relative overflow-hidden bg-white rounded-2xl shadow-2xl">
        <!-- Gradient Header Background -->
        <div class="absolute top-0 right-0 left-0 h-32 bg-linear-to-br from-purple-500 to-blue-500 opacity-10"></div>

        <!-- Close Button (non-functional in static HTML) -->
        <button
          class="absolute top-4 right-4 z-10 p-2 text-gray-400 rounded-lg transition-all hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close modal"
          style="pointer-events: none; opacity: 0.5;"
        >
          &#10005;
        </button>

        <!-- Content -->
        <div class="relative p-8">
          <!-- Success Icon Substitute -->
          <div class="flex justify-center items-center mb-6">
            <svg class="w-20 h-20 text-primary" fill="none" stroke="red" viewBox="0 0 24 24">
              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"></path>
            </svg>
          </div>

          <!-- Title -->
          <h2 class="mb-3 text-2xl font-bold text-center text-gray-900">
            Verification Failed
          </h2>

          <!-- Description -->
          <div class="mb-6 space-y-3">
            <p class="text-center text-gray-600">
              The verification link is invalid or has expired.
            </p>
            <div class="p-3 text-center bg-purple-50 rounded-lg border border-purple-200">
              <p class="font-semibold text-purple-700">
                Login to request a new verification link.
              </p>
            </div>
            <p class="text-sm text-center text-gray-600">
              Click the link in the email to verify your account and complete your registration.
            </p>
          </div>

          <!-- Actions -->
          <div>
            <a
              href="${BASE_URL}/auth/signin"
              class="flex justify-center items-center gap-2 w-full h-12 font-semibold text-white bg-linear-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg transition-all duration-300 transform cursor-pointer hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 active:scale-[0.98]"
            >
              Login to HyperBuds
            </a>
          </div>

          <!-- Helper Text -->
          <p class="mt-4 text-xs text-center text-gray-500">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`);
        setStatus(`❌ Email verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log(error)
      }
    };

    verify();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="inline-flex items-center gap-2">
        {/* Spinner shown only while verifying */}
        {status.startsWith("Verifying") && (
          <span className="relative flex h-10 w-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A259FF] opacity-50"></span>
            <span className="relative inline-flex rounded-full h-10 w-10 bg-[#A259FF]"></span>
          </span>
        )}
        <h2 className="text-lg font-semibold text-white">{status}</h2>
      </div>
      <div dangerouslySetInnerHTML={{ __html: htmlBody }} />

    </div>
  );
}
