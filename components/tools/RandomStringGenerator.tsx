'use client';

import { useState, useCallback } from 'react';

// 生成随机字符串
function generateRandomString(
  length: number,
  includeNumbers: boolean,
  includeUppercase: boolean,
  includeLowercase: boolean
): string {
  let charset = '';
  
  if (includeNumbers) {
    charset += '0123456789';
  }
  if (includeUppercase) {
    charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  if (includeLowercase) {
    charset += 'abcdefghijklmnopqrstuvwxyz';
  }
  
  // 如果所有选项都关闭，默认使用小写字母
  if (!charset) {
    charset = 'abcdefghijklmnopqrstuvwxyz';
  }
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return result;
}

export default function RandomStringGenerator() {
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(10);
  const [generatedStrings, setGeneratedStrings] = useState<string[]>([]);

  // 生成随机字符串
  const handleGenerate = useCallback(() => {
    if (!includeNumbers && !includeUppercase && !includeLowercase) {
      return;
    }
    
    const strings: string[] = [];
    for (let i = 0; i < count; i++) {
      strings.push(generateRandomString(length, includeNumbers, includeUppercase, includeLowercase));
    }
    setGeneratedStrings(strings);
  }, [includeNumbers, includeUppercase, includeLowercase, length, count]);

  // 复制单个字符串
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 复制所有字符串
  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedStrings.join('\n'));
  };

  // 清空
  const handleClear = () => {
    setGeneratedStrings([]);
  };

  // 验证选项
  const isValid = includeNumbers || includeUppercase || includeLowercase;

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">随机字符串生成器</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">生成符合要求的随机字符串</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={!isValid}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              生成
            </button>
            {generatedStrings.length > 0 && (
              <>
                <button
                  onClick={handleCopyAll}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  复制全部
                </button>
                <button
                  onClick={handleClear}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  清空
                </button>
              </>
            )}
          </div>
        </div>
        {!isValid && (
          <div className="mt-4 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm flex items-center gap-2">
            <span className="text-yellow-500">⚠</span>
            请至少选择一种字符类型（数字、大写字母、小写字母）
          </div>
        )}
      </div>
      
      <div className="flex-1 p-8 space-y-6 overflow-auto">
        {/* 配置选项 */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">生成选项</h3>
          
          <div className="space-y-5">
            {/* 字符类型选项 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                包含字符类型
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">数字 (0-9)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">大写字母 (A-Z)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">小写字母 (a-z)</span>
                </label>
              </div>
            </div>

            {/* 字符串长度 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                字符串长度: <span className="text-blue-600 dark:text-blue-400 font-mono">{length}</span>
              </label>
              <input
                type="range"
                min="1"
                max="256"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(length / 256) * 100}%, #e5e7eb ${(length / 256) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1</span>
                <span>128</span>
                <span>256</span>
              </div>
            </div>

            {/* 生成个数 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                生成个数: <span className="text-blue-600 dark:text-blue-400 font-mono">{count}</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(count / 100) * 100}%, #e5e7eb ${(count / 100) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 生成结果 */}
        {generatedStrings.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-blue-500">✨</span>
                生成结果 ({generatedStrings.length} 个)
              </h3>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {generatedStrings.map((str, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium w-8 flex-shrink-0">
                      #{index + 1}
                    </span>
                    <code className="text-blue-600 dark:text-blue-400 font-mono text-sm break-all flex-1">
                      {str}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopy(str)}
                    className="ml-3 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex-shrink-0"
                  >
                    复制
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-purple-500">ℹ️</span>
            使用说明
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>选择要包含的字符类型（数字、大写字母、小写字母）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>设置字符串长度（1-256 个字符）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>设置生成个数（1-100 个）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>点击"生成"按钮生成随机字符串</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>可以单独复制每个字符串，或使用"复制全部"一次性复制所有结果</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

