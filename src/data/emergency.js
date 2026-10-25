import { T } from '../i18n';

export const SHELTER_DISCLAIMER =
  'Shelter locations based on past activations. ' +
  'Confirm active shelters via WA-Alert or dial 2-1-1 on the day of evacuation.';

// ── EMERGENCY CONTACTS ────────────────────────────────────────────────────
const C_KING     = { name:{ en:'King County Emergency Mgmt',     es:'Manejo de Emergencias del Condado King' },     detail:'(206) 296-3830' };
const C_KITTITAS = { name:{ en:'Kittitas County Emergency Mgmt', es:'Manejo de Emergencias del Condado Kittitas' }, detail:'(509) 962-7525' };
const C_CHELAN   = { name:{ en:'Chelan County Sheriff',          es:'Sheriff del Condado de Chelan' },              detail:'(509) 667-6500' };
const C_211      = { name:{ en:'2-1-1 WA — Disaster Helpline',   es:'2-1-1 WA — Línea de Ayuda en Desastres' },    detail:'2-1-1' };

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

// ── EVACUATION ROUTES ─────────────────────────────────────────────────────
// Sources: King County EM, City of Sammamish EM, City of Issaquah 2025
// Evacuation Time Study, Kittitas County Sheriff EM
// (kcsoem@co.kittitas.wa.us / 509-962-7525), Chelan County EM,
// OPB/RosElum SR-903 reporting, Red Cross shelter locator,
// Putnam Centennial Center (confirmed 2017 Jolly Mountain Fire),
// Kittitas County Event Center (confirmed 2025 Lambert Rd Fire).
export const EVAC_ROUTES = {
  kirkland:[
    {num:1,name:{en:'Primary — I-405 North to SR-522',es:'Principal — I-405 Norte a SR-522'},time:'Est. 25 min',desc:{en:'Head north on I-405 toward Lynnwood. Exit SR-522 west toward Woodinville. Shelter at Woodinville High School (14508 NE 171st St). Sign up for Alert King County.',es:'Diríjase al norte por I-405 hacia Lynnwood. Salga SR-522 oeste hacia Woodinville. Refugio en Woodinville High School (14508 NE 171st St). Regístrese en Alert King County.'}},
    {num:2,name:{en:'Alternate — SR-520 West toward Seattle',es:'Alternativa — SR-520 Oeste hacia Seattle'},time:'Est. 35 min',desc:{en:'If I-405 is gridlocked, head toward SR-520 west into Seattle. For real-time routing, follow WA-Alert instructions or check the King County OEM evacuation map at kingcounty.gov/emergencymanagement.',es:'Si I-405 está congestionado, diríjase hacia SR-520 oeste hacia Seattle. Para rutas en tiempo real, siga las instrucciones de WA-Alert o consulte el mapa de evacuación del Condado King en kingcounty.gov/emergencymanagement.'}},
    {num:3,name:{en:'Last resort — Lake Washington shoreline to Kenmore',es:'Último recurso — Orilla del Lago Washington a Kenmore'},time:'Est. 40 min',desc:{en:'Follow the Lake Washington shoreline north toward Kenmore, then east on SR-522. Use only if I-405 and SR-520 are both blocked. For real-time routing, follow WA-Alert instructions or check the King County OEM evacuation map at kingcounty.gov/emergencymanagement.',es:'Siga la orilla del Lago Washington al norte hacia Kenmore, luego este por SR-522. Use solo si I-405 y SR-520 están bloqueados. Para rutas en tiempo real, siga las instrucciones de WA-Alert o consulte el mapa de evacuación del Condado King en kingcounty.gov/emergencymanagement.'}},
  ],
  sammamish:[
    {num:1,name:{en:'Primary — I-90 West toward Bellevue',es:'Principal — I-90 Oeste hacia Bellevue'},time:'Est. 20 min',desc:{en:'Head toward I-90 west toward Bellevue and Seattle. Shelter at Bellevue College (3000 Landerholm Circle SE). For real-time routing, follow WA-Alert instructions or check the King County OEM evacuation map at kingcounty.gov/emergencymanagement.',es:'Diríjase hacia I-90 oeste hacia Bellevue y Seattle. Refugio en Bellevue College (3000 Landerholm Circle SE). Para rutas en tiempo real, siga las instrucciones de WA-Alert o consulte el mapa de evacuación del Condado King en kingcounty.gov/emergencymanagement.'}},
    {num:2,name:{en:'Alternate — E Lake Sammamish Pkwy N to Redmond',es:'Alternativa — E Lake Sammamish Pkwy N a Redmond'},time:'Est. 25 min',desc:{en:'Head north on E Lake Sammamish Pkwy NE to Redmond, then west on SR-520 or north on I-405. Shelter at Redmond City Hall (15670 NE 85th St).',es:'Diríjase al norte por E Lake Sammamish Pkwy NE a Redmond, luego oeste por SR-520 o norte por I-405. Refugio en Redmond City Hall (15670 NE 85th St).'}},
    {num:3,name:{en:'Last resort — Issaquah-Pine Lake Rd SE South',es:'Último recurso — Issaquah-Pine Lake Rd SE Sur'},time:'Est. 30 min',desc:{en:'Head south on Issaquah-Pine Lake Rd SE to Issaquah, then west on I-90. Use only if northern routes are blocked and fire is not approaching from Tiger Mountain to the south.',es:'Diríjase al sur por Issaquah-Pine Lake Rd SE a Issaquah, luego oeste por I-90. Use solo si las rutas norte están bloqueadas y el fuego no viene del sur.'}},
  ],
  issaquah:[
    {num:1,name:{en:'Primary — I-90 West to Bellevue',es:'Principal — I-90 Oeste a Bellevue'},time:'Est. 20 min',desc:{en:"Head west on I-90 toward Bellevue — Issaquah's primary evacuation corridor per the 2025 Evacuation Time Study (issaquahwa.gov). Shelter at Bellevue College (3000 Landerholm Circle SE). Sign up for Alert King County.",es:'Diríjase al oeste por I-90 hacia Bellevue — corredor principal según el Estudio de Evacuación 2025 (issaquahwa.gov). Refugio en Bellevue College (3000 Landerholm Circle SE).'}},
    {num:2,name:{en:'Alternate — SR-900 toward Renton',es:'Alternativa — SR-900 hacia Renton'},time:'Est. 30 min',desc:{en:'Head toward SR-900 south to Renton. Avoids I-90 congestion. Shelter at Renton Technical College (3000 NE 4th St). For real-time routing, follow WA-Alert instructions or check the King County OEM evacuation map at kingcounty.gov/emergencymanagement.',es:'Diríjase hacia SR-900 sur a Renton. Evita la congestión de I-90. Refugio en Renton Technical College (3000 NE 4th St). Para rutas en tiempo real, siga las instrucciones de WA-Alert o consulte el mapa de evacuación del Condado King en kingcounty.gov/emergencymanagement.'}},
    {num:3,name:{en:'Last resort — I-90 East to North Bend',es:'Último recurso — I-90 Este a North Bend'},time:'Est. 20 min',desc:{en:'Only if western I-90 is blocked and fire is not from the east. Head east to North Bend. Shelter at North Bend Elementary (123 E 4th St). Monitor fire location carefully.',es:'Solo si I-90 oeste está bloqueado y el fuego no viene del este. Vaya al este a North Bend. Refugio en North Bend Elementary (123 E 4th St). Monitoree la ubicación del fuego.'}},
  ],
  'maple-valley':[
    {num:1,name:{en:'Primary — SR-516 West to Kent',es:'Principal — SR-516 Oeste a Kent'},time:'Est. 25 min',desc:{en:'Head west on SR-516 (Kent-Kangley Rd) toward Kent, then SR-167 north to Renton or south to Auburn. Shelter at Kent Commons Community Center (525 4th Ave N, Kent). Sign up for Alert King County.',es:'Diríjase al oeste por SR-516 (Kent-Kangley Rd) hacia Kent, luego SR-167 norte a Renton. Refugio en Kent Commons Community Center (525 4th Ave N, Kent). Regístrese en Alert King County.'}},
    {num:2,name:{en:'Alternate — SR-18 toward Auburn',es:'Alternativa — SR-18 hacia Auburn'},time:'Est. 30 min',desc:{en:'Head onto SR-18 west toward Auburn and Federal Way. Avoids SR-516 corridor. Shelter at Auburn Multiservice Center (1 E Main St, Auburn). For real-time routing, follow WA-Alert instructions or check the King County OEM evacuation map at kingcounty.gov/emergencymanagement.',es:'Tome SR-18 oeste hacia Auburn y Federal Way. Evita el corredor SR-516. Refugio en Auburn Multiservice Center (1 E Main St, Auburn). Para rutas en tiempo real, siga las instrucciones de WA-Alert o consulte el mapa de evacuación del Condado King en kingcounty.gov/emergencymanagement.'}},
    {num:3,name:{en:'Last resort — SR-169 toward Renton',es:'Último recurso — SR-169 hacia Renton'},time:'Est. 35 min',desc:{en:'Head toward Black Diamond, then take SR-169 toward Renton. Avoid if fire is in the Green River Gorge area. For real-time routing, follow WA-Alert instructions or check the King County OEM evacuation map at kingcounty.gov/emergencymanagement.',es:'Diríjase hacia Black Diamond, luego tome SR-169 hacia Renton. Evite si hay fuego en el área Green River Gorge. Para rutas en tiempo real, siga las instrucciones de WA-Alert o consulte el mapa de evacuación del Condado King en kingcounty.gov/emergencymanagement.'}},
  ],
  wenatchee:[
    {num:1,name:{en:'Primary — US-2 West over Stevens Pass',es:'Principal — US-2 Oeste por Stevens Pass'},time:'Est. 2 hr',desc:{en:'Head west on US-2 over Stevens Pass toward Everett. Shelter at Everett Community College (2000 Tower St). Check WSDOT for pass conditions before departing.',es:'Diríjase al oeste por US-2 sobre Stevens Pass hacia Everett. Refugio en Everett Community College (2000 Tower St). Verifique WSDOT para condiciones del paso.'}},
    {num:2,name:{en:'Alternate — US-97 South to Ellensburg',es:'Alternativa — US-97 Sur a Ellensburg'},time:'Est. 45 min',desc:{en:'Head south on US-97 Alt to Ellensburg. Shelter at Kittitas Valley Event Center (901 E 7th Ave, Ellensburg) or CWU (400 E University Way). Use if fire is north or east of Wenatchee.',es:'Diríjase al sur por US-97 Alt a Ellensburg. Refugio en Kittitas Valley Event Center (901 E 7th Ave) o CWU (400 E University Way). Use si el fuego está al norte o este.'}},
    {num:3,name:{en:'Last resort — US-2 East to Waterville',es:'Último recurso — US-2 Este a Waterville'},time:'Est. 30 min',desc:{en:'Head east on US-2 away from the Cascades toward Waterville. Shelter at Douglas County Fairgrounds. Use only if both west and south routes are blocked.',es:'Diríjase al este por US-2 hacia Waterville. Refugio en el recinto ferial del Condado de Douglas. Use solo si las rutas oeste y sur están bloqueadas.'}},
  ],
  leavenworth:[
    {num:1,name:{en:'Primary — US-2 West to Wenatchee',es:'Principal — US-2 Oeste a Wenatchee'},time:'Est. 35 min',desc:{en:'Head west on US-2 toward Wenatchee. If Wenatchee is also impacted, continue west over Stevens Pass to Everett. Shelter at Chelan County Fairgrounds (5700 Wenas Rd, Wenatchee).',es:'Diríjase al oeste por US-2 hacia Wenatchee. Si hay impacto, continúe sobre Stevens Pass a Everett. Refugio en el recinto ferial del Condado de Chelan (5700 Wenas Rd).'}},
    {num:2,name:{en:'Alternate — US-2 East to Cashmere',es:'Alternativa — US-2 Este a Cashmere'},time:'Est. 15 min',desc:{en:'Head east on US-2 to Cashmere, then south to Wenatchee via US-97 Alt. Shelter at Chelan County Fairgrounds. Use if fire is west of Leavenworth blocking US-2 west.',es:'Diríjase al este por US-2 a Cashmere, luego sur a Wenatchee por US-97 Alt. Refugio en el recinto ferial de Chelan. Use si el fuego bloquea US-2 oeste.'}},
    {num:3,name:{en:'Icicle Canyon — single exit, leave at Level 1',es:'Icicle Canyon — salida única, salga al Nivel 1'},time:'LEAVE EARLY',desc:{en:'Icicle Rd is a dead-end canyon with no alternate exit. If you live on Icicle Rd, leave at Level 1 — do NOT wait for Level 3. Call Chelan County Sheriff: (509) 667-6500 before entering.',es:'Icicle Rd es un cañón sin salida alternativa. Si vive en Icicle Rd, salga al Nivel 1 — NO espere al Nivel 3. Llame al Sheriff de Chelan: (509) 667-6500 antes de entrar.'}},
  ],
  ellensburg:[
    {num:1,name:{en:'Primary — I-90 West to Cle Elum',es:'Principal — I-90 Oeste a Cle Elum'},time:'Est. 30 min',desc:{en:'Head west on I-90 toward Cle Elum and over Snoqualmie Pass to North Bend. Shelter at North Bend Elementary (123 E 4th St) or continue to Bellevue. Kittitas County may convert SR-10 to one-way outbound during large evacuations.',es:'Diríjase al oeste por I-90 hacia Cle Elum y sobre Snoqualmie Pass. Refugio en North Bend Elementary (123 E 4th St). El Condado de Kittitas puede convertir SR-10 en sentido único durante evacuaciones.'}},
    {num:2,name:{en:'Alternate — US-97 North to Wenatchee',es:'Alternativa — US-97 Norte a Wenatchee'},time:'Est. 45 min',desc:{en:'Head north on US-97 Alt toward Wenatchee. Shelter at Chelan County Fairgrounds (5700 Wenas Rd, Wenatchee). Use if fire is south or west blocking I-90.',es:'Diríjase al norte por US-97 Alt hacia Wenatchee. Refugio en el recinto ferial del Condado de Chelan (5700 Wenas Rd). Use si el fuego bloquea I-90 al sur u oeste.'}},
    {num:3,name:{en:'Shelter — Kittitas Valley Event Center',es:'Refugio — Kittitas Valley Event Center'},time:'In city',desc:{en:'If routes out are blocked, shelter at Kittitas Valley Event Center (901 E 7th Ave, Ellensburg) — confirmed active shelter in past fires. Animal shelter at same location. Kittitas County EM: (509) 962-7525.',es:'Si las rutas están bloqueadas, refugio en Kittitas Valley Event Center (901 E 7th Ave, Ellensburg) — confirmado en incendios anteriores. Refugio de animales en el mismo lugar. EM: (509) 962-7525.'}},
  ],
  'cle-elum':[
    {num:1,name:{en:'Primary — I-90 East to Ellensburg',es:'Principal — I-90 Este a Ellensburg'},time:'Est. 20 min',desc:{en:'Head east on I-90 toward Ellensburg, away from the Cascades. Shelter at Kittitas Valley Event Center (901 E 7th Ave, Ellensburg). Fastest route away from the primary fire risk zone west of Cle Elum.',es:'Diríjase al este por I-90 hacia Ellensburg. Refugio en Kittitas Valley Event Center (901 E 7th Ave, Ellensburg). La ruta más rápida fuera de la zona de riesgo al oeste de Cle Elum.'}},
    {num:2,name:{en:'Alternate — I-90 West over Snoqualmie Pass',es:'Alternativa — I-90 Oeste sobre Snoqualmie Pass'},time:'Est. 50 min',desc:{en:'Head west on I-90 over Snoqualmie Pass to North Bend. Shelter at North Bend Elementary (123 E 4th St). Check WSDOT for pass conditions. Use if fire is east of Cle Elum.',es:'Diríjase al oeste por I-90 sobre Snoqualmie Pass a North Bend. Refugio en North Bend Elementary (123 E 4th St). Verifique WSDOT. Use si el fuego está al este de Cle Elum.'}},
    {num:3,name:{en:'SR-903 / Roslyn — ONE road out, leave at Level 1',es:'SR-903 / Roslyn — UNA sola salida, salga al Nivel 1'},time:'LEAVE EARLY',desc:{en:"SR-903 is the ONLY road out of Roslyn and upper Cle Elum Lake — Kittitas County EM's #1 evacuation risk. Leave at Level 1 (GET READY). Shelter: Putnam Centennial Center (719 E 1st St, Cle Elum). Animal shelter: Kittitas County Event Center.",es:'SR-903 es la ÚNICA salida de Roslyn y el Lago Cle Elum — riesgo #1 del EM del Condado de Kittitas. Salga al Nivel 1 (PREPÁRESE). Refugio: Putnam Centennial Center (719 E 1st St, Cle Elum). Animales: Kittitas County Event Center.'}},
  ],
};

// Resolves routes for a location into the active language, with a sensible
// generic fallback for any location without curated routes.
export function getRoutes(key, lang) {
  const routes = EVAC_ROUTES[key];
  if (routes) return routes.map((r) => ({ ...r, name: r.name[lang], desc: r.desc[lang] }));
  const t = T[lang];
  return [
    { num:1, name:t.followAlerts, time:'Variable', desc:t.followAlertsDesc },
    { num:2, name:t.movePerpendicular, time:'Variable', desc:t.movePerpendicularDesc },
  ];
}
