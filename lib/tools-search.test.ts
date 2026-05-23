import { describe, it, expect } from 'vitest';
import { searchTools } from './tools-search';

describe('searchTools', () => {
  it('matches tool name', () => {
    const results = searchTools('json 格式化');
    expect(results.some(t => t.id === 'json-format')).toBe(true);
  });

  it('matches keywords', () => {
    const results = searchTools('sha256');
    expect(results.some(t => t.id === 'hash')).toBe(true);
  });

  it('returns empty for no match', () => {
    expect(searchTools('xyznotexist')).toHaveLength(0);
  });

  it('is case insensitive', () => {
    const results = searchTools('JSON');
    expect(results.some(t => t.id === 'json-format')).toBe(true);
  });
});
