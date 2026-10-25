// ── GO BAG CHECKLIST ──────────────────────────────────────────────────────
// sec/text/tag carry per-language strings; tone is a theme color key.
// `when` hides an item unless it applies to the household profile; text may
// contain {people}, {gal}, {kids} placeholders filled by getGoBag().
const SEC = {
  essentials: { en: 'Essentials', es: 'Esenciales' },
  medical: { en: 'Medical', es: 'Médico' },
  documents: { en: 'Documents', es: 'Documentos' },
  kids: { en: 'Children', es: 'Niños' },
  pets: { en: 'Pets', es: 'Mascotas' },
  mobility: { en: 'Mobility & access needs', es: 'Movilidad y necesidades de acceso' },
};
const TAG = {
  critical: { en: 'Critical', es: 'Crítico', tone: 'danger' },
  smoke: { en: 'Smoke', es: 'Humo', tone: 'warning' },
  health: { en: 'Health', es: 'Salud', tone: 'neutral' },
  id: { en: 'ID', es: 'ID', tone: 'info' },
  finance: { en: 'Finance', es: 'Finanzas', tone: 'info' },
  tech: { en: 'Tech', es: 'Tecnología', tone: 'info' },
  basics: { en: 'Basics', es: 'Básico', tone: 'neutral' },
  pets: { en: 'Pets', es: 'Mascotas', tone: 'neutral' },
};

const item = (id, sec, tag, text, when) => ({ id, sec, tag, text, when });

export const GOBAG = [
  item('e2', 'essentials', 'critical', {
    en: 'Water — {gal} gal ({people} × 1 gal/day × 3 days)',
    es: 'Agua — {gal} gal ({people} × 1 gal/día × 3 días)',
  }),
  item('e3', 'essentials', 'basics', {
    en: 'Non-perishable food — 3 days for {people}',
    es: 'Comida no perecedera — 3 días para {people}',
  }),
  item('e1', 'essentials', 'basics', {
    en: '3 days of clothes per person ({people})',
    es: '3 días de ropa por persona ({people})',
  }),
  item('e4', 'essentials', 'basics', { en: 'Flashlight + extra batteries', es: 'Linterna + pilas adicionales' }),
  item('e5', 'essentials', 'basics', { en: 'Spare house and car keys', es: 'Llaves de repuesto de casa y auto' }),
  item('e6', 'essentials', 'basics', {
    en: 'Printed map of the area with evacuation routes marked',
    es: 'Mapa impreso del área con rutas de evacuación marcadas',
  }),
  item('m3', 'medical', 'smoke', {
    en: 'N95 masks — at least {people} (smoke protection)',
    es: 'Mascarillas N95 — al menos {people} (protección contra humo)',
  }),
  item('m4', 'medical', 'health', { en: 'First aid kit', es: 'Botiquín de primeros auxilios' }),
  item('m5', 'medical', 'health', {
    en: 'Spare glasses / contact lenses and solution',
    es: 'Lentes de repuesto / lentes de contacto y solución',
  }),
  item(
    'm1',
    'medical',
    'critical',
    { en: 'Prescription medications (2-week supply)', es: 'Medicamentos recetados (2 semanas)' },
    (p) => p.medications,
  ),
  item(
    'm2',
    'medical',
    'critical',
    { en: 'List of medications, dosages & doctors', es: 'Lista de medicamentos, dosis y médicos' },
    (p) => p.medications,
  ),
  item('d1', 'documents', 'id', {
    en: 'Passports / IDs for all family members',
    es: 'Pasaportes / identificaciones para todos',
  }),
  item('d2', 'documents', 'finance', { en: 'Insurance cards & home policy', es: 'Tarjetas de seguro y póliza' }),
  item('d3', 'documents', 'finance', { en: 'Cash ($200+ small bills)', es: 'Efectivo ($200+ billetes pequeños)' }),
  item('d5', 'documents', 'critical', {
    en: 'Paper copy of important phone numbers',
    es: 'Copia en papel de números de teléfono importantes',
  }),
  item('d4', 'documents', 'tech', { en: 'Phone charger + portable battery', es: 'Cargador y batería portátil' }),
  item(
    'k1',
    'kids',
    'smoke',
    { en: 'Child-size N95 masks ({kids})', es: 'Mascarillas N95 para niños ({kids})' },
    (p) => p.children > 0,
  ),
  item(
    'k2',
    'kids',
    'basics',
    {
      en: 'Comfort items, snacks, and activities for kids',
      es: 'Objetos de consuelo, bocadillos y actividades para niños',
    },
    (p) => p.children > 0,
  ),
  item('p1', 'pets', 'pets', { en: 'Pet carriers / leashes', es: 'Transportines / correas' }, (p) => p.pets > 0),
  item('p2', 'pets', 'pets', { en: '3-day pet food + water bowl', es: 'Comida (3 días) + tazón' }, (p) => p.pets > 0),
  item(
    'p3',
    'pets',
    'critical',
    { en: 'Pet medications & vet records', es: 'Medicamentos y registros veterinarios' },
    (p) => p.pets > 0,
  ),
  item(
    'a1',
    'mobility',
    'critical',
    {
      en: 'Chargers and backup power for medical devices',
      es: 'Cargadores y energía de respaldo para dispositivos médicos',
    },
    (p) => p.mobility || p.elderly,
  ),
  item(
    'a2',
    'mobility',
    'critical',
    {
      en: 'Spare mobility aids (cane, walker, hearing-aid batteries)',
      es: 'Ayudas de movilidad de repuesto (bastón, andadera, pilas para audífonos)',
    },
    (p) => p.mobility || p.elderly,
  ),
];

export const householdSize = (p) => Math.max(1, (p.adults || 0) + (p.children || 0));

// Items applicable to this household, with text/tag resolved for `lang`.
export function getGoBag(profile, lang) {
  const people = householdSize(profile);
  const vars = { people, gal: people * 3, kids: profile.children || 0 };
  return GOBAG.filter((i) => !i.when || i.when(profile)).map((i) => ({
    id: i.id,
    secKey: i.sec,
    sec: SEC[i.sec][lang],
    text: i.text[lang].replace(/\{(\w+)\}/g, (_, k) => vars[k]),
    tag: TAG[i.tag][lang],
    tone: TAG[i.tag].tone,
  }));
}

// Ids of items that apply to this household (language-independent).
export const applicableIds = (profile) => GOBAG.filter((i) => !i.when || i.when(profile)).map((i) => i.id);
