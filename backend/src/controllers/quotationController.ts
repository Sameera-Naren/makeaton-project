import { Request, Response } from 'express';
import { quotationService } from '../services/quotationService';

export const quotationController = {
  async list(req: Request, res: Response) {
    try {
      const quotations = await quotationService.list();
      res.json({ data: quotations, count: quotations.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const quotation = await quotationService.getById(req.params.id as string);
      res.json({ data: quotation });
    } catch (err: any) {
      res.status(err.message === 'Quotation not found' ? 404 : 500).json({ error: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const quotation = await quotationService.create(req.body);
      res.status(201).json({ data: quotation, message: 'Quotation created successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const quotation = await quotationService.update(req.params.id as string, req.body);
      res.json({ data: quotation, message: 'Quotation updated successfully' });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  },

  async confirm(req: Request, res: Response) {
    try {
      const quotation = await quotationService.confirm(req.params.id as string);
      res.json({ data: quotation, message: 'Quotation confirmed successfully' });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  },

  async convert(req: Request, res: Response) {
    try {
      const result = await quotationService.convertToSubscription(req.params.id as string);
      res.status(201).json({ data: result, message: 'Quotation converted to subscription successfully' });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  },
};
