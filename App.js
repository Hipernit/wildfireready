import { useState, useEffect } from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { s } from './src/styles';
import { THEMES, ThemeCtx } from './src/theme';
import { LangCtx } from './src/i18n';
import { readJSON, writeJSON } from './src/services/storage';
import { STORAGE_KEY, DEFAULT_STATE, migrateState, serializeState } from './src/services/persist';
import Header from './src/components/Header';
import TabBar from './src/components/TabBar';
import ProfileSheet from './src/components/ProfileSheet';
import HomeScreen from './src/screens/HomeScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import GoBagScreen from './src/screens/GoBagScreen';
import ScoreScreen from './src/screens/ScoreScreen';
import PlanScreen from './src/screens/PlanScreen';

const THEME_CYCLE = { system: 'light', light: 'dark', dark: 'system' };

export default function App() {
  const systemScheme = useColorScheme();

  // Persisted state is applied in one batch before `hydrated` flips, so the
  // save effect below never writes defaults over saved data.
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState('home');
  const [lang, setLang] = useState(DEFAULT_STATE.lang);
  const [themePref, setThemePref] = useState(DEFAULT_STATE.themePref);
  // Location is shared so picking a community on any tab stays in sync.
  const [loc, setLoc] = useState(DEFAULT_STATE.loc);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [profile, setProfile] = useState(DEFAULT_STATE.profile);
  const [actions, setActions] = useState(DEFAULT_STATE.actions);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    readJSON(STORAGE_KEY).then((saved) => {
      const st = migrateState(saved);
      setLang(st.lang);
      setThemePref(st.themePref);
      setLoc(st.loc);
      setCheckedIds(new Set(st.checked));
      setProfile(st.profile);
      setActions(st.actions);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJSON(STORAGE_KEY, serializeState({ lang, themePref, loc, checked: [...checkedIds], profile, actions }));
  }, [hydrated, lang, themePref, loc, checkedIds, profile, actions]);

  const mode = themePref === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePref;
  const theme = THEMES[mode];

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.header, alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="light" />
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  const navigate = (target) => (target === 'profile' ? setProfileOpen(true) : setTab(target));
  const editProfile = () => setProfileOpen(true);

  const screens = {
    home: <HomeScreen loc={loc} setLoc={setLoc} actions={actions} setActions={setActions} />,
    weather: <WeatherScreen loc={loc} setLoc={setLoc} />,
    gobag: (
      <GoBagScreen
        checkedIds={checkedIds}
        setCheckedIds={setCheckedIds}
        profile={profile}
        onEditProfile={editProfile}
      />
    ),
    score: <ScoreScreen checkedIds={checkedIds} profile={profile} actions={actions} loc={loc} onNavigate={navigate} />,
    plan: (
      <PlanScreen loc={loc} setLoc={setLoc} profile={profile} setActions={setActions} onEditProfile={editProfile} />
    ),
  };

  return (
    <SafeAreaProvider>
      <ThemeCtx.Provider value={mode}>
        <LangCtx.Provider value={lang}>
          {/* Header is dark in both themes, so status-bar content is always light. */}
          <StatusBar style="light" />
          {/* Bottom inset is applied by TabBar so it isn't padded twice. */}
          <SafeAreaView style={[s.safe, { backgroundColor: theme.header }]} edges={['top', 'left', 'right']}>
            <Header
              themePref={themePref}
              loc={loc}
              onToggleLang={() => setLang((l) => (l === 'en' ? 'es' : 'en'))}
              onCycleTheme={() => setThemePref((p) => THEME_CYCLE[p])}
            />
            {/* All tabs stay mounted so switching keeps data and scroll position. */}
            <View style={{ flex: 1, backgroundColor: theme.bg }}>
              {Object.entries(screens).map(([key, el]) => (
                <View key={key} style={{ flex: 1, display: tab === key ? 'flex' : 'none' }}>
                  {el}
                </View>
              ))}
            </View>
            <TabBar active={tab} onSelect={setTab} />
          </SafeAreaView>
          <ProfileSheet
            visible={profileOpen}
            profile={profile}
            onSave={(p) => {
              setProfile({ ...p, savedAt: Date.now() });
              setProfileOpen(false);
            }}
            onClose={() => setProfileOpen(false)}
          />
        </LangCtx.Provider>
      </ThemeCtx.Provider>
    </SafeAreaProvider>
  );
}
