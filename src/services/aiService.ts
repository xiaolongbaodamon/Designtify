import { CanvasDesign } from '../types/design';

export interface AISuggestion {
  headline: string;
  subtitle: string;
  cta: string;
  hashtags: string[];
}

export interface AICritiqueResult {
  score?: number;
  overallScore?: number;
  hierarchy?: string;
  visualHierarchy?: string;
  contrast?: string;
  contrastLegibility?: string;
  colorHarmony?: string;
  tips?: string[];
  recommendations?: string[];
}

export async function requestMagicDesign(
  prompt: string,
  preset: string = 'instagram-square',
  brandTone: string = 'modern and energetic'
) {
  const res = await fetch('/api/ai/magic-design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, preset, brandTone }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate Magic Design');
  }

  const json = await res.json();
  return json.data;
}

export async function requestCopySuggestions(
  topic: string,
  audience?: string,
  tone: string = 'engaging',
  platform: string = 'Instagram'
): Promise<AISuggestion[]> {
  const res = await fetch('/api/ai/suggest-copy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, audience, tone, platform }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate copy suggestions');
  }

  const json = await res.json();
  return json.data?.suggestions || [];
}

export async function requestDesignCritique(design: CanvasDesign): Promise<AICritiqueResult> {
  const res = await fetch('/api/ai/critique-design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: design.title,
      width: design.width,
      height: design.height,
      background: design.background,
      elements: design.elements,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to review design');
  }

  const json = await res.json();
  return json.data;
}

export async function requestColorPalettes(mood: string, niche: string) {
  const res = await fetch('/api/ai/color-palettes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood, niche }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate palettes');
  }

  const json = await res.json();
  return json.data?.palettes || [];
}
