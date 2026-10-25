import React, { useMemo } from 'react';
import { View, Platform } from 'react-native';
import { useTheme, useIsDark, ACCENT } from '../theme';
import { useLang, fmt } from '../i18n';
import { LOCATIONS } from '../data/locations';

// react-native-webview has no web implementation; the map is native-only.
let WebView = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (_) {}
}

// JSON that is safe to inline inside a <script> tag.
const inlineJSON = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

// Leaflet map of communities and fires. Tapping a fire opens a popup; its
// Details button calls onSelectFire(id). Fits the selected community plus
// `focusFires` (the nearest fires).
export default function FireMap({ loc, fires, focusFires, nearMiles, onSelectFire }) {
  const theme = useTheme();
  const isDark = useIsDark();
  const t = useLang();

  const html = useMemo(() => {
    // CARTO's keyless dark basemap now watermarks tiles "API KEY REQUIRED",
    // so dark mode inverts the standard OSM tiles with a CSS filter instead.
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attr = '&copy; OpenStreetMap contributors';
    const tileFilter = isDark ? '.leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(.9) contrast(.9)}' : '';
    const data = {
      locs: LOCATIONS.map((l) => ({ lat: l.lat, lon: l.lon, label: l.label, sel: l.key === loc })),
      fires: fires.map((f) => ({ id: f.id, lat: f.lat, lon: f.lon, name: f.title, sub: f.subtitle, near: f.near })),
      focus: focusFires.map((f) => [f.lat, f.lon]),
      colors: { you: theme.info, other: theme.textLight, near: theme.danger, fire: theme.warning, button: ACCENT, ring: theme.surface, text: theme.text, bg: theme.surface, onAccent: theme.onAccent },
      labels: {
        details: t.mapDetails,
        legend: [[t.legendYou, 'you'], [t.legendOther, 'other'], [fmt(t.legendFireNear, { mi: nearMiles }), 'near'], [t.legendFire, 'fire']],
      },
    };
    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
html,body{margin:0;padding:0;height:100%;width:100%}#map{height:100%;width:100%}
.leaflet-control-attribution{font-size:9px}
.legend{padding:6px 8px;border-radius:8px;font:11px/1.5 -apple-system,Roboto,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.25)}
.legend i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;vertical-align:-1px}
${tileFilter}
.pop b{font-size:13px}.pop button{margin-top:6px;border:0;border-radius:6px;padding:6px 10px;font-weight:600}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
  var D=${inlineJSON(data)};
  var C=D.colors;
  var map=L.map('map',{zoomControl:false});
  L.tileLayer(${inlineJSON(tileUrl)},{attribution:${inlineJSON(attr)},maxZoom:19}).addTo(map);
  var sel=null;
  D.locs.forEach(function(l){
    var m=L.circleMarker([l.lat,l.lon],{radius:l.sel?9:6,fillColor:l.sel?C.you:C.other,color:C.ring,weight:2,fillOpacity:1}).addTo(map).bindPopup(l.label);
    if(l.sel) sel=l;
  });
  D.fires.forEach(function(f){
    if(f.lat==null||f.lon==null) return;
    var d=document.createElement('div');d.className='pop';
    var b=document.createElement('b');b.textContent=f.name;d.appendChild(b);
    d.appendChild(document.createElement('br'));d.appendChild(document.createTextNode(f.sub));
    d.appendChild(document.createElement('br'));
    var btn=document.createElement('button');btn.textContent=D.labels.details;btn.style.background=C.button;btn.style.color=C.onAccent;
    btn.onclick=function(){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(f.id)};
    d.appendChild(btn);
    L.circleMarker([f.lat,f.lon],{radius:f.near?9:7,fillColor:f.near?C.near:C.fire,color:C.ring,weight:2,fillOpacity:1}).addTo(map).bindPopup(d);
  });
  var pts=D.focus.slice(); if(sel) pts.push([sel.lat,sel.lon]);
  if(pts.length>1) map.fitBounds(pts,{padding:[28,28],maxZoom:10});
  else if(sel) map.setView([sel.lat,sel.lon],9);
  else map.setView([47.3,-121.5],7);
  var lg=L.control({position:'bottomleft'});
  lg.onAdd=function(){var el=L.DomUtil.create('div','legend');el.style.background=C.bg;el.style.color=C.text;
    D.labels.legend.forEach(function(row){var r=document.createElement('div');var i=document.createElement('i');i.style.background=C[row[1]];r.appendChild(i);r.appendChild(document.createTextNode(row[0]));el.appendChild(r);});
    return el;};
  lg.addTo(map);
})();
</script>
</body>
</html>`;
  }, [isDark, theme, t, loc, fires, focusFires, nearMiles]);

  if (!WebView) return null;
  return (
    <View style={{ height: 240, marginHorizontal: 16, borderRadius: 12, marginTop: 12, overflow: 'hidden' }}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        originWhitelist={['*']}
        javaScriptEnabled
        scrollEnabled={false}
        onMessage={(e) => onSelectFire?.(e.nativeEvent.data)}
      />
    </View>
  );
}
