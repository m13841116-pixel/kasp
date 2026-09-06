import { GoogleGenAI } from '@google/genai';
import { GroundingSource } from './types.js';

export class GeminiTimeoutError extends Error {
  readonly isTimeout = true;
  constructor(message = 'درخواست از مدل هوش مصنوعی به دلیل فراتر رفتن از سقف زمانی ۳۰ ثانیه لغو شد.') {
    super(message);
    this.name = 'GeminiTimeoutError';
  }
}

export class GeminiNonRetryableError extends Error {
  readonly isNonRetryable = true;
  constructor(message: string) {
    super(message);
    this.name = 'GeminiNonRetryableError';
  }
}

let aiInstance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 30000
      }
    });
  }
  return aiInstance;
}

// Supported models in order of priority:
// 1. gemini-3.1-flash-lite: High throughput, fast latency (~1.5s), large free quota
// 2. gemini-3.8-flash: High reasoning capability fallback
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
const HARD_TIMEOUT_MS = 30000; // Hard 30 seconds timeout per model request

export function cleanJsonString(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return text.trim();
}

/**
 * Distinguishes between transient failures (eligible for exactly 1 retry)
 * and permanent non-retryable failures (400, 401, 403, malformed prompts, schema errors).
 */
export function isTransientError(err: any): boolean {
  if (!err) return false;
  if (err instanceof GeminiTimeoutError || err?.name === 'AbortError' || err?.isTimeout) {
    return true;
  }

  const status = Number(err?.status || err?.code || err?.statusCode || 0);
  const message = (err?.message || String(err)).toLowerCase();

  // Explicit non-retryable errors
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    message.includes('invalid argument') ||
    message.includes('api key not valid') ||
    message.includes('unauthenticated') ||
    message.includes('permission_denied') ||
    message.includes('malformed') ||
    message.includes('schema validation') ||
    message.includes('bad request')
  ) {
    return false;
  }

  // Transient errors
  if (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 504 ||
    message.includes('503') ||
    message.includes('429') ||
    message.includes('high demand') ||
    message.includes('resource_exhausted') ||
    message.includes('quota') ||
    message.includes('unavailable') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('fetch failed') ||
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('socket hang up') ||
    message.includes('network') ||
    message.includes('connection')
  ) {
    return true;
  }

  return false;
}

export interface GroundingExtractionResult {
  text: string | null;
  sources: GroundingSource[];
  isSearchGrounded: boolean;
  searchQueries: string[];
}

/**
 * Executes an individual model call wrapped in a strict 30-second AbortController.
 */
async function callModelWithHardTimeout(
  ai: GoogleGenAI,
  model: string,
  contents: any,
  config: any
): Promise<any> {
  const abortController = new AbortController();
  let isAborted = false;

  const timer = setTimeout(() => {
    isAborted = true;
    abortController.abort(new GeminiTimeoutError(`Gemini model ${model} request exceeded 30 seconds limit`));
  }, HARD_TIMEOUT_MS);

  try {
    const apiPromise = ai.models.generateContent({
      model,
      contents,
      config
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      abortController.signal.addEventListener('abort', () => {
        reject(new GeminiTimeoutError(`Gemini model ${model} request aborted due to 30s timeout`));
      });
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);
    return response;
  } catch (err: any) {
    if (isAborted || err instanceof GeminiTimeoutError || err?.name === 'AbortError') {
      throw new GeminiTimeoutError(`Gemini model ${model} hard timeout (30s) exceeded`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Executes a Gemini request with:
 * - 30-second hard timeout
 * - Abort on timeout
 * - Exactly ONE retry for transient errors with exponential backoff (2000ms)
 * - Immediate abort/fail on non-retryable errors
 * - Model fallback
 */
export async function executeGeminiWithRetry(
  contents: any,
  config: any,
  allowModelFallback = true
): Promise<{ response: any; modelUsed: string } | null> {
  const ai = getGenAI();
  if (!ai) {
    console.warn('[Gemini Client] GEMINI_API_KEY is not configured');
    return null;
  }

  const modelsToTry = allowModelFallback ? CANDIDATE_MODELS : [CANDIDELS_MODEL_PRIMARY(config)];

  for (let modelIdx = 0; modelIdx < modelsToTry.length; modelIdx++) {
    const model = modelsToTry[modelIdx];

    // Each model gets up to 2 attempts: 1 initial attempt + exactly 1 retry for transient errors
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await callModelWithHardTimeout(ai, model, contents, config);
        if (response) {
          return { response, modelUsed: model };
        }
      } catch (err: any) {
        const isTimeout = err instanceof GeminiTimeoutError;
        const transient = isTransientError(err);
        const errMsg = err?.message || String(err);

        console.warn(
          `[Gemini Client] ${model} (attempt ${attempt}/2) failed. ` +
          `[${isTimeout ? 'TIMEOUT (30s)' : transient ? 'TRANSIENT' : 'NON-RETRYABLE'}] ${errMsg.slice(0, 120)}`
        );

        if (!transient) {
          // Do NOT retry invalid request, auth, schema, or permission errors
          console.warn(`[Gemini Client] Non-retryable error encountered. Skipping retry.`);
          break; // Break attempt loop to avoid useless retry
        }

        if (attempt === 1) {
          // Exactly ONE retry for transient errors with exponential backoff (2000ms)
          const backoffMs = 2000;
          console.info(`[Gemini Client] Retrying ${model} in ${backoffMs}ms (Attempt 2/2)...`);
          await new Promise(res => setTimeout(res, backoffMs));
          continue;
        } else {
          console.warn(`[Gemini Client] Single retry on ${model} exhausted.`);
        }
      }
    }
  }

  return null;
}

function CANDIDELS_MODEL_PRIMARY(_config: any): string {
  return CANDIDATE_MODELS[0];
}

/**
 * Standard text / JSON generation with robust timeout and single retry
 */
export async function generateWithGemini(
  prompt: string,
  systemInstruction?: string,
  isJson: boolean = true
): Promise<string | null> {
  const config: any = {
    temperature: 0.7,
  };

  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  if (isJson) {
    config.responseMimeType = 'application/json';
  }

  const result = await executeGeminiWithRetry(prompt, config, true);
  if (!result) {
    return null;
  }

  const text = result.response?.text;
  if (text) {
    return isJson ? cleanJsonString(text) : text;
  }

  return null;
}

/**
 * Server-side Google Search Grounding with extraction of real citations and fallback safety.
 */
export async function generateWithGoogleSearchGrounding(
  prompt: string,
  systemInstruction?: string
): Promise<GroundingExtractionResult> {
  const config: any = {
    temperature: 0.3,
    tools: [{ googleSearch: {} }]
  };

  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  // Attempt search grounding with retry and hard timeout
  // Notice: We don't do model fallback with search grounding because some models don't support googleSearch tool
  const result = await executeGeminiWithRetry(prompt, config, false);

  if (!result || !result.response) {
    return {
      text: null,
      sources: [],
      isSearchGrounded: false,
      searchQueries: []
    };
  }

  const candidate = result.response.candidates?.[0];
  const text = result.response.text || null;
  const metadata = candidate?.groundingMetadata;

  const sources: GroundingSource[] = [];
  const seenUrls = new Set<string>();

  const searchQueries: string[] = metadata?.webSearchQueries || [];
  const chunks = metadata?.groundingChunks || [];
  const supports = metadata?.groundingSupports || [];

  if (supports && supports.length > 0) {
    for (const support of supports) {
      const claim = (support.segment?.text || '').trim();
      const indices = support.groundChunkIndices || [];
      for (const idx of indices) {
        const chunk = chunks[idx];
        const url = chunk?.web?.uri;
        const title = chunk?.web?.title || 'منبع وب';
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          sources.push({
            title,
            url,
            claim: claim || 'استناد اعتبارسنجی شده توسط جستجوی گوگل'
          });
        }
      }
    }
  }

  if (sources.length === 0 && chunks && chunks.length > 0) {
    for (const chunk of chunks) {
      const url = chunk?.web?.uri;
      const title = chunk?.web?.title || 'منبع استخراج شده از گوگل';
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        sources.push({
          title,
          url,
          claim: 'استناد وب ثبت‌شده در فرآیند تحلیل زنده بازار'
        });
      }
    }
  }

  return {
    text,
    sources,
    isSearchGrounded: sources.length > 0 || searchQueries.length > 0,
    searchQueries
  };
}
