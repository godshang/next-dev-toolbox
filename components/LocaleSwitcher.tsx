'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  useI18n,
  localeLabels,
  SUPPORTED_LOCALES,
  type Locale,
} from '@/lib/i18n';
import { replacePathLocale } from '@/lib/i18n/routing';

export default function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: Locale) => {
    setLocale(next);
    router.push(replacePathLocale(pathname, next));
  };

  return (
    <div
      className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80"
      role="group"
      aria-label={t('common.language')}
    >
      <span className="text-sm leading-none text-gray-500 dark:text-gray-400 pl-0.5" aria-hidden>
        🌐
      </span>
      {SUPPORTED_LOCALES.map(loc => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            locale === loc
              ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 font-medium shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          aria-pressed={locale === loc}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
