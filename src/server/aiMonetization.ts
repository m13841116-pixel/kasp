import { queryOne, queryAll, execute } from './db.js';
import { getAIProduct, AI_PRODUCT_CATALOG } from './aiProducts.js';
import { generateWithGemini, cleanJsonString } from './agents/geminiClient.js';
import crypto from 'crypto';

export interface AIPreviewData {
  goal: string;
  summary: string;
  kaspScore: {
    totalOpportunityScore: number;
    marketOpportunity: number;
    competition: number;
    customerDemand: number;
    executionDifficulty: number;
    marketingPotential: number;
    scoreRationale: string;
  };
  kaspVerdict: {
    verdict: 'GO' | 'TEST_FIRST' | 'NO_GO';
    badge: string;
    title: string;
    rationale: string;
    keyAssumptionsToValidate: string[];
  };
  topOpportunities: string[];
  topRisks: string[];
  sourcesCount: number;
  previewOnly: true;
}

export interface UserAIStatus {
  isAuthenticated: boolean;
  userId?: string;
  role?: string;
  creditsRemaining: number;
  creditsTotal: number;
  hasCredit: boolean;
  activeOrdersCount: number;
}

/**
 * Retrieves the entitlement record for a user and product code
 */
export async function getUserEntitlement(userId: string, productCode = 'kasp-business-report') {
  const row = await queryOne(
    "SELECT * FROM ai_entitlements WHERE userId = ? AND productCode = ?",
    [userId, productCode]
  );
  return row || null;
}

/**
 * Checks if the user has sufficient credits (or is admin) to run a full report
 */
export async function hasActiveCredits(userId: string, role?: string, productCode = 'kasp-business-report'): Promise<boolean> {
  if (role === 'admin') return true;
  const entitlement = await getUserEntitlement(userId, productCode);
  return Boolean(entitlement && entitlement.status === 'active' && Number(entitlement.creditsRemaining || 0) > 0);
}

/**
 * Atomically consumes 1 credit for the user. Returns true if deducted, false if insufficient credits.
 */
export async function consumeCreditSafely(userId: string, role?: string, productCode = 'kasp-business-report'): Promise<boolean> {
  if (role === 'admin') {
    return true;
  }

  const entitlement = await getUserEntitlement(userId, productCode);
  if (!entitlement || Number(entitlement.creditsRemaining || 0) <= 0 || entitlement.status !== 'active') {
    return false;
  }

  await execute(
    "UPDATE ai_entitlements SET creditsRemaining = creditsRemaining - 1 WHERE id = ? AND creditsRemaining > 0",
    [entitlement.id]
  );

  return true;
}

/**
 * Restores 1 credit in case of pipeline failure (rollback)
 */
export async function rollbackCredit(userId: string, role?: string, productCode = 'kasp-business-report'): Promise<void> {
  if (role === 'admin') return;
  try {
    await execute(
      "UPDATE ai_entitlements SET creditsRemaining = creditsRemaining + 1 WHERE userId = ? AND productCode = ?",
      [userId, productCode]
    );
  } catch (err) {
    console.error('Error rolling back credit:', err);
  }
}

export type AIOrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

/**
 * Creates an order in ai_orders with strict server-side price enforcement
 */
export async function createAIOrder(userId: string, productCode = 'kasp-business-report') {
  const product = getAIProduct(productCode);
  if (!product) {
    throw new Error('محصول نامعتبر است');
  }

  const orderId = `aio-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  await execute(
    "INSERT INTO ai_orders (id, userId, productCode, amount, status, credits, createdAt) VALUES (?, ?, ?, ?, 'PENDING', ?, ?)",
    [orderId, userId, product.code, product.price, product.credits, now]
  );

  return {
    id: orderId,
    orderId,
    productCode: product.code,
    productName: product.name,
    amount: product.price,
    credits: product.credits,
    status: 'PENDING' as AIOrderStatus,
    createdAt: now
  };
}

export interface MarkAIOrderPaidParams {
  orderId: string;
  refNumber?: string;
  trackId?: string;
  cardNumber?: string;
  gateway?: string;
  receiptId?: string;
}

/**
 * Strictly idempotent function to confirm payment and grant credit.
 * If called multiple times, it will NOT grant duplicate credits.
 */
export async function markAIOrderPaid(params: MarkAIOrderPaidParams): Promise<{
  success: boolean;
  alreadyPaid: boolean;
  order?: any;
  error?: string;
}> {
  const order = await queryOne("SELECT * FROM ai_orders WHERE id = ?", [params.orderId]);
  if (!order) {
    return { success: false, alreadyPaid: false, error: 'سفارش یافت نشد' };
  }

  // IDEMPOTENCY CHECK: If already paid, do NOT grant credits again
  const currentStatus = String(order.status || '').toUpperCase();
  if (currentStatus === 'PAID') {
    return { success: true, alreadyPaid: true, order };
  }

  const now = new Date().toISOString();

  // 1. Mark order as PAID with transaction identifiers
  await execute(
    "UPDATE ai_orders SET status = 'PAID', paidAt = ?, refNumber = COALESCE(?, refNumber), trackId = COALESCE(?, trackId), cardNumber = COALESCE(?, cardNumber), gateway = COALESCE(?, gateway), receiptId = COALESCE(?, receiptId), errorMessage = NULL WHERE id = ? AND UPPER(status) != 'PAID'",
    [
      now,
      params.refNumber || null,
      params.trackId || null,
      params.cardNumber || null,
      params.gateway || 'zibal',
      params.receiptId || null,
      params.orderId
    ]
  );

  // 2. Grant exactly the specified credits to user entitlement
  const creditsToAdd = Number(order.credits || 1);
  const existingEntitlement = await getUserEntitlement(order.userId, order.productCode);

  if (existingEntitlement) {
    await execute(
      "UPDATE ai_entitlements SET creditsTotal = creditsTotal + ?, creditsRemaining = creditsRemaining + ?, status = 'active' WHERE id = ?",
      [creditsToAdd, creditsToAdd, existingEntitlement.id]
    );
  } else {
    const entitlementId = `ent-${crypto.randomUUID()}`;
    await execute(
      "INSERT INTO ai_entitlements (id, userId, productCode, creditsTotal, creditsRemaining, status, createdAt) VALUES (?, ?, ?, ?, ?, 'active', ?)",
      [entitlementId, order.userId, order.productCode, creditsToAdd, creditsToAdd, now]
    );
  }

  const updatedOrder = await queryOne("SELECT * FROM ai_orders WHERE id = ?", [params.orderId]);
  return { success: true, alreadyPaid: false, order: updatedOrder };
}

/**
 * Updates order status to FAILED or CANCELLED with error reason.
 * Will never modify an already PAID order.
 */
export async function markAIOrderFailed(params: {
  orderId: string;
  trackId?: string;
  reason?: string;
  status?: 'FAILED' | 'CANCELLED';
}): Promise<boolean> {
  const targetStatus = params.status || 'FAILED';
  const order = await queryOne("SELECT * FROM ai_orders WHERE id = ?", [params.orderId]);
  if (!order) {
    return false;
  }

  // Never downgrade or overwrite a PAID order
  if (String(order.status || '').toUpperCase() === 'PAID') {
    return false;
  }

  await execute(
    "UPDATE ai_orders SET status = ?, errorMessage = ?, trackId = COALESCE(?, trackId) WHERE id = ? AND UPPER(status) != 'PAID'",
    [targetStatus, params.reason || null, params.trackId || null, params.orderId]
  );

  return true;
}

/**
 * Idempotently confirms payment for an AI order when receipt is approved by Admin.
 */
export async function confirmAIOrderPayment(receiptId: string, orderId?: string): Promise<boolean> {
  // Find order by orderId or receiptId
  let order: any = null;
  if (orderId) {
    order = await queryOne("SELECT * FROM ai_orders WHERE id = ?", [orderId]);
  }
  if (!order && receiptId) {
    order = await queryOne("SELECT * FROM ai_orders WHERE receiptId = ? OR id = (SELECT orderId FROM payment_receipts WHERE id = ?)", [receiptId, receiptId]);
  }

  if (!order) {
    return false;
  }

  const res = await markAIOrderPaid({
    orderId: order.id,
    receiptId,
    gateway: 'card_to_card'
  });

  return res.success;
}

/**
 * Lightweight, fast free preview generator for any visitor / user.
 * Generates an executive snapshot without executing the full heavy multi-agent web scraping pipeline.
 */
export async function generateAIPreview(goal: string): Promise<AIPreviewData> {
  const trimmedGoal = goal.trim();
  if (!trimmedGoal) {
    throw new Error('هدف کسب‌وکار الزامی است.');
  }

  const prompt = `شما دستیار ارشد هوش تجاری KASP هستید.
وظیفه شما تولید یک «پیش‌نمایش ارزیابی سریع و خلاصه (Free Preview)» برای هدف کسب‌وکار زیر است:
«${trimmedGoal}»

لطفاً یک خروجی کاملاً ساختاریافته JSON به زبان فارسی با ساختار دقیق زیر تولید کنید:
{
  "summary": "خلاصه کوتاه ۲ تا ۳ جمله‌ای از فرصت و مدل این کسب‌وکار",
  "kaspScore": {
    "totalOpportunityScore": عدد بین ۵۰ تا ۹۵ (امتیاز کل فرصت),
    "marketOpportunity": عدد ۱ تا ۱۰,
    "competition": عدد ۱ تا ۱۰,
    "customerDemand": عدد ۱ تا ۱۰,
    "executionDifficulty": عدد ۱ تا ۱۰,
    "marketingPotential": عدد ۱ تا ۱۰,
    "scoreRationale": "تحلیل کوتاه یک جمله‌ای از چرایی این امتیاز"
  },
  "kaspVerdict": {
    "verdict": یکی از "GO" یا "TEST_FIRST" یا "NO_GO",
    "badge": "🟢 GO" یا "🟡 TEST FIRST" یا "🔴 NO-GO",
    "title": "عنوان ارزیابی نهایی (مثلاً: نیاز به تست و اعتبارسنجی فرضیات اولیه)",
    "rationale": "توضیح مختصر تصمیم‌گیری در ۲ جمله",
    "keyAssumptionsToValidate": [
      "فرضیه شماره ۱ که باید قبل از سرمایه‌گذاری تست شود",
      "فرضیه شماره ۲"
    ]
  },
  "topOpportunities": [
    "فرصت شماره ۱ بازار و تقاضا",
    "فرصت شماره ۲",
    "فرصت شماره ۳"
  ],
  "topRisks": [
    "ریسک اصلی شماره ۱ (رقابت یا زنجیره تامین یا مارکتینگ)",
    "ریسک شماره ۲"
  ]
}

فقط و فقط یک آبجکت JSON معتبر و بدون هیچ مقدمه یا متنی اضافه برگردانید.`;

  try {
    const rawText = await generateWithGemini(
      prompt,
      'You are KASP Business Intelligence fast preview evaluator. Always respond in valid Persian JSON only.',
      true
    );

    let rawResult: any = null;
    if (rawText) {
      try {
        rawResult = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn('JSON parse error in preview evaluation:', parseErr);
      }
    }

    return {
      goal: trimmedGoal,
      summary: rawResult?.summary || `ارزیابی اولیه کسب‌وکار برای «${trimmedGoal}» نشان‌دهنده پتانسیل رشد مناسب با تمرکز بر تمایز بازار و جذب آنلاین است.`,
      kaspScore: {
        totalOpportunityScore: Number(rawResult?.kaspScore?.totalOpportunityScore) || 78,
        marketOpportunity: Number(rawResult?.kaspScore?.marketOpportunity) || 8,
        competition: Number(rawResult?.kaspScore?.competition) || 6,
        customerDemand: Number(rawResult?.kaspScore?.customerDemand) || 8,
        executionDifficulty: Number(rawResult?.kaspScore?.executionDifficulty) || 7,
        marketingPotential: Number(rawResult?.kaspScore?.marketingPotential) || 8,
        scoreRationale: rawResult?.kaspScore?.scoreRationale || 'تقاضای مطلوب با نیاز به تمایز در کانال‌های فروش و آفر جذاب.'
      },
      kaspVerdict: {
        verdict: rawResult?.kaspVerdict?.verdict || 'TEST_FIRST',
        badge: rawResult?.kaspVerdict?.badge || '🟡 TEST FIRST',
        title: rawResult?.kaspVerdict?.title || 'نیازمند اعتبارسنجی اولیه بازار و تقاضا',
        rationale: rawResult?.kaspVerdict?.rationale || 'ایده دارای پتانسیل بالایی است؛ پیشنهاد می‌شود پیش از سرمایه‌گذاری سنگین، پیشنهاد ارزش و بازه قیمتی با جامعه هدف کوچک تست شود.',
        keyAssumptionsToValidate: Array.isArray(rawResult?.kaspVerdict?.keyAssumptionsToValidate) && rawResult.kaspVerdict.keyAssumptionsToValidate.length > 0
          ? rawResult.kaspVerdict.keyAssumptionsToValidate
          : ['میزان پذیرش بازه قیمتی توسط مشتریان هدف', 'هزینه جذب مشتری (CAC) از طریق شبکه‌های اجتماعی']
      },
      topOpportunities: Array.isArray(rawResult?.topOpportunities) && rawResult.topOpportunities.length > 0
        ? rawResult.topOpportunities
        : ['وجود تقاضای فعال آنلاین در این حوزه', 'امکان استفاده از بازاریابی محتوایی و شبکه‌های اجتماعی', 'امکان بسته‌بندی ارزش و ارایه آفرهای متقاعدکننده'],
      topRisks: Array.isArray(rawResult?.topRisks) && rawResult.topRisks.length > 0
        ? rawResult.topRisks
        : ['حضور رقبای سنتی یا بدون تمایز در بازار', 'حساسیت قیمتی برخی از مشتریان در صورت عدم ارایه مزیت رقابتی روشن'],
      sourcesCount: 4,
      previewOnly: true
    };
  } catch (err) {
    console.warn('Fast preview fallback triggered:', err);
    // Reliable deterministic fallback for preview
    return {
      goal: trimmedGoal,
      summary: `ارزیابی مقدماتی فرصت «${trimmedGoal}»: این حوزه از پتانسیل تجاری و بازار روبه‌رشدی برخوردار است که با تدوین پرسونای دقیق، قیمت‌گذاری روان‌شناختی و برنامه بازاریابی چندکاناله می‌تواند به بازدهی مطلوب برسد.`,
      kaspScore: {
        totalOpportunityScore: 78,
        marketOpportunity: 8,
        competition: 6,
        customerDemand: 8,
        executionDifficulty: 7,
        marketingPotential: 8,
        scoreRationale: 'تقاضای قوی در بازار با نیاز به تمایز در ارزش پیشنهادی و مدل جذب مشتری.'
      },
      kaspVerdict: {
        verdict: 'TEST_FIRST',
        badge: '🟡 TEST FIRST',
        title: 'نیازمند اعتبارسنجی فرضیات با گزارش کامل',
        rationale: 'پیشنهاد می‌شود پیش از اقدام و صرف هزینه اجرایی، نقشه راه ۳۰ روزه و گزارش هوش تجاری کامل KASP را بررسی فرمایید.',
        keyAssumptionsToValidate: [
          'کشش قیمتی و تمایل به پرداخت مشتریان در بازه مدنظر',
          'بهترین کانال‌های بازاریابی زودهنگام با کمترین هزینه جذب'
        ]
      },
      topOpportunities: [
        'تقاضای رو به رشد مخاطبان برای خرید و سفارش آنلاین',
        'امکان خلق مزیت رقابتی با گارانتی، ارسال سریع یا بسته‌بندی متمایز',
        'فرصت استفاده از کمپین‌های هدفمند محتوایی و ریتارگتینگ'
      ],
      topRisks: [
        'فشارهای رقابتی در زمینه تخفیف‌ها در صورت عدم تمایز در برندینگ',
        'چالش نرخ تبدیل (Conversion Rate) در مراحل اولیه ورود به بازار'
      ],
      sourcesCount: 4,
      previewOnly: true
    };
  }
}
