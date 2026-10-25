import { T } from '../i18n';

// ── VERIFICATION ──────────────────────────────────────────────────────────
// Every route, shelter, contact, and county link carries `source` (URL) and
// `lastVerified` (YYYY-MM-DD). `lastVerified` is set ONLY when an official
// source confirms the record; otherwise it is null and the UI shows it as
// unverified. Open items are tracked in VERIFY.md.
const V = '2026-10-24';

const SRC = {
  kingEM:      'https://kingcounty.gov/en/dept/executive-services/governance-leadership/emergency-management/about',
  kingAlert:   'https://kingcounty.gov/en/dept/executive-services/health-safety/safety-injury-prevention/emergency-preparedness/alert-king-county',
  chelanEM:    'https://www.co.chelan.wa.us/emergency-management',
  kittitasEM:  'https://www.co.kittitas.wa.us/sheriff/emergency.aspx',
  // Kittitas County press release, 2014-08-02 (Robbins Road fire): Red Cross
  // shelter at Mercer Creek Church; fairgrounds open for livestock/animals.
  kittitas2014:'http://www.co.kittitas.wa.us/press/default.aspx?prID=5518',
};

// ── COUNTY RESOURCES ──────────────────────────────────────────────────────
// Official alert sign-up and evacuation-level lookup per county.
export const COUNTY_RESOURCES = {
  King: {
    alertName: 'ALERT King County',
    alertUrl: 'https://member.everbridge.net/index/101672076443713',
    evacMapUrl: null, // No official public evacuation-zone lookup found — see VERIFY.md
    infoUrl: SRC.kingAlert,
    source: SRC.kingAlert, lastVerified: V,
  },
  Chelan: {
    alertName: 'Chelan County Alerts (Everbridge)',
    alertUrl: 'https://member.everbridge.net/406411280384261/login',
    evacMapUrl: 'https://experience.arcgis.com/experience/634880e739884cf2a4d39771e86d5ac9',
    infoUrl: SRC.chelanEM,
    source: SRC.chelanEM, lastVerified: V,
  },
  Kittitas: {
    alertName: 'Kittitas County Alerts (Everbridge)',
    alertUrl: 'https://member.everbridge.net/337829242601599/login',
    evacMapUrl: 'https://experience.arcgis.com/experience/cbd279e3569d45b4aeb28bc1f0c616ff',
    infoUrl: SRC.kittitasEM,
    source: SRC.kittitasEM, lastVerified: V,
  },
};

// ── EMERGENCY CONTACTS ────────────────────────────────────────────────────
const C_KING     = { name:{ en:'King County Emergency Mgmt',     es:'Manejo de Emergencias del Condado King' },     detail:'(206) 296-3830', source:SRC.kingEM, lastVerified:V };
const C_KITTITAS = { name:{ en:'Kittitas County Sheriff — Emergency Mgmt', es:'Sheriff del Condado Kittitas — Manejo de Emergencias' }, detail:'(509) 962-7525', source:SRC.kittitasEM, lastVerified:V };
const C_CHELAN   = { name:{ en:'Chelan County Emergency Mgmt',   es:'Manejo de Emergencias del Condado de Chelan' }, detail:'(509) 667-6863', source:SRC.chelanEM, lastVerified:V };
const C_211      = { name:{ en:'2-1-1 WA — Disaster Helpline',   es:'2-1-1 WA — Línea de Ayuda en Desastres' },    detail:'2-1-1', source:'https://wa211.org/', lastVerified:null };

// Fallback list (all counties) used when no location key is matched.
export const CONTACTS = [C_KING, C_KITTITAS, C_CHELAN, C_211];

const CONTACTS_BY_LOCATION = {
  'kirkland':     [C_KING,     C_211],
  'sammamish':    [C_KING,     C_211],
  'issaquah':     [C_KING,     C_211],
  'maple-valley': [C_KING,     C_211],
  'wenatchee':    [C_CHELAN,   C_211],
  'leavenworth':  [C_CHELAN,   C_211],
  'ellensburg':   [C_KITTITAS, C_211],
  'cle-elum':     [C_KITTITAS, C_211],
};

// Returns contacts for a location with name resolved to the active language,
// mirroring how getRoutes works. Falls back to the full CONTACTS list.
export function getContacts(locationKey, lang) {
  const list = CONTACTS_BY_LOCATION[locationKey] ?? CONTACTS;
  return list.map((c) => ({ ...c, name: c.name[lang] }));
}

// ── SHELTERS ──────────────────────────────────────────────────────────────
// Facility addresses were checked against the venue's own listing where
// noted in VERIFY.md. None of the "people" shelters below is confirmed by an
// official source as a designated or past wildfire shelter.
const shelter = (name, address, extra = {}) => ({ name, address, use:'people', source:null, lastVerified:null, ...extra });
const SH = {
  woodinvilleHS:   shelter('Woodinville High School', '19819 136th Ave NE, Woodinville'),
  seattleCenter:   shelter('Seattle Center', '305 Harrison St, Seattle'),
  kenmoreCityHall: shelter('Kenmore City Hall', '18120 68th Ave NE, Kenmore'),
  bellevueCollege: shelter('Bellevue College', '3000 Landerholm Cir SE, Bellevue'),
  redmondCityHall: shelter('Redmond City Hall', '15670 NE 85th St, Redmond'),
  rentonTech:      shelter('Renton Technical College', '3000 NE 4th St, Renton'),
  northBendElem:   shelter('North Bend Elementary', '400 E 3rd St, North Bend'),
  kentCommons:     shelter('Kent Commons', '525 4th Ave N, Kent'),
  auburnMSC:       shelter('Auburn Multi-Service Center', '1 E Main St, Auburn'),
  everettCC:       shelter('Everett Community College', '2000 Tower St, Everett'),
  kvec:            shelter('Kittitas Valley Event Center', '901 E 7th Ave, Ellensburg'),
  kvecAnimals:     shelter('Kittitas Valley Event Center', '901 E 7th Ave, Ellensburg', { use:'animals', source:SRC.kittitas2014, lastVerified:V }),
  cwu:             shelter('Central Washington University', '400 E University Way, Ellensburg'),
  douglasFair:     shelter('Douglas County Fairgrounds', 'Waterville'),
  chelanExpo:      shelter('Chelan County Expo Center', '5700 Wescott Dr, Cashmere'),
  centennial:      shelter('Putnam Centennial Center', '719 E 3rd St, Cle Elum'),
};

// ── EVACUATION ROUTES ─────────────────────────────────────────────────────
// `est` is a rough drive time in minutes (unverified); `flag` marks special
// cases ('leaveEarly' single-exit areas, 'inCity' shelter-in-town options).
// No route below is confirmed by an official evacuation plan, so all carry
// lastVerified: null — see VERIFY.md for what was checked and corrected.
const route = (r) => ({ est:null, flag:null, shelters:[], source:null, lastVerified:null, ...r });

export const EVAC_ROUTES = {
  kirkland:[
    route({num:1,est:25,shelters:[SH.woodinvilleHS],name:{en:'Primary — I-405 North to SR-522',es:'Principal — I-405 Norte a SR-522'},desc:{en:'Head north on I-405, then take SR-522 east toward Woodinville.',es:'Diríjase al norte por I-405 y luego tome SR-522 este hacia Woodinville.'}}),
    route({num:2,est:35,shelters:[SH.seattleCenter],name:{en:'Alternate — SR-520 West toward Seattle',es:'Alternativa — SR-520 Oeste hacia Seattle'},desc:{en:'If I-405 is gridlocked, head toward SR-520 west into Seattle. Follow ALERT King County instructions for real-time routing.',es:'Si I-405 está congestionado, diríjase hacia SR-520 oeste hacia Seattle. Siga las instrucciones de ALERT King County para rutas en tiempo real.'}}),
    route({num:3,est:40,shelters:[SH.kenmoreCityHall],name:{en:'Last resort — Lake Washington shoreline to Kenmore',es:'Último recurso — Orilla del Lago Washington a Kenmore'},desc:{en:'Follow the Lake Washington shoreline north toward Kenmore. Use only if I-405 and SR-520 are both blocked.',es:'Siga la orilla del Lago Washington al norte hacia Kenmore. Use solo si I-405 y SR-520 están bloqueados.'}}),
  ],
  sammamish:[
    route({num:1,est:20,shelters:[SH.bellevueCollege],name:{en:'Primary — I-90 West toward Bellevue',es:'Principal — I-90 Oeste hacia Bellevue'},desc:{en:'Head to I-90 west toward Bellevue and Seattle. Follow ALERT King County instructions for real-time routing.',es:'Diríjase a I-90 oeste hacia Bellevue y Seattle. Siga las instrucciones de ALERT King County para rutas en tiempo real.'}}),
    route({num:2,est:25,shelters:[SH.redmondCityHall],name:{en:'Alternate — E Lake Sammamish Pkwy N to Redmond',es:'Alternativa — E Lake Sammamish Pkwy N a Redmond'},desc:{en:'Head north on E Lake Sammamish Pkwy NE to Redmond, then west on SR-520 or north on I-405.',es:'Diríjase al norte por E Lake Sammamish Pkwy NE a Redmond, luego oeste por SR-520 o norte por I-405.'}}),
    route({num:3,est:30,name:{en:'Last resort — Issaquah-Pine Lake Rd SE South',es:'Último recurso — Issaquah-Pine Lake Rd SE Sur'},desc:{en:'Head south on Issaquah-Pine Lake Rd SE to Issaquah, then west on I-90. Use only if northern routes are blocked and fire is not approaching from Tiger Mountain to the south.',es:'Diríjase al sur por Issaquah-Pine Lake Rd SE a Issaquah, luego oeste por I-90. Use solo si las rutas norte están bloqueadas y el fuego no viene del sur.'}}),
  ],
  issaquah:[
    route({num:1,est:20,shelters:[SH.bellevueCollege],name:{en:'Primary — I-90 West to Bellevue',es:'Principal — I-90 Oeste a Bellevue'},desc:{en:'Head west on I-90 toward Bellevue. The City of Issaquah 2025 Wildfire Evacuation Time Estimate Study covers evacuation timing by neighborhood (issaquahwa.gov).',es:'Diríjase al oeste por I-90 hacia Bellevue. El Estudio de Tiempos de Evacuación por Incendios 2025 de Issaquah cubre los tiempos por vecindario (issaquahwa.gov).'}}),
    route({num:2,est:30,shelters:[SH.rentonTech],name:{en:'Alternate — SR-900 toward Renton',es:'Alternativa — SR-900 hacia Renton'},desc:{en:'Head toward SR-900 south to Renton. Avoids I-90 congestion. Follow ALERT King County instructions for real-time routing.',es:'Diríjase hacia SR-900 sur a Renton. Evita la congestión de I-90. Siga las instrucciones de ALERT King County para rutas en tiempo real.'}}),
    route({num:3,est:20,shelters:[SH.northBendElem],name:{en:'Last resort — I-90 East to North Bend',es:'Último recurso — I-90 Este a North Bend'},desc:{en:'Only if western I-90 is blocked and fire is not from the east. Head east to North Bend. Monitor fire location carefully.',es:'Solo si I-90 oeste está bloqueado y el fuego no viene del este. Vaya al este a North Bend. Monitoree la ubicación del fuego.'}}),
  ],
  'maple-valley':[
    route({num:1,est:25,shelters:[SH.kentCommons],name:{en:'Primary — SR-516 West to Kent',es:'Principal — SR-516 Oeste a Kent'},desc:{en:'Head west on SR-516 (Kent-Kangley Rd) toward Kent, then SR-167 north to Renton or south to Auburn.',es:'Diríjase al oeste por SR-516 (Kent-Kangley Rd) hacia Kent, luego SR-167 norte a Renton o sur a Auburn.'}}),
    route({num:2,est:30,shelters:[SH.auburnMSC],name:{en:'Alternate — SR-18 toward Auburn',es:'Alternativa — SR-18 hacia Auburn'},desc:{en:'Head onto SR-18 west toward Auburn and Federal Way. Avoids the SR-516 corridor.',es:'Tome SR-18 oeste hacia Auburn y Federal Way. Evita el corredor SR-516.'}}),
    route({num:3,est:35,name:{en:'Last resort — SR-169 toward Renton',es:'Último recurso — SR-169 hacia Renton'},desc:{en:'Head toward Black Diamond, then take SR-169 toward Renton. Avoid if fire is in the Green River Gorge area.',es:'Diríjase hacia Black Diamond, luego tome SR-169 hacia Renton. Evite si hay fuego en el área Green River Gorge.'}}),
  ],
  wenatchee:[
    route({num:1,est:120,shelters:[SH.everettCC],name:{en:'Primary — US-2 West over Stevens Pass',es:'Principal — US-2 Oeste por Stevens Pass'},desc:{en:'Head west on US-2 over Stevens Pass toward Everett. Check WSDOT for pass conditions before departing.',es:'Diríjase al oeste por US-2 sobre Stevens Pass hacia Everett. Verifique WSDOT para condiciones del paso.'}}),
    route({num:2,est:45,shelters:[SH.kvec, SH.cwu],name:{en:'Alternate — US-97 South over Blewett Pass to Ellensburg',es:'Alternativa — US-97 Sur por Blewett Pass a Ellensburg'},desc:{en:'Head west on US-2/US-97 to Peshastin, then south on US-97 over Blewett Pass to Ellensburg. Use if fire is north or east of Wenatchee.',es:'Diríjase al oeste por US-2/US-97 a Peshastin, luego al sur por US-97 sobre Blewett Pass a Ellensburg. Use si el fuego está al norte o este.'}}),
    route({num:3,est:30,shelters:[SH.douglasFair],name:{en:'Last resort — US-2 East to Waterville',es:'Último recurso — US-2 Este a Waterville'},desc:{en:'Head east on US-2 away from the Cascades toward Waterville. Use only if both west and south routes are blocked.',es:'Diríjase al este por US-2 hacia Waterville. Use solo si las rutas oeste y sur están bloqueadas.'}}),
  ],
  leavenworth:[
    route({num:1,shelters:[SH.chelanExpo],name:{en:'Primary — US-2 East to Cashmere and Wenatchee',es:'Principal — US-2 Este a Cashmere y Wenatchee'},desc:{en:'Head east on US-2 through Peshastin and Cashmere toward Wenatchee.',es:'Diríjase al este por US-2 pasando Peshastin y Cashmere hacia Wenatchee.'}}),
    route({num:2,name:{en:'Alternate — US-2 West over Stevens Pass',es:'Alternativa — US-2 Oeste por Stevens Pass'},desc:{en:'Use only if fire east of Leavenworth blocks US-2 east. Head west through Tumwater Canyon and over Stevens Pass toward Skykomish and Everett. Check WSDOT for closures — US-2 through Tumwater Canyon has closed for fires before.',es:'Use solo si el fuego al este de Leavenworth bloquea US-2 este. Diríjase al oeste por Tumwater Canyon y sobre Stevens Pass hacia Skykomish y Everett. Verifique cierres en WSDOT — US-2 en Tumwater Canyon ha cerrado por incendios antes.'}}),
    route({num:3,flag:'leaveEarly',name:{en:'Icicle Canyon — single exit, leave at Level 1',es:'Icicle Canyon — salida única, salga al Nivel 1'},desc:{en:'Icicle Rd is a dead-end canyon with no alternate exit. If you live on Icicle Rd, leave at Level 1 — do NOT wait for Level 3. Chelan County Emergency Management: (509) 667-6863.',es:'Icicle Rd es un cañón sin salida alternativa. Si vive en Icicle Rd, salga al Nivel 1 — NO espere al Nivel 3. Manejo de Emergencias de Chelan: (509) 667-6863.'}}),
  ],
  ellensburg:[
    route({num:1,est:30,shelters:[SH.northBendElem],name:{en:'Primary — I-90 West to Cle Elum',es:'Principal — I-90 Oeste a Cle Elum'},desc:{en:'Head west on I-90 toward Cle Elum and over Snoqualmie Pass to North Bend, or continue to Bellevue. Kittitas County may convert SR-10 to one-way outbound during large evacuations.',es:'Diríjase al oeste por I-90 hacia Cle Elum y sobre Snoqualmie Pass a North Bend, o continúe a Bellevue. El Condado de Kittitas puede convertir SR-10 en sentido único durante evacuaciones grandes.'}}),
    route({num:2,est:45,shelters:[SH.chelanExpo],name:{en:'Alternate — US-97 North over Blewett Pass toward Wenatchee',es:'Alternativa — US-97 Norte por Blewett Pass hacia Wenatchee'},desc:{en:'Head north on US-97 over Blewett Pass, then east on US-2 through Cashmere toward Wenatchee. Use if fire is south or west blocking I-90.',es:'Diríjase al norte por US-97 sobre Blewett Pass, luego al este por US-2 pasando Cashmere hacia Wenatchee. Use si el fuego bloquea I-90 al sur u oeste.'}}),
    route({num:3,flag:'inCity',shelters:[SH.kvecAnimals],name:{en:'In town — Kittitas Valley Event Center (animals)',es:'En la ciudad — Kittitas Valley Event Center (animales)'},desc:{en:'If routes out are blocked, follow Kittitas County alerts for open shelters. The Kittitas Valley Event Center (fairgrounds) has opened for livestock and animals in past fires; in 2014 the Red Cross sheltered people at Mercer Creek Church instead. Kittitas County Sheriff: (509) 962-7525.',es:'Si las rutas están bloqueadas, siga las alertas del Condado Kittitas sobre refugios abiertos. El Kittitas Valley Event Center (recinto ferial) ha recibido ganado y animales en incendios anteriores; en 2014 la Cruz Roja alojó a personas en Mercer Creek Church. Sheriff de Kittitas: (509) 962-7525.'}}),
  ],
  'cle-elum':[
    route({num:1,est:20,shelters:[SH.kvec],name:{en:'Primary — I-90 East to Ellensburg',es:'Principal — I-90 Este a Ellensburg'},desc:{en:'Head east on I-90 toward Ellensburg, away from the Cascades. Fastest route away from the primary fire risk zone west of Cle Elum.',es:'Diríjase al este por I-90 hacia Ellensburg. La ruta más rápida fuera de la zona de riesgo al oeste de Cle Elum.'}}),
    route({num:2,est:50,shelters:[SH.northBendElem],name:{en:'Alternate — I-90 West over Snoqualmie Pass',es:'Alternativa — I-90 Oeste sobre Snoqualmie Pass'},desc:{en:'Head west on I-90 over Snoqualmie Pass to North Bend. Check WSDOT for pass conditions. Use if fire is east of Cle Elum.',es:'Diríjase al oeste por I-90 sobre Snoqualmie Pass a North Bend. Verifique WSDOT. Use si el fuego está al este de Cle Elum.'}}),
    route({num:3,flag:'leaveEarly',shelters:[SH.centennial, SH.kvecAnimals],name:{en:'SR-903 / Roslyn — ONE road out, leave at Level 1',es:'SR-903 / Roslyn — UNA sola salida, salga al Nivel 1'},desc:{en:'SR-903 is the only paved road out of Roslyn, Ronald, and Lake Cle Elum. Leave at Level 1 (GET READY) — do not wait.',es:'SR-903 es la única carretera pavimentada de salida de Roslyn, Ronald y el Lago Cle Elum. Salga al Nivel 1 (PREPÁRESE) — no espere.'}}),
  ],
};

// Resolves routes for a location into the active language, with a sensible
// generic fallback for any location without curated routes.
export function getRoutes(key, lang) {
  const routes = EVAC_ROUTES[key];
  if (routes) return routes.map((r) => ({ ...r, name: r.name[lang], desc: r.desc[lang] }));
  const t = T[lang];
  return [
    route({ num:1, name:t.followAlerts, desc:t.followAlertsDesc }),
    route({ num:2, name:t.movePerpendicular, desc:t.movePerpendicularDesc }),
  ];
}
