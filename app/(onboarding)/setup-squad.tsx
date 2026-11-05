import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Avatar, Button, Card, Icon, IconButton, LogoMark, Pill, Screen } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { formatFull } from '@/lib/format';
import { colors, fonts, radius } from '@/constants/theme';

export default function SetupSquadScreen() {
  const insets = useSafeAreaInsets();
  const { draft, setDraft, groups, applyInvite, completeOnboarding, showToast } = useApp();
  const [code, setCode] = useState(draft.inviteCode);
  const [message, setMessage] = useState<{ ok: boolean; message: string } | null>(null);

  const recommended = groups.filter((group) => group.id === 'rv-uddipta' || group.id === 'metro-morning');
  const selectedExtra =
    draft.selectedGroupId &&
    draft.selectedGroupId !== 'custom' &&
    !recommended.some((group) => group.id === draft.selectedGroupId)
      ? groups.find((group) => group.id === draft.selectedGroupId)
      : null;

  function finish() {
    if (draft.selectedGroupId === 'custom' && draft.customName.trim().length < 2) {
      showToast('Name your circle to continue');
      return;
    }
    if (!draft.selectedGroupId) {
      showToast('Choose a squad, or explore solo');
      return;
    }
    completeOnboarding('join');
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <IconButton icon="arrow-back" label="Back" onPress={() => router.back()} />
          <LogoMark width={52} />
          <View style={styles.spacer} />
        </View>
        <View style={styles.stepRow}>
          <AppText variant="bodySm">Step 2 of 3</AppText>
        </View>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
      </View>
      <Screen
        footer={
          <View style={styles.footer}>
            <Button label="Done" iconRight="check" onPress={finish} />
            <Pressable onPress={() => completeOnboarding('solo')}>
              <AppText variant="label" center color={colors.secondary}>
                Explore solo first (Join a group later)
              </AppText>
            </Pressable>
          </View>
        }>
        <AppText variant="h1">Find a circle</AppText>
        <AppText variant="body" color={colors.secondary}>
          Join a club with a code, or start one for people you walk with.
        </AppText>

        <Card style={styles.invite}>
          <View style={styles.inviteHead}>
            <AppText variant="label">Have a Club Invite Code?</AppText>
            <Icon name="qr-code-scanner" size={20} color={colors.primary} />
          </View>
          <AppText variant="bodySm">Enter your team's 5-character token to directly enter private challenges.</AppText>
          <View style={styles.codeRow}>
            <View style={styles.codeField}>
              <AppText variant="labelMd">AKTIV</AppText>
              <View style={styles.codeRule} />
              <TextInput
                value={code}
                onChangeText={(value) => setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="WALK"
                placeholderTextColor={colors.outline}
                style={styles.codeInput}
              />
            </View>
            <Button label="Apply" fullWidth={false} onPress={() => setMessage(applyInvite(code))} style={styles.apply} />
          </View>
          {message ? (
            <AppText variant="bodySm" color={message.ok ? colors.primary : colors.error}>
              {message.message}
            </AppText>
          ) : null}
        </Card>

        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Recommended Public Circles
          </AppText>
          <AppText variant="labelSm" color={colors.primary}>
            Nearby • Active Now
          </AppText>
        </View>

        {selectedExtra ? (
          <SquadCard
            name={selectedExtra.name}
            meta={selectedExtra.tier ?? selectedExtra.activity}
            detail={`${selectedExtra.members} walkers`}
            selected
            onPress={() => setDraft({ selectedGroupId: selectedExtra.id })}
          />
        ) : null}

        {recommended.map((group) => (
          <SquadCard
            key={group.id}
            name={group.name}
            meta={group.id === 'rv-uddipta' ? '98% match' : group.trend}
            detail={`${group.members} ${group.id === 'metro-morning' ? 'members' : 'walkers'}${group.distanceKm ? ` · ${group.distanceKm} km nearby` : ''}`}
            extra={group.id === 'rv-uddipta' ? `Step goal: ${formatFull(group.dailyGoal)} / day` : group.rally}
            faces={group.id === 'rv-uddipta' ? ['AL', 'KT', 'MS'] : undefined}
            selected={draft.selectedGroupId === group.id}
            onPress={() => setDraft({ selectedGroupId: group.id })}
          />
        ))}

        <Pressable
          onPress={() => setDraft({ selectedGroupId: 'custom' })}
          style={[styles.create, draft.selectedGroupId === 'custom' && styles.createOn]}>
          <View style={styles.plus}>
            <Icon name="add-circle" size={22} color={colors.primary} />
          </View>
          <View style={styles.createCopy}>
            <AppText variant="label">Create My Own Circle</AppText>
            <AppText variant="bodySm">Start a custom private hub for friends, household, or coworkers</AppText>
            {draft.selectedGroupId === 'custom' ? (
              <TextInput
                value={draft.customName}
                onChangeText={(customName) => setDraft({ customName })}
                placeholder="Circle name"
                placeholderTextColor={colors.outline}
                style={styles.nameInput}
              />
            ) : null}
          </View>
          <Radio selected={draft.selectedGroupId === 'custom'} />
        </Pressable>

        <Card style={styles.syncCard}>
          <View style={styles.inviteHead}>
            <AppText variant="h3">Step Telemetry Sync</AppText>
            <Icon name="monitor-heart" size={22} color={colors.primary} />
          </View>
          <AppText variant="bodySm">Automatic background coordination via Apple Health & Health Connect.</AppText>
          <Toggle
            icon="directions-walk"
            title="Daily Steps & Distance"
            body="Read-only real-time tracking"
            value={draft.syncSteps}
            onPress={() => {
              const next = !draft.syncSteps;
              setDraft({ syncSteps: next });
            }}
          />
          <Toggle
            icon="sync"
            title="Background Auto-Update"
            body="Battery-friendly low-energy sync"
            value={draft.syncBackground}
            onPress={() => {
              const next = !draft.syncBackground;
              setDraft({ syncBackground: next });
            }}
          />
          <View style={styles.privacy}>
            <Icon name="verified-user" size={18} color={colors.primary} />
            <AppText variant="bodySm" style={styles.privacyText}>
              <AppText variant="label">Privacy Promise: </AppText>
              Your biometric readings are end-to-end encrypted on-device. Never sold to third parties, never utilized for ad-tracking.
            </AppText>
          </View>
        </Card>
      </Screen>
    </View>
  );
}

function SquadCard({
  name,
  meta,
  detail,
  extra,
  faces,
  selected,
  onPress,
}: {
  name: string;
  meta?: string;
  detail: string;
  extra?: string;
  faces?: string[];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.squad, selected && styles.squadOn]}>
      <View style={styles.thumb}>
        <Icon name="park" size={22} color={colors.onPrimary} />
      </View>
      <View style={styles.createCopy}>
        <AppText variant="label">{name}</AppText>
        <View style={styles.metaRow}>
          {meta ? <Pill label={meta} tone="mint" /> : null}
        </View>
        <AppText variant="bodySm">{detail}</AppText>
        {faces ? (
          <View style={styles.faces}>
            {faces.map((face) => (
              <Avatar key={face} label={face} size={22} />
            ))}
          </View>
        ) : null}
        {extra ? (
          <AppText variant="labelSm" color={colors.primary}>
            {extra}
          </AppText>
        ) : null}
      </View>
      <Radio selected={selected} />
    </Pressable>
  );
}

function Radio({ selected }: { selected: boolean }) {
  return <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.radioDot} /> : null}</View>;
}

function Toggle({
  icon,
  title,
  body,
  value,
  onPress,
}: {
  icon: 'directions-walk' | 'sync';
  title: string;
  body: string;
  value: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.toggle}>
      <Icon name={icon} size={20} color={colors.primary} />
      <View style={styles.createCopy}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="bodySm">{body}</AppText>
      </View>
      <View style={[styles.check, value && styles.checkOn]}>{value ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
    </Pressable>
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
  footer: { gap: 10 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  invite: { gap: 10 },
  inviteHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeField: {
    flex: 1,
    minWidth: 0,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceLow,
  },
  codeRule: { width: 1, alignSelf: 'stretch', marginVertical: 12, backgroundColor: colors.stroke },
  codeInput: {
    flex: 1,
    minWidth: 0,
    height: 48,
    paddingVertical: 0,
    fontFamily: fonts.semibold,
    fontSize: 17,
    letterSpacing: 1,
    color: colors.ink,
  },
  apply: { height: 50, paddingHorizontal: 16 },
  section: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { flex: 1 },
  squad: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.card,
  },
  squadOn: { borderColor: colors.primary, backgroundColor: colors.surfaceLow },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCopy: { flex: 1, gap: 4 },
  metaRow: { flexDirection: 'row' },
  faces: { flexDirection: 'row', gap: 4 },
  create: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.card,
    alignItems: 'flex-start',
  },
  createOn: { borderColor: colors.primary },
  plus: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    marginTop: 6,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  syncCard: { gap: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  privacy: { flexDirection: 'row', gap: 8, backgroundColor: colors.surfaceLow, borderRadius: radius.lg, padding: 12 },
  privacyText: { flex: 1 },
});