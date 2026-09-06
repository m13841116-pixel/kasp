import crypto from 'crypto';
import { getGenAI, generateWithGemini, cleanJsonString } from '../agents/geminiClient.js';
import { queryOne, execute } from '../db.js';
import { BrainStateManager } from './stateManager.js';
import { 
  BusinessState, 
  VoiceBriefing, 
  VoiceBriefingSection,
  VoiceInteractionRequest,
  VoiceInteractionResponse 
} from './types.js';

/**
 * Utility to convert raw 16-bit linear PCM byte buffer into a standard RIFF/WAV format.
 * Enables direct playback in standard HTML5 <audio> tags and Web Audio Context.
 */
export function pcmToWav(pcmData: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataLength = pcmData.length;
  const buffer = Buffer.alloc(44 + dataLength);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);

  // format subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20);  // AudioFormat 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  // copy PCM audio payload
  pcmData.copy(buffer, 44);
  return buffer;
}

export class VoiceAdvisorService {
  /**
   * Generates a concise spoken executive briefing tailored to the business state.
   * Does NOT simply read the report word-for-word.
   */
  static async generateBriefing(projectId: string, userId?: string): Promise<VoiceBriefing> {
    const state = await BrainStateManager.getProjectState(projectId);
    if (!state) {
      throw new Error(`پروژه با شناسه ${projectId} یا گراف کسب‌وکار مربوطه یافت نشد.`);
    }

    const { graph, executiveMemory } = state;
    const businessName = graph.business.name.value || 'کسب‌وکار شما';
    const businessGoal = executiveMemory.answers.whatAreWeBuilding || graph.business.mission.value || 'هدف کسب‌وکار';
    const valueProp = graph.offer.coreValueProposition.value || 'ارزش تمایزیافته';
    const targetAudience = graph.customer.primaryTarget.value || 'مخاطبان هدف';
    const problemSolved = graph.offer.problemSolved.value || 'حل چالش اصلی مشتریان';
    const solution = graph.offer.solutionDescription.value || 'راهکار پیشنهادی';
    const pricing = `${graph.pricing.pricingModel.value} (حدود ${graph.pricing.suggestedPriceRange.value})`;
    const competitors = graph.competitors.summary.value || 'رقبای سنتی و آنلاین';
    const channels = (graph.distribution?.primaryChannels?.value || []).map(c => c.channel).join('، ') || 'کانال‌های دیجیتال و مستقیم';

    // 1. Generate Structured Briefing Content via Gemini
    const systemPrompt = `
شما «مشاور استراتژیک ارشد سیستم هوش تجاری KASP» هستید.
وظیفه شما ارائه یک خلاصه اجرایی صوتی (Executive Spoken Briefing) صریح، حرفه‌ای، واقع‌گرایانه و الهام‌بخش به بنیان‌گذار این کسب‌وکار است.

قوانین حیاتی:
۱. هرگز متن گزارش تحلیلی را کلمه به کلمه یا طوطی‌وار نخوانید!
۲. مانند یک مشاور سرمایه‌گذاری و مدیر استراتژی کارکشته صحبت کنید: لحنی قدرتمند، صمیمی و در عین حال به دور از تعارف و تعصب.
۳. متن تولید شده باید کاملاً به زبان فارسی روان و با آهنگ کلام طبیعی (مناسب خوانش صوتی) باشد.
۴. خروجی باید شامل ۶ سرفصل کلیدی به همراه یک متن کامل پیوسته صوتی (fullSpokenBriefing) باشد:
   - whatItIs: این کسب‌وکار دقیقاً چیست و چه ارزش واقعی خلق می‌کند؟
   - kaspPerspective: دیدگاه و ارزیابی صریح KASP درباره قابلیت و بقای این ایده در بازار ایران.
   - biggestOpportunity: بزرگ‌ترین فرصت رشد، پول‌سازی و پیشی گرفتن از رقبا.
   - biggestRisk: بزرگ‌ترین دام و ریسک پنهان که اگر کنترل نشود کسب‌وکار را نابود می‌کند.
   - nextThreeActions: ۳ اقدام حیاتی و اولویت‌دار بعدی برای ۱۴ تا ۳۰ روز آینده.
   - ifKaspWereFounder: اگر KASP جای بنیان‌گذار این ایده بود، فردا صبح دقیقاً چه می‌کرد؟

پاسخ را منحصراً در قالب فرمت JSON زیر بازگردانید:
{
  "headline": "تیتر جذاب و چکیده یک‌خطی مشاور",
  "whatItIs": {
    "title": "این کسب‌وکار دقیقاً چیست؟",
    "spokenText": "متن صوتی روان ۲ تا ۳ جمله‌ای",
    "summaryBullet": "خلاصه نکته کلیدی در یک خط"
  },
  "kaspPerspective": {
    "title": "دیدگاه صریح مشاور KASP",
    "spokenText": "تحلیل صریح و ارزیابی عیار بیزینس در بازار",
    "summaryBullet": "خلاصه ارزیابی"
  },
  "biggestOpportunity": {
    "title": "بزرگ‌ترین فرصت بازار",
    "spokenText": "فرصت ناب رشد و تمایز",
    "summaryBullet": "خلاصه فرصت"
  },
  "biggestRisk": {
    "title": "بزرگ‌ترین ریسک و گلوگاه",
    "spokenText": "هشدار و ریسک محوری که باید رفع شود",
    "summaryBullet": "خلاصه ریسک"
  },
  "nextThreeActions": {
    "title": "۳ اقدام حیاتی بعدی",
    "spokenText": "توضیح صوتی سه گام نخست",
    "actions": [
      "اقدام اول: ...",
      "اقدام دوم: ...",
      "اقدام سوم: ..."
    ],
    "summaryBullet": "خلاصه ۳ گام اجرایی"
  },
  "ifKaspWereFounder": {
    "title": "اگر من بنیان‌گذار این کار بودم...",
    "spokenText": "اقدام اول صبح فردا و رویکرد اجرایی قاطع",
    "summaryBullet": "دستور کار ارشد"
  },
  "fullSpokenBriefing": "یک متن گفتاری کامل، یکپارچه، پرانرژی و پیوسته که از ابتدا تا انتهای خلاصه را با لحنی شیوا و گوش‌نواز روایت می‌کند (حدود ۲۰۰ تا ۳۵۰ کلمه به زبان فارسی)."
}
`.trim();

    const userPrompt = `
اطلاعات استخراج‌شده از BusinessState کسب‌وکار:
- نام کسب‌وکار: ${businessName}
- ایده و هدف: ${businessGoal}
- مشکل مخاطب: ${problemSolved}
- ارزش پیشنهادی اصلی: ${valueProp}
- راهکار طراحی‌شده: ${solution}
- بازار و مخاطبان هدف: ${targetAudience}
- مدل قیمت‌گذاری: ${pricing}
- وضعیت رقبا: ${competitors}
- کانال‌های توزیع و بازاریابی: ${channels}
`.trim();

    const briefingJsonText = await generateWithGemini(userPrompt, systemPrompt, true);
    const cleaned = cleanJsonString(briefingJsonText);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('[VoiceAdvisor] Failed to parse briefing JSON, using structured fallback:', e);
      parsed = {
        headline: `بررسی استراتژیک و مسیر اجرایی ${businessName}`,
        whatItIs: {
          title: "این کسب‌وکار دقیقاً چیست؟",
          spokenText: `${businessName} پاسخی هدفمند به چالش ${problemSolved} است که تلاش می‌کند با ارائه ${solution} برای ${targetAudience} ارزش‌آفرینی پایداری خلق کند.`,
          summaryBullet: `${businessGoal} برای جامعه مخاطب ${targetAudience}`
        },
        kaspPerspective: {
          title: "دیدگاه صریح مشاور KASP",
          spokenText: `پروژه شما در صورت تمرکز بر تمایز در ${valueProp} پتانسیل کشش بالایی در بازار دارد، مشروط بر آنکه از پیچیدگی‌های اولیه پرهیز کنید.`,
          summaryBullet: "پتانسیل بالای رشد با استراتژی تمرکز بر حداقل محصول پذیرفتنی"
        },
        biggestOpportunity: {
          title: "بزرگ‌ترین فرصت بازار",
          spokenText: `بزرگ‌ترین فرصت شما تسخیر بخش بکر بازار با اتکا به ${channels} و ارائه خدمتی سریع‌تر و شفاف‌تر از رقبای موجود است.`,
          summaryBullet: "بهره‌برداری از خلاءهای رقبای سنتی و بازاریابی مستقیم"
        },
        biggestRisk: {
          title: "بزرگ‌ترین ریسک و گلوگاه",
          spokenText: `ریسک اصلی فرسایش سرمایه در فاز ساخت بدون اعتبارسنجی پیش‌خرید یا تعامل مستقیم با مشتریان واقعی است.`,
          summaryBullet: "طولانی شدن چرخه ورود به بازار پیش از تایید تقاضای نقدی"
        },
        nextThreeActions: {
          title: "۳ اقدام حیاتی بعدی",
          spokenText: `در قدم اول لندینگ‌پیج اعتبارسنجی را مستقر کنید، در قدم دوم با حداقل ۱۰ مشتری بالقوه مصاحبه کنید، و در قدم سوم پیشنهاد اولیه را لانچ نمایید.`,
          actions: [
            "راه‌اندازی فوری صفحه فرود اعتبارسنجی و پیش‌ثبت‌نام",
            "مصاحبه عمیق با حداقل ۱۰ نفر از پرسونای اصلی مشتریان",
            "تست کمپین بازاریابی کم‌هزینه روی کانال توزیع اول"
          ],
          summaryBullet: "اعتبارسنجی سریع، گفتگوی مستقیم با مشتری، و راه‌اندازی کمپین اولیه"
        },
        ifKaspWereFounder: {
          title: "اگر من بنیان‌گذار این کار بودم...",
          spokenText: `اگر من فردا صبح جای شما بودم، به جای ساخت تمام ویژگی‌ها، ظرف ۴۸ ساعت یک پیشنهاد مقاومت‌ناپذیر می‌ساختم و اولین فروش واقعی را تست می‌کردم.`,
          summaryBullet: "فروش دستی قبل از اتوماسیون کامل"
        },
        fullSpokenBriefing: `سلام بنیان‌گذار گرامی. من مشاور استراتژیک هوش تجاری KASP هستم. کسب‌وکار شما، یعنی ${businessName}، پتانسیل چشمگیری در حل چالش ${problemSolved} دارد. تحلیل داده‌های ما نشان می‌دهد بزرگ‌ترین فرصت پیش روی شما استفاده از کانال‌های دیجیتال برای دستیابی مستقیم به ${targetAudience} است. با این حال، بزرگ‌ترین خطری که شما را تهدید می‌کند طولانی کردن فرآیند ساخت قبل از اولین فروش است. توصیه اکید KASP برای ۳ گام بعدی شما: ابتدا صفحه فرود را بالا بیاورید، مستقیماً با مشتریان صحبت کنید و بلافاصله پیشنهاد اولیه را تست نمایید. اگر من جای شما بودم، همین فردا صبح اولین فروش را بدون هیچ بهانه‌ای کلید می‌زدم. همراهتان هستیم.`
      };
    }

    const fullTranscript = parsed.fullSpokenBriefing || [
      parsed.whatItIs?.spokenText,
      parsed.kaspPerspective?.spokenText,
      parsed.biggestOpportunity?.spokenText,
      parsed.biggestRisk?.spokenText,
      parsed.nextThreeActions?.spokenText,
      parsed.ifKaspWereFounder?.spokenText
    ].filter(Boolean).join(' ');

    // 2. Synthesize High-Quality Audio via Gemini / @google/genai
    let audioBase64: string | undefined;
    let audioMimeType: string | undefined = 'audio/wav';
    let audioDurationSeconds: number = Math.round(fullTranscript.length / 14); // Approx duration in seconds

    try {
      const ai = getGenAI();
      if (ai) {
        // Attempt native audio generation with Gemini models
        const audioPrompt = `Read the following Persian executive briefing aloud with a professional, confident, clear, and engaging tone:\n\n${fullTranscript}`;
        
        try {
          // Model with native audio support as specified in Gemini guidelines
          const audioResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: audioPrompt,
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Puck' // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede'
                  }
                }
              }
            }
          });

          // Check if candidate parts contain audio inline data
          const parts = audioResponse.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if ((part as any).inlineData && (part as any).inlineData.data) {
              const inline = (part as any).inlineData;
              const rawData = Buffer.from(inline.data, 'base64');
              
              if (inline.mimeType?.includes('pcm')) {
                // Wrap raw PCM in standard WAV header for browser native playback
                const wavBuffer = pcmToWav(rawData, 24000, 1, 16);
                audioBase64 = wavBuffer.toString('base64');
                audioMimeType = 'audio/wav';
              } else {
                audioBase64 = inline.data;
                audioMimeType = inline.mimeType || 'audio/mp3';
              }
              break;
            }
          }
        } catch (innerAudioErr) {
          console.warn('[VoiceAdvisor] Direct Gemini audio responseModalities generation notice (fallback to structured client speech):', innerAudioErr);
        }
      }
    } catch (audioErr) {
      console.warn('[VoiceAdvisor] TTS synthesis notice:', audioErr);
    }

    const briefingId = `briefing-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const briefing: VoiceBriefing = {
      id: briefingId,
      projectId,
      userId,
      businessName,
      headline: parsed.headline || `خلاصه استراتژیک KASP برای ${businessName}`,
      sections: {
        whatItIs: {
          key: 'whatItIs',
          title: parsed.whatItIs?.title || 'این کسب‌وکار دقیقاً چیست؟',
          spokenText: parsed.whatItIs?.spokenText || '',
          summaryBullet: parsed.whatItIs?.summaryBullet || ''
        },
        kaspPerspective: {
          key: 'kaspPerspective',
          title: parsed.kaspPerspective?.title || 'دیدگاه صریح مشاور KASP',
          spokenText: parsed.kaspPerspective?.spokenText || '',
          summaryBullet: parsed.kaspPerspective?.summaryBullet || ''
        },
        biggestOpportunity: {
          key: 'biggestOpportunity',
          title: parsed.biggestOpportunity?.title || 'بزرگ‌ترین فرصت بازار',
          spokenText: parsed.biggestOpportunity?.spokenText || '',
          summaryBullet: parsed.biggestOpportunity?.summaryBullet || ''
        },
        biggestRisk: {
          key: 'biggestRisk',
          title: parsed.biggestRisk?.title || 'بزرگ‌ترین ریسک و گلوگاه',
          spokenText: parsed.biggestRisk?.spokenText || '',
          summaryBullet: parsed.biggestRisk?.summaryBullet || ''
        },
        nextThreeActions: {
          key: 'nextThreeActions',
          title: parsed.nextThreeActions?.title || '۳ اقدام حیاتی بعدی',
          spokenText: parsed.nextThreeActions?.spokenText || '',
          actions: Array.isArray(parsed.nextThreeActions?.actions) ? parsed.nextThreeActions.actions : [
            "راه‌اندازی لندینگ‌پیج اعتبارسنجی اولیه",
            "گفتگو و مصاحبه با مشتریان بالقوه",
            "اجرای اولین فروش تستی"
          ],
          summaryBullet: parsed.nextThreeActions?.summaryBullet || ''
        },
        ifKaspWereFounder: {
          key: 'ifKaspWereFounder',
          title: parsed.ifKaspWereFounder?.title || 'اگر من بنیان‌گذار این کار بودم...',
          spokenText: parsed.ifKaspWereFounder?.spokenText || '',
          summaryBullet: parsed.ifKaspWereFounder?.summaryBullet || ''
        }
      },
      fullTranscript,
      audioBase64,
      audioMimeType,
      audioDurationSeconds,
      voiceName: 'KASP Executive Voice',
      generatedAt: now
    };

    // 3. Persist into Database
    try {
      // Remove any prior briefings for this project to keep clean single source of truth
      await execute("DELETE FROM ai_voice_briefings WHERE projectId = ?", [projectId]);
      await execute(
        `INSERT INTO ai_voice_briefings (id, projectId, userId, businessName, briefingData, audioData, audioMimeType, audioDurationSeconds, voiceName, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          briefing.id,
          projectId,
          userId || 'guest',
          businessName,
          JSON.stringify(briefing),
          audioBase64 || '',
          audioMimeType || 'audio/wav',
          audioDurationSeconds,
          briefing.voiceName || 'KASP Voice',
          now
        ]
      );
    } catch (dbErr) {
      console.error('[VoiceAdvisor] Error saving briefing to database:', dbErr);
    }

    return briefing;
  }

  /**
   * Retrieves existing Voice Briefing for a project
   */
  static async getBriefing(projectId: string): Promise<VoiceBriefing | null> {
    try {
      const row = await queryOne("SELECT * FROM ai_voice_briefings WHERE projectId = ? ORDER BY createdAt DESC LIMIT 1", [projectId]);
      if (row && row.briefingData) {
        const briefing = typeof row.briefingData === 'string' ? JSON.parse(row.briefingData) : row.briefingData;
        if (row.audioData && !briefing.audioBase64) {
          briefing.audioBase64 = row.audioData;
          briefing.audioMimeType = row.audioMimeType || 'audio/wav';
        }
        return briefing;
      }
      return null;
    } catch (err) {
      console.error('[VoiceAdvisor] Error retrieving voice briefing:', err);
      return null;
    }
  }

  /**
   * Conversational Voice Interaction Architecture:
   * User speaks -> Speech-to-Text -> KASP BusinessState -> Manager -> Response -> Text-to-Speech
   */
  static async processVoiceInteraction(request: VoiceInteractionRequest, userId?: string): Promise<VoiceInteractionResponse> {
    const { projectId, userSpeechText, contextMode = 'strategic' } = request;
    const state = await BrainStateManager.getProjectState(projectId);
    
    const businessName = state?.graph.business.name.value || 'این کسب‌وکار';
    const mission = state?.graph.business.mission.value || state?.executiveMemory.answers.whatAreWeBuilding || '';
    const target = state?.graph.customer.primaryTarget.value || '';
    const valueProp = state?.graph.offer.coreValueProposition.value || '';
    const pricing = state?.graph.pricing.suggestedPriceRange.value || '';

    const systemPrompt = `
شما «مشاور هوشمند KASP در حالت گفتگوی صوتی زنده» هستید.
کاربر به صورت صوتی از شما درباره کسب‌وکارش سوال پرسیده است:
- نام کسب‌وکار: ${businessName}
- ماموریت و محصول: ${mission}
- مخاطب هدف: ${target}
- ارزش تمایز: ${valueProp}
- قیمت‌گذاری: ${pricing}

قوانین پاسخ صوتی:
۱. پاسخ باید کاملاً مختصر، کاربردی و مناسب شنیدن (Spoken Audio) باشد (حداکثر ۲ تا ۴ پاراگراف کوتاه).
۲. از اصطلاحات خشک و پیچیده پرهیز کنید. راهکار عملی و تصمیم‌گیرانه ارائه دهید.
۳. در انتهای پاسخ ۱ تا ۲ سوال مرتبط بعدی برای ادامه مکالمه پیشنهاد دهید.

فرمت خروجی منحصراً JSON:
{
  "spokenResponse": "پاسخ گفتاری کامل و شیوا",
  "bulletSummary": "نکته کلیدی پاسخ در یک جمله",
  "relevantGraphNode": "offer | market | pricing | distribution | financials",
  "suggestedFollowUps": [
    "سوال پیشنهادی اول",
    "سوال پیشنهادی دوم"
  ]
}
`.trim();

    const responseText = await generateWithGemini(userSpeechText, systemPrompt, true);
    const cleaned = cleanJsonString(responseText);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      parsed = {
        spokenResponse: `در خصوص پرسش شما درباره ${businessName}، کلیدی‌ترین نکته تمرکز بر بازخورد واقعی مشتریان و حفظ حاشیه سود در فاز اولیه است. پیشنهاد می‌کنم این فرضیه را با تست مستقیم روی ۱۰ کاربر بسنجید.`,
        bulletSummary: "تمرکز بر فیدبک مستقیم مشتری و آزمودن فرضیه",
        relevantGraphNode: "market",
        suggestedFollowUps: ["چطور اولین تست فروش را انجام دهم؟", "بهترین کانال جذب برای این جامعه هدف چیست؟"]
      };
    }

    const timestamp = new Date().toISOString();

    // Persist conversation event
    try {
      const interactionId = `v-chat-${crypto.randomUUID()}`;
      await execute(
        `INSERT INTO ai_voice_interactions (id, projectId, userId, userSpeechText, advisorResponseText, audioData, audioMimeType, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          interactionId,
          projectId,
          userId || 'guest',
          userSpeechText,
          parsed.spokenResponse,
          '',
          'audio/wav',
          timestamp
        ]
      );
    } catch (err) {
      console.warn('[VoiceAdvisor] Could not log voice interaction:', err);
    }

    return {
      spokenResponse: parsed.spokenResponse,
      bulletSummary: parsed.bulletSummary,
      relevantGraphNode: parsed.relevantGraphNode,
      suggestedFollowUps: parsed.suggestedFollowUps || [],
      timestamp
    };
  }
}
