import { AgentInterface, AgentInput, AgentResult, CompetitorAnalysisItem } from './types.js';
import { generateWithGemini } from './geminiClient.js';

export interface CompetitorOutput {
  competitors: CompetitorAnalysisItem[];
  marketOpportunities: string[];
}

export class CompetitorAgent implements AgentInterface<any, CompetitorOutput> {
  role = 'competitor' as const;
  name = 'کارشناس تحلیل رقبا (Competitor Agent)';
  instructions = `شما کارشناس تحلیل رقبا در تیم هوش مصنوعی KASP هستید. 
وظیفه شما شناسایی رقبای مستقیم و غیرمستقیم، تحلیل نقاط ضعف و قوت آن‌ها و یافتن فرصت‌های طلایی برای ایجاد تمایز است.
خروجی شما باید منحصراً با فرمت JSON باشد. از توضیحات اضافه خودداری کنید.`;

  async execute(input: AgentInput): Promise<AgentResult<CompetitorOutput>> {
    const startTime = Date.now();
    
    const prompt = `هدف کاربر: "${input.goal}"
حوزه فعالیت: "${input.businessDomain}"

لطفاً رقبای اصلی این کسب‌وکار را در بازار (ترجیحاً بازار ایران اگر مشخص نشده است) تحلیل کنید و خروجی را با فرمت JSON زیر ارائه دهید:

{
  "competitors": [
    {
      "name": "نام رقیب ۱",
      "strengths": "نقاط قوت اصلی",
      "weaknesses": "نقاط ضعف و شکایات مشتریان",
      "ourAdvantage": "مزیتی که ما می‌توانیم نسبت به آن‌ها ایجاد کنیم"
    }
  ],
  "marketOpportunities": [
    "فرصت تمایز ۱",
    "فرصت بکر در بازار ۲"
  ]
}`;

    try {
      const resp = await generateWithGemini(prompt, this.instructions, true);
      if (resp) {
        return {
          success: true,
          role: this.role,
          agentName: this.name,
          data: JSON.parse(resp),
          executionTimeMs: Date.now() - startTime,
        };
      }
    } catch (e) {
      console.warn('CompetitorAgent parsing error:', e);
    }

    // Fallback
    return {
      success: true,
      role: this.role,
      agentName: this.name,
      executionTimeMs: Date.now() - startTime,
      data: {
        competitors: [
          {
            name: 'رقبای سنتی و پیج‌های اینستاگرامی',
            strengths: 'ارتباط مستقیم با مخاطب',
            weaknesses: 'عدم شفافیت در قیمت و پروسه سفارش',
            ourAdvantage: 'فروشگاه حرفه‌ای با نماد اعتماد و فرآیند خرید اتوماتیک'
          }
        ],
        marketOpportunities: [
          'استفاده از محتوای اصیل و شفاف برای جلب اعتماد',
          'ارائه پشتیبانی سریع و ضمانت بازگشت وجه'
        ]
      }
    };
  }
}
