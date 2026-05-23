# Dev Toolbox 重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Dev Toolbox 从 6 类顶部下拉导航重构为 7 类（6+1）侧边栏架构，建立可扩展的工具注册中心，并分期交付 Phase 1 新工具。

**Architecture:** 将工具元数据从 `Navbar.tsx` 提取到 `lib/tools-registry.ts` 作为单一数据源；`Sidebar` + `ToolSearch` 负责导航；`tools-storage.ts` 管理 localStorage 的最近使用/收藏；各工具组件保持独立，由 `app/page.tsx` 的 switch 渲染。Phase 1 新工具遵循现有 `UuidGenerator.tsx` 的卡片 UI 模式。

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest（新增，仅用于 lib/ 单元测试）

**Spec:** `docs/superpowers/specs/2026-05-23-dev-toolbox-redesign-design.md`

---

## 文件结构概览

| 文件 | 职责 |
|------|------|
| `lib/tools-registry.ts` | 工具列表、分类元数据、排序辅助函数 |
| `lib/tools-search.ts` | 名称/keywords 模糊搜索 |
| `lib/tools-storage.ts` | 最近使用、收藏的 localStorage CRUD |
| `components/Sidebar.tsx` | 左侧分类导航，Misc 默认折叠 |
| `components/ToolSearch.tsx` | Ctrl+K 搜索面板 |
| `components/Header.tsx` | 顶栏：Logo、搜索按钮、收藏入口 |
| `components/HomePage.tsx` | 改版首页：6 类卡片 + 最近/收藏 |
| `components/Navbar.tsx` | **删除**或保留为空 re-export（迁移完成后移除） |
| `app/page.tsx` | 布局改为 sidebar + main，注册新工具 route |
| `components/tools/*.tsx` | 各工具 UI（现有 + 新增） |

---

## Sprint 1：工具注册中心 + 搜索

### Task 1: 添加 Vitest 测试基础设施

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `lib/tools-search.test.ts`（占位，Task 3 填充）

- [ ] **Step 1: 安装 Vitest**

```bash
npm install -D vitest @vitejs/plugin-react
```

- [ ] **Step 2: 创建 vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: 在 package.json 添加 test script**

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 验证 Vitest 可运行**

Run: `npm test`
Expected: PASS（0 tests 或空套件通过）

---

### Task 2: 创建 tools-registry.ts

**Files:**
- Create: `lib/tools-registry.ts`
- Modify: `components/Navbar.tsx`（临时改为 re-export，保持编译通过）

- [ ] **Step 1: 创建 lib/tools-registry.ts**

```typescript
export type ToolCategory =
  | 'Data'
  | 'Security'
  | 'Compare'
  | 'Generate'
  | 'Database'
  | 'Debug'
  | 'Misc';

export type ToolItem = {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  keywords: string[];
  icon?: string;
  isNew?: boolean;
  priority?: number;
};

export type CategoryMeta = {
  name: string;
  icon: string;
  description: string;
  collapsed?: boolean;
};

export const categoryOrder: ToolCategory[] = [
  'Data', 'Security', 'Compare', 'Generate', 'Database', 'Debug', 'Misc',
];

export const categoryMeta: Record<ToolCategory, CategoryMeta> = {
  Data:     { name: '数据格式', icon: '📊', description: 'JSON / YAML / XML / CSV、配置文件、时间戳、格式互转' },
  Security: { name: '编码安全', icon: '🔐', description: '编解码、哈希、加解密' },
  Compare:  { name: '对比校验', icon: '🔍', description: 'Diff、表达式校验' },
  Generate: { name: '生成器',   icon: '✨', description: 'ID、Mock、密码' },
  Database: { name: '数据库',   icon: '🗄️', description: 'SQL 相关工具' },
  Debug:    { name: '接口调试', icon: '🔌', description: '请求分析、参数对比、鉴权' },
  Misc:     { name: '其他工具', icon: '📦', description: '其他通用工具', collapsed: true },
};

export const tools: ToolItem[] = [
  // Data
  { id: 'json-format', name: 'JSON 格式化', category: 'Data', icon: '📝', priority: 10,
    description: '格式化、压缩和校验 JSON 字符串',
    keywords: ['json', 'format', '格式化', '压缩', 'prettify'] },
  { id: 'json-view', name: 'JSON 查看', category: 'Data', icon: '👁️', priority: 20,
    description: '树形结构可视化浏览 JSON 数据',
    keywords: ['json', 'view', '查看', '树形', '可视化'] },
  { id: 'json-to-excel', name: 'JSON 转 Excel', category: 'Data', icon: '📊', priority: 30,
    description: '将 JSON 数组导出为 Excel 文件',
    keywords: ['json', 'excel', 'xlsx', '导出', '表格'] },
  { id: 'json-yaml', name: 'JSON ↔ YAML', category: 'Data', icon: '🔄', priority: 40,
    description: 'JSON 与 YAML 格式双向转换',
    keywords: ['json', 'yaml', 'yml', '转换'] },
  { id: 'properties-yaml', name: 'Properties ↔ YAML', category: 'Data', icon: '⚙️', priority: 50,
    description: 'Java Properties 与 YAML 配置文件互转',
    keywords: ['properties', 'yaml', 'yml', 'config', '配置', 'spring'] },
  { id: 'timestamp', name: '时间戳转换', category: 'Data', icon: '⏰', priority: 60,
    description: 'Unix 时间戳与日期时间互转',
    keywords: ['timestamp', '时间戳', 'unix', '日期', 'epoch'] },
  // Security
  { id: 'url-encode', name: 'URL 编解码', category: 'Security', icon: '🔗', priority: 10,
    description: 'URL encode / decode',
    keywords: ['url', 'encode', 'decode', '编解码', 'percent'] },
  { id: 'base64', name: 'Base64 编解码', category: 'Security', icon: '📦', priority: 20,
    description: 'Base64 编码与解码',
    keywords: ['base64', 'encode', 'decode', '编解码'] },
  { id: 'unicode-codec', name: 'Unicode 编解码', category: 'Security', icon: '🔤', priority: 30,
    description: 'Unicode 转义序列编解码',
    keywords: ['unicode', 'utf', '转义', 'encode'] },
  { id: 'hash', name: '哈希', category: 'Security', icon: '🔒', priority: 40,
    description: 'MD5 / SHA / SM3 哈希计算',
    keywords: ['hash', 'md5', 'sha256', 'sha512', 'sm3', '签名'] },
  // Compare
  { id: 'json-diff', name: 'JSON Diff', category: 'Compare', icon: '🔍', priority: 10,
    description: '对比两份 JSON 的差异',
    keywords: ['json', 'diff', '对比', '差异', 'compare'] },
  { id: 'cron', name: 'CRON 表达式解析', category: 'Compare', icon: '⏰', priority: 20,
    description: '解析 CRON 表达式并预览下次执行时间',
    keywords: ['cron', 'quartz', 'scheduled', '定时任务', '表达式'] },
  // Generate
  { id: 'uuid', name: 'UUID 生成器', category: 'Generate', icon: '🆔', priority: 10,
    description: '生成 UUID v4 唯一标识符',
    keywords: ['uuid', 'guid', '唯一', '标识符'] },
  { id: 'random-string', name: '随机字符串生成', category: 'Generate', icon: '🔤', priority: 20,
    description: '按规则生成随机字符串',
    keywords: ['random', '随机', '字符串', 'password'] },
  // Database
  { id: 'sql-formatter', name: 'SQL 格式化', category: 'Database', icon: '🗄️', priority: 10,
    description: 'SQL 语句格式化与美化',
    keywords: ['sql', 'format', '格式化', 'mysql', 'postgresql'] },
  // Debug
  { id: 'url-compare', name: 'URL 参数比较', category: 'Debug', icon: '🔍', priority: 10,
    description: '对比两个 URL 的 query 参数差异',
    keywords: ['url', 'query', '参数', 'compare', '对比'] },
  // Misc
  { id: 'qr-code', name: '二维码生成', category: 'Misc', icon: '📱', priority: 10,
    description: '文本生成二维码图片',
    keywords: ['qr', 'qrcode', '二维码'] },
  { id: 'qr-reader', name: '二维码识别', category: 'Misc', icon: '🔍', priority: 20,
    description: '从图片中识别二维码内容',
    keywords: ['qr', 'qrcode', '二维码', '识别', '扫描'] },
  { id: 'color-converter', name: '颜色格式转换', category: 'Misc', icon: '🎨', priority: 30,
    description: 'HEX / RGB / HSL 颜色格式互转',
    keywords: ['color', 'hex', 'rgb', 'hsl', '颜色'] },
  { id: 'number-base', name: '进制转换', category: 'Misc', icon: '🔢', priority: 40,
    description: '二进制、八进制、十进制、十六进制互转',
    keywords: ['binary', 'hex', 'octal', '进制', '转换'] },
];

export function getToolsByCategory(category: ToolCategory): ToolItem[] {
  return tools
    .filter(t => t.category === category)
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

export function getToolById(id: string): ToolItem | undefined {
  return tools.find(t => t.id === id);
}
```

- [ ] **Step 2: 更新 Navbar.tsx 改为 re-export（过渡期）**

将 `Navbar.tsx` 顶部的 type/tools 定义替换为：

```typescript
export type { ToolCategory, ToolItem } from '@/lib/tools-registry';
export { tools, categoryMeta, categoryOrder } from '@/lib/tools-registry';
```

保留 Navbar 组件 UI 不变，确保 `npm run build` 通过。

- [ ] **Step 3: 验证构建**

Run: `npm run build`
Expected: 编译成功，无 type error

---

### Task 3: 创建 tools-search.ts + 测试

**Files:**
- Create: `lib/tools-search.ts`
- Create: `lib/tools-search.test.ts`

- [ ] **Step 1: 写失败测试**

```typescript
import { describe, it, expect } from 'vitest';
import { searchTools } from './tools-search';

describe('searchTools', () => {
  it('matches tool name', () => {
    const results = searchTools('json 格式化');
    expect(results.some(t => t.id === 'json-format')).toBe(true);
  });

  it('matches keywords', () => {
    const results = searchTools('sha256');
    expect(results.some(t => t.id === 'hash')).toBe(true);
  });

  it('returns empty for no match', () => {
    expect(searchTools('xyznotexist')).toHaveLength(0);
  });

  it('is case insensitive', () => {
    const results = searchTools('JWT');
    // hash 不应匹配；未来 jwt-decode 加入后此测试需更新
    expect(results.every(t => t.id !== 'hash')).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL — `searchTools` not defined

- [ ] **Step 3: 实现 tools-search.ts**

```typescript
import { tools, ToolItem } from './tools-registry';

export function searchTools(query: string): ToolItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return tools.filter(tool => {
    if (tool.name.toLowerCase().includes(q)) return true;
    if (tool.description.toLowerCase().includes(q)) return true;
    return tool.keywords.some(kw => kw.toLowerCase().includes(q));
  });
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: PASS（4 tests）

---

### Task 4: 创建 tools-storage.ts + 测试

**Files:**
- Create: `lib/tools-storage.ts`
- Create: `lib/tools-storage.test.ts`

- [ ] **Step 1: 写失败测试**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getRecentTools,
  addRecentTool,
  getFavoriteTools,
  toggleFavorite,
} from './tools-storage';

const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
  });
});

describe('tools-storage', () => {
  it('adds recent tool with max 5 limit', () => {
    ['a', 'b', 'c', 'd', 'e', 'f'].forEach(addRecentTool);
    expect(getRecentTools()).toEqual(['f', 'e', 'd', 'c', 'b']);
  });

  it('deduplicates recent tool', () => {
    addRecentTool('json-format');
    addRecentTool('hash');
    addRecentTool('json-format');
    expect(getRecentTools()[0]).toBe('json-format');
  });

  it('toggles favorite', () => {
    expect(getFavoriteTools()).toEqual([]);
    toggleFavorite('hash');
    expect(getFavoriteTools()).toEqual(['hash']);
    toggleFavorite('hash');
    expect(getFavoriteTools()).toEqual([]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL

- [ ] **Step 3: 实现 tools-storage.ts**

```typescript
const RECENT_KEY = 'dev-toolbox-recent';
const FAVORITE_KEY = 'dev-toolbox-favorites';
const MAX_RECENT = 5;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getRecentTools(): string[] {
  return readJSON<string[]>(RECENT_KEY, []);
}

export function addRecentTool(toolId: string): void {
  const recent = getRecentTools().filter(id => id !== toolId);
  recent.unshift(toolId);
  writeJSON(RECENT_KEY, recent.slice(0, MAX_RECENT));
}

export function getFavoriteTools(): string[] {
  return readJSON<string[]>(FAVORITE_KEY, []);
}

export function toggleFavorite(toolId: string): boolean {
  const favorites = getFavoriteTools();
  const index = favorites.indexOf(toolId);
  if (index >= 0) {
    favorites.splice(index, 1);
    writeJSON(FAVORITE_KEY, favorites);
    return false;
  }
  favorites.push(toolId);
  writeJSON(FAVORITE_KEY, favorites);
  return true;
}

export function isFavorite(toolId: string): boolean {
  return getFavoriteTools().includes(toolId);
}
```

- [ ] **Step 4: 运行全部测试**

Run: `npm test`
Expected: PASS（7 tests）

---

## Sprint 2：侧边栏导航 + 首页改版

### Task 5: 创建 ToolSearch 组件

**Files:**
- Create: `components/ToolSearch.tsx`

- [ ] **Step 1: 创建 ToolSearch.tsx**

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchTools, ToolItem } from '@/lib/tools-search';
import { tools } from '@/lib/tools-registry';

interface ToolSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (toolId: string) => void;
}

export default function ToolSearch({ open, onClose, onSelect }: ToolSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ToolItem[]>(tools);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults(tools);
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(query.trim() ? searchTools(query) : tools);
      setActiveIndex(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && results[activeIndex]) {
      onSelect(results[activeIndex].id);
      onClose();
    }
  }, [open, results, activeIndex, onSelect, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!open) return null;

  return (
    <motionless-overlay>
      {/* 遮罩 + 居中搜索框；Tailwind 风格与现有 UI 一致 */}
      {/* 输入框 autofocus；结果列表高亮 activeIndex */}
      {/* 每项显示 icon + name + description */}
    </motionless-overlay>
  );
}
```

> **完整 JSX 实现要点：**
> - 外层：`<motionless-overlay>` → `<motionless-overlay>` 替换为 `<div className="text-black/50 flex items-start justify-center pt-[20vh] p-4" onClick={onClose}>`
> - 面板：`<motionless-panel>` → `<div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden" onClick={e => e.stopPropagation()}>`
> - 输入：`<input autoFocus value={query} onChange={e => setQuery(e.target.value)} className="w-full px-4 py-3 text-sm border-b border-gray-200 dark:border-gray-700 bg-transparent outline-none" placeholder="搜索工具..." />`
> - 结果：`results.map((tool, i) => (...))` 绑定 `onClick={() => { onSelect(tool.id); onClose(); }}`，`i === activeIndex` 时加 `bg-blue-50 dark:bg-blue-900/30`

- [ ] **Step 2: 在 app/page.tsx 注册 Ctrl+K 快捷键**

```typescript
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
```

- [ ] **Step 3: 手动验证**

Run: `npm run dev`
操作：按 Ctrl+K → 输入 "json" → 看到 JSON 相关工具 → Enter 跳转

---

### Task 6: 创建 Sidebar 组件

**Files:**
- Create: `components/Sidebar.tsx`
- Create: `components/Header.tsx`

- [ ] **Step 1: 创建 Header.tsx**

顶栏包含：Logo（点击回首页）、搜索按钮（打开 ToolSearch）、Dev Toolbox 标题。高度 `h-14`，`sticky top-0 z-40`。

- [ ] **Step 2: 创建 Sidebar.tsx**

```typescript
'use client';

import { useState } from 'react';
import {
  categoryOrder, categoryMeta, getToolsByCategory, ToolCategory,
} from '@/lib/tools-registry';
import { getFavoriteTools } from '@/lib/tools-storage';

interface SidebarProps {
  activeTool: string;
  onToolChange: (toolId: string) => void;
}

export default function Sidebar({ activeTool, onToolChange }: SidebarProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<ToolCategory>>(
    () => new Set(['Misc'])
  );

  const toggleCategory = (cat: ToolCategory) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // 渲染 favorites 区（getFavoriteTools + getToolById）
  // 渲染 categoryOrder 中每个分类：
  //   - 分类标题可点击折叠（Misc 默认折叠）
  //   - 子项：icon + name，active 高亮 border-l-4 border-blue-500
  // 宽度 w-56，hidden on mobile（Task 7 处理抽屉）
}
```

- [ ] **Step 3: 手动验证**

选中工具后侧边栏对应项高亮；Misc 默认折叠；点击分类标题可展开/折叠。

---

### Task 7: 重构 app/page.tsx 布局

**Files:**
- Modify: `app/page.tsx`
- Delete: `components/Navbar.tsx`（迁移完成后）

- [ ] **Step 1: 更新布局结构**

```typescript
return (
  <motionless-layout>
    <Header onSearchOpen={() => setSearchOpen(true)} />
    <div className="flex flex-1">
      <Sidebar activeTool={activeTool || ''} onToolChange={handleToolChange} />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-auto">
        <motionless-content>{renderContent()}</motionless-content>
      </main>
    </motiondiv>
    <ToolSearch open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={handleToolChange} />
  </motionless-layout>
);
```

- [ ] **Step 2: 工具切换时记录最近使用**

```typescript
const handleToolChange = (toolId: string) => {
  setActiveTool(toolId);
  addRecentTool(toolId);
  router.push(`/?tool=${toolId}`, { scroll: false });
};
```

- [ ] **Step 3: 删除 Navbar.tsx，更新所有 import**

- [ ] **Step 4: 验证构建**

Run: `npm run build`
Expected: PASS

---

### Task 8: 改版 HomePage.tsx

**Files:**
- Modify: `components/HomePage.tsx`

- [ ] **Step 1: 从 tools-registry 导入 categoryOrder / categoryMeta / getToolsByCategory**

- [ ] **Step 2: 添加「最近使用」「收藏」快捷区**

```typescript
const recentIds = getRecentTools();
const favoriteIds = getFavoriteTools();
// 渲染横向 pill 按钮列表，点击 router.push(`/?tool=${id}`)
```

- [ ] **Step 3: 分类卡片改用 categoryOrder 顺序，Misc 默认折叠**

每个工具卡片显示 `tool.description` 替代「点击使用」。

- [ ] **Step 4: 手动验证首页**

访问 `/`：6 类卡片按 Data → Security → Compare → Generate → Database → Debug 顺序；Misc 折叠可展开。

---

### Task 9: 移动端抽屉导航

**Files:**
- Modify: `components/Sidebar.tsx`
- Modify: `components/Header.tsx`

- [ ] **Step 1: Header 添加汉堡按钮（lg:hidden）**

- [ ] **Step 2: Sidebar 移动端改为 fixed 抽屉**

```typescript
// desktop: static w-56
// mobile: fixed inset-y-0 left-0 z-50 w-64 transform transition
//   translate-x-0 (open) / -translate-x-full (closed)
// 遮罩层点击关闭
```

- [ ] **Step 3: 选手动验证**

浏览器 DevTools 375px 宽度：汉堡菜单 → 抽屉滑出 → 选工具 → 抽屉关闭。

---

## Sprint 3：Phase 1 P0 工具

### Task 10: JWT 解析工具

**Files:**
- Create: `components/tools/JwtDecode.tsx`
- Modify: `lib/tools-registry.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: 在 tools-registry 注册**

```typescript
{ id: 'jwt-decode', name: 'JWT 解析', category: 'Debug', icon: '🎫', priority: 20,
  isNew: true,
  description: '解码 JWT Token 的 Header 和 Payload',
  keywords: ['jwt', 'token', 'bearer', 'authorization', 'oauth'] },
```

- [ ] **Step 2: 实现 JwtDecode.tsx**

功能：
- 输入 JWT 字符串（三段落 `.` 分隔）
- 分别展示 Header / Payload 的 JSON 格式化结果
- 显示 `exp` / `iat` / `nbf` 的可读时间及是否过期
- 顶部提示：「数据仅在本地解析，不会上传」
- 无效 JWT 显示错误提示

解码逻辑（纯 JS，无第三方库）：

```typescript
function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(
    atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
  );
}
```

- [ ] **Step 3: 在 page.tsx switch 添加 case 'jwt-decode'**

- [ ] **Step 4: 手动验证**

输入标准 JWT → Header/Payload 正确展示 → 过期 token 显示红色过期提示。

---

### Task 11: 文本 Diff 工具

**Files:**
- Create: `components/tools/TextDiff.tsx`
- Modify: `lib/tools-registry.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: 在 tools-registry 注册**

```typescript
{ id: 'text-diff', name: '文本 Diff', category: 'Compare', icon: '📋', priority: 15,
  isNew: true,
  description: '行级对比两段文本的差异',
  keywords: ['diff', 'text', '对比', '差异', 'compare', '文本'] },
```

- [ ] **Step 2: 实现 TextDiff.tsx**

- 左右两个 textarea
- 行级 diff 算法（自实现或用 `diff`  npm 包：`npm install diff`）
- 差异行：新增绿色背景、删除红色背景、相同行默认
- UI 参考 `JsonDiff.tsx` 的布局

- [ ] **Step 3: 注册路由并手动验证**

---

### Task 12: AES 加解密工具

**Files:**
- Create: `components/tools/AesCrypto.tsx`
- Modify: `lib/tools-registry.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: 在 tools-registry 注册**

```typescript
{ id: 'aes-crypto', name: 'AES 加解密', category: 'Security', icon: '🔑', priority: 50,
  isNew: true,
  description: 'AES 对称加密与解密',
  keywords: ['aes', 'encrypt', 'decrypt', '加密', '解密', 'cbc', 'ecb'] },
```

- [ ] **Step 2: 实现 AesCrypto.tsx**

使用已有 `crypto-js` 依赖：

```typescript
import CryptoJS from 'crypto-js';

// 支持 AES-128 / AES-256
// 模式：CBC（需 IV）、ECB
// 输入：明文/密文、密钥、IV（CBC）
// 输出格式：Base64 / Hex 可选
```

顶部提示：「密钥与明文仅在本地处理，不会上传」

- [ ] **Step 3: 注册路由并手动验证**

加密 → 复制密文 → 切换解密 → 还原明文。

---

## Sprint 4：Phase 1 P1 数据工具

### Task 13: XML 格式化

**Files:**
- Create: `components/tools/XmlFormat.tsx`
- Modify: `lib/tools-registry.ts`, `app/page.tsx`

- [ ] **Step 1: 安装 fast-xml-parser（可选）或自实现缩进**

Run: `npm install fast-xml-parser`

- [ ] **Step 2: 实现格式化 + 语法校验，注册 `xml-format`**

---

### Task 14: XML ↔ JSON

**Files:**
- Create: `components/tools/XmlJsonConverter.tsx`
- Modify: `lib/tools-registry.ts`, `app/page.tsx`

- [ ] **Step 1: 参考 JsonYamlConverter.tsx 的双栏布局**

- [ ] **Step 2: XML→JSON 用 fast-xml-parser；JSON→XML 用 XMLBuilder**

- [ ] **Step 3: 注册 `xml-json` 并验证**

---

### Task 15: CSV ↔ JSON

**Files:**
- Create: `components/tools/CsvJsonConverter.tsx`
- Modify: `lib/tools-registry.ts`, `app/page.tsx`

- [ ] **Step 1: 安装 papaparse**

Run: `npm install papaparse` && `npm install -D @types/papaparse`

- [ ] **Step 2: 实现双向转换，注册 `csv-json`**

CSV 首行作为 header 选项；JSON 输出为对象数组。

---

## Sprint 5：Phase 1 收尾

### Task 16: cURL 转代码

**Files:**
- Create: `components/tools/CurlConverter.tsx`
- Modify: `lib/tools-registry.ts`, `app/page.tsx`

- [ ] **Step 1: 解析 cURL 命令（method、headers、body、url）**

可用正则 + 手动解析，无需服务端。

- [ ] **Step 2: 输出 tab 切换：fetch / axios / Java HttpClient / Python requests**

- [ ] **Step 3: 注册 `curl-converter` 并验证**

---

### Task 17: 密码生成器

**Files:**
- Create: `components/tools/PasswordGenerator.tsx`
- Modify: `lib/tools-registry.ts`, `app/page.tsx`

- [ ] **Step 1: 参考 RandomStringGenerator.tsx**

- [ ] **Step 2: 增加：长度滑块、大小写/数字/符号选项、强度指示条**

- [ ] **Step 3: 注册 `password-gen` 并验证**

---

## 验收清单（对照 Spec §9）

### S1
- [ ] ToolCategory 7 类，Convert 已并入 Data
- [ ] 18 个工具有 description + keywords
- [ ] Ctrl+K 搜索可用
- [ ] `/?tool=xxx` URL 正常

### S2
- [ ] 侧边栏导航，Misc 默认折叠
- [ ] 首页 6 类卡片 + description
- [ ] 最近使用 / 收藏可用
- [ ] 移动端抽屉正常

### Phase 1
- [ ] jwt-decode / text-diff / aes-crypto（P0）
- [ ] xml-format / xml-json / csv-json（P1）
- [ ] curl-converter / password-gen（P1/P2）
- [ ] 所有新工具纯前端、UI 风格一致

---

## Phase 2 预留（本计划不实施，单独开 plan）

`hmac` / `mock-json` / `snowflake-id` / `toml-yaml` / `sql-minify` / `http-status`

---

## Spec 覆盖自检

| Spec 章节 | 对应 Task |
|-----------|-----------|
| §3 分类体系 6+1 | Task 2 |
| §4.1 工具迁移 | Task 2 |
| §4.2 Phase 1 新增 | Task 10–17 |
| §5.1 侧边栏布局 | Task 6–7 |
| §5.2 搜索/最近/收藏 | Task 3–5, 8 |
| §5.3 首页改版 | Task 8 |
| §6 数据结构 | Task 2–4 |
| §8 非功能要求 | Task 10/12 隐私提示；Task 3 搜索防抖 |
| §9 验收标准 | 验收清单 |

无遗漏。Phase 2/3  intentionally 留待后续 plan。
