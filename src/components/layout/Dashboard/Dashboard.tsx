'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header/Header';
import { AppSidebar } from '../Sidebar/AppSidebar';
import { Menu, X, Moon, Sun, Bell, House, Newspaper, Film, MessageCircle, type LucideIcon } from 'lucide-react';
import { ThemeProvider, useTheme } from '@/context/Theme';
import { useSidebar } from '@/context/SidebarContext';

//  Standardized API and State Imports
import { getCurrentUser, User } from '@/lib/api/auth.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setToken, setUser as setUserAction } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/auth/useAuth';
import Image from 'next/image';
import { MotionConfig } from 'framer-motion';

interface UserProfile {
  stats: {
    followers: number;
    engagementRate: number;
    activityLevel: number;
  };
  preferences: {
    engagementRange: {
      min: number;
      max: number;
    };
    minRizzScore: number;
    preferredNiches: string[];
    collabType: string[];
    locationPreference: string;
  };
  subscription: {
    tier: string;
    cancelAtPeriodEnd: boolean;
  };
  paymentPreferences: {
    currency: string;
    autoPayoutEnabled: boolean;
    autoPayoutThreshold: number;
    payoutSchedule: string;
  };
  earnings: {
    totalEarned: number;
    availableBalance: number;
    pendingPayouts: number;
  };
  accountStatus: {
    payoutsEnabled: boolean;
    paymentMethodsEnabled: boolean;
    accountRestricted: boolean;
  };
  notificationPreferences: {
    paymentReceived: boolean;
    payoutProcessed: boolean;
    subscriptionChanges: boolean;
    paymentFailed: boolean;
  };
  _id: string;
  email: string;
  isVerified: boolean;
  role: string;
  niche: string[];
  rizzScore: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  subscriptionStatus: string;
  formattedEarnings: {
    totalEarned: string;
    availableBalance: string;
    pendingPayouts: string;
  };
  id: string;
  profile: {
    stats: {
      platformBreakdown: {
        tiktok: {
          followers: number;
          engagement: number;
        };
        instagram: {
          followers: number;
          engagement: number;
        };
        youtube: {
          followers: number;
          engagement: number;
        };
        twitch: {
          followers: number;
          engagement: number;
        };
      };
      totalFollowers: number;
      avgEngagement: number;
    };
    preferences: {
      audienceSize: {
        min: number;
        max: number;
      };
      budget: {
        min: number;
        max: number;
      };
      collaborationTypes: string[];
      niches: string[];
      minRizzScore: number;
      maxDistance: number;
      locations: string[];
    };
    _id: string;
    userId: string;
    username: string;
    displayName: string;
    bio: string;
    avatar: string;
    niche: string[];
    rizzScore: number;
    isPublic: boolean;
    isActive: boolean;
    location: {
      type: string;
      coordinates: [number, number];
      country: string;
      city: string;
      state: string;
    };
    lastSeen: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    profileUrl: string;
    id: string;
  };
}

const MOBILE_QUICK_NAV: Array<{
  label: string;
  href: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
}> = [
  { label: 'Home', href: '/dashboard', icon: House, match: (p) => p === '/' || p === '/dashboard' },
  { label: 'Posts', href: '/feed', icon: Newspaper, match: (p) => p.startsWith('/feed') },
  { label: 'Reels', href: '/reels', icon: Film, match: (p) => p.startsWith('/reels') },
  { label: 'Messages', href: '/messages', icon: MessageCircle, match: (p) => p.startsWith('/messages') },
];

// Mobile Header Buttons Component
function MobileHeaderButtons({ user }: { user: User | null }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user: authenticatedUser } = useAuth();

  useEffect(() => {
    if (authenticatedUser) {
      setProfile(authenticatedUser as UserProfile);
    }
  }, [authenticatedUser])


  const avatarUrl = profile?.profile?.avatar || (profile as unknown as { avatar?: string })?.avatar || user?.avatar;
  const hasValidAvatar = Boolean(avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '');
  const displayName = profile?.profile?.displayName || profile?.profile?.username || (profile as unknown as { displayName?: string })?.displayName || (profile as unknown as { username?: string })?.username || user?.displayName || user?.username || profile?.email || user?.email || 'User';
  const initial = displayName?.[0]?.toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/notifications"
        className="relative rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
      </Link>

      <button
        type="button"
        onClick={toggleDarkMode}
        className="rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      <Link
        href="/profile"
        aria-label="Profile"
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-2 ring-white/50"
      >
        <span className="text-xs font-bold text-white">
          {hasValidAvatar ? (
            <Image src={avatarUrl as string} alt="User avatar" width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>
      </Link>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  //  Initialize Redux hooks
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { token, user: reduxUser } = useAppSelector((state) => state.auth);

  const router = useRouter();
  const navigationRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [user, setUser] = useState<User | null>((reduxUser as User) || null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMounted, setIsMounted] = useState(false);

  const {
    sidebarCollapsed,
    sidebarOpen,
    isInitialized: sidebarInitialized,
    setSidebarOpen,
    toggleSidebarCollapse,
    toggleSidebarOpen,
  } = useSidebar();

  useEffect(() => {
    if (!sidebarOpen || window.matchMedia('(min-width: 1024px)').matches) return;
    const panel = navigationRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])
      .filter(element => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
    const focusFrame = requestAnimationFrame(() => focusable()[0]?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setSidebarOpen(false); }
      if (event.key === 'Tab') {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { cancelAnimationFrame(focusFrame); document.removeEventListener('keydown', onKeyDown); menuButtonRef.current?.focus(); };
  }, [sidebarOpen, setSidebarOpen]);

  // Handle Initial Mount to prevent Hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const initAuthAndFetch = async () => {
      // Hydrate Redux Token from LocalStorage for apiClient
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      if (!savedToken && !token) {
        router.push("/auth/signin");
        return;
      }
      if (savedToken && !token) {
        dispatch(setToken(savedToken));
      }

      try {
        //  Fetch user using the standardized getCurrentUser
        const data = await getCurrentUser();

        //  Profile Completion Check
        const profile = data?.profile;
        const isProfileIncomplete =
          !profile?.username ||
          profile.username === "" ||
          !profile?.bio ||
          profile.bio === "" ||
          !profile?.niche ||
          (Array.isArray(profile.niche) && profile.niche.length === 0);

        const hasSkipped =
          typeof window !== "undefined" &&
          sessionStorage.getItem("skipped_profile_completion") === "true";

        if (isProfileIncomplete && !hasSkipped) {
          router.push("/profile/complete-profile");
          return;
        }

        //  ensure 'email' and 'id' are valid strings
        const userData: User = {
          ...data.user,
          email: data.user?.email || "",
          id: data.user?.id || data.user?._id || "",
          profile: data.profile,
        };

        //Update state and Redux
        setUser(userData);
        dispatch(setUserAction(userData));

      } catch (err) {
        console.warn("Dashboard user fetch notice:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      initAuthAndFetch();
    }
  }, [isMounted, router, dispatch, token, pathname]);

  useEffect(() => {
    if (!user && reduxUser) {
      setUser(reduxUser as User);
    }
  }, [reduxUser, user]);

  if (!isMounted) return null;

  const savedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (!savedToken && !token && pathname !== '/') {
    return null;
  }

  const safeUser = (user || {}) as User;

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
      <div className="hb-shell flex flex-col overflow-hidden h-dvh">
        <a className="hb-skip-link" href="#main-content">Skip to content</a>

        {/* Mobile Brand Header + Top Floating Pill Nav */}
        <header
          data-testid="mobile-brand-header"
          className="relative z-50 shrink-0 bg-linear-to-r from-purple-700 via-[#6D28D9] to-purple-800 shadow-[0_12px_28px_-10px_rgba(88,28,135,0.65)] lg:hidden"
        >
          <div className="flex items-center justify-between px-4 pb-1.5 pt-2.5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
                <Image
                  src="/images/logo.png"
                  alt="Hyperbuds Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              </span>
              <h1 className="text-lg font-extrabold tracking-tight text-white">
                HyperBuds
              </h1>
            </Link>
            <MobileHeaderButtons user={user} />
          </div>

          <div className="px-3 pb-3 pt-1">
            <nav
              aria-label="Mobile quick navigation"
              className="relative flex items-center justify-between gap-1 rounded-full bg-white p-1.5 shadow-lg dark:bg-slate-900 dark:ring-1 dark:ring-white/10"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 rounded-[2px] bg-white dark:bg-slate-900"
              />

              {MOBILE_QUICK_NAV.map((item) => {
                const active = item.match(pathname || '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center justify-center gap-1.5 rounded-full transition-all duration-200 ${
                      active
                        ? 'bg-purple-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm'
                        : 'p-2.5 text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/60'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {active && <span>{item.label}</span>}
                  </Link>
                );
              })}

              <button
                ref={menuButtonRef}
                type="button"
                data-testid="mobile-sidebar-trigger"
                onClick={toggleSidebarOpen}
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                className={`flex items-center justify-center rounded-full p-2.5 transition ${
                  sidebarOpen
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/60'
                }`}
              >
                <Menu className="h-[18px] w-[18px]" />
              </button>
            </nav>
          </div>
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:block">

          <Header
            user={safeUser as unknown as { id: string; name: string; email: string; avatar?: string }}
            onMenuClick={toggleSidebarOpen}
          />
        </div>

        {/* Main Dashboard Container */}
        <div className="flex min-h-0 flex-1">
          {/* Desktop fixed left rail + Mobile dropdown drawer from the 3-bar top button */}
          <div
            ref={navigationRef}
            className={`
              fixed inset-x-3 top-[112px] bottom-3 z-40 transform transition-[transform,opacity] duration-200 ease-out
              lg:static lg:inset-auto lg:bottom-auto lg:top-auto lg:z-auto lg:translate-y-0 lg:opacity-100 lg:shrink-0
              ${
                sidebarOpen
                  ? 'visible translate-y-0 opacity-100'
                  : 'pointer-events-none invisible -translate-y-3 opacity-0 lg:pointer-events-auto lg:visible lg:translate-y-0 lg:opacity-100'
              }
              ${sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-[288px]'}
            `}
          >
            <div className="relative h-full overflow-hidden rounded-3xl shadow-2xl transition-colors duration-200 lg:rounded-none lg:shadow-none">
              <div className="absolute right-4 top-4 z-10 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-xl bg-white/90 p-2 text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:ring-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="h-full overflow-hidden">
                <AppSidebar
                  user={safeUser}
                  showBrand
                  mobileCompact
                  onNavigate={() => setSidebarOpen(false)}
                  className="p-0! lg:hidden"
                />
                <AppSidebar
                  user={safeUser}
                  collapsed={sidebarCollapsed}
                  onToggleCollapse={toggleSidebarCollapse}
                  className="hidden lg:flex"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full min-w-0 h-full">
            <div className="flex h-full">
              <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden transition-colors duration-200">
                <div className="w-full h-full">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 backdrop-blur-sm transition-opacity duration-300 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
      </MotionConfig>
    </ThemeProvider>
  );
}