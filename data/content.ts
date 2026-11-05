import { IconName } from '@/components/icons';
import { colors } from '@/constants/theme';

export type AvatarId = 'walk' | 'nordic' | 'hike' | 'trophy';
export type GroupPrivacy = 'Public Group' | 'Private Circle' | 'Corporate' | 'Social';
export type MemberRole = 'Admin' | 'Member' | 'Mod';

export type Group = {
  id: string;
  name: string;
  shortName: string;
  activity: string;
  privacy: GroupPrivacy;
  tier?: string;
  members: number;
  league?: string;
  organizer: string;
  todaySteps: number;
  todayDelta?: number;
  activeContributors?: number;
  avgSteps?: number;
  weeklyGoal: number;
  weeklyLogged: number;
  daysLeft?: number;
  yourShare: number;
  yourRank: number;
  distanceKm?: number;
  dailyGoal: number;
  verified?: boolean;
  questLabel: string;
  aside?: string;
  description: string;
  viewerRole: MemberRole;
  inviteOnly?: boolean;
  rally?: string;
  trend?: string;
  standingNote: string;
};

export type Session = {
  name: string;
  username: string;
  city: string;
  email: string;
  dailyGoal: number;
  motivations: string[];
  avatar: AvatarId;
  photoUri?: string | null;
  memberGroupIds: string[];
  primaryGroupId: string | null;
  preview: boolean;
  onboarded: boolean;
};

export type AccountSetup = {
  name: string;
  username: string;
  city: string;
  dailyGoal: number;
  motivations: string[];
  avatar: AvatarId;
  photoUri?: string | null;
};

export type WalkPoint = { latitude: number; longitude: number; at: number };

export type WalkRoute = {
  id: string;
  name: string;
  live: boolean;
  mine: boolean;
  points: WalkPoint[];
};

export type Draft = {
  name: string;
  username: string;
  city: string;
  dailyGoal: number;
  motivations: string[];
  avatar: AvatarId;
  photoUri?: string | null;
  inviteCode: string;
  selectedGroupId: string | null;
  customName: string;
  syncSteps: boolean;
  syncBackground: boolean;
};

export type Kudo = {
  id: string;
  from: string;
  to: string;
  time: string;
  badge: string;
  quote: string;
};

export type Tournament = {
  id: string;
  title: string;
  detail: string;
  timeLabel: string;
  time: string;
  place: string;
  current: number;
  target: number;
};

export type Quest = {
  id: string;
  icon: IconName;
  tag: string;
  when: string;
  title: string;
  body: string;
  joined: number;
};

export const avatars: { id: AvatarId; icon: IconName; label: string }[] = [
  { id: 'walk', icon: 'directions-walk', label: 'Walker' },
  { id: 'nordic', icon: 'nordic-walking', label: 'Nordic' },
  { id: 'hike', icon: 'hiking', label: 'Hiker' },
  { id: 'trophy', icon: 'emoji-events', label: 'Champion' },
];

export const goalOptions: {
  steps: number;
  title: string;
  subtitle: string;
  icon: IconName;
  recommended?: boolean;
}[] = [
  { steps: 6000, title: '6,000 steps', subtitle: 'Easy Rhythm • Gentle start', icon: 'nature' },
  {
    steps: 8000,
    title: '8,000 steps',
    subtitle: 'Active Pace • Everyday vitality',
    icon: 'favorite',
    recommended: true,
  },
  { steps: 10000, title: '10,000 steps', subtitle: 'Power Walker • High energy', icon: 'bolt' },
  {
    steps: 12500,
    title: '12,500+ steps',
    subtitle: 'Aktiv Elite • Peak performance',
    icon: 'emoji-events',
  },
];

export const motivations: { id: string; label: string; emoji: string }[] = [
  { id: 'competition', label: 'Friendly Competition', emoji: '🏆' },
  { id: 'habit', label: 'Healthy Habit Building', emoji: '🌿' },
  { id: 'workplace', label: 'Workplace Wellness', emoji: '🏢' },
  { id: 'friends', label: 'Walking with Friends & Family', emoji: '👟' },
];

export const weekBars = [
  { label: 'F', steps: 4200 },
  { label: 'S', steps: 6100 },
  { label: 'S', steps: 7400 },
  { label: 'M', steps: 5600 },
  { label: 'T', steps: 9800 },
  { label: 'W', steps: 11200 },
];

export const initialGroups: Group[] = [
  {
    id: 'rv-uddipta',
    name: 'RV Uddiipta Walking Club',
    shortName: 'RV Uddiipta',
    activity: 'Walking & Vitality',
    privacy: 'Public Group',
    tier: 'Tier 3 Growing',
    members: 45,
    league: '#2 League',
    organizer: 'Priya Sharma',
    todaySteps: 324500,
    todayDelta: 14.2,
    activeContributors: 42,
    avgSteps: 7211,
    weeklyGoal: 2_000_000,
    weeklyLogged: 324500,
    daysLeft: 6,
    yourShare: 2.6,
    yourRank: 3,
    distanceKm: 1.4,
    dailyGoal: 9000,
    verified: true,
    questLabel: 'Weekly 2.0M step goal',
    description: '45 walkers',
    viewerRole: 'Admin',
    trend: 'Top trending',
    standingNote: 'Total squad volume',
  },
  {
    id: 'office',
    name: 'Office Walking Challenge',
    shortName: 'Office Walking',
    activity: 'Workplace Wellness',
    privacy: 'Corporate',
    members: 128,
    organizer: 'People Team',
    todaySteps: 935556,
    activeContributors: 128,
    avgSteps: 7300,
    weeklyGoal: 25_000_000,
    weeklyLogged: 16_000_000,
    daysLeft: 18,
    yourShare: 0.9,
    yourRank: 12,
    dailyGoal: 8000,
    questLabel: 'Monthly 25M steps quest',
    description: '128 teammates active',
    viewerRole: 'Member',
    standingNote: 'Out of 128 participants',
  },
  {
    id: 'friends',
    name: 'Friends Fitness Club',
    shortName: 'Friends Fitness',
    activity: 'Social Circle',
    privacy: 'Social',
    members: 12,
    organizer: 'Elena R.',
    todaySteps: 86400,
    avgSteps: 7200,
    weeklyGoal: 200_000,
    weeklyLogged: 176_000,
    daysLeft: 1,
    yourShare: 9.7,
    yourRank: 2,
    dailyGoal: 8000,
    questLabel: 'Weekend 200k Sprint',
    aside: 'Ending in 14h',
    description: '12 inner circle walkers',
    viewerRole: 'Mod',
    standingNote: 'Podium standing spot',
  },
  {
    id: 'metro-morning',
    name: 'Metro Morning Striders',
    shortName: 'Metro Morning',
    activity: 'Public Squad',
    privacy: 'Public Group',
    members: 142,
    organizer: 'Jordan Lee',
    todaySteps: 620000,
    avgSteps: 8200,
    weeklyGoal: 5_000_000,
    weeklyLogged: 2_400_000,
    yourShare: 0,
    yourRank: 0,
    dailyGoal: 8200,
    questLabel: 'Weekly rally pace',
    description: '142 members',
    viewerRole: 'Member',
    trend: 'High Vitality',
    rally: 'Weekly Rally: Saturday 6:30 AM',
    standingNote: 'Morning crew',
  },
  {
    id: 'peak-climbers',
    name: 'Peak Climbers Club',
    shortName: 'Peak Climbers',
    activity: 'Trail Circle',
    privacy: 'Private Circle',
    tier: 'Tier 2',
    members: 28,
    organizer: 'Club Captain',
    todaySteps: 210000,
    avgSteps: 10000,
    weeklyGoal: 1_000_000,
    weeklyLogged: 540000,
    yourShare: 0,
    yourRank: 0,
    dailyGoal: 10000,
    questLabel: 'Trail week',
    description: 'Invite circle',
    viewerRole: 'Member',
    inviteOnly: true,
    standingNote: 'Invite-only trail club',
  },
];

export const mockGroupIds = new Set(initialGroups.map((group) => group.id));

export const mockRoutes: WalkRoute[] = [
  {
    id: 'priya-route',
    name: 'Priya Sharma',
    live: true,
    mine: false,
    points: [
      { latitude: 37.769, longitude: -122.486, at: 1 },
      { latitude: 37.77, longitude: -122.483, at: 2 },
      { latitude: 37.772, longitude: -122.481, at: 3 },
      { latitude: 37.774, longitude: -122.478, at: 4 },
    ],
  },
  {
    id: 'marcus-route',
    name: 'Marcus V.',
    live: false,
    mine: false,
    points: [
      { latitude: 37.761, longitude: -122.475, at: 1 },
      { latitude: 37.763, longitude: -122.472, at: 2 },
      { latitude: 37.765, longitude: -122.47, at: 3 },
    ],
  },
];

export const demoSession: Session = {
  name: 'Alex Mercer',
  username: 'alex_walks',
  city: 'San Francisco, CA',
  email: 'alex@walkingclub.org',
  dailyGoal: 10000,
  motivations: ['competition', 'habit', 'workplace', 'friends'],
  avatar: 'hike',
  memberGroupIds: ['rv-uddipta', 'office', 'friends'],
  primaryGroupId: 'rv-uddipta',
  preview: true,
  onboarded: true,
};

export const initialDraft: Draft = {
  name: 'Alex Mercer',
  username: 'alex_walks',
  city: 'San Francisco, CA',
  dailyGoal: 8000,
  motivations: motivations.map((item) => item.id),
  avatar: 'hike',
  inviteCode: '',
  selectedGroupId: 'rv-uddipta',
  customName: '',
  syncSteps: true,
  syncBackground: true,
};

export function makeCustomGroup(
  name: string,
  city: string,
  dailyGoal: number,
  privacy: GroupPrivacy,
  id = `circle-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
): Group {
  return {
    id,
    name: name.trim(),
    shortName: name.trim(),
    activity: privacy === 'Corporate' ? 'Workplace Wellness' : 'Private Circle',
    privacy,
    members: 1,
    organizer: 'You',
    todaySteps: 0,
    todayDelta: 0,
    activeContributors: 1,
    avgSteps: 0,
    weeklyGoal: Math.max(dailyGoal * 7, 1),
    weeklyLogged: 0,
    daysLeft: 6,
    yourShare: 100,
    yourRank: 1,
    dailyGoal,
    questLabel: 'Your new circle',
    description: city ? `Started in ${city}` : 'Your new circle',
    viewerRole: 'Admin',
    standingNote: 'You organize this circle',
  };
}

export function clubToday(group: Group, isMember: boolean, personalToday: number, bonus: number) {
  if (!isMember) return group.todaySteps;
  const counted = group.yourShare > 0 || group.members <= 1;
  return group.todaySteps + (counted ? bonus : personalToday);
}

export function clubWeek(group: Group, isMember: boolean, personalToday: number, bonus: number) {
  if (!isMember) return group.weeklyLogged;
  const counted = group.yourShare > 0 || group.members <= 1;
  return group.weeklyLogged + (counted ? bonus : personalToday);
}

export const badgeStickers = ['Streak Hero', 'Team Player', 'Pace Setter', 'Sunshine'];

export const rvKudos: Kudo[] = [
  {
    id: 'k1',
    from: 'Priya Sharma',
    to: 'Marcus V.',
    time: '28m ago',
    badge: 'Most Consistent Walker',
    quote: '14 consecutive days exceeding 15k! Incredible momentum Marcus!',
  },
  {
    id: 'k2',
    from: 'Alex (You)',
    to: 'Elena R.',
    time: '2h ago',
    badge: 'Team Player Badge',
    quote: 'Thanks for keeping me paced on the morning loop today!',
  },
];

export type Champion = { name: string; steps: number; you?: boolean; goal: number };

export const rvChampions: Champion[] = [
  { name: 'Marcus V.', steps: 18420, goal: 10000 },
  { name: 'Elena R.', steps: 15100, goal: 10000 },
  { name: 'Alex (You)', steps: 8420, you: true, goal: 10000 },
  { name: 'Talia Brooks', steps: 7920, goal: 10000 },
];

export const showdown = {
  title: 'Corporate Spring Showdown',
  daysLeft: 14,
  tier: 'Tier A',
  stakes: 'Grand Physical Trophy & Gold Digital Profile Accolades',
  cup: 'Champion Cup',
  leftName: 'RV Uddiipta Club',
  rightName: 'Metro Walkers',
  leftSteps: 2_450_000,
  rightSteps: 2_180_000,
};

export const hallOfFame = [
  { name: 'Elena R.', steps: '88.4k', place: '2', tag: 'Silver', mvp: false },
  { name: 'Marcus V.', steps: '94.2k', place: '1', tag: 'Squad MVP', mvp: true },
  { name: 'Alex P.', steps: '82.1k', place: '3', tag: 'Bronze', mvp: false },
];

export const tournaments: Tournament[] = [
  {
    id: 'tech-league',
    title: 'Tech League 10M Relay',
    detail: '4 Squads Competing',
    timeLabel: 'Time left',
    time: '8 days',
    place: 'Your Squad: 2nd Place',
    current: 4_200_000,
    target: 10_000_000,
  },
  {
    id: 'weekend-sprint',
    title: 'Weekend Sprint Rivalry',
    detail: 'Friends & Family 500k Clash',
    timeLabel: 'Finishes',
    time: 'Sunday 8PM',
    place: 'Neighborhood Squad leading',
    current: 310_000,
    target: 500_000,
  },
];

export const quests: Quest[] = [
  {
    id: 'trail',
    icon: 'terrain',
    tag: 'Elevation',
    when: 'Starts in 2d',
    title: 'Weekend 10k Trail Hike',
    body: 'Elevate your group baseline with 450m elevation gain alongside certified trail groups.',
    joined: 412,
  },
  {
    id: 'cadence',
    icon: 'speed',
    tag: 'Tempo',
    when: 'Daily sprint',
    title: '30-Min Cadence Surge',
    body: 'Maintain 165+ SPM cadence in continuous rhythmic groups with dynamic intervals.',
    joined: 890,
  },
  {
    id: 'dawn',
    icon: 'self-improvement',
    tag: 'Mindfulness',
    when: 'Opens Monday',
    title: 'Dawn Sunlight Walkers',
    body: 'Morning 4k step stride completed prior to 8:30 AM for a calmer start to the day.',
    joined: 1200,
  },
];

export const careerTiers: { label: string; icon: IconName; state: 'done' | 'current' | 'locked' }[] = [
  { label: 'Starter', icon: 'check', state: 'done' },
  { label: 'Explorer', icon: 'check', state: 'done' },
  { label: 'Walker', icon: 'directions-walk', state: 'current' },
  { label: 'Achiever', icon: 'lock', state: 'locked' },
  { label: 'Champion', icon: 'lock', state: 'locked' },
  { label: 'Legend', icon: 'lock', state: 'locked' },
  { label: 'Aktiv Elite', icon: 'workspace-premium', state: 'locked' },
];

export const honors: { title: string; meta: string; note: string; icon: IconName }[] = [
  { title: 'Best Group of Month', meta: 'April 2024', note: 'Top National Stride', icon: 'emoji-events' },
  { title: 'Most Consistent', meta: 'Season 3 Champion', note: '30-Day Zero Break', icon: 'shield' },
  { title: 'Sprint Showdown', meta: 'Inter-Club Cup', note: 'Defeated Metro Striders', icon: 'military-tech' },
  { title: '10M Steps Club', meta: 'Club Record', note: 'Historical Milestone', icon: 'stars' },
];

export const groupMilestones = [
  { title: 'Collective Steps Target', detail: '14.8M / 20M', progress: 14.8 / 20, icon: 'check-circle' as IconName },
  { title: '40+ Members Daily Streak', detail: '5 / 7 Days', progress: 5 / 7, icon: 'hourglass-top' as IconName },
  { title: 'Inter-Group Challenge Duels', detail: '1 / 2 Won', progress: 0.5, icon: 'radio-button-unchecked' as IconName },
];

export const kudosVault: { icon: IconName; label: string; count: string }[] = [
  { icon: 'local-fire-department', label: 'Most Consistent', count: '14x' },
  { icon: 'handshake', label: 'Team Player', count: '12x' },
  { icon: 'emoji-events', label: 'Walking Champ', count: '8x' },
  { icon: 'lightbulb', label: 'Inspiration', count: '4x' },
];

export const privacyTint: Record<GroupPrivacy, { bg: string; text: string }> = {
  'Public Group': { bg: colors.mint, text: colors.onMint },
  'Private Circle': { bg: colors.surfaceContainer, text: colors.secondary },
  Corporate: { bg: '#d3e3ff', text: colors.tertiary },
  Social: { bg: '#ece4ff', text: '#5b3f9e' },
};
