import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StepTarget } from '@/components/StepTarget';
import { AppText, Button, Field, Sheet } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { GroupPrivacy } from '@/data/content';
import { colors, radius } from '@/constants/theme';

export function CreateGroupSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { createGroup, session, showToast } = useApp();
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState<GroupPrivacy>('Private Circle');
  const [dailyGoal, setDailyGoal] = useState(session?.dailyGoal ?? 8000);

  function close() {
    setName('');
    setPrivacy('Private Circle');
    onClose();
  }

  function submit() {
    if (name.trim().length < 2) {
      showToast('Give the circle a name');
      return;
    }
    createGroup({ name: name.trim(), privacy, dailyGoal });
    close();
  }

  return (
    <Sheet visible={visible} title="Create a circle" onClose={close}>
      <View style={styles.stack}>
        <Field label="Circle name" value={name} onChangeText={setName} placeholder="Sunrise Walkers" icon="groups" />
        <AppText variant="labelMd" color={colors.secondary}>
          Who can join
        </AppText>
        <View style={styles.row}>
          {(['Private Circle', 'Public Group'] as GroupPrivacy[]).map((option) => {
            const selected = privacy === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                onPress={() => setPrivacy(option)}
                style={[styles.choice, selected && styles.choiceOn]}>
                <AppText variant="labelMd" color={selected ? colors.primary : colors.secondary} center>
                  {option}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <AppText variant="label">Daily step target</AppText>
        <StepTarget value={dailyGoal} onChange={setDailyGoal} />
        <Button label="Create circle" icon="add-circle" onPress={submit} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12, paddingBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  choice: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 8,
  },
  choiceOn: { borderColor: colors.primary, backgroundColor: colors.surfaceLow },
});
