import { T, fmt, translateDayName, translateForecast, translateWind, formatDate } from '../src/i18n';

// Every key path in a nested string table, e.g. "banners.ok.title".
function keyPaths(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' && !Array.isArray(v) ? keyPaths(v, path) : [path];
  });
}

describe('translation tables', () => {
  test('en and es have identical key sets', () => {
    expect(keyPaths(T.es).sort()).toEqual(keyPaths(T.en).sort());
  });

  test('arrays have the same length in both languages', () => {
    for (const path of keyPaths(T.en)) {
      const get = (o) => path.split('.').reduce((a, k) => a[k], o);
      const en = get(T.en);
      if (Array.isArray(en)) expect(get(T.es)).toHaveLength(en.length);
    }
  });

  test('no empty strings', () => {
    for (const lang of ['en', 'es']) {
      for (const path of keyPaths(T[lang])) {
        const v = path.split('.').reduce((a, k) => a[k], T[lang]);
        const values = Array.isArray(v) ? v : [v];
        values.forEach((s) => expect(String(s).trim()).not.toBe(''));
      }
    }
  });

  test('placeholders match between languages', () => {
    const vars = (s) => (String(s).match(/\{\w+\}/g) || []).sort();
    for (const path of keyPaths(T.en)) {
      const get = (o) => path.split('.').reduce((a, k) => a[k], o);
      if (typeof get(T.en) === 'string') expect(vars(get(T.es))).toEqual(vars(get(T.en)));
    }
  });
});

describe('fmt', () => {
  test('fills placeholders and blanks unknown ones', () => {
    expect(fmt('Hi {name}, {n} left{x}', { name: 'Ana', n: 3 })).toBe('Hi Ana, 3 left');
  });
});

describe('translateDayName', () => {
  test('passes English through', () => {
    expect(translateDayName('This Evening', 'en')).toBe('This Evening');
  });

  test('translates Spanish day names, distinguishing afternoon and evening', () => {
    expect(translateDayName('Monday', 'es')).toBe('Lunes');
    expect(translateDayName('This Afternoon', 'es')).toBe('Esta tarde');
    expect(translateDayName('This Evening', 'es')).not.toBe(translateDayName('This Afternoon', 'es'));
  });

  test('leaves unknown names unchanged', () => {
    expect(translateDayName('Veterans Day', 'es')).toBe('Veterans Day');
  });
});

describe('translateForecast', () => {
  test('passes English through', () => {
    expect(translateForecast('Mostly Sunny', 'en')).toBe('Mostly Sunny');
  });

  test('translates longest phrases first', () => {
    expect(translateForecast('Mostly Clear', 'es')).toBe('Mayormente despejado');
    expect(translateForecast('Slight Chance Rain Showers', 'es')).toBe('Poca posibilidad de Chubascos de lluvia');
  });

  test('uses natural Spanish word order for compound phrases', () => {
    expect(translateForecast('Rain And Snow Showers Likely', 'es')).toBe('Chubascos de lluvia y nieve probables');
    expect(translateForecast('Light Rain', 'es')).toBe('Lluvia ligera');
  });

  test('does not mangle words that contain a dictionary word', () => {
    // "Slight" contains "light"; "Thunderstorms" must not become "Thundertormentas"
    expect(translateForecast('Slight Chance Thunderstorms', 'es')).toBe('Poca posibilidad de Tormentas eléctricas');
  });
});

describe('translateWind', () => {
  test('translates "to" in ranges only for Spanish', () => {
    expect(translateWind('SW 10 to 15 mph', 'es')).toBe('SW 10 a 15 mph');
    expect(translateWind('SW 10 to 15 mph', 'en')).toBe('SW 10 to 15 mph');
    expect(translateWind('', 'es')).toBe('');
  });
});

describe('formatDate', () => {
  test('formats calendar dates without time-zone shifts', () => {
    expect(formatDate('2026-10-24', 'en')).toMatch(/Oct\w* 24, 2026/);
    expect(formatDate('2026-10-24', 'es')).toMatch(/24/);
    expect(formatDate('2026-10-24', 'es')).toMatch(/oct/i);
  });
});
