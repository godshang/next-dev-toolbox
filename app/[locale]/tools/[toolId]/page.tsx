import { notFound } from 'next/navigation';
import ToolboxApp from '@/components/ToolboxApp';
import { tools } from '@/lib/tools-registry';
import { getMessages } from '@/lib/i18n/messages';
import {
  LOCALE_PATH_SEGMENTS,
  isLocalePathSegment,
  isValidToolId,
  segmentToLocale,
  type LocalePathSegment,
} from '@/lib/i18n/routing';
import { buildToolJsonLd, buildToolMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string; toolId: string }>;
};

export function generateStaticParams() {
  return LOCALE_PATH_SEGMENTS.flatMap(locale =>
    tools.map(tool => ({ locale, toolId: tool.id }))
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale: segment, toolId } = await params;
  if (!isLocalePathSegment(segment) || !isValidToolId(toolId)) return {};

  const locale = segmentToLocale(segment);
  if (!locale) return {};

  const tool = getMessages(locale).tools[toolId];
  if (!tool) return {};

  return buildToolMetadata(locale, segment as LocalePathSegment, toolId, tool);
}

export default async function ToolPage({ params }: Props) {
  const { locale: segment, toolId } = await params;
  const locale = segmentToLocale(segment);

  if (!locale || !isValidToolId(toolId)) notFound();

  const tool = getMessages(locale).tools[toolId];
  if (!tool) notFound();

  const jsonLd = buildToolJsonLd(locale, toolId, tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolboxApp activeToolId={toolId} />
    </>
  );
}
