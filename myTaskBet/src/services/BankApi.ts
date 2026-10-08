import api from './api';

export interface BankInfo {
  id: number;
  total_points: number;
  created_at: string;
  updated_at?: string | null;
}

export interface BankTransaction {
  id: number;
  user_id: number;
  task_id: number | null;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal';
  description?: string;
  created_at: string;
}

export interface BankStatus {
  total_points: number;
  daily_transactions: number;
  weekly_distributions: number;
}

class BankApi {
  async getInfo(): Promise<BankInfo> {
    const resp = await api.get<BankInfo>('/bank/');
    return resp.data;
  }

  async getStatus(): Promise<BankStatus> {
    const resp = await api.get<BankStatus>('/bank/status');
    return resp.data;
  }

  async listTransactions(params?: {user_id?: number; transaction_type?: string}): Promise<BankTransaction[]> {
    const resp = await api.get<BankTransaction[]>('/bank/transactions', {params: params ?? {}});
    return resp.data;
  }
}

export default new BankApi();
