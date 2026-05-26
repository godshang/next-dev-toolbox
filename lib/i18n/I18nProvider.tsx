'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
} from './locales';
import { getMessages } from './messages';
import { createTranslator } from './translate';
import type { Messages } from './types';
import { localizeTools, type LocalizedToolItem } from './tools';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
  t: (key: string, params?: Record<string, string | number>) => string;
  tools: LocalizedToolItem[];
  getTool: (id: string) => LocalizedToolItem | undefined;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: ReactNode;
  /** Locale from URL segment; drives SSR metadata alignment */
  initialLocale?: Locale;
};

export function I18nProvider({ children, initialLocale = DEFAULT_LOCALE }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocaleState(initialLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, initialLocale);
    document.cookie = `${LOCALE_STORAGE_KEY}=${initialLocale};path=/;max-age=31536000;samesite=lax`;
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.cookie = `${LOCALE_STORAGE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);
  const t = useMemo(() => createTranslator(messages), [messages]);
  const tools = useMemo(() => localizeTools(locale, messages), [locale, messages]);

  const getTool = useCallback(
    (id: string) => tools.find(tool => tool.id === id),
    [tools]
  );

  useEffect(() => {
    document.documentElement.lang = locale === 'zh-CN' ? 'zh-CN' : 'en';
    document.title = messages.meta.title;
  }, [locale, messages.meta.title]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, messages, t, tools, getTool }),
    [locale, setLocale, messages, t, tools, getTool]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

/** Scoped translator for a single tool page */
export function useToolPage(toolId: string) {
  const { t, getTool } = useI18n();
  const tool = getTool(toolId);
  const tp = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      t(`toolPages.${toolId}.${key}`, params),
    [t, toolId]
  );
  return { t: tp, tool, toolId };
}
