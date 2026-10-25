import { estimateFireRisk, parseWindMph, parseIsoDurationMs, gridValuesInRange } from '../src/services/weather';

describe('parseWindMph', () => {
  test('uses the upper bound of a range', () => {
    expect(parseWindMph('10 to 20 mph')).toBe(20);
    expect(parseWindMph('5 to 10 mph')).toBe(10);
  });

  test('parses single values and handles empty input', () => {
    expect(parseWindMph('15 mph')).toBe(15);
    expect(parseWindMph('')).toBeNull();
    expect(parseWindMph(undefined)).toBeNull();
  });
});

describe('parseIsoDurationMs', () => {
  test('parses hours, days, and minutes', () => {
    expect(parseIsoDurationMs('PT1H')).toBe(3600000);
    expect(parseIsoDurationMs('PT6H')).toBe(6 * 3600000);
    expect(parseIsoDurationMs('P1DT3H')).toBe(27 * 3600000);
    expect(parseIsoDurationMs('PT30M')).toBe(30 * 60000);
  });

  test('returns 0 for unparseable input', () => {
    expect(parseIsoDurationMs('garbage')).toBe(0);
  });
});

describe('gridValuesInRange', () => {
  const series = {
    values: [
      { validTime: '2026-10-25T00:00:00+00:00/PT6H', value: 40 }, // 00–06
      { validTime: '2026-10-25T06:00:00+00:00/PT6H', value: 25 }, // 06–12
      { validTime: '2026-10-25T12:00:00+00:00/PT1H', value: null }, // ignored
      { validTime: '2026-10-25T18:00:00+00:00/PT2H', value: 60 }, // 18–20
    ],
  };
  const at = (h) => Date.parse(`2026-10-25T${String(h).padStart(2, '0')}:00:00Z`);

  test('returns values whose interval overlaps the window', () => {
    expect(gridValuesInRange(series, at(5), at(7))).toEqual([40, 25]);
    expect(gridValuesInRange(series, at(13), at(17))).toEqual([]);
  });

  test('excludes intervals that only touch the window edge', () => {
    expect(gridValuesInRange(series, at(6), at(12))).toEqual([25]);
  });

  test('handles a missing series', () => {
    expect(gridValuesInRange(undefined, at(0), at(1))).toEqual([]);
  });
});

describe('estimateFireRisk', () => {
  test('cool, humid, calm days are Minimal', () => {
    expect(estimateFireRisk({ tempF: 55, windMph: 3, gustMph: 5, minRH: 70 }).level).toBe('Minimal');
  });

  test('hot, dry, windy days are Extreme', () => {
    expect(estimateFireRisk({ tempF: 95, windMph: 20, gustMph: 35, minRH: 12 }).level).toBe('Extreme');
  });

  test('risk rises as humidity falls', () => {
    const base = { tempF: 80, windMph: 10, gustMph: 15 };
    const humid = estimateFireRisk({ ...base, minRH: 55 }).score;
    const dry = estimateFireRisk({ ...base, minRH: 15 }).score;
    expect(dry).toBeGreaterThan(humid);
  });

  test('gusts count when stronger than sustained wind', () => {
    const calm = estimateFireRisk({ tempF: 70, windMph: 5, gustMph: 5, minRH: 40 }).score;
    const gusty = estimateFireRisk({ tempF: 70, windMph: 5, gustMph: 30, minRH: 40 }).score;
    expect(gusty).toBeGreaterThan(calm);
  });

  test('flags missing humidity instead of guessing it', () => {
    const r = estimateFireRisk({ tempF: 90, windMph: 10, gustMph: null, minRH: null });
    expect(r.rhMissing).toBe(true);
    expect(r.score).toBe(Math.round(30 + 15));
  });

  test('score is clamped to 0–100', () => {
    expect(estimateFireRisk({ tempF: 130, windMph: 80, gustMph: 100, minRH: 0 }).score).toBe(100);
    expect(estimateFireRisk({ tempF: -10, windMph: 0, gustMph: 0, minRH: 100 }).score).toBe(0);
  });
});
