import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang, useLangCode, fmt } from '../i18n';
import { findLocation } from '../data/locations';

const THEME_ICON = { system:'contrast-outline', light:'sunny-outline', dark:'moon-outline' };

export default function Header({ themePref, loc, onToggleLang, onCycleTheme }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();
  const mode = t.themeModes[themePref];
  const community = findLocation(loc)?.label;
  return (
    <View style={[s.header, { backgroundColor: theme.header }]}>
      <View style={s.headerLeft}>
        <Text style={[s.brand, { color: theme.headerText }]} accessibilityRole="header" numberOfLines={1}>WildfireReady</Text>
        {community && (
          <View style={[s.headerChip, { backgroundColor: theme.headerChip }]}>
            <Text style={[s.headerChipTxt, { color: theme.headerSub }]} numberOfLines={1}>{community}</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection:'row', alignItems:'center' }}>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={onCycleTheme}
          accessibilityRole="button"
          accessibilityLabel={fmt(t.themeA11y, { mode })}
        >
          <Ionicons name={THEME_ICON[themePref]} size={22} color={theme.headerText} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.langPill, { borderColor: theme.headerSub }]}
          onPress={onToggleLang}
          accessibilityRole="button"
          accessibilityLabel={fmt(t.langA11y, { lang: lang === 'en' ? 'Español' : 'English' })}
        >
          <Text style={[s.langTxt, { color: theme.headerText }]}>{lang === 'en' ? 'ES' : 'EN'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
