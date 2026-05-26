'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import * as yaml from 'js-yaml';
import { useI18n, useToolPage } from '@/lib/i18n';

// Properties 语法高亮函数
const highlightProperties = (text: string): string => {
  if (!text.trim()) return '';
  
  let highlighted = escapeHtml(text);
  
  // 按行处理，避免跨行匹配问题
  const lines = highlighted.split('\n');
  const highlightedLines = lines.map(line => {
    const trimmed = line.trim();
    
    // 跳过空行
    if (!trimmed) {
      return line;
    }
    
    // 1. 高亮注释行
    if (trimmed.startsWith('#') || trimmed.startsWith('!')) {
      return `<span class="text-gray-500 dark:text-gray-400 italic">${line}</span>`;
    }
    
    // 2. 处理键值对
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) {
      return line; // 没有等号，保持原样
    }
    
    // 分离键和值
    const key = trimmed.substring(0, equalIndex).trim();
    const value = trimmed.substring(equalIndex + 1).trim();
    const prefix = line.substring(0, line.indexOf(trimmed)); // 保留前导空格
    
    // 高亮键名
    const highlightedKey = `<span class="text-red-600 dark:text-red-400 font-semibold">${key}</span>`;
    
    // 高亮值
    let highlightedValue = value;
    if (value) {
      // 检查是否是数字
      if (/^-?\d+\.?\d*$/.test(value)) {
        highlightedValue = `<span class="text-blue-600 dark:text-blue-400">${value}</span>`;
      }
      // 检查是否是布尔值
      else if (/^(true|false|yes|no|on|off)$/i.test(value)) {
        highlightedValue = `<span class="text-purple-600 dark:text-purple-400 font-semibold">${value}</span>`;
      }
      // 字符串值
      else {
        highlightedValue = `<span class="text-green-600 dark:text-green-400">${value}</span>`;
      }
    }
    
    return `${prefix}${highlightedKey}=${highlightedValue}`;
  });
  
  return highlightedLines.join('\n');
};

// YAML 语法高亮函数（复用）
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

// 将点分隔的键转换为嵌套对象
function propertiesToObject(properties: string): any {
  const obj: any = {};
  const lines = properties.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) {
      continue;
    }
    
    // 解析 key=value
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }
    
    const key = trimmed.substring(0, equalIndex).trim();
    const value = trimmed.substring(equalIndex + 1).trim();
    
    // 处理点分隔的键，创建嵌套对象
    const keys = key.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k]) {
        current[k] = {};
      }
      current = current[k];
    }
    
    // 设置值
    const lastKey = keys[keys.length - 1];
    
    // 尝试解析值的类型
    if (value === 'true' || value === 'True') {
      current[lastKey] = true;
    } else if (value === 'false' || value === 'False') {
      current[lastKey] = false;
    } else if (value === 'null' || value === 'Null') {
      current[lastKey] = null;
    } else if (/^-?\d+$/.test(value)) {
      current[lastKey] = parseInt(value, 10);
    } else if (/^-?\d+\.\d+$/.test(value)) {
      current[lastKey] = parseFloat(value);
    } else {
      current[lastKey] = value;
    }
  }
  
  return obj;
}

// 将嵌套对象转换为 Properties 格式
function objectToProperties(obj: any, prefix: string = ''): string {
  const lines: string[] = [];
  
  function traverse(current: any, currentPrefix: string) {
    if (current === null || current === undefined) {
      return;
    }
    
    if (typeof current === 'object' && !Array.isArray(current)) {
      for (const key in current) {
        if (Object.prototype.hasOwnProperty.call(current, key)) {
          const value = current[key];
          const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key;
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            traverse(value, fullKey);
          } else {
            // 格式化值
            let formattedValue = String(value);
            if (typeof value === 'boolean') {
              formattedValue = value ? 'true' : 'false';
            } else if (value === null) {
              formattedValue = 'null';
            }
            lines.push(`${fullKey}=${formattedValue}`);
          }
        }
      }
    }
  }
  
  traverse(obj, prefix);
  return lines.join('\n');
}

export default function PropertiesYamlConverter() {
  const { t: tc } = useI18n();
  const { t, tool } = useToolPage('properties-yaml');
  const [propertiesContent, setPropertiesContent] = useState('');
  const [yamlContent, setYamlContent] = useState('');
  const [error, setError] = useState('');
  const isUpdatingRef = useRef(false); // 防止循环更新
  const propertiesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const yamlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const propertiesHighlightRef = useRef<HTMLDivElement>(null);
  const yamlHighlightRef = useRef<HTMLDivElement>(null);

  // 同步滚动
  useEffect(() => {
    const propertiesTextarea = propertiesTextareaRef.current;
    const propertiesHighlight = propertiesHighlightRef.current;
    
    if (propertiesTextarea && propertiesHighlight) {
      const handleScroll = () => {
        propertiesHighlight.scrollTop = propertiesTextarea.scrollTop;
        propertiesHighlight.scrollLeft = propertiesTextarea.scrollLeft;
      };
      
      propertiesTextarea.addEventListener('scroll', handleScroll);
      return () => propertiesTextarea.removeEventListener('scroll', handleScroll);
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

  // Properties 转 YAML
  const convertPropertiesToYaml = useCallback((properties: string) => {
    if (isUpdatingRef.current) return; // 防止循环更新
    
    if (!properties.trim()) {
      isUpdatingRef.current = true;
      setYamlContent('');
      setError('');
      isUpdatingRef.current = false;
      return;
    }

    try {
      const obj = propertiesToObject(properties);
      const yamlStr = yaml.dump(obj, {
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
      const detail = e instanceof Error ? e.message : String(e);
      setError(`${tc('common.parseFailed')}: ${detail}`);
    }
  }, [tc]);

  // YAML 转 Properties
  const convertYamlToProperties = useCallback((yamlStr: string) => {
    if (isUpdatingRef.current) return; // 防止循环更新
    
    if (!yamlStr.trim()) {
      isUpdatingRef.current = true;
      setPropertiesContent('');
      setError('');
      isUpdatingRef.current = false;
      return;
    }

    try {
      const parsed = yaml.load(yamlStr);
      const propertiesStr = objectToProperties(parsed);
      isUpdatingRef.current = true;
      setPropertiesContent(propertiesStr);
      setError('');
      isUpdatingRef.current = false;
    } catch (e) {
      setError(tc('common.yamlFormatError', { detail: e instanceof Error ? e.message : String(e) }));
    }
  }, [tc]);

  // 处理 Properties 输入变化
  const handlePropertiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPropertiesContent(value);
    convertPropertiesToYaml(value);
  };

  // 处理 YAML 输入变化
  const handleYamlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setYamlContent(value);
    convertYamlToProperties(value);
  };

  // 清空
  const handleClear = () => {
    setPropertiesContent('');
    setYamlContent('');
    setError('');
  };

  // 复制 Properties
  const handleCopyProperties = () => {
    navigator.clipboard.writeText(propertiesContent);
  };

  // 复制 YAML
  const handleCopyYaml = () => {
    navigator.clipboard.writeText(yamlContent);
  };

  const highlightedProperties = highlightProperties(propertiesContent);
  const highlightedYaml = highlightYAML(yamlContent);

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool?.name ?? ''}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {tc('common.clear')}
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
          {/* Properties 输入区域 */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('labelProperties')}
              </label>
              {propertiesContent && (
                <button
                  onClick={handleCopyProperties}
                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  {tc('common.copy')}
                </button>
              )}
            </div>
            <div className="relative flex-1 min-h-[400px]">
              {/* 语法高亮层 */}
              <div
                ref={propertiesHighlightRef}
                className="absolute inset-0 p-6 overflow-auto font-mono text-sm whitespace-pre-wrap break-words pointer-events-none bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-300 dark:border-gray-600"
              >
                {propertiesContent ? (
                  <div dangerouslySetInnerHTML={{ __html: highlightedProperties }} />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-2">⚙️</div>
                      <div className="text-lg font-medium">{t('emptyProperties')}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 输入层 */}
              <textarea
                ref={propertiesTextareaRef}
                value={propertiesContent}
                onChange={handlePropertiesChange}
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
                {t('labelYaml')}
              </label>
              {yamlContent && (
                <button
                  onClick={handleCopyYaml}
                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  {tc('common.copy')}
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
                      <div className="text-lg font-medium">{t('emptyYaml')}</div>
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

