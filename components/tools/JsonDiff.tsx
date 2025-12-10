'use client';

import { useState, useEffect, useRef } from 'react';

// JSON 语法高亮函数
const highlightJSON = (text: string): string => {
  if (!text.trim()) return '';
  
  // 转义 HTML
  let highlighted = escapeHtml(text);
  
  // 1. 先高亮键名（"key": 格式，后面跟着冒号）
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
  
  // 2. 高亮字符串值
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
  
  // 3. 高亮数字
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
  
  // 4. 高亮布尔值和 null
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

type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

interface DiffNode {
  type: DiffType;
  key?: string;
  oldValue?: any;
  newValue?: any;
  children?: Record<string, DiffNode>;
}

function compareJson(oldJson: any, newJson: any): DiffNode {
  // 如果两个值完全相同
  if (JSON.stringify(oldJson) === JSON.stringify(newJson)) {
    return {
      type: 'unchanged',
      oldValue: oldJson,
      newValue: newJson,
    };
  }

  // 如果一个是 null 或 undefined
  if (oldJson === null || oldJson === undefined) {
    return {
      type: 'added',
      newValue: newJson,
    };
  }

  if (newJson === null || newJson === undefined) {
    return {
      type: 'removed',
      oldValue: oldJson,
    };
  }

  // 如果类型不同
  if (typeof oldJson !== typeof newJson) {
    return {
      type: 'modified',
      oldValue: oldJson,
      newValue: newJson,
    };
  }

  // 如果是数组
  if (Array.isArray(oldJson) && Array.isArray(newJson)) {
    const maxLength = Math.max(oldJson.length, newJson.length);
    const children: Record<string, DiffNode> = {};
    
    for (let i = 0; i < maxLength; i++) {
      const oldItem = oldJson[i];
      const newItem = newJson[i];
      
      if (i >= oldJson.length) {
        children[String(i)] = {
          type: 'added',
          newValue: newItem,
        };
      } else if (i >= newJson.length) {
        children[String(i)] = {
          type: 'removed',
          oldValue: oldItem,
        };
      } else {
        children[String(i)] = compareJson(oldItem, newItem);
      }
    }
    
    return {
      type: 'modified',
      oldValue: oldJson,
      newValue: newJson,
      children,
    };
  }

  // 如果是对象
  if (typeof oldJson === 'object' && typeof newJson === 'object') {
    const allKeys = new Set([...Object.keys(oldJson), ...Object.keys(newJson)]);
    const children: Record<string, DiffNode> = {};
    
    allKeys.forEach(key => {
      const oldVal = oldJson[key];
      const newVal = newJson[key];
      
      if (!(key in oldJson)) {
        children[key] = {
          type: 'added',
          key,
          newValue: newVal,
        };
      } else if (!(key in newJson)) {
        children[key] = {
          type: 'removed',
          key,
          oldValue: oldVal,
        };
      } else {
        children[key] = {
          ...compareJson(oldVal, newVal),
          key,
        };
      }
    });
    
    return {
      type: 'modified',
      oldValue: oldJson,
      newValue: newJson,
      children,
    };
  }

  // 基本类型值不同
  return {
    type: 'modified',
    oldValue: oldJson,
    newValue: newJson,
  };
}

interface DiffTreeNodeProps {
  node: DiffNode;
  level?: number;
  keyName?: string;
}

function DiffTreeNode({ node, level = 0, keyName }: DiffTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const indentWidth = level * 24;

  const getDiffColor = (type: DiffType) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'removed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'modified':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-transparent';
    }
  };

  const getTextColor = (type: DiffType) => {
    switch (type) {
      case 'added':
        return 'text-green-700 dark:text-green-400';
      case 'removed':
        return 'text-red-700 dark:text-red-400';
      case 'modified':
        return 'text-yellow-700 dark:text-yellow-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getValueColor = (type: DiffType, isOld: boolean = false) => {
    if (type === 'added') return 'text-green-600 dark:text-green-400';
    if (type === 'removed') return 'text-red-600 dark:text-red-400';
    if (type === 'modified' && isOld) return 'text-red-600 dark:text-red-400 line-through';
    if (type === 'modified' && !isOld) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const renderValue = (value: any, type: DiffType, isOld: boolean = false) => {
    if (value === null) {
      return <span className={getValueColor(type, isOld)}>null</span>;
    }
    if (typeof value === 'string') {
      return <span className={getValueColor(type, isOld)}>"{value}"</span>;
    }
    if (typeof value === 'object') {
      return <span className={getValueColor(type, isOld)}>{Array.isArray(value) ? '[...]' : '{...}'}</span>;
    }
    return <span className={getValueColor(type, isOld)}>{String(value)}</span>;
  };

  const hasChildren = node.children && Object.keys(node.children).length > 0;
  const isExpandable = hasChildren || (node.type === 'modified' && typeof node.oldValue === 'object' && typeof node.newValue === 'object');

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1.5 py-1 rounded px-2 -mx-2 transition-colors border-l-2 ${getDiffColor(node.type)}`}
        style={{ paddingLeft: `${indentWidth + 8}px` }}
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

        {/* 差异标记 */}
        <span className={`text-xs font-bold ${getTextColor(node.type)}`}>
          {node.type === 'added' && '+'}
          {node.type === 'removed' && '-'}
          {node.type === 'modified' && '~'}
          {node.type === 'unchanged' && '='}
        </span>

        {/* 键名 */}
        {keyName !== undefined && (
          <>
            <span className={`font-semibold ${getTextColor(node.type)}`}>"{keyName}"</span>
            <span className="text-gray-400 dark:text-gray-500">:</span>
            <span className="w-1"></span>
          </>
        )}

        {/* 值显示 */}
        {node.type === 'added' && (
          <span className={getValueColor(node.type)}>
            {renderValue(node.newValue, node.type)}
          </span>
        )}
        {node.type === 'removed' && (
          <span className={getValueColor(node.type, true)}>
            {renderValue(node.oldValue, node.type, true)}
          </span>
        )}
        {node.type === 'modified' && !hasChildren && (
          <>
            <span className={getValueColor(node.type, true)}>
              {renderValue(node.oldValue, node.type, true)}
            </span>
            <span className="text-gray-400 dark:text-gray-500 mx-2">→</span>
            <span className={getValueColor(node.type, false)}>
              {renderValue(node.newValue, node.type, false)}
            </span>
          </>
        )}
        {node.type === 'modified' && hasChildren && (
          <span className="text-gray-500 dark:text-gray-400">
            {Array.isArray(node.oldValue) ? '[' : '{'}
            <span className="text-xs ml-1">
              {Object.keys(node.children || {}).length} items
            </span>
            {Array.isArray(node.oldValue) ? ']' : '}'}
          </span>
        )}
        {node.type === 'unchanged' && (
          <span className={getValueColor(node.type)}>
            {renderValue(node.oldValue, node.type)}
          </span>
        )}
      </div>

      {/* 展开的子节点 */}
      {isExpandable && isExpanded && node.children && (
        <div className="relative">
          {Object.entries(node.children).map(([key, childNode]) => (
            <DiffTreeNode
              key={key}
              node={childNode}
              level={level + 1}
              keyName={key}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function JsonDiff() {
  const [json1, setJson1] = useState('');
  const [json2, setJson2] = useState('');
  const [error1, setError1] = useState('');
  const [error2, setError2] = useState('');
  const [diffResult, setDiffResult] = useState<DiffNode | null>(null);
  
  const textarea1Ref = useRef<HTMLTextAreaElement>(null);
  const highlight1Ref = useRef<HTMLDivElement>(null);
  const textarea2Ref = useRef<HTMLTextAreaElement>(null);
  const highlight2Ref = useRef<HTMLDivElement>(null);

  // 同步滚动
  useEffect(() => {
    const textarea1 = textarea1Ref.current;
    const highlight1 = highlight1Ref.current;
    
    if (textarea1 && highlight1) {
      const handleScroll = () => {
        highlight1.scrollTop = textarea1.scrollTop;
        highlight1.scrollLeft = textarea1.scrollLeft;
      };
      
      textarea1.addEventListener('scroll', handleScroll);
      return () => textarea1.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const textarea2 = textarea2Ref.current;
    const highlight2 = highlight2Ref.current;
    
    if (textarea2 && highlight2) {
      const handleScroll = () => {
        highlight2.scrollTop = textarea2.scrollTop;
        highlight2.scrollLeft = textarea2.scrollLeft;
      };
      
      textarea2.addEventListener('scroll', handleScroll);
      return () => textarea2.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (!json1.trim() || !json2.trim()) {
      setDiffResult(null);
      return;
    }

    try {
      setError1('');
      setError2('');
      const parsed1 = JSON.parse(json1);
      const parsed2 = JSON.parse(json2);
      const diff = compareJson(parsed1, parsed2);
      setDiffResult(diff);
    } catch (e) {
      if (json1.trim()) {
        try {
          JSON.parse(json1);
        } catch {
          setError1('第一个 JSON 格式错误');
        }
      }
      if (json2.trim()) {
        try {
          JSON.parse(json2);
        } catch {
          setError2('第二个 JSON 格式错误');
        }
      }
    }
  }, [json1, json2]);

  const handleFormat = (json: string, setJson: (value: string) => void, setError: (error: string) => void) => {
    if (!json.trim()) return;
    try {
      setError('');
      const parsed = JSON.parse(json);
      const formatted = JSON.stringify(parsed, null, 2);
      setJson(formatted);
    } catch (e) {
      setError('Invalid JSON format');
    }
  };

  const handleClear = () => {
    setJson1('');
    setJson2('');
    setError1('');
    setError2('');
    setDiffResult(null);
  };

  const highlightedJson1 = highlightJSON(json1);
  const highlightedJson2 = highlightJSON(json2);

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">JSON Diff</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">比较两个 JSON 的差异</p>
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
      </div>
      
      <div className="p-8 space-y-6">
        {/* 上部分：两个 JSON 输入框 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：JSON 1 */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                JSON 1 (旧版本)
              </label>
              <button
                onClick={() => handleFormat(json1, setJson1, setError1)}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              >
                格式化
              </button>
            </div>
            <div className="flex-1 relative min-h-[300px]">
              {/* 语法高亮层 */}
              <div
                ref={highlight1Ref}
                className="absolute inset-0 p-4 overflow-auto font-mono text-sm whitespace-pre-wrap break-words pointer-events-none bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600"
              >
                {json1 ? (
                  <div dangerouslySetInnerHTML={{ __html: highlightedJson1 }} />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500">输入第一个 JSON...</div>
                )}
              </div>
              
              {/* 输入层 */}
              <textarea
                ref={textarea1Ref}
                value={json1}
                onChange={(e) => {
                  setJson1(e.target.value);
                  setError1('');
                }}
                className="absolute inset-0 w-full h-full p-4 border-0 bg-transparent text-transparent caret-blue-600 dark:caret-blue-400 font-mono text-sm resize-none focus:outline-none overflow-auto rounded-xl border border-gray-300 dark:border-gray-600"
                placeholder=""
                style={{
                  caretColor: '#2563eb',
                }}
              />
              {error1 && (
                <div className="absolute bottom-4 left-4 right-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2 z-10">
                  <span className="text-red-500">⚠</span>
                  {error1}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：JSON 2 */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                JSON 2 (新版本)
              </label>
              <button
                onClick={() => handleFormat(json2, setJson2, setError2)}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              >
                格式化
              </button>
            </div>
            <div className="flex-1 relative min-h-[300px]">
              {/* 语法高亮层 */}
              <div
                ref={highlight2Ref}
                className="absolute inset-0 p-4 overflow-auto font-mono text-sm whitespace-pre-wrap break-words pointer-events-none bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600"
              >
                {json2 ? (
                  <div dangerouslySetInnerHTML={{ __html: highlightedJson2 }} />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500">输入第二个 JSON...</div>
                )}
              </div>
              
              {/* 输入层 */}
              <textarea
                ref={textarea2Ref}
                value={json2}
                onChange={(e) => {
                  setJson2(e.target.value);
                  setError2('');
                }}
                className="absolute inset-0 w-full h-full p-4 border-0 bg-transparent text-transparent caret-blue-600 dark:caret-blue-400 font-mono text-sm resize-none focus:outline-none overflow-auto rounded-xl border border-gray-300 dark:border-gray-600"
                placeholder=""
                style={{
                  caretColor: '#2563eb',
                }}
              />
              {error2 && (
                <div className="absolute bottom-4 left-4 right-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2 z-10">
                  <span className="text-red-500">⚠</span>
                  {error2}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 下部分：差异展示 */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              差异对比
            </label>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded"></span>
                <span>新增</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded"></span>
                <span>删除</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded"></span>
                <span>修改</span>
              </span>
            </div>
          </div>
          <div className="border border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-y-auto overflow-x-hidden p-4 min-h-[400px] max-h-[600px]">
            {diffResult ? (
              <div className="font-mono text-sm">
                <DiffTreeNode node={diffResult} />
              </div>
            ) : (
              <div className="text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <div>输入两个 JSON 后，差异将显示在这里</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
