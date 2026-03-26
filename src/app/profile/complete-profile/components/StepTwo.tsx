import React from 'react';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';

interface Step2Props {
  username: string;
  displayName: string;
  isChecking: boolean;
  isAvailable: boolean | null;
  onUpdateField: (field: 'username' | 'displayName', value: string) => void;
  suggestions: string[] | null;
}

const Step2BasicInfo: React.FC<Step2Props> = ({
  username,
  displayName,
  isChecking,
  isAvailable,
  onUpdateField,
  suggestions,
}) => {

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize input: lowercase, alphanumeric and underscores only
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (value.length <= 30) {
      onUpdateField('username', value);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
          Basic Information
        </h2>
        <p className="text-gray-600">Choose your username and display name</p>
      </div>

      <div className="space-y-6">
        {/* Username Input */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              placeholder="coolcreator123"
              maxLength={30}
            />
            <div className="flex absolute inset-y-0 right-0 items-center pr-3">
              {isChecking ? (
                <FaSpinner className="w-4 h-4 text-gray-400 animate-spin" />
              ) : isAvailable === true ? (
                <div className="flex justify-center items-center w-6 h-6 bg-green-500 rounded-full">
                  <FaCheckCircle className="w-3 h-3 text-white" />
                </div>
              ) : isAvailable === false ? (
                <div className="flex justify-center items-center w-6 h-6 bg-red-500 rounded-full">
                  <span className="text-xs text-white">✕</span>
                </div>
              ) : null}
            </div>
          </div>
          <p className={`mt-1 text-xs ${isAvailable === false ? 'text-red-500' : 'text-gray-500'}`}>
            {isAvailable === false
              ? 'Username is already taken'
              : '3-30 characters, letters, numbers, and underscores only'}
          </p>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl">
            <p className="text-sm text-yellow-700">Here are some available username suggestions:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => {
                const isSelected = suggestion === username;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onUpdateField('username', suggestion)}
                    className={
                      `px-3 py-1 rounded-lg border capitalize transition-colors text-sm font-medium ` +
                      (isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow'
                        : 'bg-white text-purple-700 border-purple-300 hover:bg-blue-50 hover:border-purple-500')
                    }
                  >
                    {suggestion}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Display Name Input */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => onUpdateField('displayName', e.target.value)}
            className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            placeholder="Cool Creator"
            maxLength={50}
          />
        </div>
      </div>
    </div>
  );
};

export default Step2BasicInfo;