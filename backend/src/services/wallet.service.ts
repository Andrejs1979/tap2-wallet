import { prisma } from '../config/database.js';

export class WalletService {
  async getBalance(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    return {
      balance: wallet.balance.toNumber(),
      currency: wallet.currency,
    };
  }

  async getTransactions(userId: string, limit = 20, offset = 0) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        },
      },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    return wallet.transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount.toNumber(),
      status: tx.status,
      createdAt: tx.createdAt,
    }));
  }

  async createWallet(userId: string) {
    return await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: 'USD',
      },
    });
  }
}
