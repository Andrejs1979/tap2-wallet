import { Router } from 'express';
import { WalletService } from '../../services/wallet.service.js';

export const walletRouter = Router();
const walletService = new WalletService();

// GET /api/v1/wallet/balance
walletRouter.get('/balance', async (req, res) => {
  try {
    // TODO: Add authentication middleware
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const balance = await walletService.getBalance(userId);
    res.json({ balance });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch balance'
    });
  }
});

// GET /api/v1/wallet/transactions
walletRouter.get('/transactions', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await walletService.getTransactions(userId);
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch transactions'
    });
  }
});
