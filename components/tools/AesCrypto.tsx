'use client';

import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { useI18n, useToolPage } from '@/lib/i18n';

type Mode = 'encrypt' | 'decrypt';
type KeySize = 128 | 256;
type AesMode = 'CBC' | 'ECB';
type OutputFormat = 'base64' | 'hex';

function parseKey(key: string, keySize: KeySize): CryptoJS.lib.WordArray {
  const wordArray = CryptoJS.enc.Utf8.parse(key);
  const bytes = keySize / 8;
  const hex = CryptoJS.enc.Hex.stringify(wordArray).padEnd(bytes * 2, '0').slice(0, bytes * 2);
  return CryptoJS.enc.Hex.parse(hex);
}

function parseIv(iv: string): CryptoJS.lib.WordArray {
  const wordArray = CryptoJS.enc.Utf8.parse(iv);
  const hex = CryptoJS.enc.Hex.stringify(wordArray).padEnd(32, '0').slice(0, 32);
  return CryptoJS.enc.Hex.parse(hex);
}

export default function AesCrypto() {
  const { t: tc } = useI18n();
  const { t, tool } = useToolPage('aes-crypto');
  const [mode, setMode] = useState<Mode>('encrypt');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [keySize, setKeySize] = useState<KeySize>(256);
  const [aesMode, setAesMode] = useState<AesMode>('CBC');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('base64');
  const [error, setError] = useState('');

  const handleProcess = () => {
    setError('');
    setOutput('');

    if (!input.trim()) {
      setError(t('errorEmptyInput'));
      return;
    }
    if (!key.trim()) {
      setError(t('errorEmptyKey'));
      return;
    }
    if (aesMode === 'CBC' && !iv.trim()) {
      setError(t('errorCbcNeedsIv'));
      return;
    }

    try {
      const parsedKey = parseKey(key, keySize);
      const options = {
        mode: aesMode === 'CBC' ? CryptoJS.mode.CBC : CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
        ...(aesMode === 'CBC' ? { iv: parseIv(iv) } : {}),
      };

      if (mode === 'encrypt') {
        const encrypted = CryptoJS.AES.encrypt(input, parsedKey, options);
        setOutput(
          outputFormat === 'base64'
            ? encrypted.toString()
            : encrypted.ciphertext.toString(CryptoJS.enc.Hex)
        );
      } else {
        let ciphertext = input.trim();
        if (outputFormat === 'hex') {
          const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Hex.parse(ciphertext),
          });
          ciphertext = CryptoJS.enc.Base64.stringify(cipherParams.ciphertext);
        }
        const decrypted = CryptoJS.AES.decrypt(ciphertext, parsedKey, options);
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        if (!result) throw new Error(t('errorDecryptFailed'));
        setOutput(result);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setError(msg === t('errorDecryptFailed') ? msg : t('errorOperationFailed'));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const selectClass =
    'px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool?.name ?? ''}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {t('privacyNote')}
        </div>

        <div className="flex gap-3 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl">
          {(['encrypt', 'decrypt'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setOutput(''); setError(''); }}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                mode === m
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {m === 'encrypt' ? tc('common.encrypt') : tc('common.decrypt')}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">{t('labelKeySize')}</label>
            <select value={keySize} onChange={e => setKeySize(Number(e.target.value) as KeySize)} className={selectClass}>
              <option value={128}>AES-128</option>
              <option value={256}>AES-256</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">{t('labelMode')}</label>
            <select value={aesMode} onChange={e => setAesMode(e.target.value as AesMode)} className={selectClass}>
              <option value="CBC">CBC</option>
              <option value="ECB">ECB</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">{t('labelOutputFormat')}</label>
            <select value={outputFormat} onChange={e => setOutputFormat(e.target.value as OutputFormat)} className={selectClass}>
              <option value="base64">Base64</option>
              <option value="hex">Hex</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{t('labelKey')}</label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={keySize === 128 ? t('placeholderKey128') : t('placeholderKey256')}
            />
          </div>
          {aesMode === 'CBC' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{t('labelIv')}</label>
              <input
                type="text"
                value={iv}
                onChange={e => setIv(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('placeholderIv')}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {mode === 'encrypt' ? t('labelPlaintext') : t('labelCiphertext')}
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={mode === 'encrypt' ? t('placeholderEncrypt') : t('placeholderDecrypt')}
          />
        </div>

        <button
          type="button"
          onClick={handleProcess}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 shadow-md transition-all"
        >
          {mode === 'encrypt' ? tc('common.encrypt') : tc('common.decrypt')}
        </button>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {mode === 'encrypt' ? t('labelCiphertext') : t('labelPlaintext')}
              </label>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {tc('common.copy')}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
