'use client';

import { useState, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { useI18n, useToolPage } from '@/lib/i18n';

export default function QrCodeReader() {
  const { t: tc } = useI18n();
  const { t, tool } = useToolPage('qr-reader');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [decodedText, setDecodedText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const decodeQRCode = useCallback(
    async (imageSrc: string) => {
      setIsProcessing(true);
      setError('');
      setDecodedText('');

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageSrc;
        });

        const canvas = canvasRef.current;
        if (!canvas) {
          setError(t('errorCanvasInit'));
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError(t('errorCanvasContext'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          setDecodedText(code.data);
          setError('');
        } else {
          setError(t('errorNoQr'));
        }
      } catch (err) {
        console.error('QR scan failed:', err);
        setError(
          t('errorScanFailed', {
            detail: err instanceof Error ? err.message : String(err),
          })
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [t]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError(t('errorNotImage'));
        return;
      }

      setError('');
      setDecodedText('');

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);

        if (result) {
          decodeQRCode(result);
        }
      };
      reader.readAsDataURL(file);
    },
    [decodeQRCode, t]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleReScan = () => {
    if (imagePreview) {
      decodeQRCode(imagePreview);
    }
  };

  const handleClear = () => {
    setImagePreview('');
    setDecodedText('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(decodedText);
  };

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool?.name ?? ''}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
          <div className="flex gap-3">
            {imagePreview && (
              <button
                onClick={handleReScan}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? t('btnRescanning') : t('btnRescan')}
              </button>
            )}
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {tc('common.clear')}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('labelUpload')}
              </label>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  imagePreview
                    ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Uploaded QR Code"
                      className="max-w-full h-auto mx-auto rounded-lg shadow-md max-h-[400px]"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('dropReplace')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl mb-4">📷</div>
                    <div>
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('dropTitle')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('dropFormats')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-blue-500">🔍</span>
                  {t('resultTitle')}
                </h3>
                {decodedText && (
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                  >
                    {tc('common.copy')}
                  </button>
                )}
              </div>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">{t('processing')}</p>
                </div>
              ) : decodedText ? (
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('labelContent')}</p>
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all whitespace-pre-wrap">
                      {decodedText}
                    </p>
                  </div>

                  {decodedText.startsWith('http://') || decodedText.startsWith('https://') ? (
                    <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('labelQuickLink')}</p>
                      <a
                        href={decodedText}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {decodedText}
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    {imagePreview ? t('emptyNoQr') : t('emptyWaiting')}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-purple-500">ℹ️</span>
                {t('helpTitle')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{t('help1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{t('help2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{t('help3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{t('help4')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{t('help5')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
