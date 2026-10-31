import client from './client';
import type { Subscription, SubscriptionStatus } from '../types';

export const subscriptionsApi = {
  list: () => client.get<{ data: Subscription[]; count: number }>('/api/subscriptions'),
  getById: (id: string) => client.get<{ data: Subscription }>(`/api/subscriptions/${id}`),
  updateStatus: (id: string, status: SubscriptionStatus) =>
    client.patch<{ data: Subscription; message: string }>(`/api/subscriptions/${id}/status`, { status }),
  pause: (id: string) => client.post<{ data: Subscription; message: string }>(`/api/subscriptions/${id}/pause`),
  resume: (id: string) => client.post<{ data: Subscription; message: string }>(`/api/subscriptions/${id}/resume`),
  close: (id: string) => client.post<{ data: Subscription; message: string }>(`/api/subscriptions/${id}/close`),
};
