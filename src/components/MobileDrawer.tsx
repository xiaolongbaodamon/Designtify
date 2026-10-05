import React from 'react';
import {
  LayoutTemplate,
  Shapes,
  Type,
  Image as ImageIcon,
  Sparkles,
  Palette,
  Layers,
  Download,
  Users,
  Upload,
  PenTool,
} from 'lucide-react';
import { SidebarTab } from './LeftSidebar';

interface MobileDrawerProps {
  activeTab: SidebarTab | null;
  onSelectTab: (tab: SidebarTab | null) => void;
  onOpenExport: () => void;
  onOpenCollab: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  activeTab,
  onSelectTab,
  onOpenExport,
  onOpenCollab,
}) => {
  const items = [
    { id: 'templates' as SidebarTab, label: 'Design', icon: LayoutTemplate },
    { id: 'elements' as SidebarTab, label: 'Elements', icon: Shapes },
    { id: 'text' as SidebarTab, label: 'Text', icon: Type },
    { id: 'uploads' as SidebarTab, label: 'Uploads', icon: Upload },
    { id: 'draw' as SidebarTab, label: 'Draw', icon: PenTool },
    { id: 'ai' as SidebarTab, label: 'Magic', icon: Sparkles },
    { id: 'photos' as SidebarTab, label: 'Photos', icon: ImageIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-40 select-none">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(isActive ? null : item.id)}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg transition ${
              isActive
                ? 'text-indigo-400 font-bold bg-indigo-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenExport}
        className="flex flex-col items-center gap-1 text-[10px] font-bold text-pink-400 py-1 px-2"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
    </div>
  );
};
