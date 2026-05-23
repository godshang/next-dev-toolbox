'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchTools } from '@/lib/tools-search';
import { tools } from '@/lib/tools-registry';

interface ToolSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (toolId: string) => void;
}

export default function ToolSearch({ open, onClose, onSelect }: ToolSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(tools);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults(tools);
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(query.trim() ? searchTools(query) : tools);
      setActiveIndex(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[activeIndex]) {
        onSelect(results[activeIndex].id);
        onClose();
      }
    },
    [open, results, activeIndex, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[15vh] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-400">🔍</span>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
            placeholder="搜索工具..."
          />
          <kbd className="hidden sm:inline text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400">
              未找到匹配的工具
            </li>
          ) : (
            results.map((tool, i) => (
              <li key={tool.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(tool.id);
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                    i === activeIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-base w-5 text-center flex-shrink-0">{tool.icon || '📌'}</span>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{tool.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{tool.description}</div>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
