// Global type definitions

export interface User {
  id: string;
  email: string;
  phone: string;
  kycVerified: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  merchantId?: string;
  recipientId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Reward {
  id: string;
  points: number;
  merchantId: string;
  transactionId: string;
  expiresAt?: Date;
}
