'use client';

import { useState, useRef, useCallback } from 'react';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: true,
  trimValues: true,
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: true,
});

export default function XmlJsonConverter() {
  const [jsonContent, setJsonContent] = useState('');
  const [xmlContent, setXmlContent] = useState('');
  const [error, setError] = useState('');
  const isUpdatingRef = useRef(false);

  const convertJsonToXml = useCallback((json: string) => {
    if (isUpdatingRef.current) return;
    if (!json.trim()) {
      isUpdatingRef.current = true;
      setXmlContent('');
      setError('');
      isUpdatingRef.current = false;
      return;
    }
    try {
      const parsed = JSON.parse(json);
      const xml = builder.build(parsed);
      isUpdatingRef.current = true;
      setXmlContent(xml);
      setError('');
      isUpdatingRef.current = false;
    } catch (e) {
      setError('JSON 格式错误: ' + (e instanceof Error ? e.message : String(e)));
    }
  }, []);

  const convertXmlToJson = useCallback((xml: string) => {
    if (isUpdatingRef.current) return;
    if (!xml.trim()) {
      isUpdatingRef.current = true;
      setJsonContent('');
      setError('');
      isUpdatingRef.current = false;
      return;
    }
    try {
      const parsed = parser.parse(xml);
      const jsonStr = JSON.stringify(parsed, null, 2);
      isUpdatingRef.current = true;
      setJsonContent(jsonStr);
      setError('');
      isUpdatingRef.current = false;
    } catch (e) {
      setError('XML 格式错误: ' + (e instanceof Error ? e.message : String(e)));
    }
  }, []);

  const handleClear = () => {
    setJsonContent('');
    setXmlContent('');
    setError('');
  };

  const textareaClass =
    'w-full min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">XML ↔ JSON</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">XML 与 JSON 格式双向转换</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 text-sm font-medium shadow-md"
          >
            清空
          </button>
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
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">JSON</label>
              {jsonContent && (
                <button type="button" onClick={() => navigator.clipboard.writeText(jsonContent)} className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg">复制</button>
              )}
            </div>
            <textarea
              value={jsonContent}
              onChange={e => { setJsonContent(e.target.value); convertJsonToXml(e.target.value); }}
              className={textareaClass}
              placeholder='{"root": {}}'
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">XML</label>
              {xmlContent && (
                <button type="button" onClick={() => navigator.clipboard.writeText(xmlContent)} className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg">复制</button>
              )}
            </div>
            <textarea
              value={xmlContent}
              onChange={e => { setXmlContent(e.target.value); convertXmlToJson(e.target.value); }}
              className={textareaClass}
              placeholder="<root></root>"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
