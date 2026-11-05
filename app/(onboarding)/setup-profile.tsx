import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StepTarget } from '@/components/StepTarget';
import { UsernameSuggestions } from '@/components/UsernameSuggestions';
import { AppText, Button, Card, Field, Icon, IconButton, LogoMark, Screen } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { avatars, goalOptions, motivations } from '@/data/content';
import { formatFull } from '@/lib/format';
import { takeProfilePhoto } from '@/lib/permissions';
import { colors, radius } from '@/constants/theme';

export default function SetupProfileScreen() {
  const insets = useSafeAreaInsets();
  const { draft, setDraft, showToast, signInDemo } = useApp();
  const selectedAvatar = avatars.find((item) => item.id === draft.avatar) ?? avatars[2];
  const usernameOk = /^[a-z0-9_]{3,}$/.test(draft.username);
  const weekly = draft.dailyGoal * 7;

  function continueNext() {
    if (draft.name.trim().length < 2) {
      showToast('Add your name');
      return;
    }
    if (!usernameOk) {
      showToast('Use 3+ letters, numbers, or underscores');
      return;
    }
    if (draft.city.trim().length < 2) {
      showToast('Add your city');
      return;
    }
    router.push('/setup-squad');
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <IconButton
            icon="arrow-back"
            label="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
          />
          <LogoMark width={52} />
          <View style={styles.spacer} />
        </View>
        <View style={styles.stepRow}>
          <AppText variant="bodySm">Step 1 of 3</AppText>
        </View>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
      </View>
      <Screen
        footer={
          <View style={styles.footer}>
            <Button label="Continue" iconRight="arrow-forward" onPress={continueNext} />
            <Button label="Open Alex sample" variant="ghost" onPress={() => signInDemo()} />
          </View>
        }>
        <View>
          <AppText variant="h1">Your profile</AppText>
          <AppText variant="body" color={colors.secondary}>
            This is how your club sees you.
          </AppText>
        </View>
        <Card style={styles.avatarCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Snap a photo"
            onPress={() => {
              void takeProfilePhoto().then((photoUri) => {
                if (photoUri) setDraft({ photoUri });
                else showToast('Camera or photo access was not allowed when the app opened');
              });
            }}
            style={styles.avatarButton}>
            <View style={styles.bigAvatar}>
              {draft.photoUri ? (
                <Image source={{ uri: draft.photoUri }} style={styles.photo} />
              ) : (
                <Icon name={selectedAvatar.icon} size={40} color={colors.primary} />
              )}
            </View>
            <View style={styles.camera}>
              <Icon name="photo-camera" size={14} color={colors.onPrimary} />
            </View>
          </Pressable>
          <AppText variant="bodySm" center>
            Select an avatar or snap a photo
          </AppText>
          <View style={styles.avatarRow}>
            {avatars.map((avatar) => {
              const selected = draft.avatar === avatar.id;
              return (
                <Pressable
                  key={avatar.id}
                  accessibilityLabel={avatar.label}
                  onPress={() => setDraft({ avatar: avatar.id })}
                  style={[styles.avatarChoice, selected && styles.avatarChoiceOn]}>
                  <Icon name={avatar.icon} size={20} color={selected ? colors.primary : colors.secondary} />
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Field label="Full Name" value={draft.name} onChangeText={(name) => setDraft({ name })} icon="badge" />
        <Field
          label="Username / Handle"
          value={draft.username}
          onChangeText={(username) => setDraft({ username: username.replace(/^@/, '').toLowerCase() })}
          icon="alternate-email"
          autoCapitalize="none"
          autoCorrect={false}
          trailing={
            usernameOk ? (
              <View style={styles.available}>
                <Icon name="check-circle" size={16} color={colors.primary} />
                <AppText variant="labelSm" color={colors.primary}>
                  Available
                </AppText>
              </View>
            ) : null
          }
        />
        <UsernameSuggestions name={draft.name} value={draft.username} onPick={(username) => setDraft({ username })} />
        <Field
          label="Primary City / Region"
          value={draft.city}
          onChangeText={(city) => setDraft({ city })}
          icon="location-on"
        />

        <View style={styles.sectionHead}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Daily Step Baseline
          </AppText>
          <View style={styles.anchor}>
            <AppText variant="labelSm" color={colors.primary}>
              Squad Anchor
            </AppText>
          </View>
        </View>
        <AppText variant="bodySm">Pick a pace or type your own. You can change it later from Home or Settings.</AppText>
        {goalOptions.map((option) => {
          const selected = draft.dailyGoal === option.steps;
          return (
            <Pressable
              key={option.steps}
              onPress={() => setDraft({ dailyGoal: option.steps })}
              style={[styles.goal, selected && styles.goalOn]}>
              <View style={[styles.goalIcon, selected && styles.goalIconOn]}>
                <Icon name={option.icon} size={18} color={selected ? colors.onPrimary : colors.primary} />
              </View>
              <View style={styles.goalCopy}>
                <View style={styles.goalTitle}>
                  <AppText variant="label">{option.title}</AppText>
                  {option.recommended ? (
                    <AppText variant="labelSm" color={colors.primary}>
                      Recommended
                    </AppText>
                  ) : null}
                </View>
                <AppText variant="bodySm">{option.subtitle}</AppText>
              </View>
              <View style={[styles.radio, selected && styles.radioOn]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
        <StepTarget showPresets={false} value={draft.dailyGoal} onChange={(dailyGoal) => setDraft({ dailyGoal })} />

        <Card style={styles.impact}>
          <Icon name="groups" size={20} color={colors.primary} />
          <View style={styles.goalCopy}>
            <AppText variant="label">Squad Contribution Impact</AppText>
            <AppText variant="bodySm">
              Based on {formatFull(draft.dailyGoal)} steps/day, you will contribute ~{formatFull(weekly)} steps weekly to your squad.
            </AppText>
          </View>
        </Card>

        <AppText variant="h3">Motivation Focus</AppText>
        <AppText variant="bodySm">What fuels your daily steps? Select all that inspire you.</AppText>
        <View style={styles.chips}>
          {motivations.map((item) => {
            const selected = draft.motivations.includes(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  setDraft({
                    motivations: selected
                      ? draft.motivations.filter((id) => id !== item.id)
                      : [...draft.motivations, item.id],
                  })
                }
                style={[styles.chip, selected && styles.chipOn]}>
                <AppText variant="labelMd" color={selected ? colors.primary : colors.secondary}>
                  {item.label} {item.emoji}
                </AppText>
                {selected ? <Icon name="check" size={14} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 16, gap: 10, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spacer: { width: 44 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progress: { height: 6, borderRadius: 99, backgroundColor: colors.track, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  footer: { gap: 8 },
  avatarCard: { alignItems: 'center', gap: 10 },
  avatarButton: { width: 96, height: 96 },
  bigAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.mint,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: 96, height: 96 },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  avatarRow: { flexDirection: 'row', gap: 10 },
  avatarChoice: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  avatarChoiceOn: { borderColor: colors.primary, backgroundColor: colors.surfaceLow },
  available: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  sectionTitle: { flex: 1 },
  anchor: { backgroundColor: colors.mint, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: radius.lg,
    padding: 12,
    backgroundColor: colors.card,
  },
  goalOn: { borderColor: colors.primary, backgroundColor: colors.surfaceLow },
  goalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIconOn: { backgroundColor: colors.primary },
  goalCopy: { flex: 1, gap: 2 },
  goalTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  impact: { flexDirection: 'row', gap: 10, backgroundColor: colors.surfaceLow },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  chipOn: { backgroundColor: colors.mint, borderColor: '#b7e0cc' },
});
