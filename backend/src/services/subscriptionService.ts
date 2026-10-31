import prisma from '../lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  ACTIVE: [SubscriptionStatus.PAUSED, SubscriptionStatus.CLOSED, SubscriptionStatus.EXPIRED],
  PAUSED: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CLOSED],
  CLOSED: [],
  EXPIRED: [],
};

export const subscriptionService = {
  async list() {
    return prisma.subscription.findMany({
      include: {
        customer: { include: { user: true } },
        items: { include: { product: true, variant: true, plan: true } },
        quotation: { select: { id: true, quotationNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        items: { include: { product: true, variant: true, plan: true } },
        quotation: { select: { id: true, quotationNumber: true, totalAmount: true } },
      },
    });
    if (!subscription) throw new Error('Subscription not found');
    return subscription;
  },

  async updateStatus(id: string, newStatus: SubscriptionStatus) {
    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription) throw new Error('Subscription not found');

    const allowed = VALID_TRANSITIONS[subscription.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${subscription.status} → ${newStatus}. Allowed: [${allowed.join(', ')}]`
      );
    }

    const now = new Date();
    const extraData: Record<string, Date | null> = {};
    if (newStatus === SubscriptionStatus.PAUSED) extraData.pausedAt = now;
    if (newStatus === SubscriptionStatus.ACTIVE) extraData.pausedAt = null;
    if (newStatus === SubscriptionStatus.CLOSED) extraData.closedAt = now;

    return prisma.subscription.update({
      where: { id },
      data: { status: newStatus, ...extraData, updatedAt: now },
      include: {
        customer: { include: { user: true } },
        items: { include: { product: true, variant: true, plan: true } },
        quotation: { select: { id: true, quotationNumber: true } },
      },
    });
  },

  async pause(id: string) {
    return this.updateStatus(id, SubscriptionStatus.PAUSED);
  },

  async resume(id: string) {
    return this.updateStatus(id, SubscriptionStatus.ACTIVE);
  },

  async close(id: string) {
    return this.updateStatus(id, SubscriptionStatus.CLOSED);
  },
};
