'use client'
import React, { useState } from 'react';
import Image from 'next/image';
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
  Zap,
  Heart,
  MessageCircle,
  Share2,
  X,
  Check,
  
  Sparkles,
  TrendingUp,
  Award,
  
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

type User = { name: string; avatar: string; isOnline: boolean };

type UpcomingCollaboration = {
  id: string;
  title: string;
  time: string;
  date: string;
  duration: string;
  type: 'live' | 'recorded' | 'workshop' | 'podcast';
  users: User[];
  viewers?: number;
  status: 'upcoming' | 'starting-soon' | 'live';
  category?: string;
  isPopular?: boolean;
};

type UserAvatarProps = {
  user: User;
  size?: string;
};

const UserAvatar = ({ user, size = "w-10 h-10" }: UserAvatarProps) => (
  <div className={`relative ${size} group`}>
    <div className={`flex justify-center items-center text-sm font-bold text-white bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white shadow-lg transition-transform ${size} dark:border-gray-800 group-hover:scale-110`}>
      {user.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name}
          width={40}
            height={40}
          className={`object-cover rounded-full ${size}`}
        />
      ) : (
        user.name?.charAt(0) || 'U'
      )}
    </div>
    {user.isOnline && (
      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse shadow-lg">
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    )}
  </div>
);

const ActivityIcon = ({ activity }: { activity: RecentActivity }) => {
  const iconProps = "w-5 h-5";

  switch (activity.type) {
    case 'friend': return <UserPlus className={`text-blue-500 ${iconProps}`} />;
    case 'collaboration': return <Users className={`text-purple-500 ${iconProps}`} />;
    case 'live': return <Radio className={`text-red-500 ${iconProps}`} />;
    case 'mention': return <AtSign className={`text-green-500 ${iconProps}`} />;
    case 'achievement': return <Award className={`text-yellow-500 ${iconProps}`} />;
    case 'trending': return <TrendingUp className={`text-pink-500 ${iconProps}`} />;
    default: return <Bell className={`text-gray-500 ${iconProps}`} />;
  }
};

export const RightSidebar = () => {
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [dismissedActivities, setDismissedActivities] = useState(new Set<string>());

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      icon: <UserPlus className="w-5 h-5 text-blue-500" />,
      text: 'Sarah Chen sent you a friend request',
      time: '2m ago',
      type: 'friend',
      priority: 'medium',
      isRead: false,
      actionable: true,
      avatar: '/images/icons-dashboard/i-user.jpg'
    },
    {
      id: '2',
      icon: <Users className="w-5 h-5 text-purple-500" />,
      text: 'New collaboration invitation from Alex Rodriguez',
      time: '15m ago',
      type: 'collaboration',
      priority: 'high',
      isRead: false,
      actionable: true,
      avatar: '/images/icons-dashboard/user2.jpg'
    },
    {
      id: '3',
      icon: <Radio className="w-5 h-5 text-red-500" />,
      text: 'Kofowora started a live session "Creative Vibes"',
      time: '1h ago',
      type: 'live',
      priority: 'high',
      isRead: true,
      avatar: '/images/icons-dashboard/i-user.jpg'
    },
    {
      id: '4',
      icon: <Award className="w-5 h-5 text-yellow-500" />,
      text: 'You earned the "Top Creator" badge!',
      time: '2h ago',
      type: 'achievement',
      priority: 'medium',
      isRead: false
    },
    {
      id: '5',
      icon: <TrendingUp className="w-5 h-5 text-pink-500" />,
      text: 'Your content is trending in #MusicProduction',
      time: '3h ago',
      type: 'trending',
      priority: 'medium',
      isRead: true
    },
    {
      id: '6',
      icon: <AtSign className="w-5 h-5 text-green-500" />,
      text: 'Mike Johnson tagged you in a collaboration post',
      time: '4h ago',
      type: 'mention',
      priority: 'low',
      isRead: true,
      avatar: '/images/icons-dashboard/user2.jpg'
    },
  ];

  const upcomingCollaborations: UpcomingCollaboration[] = [
    {
      id: '1',
      title: 'Live Jam Session & Community Q&A',
      time: '2:00 PM',
      date: 'Today',
      duration: '2h',
      type: 'live',
      category: 'Music',
      users: [
        { name: 'Sam Wilson', avatar: '/images/icons-dashboard/i-user.jpg', isOnline: true },
        { name: 'Larry Kim', avatar: '/images/icons-dashboard/user2.jpg', isOnline: false }
      ],
      viewers: 156,
      status: 'starting-soon',
      isPopular: true
    },
    {
      id: '2',
      title: 'Podcast Recording: "Creator Economy Insights"',
      time: '4:00 PM',
      date: 'Tomorrow',
      duration: '1.5h',
      type: 'podcast',
      category: 'Business',
      users: [
        { name: 'Alex Rivera', avatar: '/images/icons-dashboard/i-user.jpg', isOnline: true },
        { name: 'Jordan Smith', avatar: '/images/icons-dashboard/user2.jpg', isOnline: true }
      ],
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Advanced Creative Workshop',
      time: '6:00 PM',
      date: 'Friday',
      duration: '3h',
      type: 'workshop',
      category: 'Design',
      users: [
        { name: 'Emma Davis', avatar: '/images/icons-dashboard/i-user.jpg', isOnline: false },
        { name: 'Chris Taylor', avatar: '/images/icons-dashboard/user2.jpg', isOnline: true }
      ],
      status: 'upcoming',
      isPopular: true
    },
  ];

  const getActivityPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-400 dark:border-l-red-500';
      case 'medium': return 'border-l-yellow-400 dark:border-l-yellow-500';
      case 'low': return 'border-l-green-400 dark:border-l-green-500';
      default: return 'border-l-gray-300 dark:border-l-gray-600';
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'live':
        return {
          bg: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30',
          icon: <Radio size={12} className="animate-pulse" />
        };
      case 'starting-soon':
        return {
          bg: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
          icon: <Clock size={12} />
        };
      case 'upcoming':
        return {
          bg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
          icon: <Calendar size={12} />
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500/30',
          icon: <Clock size={12} />
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'live': return <Radio size={16} className="text-red-500" />;
      case 'podcast': return <MessageCircle size={16} className="text-green-500" />;
      case 'workshop': return <Star size={16} className="text-purple-500" />;
      default: return <Video size={16} className="text-blue-500" />;
    }
  };

  const filteredActivities = recentActivities
    .filter(activity => !dismissedActivities.has(activity.id))
    .filter(activity => activityFilter === 'all' || activity.type === activityFilter)
    .slice(0, showAllActivities ? 10 : 4);

  const unreadCount = recentActivities.filter(activity => !activity.isRead && !dismissedActivities.has(activity.id)).length;

  const dismissActivity = (activityId: string) => {
    setDismissedActivities(prev => new Set([...prev, activityId]));
  };

  const handleActivityAction = (activity: RecentActivity, action: 'accept' | 'decline') => {
    // Handle activity actions (accept friend request, join collaboration, etc.)
    console.log(`${action} activity:`, activity.id);
    if (action === 'accept') {
      dismissActivity(activity.id);
    }
  };

  return (
    <aside className="p-4 space-y-6 text-foreground">
      {/* Enhanced Featured Content Card */}
      <div className="overflow-hidden relative rounded-3xl shadow-xl backdrop-blur-sm group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent from-black/40"></div>

        {/* Animated Background Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full blur-xl animate-pulse bg-white/10"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full blur-lg delay-1000 animate-pulse bg-white/5"></div>

        <div className="relative p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-wide text-red-300 uppercase">
                  Live Now
                </span>
              </div>
              <h3 className="text-xl font-bold leading-tight text-white">
                Creator Spotlight:<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  Rising Stars
                </span>
              </h3>
            </div>
            <div className="flex gap-2 items-center text-white/80">
              <Eye size={16} />
              <span className="text-sm font-medium">2.4k</span>
            </div>
          </div>

          <div className="flex gap-3 items-center mb-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-center items-center w-8 h-8 text-xs font-bold text-white bg-gradient-to-br rounded-full border-2 from-white/20 to-white/10 border-white/30">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm text-white/80">+247 others watching</span>
          </div>

          <div className="flex gap-2">
            <button className="flex flex-1 gap-2 justify-center items-center px-4 py-3 font-semibold text-white rounded-xl backdrop-blur-sm transition-all cursor-pointer bg-white/20 hover:bg-white/30">
              <Play className="w-4 h-4" fill="white" />
              Join Live
            </button>
            <button className="p-3 text-white rounded-xl backdrop-blur-sm transition-all cursor-pointer bg-white/10 hover:bg-white/20">
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="p-5 bg-white rounded-3xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
        <div className="flex flex-col gap-2 items-start mb-6">
          <div className="flex flex-col gap-2 items-start">
            <div className='flex gap-3 items-center'>
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl dark:from-blue-500/20 dark:to-purple-500/20">
                <Bell size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Recent Activities
                </h2>
              </div>
            </div>

            {/* filter */}
            <div className="flex justify-between items-center w-full">
              {unreadCount > 0 && (
                <div className="flex gap-2 items-center mt-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {unreadCount}new updates
                  </span>
                </div>
              )}
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="px-3 py-2 w-20 text-sm text-gray-700 bg-gray-100 rounded-lg border border-gray-200 cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All</option>
                <option value="friend">Friends</option>
                <option value="collaboration">Collaborations</option>
                <option value="live">Live Sessions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests */}
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`group cursor-pointer flex flex-col items-start gap-4 p-4 rounded-xl border-l-4 transition-all hover:scale-[1.01] ${getActivityPriorityColor(activity.priority)
                } ${!activity.isRead
                  ? 'bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/50 dark:border-blue-500/20 shadow-sm'
                  : 'bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-600/30'
                }`}>

              <div className='flex justify-between items-start w-full'>
                {activity.avatar ? (
                  <UserAvatar user={{ name: 'User', avatar: activity.avatar, isOnline: true }} size="w-12 h-12" />
                ) : (
                  <div className="flex-shrink-0 p-3 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-700 dark:border-gray-600">
                    <ActivityIcon activity={activity} />
                  </div>
                )}

                <button
                  onClick={() => dismissActivity(activity.id)}
                  className="p-1 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={15} className='cursor-pointer' />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${!activity.isRead
                  ? 'font-semibold text-gray-900 dark:text-gray-100'
                  : 'font-medium text-gray-700 dark:text-gray-300'
                  }`}>
                  {activity.text}
                </p>
                <div className="flex gap-3 items-center mt-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                  {!activity.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse">
                  </div>}
                  {activity.type === 'achievement' && <Sparkles size={12} className="text-yellow-500" />}
                </div>
              </div>

              {/* Action Buttons for Actionable Activities */}
              <div className='flex justify-center items-center w-full'>
                {activity.actionable && !activity.isRead && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleActivityAction(activity, 'accept')}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleActivityAction(activity, 'decline')}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X size={12} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {recentActivities.length > 4 && (
          <button
            onClick={() => setShowAllActivities(!showAllActivities)}
            className="flex gap-2 justify-center items-center py-2 mt-4 w-full text-sm font-semibold text-blue-600 rounded-lg transition-colors cursor-pointer dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10"
          >
            {showAllActivities ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>View All Activities ({recentActivities.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>

      {/*  Upcoming Collaborations */}
      <div className="p-5 bg-white rounded-3xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">

        <div className="flex flex-col items-center mb-6">

          <div className="flex justify-between items-center w-full">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl dark:from-purple-500/20 dark:to-pink-500/20">
              <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Upcoming Sessions
            </h2>
          </div>

          <button className="flex gap-2 items-center px-3 py-2 text-sm font-semibold text-blue-600 rounded-lg transition-colors cursor-pointer dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10">
            <Calendar className="w-4 h-4" />
            View Calendar
          </button>

        </div>

        <div className="space-y-4">
          {upcomingCollaborations.map((session) => {
            const statusConfig = getStatusConfig(session.status);
            return (
              <div
                key={session.id}
                className="relative p-5 rounded-2xl border border-gray-200 transition-all cursor-pointer group dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-lg bg-gray-50/50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700/50"
              >
                {/* Popular Badge */}
                {session.isPopular && (
                  <div className="flex absolute -top-2 -right-2 gap-1 items-center px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg">
                    <Flame size={12} />
                    Popular
                  </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-3 justify-between items-start mb-4">

                  <div className="flex-1 space-y-4">

                    <div className="flex gap-2 items-center">
                      {getTypeIcon(session.type)}
                      <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        {session.category || session.type}
                      </span>
                    </div>

                    <h3 className="font-bold leading-tight text-gray-900 transition-colors dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {session.title}
                    </h3>

                    <div className="flex gap-4 items-center text-sm text-gray-600 dark:text-gray-400">

                      <div className="flex gap-1 items-center">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{session.time} • {session.date}</span>
                      </div>

                      <div className="flex gap-1 items-center">
                        <Video className="w-4 h-4" />
                        <span>{session.duration}</span>
                      </div>

                    </div>

                  </div>

                  <div className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 ${statusConfig.bg}`}>
                    {statusConfig.icon}
                    {session.status === 'starting-soon' ? 'Starting Soon' :
                      session.status === 'live' ? 'LIVE' : 'Upcoming'}
                  </div>

                </div>

                {/* Participants and Stats */}
                <div className="flex flex-col gap-3 items-start mb-4">

                  <div className="flex gap-3 justify-between items-center w-full">

                    <div className="flex -space-x-3">
                      {session.users.map((user, index) => (
                        <UserAvatar key={index} user={user} size="w-10 h-10" />
                      ))}
                    </div>




                    {session.viewers && (
                      <div className="flex gap-2 items-center text-gray-600 dark:text-gray-400">
                        <span className="text-sm font-medium">{session.viewers} viewers</span>
                        <Eye className="w-4 h-4" />
                      </div>
                    )}

                  </div>

                  <div className="flex gap-3 justify-between items-center mt-2 w-full text-sm">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {session.users.length} participants
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {session.users.filter(u => u.isOnline).length} online
                    </div>
                  </div>


                </div>

                {/* Enhanced Quick Actions */}
                <div className="flex gap-2">
                  {session.status === 'starting-soon' || session.status === 'live' ? (
                    <>
                      <button className="flex flex-1 gap-2 justify-center items-center px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg transition-all transform cursor-pointer hover:from-blue-600 hover:to-purple-600 hover:scale-105">
                        {session.status === 'live' ? <Radio size={16} /> : <Play size={16} />}
                        {session.status === 'live' ? 'Join Live' : 'Join Session'}
                      </button>
                      <button className="p-3 rounded-xl border border-gray-200 transition-colors cursor-pointer dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex flex-1 gap-2 justify-center items-center px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl transition-all cursor-pointer dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300">
                        <Calendar size={16} />
                        Add to Calendar
                      </button>
                      <button className="p-3 rounded-xl border border-gray-200 transition-colors cursor-pointer dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Share2 className="w-6 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced CTA Button */}
        <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer">
            <Sparkles className="w-5 h-5" />
            Discover More Sessions
            <Zap className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Enhanced Quick Stats Dashboard */}
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white rounded-3xl border shadow-lg backdrop-blur-sm to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950/30 border-gray-200/60 dark:border-gray-700/60">
        <div className="flex gap-3 items-center mb-6">
          <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl dark:from-green-500/20 dark:to-blue-500/20">
            <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Today&apos;s Summary</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 text-center rounded-2xl border shadow-sm transition-transform cursor-pointer bg-white/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:scale-105">
            <div className="mb-1 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {upcomingCollaborations.filter(c => c.date === 'Today').length}
            </div>
            <div className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
              Sessions Today
            </div>
          </div>

          <div className="p-4 text-center rounded-2xl border shadow-sm transition-transform cursor-pointer bg-white/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:scale-105">
            <div className="mb-1 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              {unreadCount}
            </div>
            <div className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
              New Updates
            </div>
          </div>

          <div className="p-4 text-center rounded-2xl border shadow-sm transition-transform cursor-pointer bg-white/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:scale-105">
            <div className="mb-1 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {upcomingCollaborations.filter(c => c.status === 'live').length || '0'}
            </div>
            <div className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
              Live Now <br />
              <span className='text-xs font-semibold text-gray-400 lowercase dark:text-gray-400'>Coming Soon</span>
            </div>
          </div>

          <div className="p-4 text-center rounded-2xl border shadow-sm transition-transform cursor-pointer bg-white/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:scale-105">
            <div className="mb-1 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              {recentActivities.filter(a => a.type === 'collaboration').length}
            </div>
            <div className="text-xs font-semibold text-gray-600 uppercase break-words dark:text-gray-400">
              Collaborations
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex justify-center mt-6">
          <button className="flex gap-2 justify-center items-center px-4 py-3 font-semibold text-gray-700 bg-white rounded-xl border border-gray-200 shadow-sm transition-all cursor-pointer dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500">
            <UserPlus size={16} />
            Find Friends
          </button>
        </div>

      </div>

      {/* Trending Topics */}
      <div className="p-6 bg-white rounded-3xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
        <div className="flex gap-3 items-center mb-6">
          <div className="p-2 bg-gradient-to-br from-pink-100 to-orange-100 rounded-xl dark:from-pink-500/20 dark:to-orange-500/20">
            <Flame size={20} className="text-pink-600 dark:text-pink-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Trending Now</h3>
        </div>

        <div className="space-y-3">
          {[
            { tag: '#MusicProduction', posts: '2.4k', trend: '+24%', color: 'purple' },
            { tag: '#CreatorTips', posts: '1.8k', trend: '+18%', color: 'blue' },
            { tag: '#LiveStreaming', posts: '1.2k', trend: '+15%', color: 'green' },
            { tag: '#Collaboration', posts: '986', trend: '+12%', color: 'pink' }
          ].map((topic, index) => (
            <div key={index} className="flex justify-between items-center p-3 rounded-xl transition-colors cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/30 group">
              <div className="flex gap-3 items-center">
                <div className={`w-3 h-8 rounded-full bg-gradient-to-b ${topic.color === 'purple' ? 'from-purple-400 to-purple-600' :
                  topic.color === 'blue' ? 'from-blue-400 to-blue-600' :
                    topic.color === 'green' ? 'from-green-400 to-green-600' :
                      'from-pink-400 to-pink-600'
                  }`}></div>
                <div>
                  <div className="font-semibold text-gray-900 transition-colors dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {topic.tag}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {topic.posts} posts
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                  {topic.trend}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  growth
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="py-2 mt-4 w-full text-sm font-semibold text-blue-600 transition-colors dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
          Explore All Trends
        </button>
      </div>
    </aside>
  );
};