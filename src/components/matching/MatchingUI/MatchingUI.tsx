// components/matching/MatchingUI.tsx
import React from "react";
import MatchCard from "../MatchCard/MatchCard";
import { FaUserCircle } from "react-icons/fa";

// ✅ Define types for props
export interface UserProfile {
  id: string | number;
  displayName: string;
  avatar?: string;
  bio?: string;
}

export interface Match {
  id: string | number;
  name: string;
  avatar?: string;
  score?: number;
}

export interface Recommendation {
  id: string | number;
  name: string;
  avatar?: string;
  description: string;
  score: number;
}

export interface HistoryItem {
  id: string | number;
  name: string;
  action: string;
  date: string;
}

interface MatchingUIProps {
  userProfile: UserProfile | null;
  matches: Match[];
  recommendations: Recommendation[];
  history: HistoryItem[];
  handleAction: (matchId: string | number, action: string) => void;
  handleBlock: (userId: string | number) => void;
}

const MatchingUI: React.FC<MatchingUIProps> = ({
  userProfile,
  matches,
  recommendations,
  handleAction,
  handleBlock,
  history,
}) => {
  return (
    <div className="bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 min-h-screen p-6 md:p-12 transition-colors duration-300">
      {/* Main User Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 mb-8">
        <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-lg border-4 border-transparent bg-gradient-to-br from-pink-500 to-purple-600 p-1">
          <img
            src={userProfile?.avatar || "https://via.placeholder.com/150"}
            alt={userProfile?.displayName || "User Profile"}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {userProfile?.displayName || "Kingsley Adams"}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-lg">
            {userProfile?.bio ||
              "Hendreht elementum ipsum tincidunt nunc vitae quam gravida consectetur urna Nam diam urna. Nunc ut gravida ipsum tincidunt hendrerit elementum ipsum"}
          </p>
        </div>
      </div>

      {/* Profile and Special Needs Tabs */}
      <div className="flex space-x-4 mb-12 justify-center md:justify-start">
        <button className="px-6 py-2 rounded-full font-semibold shadow-md transition-colors duration-300
        bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white">
          Profile
        </button>
        <button className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold shadow-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-300">
          Special needs
        </button>
      </div>

      {/* Top Matches Section */}
      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Top Matches</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No new matches available.</p>
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onAction={handleAction}
              onBlock={handleBlock}
            />
          ))
        )}
      </div>

      {/* Recommendations Section */}
      <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Recommendations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No recommendations available.</p>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="flex items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <img
                src={rec.avatar}
                alt={rec.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{rec.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
              </div>
              <div className="w-16 h-16 p-0.5 flex items-center justify-center rounded-full ring-2 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-white dark:bg-black text-sm font-bold text-black dark:text-white">
                  {rec.score}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Match History */}
      <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Match History</h2>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow-md">
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No match history found.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((h) => (
              <li key={h.id} className="flex items-center space-x-4">
                <FaUserCircle className="text-2xl text-gray-500" />
                <span>
                  You {h.action} {h.name} on {new Date(h.date).toLocaleDateString()}.
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MatchingUI;
