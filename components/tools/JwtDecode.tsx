'use client';

import { useState, useMemo } from 'react';

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return decodeURIComponent(
    binary
      .split('')
      .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
}

function formatJson(jsonStr: string): string {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch {
    return jsonStr;
  }
}

function formatTimestamp(ts: number): string {
  const ms = ts > 1e12 ? ts : ts * 1000;
  return new Date(ms).toLocaleString('zh-CN', { hour12: false });
}

interface ClaimInfo {
  key: string;
  value: string;
  note?: string;
  warn?: boolean;
}

function parseJwt(token: string): { data: ParsedJwt | null; error: string } {
  if (!token.trim()) return { data: null, error: '' };

  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      throw new Error('JWT 必须包含 Header.Payload.Signature 三段');
    }

    const [headerRaw, payloadRaw, signature] = parts;
    const headerJson = decodeBase64Url(headerRaw);
    const payloadJson = decodeBase64Url(payloadRaw);

    JSON.parse(headerJson);
    const payload = JSON.parse(payloadJson);

    const claims: ClaimInfo[] = [];
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp != null) {
      const expired = payload.exp < now;
      claims.push({
        key: 'exp',
        value: formatTimestamp(payload.exp),
        note: expired ? '已过期' : '未过期',
        warn: expired,
      });
    }
    if (payload.iat != null) {
      claims.push({ key: 'iat', value: formatTimestamp(payload.iat), note: '签发时间' });
    }
    if (payload.nbf != null) {
      const notYet = payload.nbf > now;
      claims.push({
        key: 'nbf',
        value: formatTimestamp(payload.nbf),
        note: notYet ? '尚未生效' : '已生效',
        warn: notYet,
      });
    }

    return {
      data: {
        header: formatJson(headerJson),
        payload: formatJson(payloadJson),
        signature,
        claims,
      },
      error: '',
    };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'JWT 解析失败' };
  }
}

interface ParsedJwt {
  header: string;
  payload: string;
  signature: string;
  claims: ClaimInfo[];
}

export default function JwtDecode() {
  const [token, setToken] = useState('');

  const { data: parsed, error } = useMemo(() => parseJwt(token), [token]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">JWT 解析</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          解码 JWT Token 的 Header 和 Payload（仅本地解析，不上传）
        </p>
      </div>

      <div className="p-8 space-y-6">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          🔒 数据仅在浏览器本地解析，不会上传到服务器
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">JWT Token</label>
          <textarea
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="粘贴 JWT Token（eyJhbGciOiJIUzI1NiIs...）"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {parsed && (
          <>
            {parsed.claims.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">时间声明</label>
                <div className="flex flex-wrap gap-2">
                  {parsed.claims.map(claim => (
                    <div
                      key={claim.key}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                        claim.warn
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      }`}
                    >
                      <span className="font-mono font-semibold">{claim.key}</span>
                      <span>{claim.value}</span>
                      {claim.note && <span className="text-xs opacity-80">({claim.note})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { title: 'Header', content: parsed.header },
                { title: 'Payload', content: parsed.payload },
              ].map(block => (
                <div key={block.title} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{block.title}</label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(block.content)}
                      className="text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      复制
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-800 dark:text-gray-200 overflow-auto max-h-80 whitespace-pre-wrap">
                    {block.content}
                  </pre>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Signature</label>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-sm break-all text-gray-600 dark:text-gray-400">
                {parsed.signature}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
