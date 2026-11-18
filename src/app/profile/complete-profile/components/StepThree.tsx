import React, { useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useNiches } from '@/hooks/features/useNiches';
import LocationSelector from '@/components/profile/LocationSelector';

interface Step3Props {
  bio: string;
  selectedNiches: string[];
  location: { city: string; state: string; country: string };
  onUpdateField: (field: string, value: unknown) => void;
  onUpdateLocation: (key: string, value: string) => void;
}

const Step3About: React.FC<Step3Props> = ({
  bio,
  selectedNiches,
  location,
  onUpdateField,
  onUpdateLocation,
}) => {
  const { data: availableNiches = [], isLoading: isLoadingNiches } = useNiches();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredNiches = (availableNiches || []).filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      onUpdateField('niches', selectedNiches.filter((n) => n !== niche));
    } else {
      onUpdateField('niches', [...selectedNiches, niche]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Story &amp; Niches
        </h2>
        <p className="mt-2 text-base text-gray-500">
          Help AI match you with the right collaborators.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="complete-bio" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Bio
          </label>
          <textarea
            id="complete-bio"
            rows={3}
            value={bio}
            onChange={(e) => onUpdateField('bio', e.target.value)}
            maxLength={500}
            className="w-full resize-none rounded-2xl border border-transparent bg-[#f3f4f8] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
            placeholder="Share what you create and who you love collaborating with..."
          />
          <p className="mt-1 text-right text-xs text-gray-400">{bio.length} / 500</p>
        </div>

        <div className="relative" ref={dropdownRef}>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Content Niches
          </label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsOpen((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
              }
            }}
            className={`flex min-h-13 cursor-pointer flex-wrap items-center gap-2 rounded-2xl border px-4 py-2.5 transition ${
              isOpen
                ? 'border-purple-500 bg-white ring-4 ring-purple-500/10'
                : 'border-transparent bg-[#f3f4f8] hover:border-purple-300'
            }`}
          >
            {selectedNiches.length > 0 ? (
              selectedNiches.map((niche) => (
                <span
                  key={niche}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-xs"
                >
                  <span>{niche}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNiche(niche);
                    }}
                    aria-label={`Remove ${niche}`}
                    className="rounded-full p-0.5 transition hover:bg-white/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">Select your content niches...</span>
            )}
            <ChevronDown
              className={`ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180 text-purple-600' : ''
              }`}
            />
          </div>

          {isOpen && !isLoadingNiches && (
            <div className="absolute z-50 mt-2 max-h-72 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-100 p-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search niches..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl bg-[#f3f4f8] py-2 pl-9 pr-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto p-1.5">
                {filteredNiches.map((niche) => {
                  const selected = selectedNiches.includes(niche);
                  return (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => toggleNiche(niche)}
                      className={`mb-0.5 flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-left text-sm transition ${
                        selected
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 font-semibold text-white'
                          : 'text-gray-700 hover:bg-purple-50'
                      }`}
                    >
                      <span>{niche}</span>
                      {selected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <LocationSelector
            country={location.country}
            state={location.state}
            city={location.city}
            onChange={(key, val) => onUpdateLocation(key, val)}
          />
        </div>
      </div>
    </div>
  );
};

export default Step3About;
