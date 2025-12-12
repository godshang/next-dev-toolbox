'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export type ToolCategory = 'JSON' | 'Converter' | 'Generation' | 'Codec' | 'Formatter';
export type ToolItem = {
  id: string;
  name: string;
  category: ToolCategory;
  icon?: string;
};

export const tools: ToolItem[] = [
  // JSON 工具
  { id: 'json-format', name: 'JSON 格式化', category: 'JSON', icon: '📝' },
  { id: 'json-view', name: 'JSON 查看', category: 'JSON', icon: '👁️' },
  { id: 'json-diff', name: 'JSON Diff', category: 'JSON', icon: '🔍' },
  { id: 'json-to-excel', name: 'JSON 转 Excel', category: 'JSON', icon: '📊' },
  // Converter 工具
  { id: 'timestamp', name: '时间戳转换', category: 'Converter', icon: '⏰' },
  { id: 'json-yaml', name: 'JSON ↔ YAML', category: 'Converter', icon: '🔄' },
  { id: 'properties-yaml', name: 'Properties ↔ YAML', category: 'Converter', icon: '⚙️' },
  { id: 'color-converter', name: '颜色格式转换', category: 'Converter', icon: '🎨' },
  { id: 'number-base', name: '进制转换', category: 'Converter', icon: '🔢' },
  // Formatter 工具
  { id: 'sql-formatter', name: 'SQL 格式化', category: 'Formatter', icon: '🗄️' },
  // Generation 工具
  { id: 'uuid', name: 'UUID 生成器', category: 'Generation', icon: '🆔' },
  { id: 'cron', name: 'CRON 表达式解析', category: 'Generation', icon: '⏰' },
  { id: 'random-string', name: '随机字符串生成', category: 'Generation', icon: '🔤' },
  { id: 'qr-code', name: '二维码生成', category: 'Generation', icon: '📱' },
  { id: 'qr-reader', name: '二维码识别', category: 'Generation', icon: '🔍' },
  // Codec 工具
  { id: 'url-encode', name: 'URL 编解码', category: 'Codec', icon: '🔗' },
  { id: 'base64', name: 'Base64 编解码', category: 'Codec', icon: '📦' },
  { id: 'unicode-codec', name: 'Unicode 编解码', category: 'Codec', icon: '🔤' },
];

// 分类图标映射
const categoryIcons: Record<ToolCategory, string> = {
  'JSON': '📄',
  'Converter': '🔄',
  'Generation': '✨',
  'Codec': '🔐',
  'Formatter': '🎨',
};

// 分类中文名称映射
const categoryNames: Record<ToolCategory, string> = {
  'JSON': 'JSON',
  'Converter': '转换工具',
  'Generation': '生成工具',
  'Codec': '编解码',
  'Formatter': '格式化',
};

interface NavbarProps {
  activeTool: string;
  onToolChange: (toolId: string) => void;
}

export default function Navbar({ activeTool, onToolChange }: NavbarProps) {
  const router = useRouter();
  const [expandedCategory, setExpandedCategory] = useState<ToolCategory | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const categories: ToolCategory[] = ['JSON', 'Converter', 'Generation', 'Codec', 'Formatter'];

  const toggleCategory = (category: ToolCategory) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setExpandedCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav ref={navRef} className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Dev Toolbox
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">开发者工具集</p>
            </div>
          </button>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl">
              {categories.map((category) => {
                const categoryTools = tools.filter(t => t.category === category);
                const isExpanded = expandedCategory === category;
                const hasActiveTool = categoryTools.some(t => t.id === activeTool);
                
                return (
                  <div key={category} className="relative">
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        isExpanded || hasActiveTool
                          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span className="text-base">{categoryIcons[category]}</span>
                      <span>{categoryNames[category]}</span>
                      <span className={`ml-1 inline-block transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
                        <div className="py-2">
                          {categoryTools.map((tool) => (
                            <button
                              key={tool.id}
                              onClick={() => {
                                onToolChange(tool.id);
                                setExpandedCategory(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center gap-3 ${
                                activeTool === tool.id
                                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 font-medium border-l-4 border-blue-500'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              }`}
                            >
                              <span className="text-base w-5 text-center flex-shrink-0">{tool.icon || '📌'}</span>
                              <span className="flex-1">{tool.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
