import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconName } from '@/components/icons';
import { AppText, Icon, IconButton, LogoMark, Sheet } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { colors } from '@/constants/theme';

const notes: { icon: IconName; title: string; body: string; time: string }[] = [
  { icon: 'favorite', title: 'Priya Sharma sent kudos', body: 'Most Consistent Walker', time: '2h ago' },
  { icon: 'emoji-events', title: 'Corporate Spring Showdown', body: 'Round 2 · Day 4 of 7', time: 'Today' },
];

export function TopBar({
  title,
  kicker = 'AktivMate',
  showKicker = false,
  onBack,
}: {
  title: string;
  kicker?: string;
  showKicker?: boolean;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { lastSync, session } = useApp();
  const preview = session?.preview === true;
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.bar, { paddingTop: insets.top + (onBack ? 0 : 4) }]}>
      {onBack ? (
        <View style={styles.nav}>
          <IconButton icon="arrow-back" label="Go back" onPress={onBack} />
          <AppText variant="label" numberOfLines={1} style={styles.navTitle}>
            {title}
          </AppText>
          <IconButton icon="notifications" label="Notifications" onPress={() => setOpen(true)} />
        </View>
      ) : (
        <View style={styles.large}>
          <LogoMark width={46} />
          <View style={styles.titles}>
            {showKicker ? (
              <AppText variant="section" color={colors.primary}>
                {kicker}
              </AppText>
            ) : null}
            <AppText variant="h1" numberOfLines={1}>
              {title}
            </AppText>
          </View>
          <IconButton icon="notifications" label="Notifications" onPress={() => setOpen(true)} />
        </View>
      )}
      <Sheet visible={open} title="Notifications" onClose={() => setOpen(false)}>
        <View style={styles.notes}>
          {preview ? (
            notes.map((note) => (
              <View key={note.title} style={styles.note}>
                <View style={styles.noteIcon}>
                  <Icon name={note.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.noteCopy}>
                  <AppText variant="label">{note.title}</AppText>
                  <AppText variant="bodySm">{note.body}</AppText>
                </View>
                <AppText variant="labelSm">{note.time}</AppText>
              </View>
            ))
          ) : (
            <AppText variant="bodySm">No alerts yet.</AppText>
          )}
          <View style={styles.note}>
            <View style={styles.noteIcon}>
              <Icon name="sync" size={18} color={colors.primary} />
            </View>
            <View style={styles.noteCopy}>
              <AppText variant="label">{preview ? 'Apple Health' : 'Step sync'}</AppText>
              <AppText variant="bodySm">{preview ? `Synced ${lastSync}` : lastSync === 'Not synced' ? 'Not synced yet' : `Updated ${lastSync}`}</AppText>
            </View>
            <AppText variant="labelSm">{lastSync}</AppText>
          </View>
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 8,
    paddingBottom: 4,
    backgroundColor: colors.surface,
  },
  large: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, gap: 10 },
  nav: { flexDirection: 'row', alignItems: 'center' },
  navTitle: { flex: 1, textAlign: 'center' },
  titles: { flex: 1 },
  notes: { gap: 10, paddingBottom: 8 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCopy: { flex: 1 },
});
