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
        setStatus(`❌ Email verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log(error)
      }
    };

    verify();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h2 className="text-lg font-semibold">{status}</h2>
      <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
    </div>
  );
}
