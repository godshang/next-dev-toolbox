'use client';

import { useState } from 'react';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { useI18n, useToolPage } from '@/lib/i18n';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: true,
  trimValues: true,
});

function buildXml(obj: unknown, format: boolean): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format,
    indentBy: '  ',
    suppressEmptyNode: true,
  });
  return builder.build(obj as Record<string, unknown>);
}

export default function XmlFormat() {
  const { t: tc } = useI18n();
  const { t, tool } = useToolPage('xml-format');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const process = (format: boolean) => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = parser.parse(input);
      setOutput(buildXml(parsed, format));
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      setError(detail ? tc('common.xmlFormatError', { detail }) : t('errorParseFailed'));
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool?.name ?? ''}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tool?.description}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => process(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-sm font-medium shadow-md"
            >
              {tc('common.format')}
            </button>
            <button
              type="button"
              onClick={() => process(false)}
              className="px-5 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 text-sm font-medium shadow-md"
            >
              {tc('common.compress')}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('labelInputXml')}</label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('placeholderInput')}
          />
        </div>

        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('labelOutput')}</label>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                {tc('common.copy')}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
