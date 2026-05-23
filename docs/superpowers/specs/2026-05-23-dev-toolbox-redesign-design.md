# Dev Toolbox 重构设计规格

**日期：** 2026-05-23  
**状态：** 已确认  
**范围：** 工具分类重组、导航改版、Phase 1–3 新功能规划

---

## 1. 背景与目标

Dev Toolbox 是一个面向开发者的在线工具网站，基于 Next.js 16 + React 19，所有工具在浏览器本地运行，数据不上传服务器。

当前已有 18 个工具，按 6 类组织（JSON / Converter / Generation / Codec / Formatter / Crypto）。随着工具数量增长，现有分类存在语义重叠、分布不均、导航扩展性差等问题。

### 1.1 设计决策（已确认）

| 决策项 | 选择 |
|--------|------|
| 目标用户 | 全栈 / 后端开发者 |
| 产品定位 | 通用后端工具箱，语言无关 |
| Java/Spring 强调 | 不做专门 branding，自然覆盖即可 |
| 对比类分类命名 | **对比校验**（ID: `Compare`） |
| 数据类合并 | 原 `Convert`（数据转换）并入 `Data`（数据格式） |
| 分类排序 | `Database` 置于 `Generate` 之后；`Debug` 置于倒数第二（`Misc` 之前） |

### 1.2 目标

1. 重组工具分类，按开发者任务场景组织
2. 改版导航为侧边栏 + 全局搜索
3. 规划并分期落地新工具
4. 建立可扩展的工具注册数据结构

---

## 2. 产品定位

**Slogan：** 后端开发者在线工具箱 —— 本地运行，数据不上传

**核心价值：**

- 覆盖后端日常链路：数据格式与转换 → 加解密 → 对比校验 → 生成器 → SQL → 接口联调
- 纯前端本地处理，保护隐私
- 通用后端定位，不绑定特定语言或框架

**明确不做：**

- 用户账号 / 云同步
- 需要服务端的功能（WebSocket 测试、在线 API 代理）
- Java 专属首页区块或 Spring 品牌元素
- 工具使用统计上报（除非后续单独决策）

---

## 3. 工具分类体系（6+1）

**侧边栏 / 首页展示顺序（自上而下）：**

| 序号 | ID | 中文名 | 说明 | 默认状态 |
|------|----|--------|------|----------|
| 1 | `Data` | 数据格式 | 格式化、查看、导出及格式互转（含 Properties、时间戳等） | 展开 |
| 2 | `Security` | 编码安全 | 编解码、哈希、加解密 | 展开 |
| 3 | `Compare` | 对比校验 | Diff、表达式校验 | 展开 |
| 4 | `Generate` | 生成器 | ID、Mock、密码 | 展开 |
| 5 | `Database` | 数据库 | SQL 相关 | 展开 |
| 6 | `Debug` | 接口调试 | 请求分析、参数对比、鉴权 | 展开 |
| 7 | `Misc` | 其他工具 | 低频通用工具 | **默认折叠** |

> `Database` 排在 `Generate` 之后：SQL 工具使用频次相对低于数据/安全/生成类，但仍保持独立分类便于扩展。  
> `Debug` 排在 `Misc` 之前（倒数第二）：接口调试类工具使用频次相对较低。

---

## 4. 工具清单

### 4.1 现有工具迁移（18 个）

| 工具 ID | 名称 | 现分类 | 新分类 | 备注 |
|---------|------|--------|--------|------|
| `json-format` | JSON 格式化 | JSON | Data | — |
| `json-view` | JSON 查看 | JSON | Data | — |
| `json-diff` | JSON Diff | JSON | Compare | 从 JSON 类移出 |
| `json-to-excel` | JSON 转 Excel | JSON | Data | — |
| `json-yaml` | JSON ↔ YAML | Converter | Data | — |
| `properties-yaml` | Properties ↔ YAML | Converter | Data | 并入数据格式 |
| `timestamp` | 时间戳转换 | Converter | Data | 并入数据格式 |
| `sql-formatter` | SQL 格式化 | Formatter | Database | — |
| `url-encode` | URL 编解码 | Codec | Security | — |
| `url-compare` | URL 参数比较 | Codec | Debug | — |
| `base64` | Base64 编解码 | Codec | Security | — |
| `unicode-codec` | Unicode 编解码 | Codec | Security | — |
| `hash` | 哈希 | Crypto | Security | — |
| `uuid` | UUID 生成器 | Generation | Generate | — |
| `random-string` | 随机字符串 | Generation | Generate | — |
| `cron` | CRON 表达式解析 | Generation | Compare | 从 Generation 移出 |
| `qr-code` | 二维码生成 | Generation | Misc | 降级展示 |
| `qr-reader` | 二维码识别 | Generation | Misc | 降级展示 |
| `color-converter` | 颜色格式转换 | Converter | Misc | 降级展示 |
| `number-base` | 进制转换 | Converter | Misc | 降级展示 |

### 4.2 Phase 1 新增（8 个）

| 工具 ID | 名称 | 分类 | 说明 | 优先级 |
|---------|------|------|------|--------|
| `jwt-decode` | JWT 解析 | Debug | Header/Payload/Signature 解码，过期检查 | P0 |
| `text-diff` | 文本 Diff | Compare | 行级对比，配置/响应体对比 | P0 |
| `aes-crypto` | AES 加解密 | Security | AES-128/256，ECB/CBC | P0 |
| `xml-format` | XML 格式化 | Data | 缩进美化、语法校验 | P1 |
| `xml-json` | XML ↔ JSON | Data | 与 JSON 工具链打通 | P1 |
| `curl-converter` | cURL 转代码 | Debug | 输出 fetch / axios / HttpClient 等 | P1 |
| `csv-json` | CSV ↔ JSON | Data | 与 JSON 转 Excel 互补 | P1 |
| `password-gen` | 密码生成器 | Generate | 长度、字符集、强度提示 | P2 |

### 4.3 Phase 2 新增（6 个）

| 工具 ID | 名称 | 分类 |
|---------|------|------|
| `hmac` | HMAC 签名 | Security |
| `mock-json` | Mock JSON 生成 | Generate |
| `snowflake-id` | 雪花 ID / ULID | Generate |
| `toml-yaml` | TOML ↔ YAML | Data |
| `sql-minify` | SQL 压缩 | Database |
| `http-status` | HTTP 状态码查询 | Debug |

### 4.4 Phase 3（按需）

正则测试、Markdown 预览、IP 子网计算、.env 解析、日志高亮等，根据使用反馈排期。

---

## 5. 导航与菜单设计

### 5.1 布局：左侧边栏 + 内容区

```
┌──────────────────────────────────────────────────────────┐
│  [D] Dev Toolbox          🔍 搜索 (Ctrl+K)    ⭐  🌙     │
├─────────────┬────────────────────────────────────────────┤
│             │                                            │
│  数据格式    │                                            │
│   JSON 格式化│         ┌─────────────────────┐           │
│   时间戳     │         │                     │           │
│   ...       │         │    工具工作区          │           │
│             │         │                     │           │
│  编码安全    │         └─────────────────────┘           │
│  对比校验    │                                            │
│  生成器      │                                            │
│  数据库      │  ← Generate 之后                          │
│             │                                            │
│  接口调试    │  ← 倒数第二                               │
│   JWT 解析   │                                            │
│   URL 比较   │                                            │
│             │                                            │
│  ─────────  │                                            │
│  其他工具 ▸  │  ← 默认折叠：二维码、颜色、进制              │
│             │                                            │
└─────────────┴────────────────────────────────────────────┘
```

### 5.2 导航功能

| 功能 | 实现方式 |
|------|----------|
| 全局搜索 | 名称 + keywords 模糊匹配，Ctrl+K 唤起 |
| 最近使用 | localStorage，最多 5 条 |
| 收藏 | localStorage，侧边栏顶部展示 |
| 路由 | 保持 `/?tool=xxx`，兼容现有链接 |
| 移动端 | 侧边栏改为汉堡菜单 + 抽屉 |
| 新工具标记 | `isNew: true` 显示角标 |

### 5.3 首页改版

- Hero 区域保留
- 下方改为 6 类卡片网格（Misc 默认折叠）
- 每张卡片显示：名称 + 一行 description（替代「点击使用」）
- 增加「最近使用」「收藏」快捷区

### 5.4 搜索关键词示例

| 工具 | keywords |
|------|----------|
| JWT 解析 | jwt, token, bearer, authorization |
| Properties ↔ YAML | properties, yaml, yml, config |
| CRON 表达式解析 | cron, quartz, scheduled, 定时任务 |
| 哈希 | md5, sha256, sha512, sm3, 签名 |
| JSON Diff | json, diff, 对比, 差异 |

---

## 6. 数据结构与代码组织

### 6.1 类型定义

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
  priority?: number; // 类内排序，越小越靠前
};

export type CategoryMeta = {
  name: string;
  icon: string;
  description: string;
  collapsed?: boolean;
};

// 侧边栏 / 首页展示顺序
export const categoryOrder: ToolCategory[] = [
  'Data', 'Security', 'Compare', 'Generate', 'Database', 'Debug', 'Misc',
];

export const categoryMeta: Record<ToolCategory, CategoryMeta> = {
  Data:        { name: '数据格式', icon: '📊', description: 'JSON / YAML / XML / CSV、配置文件、时间戳、格式互转' },
  Security:    { name: '编码安全', icon: '🔐', description: '编解码、哈希、加解密' },
  Compare:     { name: '对比校验', icon: '🔍', description: 'Diff、表达式校验' },
  Generate:    { name: '生成器',   icon: '✨', description: 'ID、Mock、密码' },
  Database:    { name: '数据库',   icon: '🗄️', description: 'SQL 相关工具' },
  Debug:       { name: '接口调试', icon: '🔌', description: '请求分析、参数对比、鉴权' },
  Misc:        { name: '其他工具', icon: '📦', description: '其他通用工具', collapsed: true },
};
```

### 6.2 文件结构

```
lib/
  tools-registry.ts    # tools 数组 + categoryMeta
  tools-search.ts      # 搜索逻辑
  tools-storage.ts     # 最近使用 / 收藏（localStorage）
components/
  Sidebar.tsx          # 替代 Navbar 下拉导航
  ToolSearch.tsx       # Ctrl+K 搜索面板
  HomePage.tsx         # 改版首页
  tools/               # 各工具组件（现有结构保留）
app/
  page.tsx             # 路由与工具渲染（更新 import）
```

### 6.3 迁移策略

1. 从 `Navbar.tsx` 提取 `tools` 数组到 `lib/tools-registry.ts`
2. 为每个现有工具补充 `description` 和 `keywords`
3. 更新 `ToolCategory` 类型及所有引用
4. 新建 `Sidebar.tsx`，逐步替换 `Navbar.tsx` 的下拉导航
5. 保持 `/?tool=xxx` 路由不变

---

## 7. 实施阶段

| Sprint | 内容 | 产出 |
|--------|------|------|
| **S1** | 数据结构重构 + 分类迁移 + 搜索 | 18 个工具归入新分类，Ctrl+K 搜索可用 |
| **S2** | 侧边栏布局 + 首页改版 + 最近/收藏 | 新导航上线 |
| **S3** | JWT 解析 + 文本 Diff + AES 加解密 | 3 个 P0 工具 |
| **S4** | XML 格式化 + XML↔JSON + CSV↔JSON | 数据格式链补全 |
| **S5** | cURL 转换 + 密码生成器 | Phase 1 收尾 |
| **S6+** | Phase 2 工具按需迭代 | — |

S1 与 S2 可部分并行：先完成数据迁移，再改 UI。

---

## 8. 非功能要求

| 项 | 要求 |
|----|------|
| 隐私 | 继续纯前端处理；JWT、AES 等敏感工具显示「数据不上传」提示 |
| 性能 | 搜索防抖 200ms；大文本 Diff 后续考虑 Web Worker |
| 兼容性 | 旧 `/?tool=xxx` URL 不失效 |
| 无障碍 | 搜索框、侧边栏支持键盘导航 |
| 深色模式 | 新组件延续现有 dark mode 支持 |

---

## 9. 验收标准

### S1 完成标准

- [ ] `ToolCategory` 更新为 7 类（6 展开 + Misc 折叠），`Convert` 已并入 `Data`
- [ ] 所有现有工具有 `description` 和 `keywords`
- [ ] Ctrl+K 搜索可按名称和关键词找到工具
- [ ] 现有 URL 链接正常工作

### S2 完成标准

- [ ] 左侧边栏导航可用，Misc 默认折叠
- [ ] 首页展示新分类卡片和 description
- [ ] 最近使用、收藏功能可用
- [ ] 移动端抽屉导航正常

### Phase 1 工具完成标准

- [ ] 每个新工具在对应分类下可访问
- [ ] 纯前端运行，无服务端依赖
- [ ] 与现有工具 UI 风格一致

---

## 10. 附录：分类与工具速查

```
数据格式 (Data)
  ├── JSON 格式化 ✓
  ├── JSON 查看 ✓
  ├── JSON 转 Excel ✓
  ├── JSON ↔ YAML ✓
  ├── Properties ↔ YAML ✓
  ├── 时间戳转换 ✓
  ├── XML 格式化 (P1)
  ├── XML ↔ JSON (P1)
  ├── CSV ↔ JSON (P1)
  └── TOML ↔ YAML (P2)

编码安全 (Security)
  ├── URL 编解码 ✓
  ├── Base64 编解码 ✓
  ├── Unicode 编解码 ✓
  ├── 哈希 ✓
  ├── AES 加解密 (P0)
  └── HMAC 签名 (P2)

对比校验 (Compare)
  ├── JSON Diff ✓
  ├── 文本 Diff (P0)
  └── CRON 表达式解析 ✓

生成器 (Generate)
  ├── UUID 生成器 ✓
  ├── 随机字符串 ✓
  ├── 密码生成器 (P2)
  ├── Mock JSON 生成 (P2)
  └── 雪花 ID / ULID (P2)

数据库 (Database)
  ├── SQL 格式化 ✓
  └── SQL 压缩 (P2)

接口调试 (Debug)
  ├── URL 参数比较 ✓
  ├── JWT 解析 (P0)
  └── cURL 转代码 (P1)

其他工具 (Misc) [折叠]
  ├── 二维码生成 ✓
  ├── 二维码识别 ✓
  ├── 颜色格式转换 ✓
  └── 进制转换 ✓
```

✓ = 已有　(Px) = 计划新增优先级
