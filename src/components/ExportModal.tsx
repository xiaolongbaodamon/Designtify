import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Smartphone,
  Instagram,
  PlaySquare,
  Twitter,
  Linkedin,
  Pin,
  Sparkles,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { CanvasDesign, CanvasPreset } from '../types/design';
import { CANVAS_PRESETS } from '../data/presets';
import { exportDesign, copyToClipboard } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: CanvasDesign;
  onAdaptPreset: (preset: CanvasPreset) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  design,
  onAdaptPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'platforms' | 'mockup'>('download');
  const [format, setFormat] = useState<'png' | 'jpeg' | 'svg' | 'pdf'>('png');
  const [scale, setScale] = useState<number>(2); // 2x Retina default
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await exportDesign(design, format, scale);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    try {
      await copyToClipboard(design);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickPlatformExport = async (preset: CanvasPreset) => {
    setIsExporting(true);
    try {
      // Create temporary design with adapted dimensions
      const adaptedDesign: CanvasDesign = {
        ...design,
        presetId: preset.id,
        width: preset.width,
        height: preset.height,
      };
      await exportDesign(adaptedDesign, 'png', 2);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export & Social Publish</h2>
              <p className="text-xs text-slate-400">
                1-click instant export optimized for every social platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('download')}
            className={`pb-2.5 border-b-2 transition ${
              activeTab === 'download'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Quick Download
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`pb-2.5 border-b-2 transition ${
              activeTab === 'platforms'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Instant Social Formats (1-Click)
          </button>
          <button
            onClick={() => setActiveTab('mockup')}
            className={`pb-2.5 border-b-2 transition ${
              activeTab === 'mockup'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Live Social Feed Mockup
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: QUICK DOWNLOAD */}
          {activeTab === 'download' && (
            <div className="flex flex-col gap-5">
              {/* Format selection */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                  File Format
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'png', label: 'PNG Image', desc: 'Crisp & high-res' },
                    { id: 'jpeg', label: 'JPEG Image', desc: 'Lightweight & web' },
                    { id: 'svg', label: 'SVG Vector', desc: 'Scalable graphics' },
                    { id: 'pdf', label: 'PDF Document', desc: 'Print & client ready' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id as any)}
                      className={`p-3 rounded-xl border text-left transition ${
                        format === f.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{f.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution / Quality Slider */}
              {format !== 'svg' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Resolution Quality:
                    </label>
                    <span className="text-xs font-mono text-indigo-400 font-bold">
                      {scale}x ({Math.round(design.width * scale)} x{' '}
                      {Math.round(design.height * scale)} px)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { s: 1, label: '1x Standard', info: 'Fast web' },
                      { s: 2, label: '2x Retina HD', info: 'Recommended' },
                      { s: 3, label: '3x Ultra HD', info: 'Print / High DPI' },
                    ].map((item) => (
                      <button
                        key={item.s}
                        onClick={() => setScale(item.s)}
                        className={`py-2 px-3 rounded-xl border text-xs text-left transition ${
                          scale === item.s
                            ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                            : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>{item.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{item.info}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isExporting
                      ? 'Rendering High-Res Graphic...'
                      : `Download ${format.toUpperCase()} (${Math.round(design.width * scale)}x${Math.round(design.height * scale)})`}
                  </span>
                </button>

                <button
                  onClick={handleCopyClipboard}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copy Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-PLATFORM PRESETS */}
          {activeTab === 'platforms' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400 mb-1">
                One-click export directly tailored to the dimensions of each platform:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CANVAS_PRESETS.map((preset) => {
                  return (
                    <div
                      key={preset.id}
                      className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center justify-between hover:border-indigo-500 transition"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{preset.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {preset.width} x {preset.height} ({preset.aspectRatio})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onAdaptPreset(preset);
                            onClose();
                          }}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-semibold rounded-md transition"
                          title="Switch canvas to this preset"
                        >
                          Switch
                        </button>
                        <button
                          onClick={() => handleQuickPlatformExport(preset)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-md flex items-center gap-1 transition"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE FEED MOCKUP */}
          {activeTab === 'mockup' && (
            <div className="flex flex-col items-center">
              <p className="text-xs text-slate-400 mb-3 text-center">
                Preview how your social post looks on an Instagram mobile feed:
              </p>

              {/* Instagram Feed Mockup Card */}
              <div className="w-80 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-xs">
                {/* Mockup Header */}
                <div className="px-3 py-2 flex items-center justify-between border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-0.5">
                      <div className="w-full h-full bg-slate-900 rounded-full" />
                    </div>
                    <span className="font-bold text-white text-[11px]">yourbrand.official</span>
                  </div>
                  <span className="text-slate-500 text-xs">•••</span>
                </div>

                {/* Graphic Preview Container */}
                <div
                  className="w-full aspect-square bg-slate-900 overflow-hidden relative flex items-center justify-center"
                  style={{
                    backgroundColor: design.background.color || '#0f172a',
                    backgroundImage:
                      design.background.type === 'gradient' && design.background.gradient
                        ? `linear-gradient(${design.background.gradient.angle}deg, ${design.background.gradient.from}, ${design.background.gradient.to})`
                        : undefined,
                  }}
                >
                  <div className="text-center p-4">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {design.title}
                    </span>
                    <div className="text-[10px] text-slate-300 mt-1">
                      {design.elements.length} stylized elements
                    </div>
                  </div>
                </div>

                {/* Mockup Footer */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 text-slate-200">
                      <span>♥ 2,418</span>
                      <span>💬 84</span>
                      <span>↗</span>
                    </div>
                    <span>🔖</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <span className="font-bold text-white mr-1.5">yourbrand.official</span>
                    {design.title} • Designed with SparkCraft Studio.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
