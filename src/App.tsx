import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CanvasDesign,
  CanvasElement,
  CanvasPreset,
  Template,
  CollabUser,
  CanvasComment,
  TextElement,
  ShapeElement,
} from './types/design';
import { TEMPLATES } from './data/templates';
import { CANVAS_PRESETS } from './data/presets';
import { collabService } from './services/collaboration';
import { testConnection } from './services/firebase';
import { saveDesignToFirestore, saveCommentToFirestore } from './services/firebaseSync';
import { Header } from './components/Header';
import { TopToolbar } from './components/TopToolbar';
import { LeftSidebar, SidebarTab } from './components/LeftSidebar';
import { CanvasArea } from './components/CanvasArea';
import { ExportModal } from './components/ExportModal';
import { TeamCollabModal } from './components/TeamCollabModal';
import { MobileDrawer } from './components/MobileDrawer';
import { ResizeModal } from './components/ResizeModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Dashboard } from './components/Dashboard';
import { X, Tv } from 'lucide-react';

export default function App() {
  // Navigation view: 'dashboard' (Canva home screen) vs 'editor' (Canva studio canvas)
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');

  // Initial Design from first template
  const defaultTemplate = TEMPLATES[0];
  const [design, setDesign] = useState<CanvasDesign>({
    id: 'design-' + Date.now(),
    title: defaultTemplate.name,
    presetId: defaultTemplate.presetId,
    width: 1080,
    height: 1080,
    background: defaultTemplate.background,
    elements: JSON.parse(JSON.stringify(defaultTemplate.elements)),
    updatedAt: Date.now(),
  });

  // Recent Designs (Continue designing section)
  const [recentDesigns, setRecentDesigns] = useState<CanvasDesign[]>([
    {
      id: 'proj-resume',
      title: 'resume-ni-kyle (1).docx',
      presetId: 'custom',
      width: 1200,
      height: 1600,
      background: { type: 'solid', color: '#f8fafc' },
      elements: [
        {
          id: 'text-res-1',
          type: 'text',
          text: 'KYLE DELA CRUZ\nSenior Product Designer',
          x: 200,
          y: 200,
          width: 800,
          height: 150,
          fontSize: 48,
          fontFamily: 'Montserrat',
          fontWeight: 800,
          color: '#0f172a',
          textAlign: 'center',
          zIndex: 1,
        },
      ],
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    },
    {
      id: 'proj-climate',
      title: 'CLIMATE CHANGE PPT.pptx',
      presetId: 'youtube-thumbnail',
      width: 1280,
      height: 720,
      background: {
        type: 'gradient',
        color: '#022c22',
        gradient: { from: '#0f172a', to: '#064e3b', angle: 135 },
      },
      elements: [
        {
          id: 'text-clim-1',
          type: 'text',
          text: 'GLOBAL CLIMATE ACTION\nRenewable Solutions 2026',
          x: 100,
          y: 220,
          width: 1080,
          height: 200,
          fontSize: 64,
          fontFamily: 'Space Grotesk',
          fontWeight: 800,
          color: '#34d399',
          textAlign: 'center',
          zIndex: 1,
        },
      ],
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
      id: 'design-' + defaultTemplate.id,
      title: defaultTemplate.name,
      presetId: defaultTemplate.presetId,
      width: 1080,
      height: 1080,
      background: defaultTemplate.background,
      elements: defaultTemplate.elements,
      updatedAt: Date.now() - 1000 * 60 * 60,
    },
  ]);

  // Undo / Redo History
  const [historyPast, setHistoryPast] = useState<CanvasDesign[]>([]);
  const [historyFuture, setHistoryFuture] = useState<CanvasDesign[]>([]);

  // Selection & UI States
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('templates');
  const [mobileDrawerTab, setMobileDrawerTab] = useState<SidebarTab | null>(null);
  const [zoom, setZoom] = useState<number>(0.65);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isPlayingMotion, setIsPlayingMotion] = useState(false);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [comments, setComments] = useState<CanvasComment[]>([]);

  // Multi-Page Support (Like Canva)
  const [pages, setPages] = useState<
    { id: string; name: string; background: typeof design.background; elements: typeof design.elements }[]
  >([
    {
      id: 'page-1',
      name: 'Page 1',
      background: defaultTemplate.background,
      elements: JSON.parse(JSON.stringify(defaultTemplate.elements)),
    },
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Collaboration State
  const [currentUser, setCurrentUser] = useState<CollabUser>(collabService.getCurrentUser());
  const [collaborators, setCollaborators] = useState<CollabUser[]>([]);
  const [isCloudSaved, setIsCloudSaved] = useState<boolean>(false);
  const autoSaveTimer = useRef<any>(null);

  // Test Firebase Firestore connection on mount
  useEffect(() => {
    testConnection().then((connected) => {
      if (connected) {
        setIsCloudSaved(true);
      }
    });
  }, []);

  // Debounced auto-save to Firestore whenever design changes
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setIsCloudSaved(false);
    autoSaveTimer.current = setTimeout(async () => {
      const saved = await saveDesignToFirestore(design, true);
      if (saved) setIsCloudSaved(true);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [design]);

  // Throttle cursor broadcast
  const lastCursorTime = useRef<number>(0);

  // Responsive zoom setup on mount
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setZoom(0.32);
      } else if (window.innerWidth < 1280) {
        setZoom(0.55);
      } else {
        setZoom(0.65);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Connect Real-Time Collaboration WebSocket & Channel
  useEffect(() => {
    collabService.connect('project-default');

    const unsubscribe = collabService.subscribe((event) => {
      const { type, payload } = event;

      if (type === 'room_init') {
        if (payload.users) {
          const others = payload.users.filter((u: CollabUser) => u.id !== currentUser.id);
          setCollaborators(others);
        }
        if (payload.comments) {
          setComments(payload.comments);
        }
      } else if (type === 'user_joined') {
        if (payload.user && payload.user.id !== currentUser.id) {
          setCollaborators((prev) => {
            if (prev.some((u) => u.id === payload.user.id)) return prev;
            return [...prev, payload.user];
          });
        }
      } else if (type === 'user_left') {
        setCollaborators((prev) => prev.filter((u) => u.id !== payload.userId));
      } else if (type === 'cursor_update') {
        if (payload.userId !== currentUser.id) {
          setCollaborators((prev) =>
            prev.map((u) =>
              u.id === payload.userId
                ? {
                    ...u,
                    cursor: payload.cursor,
                    activeElementId: payload.activeElementId,
                  }
                : u
            )
          );
        }
      } else if (type === 'canvas_delta') {
        if (payload.userId !== currentUser.id && payload.patch) {
          // Apply peer updates
          setDesign((prev) => ({
            ...prev,
            ...payload.patch,
            updatedAt: Date.now(),
          }));
        }
      } else if (type === 'comment_added') {
        setComments((prev) => [...prev, payload.comment]);
      } else if (type === 'comment_resolved') {
        setComments((prev) =>
          prev.map((c) =>
            c.id === payload.commentId ? { ...c, resolved: payload.resolved } : c
          )
        );
      }
    });

    return () => {
      unsubscribe();
      collabService.disconnect();
    };
  }, [currentUser.id]);

  // Record history snapshot helper
  const recordHistory = useCallback((current: CanvasDesign) => {
    setHistoryPast((prev) => [...prev.slice(-25), JSON.parse(JSON.stringify(current))]);
    setHistoryFuture([]);
  }, []);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((prev) => prev.slice(0, prev.length - 1));
    setHistoryFuture((prev) => [JSON.parse(JSON.stringify(design)), ...prev]);
    setDesign(previous);
    collabService.sendCanvasDelta('undo', { elements: previous.elements });
  }, [historyPast, design]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((prev) => prev.slice(1));
    setHistoryPast((prev) => [...prev, JSON.parse(JSON.stringify(design))]);
    setDesign(next);
    collabService.sendCanvasDelta('redo', { elements: next.elements });
  }, [historyFuture, design]);

  // Keyboard Shortcuts (Undo / Redo / Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Update design title
  const handleUpdateTitle = (title: string) => {
    recordHistory(design);
    setDesign((prev) => {
      const next = { ...prev, title };
      collabService.sendCanvasDelta('title_change', { title });
      return next;
    });
  };

  // Resize & Magic Switch with custom dimensions or preset
  const handleApplyResize = (
    newWidth: number,
    newHeight: number,
    presetId?: string,
    copyAndResize: boolean = false
  ) => {
    recordHistory(design);
    const scaleX = newWidth / design.width;
    const scaleY = newHeight / design.height;

    const rescaledElements = design.elements.map((el) => ({
      ...el,
      x: Math.round(el.x * scaleX),
      y: Math.round(el.y * scaleY),
      width: Math.round(el.width * Math.min(scaleX, scaleY)),
      height: Math.round(el.height * Math.min(scaleX, scaleY)),
      fontSize:
        el.type === 'text'
          ? Math.round(((el as TextElement).fontSize || 32) * Math.min(scaleX, scaleY))
          : undefined,
    })) as CanvasElement[];

    const updated: CanvasDesign = {
      ...design,
      id: copyAndResize ? 'design-' + Date.now() : design.id,
      title: copyAndResize ? `${design.title} (Copy)` : design.title,
      presetId: (presetId as any) || 'custom',
      width: newWidth,
      height: newHeight,
      elements: rescaledElements,
      updatedAt: Date.now(),
    };

    setDesign(updated);
    collabService.sendCanvasDelta('canvas_resize', {
      width: newWidth,
      height: newHeight,
      presetId: updated.presetId,
      elements: rescaledElements,
    });
  };

  // Switch Canvas Preset
  const handleSelectPreset = (preset: CanvasPreset) => {
    recordHistory(design);
    const scaleX = preset.width / design.width;
    const scaleY = preset.height / design.height;

    // Rescale element positions proportionally to match new canvas geometry
    const rescaledElements = design.elements.map((el) => ({
      ...el,
      x: Math.round(el.x * scaleX),
      y: Math.round(el.y * scaleY),
      width: Math.round(el.width * Math.min(scaleX, scaleY)),
      height: Math.round(el.height * Math.min(scaleX, scaleY)),
      fontSize:
        el.type === 'text'
          ? Math.round(((el as TextElement).fontSize || 32) * Math.min(scaleX, scaleY))
          : undefined,
    })) as CanvasElement[];

    const updated: CanvasDesign = {
      ...design,
      presetId: preset.id,
      width: preset.width,
      height: preset.height,
      elements: rescaledElements,
      updatedAt: Date.now(),
    };

    setDesign(updated);
    collabService.sendCanvasDelta('preset_change', {
      presetId: preset.id,
      width: preset.width,
      height: preset.height,
      elements: rescaledElements,
    });
  };

  // Apply Template
  const handleApplyTemplate = (template: Template) => {
    recordHistory(design);
    const newElements = JSON.parse(JSON.stringify(template.elements));
    const updated: CanvasDesign = {
      ...design,
      presetId: template.presetId,
      background: template.background,
      elements: newElements,
      updatedAt: Date.now(),
    };
    setDesign(updated);
    setSelectedId(null);
    collabService.sendCanvasDelta('template_applied', {
      background: template.background,
      elements: newElements,
    });
  };

  // Apply AI Magic Design Generation Result
  const handleApplyMagicDesign = (magicData: any) => {
    recordHistory(design);
    let newBg = design.background;
    if (magicData.background) {
      newBg = {
        type: magicData.background.type || 'gradient',
        color: magicData.background.color || '#0f172a',
        gradient: magicData.background.gradient || {
          from: '#1e1b4b',
          to: '#0f172a',
          angle: 135,
        },
      };
    }

    const newElements: CanvasElement[] = (magicData.elements || []).map(
      (el: any, i: number) => ({
        ...el,
        id: el.id || `ai-el-${i}-${Date.now()}`,
        zIndex: i + 1,
      })
    );

    const updated: CanvasDesign = {
      ...design,
      title: magicData.title || design.title,
      background: newBg,
      elements: newElements.length > 0 ? newElements : design.elements,
      updatedAt: Date.now(),
    };

    setDesign(updated);
    setSelectedId(null);
    collabService.sendCanvasDelta('magic_design_applied', {
      title: updated.title,
      background: updated.background,
      elements: updated.elements,
    });
  };

  // Add Element
  const handleAddElement = (partialEl: Partial<CanvasElement>) => {
    recordHistory(design);
    const id = 'el-' + Math.random().toString(36).substring(2, 9);
    const maxZ = design.elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);

    const newElement = {
      id,
      x: partialEl.x ?? Math.round(design.width / 2 - (partialEl.width || 300) / 2),
      y: partialEl.y ?? Math.round(design.height / 2 - (partialEl.height || 100) / 2),
      width: partialEl.width || 300,
      height: partialEl.height || 100,
      zIndex: maxZ + 1,
      ...partialEl,
    } as CanvasElement;

    const nextElements = [...design.elements, newElement];
    setDesign((prev) => ({ ...prev, elements: nextElements }));
    setSelectedId(id);
    collabService.sendCanvasDelta('element_add', { elements: nextElements });
  };

  // Update Element
  const handleUpdateElement = (
    id: string,
    updates: Partial<CanvasElement>,
    shouldRecordHistory: boolean = false
  ) => {
    if (shouldRecordHistory) {
      recordHistory(design);
    }
    setDesign((prev) => {
      const nextElements = prev.elements.map((el) =>
        el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
      );
      collabService.sendCanvasDelta('element_update', { elements: nextElements });
      return { ...prev, elements: nextElements };
    });
  };

  // Duplicate Element
  const handleDuplicateElement = (id: string) => {
    const el = design.elements.find((e) => e.id === id);
    if (!el) return;
    recordHistory(design);
    const newId = 'el-' + Math.random().toString(36).substring(2, 9);
    const maxZ = design.elements.reduce((max, e) => Math.max(max, e.zIndex || 0), 0);

    const dup: CanvasElement = {
      ...JSON.parse(JSON.stringify(el)),
      id: newId,
      x: el.x + 30,
      y: el.y + 30,
      zIndex: maxZ + 1,
    };

    const nextElements = [...design.elements, dup];
    setDesign((prev) => ({ ...prev, elements: nextElements }));
    setSelectedId(newId);
    collabService.sendCanvasDelta('element_duplicate', { elements: nextElements });
  };

  // Delete Element
  const handleDeleteElement = (id: string) => {
    recordHistory(design);
    const nextElements = design.elements.filter((el) => el.id !== id);
    setDesign((prev) => ({ ...prev, elements: nextElements }));
    if (selectedId === id) setSelectedId(null);
    collabService.sendCanvasDelta('element_delete', { elements: nextElements });
  };

  // Bring to Front
  const handleBringToFront = (id: string) => {
    recordHistory(design);
    const maxZ = design.elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);
    const nextElements = design.elements.map((el) =>
      el.id === id ? { ...el, zIndex: maxZ + 1 } : el
    );
    setDesign((prev) => ({ ...prev, elements: nextElements }));
    collabService.sendCanvasDelta('reorder', { elements: nextElements });
  };

  // Send to Back
  const handleSendToBack = (id: string) => {
    recordHistory(design);
    const minZ = design.elements.reduce((min, el) => Math.min(min, el.zIndex || 0), 0);
    const nextElements = design.elements.map((el) =>
      el.id === id ? { ...el, zIndex: Math.max(0, minZ - 1) } : el
    );
    setDesign((prev) => ({ ...prev, elements: nextElements }));
    collabService.sendCanvasDelta('reorder', { elements: nextElements });
  };

  // Apply Theme Palette to all design elements
  const handleApplyPalette = (colors: string[]) => {
    if (colors.length < 3) return;
    recordHistory(design);
    const [bgColor, primary, secondary, accent, textCol] = colors;

    const newBg = {
      type: 'gradient' as const,
      color: bgColor,
      gradient: { from: bgColor, to: secondary || bgColor, angle: 135 },
    };

    const updatedElements = design.elements.map((el, i) => {
      if (el.type === 'shape') {
        return {
          ...el,
          fill: i % 2 === 0 ? primary : accent || secondary,
        };
      }
      if (el.type === 'text') {
        return {
          ...el,
          color: (el as TextElement).fontSize && (el as TextElement).fontSize > 50 ? '#ffffff' : textCol || '#cbd5e1',
        };
      }
      return el;
    });

    const updated: CanvasDesign = {
      ...design,
      background: newBg,
      elements: updatedElements,
    };

    setDesign(updated);
    collabService.sendCanvasDelta('palette_apply', {
      background: newBg,
      elements: updatedElements,
    });
  };

  // Apply Gradient Background
  const handleApplyBackgroundGradient = (grad: { from: string; to: string; angle: number }) => {
    recordHistory(design);
    const newBg = {
      type: 'gradient' as const,
      color: grad.from,
      gradient: grad,
    };
    setDesign((prev) => ({ ...prev, background: newBg }));
    collabService.sendCanvasDelta('background_gradient', { background: newBg });
  };

  // Broadcast throttled mouse cursor
  const handleBroadcastCursor = (x: number, y: number, elementId?: string | null) => {
    const now = Date.now();
    if (now - lastCursorTime.current > 40) {
      lastCursorTime.current = now;
      collabService.sendCursor(x, y, elementId);
    }
  };

  // Open existing project or template from dashboard
  const handleOpenDesign = (templateOrDesign: Template | CanvasDesign) => {
    recordHistory(design);
    if ('tags' in templateOrDesign) {
      // It's a template
      const tpl = templateOrDesign as Template;
      const newD: CanvasDesign = {
        id: 'design-' + Date.now(),
        title: tpl.name,
        presetId: tpl.presetId,
        width: tpl.presetId === 'instagram-story' ? 1080 : tpl.presetId === 'youtube-thumbnail' ? 1280 : 1080,
        height: tpl.presetId === 'instagram-story' ? 1920 : tpl.presetId === 'youtube-thumbnail' ? 720 : 1080,
        background: tpl.background,
        elements: JSON.parse(JSON.stringify(tpl.elements)),
        updatedAt: Date.now(),
      };
      setDesign(newD);
      setPages([
        {
          id: 'page-1',
          name: 'Page 1',
          background: newD.background,
          elements: JSON.parse(JSON.stringify(newD.elements)),
        },
      ]);
      setCurrentPageIndex(0);
      setRecentDesigns((prev) => [newD, ...prev.filter((d) => d.id !== newD.id)]);
    } else {
      // It's a saved project
      const proj = templateOrDesign as CanvasDesign;
      setDesign(proj);
      setPages([
        {
          id: 'page-1',
          name: 'Page 1',
          background: proj.background,
          elements: JSON.parse(JSON.stringify(proj.elements)),
        },
      ]);
      setCurrentPageIndex(0);
      setRecentDesigns((prev) => [proj, ...prev.filter((d) => d.id !== proj.id)]);
    }
    setCurrentView('editor');
  };

  const handleNewCustomDesign = (width: number, height: number, title?: string) => {
    recordHistory(design);
    const newD: CanvasDesign = {
      id: 'design-' + Date.now(),
      title: title || 'Untitled Design',
      presetId: 'custom',
      width,
      height,
      background: { type: 'solid', color: '#ffffff' },
      elements: [],
      updatedAt: Date.now(),
    };
    setDesign(newD);
    setPages([
      {
        id: 'page-1',
        name: 'Page 1',
        background: newD.background,
        elements: [],
      },
    ]);
    setCurrentPageIndex(0);
    setRecentDesigns((prev) => [newD, ...prev]);
    setCurrentView('editor');
  };

  // Multi-Page Handlers (Canva style)
  const handleAddPage = () => {
    const newPage = {
      id: 'page-' + Date.now(),
      name: `Page ${pages.length + 1}`,
      background: { type: 'solid' as const, color: '#ffffff' },
      elements: [],
    };
    recordHistory(design);
    const updated = [...pages];
    updated[currentPageIndex] = {
      ...updated[currentPageIndex],
      background: design.background,
      elements: design.elements,
    };
    updated.push(newPage);
    setPages(updated);
    setCurrentPageIndex(updated.length - 1);
    setDesign((prev) => ({
      ...prev,
      background: newPage.background,
      elements: newPage.elements,
    }));
    setSelectedId(null);
  };

  const handleDuplicatePage = () => {
    recordHistory(design);
    const updated = [...pages];
    updated[currentPageIndex] = {
      ...updated[currentPageIndex],
      background: design.background,
      elements: design.elements,
    };
    const cloned = {
      id: 'page-' + Date.now(),
      name: `${updated[currentPageIndex].name} (Copy)`,
      background: design.background,
      elements: JSON.parse(JSON.stringify(design.elements)),
    };
    updated.splice(currentPageIndex + 1, 0, cloned);
    setPages(updated);
    setCurrentPageIndex(currentPageIndex + 1);
    setSelectedId(null);
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) return;
    recordHistory(design);
    const updated = pages.filter((_, idx) => idx !== currentPageIndex);
    const newIdx = Math.min(currentPageIndex, updated.length - 1);
    setPages(updated);
    setCurrentPageIndex(newIdx);
    setDesign((prev) => ({
      ...prev,
      background: updated[newIdx].background,
      elements: updated[newIdx].elements,
    }));
    setSelectedId(null);
  };

  const handleSelectPage = (newIdx: number) => {
    if (newIdx === currentPageIndex || newIdx < 0 || newIdx >= pages.length) return;
    const updated = [...pages];
    updated[currentPageIndex] = {
      ...updated[currentPageIndex],
      background: design.background,
      elements: design.elements,
    };
    setPages(updated);
    setCurrentPageIndex(newIdx);
    setDesign((prev) => ({
      ...prev,
      background: updated[newIdx].background,
      elements: updated[newIdx].elements,
    }));
    setSelectedId(null);
  };

  // Selected element reference
  const selectedElement = design.elements.find((el) => el.id === selectedId) || null;

  // Render Canva Home Dashboard if in 'dashboard' view
  if (currentView === 'dashboard') {
    return (
      <Dashboard
        onOpenDesign={handleOpenDesign}
        onNewCustomDesign={handleNewCustomDesign}
        recentDesigns={recentDesigns}
        onDeleteRecentDesign={(id) => setRecentDesigns((prev) => prev.filter((d) => d.id !== id))}
        userEmail={currentUser.name}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Header Navbar */}
      <Header
        design={design}
        onUpdateTitle={handleUpdateTitle}
        onSelectPreset={handleSelectPreset}
        zoom={zoom}
        onZoomChange={setZoom}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        collaborators={collaborators}
        currentUser={currentUser}
        onOpenCollab={() => setIsCollabOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAI={() => {
          setActiveSidebarTab('ai');
          setMobileDrawerTab('ai');
        }}
        showLayers={activeSidebarTab === 'layers'}
        onToggleLayers={() => setActiveSidebarTab(activeSidebarTab === 'layers' ? 'templates' : 'layers')}
        onSaveCloud={async () => {
          const ok = await saveDesignToFirestore(design, false);
          if (ok) setIsCloudSaved(true);
        }}
        isCloudSaved={isCloudSaved}
        onOpenResizeModal={() => setIsResizeModalOpen(true)}
        onTogglePresentation={() => setIsPresentationMode(!isPresentationMode)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onGoHome={() => setCurrentView('dashboard')}
      />

      {/* 2. Context-Sensitive Top Styling Toolbar */}
      <TopToolbar
        selectedElement={selectedElement}
        onUpdateElement={(id, updates) => handleUpdateElement(id, updates, true)}
        onDuplicateElement={handleDuplicateElement}
        onDeleteElement={handleDeleteElement}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        background={design.background}
        onUpdateBackground={(bg) => {
          recordHistory(design);
          setDesign((prev) => ({ ...prev, background: bg }));
          collabService.sendCanvasDelta('background_change', { background: bg });
        }}
        onPlayAnimation={() => {
          setIsPlayingMotion(true);
          setTimeout(() => setIsPlayingMotion(false), 1800);
        }}
      />

      {/* 3. Main Workspace Area: Left Sidebar + Canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Left Sidebar */}
        {!isPresentationMode && (
          <div className="hidden md:flex h-full">
            <LeftSidebar
              design={design}
              activeTab={activeSidebarTab}
              onSelectTab={setActiveSidebarTab}
              onApplyTemplate={handleApplyTemplate}
              onAddElement={handleAddElement}
              onApplyMagicDesign={handleApplyMagicDesign}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              onSelectElement={setSelectedId}
              selectedId={selectedId}
              onReorderElements={(elements) => {
                recordHistory(design);
                setDesign((prev) => ({ ...prev, elements }));
              }}
              onApplyPalette={handleApplyPalette}
              onApplyBackgroundGradient={handleApplyBackgroundGradient}
            />
          </div>
        )}

        {/* Mobile Flyout Drawer when a bottom tab is active */}
        {mobileDrawerTab && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex flex-col justify-end">
            <div className="bg-slate-900 border-t border-slate-800 rounded-t-2xl max-h-[75vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {mobileDrawerTab}
                </span>
                <button
                  onClick={() => setMobileDrawerTab(null)}
                  className="px-2 py-1 text-xs text-slate-400 font-semibold"
                >
                  Close
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-2">
                <LeftSidebar
                  design={design}
                  activeTab={mobileDrawerTab}
                  onSelectTab={(tab) => setMobileDrawerTab(tab)}
                  onApplyTemplate={(t) => {
                    handleApplyTemplate(t);
                    setMobileDrawerTab(null);
                  }}
                  onAddElement={(el) => {
                    handleAddElement(el);
                    setMobileDrawerTab(null);
                  }}
                  onApplyMagicDesign={(data) => {
                    handleApplyMagicDesign(data);
                    setMobileDrawerTab(null);
                  }}
                  onUpdateElement={handleUpdateElement}
                  onDeleteElement={handleDeleteElement}
                  onSelectElement={setSelectedId}
                  selectedId={selectedId}
                  onReorderElements={(elements) => setDesign((prev) => ({ ...prev, elements }))}
                  onApplyPalette={(p) => {
                    handleApplyPalette(p);
                    setMobileDrawerTab(null);
                  }}
                  onApplyBackgroundGradient={(g) => {
                    handleApplyBackgroundGradient(g);
                    setMobileDrawerTab(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Canvas Workspace Viewport */}
        <CanvasArea
          design={design}
          zoom={zoom}
          onZoomChange={setZoom}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onUpdateElement={handleUpdateElement}
          onBroadcastCursor={handleBroadcastCursor}
          collaborators={collaborators}
          currentUser={currentUser}
          comments={comments}
          onAddComment={(c) => {
            collabService.addComment(c);
            saveCommentToFirestore(design.id, c);
          }}
          onResolveComment={(id, resolved) => collabService.resolveComment(id, resolved)}
          isCommentMode={isCommentMode}
          onToggleCommentMode={() => setIsCommentMode(!isCommentMode)}
          isPlayingMotion={isPlayingMotion}
          totalPages={pages.length}
          currentPageIndex={currentPageIndex}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
        />

        {/* Exit Presentation Mode Floating Button */}
        {isPresentationMode && (
          <button
            onClick={() => setIsPresentationMode(false)}
            className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full text-xs font-bold border border-slate-700 shadow-2xl flex items-center gap-1.5 transition"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Exit Presentation</span>
          </button>
        )}
      </div>

      {/* 4. Mobile Bottom Toolbar Drawer */}
      <MobileDrawer
        activeTab={mobileDrawerTab}
        onSelectTab={setMobileDrawerTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenCollab={() => setIsCollabOpen(true)}
      />

      {/* 5. Modals: Export & Publish */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        design={design}
        onAdaptPreset={handleSelectPreset}
      />

      {/* 6. Modals: Team Real-Time Collaboration */}
      <TeamCollabModal
        isOpen={isCollabOpen}
        onClose={() => setIsCollabOpen(false)}
        collaborators={collaborators}
        currentUser={currentUser}
        onUpdateUser={(updates) => {
          collabService.updateCurrentUser(updates);
          setCurrentUser(collabService.getCurrentUser());
        }}
        roomId="project-default"
        design={design}
        onDesignSaved={() => setIsCloudSaved(true)}
      />

      {/* 7. Resize & Magic Switch Modal */}
      <ResizeModal
        isOpen={isResizeModalOpen}
        onClose={() => setIsResizeModalOpen(false)}
        currentWidth={design.width}
        currentHeight={design.height}
        currentPresetId={design.presetId}
        onApplyResize={handleApplyResize}
      />

      {/* 8. Pro Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
