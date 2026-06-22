import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { s } from '../styles';
import { useTheme, ACCENT } from '../theme';
import { useLang } from '../i18n';

export default function TabBar({ active, onSelect }) {
  const theme = useTheme();
  const t = useLang();
  const tabs = [
    { k:'home',    l:t.tabs.home },
    { k:'weather', l:t.tabs.weather },
    { k:'gobag',   l:t.tabs.gobag },
    { k:'score',   l:t.tabs.score },
    { k:'plan',    l:t.tabs.plan },
  ];
  return (
    <View style={[s.tabBar, { backgroundColor: theme.tabBar, borderTopColor: theme.border }]}>
      {tabs.map((tb) => {
        const isActive = active === tb.k;
        return (
          <TouchableOpacity key={tb.k} style={s.tab} onPress={() => onSelect(tb.k)}>
            <Text style={[s.tabLabel, { color: isActive ? ACCENT : theme.textLight, fontWeight: isActive ? '700' : '500', fontSize: isActive ? 11 : 10 }]}>{tb.l}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
