import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AppreciationSheet } from '@/components/AppreciationSheet';
import { StepTarget } from '@/components/StepTarget';
import { TopBar } from '@/components/TopBar';
import { AppText, Avatar, Button, Card, Icon, Pill, ProgressBar, Screen, Sheet, TextTabs } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import {
  Champion,
  clubToday,
  clubWeek,
  Group,
  rvChampions,
  rvKudos,
} from '@/data/content';
import { IconName } from '@/components/icons';
import { formatFull, formatGoal, formatShare, initials } from '@/lib/format';
import { colors, radius } from '@/constants/theme';

type Tab = 'overview' | 'leaderboard' | 'objectives' | 'applauds';
type Period = 'Today' | 'Weekly' | 'Monthly';

export default function GroupDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { session, groups, activity, bonusSteps, appreciations, sendAppreciation, joinGroup, showToast, updateGroup } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<Period>('Today');
  const [applauded, setApplauded] = useState<string[]>([]);
  const [sheet, setSheet] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const group = groups.find((item) => item.id === id);

  const isMember = !!session && !!group && session.memberGroupIds.includes(group.id);
  const squad = group ? clubToday(group, isMember, activity.today, bonusSteps) : 0;
  const week = group ? clubWeek(group, isMember, activity.today, bonusSteps) : 0;

  const champions = useMemo(() => {
    if (!group) return [];
    const you: Champion = {
      name: session?.name ?? 'You',
      steps: activity.today,
      you: true,
      goal: session?.dailyGoal ?? group.dailyGoal,
    };
    const source: Champion[] =
      session?.preview !== true
        ? [you]
        : group.id === 'rv-uddipta'
          ? rvChampions
          : [
              { name: group.organizer, steps: Math.round(group.avgSteps ?? group.dailyGoal * 1.3), goal: group.dailyGoal },
              you,
              { name: 'Jordan P.', steps: Math.round((group.avgSteps ?? group.dailyGoal) * 0.9), goal: group.dailyGoal },
              { name: 'Sam K.', steps: Math.round((group.avgSteps ?? group.dailyGoal) * 0.75), goal: group.dailyGoal },
            ];
    return source
      .map((person) => ({
        ...person,
        steps: stepsFor(person, period, activity.today, activity.weekly, activity.monthly),
        goal: person.you ? session?.dailyGoal ?? person.goal : person.goal * (period === 'Today' ? 1 : period === 'Weekly' ? 7 : 30),
      }))
      .sort((a, b) => b.steps - a.steps);
  }, [activity.monthly, activity.today, activity.weekly, group, period, session?.dailyGoal, session?.name, session?.preview]);

  if (!session || !group) {
    return (
      <View style={styles.screen}>
        <TopBar title="Groups" onBack={() => router.back()} />
        <Screen>
          <Card>
            <AppText variant="h3">That circle isn't here</AppText>
            <Button label="Back to groups" onPress={() => router.replace('/groups')} />
          </Card>
        </Screen>
      </View>
    );
  }

  const feed = [...(appreciations[group.id] ?? []), ...(session?.preview && group.id === 'rv-uddipta' ? rvKudos : [])];
  const weekRatio = group.weeklyGoal > 0 ? week / group.weeklyGoal : 0;
  const share = isMember && squad > 0 ? (activity.today / squad) * 100 : 0;
  const sprints = sprintsFor(group, week, session.preview === true);
  const recipients =
    session.preview !== true
      ? []
      : group.id === 'rv-uddipta'
        ? ['Marcus V.', 'Elena R.', 'Talia Brooks', 'Priya (Admin)']
        : [group.organizer, 'A teammate'];

  return (
    <View style={styles.screen}>
      <TopBar title="Groups" onBack={() => (router.canGoBack() ? router.back() : router.replace('/groups'))} />
      <Screen>
        <View style={styles.hero}>
          <View style={styles.heroOrb} />
          <View style={styles.heroContent}>
            <View style={styles.heroPills}>
              <Pill label={group.privacy} tone="white" />
              {group.tier ? <Pill icon="workspace-premium" label={group.tier} tone="gold" /> : null}
            </View>
            <AppText variant="bodySm" color="#d7efe4">
              {group.activity}
            </AppText>
            <AppText variant="h2" color={colors.onPrimary}>
              {group.name}
            </AppText>
            {group.league ? (
              <View style={styles.league}>
                <Icon name="military-tech" size={14} color={colors.gold} />
                <AppText variant="labelSm" color={colors.gold}>
                  {group.league}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.organizer}>
          <Avatar label={initials(group.organizer)} size={40} />
          <View style={styles.flex}>
            <AppText variant="labelSm">Organized by</AppText>
            <AppText variant="label">
              {group.organizer}
              {group.viewerRole === 'Admin' && group.organizer !== 'You' ? ' (Admin)' : ''}
            </AppText>
          </View>
          <AppText variant="bodySm">{group.members} walkers</AppText>
        </View>

        <View style={styles.actions}>
          {isMember ? (
            <Button
              label="Invite Members"
              icon="person-add"
              onPress={() => showToast(`Invite link copied for ${group.shortName}`)}
              style={styles.flex}
            />
          ) : (
            <Button label="Join circle" icon="group-add" onPress={() => joinGroup(group.id)} style={styles.flex} />
          )}
          <Button label="Share" icon="ios-share" variant="ghost" fullWidth={false} onPress={() => showToast('Club link copied')} style={styles.pair} />
        </View>

        <Card style={styles.pulse}>
          <View style={styles.row}>
            <AppText variant="bodySm">Today</AppText>
            {group.todayDelta ? (
              <AppText variant="labelSm" color={colors.primary}>
                +{group.todayDelta}%
              </AppText>
            ) : null}
          </View>
          <AppText variant="label">Collective Footsteps</AppText>
          <AppText variant="stat">{formatFull(squad)}</AppText>
          <AppText variant="bodySm">steps taken</AppText>
          <AppText variant="bodySm">
            {group.activeContributors
              ? `Averaging ${formatFull(Math.round(squad / Math.max(group.activeContributors, 1)))} steps per walker today across ${group.activeContributors} active contributors.`
              : 'Steps from everyone who checked in today.'}
          </AppText>
          <View style={styles.goalBox}>
            <View style={styles.row}>
              <AppText variant="label" color={isMember ? colors.primary : colors.ink} onPress={isMember ? () => setGoalOpen(true) : undefined}>
                Weekly goal: {formatFull(group.weeklyGoal)} steps
              </AppText>
              {group.daysLeft ? <AppText variant="labelSm">{group.daysLeft} days left</AppText> : null}
            </View>
            <ProgressBar progress={Math.min(1, weekRatio)} />
            <View style={styles.row}>
              <AppText variant="labelSm">{formatGoal(week)} logged</AppText>
              <AppText variant="labelSm" color={colors.primary}>
                {(weekRatio * 100).toFixed(1)}% reached
              </AppText>
            </View>
          </View>
        </Card>

        <TextTabs
          value={tab}
          onChange={setTab}
          options={[
            { id: 'overview', label: 'Overview' },
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'objectives', label: 'Objectives' },
            { id: 'applauds', label: 'Applauds' },
          ]}
        />

        {tab === 'overview' || tab === 'objectives' ? (
          <View style={styles.block}>
            <View style={styles.row}>
              <AppText variant="h3" style={styles.flex}>
                Active Sprints
              </AppText>
              {tab === 'overview' ? (
                <Pressable onPress={() => setTab('objectives')}>
                  <AppText variant="label" color={colors.primary}>
                    View All
                  </AppText>
                </Pressable>
              ) : null}
            </View>
            {sprints.map((sprint) => (
              <Card key={sprint.title} style={styles.sprint}>
                <View style={styles.row}>
                  <View style={styles.sprintTitle}>
                    <Icon name={sprint.icon} size={18} color={colors.primary} />
                    <AppText variant="label">{sprint.title}</AppText>
                  </View>
                  <AppText variant="label" color={colors.primary}>
                    {Math.round(sprint.progress * 100)}%
                  </AppText>
                </View>
                <AppText variant="bodySm">{sprint.meta}</AppText>
                <ProgressBar progress={sprint.progress} />
                <AppText variant="labelSm">{sprint.detail}</AppText>
                <AppText variant="bodySm">{sprint.hint}</AppText>
              </Card>
            ))}
          </View>
        ) : null}

        {tab === 'overview' || tab === 'leaderboard' ? (
          <View style={styles.block}>
            <View style={styles.row}>
              <AppText variant="h3" style={styles.flex}>
                Step Champions
              </AppText>
              <View style={styles.periods}>
                {(['Today', 'Weekly', 'Monthly'] as Period[]).map((item) => (
                  <Pressable key={item} onPress={() => setPeriod(item)} style={[styles.period, period === item && styles.periodOn]}>
                    <AppText variant="labelSm" color={period === item ? colors.onPrimary : colors.secondary}>
                      {item}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>
            {(tab === 'overview' ? champions.slice(0, 4) : champions).map((person, index) => {
              const met = person.steps >= person.goal;
              const sent = applauded.includes(person.name);
              return (
                <View key={person.name} style={styles.person}>
                  <AppText variant="label" color={colors.outline}>
                    {index + 1}
                  </AppText>
                  <Avatar label={initials(person.name)} size={40} color={person.you ? colors.primary : colors.tertiary} />
                  <View style={styles.flex}>
                    <AppText variant="label">{person.name}</AppText>
                    <AppText variant="bodySm">
                      {formatFull(person.steps)} steps{met ? ' • Goal Met' : person.you ? ` • ${Math.min(100, Math.round((person.steps / person.goal) * 100))}% of goal` : ''}
                    </AppText>
                  </View>
                  {person.you ? (
                    <Pill label={met ? 'Goal met' : 'Active'} tone="mint" />
                  ) : (
                    <Button
                      label={sent ? 'Sent' : 'Applaud'}
                      size="sm"
                      variant="secondary"
                      fullWidth={false}
                      disabled={sent}
                      onPress={() => {
                        setApplauded((prev) => [...prev, person.name]);
                        showToast(`Applauded ${person.name}`);
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ) : null}

        {tab === 'overview' || tab === 'applauds' ? (
          <View style={styles.block}>
            <View style={styles.row}>
              <AppText variant="h3" style={styles.flex}>
                Kudos & Appreciations
              </AppText>
              <AppText variant="labelSm" color={colors.primary}>
                Live Feed
              </AppText>
            </View>
            {feed.length === 0 ? (
              <Card>
                <AppText variant="bodySm">No appreciations yet. Send the first sticker.</AppText>
              </Card>
            ) : (
              feed.map((item) => (
                <Card key={item.id} style={styles.kudo}>
                  <View style={styles.row}>
                    <Avatar label={initials(item.from)} size={36} />
                    <View style={styles.flex}>
                      <AppText variant="label">
                        {item.from} awarded {item.to}
                      </AppText>
                      <AppText variant="labelSm">{item.time}</AppText>
                    </View>
                  </View>
                  <Pill label={item.badge} tone="gold" />
                  <AppText variant="body">“{item.quote}”</AppText>
                </Card>
              ))
            )}
          </View>
        ) : null}

        {isMember ? (
          <View style={styles.bottomActions}>
            <Button label="Send Appreciation" icon="volunteer-activism" onPress={() => setSheet(true)} style={styles.flex} />
            <Button
              label="Invite"
              icon="group-add"
              variant="secondary"
              fullWidth={false}
              onPress={() => showToast(`Invite link copied for ${group.shortName}`)}
            />
          </View>
        ) : null}
        {isMember ? (
          <AppText variant="labelSm" center>
            Your share today is {formatShare(share)} of {group.shortName}.
          </AppText>
        ) : (
          <AppText variant="bodySm" center>
            You're previewing this circle. Join to add your steps to the total.
          </AppText>
        )}
      </Screen>
      <Sheet visible={goalOpen} title="Circle step target" onClose={() => setGoalOpen(false)}>
        <StepTarget
          value={group.dailyGoal}
          onChange={(dailyGoal) => updateGroup(group.id, { dailyGoal, weeklyGoal: dailyGoal * 7 })}
        />
      </Sheet>
      <AppreciationSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        recipients={recipients}
        onSend={(badge, to, note) =>
          sendAppreciation(group.id, {
            id: `local-${Date.now()}`,
            from: session.name,
            to,
            time: 'Just now',
            badge,
            quote: note.trim() || `Celebrating you with the ${badge} sticker.`,
          })
        }
      />
    </View>
  );
}

function stepsFor(person: Champion, period: Period, today: number, weekly: number, monthly: number) {
  if (person.you) {
    if (period === 'Weekly') return weekly;
    if (period === 'Monthly') return monthly;
    return today;
  }
  if (period === 'Weekly') return person.steps * 5;
  if (period === 'Monthly') return person.steps * 18;
  return person.steps;
}

function sprintsFor(group: Group, week: number, preview: boolean) {
  if (preview && group.id === 'rv-uddipta') {
    return [
      {
        icon: 'directions-walk' as IconName,
        title: '1 Million Steps Sprint',
        meta: 'Collective Target • 3 days left',
        progress: 0.68,
        detail: '680,000 / 1,000,000 steps',
        hint: '320k to unlock medal',
      },
      {
        icon: 'task-alt' as IconName,
        title: 'Every Member 5k Daily',
        meta: 'Daily Consistency • Reset at 12 AM',
        progress: 38 / 45,
        detail: '38 of 45 completed',
        hint: '7 more members to cheer!',
      },
    ];
  }
  const progress = group.weeklyGoal > 0 ? Math.min(1, week / group.weeklyGoal) : 0;
  return [
    {
      icon: 'flag' as IconName,
      title: `${formatGoal(group.weeklyGoal)} Weekly Sprint`,
      meta: 'Club target',
      progress,
      detail: `${formatFull(week)} / ${formatFull(group.weeklyGoal)} steps`,
      hint: progress >= 1 ? 'Target reached' : 'Keep the circle moving',
    },
  ];
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 148, borderRadius: 12, backgroundColor: colors.hero, overflow: 'hidden', justifyContent: 'flex-end' },
  heroOrb: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: colors.heroDeep, right: -30, top: -40 },
  heroContent: { padding: 16, gap: 4 },
  heroPills: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  league: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 4 },
  organizer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actions: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  pair: { alignSelf: 'stretch' },
  pulse: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  goalBox: { gap: 8, marginTop: 6, backgroundColor: colors.surfaceLow, borderRadius: radius.lg, padding: 12 },
  block: { gap: 10 },
  sprint: { gap: 6 },
  sprintTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  periods: { flexDirection: 'row', backgroundColor: colors.surfaceContainer, borderRadius: radius.pill, padding: 3 },
  period: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  periodOn: { backgroundColor: colors.primary },
  person: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kudo: { gap: 8 },
  bottomActions: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
});
