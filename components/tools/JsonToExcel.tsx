'use client';

import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useI18n, useToolPage } from '@/lib/i18n';

// JSON 语法高亮函数
const highlightJSON = (text: string): string => {
  if (!text.trim()) return '';
  
  let highlighted = escapeHtml(text);
  
  highlighted = highlighted.replace(
    /"([^"\\]|\\.)*":/g,
    (match) => {
      const keyMatch = match.match(/^"([^"]+)":$/);
      if (keyMatch) {
        return `<span class="text-red-600 dark:text-red-400 font-semibold">"${keyMatch[1]}"</span>:`;
      }
      return match;
    }
  );
  
  highlighted = highlighted.replace(
    /(:\s*|,\s*)"([^"\\]|\\.)*"/g,
    (match) => {
      if (match.includes('<span')) {
        return match;
      }
      const valueMatch = match.match(/(:\s*|,\s*)"([^"]+)"/);
      if (valueMatch) {
        return `${valueMatch[1]}<span class="text-green-600 dark:text-green-400">"${valueMatch[2]}"</span>`;
      }
      return match;
    }
  );
  
  highlighted = highlighted.replace(
    /(:\s*|,\s*)(\d+\.?\d*)/g,
    (match) => {
      if (match.includes('<span')) {
        return match;
      }
      const numMatch = match.match(/(:\s*|,\s*)(\d+\.?\d*)/);
      if (numMatch) {
        return `${numMatch[1]}<span class="text-blue-600 dark:text-blue-400">${numMatch[2]}</span>`;
      }
      return match;
    }
  );
  
  highlighted = highlighted.replace(
    /(:\s*|,\s*)(true|false|null)\b/g,
    (match) => {
      if (match.includes('<span')) {
        return match;
      }
      const boolMatch = match.match(/(:\s*|,\s*)(true|false|null)/);
      if (boolMatch) {
        return `${boolMatch[1]}<span class="text-purple-600 dark:text-purple-400 font-semibold">${boolMatch[2]}</span>`;
      }
      return match;
    }
  );
  
  return highlighted;
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

interface ColumnDef {
  path: string[];
  key: string;
  depth: number;
  parentPath: string[];
}

interface ArrayField {
  path: string[];
  key: string;
  items: any[];
}

// 生成所有JSON路径（包含数组索引，但标准化时去掉索引），保持顺序
// 对应Java的generateJsonPath方法
function generateJsonPaths(obj: any, paths: string[], parentPath: string = ''): void {
  if (obj === null || obj === undefined) {
    return;
  }
  
  if (Array.isArray(obj)) {
    // 数组：遍历每个元素，路径中包含索引（与Java一致）
    for (let i = 0; i < obj.length; i++) {
      const pathWithIndex = parentPath ? `${parentPath}/${i}` : `/${i}`;
      generateJsonPaths(obj[i], paths, pathWithIndex);
    }
  } else if (typeof obj === 'object') {
    // 保持对象键的原始顺序
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const currentPath = parentPath ? `${parentPath}/${key}` : key;
      
      if (value === null || value === undefined) {
        if (!paths.includes(currentPath)) {
          paths.push(currentPath);
        }
      } else if (Array.isArray(value)) {
        // 数组字段：遍历数组元素，路径中包含索引（与Java一致）
        for (let i = 0; i < value.length; i++) {
          const pathWithIndex = `${currentPath}/${i}`;
          generateJsonPaths(value[i], paths, pathWithIndex);
        }
      } else if (typeof value === 'object') {
        // 嵌套对象，递归处理
        generateJsonPaths(value, paths, currentPath);
      } else {
        // 基本类型
        if (!paths.includes(currentPath)) {
          paths.push(currentPath);
        }
      }
    });
  }
}

// 获取标准化路径列表（去掉数组索引部分）
function getNormalizedPathList(path: string): string[] {
  return path.split('/').filter(segment => segment && !/^\d+$/.test(segment));
}

// 获取标准化路径
function getNormalizedPath(path: string): string {
  return getNormalizedPathList(path).join('/');
}

// 获取值
function getValueByPath(obj: any, path: string[]): any {
  let current = obj;
  for (const key of path) {
    if (current === null || current === undefined) {
      return '';
    }
    if (Array.isArray(current)) {
      return ''; // 数组不应该在这里获取值
    }
    current = current[key];
  }
  return current ?? '';
}

// 从数组项中获取值
function getValueFromArrayItem(item: any, path: string[], arrayPath: string[]): any {
  // path 应该包含 arrayPath，需要去掉 arrayPath 部分
  const relativePath = path.slice(arrayPath.length);
  let current = item;
  for (const key of relativePath) {
    if (current === null || current === undefined) {
      return '';
    }
    if (Array.isArray(current)) {
      return '';
    }
    current = current[key];
  }
  return current ?? '';
}

// 将值转换为文本格式，避免科学计数法
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number') {
    // 对于大数字，转换为字符串避免科学计数法
    if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-6 && value !== 0)) {
      return String(value);
    }
    // 对于普通数字，也转换为字符串以确保格式一致
    return String(value);
  }
  return String(value);
}

// 从JSON中获取值（支持路径）
function getValueByJsonPath(obj: any, path: string): any {
  if (!path) return obj;
  
  const segments = path.split('/').filter(s => s && !/^\d+$/.test(s));
  let current = obj;
  
  for (const segment of segments) {
    if (current === null || current === undefined) {
      return '';
    }
    if (Array.isArray(current)) {
      // 如果是数组，取第一个元素
      current = current[0];
      if (current === null || current === undefined) {
        return '';
      }
    }
    current = current[segment];
  }
  
  return current ?? '';
}

// 构建数据行（递归处理JSON）
// 对应Java的buildData方法
function buildDataRows(
  obj: any,
  colMap: Map<string, number>,
  parentPath: string,
  dataRows: any[][],
  dataRowIndex: number, // 数据行的索引（从0开始）
  maxCols: number
): number {
  if (obj === null || obj === undefined) {
    return dataRowIndex;
  }
  
  if (Array.isArray(obj)) {
    // 数组：每个元素生成一行（与Java一致）
    for (let i = 0; i < obj.length; i++) {
      const pathWithIndex = parentPath ? `${parentPath}/${i}` : `/${i}`;
      dataRowIndex = buildDataRows(obj[i], colMap, pathWithIndex, dataRows, i === 0 ? dataRowIndex : dataRowIndex + 1, maxCols);
    }
    return dataRowIndex;
  }
  
  if (typeof obj === 'object') {
    // 确保行存在（数据行从0开始）
    while (dataRows.length <= dataRowIndex) {
      dataRows.push(new Array(maxCols).fill(''));
    }
    const row = dataRows[dataRowIndex];
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const currentPath = parentPath ? `${parentPath}/${key}` : key;
      const normalizedPath = getNormalizedPath(currentPath);
      
      if (value === null || value === undefined) {
        const colIdx = colMap.get(normalizedPath);
        if (colIdx !== undefined) {
          row[colIdx] = formatValue(value);
        }
      } else if (Array.isArray(value)) {
        // 数组字段：递归处理每个元素，路径中包含索引（与Java一致）
        let itemRowIndex = dataRowIndex;
        for (let i = 0; i < value.length; i++) {
          const pathWithIndex = `${currentPath}/${i}`;
          itemRowIndex = buildDataRows(value[i], colMap, pathWithIndex, dataRows, i === 0 ? itemRowIndex : itemRowIndex + 1, maxCols);
        }
        dataRowIndex = itemRowIndex;
      } else if (typeof value === 'object') {
        // 嵌套对象：递归处理
        dataRowIndex = buildDataRows(value, colMap, currentPath, dataRows, dataRowIndex, maxCols);
      } else {
        // 基本类型：直接设置值（使用asText()等价）
        const colIdx = colMap.get(normalizedPath);
        if (colIdx !== undefined) {
          row[colIdx] = formatValue(value);
        }
      }
    });
  }
  
  return dataRowIndex;
}

// 生成 Excel 数据
function generateExcelData(jsonData: any): { headers: string[][], data: any[][], merges: any[] } {
  // 1. 生成所有路径（保持顺序）
  const paths: string[] = [];
  generateJsonPaths(jsonData, paths);
  
  // 2. 构建表头（保持JSON字段顺序）
  const normalizedPathToColMap = new Map<string, number>();
  const headerRows: string[][] = [];
  let colIndex = 0;
  
  // 按JSON中的顺序处理路径（不排序）
  paths.forEach(path => {
    const normalizedPath = getNormalizedPath(path);
    
    // 如果这个标准化路径已经处理过，跳过
    if (normalizedPathToColMap.has(normalizedPath)) {
      return;
    }
    
    const pathList = getNormalizedPathList(path);
    
    // 填充表头行
    pathList.forEach((segment, rowIdx) => {
      while (headerRows.length <= rowIdx) {
        headerRows.push([]);
      }
      // 填充前面的列
      while (headerRows[rowIdx].length < colIndex) {
        headerRows[rowIdx].push('');
      }
      headerRows[rowIdx].push(segment);
    });
    
    // 填充后续行的空单元格
    for (let i = pathList.length; i < headerRows.length; i++) {
      while (headerRows[i].length < colIndex + 1) {
        headerRows[i].push('');
      }
    }
    
    normalizedPathToColMap.set(normalizedPath, colIndex);
    colIndex++;
  });
  
  // 确保所有行长度一致
  const maxCols = colIndex;
  headerRows.forEach(row => {
    while (row.length < maxCols) {
      row.push('');
    }
  });
  
  // 3. 水平合并（同一行连续相同的值，对应Java的mergeTitleHorizental方法）
  // Java: for (int i = 0; i < lastRow; i++) - 不包括最后一行
  const merges: any[] = [];
  const lastHeaderRow = headerRows.length - 1;
  for (let i = 0; i < lastHeaderRow; i++) {
    const row = headerRows[i];
    let j = 0;
    while (j < row.length) {
      let k = j + 1;
      // Java: while (c1 != null && c2 != null && c1.getStringCellValue().equals(c2.getStringCellValue()))
      while (k < row.length && row[j] && row[j] === row[k]) {
        k++;
      }
      if (k - j > 1) {
        merges.push({
          s: { r: i, c: j },
          e: { r: i, c: k - 1 }
        });
        j = k;
      } else {
        j++;
      }
    }
  }
  
  // 4. 垂直合并（每个表头单元格合并到最后一行表头，对应Java的mergeTitleVertical方法）
  // Java: for (int i = 0; i < lastRow; i++) - 不包括最后一行
  for (let i = 0; i < lastHeaderRow; i++) {
    const row = headerRows[i];
    for (let j = 0; j < row.length; j++) {
      // 检查这个单元格是否已经被水平合并（对应Java的isCellMerged方法）
      const isMerged = merges.some(merge => {
        const { s, e } = merge;
        return i >= s.r && i <= e.r && j >= s.c && j <= e.c;
      });
      
      if (!isMerged && row[j]) {
        // 垂直合并到最后一列表头行（对应Java: new CellRangeAddress(i, lastRow, j, j)）
        merges.push({
          s: { r: i, c: j },
          e: { r: lastHeaderRow, c: j }
        });
      }
    }
  }
  
  // 5. 构建数据行（数据行索引从0开始，对应Java的buildData方法）
  const dataRows: any[][] = [];
  const dataStartRow = headerRows.length; // Excel中的实际行号（用于后续处理）
  
  if (Array.isArray(jsonData)) {
    // 如果根是数组，每个元素一行（与Java一致：buildData(root.get(i), colMap, SEP + i, sheet, dataRow)）
    let dataRowIndex = 0;
    for (let i = 0; i < jsonData.length; i++) {
      const pathWithIndex = `/${i}`;
      dataRowIndex = buildDataRows(jsonData[i], normalizedPathToColMap, pathWithIndex, dataRows, i === 0 ? dataRowIndex : dataRowIndex + 1, maxCols);
    }
  } else {
    // 如果根是对象，只有一行（与Java一致：buildData(root, colMap, "", sheet, dataRow)）
    buildDataRows(jsonData, normalizedPathToColMap, '', dataRows, 0, maxCols);
  }
  
  return {
    headers: headerRows,
    data: dataRows,
    merges,
  };
}

export default function JsonToExcel() {
  const { t: tc } = useI18n();
  const { t, tool } = useToolPage('json-to-excel');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ headers: string[][], data: any[][], merges: any[] } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // 同步滚动
  useEffect(() => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    
    if (textarea && highlight) {
      const handleScroll = () => {
        highlight.scrollTop = textarea.scrollTop;
        highlight.scrollLeft = textarea.scrollLeft;
      };
      
      textarea.addEventListener('scroll', handleScroll);
      return () => textarea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // 自动解析和预览
  useEffect(() => {
    if (!content.trim()) {
      setPreview(null);
      setError('');
      return;
    }

    try {
      setError('');
      const parsed = JSON.parse(content);
      const excelData = generateExcelData(parsed);
      setPreview({
        headers: excelData.headers,
        data: excelData.data,
        merges: excelData.merges, // 添加合并信息
      });
    } catch (e) {
      setError(tc('common.jsonFormatError', { detail: e instanceof Error ? e.message : String(e) }));
      setPreview(null);
    }
  }, [content, tc]);

  const handleFormat = () => {
    try {
      setError('');
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      setContent(formatted);
    } catch (e) {
      setError(tc('common.jsonFormatError', { detail: e instanceof Error ? e.message : String(e) }));
    }
  };

  const handleClear = () => {
    setContent('');
    setError('');
    setPreview(null);
  };

  const handleDownload = () => {
    if (!content.trim()) return;
    
    try {
      const parsed = JSON.parse(content);
      const excelData = generateExcelData(parsed);
      
      // 创建工作簿
      const wb = XLSX.utils.book_new();
      
      // 准备数据：表头 + 数据行
      const wsData: any[][] = [];
      
      // 添加表头
      excelData.headers.forEach(headerRow => {
        wsData.push(headerRow);
      });
      
      // 添加数据行
      excelData.data.forEach(dataRow => {
        wsData.push(dataRow);
      });
      
      // 创建工作表
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // 设置单元格格式和样式
      const headerRowCount = excelData.headers.length;
      const maxRows = headerRowCount + excelData.data.length;
      const maxCols = Math.max(
        ...excelData.headers.map(row => row.length),
        ...excelData.data.map(row => row.length)
      );
      
      // 设置所有单元格的格式和样式
      for (let r = 0; r < maxRows; r++) {
        for (let c = 0; c < maxCols; c++) {
          const cellAddress = XLSX.utils.encode_cell({ r, c });
          if (!ws[cellAddress]) {
            ws[cellAddress] = { t: 's', v: '' };
          }
          
          // 设置单元格格式为文本（避免科学计数法）
          ws[cellAddress].t = 's';
          
          // 如果是数据行且值是数字，确保以文本形式存储
          if (r >= headerRowCount) {
            const cellValue = excelData.data[r - headerRowCount]?.[c];
            if (cellValue !== undefined && cellValue !== '') {
              ws[cellAddress].v = String(cellValue);
            }
          }
          
          // 设置垂直居中对齐（通过样式）
          // 注意：xlsx库本身不支持样式，但我们可以通过设置单元格属性来影响显示
          // 实际样式需要在Excel中手动设置，或者使用xlsx-style等库
          // 这里我们至少确保数据格式正确
        }
      }
      
      // 设置合并单元格
      if (excelData.merges && excelData.merges.length > 0) {
        ws['!merges'] = excelData.merges;
      }
      
      // 设置列宽
      ws['!cols'] = Array(maxCols).fill({ wch: 15 });
      
      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      
      // 生成文件并下载
      XLSX.writeFile(wb, 'json-to-excel.xlsx');
    } catch (e) {
      setError(t('errorExcelFailed', { detail: e instanceof Error ? e.message : String(e) }));
    }
  };

  const highlightedContent = highlightJSON(content);

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool?.name ?? ''}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFormat}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {tc('common.format')}
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {tc('common.clear')}
            </button>
            <button
              onClick={handleDownload}
              disabled={!content || !!error}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {t('btnDownloadExcel')}
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
        {/* 输入区域 */}
        <div className="flex flex-col space-y-4">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('labelInputJson')}
          </label>
          <div className="relative min-h-[300px]">
            {/* 语法高亮层 */}
            <div
              ref={highlightRef}
              className="absolute inset-0 p-6 overflow-auto font-mono text-sm whitespace-pre-wrap break-words pointer-events-none bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-300 dark:border-gray-600"
            >
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />
              ) : (
                <div className="text-gray-400 dark:text-gray-500 flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-lg font-medium">{t('emptyHint')}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 输入层 */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError('');
              }}
              className="absolute inset-0 w-full h-full p-6 border-0 bg-transparent text-transparent caret-blue-600 dark:caret-blue-400 font-mono text-sm resize-none focus:outline-none overflow-auto rounded-xl border border-gray-300 dark:border-gray-600"
              placeholder=""
              style={{
                caretColor: '#2563eb',
              }}
            />
          </div>
        </div>

        {/* 预览区域 */}
        {preview && (() => {
          // 根据合并信息计算每个单元格的合并情况
          const isCellMerged = (row: number, col: number): { rowSpan?: number, colSpan?: number, skip?: boolean } => {
            for (const merge of preview.merges) {
              const { s, e } = merge;
              if (row >= s.r && row <= e.r && col >= s.c && col <= e.c) {
                // 如果是合并区域的起始单元格
                if (row === s.r && col === s.c) {
                  return {
                    rowSpan: e.r - s.r + 1,
                    colSpan: e.c - s.c + 1,
                  };
                } else {
                  // 如果是合并区域内的其他单元格，跳过
                  return { skip: true };
                }
              }
            }
            return {};
          };
          
          const headerRowCount = preview.headers.length;
          
          return (
            <div className="flex flex-col space-y-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('labelPreview', { count: preview.data.length })}
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 overflow-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    {preview.headers.map((headerRow, rowIndex) => (
                      <tr key={rowIndex}>
                        {headerRow.map((cell, cellIndex) => {
                          const mergeInfo = isCellMerged(rowIndex, cellIndex);
                          if (mergeInfo.skip) {
                            return null;
                          }
                          
                          return (
                            <th
                              key={cellIndex}
                              rowSpan={mergeInfo.rowSpan && mergeInfo.rowSpan > 1 ? mergeInfo.rowSpan : undefined}
                              colSpan={mergeInfo.colSpan && mergeInfo.colSpan > 1 ? mergeInfo.colSpan : undefined}
                              className={`px-4 py-2 border border-gray-300 dark:border-gray-600 ${
                                rowIndex === 0 
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold' 
                                  : 'bg-gray-50 dark:bg-gray-750 text-gray-800 dark:text-gray-200 font-medium'
                              } text-center align-middle`}
                            >
                              {cell || ''}
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {preview.data.slice(0, 10).map((dataRow, rowIndex) => {
                      const actualRowIndex = headerRowCount + rowIndex;
                      const maxCols = Math.max(...preview.headers.map(r => r.length), ...preview.data.map(r => r.length));
                      
                      return (
                        <tr key={rowIndex}>
                          {Array.from({ length: maxCols }, (_, cellIndex) => {
                            const mergeInfo = isCellMerged(actualRowIndex, cellIndex);
                            if (mergeInfo.skip) {
                              return null;
                            }
                            
                            const cellValue = dataRow[cellIndex] ?? '';
                            
                            return (
                              <td
                                key={cellIndex}
                                rowSpan={mergeInfo.rowSpan && mergeInfo.rowSpan > 1 ? mergeInfo.rowSpan : undefined}
                                colSpan={mergeInfo.colSpan && mergeInfo.colSpan > 1 ? mergeInfo.colSpan : undefined}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-center align-middle"
                              >
                                {String(cellValue)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {preview.data.length > 10 && (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center border-t border-gray-300 dark:border-gray-600">
                    {t('previewMoreRows', { count: preview.data.length - 10 })}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('previewNote')}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
