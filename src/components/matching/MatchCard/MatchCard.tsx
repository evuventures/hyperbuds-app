// components/matching/MatchCard.tsx

import React from "react";
import { FaHeart, FaTimes, FaBan } from "react-icons/fa";

// Define the correct type for the props
interface MatchCardProps {
  match: {
    id: string;
    name: string;
    age: number;
    bio: string;
    photos: string[];
    interests: string[];
    location: string;
    compatibility: number;
  };
  onAction: (id: string, action: string) => void;
  onBlock: (id: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onAction, onBlock }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center transition-transform transform hover:scale-105">
      <img
        src={match.avatar || "https://via.placeholder.com/200"}
        alt={match.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="text-xl font-semibold mb-1">{match.userName}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{match.niche || 'Not specified'}</p>

      {match.rizzScore && (
        <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full px-3 py-1 text-xs font-bold mb-4">
          Rizz Score: {match.rizzScore}%
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => onAction(match.id, "like")}
          className="bg-green-500 text-white p-3 rounded-full shadow-md hover:bg-green-600 transition-colors"
          aria-label="Like"
        >
          <FaHeart size={20} />
        </button>
        <button
          onClick={() => onAction(match.id, "dislike")}
          className="bg-red-500 text-white p-3 rounded-full shadow-md hover:bg-red-600 transition-colors"
          aria-label="Dislike"
        >
          <FaTimes size={20} />
        </button>
        <button
          onClick={() => onBlock(match.id)}
          className="bg-gray-500 text-white p-3 rounded-full shadow-md hover:bg-gray-600 transition-colors"
          aria-label="Block"
        >
          <FaBan size={20} />
        </button>
      </div>
    </div>
  );
};

export default MatchCard;