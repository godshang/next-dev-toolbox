import type { Locale } from '../locales';
import type { Messages } from '../types';
import { en } from './en';
import { zhCN } from './zh-CN';

const catalogs: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  en,
};

export function getMessages(locale: Locale): Messages {
  return catalogs[locale];
}
