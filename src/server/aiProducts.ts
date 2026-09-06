export interface AIProduct {
  code: string;
  name: string;
  price: number; // in Tomans
  credits: number;
  description: string;
}

export const AI_PRODUCT_CATALOG: Record<string, AIProduct> = {
  'kasp-business-report': {
    code: 'kasp-business-report',
    name: 'گزارش هوش تجاری KASP',
    price: 490000,
    credits: 1,
    description: 'تحلیل جامع ایده/کسب‌وکار با تحقیق زنده وب، تحلیل بازار، رقبا، مشتریان، قیمت‌گذاری، بازاریابی، ریسک و برنامه ۳۰ روزه.'
  }
};

export function getAIProduct(code: string): AIProduct | null {
  return AI_PRODUCT_CATALOG[code] || null;
}

export function getAllAIProducts(): AIProduct[] {
  return Object.values(AI_PRODUCT_CATALOG);
}
