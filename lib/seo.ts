import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/locales';
import { homePath, toolPath, type LocalePathSegment } from '@/lib/i18n/routing';
import { getMessages } from '@/lib/i18n/messages';
import type { ToolMessages } from '@/lib/i18n/types';

const SITE_NAME = 'Dev Toolbox';

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

function hreflangLanguages(
  pathForLocale: (locale: Locale) => string
): NonNullable<Metadata['alternates']>['languages'] {
  return {
    'zh-CN': absoluteUrl(pathForLocale('zh-CN')),
    en: absoluteUrl(pathForLocale('en')),
    'x-default': absoluteUrl(pathForLocale('zh-CN')),
  };
}

// typo fix - pathForLocale not pathForLocator

export function buildRootMetadata(): Metadata {
  const messages = getMessages('zh-CN');
  const url = getSiteUrl();

  return {
    metadataBase: new URL(url),
    title: {
      default: messages.meta.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: messages.meta.description,
    applicationName: SITE_NAME,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: messages.meta.title,
      description: messages.meta.description,
      locale: 'zh_CN',
      alternateLocale: ['en_US'],
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.meta.title,
      description: messages.meta.description,
    },
    robots: { index: true, follow: true },
  };
}

export function buildHomeMetadata(locale: Locale, segment: LocalePathSegment): Metadata {
  const messages = getMessages(locale);
  const canonical = absoluteUrl(homePath(locale));

  return {
    title: messages.meta.title,
    description: messages.meta.description,
    alternates: {
      canonical,
      languages: hreflangLanguages(homePath),
    },
    openGraph: {
      title: messages.meta.title,
      description: messages.meta.description,
      url: canonical,
      locale: locale === 'zh-CN' ? 'zh_CN' : 'en_US',
    },
  };
}

export function buildToolMetadata(
  locale: Locale,
  segment: LocalePathSegment,
  toolId: string,
  tool: ToolMessages
): Metadata {
  const title = tool.name;
  const description = tool.description;
  const canonical = absoluteUrl(toolPath(locale, toolId));

  return {
    title,
    description,
    keywords: [tool.name, toolId, 'online', 'developer tools'],
    alternates: {
      canonical,
      languages: hreflangLanguages(l => toolPath(l, toolId)),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale: locale === 'zh-CN' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export function buildToolJsonLd(
  locale: Locale,
  toolId: string,
  tool: ToolMessages
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: absoluteUrl(toolPath(locale, toolId)),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    inLanguage: locale === 'zh-CN' ? 'zh-CN' : 'en',
  };
}

export { SITE_NAME };
