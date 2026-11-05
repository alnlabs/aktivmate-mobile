import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { CreateGroupSheet } from '@/components/CreateGroupSheet';
import { TopBar } from '@/components/TopBar';
import { AppText, Button, List, ListRow, Pill, Screen, Section } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { colors } from '@/constants/theme';

export default function GroupsScreen() {
  const { session, groups, joinGroup } = useApp();
  const [creating, setCreating] = useState(false);
  if (!session) return null;

  const mine = groups.filter((group) => session.memberGroupIds.includes(group.id));
  const discover = groups.filter((group) => !group.inviteOnly && !session.memberGroupIds.includes(group.id));

  return (
    <View style={styles.screen}>
      <TopBar title="Groups" />
      <Screen>
        <Button label="Create circle" icon="group-add" variant="secondary" onPress={() => setCreating(true)} />
        <Section title={`Your circles (${mine.length})`}>
          {mine.length === 0 ? (
            <AppText variant="bodySm">Join a club below, or create a private circle.</AppText>
          ) : (
            <List>
              {mine.map((group) => (
                <ListRow
                  key={group.id}
                  title={group.name}
                  subtitle={`${group.viewerRole} · ${group.members} members · ${group.tier ?? group.privacy}`}
                  onPress={() => router.push(`/groups/${group.id}`)}
                />
              ))}
            </List>
          )}
        </Section>

        <Section title="Discover">
          {discover.length === 0 ? (
            <AppText variant="bodySm">
              {session.preview ? "You're in every public circle on this preview." : 'No public circles to join yet.'}
            </AppText>
          ) : (
            <List>
              {discover.map((group) => (
                <ListRow
                  key={group.id}
                  title={group.name}
                  subtitle={`${group.members} members${group.trend ? ` · ${group.trend}` : ''}${group.rally ? ` · ${group.rally}` : ''}`}
                  trailing={
                    <View style={styles.actions}>
                      <Button label="Join" size="sm" fullWidth={false} onPress={() => joinGroup(group.id)} />
                    </View>
                  }
                  onPress={() => router.push(`/groups/${group.id}`)}
                />
              ))}
            </List>
          )}
        </Section>
        {session.preview ? <Pill icon="lock" label="Invite-only circles open with a club token" tone="neutral" /> : null}
      </Screen>
      <CreateGroupSheet visible={creating} onClose={() => setCreating(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  actions: { alignItems: 'flex-end' },
});
