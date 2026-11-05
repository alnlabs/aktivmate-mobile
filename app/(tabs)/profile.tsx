import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppreciationSheet } from '@/components/AppreciationSheet';
import { StepTarget } from '@/components/StepTarget';
import { UsernameSuggestions } from '@/components/UsernameSuggestions';
import { TopBar } from '@/components/TopBar';
import { AppText, Avatar, Button, Card, Field, Icon, List, ListRow, Pill, ProgressBar, Screen, Section, Sheet } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { avatars, kudosVault } from '@/data/content';
import { formatFull, formatGoal, goalProgress } from '@/lib/format';
import { takeProfilePhoto } from '@/lib/permissions';
import { colors } from '@/constants/theme';

export default function ProfileScreen() {
  const { session, groups, activity, loveCount, sendLove, updateSession, signOut, showToast, sendAppreciation } = useApp();
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState(false);
  const [appreciate, setAppreciate] = useState(false);
  const [name, setName] = useState(session?.name ?? '');
  const [username, setUsername] = useState(session?.username ?? '');
  const [city, setCity] = useState(session?.city ?? '');
  const [goal, setGoal] = useState(session?.dailyGoal ?? 10000);
  if (!session) return null;

  const avatar = avatars.find((item) => item.id === session.avatar) ?? avatars[2];
  const preview = session.preview;
  const progress = goalProgress(activity.today, session.dailyGoal);
  const mine = groups.filter((group) => session.memberGroupIds.includes(group.id));
  const primary = groups.find((group) => group.id === session.primaryGroupId);
  const days = preview
    ? [
        { label: 'Mon', done: true },
        { label: 'Tue', done: true },
        { label: 'Wed', done: true },
        { label: 'Thu', done: true },
        { label: 'Today', done: progress.met },
      ]
    : [{ label: 'Today', done: progress.met }];

  function openEdit() {
    if (!session) return;
    setName(session.name);
    setUsername(session.username);
    setCity(session.city);
    setGoal(session.dailyGoal);
    setEditing(true);
  }

  return (
    <View style={styles.screen}>
      <TopBar title="Profile" />
      <Screen>
        <Card style={styles.headerCard}>
          <View style={styles.identity}>
            <View>
              <View style={styles.avatar}>
                {session.photoUri ? (
                  <Image source={{ uri: session.photoUri }} style={styles.photo} />
                ) : (
                  <Icon name={avatar.icon} size={32} color={colors.primary} />
                )}
              </View>
              <View style={styles.verified}>
                <Icon name="verified" size={14} color={colors.onPrimary} />
              </View>
            </View>
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <AppText variant="h2" style={styles.name} numberOfLines={2}>
                  {session.name}
                </AppText>
                <View style={styles.toolRow}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Share profile" onPress={() => showToast('Profile link copied')} style={styles.tool}>
                    <Icon name="share" size={18} color={colors.ink} />
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => setSettings(true)} style={styles.tool}>
                    <Icon name="settings" size={18} color={colors.ink} />
                  </Pressable>
                </View>
              </View>
              <AppText variant="bodySm">
                @{session.username}
                {preview ? ' • Joined Feb 2024' : session.city ? ` • ${session.city}` : ''}
              </AppText>
              {preview ? (
              <View style={styles.pills}>
                <Pill icon={avatar.icon} label="Level 3: Walker" tone="mint" />
              </View>
              ) : null}
              <AppText variant="bodySm">
                {primary ? `#${primary.yourRank > 0 ? primary.yourRank : 1} in ${primary.name}` : 'Walking solo for now'}
              </AppText>
            </View>
          </View>
          {preview ? (
          <View style={styles.loveRow}>
            <Avatar label="P" size={28} />
            <Avatar label="M" size={28} color={colors.tertiary} />
            <View style={styles.flex}>
              <AppText variant="bodySm">Loved by {loveCount} teammates this month</AppText>
            </View>
            <Button label="Cheer" icon="favorite" size="sm" fullWidth={false} onPress={sendLove} />
          </View>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <AppText variant="h3">{activity.streak}d Streak</AppText>
              <AppText variant="bodySm">{preview ? 'Personal best in 2024' : 'Starts when you hit your goal'}</AppText>
            </View>
            <Pill label="Active" tone="green" />
          </View>
          <AppText variant="bodySm">Achieve {formatFull(session.dailyGoal)} steps 5/7 days</AppText>
          <AppText variant="label">{preview ? (progress.met ? '5 / 5 Done' : '4 / 5 Done') : progress.met ? 'Goal met today' : '0 / 5 Done'}</AppText>
          <View style={styles.days}>
            {days.map((day) => (
              <View key={day.label} style={styles.day}>
                <View style={[styles.dayMark, day.done && styles.dayDone]}>
                  <Icon name={day.done ? 'check' : 'hourglass-top'} size={14} color={day.done ? colors.onPrimary : colors.primary} />
                </View>
                <AppText variant="labelSm">{day.label}</AppText>
              </View>
            ))}
          </View>
        </Card>

        <Section title="Steps">
          <List>
            <ListRow title="Today" subtitle={`${progress.percent}% of ${formatGoal(session.dailyGoal)} goal`} value={formatFull(activity.today)} />
            <ListRow title="This week" subtitle={preview ? '+12% vs last week' : 'This week'} value={formatFull(activity.weekly)} />
            <ListRow title="This month" subtitle={preview ? 'Top quartile pace' : 'This month'} value={formatGoal(activity.monthly)} />
            <ListRow title="All time" subtitle={`${formatFull(activity.km)} km`} value={formatGoal(activity.lifetime)} />
          </List>
        </Section>

        <Section title="Circles">
          {mine.length === 0 ? (
            <AppText variant="bodySm">Join a circle from Groups to appear on a leaderboard.</AppText>
          ) : (
            <List>
              {mine.map((group) => (
                <ListRow
                  key={group.id}
                  title={group.name}
                  subtitle={group.id === 'rv-uddipta' ? 'Share of squad volume' : group.standingNote}
                  value={group.yourRank > 0 ? `#${group.yourRank}` : 'New'}
                />
              ))}
            </List>
          )}
        </Section>

        {preview ? (
        <>
        <Section title="Kudos">
          <List>
            {kudosVault.map((item) => (
              <ListRow key={item.label} title={item.label} value={String(item.count)} />
            ))}
          </List>
        </Section>
        <Card style={styles.quote}>
          <Avatar label="PS" size={36} />
          <View style={styles.flex}>
            <View style={styles.row}>
              <AppText variant="label" style={styles.name} numberOfLines={1}>Priya Sharma</AppText>
              <AppText variant="labelSm">2h ago</AppText>
            </View>
            <AppText variant="bodySm">Awarded: Most Consistent Walker</AppText>
            <AppText variant="body">"Your morning pace motivated the entire RV Uddiipta crew!"</AppText>
          </View>
        </Card>
        <ProgressBar progress={0.78} />
        <AppText variant="labelSm" center>
          Walker tier is 78% of the way to Achiever.
        </AppText>
        </>
        ) : null}

        <View style={styles.actions}>
          <Button label="Send Appreciation" icon="volunteer-activism" onPress={() => setAppreciate(true)} />
          <Button label="Edit Profile" icon="edit" variant="ghost" onPress={openEdit} />
        </View>
      </Screen>

      <Sheet visible={editing} title="Edit profile" onClose={() => setEditing(false)}>
        <View style={styles.form}>
          <Field label="Full name" value={name} onChangeText={setName} icon="badge" />
          <Field
            label="Username"
            value={username}
            onChangeText={(value) => setUsername(value.replace(/^@/, '').toLowerCase())}
            icon="alternate-email"
            autoCapitalize="none"
          />
          <UsernameSuggestions name={name} value={username} onPick={setUsername} />
          <Field label="City" value={city} onChangeText={setCity} icon="location-on" />
          <AppText variant="label">Daily goal</AppText>
          <StepTarget value={goal} onChange={setGoal} />
          <Button
            label="Save profile"
            onPress={() => {
              if (name.trim().length < 2 || !/^[a-z0-9_]{3,}$/.test(username)) {
                showToast('Check your name and username');
                return;
              }
              updateSession({ name: name.trim(), username, city: city.trim(), dailyGoal: goal });
              setEditing(false);
              showToast('Profile updated');
            }}
          />
        </View>
      </Sheet>

      <Sheet visible={settings} title="Settings" onClose={() => setSettings(false)}>
        <View style={styles.form}>
          <AppText variant="body">Location, motion, alerts, and photos are requested when AktivMate opens. Your city and walking path use that location.</AppText>
          <Button
            label="Choose profile photo"
            icon="photo-camera"
            variant="secondary"
            onPress={() => {
              void takeProfilePhoto().then((photoUri) => {
                if (!photoUri) {
                  showToast('Camera or photo access was not allowed when the app opened');
                  return;
                }
                updateSession({ photoUri });
                showToast('Profile photo updated');
              });
            }}
          />
          <AppText variant="label">Daily step target</AppText>
          <StepTarget value={session.dailyGoal} onChange={(dailyGoal) => updateSession({ dailyGoal })} />
          <AppText variant="bodySm">{session.email}</AppText>
          <Button
            label="Sign out"
            variant="ghost"
            onPress={() => {
              setSettings(false);
              signOut();
            }}
          />
        </View>
      </Sheet>

      <AppreciationSheet
        visible={appreciate}
        onClose={() => setAppreciate(false)}
        recipients={preview && primary ? ['Priya Sharma', 'Marcus V.', 'Elena R.'] : []}
        onSend={(badge, to, note) => {
          if (!session.primaryGroupId) {
            showToast('Join a circle before sending a badge');
            return;
          }
          sendAppreciation(session.primaryGroupId, {
            id: `profile-${Date.now()}`,
            from: session.name,
            to,
            time: 'Just now',
            badge,
            quote: note.trim() || `Your morning pace motivated the crew.`,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  headerCard: { gap: 12 },
  identity: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.mint,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: 72, height: 72 },
  verified: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, minWidth: 0, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  name: { flex: 1, minWidth: 0 },
  pills: { flexDirection: 'row', flexWrap: 'wrap' },
  toolRow: { flexDirection: 'row' },
  tool: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  card: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  actions: { gap: 8 },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 4 },
  dayMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDone: { backgroundColor: colors.primary },
  live: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { width: '48%', flexGrow: 1, gap: 4, padding: 12 },
  standing: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  squadIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rankCol: { alignItems: 'flex-end' },
  vault: { width: '48%', flexGrow: 1, gap: 4, padding: 12 },
  quote: { flexDirection: 'row', gap: 10 },
  form: { gap: 12, paddingBottom: 8 },
});