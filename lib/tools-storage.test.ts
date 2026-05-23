import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getRecentTools,
  addRecentTool,
  getFavoriteTools,
  toggleFavorite,
} from './tools-storage';

const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
  });
});

describe('tools-storage', () => {
  it('adds recent tool with max 5 limit', () => {
    ['a', 'b', 'c', 'd', 'e', 'f'].forEach(addRecentTool);
    expect(getRecentTools()).toEqual(['f', 'e', 'd', 'c', 'b']);
  });

  it('deduplicates recent tool', () => {
    addRecentTool('json-format');
    addRecentTool('hash');
    addRecentTool('json-format');
    expect(getRecentTools()[0]).toBe('json-format');
  });

  it('toggles favorite', () => {
    expect(getFavoriteTools()).toEqual([]);
    toggleFavorite('hash');
    expect(getFavoriteTools()).toEqual(['hash']);
    toggleFavorite('hash');
    expect(getFavoriteTools()).toEqual([]);
  });
});
