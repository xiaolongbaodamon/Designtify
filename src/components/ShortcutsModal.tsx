import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl / ⌘ + Z', action: 'Undo last change' },
    { key: 'Ctrl / ⌘ + Y', action: 'Redo last change' },
    { key: 'Ctrl / ⌘ + D', action: 'Duplicate selected element' },
    { key: 'Delete / Backspace', action: 'Delete selected element' },
    { key: 'Double Click Text', action: 'Edit text inline on canvas' },
    { key: 'Escape', action: 'Deselect element or close modal' },
    { key: 'C', action: 'Quick Comment Pin mode' },
    { key: 'Ctrl / ⌘ + +', action: 'Zoom in' },
    { key: 'Ctrl / ⌘ + -', action: 'Zoom out' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Designtify Pro Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-2">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs"
            >
              <span className="text-slate-300">{sc.action}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono text-[11px] font-semibold text-indigo-300">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
