'use client';

import { useCallback, useEffect, useState } from 'react';

// =========================================================================
// Types
// =========================================================================

export type OnboardingRole = 'founder' | 'talent';

export interface RoleRecommendation {
  id: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium';
  hireNumber: number;
  reason: string;
  skills: string[];
  suggestedComp: string;
}

export interface RoleOffer {
  compType: 'salary' | 'equity' | 'hybrid';
  monthlySalary?: number;
  equityPercent?: number;
  vesting: string;
}

export interface FounderPitch {
  id: string;
  startupName: string;
  tagline: string;
  description: string;
  industry: string;
  websiteUrl: string;
  fundingStage: string;
  selectedRoleIds: string[];
  offers: Record<string, RoleOffer>;
  invitedTalentIds: string[];
  lastActivity: string;
}

export interface MatchedTalent {
  id: string;
  name: string;
  role: string;
  location: string;
  timezone: string;
  availability: string;
  trust: number;
  rating: number;
  reviewCount: number;
  tag: string; // offer preference: Salary / Equity / Hybrid
  languages: string[];
  bio: string;
  skills: string[];
  experience: { company: string; title: string; duration: string }[];
  portfolio: { label: string; url: string }[];
}

export interface TalentInvite {
  id: string;
  startupName: string;
  founderName: string;
  tagline: string;
  industry: string;
  fundingStage: string;
  role: string;
  compType: 'salary' | 'equity' | 'hybrid';
  monthlySalary?: number;
  equityPercent?: number;
  matchPercent: number;
  receivedAgo: string;
  status: 'Pending' | 'Reviewed' | 'Accepted' | 'Declined';
  negotiationSent?: boolean;
}

export interface TalentProfileData {
  fullName: string;
  location: string;
  primaryRole: string;
  skills: string[];
  compPreference: 'salary' | 'equity' | 'hybrid';
  availability: string;
  bio: string;
  invites: TalentInvite[];
  activeInviteId: string | null;
}

export interface OnboardingState {
  role: OnboardingRole | null;
  currentStep: number;
  /** True while the wizard should render even if `completed` is already true
   *  (launching a new pitch, reviewing an invite, editing a profile, etc). */
  wizardActive: boolean;
  completed: boolean;
  founder: {
    pitches: FounderPitch[];
    currentPitchId: string | null;
  };
  talent: TalentProfileData;
}

function emptyPitch(id: string): FounderPitch {
  return {
    id,
    startupName: '',
    tagline: '',
    description: '',
    industry: '',
    websiteUrl: '',
    fundingStage: '',
    selectedRoleIds: [],
    offers: {},
    invitedTalentIds: [],
    lastActivity: 'just now',
  };
}

export function defaultOnboardingState(): OnboardingState {
  return {
    role: null,
    currentStep: 0,
    wizardActive: false,
    completed: false,
    founder: { pitches: [], currentPitchId: null },
    talent: {
      fullName: '',
      location: '',
      primaryRole: '',
      skills: [],
      compPreference: 'hybrid',
      availability: '',
      bio: '',
      invites: [],
      activeInviteId: null,
    },
  };
}

// =========================================================================
// Mock data (stand-in for real AI-matching / invites APIs)
// =========================================================================

export const AI_ROLE_SUGGESTIONS: RoleRecommendation[] = [
  {
    id: 'fullstack',
    title: 'Full-Stack Engineer',
    priority: 'Critical',
    hireNumber: 1,
    reason: 'You need product infrastructure before any other role is productive.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    suggestedComp: '$5,000–$8,000/mo or 3–6% equity',
  },
  {
    id: 'design',
    title: 'UX / Product Designer',
    priority: 'Critical',
    hireNumber: 2,
    reason: 'Your product needs expert interaction design to build user trust.',
    skills: ['Figma', 'User Research', 'Prototyping', 'AR/UI'],
    suggestedComp: '2–5% equity with milestones',
  },
  {
    id: 'ml',
    title: 'ML Engineer',
    priority: 'High',
    hireNumber: 3,
    reason: 'A core recommendation or matching engine needs a dedicated specialist.',
    skills: ['Python', 'PyTorch', 'Recommendation Systems', 'NLP'],
    suggestedComp: '$3,000/mo + 2–4% equity',
  },
  {
    id: 'growth',
    title: 'Growth & Marketing Lead',
    priority: 'High',
    hireNumber: 4,
    reason: 'Early acquisition loops need to be defined before you scale engineering.',
    skills: ['Content Strategy', 'SEO', 'Paid Ads', 'Analytics'],
    suggestedComp: '$2,500/mo + 1% equity',
  },
  {
    id: 'devops',
    title: 'Backend / DevOps Engineer',
    priority: 'Medium',
    hireNumber: 5,
    reason: 'Infrastructure, security, and payment pipelines require dedicated depth.',
    skills: ['AWS', 'Docker', 'CI/CD', 'Security'],
    suggestedComp: '$4,000–$6,000/mo',
  },
];

export const PRIMARY_ROLES = [
  'Full-Stack Engineer', 'Frontend Engineer', 'Backend Engineer', 'ML Engineer', 'DevOps Engineer',
  'UX / Product Designer', 'Product Manager', 'Growth Lead', 'Data Analyst', 'Mobile Engineer',
];

export const ROLE_SKILL_SUGGESTIONS: Record<string, string[]> = {
  'Full-Stack Engineer': ['React', 'Node.js', 'PostgreSQL', 'AWS', 'TypeScript', 'Docker'],
  'Frontend Engineer': ['React', 'Vue.js', 'TypeScript', 'CSS', 'Figma', 'Next.js'],
  'Backend Engineer': ['Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Redis', 'GraphQL'],
  'ML Engineer': ['Python', 'PyTorch', 'NLP', 'Recommendation Systems', 'TensorFlow', 'Pandas'],
  'DevOps Engineer': ['AWS', 'Docker', 'CI/CD', 'Kubernetes', 'Terraform', 'Security'],
  'UX / Product Designer': ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'AR/UI'],
  'Product Manager': ['Roadmapping', 'User Research', 'Analytics', 'SQL', 'A/B Testing'],
  'Growth Lead': ['SEO', 'Paid Ads', 'Content Strategy', 'Analytics', 'CRO'],
  'Data Analyst': ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'],
  'Mobile Engineer': ['Swift', 'Kotlin', 'React Native', 'Flutter', 'Firebase'],
};

export const AVAILABILITY_OPTIONS = ['Immediately', 'Within 2 weeks', 'Within 1 month', 'In 2-3 months'];

export const MOCK_MATCHED_TALENTS: MatchedTalent[] = [
  {
    id: 't1', name: 'Aria Nakamura', role: 'Full-Stack Engineer', location: 'Tokyo, JP',
    timezone: 'JST (UTC+9)', availability: 'Immediate', trust: 98, rating: 4.9, reviewCount: 24, tag: 'Hybrid',
    languages: ['English', 'Japanese'],
    bio: '6 years building scalable web platforms. Ex-Microsoft. Shipped 4 production apps from 0 to thousands of daily users. Strong on system design and API architecture.',
    skills: ['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL', 'TypeScript'],
    experience: [
      { company: 'Microsoft', title: 'Senior Software Engineer', duration: '3 yrs' },
      { company: 'Shipify', title: 'Lead Full-Stack Engineer', duration: '2 yrs' },
      { company: 'Freelance', title: 'Full-Stack Consultant', duration: '1 yr' },
    ],
    portfolio: [{ label: 'GitHub', url: '#' }, { label: 'Portfolio', url: '#' }],
  },
  {
    id: 't2', name: 'Devraj Patel', role: 'ML Engineer', location: 'Bengaluru, IN',
    timezone: 'IST (UTC+5:30)', availability: 'Within 2 weeks', trust: 91, rating: 4.7, reviewCount: 18, tag: 'Salary',
    languages: ['English', 'Hindi'],
    bio: '5 years shipping recommendation and ranking systems at scale. Enjoys turning fuzzy product problems into measurable models.',
    skills: ['Python', 'PyTorch', 'NLP', 'Recommendation Systems'],
    experience: [
      { company: 'Flipkart', title: 'ML Engineer', duration: '3 yrs' },
      { company: 'Freelance', title: 'ML Consultant', duration: '2 yrs' },
    ],
    portfolio: [{ label: 'GitHub', url: '#' }],
  },
  {
    id: 't3', name: 'Cleo Fontaine', role: 'UX / Product Designer', location: 'Paris, FR',
    timezone: 'CET (UTC+1)', availability: 'Within 1 month', trust: 94, rating: 4.8, reviewCount: 31, tag: 'Hybrid',
    languages: ['English', 'French'],
    bio: 'Product designer obsessed with reducing friction in onboarding and checkout flows for early-stage startups.',
    skills: ['Figma', 'User Research', 'Prototyping'],
    experience: [
      { company: 'Deezer', title: 'Senior Product Designer', duration: '4 yrs' },
      { company: 'Freelance', title: 'Design Consultant', duration: '1 yr' },
    ],
    portfolio: [{ label: 'Portfolio', url: '#' }],
  },
  {
    id: 't4', name: 'Matheus Ribeiro', role: 'Full-Stack Engineer', location: 'São Paulo, BR',
    timezone: 'BRT (UTC-3)', availability: 'Immediate', trust: 85, rating: 4.5, reviewCount: 12, tag: 'Equity',
    languages: ['English', 'Portuguese'],
    bio: 'Full-stack generalist who has taken two early-stage products from zero to their first paying customers.',
    skills: ['Vue.js', 'Python', 'PostgreSQL'],
    experience: [
      { company: 'Nubank', title: 'Software Engineer', duration: '2 yrs' },
      { company: 'Freelance', title: 'Full-Stack Engineer', duration: '2 yrs' },
    ],
    portfolio: [{ label: 'GitHub', url: '#' }],
  },
];

export const MOCK_TALENT_INVITES_SEED: TalentInvite[] = [
  { id: 'inv1', startupName: 'NeuroShop', founderName: 'Marcus Webb', tagline: 'AI-powered shopping assistant that learns your style', industry: 'AI / ML', fundingStage: 'Pre-seed', role: 'Full-Stack Engineer', compType: 'hybrid', monthlySalary: 5000, equityPercent: 2, matchPercent: 97, receivedAgo: '1d ago', status: 'Pending' },
  { id: 'inv2', startupName: 'MedPulse', founderName: 'Priya Sharma', tagline: 'Real-time health monitoring for remote patients', industry: 'HealthTech', fundingStage: 'Seed', role: 'Full-Stack Engineer', compType: 'salary', monthlySalary: 6500, matchPercent: 88, receivedAgo: '3 days ago', status: 'Reviewed' },
  { id: 'inv3', startupName: 'BuildStack', founderName: 'Leo Chen', tagline: 'No-code infrastructure tools for indie hackers', industry: 'SaaS / B2B', fundingStage: 'MVP built', role: 'Frontend Engineer', compType: 'equity', equityPercent: 4, matchPercent: 82, receivedAgo: '2d ago', status: 'Pending' },
  { id: 'inv4', startupName: 'GreenRoute', founderName: 'Amara Diallo', tagline: 'Carbon-optimised last-mile logistics platform', industry: 'CleanTech', fundingStage: 'Series A+', role: 'Backend Engineer', compType: 'hybrid', monthlySalary: 7000, equityPercent: 0.5, matchPercent: 74, receivedAgo: '5d ago', status: 'Declined' },
];

export const MOCK_RECENT_ACTIVITY = [
  { id: 'a1', company: 'NeuroShop', tag: 'Accepted', description: 'Talent accepted invite', time: '2h ago' },
  { id: 'a2', company: 'MedPulse', tag: 'Pending', description: 'New match found: AI/ML', time: '5h ago' },
  { id: 'a3', company: 'BuildKit', tag: 'Reviewed', description: 'Talent reviewed offer', time: '1d ago' },
];

// =========================================================================
// Persistence (swap loadState/saveState for real API calls later)
// =========================================================================

const STORAGE_KEY = 'hyperbuds:onboarding';

function loadState(): OnboardingState {
  if (typeof window === 'undefined') return defaultOnboardingState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultOnboardingState();
    const parsed = JSON.parse(raw);
    const base = defaultOnboardingState();
    return {
      ...base,
      ...parsed,
      founder: { ...base.founder, ...parsed.founder },
      talent: { ...base.talent, ...parsed.talent },
    };
  } catch {
    return defaultOnboardingState();
  }
}

function saveState(state: OnboardingState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let idCounter = 0;
function makeId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

// =========================================================================
// Hook
// =========================================================================

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(defaultOnboardingState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const update = useCallback((updater: (prev: OnboardingState) => OnboardingState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const setRole = useCallback((role: OnboardingRole) => {
    update((prev) => {
      if (role === 'founder' && prev.founder.pitches.length === 0) {
        const pitch = emptyPitch(makeId('pitch'));
        return {
          ...prev, role, currentStep: 0, wizardActive: true,
          founder: { pitches: [pitch], currentPitchId: pitch.id },
        };
      }
      return { ...prev, role, currentStep: 0, wizardActive: true };
    });
  }, [update]);

  const setStep = useCallback((step: number) => update((prev) => ({ ...prev, currentStep: step })), [update]);

  const setWizardActive = useCallback(
    (active: boolean, step?: number) =>
      update((prev) => ({ ...prev, wizardActive: active, currentStep: step ?? prev.currentStep })),
    [update]
  );

  // ---- Founder helpers ----

  const currentPitch = state.founder.pitches.find((p) => p.id === state.founder.currentPitchId) ?? null;

  const updateCurrentPitch = useCallback((patch: Partial<FounderPitch>) => {
    update((prev) => ({
      ...prev,
      founder: {
        ...prev.founder,
        pitches: prev.founder.pitches.map((p) =>
          p.id === prev.founder.currentPitchId ? { ...p, ...patch } : p
        ),
      },
    }));
  }, [update]);

  const startNewPitch = useCallback(() => {
    update((prev) => {
      const pitch = emptyPitch(makeId('pitch'));
      return {
        ...prev,
        role: 'founder',
        currentStep: 0,
        wizardActive: true,
        founder: { pitches: [...prev.founder.pitches, pitch], currentPitchId: pitch.id },
      };
    });
  }, [update]);

  const openPitch = useCallback((pitchId: string, step = 0) => {
    update((prev) => ({
      ...prev,
      currentStep: step,
      wizardActive: true,
      founder: { ...prev.founder, currentPitchId: pitchId },
    }));
  }, [update]);

  // ---- Talent helpers ----

  const updateTalentProfile = useCallback((patch: Partial<TalentProfileData>) => {
    update((prev) => ({ ...prev, talent: { ...prev.talent, ...patch } }));
  }, [update]);

  const seedInvitesIfEmpty = useCallback(() => {
    update((prev) =>
      prev.talent.invites.length > 0
        ? prev
        : { ...prev, talent: { ...prev.talent, invites: MOCK_TALENT_INVITES_SEED.map((i) => ({ ...i })) } }
    );
  }, [update]);

  const updateInvite = useCallback((inviteId: string, patch: Partial<TalentInvite>) => {
    update((prev) => ({
      ...prev,
      talent: {
        ...prev.talent,
        invites: prev.talent.invites.map((i) => (i.id === inviteId ? { ...i, ...patch } : i)),
      },
    }));
  }, [update]);

  const setActiveInvite = useCallback((inviteId: string | null) => {
    update((prev) => ({ ...prev, talent: { ...prev.talent, activeInviteId: inviteId } }));
  }, [update]);

  const complete = useCallback(
    () => update((prev) => ({ ...prev, completed: true, wizardActive: false })),
    [update]
  );

  const reset = useCallback(() => update(() => defaultOnboardingState()), [update]);

  return {
    state,
    hydrated,
    setRole,
    setStep,
    setWizardActive,
    currentPitch,
    updateCurrentPitch,
    startNewPitch,
    openPitch,
    updateTalentProfile,
    seedInvitesIfEmpty,
    updateInvite,
    setActiveInvite,
    complete,
    reset,
  };
}