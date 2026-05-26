'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { homePath, toolPath } from '@/lib/i18n/routing';
import { addRecentTool } from '@/lib/tools-storage';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ToolSearch from '@/components/ToolSearch';
import HomePage from '@/components/HomePage';
import ToolRenderer from '@/components/ToolRenderer';

type ToolboxAppProps = {
  activeToolId: string | null;
};

export default function ToolboxApp({ activeToolId }: ToolboxAppProps) {
  const router = useRouter();
  const { locale } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleToolChange = (toolId: string) => {
    addRecentTool(toolId);
    router.push(toolPath(locale, toolId), { scroll: false });
  };

  const handleHome = () => {
    router.push(homePath(locale), { scroll: false });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header
        onSearchOpen={() => setSearchOpen(true)}
        onMenuToggle={() => setMobileSidebarOpen(prev => !prev)}
        onHome={handleHome}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          activeTool={activeToolId || ''}
          onToolChange={handleToolChange}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
            {activeToolId ? <ToolRenderer toolId={activeToolId} /> : <HomePage />}
          </div>
        </main>
      </div>
      <ToolSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleToolChange}
      />
    </div>
  );
}
