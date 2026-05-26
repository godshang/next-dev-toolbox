import type { ToolCategory } from '@/lib/tools-registry';

export type ToolMessages = {
  name: string;
  description: string;
};

export type CategoryMessages = {
  name: string;
  description: string;
};

export type Messages = {
  meta: {
    title: string;
    description: string;
  };
  common: {
    loading: string;
    searchTools: string;
    searchToolsShort: string;
    openMenu: string;
    noResults: string;
    copy: string;
    copyAll: string;
    clear: string;
    format: string;
    minify: string;
    compress: string;
    input: string;
    output: string;
    generate: string;
    encode: string;
    decode: string;
    encrypt: string;
    decrypt: string;
    calculating: string;
    privacyNote: string;
    jsonFormatError: string;
    yamlFormatError: string;
    xmlFormatError: string;
    parseFailed: string;
    emptyValue: string;
    newBadge: string;
    language: string;
  };
  home: {
    title: string;
    subtitle: string;
    favorites: string;
    recent: string;
    showMore: string;
    whyTitle: string;
    fastTitle: string;
    fastDesc: string;
    secureTitle: string;
    secureDesc: string;
    uiTitle: string;
    uiDesc: string;
  };
  categories: Record<ToolCategory, CategoryMessages>;
  tools: Record<string, ToolMessages>;
  /** Per-tool UI strings; extend when adding tools or locales */
  toolPages: Record<string, Record<string, string>>;
};
