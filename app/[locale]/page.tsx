import { notFound } from 'next/navigation';
import ToolboxApp from '@/components/ToolboxApp';
import { buildHomeMetadata } from '@/lib/seo';
import {
  isLocalePathSegment,
  segmentToLocale,
} from '@/lib/i18n/routing';
import type { LocalePathSegment } from '@/lib/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale: segment } = await params;
  if (!isLocalePathSegment(segment)) return {};
  const locale = segmentToLocale(segment);
  if (!locale) return {};
  return buildHomeMetadata(locale, segment as LocalePathSegment);
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale: segment } = await params;
  if (!segmentToLocale(segment)) notFound();

  return <ToolboxApp activeToolId={null} />;
}
