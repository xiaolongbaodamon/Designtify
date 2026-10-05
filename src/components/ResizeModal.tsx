import React, { useState } from 'react';
import {
  X,
  Maximize2,
  Lock,
  Unlock,
  Check,
  Sparkles,
  Smartphone,
  Instagram,
  PlaySquare,
  Twitter,
  Linkedin,
  Pin,
  ArrowRight,
} from 'lucide-react';
import { CanvasPreset } from '../types/design';
import { CANVAS_PRESETS } from '../data/presets';

interface ResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidth: number;
  currentHeight: number;
  currentPresetId: string;
  onApplyResize: (width: number, height: number, presetId?: string, copyAndResize?: boolean) => void;
}

export const ResizeModal: React.FC<ResizeModalProps> = ({
  isOpen,
  onClose,
  currentWidth,
  currentHeight,
  currentPresetId,
  onApplyResize,
}) => {
  const [width, setWidth] = useState<number>(currentWidth);
  const [height, setHeight] = useState<number>(currentHeight);
  const [lockRatio, setLockRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number>(currentWidth / currentHeight);
  const [selectedPreset, setSelectedPreset] = useState<string>(currentPresetId);

  if (!isOpen) return null;

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio && val > 0 && aspectRatio > 0) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio && val > 0 && aspectRatio > 0) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const handleSelectPreset = (preset: CanvasPreset) => {
    setSelectedPreset(preset.id);
    setWidth(preset.width);
    setHeight(preset.height);
    setAspectRatio(preset.width / preset.height);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Resize & Magic Switch
                <span className="text-[10px] bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Change canvas dimensions or convert across social platforms
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

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
          {/* Custom Dimension Inputs */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Custom Dimensions
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Width</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 100)}
                    className="w-20 bg-transparent text-right font-mono text-sm font-bold text-white outline-none"
                  />
                  <span className="text-xs text-slate-500 font-mono">px</span>
                </div>
              </div>

              <button
                onClick={() => setLockRatio(!lockRatio)}
                className={`p-2.5 rounded-xl border transition ${
                  lockRatio
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title={lockRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
              >
                {lockRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>

              <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Height</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 100)}
                    className="w-20 bg-transparent text-right font-mono text-sm font-bold text-white outline-none"
                  />
                  <span className="text-xs text-slate-500 font-mono">px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Platform Formats */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Convert to Social Media Format
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CANVAS_PRESETS.map((p) => {
                const isSelected = selectedPreset === p.id && width === p.width && height === p.height;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.width} x {p.height} ({p.aspectRatio})
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                onApplyResize(width, height, selectedPreset, false);
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>Resize Current Design</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onApplyResize(width, height, selectedPreset, true);
                onClose();
              }}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition"
            >
              Copy & Resize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
