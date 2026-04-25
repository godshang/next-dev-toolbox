'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

interface UrlParams {
  [key: string]: string;
}

interface ComparisonResult {
  same: Array<{ key: string; value: string }>;
  different: Array<{ key: string; value1: string; value2: string }>;
  onlyInUrl1: Array<{ key: string; value: string }>;
  onlyInUrl2: Array<{ key: string; value: string }>;
}

type TabType = 'same' | 'different' | 'onlyInUrl1' | 'onlyInUrl2';

export default function UrlCompare() {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('same');
  const prevUrl1Ref = useRef('');
  const prevUrl2Ref = useRef('');

  // 解析URL参数
  const parseUrlParams = (url: string): UrlParams => {
    try {
      const urlObj = new URL(url);
      const params: UrlParams = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    } catch (e) {
      // 如果不是完整URL，尝试解析查询字符串
      try {
        const params: UrlParams = {};
        const queryString = url.includes('?') ? url.split('?')[1] : url;
        if (queryString) {
          queryString.split('&').forEach((param) => {
            const [key, value = ''] = param.split('=');
            if (key) {
              params[decodeURIComponent(key)] = decodeURIComponent(value);
            }
          });
        }
        return params;
      } catch (err) {
        return {};
      }
    }
  };

  // 比较两个URL的参数
  const comparisonResult: ComparisonResult = useMemo(() => {
    if (!url1.trim() || !url2.trim()) {
      return {
        same: [],
        different: [],
        onlyInUrl1: [],
        onlyInUrl2: [],
      };
    }

    const params1 = parseUrlParams(url1);
    const params2 = parseUrlParams(url2);

    const same: Array<{ key: string; value: string }> = [];
    const different: Array<{ key: string; value1: string; value2: string }> = [];
    const onlyInUrl1: Array<{ key: string; value: string }> = [];
    const onlyInUrl2: Array<{ key: string; value: string }> = [];

    // 检查所有参数
    const allKeys = new Set([...Object.keys(params1), ...Object.keys(params2)]);

    allKeys.forEach((key) => {
      const value1 = params1[key];
      const value2 = params2[key];

      if (value1 !== undefined && value2 !== undefined) {
        if (value1 === value2) {
          same.push({ key, value: value1 });
        } else {
          different.push({ key, value1, value2 });
        }
      } else if (value1 !== undefined) {
        onlyInUrl1.push({ key, value: value1 });
      } else {
        onlyInUrl2.push({ key, value: value2 });
      }
    });

    return { same, different, onlyInUrl1, onlyInUrl2 };
  }, [url1, url2]);

  const hasResults = 
    comparisonResult.same.length > 0 ||
    comparisonResult.different.length > 0 ||
    comparisonResult.onlyInUrl1.length > 0 ||
    comparisonResult.onlyInUrl2.length > 0;

  // 定义TAB配置
  const tabs = [
    {
      id: 'same' as TabType,
      label: '相同的参数',
      icon: '✅',
      count: comparisonResult.same.length,
      color: 'green',
      hasData: comparisonResult.same.length > 0,
    },
    {
      id: 'different' as TabType,
      label: '参数值不同',
      icon: '⚠️',
      count: comparisonResult.different.length,
      color: 'yellow',
      hasData: comparisonResult.different.length > 0,
    },
    {
      id: 'onlyInUrl1' as TabType,
      label: '仅在 URL 1 中',
      icon: '🔴',
      count: comparisonResult.onlyInUrl1.length,
      color: 'red',
      hasData: comparisonResult.onlyInUrl1.length > 0,
    },
    {
      id: 'onlyInUrl2' as TabType,
      label: '仅在 URL 2 中',
      icon: '🔵',
      count: comparisonResult.onlyInUrl2.length,
      color: 'blue',
      hasData: comparisonResult.onlyInUrl2.length > 0,
    },
  ];

  // 自动切换到第一个有数据的tab（仅在当前tab没有数据时）
  useEffect(() => {
    // 检查URL是否变化
    const urlChanged = url1 !== prevUrl1Ref.current || url2 !== prevUrl2Ref.current;
    prevUrl1Ref.current = url1;
    prevUrl2Ref.current = url2;
    
    if (!hasResults) {
      return;
    }
    
    // 只在URL变化时检查是否需要切换tab
    if (!urlChanged) {
      return;
    }
    
    // 检查当前activeTab是否有数据
    const currentTabHasData = 
      (activeTab === 'same' && comparisonResult.same.length > 0) ||
      (activeTab === 'different' && comparisonResult.different.length > 0) ||
      (activeTab === 'onlyInUrl1' && comparisonResult.onlyInUrl1.length > 0) ||
      (activeTab === 'onlyInUrl2' && comparisonResult.onlyInUrl2.length > 0);
    
    // 如果当前tab没有数据，切换到第一个有数据的tab
    if (!currentTabHasData) {
      if (comparisonResult.same.length > 0) {
        setActiveTab('same');
      } else if (comparisonResult.different.length > 0) {
        setActiveTab('different');
      } else if (comparisonResult.onlyInUrl1.length > 0) {
        setActiveTab('onlyInUrl1');
      } else if (comparisonResult.onlyInUrl2.length > 0) {
        setActiveTab('onlyInUrl2');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url1, url2, comparisonResult.same.length, comparisonResult.different.length, comparisonResult.onlyInUrl1.length, comparisonResult.onlyInUrl2.length, hasResults]);

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">URL 参数比较</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">比较两个URL的参数差异</p>
      </div>
      
      <div className="p-8 space-y-6">
        {/* URL输入区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              URL 1
            </label>
            <textarea
              value={url1}
              onChange={(e) => setUrl1(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="输入第一个URL，例如：https://example.com?param1=value1&param2=value2"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              URL 2
            </label>
            <textarea
              value={url2}
              onChange={(e) => setUrl2(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="输入第二个URL，例如：https://example.com?param1=value1&param3=value3"
            />
          </div>
        </div>

        {/* 比较结果区域 */}
        {hasResults && (
          <div className="mt-8">
            {/* TAB导航 */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl mb-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={!tab.hasData}
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? tab.color === 'green'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                        : tab.color === 'yellow'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md'
                        : tab.color === 'red'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : tab.hasData
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* TAB内容区域 */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              {/* 相同的参数 */}
              {activeTab === 'same' && comparisonResult.same.length > 0 && (
                <div className="space-y-2">
                  {comparisonResult.same.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-800"
                    >
                      <div className="font-mono text-sm overflow-x-auto">
                        <div className="flex items-center min-w-max">
                          <span className="font-semibold text-green-700 dark:text-green-400 whitespace-nowrap">
                            {item.key}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 mx-2 whitespace-nowrap">=</span>
                          <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">{item.value || '(空值)'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 参数值不同的参数 */}
              {activeTab === 'different' && comparisonResult.different.length > 0 && (
                <div className="space-y-2">
                  {comparisonResult.different.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800"
                    >
                      <div className="font-mono text-sm space-y-2">
                        <div className="font-semibold text-yellow-700 dark:text-yellow-400 break-all">
                          {item.key}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <div className="flex-1 w-full sm:w-auto bg-red-50 dark:bg-red-900/20 rounded p-2 border border-red-200 dark:border-red-800 min-w-0">
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium block mb-1">URL 1:</span>
                            <div className="text-gray-700 dark:text-gray-300 overflow-x-auto">
                              <span className="whitespace-nowrap">{item.value1 || '(空值)'}</span>
                            </div>
                          </div>
                          <span className="text-gray-400 self-center">→</span>
                          <div className="flex-1 w-full sm:w-auto bg-blue-50 dark:bg-blue-900/20 rounded p-2 border border-blue-200 dark:border-blue-800 min-w-0">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium block mb-1">URL 2:</span>
                            <div className="text-gray-700 dark:text-gray-300 overflow-x-auto">
                              <span className="whitespace-nowrap">{item.value2 || '(空值)'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* URL1有但URL2没有的参数 */}
              {activeTab === 'onlyInUrl1' && comparisonResult.onlyInUrl1.length > 0 && (
                <div className="space-y-2">
                  {comparisonResult.onlyInUrl1.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-800"
                    >
                      <div className="font-mono text-sm overflow-x-auto">
                        <div className="flex items-center min-w-max">
                          <span className="font-semibold text-red-700 dark:text-red-400 whitespace-nowrap">
                            {item.key}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 mx-2 whitespace-nowrap">=</span>
                          <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">{item.value || '(空值)'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* URL2有但URL1没有的参数 */}
              {activeTab === 'onlyInUrl2' && comparisonResult.onlyInUrl2.length > 0 && (
                <div className="space-y-2">
                  {comparisonResult.onlyInUrl2.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800"
                    >
                      <div className="font-mono text-sm overflow-x-auto">
                        <div className="flex items-center min-w-max">
                          <span className="font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                            {item.key}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 mx-2 whitespace-nowrap">=</span>
                          <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">{item.value || '(空值)'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 当前TAB没有数据 */}
              {((activeTab === 'same' && comparisonResult.same.length === 0) ||
                (activeTab === 'different' && comparisonResult.different.length === 0) ||
                (activeTab === 'onlyInUrl1' && comparisonResult.onlyInUrl1.length === 0) ||
                (activeTab === 'onlyInUrl2' && comparisonResult.onlyInUrl2.length === 0)) && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-4">📭</div>
                  <p>当前分类没有数据</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 空状态提示 */}
        {!hasResults && url1.trim() && url2.trim() && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">🔍</div>
            <p>两个URL都没有参数，或无法解析参数</p>
          </div>
        )}

        {!url1.trim() || !url2.trim() ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📝</div>
            <p>请输入两个URL进行比较</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

