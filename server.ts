import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini client (Server-Side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Real-time Collaboration Engine
interface CollabUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  cursor?: { x: number; y: number };
  activeElementId?: string | null;
  ws: WebSocket;
}

interface RoomState {
  roomId: string;
  canvasData?: any;
  users: Map<string, CollabUser>;
  comments: any[];
}

const rooms = new Map<string, RoomState>();

function getOrCreateRoom(roomId: string): RoomState {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomId,
      users: new Map(),
      comments: [],
    });
  }
  return rooms.get(roomId)!;
}

function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  const payload = JSON.stringify(message);
  for (const [userId, user] of room.users.entries()) {
    if (userId !== excludeUserId && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(payload);
    }
  }
}

// WebSocket Server attached to same HTTP server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());
      const { type, roomId, payload } = msg;

      if (type === 'join_room') {
        currentRoomId = roomId || 'default-project';
        currentUserId = payload.user.id;
        const room = getOrCreateRoom(currentRoomId!);

        room.users.set(currentUserId!, {
          id: payload.user.id,
          name: payload.user.name,
          color: payload.user.color,
          avatar: payload.user.avatar,
          ws,
        });

        // Send room initialization data to joiner
        const userList = Array.from(room.users.values()).map(u => ({
          id: u.id,
          name: u.name,
          color: u.color,
          avatar: u.avatar,
          cursor: u.cursor,
          activeElementId: u.activeElementId,
        }));

        ws.send(
          JSON.stringify({
            type: 'room_init',
            payload: {
              users: userList,
              canvasData: room.canvasData,
              comments: room.comments,
            },
          })
        );

        // Broadcast user joined to other room members
        broadcastToRoom(
          currentRoomId!,
          {
            type: 'user_joined',
            payload: {
              user: {
                id: payload.user.id,
                name: payload.user.name,
                color: payload.user.color,
                avatar: payload.user.avatar,
              },
            },
          },
          currentUserId!
        );
      } else if (type === 'cursor_move' && currentRoomId && currentUserId) {
        const room = rooms.get(currentRoomId);
        if (room && room.users.has(currentUserId)) {
          const user = room.users.get(currentUserId)!;
          user.cursor = payload.cursor;
          user.activeElementId = payload.activeElementId;
          broadcastToRoom(
            currentRoomId,
            {
              type: 'cursor_update',
              payload: {
                userId: currentUserId,
                cursor: payload.cursor,
                activeElementId: payload.activeElementId,
              },
            },
            currentUserId
          );
        }
      } else if (type === 'canvas_delta' && currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          if (payload.fullState) {
            room.canvasData = payload.fullState;
          }
          broadcastToRoom(
            currentRoomId,
            {
              type: 'canvas_delta',
              payload: {
                action: payload.action,
                elements: payload.elements,
                patch: payload.patch,
                userId: currentUserId,
                timestamp: Date.now(),
              },
            },
            currentUserId || undefined
          );
        }
      } else if (type === 'comment_add' && currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          room.comments.push(payload.comment);
          broadcastToRoom(currentRoomId, {
            type: 'comment_added',
            payload: { comment: payload.comment },
          });
        }
      } else if (type === 'comment_resolve' && currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          room.comments = room.comments.map(c =>
            c.id === payload.commentId ? { ...c, resolved: payload.resolved } : c
          );
          broadcastToRoom(currentRoomId, {
            type: 'comment_resolved',
            payload: { commentId: payload.commentId, resolved: payload.resolved },
          });
        }
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoomId && currentUserId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.users.delete(currentUserId);
        broadcastToRoom(currentRoomId, {
          type: 'user_left',
          payload: { userId: currentUserId },
        });
        if (room.users.size === 0) {
          // retain room state for 1 hour or clean up
        }
      }
    }
  });
});

// --- AI Endpoints using @google/genai ---

// 1. Magic Design Generator
app.post('/api/ai/magic-design', async (req: Request, res: Response) => {
  try {
    const { prompt, preset = 'instagram-square', brandTone = 'modern' } = req.body;

    const systemInstruction = `You are an elite art director and senior graphic designer for world-class social media brands (like Canva, Nike, Apple, Spotify).
Your task is to generate complete, high-converting social media design specs based on user prompts.
Always return strictly valid JSON matching the schema provided.
Include rich styling, striking typography pairings, vibrant or aesthetic color palettes, strategic badges, background gradients, and layout hierarchy.
Supported presets are:
- 'instagram-square' (1080x1080)
- 'instagram-story' (1080x1920)
- 'youtube-thumbnail' (1280x720)
- 'twitter-post' (1200x675)
- 'linkedin-post' (1200x627)
- 'pinterest-pin' (1000x1500)

Return JSON with:
{
  "title": string,
  "background": {
    "type": "gradient" | "solid",
    "color": string,
    "gradient": { "from": string, "to": string, "angle": number }
  },
  "colorPalette": string[],
  "elements": [
    // Array of element objects.
    // Text element: { id, type: 'text', text, x, y, width, fontSize, fontWeight, fontFamily, color, textAlign, letterSpacing, shadow?, stroke? }
    // Shape element: { id, type: 'shape', shapeType: 'rect'|'circle'|'badge'|'pill'|'star'|'triangle', x, y, width, height, fill, stroke?, strokeWidth?, borderRadius?, opacity? }
  ]
}`;

    const userPrompt = `Create a striking ${preset} design for: "${prompt}". Brand tone: ${brandTone}.
Ensure there is a prominent headline, complementary subhead, a compelling CTA button/pill, decorative geometric elements/badges, and balanced negative space. Coordinates should fit within the preset dimensions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating magic design:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate design' });
  }
});

// 2. AI Copy & Headline Generator
app.post('/api/ai/suggest-copy', async (req: Request, res: Response) => {
  try {
    const { topic, audience, tone = 'engaging', platform = 'Instagram' } = req.body;

    const prompt = `Generate 5 catchy, high-converting copy variations for a ${platform} graphic about: "${topic}".
Target audience: ${audience || 'general social media audience'}.
Tone: ${tone}.
For each variation, provide:
1. Headline (short, punchy, high-impact)
2. Subtitle / Value proposition (1 sentence)
3. Call to Action (CTA - 2 to 4 words, e.g. "Claim 50% Off", "Register Free", "Listen Now")
4. 3 relevant hashtags`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an award-winning social media copywriter. Output strictly valid JSON format with an array "suggestions".',
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{"suggestions":[]}';
    res.json({ success: true, data: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error suggesting copy:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate copy' });
  }
});

// 3. AI Design Critique & Auto-Optimize
app.post('/api/ai/critique-design', async (req: Request, res: Response) => {
  try {
    const { elements, background, width, height, title } = req.body;

    const summary = {
      title,
      canvasDimensions: `${width}x${height}`,
      background,
      elementCount: elements?.length || 0,
      elementsList: elements?.map((el: any) => ({
        type: el.type,
        text: el.text,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        color: el.color,
        fill: el.fill,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
      })),
    };

    const prompt = `Review this social media graphic design specification:
${JSON.stringify(summary, null, 2)}

Provide an honest, professional design critique and actionable suggestions to elevate it to Canva Pro / editorial quality:
1. Overall Score out of 100
2. Visual Hierarchy critique
3. Contrast & Legibility assessment
4. Color Harmony feedback
5. 3 specific, quick improvement tips (e.g., increase headline contrast, add 24px padding, align CTA).
Output valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a veteran Creative Director and UI/UX design judge. Return strictly valid JSON.',
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    res.json({ success: true, data: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error critiquing design:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to critique design' });
  }
});

// 4. AI Color Palette Harmonizer
app.post('/api/ai/color-palettes', async (req: Request, res: Response) => {
  try {
    const { mood = 'vibrant', niche = 'tech' } = req.body;

    const prompt = `Generate 4 curated, beautiful 5-color palettes suitable for social media design graphics.
Mood: "${mood}". Niche: "${niche}".
Provide a name, vibe description, and hex codes for background, primary, secondary, accent, and text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Return valid JSON with an array "palettes" containing objects with name, description, colors: [hex1, hex2, hex3, hex4, hex5].',
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{"palettes":[]}';
    res.json({ success: true, data: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error generating color palettes:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate color palettes' });
  }
});

// Server configuration & static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(port, () => {
    console.log(`SparkCraft Studio server listening on http://localhost:${port}`);
  });
}

startServer();
