import { distanceMiles, nearestLocation } from '../src/services/geo';
import { withDistance, parseFire, fireStatus } from '../src/services/fires';
import { findLocation } from '../src/data/locations';

describe('distanceMiles', () => {
  const sammamish = findLocation('sammamish');
  const cleElum = findLocation('cle-elum');

  test('is zero for the same point and symmetric', () => {
    expect(distanceMiles(sammamish, sammamish)).toBe(0);
    expect(distanceMiles(sammamish, cleElum)).toBeCloseTo(distanceMiles(cleElum, sammamish), 10);
  });

  test('matches a known distance (Sammamish → Cle Elum ≈ 59 mi straight-line)', () => {
    const mi = distanceMiles(sammamish, cleElum);
    expect(mi).toBeGreaterThan(55);
    expect(mi).toBeLessThan(63);
  });

  test('one degree of latitude is about 69 miles', () => {
    expect(distanceMiles({ lat: 47, lon: -121 }, { lat: 48, lon: -121 })).toBeCloseTo(69.1, 0);
  });
});

describe('nearestLocation', () => {
  test('picks the community closest to a point', () => {
    // Downtown Leavenworth
    expect(nearestLocation({ lat: 47.596, lon: -120.661 }).loc.key).toBe('leavenworth');
    // Roslyn is closest to Cle Elum
    expect(nearestLocation({ lat: 47.2237, lon: -120.993 }).loc.key).toBe('cle-elum');
  });

  test('reports how far away the nearest community is', () => {
    const far = nearestLocation({ lat: 47.6588, lon: -117.426 }); // Spokane
    expect(far.mi).toBeGreaterThan(100);
  });
});

describe('fire parsing', () => {
  const feature = (attrs, geometry = { x: -120.9, y: 47.3 }) => ({ attributes: attrs, geometry });

  test('uses stable IDs from NIFC rather than random ones', () => {
    const a = parseFire(feature({ UniqueFireIdentifier: '2026-WAOWF-1', IncidentName: 'A' }));
    const b = parseFire(feature({ UniqueFireIdentifier: '2026-WAOWF-1', IncidentName: 'A' }));
    expect(a.id).toBe('2026-WAOWF-1');
    expect(a.id).toBe(b.id);
  });

  test('null containment is "unknown", not "active"', () => {
    expect(fireStatus(null)).toBe('unknown');
    expect(parseFire(feature({ PercentContained: null })).status).toBe('unknown');
    expect(fireStatus(10)).toBe('active');
    expect(fireStatus(75)).toBe('monitoring');
    expect(fireStatus(100)).toBe('contained');
  });

  test('keeps raw values for the UI to format', () => {
    const f = parseFire(feature({ IncidentSize: 1234.6, PercentContained: 49.6, POOCounty: 'Kittitas County' }));
    expect(f.acres).toBe(1235);
    expect(f.containment).toBe(50);
    expect(f.county).toBe('Kittitas');
    expect(f.name).toBeNull();
  });

  test('withDistance sorts nearest first and puts unlocated fires last', () => {
    const loc = findLocation('cle-elum');
    const fires = [
      { id: 'far', lat: 48.5, lon: -120.0 },
      { id: 'none', lat: null, lon: null },
      { id: 'near', lat: 47.2, lon: -120.95 },
    ];
    expect(withDistance(fires, loc).map((f) => f.id)).toEqual(['near', 'far', 'none']);
  });
});
