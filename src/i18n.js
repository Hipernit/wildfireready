import { createContext, useContext } from 'react';

// ── TRANSLATIONS ──────────────────────────────────────────────────────────
export const T = {
  en: {
    tabs:{ home:'Now', weather:'Weather', gobag:'Go Bag', score:'Score', plan:'Plan' },
    chooseLocation:'Choose location', done:'Done', county:'County',
    airQuality:'Air quality', fetchingAqi:'Fetching live AQI data...',
    activeFires:'Wildfires near {community}',
    noFires:'No active wildfires reported in Washington state right now.',
    fetchingFires:'Fetching live NIFC fire data...',
    getAlerts:'Get official emergency alerts',
    alertsBody:'Evacuation orders and emergency alerts for {community} come from {county} County by text, call, or email. WildfireReady does not send alerts itself.',
    markAlertsDone:"I've signed up", alertsDone:'Signed up ✓ — tap to undo',
    live:'Live', prelimData:'Preliminary data', pullRefresh:'Pull to refresh', offlineData:'Offline data',
    worksOffline:'Works offline', acres:'Acres', contained:'Contained',
    fireStatus:{ active:'Active', monitoring:'Monitoring', contained:'Contained', unknown:'Containment unknown' },
    fireCauses:{ Natural:'Natural', Human:'Human-caused', Undetermined:'Undetermined', Unknown:'Unknown' },
    underInvestigation:'Under investigation', unknown:'Unknown', unnamedFire:'Unnamed fire',
    distanceFrom:'{mi} mi from {community}', nearbyBadge:'Within {mi} mi',
    nearestOf:'Nearest {n} of {total} reported incidents in Washington',
    countyName:'{name} County',
    legendYou:'Your community', legendOther:'Other communities', legendFireNear:'Fire within {mi} mi', legendFire:'Fire',
    mapDetails:'Details', acresWord:'acres',
    nifcCredit:'Fire data: NIFC / WFIGS · Updated daily',
    mapCredit:'Map: OpenStreetMap · Fire locations: NIFC / WFIGS',
    cause:'Cause', updated:'Updated',
    banners:{
      danger:{ title:'Unhealthy air', msg:'Unhealthy air detected. Stay indoors and wear an N95 mask if you go outside.' },
      warning:{ title:'Sensitive groups advisory', msg:'Children, elderly, and people with respiratory conditions should limit outdoor time.' },
      ok:{ title:'No official fire or smoke alerts', msg:'NWS has no active fire-weather or air-quality alerts here. Evacuation orders come from your county — sign up for its alerts below.' },
    },
    lastUpdated:'Last updated {time}', savedData:'Offline — showing last saved data',
    demoBadge:'DEMO', demoNote:'Sample data for testing — not real conditions.',
    aqiUnavailable:'Air quality unavailable',
    aqiUnavailableMsg:"Couldn't reach AirNow and there's no saved reading for this community. Pull to refresh.",
    aqiNoKey:'AQI unavailable: no API key',
    aqiNoKeyMsg:'This build has no AirNow API key (EXPO_PUBLIC_AIRNOW_API_KEY). See the README.',
    aqiNoData:'No AirNow monitor is reporting near this community right now.',
    aqiBadKey:'AQI unavailable: API key rejected',
    aqiBadKeyMsg:'AirNow rejected this build\'s API key. Request a new key and set EXPO_PUBLIC_AIRNOW_API_KEY (see the README).',
    aqiLabels:{ good:'Good', moderate:'Moderate', sensitive:'Unhealthy for Sensitive Groups', unhealthy:'Unhealthy', veryUnhealthy:'Very Unhealthy', hazardous:'Hazardous' },
    aqiMsgs:{
      good:'Air quality is satisfactory. Great day to be outside.',
      moderate:'Acceptable for most. Sensitive individuals may want to limit outdoor exertion.',
      sensitive:'Children, elderly, and people with lung conditions should reduce outdoor exertion.',
      unhealthy:'Everyone should reduce prolonged outdoor exertion. Wear an N95 mask outside.',
      veryUnhealthy:'Health alert: everyone should avoid prolonged outdoor exertion. Wear an N95 mask outside.',
      hazardous:'Health emergency. Everyone should avoid all outdoor activity.',
    },
    officialAlerts:'Official NWS alerts',
    noOfficialAlerts:'No active Red Flag Warnings, Fire Weather Watches, or Air Quality Alerts from NWS for this location.',
    alertsUnavailable:"Couldn't check NWS alerts. Pull to refresh.",
    alertsChecked:'Checked {time}',
    alertUntil:'Until {time}', officialText:'Official NWS text', showDetails:'Show details', hideDetails:'Hide details',
    gobagReadiness:'Go-bag readiness', itemsPacked:'items packed', of:'of',
    resetAll:'Reset all checkboxes', resetConfirmTitle:'Reset checklist?',
    resetConfirmMsg:'This will uncheck all items.', cancel:'Cancel', reset:'Reset',
    gobagIntro:'Check items off as you pack. Aim for 100% before wildfire season peaks (July–September).',
    followAlerts:'Follow local emergency alerts',
    followAlertsDesc:'Tune to AM 950 KBBO (east WA) or KOMO 1000 (west WA) for real-time guidance.',
    movePerpendicular:'Move perpendicular to fire spread',
    movePerpendicularDesc:'Always move perpendicular to fire direction, not directly away.',
    fireWeather:'Fire weather forecast', fetchingWeather:'Fetching NWS forecast...',
    wxUnavailable:'Forecast unavailable',
    wxUnavailableMsg:"Couldn't reach the National Weather Service and there's no saved forecast. Pull to refresh.",
    fireRiskEstimate:'Estimated fire risk',
    wind:'Wind', temp:'Temp', conditions:'Conditions',
    nwsCredit:'Forecast: National Weather Service · NOAA',
    weatherNote:'"Estimated fire risk" is calculated by this app from the NWS forecast high temperature, lowest relative humidity, and strongest wind or gust for each day. It is not an official fire danger rating. Official Red Flag Warnings and Fire Weather Watches appear in the alerts section above.',
    weatherNoteNoRH:'Humidity data was unavailable for some days, so their estimate uses temperature and wind only.',
    dangerLevels:{ Extreme:'Extreme', High:'High', Moderate:'Moderate', Low:'Low', Minimal:'Minimal' },
    scoreTitle:'Household readiness', scoreSubtitle:'How prepared is your household for wildfire season?',
    scoreOf:'out of 100', breakdown:'Breakdown',
    shareScore:'Share my score',
    shareScoreMsg:'My WildfireReady household score is',
    shareScoreFooter:'. Is your household ready? Download WildfireReady for WA-08.',
    categories:{ gobag:'Go-bag packed', profile:'Household profile', alerts:'Official alerts', shared:'Plan shared', meeting:'Meeting point', contact:'Out-of-area contact' },
    catDescs:{ gobag:'Items that apply to your household', profile:'Saved household details', alerts:"Signed up for your county's alerts", shared:'Sent your plan to family', meeting:'A place to regroup if separated', contact:'Someone outside the area to check in with' },
    whatToFix:'What to improve',
    fixItems:{ gobag:'Pack the remaining go-bag items', profile:'Fill in your household profile', alerts:"Sign up for your county's emergency alerts", shared:'Share your plan with family', meeting:'Set a family meeting point', contact:'Add an out-of-area contact' },
    fixGain:'+{n} pts', editProfile:'Edit household profile',
    scoreGrades:{ A:'Outstanding — your household is well prepared.', B:'Good — a few gaps to close before fire season.', C:'Fair — keep going on the items below.', D:'Needs work — start with the top item below.', F:'Just getting started — tap an item below to begin.' },
    profileTitle:'Household profile', adults:'Adults', children:'Children', pets:'Pets',
    medications:'Someone takes prescription medication', mobility:'Someone has mobility or access needs', elderly:'Someone is 65 or older',
    meetingPoint:'Family meeting point', meetingPointHint:'e.g. library parking lot, 123 Main St',
    contactName:'Out-of-area contact name', contactPhone:'Out-of-area contact phone',
    save:'Save', profileNote:'Saved only on this device.',
    increaseA11y:'Increase {label}', decreaseA11y:'Decrease {label}',
    gobagTailored:'Tailored to your household of {people}. Edit your profile to change it.',
    themeModes:{ system:'Auto', light:'Light', dark:'Dark' }, themeA11y:'Theme: {mode}. Tap to change.', langA11y:'Switch language to {lang}',
    loading:'Loading…',
    aqiA11y:'Air quality index {aqi}: {label}',
    fireA11y:'{name}. {status}. {distance}. {acres} acres, {contained} contained.',
    humidity:'Min humidity', gusts:'Gusts', noValue:'—', aqiUnit:'AQI', firesUnavailable:'Fire data unavailable',
    useMyLocation:'Use my location', locating:'Finding your location…',
    locationDenied:'Location permission was denied. Choose a community from the list.',
    locationError:"Couldn't get your location. Choose a community from the list.",
    nearestPicked:'Nearest community: {name} ({mi} mi away)', closeA11y:'Close',
    householdPlan:'My household plan', outOfAreaContact:'Out-of-area contact', notSet:'Not set',
    householdCounts:'Adults: {adults} · Children: {children} · Pets: {pets}',
    householdEmpty:'Add a meeting point and an out-of-area contact so everyone knows where to go and who to call.',
    printPlan:'Print or save as PDF', printError:"Couldn't create the PDF. Try again.",
    planGenerated:'Generated {date}', planPdfTitle:'WildfireReady evacuation plan — {community}',
    staleBanner:'Offline — showing saved data from {time}. Pull down to refresh.',
    verifyStale:'Verified more than 6 months ago — re-check before relying on it',
    mapA11y:'Map of WA-08 communities and the nearest fires',
    evacAlertsLabel:'Official evacuation & fire alerts',
    galUnit:'gal',
    shelterDisclaimer:'Shelters listed are possible destinations, not confirmed open shelters, unless marked Verified. Shelters change for every event — confirm open shelters through your county alerts or by dialing 2-1-1.',
    verifiedOn:'Verified {date}', unverified:'Unverified — confirm with official sources',
    shelterLabel:'Shelter', animalShelterLabel:'Animal shelter', viewSource:'Source',
    countyResources:'Official {county} County resources',
    signUpAlerts:'Sign up for {name}', evacLookup:'Look up your evacuation level', countyInfo:'County emergency management page',
    noEvacLookup:'No official online evacuation-zone lookup was found for this county. Evacuation orders are sent through its alerts.',
    estMin:'Est. {n} min', estHr:'Est. {n} hr', leaveEarly:'LEAVE EARLY', inCity:'In town',
    routeBadges:{ 1:'Primary', 2:'Alternate', 3:'Last option' },
    callA11y:'Call {name}',
    evacLevelTitle:'Evacuation levels',
    levelTags:['GET READY', 'GET SET', 'GO NOW'],
    levelActions:[
      'Gather go bag & documents. Stay alert.',
      'Be ready to leave on short notice.',
      'Leave immediately. Do not wait.',
    ],
    evacRoutes:'Evacuation routes', emergencyContacts:'Emergency contacts',
    sharePlan:'Share plan with family', shareMsg:'My WildfireReady evacuation plan for',
    shareFooter:'\n\nStay safe. Download WildfireReady for WA-08.', call:'Call',
    firesFetchError:'Unable to reach fire data. Check your connection and pull to refresh.',
    genericRoutesNote:'Specific evacuation routes are not yet mapped for this location. Follow official emergency alerts for routing guidance.',
  },
  es: {
    tabs:{ home:'Ahora', weather:'Clima', gobag:'Mochila', score:'Puntaje', plan:'Plan' },
    chooseLocation:'Elegir ubicación', done:'Listo', county:'Condado',
    airQuality:'Calidad del aire', fetchingAqi:'Obteniendo datos en vivo...',
    activeFires:'Incendios forestales cerca de {community}',
    noFires:'No hay incendios forestales activos reportados en Washington ahora mismo.',
    fetchingFires:'Obteniendo datos de incendios del NIFC...',
    getAlerts:'Recibir alertas oficiales de emergencia',
    alertsBody:'Las órdenes de evacuación y alertas de emergencia para {community} vienen del Condado {county} por mensaje, llamada o correo. WildfireReady no envía alertas.',
    markAlertsDone:'Ya me registré', alertsDone:'Registrado ✓ — toque para deshacer',
    live:'En vivo', prelimData:'Datos preliminares', pullRefresh:'Jalar para actualizar', offlineData:'Sin conexión',
    worksOffline:'Funciona sin conexión', acres:'Acres', contained:'Contenido',
    fireStatus:{ active:'Activo', monitoring:'Vigilancia', contained:'Contenido', unknown:'Contención desconocida' },
    fireCauses:{ Natural:'Natural', Human:'Causado por humanos', Undetermined:'Indeterminada', Unknown:'Desconocida' },
    underInvestigation:'En investigación', unknown:'Desconocido', unnamedFire:'Incendio sin nombre',
    distanceFrom:'a {mi} mi de {community}', nearbyBadge:'A menos de {mi} mi',
    nearestOf:'Los {n} más cercanos de {total} incidentes reportados en Washington',
    countyName:'Condado {name}',
    legendYou:'Su comunidad', legendOther:'Otras comunidades', legendFireNear:'Incendio a menos de {mi} mi', legendFire:'Incendio',
    mapDetails:'Detalles', acresWord:'acres',
    nifcCredit:'Datos de incendios: NIFC / WFIGS · Actualizado diariamente',
    mapCredit:'Mapa: OpenStreetMap · Ubicación de incendios: NIFC / WFIGS',
    cause:'Causa', updated:'Actualizado',
    banners:{
      danger:{ title:'Aire no saludable', msg:'Aire no saludable. Quédese adentro y use mascarilla N95 si sale.' },
      warning:{ title:'Aviso para grupos sensibles', msg:'Niños, ancianos y personas con enfermedades respiratorias deben limitar el tiempo al aire libre.' },
      ok:{ title:'Sin alertas oficiales de incendio o humo', msg:'El NWS no tiene alertas activas de clima de incendios ni de calidad del aire aquí. Las órdenes de evacuación vienen de su condado — regístrese en sus alertas abajo.' },
    },
    lastUpdated:'Última actualización {time}', savedData:'Sin conexión — mostrando los últimos datos guardados',
    demoBadge:'DEMO', demoNote:'Datos de muestra para pruebas — no son condiciones reales.',
    aqiUnavailable:'Calidad del aire no disponible',
    aqiUnavailableMsg:'No se pudo conectar con AirNow y no hay una lectura guardada para esta comunidad. Deslice para actualizar.',
    aqiNoKey:'AQI no disponible: falta la clave de API',
    aqiNoKeyMsg:'Esta versión no tiene clave de API de AirNow (EXPO_PUBLIC_AIRNOW_API_KEY). Consulte el README.',
    aqiNoData:'Ningún monitor de AirNow está reportando cerca de esta comunidad ahora.',
    aqiBadKey:'AQI no disponible: clave de API rechazada',
    aqiBadKeyMsg:'AirNow rechazó la clave de API de esta versión. Solicite una clave nueva y configure EXPO_PUBLIC_AIRNOW_API_KEY (consulte el README).',
    aqiLabels:{ good:'Bueno', moderate:'Moderado', sensitive:'No saludable para grupos sensibles', unhealthy:'No saludable', veryUnhealthy:'Muy no saludable', hazardous:'Peligroso' },
    aqiMsgs:{
      good:'La calidad del aire es satisfactoria.',
      moderate:'Aceptable. Las personas sensibles deben limitar el esfuerzo al aire libre.',
      sensitive:'Niños, ancianos y personas con enfermedades pulmonares deben reducir el esfuerzo.',
      unhealthy:'Todos deben reducir el esfuerzo prolongado. Use mascarilla N95 afuera.',
      veryUnhealthy:'Alerta de salud: todos deben evitar el esfuerzo prolongado al aire libre. Use mascarilla N95 afuera.',
      hazardous:'Emergencia de salud. Todos deben evitar toda actividad al aire libre.',
    },
    officialAlerts:'Alertas oficiales del NWS',
    noOfficialAlerts:'No hay Advertencias de Bandera Roja, Vigilancias de Clima de Incendios ni Alertas de Calidad del Aire activas del NWS para esta ubicación.',
    alertsUnavailable:'No se pudieron consultar las alertas del NWS. Deslice para actualizar.',
    alertsChecked:'Consultado {time}',
    alertUntil:'Hasta {time}', officialText:'Texto oficial del NWS (en inglés)', showDetails:'Ver detalles', hideDetails:'Ocultar detalles',
    gobagReadiness:'Preparación de mochila', itemsPacked:'artículos empacados', of:'de',
    resetAll:'Reiniciar todas las casillas', resetConfirmTitle:'¿Reiniciar lista?',
    resetConfirmMsg:'Esto desmarcará todos los artículos.', cancel:'Cancelar', reset:'Reiniciar',
    gobagIntro:'Marque los artículos mientras empaca. Llegue al 100% antes de julio.',
    followAlerts:'Seguir alertas de emergencia locales',
    followAlertsDesc:'Sintonice AM 950 KBBO (este de WA) o KOMO 1000 (oeste) para orientación.',
    movePerpendicular:'Moverse perpendicular al incendio',
    movePerpendicularDesc:'Siempre muévase perpendicular a la dirección del fuego.',
    fireWeather:'Pronóstico de clima de incendios', fetchingWeather:'Obteniendo pronóstico...',
    wxUnavailable:'Pronóstico no disponible',
    wxUnavailableMsg:'No se pudo conectar con el Servicio Meteorológico Nacional y no hay un pronóstico guardado. Deslice para actualizar.',
    fireRiskEstimate:'Riesgo de incendio estimado',
    wind:'Viento', temp:'Temp', conditions:'Condiciones',
    nwsCredit:'Pronóstico: Servicio Meteorológico Nacional · NOAA',
    weatherNote:'El "riesgo de incendio estimado" lo calcula esta app a partir de la temperatura máxima, la humedad relativa mínima y el viento o ráfaga más fuerte del pronóstico del NWS para cada día. No es una clasificación oficial de peligro de incendio. Las Advertencias de Bandera Roja y Vigilancias de Clima de Incendios oficiales aparecen en la sección de alertas arriba.',
    weatherNoteNoRH:'No hubo datos de humedad para algunos días, así que su estimación usa solo temperatura y viento.',
    dangerLevels:{ Extreme:'Extremo', High:'Alto', Moderate:'Moderado', Low:'Bajo', Minimal:'Mínimo' },
    scoreTitle:'Preparación del hogar', scoreSubtitle:'¿Qué tan preparado está su hogar?',
    scoreOf:'de 100', breakdown:'Desglose',
    shareScore:'Compartir mi puntaje',
    shareScoreMsg:'Mi puntaje de WildfireReady es',
    shareScoreFooter:'. ¿Está preparado su hogar? Descargue WildfireReady para WA-08.',
    categories:{ gobag:'Mochila empacada', profile:'Perfil del hogar', alerts:'Alertas oficiales', shared:'Plan compartido', meeting:'Punto de encuentro', contact:'Contacto fuera del área' },
    catDescs:{ gobag:'Artículos que aplican a su hogar', profile:'Detalles del hogar guardados', alerts:'Registrado en las alertas de su condado', shared:'Envió su plan a su familia', meeting:'Un lugar para reunirse si se separan', contact:'Alguien fuera del área para comunicarse' },
    whatToFix:'Qué mejorar',
    fixItems:{ gobag:'Empaque los artículos restantes de la mochila', profile:'Complete el perfil de su hogar', alerts:'Regístrese en las alertas de emergencia de su condado', shared:'Comparta su plan con su familia', meeting:'Defina un punto de encuentro familiar', contact:'Agregue un contacto fuera del área' },
    fixGain:'+{n} pts', editProfile:'Editar perfil del hogar',
    scoreGrades:{ A:'Excelente — su hogar está bien preparado.', B:'Bien — algunos puntos a mejorar.', C:'Regular — siga con los puntos de abajo.', D:'Necesita trabajo — comience con el primer punto de abajo.', F:'Recién comenzando — toque un punto de abajo para empezar.' },
    profileTitle:'Perfil del hogar', adults:'Adultos', children:'Niños', pets:'Mascotas',
    medications:'Alguien toma medicamentos recetados', mobility:'Alguien tiene necesidades de movilidad o acceso', elderly:'Alguien tiene 65 años o más',
    meetingPoint:'Punto de encuentro familiar', meetingPointHint:'p. ej. estacionamiento de la biblioteca, 123 Main St',
    contactName:'Nombre del contacto fuera del área', contactPhone:'Teléfono del contacto fuera del área',
    save:'Guardar', profileNote:'Se guarda solo en este dispositivo.',
    increaseA11y:'Aumentar {label}', decreaseA11y:'Disminuir {label}',
    gobagTailored:'Adaptada a su hogar de {people}. Edite su perfil para cambiarlo.',
    themeModes:{ system:'Auto', light:'Claro', dark:'Oscuro' }, themeA11y:'Tema: {mode}. Toque para cambiar.', langA11y:'Cambiar idioma a {lang}',
    loading:'Cargando…',
    aqiA11y:'Índice de calidad del aire {aqi}: {label}',
    fireA11y:'{name}. {status}. {distance}. {acres} acres, {contained} contenido.',
    humidity:'Humedad mín.', gusts:'Ráfagas', noValue:'—', aqiUnit:'ICA', firesUnavailable:'Datos de incendios no disponibles',
    useMyLocation:'Usar mi ubicación', locating:'Buscando su ubicación…',
    locationDenied:'Se negó el permiso de ubicación. Elija una comunidad de la lista.',
    locationError:'No se pudo obtener su ubicación. Elija una comunidad de la lista.',
    nearestPicked:'Comunidad más cercana: {name} (a {mi} mi)', closeA11y:'Cerrar',
    householdPlan:'Mi plan del hogar', outOfAreaContact:'Contacto fuera del área', notSet:'Sin definir',
    householdCounts:'Adultos: {adults} · Niños: {children} · Mascotas: {pets}',
    householdEmpty:'Agregue un punto de encuentro y un contacto fuera del área para que todos sepan a dónde ir y a quién llamar.',
    printPlan:'Imprimir o guardar como PDF', printError:'No se pudo crear el PDF. Intente de nuevo.',
    planGenerated:'Generado {date}', planPdfTitle:'Plan de evacuación WildfireReady — {community}',
    staleBanner:'Sin conexión — mostrando datos guardados de {time}. Deslice hacia abajo para actualizar.',
    verifyStale:'Verificado hace más de 6 meses — vuelva a confirmar antes de usarlo',
    mapA11y:'Mapa de las comunidades de WA-08 y los incendios más cercanos',
    evacAlertsLabel:'Alertas oficiales de evacuación e incendios',
    galUnit:'gal',
    shelterDisclaimer:'Los refugios listados son destinos posibles, no refugios abiertos confirmados, a menos que digan Verificado. Los refugios cambian en cada evento — confirme los refugios abiertos con las alertas de su condado o marcando 2-1-1.',
    verifiedOn:'Verificado {date}', unverified:'Sin verificar — confirme con fuentes oficiales',
    shelterLabel:'Refugio', animalShelterLabel:'Refugio de animales', viewSource:'Fuente',
    countyResources:'Recursos oficiales del Condado {county}',
    signUpAlerts:'Regístrese en {name}', evacLookup:'Consulte su nivel de evacuación', countyInfo:'Página de manejo de emergencias del condado',
    noEvacLookup:'No se encontró una consulta oficial de zonas de evacuación en línea para este condado. Las órdenes de evacuación se envían por sus alertas.',
    estMin:'Aprox. {n} min', estHr:'Aprox. {n} h', leaveEarly:'SALGA TEMPRANO', inCity:'En la ciudad',
    routeBadges:{ 1:'Principal', 2:'Alternativa', 3:'Última opción' },
    callA11y:'Llamar a {name}',
    evacLevelTitle:'Niveles de evacuación',
    levelTags:['PREPÁRESE', 'ALÍSTESE', 'SALGA YA'],
    levelActions:[
      'Prepare su mochila y documentos. Esté alerta.',
      'Esté listo para salir en cualquier momento.',
      'Salga de inmediato. No espere.',
    ],
    evacRoutes:'Rutas de evacuación', emergencyContacts:'Contactos de emergencia',
    sharePlan:'Compartir plan con familia', shareMsg:'Mi plan de evacuación WildfireReady para',
    shareFooter:'\n\nManténgase seguro. Descargue WildfireReady para WA-08.', call:'Llamar',
    firesFetchError:'No se pudo obtener datos de incendios. Verifique su conexión y deslice para actualizar.',
    genericRoutesNote:'Las rutas específicas no están disponibles aún para esta ubicación. Siga las alertas de emergencia oficiales para orientación.',
  },
};

export const LangCtx = createContext('en');
export const useLangCode = () => useContext(LangCtx);     // 'en' | 'es'
export const useLang = () => T[useContext(LangCtx)];      // resolved string table

// "Last updated {time}" + { time:'3:42 PM' } → "Last updated 3:42 PM"
export const fmt = (str, vars = {}) => str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));

// ── LOCALE-AWARE DATES ────────────────────────────────────────────────────
export const localeFor = (lang) => (lang === 'es' ? 'es-US' : 'en-US');

export function formatDateTime(ms, lang) {
  return new Date(ms).toLocaleString(localeFor(lang), { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
}

export function formatTime(ms, lang) {
  return new Date(ms).toLocaleTimeString(localeFor(lang), { hour:'numeric', minute:'2-digit' });
}

// 'YYYY-MM-DD' (a calendar date, no time zone) → "Oct 24, 2026" / "24 oct 2026"
export function formatDate(isoDate, lang) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(localeFor(lang), { year:'numeric', month:'short', day:'numeric' });
}

export function formatShortDate(ms, lang) {
  return new Date(ms).toLocaleDateString(localeFor(lang), { month:'short', day:'numeric' });
}

export const formatNumber = (n, lang) => Number(n).toLocaleString(localeFor(lang));

// Same-day timestamps show just the time; older ones include the date.
export function formatUpdated(ms, lang) {
  const sameDay = new Date(ms).toDateString() === new Date().toDateString();
  return sameDay ? formatTime(ms, lang) : formatDateTime(ms, lang);
}

// ── NWS LABEL TRANSLATION ─────────────────────────────────────────────────
const DAY_NAMES_ES = {
  'Today':'Hoy', 'Tonight':'Esta noche', 'Tomorrow':'Mañana',
  'Monday':'Lunes', 'Tuesday':'Martes', 'Wednesday':'Miércoles',
  'Thursday':'Jueves', 'Friday':'Viernes', 'Saturday':'Sábado', 'Sunday':'Domingo',
  'Monday Night':'Lunes por la noche', 'Tuesday Night':'Martes por la noche',
  'Wednesday Night':'Miércoles por la noche', 'Thursday Night':'Jueves por la noche',
  'Friday Night':'Viernes por la noche', 'Saturday Night':'Sábado por la noche',
  'Sunday Night':'Domingo por la noche', 'This Afternoon':'Esta tarde',
  'This Evening':'Este anochecer', 'Overnight':'De madrugada',
};

const FORECAST_WORDS_ES = {
  'Sunny':'Soleado','Mostly Sunny':'Mayormente soleado','Partly Sunny':'Parcialmente soleado',
  'Partly Cloudy':'Parcialmente nublado','Mostly Cloudy':'Mayormente nublado','Cloudy':'Nublado',
  'Clear':'Despejado','Mostly Clear':'Mayormente despejado','Partly Clear':'Parcialmente despejado',
  'Rain':'Lluvia','Showers':'Chubascos','Rain Showers':'Chubascos de lluvia',
  'Thunderstorms':'Tormentas eléctricas','Snow':'Nieve','Fog':'Niebla',
  'Windy':'Ventoso','Breezy':'Con brisa','Hot':'Caluroso','Warm':'Templado',
  'Cool':'Fresco','Cold':'Frío','Humid':'Húmedo',
  'and':'y','with':'con','then':'luego','Chance':'Posibilidad de','Slight Chance':'Poca posibilidad de',
  'Likely':'Probable','Isolated':'Aislado','Scattered':'Disperso',
  'Light Rain':'Lluvia ligera','Heavy Rain':'Lluvia intensa','Light Snow':'Nieve ligera',
  'Rain Likely':'Lluvia probable','Light Rain Likely':'Lluvia ligera probable',
  'Patchy Fog':'Niebla dispersa','Areas Of Fog':'Áreas de niebla','Haze':'Bruma',
  'Smoke':'Humo','Areas Of Smoke':'Áreas de humo','Widespread Haze':'Bruma generalizada',
  'Snow Showers':'Chubascos de nieve','Rain And Snow':'Lluvia y nieve',
  'Rain And Snow Showers':'Chubascos de lluvia y nieve','Showers Likely':'Chubascos probables',
  'Rain Showers Likely':'Chubascos de lluvia probables','Rain And Snow Showers Likely':'Chubascos de lluvia y nieve probables',
  'Snow Likely':'Nieve probable','Rain And Snow Likely':'Lluvia y nieve probables',
};

// Pre-sort longest phrase first so multi-word terms ("Mostly Clear") translate
// before their substrings ("Clear"). Computed once at module load.
const FORECAST_ENTRIES = Object.entries(FORECAST_WORDS_ES)
  .sort((a, b) => b[0].length - a[0].length);

function escapeRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function translateDayName(name, lang) {
  if (lang !== 'es') return name;
  return DAY_NAMES_ES[name] || name;
}

// NWS wind strings: "SW 10 to 15 mph" → "SW 10 a 15 mph".
export function translateWind(wind, lang) {
  if (lang !== 'es' || !wind) return wind;
  return wind.replace(/\bto\b/g, 'a');
}

export function translateForecast(forecast, lang) {
  if (lang !== 'es') return forecast;
  let result = forecast;
  for (const [en, es] of FORECAST_ENTRIES) {
    // Word boundaries prevent mangling substrings (e.g. "and" inside other words)
    result = result.replace(new RegExp(`\\b${escapeRe(en)}\\b`, 'gi'), es);
  }
  return result;
}
