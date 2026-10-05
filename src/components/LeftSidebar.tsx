import React, { useState } from 'react';
import {
  LayoutTemplate,
  Shapes,
  Type,
  Image as ImageIcon,
  Sparkles,
  Palette,
  Layers,
  Search,
  Plus,
  Upload,
  PenTool,
  Paintbrush,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronRight,
  ChevronDown,
  Wand2,
  RefreshCw,
  MessageSquare,
  BarChart2,
  Copy,
  Star,
  Check,
  Zap,
} from 'lucide-react';
import {
  CanvasDesign,
  CanvasElement,
  Template,
  TextElement,
  ShapeElement,
  ImageElement,
  DrawingElement,
  ShapeType,
} from '../types/design';
import { TEMPLATES } from '../data/templates';
import { STOCK_PHOTOS, FONT_PAIRINGS, COLOR_PALETTES, GRADIENT_PRESETS, StockPhoto } from '../data/assets';
import {
  requestMagicDesign,
  requestCopySuggestions,
  requestDesignCritique,
  requestColorPalettes,
  AISuggestion,
  AICritiqueResult,
} from '../services/aiService';

export type SidebarTab =
  | 'templates'
  | 'elements'
  | 'text'
  | 'uploads'
  | 'draw'
  | 'photos'
  | 'ai'
  | 'brand'
  | 'layers';

interface LeftSidebarProps {
  design: CanvasDesign;
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  onApplyTemplate: (template: Template) => void;
  onAddElement: (element: Partial<CanvasElement>) => void;
  onApplyMagicDesign: (magicDesign: any) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onSelectElement: (id: string | null) => void;
  selectedId: string | null;
  onReorderElements: (newOrder: CanvasElement[]) => void;
  onApplyPalette: (colors: string[]) => void;
  onApplyBackgroundGradient: (grad: { from: string; to: string; angle: number }) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  design,
  activeTab,
  onSelectTab,
  onApplyTemplate,
  onAddElement,
  onApplyMagicDesign,
  onUpdateElement,
  onDeleteElement,
  onSelectElement,
  selectedId,
  onReorderElements,
  onApplyPalette,
  onApplyBackgroundGradient,
}) => {
  // Search & Filters
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('All');
  const [photoSearch, setPhotoSearch] = useState('');
  const [photoCategory, setPhotoCategory] = useState<string>('All');

  // AI Tab States
  const [aiSubTab, setAiSubTab] = useState<'magic' | 'copy' | 'critique' | 'palettes'>('magic');
  const [aiPrompt, setAiPrompt] = useState('Summer Flash Sale 50% Off for Streetwear Fashion brand');
  const [aiTone, setAiTone] = useState('Bold and high-energy');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // AI Copy suggestions
  const [copyTopic, setCopyTopic] = useState('New AI Productivity Tool Launch');
  const [copyTone, setCopyTone] = useState('Engaging & Authoritative');
  const [copySuggestions, setCopySuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingCopy, setIsLoadingCopy] = useState(false);

  // AI Critique
  const [critiqueResult, setCritiqueResult] = useState<AICritiqueResult | null>(null);
  const [isLoadingCritique, setIsLoadingCritique] = useState(false);

  // AI Palettes
  const [paletteMood, setPaletteMood] = useState('Neon & Cyberpunk');
  const [aiPalettes, setAiPalettes] = useState<any[]>([]);
  const [isLoadingPalettes, setIsLoadingPalettes] = useState(false);

  // 1. Filtered Templates
  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchesCat = templateCategory === 'All' || tpl.category === templateCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tpl.tags.some((t) => t.toLowerCase().includes(templateSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // 2. Filtered Photos
  const filteredPhotos = STOCK_PHOTOS.filter((photo) => {
    const matchesCat = photoCategory === 'All' || photo.category === photoCategory;
    const matchesSearch =
      photo.alt.toLowerCase().includes(photoSearch.toLowerCase()) ||
      photo.category.toLowerCase().includes(photoSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // User Uploads State
  const [userUploads, setUserUploads] = useState<string[]>([
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Draw State
  const [drawColor, setDrawColor] = useState('#f43f5e');
  const [drawStrokeWidth, setDrawStrokeWidth] = useState(6);
  const [drawTool, setDrawTool] = useState<'pen' | 'highlighter' | 'marker'>('pen');

  // Handle local image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const src = event.target.result as string;
          setUserUploads((prev) => [src, ...prev]);
          onAddElement({
            type: 'image',
            src,
            alt: file.name,
            x: Math.round(design.width / 4),
            y: Math.round(design.height / 4),
            width: Math.round(design.width / 2),
            height: Math.round(design.height / 2),
            borderRadius: 16,
          });
        }
        setIsUploading(false);
      };
      reader.onerror = () => setIsUploading(false);
      reader.readAsDataURL(file);
    }
  };

  const handleAddFromUrl = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    setUserUploads((prev) => [url, ...prev]);
    onAddElement({
      type: 'image',
      src: url,
      alt: 'Web Image',
      x: Math.round(design.width / 4),
      y: Math.round(design.height / 4),
      width: Math.round(design.width / 2),
      height: Math.round(design.height / 2),
      borderRadius: 16,
    });
    setImageUrlInput('');
  };

  // Add decorative doodle path
  const handleAddDoodle = (pathData: string, width = 200, height = 80) => {
    onAddElement({
      type: 'drawing',
      pathData,
      stroke: drawColor,
      strokeWidth: drawStrokeWidth,
      width,
      height,
      x: Math.round(design.width / 2 - width / 2),
      y: Math.round(design.height / 2 - height / 2),
    });
  };

  // Run Magic Design Generation
  const handleGenerateMagicDesign = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const result = await requestMagicDesign(aiPrompt, design.presetId, aiTone);
      onApplyMagicDesign(result);
    } catch (err: any) {
      setAiError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Run AI Copy Suggestions
  const handleGenerateCopy = async () => {
    if (!copyTopic.trim()) return;
    setIsLoadingCopy(true);
    setAiError(null);
    try {
      const results = await requestCopySuggestions(copyTopic, undefined, copyTone, 'Instagram');
      setCopySuggestions(results);
    } catch (err: any) {
      setAiError(err.message || 'Could not generate copy.');
    } finally {
      setIsLoadingCopy(false);
    }
  };

  // Run AI Critique
  const handleCritiqueDesign = async () => {
    setIsLoadingCritique(true);
    setAiError(null);
    try {
      const result = await requestDesignCritique(design);
      setCritiqueResult(result);
    } catch (err: any) {
      setAiError(err.message || 'Could not critique design.');
    } finally {
      setIsLoadingCritique(false);
    }
  };

  // Run AI Palettes
  const handleGeneratePalettes = async () => {
    setIsLoadingPalettes(true);
    setAiError(null);
    try {
      const list = await requestColorPalettes(paletteMood, 'Social Media Branding');
      setAiPalettes(list);
    } catch (err: any) {
      setAiError(err.message || 'Could not generate palettes.');
    } finally {
      setIsLoadingPalettes(false);
    }
  };

  const navItems = [
    { id: 'templates', label: 'Design', icon: LayoutTemplate },
    { id: 'elements', label: 'Elements', icon: Shapes },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'uploads', label: 'Uploads', icon: Upload },
    { id: 'draw', label: 'Draw', icon: PenTool },
    { id: 'photos', label: 'Photos', icon: ImageIcon },
    { id: 'ai', label: 'Magic Studio', icon: Sparkles, badge: 'AI' },
    { id: 'brand', label: 'Brand', icon: Palette },
    { id: 'layers', label: 'Layers', icon: Layers, count: design.elements.length },
  ];

  return (
    <div className="flex h-full select-none">
      {/* 1. Primary Left Navigation Rail (Canva-style) */}
      <div className="w-18 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-3 gap-1 z-10 shrink-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as SidebarTab)}
              className={`w-15 py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold transition relative group cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition transform group-hover:scale-110 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span className="leading-tight">{item.label}</span>

              {item.badge && (
                <span className="absolute top-1 right-1 px-1 py-0.2 bg-gradient-to-r from-pink-500 to-rose-500 text-[9px] font-extrabold text-white rounded-full uppercase scale-90">
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && item.count > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-slate-800 border border-slate-700 text-[9px] font-mono text-slate-300 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Secondary Panel for Selected Tab */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden shrink-0">
        {/* TAB: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Templates
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {filteredTemplates.length} designs
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search templates (sale, tech, quote)..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full bg-slate-800 text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
              {['All', 'Promotion', 'Quote', 'Business', 'Fashion', 'Fitness', 'Food', 'Podcast'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setTemplateCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                      templateCategory === cat
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-2 gap-3 pb-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => onApplyTemplate(template)}
                  className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 hover:border-indigo-500/80 transition transform hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-800">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-[11px] font-bold text-white truncate drop-shadow">
                        {template.name}
                      </div>
                      <div className="text-[10px] text-indigo-300 font-medium">
                        {template.presetId.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ELEMENTS */}
        {activeTab === 'elements' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Elements & Shapes
            </h3>

            {/* Basic Shapes */}
            <div className="mb-5">
              <div className="text-xs font-semibold text-slate-400 mb-2">Shapes</div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: 'rect', label: 'Square', radius: 4 },
                  { type: 'pill', label: 'Pill', radius: 999 },
                  { type: 'circle', label: 'Circle' },
                  { type: 'triangle', label: 'Triangle' },
                  { type: 'star', label: 'Star' },
                ].map((s) => (
                  <button
                    key={s.type}
                    onClick={() =>
                      onAddElement({
                        type: 'shape',
                        shapeType: s.type as ShapeType,
                        fill: '#6366f1',
                        width: 180,
                        height: s.type === 'pill' ? 70 : 180,
                        borderRadius: s.radius || 0,
                      })
                    }
                    className="p-3 bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500 rounded-xl flex flex-col items-center gap-1.5 transition group cursor-pointer"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {s.type === 'rect' && (
                        <div className="w-7 h-7 bg-indigo-500 rounded group-hover:scale-110 transition" />
                      )}
                      {s.type === 'pill' && (
                        <div className="w-8 h-4 bg-pink-500 rounded-full group-hover:scale-110 transition" />
                      )}
                      {s.type === 'circle' && (
                        <div className="w-7 h-7 bg-amber-400 rounded-full group-hover:scale-110 transition" />
                      )}
                      {s.type === 'triangle' && (
                        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-emerald-400 group-hover:scale-110 transition" />
                      )}
                      {s.type === 'star' && (
                        <Star className="w-7 h-7 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Badges & Stickers */}
            <div className="mb-5">
              <div className="text-xs font-semibold text-slate-400 mb-2">
                Sale Badges & CTA Pills
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: '50% OFF', color: '#f43f5e', bg: '#ffe4e6' },
                  { text: '⚡ LIMITED DROP', color: '#facc15', bg: '#713f12' },
                  { text: '★ BESTSELLER', color: '#38bdf8', bg: '#082f49' },
                  { text: 'SWIPE UP →', color: '#4ade80', bg: '#052e16' },
                ].map((b, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      // Add container shape and text badge
                      const x = Math.round(design.width / 2 - 100);
                      const y = Math.round(design.height / 2 - 30);
                      onAddElement({
                        type: 'shape',
                        shapeType: 'pill',
                        fill: b.color,
                        x,
                        y,
                        width: 200,
                        height: 60,
                        zIndex: 10,
                      });
                      onAddElement({
                        type: 'text',
                        text: b.text,
                        fontSize: 20,
                        fontFamily: 'Montserrat',
                        fontWeight: 900,
                        color: '#0f172a',
                        textAlign: 'center',
                        x,
                        y: y + 16,
                        width: 200,
                        height: 35,
                        letterSpacing: 1.5,
                        zIndex: 11,
                      });
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-center font-extrabold text-xs transition transform hover:scale-105 cursor-pointer shadow-sm"
                    style={{ color: b.color }}
                  >
                    {b.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Media Badges & Verified Icons */}
            <div className="mb-5">
              <div className="text-xs font-semibold text-slate-400 mb-2">
                Social Badges & Verification
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '✔ Verified Badge', fill: '#38bdf8', text: '✔ VERIFIED' },
                  { label: '★ 5.0 Rating Tag', fill: '#facc15', text: '★★★★★ 5.0' },
                  { label: '🔥 Trending Now', fill: '#f97316', text: '🔥 TRENDING' },
                  { label: '✨ Exclusive Drop', fill: '#ec4899', text: '✨ EXCLUSIVE' },
                ].map((badge, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const x = Math.round(design.width / 2 - 110);
                      const y = Math.round(design.height / 2 - 25);
                      onAddElement({
                        type: 'shape',
                        shapeType: 'pill',
                        fill: badge.fill,
                        x,
                        y,
                        width: 220,
                        height: 52,
                        zIndex: 10,
                      });
                      onAddElement({
                        type: 'text',
                        text: badge.text,
                        fontSize: 18,
                        fontFamily: 'Montserrat',
                        fontWeight: 900,
                        color: '#0f172a',
                        textAlign: 'center',
                        x,
                        y: y + 14,
                        width: 220,
                        height: 30,
                        letterSpacing: 1.5,
                        zIndex: 11,
                      });
                    }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl text-left text-xs font-bold text-slate-200 hover:text-white transition flex items-center justify-between"
                  >
                    <span>{badge.label}</span>
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: TEXT */}
        {activeTab === 'text' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Typography
            </h3>

            {/* Quick Add Buttons */}
            <div className="flex flex-col gap-2 mb-6">
              <button
                onClick={() =>
                  onAddElement({
                    type: 'text',
                    text: 'Add a Headline',
                    fontSize: 72,
                    fontFamily: 'Bebas Neue',
                    fontWeight: 900,
                    color: '#ffffff',
                    width: 600,
                    height: 100,
                    textAlign: 'center',
                    letterSpacing: 2,
                  })
                }
                className="w-full py-3.5 px-4 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-xl text-left transition flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="text-xl font-black text-white group-hover:text-indigo-300">
                    Add a Headline
                  </div>
                  <div className="text-[11px] text-slate-400">72px • Bold display header</div>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
              </button>

              <button
                onClick={() =>
                  onAddElement({
                    type: 'text',
                    text: 'Add a subheading with key value prop',
                    fontSize: 32,
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    width: 500,
                    height: 60,
                    textAlign: 'center',
                  })
                }
                className="w-full py-3 px-4 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-xl text-left transition flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="text-sm font-bold text-slate-200 group-hover:text-indigo-300">
                    Add a Subheading
                  </div>
                  <div className="text-[11px] text-slate-400">32px • Clean supporting text</div>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
              </button>

              <button
                onClick={() =>
                  onAddElement({
                    type: 'text',
                    text: 'Add small body text, disclaimer, or handle @username',
                    fontSize: 20,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    color: '#94a3b8',
                    width: 400,
                    height: 50,
                    textAlign: 'center',
                  })
                }
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-xl text-left transition flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-medium text-slate-300 group-hover:text-indigo-300">
                    Add Body Text
                  </div>
                  <div className="text-[11px] text-slate-400">20px • Paragraph or credits</div>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
              </button>
            </div>

            {/* Curated Font Pairings */}
            <div className="text-xs font-semibold text-slate-400 mb-2">
              Curated Font Pairings
            </div>
            <div className="flex flex-col gap-2 pb-6">
              {FONT_PAIRINGS.map((pair) => (
                <button
                  key={pair.id}
                  onClick={() => {
                    const cx = Math.round(design.width / 2 - 250);
                    const cy = Math.round(design.height / 2 - 70);
                    onAddElement({
                      type: 'text',
                      text: pair.name.toUpperCase(),
                      fontSize: 64,
                      fontFamily: pair.heading.fontFamily,
                      fontWeight: pair.heading.fontWeight,
                      color: '#ffffff',
                      textAlign: 'center',
                      x: cx,
                      y: cy,
                      width: 500,
                      height: 80,
                    });
                    onAddElement({
                      type: 'text',
                      text: pair.tag,
                      fontSize: 24,
                      fontFamily: pair.subheading.fontFamily,
                      fontWeight: pair.subheading.fontWeight,
                      color: '#94a3b8',
                      textAlign: 'center',
                      x: cx,
                      y: cy + 85,
                      width: 500,
                      height: 40,
                    });
                  }}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 rounded-xl text-left transition group cursor-pointer"
                >
                  <div
                    className="text-lg text-white font-bold group-hover:text-indigo-300"
                    style={{ fontFamily: pair.heading.fontFamily }}
                  >
                    {pair.name}
                  </div>
                  <div
                    className="text-xs text-slate-400"
                    style={{ fontFamily: pair.subheading.fontFamily }}
                  >
                    {pair.tag}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB: UPLOADS */}
        {activeTab === 'uploads' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Uploads</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {userUploads.length} assets
              </span>
            </div>

            {/* Custom local upload button */}
            <label className="mb-4 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-lg shadow-indigo-600/25 active:scale-98">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading Image...' : 'Upload from Computer'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {/* Paste Image URL */}
            <div className="mb-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add from Image URL</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFromUrl()}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddFromUrl}
                  disabled={!imageUrlInput.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Uploaded Media Gallery */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Your Uploaded Media
              </div>
              <div className="grid grid-cols-2 gap-2 pb-6">
                {userUploads.map((src, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      onAddElement({
                        type: 'image',
                        src,
                        alt: 'Uploaded asset',
                        x: Math.round(design.width / 4),
                        y: Math.round(design.height / 4),
                        width: Math.min(500, Math.round(design.width * 0.6)),
                        height: Math.min(500, Math.round(design.height * 0.6)),
                        borderRadius: 12,
                      })
                    }
                    className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 cursor-pointer transition transform hover:scale-[1.02] shadow-sm bg-slate-950"
                  >
                    <img
                      src={src}
                      alt="Uploaded item"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white bg-indigo-600 px-2 py-1 rounded shadow">
                        + Add to Canvas
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: DRAW */}
        {activeTab === 'draw' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PenTool className="w-4 h-4 text-pink-400" />
                <span>Draw & Scribbles</span>
              </h3>
            </div>

            {/* Drawing Tool Selectors */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-800 p-1 rounded-xl mb-4 text-xs font-semibold">
              {[
                { id: 'pen', label: 'Pen', icon: PenTool },
                { id: 'highlighter', label: 'Highlighter', icon: Paintbrush },
                { id: 'marker', label: 'Marker', icon: Zap },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setDrawTool(tool.id as any)}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    drawTool === tool.id
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <tool.icon className="w-3.5 h-3.5" />
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>

            {/* Color Palette */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  '#f43f5e',
                  '#ec4899',
                  '#8b5cf6',
                  '#6366f1',
                  '#3b82f6',
                  '#06b6d4',
                  '#10b981',
                  '#facc15',
                  '#f97316',
                  '#ffffff',
                  '#0f172a',
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setDrawColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 ${
                      drawColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Thickness */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-semibold text-slate-300">Stroke Thickness</span>
                <span className="font-mono text-indigo-400 font-bold">{drawStrokeWidth}px</span>
              </div>
              <input
                type="range"
                min={2}
                max={28}
                value={drawStrokeWidth}
                onChange={(e) => setDrawStrokeWidth(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Vector Doodles & Accents */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Hand-Drawn Accents & Doodles
              </div>
              <div className="grid grid-cols-2 gap-2 pb-6">
                {[
                  {
                    name: 'Squiggle Underline',
                    d: 'M 10 30 Q 80 50 150 25 T 290 35',
                    w: 300,
                    h: 60,
                  },
                  {
                    name: 'Hand-drawn Arrow',
                    d: 'M 20 50 Q 120 15 220 40 L 190 20 M 220 40 L 195 60',
                    w: 240,
                    h: 70,
                  },
                  {
                    name: 'Star Doodle',
                    d: 'M 50 10 L 62 38 L 92 40 L 68 58 L 76 88 L 50 70 L 24 88 L 32 58 L 8 40 L 38 38 Z',
                    w: 100,
                    h: 100,
                  },
                  {
                    name: 'Heart Doodle',
                    d: 'M 60 30 A 20 20 0 0 0 20 50 C 20 80 60 110 60 110 C 60 110 100 80 100 50 A 20 20 0 0 0 60 30 Z',
                    w: 120,
                    h: 120,
                  },
                  {
                    name: 'Highlight Loop',
                    d: 'M 20 40 C 40 10, 180 10, 200 40 C 220 70, 40 70, 20 40',
                    w: 220,
                    h: 80,
                  },
                  {
                    name: 'Double Underline',
                    d: 'M 10 20 L 250 20 M 20 35 L 230 35',
                    w: 260,
                    h: 50,
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddDoodle(item.d, item.w, item.h)}
                    className="p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-pink-500 rounded-xl flex flex-col items-center gap-2 transition group cursor-pointer"
                  >
                    <svg
                      viewBox={`0 0 ${item.w} ${item.h}`}
                      className="w-full h-12 text-pink-400 stroke-current group-hover:scale-105 transition"
                    >
                      <path
                        d={item.d}
                        fill="none"
                        stroke={drawColor}
                        strokeWidth={Math.min(drawStrokeWidth, 6)}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[10px] text-slate-300 font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PHOTOS */}
        {activeTab === 'photos' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Stock & Uploads
              </h3>
            </div>

            {/* Custom upload button */}
            <label className="mb-4 flex items-center justify-center gap-2 p-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-dashed border-indigo-500 rounded-xl text-indigo-300 text-xs font-bold cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Upload Custom Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Unsplash stock..."
                value={photoSearch}
                onChange={(e) => setPhotoSearch(e.target.value)}
                className="w-full bg-slate-800 text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
              {['All', 'Fashion', 'Tech', 'Food', 'Fitness', 'Business', 'Abstract'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setPhotoCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                      photoCategory === cat
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-2 pb-6">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() =>
                    onAddElement({
                      type: 'image',
                      src: photo.url,
                      alt: photo.alt,
                      width: Math.round(design.width / 2),
                      height: Math.round(design.height / 2),
                      borderRadius: 20,
                    })
                  }
                  className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 cursor-pointer transition transform hover:scale-[1.02] shadow-sm"
                >
                  <img
                    src={photo.thumbnail}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white bg-indigo-600 px-2 py-1 rounded shadow">
                      + Add to Canvas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MAGIC AI (Gemini Studio Assistant) */}
        {activeTab === 'ai' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Magic AI Assistant
              </h3>
            </div>

            {/* AI Sub-Tabs */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg mb-4 text-xs font-semibold">
              <button
                onClick={() => setAiSubTab('magic')}
                className={`flex-1 py-1.5 rounded-md transition ${
                  aiSubTab === 'magic'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Generator
              </button>
              <button
                onClick={() => setAiSubTab('copy')}
                className={`flex-1 py-1.5 rounded-md transition ${
                  aiSubTab === 'copy'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Copywriter
              </button>
              <button
                onClick={() => setAiSubTab('critique')}
                className={`flex-1 py-1.5 rounded-md transition ${
                  aiSubTab === 'critique'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Critique
              </button>
              <button
                onClick={() => setAiSubTab('palettes')}
                className={`flex-1 py-1.5 rounded-md transition ${
                  aiSubTab === 'palettes'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Palettes
              </button>
            </div>

            {/* SUBTAB 1: MAGIC DESIGN GENERATOR */}
            {aiSubTab === 'magic' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Describe what you want to create:
                  </label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Cyberpunk Flash Sale with 50% discount badge and neon typography..."
                    className="w-full bg-slate-800 text-xs text-white p-2.5 rounded-xl border border-slate-700 outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Brand Tone & Style:
                  </label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full bg-slate-800 text-xs text-white p-2 rounded-lg border border-slate-700 outline-none"
                  >
                    <option value="Bold and high-energy">Bold and high-energy</option>
                    <option value="Clean, modern & minimalist">Clean, modern & minimalist</option>
                    <option value="Luxury, editorial & serif">Luxury, editorial & serif</option>
                    <option value="Tech futuristic & cyber">Tech futuristic & cyber</option>
                    <option value="Warm, organic & handwritten">Warm, organic & handwritten</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateMagicDesign}
                  disabled={isGeneratingAI}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {isGeneratingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Generating with Gemini 3.8...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-amber-300" />
                      <span>Generate Magic Layout</span>
                    </>
                  )}
                </button>

                {aiError && (
                  <div className="p-2.5 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-lg text-xs">
                    {aiError}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 2: AI COPYWRITER */}
            {aiSubTab === 'copy' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Topic / Campaign:
                  </label>
                  <input
                    type="text"
                    value={copyTopic}
                    onChange={(e) => setCopyTopic(e.target.value)}
                    placeholder="e.g. 50% Off Summer Sneakers Drop"
                    className="w-full bg-slate-800 text-xs text-white p-2 rounded-lg border border-slate-700 outline-none"
                  />
                </div>

                <button
                  onClick={handleGenerateCopy}
                  disabled={isLoadingCopy}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  {isLoadingCopy ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-amber-300" />
                  )}
                  <span>Generate Catchy Hooks</span>
                </button>

                {/* Suggestions List */}
                <div className="flex flex-col gap-2.5 mt-2">
                  {copySuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex flex-col gap-1.5"
                    >
                      <div className="text-xs font-bold text-white">{item.headline}</div>
                      <div className="text-[11px] text-slate-400">{item.subtitle}</div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-mono">
                          {item.cta}
                        </span>
                        <button
                          onClick={() => {
                            // Add headline and subhead to canvas
                            onAddElement({
                              type: 'text',
                              text: item.headline,
                              fontSize: 56,
                              fontFamily: 'Montserrat',
                              fontWeight: 900,
                              color: '#ffffff',
                              width: 600,
                              height: 80,
                              textAlign: 'center',
                            });
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                          + Insert
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 3: AI DESIGN CRITIQUE */}
            {aiSubTab === 'critique' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-400">
                  Let Gemini evaluate visual hierarchy, contrast ratios, and layout balance
                  like a Creative Director.
                </p>

                <button
                  onClick={handleCritiqueDesign}
                  disabled={isLoadingCritique}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  {isLoadingCritique ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <BarChart2 className="w-4 h-4 text-emerald-200" />
                  )}
                  <span>Critique My Current Design</span>
                </button>

                {critiqueResult && (
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col gap-2 mt-2">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="text-xs font-bold text-slate-300">Overall Score:</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {critiqueResult.score || critiqueResult.overallScore || 88} / 100
                      </span>
                    </div>

                    {critiqueResult.hierarchy && (
                      <div>
                        <div className="text-[10px] font-bold text-indigo-400 uppercase">
                          Hierarchy
                        </div>
                        <div className="text-xs text-slate-300">{critiqueResult.hierarchy}</div>
                      </div>
                    )}

                    {critiqueResult.contrast && (
                      <div>
                        <div className="text-[10px] font-bold text-amber-400 uppercase">
                          Contrast & Readability
                        </div>
                        <div className="text-xs text-slate-300">{critiqueResult.contrast}</div>
                      </div>
                    )}

                    {critiqueResult.tips && critiqueResult.tips.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-teal-400 uppercase mb-1">
                          Pro Tips
                        </div>
                        <ul className="text-xs text-slate-300 list-disc pl-4 space-y-1">
                          {critiqueResult.tips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 4: AI COLOR PALETTES */}
            {aiSubTab === 'palettes' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Desired Mood:
                  </label>
                  <input
                    type="text"
                    value={paletteMood}
                    onChange={(e) => setPaletteMood(e.target.value)}
                    placeholder="e.g. Cyberpunk Sunset, Pastel Matcha, Luxury Gold"
                    className="w-full bg-slate-800 text-xs text-white p-2 rounded-lg border border-slate-700 outline-none"
                  />
                </div>

                <button
                  onClick={handleGeneratePalettes}
                  disabled={isLoadingPalettes}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  {isLoadingPalettes ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-300" />
                  )}
                  <span>Generate Color Themes</span>
                </button>

                <div className="flex flex-col gap-2 mt-2">
                  {aiPalettes.map((p, i) => (
                    <div
                      key={i}
                      onClick={() => onApplyPalette(p.colors)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer transition"
                    >
                      <div className="text-xs font-bold text-white mb-1.5">{p.name}</div>
                      <div className="flex h-6 rounded-md overflow-hidden border border-slate-700">
                        {p.colors?.map((c: string, ci: number) => (
                          <div key={ci} className="flex-1" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: BRAND & THEMES */}
        {activeTab === 'brand' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Color Palettes & Gradients
            </h3>

            {/* Background Gradients */}
            <div className="mb-5">
              <div className="text-xs font-semibold text-slate-400 mb-2">
                Canvas Gradients
              </div>
              <div className="grid grid-cols-2 gap-2">
                {GRADIENT_PRESETS.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => onApplyBackgroundGradient(g)}
                    className="h-14 rounded-xl border border-slate-700/80 hover:border-indigo-400 transition transform hover:scale-105 p-2 flex items-end justify-start shadow-sm cursor-pointer"
                    style={{
                      background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`,
                    }}
                  >
                    <span className="text-[10px] font-extrabold text-white drop-shadow-md">
                      {g.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Curated 5-Color Palettes */}
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2">
                1-Click Brand Themes
              </div>
              <div className="flex flex-col gap-2.5 pb-6">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => onApplyPalette(pal.colors)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                        {pal.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{pal.category}</span>
                    </div>
                    <div className="flex h-5 rounded-md overflow-hidden border border-slate-700">
                      {pal.colors.map((c, idx) => (
                        <div key={idx} className="flex-1" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: LAYERS */}
        {activeTab === 'layers' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Layers
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {design.elements.length} elements
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pb-6">
              {[...design.elements]
                .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
                .map((el) => {
                  const isSelected = selectedId === el.id;
                  let label = 'Element';
                  if (el.type === 'text') label = `Text: "${(el as TextElement).text.substring(0, 18)}..."`;
                  if (el.type === 'shape') label = `Shape: ${(el as ShapeElement).shapeType}`;
                  if (el.type === 'image') label = 'Photo Image';

                  return (
                    <div
                      key={el.id}
                      onClick={() => onSelectElement(el.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400 font-mono text-[10px]">
                          z{el.zIndex || 1}
                        </span>
                        <span className="truncate">{label}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateElement(el.id, {
                              opacity: el.opacity === 0 ? 1 : 0,
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded"
                        >
                          {el.opacity === 0 ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateElement(el.id, { locked: !el.locked });
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded"
                        >
                          {el.locked ? (
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteElement(el.id);
                          }}
                          className="p-1 text-rose-400 hover:text-rose-300 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
