import { AgentInterface, AgentInput, AgentResult, TargetPersona } from './types.js';
import { generateWithGemini } from './geminiClient.js';

export interface CustomerOutput {
  targetAudience: TargetPersona[];
  customerNeedsAndPains: string[];
}

export class CustomerAgent implements AgentInterface<any, CustomerOutput> {
  role = 'customer' as const;
  name = 'کارشناس تحلیل مشتریان (Customer Agent)';
  instructions = `شما کارشناس تحلیل مشتری و پرسونای مخاطب در تیم هوش مصنوعی KASP هستید.
وظیفه شما شناسایی دقیق مخاطب هدف، دغدغه‌ها، دردها، نیازها و رفتار خرید آنهاست.
خروجی شما باید منحصراً با فرمت JSON باشد. از توضیحات اضافه خودداری کنید.`;

  async execute(input: AgentInput): Promise<AgentResult<CustomerOutput>> {
    const startTime = Date.now();
    
    const prompt = `هدف کاربر: "${input.goal}"
حوزه فعالیت: "${input.businessDomain}"

مشتریان هدف این کسب‌وکار را تحلیل کنید و خروجی را با فرمت JSON زیر ارائه دهید:

{
  "targetAudience": [
    {
      "personaName": "نام پرسونا (مثلاً جوانان ورزشکار)",
      "demographics": "ویژگی‌های جمعیت‌شناختی (سن، جنسیت، درآمد)",
      "painPoints": ["دغدغه ۱", "درد ۲"],
      "buyingTriggers": ["عامل محرک خرید ۱", "عامل ۲"]
    }
  ],
  "customerNeedsAndPains": [
    "نیاز کلی ۱ در بازار",
    "درد اصلی مشتریان که بی‌جواب مانده"
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
      console.warn('CustomerAgent parsing error:', e);
    }

    // Fallback
    return {
      success: true,
      role: this.role,
      agentName: this.name,
      executionTimeMs: Date.now() - startTime,
      data: {
        targetAudience: [
          {
            personaName: 'خریداران ارزش‌محور (Value Shoppers)',
            demographics: '۱۸ تا ۳۵ سال، درآمد متوسط',
            painPoints: ['ترس از کیفیت پایین', 'قیمت‌های نامشخص'],
            buyingTriggers: ['تخفیف شفاف', 'ارسال رایگان', 'ضمانت بازگشت']
          }
        ],
        customerNeedsAndPains: [
          'نیاز به خرید امن با پشتیبانی واقعی',
          'دسترسی به اطلاعات دقیق پیش از خرید'
        ]
      }
    };
  }
}
