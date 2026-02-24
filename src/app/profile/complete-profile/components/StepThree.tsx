import React, { useRef, useEffect } from 'react';
import { X, Check, LucideAArrowDown } from 'lucide-react';
import { FaSearch } from 'react-icons/fa';
import { useNiches } from '@/hooks/features/useNiches';
import { motion, AnimatePresence } from 'framer-motion';

interface Step3Props {
  bio: string;
  selectedNiches: string[];
  location: { city: string; state: string; country: string };
  onUpdateField: (field: string, value: unknown) => void;
  onUpdateLocation: (key: string, value: string) => void;
}


const Step3About: React.FC<Step3Props> = ({ 
  bio, selectedNiches, location, onUpdateField, onUpdateLocation 
}) => {
  const { data: availableNiches = [], isLoading: isLoadingNiches } = useNiches();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredNiches = (availableNiches || []).filter(n =>
    n.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
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
      onUpdateField('niches', selectedNiches.filter(n => n !== niche));
    } else {
      onUpdateField('niches', [...selectedNiches, niche]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
          Tell Us About You
        </h2>
        <p className="text-gray-600">Share your story and interests</p>
      </div>

      <div className="space-y-6">
        {/* Bio Section */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Bio</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => onUpdateField('bio', e.target.value)}
            maxLength={500}
            className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-200 resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            placeholder="Tell us about yourself and your content..."
          />
          <p className="mt-1 text-xs text-right text-gray-500">
            {bio.length} / 500 characters
          </p>
        </div>

        {/* Niche Selection */}
        <div className="relative w-full mx-auto" ref={dropdownRef}>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Select your niches
          </label>
          <p className='text-xs text-gray-500 mb-3'>
            Select niches to help us match you with the right opportunities.
          </p>

          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`relative border-2 rounded-xl bg-white px-4 py-3 min-h-14 flex flex-wrap items-center gap-2 cursor-pointer transition-all duration-200 ${isOpen
              ? "border-purple-500 ring-2 ring-purple-200"
              : "border-gray-300 hover:border-purple-400"
              }`}
          >
            {selectedNiches.length > 0 ? (
              selectedNiches.map(niche => (
                <motion.span
                  key={niche}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-linear-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <span>{niche}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleNiche(niche); }}
                    className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">Click to select niches...</span>
            )}
            <div className="flex items-center gap-2 ml-auto pl-2">
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                <LucideAArrowDown className="h-5 w-5 text-gray-400" />
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && !isLoadingNiches && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden"
              >
                <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      autoFocus
                      placeholder="Search niches..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {filteredNiches.map(niche => (
                    <div
                      key={niche}
                      onClick={() => toggleNiche(niche)}
                      className={`px-4 py-2.5 rounded-lg cursor-pointer text-sm mb-1 flex items-center justify-between transition-all ${
                        selectedNiches.includes(niche)
                          ? "bg-linear-to-r from-purple-500 to-blue-500 text-white"
                          : "hover:bg-purple-50 text-gray-700"
                      }`}
                    >
                      <span className="font-medium">{niche}</span>
                      {selectedNiches.includes(niche) && <Check className="h-4 w-4" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(['city', 'state', 'country'] as const).map((key) => (
            <div key={key}>
              <label className="block mb-2 text-sm font-semibold text-gray-700 capitalize">{key}</label>
              <input
                type="text"
                value={location[key]}
                onChange={(e) => onUpdateLocation(key, e.target.value)}
                className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step3About;