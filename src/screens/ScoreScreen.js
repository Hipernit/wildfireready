import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
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
        <Text style={s.scoreTitle}>{t.scoreTitle}</Text>
        <Text style={s.scoreSubtitle}>{t.scoreSubtitle}</Text>
        <View style={s.scoreCircleWrap}>
          <View style={[s.scoreCircle, { borderColor: gradeColor }]}>
            <Text style={[s.scoreNum, { color: gradeColor }]}>{score.total}</Text>
            <Text style={s.scoreOfTxt}>{t.scoreOf}</Text>
            <Text style={[s.scoreGrade, { color: gradeColor }]}>{score.grade}</Text>
          </View>
        </View>
        <Text style={s.scoreGradeMsg}>{t.scoreGrades[score.grade]}</Text>
        <TouchableOpacity style={s.shareScoreBtn} onPress={share}>
          <Text style={s.shareScoreBtnTxt}>{t.shareScore}</Text>
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
                <Text style={s.fixIcon}>→</Text>
                <Text style={[s.fixTxt, { color: theme.text }]}>{t.fixItems[fix.key]}</Text>
                <Text style={{ fontSize:12, fontWeight:'700', color: theme.success }}>{fmt(t.fixGain, { n: fix.gain })}</Text>
                <Text style={{ fontSize:18, color: theme.textLight }}>›</Text>
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
                <Text style={[s.catDesc, { color: theme.textLight }]}>{t.catDescs[cat.key]}</Text>
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
