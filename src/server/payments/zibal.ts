/**
 * Zibal Payment Gateway Service for KASP
 * Production-ready integration for online payments via Shaparak.
 *
 * NOTE: Merchant ID and secrets are strictly retrieved from server environment variables.
 * Supports Fixed-IP Relay/Proxy architecture for cloud environments with dynamic outbound IPs.
 */

export interface ZibalPaymentRequestParams {
  orderId: string;
  amountInTomans: number;
  callbackUrl: string;
  description: string;
  mobile?: string;
}

export interface ZibalPaymentRequestResult {
  success: boolean;
  trackId?: string;
  paymentUrl?: string;
  result: number;
  message?: string;
  error?: string;
}

export interface ZibalVerifyParams {
  trackId: string | number;
  expectedAmountInTomans: number;
}

export interface ZibalVerifyResult {
  success: boolean;
  alreadyVerified?: boolean;
  refNumber?: string;
  paidAt?: string;
  cardNumber?: string;
  amountInTomans?: number;
  result: number;
  error?: string;
}

/**
 * Returns active Zibal operational mode: 'production' | 'sandbox'.
 * Respects ZIBAL_MODE environment variable. If unspecified, defaults based on ZIBAL_MERCHANT.
 */
export function getZibalMode(): 'production' | 'sandbox' {
  const mode = process.env.ZIBAL_MODE?.trim().toLowerCase();
  if (mode === 'sandbox') return 'sandbox';
  if (mode === 'production') return 'production';
  const merchant = process.env.ZIBAL_MERCHANT?.trim();
  return (merchant && merchant !== 'zibal') ? 'production' : 'sandbox';
}

/**
 * Returns Zibal Merchant ID strictly from server environment variables.
 * In sandbox mode, or if unset, defaults to official Zibal sandbox merchant 'zibal'.
 */
export function getZibalMerchant(): string {
  const mode = getZibalMode();
  if (mode === 'sandbox') {
    const merchant = process.env.ZIBAL_MERCHANT?.trim();
    return (merchant && merchant !== 'zibal') ? merchant : 'zibal';
  }
  const merchant = process.env.ZIBAL_MERCHANT?.trim();
  if (merchant) {
    return merchant;
  }
  return 'zibal';
}

/**
 * Returns the public Zibal Gateway URL where end-users are redirected to pay.
 * Default is the official Zibal gateway ('https://gateway.zibal.ir').
 */
export function getZibalGatewayPublicUrl(): string {
  const custom = process.env.ZIBAL_GATEWAY_URL?.trim();
  if (custom) {
    return custom.replace(/\/+$/, '');
  }
  return 'https://gateway.zibal.ir';
}

/**
 * Returns the backend API base URL for server-to-server calls (/v1/request, /v1/verify).
 * If a Fixed-IP Proxy or Relay URL is configured (ZIBAL_PROXY_URL or ZIBAL_FIXED_IP_URL),
 * outbound requests route through that static IP relay server.
 * Otherwise, routes directly to official gateway 'https://gateway.zibal.ir'.
 */
export function getZibalBaseUrl(): string {
  const customBase = process.env.ZIBAL_PROXY_URL || process.env.ZIBAL_FIXED_IP_URL || process.env.ZIBAL_API_BASE_URL;
  if (customBase?.trim()) {
    return customBase.trim().replace(/\/+$/, '');
  }
  return 'https://gateway.zibal.ir';
}

/**
 * Generates headers for outbound requests to Zibal or the Fixed-IP Proxy.
 * Sends authorization tokens if ZIBAL_PROXY_TOKEN is configured.
 */
function getZibalRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const proxyToken = process.env.ZIBAL_PROXY_TOKEN?.trim() || process.env.ZIBAL_RELAY_TOKEN?.trim();
  if (proxyToken) {
    headers['X-Proxy-Token'] = proxyToken;
    headers['Authorization'] = `Bearer ${proxyToken}`;
  }

  return headers;
}

/**
 * Strips sensitive credentials from a URL before displaying in status info.
 */
function sanitizePublicUrl(urlStr?: string | null): string | null {
  if (!urlStr) return null;
  try {
    const parsed = new URL(urlStr);
    if (parsed.password) {
      parsed.password = '****';
    }
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return urlStr.replace(/\/+$/, '');
  }
}

/**
 * Returns the current runtime Zibal configuration status (safe, no secret exposure).
 */
export function getZibalConfigStatus() {
  const mode = getZibalMode();
  const merchant = process.env.ZIBAL_MERCHANT?.trim();
  const isMerchantSet = Boolean(merchant && merchant !== 'zibal');
  const proxyUrl = (process.env.ZIBAL_PROXY_URL || process.env.ZIBAL_FIXED_IP_URL || process.env.ZIBAL_API_BASE_URL)?.trim();
  const hasFixedIpProxy = Boolean(proxyUrl);
  const hasProxyToken = Boolean(process.env.ZIBAL_PROXY_TOKEN?.trim() || process.env.ZIBAL_RELAY_TOKEN?.trim());
  const callbackUrl = process.env.ZIBAL_CALLBACK_URL?.trim();

  return {
    isConfigured: isMerchantSet,
    mode,
    merchantMasked: isMerchantSet ? `${merchant?.slice(0, 4)}****${merchant?.slice(-4)}` : 'zibal (تست)',
    hasFixedIpProxy,
    proxyUrl: hasFixedIpProxy ? sanitizePublicUrl(proxyUrl) : null,
    hasProxyToken,
    callbackUrl: callbackUrl || null,
    publicGatewayUrl: getZibalGatewayPublicUrl(),
    apiBaseUrl: sanitizePublicUrl(getZibalBaseUrl())
  };
}

/**
 * Maps Zibal response status codes to Persian human-readable messages.
 */
export function getZibalErrorMessage(code: number): string {
  switch (code) {
    case 100:
      return 'عملیات با موفقیت انجام شد.';
    case 102:
      return 'کد پذیرنده (merchant) یافت نشد یا در سیستم زیبال ثبت نشده است.';
    case 103:
      return 'درگاه پذیرنده غیرفعال است.';
    case 104:
      return 'کد پذیرنده یا آی‌پی (IP) ارسال‌کننده نامعتبر است یا در پنل زیبال تعریف نشده است.';
    case 105:
      return 'مبلغ پرداختی نامعتبر است (حداقل ۱۰۰۰ ریال).';
    case 106:
      return 'آدرس بازگشت (callbackUrl) نامعتبر است.';
    case 113:
      return 'مبلغ تراکنش از سقف مجاز بیشتر است.';
    case 201:
      return 'تراکنش قبلاً تأیید شده است.';
    case 202:
      return 'سفارش پرداخت نشده یا توسط کاربر در درگاه لغو گردیده است.';
    case 203:
      return 'شناسه تراکنش (trackId) نامعتبر است.';
    default:
      return `خطای درگاه زیبال با کد وضعیت ${code}`;
  }
}

/**
 * Initiates an online payment request to Zibal.
 * Converts Tomans to Rials as required by Iranian banking protocol (Shaparak).
 */
export async function requestZibalPayment(
  params: ZibalPaymentRequestParams
): Promise<ZibalPaymentRequestResult> {
  const merchant = getZibalMerchant();
  const apiBaseUrl = getZibalBaseUrl();
  const publicGatewayUrl = getZibalGatewayPublicUrl();

  // Zibal requires amount in Iranian Rials (1 Toman = 10 Rials)
  const amountInRials = Math.round(params.amountInTomans * 10);
  if (amountInRials < 1000) {
    return {
      success: false,
      result: 105,
      error: 'مبلغ سفارش کمتر از حداقل مجاز سیستم بانکی است.'
    };
  }

  const payload: Record<string, any> = {
    merchant,
    amount: amountInRials,
    callbackUrl: params.callbackUrl,
    description: params.description || `سفارش هوش تجاری KASP - ${params.orderId}`,
    orderId: params.orderId
  };

  if (params.mobile?.trim()) {
    payload.mobile = params.mobile.trim();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${apiBaseUrl}/v1/request`, {
      method: 'POST',
      headers: getZibalRequestHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[Zibal Payment] HTTP Error on request:', response.status, errorText);
      return {
        success: false,
        result: response.status,
        error: `خطای سرور زیبال (${response.status}). لطفاً دقایقی دیگر تلاش کنید.`
      };
    }

    const data = await response.json();

    if (data.result === 100 && data.trackId) {
      const trackIdStr = String(data.trackId);
      return {
        success: true,
        trackId: trackIdStr,
        paymentUrl: `${publicGatewayUrl}/start/${trackIdStr}`,
        result: data.result,
        message: data.message
      };
    } else {
      const errMsg = getZibalErrorMessage(Number(data.result)) || data.message || 'خطا در ثبت درخواست پرداخت در زیبال';
      console.warn('[Zibal Payment] Gateway request rejected:', data.result, errMsg, data.message);
      return {
        success: false,
        result: Number(data.result) || 0,
        message: data.message,
        error: errMsg
      };
    }
  } catch (err: any) {
    console.error('[Zibal Payment] Request exception:', err);
    if (err?.name === 'AbortError') {
      return {
        success: false,
        result: 504,
        error: 'پاسخی از درگاه زیبال در مهلت مجاز دریافت نشد (Timeout).'
      };
    }
    return {
      success: false,
      result: 500,
      error: 'خطا در برقراری ارتباط با درگاه پرداخت زیبال.'
    };
  }
}

/**
 * Verifies an initiated payment with Zibal.
 * Strictly verifies that the actual paid amount matches the order amount.
 */
export async function verifyZibalPayment(
  params: ZibalVerifyParams
): Promise<ZibalVerifyResult> {
  const merchant = getZibalMerchant();
  const apiBaseUrl = getZibalBaseUrl();

  const payload = {
    merchant,
    trackId: String(params.trackId)
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${apiBaseUrl}/v1/verify`, {
      method: 'POST',
      headers: getZibalRequestHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[Zibal Verify] HTTP error:', response.status, errorText);
      return {
        success: false,
        result: response.status,
        error: `خطای سرور زیبال در تأیید تراکنش (${response.status})`
      };
    }

    const data = await response.json();
    const resultCode = Number(data.result);

    // Code 100: Successfully verified
    // Code 201: Already verified (idempotent replay from Zibal)
    if (resultCode === 100 || resultCode === 201) {
      const paidAmountRials = Number(data.amount);
      const expectedAmountRials = Math.round(params.expectedAmountInTomans * 10);

      // STRICT AMOUNT VERIFICATION
      if (paidAmountRials !== expectedAmountRials) {
        console.error('[Zibal Verify] Amount mismatch! Paid:', paidAmountRials, 'Expected:', expectedAmountRials);
        return {
          success: false,
          result: resultCode,
          error: `عدم تطابق مبلغ تراکنش! مبلغ واریزی (${Math.round(paidAmountRials / 10)} تومان) با مبلغ سفارش (${params.expectedAmountInTomans} تومان) یکسان نیست.`
        };
      }

      return {
        success: true,
        alreadyVerified: resultCode === 201,
        refNumber: String(data.refNumber || ''),
        paidAt: data.paidAt || new Date().toISOString(),
        cardNumber: data.cardNumber || '',
        amountInTomans: Math.round(paidAmountRials / 10),
        result: resultCode
      };
    } else {
      const errMsg = getZibalErrorMessage(resultCode) || data.message || 'تراکنش توسط درگاه زیبال تایید نشد.';
      console.warn('[Zibal Verify] Verification rejected:', resultCode, errMsg, data.message);
      return {
        success: false,
        result: resultCode,
        error: errMsg
      };
    }
  } catch (err: any) {
    console.error('[Zibal Verify] Verify exception:', err);
    if (err?.name === 'AbortError') {
      return {
        success: false,
        result: 504,
        error: 'مهلت تأیید تراکنش در درگاه زیبال به پایان رسید.'
      };
    }
    return {
      success: false,
      result: 500,
      error: 'خطا در ارتباط با سرور زیبال جهت تأیید تراکنش.'
    };
  }
}
