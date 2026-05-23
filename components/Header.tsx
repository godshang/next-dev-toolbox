'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  onSearchOpen: () => void;
  onMenuToggle: () => void;
}

export default function Header({ onSearchOpen, onMenuToggle }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="h-full px-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="打开菜单"
        >
          ☰
        </button>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white hidden sm:inline">Dev Toolbox</span>
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onSearchOpen}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <span>🔍</span>
          <span className="hidden sm:inline">搜索工具</span>
          <kbd className="hidden md:inline text-xs bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
            Ctrl+K
          </kbd>
        </button>
      </div>
    </header>
  );
}
