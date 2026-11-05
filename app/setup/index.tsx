import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StepTarget } from '@/components/StepTarget';
import { UsernameSuggestions } from '@/components/UsernameSuggestions';
import { AppText, Button, Card, Field, Icon, Screen } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { avatars, goalOptions, motivations } from '@/data/content';
import { formatFull } from '@/lib/format';
import { takeProfilePhoto } from '@/lib/permissions';
import { colors, radius } from '@/constants/theme';

export default function AccountSetupScreen() {
  const insets = useSafeAreaInsets();
  const { accountDraft, setAccountDraft, showToast } = useApp();
  if (!accountDraft) return null;
  const profile = accountDraft;

  const selectedAvatar = avatars.find((item) => item.id === profile.avatar) ?? avatars[0];
  const usernameOk = /^[a-z0-9_]{3,}$/.test(profile.username);
  const weekly = profile.dailyGoal * 7;

  function continueNext() {
    if (profile.name.trim().length < 2) {
      showToast('Add your name');
      return;
    }
    if (!usernameOk) {
      showToast('Use 3+ letters, numbers, or underscores');
      return;
    }
    if (profile.city.trim().length < 2) {
      showToast('Add your city');
      return;
    }
    router.push('/setup/ready');
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <AppText variant="bodySm">Step 1 of 2</AppText>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>
      <Screen
        footer={<Button label="Continue" iconRight="arrow-forward" onPress={continueNext} />}>
        <View>
          <AppText variant="h1">Set up your account</AppText>
          <AppText variant="body" color={colors.secondary}>
            Tell your club who you are and the pace you want to keep.
          </AppText>
        </View>
        <Card style={styles.avatarCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add a profile photo"
            onPress={() => {
              void takeProfilePhoto().then((photoUri) => {
                if (photoUri) setAccountDraft({ photoUri });
                else showToast('Camera or photo access was not allowed when the app opened');
              });
            }}
            style={styles.avatarButton}>
            <View style={styles.bigAvatar}>
              {profile.photoUri ? (
                <Image source={{ uri: profile.photoUri }} style={styles.photo} />
              ) : (
                <Icon name={selectedAvatar.icon} size={40} color={colors.primary} />
              )}
            </View>
            <View style={styles.camera}>
              <Icon name="photo-camera" size={14} color={colors.onPrimary} />
            </View>
          </Pressable>
          <View style={styles.avatarRow}>
            {avatars.map((avatar) => {
              const selected = profile.avatar === avatar.id;
              return (
                <Pressable
                  key={avatar.id}
                  accessibilityLabel={avatar.label}
                  onPress={() => setAccountDraft({ avatar: avatar.id })}
                  style={[styles.avatarChoice, selected && styles.avatarChoiceOn]}>
                  <Icon name={avatar.icon} size={20} color={selected ? colors.primary : colors.secondary} />
                </Pressable>
              );
            })}
          </View>
        </Card>
        <Field label="Full name" value={profile.name} onChangeText={(name) => setAccountDraft({ name })} icon="badge" />
        <Field
          label="Username"
          value={profile.username}
          onChangeText={(username) => setAccountDraft({ username: username.replace(/^@/, '').toLowerCase() })}
          icon="alternate-email"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <UsernameSuggestions name={profile.name} value={profile.username} onPick={(username) => setAccountDraft({ username })} />
        <Field label="City" value={profile.city} onChangeText={(city) => setAccountDraft({ city })} icon="location-on" />
        <AppText variant="h3">Daily step goal</AppText>
        {goalOptions.map((option) => {
          const selected = profile.dailyGoal === option.steps;
          return (
            <Pressable key={option.steps} onPress={() => setAccountDraft({ dailyGoal: option.steps })} style={[styles.goal, selected && styles.goalOn]}>
              <View style={styles.goalCopy}>
                <AppText variant="label">{option.title}</AppText>
                <AppText variant="bodySm">{option.subtitle}</AppText>
              </View>
              <AppText variant="label">{formatFull(option.steps)}</AppText>
            </Pressable>
          );
        })}
        <StepTarget showPresets={false} value={profile.dailyGoal} onChange={(dailyGoal) => setAccountDraft({ dailyGoal })} />
        <AppText variant="bodySm">About {formatFull(weekly)} steps a week at this pace.</AppText>
        <AppText variant="h3">What keeps you walking?</AppText>
        <View style={styles.chips}>
          {motivations.map((item) => {
            const selected = profile.motivations.includes(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  setAccountDraft({
                    motivations: selected
                      ? profile.motivations.filter((id) => id !== item.id)
                      : [...profile.motivations, item.id],
                  })
                }
                style={[styles.chip, selected && styles.chipOn]}>
                <AppText variant="labelMd" color={selected ? colors.primary : colors.secondary}>
                  {item.label} {item.emoji}
                </AppText>
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
  header: { paddingHorizontal: 20, gap: 8, paddingBottom: 8 },
  progress: { height: 6, borderRadius: 99, backgroundColor: colors.track, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  avatarCard: { alignItems: 'center', gap: 12 },
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
  goalCopy: { flex: 1, gap: 2 },
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
