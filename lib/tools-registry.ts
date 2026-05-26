export type ToolCategory =
  | 'Data'
  | 'Security'
  | 'Compare'
  | 'Generate'
  | 'Database'
  | 'Debug'
  | 'Misc';

/** Structural tool definition; display strings come from i18n */
export type ToolItem = {
  id: string;
  category: ToolCategory;
  keywords: string[];
  icon?: string;
  isNew?: boolean;
  priority?: number;
};

export type CategoryMeta = {
  icon: string;
  collapsed?: boolean;
};

export const categoryOrder: ToolCategory[] = [
  'Data', 'Security', 'Compare', 'Generate', 'Database', 'Debug', 'Misc',
];

export const categoryMeta: Record<ToolCategory, CategoryMeta> = {
  Data:     { icon: '📊' },
  Security: { icon: '🔐' },
  Compare:  { icon: '🔍' },
  Generate: { icon: '✨' },
  Database: { icon: '🗄️' },
  Debug:    { icon: '🔌' },
  Misc:     { icon: '📦', collapsed: true },
};

export const tools: ToolItem[] = [
  // Data
  { id: 'json-format', category: 'Data', icon: '📝', priority: 10,
    keywords: ['json', 'format', '格式化', '压缩', 'prettify'] },
  { id: 'json-view', category: 'Data', icon: '👁️', priority: 20,
    keywords: ['json', 'view', '查看', '树形', '可视化'] },
  { id: 'json-to-excel', category: 'Data', icon: '📊', priority: 30,
    keywords: ['json', 'excel', 'xlsx', '导出', '表格'] },
  { id: 'json-yaml', category: 'Data', icon: '🔄', priority: 40,
    keywords: ['json', 'yaml', 'yml', '转换'] },
  { id: 'xml-format', category: 'Data', icon: '📄', priority: 42, isNew: true,
    keywords: ['xml', 'format', '格式化', '美化', '压缩'] },
  { id: 'xml-json', category: 'Data', icon: '🔀', priority: 43, isNew: true,
    keywords: ['xml', 'json', '转换'] },
  { id: 'csv-json', category: 'Data', icon: '📋', priority: 44, isNew: true,
    keywords: ['csv', 'json', '转换', '表格'] },
  { id: 'properties-yaml', category: 'Data', icon: '⚙️', priority: 50,
    keywords: ['properties', 'yaml', 'yml', 'config', '配置', 'spring'] },
  { id: 'timestamp', category: 'Data', icon: '⏰', priority: 60,
    keywords: ['timestamp', '时间戳', 'unix', '日期', 'epoch'] },
  // Security
  { id: 'url-encode', category: 'Security', icon: '🔗', priority: 10,
    keywords: ['url', 'encode', 'decode', '编解码', 'percent'] },
  { id: 'base64', category: 'Security', icon: '📦', priority: 20,
    keywords: ['base64', 'encode', 'decode', '编解码'] },
  { id: 'unicode-codec', category: 'Security', icon: '🔤', priority: 30,
    keywords: ['unicode', 'utf', '转义', 'encode'] },
  { id: 'hash', category: 'Security', icon: '🔒', priority: 40,
    keywords: ['hash', 'md5', 'sha256', 'sha512', 'sm3', '签名'] },
  { id: 'aes-crypto', category: 'Security', icon: '🔑', priority: 50, isNew: true,
    keywords: ['aes', 'encrypt', 'decrypt', '加密', '解密', 'cbc', 'ecb'] },
  // Compare
  { id: 'json-diff', category: 'Compare', icon: '🔍', priority: 10,
    keywords: ['json', 'diff', '对比', '差异', 'compare'] },
  { id: 'text-diff', category: 'Compare', icon: '📋', priority: 15, isNew: true,
    keywords: ['diff', 'text', '对比', '差异', 'compare', '文本'] },
  { id: 'cron', category: 'Compare', icon: '⏰', priority: 20,
    keywords: ['cron', 'quartz', 'scheduled', '定时任务', '表达式'] },
  // Generate
  { id: 'uuid', category: 'Generate', icon: '🆔', priority: 10,
    keywords: ['uuid', 'guid', '唯一', '标识符'] },
  { id: 'random-string', category: 'Generate', icon: '🔤', priority: 20,
    keywords: ['random', '随机', '字符串', 'password'] },
  { id: 'password-gen', category: 'Generate', icon: '🔐', priority: 25, isNew: true,
    keywords: ['password', '密码', '随机', '安全', '生成'] },
  // Database
  { id: 'sql-formatter', category: 'Database', icon: '🗄️', priority: 10,
    keywords: ['sql', 'format', '格式化', 'mysql', 'postgresql'] },
  // Debug
  { id: 'url-compare', category: 'Debug', icon: '🔍', priority: 10,
    keywords: ['url', 'query', '参数', 'compare', '对比'] },
  { id: 'jwt-decode', category: 'Debug', icon: '🎫', priority: 20, isNew: true,
    keywords: ['jwt', 'token', 'bearer', 'authorization', 'oauth'] },
  { id: 'curl-converter', category: 'Debug', icon: '🔄', priority: 30, isNew: true,
    keywords: ['curl', 'fetch', 'axios', 'http', '请求', '转换'] },
  // Misc
  { id: 'qr-code', category: 'Misc', icon: '📱', priority: 10,
    keywords: ['qr', 'qrcode', '二维码'] },
  { id: 'qr-reader', category: 'Misc', icon: '🔍', priority: 20,
    keywords: ['qr', 'qrcode', '二维码', '识别', '扫描'] },
  { id: 'color-converter', category: 'Misc', icon: '🎨', priority: 30,
    keywords: ['color', 'hex', 'rgb', 'hsl', '颜色'] },
  { id: 'number-base', category: 'Misc', icon: '🔢', priority: 40,
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
