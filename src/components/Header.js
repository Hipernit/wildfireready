import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { s } from '../styles';
import { useTheme, useIsDark } from '../theme';
import { useLangCode } from '../i18n';

export default function Header({ onToggleLang, onToggleDark }) {
  const theme = useTheme();
  const isDark = useIsDark();
  const lang = useLangCode();
  return (
    <View style={[s.header, { backgroundColor: theme.header }]}>
      <View style={s.headerLeft}>
        <Text style={s.brand}>WildfireReady</Text>
      </View>
      <View style={{ flexDirection:'row', gap:8, alignItems:'center' }}>
        <TouchableOpacity style={s.langBtn} onPress={onToggleDark} accessibilityLabel="Toggle dark mode">
          <Text style={s.langTxt}>{isDark ? 'Light' : 'Dark'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.langBtn} onPress={onToggleLang} accessibilityLabel="Toggle language">
          <Text style={s.langTxt}>{lang === 'en' ? 'ES' : 'EN'}</Text>
        </TouchableOpacity>
        <View style={s.badge}><Text style={s.badgeTxt}>WA-08</Text></View>
      </View>
    </View>
  );
}
