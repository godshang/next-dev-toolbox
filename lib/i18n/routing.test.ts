import { describe, it, expect } from 'vitest';
import {
  homePath,
  toolPath,
  replacePathLocale,
  segmentToLocale,
  localeToSegment,
} from './routing';

describe('i18n routing', () => {
  it('maps URL segments to locales', () => {
    expect(segmentToLocale('zh')).toBe('zh-CN');
    expect(segmentToLocale('en')).toBe('en');
    expect(segmentToLocale('fr')).toBeNull();
  });

  it('builds localized paths', () => {
    expect(homePath('zh-CN')).toBe('/zh');
    expect(toolPath('en', 'json-format')).toBe('/en/tools/json-format');
  });

  it('replaces locale in pathname', () => {
    expect(replacePathLocale('/zh/tools/json-format', 'en')).toBe(
      '/en/tools/json-format'
    );
    expect(replacePathLocale('/en', 'zh-CN')).toBe('/zh');
  });

  it('round-trips locale segments', () => {
    expect(localeToSegment('zh-CN')).toBe('zh');
    expect(localeToSegment('en')).toBe('en');
  });
});
