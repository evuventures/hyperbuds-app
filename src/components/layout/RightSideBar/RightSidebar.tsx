'use client'
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
  MoreVertical,
  Flame,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  X,
  Check,
  Filter,
  Sparkles,
  TrendingUp,
  Award,
  UserCheck
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
  <div className={`${size} relative group`}>
    <div className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white dark:border-gray-800 shadow-lg transition-transform group-hover:scale-110`}>
      {user.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name}
          className={`${size} rounded-full object-cover`}
        />
      ) : (
        user.name?.charAt(0) || 'U'
      )}
    </div>
    {user.isOnline && (
      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse shadow-lg">
        <div className="w-2 h-2 bg-green-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    )}
  </div>
);

const ActivityIcon = ({ activity }: { activity: RecentActivity }) => {
  const iconProps = "w-5 h-5";
  
  switch(activity.type) {
    case 'friend': return <UserPlus className={`${iconProps} text-blue-500`} />;
    case 'collaboration': return <Users className={`${iconProps} text-purple-500`} />;
    case 'live': return <Radio className={`${iconProps} text-red-500`} />;
    case 'mention': return <AtSign className={`${iconProps} text-green-500`} />;
    case 'achievement': return <Award className={`${iconProps} text-yellow-500`} />;
    case 'trending': return <TrendingUp className={`${iconProps} text-pink-500`} />;
    default: return <Bell className={`${iconProps} text-gray-500`} />;
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
    switch(priority) {
      case 'high': return 'border-l-red-400 dark:border-l-red-500';
      case 'medium': return 'border-l-yellow-400 dark:border-l-yellow-500';
      case 'low': return 'border-l-green-400 dark:border-l-green-500';
      default: return 'border-l-gray-300 dark:border-l-gray-600';
    }
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
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
    switch(type) {
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
      <div className="relative overflow-hidden rounded-3xl shadow-xl group backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse delay-1000"></div>
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-300 text-sm font-medium uppercase tracking-wide">Live Now</span>
              </div>
              <h3 className="text-white font-bold text-xl leading-tight">
                Creator Spotlight:<br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Rising Stars
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Eye size={16} />
              <span className="text-sm font-medium">2.4k</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-white/80 text-sm">+247 others watching</span>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-xl hover:bg-white/30 transition-all flex items-center justify-center gap-2 font-semibold">
              <Play className="w-4 h-4" fill="white" />
              Join Live
            </button>
            <button className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all">
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activities */}
      <div className="bg-white dark:bg-gray-800/50 rounded-3xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-500/20 dark:to-purple-500/20">
              <Bell size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activities</h2>
              {unreadCount > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} new updates</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="friend">Friends</option>
              <option value="collaboration">Collaborations</option>
              <option value="live">Live Sessions</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div 
              key={activity.id}
              className={`group flex items-start gap-4 p-4 rounded-xl border-l-4 transition-all hover:scale-[1.01] cursor-pointer ${
                getActivityPriorityColor(activity.priority)
              } ${
                !activity.isRead 
                  ? 'bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/50 dark:border-blue-500/20 shadow-sm' 
                  : 'bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-600/30'
              }`}
            >
              {activity.avatar ? (
                <UserAvatar user={{ name: 'User', avatar: activity.avatar, isOnline: true }} size="w-12 h-12" />
              ) : (
                <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
                  <ActivityIcon activity={activity} />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${
                  !activity.isRead 
                    ? 'font-semibold text-gray-900 dark:text-gray-100' 
                    : 'font-medium text-gray-700 dark:text-gray-300'
                }`}>
                  {activity.text}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{activity.time}</span>
                  {!activity.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                  {activity.type === 'achievement' && <Sparkles size={12} className="text-yellow-500" />}
                </div>
                
                {/* Action Buttons for Actionable Activities */}
                {activity.actionable && !activity.isRead && (
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleActivityAction(activity, 'accept')}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check size={12} />
                      Accept
                    </button>
                    <button 
                      onClick={() => handleActivityAction(activity, 'decline')}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <X size={12} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => dismissActivity(activity.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {recentActivities.length > 4 && (
          <button 
            onClick={() => setShowAllActivities(!showAllActivities)}
            className="w-full mt-4 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10"
          >
            {showAllActivities ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>View All Activities ({recentActivities.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>

      {/* Enhanced Upcoming Collaborations */}
      <div className="bg-white dark:bg-gray-800/50 rounded-3xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-500/20 dark:to-pink-500/20">
              <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upcoming Sessions</h2>
          </div>
          <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10">
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
                className="group relative p-5 border border-gray-200 dark:border-gray-600/50 rounded-2xl hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer bg-gray-50/50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700/50"
              >
                {/* Popular Badge */}
                {session.isPopular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Flame size={12} />
                    Popular
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(session.type)}
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {session.category || session.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{session.time} • {session.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {session.users.map((user, index) => (
                        <UserAvatar key={index} user={user} size="w-10 h-10" />
                      ))}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {session.users.length} participants
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {session.users.filter(u => u.isOnline).length} online
                      </div>
                    </div>
                  </div>
                  
                  {session.viewers && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">{session.viewers} viewers</span>
                    </div>
                  )}
                </div>

                {/* Enhanced Quick Actions */}
                <div className="flex gap-2">
                  {session.status === 'starting-soon' || session.status === 'live' ? (
                    <>
                      <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                        {session.status === 'live' ? <Radio size={16} /> : <Play size={16} />}
                        {session.status === 'live' ? 'Join Live' : 'Join Session'}
                      </button>
                      <button className="p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                        <Calendar size={16} />
                        Add to Calendar
                      </button>
                      <button className="p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced CTA Button */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5" />
            Discover More Sessions
            <Zap className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Enhanced Quick Stats Dashboard */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950/30 rounded-3xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-500/20 dark:to-blue-500/20">
            <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Today`&apos;`s Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-2xl bg-white/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 transition-transform cursor-pointer shadow-sm">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
              {upcomingCollaborations.filter(c => c.date === 'Today').length}
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Sessions Today
            </div>
          </div>
          
          <div className="text-center p-4 rounded-2xl bg-white/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 transition-transform cursor-pointer shadow-sm">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1">
              {unreadCount}
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              New Updates
            </div>
          </div>
          
          <div className="text-center p-4 rounded-2xl bg-white/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 transition-transform cursor-pointer shadow-sm">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
              {upcomingCollaborations.filter(c => c.status === 'live').length || '0'}
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Live Now
            </div>
          </div>
          
          <div className="text-center p-4 rounded-2xl bg-white/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 transition-transform cursor-pointer shadow-sm">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
              {recentActivities.filter(a => a.type === 'collaboration').length}
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Collaborations
            </div>
          </div>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all shadow-sm">
            <UserPlus size={16} />
            Find Friends
          </button>
          <button className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all shadow-sm">
            <Video size={16} />
            Start Session
          </button>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-gray-800/50 rounded-3xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-500/20 dark:to-orange-500/20">
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
            <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-8 rounded-full bg-gradient-to-b ${
                  topic.color === 'purple' ? 'from-purple-400 to-purple-600' :
                  topic.color === 'blue' ? 'from-blue-400 to-blue-600' :
                  topic.color === 'green' ? 'from-green-400 to-green-600' :
                  'from-pink-400 to-pink-600'
                }`}></div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
        
        <button className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold py-2 text-sm transition-colors">
          Explore All Trends
        </button>
      </div>
    </aside>
  );
};