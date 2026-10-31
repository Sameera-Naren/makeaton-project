import client from './client';
import type { Quotation, CreateQuotationInput } from '../types';

export const quotationsApi = {
  list: () => client.get<{ data: Quotation[]; count: number }>('/api/quotations'),
  getById: (id: string) => client.get<{ data: Quotation }>(`/api/quotations/${id}`),
  create: (data: CreateQuotationInput) => client.post<{ data: Quotation; message: string }>('/api/quotations', data),
  update: (id: string, data: Partial<CreateQuotationInput>) =>
    client.patch<{ data: Quotation; message: string }>(`/api/quotations/${id}`, data),
  confirm: (id: string) => client.post<{ data: Quotation; message: string }>(`/api/quotations/${id}/confirm`),
  convert: (id: string) =>
    client.post<{ data: { quotation: Quotation; subscription: unknown }; message: string }>(
      `/api/quotations/${id}/convert`
    ),
};
