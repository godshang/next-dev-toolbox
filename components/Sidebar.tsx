'use client';

import { useState, useEffect } from 'react';
import {
  categoryOrder,
  categoryMeta,
  getToolsByCategory,
  getToolById,
  ToolCategory,
} from '@/lib/tools-registry';
import { getFavoriteTools } from '@/lib/tools-storage';
import { useI18n } from '@/lib/i18n';

interface SidebarProps {
  activeTool: string;
  onToolChange: (toolId: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  activeTool,
  onToolChange,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { t, messages, getTool } = useI18n();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<ToolCategory>>(
    () => new Set(['Misc'])
  );
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteTools());
  }, [activeTool]);

  const toggleCategory = (cat: ToolCategory) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleToolClick = (toolId: string) => {
    onToolChange(toolId);
    onMobileClose();
  };

  const favoriteTools = favoriteIds
    .map(id => getTool(id))
    .filter((tool): tool is NonNullable<typeof tool> => tool != null);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {favoriteTools.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('home.favorites')}
          </div>
          <div className="pb-2 space-y-0.5">
            {favoriteTools.map(tool => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolClick(tool.id)}
                className={`w-full cursor-pointer text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  activeTool === tool.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{tool.icon}</span>
                <span className="truncate">{tool.name}</span>
              </button>
            ))}
          </div>
          <div className="mx-3 mb-2 border-b border-gray-200 dark:border-gray-700" />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {categoryOrder.map(category => {
          const meta = categoryMeta[category];
          const catMsg = messages.categories[category];
          const isCollapsed = collapsedCategories.has(category);
          const categoryTools = getToolsByCategory(category).map(def => getTool(def.id)).filter(Boolean);

          return (
            <div key={category}>
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full cursor-pointer flex items-center gap-2 px-2 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span>{meta.icon}</span>
                <span className="flex-1 text-left">{catMsg.name}</span>
                <span className={`text-xs transition-transform ${isCollapsed ? '' : 'rotate-180'}`}>▼</span>
              </button>
              {!isCollapsed && (
                <div className="ml-1 space-y-0.5 pb-2">
                  {categoryTools.map(tool => {
                    if (!tool) return null;
                    const def = getToolById(tool.id);
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleToolClick(tool.id)}
                        className={`w-full cursor-pointer text-left pl-6 pr-2 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-all ${
                          activeTool === tool.id
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 font-medium border-l-4 border-blue-500'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <span className="w-4 text-center flex-shrink-0">{tool.icon || '📌'}</span>
                        <span className="truncate">{tool.name}</span>
                        {def?.isNew && (
                          <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-1 rounded">
                            {t('common.newBadge')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
