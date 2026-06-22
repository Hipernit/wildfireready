import { createContext, useContext } from 'react';

// ── TRANSLATIONS ──────────────────────────────────────────────────────────
export const T = {
  en: {
    tabs:{ home:'Now', weather:'Weather', gobag:'Go Bag', score:'Score', plan:'Plan' },
    chooseLocation:'Choose location', done:'Done', county:'County',
    airQuality:'Air quality', fetchingAqi:'Fetching live AQI data...',
    activeFires:'Active fires in Washington state',
    noFires:'No active large fires reported in Washington state right now.',
    fetchingFires:'Fetching live NIFC fire data...',
    getAlerts:'Get emergency alerts',
    alertsBody:"We'll notify you when air quality drops or evacuation orders are issued — even when your phone is locked.",
    enableAlerts:'Enable alerts for',
    live:'Live', prelimData:'Preliminary data', pullRefresh:'Pull to refresh', offlineData:'Offline data',
    worksOffline:'Works offline', acres:'Acres', contained:'Contained',
    fireStatus:{ active:'Active', monitoring:'Monitoring', contained:'Contained' },
    nifcCredit:'Fire data: NIFC / WFIGS · Updated daily',
    cause:'Cause', updated:'Updated',
    banners:{
      danger:{ title:'Air quality warning', msg:'Unhealthy air detected. Stay indoors and wear an N95 mask if you go outside.' },
      warning:{ title:'Sensitive groups advisory', msg:'Children, elderly, and people with respiratory conditions should limit outdoor time.' },
      ok:{ title:'No active alerts in your area', msg:'Air quality is acceptable. No evacuation orders nearby.' },
    },
    gobagReadiness:'Go-bag readiness', itemsPacked:'items packed', of:'of',
    resetAll:'Reset all checkboxes', resetConfirmTitle:'Reset checklist?',
    resetConfirmMsg:'This will uncheck all items.', cancel:'Cancel', reset:'Reset',
    gobagIntro:'Check items off as you pack. Aim for 100% before wildfire season peaks (July–September).',
    followAlerts:'Follow local emergency alerts',
    followAlertsDesc:'Tune to AM 950 KBBO (east WA) or KOMO 1000 (west WA) for real-time guidance.',
    movePerpendicular:'Move perpendicular to fire spread',
    movePerpendicularDesc:'Always move perpendicular to fire direction, not directly away.',
    fireWeather:'Fire weather forecast', fetchingWeather:'Fetching NWS forecast...',
    redFlagWarning:'Red Flag Warning',
    redFlagDesc:'Hot, dry, and windy conditions create extreme fire risk. Avoid outdoor burning.',
    wind:'Wind', temp:'Temp', conditions:'Conditions',
    nwsCredit:'Forecast: National Weather Service · NOAA',
    weatherNote:'Fire danger calculated from temperature, wind speed, and humidity conditions.',
    dangerLevels:{ Extreme:'Extreme', High:'High', Moderate:'Moderate', Low:'Low', Minimal:'Minimal' },
    scoreTitle:'Household readiness', scoreSubtitle:'How prepared is your household for wildfire season?',
    scoreOf:'out of 100', breakdown:'Breakdown',
    shareScore:'Share my score',
    shareScoreMsg:'My WildfireReady household score is',
    shareScoreFooter:'. Is your household ready? Download WildfireReady for WA-08.',
    categories:{ gobag:'Go-bag packed', profile:'Profile complete', location:'Location set', language:'Language set' },
    catDescs:{ gobag:'Pack your emergency bag', profile:'Set household details', location:'Choose your community', language:'Language configured' },
    whatToFix:'What to improve',
    fixItems:{ gobag:'Complete your go-bag checklist', meds:'Add prescription medication details', pets:'Add pet information to profile', location:'Select your WA-08 community' },
    scoreGrades:{ A:'Outstanding — your household is well prepared.', B:'Good — a few gaps to close before fire season.', C:'Fair — complete your go-bag to raise your score.', D:'Needs work — start with the go-bag checklist.', F:'Just getting started — open Go Bag to begin.' },
    galUnit:'gal',
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
  },
  es: {
    tabs:{ home:'Ahora', weather:'Clima', gobag:'Mochila', score:'Puntaje', plan:'Plan' },
    chooseLocation:'Elegir ubicación', done:'Listo', county:'Condado',
    airQuality:'Calidad del aire', fetchingAqi:'Obteniendo datos en vivo...',
    activeFires:'Incendios activos en el estado de Washington',
    noFires:'No hay grandes incendios activos reportados en Washington ahora mismo.',
    fetchingFires:'Obteniendo datos de incendios del NIFC...',
    getAlerts:'Recibir alertas de emergencia',
    alertsBody:'Le notificaremos cuando la calidad del aire baje o se emitan órdenes de evacuación.',
    enableAlerts:'Activar alertas para',
    live:'En vivo', prelimData:'Datos preliminares', pullRefresh:'Jalar para actualizar', offlineData:'Sin conexión',
    worksOffline:'Funciona sin conexión', acres:'Acres', contained:'Contenido',
    fireStatus:{ active:'Activo', monitoring:'Vigilancia', contained:'Contenido' },
    nifcCredit:'Datos de incendios: NIFC / WFIGS · Actualizado diariamente',
    cause:'Causa', updated:'Actualizado',
    banners:{
      danger:{ title:'Advertencia de calidad del aire', msg:'Aire no saludable. Quédese adentro y use mascarilla N95 si sale.' },
      warning:{ title:'Aviso para grupos sensibles', msg:'Niños, ancianos y personas con enfermedades respiratorias deben limitar el tiempo al aire libre.' },
      ok:{ title:'Sin alertas activas en su área', msg:'La calidad del aire es aceptable. No hay órdenes de evacuación cercanas.' },
    },
    gobagReadiness:'Preparación de mochila', itemsPacked:'artículos empacados', of:'de',
    resetAll:'Reiniciar todas las casillas', resetConfirmTitle:'¿Reiniciar lista?',
    resetConfirmMsg:'Esto desmarcará todos los artículos.', cancel:'Cancelar', reset:'Reiniciar',
    gobagIntro:'Marque los artículos mientras empaca. Llegue al 100% antes de julio.',
    followAlerts:'Seguir alertas de emergencia locales',
    followAlertsDesc:'Sintonice AM 950 KBBO (este de WA) o KOMO 1000 (oeste) para orientación.',
    movePerpendicular:'Moverse perpendicular al incendio',
    movePerpendicularDesc:'Siempre muévase perpendicular a la dirección del fuego.',
    fireWeather:'Pronóstico de clima de incendios', fetchingWeather:'Obteniendo pronóstico...',
    redFlagWarning:'Advertencia de bandera roja',
    redFlagDesc:'Condiciones calientes, secas y ventosas crean riesgo extremo de incendio.',
    wind:'Viento', temp:'Temp', conditions:'Condiciones',
    nwsCredit:'Pronóstico: Servicio Meteorológico Nacional · NOAA',
    weatherNote:'El peligro de incendio se calcula a partir de temperatura, velocidad del viento y humedad.',
    dangerLevels:{ Extreme:'Extremo', High:'Alto', Moderate:'Moderado', Low:'Bajo', Minimal:'Mínimo' },
    scoreTitle:'Preparación del hogar', scoreSubtitle:'¿Qué tan preparado está su hogar?',
    scoreOf:'de 100', breakdown:'Desglose',
    shareScore:'Compartir mi puntaje',
    shareScoreMsg:'Mi puntaje de WildfireReady es',
    shareScoreFooter:'. ¿Está preparado su hogar? Descargue WildfireReady para WA-08.',
    categories:{ gobag:'Mochila empacada', profile:'Perfil completo', location:'Ubicación establecida', language:'Idioma configurado' },
    catDescs:{ gobag:'Empaque su bolsa de emergencia', profile:'Configure los detalles del hogar', location:'Elija su comunidad', language:'Idioma configurado' },
    whatToFix:'Qué mejorar',
    fixItems:{ gobag:'Complete la lista de verificación de la mochila', meds:'Agregue medicamentos recetados al perfil', pets:'Agregue información de mascotas', location:'Seleccione su comunidad de WA-08' },
    scoreGrades:{ A:'Excelente — su hogar está bien preparado.', B:'Bien — algunos puntos a mejorar.', C:'Regular — complete la mochila para subir su puntaje.', D:'Necesita trabajo — comience con la mochila.', F:'Recién comenzando — abra Mochila para empezar.' },
    galUnit:'gal',
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
  },
};

export const LangCtx = createContext('en');
export const useLangCode = () => useContext(LangCtx);     // 'en' | 'es'
export const useLang = () => T[useContext(LangCtx)];      // resolved string table

// ── NWS LABEL TRANSLATION ─────────────────────────────────────────────────
const DAY_NAMES_ES = {
  'Today':'Hoy', 'Tonight':'Esta noche', 'Tomorrow':'Mañana',
  'Monday':'Lunes', 'Tuesday':'Martes', 'Wednesday':'Miércoles',
  'Thursday':'Jueves', 'Friday':'Viernes', 'Saturday':'Sábado', 'Sunday':'Domingo',
  'Monday Night':'Lunes por la noche', 'Tuesday Night':'Martes por la noche',
  'Wednesday Night':'Miércoles por la noche', 'Thursday Night':'Jueves por la noche',
  'Friday Night':'Viernes por la noche', 'Saturday Night':'Sábado por la noche',
  'Sunday Night':'Domingo por la noche', 'This Afternoon':'Esta tarde',
  'This Evening':'Esta tarde', 'Overnight':'De madrugada',
};

const FORECAST_WORDS_ES = {
  'Sunny':'Soleado','Mostly Sunny':'Mayormente soleado','Partly Sunny':'Parcialmente soleado',
  'Partly Cloudy':'Parcialmente nublado','Mostly Cloudy':'Mayormente nublado','Cloudy':'Nublado',
  'Clear':'Despejado','Mostly Clear':'Mayormente despejado','Partly Clear':'Parcialmente despejado',
  'Rain':'Lluvia','Showers':'Chubascos','Rain Showers':'Chubascos de lluvia',
  'Thunderstorms':'Tormentas eléctricas','Snow':'Nieve','Fog':'Niebla',
  'Windy':'Ventoso','Breezy':'Con brisa','Hot':'Caluroso','Warm':'Templado',
  'Cool':'Fresco','Cold':'Frío','Humid':'Húmedo',
  'and':'y','with':'con','Chance':'Posibilidad de','Slight Chance':'Poca posibilidad de',
  'Likely':'Probable','Isolated':'Aislado','Scattered':'Disperso',
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

export function translateForecast(forecast, lang) {
  if (lang !== 'es') return forecast;
  let result = forecast;
  for (const [en, es] of FORECAST_ENTRIES) {
    // Word boundaries prevent mangling substrings (e.g. "and" inside other words)
    result = result.replace(new RegExp(`\\b${escapeRe(en)}\\b`, 'gi'), es);
  }
  return result;
}
