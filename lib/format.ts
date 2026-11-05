export const BASE_ACTIVITY = {
  today: 8420,
  weekly: 58940,
  monthly: 241500,
  lifetime: 3420000,
  streak: 14,
  impact: 112400,
};

export function withBonus(bonus: number, preview = true) {
  if (!preview) {
    return {
      today: bonus,
      weekly: bonus,
      monthly: bonus,
      lifetime: bonus,
      streak: 0,
      impact: bonus,
      km: Math.round(bonus * 0.00075),
    };
  }
  const lifetime = BASE_ACTIVITY.lifetime + bonus;
  return {
    today: BASE_ACTIVITY.today + bonus,
    weekly: BASE_ACTIVITY.weekly + bonus,
    monthly: BASE_ACTIVITY.monthly + bonus,
    lifetime,
    streak: BASE_ACTIVITY.streak,
    impact: BASE_ACTIVITY.impact + bonus,
    km: Math.round(lifetime * 0.00075),
  };
}

export type Activity = ReturnType<typeof withBonus>;

export function formatFull(value: number) {
  return Math.round(value).toLocaleString('en-US');
}

export function clampSteps(value: number, min = 1000, max = 100000) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function formatCompact(value: number, digits = 1) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(digits)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(digits)}k`;
  return Math.round(value).toLocaleString('en-US');
}

export function formatGoal(value: number) {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    if (Number.isInteger(millions)) {
      return `${millions < 10 ? millions.toFixed(1) : millions.toFixed(0)}M`;
    }
    return `${millions.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${Number.isInteger(thousands) ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
  }
  return formatFull(value);
}

export function formatShare(value: number) {
  return `${value.toFixed(1)}%`;
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'there';
}

export function initials(name: string) {
  const cleaned = name.replace(/\(you\)/i, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'A';
}

export function goalProgress(today: number, goal: number) {
  const safeGoal = goal > 0 ? goal : 1;
  const ratio = today / safeGoal;
  return {
    ratio: Math.min(1, Math.max(0, ratio)),
    percent: Math.min(100, Math.round(ratio * 100)),
    remaining: Math.max(0, goal - today),
    met: today >= goal,
  };
}

export function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
