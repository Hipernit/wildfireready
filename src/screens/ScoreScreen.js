import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang, fmt } from '../i18n';
import { calcScore } from '../services/score';
import { findLocation } from '../data/locations';

export default function ScoreScreen({ checkedIds, profile, actions, loc, onNavigate }) {
  const theme = useTheme();
  const t = useLang();
  const score = calcScore({ checkedIds, profile, actions, county: findLocation(loc)?.county });
  const gradeColor = theme[score.tone];

  const share = async () => {
    await Share.share({ message: `${t.shareScoreMsg} ${score.total}/100${t.shareScoreFooter}` });
  };

  return (
    <ScrollView style={{ flex:1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>
      <View style={[s.scoreHero, { backgroundColor: theme.darkCard }]}>
        <Text style={[s.scoreTitle, { color: theme.darkCardText }]} accessibilityRole="header">{t.scoreTitle}</Text>
        <Text style={[s.scoreSubtitle, { color: theme.darkCardSub }]}>{t.scoreSubtitle}</Text>
        <View style={s.scoreCircleWrap}>
          <View
            style={[s.scoreCircle, { borderColor: gradeColor, backgroundColor: theme.darkCardFill }]}
            accessible
            accessibilityLabel={`${score.total} ${t.scoreOf}, ${score.grade}`}
          >
            <Text style={[s.scoreNum, { color: theme.darkCardText }]}>{score.total}</Text>
            <Text style={[s.scoreOfTxt, { color: theme.darkCardSub }]}>{t.scoreOf}</Text>
            <Text style={[s.scoreGrade, { color: gradeColor }]}>{score.grade}</Text>
          </View>
        </View>
        <Text style={[s.scoreGradeMsg, { color: theme.darkCardSub }]}>{t.scoreGrades[score.grade]}</Text>
        <TouchableOpacity style={[s.shareScoreBtn, { backgroundColor: theme.accent }]} onPress={share} accessibilityRole="button">
          <Text style={[s.shareScoreBtnTxt, { color: theme.onAccent }]}>{t.shareScore}</Text>
        </TouchableOpacity>
      </View>

      {score.fixes.length > 0 && (
        <>
          <Text style={[s.secLabel, { color: theme.textLight }]}>{t.whatToFix}</Text>
          <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {score.fixes.map((fix, i) => (
              <TouchableOpacity
                key={fix.key}
                onPress={() => onNavigate(fix.target)}
                accessibilityRole="button"
                style={[s.fixRow, i < score.fixes.length - 1 && [s.catBorder, { borderBottomColor: theme.borderLight }]]}
              >
                <Ionicons name="arrow-forward-circle" size={22} color={theme.accentText} />
                <Text style={[s.fixTxt, { color: theme.text }]}>{t.fixItems[fix.key]}</Text>
                <Text style={{ fontSize:12, fontWeight:'700', color: theme.success }}>{fmt(t.fixGain, { n: fix.gain })}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textMid} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.breakdown}</Text>
      <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {score.categories.map((cat, i) => {
          const fill = cat.pct === 100 ? theme.success : cat.pct >= 60 ? theme.warning : theme.danger;
          return (
            <View key={cat.key} style={[s.catRow, i < score.categories.length - 1 && [s.catBorder, { borderBottomColor: theme.borderLight }]]}>
              <View style={{ flex:1 }}>
                <Text style={[s.catName, { color: theme.text }]}>{t.categories[cat.key]}</Text>
                <Text style={[s.catDesc, { color: theme.textMid }]}>{t.catDescs[cat.key]}</Text>
                <View style={[s.catTrack, { backgroundColor: theme.borderLight }]}>
                  <View style={[s.catFill, { width:`${cat.pct}%`, backgroundColor: fill }]} />
                </View>
              </View>
              <Text style={[s.catScore, { color: cat.score === cat.max ? theme.success : theme.textMid }]}>
                {cat.score}<Text style={{ fontSize:11, color: theme.textLight }}>/{cat.max}</Text>
              </Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={[s.resetBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => onNavigate('profile')}
        accessibilityRole="button"
      >
        <Text style={[s.resetBtnTxt, { color: theme.accentText, fontWeight:'600' }]}>{t.editProfile}</Text>
      </TouchableOpacity>
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
