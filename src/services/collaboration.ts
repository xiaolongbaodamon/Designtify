import { CollabUser, CanvasComment } from '../types/design';

export const COLLAB_COLORS = [
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
];

const ANIMAL_NAMES = ['Fox', 'Falcon', 'Otter', 'Panda', 'Lynx', 'Dolphin', 'Tiger', 'Eagle', 'Koala'];

export function getRandomUser(): CollabUser {
  const stored = localStorage.getItem('sparkcraft_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
  }

  const randomColor = COLLAB_COLORS[Math.floor(Math.random() * COLLAB_COLORS.length)];
  const animal = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  const id = 'user-' + Math.random().toString(36).substring(2, 9);
  const user: CollabUser = {
    id,
    name: `Creative ${animal}`,
    color: randomColor,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${id}&backgroundColor=${randomColor.replace('#', '')}`,
  };

  localStorage.setItem('sparkcraft_user', JSON.stringify(user));
  return user;
}

export type CollabEventCallback = (event: {
  type: string;
  payload: any;
}) => void;

class CollaborationService {
  private ws: WebSocket | null = null;
  private channel: BroadcastChannel | null = null;
  private currentUser: CollabUser;
  private roomId: string = 'project-default';
  private subscribers: Set<CollabEventCallback> = new Set();
  private isConnected: boolean = false;
  private reconnectTimer: any = null;

  constructor() {
    this.currentUser = getRandomUser();
    try {
      this.channel = new BroadcastChannel('sparkcraft_collab_channel');
      this.channel.onmessage = (event) => {
        this.emitToSubscribers(event.data.type, event.data.payload);
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment');
    }
  }

  public getCurrentUser(): CollabUser {
    return this.currentUser;
  }

  public updateCurrentUser(updates: Partial<CollabUser>) {
    this.currentUser = { ...this.currentUser, ...updates };
    localStorage.setItem('sparkcraft_user', JSON.stringify(this.currentUser));
    this.joinRoom(this.roomId);
  }

  public subscribe(callback: CollabEventCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private emitToSubscribers(type: string, payload: any) {
    this.subscribers.forEach((cb) => {
      try {
        cb({ type, payload });
      } catch (err) {
        console.error('Subscriber notification error:', err);
      }
    });
  }

  public connect(roomId: string = 'project-default') {
    this.roomId = roomId;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.joinRoom(this.roomId);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.emitToSubscribers(msg.type, msg.payload);
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        // Schedule auto-reconnect
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect(this.roomId);
          }, 3000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket error, falling back to local multi-tab sync:', err);
      };
    } catch (e) {
      console.warn('Could not establish WebSocket connection:', e);
    }
  }

  public joinRoom(roomId: string) {
    this.roomId = roomId;
    const payload = {
      type: 'join_room',
      roomId,
      payload: { user: this.currentUser },
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
    // Also notify local tabs
    this.channel?.postMessage({
      type: 'user_joined',
      payload: { user: this.currentUser },
    });
  }

  public sendCursor(x: number, y: number, activeElementId?: string | null) {
    const payload = {
      type: 'cursor_move',
      roomId: this.roomId,
      payload: {
        cursor: { x, y },
        activeElementId: activeElementId || null,
      },
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }

    this.channel?.postMessage({
      type: 'cursor_update',
      payload: {
        userId: this.currentUser.id,
        cursor: { x, y },
        activeElementId,
      },
    });
  }

  public sendCanvasDelta(action: string, patch: any, fullState?: any) {
    const payload = {
      type: 'canvas_delta',
      roomId: this.roomId,
      payload: {
        action,
        patch,
        fullState,
      },
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }

    this.channel?.postMessage({
      type: 'canvas_delta',
      payload: {
        action,
        patch,
        userId: this.currentUser.id,
        timestamp: Date.now(),
      },
    });
  }

  public addComment(comment: CanvasComment) {
    const payload = {
      type: 'comment_add',
      roomId: this.roomId,
      payload: { comment },
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }

    this.channel?.postMessage({
      type: 'comment_added',
      payload: { comment },
    });
  }

  public resolveComment(commentId: string, resolved: boolean = true) {
    const payload = {
      type: 'comment_resolve',
      roomId: this.roomId,
      payload: { commentId, resolved },
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }

    this.channel?.postMessage({
      type: 'comment_resolved',
      payload: { commentId, resolved },
    });
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const collabService = new CollaborationService();
