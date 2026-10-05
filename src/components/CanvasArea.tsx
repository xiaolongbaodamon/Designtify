import React, { useRef, useState, useEffect } from 'react';
import {
  CanvasDesign,
  CanvasElement,
  TextElement,
  ShapeElement,
  ImageElement,
  DrawingElement,
  CollabUser,
  CanvasComment,
  TextEffect,
} from '../types/design';
import {
  MessageSquare,
  Check,
  X,
  Send,
  Grid,
  Eye,
  Maximize,
  ZoomIn,
  ZoomOut,
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CanvasAreaProps {
  design: CanvasDesign;
  zoom: number;
  onZoomChange?: (newZoom: number) => void;
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>, recordHistory?: boolean) => void;
  onBroadcastCursor: (x: number, y: number, elementId?: string | null) => void;
  collaborators: CollabUser[];
  currentUser: CollabUser;
  comments: CanvasComment[];
  onAddComment: (comment: CanvasComment) => void;
  onResolveComment: (commentId: string, resolved: boolean) => void;
  isCommentMode: boolean;
  onToggleCommentMode: () => void;
  isPlayingMotion?: boolean;
  totalPages?: number;
  currentPageIndex?: number;
  onSelectPage?: (index: number) => void;
  onAddPage?: () => void;
  onDuplicatePage?: () => void;
  onDeletePage?: () => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  design,
  zoom,
  onZoomChange,
  selectedId,
  onSelectElement,
  onUpdateElement,
  onBroadcastCursor,
  collaborators,
  currentUser,
  comments,
  onAddComment,
  onResolveComment,
  isCommentMode,
  onToggleCommentMode,
  isPlayingMotion = false,
  totalPages = 1,
  currentPageIndex = 0,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dragging & Resizing state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [elementStart, setElementStart] = useState<{ x: number; y: number } | null>(null);

  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    elX: number;
    elY: number;
    elW: number;
    elH: number;
  } | null>(null);

  // Snapping guides
  const [guideX, setGuideX] = useState<number | null>(null);
  const [guideY, setGuideY] = useState<number | null>(null);

  // Grid overlay
  const [showGrid, setShowGrid] = useState(false);

  // Inline text editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Comment pin placement
  const [pendingCommentCoords, setPendingCommentCoords] = useState<{ x: number; y: number } | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const selectedElement = design.elements.find((el) => el.id === selectedId) || null;

  // Track cursor position for multi-user collaboration
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) / zoom;
    const canvasY = (e.clientY - rect.top) / zoom;

    onBroadcastCursor(Math.round(canvasX), Math.round(canvasY), selectedId);

    // Handle Dragging
    if (isDragging && selectedElement && !selectedElement.locked && dragStart && elementStart) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      let newX = Math.round(elementStart.x + deltaX);
      let newY = Math.round(elementStart.y + deltaY);

      // Smart Snapping to Canvas Center
      const centerX = (design.width - selectedElement.width) / 2;
      const centerY = (design.height - selectedElement.height) / 2;
      const snapThreshold = 10;

      if (Math.abs(newX - centerX) < snapThreshold) {
        newX = Math.round(centerX);
        setGuideX(design.width / 2);
      } else {
        setGuideX(null);
      }

      if (Math.abs(newY - centerY) < snapThreshold) {
        newY = Math.round(centerY);
        setGuideY(design.height / 2);
      } else {
        setGuideY(null);
      }

      onUpdateElement(selectedElement.id, { x: newX, y: newY }, false);
    }

    // Handle Resizing
    if (resizingHandle && selectedElement && resizeStart) {
      const deltaX = (e.clientX - resizeStart.mouseX) / zoom;
      const deltaY = (e.clientY - resizeStart.mouseY) / zoom;

      let newX = resizeStart.elX;
      let newY = resizeStart.elY;
      let newW = resizeStart.elW;
      let newH = resizeStart.elH;

      if (resizingHandle.includes('e')) newW = Math.max(30, resizeStart.elW + deltaX);
      if (resizingHandle.includes('s')) newH = Math.max(20, resizeStart.elH + deltaY);
      if (resizingHandle.includes('w')) {
        const potentialW = resizeStart.elW - deltaX;
        if (potentialW > 30) {
          newW = potentialW;
          newX = resizeStart.elX + deltaX;
        }
      }
      if (resizingHandle.includes('n')) {
        const potentialH = resizeStart.elH - deltaY;
        if (potentialH > 20) {
          newH = potentialH;
          newY = resizeStart.elY + deltaY;
        }
      }

      // If text element, proportionally scale font size if dragging corner
      if (selectedElement.type === 'text' && (resizingHandle === 'se' || resizingHandle === 'ne')) {
        const scaleFactor = newW / resizeStart.elW;
        const baseFont = (selectedElement as TextElement).fontSize || 32;
        const newFontSize = Math.round(baseFont * scaleFactor);
        onUpdateElement(
          selectedElement.id,
          {
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
            fontSize: Math.max(10, Math.min(240, newFontSize)),
          },
          false
        );
      } else {
        onUpdateElement(
          selectedElement.id,
          {
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
          },
          false
        );
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectedElement) {
      setIsDragging(false);
      setGuideX(null);
      setGuideY(null);
      onUpdateElement(selectedElement.id, { x: selectedElement.x, y: selectedElement.y }, true);
    }
    if (resizingHandle) {
      setResizingHandle(null);
      setResizeStart(null);
    }
  };

  // Canvas Click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isCommentMode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left) / zoom);
      const y = Math.round((e.clientY - rect.top) / zoom);
      setPendingCommentCoords({ x, y });
      return;
    }

    if (e.target === canvasRef.current) {
      onSelectElement(null);
      setEditingTextId(null);
      setActiveCommentId(null);
    }
  };

  const submitComment = () => {
    if (!pendingCommentCoords || !commentInput.trim()) return;
    const newComment: CanvasComment = {
      id: 'comment-' + Date.now(),
      x: pendingCommentCoords.x,
      y: pendingCommentCoords.y,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        color: currentUser.color,
      },
      text: commentInput.trim(),
      createdAt: Date.now(),
      resolved: false,
    };

    onAddComment(newComment);
    setCommentInput('');
    setPendingCommentCoords(null);
    onToggleCommentMode();
  };

  // Keyboard Delete / Esc shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextId) return;
      if (e.key === 'Escape') {
        onSelectElement(null);
        setActiveCommentId(null);
        setPendingCommentCoords(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTextId, onSelectElement]);

  // Render Background Styles
  const getBackgroundStyle = () => {
    if (design.background.type === 'gradient' && design.background.gradient) {
      const { from, to, angle = 135 } = design.background.gradient;
      return { background: `linear-gradient(${angle}deg, ${from}, ${to})` };
    }
    return { backgroundColor: design.background.color || '#0f172a' };
  };

  // Get text styling effects (Canva-style)
  const getTextEffectStyle = (el: TextElement) => {
    const color = el.color || '#ffffff';
    switch (el.effect) {
      case 'shadow':
        return {
          textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
        };
      case 'lift':
        return {
          textShadow: '0 10px 25px rgba(0,0,0,0.6)',
        };
      case 'hollow':
        return {
          WebkitTextStroke: `2px ${color}`,
          color: 'transparent',
        };
      case 'splice':
        return {
          WebkitTextStroke: `2px ${color}`,
          textShadow: '4px 4px 0px rgba(0,0,0,0.8)',
        };
      case 'echo':
        return {
          textShadow: `3px 3px 0 ${color}40, 6px 6px 0 ${color}20`,
        };
      case 'glitch':
        return {
          textShadow: '-3px 0 #06b6d4, 3px 0 #ec4899',
        };
      case 'neon':
        return {
          textShadow: `0 0 5px ${color}, 0 0 15px ${color}, 0 0 30px ${color}`,
        };
      default:
        return el.shadow
          ? {
              textShadow: `${el.shadow.offsetX}px ${el.shadow.offsetY}px ${el.shadow.blur}px ${el.shadow.color}`,
            }
          : {};
    }
  };

  // Motion animation class
  const getAnimationClass = (animation?: string) => {
    if (!isPlayingMotion || !animation || animation === 'none') return '';
    switch (animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'pop':
        return 'animate-bounce';
      case 'pulse':
        return 'animate-pulse';
      case 'slide':
        return 'transition-transform duration-700 ease-out';
      default:
        return '';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="flex-1 bg-slate-950 relative overflow-auto flex items-center justify-center p-6 md:p-12 select-none"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Floating Canvas Action Pills */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {/* Toggle Grid */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Alignment Grid"
          className={`p-1.5 rounded-lg border transition ${
            showGrid
              ? 'bg-indigo-600 text-white border-indigo-500'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Comment Pin Mode */}
        <button
          onClick={onToggleCommentMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition border ${
            isCommentMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold scale-105'
              : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isCommentMode ? 'Click Canvas to Pin' : 'Add Comment'}</span>
        </button>
      </div>

      {/* Main Artboard */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: design.width,
          height: design.height,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          ...getBackgroundStyle(),
        }}
        className="relative shadow-2xl transition-transform duration-75 ease-out rounded-sm overflow-hidden shrink-0 border border-slate-800"
      >
        {/* Alignment Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-40 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        )}

        {/* Alignment Guide Lines */}
        {guideX !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 z-50 pointer-events-none shadow"
            style={{ left: guideX }}
          />
        )}
        {guideY !== null && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-indigo-500 z-50 pointer-events-none shadow"
            style={{ top: guideY }}
          />
        )}

        {/* Elements Rendering */}
        {[...design.elements]
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((el) => {
            const isSelected = selectedId === el.id;

            return (
              <div
                key={el.id}
                onMouseDown={(e) => {
                  if (isCommentMode) return;
                  e.stopPropagation();
                  onSelectElement(el.id);
                  if (!el.locked) {
                    setIsDragging(true);
                    setDragStart({ x: e.clientX, y: e.clientY });
                    setElementStart({ x: el.x, y: el.y });
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (el.type === 'text') {
                    setEditingTextId(el.id);
                  }
                }}
                style={{
                  position: 'absolute',
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                  opacity: el.opacity ?? 1,
                  zIndex: isSelected ? 99 : el.zIndex || 1,
                  cursor: el.locked ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
                }}
                className={`group select-none ${
                  isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent' : ''
                } ${getAnimationClass(el.animation)}`}
              >
                {/* 1. TEXT ELEMENT */}
                {el.type === 'text' && (
                  <>
                    {editingTextId === el.id ? (
                      <textarea
                        value={(el as TextElement).text}
                        onChange={(e) =>
                          onUpdateElement(el.id, { text: e.target.value }, false)
                        }
                        onBlur={() => setEditingTextId(null)}
                        autoFocus
                        style={{
                          fontSize: (el as TextElement).fontSize || 32,
                          fontFamily: (el as TextElement).fontFamily || 'Inter',
                          fontWeight: (el as TextElement).fontWeight || 600,
                          color: (el as TextElement).color || '#ffffff',
                          textAlign: (el as TextElement).textAlign || 'center',
                          letterSpacing: (el as TextElement).letterSpacing || 0,
                          lineHeight: (el as TextElement).lineHeight || 1.2,
                        }}
                        className="w-full h-full bg-slate-900/80 outline-none border border-indigo-400 p-0 resize-none overflow-hidden"
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: (el as TextElement).fontSize || 32,
                          fontFamily: (el as TextElement).fontFamily || 'Inter',
                          fontWeight: (el as TextElement).fontWeight || 600,
                          fontStyle: (el as TextElement).fontStyle || 'normal',
                          textDecoration: (el as TextElement).textDecoration || 'none',
                          color: (el as TextElement).color || '#ffffff',
                          textAlign: (el as TextElement).textAlign || 'center',
                          letterSpacing: (el as TextElement).letterSpacing || 0,
                          lineHeight: (el as TextElement).lineHeight || 1.2,
                          transform: (el as TextElement).curveAngle
                            ? `rotate(${(el as TextElement).curveAngle}deg)`
                            : undefined,
                          ...getTextEffectStyle(el as TextElement),
                        }}
                        className="w-full h-full flex flex-col justify-center whitespace-pre-wrap break-words"
                      >
                        {(el as TextElement).text}
                      </div>
                    )}
                  </>
                )}

                {/* 2. SHAPE ELEMENT */}
                {el.type === 'shape' && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: (el as ShapeElement).fill,
                      borderRadius:
                        (el as ShapeElement).shapeType === 'pill'
                          ? 9999
                          : (el as ShapeElement).shapeType === 'circle'
                          ? '50%'
                          : (el as ShapeElement).borderRadius || 0,
                      border:
                        (el as ShapeElement).stroke && (el as ShapeElement).strokeWidth
                          ? `${(el as ShapeElement).strokeWidth}px solid ${
                              (el as ShapeElement).stroke
                            }`
                          : undefined,
                      boxShadow: (el as ShapeElement).shadow
                        ? `${(el as ShapeElement).shadow?.offsetX}px ${
                            (el as ShapeElement).shadow?.offsetY
                          }px ${(el as ShapeElement).shadow?.blur}px ${
                            (el as ShapeElement).shadow?.color
                          }`
                        : undefined,
                    }}
                  />
                )}

                {/* 3. IMAGE ELEMENT */}
                {el.type === 'image' && (
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src={(el as ImageElement).src}
                      alt={(el as ImageElement).alt || 'Design image'}
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: (el as ImageElement).objectFit || 'cover',
                        borderRadius: (el as ImageElement).borderRadius || 0,
                        transform: `${(el as ImageElement).flipX ? 'scaleX(-1)' : ''} ${
                          (el as ImageElement).flipY ? 'scaleY(-1)' : ''
                        }`,
                        filter: `${
                          (el as ImageElement).filters
                            ? `brightness(${(el as ImageElement).filters?.brightness ?? 100}%) contrast(${
                                (el as ImageElement).filters?.contrast ?? 100
                              }%) saturate(${(el as ImageElement).filters?.saturate ?? 100}%) blur(${
                                (el as ImageElement).filters?.blur ?? 0
                              }px) grayscale(${(el as ImageElement).filters?.grayscale ?? 0}%) sepia(${
                                (el as ImageElement).filters?.sepia ?? 0
                              }%)`
                            : ''
                        } ${(el as ImageElement).isCutout ? 'drop-shadow(0 15px 25px rgba(0,0,0,0.7))' : ''}`,
                        boxShadow: (el as ImageElement).shadow
                          ? `${(el as ImageElement).shadow?.offsetX}px ${
                              (el as ImageElement).shadow?.offsetY
                            }px ${(el as ImageElement).shadow?.blur}px ${
                              (el as ImageElement).shadow?.color
                            }`
                          : undefined,
                      }}
                      className="pointer-events-none select-none w-full h-full"
                    />
                    {(el as ImageElement).isCutout && (
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-md">
                        CUTOUT
                      </span>
                    )}
                  </div>
                )}

                {/* 4. DRAWING ELEMENT */}
                {el.type === 'drawing' && (
                  <svg
                    viewBox={`0 0 ${el.width} ${el.height}`}
                    className="w-full h-full pointer-events-none"
                  >
                    <path
                      d={(el as DrawingElement).pathData}
                      fill="none"
                      stroke={(el as DrawingElement).stroke || '#f43f5e'}
                      strokeWidth={(el as DrawingElement).strokeWidth || 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {/* RESIZE HANDLES (8 Points) */}
                {isSelected && !el.locked && (
                  <>
                    {['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'].map((handle) => {
                      let cursor = 'nwse-resize';
                      let posClass = '';
                      if (handle === 'nw') posClass = '-top-1.5 -left-1.5 cursor-nwse-resize';
                      if (handle === 'ne') posClass = '-top-1.5 -right-1.5 cursor-nesw-resize';
                      if (handle === 'se') posClass = '-bottom-1.5 -right-1.5 cursor-nwse-resize';
                      if (handle === 'sw') posClass = '-bottom-1.5 -left-1.5 cursor-nesw-resize';
                      if (handle === 'n') posClass = '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize';
                      if (handle === 's') posClass = '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize';
                      if (handle === 'e') posClass = 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize';
                      if (handle === 'w') posClass = 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize';

                      return (
                        <div
                          key={handle}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizingHandle(handle);
                            setResizeStart({
                              mouseX: e.clientX,
                              mouseY: e.clientY,
                              elX: el.x,
                              elY: el.y,
                              elW: el.width,
                              elH: el.height,
                            });
                          }}
                          className={`absolute w-3 h-3 bg-white border-2 border-indigo-600 rounded-sm shadow-sm ${posClass}`}
                        />
                      );
                    })}
                  </>
                )}
              </div>
            );
          })}

        {/* REAL-TIME COLLABORATORS' LIVE CURSORS */}
        {collaborators.map((collab) => {
          if (!collab.cursor) return null;
          return (
            <div
              key={collab.id}
              style={{
                position: 'absolute',
                left: collab.cursor.x,
                top: collab.cursor.y,
                pointerEvents: 'none',
                zIndex: 100,
                transition: 'left 80ms ease-out, top 80ms ease-out',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
              >
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                  fill={collab.color}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              </svg>
              <div
                className="px-2 py-0.5 text-[10px] font-bold text-white rounded-full whitespace-nowrap shadow-md ml-3 -mt-1.5"
                style={{ backgroundColor: collab.color }}
              >
                {collab.name}
              </div>
            </div>
          );
        })}

        {/* CANVAS COMMENTS PINS */}
        {comments.map((c) => (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y,
              zIndex: 80,
            }}
          >
            <button
              onClick={() => setActiveCommentId(activeCommentId === c.id ? null : c.id)}
              className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition transform hover:scale-110 cursor-pointer ${
                c.resolved ? 'bg-slate-700 opacity-60' : 'bg-amber-500'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-950 font-bold" />
            </button>

            {activeCommentId === c.id && (
              <div className="absolute left-8 top-0 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: c.author.color }}
                    >
                      {c.author.name.substring(0, 1)}
                    </div>
                    <span className="font-bold text-white">{c.author.name}</span>
                  </div>
                  <button
                    onClick={() => onResolveComment(c.id, !c.resolved)}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>{c.resolved ? 'Reopen' : 'Resolve'}</span>
                  </button>
                </div>
                <div className="text-slate-200 mb-2 whitespace-pre-wrap">{c.text}</div>
                <div className="text-[10px] text-slate-500">
                  {new Date(c.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Pending comment card */}
        {pendingCommentCoords && (
          <div
            style={{
              position: 'absolute',
              left: pendingCommentCoords.x,
              top: pendingCommentCoords.y,
              zIndex: 90,
            }}
            className="w-64 bg-slate-900 border border-amber-500 rounded-xl shadow-2xl p-3 text-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white">Leave Feedback</span>
              <button
                onClick={() => setPendingCommentCoords(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add your note or review for the team..."
              autoFocus
              className="w-full bg-slate-800 text-xs text-white p-2 rounded-lg border border-slate-700 outline-none resize-none mb-2"
            />
            <button
              onClick={submitComment}
              disabled={!commentInput.trim()}
              className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Post Comment Pin</span>
            </button>
          </div>
        )}
      </div>

      {/* Canva Bottom Navigation & Control Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-full px-4 py-2 shadow-2xl flex items-center gap-4 text-xs select-none">
        {/* Page navigation */}
        <div className="flex items-center gap-1.5 border-r border-slate-700/80 pr-3">
          {totalPages > 1 && (
            <button
              onClick={() => onSelectPage && onSelectPage(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex <= 0}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded transition cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="font-bold text-slate-200 font-mono text-[11px] whitespace-nowrap">
            Page {currentPageIndex + 1} of {totalPages}
          </span>

          {totalPages > 1 && (
            <button
              onClick={() => onSelectPage && onSelectPage(Math.min(totalPages - 1, currentPageIndex + 1))}
              disabled={currentPageIndex >= totalPages - 1}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded transition cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onAddPage && (
            <button
              onClick={onAddPage}
              className="flex items-center gap-1 ml-1 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-300 hover:text-white rounded-md border border-indigo-500/40 text-[11px] font-bold transition cursor-pointer"
              title="Add New Page"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Add page</span>
            </button>
          )}

          {onDuplicatePage && (
            <button
              onClick={onDuplicatePage}
              className="p-1.5 text-slate-400 hover:text-white rounded transition cursor-pointer"
              title="Duplicate Current Page"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {onDeletePage && totalPages > 1 && (
            <button
              onClick={onDeletePage}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
              title="Delete Current Page"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Zoom Slider and Percentage */}
        {onZoomChange && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={20}
              max={200}
              value={Math.round(zoom * 100)}
              onChange={(e) => onZoomChange(parseInt(e.target.value) / 100)}
              className="w-20 accent-indigo-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
            />
            <button
              onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onZoomChange(0.65)}
              className="text-[11px] font-mono text-indigo-400 font-bold hover:text-indigo-300 ml-1 cursor-pointer"
              title="Fit to Screen (65%)"
            >
              {Math.round(zoom * 100)}%
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
