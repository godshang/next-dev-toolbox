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
  { id: 'xml-format', name: 'XML 格式化', category: 'Data', icon: '📄', priority: 42, isNew: true,
    description: 'XML 缩进美化与压缩',
    keywords: ['xml', 'format', '格式化', '美化', '压缩'] },
  { id: 'xml-json', name: 'XML ↔ JSON', category: 'Data', icon: '🔀', priority: 43, isNew: true,
    description: 'XML 与 JSON 格式双向转换',
    keywords: ['xml', 'json', '转换'] },
  { id: 'csv-json', name: 'CSV ↔ JSON', category: 'Data', icon: '📋', priority: 44, isNew: true,
    description: 'CSV 与 JSON 格式双向转换',
    keywords: ['csv', 'json', '转换', '表格'] },
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
  { id: 'aes-crypto', name: 'AES 加解密', category: 'Security', icon: '🔑', priority: 50, isNew: true,
    description: 'AES 对称加密与解密',
    keywords: ['aes', 'encrypt', 'decrypt', '加密', '解密', 'cbc', 'ecb'] },
  // Compare
  { id: 'json-diff', name: 'JSON Diff', category: 'Compare', icon: '🔍', priority: 10,
    description: '对比两份 JSON 的差异',
    keywords: ['json', 'diff', '对比', '差异', 'compare'] },
  { id: 'text-diff', name: '文本 Diff', category: 'Compare', icon: '📋', priority: 15, isNew: true,
    description: '行级对比两段文本的差异',
    keywords: ['diff', 'text', '对比', '差异', 'compare', '文本'] },
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
  { id: 'password-gen', name: '密码生成器', category: 'Generate', icon: '🔐', priority: 25, isNew: true,
    description: '生成安全随机密码，含强度评估',
    keywords: ['password', '密码', '随机', '安全', '生成'] },
  // Database
  { id: 'sql-formatter', name: 'SQL 格式化', category: 'Database', icon: '🗄️', priority: 10,
    description: 'SQL 语句格式化与美化',
    keywords: ['sql', 'format', '格式化', 'mysql', 'postgresql'] },
  // Debug
  { id: 'url-compare', name: 'URL 参数比较', category: 'Debug', icon: '🔍', priority: 10,
    description: '对比两个 URL 的 query 参数差异',
    keywords: ['url', 'query', '参数', 'compare', '对比'] },
  { id: 'jwt-decode', name: 'JWT 解析', category: 'Debug', icon: '🎫', priority: 20, isNew: true,
    description: '解码 JWT Token 的 Header 和 Payload',
    keywords: ['jwt', 'token', 'bearer', 'authorization', 'oauth'] },
  { id: 'curl-converter', name: 'cURL 转代码', category: 'Debug', icon: '🔄', priority: 30, isNew: true,
    description: '将 cURL 命令转换为 fetch / axios 等代码',
    keywords: ['curl', 'fetch', 'axios', 'http', '请求', '转换'] },
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
