'use client';

import { useState } from 'react';
import { useI18n, useToolPage } from '@/lib/i18n';

export default function UnicodeCodec() {
  const { t: tc } = useI18n();
  const { t, tool } = useToolPage('unicode-codec');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [format, setFormat] = useState<'escape' | 'unicode' | 'decimal'>('escape');

  // Unicode 编码
  const encodeUnicode = (text: string, targetFormat?: 'escape' | 'unicode' | 'decimal'): string => {
    const useFormat = targetFormat || format;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (useFormat === 'escape') {
        // \uXXXX 格式
        result += `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
      } else if (useFormat === 'unicode') {
        // U+XXXX 格式
        result += `U+${code.toString(16).toUpperCase().padStart(4, '0')} `;
      } else {
        // 十进制格式
        result += `${code} `;
      }
    }
    return result.trim();
  };

  // Unicode 解码
  const decodeUnicode = (text: string, sourceFormat?: 'escape' | 'unicode' | 'decimal'): string => {
    try {
      if (!text.trim()) return '';
      
      const useFormat = sourceFormat || format;
      let result = '';
      
      if (useFormat === 'escape') {
        // 处理 \uXXXX 格式
        const regex = /\\u([0-9a-fA-F]{4})/g;
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          // 添加匹配前的普通文本
          if (match.index > lastIndex) {
            result += text.substring(lastIndex, match.index);
          }
          // 添加解码后的字符
          const codePoint = parseInt(match[1], 16);
          if (codePoint >= 0 && codePoint <= 0xFFFF) {
            result += String.fromCharCode(codePoint);
          } else if (codePoint > 0xFFFF && codePoint <= 0x10FFFF) {
            // 处理大于 0xFFFF 的码点（代理对）
            const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
            const low = ((codePoint - 0x10000) % 0x400) + 0xDC00;
            result += String.fromCharCode(high, low);
          }
          lastIndex = regex.lastIndex;
        }
        
        // 添加剩余的文本
        if (lastIndex < text.length) {
          result += text.substring(lastIndex);
        }
        
        // 如果没有匹配到任何 \uXXXX，尝试解析纯十六进制数字
        if (result === text) {
          const hexMatches = text.match(/\b[0-9a-fA-F]{4}\b/gi);
          if (hexMatches && hexMatches.length > 0) {
            result = hexMatches.map(hex => {
              const codePoint = parseInt(hex, 16);
              if (codePoint >= 0 && codePoint <= 0xFFFF) {
                return String.fromCharCode(codePoint);
              } else if (codePoint > 0xFFFF && codePoint <= 0x10FFFF) {
                const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
                const low = ((codePoint - 0x10000) % 0x400) + 0xDC00;
                return String.fromCharCode(high, low);
              }
              return '';
            }).join('');
          }
        }
      } else if (useFormat === 'unicode') {
        // 处理 U+XXXX 格式
        const regex = /U\+([0-9a-fA-F]{1,6})/gi;
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          // 添加匹配前的普通文本
          if (match.index > lastIndex) {
            result += text.substring(lastIndex, match.index);
          }
          // 添加解码后的字符
          const codePoint = parseInt(match[1], 16);
          if (codePoint >= 0 && codePoint <= 0xFFFF) {
            result += String.fromCharCode(codePoint);
          } else if (codePoint > 0xFFFF && codePoint <= 0x10FFFF) {
            // 处理大于 0xFFFF 的码点（代理对）
            const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
            const low = ((codePoint - 0x10000) % 0x400) + 0xDC00;
            result += String.fromCharCode(high, low);
          }
          lastIndex = regex.lastIndex;
        }
        
        // 添加剩余的文本
        if (lastIndex < text.length) {
          result += text.substring(lastIndex);
        }
        
        // 如果没有匹配到任何 U+XXXX，尝试解析纯十六进制数字
        if (result === text) {
          const hexMatches = text.match(/\b[0-9a-fA-F]{4}\b/gi);
          if (hexMatches && hexMatches.length > 0) {
            result = hexMatches.map(hex => {
              const codePoint = parseInt(hex, 16);
              if (codePoint >= 0 && codePoint <= 0xFFFF) {
                return String.fromCharCode(codePoint);
              } else if (codePoint > 0xFFFF && codePoint <= 0x10FFFF) {
                const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
                const low = ((codePoint - 0x10000) % 0x400) + 0xDC00;
                return String.fromCharCode(high, low);
              }
              return '';
            }).join('');
          }
        }
      } else {
        // 处理十进制格式
        const numbers = text.match(/\b\d+\b/g);
        if (numbers && numbers.length > 0) {
          result = numbers.map(num => {
            const codePoint = parseInt(num, 10);
            if (codePoint >= 0 && codePoint <= 0xFFFF) {
              return String.fromCharCode(codePoint);
            } else if (codePoint > 0xFFFF && codePoint <= 0x10FFFF) {
              const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
              const low = ((codePoint - 0x10000) % 0x400) + 0xDC00;
              return String.fromCharCode(high, low);
            }
            return '';
          }).join('');
        } else {
          result = text;
        }
      }
      
      return result;
    } catch (e) {
      return '';
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (mode === 'encode') {
      setOutput(encodeUnicode(value));
    } else {
      setOutput(decodeUnicode(value));
    }
  };

  const handleFormatChange = (newFormat: 'escape' | 'unicode' | 'decimal') => {
    setFormat(newFormat);
    // 切换格式时，根据当前模式重新处理
    if (mode === 'encode') {
      // 编码模式：用新格式重新编码输入文本
      setOutput(encodeUnicode(input, newFormat));
    } else {
      // 解码模式：用新格式来解析输入内容
      setOutput(decodeUnicode(input, newFormat));
    }
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    // 切换模式时清空输入和输出
    setInput('');
    setOutput('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool?.name ?? ''}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearAll}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {tc('common.clear')}
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!output}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {t('btnCopyResult')}
            </button>
          </div>
        </div>

        {/* 模式切换 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('labelMode')}</span>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => handleModeChange('encode')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  mode === 'encode'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tc('common.encode')}
              </button>
              <button
                onClick={() => handleModeChange('decode')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  mode === 'decode'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tc('common.decode')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('labelFormat')}</span>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => handleFormatChange('escape')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  format === 'escape'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                \uXXXX
              </button>
              <button
                onClick={() => handleFormatChange('unicode')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  format === 'unicode'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                U+XXXX
              </button>
              <button
                onClick={() => handleFormatChange('decimal')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  format === 'decimal'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {t('formatDecimal')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              {mode === 'encode' ? t('labelInputEncode') : t('labelInputDecode')}
            </label>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={
                mode === 'encode'
                  ? t('placeholderEncode')
                  : format === 'escape'
                  ? t('placeholderDecodeEscape')
                  : format === 'unicode'
                  ? t('placeholderDecodeUnicode')
                  : t('placeholderDecodeDecimal')
              }
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              {mode === 'encode' ? t('labelOutputEncode') : t('labelOutputDecode')}
            </label>
            <textarea
              value={output}
              readOnly
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none"
              placeholder={t('placeholderResult')}
            />
          </div>
        </div>

        {/* 示例说明 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">{t('formatHelpTitle')}</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li><strong>\uXXXX</strong>: {t('formatHelpEscape')}</li>
            <li><strong>U+XXXX</strong>: {t('formatHelpUnicode')}</li>
            <li><strong>{t('formatDecimal')}</strong>: {t('formatHelpDecimal')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

