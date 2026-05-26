export const SUPPORTED_LOCALES = ['zh-CN', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh-CN';

export const LOCALE_STORAGE_KEY = 'dev-toolbox-locale';

export const localeLabels: Record<Locale, string> = {
  'zh-CN': '中文',
  en: 'English',
};

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value: string | null | undefined): Locale {
  if (value && isLocale(value)) return value;
  return DEFAULT_LOCALE;
}

/** Map browser language tags to a supported locale */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;

  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter((tag): tag is string => Boolean(tag));

  for (const tag of candidates) {
    const lower = tag.toLowerCase();
    if (lower.startsWith('zh')) return 'zh-CN';
    if (lower.startsWith('en')) return 'en';
  }

  return DEFAULT_LOCALE;
}

/** User preference in localStorage wins; otherwise use browser language */
export function resolveInitialLocale(): Locale {
  if (typeof localStorage === 'undefined') return detectBrowserLocale();

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;

  return detectBrowserLocale();
}
