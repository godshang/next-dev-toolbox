import type { Messages } from '../types';
import { toolPagesZhCN } from './tool-pages/zh-CN';

export const zhCN = {
  meta: {
    title: 'Dev Toolbox - 开发者工具集',
    description: '提供 JSON 格式化、时间戳转换、UUID 生成、编解码等开发者常用工具',
  },
  common: {
    loading: '加载中...',
    searchTools: '搜索工具...',
    searchToolsShort: '搜索工具',
    openMenu: '打开菜单',
    noResults: '未找到匹配的工具',
    copy: '复制',
    copyAll: '复制全部',
    clear: '清空',
    format: '格式化',
    minify: '压缩',
    compress: '压缩',
    input: '输入',
    output: '输出',
    generate: '生成',
    encode: '编码',
    decode: '解码',
    encrypt: '加密',
    decrypt: '解密',
    calculating: '计算中...',
    privacyNote: '🔒 数据仅在本地处理，不会上传到服务器',
    jsonFormatError: 'JSON 格式错误：{detail}',
    yamlFormatError: 'YAML 格式错误：{detail}',
    xmlFormatError: 'XML 格式错误：{detail}',
    parseFailed: '解析失败',
    emptyValue: '(空值)',
    newBadge: '新',
    language: '语言',
  },
  home: {
    title: '开发者工具集',
    subtitle: '为开发者提供高效、便捷的在线工具，提升开发效率',
    favorites: '⭐ 收藏',
    recent: '🕐 最近使用',
    showMore: '显示更多',
    whyTitle: '为什么选择我们？',
    fastTitle: '快速高效',
    fastDesc: '所有工具都在浏览器中运行，无需安装，即开即用',
    secureTitle: '安全可靠',
    secureDesc: '数据仅在本地处理，不会上传到服务器，保护您的隐私',
    uiTitle: '界面精美',
    uiDesc: '现代化的 UI 设计，支持深色模式，提供最佳体验',
  },
  categories: {
    Data: {
      name: '数据格式',
      description: 'JSON / YAML / XML / CSV、配置文件、时间戳、格式互转',
    },
    Security: {
      name: '编码安全',
      description: '编解码、哈希、加解密',
    },
    Compare: {
      name: '对比校验',
      description: 'Diff、表达式校验',
    },
    Generate: {
      name: '生成器',
      description: 'ID、Mock、密码',
    },
    Database: {
      name: '数据库',
      description: 'SQL 相关工具',
    },
    Debug: {
      name: '接口调试',
      description: '请求分析、参数对比、鉴权',
    },
    Misc: {
      name: '其他工具',
      description: '其他通用工具',
    },
  },
  tools: {
    'json-format': {
      name: 'JSON 格式化',
      description: '格式化、压缩和校验 JSON 字符串',
    },
    'json-view': {
      name: 'JSON 查看',
      description: '树形结构可视化浏览 JSON 数据',
    },
    'json-to-excel': {
      name: 'JSON 转 Excel',
      description: '将 JSON 数组导出为 Excel 文件',
    },
    'json-yaml': {
      name: 'JSON ↔ YAML',
      description: 'JSON 与 YAML 格式双向转换',
    },
    'xml-format': {
      name: 'XML 格式化',
      description: 'XML 缩进美化与压缩',
    },
    'xml-json': {
      name: 'XML ↔ JSON',
      description: 'XML 与 JSON 格式双向转换',
    },
    'csv-json': {
      name: 'CSV ↔ JSON',
      description: 'CSV 与 JSON 格式双向转换',
    },
    'properties-yaml': {
      name: 'Properties ↔ YAML',
      description: 'Java Properties 与 YAML 配置文件互转',
    },
    timestamp: {
      name: '时间戳转换',
      description: 'Unix 时间戳与日期时间互转',
    },
    'url-encode': {
      name: 'URL 编解码',
      description: 'URL encode / decode',
    },
    base64: {
      name: 'Base64 编解码',
      description: 'Base64 编码与解码',
    },
    'unicode-codec': {
      name: 'Unicode 编解码',
      description: 'Unicode 转义序列编解码',
    },
    hash: {
      name: '哈希',
      description: 'MD5 / SHA / SM3 哈希计算',
    },
    'aes-crypto': {
      name: 'AES 加解密',
      description: 'AES 对称加密与解密',
    },
    'json-diff': {
      name: 'JSON Diff',
      description: '对比两份 JSON 的差异',
    },
    'text-diff': {
      name: '文本 Diff',
      description: '行级对比两段文本的差异',
    },
    cron: {
      name: 'CRON 表达式解析',
      description: '解析 CRON 表达式并预览下次执行时间',
    },
    uuid: {
      name: 'UUID 生成器',
      description: '生成 UUID v4 唯一标识符',
    },
    'random-string': {
      name: '随机字符串生成',
      description: '按规则生成随机字符串',
    },
    'password-gen': {
      name: '密码生成器',
      description: '生成安全随机密码，含强度评估',
    },
    'sql-formatter': {
      name: 'SQL 格式化',
      description: 'SQL 语句格式化与美化',
    },
    'url-compare': {
      name: 'URL 参数比较',
      description: '对比两个 URL 的 query 参数差异',
    },
    'jwt-decode': {
      name: 'JWT 解析',
      description: '解码 JWT Token 的 Header 和 Payload',
    },
    'curl-converter': {
      name: 'cURL 转代码',
      description: '将 cURL 命令转换为 fetch / axios 等代码',
    },
    'qr-code': {
      name: '二维码生成',
      description: '文本生成二维码图片',
    },
    'qr-reader': {
      name: '二维码识别',
      description: '从图片中识别二维码内容',
    },
    'color-converter': {
      name: '颜色格式转换',
      description: 'HEX / RGB / HSL 颜色格式互转',
    },
    'number-base': {
      name: '进制转换',
      description: '二进制、八进制、十进制、十六进制互转',
    },
  },
  toolPages: toolPagesZhCN,
} satisfies Messages;
