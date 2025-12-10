'use client';

import { useState, useRef, useEffect } from 'react';

// JSON 语法高亮函数
const highlightJSON = (text: string): string => {
  if (!text.trim()) return '';
  
  // 转义 HTML
  let highlighted = escapeHtml(text);
  
  // 标记已处理的位置，避免重复处理
  const processed = new Set<number>();
  
  // 1. 先高亮键名（"key": 格式，后面跟着冒号）
  highlighted = highlighted.replace(
    /"([^"\\]|\\.)*":/g,
    (match, offset) => {
      const keyMatch = match.match(/^"([^"]+)":$/);
      if (keyMatch) {
        return `<span class="text-red-600 dark:text-red-400 font-semibold">"${keyMatch[1]}"</span>:`;
      }
      return match;
    }
  );
  
  // 2. 高亮字符串值（不在键名位置的字符串，即不在冒号前的）
  // 匹配 : "value" 或 , "value" 格式
  highlighted = highlighted.replace(
    /(:\s*|,\s*)"([^"\\]|\\.)*"/g,
    (match) => {
      // 如果已经包含高亮标签，跳过
      if (match.includes('<span')) {
        return match;
      }
      const valueMatch = match.match(/(:\s*|,\s*)"([^"]+)"/);
      if (valueMatch) {
        return `${valueMatch[1]}<span class="text-green-600 dark:text-green-400">"${valueMatch[2]}"</span>`;
      }
      return match;
    }
  );
  
  // 3. 高亮数字（不在字符串内）
  highlighted = highlighted.replace(
    /(:\s*|,\s*)(\d+\.?\d*)/g,
    (match) => {
      // 如果已经包含高亮标签，跳过
      if (match.includes('<span')) {
        return match;
      }
      const numMatch = match.match(/(:\s*|,\s*)(\d+\.?\d*)/);
      if (numMatch) {
        return `${numMatch[1]}<span class="text-blue-600 dark:text-blue-400">${numMatch[2]}</span>`;
      }
      return match;
    }
  );
  
  // 4. 高亮布尔值和 null
  highlighted = highlighted.replace(
    /(:\s*|,\s*)(true|false|null)\b/g,
    (match) => {
      // 如果已经包含高亮标签，跳过
      if (match.includes('<span')) {
        return match;
      }
      const boolMatch = match.match(/(:\s*|,\s*)(true|false|null)/);
      if (boolMatch) {
        return `${boolMatch[1]}<span class="text-purple-600 dark:text-purple-400 font-semibold">${boolMatch[2]}</span>`;
      }
      return match;
    }
  );
  
  return highlighted;
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export default function JsonFormat() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
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
    try {
      setError('');
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      setContent(formatted);
    } catch (e) {
      setError('Invalid JSON format');
    }
  };

  const handleMinify = () => {
    try {
      setError('');
      const parsed = JSON.parse(content);
      const minified = JSON.stringify(parsed);
      setContent(minified);
    } catch (e) {
      setError('Invalid JSON format');
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

  const highlightedContent = highlightJSON(content);

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden" style={{ minHeight: 'calc(100vh - 12rem)' }}>
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">JSON 格式化</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">格式化、压缩和美化 JSON 数据</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFormat}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2">
                <span>格式化</span>
              </span>
            </button>
            <button
              onClick={handleMinify}
              className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              压缩
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              清空
            </button>
            <button
              onClick={handleCopy}
              disabled={!content}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              复制
            </button>
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
          className="absolute inset-0 p-6 overflow-auto font-mono text-sm whitespace-pre-wrap break-words pointer-events-none"
        >
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />
          ) : (
            <div className="text-gray-400 dark:text-gray-500 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-2">📝</div>
                <div className="text-lg font-medium">在此粘贴或输入 JSON...</div>
                <div className="text-sm mt-1 text-gray-400 dark:text-gray-500">支持实时语法高亮</div>
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
          className="absolute inset-0 w-full h-full p-6 border-0 bg-transparent text-transparent caret-blue-600 dark:caret-blue-400 font-mono text-sm resize-none focus:outline-none overflow-auto"
          placeholder=""
          style={{
            caretColor: '#2563eb',
          }}
        />
      </div>
    </div>
  );
}
