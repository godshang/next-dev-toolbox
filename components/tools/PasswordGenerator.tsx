'use client';

import { useState, useCallback, useMemo } from 'react';
import { useI18n, useToolPage } from '@/lib/i18n';

const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';

function secureRandomChar(charset: string): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return charset[array[0] % charset.length];
}

function generatePassword(
  length: number,
  includeNumbers: boolean,
  includeUppercase: boolean,
  includeLowercase: boolean,
  includeSymbols: boolean
): string {
  let charset = '';
  if (includeNumbers) charset += '0123456789';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeSymbols) charset += SYMBOLS;

  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

  let result = '';
  for (let i = 0; i < length; i++) {
    result += secureRandomChar(charset);
  }
  return result;
}

type Strength = 'weak' | 'medium' | 'strong';

function calcStrength(
  length: number,
  includeNumbers: boolean,
  includeUppercase: boolean,
  includeLowercase: boolean,
  includeSymbols: boolean
): { level: Strength; score: number } {
  let score = 0;
  if (length >= 8) score += 15;
  if (length >= 12) score += 15;
  if (length >= 16) score += 10;
  if (includeLowercase) score += 15;
  if (includeUppercase) score += 15;
  if (includeNumbers) score += 15;
  if (includeSymbols) score += 15;

  if (score < 45) return { level: 'weak', score };
  if (score < 75) return { level: 'medium', score };
  return { level: 'strong', score };
}

const strengthColors: Record<Strength, string> = {
  weak: 'bg-red-500',
  medium: 'bg-yellow-500',
  strong: 'bg-green-500',
};

export default function PasswordGenerator() {
  const { t: tc } = useI18n();
  const { t, tool } = useToolPage('password-gen');
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');

  const isValid = includeNumbers || includeUppercase || includeLowercase || includeSymbols;

  const strength = useMemo(
    () => calcStrength(length, includeNumbers, includeUppercase, includeLowercase, includeSymbols),
    [length, includeNumbers, includeUppercase, includeLowercase, includeSymbols]
  );

  const strengthLabel =
    strength.level === 'weak' ? t('strengthWeak') :
    strength.level === 'medium' ? t('strengthMedium') : t('strengthStrong');

  const handleGenerate = useCallback(() => {
    if (!isValid) return;
    setPassword(generatePassword(length, includeNumbers, includeUppercase, includeLowercase, includeSymbols));
  }, [isValid, length, includeNumbers, includeUppercase, includeLowercase, includeSymbols]);

  const handleCopy = () => {
    if (password) navigator.clipboard.writeText(password);
  };

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool?.name ?? ''}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!isValid}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {t('btnGenerate')}
          </button>
        </div>
        {!isValid && (
          <div className="mt-4 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
            {t('warnCharTypes')}
          </div>
        )}
      </div>

      <div className="flex-1 p-8 space-y-6 overflow-auto">
        {password && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between gap-4 mb-4">
              <code className="text-lg font-mono text-blue-600 dark:text-blue-400 break-all flex-1">{password}</code>
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 flex-shrink-0"
              >
                {tc('common.copy')}
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('labelStrength')}</span>
                <span className={`text-sm font-medium ${
                  strength.level === 'weak' ? 'text-red-500' :
                  strength.level === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`}>{strengthLabel}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strengthColors[strength.level]}`}
                  style={{ width: `${Math.min(strength.score, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('optionsTitle')}</h3>
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includeNumbers} onChange={e => setIncludeNumbers(e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                <span className="text-gray-700 dark:text-gray-300">{t('charNumbers')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includeUppercase} onChange={e => setIncludeUppercase(e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                <span className="text-gray-700 dark:text-gray-300">{t('charUpper')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includeLowercase} onChange={e => setIncludeLowercase(e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                <span className="text-gray-700 dark:text-gray-300">{t('charLower')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                <span className="text-gray-700 dark:text-gray-300">{t('charSymbols', { preview: SYMBOLS.slice(0, 10) })}</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('labelLength', { length })}
              </label>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={e => setLength(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((length - 8) / 56) * 100}%, #e5e7eb ${((length - 8) / 56) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>8</span>
                <span>36</span>
                <span>64</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
