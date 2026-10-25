import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang, fmt } from '../i18n';
import { LOCATIONS, findLocation } from '../data/locations';
import { distanceMiles } from '../services/geo';

// Nearest WA-08 community to a point, with its distance in miles.
export function nearestLocation(point) {
  return LOCATIONS
    .map((l) => ({ loc: l, mi: distanceMiles(point, l) }))
    .sort((a, b) => a.mi - b.mi)[0];
}

export default function LocPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState(null);
  const theme = useTheme();
  const t = useLang();
  const loc = findLocation(value);

  const close = () => { setOpen(false); setGeoMsg(null); };

  // One-shot, low-accuracy fix; the position is used only to pick a
  // community and is not stored.
  const useMyLocation = async () => {
    setLocating(true); setGeoMsg(null);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) { setGeoMsg(t.locationDenied); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const best = nearestLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      onChange(best.loc.key);
      setGeoMsg(fmt(t.nearestPicked, { name: best.loc.label, mi: Math.round(best.mi) }));
    } catch (e) {
      setGeoMsg(t.locationError);
    } finally {
      setLocating(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[s.locRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${t.chooseLocation}: ${loc?.label}`}
      >
        <Ionicons name="location-outline" size={18} color={theme.accentText} />
        <Text style={[s.locLabel, { color: theme.text }]}>{loc?.label}</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.textMid} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex:1, backgroundColor: theme.bg }}>
            <View style={[s.modalHead, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
              <Text style={[s.modalTitle, { color: theme.text }]} accessibilityRole="header">{t.chooseLocation}</Text>
              <TouchableOpacity onPress={close} style={s.modalHeadBtn} accessibilityRole="button">
                <Text style={[s.modalDone, { color: theme.accentText }]}>{t.done}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={[s.locItem, { backgroundColor: theme.surface, borderColor: theme.border, justifyContent:'flex-start' }]}
                onPress={useMyLocation}
                disabled={locating}
                accessibilityRole="button"
              >
                {locating ? <ActivityIndicator color={theme.accent} /> : <Ionicons name="navigate" size={20} color={theme.accentText} />}
                <Text style={[s.locName, { color: theme.accentText, fontWeight:'600', flex:1 }]}>{locating ? t.locating : t.useMyLocation}</Text>
              </TouchableOpacity>
              {geoMsg && (
                <Text style={[s.intro, { color: theme.textMid, marginTop:8 }]} accessibilityLiveRegion="polite">{geoMsg}</Text>
              )}
              {LOCATIONS.map((l) => {
                const selected = l.key === value;
                return (
                  <TouchableOpacity
                    key={l.key}
                    style={[s.locItem, { backgroundColor: theme.surface, borderColor: selected ? theme.accent : theme.border }, selected && s.locItemActive]}
                    onPress={() => { onChange(l.key); close(); }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <View style={{ flex:1 }}>
                      <Text style={[s.locName, { color: selected ? theme.accentText : theme.text }, selected && { fontWeight:'700' }]}>{l.label}</Text>
                      <Text style={[s.locCounty, { color: theme.textMid }]}>{fmt(t.countyName, { name: l.county })} · {l.zip}</Text>
                    </View>
                    {selected && <Ionicons name="checkmark" size={22} color={theme.accentText} />}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height:24 }} />
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}
