'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar, { tools } from '@/components/Navbar';
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
import Base64 from '@/components/tools/Base64';
import UnicodeCodec from '@/components/tools/UnicodeCodec';
import Hash from '@/components/tools/Hash';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从 URL 参数读取初始工具 ID，避免闪烁
  const getInitialTool = () => {
    const toolId = searchParams.get('tool');
    if (toolId && tools.some(t => t.id === toolId)) {
      return toolId;
    }
    return null; // 返回 null 表示显示主页
  };
  
  const [activeTool, setActiveTool] = useState<string | null>(getInitialTool);

  // 从 URL 参数读取工具 ID（用于 URL 变化时更新）
  useEffect(() => {
    const toolId = searchParams.get('tool');
    if (toolId && tools.some(t => t.id === toolId)) {
      setActiveTool(toolId);
    } else {
      setActiveTool(null); // 没有 tool 参数时显示主页
    }
  }, [searchParams]);

  // 处理工具切换，同时更新 URL
  const handleToolChange = (toolId: string) => {
    setActiveTool(toolId);
    router.push(`/?tool=${toolId}`, { scroll: false });
  };

  const renderContent = () => {
    // 如果没有选择工具，显示主页
    if (!activeTool) {
      return <HomePage />;
    }

    // 根据工具 ID 渲染对应的工具组件
    switch (activeTool) {
      case 'json-format':
        return <JsonFormat />;
      case 'json-view':
        return <JsonView />;
      case 'json-diff':
        return <JsonDiff />;
      case 'json-to-excel':
        return <JsonToExcel />;
      case 'json-yaml':
        return <JsonYamlConverter />;
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
      case 'base64':
        return <Base64 />;
      case 'unicode-codec':
        return <UnicodeCodec />;
      case 'hash':
        return <Hash />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar activeTool={activeTool || ''} onToolChange={handleToolChange} />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto" style={{ minHeight: 'calc(100vh - 8rem)' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500 dark:text-gray-400">加载中...</div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
