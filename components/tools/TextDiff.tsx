'use client';

import { useState, useMemo } from 'react';
import { diffLines } from 'diff';
import { useI18n, useToolPage } from '@/lib/i18n';

type LineDiff = {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
};

function computeLineDiff(left: string, right: string): LineDiff[] {
  const changes = diffLines(left, right);
  const result: LineDiff[] = [];

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, '').split('\n');
    if (change.added) {
      lines.forEach(line => result.push({ type: 'added', content: line }));
    } else if (change.removed) {
      lines.forEach(line => result.push({ type: 'removed', content: line }));
    } else {
      lines.forEach(line => result.push({ type: 'unchanged', content: line }));
    }
  }

  return result;
}

export default function TextDiff() {
  const { t, tool } = useToolPage('text-diff');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');

  const diffs = useMemo(() => computeLineDiff(left, right), [left, right]);

  const stats = useMemo(() => {
    const added = diffs.filter(d => d.type === 'added').length;
    const removed = diffs.filter(d => d.type === 'removed').length;
    return { added, removed };
  }, [diffs]);

  const lineClass = (type: LineDiff['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'removed':
        return 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const linePrefix = (type: LineDiff['type']) => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      default:
        return ' ';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool?.name ?? ''}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tool?.description}</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{t('labelOriginal')}</label>
            <textarea
              value={left}
              onChange={e => setLeft(e.target.value)}
              className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('placeholderOriginal')}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{t('labelNew')}</label>
            <textarea
              value={right}
              onChange={e => setRight(e.target.value)}
              className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('placeholderNew')}
            />
          </div>
        </div>

        {(left || right) && (
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-green-600 dark:text-green-400">{t('statsAdded', { count: stats.added })}</span>
            <span className="text-red-600 dark:text-red-400">{t('statsRemoved', { count: stats.removed })}</span>
          </div>
        )}

        {(left || right) && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{t('labelResult')}</label>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto">
              {diffs.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">{t('noDiff')}</div>
              ) : (
                <pre className="font-mono text-sm">
                  {diffs.map((line, i) => (
                    <div key={i} className={`px-4 py-0.5 ${lineClass(line.type)}`}>
                      <span className="select-none opacity-50 mr-2">{linePrefix(line.type)}</span>
                      {line.content || '\u00a0'}
                    </div>
                  ))}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
