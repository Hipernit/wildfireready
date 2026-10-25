import { pickReading, aqiCategory } from '../src/services/aqi';

// Shape returned by /aq/observation/current/ziplatlong/ (2026 service).
const obs = (parameterName, nowcastAQI, aqiCategoryName) => ({
  parameterName,
  nowcastAQI,
  aqiCategoryName,
  siteName: 'Test site',
});

describe('pickReading', () => {
  test('prefers PM2.5 (wildfire smoke)', () => {
    const r = pickReading([obs('OZONE', 7, 'Good'), obs('PM2.5', 34, 'Good'), obs('PM10', 13, 'Good')]);
    expect(r).toEqual({ aqi: 34, cat: 'good', parameter: 'PM2.5' });
  });

  test('falls back to ozone, then anything', () => {
    expect(pickReading([obs('PM10', 13, 'Good'), obs('OZONE', 60, 'Moderate')]).parameter).toBe('OZONE');
    expect(pickReading([obs('PM10', 13, 'Good')]).parameter).toBe('PM10');
  });

  test('maps AirNow category names, including Very Unhealthy', () => {
    expect(pickReading([obs('PM2.5', 220, 'Very Unhealthy')]).cat).toBe('veryUnhealthy');
    expect(pickReading([obs('PM2.5', 120, 'Unhealthy for Sensitive Groups')]).cat).toBe('sensitive');
  });

  test('derives the category from the AQI when the name is missing', () => {
    expect(pickReading([obs('PM2.5', 175, undefined)]).cat).toBe('unhealthy');
  });

  test('returns null when nothing usable is reported', () => {
    expect(pickReading([])).toBeNull();
    expect(pickReading([obs('PM2.5', null, 'Good')])).toBeNull();
    expect(pickReading({ WebServiceError: [] })).toBeNull();
  });
});

describe('aqiCategory', () => {
  test('uses EPA breakpoints', () => {
    expect([50, 51, 100, 101, 150, 151, 200, 201, 300, 301].map(aqiCategory)).toEqual([
      'good',
      'moderate',
      'moderate',
      'sensitive',
      'sensitive',
      'unhealthy',
      'unhealthy',
      'veryUnhealthy',
      'veryUnhealthy',
      'hazardous',
    ]);
  });
});
