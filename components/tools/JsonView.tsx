'use client';

import { useState, useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopyKey: () => void;
  onCopyValue: () => void;
  hasKey: boolean;
}

function ContextMenu({ x, y, onClose, onCopyKey, onCopyValue, hasKey }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {hasKey && (
        <button
          onClick={() => {
            onCopyKey();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span>📋</span>
          <span>复制 Key</span>
        </button>
      )}
      <button
        onClick={() => {
          onCopyValue();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
      >
        <span>📋</span>
        <span>复制 Value</span>
      </button>
    </div>
  );
}

interface TreeNodeProps {
  data: any;
  keyName?: string;
  level?: number;
  isLast?: boolean;
  path?: string;
}

function TreeNode({ data, keyName, level = 0, isLast = false, path = '' }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // 默认展开前两层
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const currentPath = path ? `${path}.${keyName}` : keyName || 'root';

  const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
  };

  const getValueColor = (type: string): string => {
    switch (type) {
      case 'string': return 'text-green-600 dark:text-green-400';
      case 'number': return 'text-blue-600 dark:text-blue-400';
      case 'boolean': return 'text-orange-600 dark:text-orange-400';
      case 'null': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const renderValue = (value: any, type: string) => {
    if (type === 'string') {
      return <span className={getValueColor(type)}>"{value}"</span>;
    }
    if (type === 'null') {
      return <span className={`${getValueColor(type)} font-semibold`}>null</span>;
    }
    return <span className={getValueColor(type)}>{String(value)}</span>;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCopyKey = () => {
    if (keyName !== undefined) {
      copyToClipboard(keyName);
    }
  };

  const handleCopyValue = () => {
    const type = getValueType(data);
    let valueToCopy: string;
    
    if (type === 'object' || type === 'array') {
      valueToCopy = JSON.stringify(data, null, 2);
    } else if (type === 'string') {
      valueToCopy = data;
    } else {
      valueToCopy = String(data);
    }
    
    copyToClipboard(valueToCopy);
  };

  const type = getValueType(data);
  const isExpandable = type === 'object' || type === 'array';
  const keys = isExpandable ? (type === 'array' ? data : Object.keys(data)) : null;
  const itemCount = isExpandable ? (type === 'array' ? data.length : Object.keys(data).length) : 0;

  const indentWidth = level * 24;

  return (
    <>
      <div className="select-none" ref={nodeRef}>
        <div
          className="flex items-center gap-1.5 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 -mx-2 transition-colors"
          style={{ paddingLeft: `${indentWidth + 8}px` }}
          onContextMenu={handleContextMenu}
        >
          {/* 展开/折叠按钮 */}
          {isExpandable && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-4 h-4 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mr-1"
            >
              <span className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>
          )}
          {!isExpandable && <span className="w-4 mr-1"></span>}

          {/* 键名 */}
          {keyName !== undefined && (
            <>
              <span className="text-red-600 dark:text-red-400 font-semibold">"{keyName}"</span>
              <span className="text-gray-400 dark:text-gray-500">:</span>
              <span className="w-1"></span>
            </>
          )}

          {/* 值或展开信息 */}
          {isExpandable ? (
            <>
              <span className="text-gray-500 dark:text-gray-400">
                {type === 'array' ? '[' : '{'}
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {type === 'array' ? ']' : '}'}
              </span>
            </>
          ) : (
            renderValue(data, type)
          )}
        </div>

        {/* 展开的子节点 */}
        {isExpandable && isExpanded && keys && (
          <div className="relative">
            {/* 连接线 */}
            {level > 0 && (
              <div
                className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"
                style={{ left: `${indentWidth + 10}px` }}
              />
            )}
            {type === 'array' ? (
              data.map((item: any, index: number) => (
                <div key={index} className="relative">
                  {/* 数组项的连接线 */}
                  <div
                    className="absolute left-0 top-0 w-3 h-px bg-gray-300 dark:bg-gray-600"
                    style={{ left: `${indentWidth + 10}px` }}
                  />
                  <TreeNode
                    data={item}
                    keyName={String(index)}
                    level={level + 1}
                    isLast={index === data.length - 1}
                    path={currentPath}
                  />
                </div>
              ))
            ) : (
              Object.entries(data).map(([key, value], index, arr) => (
                <div key={key} className="relative">
                  {/* 对象项的连接线 */}
                  {index < arr.length - 1 && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"
                      style={{ left: `${indentWidth + 10}px` }}
                    />
                  )}
                  <TreeNode
                    data={value}
                    keyName={key}
                    level={level + 1}
                    isLast={index === arr.length - 1}
                    path={currentPath}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCopyKey={handleCopyKey}
          onCopyValue={handleCopyValue}
          hasKey={keyName !== undefined}
        />
      )}
    </>
  );
}

export default function JsonView() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);

  // 自动解析输入
  useEffect(() => {
    if (!input.trim()) {
      setParsedData(null);
      setError('');
      return;
    }

    try {
      setError('');
      const parsed = JSON.parse(input);
      setParsedData(parsed);
    } catch (e) {
      setError('Invalid JSON format');
      setParsedData(null);
    }
  }, [input]);

  const handleFormat = () => {
    if (!input.trim()) return;
    try {
      setError('');
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setInput(formatted);
    } catch (e) {
      setError('Invalid JSON format');
    }
  };

  const handleClear = () => {
    setInput('');
    setParsedData(null);
    setError('');
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">JSON 查看</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">可视化 JSON 数据结构</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFormat}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              格式化
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              清空
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 'calc(100vh - 20rem)' }}>
          {/* 左侧输入框 */}
          <div className="flex flex-col space-y-4 min-h-0">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Input JSON
            </label>
            <div className="flex-1 relative min-h-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="在此粘贴或输入 JSON..."
              />
              {error && (
                <div className="absolute bottom-4 left-4 right-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <span className="text-red-500">⚠</span>
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 右侧树形展示 */}
          <div className="flex flex-col space-y-4 min-h-0">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tree View
            </label>
            <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-y-auto overflow-x-hidden p-4 min-h-0">
              {parsedData ? (
                <div className="font-mono text-sm">
                  <TreeNode data={parsedData} />
                </div>
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🌳</div>
                    <div>输入 JSON 后，树形结构将显示在这里</div>
                    <div className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                      支持展开/折叠节点，右键点击节点可复制
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
