'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import * as yaml from 'js-yaml';

// JSON 语法高亮函数
const highlightJSON = (text: string): string => {
  if (!text.trim()) return '';
  
  let highlighted = escapeHtml(text);
  
  // 1. 高亮键名
  highlighted = highlighted.replace(
    /"([^"\\]|\\.)*":/g,
    (match) => {
      const keyMatch = match.match(/^"([^"]+)":$/);
      if (keyMatch) {
        return `<span class="text-red-600 dark:text-red-400 font-semibold">"${keyMatch[1]}"</span>:`;
      }
      return match;
    }
  );
  
  // 2. 高亮字符串值
  highlighted = highlighted.replace(
    /(:\s*|,\s*)"([^"\\]|\\.)*"/g,
    (match) => {
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
  
  // 3. 高亮数字
  highlighted = highlighted.replace(
    /(:\s*|,\s*)(\d+\.?\d*)/g,
    (match) => {
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

// YAML 语法高亮函数
const highlightYAML = (text: string): string => {
  if (!text.trim()) return '';
  
  let highlighted = escapeHtml(text);
  
  // 1. 高亮键名（key: 格式）
  highlighted = highlighted.replace(
    /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm,
    (match, indent, key) => {
      return `${indent}<span class="text-red-600 dark:text-red-400 font-semibold">${key}</span>:`;
    }
  );
  
  // 2. 高亮字符串值（引号内的）
  highlighted = highlighted.replace(
    /:\s*(["'])([^"']*)\1/g,
    (match, quote, value) => {
      return `: <span class="text-green-600 dark:text-green-400">${quote}${value}${quote}</span>`;
    }
  );
  
  // 3. 高亮数字
  highlighted = highlighted.replace(
    /:\s*(\d+\.?\d*)(\s|$)/g,
    (match, num, suffix) => {
      if (match.includes('<span')) {
        return match;
      }
      return `: <span class="text-blue-600 dark:text-blue-400">${num}</span>${suffix}`;
    }
  );
  
  // 4. 高亮布尔值和 null
  highlighted = highlighted.replace(
    /:\s*(true|false|null|yes|no|on|off)(\s|$)/gi,
    (match, value, suffix) => {
      if (match.includes('<span')) {
        return match;
      }
      return `: <span class="text-purple-600 dark:text-purple-400 font-semibold">${value}</span>${suffix}`;
    }
  );
  
  // 5. 高亮列表项（- 开头）
  highlighted = highlighted.replace(
    /^(\s*)-\s/gm,
    (match, indent) => {
      return `${indent}<span class="text-yellow-600 dark:text-yellow-400 font-semibold">-</span> `;
    }
  );
  
  // 6. 高亮注释
  highlighted = highlighted.replace(
    /#(.*)$/gm,
    (match, comment) => {
      return `<span class="text-gray-500 dark:text-gray-400 italic">#${comment}</span>`;
    }
  );
  
  return highlighted;
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export default function JsonYamlConverter() {
  const [jsonContent, setJsonContent] = useState('');
  const [yamlContent, setYamlContent] = useState('');
  const [error, setError] = useState('');
  const isUpdatingRef = useRef(false); // 防止循环更新
  const jsonTextareaRef = useRef<HTMLTextAreaElement>(null);
  const yamlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const jsonHighlightRef = useRef<HTMLDivElement>(null);
  const yamlHighlightRef = useRef<HTMLDivElement>(null);

  // 同步滚动
  useEffect(() => {
    const jsonTextarea = jsonTextareaRef.current;
    const jsonHighlight = jsonHighlightRef.current;
    
    if (jsonTextarea && jsonHighlight) {
      const handleScroll = () => {
        jsonHighlight.scrollTop = jsonTextarea.scrollTop;
        jsonHighlight.scrollLeft = jsonTextarea.scrollLeft;
      };
      
      jsonTextarea.addEventListener('scroll', handleScroll);
      return () => jsonTextarea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const yamlTextarea = yamlTextareaRef.current;
    const yamlHighlight = yamlHighlightRef.current;
    
    if (yamlTextarea && yamlHighlight) {
      const handleScroll = () => {
        yamlHighlight.scrollTop = yamlTextarea.scrollTop;
        yamlHighlight.scrollLeft = yamlTextarea.scrollLeft;
      };
      
      yamlTextarea.addEventListener('scroll', handleScroll);
      return () => yamlTextarea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // JSON 转 YAML
  const convertJsonToYaml = useCallback((json: string) => {
    if (isUpdatingRef.current) return; // 防止循环更新
    
    if (!json.trim()) {
      isUpdatingRef.current = true;
      setYamlContent('');
      setError('');
      isUpdatingRef.current = false;
      return;
    }

    try {
      const parsed = JSON.parse(json);
      const yamlStr = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        quotingType: '"',
        forceQuotes: false,
      });
      isUpdatingRef.current = true;
      setYamlContent(yamlStr);
      setError('');
      isUpdatingRef.current = false;
    } catch (e) {
      setError('JSON 格式错误: ' + (e instanceof Error ? e.message : String(e)));
    }
  }, []);

  // YAML 转 JSON
  const convertYamlToJson = useCallback((yamlStr: string) => {
    if (isUpdatingRef.current) return; // 防止循环更新
    
    if (!yamlStr.trim()) {
      isUpdatingRef.current = true;
      setJsonContent('');
      setError('');
      isUpdatingRef.current = false;
      return;
    }

    try {
      const parsed = yaml.load(yamlStr);
      const jsonStr = JSON.stringify(parsed, null, 2);
      isUpdatingRef.current = true;
      setJsonContent(jsonStr);
      setError('');
      isUpdatingRef.current = false;
    } catch (e) {
      setError('YAML 格式错误: ' + (e instanceof Error ? e.message : String(e)));
    }
  }, []);

  // 处理 JSON 输入变化
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonContent(value);
    convertJsonToYaml(value);
  };

  // 处理 YAML 输入变化
  const handleYamlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setYamlContent(value);
    convertYamlToJson(value);
  };

  // 格式化 JSON
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonContent(formatted);
      convertJsonToYaml(formatted);
    } catch (e) {
      setError('JSON 格式错误: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  // 清空
  const handleClear = () => {
    setJsonContent('');
    setYamlContent('');
    setError('');
  };

  // 复制 JSON
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonContent);
  };

  // 复制 YAML
  const handleCopyYaml = () => {
    navigator.clipboard.writeText(yamlContent);
  };

  const highlightedJson = highlightJSON(jsonContent);
  const highlightedYaml = highlightYAML(yamlContent);

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">JSON ↔ YAML 转换</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">JSON 和 YAML 格式互相转换</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFormatJson}
              disabled={!jsonContent || !!error}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              格式化 JSON
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              清空
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
      
      <div className="flex-1 p-8 space-y-6 overflow-auto">
        {/* 两列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON 输入区域 */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                JSON
              </label>
              {jsonContent && (
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <div className="relative flex-1 min-h-[400px]">
              {/* 语法高亮层 */}
              <div
                ref={jsonHighlightRef}
                className="absolute inset-0 p-6 overflow-auto font-mono text-sm whitespace-pre-wrap break-words pointer-events-none bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-300 dark:border-gray-600"
              >
                {jsonContent ? (
                  <div dangerouslySetInnerHTML={{ __html: highlightedJson }} />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <div className="text-lg font-medium">在此输入 JSON...</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 输入层 */}
              <textarea
                ref={jsonTextareaRef}
                value={jsonContent}
                onChange={handleJsonChange}
                className="absolute inset-0 w-full h-full p-6 border-0 bg-transparent text-transparent caret-blue-600 dark:caret-blue-400 font-mono text-sm resize-none focus:outline-none overflow-auto rounded-xl border border-gray-300 dark:border-gray-600"
                placeholder=""
                style={{
                  caretColor: '#2563eb',
                }}
              />
            </div>
          </div>

          {/* YAML 输入区域 */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                YAML
              </label>
              {yamlContent && (
                <button
                  onClick={handleCopyYaml}
                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <div className="relative flex-1 min-h-[400px]">
              {/* 语法高亮层 */}
              <div
                ref={yamlHighlightRef}
                className="absolute inset-0 p-6 overflow-auto font-mono text-sm whitespace-pre-wrap break-words pointer-events-none bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-300 dark:border-gray-600"
              >
                {yamlContent ? (
                  <div dangerouslySetInnerHTML={{ __html: highlightedYaml }} />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📝</div>
                      <div className="text-lg font-medium">在此输入 YAML...</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 输入层 */}
              <textarea
                ref={yamlTextareaRef}
                value={yamlContent}
                onChange={handleYamlChange}
                className="absolute inset-0 w-full h-full p-6 border-0 bg-transparent text-transparent caret-blue-600 dark:caret-blue-400 font-mono text-sm resize-none focus:outline-none overflow-auto rounded-xl border border-gray-300 dark:border-gray-600"
                placeholder=""
                style={{
                  caretColor: '#2563eb',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

