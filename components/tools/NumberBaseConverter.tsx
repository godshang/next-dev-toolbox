'use client';

import { useState, useCallback, useRef } from 'react';

// 进制类型
type Base = 2 | 8 | 10 | 16;

// 进制配置
const baseConfig: Record<Base, { name: string; prefix: string; placeholder: string }> = {
  2: { name: '二进制', prefix: '0b', placeholder: '0b1010' },
  8: { name: '八进制', prefix: '0o', placeholder: '0o12' },
  10: { name: '十进制', prefix: '', placeholder: '10' },
  16: { name: '十六进制', prefix: '0x', placeholder: '0xA' },
};

// 将字符串转换为数字（支持不同进制）
function parseNumber(value: string, fromBase: Base): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    // 检查是否有负号
    const isNegative = trimmed.startsWith('-');
    let numStr = isNegative ? trimmed.substring(1) : trimmed;

    // 移除前缀
    if (fromBase === 2 && (numStr.startsWith('0b') || numStr.startsWith('0B'))) {
      numStr = numStr.substring(2);
    } else if (fromBase === 8 && (numStr.startsWith('0o') || numStr.startsWith('0O'))) {
      numStr = numStr.substring(2);
    } else if (fromBase === 16 && (numStr.startsWith('0x') || numStr.startsWith('0X'))) {
      numStr = numStr.substring(2);
    }

    if (!numStr) return null;

    // 验证字符是否有效
    if (fromBase === 2 && !/^[01]+$/.test(numStr)) return null;
    if (fromBase === 8 && !/^[0-7]+$/.test(numStr)) return null;
    if (fromBase === 10 && !/^\d+$/.test(numStr)) return null;
    if (fromBase === 16 && !/^[0-9A-Fa-f]+$/.test(numStr)) return null;

    // 转换为十进制
    const num = parseInt(numStr, fromBase);
    if (isNaN(num)) return null;
    return isNegative ? -num : num;
  } catch {
    return null;
  }
}

// 将数字转换为指定进制的字符串
function formatNumber(num: number, toBase: Base): string {
  if (isNaN(num) || !isFinite(num)) return '';

  try {
    if (toBase === 2) {
      return num.toString(2);
    } else if (toBase === 8) {
      return num.toString(8);
    } else if (toBase === 10) {
      return num.toString(10);
    } else if (toBase === 16) {
      return num.toString(16).toUpperCase();
    }
    return '';
  } catch {
    return '';
  }
}

export default function NumberBaseConverter() {
  const [binary, setBinary] = useState('');
  const [octal, setOctal] = useState('');
  const [decimal, setDecimal] = useState('');
  const [hexadecimal, setHexadecimal] = useState('');
  const [error, setError] = useState('');
  const isUpdatingRef = useRef(false);

  // 从十进制更新所有格式
  const updateAllFormats = useCallback((num: number) => {
    if (isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const bin = formatNumber(num, 2);
    const oct = formatNumber(num, 8);
    const dec = formatNumber(num, 10);
    const hex = formatNumber(num, 16);

    // 处理负数：如果格式化的数字以负号开头，则在负号后添加前缀
    if (bin) {
      setBinary(bin.startsWith('-') ? '-0b' + bin.substring(1) : '0b' + bin);
    } else {
      setBinary('');
    }

    if (oct) {
      setOctal(oct.startsWith('-') ? '-0o' + oct.substring(1) : '0o' + oct);
    } else {
      setOctal('');
    }

    setDecimal(dec);

    if (hex) {
      setHexadecimal(hex.startsWith('-') ? '-0x' + hex.substring(1) : '0x' + hex);
    } else {
      setHexadecimal('');
    }

    setError('');
    isUpdatingRef.current = false;
  }, []);

  // 处理二进制输入
  const handleBinaryChange = (value: string) => {
    setBinary(value);
    const num = parseNumber(value, 2);
    if (num !== null) {
      updateAllFormats(num);
    } else if (value.trim()) {
      setError('无效的二进制格式（只能包含 0 和 1）');
    } else {
      setError('');
    }
  };

  // 处理八进制输入
  const handleOctalChange = (value: string) => {
    setOctal(value);
    const num = parseNumber(value, 8);
    if (num !== null) {
      updateAllFormats(num);
    } else if (value.trim()) {
      setError('无效的八进制格式（只能包含 0-7）');
    } else {
      setError('');
    }
  };

  // 处理十进制输入
  const handleDecimalChange = (value: string) => {
    setDecimal(value);
    const num = parseNumber(value, 10);
    if (num !== null) {
      updateAllFormats(num);
    } else if (value.trim()) {
      setError('无效的十进制格式');
    } else {
      setError('');
    }
  };

  // 处理十六进制输入
  const handleHexadecimalChange = (value: string) => {
    setHexadecimal(value);
    const num = parseNumber(value, 16);
    if (num !== null) {
      updateAllFormats(num);
    } else if (value.trim()) {
      setError('无效的十六进制格式（只能包含 0-9, A-F）');
    } else {
      setError('');
    }
  };

  // 清空
  const handleClear = () => {
    setBinary('');
    setOctal('');
    setDecimal('');
    setHexadecimal('');
    setError('');
  };

  // 复制
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 初始化示例
  const handleExample = () => {
    updateAllFormats(255);
  };

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">进制转换</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">二进制、八进制、十进制、十六进制互相转换</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExample}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              示例
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
        {/* 输入区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 二进制 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                二进制 (Base 2)
              </label>
              {binary && (
                <button
                  onClick={() => handleCopy(binary)}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <input
              type="text"
              value={binary}
              onChange={(e) => handleBinaryChange(e.target.value)}
              placeholder={baseConfig[2].placeholder}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
          </div>

          {/* 八进制 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                八进制 (Base 8)
              </label>
              {octal && (
                <button
                  onClick={() => handleCopy(octal)}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <input
              type="text"
              value={octal}
              onChange={(e) => handleOctalChange(e.target.value)}
              placeholder={baseConfig[8].placeholder}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
          </div>

          {/* 十进制 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                十进制 (Base 10)
              </label>
              {decimal && (
                <button
                  onClick={() => handleCopy(decimal)}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <input
              type="text"
              value={decimal}
              onChange={(e) => handleDecimalChange(e.target.value)}
              placeholder={baseConfig[10].placeholder}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
          </div>

          {/* 十六进制 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                十六进制 (Base 16)
              </label>
              {hexadecimal && (
                <button
                  onClick={() => handleCopy(hexadecimal)}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <input
              type="text"
              value={hexadecimal}
              onChange={(e) => handleHexadecimalChange(e.target.value)}
              placeholder={baseConfig[16].placeholder}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
          </div>
        </div>

        {/* 格式说明 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-blue-500">ℹ️</span>
            格式说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <p className="font-semibold mb-2">二进制 (Base 2):</p>
              <p className="font-mono text-xs">前缀: 0b 或 0B</p>
              <p className="font-mono text-xs">字符: 0, 1</p>
              <p className="font-mono text-xs">示例: 0b1010 (十进制 10)</p>
            </div>
            <div>
              <p className="font-semibold mb-2">八进制 (Base 8):</p>
              <p className="font-mono text-xs">前缀: 0o 或 0O</p>
              <p className="font-mono text-xs">字符: 0-7</p>
              <p className="font-mono text-xs">示例: 0o12 (十进制 10)</p>
            </div>
            <div>
              <p className="font-semibold mb-2">十进制 (Base 10):</p>
              <p className="font-mono text-xs">前缀: 无</p>
              <p className="font-mono text-xs">字符: 0-9, 支持负数</p>
              <p className="font-mono text-xs">示例: 10</p>
            </div>
            <div>
              <p className="font-semibold mb-2">十六进制 (Base 16):</p>
              <p className="font-mono text-xs">前缀: 0x 或 0X</p>
              <p className="font-mono text-xs">字符: 0-9, A-F (不区分大小写)</p>
              <p className="font-mono text-xs">示例: 0xA (十进制 10)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

