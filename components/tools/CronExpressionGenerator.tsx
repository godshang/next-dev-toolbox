'use client';

import { useState, useCallback } from 'react';
import * as parser from 'cron-parser';
import { useI18n, useToolPage } from '@/lib/i18n';

type CronType = 'linux' | 'java' | 'quartz';

interface CronResult {
  expression: string;
  nextTimes: Date[];
  error?: string;
}

// 格式化日期时间
function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 转换不同格式的 cron 表达式为标准格式（6字段，带秒）
function normalizeCronExpression(expression: string, type: CronType): string {
  const parts = expression.trim().split(/\s+/);
  
  if (type === 'linux') {
    // Linux: 5 字段 (分钟 小时 日 月 星期)
    // 转换为 6 字段 (秒 分钟 小时 日 月 星期)
    if (parts.length === 5) {
      return `0 ${expression}`;
    }
  } else if (type === 'java') {
    // Java: 6 字段 (秒 分钟 小时 日 月 星期)
    if (parts.length === 6) {
      return expression;
    }
  } else if (type === 'quartz') {
    // Quartz: 6 或 7 字段 (秒 分钟 小时 日 月 星期 [年])
    if (parts.length === 6 || parts.length === 7) {
      // 如果是 7 字段，去掉年份字段（cron-parser 不支持年份）
      if (parts.length === 7) {
        return parts.slice(0, 6).join(' ');
      }
      return expression;
    }
  }
  
  return expression;
}

// 解析 cron 表达式并获取下次执行时间
function parseCronExpression(expression: string, type: CronType): CronResult {
  try {
    const normalized = normalizeCronExpression(expression, type);
    const interval = parser.parseExpression(normalized, {
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    
    const nextTimes: Date[] = [];
    for (let i = 0; i < 10; i++) {
      try {
        const next = interval.next();
        nextTimes.push(next.toDate());
      } catch (e) {
        // 如果无法获取更多时间，跳出循环
        break;
      }
    }
    
    return {
      expression: normalized,
      nextTimes,
    };
  } catch (error) {
    return {
      expression,
      nextTimes: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export default function CronExpressionGenerator() {
  const { t: tc } = useI18n();
  const { t, tool } = useToolPage('cron');
  const [cronExpression, setCronExpression] = useState('0 0 * * *');
  const [cronType, setCronType] = useState<CronType>('linux');
  const [result, setResult] = useState<CronResult | null>(null);

  // 解析 cron 表达式
  const handleParse = useCallback(() => {
    if (!cronExpression.trim()) {
      setResult(null);
      return;
    }
    
    const parsed = parseCronExpression(cronExpression, cronType);
    setResult(parsed);
  }, [cronExpression, cronType]);

  // 输入变化时自动解析
  const handleExpressionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCronExpression(value);
    if (value.trim()) {
      const parsed = parseCronExpression(value, cronType);
      setResult(parsed);
    } else {
      setResult(null);
    }
  };


  // 复制表达式
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 清空
  const handleClear = () => {
    setCronExpression('');
    setResult(null);
  };

  // 示例表达式
  const examples: Record<CronType, string[]> = {
    linux: [
      '0 0 * * *',        // 每天午夜
      '0 */2 * * *',      // 每2小时
      '*/15 * * * *',     // 每15分钟
      '0 9 * * 1-5',      // 工作日上午9点
    ],
    java: [
      '0 0 0 * * ?',      // 每天午夜
      '0 0 */2 * * ?',    // 每2小时
      '0 */15 * * * ?',   // 每15分钟
      '0 0 9 ? * MON-FRI', // 工作日上午9点
    ],
    quartz: [
      '0 0 0 * * ?',      // 每天午夜
      '0 0 */2 * * ?',    // 每2小时
      '0 */15 * * * ?',   // 每15分钟
      '0 0 9 ? * MON-FRI', // 工作日上午9点
    ],
  };

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
              onClick={handleParse}
              disabled={!cronExpression.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {t('btnParse')}
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {tc('common.clear')}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-8 space-y-6 overflow-auto">
        {/* 输入区域 */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('labelCronType')}
              </label>
              <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                <button
                  onClick={() => {
                    setCronType('linux');
                    if (cronExpression.trim()) {
                      const parsed = parseCronExpression(cronExpression, 'linux');
                      setResult(parsed);
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    cronType === 'linux'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {t('typeLinux')}
                </button>
                <button
                  onClick={() => {
                    setCronType('java');
                    if (cronExpression.trim()) {
                      const parsed = parseCronExpression(cronExpression, 'java');
                      setResult(parsed);
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    cronType === 'java'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {t('typeJava')}
                </button>
                <button
                  onClick={() => {
                    setCronType('quartz');
                    if (cronExpression.trim()) {
                      const parsed = parseCronExpression(cronExpression, 'quartz');
                      setResult(parsed);
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    cronType === 'quartz'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {t('typeQuartz')}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('labelExpression')}
                </label>
                {cronExpression && (
                  <button
                    onClick={() => handleCopy(cronExpression)}
                    className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                  >
                    {tc('common.copy')}
                  </button>
                )}
              </div>
              <textarea
                value={cronExpression}
                onChange={handleExpressionChange}
                placeholder={cronType === 'linux' ? '0 0 * * *' : '0 0 0 * * ?'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm min-h-[100px] resize-none"
              />
            </div>

            {/* 示例表达式 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('labelExamples')}
              </label>
              <div className="flex flex-wrap gap-2">
                {examples[cronType].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCronExpression(example);
                      const parsed = parseCronExpression(example, cronType);
                      setResult(parsed);
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-mono"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 解析结果 */}
        {result && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
            {result.error ? (
              <div className="text-red-600 dark:text-red-400">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span>❌</span>
                  {t('errorTitle')}
                </h3>
                <p className="text-sm">{result.error}</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-blue-500">📅</span>
                  {t('resultTitle')}
                </h3>
                <div className="space-y-2">
                  {result.nextTimes.length > 0 ? (
                    result.nextTimes.map((date, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium w-8">
                            #{index + 1}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">
                            {formatDateTime(date)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(formatDateTime(date))}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                          {tc('common.copy')}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noTimes')}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 语法规则说明 */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-purple-500">📖</span>
            {t('rulesTitle')}
          </h3>
          
          <div className="space-y-6">
            {/* Linux Cron */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">{t('linuxTitle')}</h4>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                <div className="grid grid-cols-5 gap-2 mb-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="text-center">{t('fieldMinute')}</div>
                  <div className="text-center">{t('fieldHour')}</div>
                  <div className="text-center">{t('fieldDay')}</div>
                  <div className="text-center">{t('fieldMonth')}</div>
                  <div className="text-center">{t('fieldWeek')}</div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-gray-900 dark:text-white">
                  <div className="text-center">{t('rangeMinute')}</div>
                  <div className="text-center">{t('rangeHour')}</div>
                  <div className="text-center">{t('rangeDay')}</div>
                  <div className="text-center">{t('rangeMonth')}</div>
                  <div className="text-center">{t('rangeWeek')}</div>
                </div>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                <li>{t('specialCharsLinux')}</li>
                <li>{t('exampleDaily')}</li>
              </ul>
            </div>

            {/* Java Cron */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">{t('javaTitle')}</h4>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                <div className="grid grid-cols-6 gap-2 mb-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="text-center">{t('fieldSecond')}</div>
                  <div className="text-center">{t('fieldMinute')}</div>
                  <div className="text-center">{t('fieldHour')}</div>
                  <div className="text-center">{t('fieldDay')}</div>
                  <div className="text-center">{t('fieldMonth')}</div>
                  <div className="text-center">{t('fieldWeek')}</div>
                </div>
                <div className="grid grid-cols-6 gap-2 text-gray-900 dark:text-white">
                  <div className="text-center">{t('rangeSecond')}</div>
                  <div className="text-center">{t('rangeMinute')}</div>
                  <div className="text-center">{t('rangeHour')}</div>
                  <div className="text-center">{t('rangeDay')}</div>
                  <div className="text-center">{t('rangeMonth')}</div>
                  <div className="text-center">{t('rangeWeek')}</div>
                </div>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                <li>{t('specialCharsJava')}</li>
                <li>{t('weekNames')}</li>
                <li>{t('exampleDailyJava')}</li>
              </ul>
            </div>

            {/* Quartz Cron */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">{t('quartzTitle')}</h4>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="text-center">{t('fieldSecond')}</div>
                  <div className="text-center">{t('fieldMinute')}</div>
                  <div className="text-center">{t('fieldHour')}</div>
                  <div className="text-center">{t('fieldDay')}</div>
                  <div className="text-center">{t('fieldMonth')}</div>
                  <div className="text-center">{t('fieldWeek')}</div>
                  <div className="text-center">{t('fieldYear')}</div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-gray-900 dark:text-white">
                  <div className="text-center">{t('rangeSecond')}</div>
                  <div className="text-center">{t('rangeMinute')}</div>
                  <div className="text-center">{t('rangeHour')}</div>
                  <div className="text-center">{t('rangeDay')}</div>
                  <div className="text-center">{t('rangeMonth')}</div>
                  <div className="text-center">0-7</div>
                  <div className="text-center">{t('rangeYear')}</div>
                </div>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                <li>{t('specialCharsQuartz')}</li>
                <li>{t('weekNames')}</li>
                <li>{t('exampleWeekday')}</li>
                <li className="text-yellow-600 dark:text-yellow-400">{t('yearNote')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

