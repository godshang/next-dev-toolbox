import type { MetadataRoute } from 'next';
import { tools } from '@/lib/tools-registry';
import { getSiteUrl } from '@/lib/seo';
import { LOCALE_PATH_SEGMENTS } from '@/lib/i18n/routing';
import { getMessages } from '@/lib/i18n/messages';
import { segmentToLocale } from '@/lib/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const segment of LOCALE_PATH_SEGMENTS) {
    const locale = segmentToLocale(segment)!;
    const messages = getMessages(locale);

    entries.push({
      url: `${base}/${segment}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'zh-CN': `${base}/zh`,
          en: `${base}/en`,
          'x-default': `${base}/zh`,
        },
      },
    });

    for (const tool of tools) {
      if (!messages.tools[tool.id]) continue;
      entries.push({
        url: `${base}/${segment}/tools/${tool.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: {
            'zh-CN': `${base}/zh/tools/${tool.id}`,
            en: `${base}/en/tools/${tool.id}`,
            'x-default': `${base}/zh/tools/${tool.id}`,
          },
        },
      });
    }
  }

  return entries;
}
