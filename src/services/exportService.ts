import {
  CanvasDesign,
  CanvasElement,
  TextElement,
  ShapeElement,
  ImageElement,
  DrawingElement,
} from '../types/design';
import confetti from 'canvas-confetti';

/**
 * Draws the current design onto an HTML5 Canvas at any specified scale multiplier.
 */
export async function renderDesignToCanvas(
  design: CanvasDesign,
  scale: number = 1
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(design.width * scale);
  canvas.height = Math.round(design.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Scale context
  ctx.scale(scale, scale);

  // 1. Draw Background
  if (design.background.type === 'gradient' && design.background.gradient) {
    const { from, to, angle = 0 } = design.background.gradient;
    const rad = ((angle - 90) * Math.PI) / 180;
    const x1 = design.width / 2 - (Math.cos(rad) * design.width) / 2;
    const y1 = design.height / 2 - (Math.sin(rad) * design.height) / 2;
    const x2 = design.width / 2 + (Math.cos(rad) * design.width) / 2;
    const y2 = design.height / 2 + (Math.sin(rad) * design.height) / 2;

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, from);
    grad.addColorStop(1, to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, design.width, design.height);
  } else if (design.background.type === 'solid') {
    ctx.fillStyle = design.background.color || '#0f172a';
    ctx.fillRect(0, 0, design.width, design.height);
  } else {
    ctx.fillStyle = design.background.color || '#ffffff';
    ctx.fillRect(0, 0, design.width, design.height);
  }

  // 2. Sort elements by zIndex
  const sorted = [...design.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const el of sorted) {
    ctx.save();

    // Element opacity
    if (el.opacity !== undefined) {
      ctx.globalAlpha = el.opacity;
    }

    // Rotation transform
    if (el.rotation) {
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    if (el.type === 'shape') {
      drawShape(ctx, el as ShapeElement);
    } else if (el.type === 'image') {
      await drawImage(ctx, el as ImageElement);
    } else if (el.type === 'text') {
      drawText(ctx, el as TextElement);
    } else if (el.type === 'drawing') {
      drawDrawing(ctx, el as DrawingElement);
    }

    ctx.restore();
  }

  return canvas;
}

function drawDrawing(ctx: CanvasRenderingContext2D, el: DrawingElement) {
  ctx.save();
  ctx.strokeStyle = el.stroke || '#f43f5e';
  ctx.lineWidth = el.strokeWidth || 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (typeof Path2D !== 'undefined' && el.pathData) {
    ctx.translate(el.x, el.y);
    const p = new Path2D(el.pathData);
    ctx.stroke(p);
  }
  ctx.restore();
}

function drawShape(ctx: CanvasRenderingContext2D, el: ShapeElement) {
  ctx.save();

  if (el.shadow) {
    ctx.shadowColor = el.shadow.color;
    ctx.shadowBlur = el.shadow.blur;
    ctx.shadowOffsetX = el.shadow.offsetX;
    ctx.shadowOffsetY = el.shadow.offsetY;
  }

  ctx.fillStyle = el.fill || '#3b82f6';
  if (el.stroke && el.strokeWidth) {
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = el.strokeWidth;
  }

  const { x, y, width, height, shapeType, borderRadius = 0 } = el;

  if (shapeType === 'rect') {
    if (borderRadius > 0) {
      roundedRect(ctx, x, y, width, height, borderRadius);
      ctx.fill();
      if (el.stroke && el.strokeWidth) ctx.stroke();
    } else {
      ctx.fillRect(x, y, width, height);
      if (el.stroke && el.strokeWidth) ctx.strokeRect(x, y, width, height);
    }
  } else if (shapeType === 'circle') {
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    ctx.fill();
    if (el.stroke && el.strokeWidth) ctx.stroke();
  } else if (shapeType === 'pill') {
    const r = height / 2;
    roundedRect(ctx, x, y, width, height, r);
    ctx.fill();
    if (el.stroke && el.strokeWidth) ctx.stroke();
  } else if (shapeType === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
    if (el.stroke && el.strokeWidth) ctx.stroke();
  } else if (shapeType === 'star') {
    drawStar(ctx, x + width / 2, y + height / 2, 5, width / 2, width / 4);
    ctx.fill();
    if (el.stroke && el.strokeWidth) ctx.stroke();
  } else {
    ctx.fillRect(x, y, width, height);
  }

  ctx.restore();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

async function drawImage(ctx: CanvasRenderingContext2D, el: ImageElement) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.save();
      if (el.shadow) {
        ctx.shadowColor = el.shadow.color;
        ctx.shadowBlur = el.shadow.blur;
        ctx.shadowOffsetX = el.shadow.offsetX;
        ctx.shadowOffsetY = el.shadow.offsetY;
      }

      if (el.borderRadius) {
        roundedRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius);
        ctx.clip();
      }

      ctx.drawImage(img, el.x, el.y, el.width, el.height);
      ctx.restore();
      resolve();
    };
    img.onerror = () => {
      // fallback placeholder
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(el.x, el.y, el.width, el.height);
      resolve();
    };
    img.src = el.src;
  });
}

function drawText(ctx: CanvasRenderingContext2D, el: TextElement) {
  ctx.save();

  if (el.shadow) {
    ctx.shadowColor = el.shadow.color;
    ctx.shadowBlur = el.shadow.blur;
    ctx.shadowOffsetX = el.shadow.offsetX;
    ctx.shadowOffsetY = el.shadow.offsetY;
  }

  const fontStyle = el.fontStyle || 'normal';
  const fontWeight = el.fontWeight || 500;
  const fontSize = el.fontSize || 32;
  const fontFamily = el.fontFamily || 'Inter';

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.fillStyle = el.color || '#ffffff';
  ctx.textBaseline = 'top';

  const lines = el.text.split('\n');
  const lineHeight = fontSize * (el.lineHeight || 1.2);

  lines.forEach((line, index) => {
    let textX = el.x;
    if (el.textAlign === 'center') {
      ctx.textAlign = 'center';
      textX = el.x + el.width / 2;
    } else if (el.textAlign === 'right') {
      ctx.textAlign = 'right';
      textX = el.x + el.width;
    } else {
      ctx.textAlign = 'left';
    }

    ctx.fillText(line, textX, el.y + index * lineHeight);
  });

  ctx.restore();
}

/**
 * Trigger export download
 */
export async function exportDesign(
  design: CanvasDesign,
  format: 'png' | 'jpeg' | 'svg' | 'pdf',
  scale: number = 2
) {
  try {
    if (format === 'svg') {
      downloadSvg(design);
      triggerConfetti();
      return;
    }

    const canvas = await renderDesignToCanvas(design, scale);
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpeg' ? 0.92 : 1.0;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const sanitized = design.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        a.download = `${sanitized || 'design'}-${design.width}x${design.height}.${format === 'pdf' ? 'png' : format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        triggerConfetti();
      },
      mime,
      quality
    );
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

/**
 * Copy to clipboard as Image
 */
export async function copyToClipboard(design: CanvasDesign) {
  try {
    const canvas = await renderDesignToCanvas(design, 2);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        triggerConfetti();
      }
    }, 'image/png');
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    throw err;
  }
}

function triggerConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#6366f1', '#ec4899', '#38bdf8', '#10b981', '#facc15'],
  });
}

function downloadSvg(design: CanvasDesign) {
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${design.width} ${design.height}" width="${design.width}" height="${design.height}">
  <defs>
    ${
      design.background.type === 'gradient' && design.background.gradient
        ? `<linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stop-color="${design.background.gradient.from}" />
             <stop offset="100%" stop-color="${design.background.gradient.to}" />
           </linearGradient>`
        : ''
    }
  </defs>
  <rect width="100%" height="100%" fill="${
    design.background.type === 'gradient' ? 'url(#bgGrad)' : design.background.color || '#0f172a'
  }" />
  ${design.elements
    .map((el) => {
      if (el.type === 'shape') {
        const shape = el as ShapeElement;
        return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" rx="${shape.borderRadius || 0}" fill="${shape.fill}" opacity="${shape.opacity ?? 1}" />`;
      } else if (el.type === 'text') {
        const textEl = el as TextElement;
        return `<text x="${textEl.x}" y="${textEl.y + (textEl.fontSize || 32)}" font-family="${textEl.fontFamily}" font-size="${textEl.fontSize}" font-weight="${textEl.fontWeight}" fill="${textEl.color}" opacity="${textEl.opacity ?? 1}">${textEl.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`;
      }
      return '';
    })
    .join('\n  ')}
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${design.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
