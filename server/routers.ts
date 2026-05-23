import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

// ===== Admin Procedure =====
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

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

  // ===== Orders Router =====
  orders: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerPhone: z.string().optional(),
        customerEmail: z.string().email().optional(),
        sourceUrl: z.string().optional(),
        sourcePrice: z.string().optional(),
        quantity: z.number().int().positive().default(1),
        customerNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const trackingCode = `BYS-${Date.now()}-${nanoid(6)}`;
        const userId = ctx.user?.id || null;
        
        const order = await db.createOrder({
          userId: userId as number,
          trackingCode,
          customerName: input.customerName,
          customerPhone: input.customerPhone || null,
          customerEmail: input.customerEmail || null,
          sourceUrl: input.sourceUrl || null,
          sourcePrice: input.sourcePrice || null,
          quantity: input.quantity,
          customerNotes: input.customerNotes || null,
          status: 'new',
        });

        // Notify owner
        await notifyOwner({
          title: 'Nouvelle commande',
          content: `Nouvelle commande de ${input.customerName} (${trackingCode})`,
        }).catch(err => console.error('Notification failed:', err));

        return order;
      }),

    getByTrackingCode: publicProcedure
      .input(z.object({ trackingCode: z.string() }))
      .query(async ({ input }) => {
        return await db.getOrderByTrackingCode(input.trackingCode);
      }),

    list: adminProcedure.query(async () => {
      return await db.getAllOrders();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getOrderById(input.id);
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['new', 'processing', 'waiting_payment', 'shipped', 'arrived', 'completed', 'cancelled']),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),

    updateNotes: adminProcedure
      .input(z.object({
        id: z.number(),
        adminNotes: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderNotes(input.id, input.adminNotes);
        return { success: true };
      }),

    search: adminProcedure
      .input(z.object({
        query: z.string(),
        type: z.enum(['name', 'phone']).default('name'),
      }))
      .query(async ({ input }) => {
        if (input.type === 'phone') {
          return await db.searchOrdersByPhone(input.query);
        }
        return await db.searchOrdersByCustomerName(input.query);
      }),

    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      return await db.getOrdersByUserId(ctx.user.id);
    }),
  }),

  // ===== Price Calculator Router =====
  calculator: router({
    analyzeImage: publicProcedure
      .input(z.object({
        imageUrl: z.string(),
        sourcePrice: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Use LLM to analyze product from image
          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: 'You are an expert product analyst. Analyze the product image and identify: 1) Product type (e.g., clothing, electronics, accessories), 2) Product category (e.g., shirt, phone case, shoes), 3) Estimated quality level (basic, standard, premium). Return JSON format: {productType, productCategory, qualityLevel}',
              },
              {
                role: 'user',
                content: `Please analyze this product image: ${input.imageUrl}`,
              },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'product_analysis',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    productType: { type: 'string' },
                    productCategory: { type: 'string' },
                    qualityLevel: { type: 'string', enum: ['basic', 'standard', 'premium'] },
                  },
                  required: ['productType', 'productCategory', 'qualityLevel'],
                  additionalProperties: false,
                },
              },
            },
          });

          const analysisText = response.choices[0]?.message?.content;
          const analysis = JSON.parse(typeof analysisText === 'string' ? analysisText : '{}');

          // Calculate price based on analysis
          const sourcePrice = input.sourcePrice ? parseFloat(input.sourcePrice) : 0;
          const markupMap: Record<string, number> = {
            basic: 1.5,
            standard: 2.0,
            premium: 2.5,
          };
          const markup = markupMap[analysis.qualityLevel] || 2.0;

          const calculatedPrice = sourcePrice * markup;

          // Save to calculation history
          const sessionId = (ctx.req.headers['x-session-id'] as string) || nanoid();
          await db.saveCalculation({
            sessionId,
            userId: ctx.user?.id || null,
            imageUrl: input.imageUrl,
            imageKey: null,
            productType: analysis.productType,
            productCategory: analysis.productCategory,
            sourcePrice: sourcePrice ? sourcePrice.toString() : null,
            calculatedPrice: calculatedPrice.toString(),
            analysisData: analysis,
            deviceId: null,
          });

          return {
            productType: analysis.productType,
            productCategory: analysis.productCategory,
            qualityLevel: analysis.qualityLevel,
            sourcePrice,
            calculatedPrice,
            markup,
          };
        } catch (error) {
          console.error('Image analysis failed:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to analyze image',
          });
        }
      }),

    getHistory: publicProcedure.query(async ({ ctx }) => {
      const sessionId = ctx.req.headers['x-session-id'] as string;
      if (!sessionId) {
        return [];
      }
      return await db.getCalculationHistoryBySession(sessionId);
    }),
  }),

  // ===== Arrivage Router =====
  arrivage: router({
    list: publicProcedure.query(async () => {
      return await db.getAvailableArrivageItems();
    }),

    listAll: adminProcedure.query(async () => {
      return await db.getAllArrivageItems();
    }),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        price: z.string(),
        quantity: z.number().int().positive(),
        available: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createArrivageItem({
          name: input.name,
          description: input.description || null,
          category: input.category || null,
          price: input.price,
          quantity: input.quantity,
          available: (input.available || 1) as number,
          imageUrl: null,
          imageKey: null,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        price: z.string().optional(),
        quantity: z.number().int().optional(),
        available: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const updateData: any = {};
        if (updates.name) updateData.name = updates.name;
        if (updates.description) updateData.description = updates.description;
        if (updates.category) updateData.category = updates.category;
        if (updates.price) updateData.price = updates.price;
        if (updates.quantity !== undefined) updateData.quantity = updates.quantity as number;
        if (updates.available !== undefined) updateData.available = updates.available as number;
        
        await db.updateArrivageItem(id, updateData);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteArrivageItem(input.id);
        return { success: true };
      }),
  }),

  // ===== Chat Router =====
  chat: router({
    getOrCreateConversation: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getOrCreateConversation(input.sessionId);
      }),

    addMessage: publicProcedure
      .input(z.object({
        conversationId: z.number(),
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.addChatMessage(
          input.conversationId,
          input.role,
          input.content,
          input.imageUrl || null
        );
        return { success: true };
      }),

    getMessages: publicProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getConversationMessages(input.conversationId);
      }),

    listConversations: adminProcedure.query(async () => {
      return await db.getAllConversations();
    }),
  }),

  // ===== Settings Router =====
  settings: router({
    get: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await db.getSetting(input.key);
      }),

    set: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await db.setSetting(input.key, input.value);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
