'use client';

import React, { useId } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  Heart,
  House,
  Layers,
  LogOut,
  Megaphone,
  MessageCircle,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Radio,
  Settings,
  ShieldAlert,
  ShoppingBag,
  User2,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSidebarAppearance, type SidebarAppearance } from '@/hooks/useSidebarAppearance';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
}

export const NAV_SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Main',
    items: [
      { label: 'Home', href: '/dashboard', icon: House, match: (p) => p === '/' || p === '/dashboard' },
      { label: 'Profile', href: '/profile', icon: User2, match: (p) => p.startsWith('/profile') },
      { label: 'Matching', href: '/ai-matches', icon: Heart, match: (p) => p.startsWith('/ai-matches') || p.startsWith('/matching') },
      { label: 'Collaborations', href: '/collaborations', icon: Layers, match: (p) => p.startsWith('/collaborations') },
      { label: 'Live Studio', href: '/streaming', icon: Radio, match: (p) => p.startsWith('/streaming') },
    ],
  },
  {
    title: 'Business',
    items: [
      { label: 'Startup & Talent Hub', href: '/startup-talent', icon: BriefcaseBusiness, match: (p) => p.startsWith('/startup-talent') },
      { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag, match: (p) => p === '/marketplace' || (p.startsWith('/marketplace/') && !p.startsWith('/marketplace/gear')) },
      { label: 'Gear Hub', href: '/marketplace/gear', icon: Package, match: (p) => p.startsWith('/marketplace/gear') },
      { label: 'Sponsorships', href: '/sponsorships', icon: Megaphone, match: (p) => p.startsWith('/sponsorships') },
      { label: 'Analytics', href: '/analytics', icon: BarChart3, match: (p) => p.startsWith('/analytics') },
      { label: 'Moderation & Copyright', href: '/moderation', icon: ShieldAlert, match: (p) => p.startsWith('/moderation') },
    ],
  },
  {
    title: 'Communication',
    items: [{ label: 'Messages', href: '/messages', icon: MessageCircle, match: (p) => p.startsWith('/messages') }],
  },
];

const SHORTCUTS: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: 'New Collaboration', href: '/collaborations#new-collaboration', icon: PlusCircle },
  { label: 'Wallet & Credits', href: '/payments/wallet', icon: Wallet },
  { label: 'Subscription', href: '/payments/subscription', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: Settings },
];

/* ------------------------------------------------------------------ Theme tokens */

interface SidebarTheme {
  panel: string;
  title: string;
  muted: string;
  label: string;
  link: string;
  active: string;
  divider: string;
  card: string;
  chip: string;
  iconTile: string;
  iconBtn: string;
  segTrack: string;
  segActive: string;
  segIdle: string;
  signOut: string;
}

const THEMES: Record<SidebarAppearance, SidebarTheme> = {
  brand: {
    panel:
      'border border-purple-500/30 bg-linear-to-b from-purple-700 via-[#6D28D9] to-[#4C1D95] text-white shadow-[0_24px_48px_-24px_rgba(88,28,135,0.75)]',
    title: 'text-white',
    muted: 'text-purple-100/75',
    label: 'text-purple-100/60',
    link: 'text-purple-50/90 hover:bg-white/10 hover:text-white',
    active: 'bg-white/[0.16] text-white ring-1 ring-white/25 shadow-sm',
    divider: 'border-white/15',
    card: 'border border-white/10 bg-white/10',
    chip: 'bg-white/15 text-white',
    iconTile: 'bg-white/15 text-white',
    iconBtn: 'text-purple-100 hover:bg-white/10 hover:text-white',
    segTrack: 'bg-black/20',
    segActive: 'bg-white text-purple-800 shadow',
    segIdle: 'text-purple-100/80 hover:text-white',
    signOut: 'text-purple-50 hover:bg-white/10',
  },
  classic: {
    panel: 'border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100',
    title: 'text-slate-950 dark:text-white',
    muted: 'text-slate-500 dark:text-slate-400',
    label: 'text-slate-400',
    link: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    active: 'bg-purple-700 text-white shadow-sm dark:bg-purple-600',
    divider: 'border-slate-100 dark:border-slate-800',
    card: 'border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60',
    chip: 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    iconTile: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    iconBtn: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
    segTrack: 'bg-slate-100 dark:bg-slate-800',
    segActive: 'bg-purple-700 text-white shadow dark:bg-purple-600',
    segIdle: 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white',
    signOut: 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40',
  },
  glass: {
    panel:
      'border border-white/60 bg-white/45 text-slate-800 shadow-[0_12px_40px_-12px_rgba(76,29,149,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/45 dark:text-slate-100',
    title: 'text-slate-950 dark:text-white',
    muted: 'text-slate-600 dark:text-slate-300',
    label: 'text-purple-900/50 dark:text-purple-200/60',
    link: 'text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10',
    active: 'bg-purple-700/90 text-white shadow-md shadow-purple-900/20 dark:bg-purple-500/80',
    divider: 'border-white/70 dark:border-white/10',
    card: 'border border-white/70 bg-white/50 dark:border-white/10 dark:bg-white/5',
    chip: 'bg-white/70 text-purple-800 dark:bg-white/10 dark:text-purple-100',
    iconTile: 'bg-white/70 text-purple-700 dark:bg-white/10 dark:text-purple-200',
    iconBtn: 'text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10',
    segTrack: 'bg-white/50 ring-1 ring-white/70 dark:bg-white/5 dark:ring-white/10',
    segActive: 'bg-purple-700 text-white shadow dark:bg-purple-500',
    segIdle: 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
    signOut: 'text-rose-600 hover:bg-white/60 dark:text-rose-300 dark:hover:bg-white/10',
  },
};

const APPEARANCE_OPTIONS: Array<{ value: SidebarAppearance; label: string; swatch: string }> = [
  { value: 'brand', label: 'Purple', swatch: 'bg-linear-to-br from-purple-600 to-violet-800' },
  { value: 'classic', label: 'Normal', swatch: 'bg-white ring-1 ring-slate-300' },
  { value: 'glass', label: 'Glass', swatch: 'bg-linear-to-br from-white/90 to-purple-200/70 ring-1 ring-purple-200' },
];

/* ------------------------------------------------------------------ Helpers */

interface AuthUserShape {
  email?: string;
  avatar?: string;
  displayName?: string;
  username?: string;
  isVerified?: boolean;
  rizzScore?: number;
  niche?: string[];
  profile?: {
    avatar?: string;
    displayName?: string;
    username?: string;
    rizzScore?: number;
    niche?: string[];
    stats?: { totalFollowers?: number };
  };
}

const MOBILE_PRIMARY_PILL_HREFS = new Set(['/dashboard', '/feed', '/reels', '/messages']);

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  className?: string;
  user?: unknown;
  /** Show the HyperBuds wordmark at the top (used in the mobile dropdown drawer). */
  showBrand?: boolean;
  /** Trim duplicate mobile top-pill routes and heavy desktop metrics inside mobile dropdown. */
  mobileCompact?: boolean;
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const compactNumber = (n: number) =>
  new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);

function GlassBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      <div className="absolute -left-10 top-6 h-48 w-48 rounded-full bg-purple-500/35 blur-3xl" />
      <div className="absolute -right-8 top-1/3 h-44 w-44 rounded-full bg-fuchsia-400/30 blur-3xl" />
      <div className="absolute bottom-10 left-6 h-40 w-40 rounded-full bg-violet-400/30 blur-3xl" />
    </div>
  );
}

/* ------------------------------------------------------------------ Component */

export function AppSidebar({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  className = '',
  user,
  showBrand = false,
  mobileCompact = false,
}: AppSidebarProps) {
  const styleLabelId = useId();
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { logout, user: authUser } = useAuth();
  const { appearance, setAppearance } = useSidebarAppearance();
  const t = THEMES[appearance];

  const visibleSections = mobileCompact
    ? NAV_SECTIONS.map((section) => ({
        ...section,
        title: section.title === 'Main' ? 'More Content' : section.title,
        items: section.items.filter((item) => !MOBILE_PRIMARY_PILL_HREFS.has(item.href)),
      })).filter((section) => section.items.length > 0)
    : NAV_SECTIONS;

  const u = (authUser || user || {}) as AuthUserShape;
  const p = u.profile || {};
  const displayName = p.displayName || u.displayName || p.username || u.username || u.email || 'Creator';
  const username = p.username || u.username || '';
  const avatar = p.avatar || u.avatar || '';
  const followers = p.stats?.totalFollowers;
  const rizz = p.rizzScore ?? u.rizzScore;
  const niches = p.niche || u.niche || [];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push('/auth/signin');
    }
  };

  const avatarNode = avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatar} alt="" className="h-full w-full object-cover" />
  ) : (
    <span className="text-sm font-bold text-white">{initialsOf(displayName)}</span>
  );

  /* ------------------------------ Collapsed (icon rail) */
  if (collapsed) {
    return (
      <div className={`relative flex h-full w-[76px] p-2 ${className}`} data-sidebar-appearance={appearance}>
        {appearance === 'glass' && <GlassBackdrop />}
        <div className={`relative flex h-full w-full flex-col items-center gap-3 overflow-y-auto rounded-2xl px-1.5 py-3 transition-colors duration-300 hb-scroll-hidden ${t.panel}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand navigation"
            aria-expanded={false}
            className={`hidden h-9 w-9 items-center justify-center rounded-xl transition lg:flex ${t.iconBtn}`}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <Link
            href="/profile"
            onClick={onNavigate}
            aria-label="Your profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-900 ring-2 ring-white/40"
          >
            {avatarNode}
          </Link>
          <nav aria-label="Primary" className="w-full">
            <ul className="space-y-1">
              {NAV_SECTIONS.flatMap((s) => s.items).map((item) => {
                const active = item.match(pathname);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={item.label}
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                      className={`hb-nav-link flex h-10 items-center justify-center rounded-xl transition ${active ? t.active : t.link}`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div role="radiogroup" aria-label="Sidebar style" className={`mt-auto flex flex-col gap-1.5 rounded-xl p-1.5 ${t.segTrack}`}>
            {APPEARANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={appearance === opt.value}
                aria-label={`${opt.label} sidebar`}
                title={`${opt.label} sidebar`}
                onClick={() => setAppearance(opt.value)}
                className={`h-5 w-5 rounded-full transition ${opt.swatch} ${appearance === opt.value ? 'ring-2 ring-offset-2 ring-purple-400 ring-offset-transparent' : 'opacity-70 hover:opacity-100'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${t.signOut}`}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------ Expanded panel */
  return (
    <div className={`relative flex h-full w-full p-3 ${className}`} data-sidebar-appearance={appearance}>
      {appearance === 'glass' && <GlassBackdrop />}
      <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-3xl transition-colors duration-300 ${t.panel}`}>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2.5 pb-3 pt-3 hb-scroll-hidden">
          {showBrand && (
            <div className="flex items-center gap-2.5 px-1 pr-12">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                <Image src="/images/logo.png" alt="" width={28} height={28} className="h-6 w-6 object-contain" />
              </span>
              <span className={`text-lg font-extrabold tracking-tight ${t.title}`}>HyperBuds</span>
            </div>
          )}

          {/* Profile summary */}
          <section className={`relative rounded-2xl p-3 ${t.card}`}>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse navigation"
                aria-expanded
                className={`absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-lg transition lg:flex ${t.iconBtn}`}
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
            <Link href="/profile" onClick={onNavigate} className="group flex items-center gap-3 pr-7">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-900 ring-2 ring-white/50">
                {avatarNode}
              </span>
              <span className="min-w-0">
                <span className={`flex items-center gap-1 text-sm font-bold ${t.title}`}>
                  <span className="truncate capitalize">{displayName}</span>
                  {u.isVerified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-label="Verified" />}
                </span>
                <span className={`block truncate text-xs ${t.muted}`}>
                  {username ? `@${username}` : 'Creator profile'}
                </span>
              </span>
            </Link>

            {!mobileCompact && niches.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {niches.slice(0, 3).map((tag) => (
                  <span key={tag} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${t.chip}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {!mobileCompact && (
              <dl className={`mt-3 grid grid-cols-2 border-t pt-2.5 text-center ${t.divider}`}>
                <div>
                  <dd className={`text-sm font-bold tabular-nums ${t.title}`}>
                    {typeof followers === 'number' ? compactNumber(followers) : '—'}
                  </dd>
                  <dt className={`text-[11px] ${t.muted}`}>Followers</dt>
                </div>
                <div className={`border-l ${t.divider}`}>
                  <dd className={`text-sm font-bold tabular-nums ${t.title}`}>{typeof rizz === 'number' ? rizz : '—'}</dd>
                  <dt className={`text-[11px] ${t.muted}`}>Rizz Score</dt>
                </div>
              </dl>
            )}
          </section>

          {/* Primary navigation */}
          <nav aria-label="Primary">
            {visibleSections.map((section, sIdx) => (
              <div key={section.title} className={sIdx > 0 ? `mt-2.5 border-t pt-2.5 ${t.divider}` : ''}>
                <p className={`px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider ${t.label}`}>{section.title}</p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = item.match(pathname);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          aria-current={active ? 'page' : undefined}
                          className={`hb-nav-link flex flex-row items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium leading-none transition ${active ? t.active : t.link}`}
                        >
                          <Icon className="h-[17px] w-[17px] shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Shortcuts */}
          <section className={`border-t pt-2.5 ${t.divider}`}>
            <p className={`px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider ${t.label}`}>Shortcuts</p>
            <ul className="space-y-0.5">
              {SHORTCUTS.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={`hb-nav-link flex flex-row items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[13px] font-medium leading-none transition ${t.link}`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${t.iconTile}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {!mobileCompact && (
            <p className={`px-3 text-[11px] leading-relaxed ${t.label}`}>
              Privacy · Terms · Cookies · HyperBuds © {new Date().getFullYear()}
            </p>
          )}
        </div>

        {/* Footer: sidebar style selector + Sign Out (kept last for the drawer focus loop) */}
        <div className={`shrink-0 space-y-2 border-t px-3 pb-3 pt-3 ${t.divider}`}>
          <p className={`px-1 text-[11px] font-semibold uppercase tracking-wider ${t.label}`} id={styleLabelId}>
            Sidebar style
          </p>
          <div
            role="radiogroup"
            aria-labelledby={styleLabelId}
            className={`grid grid-cols-3 gap-1 rounded-2xl p-1 ${t.segTrack}`}
          >
            {APPEARANCE_OPTIONS.map((opt) => {
              const selected = appearance === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setAppearance(opt.value)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition ${selected ? t.segActive : t.segIdle}`}
                >
                  <span aria-hidden className={`h-3 w-3 shrink-0 rounded-full ${opt.swatch}`} />
                  {opt.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition ${t.signOut}`}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppSidebar;
