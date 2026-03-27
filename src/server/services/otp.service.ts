/**
 * OTP Service — Email & WhatsApp verification
 * خدمة التحقق بالرمز — إيميل وواتساب
 */

let resend: any = null;
try {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require("resend");
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch {}

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP with 10-minute expiry
function storeOTP(key: string): string {
  const code = generateOTP();
  otpStore.set(key, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });
  return code;
}

// Verify OTP
export function verifyOTP(key: string, code: string): { valid: boolean; error?: string } {
  const record = otpStore.get(key);

  if (!record) {
    return { valid: false, error: "لم يتم إرسال رمز تحقق لهذا العنوان. أعد الإرسال." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, error: "انتهت صلاحية الرمز. أعد الإرسال." };
  }

  record.attempts++;
  if (record.attempts > 5) {
    otpStore.delete(key);
    return { valid: false, error: "تجاوزت عدد المحاولات المسموحة. أعد الإرسال." };
  }

  if (record.code !== code) {
    return { valid: false, error: `رمز غير صحيح. متبقي ${5 - record.attempts} محاولات.` };
  }

  // Valid — delete the OTP
  otpStore.delete(key);
  return { valid: true };
}

// Send OTP via Email
export async function sendEmailOTP(email: string): Promise<{ success: boolean; error?: string }> {
  const code = storeOTP(`email:${email}`);

  // If no API key or no resend instance, still store OTP (for testing, use code 123456)
  if (!resend) {
    // Dev mode: store a known code
    otpStore.set(`email:${email}`, {
      code: "123456",
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });
    console.log(`[DEV] OTP for ${email}: 123456`);
    return { success: true };
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "G-Ledger <onboarding@resend.dev>",
      to: email,
      subject: "رمز التحقق — G-Ledger",
      html: `
        <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #021544, #0070F2); color: white; display: inline-block; padding: 12px 20px; border-radius: 12px; font-size: 18px; font-weight: bold;">
              G-LEDGER
            </div>
          </div>
          <h2 style="color: #021544; text-align: center;">رمز التحقق</h2>
          <p style="color: #666; text-align: center;">أدخل الرمز التالي لإكمال التسجيل:</p>
          <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0070F2; font-family: monospace;">
              ${code}
            </span>
          </div>
          <p style="color: #999; text-align: center; font-size: 13px;">
            الرمز صالح لمدة 10 دقائق فقط.
            <br/>إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.
          </p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <span style="color: #ccc; font-size: 11px;">G-Ledger — المحاسب الذكي لكل القطاعات</span>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error.message);
    return { success: false, error: "فشل إرسال الرمز. حاول مرة أخرى." };
  }
}

// Send OTP via WhatsApp (using WhatsApp Business API or fallback)
export async function sendWhatsAppOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  const code = storeOTP(`whatsapp:${phone}`);

  // WhatsApp Business API (requires Meta Business verification)
  // For now, use a placeholder — you can integrate with:
  // 1. Meta WhatsApp Business API (official)
  // 2. Twilio WhatsApp
  // 3. UltraMsg
  // 4. CallMeBot (free for testing)

  const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
  const WHATSAPP_INSTANCE = process.env.WHATSAPP_INSTANCE;

  if (!WHATSAPP_API_KEY) {
    // Dev mode
    otpStore.set(`whatsapp:${phone}`, {
      code: "123456",
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });
    console.log(`[DEV] WhatsApp OTP for ${phone}: 123456`);
    return { success: true };
  }

  try {
    // UltraMsg API (affordable WhatsApp API)
    const message = `رمز التحقق الخاص بك في G-Ledger:\n\n*${code}*\n\nالرمز صالح لمدة 10 دقائق.\nلا تشارك هذا الرمز مع أحد.`;

    await fetch(`https://api.ultramsg.com/${WHATSAPP_INSTANCE}/messages/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: WHATSAPP_API_KEY,
        to: phone,
        body: message,
      }),
    });

    return { success: true };
  } catch (error: any) {
    console.error("WhatsApp send error:", error.message);
    return { success: false, error: "فشل إرسال الرمز عبر واتساب. حاول بالإيميل." };
  }
}
