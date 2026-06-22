import React, { useState } from 'react';
import { View, SafeAreaView, useColorScheme } from 'react-native';
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

export default function App() {
  const systemScheme = useColorScheme();

  const [tab, setTab] = useState('home');
  const [lang, setLang] = useState('en');
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  // Location is shared so picking a community on Now/Weather stays in sync.
  const [loc, setLoc] = useState('kirkland');
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [profile] = useState({ adults:2, children:0, pets:1, meds:true, mobility:false, elderly:false });

  const theme = THEMES[isDark ? 'dark' : 'light'];

  const screens = {
    home:    <HomeScreen loc={loc} setLoc={setLoc} />,
    weather: <WeatherScreen loc={loc} setLoc={setLoc} />,
    gobag:   <GoBagScreen checkedIds={checkedIds} setCheckedIds={setCheckedIds} />,
    score:   <ScoreScreen checkedIds={checkedIds} profile={profile} />,
    plan:    <PlanScreen loc={loc} setLoc={setLoc} />,
  };

  return (
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
  );
}
