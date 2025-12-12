'use client';

import { useRouter } from 'next/navigation';
import { tools, ToolCategory } from './Navbar';

const categoryIcons: Record<ToolCategory, string> = {
  'JSON': '📄',
  'Converter': '🔄',
  'Generation': '✨',
  'Codec': '🔐',
  'Formatter': '🎨',
};

const categoryNames: Record<ToolCategory, string> = {
  'JSON': 'JSON',
  'Converter': '转换工具',
  'Generation': '生成工具',
  'Codec': '编解码',
  'Formatter': '格式化',
};

const categoryDescriptions: Record<ToolCategory, string> = {
  'JSON': 'JSON 数据处理和可视化工具',
  'Converter': '各种数据格式转换工具',
  'Generation': '生成唯一标识符和随机数据',
  'Codec': '编码和解码工具',
  'Formatter': '代码格式化和美化工具',
};

export default function HomePage() {
  const router = useRouter();

  const handleToolClick = (toolId: string) => {
    router.push(`/?tool=${toolId}`);
  };

  const categories: ToolCategory[] = ['JSON', 'Converter', 'Generation', 'Codec', 'Formatter'];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-xl">
          <span className="text-4xl">🛠️</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
          开发者工具集
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          为开发者提供高效、便捷的在线工具，提升开发效率
        </p>
      </div>

      {/* Tools Grid */}
      <div className="space-y-12">
        {categories.map((category) => {
          const categoryTools = tools.filter(t => t.category === category);
          
          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{categoryIcons[category]}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {categoryNames[category]}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {categoryDescriptions[category]}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className="group relative p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          点击使用
                        </p>
                      </div>
                      <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                        →
                      </div>
                    </div>
                    {/* Hover effect gradient */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-200 pointer-events-none" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="mt-20 pt-16 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            为什么选择我们？
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              快速高效
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              所有工具都在浏览器中运行，无需安装，即开即用
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              安全可靠
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              数据仅在本地处理，不会上传到服务器，保护您的隐私
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              界面精美
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              现代化的 UI 设计，支持深色模式，提供最佳体验
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

