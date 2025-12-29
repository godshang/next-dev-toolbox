'use client';

import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
// @ts-ignore - sm3 库可能没有类型定义
import sm3 from 'sm3';

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' | 'SM3';

interface HashResult {
  algorithm: HashAlgorithm;
  value: string;
}

export default function Hash() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<HashResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // 将 ArrayBuffer 转换为十六进制字符串
  const arrayBufferToHex = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // 计算哈希值
  const calculateHash = async (text: string, algorithm: HashAlgorithm): Promise<string> => {
    // MD5 使用 crypto-js（同步）
    if (algorithm === 'MD5') {
      return Promise.resolve(CryptoJS.MD5(text).toString());
    }
    
    // SM3 使用 sm3 库（同步）
    if (algorithm === 'SM3') {
      return Promise.resolve(sm3(text));
    }
    
    // SHA 系列使用 Web Crypto API（异步）
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    return arrayBufferToHex(hashBuffer);
  };

  // 当输入改变时，计算所有哈希值
  useEffect(() => {
    if (!input.trim()) {
      setResults([]);
      return;
    }

    setIsCalculating(true);
    const algorithms: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'SM3'];
    
    Promise.all(
      algorithms.map(async (algorithm) => ({
        algorithm,
        value: await calculateHash(input, algorithm),
      }))
    ).then((hashResults) => {
      setResults(hashResults);
      setIsCalculating(false);
    }).catch((error) => {
      console.error('计算哈希值失败:', error);
      setIsCalculating(false);
    });
  }, [input]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getAlgorithmName = (algorithm: HashAlgorithm): string => {
    return algorithm;
  };

  const getAlgorithmDescription = (algorithm: HashAlgorithm): string => {
    const descriptions: Record<HashAlgorithm, string> = {
      'MD5': '128 位哈希值',
      'SHA-1': '160 位哈希值',
      'SHA-256': '256 位哈希值',
      'SHA-384': '384 位哈希值',
      'SHA-512': '512 位哈希值',
      'SM3': '256 位哈希值（国密算法）',
    };
    return descriptions[algorithm];
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">哈希工具</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">使用常见的哈希算法生成文本的哈希值</p>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            输入文本
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="输入要计算哈希值的文本..."
          />
        </div>

        {isCalculating && (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">计算中...</div>
          </div>
        )}

        {!isCalculating && results.length > 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              哈希结果
            </label>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.algorithm}
                  className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {getAlgorithmName(result.algorithm)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({getAlgorithmDescription(result.algorithm)})
                        </span>
                      </div>
                      <div className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                        {result.value}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.value)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex-shrink-0"
                      title="复制哈希值"
                    >
                      复制
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isCalculating && input.trim() && results.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            请输入文本以计算哈希值
          </div>
        )}
      </div>
    </div>
  );
}

