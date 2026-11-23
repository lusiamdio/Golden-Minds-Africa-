/**
 * Client-Side Gemini Communication Utilities
 * 
 * Communicates strictly with our full-stack Express server endpoints (/api/gemini/*)
 * so that no Gemini SDK instantiation or API keys are exposed to the browser.
 */

export interface GeminiCallParams {
  contents: any;
  model?: string;
  systemInstruction?: string;
  config?: any;
}

export interface GeminiServerResponse {
  text: string;
  candidates?: any[];
  fallbackUsed?: boolean;
}

/**
 * Sends a content generation request to the server-side Gemini API.
 */
export async function generateGeminiContent({
  contents,
  model = 'gemini-2.5-flash',
  systemInstruction,
  config = {},
}: GeminiCallParams): Promise<string> {
  const res = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      model,
      systemInstruction,
      config,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server Gemini error: HTTP ${res.status}`);
  }

  const data: GeminiServerResponse = await res.json();
  return data.text || '';
}

/**
 * Returns the full server response object (including candidates and grounding metadata).
 */
export async function generateGeminiContentFull({
  contents,
  model = 'gemini-2.5-flash',
  systemInstruction,
  config = {},
}: GeminiCallParams): Promise<GeminiServerResponse> {
  const res = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      model,
      systemInstruction,
      config,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server Gemini error: HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Stream content generation from server using Server-Sent Events (SSE).
 */
export async function* streamGeminiContent({
  contents,
  model = 'gemini-2.5-flash',
  systemInstruction,
  config = {},
}: GeminiCallParams): AsyncGenerator<{ text: string; candidates?: any[] }> {
  const res = await fetch('/api/gemini/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      model,
      systemInstruction,
      config,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Failed to initiate stream: HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') return;
        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) throw new Error(parsed.error);
          yield parsed;
        } catch (e: any) {
          if (e.message !== 'Unexpected end of JSON input') {
            console.warn('Error parsing SSE chunk:', e);
          }
        }
      }
    }
  }
}

/**
 * Connect to the server-side Live API WebSocket.
 */
export interface LiveClientCallbacks {
  onOpen?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

export class LiveClientSession {
  private ws: WebSocket | null = null;
  private callbacks: LiveClientCallbacks;
  private voice: string;

  constructor(callbacks: LiveClientCallbacks, voice: string = 'Zephyr') {
    this.callbacks = callbacks;
    this.voice = voice;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/gemini/live?voice=${encodeURIComponent(this.voice)}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Connected to server proxy
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'connected') {
            resolve();
            if (this.callbacks.onOpen) this.callbacks.onOpen();
          } else if (msg.type === 'message') {
            if (this.callbacks.onMessage) this.callbacks.onMessage(msg.data);
          } else if (msg.type === 'error') {
            if (this.callbacks.onError) this.callbacks.onError(msg.message);
          } else if (msg.type === 'closed') {
            if (this.callbacks.onClose) this.callbacks.onClose();
          }
        } catch (err) {
          console.error('Error handling server Live message:', err);
        }
      };

      this.ws.onerror = (err) => {
        if (this.callbacks.onError) this.callbacks.onError(err);
        reject(err);
      };

      this.ws.onclose = () => {
        if (this.callbacks.onClose) this.callbacks.onClose();
      };
    });
  }

  sendRealtimeAudio(base64Data: string, mimeType: string = 'audio/pcm;rate=16000') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'audio',
        data: base64Data,
        mimeType,
      }));
    }
  }

  sendRealtimeText(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'text',
        text,
      }));
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * Backward compatibility alias for components that import ai object.
 * Dispatches to /api/gemini/generate on server.
 */
export const ai = {
  models: {
    generateContent: async ({ model, contents, config }: any) => {
      const full = await generateGeminiContentFull({
        model,
        contents,
        config,
      });
      return {
        text: full.text,
        candidates: full.candidates,
      };
    },
    generateContentStream: async ({ model, contents, config }: any) => {
      return streamGeminiContent({ model, contents, config });
    },
  },
};
