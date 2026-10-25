import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang } from '../i18n';

const TABS = [
  { k: 'home', icon: 'flame' },
  { k: 'weather', icon: 'partly-sunny' },
  { k: 'gobag', icon: 'bag-handle' },
  { k: 'score', icon: 'ribbon' },
  { k: 'plan', icon: 'map' },
];

export default function TabBar({ active, onSelect }) {
  const theme = useTheme();
  const t = useLang();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        s.tabBar,
        { backgroundColor: theme.tabBar, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 6) },
      ]}
      accessibilityRole="tablist"
    >
      {TABS.map((tb) => {
        const isActive = active === tb.k;
        const color = isActive ? theme.accentText : theme.textMid;
        return (
          <TouchableOpacity
            key={tb.k}
            style={s.tab}
            onPress={() => onSelect(tb.k)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t.tabs[tb.k]}
          >
            <Ionicons name={isActive ? tb.icon : `${tb.icon}-outline`} size={22} color={color} />
            <Text style={[s.tabLabel, { color, fontWeight: isActive ? '700' : '500' }]} numberOfLines={1}>
              {t.tabs[tb.k]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
