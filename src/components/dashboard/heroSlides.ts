import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BadgeCheck,
  Camera,
  Clapperboard,
  Handshake,
  Headphones,
  Layers,
  Lock,
  Mic,
  Radio,
  Rocket,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Video,
  Wand2,
  Zap,
} from 'lucide-react';

/**
 * Editorial spotlight content for the dashboard hero.
 *
 * IMPORTANT: this is curated SAMPLE content used to design and preview the
 * rotating header. It intentionally avoids numeric performance claims. Before
 * public launch it must be served from an admin-curated endpoint (e.g.
 * `/api/v1/spotlights`) so featured creators/products are real and consented.
 */

export type HeroVariant = 'split' | 'mirror' | 'stage' | 'reel' | 'duo' | 'tiles';
export type HeroTone = 'purple' | 'indigo' | 'violet' | 'fuchsia' | 'blue' | 'ink';

export interface HeroFeature {
  icon: LucideIcon;
  label: string;
}

export interface HeroSlide {
  id: string;
  category: string;
  variant: HeroVariant;
  tone: HeroTone;
  headline: {
    leftLight: string;
    leftBold: string;
    rightLight: string;
    rightBold: string;
  };
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  socialProof: string;
  features: [HeroFeature, HeroFeature, HeroFeature];
  media: {
    type: 'image' | 'video';
    src: string;
    poster?: string;
    secondarySrc?: string;
    alt: string;
    floating?: boolean;
  };
  featured: {
    label: string;
    title: string;
    subtitle: string;
    image: string;
    action: string;
    href: string;
  };
}

const img = (id: string, _w = 900) => `/images/hero/${id}.png`;

export const HERO_AVATARS = [
  img('photo-1494790108377-be9c29b29330', 120),
  img('photo-1506794778202-cad84cf45f1d', 120),
  img('photo-1438761681033-6461ffad8d80', 120),
  img('photo-1500648767791-00dcc994a43e', 120),
];

const SAMPLE_VIDEO = {
  blazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  escapes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  fun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'creator-of-the-month',
    category: 'Creator of the Month',
    variant: 'split',
    tone: 'purple',
    headline: { leftLight: 'Meet the', leftBold: 'CREATOR', rightLight: 'of the', rightBold: 'MONTH' },
    eyebrow: 'Creator Spotlight',
    title: 'Where talent meets the right collab',
    subtitle: 'Every month we spotlight a creator shaping how the HyperBuds community builds together.',
    cta: { label: 'View Creators', href: '/ai-matches' },
    socialProof: 'Picked by the HyperBuds community',
    features: [
      { icon: BadgeCheck, label: 'Verified Profile' },
      { icon: Handshake, label: 'Open to Collabs' },
      { icon: Award, label: 'Monthly Pick' },
    ],
    media: { type: 'image', src: img('photo-1534528741775-53994a69daeb'), alt: 'Featured creator portrait' },
    featured: {
      label: 'Featured Creator',
      title: 'Design & Live Streams',
      subtitle: 'UI systems · Co-streaming',
      image: img('photo-1494790108377-be9c29b29330', 480),
      action: 'View profile',
      href: '/matching/discover',
    },
  },
  {
    id: 'product-of-the-month',
    category: 'Product of the Month',
    variant: 'mirror',
    tone: 'indigo',
    headline: { leftLight: 'Upgrade the', leftBold: 'STUDIO', rightLight: 'Own the', rightBold: 'SOUND' },
    eyebrow: 'Gear Hub · Product of the Month',
    title: 'Broadcast audio for everyday creators',
    subtitle: 'A plug-and-play USB-C condenser chosen for podcasts, streams and voice-overs.',
    cta: { label: 'Shop Gear', href: '/marketplace/gear' },
    socialProof: 'Chosen by studio creators',
    features: [
      { icon: Mic, label: 'Studio Audio' },
      { icon: Truck, label: 'Tracked Shipping' },
      { icon: ShieldCheck, label: 'Easy Returns' },
    ],
    media: { type: 'image', src: img('photo-1590602847861-f357a9332bbc'), alt: 'Studio microphone', floating: true },
    featured: {
      label: 'Featured Product',
      title: 'Studio Condenser Mic',
      subtitle: 'USB-C · Cardioid',
      image: img('photo-1511671782779-c97d3d27a1d4', 480),
      action: 'Shop now',
      href: '/marketplace/gear',
    },
  },
  {
    id: 'live-studio',
    category: 'Live Studio',
    variant: 'stage',
    tone: 'ink',
    headline: { leftLight: 'Go', leftBold: 'LIVE', rightLight: 'Stay in', rightBold: 'SYNC' },
    eyebrow: 'Live Studio · Now Playing',
    title: 'Co-stream with creators you trust',
    subtitle: 'Host multi-guest streams with recording consent built in and a clean studio view.',
    cta: { label: 'Open Live Studio', href: '/streaming' },
    socialProof: 'Built for co-hosts and guests',
    features: [
      { icon: Radio, label: 'Multi-Guest' },
      { icon: Lock, label: 'Consent First' },
      { icon: Zap, label: 'Low Latency' },
    ],
    media: {
      type: 'video',
      src: SAMPLE_VIDEO.blazes,
      poster: img('photo-1511671782779-c97d3d27a1d4'),
      alt: 'Live studio preview',
    },
    featured: {
      label: 'Live Room',
      title: 'Weekly Co-Stream',
      subtitle: 'Creators · Audio · Code',
      image: img('photo-1511671782779-c97d3d27a1d4', 480),
      action: 'Join studio',
      href: '/streaming',
    },
  },
  {
    id: 'reel-of-the-week',
    category: 'Reel of the Week',
    variant: 'reel',
    tone: 'violet',
    headline: { leftLight: 'Watch the', leftBold: 'REELS', rightLight: 'Feel the', rightBold: 'VIBE' },
    eyebrow: 'Vertical Reels',
    title: 'Short-form stories, frame by frame',
    subtitle: 'Behind-the-scenes setups, gear demos and collab teasers made for vertical viewing.',
    cta: { label: 'Watch Reels', href: '/reels' },
    socialProof: 'Fresh reels from creators daily',
    features: [
      { icon: Clapperboard, label: '9:16 Format' },
      { icon: Sparkles, label: 'Creator Picks' },
      { icon: Video, label: 'Auto Play' },
    ],
    media: {
      type: 'video',
      src: SAMPLE_VIDEO.escapes,
      poster: img('photo-1516035069371-29a1b244cc32'),
      alt: 'Reel preview',
    },
    featured: {
      label: 'Featured Reel',
      title: 'Desk & Lighting Setup',
      subtitle: 'Behind the scenes',
      image: img('photo-1516035069371-29a1b244cc32', 480),
      action: 'Watch reel',
      href: '/reels',
    },
  },
  {
    id: 'collab-of-the-month',
    category: 'Collab of the Month',
    variant: 'duo',
    tone: 'fuchsia',
    headline: { leftLight: 'Build it', leftBold: 'BETTER', rightLight: 'Ship the', rightBold: 'COLLAB' },
    eyebrow: 'Collaboration Spotlight',
    title: 'Two niches, one launch',
    subtitle: 'A product builder and a storyteller turned a shared workspace into a full launch series.',
    cta: { label: 'Explore Collabs', href: '/collaborations' },
    socialProof: 'Made in a HyperBuds workspace',
    features: [
      { icon: Users, label: 'Co-Creation' },
      { icon: Layers, label: 'Shared Workspace' },
      { icon: Handshake, label: 'Pinned Terms' },
    ],
    media: {
      type: 'image',
      src: img('photo-1506794778202-cad84cf45f1d'),
      secondarySrc: img('photo-1438761681033-6461ffad8d80'),
      alt: 'Collaborating creators',
    },
    featured: {
      label: 'Featured Collab',
      title: 'Cross-Niche Launch',
      subtitle: 'Product · Storytelling',
      image: img('photo-1522071820081-009f0129c71c', 480),
      action: 'View collab',
      href: '/collaborations',
    },
  },
  {
    id: 'startup-pitch',
    category: 'Startup Pitch',
    variant: 'tiles',
    tone: 'blue',
    headline: { leftLight: 'Pitch the', leftBold: 'VISION', rightLight: 'Find the', rightBold: 'TEAM' },
    eyebrow: 'Startup & Talent Hub',
    title: 'Founders meet the talent to build it',
    subtitle: 'Share your pitch, propose salary and equity transparently, and negotiate in the open.',
    cta: { label: 'Open Startup Hub', href: '/startup-talent' },
    socialProof: 'Founders and talent, side by side',
    features: [
      { icon: Rocket, label: 'Open Pitches' },
      { icon: Handshake, label: 'Transparent Offers' },
      { icon: ShieldCheck, label: 'No Hidden Terms' },
    ],
    media: { type: 'image', src: img('photo-1522071820081-009f0129c71c'), alt: 'Startup team planning' },
    featured: {
      label: 'Featured Pitch',
      title: 'Creator Tools Startup',
      subtitle: 'Video & engineering roles',
      image: img('photo-1545235617-9465d2a55698', 480),
      action: 'See pitch',
      href: '/startup-talent',
    },
  },
  {
    id: 'gadget-of-the-month',
    category: 'Gadget of the Month',
    variant: 'split',
    tone: 'indigo',
    headline: { leftLight: 'Frame the', leftBold: 'SHOT', rightLight: 'Pocket', rightBold: 'GADGETS' },
    eyebrow: 'Gear Hub · Gadget Pick',
    title: 'Pocket cameras that travel with you',
    subtitle: 'Compact, creator-ready cameras for vlogs, B-roll and on-the-go content days.',
    cta: { label: 'Browse Gadgets', href: '/marketplace/gear' },
    socialProof: 'Picked for travelling creators',
    features: [
      { icon: Camera, label: '4K Ready' },
      { icon: Truck, label: 'Regional Shipping' },
      { icon: ShieldCheck, label: 'Buyer Protection' },
    ],
    media: { type: 'image', src: img('photo-1516035069371-29a1b244cc32'), alt: 'Creator camera', floating: true },
    featured: {
      label: 'Featured Gadget',
      title: 'Compact Vlog Camera',
      subtitle: 'Stabilised · 4K',
      image: img('photo-1516035069371-29a1b244cc32', 480),
      action: 'Shop now',
      href: '/marketplace/gear',
    },
  },
  {
    id: 'service-highlight',
    category: 'Service Highlight',
    variant: 'mirror',
    tone: 'purple',
    headline: { leftLight: 'Hire the', leftBold: 'TALENT', rightLight: 'Ship on', rightBold: 'TIME' },
    eyebrow: 'Marketplace · Service Pick',
    title: 'Design systems for creator brands',
    subtitle: 'Fixed-scope services with clear milestones and a direct workspace handoff.',
    cta: { label: 'Browse Services', href: '/marketplace' },
    socialProof: 'Delivered through HyperBuds bookings',
    features: [
      { icon: Wand2, label: 'Custom Design' },
      { icon: Layers, label: 'Milestones' },
      { icon: BadgeCheck, label: 'Vetted Sellers' },
    ],
    media: { type: 'image', src: img('photo-1545235617-9465d2a55698'), alt: 'Designer at work' },
    featured: {
      label: 'Featured Service',
      title: 'Creator Studio UI Kit',
      subtitle: 'Figma · Next.js tokens',
      image: img('photo-1545235617-9465d2a55698', 480),
      action: 'View service',
      href: '/marketplace',
    },
  },
  {
    id: 'audio-session',
    category: 'Audio Session',
    variant: 'stage',
    tone: 'violet',
    headline: { leftLight: 'Master the', leftBold: 'MIX', rightLight: 'Every', rightBold: 'EPISODE' },
    eyebrow: 'Audio & Podcasting · Now Playing',
    title: 'Crisp sound for every stream',
    subtitle: 'Pair studio hardware with audio engineers so podcasts and livestreams sound right.',
    cta: { label: 'Explore Audio', href: '/marketplace' },
    socialProof: 'Engineers and hosts working together',
    features: [
      { icon: Headphones, label: 'Mixing' },
      { icon: Mic, label: 'Dialogue Cleanup' },
      { icon: Layers, label: 'Stem Delivery' },
    ],
    media: {
      type: 'video',
      src: SAMPLE_VIDEO.fun,
      poster: img('photo-1511671782779-c97d3d27a1d4'),
      alt: 'Audio session preview',
    },
    featured: {
      label: 'Audio Workflow',
      title: 'Podcast Mastering',
      subtitle: 'Cleanup · Stems',
      image: img('photo-1511671782779-c97d3d27a1d4', 480),
      action: 'Find engineers',
      href: '/marketplace',
    },
  },
  {
    id: 'community-sprint',
    category: 'Community Sprint',
    variant: 'duo',
    tone: 'purple',
    headline: { leftLight: 'Join the', leftBold: 'SPRINT', rightLight: 'Make it', rightBold: 'HAPPEN' },
    eyebrow: 'Weekend Collab Sprint',
    title: 'Match, build and ship this weekend',
    subtitle: 'Find editors, co-hosts and designers ready to start now with explainable matching.',
    cta: { label: 'Find Matches', href: '/matching/discover' },
    socialProof: 'Open to every niche',
    features: [
      { icon: Sparkles, label: 'Smart Matching' },
      { icon: Users, label: 'Open Teams' },
      { icon: Zap, label: '48h Sprint' },
    ],
    media: {
      type: 'image',
      src: img('photo-1500648767791-00dcc994a43e'),
      secondarySrc: img('photo-1494790108377-be9c29b29330'),
      alt: 'Creators joining a sprint',
    },
    featured: {
      label: 'Sprint Event',
      title: 'Weekend Collab',
      subtitle: 'All niches welcome',
      image: img('photo-1515378791036-0648a3ef77b2', 480),
      action: 'Join sprint',
      href: '/matching/discover',
    },
  },
];
