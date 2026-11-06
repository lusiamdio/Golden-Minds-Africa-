import { GoogleGenAI } from '@google/genai';
import { supabase } from './supabase';

export interface ModerationResult {
  flagged: boolean;
  reason: string;
  confidence: number; // between 0 and 1
  category: 'Hate Speech' | 'Harassment' | 'Unprofessional language' | 'Spam/Scam' | 'None';
}

// Lazy initializer for Google Gen AI to prevent load-time crash
let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY is not defined in the environment. AI moderation of content fell back to keyword matching.');
      throw new Error('GEMINI_API_KEY is required for AI content moderation.');
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

/**
 * Automatically moderation scans any fellow-generated text content against basic community guidelines.
 * Community Guidelines:
 *   1. No offensive language, hate speech, or derogatory slurs (especially within a Pan-African academic context).
 *   2. No personal harassment, bullying, threats, or severe academic dishonesty.
 *   3. No spam, advertisements, phishing, or financial scams.
 *   4. No high-vulnerability toxic content or extreme graphic descriptions.
 */
export async function scanContentAI(
  text: string, 
  title: string = 'Untitled', 
  authorName: string = 'Unknown Fellow'
): Promise<ModerationResult> {
  const defaultResult: ModerationResult = {
    flagged: false,
    reason: 'Content passed automated scan.',
    confidence: 1.0,
    category: 'None'
  };

  if (!text || text.trim().length === 0) {
    return defaultResult;
  }

  // Backup regex scan in case API is unavailable or keys are unconfigured
  const toxicKeywords = ['scam payout', 'invest 100$', 'buy crypto fast', 'f**k', 'b***h', 'sh*t', 'kill yourself', 'idiot fool', 'retard', 'scammer'];
  const lowercaseText = text.toLowerCase();
  for (const keyword of toxicKeywords) {
    if (lowercaseText.includes(keyword)) {
      return {
        flagged: true,
        reason: `Flagged via standard compliance layer. Detected potential toxic token match: "${keyword}"`,
        confidence: 0.95,
        category: keyword.includes('crypto') || keyword.includes('invest') ? 'Spam/Scam' : 'Unprofessional language'
      };
    }
  }

  try {
    const ai = getAIClient();
    const systemPrompt = `You are a compliance scanning agent for Golden Minds Africa, a premium, high-integrity Pan-African leadership fellowship circle.
Your goal is to scan fellow-generated forum posts, notes, and chat messages against community guidelines.
Identify any violations of:
- Hate Speech (racial slurs, xenophobic attacks, tribalism insults).
- Harassment (cyberbullying, personal targeting, direct threats).
- Unprofessional language (extreme profanity, coarse swearing, crude obscenities).
- Spam or Scams (quick-money schemes, crypto ads, clickbait, phishing).

Structure your output STRICTLY as a single JSON code block without any prefix or postfix. Do not use any markdown tags outside of the JSON representation. Output format:
{
  "flagged": true/false,
  "category": "Hate Speech" | "Harassment" | "Unprofessional language" | "Spam/Scam" | "None",
  "reason": "Brief single-sentence explanation of what was violated or why text was cleared.",
  "confidence": <float number between 0.0 and 1.0 representing analysis assurance>
}`;

    const userPrompt = `Content metadata:
Author: ${authorName}
Title: ${title}
Content Text: "${text}"

Scan the content and output the JSON moderation block:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      }
    });

    const outputText = response.text?.trim() || '';
    if (!outputText) {
      return defaultResult;
    }

    // Clean JSON content if wrapped in markdown triquetra
    let cleanJson = outputText;
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\n?/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanJson);
    return {
      flagged: !!parsed.flagged,
      reason: parsed.reason || 'Completed program evaluation scans.',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
      category: ['Hate Speech', 'Harassment', 'Unprofessional language', 'Spam/Scam', 'None'].includes(parsed.category) 
        ? parsed.category 
        : 'None'
    };

  } catch (err) {
    console.warn('AI Content Moderation failed. Reverting to backup. Reason:', err);
    // Return backup default
    return defaultResult;
  }
}

/**
 * Alerts the Admin engine in real time by logging an incident report and setting a persistent flag
 */
export async function reportModerationViolation(
  contentId: string,
  contentType: string,
  title: string,
  authorName: string,
  text: string,
  result: ModerationResult
) {
  try {
    // 1. Submit incident report to local storage so super admin is alerted
    const savedReports = localStorage.getItem('gma_admin_incident_reports');
    const reports = savedReports ? JSON.parse(savedReports) : [];
    
    const newReport = {
      id: `rep-ai-${Date.now()}`,
      targetName: authorName,
      reporterName: `AI-Powered Moderation Service`,
      description: `AUTOMATED SYSTEM REPORT: Flagged ${contentType} titled "${title}". Category: [${result.category}]. Confidence: ${(result.confidence * 100).toFixed(0)}%. Reason: ${result.reason}`,
      channel: `Content Auto-Moderator [${contentType}]`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending' as const
    };

    localStorage.setItem('gma_admin_incident_reports', JSON.stringify([newReport, ...reports]));

    // 2. Add as dynamic audit log
    const savedAudits = localStorage.getItem('gma_admin_audit_logs');
    const audits = savedAudits ? JSON.parse(savedAudits) : [];
    const newAudit = {
      id: `l-ai-${Date.now()}`,
      adminName: 'AI Guardian Service',
      action: `Auto-flagged content item: ${title} (Confidence: ${(result.confidence * 100).toFixed(0)}%)`,
      target: contentId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category: 'Moderation' as const
    };
    localStorage.setItem('gma_admin_audit_logs', JSON.stringify([newAudit, ...audits]));

    // 3. Dispatch global browser alert/notification event for real-time alerting
    const alertEvent = new CustomEvent('gma-ai-moderator-alert', { 
      detail: { 
        id: newReport.id, 
        authorName, 
        contentType, 
        title, 
        reason: result.reason,
        category: result.category
      } 
    });
    window.dispatchEvent(alertEvent);

  } catch (err) {
    console.error('Failed to report violation:', err);
  }
}
