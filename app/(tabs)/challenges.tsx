import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppreciationSheet } from '@/components/AppreciationSheet';
import { StepTarget } from '@/components/StepTarget';
import { TopBar } from '@/components/TopBar';
import { AppText, Avatar, Button, Card, Field, Icon, Pill, ProgressBar, Screen, Segmented, Sheet } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { hallOfFame, quests, showdown, tournaments } from '@/data/content';
import { formatCompact, formatFull, goalProgress, initials } from '@/lib/format';
import { colors, radius } from '@/constants/theme';

type Tab = 'duel' | 'objectives' | 'individual';

export default function ChallengesScreen() {
  const {
    session,
    activity,
    bonusSteps,
    addBonus,
    joinedQuestIds,
    toggleQuest,
    extraTournaments,
    addTournament,
    showToast,
    sendAppreciation,
  } = useApp();
  const [tab, setTab] = useState<Tab>('duel');
  const [creating, setCreating] = useState(false);
  const [cheerOpen, setCheerOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState(100000);
  if (!session) return null;

  const preview = session.preview;
  const left = showdown.leftSteps + (preview ? bonusSteps : 0);
  const right = showdown.rightSteps;
  const share = left / (left + right);
  const lead = left - right;
  const progress = goalProgress(activity.today, session.dailyGoal);
  const allTournaments = [...extraTournaments, ...(preview ? tournaments : [])];

  return (
    <View style={styles.screen}>
      <TopBar title="Challenges" />
      <Screen>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { id: 'duel', label: 'Group vs Group' },
            { id: 'objectives', label: 'Objectives' },
            { id: 'individual', label: 'Individual' },
          ]}
        />

        {tab === 'duel' && preview ? (
          <>
            <Card style={styles.feature}>
              <View style={styles.row}>
                <Pill icon="timer" label={`${showdown.daysLeft} days left`} tone="mint" />
                <Pill label={showdown.tier} tone="neutral" />
              </View>
              <View style={styles.row}>
                <AppText variant="h2" style={styles.flex}>
                  {showdown.title}
                </AppText>
                <View style={styles.cup}>
                  <Icon name="emoji-events" size={18} color={colors.goldText} />
                  <AppText variant="labelSm" color={colors.goldText}>
                    {showdown.cup}
                  </AppText>
                </View>
              </View>
              <AppText variant="bodySm">Stakes: {showdown.stakes}</AppText>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <AppText variant="label">{showdown.leftName}</AppText>
                  <AppText variant="h3">{formatCompact(left, 2)}</AppText>
                  <AppText variant="labelSm" color={colors.primary}>
                    +{formatCompact(lead, 0)} lead ({(share * 100).toFixed(1)}%)
                  </AppText>
                </View>
                <View style={styles.flex}>
                  <AppText variant="label">{showdown.rightName}</AppText>
                  <AppText variant="h3">{formatCompact(right, 2)}</AppText>
                  <AppText variant="labelSm">Trailing pace</AppText>
                </View>
              </View>
              <ProgressBar progress={share} height={10} />
              <View style={styles.row}>
                <AppText variant="labelSm">Squad Share: {(share * 100).toFixed(1)}%</AppText>
                <AppText variant="labelSm">Metro: {((1 - share) * 100).toFixed(1)}%</AppText>
              </View>
              <View style={styles.impact}>
                <View style={styles.rank}>
                  <AppText variant="labelSm" color={colors.onPrimary}>
                    #4
                  </AppText>
                </View>
                <View style={styles.flex}>
                  <AppText variant="label">Your Impact</AppText>
                  <AppText variant="bodySm">{formatFull(activity.impact)} recorded steps</AppText>
                </View>
                <Pill label="Top 5 Contributor" tone="mint" />
              </View>
              <View style={styles.actions}>
                <Button
                  label="Boost Steps"
                  icon="bolt"
                  onPress={() => {
                    addBonus(500);
                    showToast('500 steps added to your day');
                  }}
                  style={styles.flex}
                />
                <Button label="Cheer" icon="favorite" variant="secondary" fullWidth={false} onPress={() => setCheerOpen(true)} style={styles.pair} />
              </View>
            </Card>

            <Card style={styles.hall}>
              <View style={styles.row}>
                <AppText variant="h3" style={styles.flex}>
                  Squad Hall of Fame
                </AppText>
                <AppText variant="bodySm" color={colors.primary}>
                  Live
                </AppText>
              </View>
              <View style={styles.podium}>
                {hallOfFame.map((person) => (
                  <View key={person.name} style={[styles.podiumCard, person.mvp && styles.podiumMvp]}>
                    <Avatar label={initials(person.name)} size={person.mvp ? 56 : 46} color={person.mvp ? colors.primary : colors.tertiary} />
                    <View style={styles.place}>
                      <AppText variant="labelSm" color={colors.onPrimary}>
                        {person.place}
                      </AppText>
                    </View>
                    <AppText variant="label" center numberOfLines={1}>
                      {person.name}
                    </AppText>
                    <AppText variant="label" color={colors.primary}>
                      {person.steps}
                    </AppText>
                    <AppText variant="labelSm">{person.tag}</AppText>
                  </View>
                ))}
              </View>
            </Card>

            <View style={styles.row}>
              <AppText variant="h3" style={styles.flex}>
                Ongoing Tournaments
              </AppText>
              <AppText variant="labelSm" color={colors.primary}>
                {allTournaments.length} Active
              </AppText>
            </View>
            {allTournaments.map((item) => (
              <Card key={item.id} style={styles.tournament}>
                <AppText variant="labelSm" color={colors.secondary}>
                  {item.detail}
                </AppText>
                <AppText variant="h3">{item.title}</AppText>
                <View style={styles.row}>
                  <AppText variant="labelSm">{item.timeLabel}</AppText>
                  <AppText variant="label">{item.time}</AppText>
                </View>
                <AppText variant="bodySm">{item.place}</AppText>
                <ProgressBar progress={item.target > 0 ? item.current / item.target : 0} />
                <AppText variant="labelSm">
                  {formatCompact(item.current, 1)} / {formatCompact(item.target, item.target >= 1_000_000 ? 0 : 0)} steps
                </AppText>
              </Card>
            ))}
          </>
        ) : null}

        {tab === 'duel' && !preview ? (
          <>
            <Card>
              <AppText variant="h3">No squad duel yet</AppText>
              <AppText variant="bodySm">Create a challenge when your circle is ready.</AppText>
            </Card>
            {extraTournaments.map((item) => (
              <Card key={item.id} style={styles.tournament}>
                <AppText variant="h3">{item.title}</AppText>
                <AppText variant="bodySm">{item.detail}</AppText>
                <ProgressBar progress={item.target > 0 ? item.current / item.target : 0} />
              </Card>
            ))}
          </>
        ) : null}

        {tab === 'objectives' && preview ? (
          <View style={styles.list}>
            <Objective title="1 Million Steps Sprint" meta="RV Uddiipta · 3 days left" progress={0.68} detail="680,000 / 1,000,000" />
            <Objective title="Every Member 5k Daily" meta="Resets at midnight" progress={38 / 45} detail="38 of 45 walkers" />
            <Objective title="Monthly 25M Steps" meta="Office Walking Challenge" progress={0.64} detail="16.0M / 25M" />
            <Objective title="Weekend 200k Sprint" meta="Friends Fitness · 14h left" progress={0.88} detail="176k / 200k" />
          </View>
        ) : null}

        {tab === 'objectives' && !preview ? (
          <Card>
            <AppText variant="bodySm">Club objectives appear after you join a circle.</AppText>
          </Card>
        ) : null}

        {tab === 'individual' ? (
          <View style={styles.list}>
            <Card style={styles.tournament}>
              <AppText variant="label">Daily goal</AppText>
              <AppText variant="h2">
                {formatFull(activity.today)} / {formatFull(session.dailyGoal)}
              </AppText>
              <ProgressBar progress={progress.ratio} />
              <AppText variant="bodySm">{progress.met ? 'Goal met for today.' : `${formatFull(progress.remaining)} steps to go.`}</AppText>
            </Card>
            {preview ? (
            <Card style={styles.tournament}>
              <AppText variant="label">5 of 7 active days</AppText>
              <AppText variant="h3">{progress.met ? '5 / 5 this stretch' : '4 / 5 this stretch'}</AppText>
              <AppText variant="bodySm">Hit your goal on five days this week to keep the Walker tier moving.</AppText>
            </Card>
            ) : null}
            <Card style={styles.tournament}>
              <AppText variant="label">Streak</AppText>
              <AppText variant="h2">{activity.streak} days</AppText>
              <AppText variant="bodySm">{formatFull(activity.km)} km traveled across {formatCompact(activity.lifetime, 2)} lifetime steps.</AppText>
            </Card>
          </View>
        ) : null}

        {preview ? (
        <>
        <AppText variant="h3">Discover Upcoming Quests</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.questRow}>
          {quests.map((quest) => {
            const joined = joinedQuestIds.includes(quest.id);
            return (
              <Card key={quest.id} style={styles.quest}>
                <View style={styles.row}>
                  <Pill icon={quest.icon} label={quest.tag} tone="mint" />
                  <AppText variant="labelSm">{quest.when}</AppText>
                </View>
                <AppText variant="label">{quest.title}</AppText>
                <AppText variant="bodySm">{quest.body}</AppText>
                <AppText variant="labelSm">{formatCompact(quest.joined, quest.joined >= 1000 ? 1 : 0)} joined</AppText>
                <Button
                  label={joined ? 'Joined' : 'Join Quest'}
                  size="sm"
                  variant={joined ? 'secondary' : 'primary'}
                  onPress={() => {
                    toggleQuest(quest.id);
                    showToast(joined ? 'Left the quest' : 'Quest joined');
                  }}
                />
              </Card>
            );
          })}
        </ScrollView>
        </>
        ) : null}

        <View style={styles.actions}>
          <Button label="Create Challenge" icon="add-circle" onPress={() => setCreating(true)} style={styles.flex} />
          <Button label="Join Public" icon="explore" variant="ghost" onPress={() => router.push('/groups')} style={styles.flex} />
        </View>
      </Screen>

      <Sheet visible={creating} title="Create challenge" onClose={() => setCreating(false)}>
        <View style={styles.list}>
          <AppText variant="bodySm">Name the challenge and set the step target yourself.</AppText>
          <Field label="Name" value={name} onChangeText={setName} placeholder="Lunch Loop Duel" icon="emoji-events" />
          <StepTarget
            value={target}
            onChange={setTarget}
            presets={[50000, 100000, 250000, 500000, 1000000]}
            min={1000}
            max={10000000}
            step={5000}
          />
          <Button
            label="Publish challenge"
            onPress={() => {
              if (name.trim().length < 2) {
                showToast('Name the challenge');
                return;
              }
              addTournament({
                title: name.trim(),
                detail: 'Created by you',
                timeLabel: 'Time left',
                time: '7 days',
                place: 'Waiting for squads',
                current: activity.today,
                target,
              });
              setCreating(false);
              setName('');
            }}
          />
        </View>
      </Sheet>
      <AppreciationSheet
        visible={cheerOpen}
        onClose={() => setCheerOpen(false)}
        recipients={preview ? ['RV Uddiipta squad', 'Marcus V.', 'Elena R.'] : []}
        onSend={(badge, to, note) =>
          sendAppreciation('rv-uddipta', {
            id: `cheer-${Date.now()}`,
            from: session.name,
            to,
            time: 'Just now',
            badge,
            quote: note.trim() || 'Cheer beamed across the squad.',
          })
        }
      />
    </View>
  );
}

function Objective({ title, meta, progress, detail }: { title: string; meta: string; progress: number; detail: string }) {
  return (
    <Card style={styles.tournament}>
      <View style={styles.row}>
        <AppText variant="label" style={styles.flex}>
          {title}
        </AppText>
        <AppText variant="label" color={colors.primary}>
          {Math.round(progress * 100)}%
        </AppText>
      </View>
      <AppText variant="bodySm">{meta}</AppText>
      <ProgressBar progress={progress} />
      <AppText variant="labelSm">{detail}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  feature: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  actions: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  pair: { alignSelf: 'stretch' },
  flex: { flex: 1 },
  cup: { alignItems: 'center', gap: 2 },
  impact: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceLow, borderRadius: radius.lg, padding: 10 },
  rank: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  hall: { gap: 12 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  podiumCard: { flex: 1, alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLow, borderRadius: radius.lg, padding: 10 },
  podiumMvp: { backgroundColor: colors.mint, paddingTop: 16 },
  place: {
    marginTop: -14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tournament: { gap: 6 },
  list: { gap: 10 },
  questRow: { gap: 12, paddingRight: 8 },
  quest: { width: 250, gap: 8 },
  inputWrap: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceLow,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  targets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
