import { tools } from '@/lib/tools-registry';
import type { Locale } from './locales';
import { DEFAULT_LOCALE, isLocale } from './locales';

/** URL path segments (shorter than BCP47 tags) */
export const LOCALE_PATH_SEGMENTS = ['zh', 'en'] as const;
export type LocalePathSegment = (typeof LOCALE_PATH_SEGMENTS)[number];

export function isLocalePathSegment(value: string): value is LocalePathSegment {
  return (LOCALE_PATH_SEGMENTS as readonly string[]).includes(value);
}

export function segmentToLocale(segment: string): Locale | null {
  if (segment === 'zh') return 'zh-CN';
  if (segment === 'en') return 'en';
  if (isLocale(segment)) return segment;
  return null;
}

export function localeToSegment(locale: Locale): LocalePathSegment {
  return locale === 'zh-CN' ? 'zh' : 'en';
}

export function homePath(locale: Locale): string {
  return `/${localeToSegment(locale)}`;
}

export function toolPath(locale: Locale, toolId: string): string {
  return `/${localeToSegment(locale)}/tools/${toolId}`;
}

export function replacePathLocale(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return homePath(nextLocale);

  const rest =
    parts.length > 0 && isLocalePathSegment(parts[0])
      ? parts.slice(1)
      : parts;

  const suffix = rest.length > 0 ? `/${rest.join('/')}` : '';
  return `${homePath(nextLocale)}${suffix}`;
}

export function isValidToolId(toolId: string): boolean {
  return tools.some(t => t.id === toolId);
}

export function defaultLocaleSegment(): LocalePathSegment {
  return localeToSegment(DEFAULT_LOCALE);
}
