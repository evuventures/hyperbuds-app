"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Heart, X, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { BASE_URL } from "@/config/baseUrl";
import type { MatchSuggestion } from "@/types/matching.types";

export default function MatchmakerPage() {
  const [matches, setMatches] = useState<MatchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch current user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          console.warn("⚠️ No access token found.");
          setError("Unauthorized. Please log in again.");
          return;
        }

        const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error("❌ Failed to fetch user:", errData);
          setError("Failed to fetch user info.");
          return;
        }

        const userData = await res.json();
        console.log("✅ Current User:", userData);
        setUser(userData);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Unexpected error occurred while fetching user.");
      }
    };

    fetchUser();
  }, []);

  // ✅ Fetch match suggestions
  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("Unauthorized. Please log in again.");
        return;
      }

      const suggestionsRes = await fetch(
        `${BASE_URL}/api/v1/matching/suggestions?limit=10`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const suggestionsData = await suggestionsRes.json();
      console.log("🧠 Suggestions API response:", suggestionsData);

      if (!suggestionsRes.ok) {
        setError(suggestionsData.message || "Failed to fetch suggestions.");
        return;
      }

      // ✅ Robust handling for multiple response formats
      if (Array.isArray(suggestionsData)) {
        setMatches(suggestionsData);
      } else if (Array.isArray(suggestionsData.matches)) {
        setMatches(suggestionsData.matches);
      } else if (Array.isArray(suggestionsData.data?.matches)) {
        setMatches(suggestionsData.data.matches);
      } else if (Array.isArray(suggestionsData.data)) {
        setMatches(suggestionsData.data);
      } else {
        console.warn("⚠️ Unexpected response format:", suggestionsData);
        setMatches([]);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Error fetching match suggestions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        <span className="ml-2 text-blue-500 font-medium">Loading matches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchMatches}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <RefreshCw className="mr-2 w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-400">
        <p>No match suggestions yet.</p>
        <button
          onClick={fetchMatches}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <RefreshCw className="mr-2 w-4 h-4" /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">🎯 Match Suggestions</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match, index) => (
          <motion.div
            key={match.id || index}
            className="p-6 bg-white rounded-2xl shadow-md flex flex-col items-center"
            whileHover={{ scale: 1.03 }}
          >
            <img
              src={match?.profile?.avatar || "/default-avatar.png"}
              alt={match?.profile?.displayName || "User"}
              className="w-24 h-24 rounded-full mb-3 object-cover"
            />
            <h2 className="font-semibold text-lg">
              {match?.profile?.displayName || "Unknown User"}
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              {match?.profile?.niche?.join(", ") || "No niche info"}
            </p>
            <div className="flex gap-4">
              <button className="p-2 rounded-full bg-red-100 hover:bg-red-200">
                <X className="text-red-500" />
              </button>
              <button className="p-2 rounded-full bg-green-100 hover:bg-green-200">
                <Heart className="text-green-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
