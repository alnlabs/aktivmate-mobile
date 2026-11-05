import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { colors, radius } from '@/constants/theme';

const tails = ['walks', 'steps', 'trail', 'stride', 'miles', 'roam', 'path', 'pace'];

export function suggestUsernames(name: string, seed = 0) {
  const parts = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = (parts[0] || 'walker').slice(0, 12);
  const last = parts.length > 1 ? parts[parts.length - 1].slice(0, 12) : '';
  const raw = [
    last ? `${first}_${last}` : `${first}_walks`,
    last ? `${first}${last}` : `${first}steps`,
    last ? `${first}${last[0]}` : `${first}go`,
    last ? `${last}_${first}` : `${first}_club`,
    ...tails.map((tail) => `${first}_${tail}`),
    ...tails.map((tail, index) => `${first}${tail}${index + 2}`),
    last ? `${first}_${last}${seed + 2}` : `${first}${seed + 2}`,
  ];
  const pool: string[] = [];
  for (const idea of raw) {
    const slug = idea.replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 20);
    if (slug.length >= 3 && !pool.includes(slug)) pool.push(slug);
  }
  const start = (seed * 4) % pool.length;
  return [0, 1, 2, 3].map((offset) => pool[(start + offset) % pool.length]);
}

export function UsernameSuggestions({
  name,
  value,
  onPick,
}: {
  name: string;
  value: string;
  onPick: (username: string) => void;
}) {
  const [seed, setSeed] = useState(0);
  const ideas = useMemo(() => suggestUsernames(name, seed), [name, seed]);

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <AppText variant="bodySm">Suggestions</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh username suggestions"
          onPress={() => setSeed((current) => current + 1)}
          style={styles.refresh}>
          <Icon name="refresh" size={18} color={colors.primary} />
        </Pressable>
      </View>
      <View style={styles.chips}>
        {ideas.map((idea) => {
          const selected = value === idea;
          return (
            <Pressable
              key={idea}
              accessibilityRole="button"
              onPress={() => onPick(idea)}
              style={[styles.chip, selected && styles.chipOn]}>
              <AppText variant="labelSm" color={selected ? colors.primary : colors.ink}>
                @{idea}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  refresh: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLow,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  chipOn: { backgroundColor: colors.mint, borderColor: '#b7e0cc' },
});
