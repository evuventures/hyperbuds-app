"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth"; // ✅ Use your hook

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { googleLogin } = useAuth(); // ✅ Pull the Redux-integrated login method
  const [status, setStatus] = useState("Processing Google login...");
  
  // Use a ref to prevent double-execution in React Strict Mode
  const processingRef = useRef(false);

  useEffect(() => {
    if (processingRef.current) return;
    
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setStatus(`❌ Google authentication failed: ${error}`);
        setTimeout(() => router.push("/auth/signin?error=google_auth_failed"), 2000);
        return;
      }

      if (!code) {
        setStatus("❌ No authorization code received from Google");
        setTimeout(() => router.push("/auth/signin?error=no_code"), 2000);
        return;
      }

      processingRef.current = true;

      try {
        setStatus("Authenticating with Hyperbuds...");
        
        // ✅ This calls the backend AND updates Redux + LocalStorage
        const data = await googleLogin(code);

        setStatus("✅ Login successful! Checking profile...");

        // Determine where to send the user
        const redirectPath = sessionStorage.getItem("authRedirect") || "/";
        
        // Check profile completeness from the returned data
        const profile = data.user?.profile;
        const isProfileIncomplete =
          !profile?.username ||
          profile.username === "" ||
          !profile?.bio ||
          !profile?.niche ||
          (Array.isArray(profile.niche) && profile.niche.length === 0);

        sessionStorage.removeItem("authRedirect");

        if (isProfileIncomplete) {
          setStatus("✅ Redirecting to profile completion...");
          setTimeout(() => router.push("/profile/complete-profile"), 1000);
        } else {
          setStatus("✅ Redirecting to dashboard...");
          setTimeout(() => router.push(redirectPath), 1000);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Authentication failed";
        setStatus(`❌ ${errorMessage}`);
        setTimeout(() => router.push("/auth/signin?error=auth_failed"), 2000);
      }
    };

    handleCallback();
  }, [router, searchParams, googleLogin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto mb-6 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-white mb-2">
            Verifying Account
          </h2>
          <p className="text-slate-400 text-sm">{status}</p>
        </div>
      </div>
    </div>
  );
}