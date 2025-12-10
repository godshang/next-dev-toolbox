'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// RGB 颜色结构
interface RGB {
  r: number;
  g: number;
  b: number;
}

// CMYK 颜色结构
interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

// HSL 颜色结构
interface HSL {
  h: number;
  s: number;
  l: number;
}

// HSB/HSV 颜色结构
interface HSB {
  h: number;
  s: number;
  b: number;
}

// HEX 转 RGB
function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.replace('#', '').trim();
  if (cleaned.length !== 3 && cleaned.length !== 6) {
    return null;
  }
  
  let r: number, g: number, b: number;
  
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  }
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }
  
  return { r, g, b };
}

// RGB 转 HEX
function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

// RGB 转 CMYK
function rgbToCmyk(rgb: RGB): CMYK {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const k = 1 - Math.max(r, g, b);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  
  const c = ((1 - r - k) / (1 - k)) * 100;
  const m = ((1 - g - k) / (1 - k)) * 100;
  const y = ((1 - b - k) / (1 - k)) * 100;
  
  return {
    c: Math.round(c * 100) / 100,
    m: Math.round(m * 100) / 100,
    y: Math.round(y * 100) / 100,
    k: Math.round(k * 100 * 100) / 100,
  };
}

// CMYK 转 RGB
function cmykToRgb(cmyk: CMYK): RGB {
  const c = cmyk.c / 100;
  const m = cmyk.m / 100;
  const y = cmyk.y / 100;
  const k = cmyk.k / 100;
  
  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));
  
  return { r, g, b };
}

// RGB 转 HSL
function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  
  return {
    h,
    s: Math.round(s * 100 * 100) / 100,
    l: Math.round(l * 100 * 100) / 100,
  };
}

// HSL 转 RGB
function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  
  let r: number, g: number, b: number;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// RGB 转 HSB/HSV
function rgbToHsb(rgb: RGB): HSB {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const s = max === 0 ? 0 : delta / max;
  const bValue = max;
  
  return {
    h,
    s: Math.round(s * 100 * 100) / 100,
    b: Math.round(bValue * 100 * 100) / 100,
  };
}

// HSB/HSV 转 RGB
function hsbToRgb(hsb: HSB): RGB {
  const h = hsb.h / 360;
  const s = hsb.s / 100;
  const v = hsb.b / 100;
  
  const c = v * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = v - c;
  
  let r = 0, g = 0, b = 0;
  
  if (h < 1 / 6) {
    r = c; g = x; b = 0;
  } else if (h < 2 / 6) {
    r = x; g = c; b = 0;
  } else if (h < 3 / 6) {
    r = 0; g = c; b = x;
  } else if (h < 4 / 6) {
    r = 0; g = x; b = c;
  } else if (h < 5 / 6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// 解析输入值
function parseInput(input: string, format: string): RGB | null {
  const trimmed = input.trim();
  
  if (format === 'hex') {
    return hexToRgb(trimmed);
  } else if (format === 'rgb') {
    const match = trimmed.match(/rgb\(?\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)?/i);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        return { r, g, b };
      }
    }
  } else if (format === 'cmyk') {
    const match = trimmed.match(/cmyk\(?\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)?/i);
    if (match) {
      const c = parseFloat(match[1]);
      const m = parseFloat(match[2]);
      const y = parseFloat(match[3]);
      const k = parseFloat(match[4]);
      if (c >= 0 && c <= 100 && m >= 0 && m <= 100 && y >= 0 && y <= 100 && k >= 0 && k <= 100) {
        return cmykToRgb({ c, m, y, k });
      }
    }
  } else if (format === 'hsl') {
    const match = trimmed.match(/hsl\(?\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)?/i);
    if (match) {
      const h = parseInt(match[1], 10);
      const s = parseFloat(match[2]);
      const l = parseFloat(match[3]);
      if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
        return hslToRgb({ h, s, l });
      }
    }
  } else if (format === 'hsb' || format === 'hsv') {
    const match = trimmed.match(/(?:hsb|hsv)\(?\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)?/i);
    if (match) {
      const h = parseInt(match[1], 10);
      const s = parseFloat(match[2]);
      const b = parseFloat(match[3]);
      if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && b >= 0 && b <= 100) {
        return hsbToRgb({ h, s, b });
      }
    }
  }
  
  return null;
}

export default function ColorConverter() {
  const [hex, setHex] = useState('');
  const [rgb, setRgb] = useState('');
  const [cmyk, setCmyk] = useState('');
  const [hsl, setHsl] = useState('');
  const [hsb, setHsb] = useState('');
  const [error, setError] = useState('');
  const [colorPreview, setColorPreview] = useState('#000000');
  const isUpdatingRef = useRef(false);

  // 从 RGB 更新所有格式
  const updateAllFormats = useCallback((rgbColor: RGB) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    
    setHex(rgbToHex(rgbColor));
    setRgb(`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`);
    
    const cmykColor = rgbToCmyk(rgbColor);
    setCmyk(`cmyk(${cmykColor.c}, ${cmykColor.m}, ${cmykColor.y}, ${cmykColor.k})`);
    
    const hslColor = rgbToHsl(rgbColor);
    setHsl(`hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`);
    
    const hsbColor = rgbToHsb(rgbColor);
    setHsb(`hsb(${hsbColor.h}, ${hsbColor.s}%, ${hsbColor.b}%)`);
    
    setColorPreview(rgbToHex(rgbColor));
    setError('');
    
    isUpdatingRef.current = false;
  }, []);

  // 处理 HEX 输入
  const handleHexChange = (value: string) => {
    setHex(value);
    const rgbColor = parseInput(value, 'hex');
    if (rgbColor) {
      updateAllFormats(rgbColor);
    } else if (value.trim()) {
      setError('无效的 HEX 颜色格式');
    }
  };

  // 处理 RGB 输入
  const handleRgbChange = (value: string) => {
    setRgb(value);
    const rgbColor = parseInput(value, 'rgb');
    if (rgbColor) {
      updateAllFormats(rgbColor);
    } else if (value.trim()) {
      setError('无效的 RGB 颜色格式');
    }
  };

  // 处理 CMYK 输入
  const handleCmykChange = (value: string) => {
    setCmyk(value);
    const rgbColor = parseInput(value, 'cmyk');
    if (rgbColor) {
      updateAllFormats(rgbColor);
    } else if (value.trim()) {
      setError('无效的 CMYK 颜色格式');
    }
  };

  // 处理 HSL 输入
  const handleHslChange = (value: string) => {
    setHsl(value);
    const rgbColor = parseInput(value, 'hsl');
    if (rgbColor) {
      updateAllFormats(rgbColor);
    } else if (value.trim()) {
      setError('无效的 HSL 颜色格式');
    }
  };

  // 处理 HSB 输入
  const handleHsbChange = (value: string) => {
    setHsb(value);
    const rgbColor = parseInput(value, 'hsb');
    if (rgbColor) {
      updateAllFormats(rgbColor);
    } else if (value.trim()) {
      setError('无效的 HSB/HSV 颜色格式');
    }
  };

  // 清空
  const handleClear = () => {
    setHex('');
    setRgb('');
    setCmyk('');
    setHsl('');
    setHsb('');
    setError('');
    setColorPreview('#000000');
  };

  // 复制
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 初始化示例颜色
  useEffect(() => {
    updateAllFormats({ r: 52, g: 152, b: 219 });
  }, [updateAllFormats]);

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">颜色格式转换</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">RGB、HEX、CMYK、HSL、HSB/HSV 格式互相转换</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              清空
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <span className="text-red-500">⚠</span>
            {error}
          </div>
        )}
      </div>
      
      <div className="flex-1 p-8 space-y-6 overflow-auto">
        {/* 颜色预览 */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-6">
            <div
              className="w-24 h-24 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-lg"
              style={{ backgroundColor: colorPreview }}
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">颜色预览</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{colorPreview}</p>
            </div>
          </div>
        </div>

        {/* 输入区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HEX */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                HEX
              </label>
              {hex && (
                <button
                  onClick={() => handleCopy(hex)}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <input
              type="text"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#3498DB"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
          </div>

          {/* RGB */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                RGB
              </label>
              {rgb && (
                <button
                  onClick={() => handleCopy(rgb)}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <input
              type="text"
              value={rgb}
              onChange={(e) => handleRgbChange(e.target.value)}
              placeholder="rgb(52, 152, 219)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
          </div>

          {/* CMYK */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                CMYK
              </label>
              {cmyk && (
                <button
                  onClick={() => handleCopy(cmyk)}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <input
              type="text"
              value={cmyk}
              onChange={(e) => handleCmykChange(e.target.value)}
              placeholder="cmyk(76, 31, 0, 14)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
          </div>

          {/* HSL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                HSL
              </label>
              {hsl && (
                <button
                  onClick={() => handleCopy(hsl)}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <input
              type="text"
              value={hsl}
              onChange={(e) => handleHslChange(e.target.value)}
              placeholder="hsl(204, 70%, 53%)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
          </div>

          {/* HSB/HSV */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                HSB / HSV
              </label>
              {hsb && (
                <button
                  onClick={() => handleCopy(hsb)}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                >
                  复制
                </button>
              )}
            </div>
            <input
              type="text"
              value={hsb}
              onChange={(e) => handleHsbChange(e.target.value)}
              placeholder="hsb(204, 76%, 86%)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
          </div>
        </div>

        {/* 格式说明 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-blue-500">ℹ️</span>
            格式说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <p className="font-semibold mb-2">HEX:</p>
              <p className="font-mono text-xs">#RRGGBB 或 #RGB</p>
            </div>
            <div>
              <p className="font-semibold mb-2">RGB:</p>
              <p className="font-mono text-xs">rgb(r, g, b) 范围: 0-255</p>
            </div>
            <div>
              <p className="font-semibold mb-2">CMYK:</p>
              <p className="font-mono text-xs">cmyk(c, m, y, k) 范围: 0-100</p>
            </div>
            <div>
              <p className="font-semibold mb-2">HSL:</p>
              <p className="font-mono text-xs">hsl(h, s%, l%) h: 0-360, s/l: 0-100</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-semibold mb-2">HSB/HSV:</p>
              <p className="font-mono text-xs">hsb(h, s%, b%) 或 hsv(h, s%, v%) h: 0-360, s/b: 0-100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

