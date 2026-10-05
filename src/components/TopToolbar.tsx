import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Trash2,
  Lock,
  Unlock,
  BringToFront,
  SendToBack,
  Sliders,
  Type,
  Maximize,
  Sparkles,
  ChevronDown,
  Palette,
  FlipHorizontal,
  FlipVertical,
  Wand2,
  Layers,
  Sparkle,
  Scissors,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  CanvasElement,
  TextElement,
  ShapeElement,
  ImageElement,
  CanvasBackground,
  TextEffect,
  AnimationType,
} from '../types/design';

interface TopToolbarProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDuplicateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  background: CanvasBackground;
  onUpdateBackground: (bg: CanvasBackground) => void;
  onPlayAnimation?: () => void;
}

const FONTS = [
  'Inter',
  'Montserrat',
  'Bebas Neue',
  'Playfair Display',
  'Space Grotesk',
  'Plus Jakarta Sans',
  'Poppins',
  'Caveat',
  'Cinzel',
  'DM Sans',
];

const PRESET_COLORS = [
  '#ffffff',
  '#0f172a',
  '#f43f5e',
  '#ec4899',
  '#8b5cf6',
  '#6366f1',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#84cc16',
  '#eab308',
  '#f97316',
];

export const TopToolbar: React.FC<TopToolbarProps> = ({
  selectedElement,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onBringToFront,
  onSendToBack,
  background,
  onUpdateBackground,
  onPlayAnimation,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [showSpacingPopover, setShowSpacingPopover] = useState(false);
  const [showAnimatePopover, setShowAnimatePopover] = useState(false);
  const [showImageAdjust, setShowImageAdjust] = useState(false);

  // Background toolbar if no element is selected
  if (!selectedElement) {
    return (
      <div className="h-11 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 select-none z-20">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" /> Canvas Theme:
          </span>
          <div className="flex items-center gap-1.5">
            {PRESET_COLORS.slice(0, 8).map((color) => (
              <button
                key={color}
                onClick={() => onUpdateBackground({ type: 'solid', color })}
                className="w-5 h-5 rounded-full border border-slate-700/80 transition transform hover:scale-110 shadow-sm"
                style={{ backgroundColor: color }}
                title={`Set background to ${color}`}
              />
            ))}
            <input
              type="color"
              value={background.color || '#0f172a'}
              onChange={(e) => onUpdateBackground({ type: 'solid', color: e.target.value })}
              className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer ml-1"
              title="Custom background color"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onPlayAnimation && (
            <button
              onClick={onPlayAnimation}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md border border-slate-700 transition cursor-pointer"
            >
              <Play className="w-3 h-3 text-indigo-400" />
              <span>Preview Motion</span>
            </button>
          )}
          <span className="text-[11px] text-slate-500 hidden sm:block">
            Click any canvas element to unlock Pro styling tools
          </span>
        </div>
      </div>
    );
  }

  // 1. TEXT ELEMENT TOOLBAR (Canva-grade)
  if (selectedElement.type === 'text') {
    const textEl = selectedElement as TextElement;

    return (
      <div className="h-11 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 z-20 text-xs text-slate-300 select-none">
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Font Family Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className="flex items-center justify-between gap-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-md font-medium text-slate-200 min-w-[110px] text-left transition"
            >
              <span className="truncate" style={{ fontFamily: textEl.fontFamily }}>
                {textEl.fontFamily || 'Inter'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showFontDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowFontDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 max-h-56 overflow-y-auto">
                  {FONTS.map((font) => (
                    <button
                      key={font}
                      onClick={() => {
                        onUpdateElement(textEl.id, { fontFamily: font });
                        setShowFontDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 transition ${
                        textEl.fontFamily === font
                          ? 'text-indigo-400 font-bold bg-indigo-950/30'
                          : 'text-slate-200'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Font Size (+ / - / direct) */}
          <div className="flex items-center bg-slate-800 rounded-md border border-slate-700 px-1 py-0.5">
            <button
              onClick={() =>
                onUpdateElement(textEl.id, {
                  fontSize: Math.max(10, (textEl.fontSize || 32) - 4),
                })
              }
              className="px-1.5 py-0.5 text-slate-400 hover:text-white rounded"
            >
              -
            </button>
            <input
              type="number"
              value={textEl.fontSize || 32}
              onChange={(e) =>
                onUpdateElement(textEl.id, {
                  fontSize: Math.max(8, parseInt(e.target.value) || 12),
                })
              }
              className="w-9 text-center bg-transparent font-mono text-[11px] text-white outline-none"
            />
            <button
              onClick={() =>
                onUpdateElement(textEl.id, {
                  fontSize: Math.min(240, (textEl.fontSize || 32) + 4),
                })
              }
              className="px-1.5 py-0.5 text-slate-400 hover:text-white rounded"
            >
              +
            </button>
          </div>

          {/* Color Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-md"
              title="Text Color"
            >
              <span
                className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                style={{ backgroundColor: textEl.color || '#ffffff' }}
              />
              <span className="font-mono text-[10px] uppercase hidden sm:inline">
                {textEl.color || '#ffffff'}
              </span>
            </button>

            {showColorPicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowColorPicker(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-2 z-50">
                  <div className="grid grid-cols-6 gap-1.5 mb-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          onUpdateElement(textEl.id, { color: c });
                          setShowColorPicker(false);
                        }}
                        className="w-6 h-6 rounded-md border border-slate-700 hover:scale-110 transition"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400">Custom</span>
                    <input
                      type="color"
                      value={textEl.color || '#ffffff'}
                      onChange={(e) => onUpdateElement(textEl.id, { color: e.target.value })}
                      className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Formatting: Bold, Italic, Underline */}
          <div className="flex items-center bg-slate-800 rounded-md border border-slate-700 p-0.5">
            <button
              onClick={() =>
                onUpdateElement(textEl.id, {
                  fontWeight: textEl.fontWeight === 'bold' || textEl.fontWeight === 700 ? 400 : 700,
                })
              }
              className={`p-1.5 rounded transition ${
                textEl.fontWeight === 'bold' || textEl.fontWeight === 700
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                onUpdateElement(textEl.id, {
                  fontStyle: textEl.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`p-1.5 rounded transition ${
                textEl.fontStyle === 'italic'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                onUpdateElement(textEl.id, {
                  textDecoration:
                    textEl.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
              className={`p-1.5 rounded transition ${
                textEl.textDecoration === 'underline'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center bg-slate-800 rounded-md border border-slate-700 p-0.5">
            <button
              onClick={() => onUpdateElement(textEl.id, { textAlign: 'left' })}
              className={`p-1.5 rounded transition ${
                textEl.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement(textEl.id, { textAlign: 'center' })}
              className={`p-1.5 rounded transition ${
                textEl.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement(textEl.id, { textAlign: 'right' })}
              className={`p-1.5 rounded transition ${
                textEl.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Canva-grade "Effects" Button (Shadow, Neon, Hollow, Glitch, Echo, Splice) */}
          <div className="relative">
            <button
              onClick={() => setShowEffectsModal(!showEffectsModal)}
              className={`px-2.5 py-1 rounded-md border flex items-center gap-1 font-semibold transition ${
                textEl.effect && textEl.effect !== 'none'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Effects</span>
            </button>

            {showEffectsModal && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowEffectsModal(false)}
                />
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 flex flex-col gap-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Text Style Effects
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'shadow', label: 'Shadow' },
                      { id: 'lift', label: 'Lift' },
                      { id: 'hollow', label: 'Hollow' },
                      { id: 'splice', label: 'Splice' },
                      { id: 'echo', label: 'Echo' },
                      { id: 'glitch', label: 'Glitch' },
                      { id: 'neon', label: 'Neon' },
                    ].map((eff) => (
                      <button
                        key={eff.id}
                        onClick={() => {
                          onUpdateElement(textEl.id, { effect: eff.id as TextEffect });
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-semibold transition ${
                          (textEl.effect || 'none') === eff.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                            : 'bg-slate-800 border-slate-700/60 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        {eff.label}
                      </button>
                    ))}
                  </div>

                  {/* Curve Slider */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300">Curve Text</span>
                      <span className="font-mono text-slate-400">{textEl.curveAngle || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={textEl.curveAngle || 0}
                      onChange={(e) =>
                        onUpdateElement(textEl.id, { curveAngle: parseInt(e.target.value) })
                      }
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Canva-grade "Animate" Motion Button */}
          <div className="relative">
            <button
              onClick={() => setShowAnimatePopover(!showAnimatePopover)}
              className={`px-2.5 py-1 rounded-md border flex items-center gap-1 font-semibold transition ${
                textEl.animation && textEl.animation !== 'none'
                  ? 'bg-pink-600 text-white border-pink-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-pink-300" />
              <span>Animate</span>
            </button>

            {showAnimatePopover && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAnimatePopover(false)}
                />
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Entry Motion
                  </div>
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'fade', label: 'Fade In' },
                    { id: 'pop', label: 'Pop / Bounce' },
                    { id: 'slide', label: 'Slide in' },
                    { id: 'pulse', label: 'Pulse' },
                    { id: 'glow', label: 'Neon Glow' },
                  ].map((anim) => (
                    <button
                      key={anim.id}
                      onClick={() => {
                        onUpdateElement(textEl.id, { animation: anim.id as AnimationType });
                        setShowAnimatePopover(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        (textEl.animation || 'none') === anim.id
                          ? 'bg-pink-600/30 text-pink-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => onBringToFront(textEl.id)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            title="Bring to Front"
          >
            <BringToFront className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSendToBack(textEl.id)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            title="Send to Back"
          >
            <SendToBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicateElement(textEl.id)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateElement(textEl.id, { locked: !textEl.locked })}
            className={`p-1.5 rounded-md transition ${
              textEl.locked ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400 hover:text-white'
            }`}
            title={textEl.locked ? 'Unlock element' : 'Lock element'}
          >
            {textEl.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDeleteElement(textEl.id)}
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-md transition"
            title="Delete element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. IMAGE ELEMENT TOOLBAR (Magic Cutout / Bg Remover + Filters)
  if (selectedElement.type === 'image') {
    const imgEl = selectedElement as ImageElement;

    return (
      <div className="h-11 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 z-20 text-xs text-slate-300 select-none">
        <div className="flex items-center gap-2 shrink-0">
          {/* Magic Background Remover / Cutout (Pro feature) */}
          <button
            onClick={() => onUpdateElement(imgEl.id, { isCutout: !imgEl.isCutout })}
            className={`px-3 py-1 rounded-md border flex items-center gap-1.5 font-bold transition ${
              imgEl.isCutout
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-amber-300" />
            <span>{imgEl.isCutout ? 'Cutout Active' : 'Magic Cutout / BG Remover'}</span>
          </button>

          {/* Quick Filters */}
          <div className="flex items-center bg-slate-800 rounded-md border border-slate-700 p-0.5">
            <button
              onClick={() =>
                onUpdateElement(imgEl.id, {
                  filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 },
                })
              }
              className="px-2 py-1 text-[11px] text-slate-300 hover:text-white rounded"
            >
              Normal
            </button>
            <button
              onClick={() =>
                onUpdateElement(imgEl.id, {
                  filters: { brightness: 110, contrast: 125, saturate: 140, grayscale: 0, sepia: 0 },
                })
              }
              className="px-2 py-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold rounded"
            >
              Vivid
            </button>
            <button
              onClick={() =>
                onUpdateElement(imgEl.id, {
                  filters: { brightness: 105, contrast: 130, saturate: 0, grayscale: 100, sepia: 0 },
                })
              }
              className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 rounded"
            >
              Noir B&W
            </button>
            <button
              onClick={() =>
                onUpdateElement(imgEl.id, {
                  filters: { brightness: 105, contrast: 115, saturate: 110, grayscale: 0, sepia: 40 },
                })
              }
              className="px-2 py-1 text-[11px] text-amber-400 hover:text-amber-300 rounded"
            >
              Warm
            </button>
          </div>

          {/* Border Radius */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
            <span className="text-[11px] text-slate-400">Radius</span>
            <input
              type="range"
              min="0"
              max="120"
              value={imgEl.borderRadius || 0}
              onChange={(e) =>
                onUpdateElement(imgEl.id, {
                  borderRadius: parseInt(e.target.value),
                })
              }
              className="w-16 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono text-[10px] w-5 text-right">{imgEl.borderRadius || 0}</span>
          </div>

          {/* Flip */}
          <div className="flex items-center bg-slate-800 rounded-md border border-slate-700 p-0.5">
            <button
              onClick={() => onUpdateElement(imgEl.id, { flipX: !imgEl.flipX })}
              className={`p-1.5 rounded transition ${
                imgEl.flipX ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement(imgEl.id, { flipY: !imgEl.flipY })}
              className={`p-1.5 rounded transition ${
                imgEl.flipY ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Flip Vertical"
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => onBringToFront(imgEl.id)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            title="Bring to Front"
          >
            <BringToFront className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSendToBack(imgEl.id)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            title="Send to Back"
          >
            <SendToBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicateElement(imgEl.id)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateElement(imgEl.id, { locked: !imgEl.locked })}
            className={`p-1.5 rounded-md transition ${
              imgEl.locked ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400 hover:text-white'
            }`}
            title={imgEl.locked ? 'Unlock' : 'Lock'}
          >
            {imgEl.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDeleteElement(imgEl.id)}
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-md transition"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. SHAPE ELEMENT TOOLBAR
  if (selectedElement.type === 'shape') {
    const shapeEl = selectedElement as ShapeElement;

    return (
      <div className="h-11 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 z-20 text-xs text-slate-300 select-none">
        <div className="flex items-center gap-2 shrink-0">
          {/* Shape Color Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-md"
              title="Fill Color"
            >
              <span
                className="w-4 h-4 rounded border border-slate-600 shadow-sm"
                style={{ backgroundColor: shapeEl.fill }}
              />
              <span className="font-mono text-[10px] uppercase hidden sm:inline">
                {shapeEl.fill}
              </span>
            </button>

            {showColorPicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowColorPicker(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-2 z-50">
                  <div className="grid grid-cols-6 gap-1.5 mb-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          onUpdateElement(shapeEl.id, { fill: c });
                          setShowColorPicker(false);
                        }}
                        className="w-6 h-6 rounded border border-slate-700 hover:scale-110 transition"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400">Custom</span>
                    <input
                      type="color"
                      value={shapeEl.fill || '#3b82f6'}
                      onChange={(e) => onUpdateElement(shapeEl.id, { fill: e.target.value })}
                      className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
            <span className="text-[11px] text-slate-400">Border</span>
            <input
              type="range"
              min="0"
              max="20"
              value={shapeEl.strokeWidth || 0}
              onChange={(e) =>
                onUpdateElement(shapeEl.id, {
                  strokeWidth: parseInt(e.target.value),
                  stroke: shapeEl.stroke || '#ffffff',
                })
              }
              className="w-16 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono text-[10px] w-4 text-right">
              {shapeEl.strokeWidth || 0}
            </span>
          </div>

          {/* Opacity slider */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
            <span className="text-[11px] text-slate-400">Opacity</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={shapeEl.opacity ?? 1}
              onChange={(e) =>
                onUpdateElement(shapeEl.id, {
                  opacity: parseFloat(e.target.value),
                })
              }
              className="w-16 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono text-[10px] w-6 text-right">
              {Math.round((shapeEl.opacity ?? 1) * 100)}%
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => onBringToFront(shapeEl.id)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            title="Bring to Front"
          >
            <BringToFront className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSendToBack(shapeEl.id)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            title="Send to Back"
          >
            <SendToBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicateElement(shapeEl.id)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateElement(shapeEl.id, { locked: !shapeEl.locked })}
            className={`p-1.5 rounded-md transition ${
              shapeEl.locked ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400 hover:text-white'
            }`}
            title={shapeEl.locked ? 'Unlock' : 'Lock'}
          >
            {shapeEl.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDeleteElement(shapeEl.id)}
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-md transition"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
