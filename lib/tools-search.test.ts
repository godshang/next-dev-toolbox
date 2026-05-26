import { describe, it, expect } from 'vitest';
import { searchTools } from './tools-search';
import { localizeTools } from './i18n/tools';

const zhTools = localizeTools('zh-CN');
const enTools = localizeTools('en');

describe('searchTools', () => {
  it('matches tool name in Chinese', () => {
    const results = searchTools('json 格式化', zhTools);
    expect(results.some(t => t.id === 'json-format')).toBe(true);
  });

  it('matches tool name in English', () => {
    const results = searchTools('JSON Format', enTools);
    expect(results.some(t => t.id === 'json-format')).toBe(true);
  });

  it('matches keywords', () => {
    const results = searchTools('sha256', zhTools);
    expect(results.some(t => t.id === 'hash')).toBe(true);
  });

  it('returns empty for no match', () => {
    expect(searchTools('xyznotexist', zhTools)).toHaveLength(0);
  });

  it('is case insensitive', () => {
    const results = searchTools('JSON', enTools);
    expect(results.some(t => t.id === 'json-format')).toBe(true);
  });
});
