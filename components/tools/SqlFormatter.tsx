'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'sql-formatter';
import { useI18n, useToolPage } from '@/lib/i18n';

// SQL 语法高亮函数
const highlightSQL = (text: string, uppercase: boolean = true): string => {
  if (!text.trim()) return '';
  
  // 先转义 HTML，避免 XSS
  let highlighted = escapeHtml(text);
  
  // 使用占位符标记已处理的部分，避免重复处理
  const placeholders: { [key: string]: string } = {};
  let placeholderIndex = 0;
  const PLACEHOLDER_PREFIX = '___PLACEHOLDER_';
  const PLACEHOLDER_SUFFIX = '___';
  
  const createPlaceholder = (type: string) => {
    const key = `${PLACEHOLDER_PREFIX}${type}_${placeholderIndex++}${PLACEHOLDER_SUFFIX}`;
    return key;
  };
  
  const isPlaceholder = (str: string) => {
    return str.startsWith(PLACEHOLDER_PREFIX) && str.endsWith(PLACEHOLDER_SUFFIX);
  };
  
  // 1. 先处理字符串（避免字符串内的内容被高亮）
  highlighted = highlighted.replace(
    /(['"])((?:\\.|(?!\1)[^\\])*?)\1/g,
    (match) => {
      const key = createPlaceholder('STR');
      placeholders[key] = `<span class="text-green-600 dark:text-green-400">${match}</span>`;
      return key;
    }
  );
  
  // 2. 处理注释
  highlighted = highlighted.replace(
    /--.*$/gm,
    (match) => {
      const key = createPlaceholder('COMMENT');
      placeholders[key] = `<span class="text-gray-500 dark:text-gray-400 italic">${match}</span>`;
      return key;
    }
  );
  
  highlighted = highlighted.replace(
    /\/\*[\s\S]*?\*\//g,
    (match) => {
      const key = createPlaceholder('COMMENT');
      placeholders[key] = `<span class="text-gray-500 dark:text-gray-400 italic">${match}</span>`;
      return key;
    }
  );
  
  // 3. 处理 SQL 关键字
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
    'TABLE', 'INDEX', 'VIEW', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON',
    'GROUP', 'BY', 'ORDER', 'HAVING', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE',
    'BETWEEN', 'IS', 'NULL', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
    'UNION', 'ALL', 'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'IF', 'EXISTS', 'LIMIT', 'OFFSET', 'TOP', 'ASC', 'DESC',
    'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'UNIQUE', 'CHECK',
    'DEFAULT', 'AUTO_INCREMENT', 'IDENTITY', 'SEQUENCE', 'TRUNCATE', 'GRANT',
    'REVOKE', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'BEGIN', 'SAVEPOINT'
  ];
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlighted = highlighted.replace(regex, (match) => {
      // 检查是否是占位符
      if (isPlaceholder(match)) {
        return match;
      }
      const key = createPlaceholder('KW');
      const displayText = uppercase ? match.toUpperCase() : match;
      placeholders[key] = `<span class="text-purple-600 dark:text-purple-400 font-semibold">${displayText}</span>`;
      return key;
    });
  });
  
  // 4. 处理数字
  highlighted = highlighted.replace(
    /\b\d+\.?\d*\b/g,
    (match) => {
      if (isPlaceholder(match)) {
        return match;
      }
      const key = createPlaceholder('NUM');
      placeholders[key] = `<span class="text-blue-600 dark:text-blue-400">${match}</span>`;
      return key;
    }
  );
  
  // 5. 恢复所有占位符（按顺序，避免嵌套问题）
  const sortedKeys = Object.keys(placeholders).sort((a, b) => {
    const aIndex = parseInt(a.match(/\d+/)?.[0] || '0');
    const bIndex = parseInt(b.match(/\d+/)?.[0] || '0');
    return bIndex - aIndex; // 反向排序，从后往前替换
  });
  
  sortedKeys.forEach(key => {
    highlighted = highlighted.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), placeholders[key]);
  });
  
  return highlighted;
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export default function SqlFormatter() {
  const { t: tc } = useI18n();
  const { t, tool } = useToolPage('sql-formatter');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [uppercase, setUppercase] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // 同步滚动
  useEffect(() => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    
    if (textarea && highlight) {
      const handleScroll = () => {
        highlight.scrollTop = textarea.scrollTop;
        highlight.scrollLeft = textarea.scrollLeft;
      };
      
      textarea.addEventListener('scroll', handleScroll);
      return () => textarea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleFormat = () => {
    if (!content.trim()) {
      setError(t('errorEmpty'));
      return;
    }

    try {
      setError('');
      // sql-formatter v15 的配置选项
      const formatted = format(content, {
        language: 'sql',
        keywordCase: uppercase ? 'upper' : 'preserve',
        linesBetweenQueries: 2,
      } as any);
      setContent(formatted);
    } catch (e: any) {
      setError(e.message || t('errorFormatFailed'));
    }
  };

  const handleClear = () => {
    setContent('');
    setError('');
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  const handleExample = () => {
    const example = `SELECT u.id,u.name,u.email,COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.status='active' AND u.created_at>'2024-01-01' GROUP BY u.id,u.name,u.email HAVING COUNT(o.id)>5 ORDER BY order_count DESC LIMIT 10`;
    setContent(example);
    setError('');
  };

  const highlightedContent = highlightSQL(content, uppercase);

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden" style={{ minHeight: 'calc(100vh - 12rem)' }}>
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool?.name ?? ''}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExample}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {t('btnExample')}
            </button>
            <button
              onClick={handleFormat}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2">
                <span>{tc('common.format')}</span>
              </span>
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {tc('common.clear')}
            </button>
            <button
              onClick={handleCopy}
              disabled={!content}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {tc('common.copy')}
            </button>
          </div>
        </div>
        
        {/* 配置选项 */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="mr-1"
              />
              {t('optionUppercase')}
            </label>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <span className="text-red-500">⚠</span>
            {error}
          </div>
        )}
      </div>
      
      {/* 编辑器区域 */}
      <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-950">
        {/* 语法高亮层 */}
        <div
          ref={highlightRef}
          className="absolute inset-0 p-6 overflow-auto font-mono text-sm whitespace-pre-wrap break-words pointer-events-none z-0"
        >
          {content ? (
            <pre className="m-0 p-0 font-mono text-sm" dangerouslySetInnerHTML={{ __html: highlightedContent }} />
          ) : (
            <div className="text-gray-400 dark:text-gray-500 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-2">🗄️</div>
                <div className="text-lg font-medium">{t('emptyHint')}</div>
                <div className="text-sm mt-1 text-gray-400 dark:text-gray-500">{t('emptyHintSub')}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* 输入层 */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError('');
          }}
          className="absolute inset-0 w-full h-full p-6 border-0 bg-transparent text-transparent caret-blue-600 dark:caret-blue-400 font-mono text-sm resize-none focus:outline-none overflow-auto z-10"
          placeholder=""
          style={{
            caretColor: '#2563eb',
          }}
        />
      </div>
    </div>
  );
}

