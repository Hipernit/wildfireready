import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Switch, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang, fmt } from '../i18n';

function Stepper({ label, value, onChange, min = 0, max = 20 }) {
  const theme = useTheme();
  const t = useLang();
  const btn = (delta, glyph, a11y) => {
    const disabled = delta < 0 ? value <= min : value >= max;
    return (
      <TouchableOpacity
        onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={fmt(a11y, { label })}
        style={[s.stepBtn, { borderColor: theme.border, opacity: disabled ? 0.35 : 1 }]}
      >
        <Text style={{ fontSize:22, fontWeight:'700', color: theme.accentText }}>{glyph}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={[s.formRow, { borderBottomColor: theme.borderLight }]}>
      <Text style={[s.formLabel, { color: theme.text }]}>{label}</Text>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
        {btn(-1, 'âˆ’', t.decreaseA11y)}
        <Text style={{ fontSize:17, fontWeight:'700', color: theme.text, minWidth:24, textAlign:'center' }} accessibilityLiveRegion="polite">{value}</Text>
        {btn(1, '+', t.increaseA11y)}
      </View>
    </View>
  );
}

function Toggle({ label, value, onChange }) {
  const theme = useTheme();
  return (
    <View style={[s.formRow, { borderBottomColor: theme.borderLight }]}>
      <Text style={[s.formLabel, { color: theme.text, flex:1, paddingRight:12 }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.accent, false: theme.border }} thumbColor={theme.surface} accessibilityLabel={label} />
    </View>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType }) {
  const theme = useTheme();
  return (
    <View style={{ paddingHorizontal:16, paddingTop:14 }}>
      <Text style={[s.formLabel, { color: theme.text, marginBottom:6 }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textLight}
        keyboardType={keyboardType}
        accessibilityLabel={label}
        style={[s.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
      />
    </View>
  );
}

// Household profile editor. Edits a draft; nothing is saved until Save.
export default function ProfileSheet({ visible, profile, onSave, onClose }) {
  const theme = useTheme();
  const t = useLang();
  const [draft, setDraft] = useState(profile);

  useEffect(() => { if (visible) setDraft(profile); }, [visible, profile]);

  const set = (key) => (v) => setDraft((d) => ({ ...d, [key]: v }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex:1, backgroundColor: theme.bg }}>
          <View style={[s.modalHead, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" style={s.modalHeadBtn}>
              <Text style={[s.modalDone, { color: theme.textMid, fontWeight:'500' }]}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: theme.text }]} accessibilityRole="header">{t.profileTitle}</Text>
            <TouchableOpacity onPress={() => onSave(draft)} accessibilityRole="button" style={s.modalHeadBtn}>
              <Text style={[s.modalDone, { color: theme.accentText }]}>{t.save}</Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border, marginTop:16 }]}>
                <Stepper label={t.adults} value={draft.adults} onChange={set('adults')} min={1} />
                <Stepper label={t.children} value={draft.children} onChange={set('children')} />
                <Stepper label={t.pets} value={draft.pets} onChange={set('pets')} />
                <Toggle label={t.medications} value={draft.medications} onChange={set('medications')} />
                <Toggle label={t.mobility} value={draft.mobility} onChange={set('mobility')} />
                <Toggle label={t.elderly} value={draft.elderly} onChange={set('elderly')} />
              </View>
              <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border, marginTop:16, paddingBottom:16 }]}>
                <Field label={t.meetingPoint} value={draft.meetingPoint} onChange={set('meetingPoint')} placeholder={t.meetingPointHint} />
                <Field label={t.contactName} value={draft.contactName} onChange={set('contactName')} />
                <Field label={t.contactPhone} value={draft.contactPhone} onChange={set('contactPhone')} keyboardType="phone-pad" />
              </View>
              <Text style={[s.intro, { color: theme.textMid }]}>{t.profileNote}</Text>
              <View style={{ height:40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
