import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, ScrollView } from 'react-native';
import { s } from '../styles';
import { useTheme, ACCENT } from '../theme';
import { useLang } from '../i18n';
import { LOCATIONS, findLocation } from '../data/locations';

export default function LocPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const t = useLang();
  const loc = findLocation(value);

  return (
    <>
      <TouchableOpacity
        style={[s.locRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => setOpen(true)}
      >
        <Text style={[s.locLabel, { color: theme.text }]}>{loc?.label}</Text>
        <Text style={[s.chevron, { color: theme.textLight }]}>›</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex:1, backgroundColor: theme.bg }}>
          <View style={[s.modalHead, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[s.modalTitle, { color: theme.text }]}>{t.chooseLocation}</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={s.modalDone}>{t.done}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {LOCATIONS.map((l) => {
              const selected = l.key === value;
              return (
                <TouchableOpacity
                  key={l.key}
                  style={[s.locItem, { backgroundColor: theme.surface, borderColor: theme.border }, selected && s.locItemActive]}
                  onPress={() => { onChange(l.key); setOpen(false); }}
                >
                  <View>
                    <Text style={[s.locName, { color: theme.text }, selected && { color: ACCENT, fontWeight:'700' }]}>{l.label}</Text>
                    <Text style={[s.locCounty, { color: theme.textLight }]}>{l.county} {t.county} · {l.zip}</Text>
                  </View>
                  {selected && <Text style={{ color: ACCENT, fontSize:18, fontWeight:'700' }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
