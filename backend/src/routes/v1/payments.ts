import { Router } from 'express';
import { PaymentService } from '../../services/payment.service.js';

export const paymentsRouter = Router();
const paymentService = new PaymentService();

// POST /api/v1/payments/merchant
paymentsRouter.post('/merchant', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { merchantId, amount, currency, paymentMethod } = req.body;

    const payment = await paymentService.initiateMerchantPayment({
      userId,
      merchantId,
      amount,
      currency: currency || 'USD',
      paymentMethod: paymentMethod || 'default',
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Payment failed'
    });
  }
});

// GET /api/v1/payments/:id/status
paymentsRouter.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const status = await paymentService.getPaymentStatus(id);
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch payment status'
    });
  }
});

// POST /api/v1/payments/nfc/initiate
paymentsRouter.post('/nfc/initiate', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { merchantId, nonce } = req.body;

    // TODO: Implement NFC handshake logic
    res.json({
      paymentId: crypto.randomUUID(),
      status: 'initiated',
      message: 'NFC payment initiated'
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'NFC initiation failed'
    });
  }
});

// POST /api/v1/payments/qr/process
paymentsRouter.post('/qr/process', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { qrData, amount, tip } = req.body;

    // TODO: Implement QR code payment logic
    res.json({
      paymentId: crypto.randomUUID(),
      status: 'pending',
      message: 'QR payment processed'
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'QR payment failed'
    });
  }
});
