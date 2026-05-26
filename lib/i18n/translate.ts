import type { Messages } from './types';

type Params = Record<string, string | number>;

function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function createTranslator(messages: Messages) {
  return function t(key: string, params?: Params): string {
    let text = getNestedValue(messages, key);
    if (text === undefined) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing key: ${key}`);
      }
      return key;
    }
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replaceAll(`{${k}}`, String(v));
      }
    }
    return text;
  };
}
