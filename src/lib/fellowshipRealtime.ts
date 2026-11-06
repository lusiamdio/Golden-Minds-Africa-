/**
 * Real-Time Fellowship Sync & Content Ecosystem Hub
 * Ensures fellow progress and fellow-published content sync across the platform in real time.
 */

export interface RealtimePost {
  id: string;
  type: 'article' | 'podcast' | 'video' | 'debate' | 'community_post';
  author: string;
  authorEmail?: string;
  authorAvatar?: string;
  authorCountry?: string;
  title: string;
  summary: string;
  likes: number;
  comments: number;
  tags: string[];
  time: string;
  mediaUrl?: string | null;
  likedBy?: string[];
  createdAt: number;
}

export interface FellowProgressEvent {
  fellowName: string;
  fellowEmail?: string;
  eventType: 'assignment_passed' | 'capstone_passed' | 'module_completed' | 'certification_unlocked';
  score?: number;
  title: string;
  timestamp: number;
}

type RealtimeListener = (event: { type: string; payload: any }) => void;

const CHANNEL_NAME = 'gma_fellowship_realtime_channel';
const STORAGE_POSTS_KEY = 'gma_fellow_ecosystem_posts';
const STORAGE_PROGRESS_KEY = 'gma_fellows_progress';

const DEFAULT_POSTS: RealtimePost[] = [
  {
    id: 'post-init-1',
    type: 'article',
    author: 'Amina Mensah',
    authorCountry: 'Ghana',
    title: 'Designing Resilient Payment Rail Protocols for AfCFTA Cross-Border Trade',
    summary: 'A comprehensive institutional analysis into reducing dollar dependency across regional economic communities using local currency settlement networks.',
    likes: 42,
    comments: 11,
    tags: ['AfCFTA', 'Trade Policy', 'Financial Sovereignty'],
    time: '2 hours ago',
    createdAt: Date.now() - 7200000
  },
  {
    id: 'post-init-2',
    type: 'debate',
    author: 'Ousmane Diallo',
    authorCountry: 'Senegal',
    title: 'Sovereign AI Compute Infrastructure: State-Led vs Private Cloud Consortia',
    summary: 'Debating whether African nations should construct state-managed sovereign GPU datacenters or leverage private cloud public-private partnerships.',
    likes: 38,
    comments: 19,
    tags: ['AI Governance', 'Technology', 'Debate'],
    time: '4 hours ago',
    createdAt: Date.now() - 14400000
  },
  {
    id: 'post-init-3',
    type: 'podcast',
    author: 'Naledi Mandela',
    authorCountry: 'South Africa',
    title: 'Diplomatic Dialogue: Critical Mineral Value Addition in SADC',
    summary: 'Executive conversation examining regional export bans on raw lithium and cobalt to force domestic processing and battery manufacturing hubs.',
    likes: 56,
    comments: 8,
    tags: ['Energy Transition', 'Geopolitics', 'SADC'],
    time: 'Yesterday',
    createdAt: Date.now() - 86400000
  }
];

class FellowshipRealtimeHub {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<RealtimeListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.handleIncoming(event.data);
        };
      } catch (err) {
        console.warn('[Realtime] BroadcastChannel unavailable, using storage events');
      }

      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_POSTS_KEY && e.newValue) {
          try {
            const updated = JSON.parse(e.newValue);
            this.notify({ type: 'POSTS_UPDATED', payload: updated });
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  public getPosts(): RealtimePost[] {
    if (typeof window === 'undefined') return DEFAULT_POSTS;
    try {
      const stored = localStorage.getItem(STORAGE_POSTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(DEFAULT_POSTS));
      return DEFAULT_POSTS;
    } catch {
      return DEFAULT_POSTS;
    }
  }

  public publishPost(post: Omit<RealtimePost, 'id' | 'likes' | 'comments' | 'time' | 'createdAt'>): RealtimePost {
    const newPost: RealtimePost = {
      ...post,
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      likes: 0,
      comments: 0,
      time: 'Just now',
      likedBy: [],
      createdAt: Date.now()
    };

    const currentPosts = this.getPosts();
    const updated = [newPost, ...currentPosts];

    try {
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('[Realtime] Could not persist to localStorage:', err);
    }

    // Broadcast to other tabs & windows
    this.broadcast({ type: 'NEW_POST', payload: newPost });

    // Notify local listeners
    this.notify({ type: 'NEW_POST', payload: newPost });

    // Dispatch custom event for AdminStateContext & global ecosystem
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('gma_realtime_fellow_content', {
          detail: {
            id: newPost.id,
            fellowName: newPost.author,
            fellowEmail: newPost.authorEmail || 'fellow@goldenminds.africa',
            contentType: newPost.type === 'article' ? 'Forum Post' : 'Portfolio Showcase',
            title: newPost.title,
            excerpt: newPost.summary,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'Active',
            track: newPost.tags[0] || 'Leadership'
          }
        })
      );
    }

    return newPost;
  }

  public toggleLike(postId: string, userId: string = 'current-fellow'): { likes: number; liked: boolean } {
    const posts = this.getPosts();
    let result = { likes: 0, liked: false };

    const updated = posts.map((p) => {
      if (p.id === postId) {
        const likedBy = p.likedBy || [];
        const isLiked = likedBy.includes(userId);
        let newLikedBy = isLiked ? likedBy.filter((id) => id !== userId) : [...likedBy, userId];
        let newLikes = isLiked ? Math.max(0, p.likes - 1) : p.likes + 1;
        result = { likes: newLikes, liked: !isLiked };
        return { ...p, likes: newLikes, likedBy: newLikedBy };
      }
      return p;
    });

    try {
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(updated));
    } catch {
      // Storage error fallback
    }

    this.broadcast({ type: 'POST_LIKED', payload: { postId, ...result } });
    this.notify({ type: 'POST_LIKED', payload: { postId, ...result } });
    return result;
  }

  public broadcastProgress(event: FellowProgressEvent) {
    let list: FellowProgressEvent[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_PROGRESS_KEY);
      if (stored) list = JSON.parse(stored);
    } catch {
      list = [];
    }
    list = [event, ...list].slice(0, 50);
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(list));
    } catch {}

    this.broadcast({ type: 'FELLOW_PROGRESS', payload: event });
    this.notify({ type: 'FELLOW_PROGRESS', payload: event });
  }

  public getRecentProgress(): FellowProgressEvent[] {
    try {
      const stored = localStorage.getItem(STORAGE_PROGRESS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private broadcast(data: { type: string; payload: any }) {
    if (this.channel) {
      try {
        this.channel.postMessage(data);
      } catch (err) {
        console.warn('[Realtime] broadcast error:', err);
      }
    }
  }

  private handleIncoming(data: any) {
    if (data && data.type) {
      this.notify(data);
    }
  }

  private notify(data: { type: string; payload: any }) {
    this.listeners.forEach((l) => l(data));
  }
}

export const fellowshipRealtime = new FellowshipRealtimeHub();
