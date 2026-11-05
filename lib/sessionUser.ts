import type { User } from '@supabase/supabase-js';

import { type AvatarId, type Session } from '@/data/content';

const avatars: AvatarId[] = ['walk', 'nordic', 'hike', 'trophy'];

export function signedInHref(session: Pick<Session, 'preview' | 'onboarded'>) {
  return !session.preview && !session.onboarded ? '/setup' : '/home';
}

export function sessionFromUser(user: User, previous: Session | null): Session {
  const email = user.email ?? previous?.email ?? '';
  const meta = user.user_metadata ?? {};
  const googleName = text(meta.full_name) || text(meta.name);
  const onboarded = meta.onboarded === true;
  const samePerson = Boolean(previous && email && previous.email === email && previous.preview === false);
  if (samePerson && previous) return { ...previous, email, preview: false, onboarded: previous.onboarded || onboarded };

  const name = text(meta.full_name) || googleName || email.split('@')[0] || 'Walker';
  return {
    name,
    username: text(meta.username) || usernameFrom(name, email),
    city: text(meta.city),
    email,
    dailyGoal: goalFrom(meta.daily_goal),
    motivations: stringList(meta.motivations),
    avatar: avatarFrom(meta.avatar),
    memberGroupIds: [],
    primaryGroupId: null,
    preview: false,
    onboarded,
  };
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function goalFrom(value: unknown) {
  const goal = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(goal) && goal > 0 ? Math.round(goal) : 8000;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function avatarFrom(value: unknown): AvatarId {
  return avatars.includes(value as AvatarId) ? (value as AvatarId) : 'walk';
}

function usernameFrom(name: string, email: string) {
  const source = name || email.split('@')[0] || 'walker';
  const slug = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);
  return slug.length >= 3 ? slug : 'walker';
}
