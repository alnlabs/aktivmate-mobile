import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  demoSession,
  Draft,
  Group,
  initialDraft,
  initialGroups,
  Kudo,
  mockGroupIds,
  mockRoutes,
  makeCustomGroup,
  AccountSetup,
  Session,
  Tournament,
  WalkRoute,
} from '@/data/content';
import { Activity, firstName, withBonus } from '@/lib/format';
import { signInWithGoogle as startGoogleSignIn, watchAuthReturn } from '@/lib/googleAuth';
import { readStepAccess, requestStartupPermissions, watchNewSteps, type UserPlace } from '@/lib/permissions';
import { sessionFromUser } from '@/lib/sessionUser';
import { supabase } from '@/utils/supabase';
import * as Location from 'expo-location';

type AppContextValue = {
  authReady: boolean;
  session: Session | null;
  draft: Draft;
  groups: Group[];
  activity: Activity;
  bonusSteps: number;
  loveCount: number;
  thanksSent: boolean;
  joinedQuestIds: string[];
  lastSync: string;
  appreciations: Record<string, Kudo[]>;
  extraTournaments: Tournament[];
  toast: string | null;
  accountDraft: AccountSetup | null;
  setDraft: (patch: Partial<Draft>) => void;
  setAccountDraft: (patch: Partial<AccountSetup>) => void;
  finishSetup: (circleName: string) => Promise<boolean>;
  signInDemo: (email?: string) => void;
  loadMockCatalog: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  updateSession: (patch: Partial<Session>) => void;
  completeOnboarding: (mode: 'join' | 'solo') => void;
  applyInvite: (code: string) => { ok: boolean; message: string };
  createGroup: (input: { name: string; privacy: Group['privacy']; dailyGoal?: number }) => void;
  updateGroup: (id: string, patch: Partial<Group>) => void;
  joinGroup: (id: string) => void;
  addBonus: (steps: number) => void;
  sendLove: () => void;
  markThanks: () => void;
  toggleQuest: (id: string) => void;
  refreshSync: () => void;
  routes: WalkRoute[];
  sharingWalk: boolean;
  startSharingWalk: () => Promise<void>;
  stopSharingWalk: () => void;
  sendAppreciation: (groupId: string, kudo: Kudo) => void;
  addTournament: (tournament: Omit<Tournament, 'id'>) => void;
  showToast: (message: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [draft, setDraftState] = useState<Draft>(initialDraft);
  const [accountDraft, setAccountDraftState] = useState<AccountSetup | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [bonusSteps, setBonusSteps] = useState(0);
  const [deviceSteps, setDeviceSteps] = useState(0);
  const [routes, setRoutes] = useState<WalkRoute[]>([]);
  const [sharingWalk, setSharingWalk] = useState(false);
  const [place, setPlace] = useState<UserPlace | null>(null);
  const placeRef = useRef<UserPlace | null>(null);
  const walkWatch = useRef<Location.LocationSubscription | null>(null);
  const [loveCount, setLoveCount] = useState(18);
  const [thanksSent, setThanksSent] = useState(false);
  const [joinedQuestIds, setJoinedQuestIds] = useState<string[]>([]);
  const [lastSync, setLastSync] = useState('2m ago');
  const [appreciations, setAppreciations] = useState<Record<string, Kudo[]>>({});
  const [extraTournaments, setExtraTournaments] = useState<Tournament[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const setDraft = useCallback((patch: Partial<Draft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setAccountDraft = useCallback((patch: Partial<AccountSetup>) => {
    setAccountDraftState((prev) => {
      if (!session || session.preview) return prev;
      const base: AccountSetup = prev ?? {
        name: session.name,
        username: session.username,
        city: session.city,
        dailyGoal: session.dailyGoal,
        motivations: session.motivations,
        avatar: session.avatar,
        photoUri: session.photoUri ?? null,
      };
      return { ...base, ...patch };
    });
  }, [session]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (next?.user) {
        const user = next.user;
        setSession((prev) => {
          const next = sessionFromUser(user, prev);
          const memberGroupIds = next.memberGroupIds.filter((id) => !mockGroupIds.has(id));
          return {
            ...next,
            city: next.city || placeRef.current?.city || '',
            preview: false,
            memberGroupIds,
            primaryGroupId: memberGroupIds.includes(next.primaryGroupId ?? '') ? next.primaryGroupId : null,
          };
        });
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setGroups([]);
          setLoveCount(0);
          setLastSync('Not synced');
          setBonusSteps(0);
          setThanksSent(false);
          setJoinedQuestIds([]);
          setAppreciations({});
          setExtraTournaments([]);
          setRoutes([]);
          setSharingWalk(false);
          walkWatch.current?.remove();
          walkWatch.current = null;
        }
        if (event === 'SIGNED_IN' && user.user_metadata?.onboarded === true) {
          const meta = user.user_metadata ?? {};
          const googleName = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : '';
          showToast(`Welcome, ${firstName(googleName || user.email?.split('@')[0] || 'Walker')}`);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
      }
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [showToast]);

  useEffect(() => watchAuthReturn(showToast), [showToast]);

  useEffect(() => {
    let active = true;
    void requestStartupPermissions().then((result) => {
      if (!active || !result.place) return;
      placeRef.current = result.place;
      setPlace(result.place);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!place) return;
    const point = { latitude: place.latitude, longitude: place.longitude, at: Date.now() };
    const name = session?.name || 'You';
    setRoutes((current) => {
      const mine = current.find((route) => route.mine);
      if (!mine) return [...current, { id: 'me', name, live: false, mine: true, points: [point] }];
      if (mine.points.length > 0 && mine.name === name) return current;
      return current.map((route) =>
        route.mine ? { ...route, name, points: route.points.length > 0 ? route.points : [point] } : route,
      );
    });
    if (!place.city) return;
    setSession((prev) => (prev && !prev.city ? { ...prev, city: place.city } : prev));
    setDraftState((prev) => (prev.city.trim() ? prev : { ...prev, city: place.city }));
    setAccountDraftState((prev) => (prev && !prev.city.trim() ? { ...prev, city: place.city } : prev));
  }, [place, session?.name]);

  useEffect(() => {
    if (!session || (!session.preview && !session.onboarded)) return;
    const applySteps = !session.preview;
    let stopWatch: (() => void) | null = null;
    let active = true;
    void requestStartupPermissions()
      .then(() => readStepAccess())
      .then((access) => {
      if (!active || !applySteps) return;
      const baseline = access.today ?? 0;
      setDeviceSteps(baseline);
      if (access.status !== 'granted') return;
      stopWatch = watchNewSteps((stepsSinceStart) => setDeviceSteps(baseline + stepsSinceStart));
    });
    return () => {
      active = false;
      stopWatch?.();
    };
  }, [session?.email, session?.onboarded, session?.preview]);

  const signInDemo = useCallback(
    (email?: string) => {
      if (!__DEV__) return;
      setSession({ ...demoSession, email: email?.trim() || demoSession.email });
      setGroups(initialGroups);
      setLoveCount(18);
      setLastSync('2m ago');
      setBonusSteps(0);
      setThanksSent(false);
      setJoinedQuestIds([]);
      setAppreciations({});
      setExtraTournaments([]);
      setRoutes(mockRoutes);
      setSharingWalk(false);
      showToast('Welcome back, Alex');
    },
    [showToast],
  );

  const loadMockCatalog = useCallback(() => {
    if (!__DEV__) return;
    setGroups((current) => (current.some((group) => mockGroupIds.has(group.id)) ? current : initialGroups));
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await startGoogleSignIn();
  }, []);

  const signOut = useCallback(() => {
    void supabase.auth.signOut();
    setSession(null);
    setDraftState(initialDraft);
    setAccountDraftState(null);
    setGroups([]);
    setBonusSteps(0);
    setDeviceSteps(0);
    setRoutes([]);
    setSharingWalk(false);
    walkWatch.current?.remove();
    walkWatch.current = null;
    setLoveCount(0);
    setThanksSent(false);
    setJoinedQuestIds([]);
    setLastSync('Not synced');
    setAppreciations({});
    setExtraTournaments([]);
    showToast('Signed out');
  }, [showToast]);

  const updateSession = useCallback((patch: Partial<Session>) => {
    setSession((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const completeOnboarding = useCallback(
    (mode: 'join' | 'solo') => {
      if (!__DEV__) return;
      const name = draft.name.trim();
      if (mode === 'solo') {
        setSession({
          name,
          username: draft.username.trim().replace(/^@/, ''),
          city: draft.city.trim(),
          email: `${draft.username.trim().replace(/^@/, '')}@walkingclub.org`,
          dailyGoal: draft.dailyGoal,
          motivations: draft.motivations,
          avatar: draft.avatar,
          photoUri: draft.photoUri ?? null,
          memberGroupIds: [],
          primaryGroupId: null,
          preview: true,
          onboarded: true,
        });
        showToast(`Welcome, ${firstName(name)}`);
        return;
      }

      if (draft.selectedGroupId === 'custom') {
        const group = makeCustomGroup(draft.customName, draft.city, draft.dailyGoal, 'Private Circle');
        setGroups((prev) => [group, ...prev]);
        setSession({
          name,
          username: draft.username.trim().replace(/^@/, ''),
          city: draft.city.trim(),
          email: `${draft.username.trim().replace(/^@/, '')}@walkingclub.org`,
          dailyGoal: draft.dailyGoal,
          motivations: draft.motivations,
          avatar: draft.avatar,
          photoUri: draft.photoUri ?? null,
          memberGroupIds: [group.id],
          primaryGroupId: group.id,
          preview: true,
          onboarded: true,
        });
        showToast(`${group.name} is ready`);
        return;
      }

      if (!draft.selectedGroupId) {
        showToast('Choose a squad, or explore solo');
        return;
      }

      setSession({
        name,
        username: draft.username.trim().replace(/^@/, ''),
        city: draft.city.trim(),
        email: `${draft.username.trim().replace(/^@/, '')}@walkingclub.org`,
        dailyGoal: draft.dailyGoal,
        motivations: draft.motivations,
        avatar: draft.avatar,
        photoUri: draft.photoUri ?? null,
        memberGroupIds: [draft.selectedGroupId],
        primaryGroupId: draft.selectedGroupId,
        preview: true,
        onboarded: true,
      });
      showToast(`Welcome, ${firstName(name)}`);
    },
    [draft, showToast],
  );

  const finishSetup = useCallback(
    async (circleName: string) => {
      if (!session || session.preview || !accountDraft) return false;
      const name = accountDraft.name.trim();
      const username = accountDraft.username.trim().replace(/^@/, '');
      const city = accountDraft.city.trim();
      const { error } = await supabase.auth.updateUser({
        data: {
          onboarded: true,
          full_name: name,
          username,
          city,
          daily_goal: accountDraft.dailyGoal,
          motivations: accountDraft.motivations,
          avatar: accountDraft.avatar,
        },
      });
      if (error) {
        showToast(error.message);
        return false;
      }
      const circle = circleName.trim();
      const group = circle ? makeCustomGroup(circle, city, accountDraft.dailyGoal, 'Private Circle') : null;
      setGroups(group ? [group] : []);
      setSession({
        ...session,
        name,
        username,
        city,
        dailyGoal: accountDraft.dailyGoal,
        motivations: accountDraft.motivations,
        avatar: accountDraft.avatar,
        photoUri: accountDraft.photoUri ?? null,
        memberGroupIds: group ? [group.id] : [],
        primaryGroupId: group?.id ?? null,
        preview: false,
        onboarded: true,
      });
      showToast(`Welcome, ${firstName(name)}`);
      return true;
    },
    [accountDraft, session, showToast],
  );

  const applyInvite = useCallback(
    (code: string) => {
      const token = code.trim().toUpperCase();
      if (!/^[A-Z0-9]{5}$/.test(token)) {
        return { ok: false, message: 'Enter the 5-character club token.' };
      }
      if (token === 'WALK') {
        setDraftState((current) => ({ ...current, inviteCode: token, selectedGroupId: 'peak-climbers' }));
        return { ok: true, message: 'Valid token preview: Peak Climbers Club ready!' };
      }
      const id = `token-${token.toLowerCase()}`;
      const group = makeCustomGroup(`${token} Walking Circle`, draft.city, draft.dailyGoal, 'Private Circle', id);
      setGroups((prev) => (prev.some((item) => item.id === id) ? prev : [group, ...prev]));
      setDraftState((current) => ({ ...current, inviteCode: token, selectedGroupId: id }));
      return { ok: true, message: `${token} Circle ready!` };
    },
    [draft.city, draft.dailyGoal],
  );

  const updateGroup = useCallback((id: string, patch: Partial<Group>) => {
    setGroups((prev) => prev.map((group) => (group.id === id ? { ...group, ...patch } : group)));
  }, []);

  const createGroup = useCallback(
    (input: { name: string; privacy: Group['privacy']; dailyGoal?: number }) => {
      const group = makeCustomGroup(
        input.name,
        session?.city ?? '',
        input.dailyGoal ?? session?.dailyGoal ?? 8000,
        input.privacy,
      );
      setGroups((prev) => [group, ...prev]);
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          memberGroupIds: [group.id, ...prev.memberGroupIds.filter((id) => id !== group.id)],
          primaryGroupId: group.id,
        };
      });
      showToast(`${group.name} is ready`);
    },
    [session, showToast],
  );

  const joinGroup = useCallback(
    (id: string) => {
      const group = groups.find((item) => item.id === id);
      setSession((prev) => {
        if (!prev) return prev;
        if (!prev.preview && mockGroupIds.has(id)) return prev;
        if (prev.memberGroupIds.includes(id)) return prev;
        return {
          ...prev,
          memberGroupIds: [...prev.memberGroupIds, id],
          primaryGroupId: prev.primaryGroupId ?? id,
        };
      });
      showToast(group ? `Joined ${group.name}` : 'Joined circle');
    },
    [groups, showToast],
  );

  const addBonus = useCallback((steps: number) => {
    setBonusSteps((prev) => prev + steps);
  }, []);

  const sendLove = useCallback(() => {
    setLoveCount((count) => count + 1);
    showToast('Cheer sent to your club');
  }, [showToast]);

  const markThanks = useCallback(() => {
    setThanksSent(true);
    showToast('Thanks sent to Priya Sharma');
  }, [showToast]);

  const toggleQuest = useCallback((id: string) => {
    setJoinedQuestIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const stopSharingWalk = useCallback(() => {
    walkWatch.current?.remove();
    walkWatch.current = null;
    setSharingWalk(false);
    setRoutes((current) => current.map((route) => (route.mine ? { ...route, live: false } : route)));
  }, []);

  const startSharingWalk = useCallback(async () => {
    if (!session) return;
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      showToast('Location access was not allowed when the app opened');
      return;
    }
    const record = (position: Location.LocationObject) => {
      const point = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        at: position.timestamp,
      };
      setRoutes((current) => {
        const mine = current.find((route) => route.mine);
        if (!mine) {
          return [...current, { id: 'me', name: session.name, live: true, mine: true, points: [point] }];
        }
        return current.map((route) =>
          route.mine ? { ...route, name: session.name, live: true, points: [...route.points, point].slice(-80) } : route,
        );
      });
    };
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    record(current);
    walkWatch.current?.remove();
    walkWatch.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 8 },
      record,
    );
    setSharingWalk(true);
    showToast('Your walk is visible to your circle');
  }, [session, showToast]);

  const refreshSync = useCallback(() => {
    void readStepAccess().then((access) => {
      setLastSync('just now');
      if (access.today != null) setDeviceSteps(access.today);
      if (access.status === 'granted') showToast('Steps refreshed');
      else if (access.status === 'denied') showToast('Motion access is off');
      else showToast('Step counting is not available on this device');
    });
  }, [showToast]);

  const sendAppreciation = useCallback(
    (groupId: string, kudo: Kudo) => {
      setAppreciations((prev) => ({ ...prev, [groupId]: [kudo, ...(prev[groupId] ?? [])] }));
      showToast(`Awarded ${kudo.badge} to ${kudo.to}`);
    },
    [showToast],
  );

  const addTournament = useCallback(
    (tournament: Omit<Tournament, 'id'>) => {
      setExtraTournaments((prev) => [{ ...tournament, id: `made-${Date.now()}` }, ...prev]);
      showToast('Challenge created');
    },
    [showToast],
  );

  const activity = useMemo(
    () => withBonus(session?.preview === true ? bonusSteps : deviceSteps + bonusSteps, session?.preview === true),
    [bonusSteps, deviceSteps, session?.preview],
  );
  const visibleGroups = useMemo(
    () => (session?.preview === false ? groups.filter((group) => !mockGroupIds.has(group.id)) : groups),
    [groups, session?.preview],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      authReady,
      session,
      draft,
      accountDraft,
      groups: visibleGroups,
      activity,
      bonusSteps,
      loveCount,
      thanksSent,
      joinedQuestIds,
      lastSync,
      routes: session?.preview ? routes : routes.filter((route) => route.mine),
      sharingWalk,
      appreciations,
      extraTournaments,
      toast,
      setDraft,
      setAccountDraft,
      finishSetup,
      signInDemo,
      loadMockCatalog,
      signInWithGoogle,
      signOut,
      updateSession,
      completeOnboarding,
      applyInvite,
      createGroup,
      updateGroup,
      joinGroup,
      addBonus,
      sendLove,
      markThanks,
      toggleQuest,
      refreshSync,
      startSharingWalk,
      stopSharingWalk,
      sendAppreciation,
      addTournament,
      showToast,
    }),
    [
      authReady,
      session,
      draft,
      accountDraft,
      visibleGroups,
      activity,
      bonusSteps,
      loveCount,
      thanksSent,
      joinedQuestIds,
      lastSync,
      routes,
      sharingWalk,
      appreciations,
      extraTournaments,
      toast,
      setDraft,
      setAccountDraft,
      finishSetup,
      signInDemo,
      loadMockCatalog,
      signInWithGoogle,
      signOut,
      updateSession,
      completeOnboarding,
      applyInvite,
      createGroup,
      updateGroup,
      joinGroup,
      addBonus,
      sendLove,
      markThanks,
      toggleQuest,
      refreshSync,
      startSharingWalk,
      stopSharingWalk,
      sendAppreciation,
      addTournament,
      showToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
}
