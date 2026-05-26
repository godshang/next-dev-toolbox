import { tools as toolDefinitions } from '@/lib/tools-registry';
import type { Locale } from './locales';
import { getMessages } from './messages';
import type { Messages, ToolMessages } from './types';
import type { ToolItem } from '@/lib/tools-registry';

export type LocalizedToolItem = ToolItem & {
  name: string;
  description: string;
};

function resolveToolMessages(
  id: string,
  toolMessages: Record<string, ToolMessages>
): ToolMessages {
  const entry = toolMessages[id];
  if (entry) return entry;
  return { name: id, description: '' };
}

export function localizeTools(locale: Locale, messages?: Messages): LocalizedToolItem[] {
  const msgs = messages ?? getMessages(locale);
  return toolDefinitions.map(def => {
    const localized = resolveToolMessages(def.id, msgs.tools);
    return {
      ...def,
      name: localized.name,
      description: localized.description,
    };
  });
}
