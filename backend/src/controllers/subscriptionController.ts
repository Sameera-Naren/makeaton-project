import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionStatus } from '@prisma/client';

export const subscriptionController = {
  async list(_req: Request, res: Response) {
    try {
      const subscriptions = await subscriptionService.list();
      res.json({ data: subscriptions, count: subscriptions.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const subscription = await subscriptionService.getById(req.params.id as string);
      res.json({ data: subscription });
    } catch (err: any) {
      res.status(err.message === 'Subscription not found' ? 404 : 500).json({ error: err.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      if (!status || !Object.values(SubscriptionStatus).includes(status)) {
        res.status(400).json({ error: `Invalid status. Must be one of: ${Object.values(SubscriptionStatus).join(', ')}` });
        return;
      }
      const subscription = await subscriptionService.updateStatus(req.params.id as string, status as SubscriptionStatus);
      res.json({ data: subscription, message: `Subscription status updated to ${status}` });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  },

  async pause(req: Request, res: Response) {
    try {
      const subscription = await subscriptionService.pause(req.params.id as string);
      res.json({ data: subscription, message: 'Subscription paused' });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  },

  async resume(req: Request, res: Response) {
    try {
      const subscription = await subscriptionService.resume(req.params.id as string);
      res.json({ data: subscription, message: 'Subscription resumed' });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  },

  async close(req: Request, res: Response) {
    try {
      const subscription = await subscriptionService.close(req.params.id as string);
      res.json({ data: subscription, message: 'Subscription closed' });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  },
};
