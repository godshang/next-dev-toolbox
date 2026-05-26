'use client';

import { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { useI18n, useToolPage } from '@/lib/i18n';

export default function CsvJsonConverter() {
  const { t: tc } = useI18n();
  const { t, tool } = useToolPage('csv-json');
  const [csvContent, setCsvContent] = useState('');
  const [jsonContent, setJsonContent] = useState('');
  const [error, setError] = useState('');
  const [useHeader, setUseHeader] = useState(true);
  const isUpdatingRef = useRef(false);

  const convertCsvToJson = useCallback((csv: string) => {
    if (isUpdatingRef.current) return;
    if (!csv.trim()) {
      isUpdatingRef.current = true;
      setJsonContent('');
      setError('');
      isUpdatingRef.current = false;
      return;
    }
    const result = Papa.parse<Record<string, string>>(csv, {
      header: useHeader,
      skipEmptyLines: true,
    });
    if (result.errors.length > 0) {
      setError(result.errors[0].message);
      return;
    }
    isUpdatingRef.current = true;
    setJsonContent(JSON.stringify(result.data, null, 2));
    setError('');
    isUpdatingRef.current = false;
  }, [useHeader]);

  const convertJsonToCsv = useCallback((json: string) => {
    if (isUpdatingRef.current) return;
    if (!json.trim()) {
      isUpdatingRef.current = true;
      setCsvContent('');
      setError('');
      isUpdatingRef.current = false;
      return;
    }
    try {
      const parsed = JSON.parse(json);
      const data = Array.isArray(parsed) ? parsed : [parsed];
      const csv = Papa.unparse(data, { header: useHeader });
      isUpdatingRef.current = true;
      setCsvContent(csv);
      setError('');
      isUpdatingRef.current = false;
    } catch (e) {
      setError(tc('common.jsonFormatError', { detail: e instanceof Error ? e.message : String(e) }));
    }
  }, [useHeader, tc]);

  const handleClear = () => {
    setCsvContent('');
    setJsonContent('');
    setError('');
  };

  const textareaClass =
    'w-full min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool?.name ?? ''}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tool?.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={useHeader}
                onChange={e => setUseHeader(e.target.checked)}
                className="rounded border-gray-300"
              />
              {t('useHeader')}
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 text-sm font-medium shadow-md"
            >
              {tc('common.clear')}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('labelCsv')}</label>
              {csvContent && (
                <button type="button" onClick={() => navigator.clipboard.writeText(csvContent)} className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg">{tc('common.copy')}</button>
              )}
            </div>
            <textarea
              value={csvContent}
              onChange={e => { setCsvContent(e.target.value); convertCsvToJson(e.target.value); }}
              className={textareaClass}
              placeholder={t('placeholderCsv')}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('labelJson')}</label>
              {jsonContent && (
                <button type="button" onClick={() => navigator.clipboard.writeText(jsonContent)} className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg">{tc('common.copy')}</button>
              )}
            </div>
            <textarea
              value={jsonContent}
              onChange={e => { setJsonContent(e.target.value); convertJsonToCsv(e.target.value); }}
              className={textareaClass}
              placeholder={t('placeholderJson')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
