import { notFound } from 'next/navigation';
import { I18nProvider } from '@/lib/i18n';
import {
  LOCALE_PATH_SEGMENTS,
  segmentToLocale,
} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return LOCALE_PATH_SEGMENTS.map(locale => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: segment } = await params;
  const locale = segmentToLocale(segment);
  if (!locale) notFound();

  return <I18nProvider initialLocale={locale}>{children}</I18nProvider>;
}
