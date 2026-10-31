import prisma from '../lib/prisma';
import { QuotationStatus, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique quotation number like QUO-20241031-XXXX
function generateQuotationNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = uuidv4().split('-')[0].toUpperCase();
  return `QUO-${datePart}-${rand}`;
}

export interface CreateQuotationInput {
  customerId: string;
  discountPct?: number;
  notes?: string;
  expiresAt?: string;
  items: {
    productId: string;
    variantId?: string;
    planId: string;
    quantity: number;
    unitPrice: number;
    discountPct?: number;
  }[];
}

// Calculate subtotal for a single item
function calcItemSubtotal(unitPrice: number, quantity: number, discountPct: number): number {
  const gross = unitPrice * quantity;
  return parseFloat((gross - (gross * discountPct) / 100).toFixed(2));
}

export const quotationService = {
  async list() {
    return prisma.quotation.findMany({
      include: {
        customer: { include: { user: true } },
        items: { include: { product: true, variant: true, plan: true } },
        subscription: { select: { id: true, subscriptionRef: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        items: { include: { product: true, variant: true, plan: true } },
        subscription: { select: { id: true, subscriptionRef: true, status: true } },
      },
    });
    if (!quotation) throw new Error('Quotation not found');
    return quotation;
  },

  async create(input: CreateQuotationInput) {
    const { customerId, discountPct = 0, notes, expiresAt, items } = input;

    if (!items || items.length === 0) {
      throw new Error('Quotation must have at least one item');
    }

    // Calculate totals
    const lineItems = items.map((item) => {
      const itemDiscount = item.discountPct ?? 0;
      const subtotal = calcItemSubtotal(item.unitPrice, item.quantity, itemDiscount);
      return { ...item, discountPct: itemDiscount, subtotal };
    });

    const rawSubtotal = lineItems.reduce((sum, i) => sum + i.subtotal, 0);
    const discountAmount = parseFloat(((rawSubtotal * discountPct) / 100).toFixed(2));
    const totalAmount = parseFloat((rawSubtotal - discountAmount).toFixed(2));

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: generateQuotationNumber(),
        customerId,
        discountPct: new Prisma.Decimal(discountPct),
        subtotal: new Prisma.Decimal(rawSubtotal),
        discountAmount: new Prisma.Decimal(discountAmount),
        totalAmount: new Prisma.Decimal(totalAmount),
        notes,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: {
          create: lineItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            planId: item.planId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            discountPct: new Prisma.Decimal(item.discountPct),
            subtotal: new Prisma.Decimal(item.subtotal),
          })),
        },
      },
      include: {
        customer: { include: { user: true } },
        items: { include: { product: true, variant: true, plan: true } },
      },
    });

    return quotation;
  },

  async update(id: string, input: Partial<CreateQuotationInput>) {
    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) throw new Error('Quotation not found');
    if (existing.status !== QuotationStatus.DRAFT) {
      throw new Error('Only DRAFT quotations can be edited');
    }

    const { discountPct = Number(existing.discountPct), notes, expiresAt, items } = input;

    if (items && items.length > 0) {
      // Recalculate
      const lineItems = items.map((item) => {
        const itemDiscount = item.discountPct ?? 0;
        const subtotal = calcItemSubtotal(item.unitPrice, item.quantity, itemDiscount);
        return { ...item, discountPct: itemDiscount, subtotal };
      });

      const rawSubtotal = lineItems.reduce((sum, i) => sum + i.subtotal, 0);
      const discountAmount = parseFloat(((rawSubtotal * discountPct) / 100).toFixed(2));
      const totalAmount = parseFloat((rawSubtotal - discountAmount).toFixed(2));

      // Replace all items
      await prisma.quotationItem.deleteMany({ where: { quotationId: id } });

      return prisma.quotation.update({
        where: { id },
        data: {
          discountPct: new Prisma.Decimal(discountPct),
          subtotal: new Prisma.Decimal(rawSubtotal),
          discountAmount: new Prisma.Decimal(discountAmount),
          totalAmount: new Prisma.Decimal(totalAmount),
          notes,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          items: {
            create: lineItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              planId: item.planId,
              quantity: item.quantity,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              discountPct: new Prisma.Decimal(item.discountPct),
              subtotal: new Prisma.Decimal(item.subtotal),
            })),
          },
        },
        include: {
          customer: { include: { user: true } },
          items: { include: { product: true, variant: true, plan: true } },
        },
      });
    }

    return prisma.quotation.update({
      where: { id },
      data: { discountPct: new Prisma.Decimal(discountPct), notes, expiresAt: expiresAt ? new Date(expiresAt) : undefined },
      include: {
        customer: { include: { user: true } },
        items: { include: { product: true, variant: true, plan: true } },
      },
    });
  },

  async confirm(id: string) {
    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new Error(`Cannot confirm a quotation with status ${quotation.status}`);
    }

    return prisma.quotation.update({
      where: { id },
      data: { status: QuotationStatus.CONFIRMED, confirmedAt: new Date() },
      include: {
        customer: { include: { user: true } },
        items: { include: { product: true, variant: true, plan: true } },
      },
    });
  },

  async convertToSubscription(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true, subscription: true },
    });
    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status !== QuotationStatus.CONFIRMED) {
      throw new Error('Only CONFIRMED quotations can be converted to subscriptions');
    }
    if (quotation.subscription) {
      throw new Error('This quotation has already been converted to a subscription');
    }
    if (quotation.items.length === 0) {
      throw new Error('Quotation has no items');
    }

    // Determine billing frequency from first plan (simplified – real version would validate all items have same freq)
    const firstItem = await prisma.quotationItem.findFirst({
      where: { quotationId: id },
      include: { plan: true },
    });
    const billingFrequency = firstItem?.plan.billingFrequency ?? 'MONTHLY';

    // Calculate renewal date
    const startDate = new Date();
    const renewalDate = new Date(startDate);
    if (billingFrequency === 'MONTHLY') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    const subscriptionRef = `SUB-${uuidv4().split('-')[0].toUpperCase()}`;

    // Use a transaction to update quotation + create subscription atomically
    const [updatedQuotation, subscription] = await prisma.$transaction([
      prisma.quotation.update({
        where: { id },
        data: { status: QuotationStatus.CONVERTED, convertedAt: new Date() },
      }),
      prisma.subscription.create({
        data: {
          subscriptionRef,
          customerId: quotation.customerId,
          quotationId: id,
          billingFrequency,
          startDate,
          renewalDate,
          totalAmount: quotation.totalAmount,
          items: {
            create: quotation.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId ?? undefined,
              planId: item.planId,
              quantity: item.quantity,
              agreedUnitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          customer: { include: { user: true } },
          items: { include: { product: true, variant: true, plan: true } },
          quotation: true,
        },
      }),
    ]);

    return { quotation: updatedQuotation, subscription };
  },
};
