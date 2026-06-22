import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createOrder, getAllOrders, getOrderById, updateOrderStatus, updateOrderNotes, updateOrderFull,
  getOrderByTrackingCode, getOrdersByClientId, getOrdersByUserId,
  searchOrdersByCustomerName, searchOrdersByPhone,
  getOrCreateConversation, addChatMessage, updateConversationCustomer,
  markConversationHasOrder, getAllConversations, getConversationMessages,
  getConversationBySessionId, clearConversationHistory,
  getSetting, setSetting,
  getAllArrivageItems, getAvailableArrivageItems, createArrivageItem, updateArrivageItem, deleteArrivageItem,
  saveCalculation, getCalculationHistory, getCalculationHistoryBySession,
  getCalculationHistoryByDevice, deleteCalculationById,
  getAllClients, getClientById, getClientByPhone, upsertClient, updateClientStatus, updateClientNotes, searchClients, incrementClientOrders,
  getAuditLogs, getAuditLogsByEntity, createAuditLog,
  getOrderStats,
  getUserByOpenId,
  getDb,
  getCarouselSlides, getActiveCarouselSlides, createCarouselSlide, updateCarouselSlide, deleteCarouselSlide,
  getAllCategories, getActiveCategories, createCategory, updateCategory, deleteCategory,
  getAllProducts, getActiveProducts, getProductsByCategory, getProductById, searchProducts,
  createProduct, updateProduct, deleteProduct, countProducts,
  createAiOrder, getAiOrderByTracking, getAiOrdersByUserId, getAllAiOrders,
  updateAiOrderStatus, updateAiOrderAdminNotes, updateAiOrderPaymentProof, searchAiOrdersByName,
} from "./db";
import {
  getActiveSliders, getAllSliders, getSliderById, createSlider, updateSlider, deleteSlider, toggleSliderActive,
} from "./db-sliders";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { transcribeAudio } from "./_core/voiceTranscription";
import { TRPCError } from "@trpc/server";
import { storagePut, storageGetSignedUrl } from "./storage";
import { parse as parseCookieHeader } from "cookie";
import crypto from "crypto";
import { savePushSubscription, sendPushToPhone } from "./pushNotifications";
import { notifyAdminNewAiOrder, sendOrderConfirmationToAdmin, sendStatusUpdateToAdmin } from "./emailService";

// Admin session cookie name (separate from Manus OAuth)
const ADMIN_COOKIE_NAME = "admin_session";

function getAdminSecret(): string {
  return process.env.JWT_SECRET || "bysis-fallback-secret";
}

function generateAdminToken(): string {
  const payload = `admin:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", getAdminSecret()).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${hmac}`;
}

function verifyAdminToken(token: string): boolean {
  if (!token || !token.includes(".")) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;
  try {
    const payload = Buffer.from(payloadB64, "base64").toString();
    if (!payload.startsWith("admin:")) return false;
    const expectedHmac = crypto.createHmac("sha256", getAdminSecret()).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedHmac, "hex"));
  } catch {
    return false;
  }
}

const customAdminProcedure = publicProcedure.use(({ ctx, next }) => {
  const cookieHeader = ctx.req.headers.cookie;
  const cookies = cookieHeader ? parseCookieHeader(cookieHeader) : {};
  const adminCookie = cookies[ADMIN_COOKIE_NAME] || "";
  if (!verifyAdminToken(adminCookie)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ===== Chatbot System Prompt v7 (Bysis AI — Multilingue: FR/AR/EN + Nike style) =====
function buildSystemPrompt(arrivageInfo: string, arrivageItems?: { name: string; priceTnd: number; platform: string; description?: string | null }[], isLoggedIn?: boolean): string {
  return `Tu es "Sisi" — l'assistant IA de Bysis, service d'achat en ligne tunisien depuis Shein, AliExpress et Temu.
Personnalité: Tunisienne authentique, amicale, intelligente, directe. Réponses courtes et claires — pas de blabla.

🏪 À propos de Bysis:
- Bysis aide les Tunisiens à acheter depuis Shein, AliExpress et Temu facilement et à prix justes
- Livraison dans toutes les gouvernorats de Tunisie
- Instagram: @sheinbysis2
- WhatsApp: +216 23 868 982

💰 Calcul du prix — Règle unique:
- Prix TND = Prix EUR × 4
- Exemples: 10€ = 40 DT | 15€ = 60 DT | 25€ = 100 DT | 50€ = 200 DT
- Si prix en $ (USD): convertir en EUR (1$ ≈ 0.92€) puis × 4
- Si prix en ¥ (CNY): convertir en EUR (1¥ ≈ 0.13€) puis × 4

📦 معلومات الأريفاج:
${arrivageItems && arrivageItems.length > 0
  ? arrivageItems.map(i => `- ${i.name} (${i.platform}) — ${i.priceTnd} دينار${i.description ? ` — ${i.description}` : ""}`).join("\n")
  : arrivageInfo || "ما عندناش معلومات أريفاج حالياً. تابع على إنستغرام @sheinbysis2"
}

🗣️ قواعد التحدث:
- Réponds TOUJOURS en français (langage simple, direct, tunisien)
- Accepte les messages en arabe, français et anglais — réponds TOUJOURS en français
- Réponses courtes (3-5 lignes max) — pas de blabla
- Utilise des emojis avec modération (1-2 par message)
- Jamais de langage soutenu ou formel
- Ne révèle pas la méthode de calcul ou les marges — si demandé, dis "C'est le secret du métier 😄"

📋 كلمات تونسية:
أريفاج=arrivage | كومند=commande | خلص=payer | قداش=combien | لينك=lien | برشا=beaucoup | باهي=d'accord | يزي=ça suffit | واش=est-ce que | نجم=je peux | بالصح=exactement | يعيشك=merci | حاجة=chose | مليحة=bien/belle

📸 لو العميل يرفع صورة منتوج — قواعد قراءة السعر:
1. السعر المشطوب (الأصلي): خذه
2. Retail Price / Prix original / السعر الأسود الكبير: خذه
3. لو في سعرين: خذ الأكبر دائماً
4. لو السعر بعد تخفيض فقط (-30%): احسب الأصلي = سعر التخفيض ÷ (1 - نسبة التخفيض)
5. لو ما شفتش سعر واضح: قول "ما نجمتش نقرأ السعر، ارسلي صورة أوضح"

🎯 بعد حساب السعر — الفورمات الإلزامي:
لازم ترد بهذا الفورمات بالضبط (لا تغير شيء):
[PRICE_RESULT]
💰 السعر النهائي: {السعر} د.ت

📦 المنتج: {اسم المنتج أو "منتج مخصص"}

✅ يشمل:
• ثمن المنتج
• الشحن
• العمولة

💳 طرق الدفع:
• دفع مسبق 50% من إجمالي الطلب
• تحويل بنكي UIB: RIB 12067000013314111448 — Nermin Mejrissi
  (اذكر اسمك وكود التتبع في الوصف)
• Mandat minute La Poste: باسم Nermine Mejressi — Monastir

⚠️ ملاحظة:
السعر قابل للتغيير في حالة تغيير سعر المورد أو الشحن.

لإتمام الطلب أرسل:
📱 الاسم واللقب
📍 الولاية والمعتمدية
📞 رقم الهاتف
[/PRICE_RESULT]
[PRICE_DATA]{"price_tnd": السعر_بالأرقام, "product_name": "اسم المنتج", "price_eur": السعر_بالأورو}[/PRICE_DATA]

🛒 بعد ما يرسل العميل معلوماته لإتمام الطلب:
${isLoggedIn
  ? `- العميل مسجل دخول ✅ — اجمع: الاسم + اللقب + الولاية + المعتمدية + رقم الهاتف
- لما تجمع كل المعلومات، رد بهذا الفورمات (ضروري تضمّن السعر والمنتج من حسابك السابق):
[ORDER_DATA]{"name":"الاسم","lastName":"اللقب","phone":"الرقم","gouvernorat":"الولاية","moatamadia":"المعتمدية","productUrl":"الرابط لو موجود","price_tnd":السعر_بالدينار,"product_name":"اسم المنتج","price_eur":السعر_بالأورو}[/ORDER_DATA]
⚠️ مهم جداً: price_tnd لازم يكون رقم (مثال: 120 وليس "120"). لو ما حسبتش السعر بعد، اطلب من العميل يرسل الرابط أو الصورة أول.`
  : `- العميل غير مسجل دخول ⚠️ — قوله:
"باش تعدي كومند، لازم تسجل دخول أول. اضغط على زر 'تسجيل الدخول' وبعدها ارجع نكملو 😊"
[REQUIRE_LOGIN]true[/REQUIRE_LOGIN]`
}

🔍 لو العميل يسأل على كومندته:
- قوله يعطيك اسمه الكامل أو رقم تلفونه أو كود التتبع
- لو أعطاك الاسم: [TRACK_NAME]الاسم[/TRACK_NAME]
- لو أعطاك التلفون: [TRACK_PHONE]الرقم[/TRACK_PHONE]
- لو أعطاك كود التتبع (يبدأ بـ BY): [TRACK_CODE]الكود[/TRACK_CODE]

🕐 لو يسأل على الأريفاج:
- رد بالمعلومات الموجودة أعلاه
- لو ما عندكش معلومة: "تابع على إنستغرام @sheinbysis2 باش تعرف آخر الأخبار 📲"

❌ ما تخترعش معلومات — لو ما تعرفش: "ما نعرفش بالضبط، تواصل معنا على إنستغرام @sheinbysis2 أو واتساب +216 23 868 982"`;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Custom admin authentication
  adminAuth: router({
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(({ input, ctx }) => {
        const validUsername = process.env.ADMIN_USERNAME;
        const validPassword = process.env.ADMIN_PASSWORD;
        if (!validUsername || !validPassword) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Admin credentials not configured" });
        }
        if (input.username !== validUsername || input.password !== validPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Nom d'utilisateur ou mot de passe incorrect" });
        }
        const token = generateAdminToken();
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(ADMIN_COOKIE_NAME, token, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });
        return { success: true };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    check: publicProcedure.query(({ ctx }) => {
      const cookieHeader = ctx.req.headers.cookie;
      const cookies = cookieHeader ? parseCookieHeader(cookieHeader) : {};
      const adminCookie = cookies[ADMIN_COOKIE_NAME] || "";
      return { isAdmin: verifyAdminToken(adminCookie) };
    }),
  }),

  // Calculator
  calculator: router({
    extractPrice: publicProcedure
      .input(z.object({ imageBase64: z.string(), model: z.string().default("auto"), deviceId: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { imageBase64 } = input;
        const systemPrompt = `You are a price extraction assistant for Shein, AliExpress, and Temu screenshots.

Your ONLY job: find the ORIGINAL / RETAIL price — the LARGEST number shown, whether strikethrough or not.

Rules:
1. If there are TWO prices (e.g. $8.46 and $9.00): ALWAYS pick the LARGER one ($9.00) — that is the retail/original price
2. If there is a "Retail Price" label, use that value
3. If there is only ONE price, use it
4. NEVER pick the discounted/sale/promotional price (the smaller colored price)
5. Convert the chosen price to EUROS (EUR):
   - USD ($): multiply by 0.92
   - EUR (€): keep as-is
   - CNY/RMB (¥): multiply by 0.13
   - GBP (£): multiply by 1.17
   - MAD: multiply by 0.092

detected_model:
- model1: two prices found — used the LARGER (retail) one
- model2: only one price visible
- model3: used labeled "Retail Price" or "Original Price"

IMPORTANT: Always return the LARGEST price visible. price_in_eur must be already converted to EUR.`;
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: [{ type: "image_url", image_url: { url: imageBase64, detail: "high" } }, { type: "text", text: "Extract the current selling price and convert it to EUR." }] },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "price_extraction", strict: true,
                schema: {
                  type: "object",
                  properties: {
                    price_in_eur: { type: "number" },
                    original_price: { type: "number" },
                    original_currency: { type: "string" },
                    confidence: { type: "string" },
                    detected_model: { type: "string" },
                  },
                  required: ["price_in_eur", "original_price", "original_currency", "confidence", "detected_model"],
                  additionalProperties: false,
                },
              },
            },
          });
          const rawContent = response.choices[0]?.message?.content;
          if (!rawContent) throw new Error("No response from AI");
          const contentStr = typeof rawContent === "string" ? rawContent :
            Array.isArray(rawContent) ? rawContent.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") : String(rawContent);
          const parsed = JSON.parse(contentStr);
          const priceInEuro = parsed.price_in_eur;
          const priceInTND = Math.round(priceInEuro * 4 * 100) / 100; // DZD rate
          const validModels = ["model1", "model2", "model3"];
          const detectedModel = validModels.includes(parsed.detected_model) ? parsed.detected_model : "model1";
          
          // Upload image to S3 (store URL, not base64 in DB)
          try {
            let savedImageUrl = "";
            try {
              const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
              const buffer = Buffer.from(base64Data, "base64");
              const ext = imageBase64.startsWith("data:image/png") ? "png" : "jpg";
              const uploadResult = await storagePut(`calculator/scan-${Date.now()}.${ext}`, buffer, `image/${ext}`);
              savedImageUrl = uploadResult.url;
            } catch (uploadErr) {
              console.warn("[Calculator] S3 upload failed, skipping history save:", uploadErr);
            }
            if (savedImageUrl) {
              await saveCalculation({
                imageUrl: savedImageUrl,
                originalPrice: parsed.original_price.toString(),
                originalCurrency: parsed.original_currency,
                priceEur: priceInEuro.toString(),
                priceTnd: priceInTND.toString(),
                deviceId: input.deviceId || null,
              });
            }
          } catch (err) {
            console.warn("[Calculator] Failed to save calculation:", err);
          }
          
          return { originalPrice: parsed.original_price, originalCurrency: parsed.original_currency, priceInTND, confidence: parsed.confidence, model: detectedModel };
        } catch (error: any) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to extract price: " + (error.message || "Unknown error") });
        }
      }),
    getHistory: publicProcedure
      .input(z.object({ deviceId: z.string().optional() }))
      .query(async ({ input }) => {
        try {
          if (input.deviceId) {
            return await getCalculationHistoryByDevice(input.deviceId, 50);
          }
          return await getCalculationHistory(50);
        } catch (error) {
          console.warn("[Calculator] Failed to get history:", error);
          return [];
        }
      }),
    deleteHistory: publicProcedure
      .input(z.object({ id: z.number(), deviceId: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await deleteCalculationById(input.id, input.deviceId);
          return { success: true };
        } catch (error) {
          console.warn("[Calculator] Failed to delete history:", error);
          return { success: false };
        }
      }),
  }),

  // Orders
  orders: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(2),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        gouvernorat: z.string().optional(),
        productLink: z.string().url(),
        quantity: z.number().int().min(1).default(1),
        notes: z.string().optional(),
        screenshotBase64: z.string().optional(),
        paymentReceiptBase64: z.string().optional(),
        paymentMethod: z.enum(["bank", "mandat"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        let screenshotUrl: string | null = null;
        let paymentReceiptUrl: string | null = null;
        if (input.paymentReceiptBase64) {
          try {
            const base64Data = input.paymentReceiptBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const ext = input.paymentReceiptBase64.startsWith("data:image/png") ? "png" : "jpg";
            const result = await storagePut(`orders/receipt-${Date.now()}.${ext}`, buffer, `image/${ext}`);
            paymentReceiptUrl = result.url;
          } catch (e) { console.error("[Storage] Receipt upload failed:", e); }
        }
        if (input.screenshotBase64) {
          try {
            const base64Data = input.screenshotBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const ext = input.screenshotBase64.startsWith("data:image/png") ? "png" : "jpg";
            const result = await storagePut(`orders/screenshot-${Date.now()}.${ext}`, buffer, `image/${ext}`);
            screenshotUrl = result.url;
          } catch (e) { console.error("[Storage] Screenshot upload failed:", e); }
        }
        // Generate unique tracking code: BSS-XXXXXXXX
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'BSS-';
        for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
        const created = await createOrder({
          customerName: input.customerName,
          customerPhone: input.customerPhone || null,
          trackingCode: code,
          customerAddress: input.customerAddress || null,
          gouvernorat: input.gouvernorat || null,
          productLink: input.productLink,
          quantity: input.quantity,
          size: null, color: null,
          notes: input.notes || null,
          screenshotUrl,
          paymentReceiptUrl,
          paymentMethod: input.paymentMethod || null,
          userId: ctx.user?.id || null,
        });
        try {
          await notifyOwner({
            title: "🛒 Nouvelle commande bysis",
            content: `Client: ${input.customerName}\nTel: ${input.customerPhone || "—"}\nGouvernorat: ${input.gouvernorat || "—"}\nAdresse: ${input.customerAddress || "—"}\nProduit: ${input.productLink}\nQté: ${input.quantity}\nCode: ${code}${input.notes ? `\nNotes: ${input.notes}` : ""}`,
          });
        } catch (e) { console.error("[Notification] Failed:", e); }
        return { success: true, trackingCode: code, orderId: created?.id };
      }),
    getByTrackingCode: publicProcedure
      .input(z.object({ trackingCode: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrderByTrackingCode(input.trackingCode.toUpperCase());
        if (!order) return null;
        return {
          id: order.id,
          trackingCode: order.trackingCode,
          customerName: order.customerName,
          status: order.status,
          gouvernorat: order.gouvernorat,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };
      }),
    list: customAdminProcedure.query(async () => getAllOrders()),
    getById: customAdminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const order = await getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      return order;
    }),
    updateStatus: customAdminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["new", "processing", "waiting_payment", "shipped", "arrived", "completed", "cancelled"]) }))
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.id, input.status);
        // Send push notification to customer if they have a subscription
        const order = await getOrderById(input.id);
        if (order?.customerPhone) {
          const statusLabels: Record<string, string> = {
            new: "📥 كومندتك وصلتنا!",
            processing: "⚙️ كومندتك قيد المعالجة",
            waiting_payment: "💳 كومندتك تنتظر الدفع",
            shipped: "🚚 كومندتك في الطريق!",
            arrived: "📦 كومندتك وصلت!",
            completed: "✅ كومندتك اكتملت!",
            cancelled: "❌ كومندتك تم إلغاؤها",
          };
          const statusMessages: Record<string, string> = {
            new: "سنتواصل معك قريباً لتأكيد التفاصيل.",
            processing: "نحن نعمل على تجهيز طلبك.",
            waiting_payment: "يرجى التواصل معنا لإتمام الدفع.",
            shipped: "طلبك في طريقه إليك. ترقب!",
            arrived: "طلبك وصل المخزن. سنتواصل معك للتسليم.",
            completed: "شكراً لثقتك في bysis! 🎉",
            cancelled: "للاستفسار تواصل معنا عبر الشات.",
          };
          await sendPushToPhone(order.customerPhone, {
            title: statusLabels[input.status] ?? "تحديث كومندتك",
            body: statusMessages[input.status] ?? "تم تحديث حالة طلبك.",
            icon: "/manus-storage/bysis-icon-192_ebf358be.png",
            badge: "/manus-storage/bysis-icon-192_ebf358be.png",
            url: "/track",
            tag: `order-${input.id}`,
          }).catch(() => {}); // don't fail if push fails
        }
        return { success: true };
      }),
    updateNotes: customAdminProcedure
      .input(z.object({ id: z.number(), adminNotes: z.string() }))
      .mutation(async ({ input }) => { await updateOrderNotes(input.id, input.adminNotes); return { success: true }; }),
    track: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        const results = await searchOrdersByCustomerName(input.query);
        return results.map(o => ({
          id: o.id,
          status: o.status,
          productUrl: o.productLink,
          quantity: o.quantity,
          createdAt: o.createdAt,
          screenshotUrl: o.screenshotUrl || null,
          customerName: o.customerName,
          customerPhone: o.customerPhone || null,
          customerAddress: o.customerAddress || null,
        }));
      }),
    trackByPhone: publicProcedure
      .input(z.object({ phone: z.string().min(1) }))
      .query(async ({ input }) => {
        const results = await searchOrdersByPhone(input.phone);
        return results.map(o => ({
          id: o.id,
          status: o.status,
          productUrl: o.productLink,
          quantity: o.quantity,
          createdAt: o.createdAt,
          screenshotUrl: o.screenshotUrl || null,
          customerName: o.customerName,
          customerPhone: o.customerPhone || null,
          customerAddress: o.customerAddress || null,
        }));
      }),
  }),

  // App settings (busy mode, arrivage info)
  settings: router({
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const value = await getSetting(input.key);
        return { value };
      }),
    set: customAdminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await setSetting(input.key, input.value);
        return { success: true };
      }),
  }),

  // Chatbot v3 - Super upgrade
  chatbot: router({
    sendMessage: publicProcedure
      .input(z.object({
        sessionId: z.string().min(1),
        messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
        imageBase64: z.string().optional(),
        audioBase64: z.string().optional(),
        fileBase64: z.string().optional(),
        fileName: z.string().optional(),
        isNewConversation: z.boolean().optional(),
        isLoggedIn: z.boolean().optional(),
        userId: z.string().optional(),
        userEmail: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Chatbot non configuré" });

        // Check busy mode
        const busyMode = await getSetting("busy_mode");
        if (busyMode === "true") {
          const busyMsg = await getSetting("busy_message") || "مرحبا! bysis مشغولة حالياً. سنرد عليك قريباً إن شاء الله 🙏 تقدر تتواصل معنا على إنستغرام @sheinbysis2";
          return { message: busyMsg, orderCreated: false, isBusy: true };
        }

        // Get arrivage info for context
        const arrivageInfo = await getSetting("arrivage_info") || "";
        let arrivageItemsList: { name: string; priceTnd: number; platform: string; description?: string | null }[] = [];
        try {
          arrivageItemsList = await getAvailableArrivageItems();
        } catch (e) { console.error("[Chatbot] Failed to load arrivage items:", e); }

        // Get or create conversation
        let conversation;
        try {
          conversation = await getOrCreateConversation(input.sessionId);
          // Notify admin on first message of new conversation
          if (input.isNewConversation) {
            notifyOwner({
              title: "💬 محادثة جديدة في الشات",
              content: `Session: ${input.sessionId.slice(0, 12)}...\nأول رسالة: ${input.messages[input.messages.length - 1]?.content?.slice(0, 100) || "—"}`,
            }).catch(() => {});
          }
        } catch (e) { console.error("[Chatbot] DB error:", e); }

        // Handle file uploads
        let imageUrl: string | null = null;
        let audioUrl: string | null = null;
        let fileUrl: string | null = null;
        let transcribedText: string | null = null;

        if (input.imageBase64) {
          try {
            const base64Data = input.imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const ext = input.imageBase64.startsWith("data:image/png") ? "png" : "jpg";
            const result = await storagePut(`chat/img-${Date.now()}.${ext}`, buffer, `image/${ext}`);
            imageUrl = result.url;
          } catch (e) { console.error("[Chatbot] Image upload error:", e); }
        }

        if (input.audioBase64) {
          try {
            const base64Data = input.audioBase64.replace(/^data:audio\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const result = await storagePut(`chat/audio-${Date.now()}.webm`, buffer, "audio/webm");
            audioUrl = result.url;
            // Transcribe audio — use signed S3 URL (storageGetSignedUrl returns an absolute URL)
            try {
              const signedAudioUrl = await storageGetSignedUrl(result.key);
              const transcription = await transcribeAudio({
                audioUrl: signedAudioUrl,
                // No language lock — auto-detect supports Tunisian Arabic, French, English, and mixed speech
                prompt: "Transcribe Tunisian dialect speech which may mix Arabic, French, and English words",
              });
              transcribedText = "text" in transcription ? transcription.text : "";
            } catch (e) { console.error("[Chatbot] Transcription error:", e); }
          } catch (e) { console.error("[Chatbot] Audio upload error:", e); }
        }

        if (input.fileBase64 && input.fileName) {
          try {
            const base64Data = input.fileBase64.replace(/^data:[^;]+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const result = await storagePut(`chat/file-${Date.now()}-${input.fileName}`, buffer, "application/octet-stream");
            fileUrl = result.url;
          } catch (e) { console.error("[Chatbot] File upload error:", e); }
        }

        // Store user message
        const lastUserMsg = input.messages[input.messages.length - 1];
        const userContent = transcribedText
          ? `[رسالة صوتية]: ${transcribedText}`
          : lastUserMsg?.content || "";

        if (conversation && lastUserMsg?.role === "user") {
          try {
            await addChatMessage(conversation.id, "user", userContent, imageUrl, null, audioUrl, fileUrl);
          } catch (e) { console.error("[Chatbot] Failed to store user message:", e); }
        }

        // Build messages for Claude
        const claudeMessages: any[] = input.messages.map((m, i) => {
          if (i === input.messages.length - 1 && m.role === "user" && input.imageBase64) {
            return {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: input.imageBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg", data: input.imageBase64.replace(/^data:image\/\w+;base64,/, "") } },
                { type: "text", text: m.content || "شوف هذي الصورة واحسبلي السعر بالدينار" },
              ],
            };
          }
          // Replace last message content with transcribed text if audio
          if (i === input.messages.length - 1 && transcribedText) {
            return { role: m.role, content: `[رسالة صوتية]: ${transcribedText}` };
          }
          return { role: m.role, content: m.content };
        });

        try {
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({
              model: "claude-sonnet-4-5",
              max_tokens: 1500,
              system: buildSystemPrompt(arrivageInfo, arrivageItemsList, input.isLoggedIn),
              messages: claudeMessages,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Chatbot] Claude API error:", response.status, errorText);
            throw new Error(`Claude API error: ${response.status}`);
          }

          const data = await response.json() as any;
          let assistantMessage = data.content?.[0]?.text || "معذرة، ما نجمتش نجاوبك. جرب مرة أخرى 🙏";

          // Parse PRICE_DATA (store for later order creation)
          let priceData: { price_tnd?: number; product_name?: string; price_eur?: number } | null = null;
          const priceDataMatch = assistantMessage.match(/\[PRICE_DATA\]([\s\S]*?)\[\/PRICE_DATA\]/);
          if (priceDataMatch) {
            try { priceData = JSON.parse(priceDataMatch[1]); } catch (e) { /* ignore */ }
            assistantMessage = assistantMessage.replace(/\[PRICE_DATA\][\s\S]*?\[\/PRICE_DATA\]/, "").trim();
          }

          // Parse PRICE_RESULT block — keep content, remove tags
          assistantMessage = assistantMessage.replace(/\[PRICE_RESULT\]([\s\S]*?)\[\/PRICE_RESULT\]/, "$1").trim();

          // Parse REQUIRE_LOGIN
          let requireLogin = false;
          if (assistantMessage.includes("[REQUIRE_LOGIN]true[/REQUIRE_LOGIN]")) {
            requireLogin = true;
            assistantMessage = assistantMessage.replace(/\[REQUIRE_LOGIN\]true\[\/REQUIRE_LOGIN\]/, "").trim();
          }

          // Handle order creation
          let orderCreated = false;
          let orderTrackingCode: string | null = null;
          const orderMatch = assistantMessage.match(/\[ORDER_DATA\]([\s\S]*?)\[\/ORDER_DATA\]/);
          if (orderMatch) {
            try {
              const orderData = JSON.parse(orderMatch[1]);
              // Generate tracking code BY + timestamp
              orderTrackingCode = `BY${Date.now().toString(36).toUpperCase()}`;
              const fullName = `${orderData.name || ""} ${orderData.lastName || ""}`.trim();
              const address = [orderData.gouvernorat, orderData.moatamadia].filter(Boolean).join(" — ");
              // Use price from ORDER_DATA first (AI includes it), fallback to priceData from same message
              const priceTnd = (orderData.price_tnd && Number(orderData.price_tnd) > 0)
                ? Number(orderData.price_tnd)
                : (priceData?.price_tnd || null);
              const productNameFinal = orderData.product_name || priceData?.product_name || null;
              const depositAmount = priceTnd ? Math.ceil(priceTnd * 0.5) : null;

              // Create in ai_orders table
              try {
                const nameParts = fullName.split(" ");
                const firstName = nameParts[0] || fullName;
                const lastName = nameParts.slice(1).join(" ") || "";
                await createAiOrder({
                  customerName: firstName,
                  customerLastName: lastName,
                  phone: orderData.phone || null,
                  email: input.userEmail || null,
                  gouvernorat: orderData.gouvernorat || null,
                  moatamadia: orderData.moatamadia || null,
                  productUrl: orderData.productUrl || null,
                  productName: productNameFinal,
                  totalPrice: priceTnd || 0,
                  depositAmount: depositAmount || 0,
                  productImageUrl: imageUrl || null,
                  userId: input.userId ? parseInt(input.userId) : null,
                  status: "pending_deposit",
                });
              } catch (e) { console.error("[Chatbot] ai_orders insert error:", e); }

              // Also create in main orders table for CRM
              await createOrder({
                customerName: fullName,
                customerPhone: orderData.phone || null,
                customerAddress: address || null,
                productLink: orderData.productUrl || null,
                quantity: 1,
                size: null, color: null,
                notes: `كومند من الشات AI | كود: ${orderTrackingCode}${priceTnd ? ` | السعر: ${priceTnd} د.ت` : ""}`,
                screenshotUrl: imageUrl,
                userId: null,
              });

              orderCreated = true;
              if (conversation) {
                await markConversationHasOrder(conversation.id);
                await updateConversationCustomer(conversation.id, fullName, orderData.phone);
              }

              // Notify admin
              notifyOwner({
                title: "🛒 كومند جديدة من الشات AI",
                content: `Client: ${fullName}\nTel: ${orderData.phone || "—"}\nAdresse: ${address || "—"}\nPrix: ${priceTnd ? priceTnd + " د.ت" : "—"}\nAcompte: ${depositAmount ? depositAmount + " د.ت" : "—"}\nCode: ${orderTrackingCode}`,
              }).catch(() => {});

              // Send email to admin
              const nameParts2 = fullName.split(" ");
              notifyAdminNewAiOrder({
                trackingCode: orderTrackingCode,
                customerName: nameParts2[0] || fullName,
                customerLastName: nameParts2.slice(1).join(" ") || "",
                productName: priceData?.product_name || null,
                totalPrice: priceTnd || 0,
                depositAmount: depositAmount || 0,
                status: "pending_deposit",
                customerEmail: input.userEmail || null,
              }).catch(() => {});

              // Replace ORDER_DATA with confirmation message
              const confirmMsg = `\n\n✅ تسجلت كومندتك!\n🔑 كود التتبع: **${orderTrackingCode}**\n💰 التسبقة: **${depositAmount || "—"} د.ت**\n\nارفع صورة وصل الدفع هنا بعد ما تخلص 📸`;
              assistantMessage = assistantMessage.replace(/\[ORDER_DATA\][\s\S]*?\[\/ORDER_DATA\]/, confirmMsg).trim();
            } catch (e) {
              console.error("[Chatbot] Order creation error:", e);
              assistantMessage = assistantMessage.replace(/\[ORDER_DATA\][\s\S]*?\[\/ORDER_DATA\]/, "").trim();
            }
          } else {
            assistantMessage = assistantMessage.replace(/\[ORDER_DATA\][\s\S]*?\[\/ORDER_DATA\]/, "").trim();
          }

          // Return requireLogin flag
          if (requireLogin) {
            return { message: assistantMessage, orderCreated: false, isBusy: false, requireLogin: true, orderTrackingCode: null };
          }

          // Handle order tracking by name
          const trackNameMatch = assistantMessage.match(/\[TRACK_NAME\](.*?)\[\/TRACK_NAME\]/);
          if (trackNameMatch) {
            const searchName = trackNameMatch[1].trim();
            const foundOrders = await searchOrdersByCustomerName(searchName);
            let trackInfo = "";
            if (foundOrders.length === 0) {
              trackInfo = `ما لقيناش كومند باسم "${searchName}". تأكد من الاسم ولا تواصل معنا على إنستغرام.`;
            } else {
              const statusMap: Record<string, string> = {
                new: "🆕 جديدة — في الانتظار",
                processing: "⚙️ في المعالجة",
                waiting_payment: "💳 تستنى الدفع",
                shipped: "🚢 في الطريق",
                arrived: "📦 وصلت للمخزن",
                completed: "✅ تسلمت",
                cancelled: "❌ ملغية",
              };
              trackInfo = foundOrders.slice(0, 3).map(o =>
                `📋 كومند #${o.id}: ${statusMap[o.status] || o.status}`
              ).join("\n");
            }
            assistantMessage = assistantMessage.replace(/\[TRACK_NAME\].*?\[\/TRACK_NAME\]/, trackInfo).trim();
          }

          // Handle order tracking by phone
          const trackPhoneMatch = assistantMessage.match(/\[TRACK_PHONE\](.*?)\[\/TRACK_PHONE\]/);
          if (trackPhoneMatch) {
            const searchPhone = trackPhoneMatch[1].trim();
            const foundOrders = await searchOrdersByPhone(searchPhone);
            let trackInfo = "";
            if (foundOrders.length === 0) {
              trackInfo = `ما لقيناش كومند بهذا الرقم "${searchPhone}". تأكد من الرقم ولا تواصل معنا على إنستغرام.`;
            } else {
              const statusMap: Record<string, string> = {
                new: "🆕 جديدة", processing: "⚙️ في المعالجة", waiting_payment: "💳 تستنى الدفع",
                shipped: "🚢 في الطريق", arrived: "📦 وصلت للمخزن", completed: "✅ تسلمت", cancelled: "❌ ملغية",
              };
              trackInfo = foundOrders.slice(0, 3).map(o =>
                `📋 كومند #${o.id}: ${statusMap[o.status] || o.status}`
              ).join("\n");
            }
            assistantMessage = assistantMessage.replace(/\[TRACK_PHONE\].*?\[\/TRACK_PHONE\]/, trackInfo).trim();
          }

          // Store assistant message
          if (conversation) {
            try {
              await addChatMessage(conversation.id, "assistant", assistantMessage);
            } catch (e) { console.error("[Chatbot] Failed to store assistant message:", e); }
          }

          return { message: assistantMessage, orderCreated, isBusy: false, orderTrackingCode: orderTrackingCode || null };
        } catch (error: any) {
          console.error("[Chatbot] Error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur du chatbot: " + (error.message || "Erreur inconnue") });
        }
      }),

    // Transcribe audio only (for voice messages)
    transcribeAudio: publicProcedure
      .input(z.object({ audioBase64: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const base64Data = input.audioBase64.replace(/^data:audio\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          const result = await storagePut(`chat/audio-${Date.now()}.webm`, buffer, "audio/webm");
          const signedUrl = await storageGetSignedUrl(result.key);
          const transcription = await transcribeAudio({
            audioUrl: signedUrl,
            // No language lock — auto-detect supports Tunisian Arabic, French, English, and mixed speech
            prompt: "Transcribe Tunisian dialect speech which may mix Arabic, French, and English words",
          });
          return { text: "text" in transcription ? transcription.text : "" };
        } catch (error: any) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Transcription failed: " + error.message });
        }
      }),

    // Public - get current session's conversation history
    getMyHistory: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const conv = await getConversationBySessionId(input.sessionId);
        if (!conv) return { conversation: null, messages: [] };
        const messages = await getConversationMessages(conv.id);
        return { conversation: conv, messages };
      }),

    // Public - clear current session's conversation history
    clearMyHistory: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        await clearConversationHistory(input.sessionId);
        return { success: true };
      }),

    // Admin - list all conversations
    listConversations: customAdminProcedure.query(async () => getAllConversations()),

    // Admin - get messages for a conversation
    getMessages: customAdminProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => getConversationMessages(input.conversationId)),
  }),

  // ===== Arrivage =====
  arrivage: router({
    // Public: list available items
    list: publicProcedure.query(async () => getAvailableArrivageItems()),

    // Admin: list all items (including unavailable)
    listAll: customAdminProcedure.query(async () => getAllArrivageItems()),

    // Admin: create item with optional image upload
    create: customAdminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        priceTnd: z.number().int().min(1),
        priceEur: z.number().int().optional(),
        platform: z.enum(["shein", "aliexpress", "temu"]).default("shein"),
        available: z.number().int().default(1),
        productLink: z.string().optional(),
        imageBase64: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        let imageUrl: string | null = null;
        if (input.imageBase64) {
          try {
            const base64Data = input.imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const ext = input.imageBase64.startsWith("data:image/png") ? "png" : "jpg";
            const result = await storagePut(`arrivage/img-${Date.now()}.${ext}`, buffer, `image/${ext}`);
            imageUrl = result.url;
          } catch (e) { console.error("[Arrivage] Image upload error:", e); }
        }
        await createArrivageItem({
          name: input.name,
          description: input.description || null,
          priceTnd: input.priceTnd,
          priceEur: input.priceEur || null,
          platform: input.platform,
          available: input.available,
          productLink: input.productLink || null,
          imageUrl,
        });
        return { success: true };
      }),

    // Admin: update item
    update: customAdminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        priceTnd: z.number().int().min(1).optional(),
        priceEur: z.number().int().optional(),
        platform: z.enum(["shein", "aliexpress", "temu"]).optional(),
        available: z.number().int().optional(),
        productLink: z.string().optional(),
        imageBase64: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, imageBase64, ...rest } = input;
        const updates: any = { ...rest };
        if (imageBase64) {
          try {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const ext = imageBase64.startsWith("data:image/png") ? "png" : "jpg";
            const result = await storagePut(`arrivage/img-${Date.now()}.${ext}`, buffer, `image/${ext}`);
            updates.imageUrl = result.url;
          } catch (e) { console.error("[Arrivage] Image upload error:", e); }
        }
        await updateArrivageItem(id, updates);
        return { success: true };
      }),

    // Admin: delete item
    delete: customAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteArrivageItem(input.id);
        return { success: true };
      }),
  }),

  // ===== Analytics =====
  analytics: router({
    getStats: customAdminProcedure.query(async () => {
      return await getOrderStats();
    }),
  }),

  // ===== CRM - Clients =====
  crm: router({
    list: customAdminProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ input }) => {
        if (input?.search) return await searchClients(input.search);
        return await getAllClients();
      }),
    getById: customAdminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const client = await getClientById(input.id);
        if (!client) throw new TRPCError({ code: "NOT_FOUND" });
        const orders = await getOrdersByClientId(input.id);
        return { client, orders };
      }),
    updateStatus: customAdminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["active", "banned", "suspended"]), reason: z.string().optional() }))
      .mutation(async ({ input }) => {
        const client = await getClientById(input.id);
        if (!client) throw new TRPCError({ code: "NOT_FOUND" });
        await updateClientStatus(input.id, input.status);
        await createAuditLog({
          adminName: "Admin",
          action: `client_${input.status}`,
          entityType: "client",
          entityId: input.id,
          oldValue: client.accountStatus,
          newValue: input.status,
          description: input.reason || `Statut changé en ${input.status}`,
        });
        return { success: true };
      }),
    updateNotes: customAdminProcedure
      .input(z.object({ id: z.number(), notes: z.string() }))
      .mutation(async ({ input }) => {
        await updateClientNotes(input.id, input.notes);
        return { success: true };
      }),
    requestVerification: customAdminProcedure
      .input(z.object({ clientId: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { clients } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.update(clients).set({ requiresVerification: 1, verificationReason: input.reason }).where(eq(clients.id, input.clientId));
        await createAuditLog({
          adminName: "Admin",
          action: "request_verification",
          entityType: "client",
          entityId: input.clientId,
          newValue: input.reason,
          description: `Vérification demandée: ${input.reason}`,
        });
        return { success: true };
      }),
  }),

  // ===== Audit Logs =====
  auditLog: router({
    list: customAdminProcedure
      .input(z.object({ limit: z.number().int().max(200).default(100) }).optional())
      .query(async ({ input }) => await getAuditLogs(input?.limit ?? 100)),
    getByEntity: customAdminProcedure
      .input(z.object({ entityType: z.string(), entityId: z.number() }))
      .query(async ({ input }) => await getAuditLogsByEntity(input.entityType, input.entityId)),
  }),

  // ===== User Profile (for logged-in clients) =====
  userProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByOpenId(ctx.user.openId);
      return user || null;
    }),
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        gouvernorat: z.string().optional(),
        avatarUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await (await import("./db")).getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const updates: Record<string, unknown> = {};
        if (input.name !== undefined) updates.name = input.name;
        if (input.phone !== undefined) updates.phone = input.phone;
        if (input.address !== undefined) updates.address = input.address;
        if (input.gouvernorat !== undefined) updates.gouvernorat = input.gouvernorat;
        if (input.avatarUrl !== undefined) updates.avatarUrl = input.avatarUrl;
        if (Object.keys(updates).length > 0) {
          await db.update(users).set(updates).where(eq(users.openId, ctx.user.openId));
        }
        // Also upsert client record if phone provided
        if (input.phone) {
          await upsertClient({
            name: input.name || ctx.user.name || "Client",
            phone: input.phone,
            email: ctx.user.email || undefined,
            address: input.address || undefined,
            gouvernorat: input.gouvernorat || undefined,
            userId: ctx.user.id,
          });
        }
        return { success: true };
      }),
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const orders = await getOrdersByUserId(ctx.user.id);
      return orders;
    }),
  }),

  // ===== Orders - Extended admin actions =====
  ordersAdmin: router({
    updateFull: customAdminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "processing", "waiting_payment", "shipped", "arrived", "completed", "cancelled"]).optional(),
        adminNotes: z.string().optional(),
        rejectionReason: z.string().optional(),
        requiresVerification: z.number().int().optional(),
        verificationReason: z.string().optional(),
        costTnd: z.number().int().optional(),
        profitTnd: z.number().int().optional(),
        platform: z.enum(["shein", "aliexpress", "temu"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const order = await getOrderById(id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        await updateOrderFull(id, updates as any);
        // Log the action
        if (updates.status && updates.status !== order.status) {
          await createAuditLog({
            adminName: "Admin",
            action: "order_status_change",
            entityType: "order",
            entityId: id,
            oldValue: order.status,
            newValue: updates.status,
            description: updates.rejectionReason ? `Raison: ${updates.rejectionReason}` : undefined,
          });
          // Send push notification
          if (order.customerPhone) {
            const statusLabels: Record<string, string> = {
              new: "📥 كومندتك وصلتنا!", processing: "⚙️ كومندتك قيد المعالجة",
              waiting_payment: "💳 كومندتك تنتظر الدفع", shipped: "🚚 كومندتك في الطريق!",
              arrived: "📦 كومندتك وصلت!", completed: "✅ كومندتك اكتملت!",
              cancelled: "❌ كومندتك تم إلغاؤها",
            };
            const { sendPushToPhone } = await import("./pushNotifications");
            sendPushToPhone(order.customerPhone, {
              title: statusLabels[updates.status] ?? "تحديث كومندتك",
              body: updates.rejectionReason || "تم تحديث حالة طلبك.",
              url: "/track",
              tag: `order-${id}`,
            }).catch(() => {});
          }
        }
        if (updates.requiresVerification === 1) {
          await createAuditLog({
            adminName: "Admin",
            action: "request_verification",
            entityType: "order",
            entityId: id,
            newValue: updates.verificationReason || "Vérification requise",
          });
        }
        return { success: true };
      }),
    newOrdersCount: customAdminProcedure.query(async () => {
      const all = await getAllOrders();
      return { count: all.filter(o => o.status === "new").length };
    }),
  }),

  // ===== Carousel Slides =====
  carousel: router({
    // Public: get active slides for homepage
    list: publicProcedure.query(async () => {
      const slides = await getActiveCarouselSlides();
      if (!slides || slides.length === 0) {
        // Default fallback slides when DB is empty
        return [
          {
            id: 1, title: 'Organisez-vous', subtitle: 'Découvrez les meilleures ventes',
            bgColor: '#F5C518', textColor: '#1A1A1A', imageUrl: null,
            card1Label: 'Commander', card1Image: null, card1Link: '/order',
            card2Label: 'Arrivages', card2Image: null, card2Link: '/arrivage',
            card3Label: 'Suivre', card3Image: null, card3Link: '/track',
            card4Label: 'Calculer', card4Image: null, card4Link: '/calculator',
            displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date(),
          },
          {
            id: 2, title: 'Nos meilleurs arrivages', subtitle: 'Vêtements, chaussures, accessoires',
            bgColor: '#1A6B3C', textColor: '#FFFFFF', imageUrl: null,
            card1Label: 'Mode', card1Image: null, card1Link: '/arrivage',
            card2Label: 'Maison', card2Image: null, card2Link: '/arrivage',
            card3Label: 'Accessoires', card3Image: null, card3Link: '/arrivage',
            card4Label: 'Tout voir', card4Image: null, card4Link: '/arrivage',
            displayOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date(),
          },
          {
            id: 3, title: 'Mode & Style', subtitle: 'Les tendances à petits prix',
            bgColor: '#E53E3E', textColor: '#FFFFFF', imageUrl: null,
            card1Label: 'Femme', card1Image: null, card1Link: '/catalogue',
            card2Label: 'Homme', card2Image: null, card2Link: '/catalogue',
            card3Label: 'Enfant', card3Image: null, card3Link: '/catalogue',
            card4Label: 'Catalogue', card4Image: null, card4Link: '/catalogue',
            displayOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date(),
          },
        ];
      }
      return slides;
    }),
    // Admin: get all slides
    adminList: customAdminProcedure.query(async () => {
      return await getCarouselSlides();
    }),
    // Admin: create slide
    create: customAdminProcedure
      .input(z.object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        bgColor: z.string().default("#E8192C"),
        textColor: z.string().default("#ffffff"),
        imageUrl: z.string().optional(),
        card1Label: z.string().optional(), card1Image: z.string().optional(), card1Link: z.string().optional(),
        card2Label: z.string().optional(), card2Image: z.string().optional(), card2Link: z.string().optional(),
        card3Label: z.string().optional(), card3Image: z.string().optional(), card3Link: z.string().optional(),
        card4Label: z.string().optional(), card4Image: z.string().optional(), card4Link: z.string().optional(),
        displayOrder: z.number().default(0),
        active: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        return await createCarouselSlide(input);
      }),
    // Admin: update slide
    update: customAdminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        bgColor: z.string().optional(),
        textColor: z.string().optional(),
        imageUrl: z.string().optional(),
        card1Label: z.string().optional(), card1Image: z.string().optional(), card1Link: z.string().optional(),
        card2Label: z.string().optional(), card2Image: z.string().optional(), card2Link: z.string().optional(),
        card3Label: z.string().optional(), card3Image: z.string().optional(), card3Link: z.string().optional(),
        card4Label: z.string().optional(), card4Image: z.string().optional(), card4Link: z.string().optional(),
        displayOrder: z.number().optional(),
        active: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateCarouselSlide(id, updates);
        return { success: true };
      }),
    // Admin: delete slide
    delete: customAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCarouselSlide(input.id);
        return { success: true };
      }),
  }),

  // ===== Categories =====
  categories: router({
    list: publicProcedure.query(async () => {
      return await getActiveCategories();
    }),
    adminList: customAdminProcedure.query(async () => {
      return await getAllCategories();
    }),
    create: customAdminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        icon: z.string().optional(),
        displayOrder: z.number().default(0),
        active: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        return await createCategory(input);
      }),
    update: customAdminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        icon: z.string().optional(),
        displayOrder: z.number().optional(),
        active: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateCategory(id, updates);
        return { success: true };
      }),
    delete: customAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCategory(input.id);
        return { success: true };
      }),
  }),

  // ===== Products =====
  products: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0), categoryId: z.number().optional(), search: z.string().optional() }))
      .query(async ({ input }) => {
        if (input.search) {
          const items = await searchProducts(input.search, input.limit);
          return { items, total: items.length };
        }
        if (input.categoryId) {
          const items = await getProductsByCategory(input.categoryId, input.limit);
          return { items, total: items.length };
        }
        const items = await getActiveProducts(input.limit, input.offset);
        const total = await countProducts();
        return { items, total };
      }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Produit introuvable" });
        return product;
      }),
    adminList: customAdminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const items = await getAllProducts(input.limit, input.offset);
        const total = await countProducts();
        return { items, total };
      }),
    create: customAdminProcedure
      .input(z.object({
        categoryId: z.number(),
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        priceTnd: z.number(),
        priceEur: z.number().optional(),
        originalPrice: z.number().optional(),
        discount: z.number().default(0),
        imageUrl: z.string().optional(),
        images: z.array(z.string()).default([]),
        platform: z.enum(["shein", "aliexpress", "temu", "local"]).default("local"),
        platformLink: z.string().optional(),
        stock: z.number().default(0),
        active: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        return await createProduct(input);
      }),
    update: customAdminProcedure
      .input(z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        priceTnd: z.number().optional(),
        priceEur: z.number().optional(),
        originalPrice: z.number().optional(),
        discount: z.number().optional(),
        imageUrl: z.string().optional(),
        images: z.array(z.string()).optional(),
        platform: z.enum(["shein", "aliexpress", "temu", "local"]).optional(),
        platformLink: z.string().optional(),
        stock: z.number().optional(),
        active: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateProduct(id, updates);
        return { success: true };
      }),
    delete: customAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),
    // Upload product image
    uploadImage: customAdminProcedure
      .input(z.object({ base64: z.string(), filename: z.string(), mimeType: z.string() }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `products/${Date.now()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),
  }),

  // ===== AI Orders =====
  aiOrders: router({
    // Create a new AI order (after collecting all customer info)
    create: publicProcedure
      .input(z.object({
        productName: z.string().optional(),
        productUrl: z.string().optional(),
        productImageUrl: z.string().optional(),
        totalPrice: z.number().int(), // in millimes (TND * 100)
        customerName: z.string().min(1),
        customerLastName: z.string().min(1),
        gouvernorat: z.string().min(1),
        moatamadia: z.string().optional(),
        phone: z.string().min(8),
        email: z.string().email().optional(),
        userId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const depositAmount = Math.round(input.totalPrice * 0.5);
        const order = await createAiOrder({
          ...input,
          depositAmount,
          status: 'pending_deposit',
        });
        // Notify admin
        await notifyAdminNewAiOrder({
          customerName: order.customerName || '',
          customerLastName: order.customerLastName || '',
          trackingCode: order.trackingCode,
          productName: order.productName,
          totalPrice: order.totalPrice,
          depositAmount: order.depositAmount,
          status: order.status || 'pending_deposit',
          customerEmail: order.email,
        });
        return { trackingCode: order.trackingCode, depositAmount: order.depositAmount, id: order.id };
      }),

    // Track an order by tracking code
    track: publicProcedure
      .input(z.object({ trackingCode: z.string().min(1) }))
      .query(async ({ input }) => {
        const order = await getAiOrderByTracking(input.trackingCode);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'كود التتبع غير صحيح' });
        return order;
      }),

    // Get orders for logged-in user
    myOrders: protectedProcedure
      .query(async ({ ctx }) => {
        const user = await getUserByOpenId(ctx.user.openId);
        if (!user) return [];
        return await getAiOrdersByUserId(user.id);
      }),

    // Upload payment proof
    uploadPaymentProof: publicProcedure
      .input(z.object({
        trackingCode: z.string(),
        base64: z.string(),
        mimeType: z.string(),
        filename: z.string(),
      }))
      .mutation(async ({ input }) => {
        const order = await getAiOrderByTracking(input.trackingCode);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'كود التتبع غير صحيح' });
        const buffer = Buffer.from(input.base64, 'base64');
        const key = `ai-orders/payment-proofs/${input.trackingCode}-${Date.now()}.${input.filename.split('.').pop()}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await updateAiOrderPaymentProof(order.id, url);
        await notifyAdminNewAiOrder({
          customerName: order.customerName || '',
          customerLastName: order.customerLastName || '',
          trackingCode: order.trackingCode,
          productName: order.productName,
          totalPrice: order.totalPrice,
          depositAmount: order.depositAmount,
          status: 'deposit_received',
          customerEmail: order.email,
        });
        return { success: true, url };
      }),

    // Admin: get all AI orders
    adminList: customAdminProcedure
      .query(async () => {
        return await getAllAiOrders();
      }),

    // Admin: confirm an order (alias for adminUpdateStatus with status 'confirmed')
    confirm: customAdminProcedure
      .input(z.object({
        id: z.number(),
        adminNote: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateAiOrderStatus(input.id, 'confirmed', input.adminNote);
        const orders = await getAllAiOrders();
        const order = orders.find(o => o.id === input.id);
        if (order) {
          await sendOrderConfirmationToAdmin({
            customerName: order.customerName || '',
            customerLastName: order.customerLastName || '',
            trackingCode: order.trackingCode,
            productName: order.productName,
            totalPrice: order.totalPrice,
            depositAmount: order.depositAmount,
            status: 'confirmed',
            customerEmail: order.email,
            adminNotes: input.adminNote,
          });
        }
        // Return WhatsApp link for admin to send to customer
        const phone = order?.phone || '';
        const waPhone = phone.replace(/\D/g, '');
        const intlPhone = waPhone.startsWith('216') ? waPhone : `216${waPhone}`;
        const waMsg = `مرحبا ${order?.customerName || ''}! 🎉 كومندتك مؤكدة ✅\nكود التتبع: ${order?.trackingCode}\nتابع كومندتك: https://bysis.shop/track?code=${order?.trackingCode}\n— Bysis`;
        const whatsappUrl = phone ? `https://wa.me/${intlPhone}?text=${encodeURIComponent(waMsg)}` : null;
        return { success: true, whatsappUrl };
      }),

    // Admin: reject an order (alias for adminUpdateStatus with status 'cancelled')
    reject: customAdminProcedure
      .input(z.object({
        id: z.number(),
        reason: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        await updateAiOrderStatus(input.id, 'cancelled', input.reason);
        const orders = await getAllAiOrders();
        const order = orders.find(o => o.id === input.id);
        if (order) {
          await sendStatusUpdateToAdmin({
            customerName: order.customerName || '',
            customerLastName: order.customerLastName || '',
            trackingCode: order.trackingCode,
            productName: order.productName,
            totalPrice: order.totalPrice,
            depositAmount: order.depositAmount,
            status: 'cancelled',
            customerEmail: order.email,
            adminNotes: input.reason,
          });
        }
        return { success: true };
      }),

    // Admin: update order status (simplified alias)
    updateStatus: customAdminProcedure
      .input(z.object({
        id: z.number(),
        status: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        await updateAiOrderStatus(input.id, input.status as any);
        const orders = await getAllAiOrders();
        const order = orders.find(o => o.id === input.id);
        if (order) {
          await sendStatusUpdateToAdmin({
            customerName: order.customerName || '',
            customerLastName: order.customerLastName || '',
            trackingCode: order.trackingCode,
            productName: order.productName,
            totalPrice: order.totalPrice,
            depositAmount: order.depositAmount,
            status: input.status,
            customerEmail: order.email,
          });
        }
        return { success: true };
      }),

    // Admin: update admin notes only
    updateAdminNotes: customAdminProcedure
      .input(z.object({
        id: z.number(),
        adminNotes: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateAiOrderAdminNotes(input.id, input.adminNotes);
        return { success: true };
      }),

    // Admin: update order status
    adminUpdateStatus: customAdminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending_deposit', 'deposit_received', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateAiOrderStatus(input.id, input.status, input.adminNotes);
        // Notify admin (and optionally customer)
        const order = await getAllAiOrders().then(orders => orders.find(o => o.id === input.id));
        if (order) {
          await sendStatusUpdateToAdmin({
            customerName: order.customerName || '',
            customerLastName: order.customerLastName || '',
            trackingCode: order.trackingCode,
            productName: order.productName,
            totalPrice: order.totalPrice,
            depositAmount: order.depositAmount,
            status: input.status,
            customerEmail: order.email,
            adminNotes: input.adminNotes,
          });
        }
        return { success: true };
      }),
  }),

  // ===== Sliders (Hero Carousel) =====
  sliders: router({
    // Get active sliders for frontend
    getActive: publicProcedure.query(async () => {
      return await getActiveSliders();
    }),
    // Get all sliders (admin only)
    getAll: customAdminProcedure.query(async () => {
      return await getAllSliders();
    }),
    // Get slider by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getSliderById(input.id);
      }),
    // Create slider (admin only)
    create: customAdminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        videoKey: z.string().optional(),
        countdownEndTime: z.date().optional(),
        backgroundColor: z.string().optional(),
        backgroundGradient: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await createSlider(input);
        return { success: true };
      }),
    // Update slider (admin only)
    update: customAdminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        videoKey: z.string().optional(),
        countdownEndTime: z.date().optional(),
        backgroundColor: z.string().optional(),
        backgroundGradient: z.string().optional(),
        isActive: z.number().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateSlider(id, data);
        return { success: true };
      }),
    // Delete slider (admin only)
    delete: customAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSlider(input.id);
        return { success: true };
      }),
    // Toggle slider active status (admin only)
    toggle: customAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await toggleSliderActive(input.id);
        return { success: true };
      }),
  }),

  // ===== Push Notifications =====
  push: router({
    // Subscribe to push notifications
    subscribe: publicProcedure
      .input(z.object({
        endpoint: z.string().url(),
        p256dh: z.string(),
        auth: z.string(),
        customerPhone: z.string().optional(),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await savePushSubscription(input);
        return { success: true };
      }),

    // Get VAPID public key for frontend
    getVapidKey: publicProcedure.query(() => {
      return { publicKey: process.env.VAPID_PUBLIC_KEY ?? process.env.VITE_VAPID_PUBLIC_KEY ?? "" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
