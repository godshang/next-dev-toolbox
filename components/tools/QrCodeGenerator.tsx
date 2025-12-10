'use client';

import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';

export default function QrCodeGenerator() {
  const [content, setContent] = useState('');
  const [size, setSize] = useState(256);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成二维码
  useEffect(() => {
    if (!content.trim()) {
      setQrCodeDataUrl('');
      return;
    }

    const generateQR = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const options = {
          width: size,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: errorCorrectionLevel,
        };

        await QRCode.toCanvas(canvas, content, options);
        const dataUrl = canvas.toDataURL('image/png');
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error('生成二维码失败:', error);
        setQrCodeDataUrl('');
      }
    };

    generateQR();
  }, [content, size, errorCorrectionLevel, fgColor, bgColor]);

  // 下载二维码
  const handleDownload = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'qrcode.png';
    link.click();
  };

  // 复制二维码为图片
  const handleCopyAsImage = async () => {
    if (!qrCodeDataUrl) return;
    
    try {
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('二维码已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请尝试下载');
    }
  };

  // 清空
  const handleClear = () => {
    setContent('');
  };

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">二维码生成器</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">根据输入内容生成二维码</p>
          </div>
          <div className="flex gap-3">
            {content && (
              <>
                <button
                  onClick={handleCopyAsImage}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  复制图片
                </button>
                <button
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  下载
                </button>
              </>
            )}
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              清空
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-8 space-y-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：输入和配置 */}
          <div className="space-y-6">
            {/* 输入区域 */}
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                输入内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入要生成二维码的内容，例如：文本、URL、联系方式等..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm min-h-[200px] resize-none"
              />
            </div>

            {/* 配置选项 */}
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">配置选项</h3>
              
              <div className="space-y-5">
                {/* 尺寸 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    尺寸: <span className="text-blue-600 dark:text-blue-400 font-mono">{size}px</span>
                  </label>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    step="32"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((size - 128) / (512 - 128)) * 100}%, #e5e7eb ${((size - 128) / (512 - 128)) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>128px</span>
                    <span>320px</span>
                    <span>512px</span>
                  </div>
                </div>

                {/* 纠错级别 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    纠错级别
                  </label>
                  <select
                    value={errorCorrectionLevel}
                    onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="L">L - 低 (约 7% 纠错能力)</option>
                    <option value="M">M - 中 (约 15% 纠错能力)</option>
                    <option value="Q">Q - 较高 (约 25% 纠错能力)</option>
                    <option value="H">H - 高 (约 30% 纠错能力)</option>
                  </select>
                </div>

                {/* 前景色 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    前景色（二维码颜色）
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* 背景色 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    背景色
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：二维码预览 */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">二维码预览</h3>
              
              {content ? (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      style={{ display: 'none' }}
                    />
                    {qrCodeDataUrl && (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="max-w-full h-auto"
                        style={{ width: size, height: size }}
                      />
                    )}
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                    扫描此二维码即可获取内容
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 min-h-[300px]">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    在左侧输入内容后，二维码将显示在这里
                  </p>
                </div>
              )}
            </div>

            {/* 使用说明 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-blue-500">ℹ️</span>
                使用说明
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>输入任意文本、URL、联系方式等内容</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>可以调整二维码尺寸、纠错级别和颜色</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>点击"下载"保存二维码为 PNG 图片</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>点击"复制图片"将二维码复制到剪贴板</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>纠错级别越高，二维码越复杂，但容错能力越强</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

