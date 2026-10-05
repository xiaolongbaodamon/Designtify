import React, { useState } from 'react';
import {
  Plus,
  Home,
  FolderOpen,
  LayoutTemplate,
  Crown,
  Sparkles,
  ShoppingBag,
  MoreHorizontal,
  Bell,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Upload,
  Layers,
  HelpCircle,
  Clock,
  Instagram,
  PlaySquare,
  FileText,
  Presentation,
  Smartphone,
  Trash2,
  Copy,
  ExternalLink,
  Code,
  Globe,
  Mail,
  GraduationCap,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { CanvasDesign, CanvasPreset, Template } from '../types/design';
import { TEMPLATES } from '../data/templates';
import { CANVAS_PRESETS } from '../data/presets';

interface DashboardProps {
  onOpenDesign: (templateOrDesign: Template | CanvasDesign) => void;
  onNewCustomDesign: (width: number, height: number, title?: string) => void;
  recentDesigns: CanvasDesign[];
  onDeleteRecentDesign?: (id: string) => void;
  userEmail?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenDesign,
  onNewCustomDesign,
  recentDesigns,
  onDeleteRecentDesign,
  userEmail,
}) => {
  const [activeNav, setActiveNav] = useState<'home' | 'projects' | 'templates' | 'brand' | 'ai'>('home');
  const [activeHeaderTab, setActiveHeaderTab] = useState<'home' | 'templates'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCustomSizeModal, setShowCustomSizeModal] = useState(false);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);

  // Category Icons matching Canva's carousel exactly
  const categoryIcons = [
    { id: 'templates', label: 'Templates', icon: LayoutTemplate, color: 'bg-purple-600 text-white' },
    { id: 'presentation', label: 'Presentation', icon: Presentation, color: 'bg-amber-600 text-white' },
    { id: 'social', label: 'Social media', icon: Instagram, color: 'bg-rose-500 text-white' },
    { id: 'video', label: 'Video', icon: PlaySquare, color: 'bg-fuchsia-600 text-white' },
    { id: 'print', label: 'Print', icon: FileText, color: 'bg-indigo-600 text-white' },
    { id: 'doc', label: 'Doc', icon: FileText, color: 'bg-teal-600 text-white' },
    { id: 'whiteboard', label: 'Whiteboard', icon: Layers, color: 'bg-emerald-500 text-white' },
    { id: 'sheet', label: 'Sheet', icon: SlidersHorizontal, color: 'bg-blue-600 text-white' },
    { id: 'code', label: 'Code', icon: Code, color: 'bg-purple-700 text-white' },
    { id: 'website', label: 'Website', icon: Globe, color: 'bg-blue-500 text-white' },
    { id: 'email', label: 'Email', icon: Mail, color: 'bg-sky-600 text-white' },
    { id: 'education', label: 'Education', icon: GraduationCap, color: 'bg-pink-600 text-white', badge: 'New' },
    { id: 'photo', label: 'Photo editor', icon: ImageIcon, color: 'bg-slate-700 text-white' },
    { id: 'magic', label: 'Magic Layers', icon: Sparkles, color: 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white' },
    { id: 'custom', label: 'Custom size', icon: Maximize2, color: 'bg-slate-800 text-slate-200', action: () => setShowCustomSizeModal(true) },
    { id: 'upload', label: 'Upload', icon: Upload, color: 'bg-slate-800 text-slate-200' },
  ];

  // Helper for human-friendly format names
  const getFormatLabel = (presetId?: string) => {
    const match = CANVAS_PRESETS.find((p) => p.id === presetId);
    if (match) return match.name;
    if (!presetId || presetId === 'custom') return 'Custom Size';
    return presetId.replace(/-/g, ' ');
  };

  // Filter templates
  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory === 'all') return matchSearch;
    if (selectedCategory === 'social') return matchSearch && (tpl.presetId.includes('instagram') || tpl.presetId.includes('twitter'));
    if (selectedCategory === 'presentation') return matchSearch && tpl.presetId.includes('youtube');
    return matchSearch;
  });

  return (
    <div className="flex h-screen w-screen bg-[#fbfbfe] text-slate-900 overflow-hidden font-sans select-none">
      {/* 1. LEFT GLOBAL SIDEBAR (Exactly like Canva screenshot) */}
      <aside className="w-18 bg-white border-r border-slate-200 flex flex-col items-center py-3.5 justify-between shrink-0 z-30 shadow-sm">
        <div className="flex flex-col items-center gap-1.5 w-full px-1">
          {/* Top Collapse toggle */}
          <button
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition mb-1 cursor-pointer"
            title="Menu"
          >
            <div className="w-5 h-5 flex flex-col justify-between py-1">
              <span className="w-full h-0.5 bg-slate-600 rounded-full" />
              <span className="w-full h-0.5 bg-slate-600 rounded-full" />
              <span className="w-full h-0.5 bg-slate-600 rounded-full" />
            </div>
          </button>

          {/* Canva Purple + Create Button */}
          <div className="relative mb-2">
            <button
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7d2ae8] to-[#9d4edd] text-white flex flex-col items-center justify-center shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 transition cursor-pointer"
              title="Create a design"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] font-bold text-[#7d2ae8] mt-0.5 text-center block">
              Create
            </span>

            {/* Create Dropdown */}
            {showCreateDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCreateDropdown(false)}
                />
                <div className="absolute left-16 top-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                    Start a New Design
                  </div>

                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setShowCustomSizeModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition text-left"
                  >
                    <Maximize2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <div>Custom size</div>
                      <div className="text-[10px] text-slate-400 font-normal">Choose width & height</div>
                    </div>
                  </button>

                  <div className="h-px bg-slate-100 my-1" />

                  {CANVAS_PRESETS.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setShowCreateDropdown(false);
                        onNewCustomDesign(p.width, p.height, `Untitled ${p.name}`);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition text-left"
                    >
                      <div>
                        <div>{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {p.width} x {p.height} px
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Navigation Items */}
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'projects', label: 'Projects', icon: FolderOpen },
            { id: 'templates', label: 'Templates', icon: LayoutTemplate },
            { id: 'brand', label: 'Brand Hub', icon: Crown, pro: true },
            { id: 'ai', label: 'Magic Studio', icon: Sparkles, badge: 'AI' },
            { id: 'shop', label: 'Print Shop', icon: ShoppingBag },
            { id: 'more', label: 'More', icon: MoreHorizontal },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id as any)}
                className={`w-14 py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-semibold transition relative cursor-pointer ${
                  isActive
                    ? 'text-[#7d2ae8] font-bold bg-purple-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#7d2ae8]' : 'text-slate-600'
                    }`}
                  />
                  {item.pro && (
                    <span className="absolute -top-1 -right-2 text-[9px] text-amber-500 font-extrabold">
                      👑
                    </span>
                  )}
                </div>
                <span className="leading-tight text-center">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Icons: Notifications & Profile Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition">
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-purple-100">
            {userEmail ? userEmail.substring(0, 1).toUpperCase() : 'D'}
          </div>
        </div>
      </aside>

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Header Row with "Try it free for 30 days" Pro Crown Button */}
        <div className="h-14 px-6 md:px-8 flex items-center justify-between border-b border-slate-100 bg-white/60 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-[#7d2ae8] via-indigo-600 to-pink-500 bg-clip-text text-transparent">
              Designtify
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Try it free for 30 days pill button */}
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-slate-800 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-200 border border-amber-300 hover:shadow-md transition cursor-pointer">
              <span className="text-amber-600">👑</span>
              <span>Try it free for 30 days</span>
            </button>
          </div>
        </div>

        {/* HERO BANNER ("What will you design today?") */}
        <div className="relative mx-6 md:mx-8 mt-4 rounded-3xl overflow-hidden p-6 md:p-10 shadow-sm border border-purple-100/50 bg-gradient-to-br from-[#cbe5fe] via-[#ede5ff] to-[#fce4ff]">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
            {/* Big Headline */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#4f28a8] mb-4 tracking-tight drop-shadow-sm">
              What will you design today?
            </h1>

            {/* Sub Tabs: Home | Templates */}
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => setActiveHeaderTab('home')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
                  activeHeaderTab === 'home'
                    ? 'bg-white text-[#4f28a8] border border-purple-200'
                    : 'bg-white/60 text-slate-600 hover:bg-white'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-purple-600" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setActiveHeaderTab('templates')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
                  activeHeaderTab === 'templates'
                    ? 'bg-white text-[#4f28a8] border border-purple-200'
                    : 'bg-white/60 text-slate-600 hover:bg-white'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-purple-600" />
                <span>Templates</span>
              </button>
            </div>

            {/* Rounded Search Bar */}
            <div className="relative w-full max-w-xl shadow-lg shadow-purple-500/10 mb-8">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything (e.g. sale, tech podcast, quote, story)..."
                className="w-full bg-white text-slate-800 text-sm pl-11 pr-4 py-3 rounded-2xl border border-purple-200 outline-none focus:border-[#7d2ae8] focus:ring-4 focus:ring-purple-200/50 transition font-medium"
              />
            </div>

            {/* Carousel of Circular Category Badges (Matching Canva Screenshot Exactly) */}
            <div className="w-full flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-1">
              {categoryIcons.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.action) {
                        cat.action();
                      } else {
                        setSelectedCategory(cat.id);
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                  >
                    <div className="relative">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition transform group-hover:scale-110 active:scale-95 ${cat.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {cat.badge && (
                        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-extrabold px-1 rounded-full uppercase shadow">
                          {cat.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 group-hover:text-purple-700 text-center whitespace-nowrap">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2.5 POPULAR SOCIAL MEDIA & DESIGN FORMATS (Instant Launch like Canva) */}
        <div className="px-6 md:px-8 mt-7">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Start a new design</span>
                <span className="text-[10px] bg-purple-100 text-[#7d2ae8] font-bold px-2 py-0.5 rounded-full">
                  Popular formats
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose a format or custom dimensions to open a tailored canvas
              </p>
            </div>
            <button
              onClick={() => setShowCustomSizeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#7d2ae8] bg-purple-50 hover:bg-purple-100 transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Custom size</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              {
                id: 'instagram-square',
                name: 'Instagram Post',
                sub: '1080 × 1080 px',
                icon: Instagram,
                gradient: 'from-pink-500 to-rose-500',
                w: 1080,
                h: 1080,
              },
              {
                id: 'instagram-story',
                name: 'Instagram Story',
                sub: '1080 × 1920 px',
                icon: Smartphone,
                gradient: 'from-purple-600 to-pink-500',
                w: 1080,
                h: 1920,
              },
              {
                id: 'youtube-thumbnail',
                name: 'YouTube Thumbnail',
                sub: '1280 × 720 px',
                icon: PlaySquare,
                gradient: 'from-red-500 to-orange-500',
                w: 1280,
                h: 720,
              },
              {
                id: 'facebook-post',
                name: 'Facebook Post',
                sub: '1200 × 630 px',
                icon: Globe,
                gradient: 'from-blue-600 to-indigo-600',
                w: 1200,
                h: 630,
              },
              {
                id: 'presentation',
                name: 'Presentation (16:9)',
                sub: '1920 × 1080 px',
                icon: Presentation,
                gradient: 'from-amber-500 to-orange-600',
                w: 1920,
                h: 1080,
              },
              {
                id: 'twitter-post',
                name: 'Twitter / X Post',
                sub: '1200 × 675 px',
                icon: ExternalLink,
                gradient: 'from-sky-500 to-blue-600',
                w: 1200,
                h: 675,
              },
            ].map((fmt) => {
              const Icon = fmt.icon;
              return (
                <button
                  key={fmt.id}
                  onClick={() => onNewCustomDesign(fmt.w, fmt.h, `Untitled ${fmt.name}`)}
                  className="group bg-white rounded-2xl p-3.5 border border-slate-200/80 hover:border-purple-400 hover:shadow-lg transition transform hover:-translate-y-0.5 text-left cursor-pointer flex flex-col justify-between"
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${fmt.gradient} text-white flex items-center justify-center shadow-md mb-2.5 transition transform group-hover:scale-110`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-[#7d2ae8] transition truncate">
                      {fmt.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {fmt.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. "Continue designing" SECTION (Recent Projects) */}
        <div className="px-6 md:px-8 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Continue designing
            </h2>
            <button className="text-xs font-bold text-slate-500 hover:text-purple-700 transition">
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentDesigns.slice(0, 5).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onOpenDesign(proj)}
                className="group bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-300 transition transform hover:-translate-y-1 cursor-pointer flex flex-col"
              >
                {/* Visual Thumbnail */}
                <div
                  className="w-full aspect-[4/3] rounded-xl overflow-hidden relative flex items-center justify-center text-center p-3 mb-2.5 shadow-inner"
                  style={{
                    backgroundColor: proj.background?.color || '#0f172a',
                    backgroundImage:
                      proj.background?.type === 'gradient' && proj.background.gradient
                        ? `linear-gradient(${proj.background.gradient.angle}deg, ${proj.background.gradient.from}, ${proj.background.gradient.to})`
                        : undefined,
                  }}
                >
                  <span className="text-xs font-extrabold text-white drop-shadow line-clamp-2">
                    {proj.title}
                  </span>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="px-2.5 py-1 bg-white text-purple-700 text-[11px] font-bold rounded-full shadow">
                      Edit
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between px-1">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-purple-700">
                      {proj.title}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                      <span>{getFormatLabel(proj.presetId)}</span>
                      <span>•</span>
                      <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {onDeleteRecentDesign && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecentDesign(proj.id);
                      }}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition opacity-0 group-hover:opacity-100"
                      title="Delete design"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. "Templates for you" SECTION (Extensive Library) */}
        <div className="px-6 md:px-8 mt-10 pb-16">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Templates for you
              </h2>
              <p className="text-xs text-slate-400">
                Pick any professionally crafted template and customize in seconds
              </p>
            </div>
            <button className="text-xs font-bold text-slate-500 hover:text-purple-700 transition">
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => onOpenDesign(template)}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-400 transition transform hover:-translate-y-1 cursor-pointer flex flex-col"
              >
                <div className="aspect-square w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                    <span className="w-full py-1.5 bg-white text-purple-700 text-xs font-bold rounded-xl text-center shadow">
                      Customize this template
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <div className="text-xs font-bold text-slate-900 truncate group-hover:text-purple-700">
                    {template.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{template.category}</span>
                    <span className="font-mono text-purple-600 font-semibold">
                      {getFormatLabel(template.presetId)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Purple Question Mark Help Button (Canva signature, seen on bottom right of screenshot) */}
      <button
        onClick={() => setShowCustomSizeModal(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#7d2ae8] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition z-40 cursor-pointer"
        title="Quick Canvas Creator"
      >
        <span className="font-black text-xl">?</span>
      </button>

      {/* Custom Size Modal */}
      {showCustomSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Custom size</h3>
              <button
                onClick={() => setShowCustomSizeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Width</span>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value) || 100)}
                  className="w-full bg-transparent font-mono text-sm font-bold text-slate-800 outline-none"
                />
              </div>

              <span className="text-slate-400 font-bold">×</span>

              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Height</span>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value) || 100)}
                  className="w-full bg-transparent font-mono text-sm font-bold text-slate-800 outline-none"
                />
              </div>

              <span className="text-xs font-bold text-slate-500">px</span>
            </div>

            <button
              onClick={() => {
                setShowCustomSizeModal(false);
                onNewCustomDesign(customWidth, customHeight, 'Untitled Custom Design');
              }}
              className="w-full py-2.5 bg-[#7d2ae8] hover:bg-[#6b1cd4] text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
            >
              Create new design
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
