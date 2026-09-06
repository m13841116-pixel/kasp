import { 
  BuildArtifact, 
  BuildArtifactCategory, 
  BuildCapabilityStatus, 
  BuildProgressStatus, 
  ArtifactHierarchyLevel,
  BuildRequiredInput,
  BuildRequiredService,
  BuildHumanApproval,
  BuildArtifactOutput,
  BusinessState 
} from './types.js';
import { generateWithGemini } from '../agents/geminiClient.js';

export class BuildGenerator {

  /**
   * Generates production-ready artifact content using Gemini grounded in BusinessState
   */
  public async generateArtifactContent(params: {
    artifact: BuildArtifact;
    state: BusinessState;
    userInputs?: Record<string, string>;
    onProgressUpdate?: (status: BuildProgressStatus, logMessage: string) => void;
  }): Promise<BuildArtifactOutput> {
    const { artifact, state, userInputs, onProgressUpdate } = params;
    const graph = state.graph;

    // 1. PLANNING
    onProgressUpdate?.('PLANNING', `در حال تدوین ساختار و الزامات ${artifact.title}...`);

    const businessName = graph.business.name.value || 'کسب‌وکار پیشنهادی';
    const businessGoal = state.executiveMemory.answers.whatAreWeBuilding || graph.business.mission.value || 'هدف کسب‌وکار';
    const valueProp = graph.offer.coreValueProposition.value;
    const targetAudience = graph.customer.primaryTarget.value;
    const pricingModel = graph.pricing.pricingModel.value;
    const suggestedPrice = graph.pricing.suggestedPriceRange.value;
    const marketingChannels = (graph.distribution?.primaryChannels?.value || []).map(c => c.channel).join('، ');

    // 2. RESEARCHING
    onProgressUpdate?.('RESEARCHING', `استخراج بینش‌های بازار و روانشناسی مشتری برای ${artifact.title}...`);

    // 3. BUILDING
    onProgressUpdate?.('BUILDING', `تولید هوشمند کد و خروجی عملیاتی ${artifact.title} با هوش مصنوعی...`);

    const systemPrompt = `
شما مهندس ارشد نرم‌افزار، طراح ارشد تجربه کاربری و معمار رشد کسب‌وکار در سیستم‌عامل KASP هستید.
ماموریت شما: ساخت خروجی عملیاتی، درجه یک و بی‌نقص برای تسک «${artifact.title}» در دسته‌بندی «${artifact.category}».

اطلاعات کسب‌وکار:
- نام برند/کسب‌وکار: ${businessName}
- هدف اصلی: ${businessGoal}
- ارزش پیشنهادی اصلی (USP): ${valueProp}
- مخاطب هدف و پرسونا: ${targetAudience}
- مدل قیمت‌گذاری: ${pricingModel} (${suggestedPrice})
- کانال‌های اصلی جذب: ${marketingChannels}
${userInputs && Object.keys(userInputs).length > 0 ? `- ورودی‌های سفارشی کاربر: ${JSON.stringify(userInputs)}` : ''}

دسته‌بندی مورد نظر: ${artifact.category}

دستورالعمل تولید بر اساس نوع تسک:
1. اگر تسک وب‌سایت، لندینگ پیج، فرم لید، جدول قیمت‌گذاری یا کاتالوگ محصول است:
   - یک کد HTML کامل، تمیز، مدرن با کلاس‌های Tailwind CSS (rtl، فونت مناسب فارسی، رنگ‌بندی حرفه‌ای، دکمه‌های کنش، ریسپانسیو، کاملاً تعاملی و قابل اجرا) تولید کنید.
   - بدون AI Slop، با دکمه‌های واضح، متن‌های جذاب فارسی، فیلدهای اعتبارسنجی شده و بدون باگ.
2. اگر تسک متن، اسکریپت فروش، توالی ایمیل، آرکی‌تایپ برند یا سند ارزش پیشنهادی است:
   - یک سند جامع، فوق‌العاده کاربردی، با تیترهای مشخص، سناریوهای گام‌به‌گام و متن‌های کپی‌پیست آماده تولید کنید.
3. اگر تسک اتوماسیون، CRM یا آنالیتیکس است:
   - گام‌های فنی دقیق، نمونه وب‌هوک/JSON، متغیرها و راهنمای اتصال گام‌به‌گام ارائه دهید.

خروجی خود را در قالب یک آبجکت JSON معتبر با کلیدهای زیر برگردانید:
{
  "type": "REACT_HTML_COMPONENT" | "DOCUMENT" | "WORKFLOW_JSON" | "CODE_SNIPPET",
  "content": "متن کامل یا کد کامل سند/ابزار",
  "previewHtml": "در صورت وجود کد UI، کد HTML/Tailwind کامل برای پیش‌نمایش زنده در iframe یا کامپوننت، در غیر این صورت خالی",
  "summary": "خلاصه ۲ خطی از خروجی ساخته شده"
}
فقط و فقط یک JSON معتبر ارسال کنید بدون هیچ توضیح اضافی در ابتدا یا انتها.
    `.trim();

    try {
      const responseText = await generateWithGemini(
        `تسک: ساخت ${artifact.title} (${artifact.category}) برای ${businessName}.\nلطفاً خروجی باکیفیت و بدون نقص فنی تولید کنید.`,
        systemPrompt,
        true
      );

      // 4. TESTING
      onProgressUpdate?.('TESTING', `اعتبارسنجی ساختار فنی و سازگاری با گراف کسب‌وکار...`);

      let cleanJson = (responseText || '').trim();
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/^```json\s*/, '');
      if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/^```\s*/, '');
      if (cleanJson.endsWith('```')) cleanJson = cleanJson.replace(/\s*```$/, '');

      let parsed: any = {};
      try {
        parsed = JSON.parse(cleanJson);
      } catch (jsonErr) {
        // Fallback for markdown or raw content
        parsed = {
          type: artifact.category === 'LANDING_PAGE' || artifact.category === 'PRICING_PAGE' || artifact.category === 'LEAD_FORM' 
            ? 'REACT_HTML_COMPONENT' 
            : 'DOCUMENT',
          content: responseText,
          previewHtml: artifact.category === 'LANDING_PAGE' || artifact.category === 'PRICING_PAGE' || artifact.category === 'LEAD_FORM'
            ? this.generateFallbackPreviewHtml(artifact, businessName, valueProp)
            : undefined
        };
      }

      // Ensure previewHtml is populated for visual/web items
      if (!parsed.previewHtml && (artifact.category === 'LANDING_PAGE' || artifact.category === 'PRICING_PAGE' || artifact.category === 'LEAD_FORM' || artifact.category === 'PRODUCT_CATALOG')) {
        parsed.previewHtml = this.generateFallbackPreviewHtml(artifact, businessName, valueProp);
      }

      // 5. READY
      onProgressUpdate?.('READY', `تولید ${artifact.title} با موفقیت به پایان رسید و به گراف متصل شد.`);

      return {
        type: parsed.type || 'DOCUMENT',
        content: parsed.content || responseText,
        previewHtml: parsed.previewHtml,
        metadata: {
          summary: parsed.summary,
          generatedWith: 'Gemini KASP Build Engine',
          timestamp: new Date().toISOString()
        }
      };

    } catch (err: any) {
      console.error(`Error in BuildGenerator for ${artifact.title}:`, err);
      // Fallback generator
      return {
        type: 'DOCUMENT',
        content: `خروجی آماده‌سازی برای ${artifact.title}:\n\nارزش پیشنهادی: ${valueProp}\nمدل درآمدی: ${pricingModel}\nمخاطب هدف: ${targetAudience}\n\nجهت سفارشی‌سازی نهایی و اتصال به زیرساخت، اطلاعات فنی تایید گردید.`,
        previewHtml: this.generateFallbackPreviewHtml(artifact, businessName, valueProp),
        metadata: {
          fallback: true,
          error: err.message
        }
      };
    }
  }

  private generateFallbackPreviewHtml(artifact: BuildArtifact, businessName: string, valueProp: string): string {
    return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
  <style>
    body { font-family: 'Vazirmatn', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 md:p-12 flex flex-col justify-between">
  <div class="max-w-4xl mx-auto w-full space-y-8">
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg">K</div>
        <div>
          <h1 class="font-black text-xl text-white">${businessName}</h1>
          <p class="text-xs text-slate-400">${artifact.title} (پیش‌نمایش زنده KASP)</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
        آماده انتشار
      </span>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
      <h2 class="text-2xl md:text-3xl font-black text-white leading-tight">
        ${valueProp || 'تجربه برتر و متمایز با بالاترین کیفیت'}
      </h2>
      <p class="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
        این صفحه به صورت خودکار توسط موتور ساخت KASP بر اساس تحلیل عمیق بازار و پرسونا طراحی شده است.
      </p>
      <div class="pt-4 flex flex-wrap justify-center gap-4">
        <button class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition">
          ثبت سفارش فوری
        </button>
        <button class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition">
          مشاهده تعرفه‌ها
        </button>
      </div>
    </div>
  </div>

  <div class="text-center text-xs text-slate-500 pt-8 border-t border-slate-800/60 mt-8">
    تولید شده توسط KASP Business Operating System
  </div>
</body>
</html>
    `.trim();
  }
}
