'use client';
import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Radio,
  AtSign,
  Video,
  Clock,
  Bell,
  ChevronDown,
  ChevronUp,
  Eye,
  Play,
  Calendar,
  Star,
  Flame,
  Sparkles,
  TrendingUp,
  Award,
  MessageCircle,
  Share2,
  X,
  Check,
  Zap,
  Heart,
} from 'lucide-react';

type RecentActivity = {
  id: string;
  icon: React.ReactNode;
  text: string;
  time: string;
  type: 'friend' | 'collaboration' | 'live' | 'mention' | 'achievement' | 'trending';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  actionable?: boolean;
  avatar?: string;
};

type UpcomingCollaboration = {
  id: string;
  title: string;
  time: string;
  date: string;
  duration: string;
  type: 'live' | 'recorded' | 'workshop' | 'podcast';
  users: { name: string; avatar: string; isOnline: boolean }[];
  viewers?: number;
  status: 'upcoming' | 'starting-soon' | 'live';
  category?: string;
  isPopular?: boolean;
};

interface User {
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

interface UserAvatarProps {
  user: User;
  size?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'w-10 h-10' }) => (
  <div className={`${size} relative group`}>
    <div
      className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white dark:border-gray-800 shadow-lg transition-transform group-hover:scale-110`}
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className={`${size} rounded-full object-cover`} />
      ) : (
        user.name?.charAt(0) || 'U'
      )}
    </div>
    {user.isOnline && (
      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse shadow-lg">
        <div className="w-2 h-2 bg-green-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    )}
  </div>
);

interface ActivityIconProps {
  activity: RecentActivity;
}

const ActivityIcon: React.FC<ActivityIconProps> = ({ activity }) => {
  const iconProps = 'w-5 h-5';
  switch (activity.type) {
    case 'friend':
      return <UserPlus className={`${iconProps} text-blue-500`} />;
    case 'collaboration':
      return <Users className={`${iconProps} text-purple-500`} />;
    case 'live':
      return <Radio className={`${iconProps} text-red-500`} />;
    case 'mention':
      return <AtSign className={`${iconProps} text-green-500`} />;
    case 'achievement':
      return <Award className={`${iconProps} text-yellow-500`} />;
    case 'trending':
      return <TrendingUp className={`${iconProps} text-pink-500`} />;
    default:
      return <Bell className={`${iconProps} text-gray-500`} />;
  }
};

export const RightSidebar: React.FC = () => {
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'friend' | 'collaboration' | 'live'>('all');
  const [dismissedActivities, setDismissedActivities] = useState<Set<string>>(new Set());

  // … your arrays + logic remain unchanged …

  return (
    <aside className="p-4 space-y-6 text-foreground">
      {/* JSX unchanged */}
    </aside>
  );
};
