import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Users,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  Layers,
  ChevronDown,
  Palette,
  Check,
  Smartphone,
  Instagram,
  PlaySquare,
  Twitter,
  Linkedin,
  Pin,
  Cloud,
  CloudCheck,
  HelpCircle,
  Tv,
} from 'lucide-react';
import { CanvasDesign, CanvasPreset, CollabUser } from '../types/design';
import { CANVAS_PRESETS } from '../data/presets';

interface HeaderProps {
  design: CanvasDesign;
  onUpdateTitle: (title: string) => void;
  onSelectPreset: (preset: CanvasPreset) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  collaborators: CollabUser[];
  currentUser: CollabUser;
  onOpenCollab: () => void;
  onOpenExport: () => void;
  onOpenAI: () => void;
  showLayers: boolean;
  onToggleLayers: () => void;
  onSaveCloud?: () => void;
  isCloudSaved?: boolean;
  onOpenResizeModal?: () => void;
  onTogglePresentation?: () => void;
  onOpenShortcuts?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  design,
  onUpdateTitle,
  onSelectPreset,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  collaborators,
  currentUser,
  onOpenCollab,
  onOpenExport,
  onOpenAI,
  showLayers,
  onToggleLayers,
  onSaveCloud,
  isCloudSaved,
  onOpenResizeModal,
  onTogglePresentation,
  onOpenShortcuts,
  onGoHome,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(design.title);

  const currentPreset =
    CANVAS_PRESETS.find((p) => p.id === design.presetId) || {
      id: 'custom',
      name: 'Custom Size',
      width: design.width,
      height: design.height,
      icon: 'Palette',
    };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleText.trim()) {
      onUpdateTitle(titleText.trim());
    } else {
      setTitleText(design.title);
    }
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Instagram':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'PlaySquare':
        return <PlaySquare className="w-4 h-4 text-red-400" />;
      case 'Twitter':
        return <Twitter className="w-4 h-4 text-sky-400" />;
      case 'Linkedin':
        return <Linkedin className="w-4 h-4 text-blue-400" />;
      case 'Pin':
        return <Pin className="w-4 h-4 text-rose-400" />;
      default:
        return <Palette className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Home Button, Logo & Project Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Back to Canva Dashboard Home button */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Back to Canva Home Dashboard"
          >
            <span>🏠</span>
            <span className="hidden sm:inline">Home</span>
          </button>
        )}

        <div
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
          title="Back to Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 via-indigo-600 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent hidden md:inline">
            Designtify
          </span>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Title input */}
        <div className="flex items-center min-w-0 max-w-[140px] sm:max-w-[200px]">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="bg-slate-800 text-white text-xs sm:text-sm font-medium px-2 py-1 rounded outline-none border border-indigo-500 w-full"
            />
          ) : (
            <button
              onClick={() => {
                setTitleText(design.title);
                setIsEditingTitle(true);
              }}
              title="Click to rename design"
              className="text-xs sm:text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 px-2 py-1 rounded transition truncate text-left w-full"
            >
              {design.title}
            </button>
          )}
        </div>

        {/* Resize & Magic Switch Button (Canva Pro style) */}
        <button
          onClick={onOpenResizeModal}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-md border border-slate-700/80 hover:border-indigo-500/80 transition cursor-pointer shadow-sm group"
          title="Resize canvas or switch social formats"
        >
          {getPresetIcon(currentPreset.icon || 'Palette')}
          <span className="hidden lg:inline">{currentPreset.name}</span>
          <span className="text-[11px] text-indigo-400 font-mono">
            {design.width}x{design.height}
          </span>
          <span className="text-[9px] bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black px-1 rounded ml-0.5">
            RESIZE
          </span>
        </button>

        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5 bg-slate-800/60 p-0.5 rounded-md border border-slate-700/50">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded transition ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded transition ${
              canRedo
                ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cloud Auto-Sync Pill */}
        {onSaveCloud && (
          <button
            onClick={onSaveCloud}
            title="Synced to Firebase Cloud Firestore - Click to Save Now"
            className="hidden xl:flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white rounded-md border border-slate-700/50 transition cursor-pointer"
          >
            <Cloud className="w-3 h-3 text-emerald-400" />
            <span>{isCloudSaved ? 'Cloud Saved' : 'Save to Cloud'}</span>
          </button>
        )}
      </div>

      {/* Center / Right: Zoom, AI Magic, Presentation, Team Collab & Export */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Zoom Controls */}
        <div className="hidden md:flex items-center gap-1 bg-slate-800/60 px-1 py-0.5 rounded-md border border-slate-700/50 text-xs">
          <button
            onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-300 font-mono text-[11px] px-1 min-w-[38px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.5, zoom + 0.1))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(0.55)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded ml-0.5"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* Presentation Fullscreen Mode */}
        {onTogglePresentation && (
          <button
            onClick={onTogglePresentation}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700/60 transition cursor-pointer"
            title="Presentation Fullscreen Mode"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span>Present</span>
          </button>
        )}

        {/* AI Magic Button */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20 transition transform active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">Magic Studio</span>
        </button>

        {/* Live Team Presence Avatars */}
        <div
          onClick={onOpenCollab}
          title="Team Collaboration & Live Cursors"
          className="flex items-center -space-x-1.5 cursor-pointer hover:opacity-90 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700/60 transition"
        >
          {collaborators.slice(0, 3).map((u) => (
            <div
              key={u.id}
              className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center overflow-hidden text-[10px] font-bold text-white shadow"
              style={{ backgroundColor: u.color }}
            >
              {u.name.substring(0, 1)}
            </div>
          ))}
          <div
            className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center overflow-hidden text-[10px] font-bold text-white shadow"
            style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.name.substring(0, 1)}
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 pl-2 pr-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="hidden lg:inline">{collaborators.length + 1} live</span>
          </span>
        </div>

        {/* Shortcuts button */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="hidden xl:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {/* Share / Invite */}
        <button
          onClick={onOpenCollab}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700/60 transition"
          title="Share project with team"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Share</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-lg shadow-pink-500/25 transition transform active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
