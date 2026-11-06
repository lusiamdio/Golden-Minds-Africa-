import { GoogleGenAI } from '@google/genai';

// Initialize Gemini instance safely using server/build defined environment key
const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary reliable models: gemini-2.5-flash is ultra-fast & resilient; gemini-3.1-flash-lite as rapid fallback
export const PRIMARY_MODEL = 'gemini-2.5-flash';
export const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

export interface GeminiCallParams {
  contents: any;
  model?: string;
  systemInstruction?: string;
  config?: any;
}

/**
 * Resilient Gemini Content Generator with automatic 503 / high-demand failover
 */
export async function generateGeminiContent({
  contents,
  model = PRIMARY_MODEL,
  systemInstruction,
  config = {},
}: GeminiCallParams): Promise<string> {
  // If the model passed was one of the known unstable/preview identifiers, map it to a stable model
  let requestedModel = model;
  if (
    requestedModel === 'gemini-3.8-flash' ||
    requestedModel === 'gemini-3-flash-preview' ||
    requestedModel === 'gemini-3.1-flash-preview' ||
    requestedModel === 'gemini-3.5-flash'
  ) {
    requestedModel = PRIMARY_MODEL;
  } else if (
    requestedModel === 'gemini-3.1-pro-preview' ||
    requestedModel === 'gemini-pro'
  ) {
    requestedModel = PRIMARY_MODEL;
  } else if (requestedModel === 'gemini-3.1-flash-lite-preview') {
    requestedModel = FALLBACK_MODEL;
  }

  const mergedConfig = {
    ...config,
    ...(systemInstruction ? { systemInstruction } : {}),
  };

  try {
    const response = await ai.models.generateContent({
      model: requestedModel,
      contents,
      config: mergedConfig,
    });
    return response.text || '';
  } catch (primaryError: any) {
    console.warn(`Primary model (${requestedModel}) failed:`, primaryError?.message || primaryError);
    
    // Automatically failover to FALLBACK_MODEL if primary model failed
    if (requestedModel !== FALLBACK_MODEL) {
      try {
        console.info(`Failing over to ${FALLBACK_MODEL}...`);
        const fallbackResponse = await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents,
          config: mergedConfig,
        });
        return fallbackResponse.text || '';
      } catch (fallbackError: any) {
        console.error(`Fallback model (${FALLBACK_MODEL}) also failed:`, fallbackError);
        throw fallbackError;
      }
    }
    throw primaryError;
  }
}
