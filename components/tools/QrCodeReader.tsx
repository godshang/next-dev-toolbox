'use client';

import { useState, useRef, useCallback } from 'react';
import jsQR from 'jsqr';

export default function QrCodeReader() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [decodedText, setDecodedText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 处理文件选择
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setImageFile(file);
    setError('');
    setDecodedText('');

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      
      // 自动识别
      if (result) {
        decodeQRCode(result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // 识别二维码
  const decodeQRCode = useCallback(async (imageSrc: string) => {
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
        throw new Error('Canvas 未初始化');
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取 Canvas 上下文');
      }

      // 设置 canvas 尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制图片到 canvas
      ctx.drawImage(img, 0, 0);

      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // 使用 jsQR 识别二维码
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        setDecodedText(code.data);
        setError('');
      } else {
        setError('未检测到二维码，请确保图片清晰且包含有效的二维码');
      }
    } catch (err) {
      console.error('识别失败:', err);
      setError('识别失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // 处理文件输入
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 处理拖拽
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

  // 重新识别
  const handleReScan = () => {
    if (imagePreview) {
      decodeQRCode(imagePreview);
    }
  };

  // 清空
  const handleClear = () => {
    setImageFile(null);
    setImagePreview('');
    setDecodedText('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 复制结果
  const handleCopy = () => {
    navigator.clipboard.writeText(decodedText);
  };

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">二维码识别</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">上传二维码图片并识别内容</p>
          </div>
          <div className="flex gap-3">
            {imagePreview && (
              <button
                onClick={handleReScan}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? '识别中...' : '重新识别'}
              </button>
            )}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：图片上传 */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                上传二维码图片
              </label>
              
              {/* 拖拽上传区域 */}
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
                      ref={imageRef}
                      src={imagePreview}
                      alt="Uploaded QR Code"
                      className="max-w-full h-auto mx-auto rounded-lg shadow-md max-h-[400px]"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      点击或拖拽新图片替换
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl mb-4">📷</div>
                    <div>
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        点击或拖拽图片到这里
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        支持 JPG、PNG、GIF 等图片格式
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：识别结果 */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-blue-500">🔍</span>
                  识别结果
                </h3>
                {decodedText && (
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                  >
                    复制
                  </button>
                )}
              </div>
              
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">正在识别二维码...</p>
                </div>
              ) : decodedText ? (
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">识别内容：</p>
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all whitespace-pre-wrap">
                      {decodedText}
                    </p>
                  </div>
                  
                  {/* 如果是 URL，显示链接 */}
                  {decodedText.startsWith('http://') || decodedText.startsWith('https://') ? (
                    <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">快速访问：</p>
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
                    {imagePreview ? '未检测到二维码' : '上传图片后，识别结果将显示在这里'}
                  </p>
                </div>
              )}
            </div>

            {/* 使用说明 */}
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-purple-500">ℹ️</span>
                使用说明
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>支持点击上传或拖拽图片到上传区域</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>支持 JPG、PNG、GIF 等常见图片格式</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>上传后会自动识别二维码内容</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>如果识别失败，可以点击"重新识别"按钮</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>识别出的 URL 会自动显示为可点击链接</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 隐藏的 canvas 用于图像处理 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

