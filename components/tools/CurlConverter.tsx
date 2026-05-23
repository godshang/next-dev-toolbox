'use client';

import { useState, useMemo } from 'react';
import { parseCurl, generateCode, CodeTarget } from '@/lib/curl-parser';

const TARGETS: { id: CodeTarget; label: string }[] = [
  { id: 'fetch', label: 'fetch' },
  { id: 'axios', label: 'axios' },
  { id: 'java', label: 'Java HttpClient' },
  { id: 'python', label: 'Python requests' },
];

export default function CurlConverter() {
  const [curlInput, setCurlInput] = useState('');
  const [target, setTarget] = useState<CodeTarget>('fetch');

  const { output, error } = useMemo(() => {
    if (!curlInput.trim()) return { output: '', error: '' };
    try {
      const parsed = parseCurl(curlInput);
      return { output: generateCode(parsed, target), error: '' };
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : '解析失败' };
    }
  }, [curlInput, target]);

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">cURL 转代码</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">将 cURL 命令转换为各语言 HTTP 请求代码</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">cURL 命令</label>
          <textarea
            value={curlInput}
            onChange={e => setCurlInput(e.target.value)}
            className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={"curl -X POST 'https://api.example.com/users' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\":\"test\"}'"}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TARGETS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTarget(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                target === t.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">生成代码</label>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(output)}
                className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                复制
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-800 dark:text-gray-200 overflow-auto max-h-96 whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
