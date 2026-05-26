'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { tools } from '@/lib/tools-registry';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { addRecentTool } from '@/lib/tools-storage';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ToolSearch from '@/components/ToolSearch';
import HomePage from '@/components/HomePage';
import JsonFormat from '@/components/tools/JsonFormat';
import JsonView from '@/components/tools/JsonView';
import JsonDiff from '@/components/tools/JsonDiff';
import JsonToExcel from '@/components/tools/JsonToExcel';
import JsonYamlConverter from '@/components/tools/JsonYamlConverter';
import PropertiesYamlConverter from '@/components/tools/PropertiesYamlConverter';
import ColorConverter from '@/components/tools/ColorConverter';
import NumberBaseConverter from '@/components/tools/NumberBaseConverter';
import SqlFormatter from '@/components/tools/SqlFormatter';
import TimestampConverter from '@/components/tools/TimestampConverter';
import UuidGenerator from '@/components/tools/UuidGenerator';
import CronExpressionGenerator from '@/components/tools/CronExpressionGenerator';
import RandomStringGenerator from '@/components/tools/RandomStringGenerator';
import QrCodeGenerator from '@/components/tools/QrCodeGenerator';
import QrCodeReader from '@/components/tools/QrCodeReader';
import UrlEncode from '@/components/tools/UrlEncode';
import UrlCompare from '@/components/tools/UrlCompare';
import Base64 from '@/components/tools/Base64';
import UnicodeCodec from '@/components/tools/UnicodeCodec';
import Hash from '@/components/tools/Hash';
import JwtDecode from '@/components/tools/JwtDecode';
import TextDiff from '@/components/tools/TextDiff';
import AesCrypto from '@/components/tools/AesCrypto';
import XmlFormat from '@/components/tools/XmlFormat';
import XmlJsonConverter from '@/components/tools/XmlJsonConverter';
import CsvJsonConverter from '@/components/tools/CsvJsonConverter';
import CurlConverter from '@/components/tools/CurlConverter';
import PasswordGenerator from '@/components/tools/PasswordGenerator';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialTool = () => {
    const toolId = searchParams.get('tool');
    if (toolId && tools.some(t => t.id === toolId)) {
      return toolId;
    }
    return null;
  };

  const [activeTool, setActiveTool] = useState<string | null>(getInitialTool);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const toolId = searchParams.get('tool');
    if (toolId && tools.some(t => t.id === toolId)) {
      setActiveTool(toolId);
    } else {
      setActiveTool(null);
    }
  }, [searchParams]);

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
    setActiveTool(toolId);
    addRecentTool(toolId);
    router.push(`/?tool=${toolId}`, { scroll: false });
  };

  const renderContent = () => {
    if (!activeTool) {
      return <HomePage />;
    }

    switch (activeTool) {
      case 'json-format':
        return <JsonFormat />;
      case 'json-view':
        return <JsonView />;
      case 'json-diff':
        return <JsonDiff />;
      case 'text-diff':
        return <TextDiff />;
      case 'json-to-excel':
        return <JsonToExcel />;
      case 'json-yaml':
        return <JsonYamlConverter />;
      case 'xml-format':
        return <XmlFormat />;
      case 'xml-json':
        return <XmlJsonConverter />;
      case 'csv-json':
        return <CsvJsonConverter />;
      case 'properties-yaml':
        return <PropertiesYamlConverter />;
      case 'color-converter':
        return <ColorConverter />;
      case 'number-base':
        return <NumberBaseConverter />;
      case 'sql-formatter':
        return <SqlFormatter />;
      case 'timestamp':
        return <TimestampConverter />;
      case 'uuid':
        return <UuidGenerator />;
      case 'cron':
        return <CronExpressionGenerator />;
      case 'random-string':
        return <RandomStringGenerator />;
      case 'qr-code':
        return <QrCodeGenerator />;
      case 'qr-reader':
        return <QrCodeReader />;
      case 'url-encode':
        return <UrlEncode />;
      case 'url-compare':
        return <UrlCompare />;
      case 'base64':
        return <Base64 />;
      case 'unicode-codec':
        return <UnicodeCodec />;
      case 'hash':
        return <Hash />;
      case 'aes-crypto':
        return <AesCrypto />;
      case 'jwt-decode':
        return <JwtDecode />;
      case 'curl-converter':
        return <CurlConverter />;
      case 'password-gen':
        return <PasswordGenerator />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header
        onSearchOpen={() => setSearchOpen(true)}
        onMenuToggle={() => setMobileSidebarOpen(prev => !prev)}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          activeTool={activeTool || ''}
          onToolChange={handleToolChange}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
            {renderContent()}
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

function LoadingFallback() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <I18nProvider>
      <Suspense fallback={<LoadingFallback />}>
        <HomeContent />
      </Suspense>
    </I18nProvider>
  );
}
