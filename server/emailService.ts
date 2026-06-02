/**
 * Email Service — Bysis AI Orders notifications
 * Uses Manus built-in notification API to send emails to customers
 */
import { notifyOwner } from "./_core/notification";

export interface AiOrderEmailData {
  customerName: string;
  customerLastName: string;
  trackingCode: string;
  productName?: string | null;
  totalPrice: number;
  depositAmount: number;
  status: string;
  customerEmail?: string | null;
  adminNotes?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending_deposit: "⏳ في انتظار التسبقة",
  deposit_received: "✅ تم استلام التسبقة",
  confirmed: "✅ تم تأكيد الطلب",
  processing: "🔄 قيد المعالجة",
  shipped: "🚚 تم الشحن",
  delivered: "📦 تم التوصيل",
  cancelled: "❌ تم الإلغاء",
};

/**
 * Notify owner (admin) about a new AI order
 */
export async function notifyAdminNewAiOrder(order: AiOrderEmailData): Promise<void> {
  try {
    await notifyOwner({
      title: `🛒 طلب جديد من AI — ${order.customerName} ${order.customerLastName}`,
      content: `
**طلب جديد عبر Bysis AI**

👤 الاسم: ${order.customerName} ${order.customerLastName}
📦 المنتج: ${order.productName || "غير محدد"}
💰 المبلغ الإجمالي: ${(order.totalPrice / 100).toFixed(2)} د.ت
💳 التسبقة المطلوبة: ${(order.depositAmount / 100).toFixed(2)} د.ت
🔖 كود التتبع: ${order.trackingCode}

ادخل على لوحة التحكم لتأكيد أو رفض الطلب.
      `.trim(),
    });
  } catch (err) {
    console.error("[Email] Failed to notify admin:", err);
  }
}

/**
 * Build order confirmation email HTML for customer
 */
function buildOrderConfirmationEmail(order: AiOrderEmailData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; direction: rtl; }
.container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.header { background: linear-gradient(135deg, #E8192C, #FF6B00); padding: 30px; text-align: center; color: white; }
.header h1 { margin: 0; font-size: 28px; }
.header p { margin: 8px 0 0; opacity: 0.9; }
.body { padding: 30px; }
.tracking { background: #f8f9fa; border: 2px dashed #E8192C; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
.tracking .code { font-size: 32px; font-weight: bold; color: #E8192C; letter-spacing: 4px; }
.info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.info-label { color: #666; }
.info-value { font-weight: bold; color: #333; }
.payment-box { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0; }
.payment-box h3 { margin: 0 0 12px; color: #856404; }
.payment-method { background: white; border-radius: 6px; padding: 12px; margin: 8px 0; }
.footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 13px; }
.footer a { color: #FF6B00; text-decoration: none; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🛒 Bysis</h1>
    <p>تأكيد طلبك — شكراً على ثقتك فينا!</p>
  </div>
  <div class="body">
    <p>مرحباً <strong>${order.customerName} ${order.customerLastName}</strong> 👋</p>
    <p>تم استلام طلبك بنجاح. احفظ كود التتبع باش تتابع حالة كومندتك:</p>
    
    <div class="tracking">
      <div style="color:#666; margin-bottom:8px;">كود التتبع</div>
      <div class="code">${order.trackingCode}</div>
    </div>

    <div class="info-row">
      <span class="info-label">📦 المنتج</span>
      <span class="info-value">${order.productName || "منتج مخصص"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">💰 المبلغ الإجمالي</span>
      <span class="info-value">${(order.totalPrice / 100).toFixed(2)} د.ت</span>
    </div>
    <div class="info-row">
      <span class="info-label">💳 التسبقة المطلوبة (50%)</span>
      <span class="info-value" style="color:#E8192C;">${(order.depositAmount / 100).toFixed(2)} د.ت</span>
    </div>

    <div class="payment-box">
      <h3>💳 كيفاش تدفع التسبقة؟</h3>
      <div class="payment-method">
        <strong>🏦 Virement bancaire UIB</strong><br>
        RIB: <strong>12067000013314111448</strong><br>
        باسم: Nermin Mejrissi<br>
        <small>اذكر كود التتبع في خانة الوصف: <strong>${order.trackingCode}</strong></small>
      </div>
      <div class="payment-method">
        <strong>📮 Mandat minute La Poste</strong><br>
        في أي مكتب بريد تونسي<br>
        باسم: <strong>Nermine Mejressi — Monastir</strong><br>
        <small>اذكر كود التتبع: <strong>${order.trackingCode}</strong></small>
      </div>
      <p style="margin:12px 0 0; color:#856404; font-size:13px;">
        ⚠️ بعد الدفع، ارفع صورة الوصل في تطبيق Bysis تحت "طلباتي" أو أرسلها لنا على إنستغرام @sheinbysis2
      </p>
    </div>
  </div>
  <div class="footer">
    <p>Bysis — خدمة وسيط شراء تونسية</p>
    <p>إنستغرام: <a href="https://instagram.com/sheinbysis2">@sheinbysis2</a></p>
  </div>
</div>
</body>
</html>
  `.trim();
}

/**
 * Build status update email for customer
 */
function buildStatusUpdateEmail(order: AiOrderEmailData): string {
  const statusLabel = STATUS_LABELS[order.status] || order.status;
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; direction: rtl; }
.container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.header { background: linear-gradient(135deg, #E8192C, #FF6B00); padding: 30px; text-align: center; color: white; }
.body { padding: 30px; }
.status-badge { display: inline-block; background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 12px 24px; font-size: 20px; font-weight: bold; color: #0369a1; margin: 16px 0; }
.footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 13px; }
.footer a { color: #FF6B00; text-decoration: none; }
</style></head>
<body>
<div class="container">
  <div class="header"><h1>🛒 Bysis</h1><p>تحديث حالة طلبك</p></div>
  <div class="body">
    <p>مرحباً <strong>${order.customerName} ${order.customerLastName}</strong> 👋</p>
    <p>تم تحديث حالة طلبك <strong>${order.trackingCode}</strong>:</p>
    <div style="text-align:center;"><div class="status-badge">${statusLabel}</div></div>
    ${order.adminNotes ? `<p style="background:#f8f9fa;padding:12px;border-radius:8px;"><strong>ملاحظة:</strong> ${order.adminNotes}</p>` : ""}
    <p>تابع طلبك في أي وقت عبر تطبيق Bysis باستخدام كود التتبع: <strong>${order.trackingCode}</strong></p>
  </div>
  <div class="footer">
    <p>Bysis — إنستغرام: <a href="https://instagram.com/sheinbysis2">@sheinbysis2</a></p>
  </div>
</div>
</body>
</html>
  `.trim();
}

/**
 * Send order confirmation email to customer via Manus notification (owner gets it)
 * Note: In production, integrate with SendGrid/Resend for direct customer emails
 */
export async function sendOrderConfirmationToAdmin(order: AiOrderEmailData): Promise<void> {
  try {
    const html = buildOrderConfirmationEmail(order);
    await notifyOwner({
      title: `📧 إيميل تأكيد — ${order.customerName} ${order.customerLastName} (${order.trackingCode})`,
      content: `إيميل تأكيد الطلب جاهز للإرسال للعميل${order.customerEmail ? ` على: ${order.customerEmail}` : " (ما عندوش إيميل)"}.\n\nكود التتبع: ${order.trackingCode}\nالمبلغ: ${(order.totalPrice / 100).toFixed(2)} د.ت\nالتسبقة: ${(order.depositAmount / 100).toFixed(2)} د.ت`,
    });
  } catch (err) {
    console.error("[Email] Failed to send confirmation:", err);
  }
}

export async function sendStatusUpdateToAdmin(order: AiOrderEmailData): Promise<void> {
  try {
    const statusLabel = STATUS_LABELS[order.status] || order.status;
    await notifyOwner({
      title: `🔄 تحديث طلب ${order.trackingCode} — ${statusLabel}`,
      content: `تم تحديث حالة طلب ${order.customerName} ${order.customerLastName} (${order.trackingCode}) إلى: ${statusLabel}${order.adminNotes ? `\nملاحظة: ${order.adminNotes}` : ""}`,
    });
  } catch (err) {
    console.error("[Email] Failed to send status update:", err);
  }
}
