import { useApi, useApiMutation } from './useApi';
import { apiClient } from './apiClient';

export interface WalletDTO {
  id: number;
  userId: number;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDTO {
  id: number;
  walletId: number;
  type: 'deposit' | 'withdraw';
  amount: number;
  reference: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WalletEventDTO {
  id: number;
  walletId: number;
  type: string;
  payload: Record<string, any>;
  createdAt: string;
}

export function useGetWallet() {
  return useApi<WalletDTO>('wallet', '/api/wallet');
}

export function useInitiateDeposit() {
  return useApiMutation<
    { checkoutUrl: string; sessionId: string; transaction: TransactionDTO },
    { amount: number }
  >('/api/wallet/deposit', 'post');
}

export function useInitiateWithdraw() {
  return useApiMutation<
    { transferId: string; transaction: TransactionDTO },
    { amount: number }
  >('/api/wallet/withdraw', 'post');
}

export function useConfirmTransaction() {
  return useApiMutation<WalletDTO, { transactionId: number }>(
    '/api/transactions/{id}/confirm',
    'post'
  );
}

export function useGetTransactionHistory() {
  return useApi<TransactionDTO[]>('transactions', '/api/transactions');
}

export function useGetWalletEvents() {
  return useApi<WalletEventDTO[]>('wallet-events', '/api/wallet/events');
}

export async function getTransactionHistory(limit = 50, offset = 0) {
  const response = await apiClient.get<{ data: TransactionDTO[] }>('/api/transactions', {
    params: { limit, offset },
  });
  return response.data.data;
}

export async function getWalletEvents(limit = 100) {
  const response = await apiClient.get<{ data: WalletEventDTO[] }>('/api/wallet/events', {
    params: { limit },
  });
  return response.data.data;
}
