'use client';

import { useState } from 'react';

export default function UrlEncode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleInputChange = (value: string) => {
    setInput(value);
    if (mode === 'encode') {
      setOutput(encodeURIComponent(value));
    } else {
      try {
        setOutput(decodeURIComponent(value));
      } catch (e) {
        setOutput('');
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">URL 编解码</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">URL 编码与解码工具</p>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="flex gap-3 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl">
          <button
            onClick={() => {
              setMode('encode');
              setInput('');
              setOutput('');
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
              mode === 'encode'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => {
              setMode('decode');
              setInput('');
              setOutput('');
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
              mode === 'decode'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Decode
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Input
            </label>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter encoded text to decode...'}
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Output
              </label>
              <button
                onClick={copyToClipboard}
                disabled={!output}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Copy
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none"
              placeholder="Result will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
