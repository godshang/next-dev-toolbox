'use client';

import { useState, useEffect, useCallback } from 'react';

// 将Date对象转换为 yyyy-MM-dd HH:mm:ss
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [result, setResult] = useState<{ timestamp?: number; dateTime?: string }>({});

  const handleTimestampToDate = useCallback((ts: string) => {
    const num = parseInt(ts);
    if (!isNaN(num)) {
      const date = new Date(num);
      setDateTime(formatDateTime(date));
      setResult({
        timestamp: num,
        dateTime: formatDateTime(date),
      });
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    setTimestamp(String(now));
    const localDate = new Date(now);
    setDateTime(formatDateTime(localDate));
    handleTimestampToDate(String(now));
  }, [handleTimestampToDate]);


  const handleDateToTimestamp = (dt: string) => {
    if (dt) {
      // 支持 YYYY-MM-DD HH:mm:ss 以及 YYYY-MM-DDTHH:mm:ss
      const normalized = dt.includes(' ') ? dt.replace(' ', 'T') : dt;
      const date = new Date(normalized);
      if (!isNaN(date.getTime())) {
        setResult({
          timestamp: date.getTime(),
          dateTime: formatDateTime(date),
        });
        setTimestamp(String(date.getTime()));
      }
    }
  };

  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimestamp(value);
    handleTimestampToDate(value);
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateTime(value);
    handleDateToTimestamp(value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCurrentTimestamp = () => {
    const now = Date.now();
    setTimestamp(String(now));
    handleTimestampToDate(String(now));
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">时间戳转换</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">时间戳与日期时间相互转换</p>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Timestamp (milliseconds)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={timestamp}
                  onChange={handleTimestampChange}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                  placeholder="Enter timestamp..."
                />
                <button
                  onClick={getCurrentTimestamp}
                  className="px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Now
                </button>
                {result.timestamp && (
                  <button
                    onClick={() => copyToClipboard(String(result.timestamp))}
                    className="px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Date & Time
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={dateTime}
                  onChange={handleDateTimeChange}
                  placeholder="yyyy-MM-dd HH:mm:ss"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {result.dateTime && (
                  <button
                    onClick={() => copyToClipboard(result.dateTime || '')}
                    className="px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {result.timestamp && result.dateTime && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-blue-500">📊</span>
              Result
            </h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[100px]">Timestamp:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{result.timestamp}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[100px]">Date Time:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{result.dateTime}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[100px]">ISO String:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold break-all">
                  {new Date(result.timestamp).toISOString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
