import { describe, it, expect, vi, afterEach } from 'vitest';
import { detectBrowserLocale, resolveInitialLocale } from './locales';

describe('detectBrowserLocale', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefers Chinese browser languages', () => {
    vi.stubGlobal('navigator', { language: 'zh-CN', languages: ['zh-CN', 'en'] });
    expect(detectBrowserLocale()).toBe('zh-CN');
  });

  it('maps English browser languages', () => {
    vi.stubGlobal('navigator', { language: 'en-US', languages: ['en-US'] });
    expect(detectBrowserLocale()).toBe('en');
  });

  it('falls back to zh-CN for unsupported languages', () => {
    vi.stubGlobal('navigator', { language: 'ja-JP', languages: ['ja-JP'] });
    expect(detectBrowserLocale()).toBe('zh-CN');
  });
});

describe('resolveInitialLocale', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('uses stored preference over browser', () => {
    localStorage.setItem('dev-toolbox-locale', 'en');
    vi.stubGlobal('navigator', { language: 'zh-CN', languages: ['zh-CN'] });
    expect(resolveInitialLocale()).toBe('en');
  });

  it('uses browser when nothing stored', () => {
    vi.stubGlobal('navigator', { language: 'en-GB', languages: ['en-GB'] });
    expect(resolveInitialLocale()).toBe('en');
  });
});
