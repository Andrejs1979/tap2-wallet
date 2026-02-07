import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Enums for type-safe status and type fields
export const transactionStatusEnum = ['PENDING', 'COMPLETED', 'FAILED'] as const
export type TransactionStatus = (typeof transactionStatusEnum)[number]

export const transactionTypeEnum = ['PAYMENT', 'P2P', 'FUND', 'WITHDRAW'] as const
export type TransactionType = (typeof transactionTypeEnum)[number]

export const paymentTypeEnum = ['NFC', 'QR'] as const
export type PaymentType = (typeof paymentTypeEnum)[number]

export const p2pTransferStatusEnum = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const
export type P2PTransferStatus = (typeof p2pTransferStatusEnum)[number]

// User model
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().unique(),
  auth0Id: text('auth0_id').unique(),
  kycVerified: integer('kyc_verified', { mode: 'boolean' }).default(false).notNull(),
  kycVerifiedAt: integer('kyc_verified_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
})

// Wallet model
export const wallets = sqliteTable('wallets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  balance: integer('balance').default(0).notNull(), // Stored as cents
  currency: text('currency').default('USD').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
})

// Transaction model
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  walletId: text('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  type: text('type', { enum: transactionTypeEnum }).notNull(),
  amount: integer('amount').notNull(), // Stored as cents
  status: text('status', { enum: transactionStatusEnum }).default('PENDING').notNull(),
  referenceId: text('reference_id'),
  metadata: text('metadata'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
})

// PaymentMethod model
export const paymentMethods = sqliteTable('payment_methods', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'card', 'bank', 'wallet_balance'
  provider: text('provider'), // 'stripe', 'plaid'
  providerId: text('provider_id'),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false).notNull(),
  lastFour: text('last_four'),
  expiryMonth: integer('expiry_month'),
  expiryYear: integer('expiry_year'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
})

// Merchant model
export const merchants = sqliteTable('merchants', {
  id: text('id').primaryKey(),
  businessName: text('business_name').notNull(),
  tap2Id: text('tap2_id').notNull().unique(),
  businessType: text('business_type'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
})

// MerchantPayment model
export const merchantPayments = sqliteTable('merchant_payments', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().unique().references(() => transactions.id, { onDelete: 'cascade' }),
  merchantId: text('merchant_id').notNull().references(() => merchants.id, { onDelete: 'cascade' }),
  paymentMethodId: text('payment_method_id').references(() => paymentMethods.id),
  paymentType: text('payment_type', { enum: paymentTypeEnum }).notNull(),
  qrCodeId: text('qr_code_id'),
  nfcNonce: text('nfc_nonce'),
  tipAmount: integer('tip_amount').default(0).notNull(), // Stored as cents
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
})

// Rewards model
export const rewards = sqliteTable('rewards', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  points: integer('points').default(0).notNull(),
  merchantId: text('merchant_id').references(() => merchants.id),
  transactionId: text('transaction_id').references(() => transactions.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
})

// P2PTransfer model
export const p2pTransfers = sqliteTable('p2p_transfers', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().unique().references(() => transactions.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => users.id),
  recipientId: text('recipient_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(), // Stored as cents
  status: text('status', { enum: p2pTransferStatusEnum }).default('PENDING').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
})

// Type exports for relations
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Wallet = typeof wallets.$inferSelect
export type NewWallet = typeof wallets.$inferInsert

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert

export type PaymentMethod = typeof paymentMethods.$inferSelect
export type NewPaymentMethod = typeof paymentMethods.$inferInsert

export type Merchant = typeof merchants.$inferSelect
export type NewMerchant = typeof merchants.$inferInsert

export type MerchantPayment = typeof merchantPayments.$inferSelect
export type NewMerchantPayment = typeof merchantPayments.$inferInsert

export type Reward = typeof rewards.$inferSelect
export type NewReward = typeof rewards.$inferInsert

export type P2PTransfer = typeof p2pTransfers.$inferSelect
export type NewP2PTransfer = typeof p2pTransfers.$inferInsert
