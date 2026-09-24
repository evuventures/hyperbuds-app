'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, LucideAArrowDown, X } from 'lucide-react';
import { FaSearch } from 'react-icons/fa';

export interface SelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  value: string;
  options: (string | SelectOption)[];
  onChange: (value: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  value,
  options,
  onChange,
  disabled = false,
  disabledMessage,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions: SelectOption[] = useMemo(() => {
    return options.map((opt) =>
      typeof opt === 'string' ? { label: opt, value: opt } : opt
    );
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return normalizedOptions;
    const lower = search.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lower) ||
        opt.value.toLowerCase().includes(lower)
    );
  }, [normalizedOptions, search]);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value);
  }, [normalizedOptions, value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSearch('');
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      <div
        onClick={handleToggle}
        className={`relative border-2 rounded-xl px-4 py-3 min-h-14 flex items-center justify-between transition-all duration-200 ${
          disabled
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
            : isOpen
            ? 'bg-white border-purple-500 ring-2 ring-purple-200 cursor-pointer'
            : 'bg-white border-gray-300 hover:border-purple-400 cursor-pointer'
        }`}
        title={disabled && disabledMessage ? disabledMessage : undefined}
      >
        <div className="flex-1 min-w-0 pr-2">
          {selectedOption ? (
            <span className="block truncate text-sm font-medium text-gray-800">
              {selectedOption.label}
            </span>
          ) : (
            <span className="block truncate text-sm text-gray-400">
              {disabled && disabledMessage ? disabledMessage : placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <LucideAArrowDown className="h-5 w-5 text-gray-400" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden"
          >
            {/* Search Input */}
            <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  autoFocus
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="p-2 max-h-56 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`px-4 py-2.5 rounded-lg cursor-pointer text-sm mb-1 flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-linear-to-r from-purple-500 to-blue-500 text-white font-medium shadow-sm'
                          : 'hover:bg-purple-50 text-gray-700'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 ml-2" />}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-sm text-gray-400">
                  No matches found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableSelect;
