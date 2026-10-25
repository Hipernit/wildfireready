import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang, useLangCode, fmt } from '../i18n';

export default function Header({ themePref, onToggleLang, onCycleTheme }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();
  const mode = t.themeModes[themePref];
  return (
    <View style={[s.header, { backgroundColor: theme.header }]}>
      <View style={s.headerLeft}>
        <Text style={s.brand}>WildfireReady</Text>
      </View>
      <View style={{ flexDirection:'row', gap:8, alignItems:'center' }}>
        <TouchableOpacity style={s.langBtn} onPress={onCycleTheme} accessibilityLabel={fmt(t.themeA11y, { mode })}>
          <Text style={s.langTxt}>{mode}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.langBtn} onPress={onToggleLang} accessibilityLabel={fmt(t.langA11y, { lang: lang === 'en' ? 'Español' : 'English' })}>
          <Text style={s.langTxt}>{lang === 'en' ? 'ES' : 'EN'}</Text>
        </TouchableOpacity>
        <View style={s.badge}><Text style={s.badgeTxt}>WA-08</Text></View>
      </View>
    </View>
  );
}
