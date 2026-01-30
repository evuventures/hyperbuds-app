"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BASE_URL } from "@/config/baseUrl";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing Google login...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract authorization code or error from URL
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        // Handle error case
        if (error) {
          setStatus(`❌ Google authentication failed: ${error}`);
          setTimeout(() => {
            router.push("/auth/signin?error=google_auth_failed");
          }, 2000);
          return;
        }

        // Handle missing code
        if (!code) {
          setStatus("❌ No authorization code received from Google");
          setTimeout(() => {
            router.push("/auth/signin?error=no_code");
          }, 2000);
          return;
        }

        // Exchange authorization code with backend
        setStatus("Authenticating with backend...");
        const response = await fetch(`${BASE_URL}/api/v1/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Authentication failed");
        }

        const data = await response.json();

        // Store token and user data
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }

        // Get redirect destination from sessionStorage (set before Google redirect).
        // Never send user back to an auth page after login; dashboard is the home.
        const storedRedirect = sessionStorage.getItem("authRedirect") || "";
        const isAuthRoute = !storedRedirect || storedRedirect.startsWith("/auth/");
        const redirectPath = isAuthRoute ? "/dashboard" : storedRedirect;

        // Check if user has completed profile
        if (data.user) {
          setStatus("✅ Login successful! Checking profile...");

          try {
            const userRes = await fetch(`${BASE_URL}/api/v1/users/me`, {
              headers: {
                Authorization: `Bearer ${data.accessToken}`,
              },
              credentials: "include",
            });

            if (userRes.ok) {
              const userData = await userRes.json();
              const profile = userData?.profile;

              // Check if profile is complete
              const isProfileIncomplete =
                !profile?.username ||
                profile.username === "" ||
                !profile?.bio ||
                profile.bio === "" ||
                !profile?.niche ||
                (Array.isArray(profile.niche) && profile.niche.length === 0);

              if (isProfileIncomplete) {
                setStatus("✅ Redirecting to profile completion...");
                sessionStorage.removeItem("authRedirect");
                setTimeout(() => {
                  router.push("/profile/complete-profile");
                }, 1000);
                return;
              }
            }
          } catch (profileError) {
            console.error("Error checking profile:", profileError);
            // Continue to redirect even if profile check fails
          }
        }

        // Clear redirect destination and redirect
        sessionStorage.removeItem("authRedirect");
        setStatus("✅ Login successful! Redirecting...");
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } catch (err) {
        console.error("Google callback error:", err);
        setStatus(
          `❌ Authentication failed: ${err instanceof Error ? err.message : "Unknown error"}`
        );
        setTimeout(() => {
          router.push("/auth/signin?error=auth_failed");
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Google Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{status}</p>
        </div>
      </div>
    </div>
  );
}

