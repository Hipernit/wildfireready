import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang } from '../i18n';
import { calcScore } from '../services/score';

export default function ScoreScreen({ checkedIds, profile }) {
  const theme = useTheme();
  const t = useLang();
  const score = calcScore(checkedIds, profile);

  const share = async () => {
    await Share.share({ message: `${t.shareScoreMsg} ${score.total}/100${t.shareScoreFooter}` });
  };

  return (
    <ScrollView style={{ flex:1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>
      <View style={[s.scoreHero, { backgroundColor: theme.darkCard }]}>
        <Text style={s.scoreTitle}>{t.scoreTitle}</Text>
        <Text style={s.scoreSubtitle}>{t.scoreSubtitle}</Text>
        <View style={s.scoreCircleWrap}>
          <View style={[s.scoreCircle, { borderColor: score.color }]}>
            <Text style={[s.scoreNum, { color: score.color }]}>{score.total}</Text>
            <Text style={s.scoreOfTxt}>{t.scoreOf}</Text>
            <Text style={[s.scoreGrade, { color: score.color }]}>{score.grade}</Text>
          </View>
        </View>
        <Text style={s.scoreGradeMsg}>{t.scoreGrades[score.grade]}</Text>
        <TouchableOpacity style={s.shareScoreBtn} onPress={share}>
          <Text style={s.shareScoreBtnTxt}>{t.shareScore}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.breakdown}</Text>
      <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {score.categories.map((cat, i) => (
          <View key={cat.key} style={[s.catRow, i < score.categories.length - 1 && [s.catBorder, { borderBottomColor: theme.borderLight }]]}>
            <View style={{ flex:1 }}>
              <Text style={[s.catName, { color: theme.text }]}>{t.categories[cat.key]}</Text>
              <Text style={[s.catDesc, { color: theme.textLight }]}>{t.catDescs[cat.key]}</Text>
              <View style={[s.catTrack, { backgroundColor: theme.borderLight }]}>
                <View style={[s.catFill, { width:`${cat.pct}%`, backgroundColor: cat.pct === 100 ? '#2E7D5E' : cat.pct >= 60 ? '#C07A00' : '#C0392B' }]} />
              </View>
            </View>
            <Text style={[s.catScore, { color: cat.score === cat.max ? '#2E7D5E' : '#C07A00' }]}>
              {cat.score}<Text style={{ fontSize:11, color: theme.textLight }}>/{cat.max}</Text>
            </Text>
          </View>
        ))}
      </View>

      {score.fixes.length > 0 && (
        <>
          <Text style={[s.secLabel, { color: theme.textLight }]}>{t.whatToFix}</Text>
          <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {score.fixes.map((fix, i) => (
              <View key={fix} style={[s.fixRow, i < score.fixes.length - 1 && [s.catBorder, { borderBottomColor: theme.borderLight }]]}>
                <Text style={s.fixIcon}>→</Text>
                <Text style={[s.fixTxt, { color: theme.text }]}>{t.fixItems[fix]}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
