// ── LOCATIONS ─────────────────────────────────────────────────────────────
export const LOCATIONS = [
  { key:'kirkland',     label:'Kirkland (WA-01/08 border)', county:'King', zip:'98033', lat:47.6769, lon:-122.2060, note:'Kirkland (98033) sits near the WA-08/WA-01 boundary and may fall in WA-01. Evacuation routes shown are directionally correct regardless of district.' },
  { key:'sammamish',    label:'Sammamish',    county:'King',     zip:'98075', lat:47.6163, lon:-122.0356 },
  { key:'issaquah',     label:'Issaquah',     county:'King',     zip:'98027', lat:47.5301, lon:-122.0326 },
  { key:'maple-valley', label:'Maple Valley', county:'King',     zip:'98038', lat:47.3748, lon:-122.0465 },
  { key:'wenatchee',    label:'Wenatchee',    county:'Chelan',   zip:'98801', lat:47.4234, lon:-120.3103 },
  { key:'leavenworth',  label:'Leavenworth',  county:'Chelan',   zip:'98826', lat:47.5953, lon:-120.6483 },
  { key:'ellensburg',   label:'Ellensburg',   county:'Kittitas', zip:'98926', lat:46.9965, lon:-120.5478 },
  { key:'cle-elum',     label:'Cle Elum',     county:'Kittitas', zip:'98922', lat:47.1954, lon:-120.9365 },
];

// East-of-Cascades communities — used to pick the higher-fire-risk demo
// forecast when the live NWS request fails.
export const EAST = ['wenatchee', 'leavenworth', 'ellensburg', 'cle-elum'];

// WA state bounding box (reserved for filtering fires to the region).
export const WA_BOUNDS = { minLon: -124.8, maxLon: -116.9, minLat: 45.5, maxLat: 49.1 };

export const findLocation = (key) => LOCATIONS.find((l) => l.key === key);
