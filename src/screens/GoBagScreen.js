import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { s } from '../styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../theme';
import { useLang, useLangCode, fmt } from '../i18n';
import { getGoBag, householdSize } from '../data/gobag';

// Tag tone → theme colors.
const toneColors = (tone, theme) =>
  tone === 'neutral' ? { fg: theme.textMid, bg: theme.surfaceAlt } : { fg: theme[tone], bg: theme[`${tone}Bg`] };

export default function GoBagScreen({ checkedIds, setCheckedIds, profile, onEditProfile }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();

  const toggle = (id) => setCheckedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Only items that apply to this household count; hidden ones keep their
  // checked state in case the profile changes back.
  const items = getGoBag(profile, lang);
  const packed = items.filter((i) => checkedIds.has(i.id)).length;
  const pct = items.length ? Math.round((packed / items.length) * 100) : 0;
  const sections = [...new Set(items.map((i) => i.secKey))];

  const confirmReset = () => Alert.alert(
    t.resetConfirmTitle,
    t.resetConfirmMsg,
    [
      { text: t.cancel, style: 'cancel' },
      { text: t.reset, style: 'destructive', onPress: () => setCheckedIds(new Set()) },
    ],
  );

  return (
    <ScrollView style={{ flex:1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>
      <View style={[s.progressCard, { backgroundColor: theme.darkCard }]}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 }}>
          <Text style={{ fontSize:14, fontWeight:'600', color: theme.darkCardSub }}>{t.gobagReadiness}</Text>
          <Text style={{ fontSize:22, fontWeight:'700', color: theme.darkCardText }}>{pct}%</Text>
        </View>
        <View style={[s.progressTrack, { backgroundColor: theme.progressBg }]} accessibilityRole="progressbar" accessibilityValue={{ min:0, max:100, now:pct }}>
          <View style={[s.progressFill, { width:`${pct}%`, backgroundColor: theme.accent }]} />
        </View>
        <Text style={{ fontSize:12, color: theme.darkCardSub, marginTop:8 }}>
          {packed} {t.of} {items.length} {t.itemsPacked}
        </Text>
      </View>

      <Text style={[s.intro, { color: theme.textMid }]}>{t.gobagIntro}</Text>
      <TouchableOpacity onPress={onEditProfile} accessibilityRole="button" style={{ marginHorizontal:16, paddingVertical:8 }}>
        <Text style={{ fontSize:13, color: theme.accentText, fontWeight:'600', lineHeight:19 }}>
          {fmt(t.gobagTailored, { people: householdSize(profile) })} ›
        </Text>
      </TouchableOpacity>

      {sections.map((secKey) => {
        const secItems = items.filter((i) => i.secKey === secKey);
        const done = secItems.filter((i) => checkedIds.has(i.id)).length;
        return (
          <View key={secKey} style={[s.checkSec, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[s.checkSecHead, { backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border }]}>
              <Text style={[s.checkSecTitle, { color: theme.text }]} accessibilityRole="header">{secItems[0].sec}</Text>
              <Text style={[s.checkSecProg, { color: theme.textMid }]}>
                <Text style={{ color: theme.accentText, fontWeight:'700' }}>{done}</Text>/{secItems.length}
              </Text>
            </View>
            {secItems.map((item, idx) => {
              const checked = checkedIds.has(item.id);
              const tc = toneColors(item.tone, theme);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[s.checkItem, idx < secItems.length - 1 && [s.checkItemBorder, { borderBottomColor: theme.borderLight }]]}
                  onPress={() => toggle(item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  accessibilityLabel={`${item.text}, ${item.tag}`}
                >
                  <View style={[s.checkbox, { borderColor: checked ? theme.success : theme.textLight, backgroundColor: checked ? theme.success : 'transparent' }]}>
                    {checked && <Ionicons name="checkmark" size={17} color={theme.onAccent} />}
                  </View>
                  <Text style={[s.checkTxt, { color: theme.text }, checked && { textDecorationLine:'line-through', color: theme.textMid }]}>
                    {item.text}
                  </Text>
                  <View style={[s.tag, { backgroundColor: tc.bg }]}>
                    <Text style={[s.tagTxt, { color: tc.fg }]}>{item.tag}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}

      <TouchableOpacity style={[s.resetBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={confirmReset} accessibilityRole="button">
        <Text style={[s.resetBtnTxt, { color: theme.textMid }]}>{t.resetAll}</Text>
      </TouchableOpacity>
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
