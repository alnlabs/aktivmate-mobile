import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, Sheet } from '@/components/ui';
import { badgeStickers } from '@/data/content';
import { colors, fonts, radius } from '@/constants/theme';

export function AppreciationSheet({
  visible,
  onClose,
  recipients,
  onSend,
}: {
  visible: boolean;
  onClose: () => void;
  recipients: string[];
  onSend: (badge: string, to: string, note: string) => void;
}) {
  const [to, setTo] = useState<string | null>(null);
  const [badge, setBadge] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) {
      setTo(null);
      setBadge(null);
      setNote('');
    }
  }, [visible]);

  return (
    <Sheet visible={visible} title="Appreciate a teammate" onClose={onClose}>
      <View style={styles.stack}>
        <AppText variant="labelMd" color={colors.secondary}>
          Choose recipient
        </AppText>
        {recipients.length === 0 ? (
          <AppText variant="bodySm">No teammates in this circle yet.</AppText>
        ) : (
        <View style={styles.wrap}>
          {recipients.map((person) => {
            const selected = to === person;
            return (
              <Pressable key={person} onPress={() => setTo(person)} style={[styles.chip, selected && styles.chipOn]}>
                <AppText variant="labelMd" color={selected ? colors.primary : colors.secondary}>
                  {person}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        )}
        <AppText variant="labelMd" color={colors.secondary}>
          Select badge sticker
        </AppText>
        <View style={styles.wrap}>
          {badgeStickers.map((item) => {
            const selected = badge === item;
            return (
              <Pressable key={item} onPress={() => setBadge(item)} style={[styles.chip, selected && styles.chipOn]}>
                <AppText variant="labelMd" color={selected ? colors.primary : colors.secondary}>
                  {item}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Add a note"
          placeholderTextColor={colors.outline}
          style={styles.input}
        />
        <Button
          label="Award badge & celebrate"
          icon="send"
          disabled={!to || !badge}
          onPress={() => {
            if (!to || !badge) return;
            onSend(badge, to, note);
            onClose();
          }}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 10, paddingBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  chipOn: { backgroundColor: colors.mint, borderColor: colors.mint },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceLow,
    paddingHorizontal: 12,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
  },
});
