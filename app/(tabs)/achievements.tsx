import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TopBar } from '@/components/TopBar';
import { AppText, Button, Card, Icon, ProgressBar, Screen, Sheet } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { careerTiers, groupMilestones, honors } from '@/data/content';
import { colors, radius } from '@/constants/theme';

const tabs = [
  { id: 'individual', label: 'Individual Career' },
  { id: 'group', label: 'Group Career' },
  { id: 'honors', label: 'Honors Wall' },
] as const;

export default function AchievementsScreen() {
  const { session, showToast } = useApp();
  const preview = session?.preview === true;
  const [active, setActive] = useState<(typeof tabs)[number]['id']>('individual');
  const [certificate, setCertificate] = useState(false);

  return (
    <View style={styles.screen}>
      <TopBar title="Achievements" />
      <View style={styles.tools}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => {
            const selected = active === tab.id;
            return (
              <Pressable key={tab.id} onPress={() => setActive(tab.id)} style={[styles.tab, selected && styles.tabOn]}>
                <AppText variant="labelMd" color={selected ? colors.primary : colors.secondary}>
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable onPress={() => setCertificate(true)} style={styles.certBtn}>
          <Icon name="workspace-premium" size={16} color={colors.primary} />
          <AppText variant="labelSm" color={colors.primary}>
            My Certificates
          </AppText>
        </Pressable>
      </View>
      <Screen>
        {!preview ? (
          <Card style={styles.card}>
            <AppText variant="h3">No career yet</AppText>
            <AppText variant="bodySm">Your record starts at zero. Tiers and honors show up as you walk with a circle.</AppText>
          </Card>
        ) : null}
        {preview && active === 'individual' ? (
        <View style={styles.block}>
          <AppText variant="bodySm" color={colors.primary}>
            Season 4
          </AppText>
          <Card style={styles.card}>
            <View style={styles.row}>
              <AppText variant="bodySm" color={colors.primary}>
                Individual tier
              </AppText>
              <AppText variant="labelSm">Level 3 of 7</AppText>
            </View>
            <View style={styles.row}>
              <AppText variant="h2">Walker</AppText>
              <View style={styles.active}>
                <AppText variant="labelSm" color={colors.onMint}>
                  Active
                </AppText>
              </View>
              <AppText variant="h2" color={colors.primary}>
                78%
              </AppText>
            </View>
            <AppText variant="bodySm">Next: Achiever (Tier 4)</AppText>
            <ProgressBar progress={0.78} />
            <AppText variant="bodySm">Estimated upgrade in 3 active days</AppText>
            <AppText variant="label">Unlock Requirements for Achiever</AppText>
            <Requirement icon="directions-walk" title="Group Steps Contribution" value="39,000 / 50,000" hint="11,000 steps left to target" progress={39000 / 50000} />
            <Requirement icon="favorite" title="Appreciations Received" value="4 / 5" hint="1 appreciation needed from a club mate" progress={0.8} />
          </Card>
          <AppText variant="bodySm">Career path</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.path}>
            {careerTiers.map((tier) => (
              <View key={tier.label} style={styles.tier}>
                <View style={[styles.tierIcon, tier.state === 'current' && styles.tierCurrent, tier.state === 'locked' && styles.tierLocked]}>
                  <Icon
                    name={tier.icon}
                    size={16}
                    color={tier.state === 'locked' ? colors.outline : tier.state === 'current' ? colors.onPrimary : colors.primary}
                  />
                </View>
                <AppText variant="labelSm" color={tier.state === 'current' ? colors.primary : colors.secondary} center>
                  {tier.label}
                </AppText>
              </View>
            ))}
          </ScrollView>
        </View>
        ) : null}

        {preview && active === 'group' ? (
          <Card style={styles.card}>
            <View style={styles.row}>
              <AppText variant="bodySm" color={colors.tertiary}>
                Club career
              </AppText>
              <AppText variant="labelSm">Tier 3 of 5</AppText>
            </View>
            <AppText variant="h3">RV Uddiipta Walking Club</AppText>
            <AppText variant="bodySm">Growing Community Status</AppText>
            <View style={styles.row}>
              <View style={styles.active}>
                <AppText variant="labelSm" color={colors.onMint}>
                  #14 National
                </AppText>
              </View>
              <AppText variant="labelSm">League Div 1</AppText>
            </View>
            <View style={styles.row}>
              <AppText variant="label" style={styles.flex}>
                Progress to Champion Community
              </AppText>
              <AppText variant="label" color={colors.primary}>
                68%
              </AppText>
            </View>
            <ProgressBar progress={0.68} />
            <View style={styles.metrics}>
              <Metric value="14.8M" label="Collective Steps" />
              <Metric value="94.2%" label="30-Day Streak" note="Top 2%" />
              <Metric value="78%" label="Win Rate" note="14 Duels" />
            </View>
            <View style={styles.row}>
              <AppText variant="label" style={styles.flex}>
                Tier 4 Promotion Milestones
              </AppText>
              <AppText variant="labelSm" color={colors.primary}>
                2/3 in progress
              </AppText>
            </View>
            {groupMilestones.map((item) => (
              <View key={item.title} style={styles.milestone}>
                <Icon name={item.icon} size={18} color={colors.primary} />
                <View style={styles.flex}>
                  <AppText variant="label">{item.title}</AppText>
                  <ProgressBar progress={item.progress} height={6} />
                </View>
                <AppText variant="labelSm">{item.detail}</AppText>
              </View>
            ))}
          </Card>
        ) : null}

        {preview && active === 'honors' ? (
        <View style={styles.block}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <AppText variant="h3">Honors & Awards Hall</AppText>
              <AppText variant="bodySm">Verified collective accomplishments</AppText>
            </View>
            <AppText variant="labelSm" color={colors.primary}>
              4 Badges Unlocked
            </AppText>
          </View>
          <View style={styles.honorGrid}>
            {honors.map((honor) => (
              <Card key={honor.title} style={styles.honor}>
                <Icon name={honor.icon} size={22} color={colors.goldText} />
                <AppText variant="label">{honor.title}</AppText>
                <AppText variant="labelSm">{honor.meta}</AppText>
                <View style={styles.honorNote}>
                  <AppText variant="labelSm">{honor.note}</AppText>
                </View>
              </Card>
            ))}
          </View>
        </View>
        ) : null}

        {preview && active === 'honors' ? (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Icon name="verified-user" size={22} color={colors.primary} />
              <View style={styles.flex}>
                <AppText variant="h3">Official Credentials</AppText>
                <AppText variant="bodySm">Season 4 verification for the club record</AppText>
              </View>
            </View>
            <AppText variant="body">
              Your collective milestones qualify all 48 members of RV Uddiipta Walking Club for the official Tier 3 Community Accreditation badge.
            </AppText>
            <Button label="Download Verified Community Certificate" icon="download" onPress={() => setCertificate(true)} />
            <Button
              label="Share Honors to Feed"
              icon="share"
              variant="secondary"
              onPress={() => showToast('Honors shared to the community feed')}
            />
          </Card>
        ) : null}

        <View style={styles.footer}>
          <AppText variant="label" center>
            Track Together. Achieve Together.
          </AppText>
          <AppText variant="bodySm" center>
            Season 4 concludes in 24 days • Next League Evaluation May 31
          </AppText>
        </View>
      </Screen>
      <Sheet visible={certificate} title="Community certificate" onClose={() => setCertificate(false)}>
        <View style={styles.card}>
          <AppText variant="bodySm" color={colors.primary}>
            AktivMate · Season 4
          </AppText>
          <AppText variant="h2">Tier 3 Community Accreditation</AppText>
          <AppText variant="body">RV Uddiipta Walking Club, including Alex Mercer, is recorded as a Tier 3 walking community.</AppText>
          <Button
            label="Save PDF"
            icon="download"
            onPress={() => {
              setCertificate(false);
              showToast('Certificate saved to this device preview');
            }}
          />
        </View>
      </Sheet>
    </View>
  );
}

function Requirement({
  icon,
  title,
  value,
  hint,
  progress,
}: {
  icon: 'directions-walk' | 'favorite';
  title: string;
  value: string;
  hint: string;
  progress: number;
}) {
  return (
    <View style={styles.requirement}>
      <View style={styles.row}>
        <Icon name={icon} size={16} color={colors.primary} />
        <AppText variant="label" style={styles.flex}>
          {title}
        </AppText>
        <AppText variant="labelSm">{value}</AppText>
      </View>
      <ProgressBar progress={progress} height={6} />
      <AppText variant="labelSm">{hint}</AppText>
    </View>
  );
}

function Metric({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <View style={styles.metric}>
      <AppText variant="h3">{value}</AppText>
      <AppText variant="labelSm">{label}</AppText>
      {note ? (
        <AppText variant="labelSm" color={colors.primary}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  tools: { paddingBottom: 8, gap: 8 },
  tabs: { gap: 8, paddingHorizontal: 16 },
  tab: { paddingHorizontal: 4, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: colors.primary },
  certBtn: {
    alignSelf: 'flex-end',
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  block: { gap: 10 },
  card: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  active: { backgroundColor: colors.mint, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  path: { gap: 12, paddingVertical: 4 },
  tier: { width: 72, alignItems: 'center', gap: 6 },
  tierIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierCurrent: { backgroundColor: colors.primary },
  tierLocked: { backgroundColor: colors.surfaceContainer },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, backgroundColor: colors.surfaceLow, borderRadius: radius.lg, padding: 10, gap: 2 },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1, gap: 4 },
  honorGrid: { gap: 10 },
  honor: { gap: 6 },
  honorNote: { backgroundColor: colors.surfaceLow, borderRadius: radius.sm, padding: 6 },
  requirement: { gap: 6 },
  footer: { gap: 4, paddingVertical: 8 },
});
