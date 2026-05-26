import type { Messages } from '../types';
import { toolPagesEn } from './tool-pages/en';

export const en = {
  meta: {
    title: 'Dev Toolbox',
    description:
      'JSON formatting, timestamp conversion, UUID generation, encoding/decoding, and more developer utilities',
  },
  common: {
    loading: 'Loading...',
    searchTools: 'Search tools...',
    searchToolsShort: 'Search',
    openMenu: 'Open menu',
    noResults: 'No matching tools',
    copy: 'Copy',
    copyAll: 'Copy all',
    clear: 'Clear',
    format: 'Format',
    minify: 'Minify',
    compress: 'Compress',
    input: 'Input',
    output: 'Output',
    generate: 'Generate',
    encode: 'Encode',
    decode: 'Decode',
    encrypt: 'Encrypt',
    decrypt: 'Decrypt',
    calculating: 'Calculating...',
    privacyNote: '🔒 Data is processed locally only; never uploaded',
    jsonFormatError: 'Invalid JSON: {detail}',
    yamlFormatError: 'Invalid YAML: {detail}',
    xmlFormatError: 'Invalid XML: {detail}',
    parseFailed: 'Parse failed',
    emptyValue: '(empty)',
    newBadge: 'New',
    language: 'Language',
  },
  home: {
    title: 'Developer Toolbox',
    subtitle: 'Efficient online tools for developers to boost productivity',
    favorites: '⭐ Favorites',
    recent: '🕐 Recent',
    showMore: 'Show more',
    whyTitle: 'Why choose us?',
    fastTitle: 'Fast & efficient',
    fastDesc: 'All tools run in your browser — no install, ready instantly',
    secureTitle: 'Secure & private',
    secureDesc: 'Data stays on your device; nothing is sent to our servers',
    uiTitle: 'Polished UI',
    uiDesc: 'Modern design with dark mode for the best experience',
  },
  categories: {
    Data: {
      name: 'Data formats',
      description: 'JSON / YAML / XML / CSV, config files, timestamps, conversions',
    },
    Security: {
      name: 'Encoding & security',
      description: 'Encode/decode, hashing, encryption',
    },
    Compare: {
      name: 'Compare & validate',
      description: 'Diff, expression validation',
    },
    Generate: {
      name: 'Generators',
      description: 'IDs, mock data, passwords',
    },
    Database: {
      name: 'Database',
      description: 'SQL utilities',
    },
    Debug: {
      name: 'API debugging',
      description: 'Request analysis, param comparison, auth',
    },
    Misc: {
      name: 'Other tools',
      description: 'Miscellaneous utilities',
    },
  },
  tools: {
    'json-format': {
      name: 'JSON Formatter',
      description: 'Format, minify, and validate JSON strings',
    },
    'json-view': {
      name: 'JSON Viewer',
      description: 'Visualize JSON in a tree view',
    },
    'json-to-excel': {
      name: 'JSON to Excel',
      description: 'Export JSON arrays to Excel files',
    },
    'json-yaml': {
      name: 'JSON ↔ YAML',
      description: 'Convert between JSON and YAML',
    },
    'xml-format': {
      name: 'XML Formatter',
      description: 'Beautify and minify XML',
    },
    'xml-json': {
      name: 'XML ↔ JSON',
      description: 'Convert between XML and JSON',
    },
    'csv-json': {
      name: 'CSV ↔ JSON',
      description: 'Convert between CSV and JSON',
    },
    'properties-yaml': {
      name: 'Properties ↔ YAML',
      description: 'Convert Java Properties and YAML config files',
    },
    timestamp: {
      name: 'Timestamp Converter',
      description: 'Convert Unix timestamps and date/time',
    },
    'url-encode': {
      name: 'URL Encode/Decode',
      description: 'URL encode and decode',
    },
    base64: {
      name: 'Base64 Encode/Decode',
      description: 'Base64 encoding and decoding',
    },
    'unicode-codec': {
      name: 'Unicode Codec',
      description: 'Unicode escape sequence encode/decode',
    },
    hash: {
      name: 'Hash',
      description: 'MD5 / SHA / SM3 hash computation',
    },
    'aes-crypto': {
      name: 'AES Encrypt/Decrypt',
      description: 'AES symmetric encryption and decryption',
    },
    'json-diff': {
      name: 'JSON Diff',
      description: 'Compare two JSON documents',
    },
    'text-diff': {
      name: 'Text Diff',
      description: 'Line-level diff for two text blocks',
    },
    cron: {
      name: 'CRON Parser',
      description: 'Parse CRON expressions and preview next run times',
    },
    uuid: {
      name: 'UUID Generator',
      description: 'Generate UUID v4 identifiers',
    },
    'random-string': {
      name: 'Random String',
      description: 'Generate random strings by rules',
    },
    'password-gen': {
      name: 'Password Generator',
      description: 'Secure random passwords with strength estimate',
    },
    'sql-formatter': {
      name: 'SQL Formatter',
      description: 'Format and beautify SQL statements',
    },
    'url-compare': {
      name: 'URL Param Compare',
      description: 'Compare query parameters between two URLs',
    },
    'jwt-decode': {
      name: 'JWT Decoder',
      description: 'Decode JWT Header and Payload',
    },
    'curl-converter': {
      name: 'cURL to Code',
      description: 'Convert cURL commands to fetch / axios code',
    },
    'qr-code': {
      name: 'QR Code Generator',
      description: 'Generate QR code images from text',
    },
    'qr-reader': {
      name: 'QR Code Reader',
      description: 'Decode QR codes from images',
    },
    'color-converter': {
      name: 'Color Converter',
      description: 'Convert HEX / RGB / HSL color formats',
    },
    'number-base': {
      name: 'Number Base Converter',
      description: 'Convert binary, octal, decimal, and hexadecimal',
    },
  },
  toolPages: toolPagesEn,
} satisfies Messages;
