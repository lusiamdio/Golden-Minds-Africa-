import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Always bind port 3000 in dev (or explicit --port CLI flag), and process.env.PORT in production
const portArgIdx = process.argv.indexOf('--port');
const cliPort = portArgIdx !== -1 ? parseInt(process.argv[portArgIdx + 1], 10) : NaN;
const PORT = !isNaN(cliPort)
  ? cliPort
  : (process.env.NODE_ENV === 'production' ? parseInt(process.env.PORT || '3000', 10) : 3000);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

export const PRIMARY_MODEL = 'gemini-2.5-flash';
export const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function mapRequestedModel(model?: string): string {
  if (!model) return PRIMARY_MODEL;
  if (
    model === 'gemini-3.8-flash' ||
    model === 'gemini-3-flash-preview' ||
    model === 'gemini-3.1-flash-preview' ||
    model === 'gemini-3.5-flash' ||
    model === 'gemini-flash-latest'
  ) {
    return PRIMARY_MODEL;
  }
  if (model === 'gemini-3.1-pro-preview' || model === 'gemini-pro') {
    return PRIMARY_MODEL;
  }
  if (model === 'gemini-3.1-flash-lite-preview') {
    return FALLBACK_MODEL;
  }
  return model;
}

function parseGeminiError(err: any): { status: number; message: string; isAuthOrBilling: boolean } {
  const rawMsg = err?.message || String(err);
  let status = typeof err?.status === 'number' ? err.status : 500;
  let message = rawMsg;

  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed?.error) {
      status = parsed.error.code || status;
      message = parsed.error.message || message;
    }
  } catch {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed?.error) {
          status = parsed.error.code || status;
          message = parsed.error.message || message;
        }
      } catch {}
    }
  }

  const isAuthOrBilling =
    status === 401 ||
    status === 403 ||
    /PERMISSION_DENIED|CONSUMER_SUSPENDED|API_KEY_INVALID|ACCESS_DENIED/i.test(rawMsg);

  if (isAuthOrBilling && /CONSUMER_SUSPENDED|has been suspended/i.test(rawMsg)) {
    message = 'Gemini API permission denied: the Google Cloud project attached to GEMINI_API_KEY has been suspended. Please update GEMINI_API_KEY in Settings > Secrets.';
  } else if (isAuthOrBilling && /ACCESS_DENIED|Permission denied on the service/i.test(rawMsg)) {
    message = 'Gemini API permission denied: please verify GEMINI_API_KEY and that the Generative Language API is enabled in Settings > Secrets.';
  }

  return { status: status >= 400 && status < 600 ? status : 500, message, isAuthOrBilling };
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 1. Unary Content Generation endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const ai = getAIClient();
    const { contents, model, config, systemInstruction } = req.body;
    const targetModel = mapRequestedModel(model);

    const mergedConfig: any = {
      ...(config || {}),
      ...(systemInstruction ? { systemInstruction } : {}),
    };

    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: mergedConfig,
      });

      return res.json({
        text: response.text || '',
        candidates: response.candidates || [],
      });
    } catch (primaryErr: any) {
      const parsed = parseGeminiError(primaryErr);
      if (parsed.isAuthOrBilling) {
        return res.status(parsed.status).json({ error: parsed.message });
      }

      console.warn(`Primary model (${targetModel}) failed on server, retrying fallback:`, parsed.message);
      if (targetModel !== FALLBACK_MODEL) {
        const fallbackResponse = await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents,
          config: mergedConfig,
        });

        return res.json({
          text: fallbackResponse.text || '',
          candidates: fallbackResponse.candidates || [],
          fallbackUsed: true,
        });
      }
      throw primaryErr;
    }
  } catch (error: any) {
    const parsed = parseGeminiError(error);
    console.warn('Server Gemini generate notice:', parsed.message);
    return res.status(parsed.status).json({
      error: parsed.message,
    });
  }
});

// 2. Server-Sent Events (SSE) Streaming Content Generation endpoint
app.post('/api/gemini/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const ai = getAIClient();
    const { contents, model, config, systemInstruction } = req.body;
    const targetModel = mapRequestedModel(model);

    const mergedConfig: any = {
      ...(config || {}),
      ...(systemInstruction ? { systemInstruction } : {}),
    };

    const stream = await ai.models.generateContentStream({
      model: targetModel,
      contents,
      config: mergedConfig,
    });

    for await (const chunk of stream) {
      const payload = JSON.stringify({
        text: chunk.text || '',
        candidates: chunk.candidates || [],
      });
      res.write(`data: ${payload}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    const parsed = parseGeminiError(error);
    console.warn('Server Gemini stream notice:', parsed.message);
    res.write(`data: ${JSON.stringify({ error: parsed.message })}\n\n`);
    res.end();
  }
});

// 3. WebSocket Server for Live API Voice & Real-time Audio
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = request.url || '';
  if (url.startsWith('/api/gemini/live')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket, request) => {
  let liveSession: any = null;

  try {
    const ai = getAIClient();
    const urlObj = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    const voiceName = urlObj.searchParams.get('voice') || 'Zephyr';

    liveSession = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
        systemInstruction: 'You are an intelligent audio guide for Golden Minds Africa. Keep responses punchy, relevant, and inspiring.',
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'connected' }));
          }
        },
        onmessage: (message: any) => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'message',
              data: message,
            }));
          }
        },
        onerror: (err: any) => {
          const parsed = parseGeminiError(err);
          console.warn('Live API Session notice:', parsed.message);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'error',
              message: parsed.message,
            }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed' }));
            clientWs.close();
          }
        },
      },
    });

    clientWs.on('message', (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'audio' && parsed.data) {
          liveSession.sendRealtimeInput({
            audio: { data: parsed.data, mimeType: parsed.mimeType || 'audio/pcm;rate=16000' },
          });
        } else if (parsed.type === 'text' && parsed.text) {
          liveSession.sendRealtimeInput({
            text: parsed.text,
          });
        }
      } catch (parseErr) {
        console.warn('Error handling client live message:', parseErr);
      }
    });

    clientWs.on('close', () => {
      try {
        if (liveSession) {
          liveSession.close();
        }
      } catch {}
    });

    clientWs.on('error', () => {
      try {
        if (liveSession) {
          liveSession.close();
        }
      } catch {}
    });
  } catch (initErr: any) {
    const parsed = parseGeminiError(initErr);
    console.warn('Failed to initialize Gemini Live session:', parsed.message);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: parsed.message,
      }));
      clientWs.close();
    }
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
