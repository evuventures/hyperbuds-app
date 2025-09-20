"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmail() {
  const [status, setStatus] = useState("Verifying your email...");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("❌ No token found in the link");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `https://api-hyperbuds-backend.onrender.com/api/v1/auth/verify-email?token=${token}`,
          {
            method: "GET",
          }
        );

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.message || "Verification failed");
        }

        // ✅ Correct way to parse response
        const data = await res.json();

        setStatus(`✅ ${data.message} Redirecting to login...`);
        setTimeout(() => router.push("/auth/signin"), 2000);
      } catch (error: unknown) {
        setStatus(`❌ Email verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    verify();
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center h-screen">
      <h2 className="text-lg font-semibold">{status}</h2>
    </div>
  );
}
