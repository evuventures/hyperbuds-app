'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Clock, History } from 'lucide-react';

const links = [
  { href: '/collaborations', label: 'All', icon: Users },
  { href: '/collaborations/active', label: 'Active', icon: Clock },
  { href: '/collaborations/history', label: 'History', icon: History },
];

const CollaborationNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 p-1.5">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all ${
              isActive
                ? 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300'
                : 'border-gray-300 text-gray-500 hover:text-purple-600 dark:text-white dark:border-gray-500'
            }`}
          >
            <Icon size={14} /> {link.label}
          </Link>
        );
      })}
    </div>
  );
};

export default CollaborationNav;
