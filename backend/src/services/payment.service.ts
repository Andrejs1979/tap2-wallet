import { prisma } from '../config/database.js';

interface MerchantPaymentInput {
  userId: string;
  merchantId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export class PaymentService {
  async initiateMerchantPayment(input: MerchantPaymentInput) {
    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: input.userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check balance
    if (wallet.balance.toNumber() < input.amount) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'payment',
        amount: input.amount,
        status: 'pending',
        metadata: {
          merchantId: input.merchantId,
          paymentMethod: input.paymentMethod,
        },
      },
    });

    // TODO: Process payment with Stripe
    // For now, just return the transaction
    return {
      paymentId: transaction.id,
      status: transaction.status,
      amount: input.amount,
      currency: input.currency,
      timestamp: transaction.createdAt,
    };
  }

  async getPaymentStatus(paymentId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: paymentId },
    });

    if (!transaction) {
      throw new Error('Payment not found');
    }

    return {
      paymentId: transaction.id,
      status: transaction.status,
      amount: transaction.amount.toNumber(),
      createdAt: transaction.createdAt,
    };
  }

  async completePayment(paymentId: string) {
    return await prisma.transaction.update({
      where: { id: paymentId },
      data: { status: 'completed' },
    });
  }

  async failPayment(paymentId: string, reason: string) {
    return await prisma.transaction.update({
      where: { id: paymentId },
      data: {
        status: 'failed',
        metadata: { failureReason: reason },
      },
    });
  }
}
