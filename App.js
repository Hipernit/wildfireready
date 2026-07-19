import { useState, useEffect, useRef } from 'react';
import { View, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { s } from './src/styles';
import { THEMES, ThemeCtx } from './src/theme';
import { LangCtx } from './src/i18n';
import Header from './src/components/Header';
import TabBar from './src/components/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import GoBagScreen from './src/screens/GoBagScreen';
import ScoreScreen from './src/screens/ScoreScreen';
import PlanScreen from './src/screens/PlanScreen';

const STORAGE_KEY = 'wildfireready:v1';

export default function App() {
  const systemScheme = useColorScheme();

  const [tab, setTab] = useState('home');
  const [lang, setLang] = useState('en');
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  // Location is shared so picking a community on Now/Weather stays in sync.
  const [loc, setLoc] = useState('sammamish');
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [profile] = useState({ adults:2, children:0, pets:1, meds:true, mobility:false, elderly:false });

  const theme = THEMES[isDark ? 'dark' : 'light'];

  const hydrated = useRef(false);

  // Load persisted state once on startup so progress survives an app restart.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.lang) setLang(saved.lang);
          if (typeof saved.isDark === 'boolean') setIsDark(saved.isDark);
          if (saved.loc) setLoc(saved.loc);
          if (Array.isArray(saved.checkedIds)) setCheckedIds(new Set(saved.checkedIds));
        }
      } catch (e) {
        // Corrupt or missing storage -- fall back to defaults.
      } finally {
        hydrated.current = true;
      }
    })();
  }, []);

  // Persist state after every change, once initial load has completed.
  useEffect(() => {
    if (!hydrated.current) return;
    const payload = JSON.stringify({ lang, isDark, loc, checkedIds: Array.from(checkedIds) });
    AsyncStorage.setItem(STORAGE_KEY, payload).catch(() => {});
  }, [lang, isDark, loc, checkedIds]);
  
  const screens = {
    home:    <HomeScreen loc={loc} setLoc={setLoc} />,
    weather: <WeatherScreen loc={loc} setLoc={setLoc} />,
    gobag:   <GoBagScreen checkedIds={checkedIds} setCheckedIds={setCheckedIds} />,
    score:   <ScoreScreen checkedIds={checkedIds} profile={profile} />,
    plan:    <PlanScreen loc={loc} setLoc={setLoc} />,
  };

  return (
    <SafeAreaProvider>
      <ThemeCtx.Provider value={isDark ? 'dark' : 'light'}>
        <LangCtx.Provider value={lang}>
          <SafeAreaView style={[s.safe, { backgroundColor: theme.header }]}>
            <Header
              onToggleLang={() => setLang((l) => (l === 'en' ? 'es' : 'en'))}
              onToggleDark={() => setIsDark((d) => !d)}
            />
            <View style={{ flex:1, backgroundColor: theme.bg }}>{screens[tab]}</View>
            <TabBar active={tab} onSelect={setTab} />
          </SafeAreaView>
        </LangCtx.Provider>
      </ThemeCtx.Provider>
    </SafeAreaProvider>
  );
}
