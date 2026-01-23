'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackLinkProps {
  onClick: () => void;
  label?: string;
}

const BackLink: React.FC<BackLinkProps> = ({ onClick, label = 'Back' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-gray-400 text-sm hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
};

export default BackLink;
