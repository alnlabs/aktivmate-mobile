import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { CreateGroupSheet } from '@/components/CreateGroupSheet';
import { StepTarget } from '@/components/StepTarget';
import { TopBar } from '@/components/TopBar';
import { WalkSketch } from '@/components/WalkSketch';
import { AppText, Button, Card, List, ListRow, ProgressBar, Screen, Section, Sheet } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { firstName, formatFull, goalProgress } from '@/lib/format';
import { colors } from '@/constants/theme';

export default function HomeScreen() {
  const { session, groups, activity, routes, sharingWalk, startSharingWalk, stopSharingWalk, refreshSync, updateSession } = useApp();
  const [creating, setCreating] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  if (!session) return null;

  const mine = groups
    .filter((group) => session.memberGroupIds.includes(group.id))
    .sort((a, b) => (a.id === session.primaryGroupId ? -1 : b.id === session.primaryGroupId ? 1 : 0));
  const progress = goalProgress(activity.today, session.dailyGoal);

  return (
    <View style={styles.screen}>
      <TopBar title={`Hi, ${firstName(session.name)}`} showKicker={false} />
      <Screen
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          refreshSync();
          setTimeout(() => setRefreshing(false), 600);
        }}>
        <View style={styles.today}>
          <AppText variant="bodySm">Today</AppText>
          <AppText variant="stat">{formatFull(activity.today)}</AppText>
          <Pressable accessibilityRole="button" onPress={() => setGoalOpen(true)}>
            <AppText variant="bodySm" color={colors.primary}>
              of {formatFull(session.dailyGoal)} steps
              {progress.met ? ' · goal met' : ` · ${formatFull(progress.remaining)} to go`}
            </AppText>
          </Pressable>
          <ProgressBar progress={progress.ratio} height={6} />
        </View>

        <Section
          title="Groups"
          action={<Button label="New" size="sm" variant="secondary" fullWidth={false} onPress={() => setCreating(true)} />}>
          {mine.length === 0 ? (
            <View style={styles.empty}>
              <AppText variant="body">You are not in a circle yet.</AppText>
              <Button label="Find a circle" onPress={() => router.push('/groups')} />
            </View>
          ) : (
            <List>
              {mine.map((group) => (
                <ListRow
                  key={group.id}
                  title={group.name}
                  subtitle={`${group.members} walkers`}
                  value={formatFull(group.todaySteps)}
                  onPress={() => router.push(`/groups/${group.id}`)}
                />
              ))}
            </List>
          )}
        </Section>

        <Section title="Walking paths">
          <AppText variant="bodySm">
            {session.preview
              ? 'Sample walkers stay on the map. Your own point is your current location.'
              : 'Your route starts where you are. Sharing keeps it live for your circle.'}
          </AppText>
          <Button
            label={sharingWalk ? 'Stop sharing' : 'Share my walk'}
            variant={sharingWalk ? 'secondary' : 'primary'}
            onPress={() => {
              if (sharingWalk) stopSharingWalk();
              else void startSharingWalk();
            }}
          />
          {routes.length === 0 ? (
            <AppText variant="body">No routes yet.</AppText>
          ) : (
            routes.map((route) => (
              <Card key={route.id} style={styles.path}>
                <AppText variant="label">
                  {route.name}
                  {route.live ? ' · live' : ''}
                </AppText>
                <WalkSketch points={route.points} live={route.live} />
              </Card>
            ))
          )}
        </Section>
      </Screen>
      <CreateGroupSheet visible={creating} onClose={() => setCreating(false)} />
      <Sheet visible={goalOpen} title="Daily step target" onClose={() => setGoalOpen(false)}>
        <StepTarget value={session.dailyGoal} onChange={(dailyGoal) => updateSession({ dailyGoal })} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  today: { gap: 6, paddingHorizontal: 4 },
  empty: { gap: 12 },
  path: { gap: 8 },
});
