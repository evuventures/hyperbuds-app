import React from 'react';
import { CheckCircle2, Loader2, X } from 'lucide-react';

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
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (value.length <= 30) {
      onUpdateField('username', value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Set Your Identity
        </h2>
        <p className="mt-2 text-base text-gray-500">
          Pick a memorable handle and public display name.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="complete-username" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Username
          </label>
          <div className="relative">
            <input
              id="complete-username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="w-full rounded-2xl border border-transparent bg-[#f3f4f8] py-3.5 pl-4 pr-11 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
              placeholder="coolcreator123"
              maxLength={30}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              ) : isAvailable === true ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : isAvailable === false ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
                  <X className="h-3 w-3" />
                </span>
              ) : null}
            </div>
          </div>
          <p className={`mt-1.5 text-xs ${isAvailable === false ? 'text-rose-600 font-medium' : 'text-gray-400'}`}>
            {isAvailable === false
              ? 'Username not available. Try one of the options below.'
              : '3–30 characters using letters, numbers, or underscores.'}
          </p>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-3.5">
            <p className="text-xs font-semibold text-purple-800">Suggested handles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => {
                const isSelected = suggestion === username;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onUpdateField('username', suggestion)}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-purple-700 ring-1 ring-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    @{suggestion}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="complete-display-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Display Name
          </label>
          <input
            id="complete-display-name"
            type="text"
            value={displayName}
            onChange={(e) => onUpdateField('displayName', e.target.value)}
            className="w-full rounded-2xl border border-transparent bg-[#f3f4f8] px-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
            placeholder="Alex Rivera"
            maxLength={50}
          />
        </div>
      </div>
    </div>
  );
};

export default Step2BasicInfo;
