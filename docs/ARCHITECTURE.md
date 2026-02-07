# Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Tap2 Wallet Ecosystem                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐      ┌──────────────────┐                 │
│  │   iOS App        │      │   Android App    │                 │
│  │   React Native   │      │   React Native   │                 │
│  └────────┬─────────┘      └────────┬─────────┘                 │
│           │                         │                            │
│           └───────────┬─────────────┘                            │
│                       │                                          │
│                       ▼                                          │
│           ┌─────────────────────────────────────┐                │
│           │       Cloudflare Edge Network       │                │
│           │   (Workers / Pages Functions)       │                │
│           └─────────────────┬───────────────────┘                │
│                             │                                    │
│       ┌─────────────────────┼─────────────────────┐              │
│       ▼                     ▼                     ▼              │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐        │
│  │ Wallet   │         │ Rewards  │         │ Identity │        │
│  │ Service  │         │ Service  │         │ Service  │        │
│  └────┬─────┘         └────┬─────┘         └────┬─────┘        │
│       │                    │                    │               │
│       ▼                    ▼                    ▼               │
│  ┌──────────────────────────────────────────────────┐         │
│  │     PostgreSQL (Neon/Supabase)                   │         │
│  │     via Cloudflare Tunnel / Direct Connection    │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Mobile App (Consumer)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | React Native | Single codebase for iOS/Android |
| State | Zustand | Lightweight, simple |
| Navigation | React Navigation | Standard for RN |
| Networking | Axios | HTTP client |
| NFC | react-native-nfc-manager | NFC functionality |
| Biometrics | react-native-biometrics | Face ID/Touch ID |
| Camera | react-native-vision-camera | QR scanning |

### Backend Services

| Component | Technology | Rationale |
|-----------|------------|-----------|
| API Runtime | Cloudflare Workers / Pages Functions | Edge compute, global distribution |
| Framework | Hono / itty-router | Lightweight, edge-optimized |
| Language | TypeScript | Type safety |
| Database | PostgreSQL (Neon/Supabase) | ACID compliance for financial data |
| ORM | Prisma | Type-safe ORM |
| Auth | Auth0 | OAuth2, social logins |
| KYC | Persona | Identity verification |
| Payments | Stripe | Card processing, payouts |
| Queue | Cloudflare Queues | Async job processing |
| Cache | Cloudflare KV | Fast edge reads, rate limiting |

### Infrastructure

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Cloud Platform | Cloudflare | All cloud services on single platform |
| Compute | Cloudflare Workers / Pages Functions | Edge deployment, global latency |
| CDN | Cloudflare CDN | Built-in to platform |
| Database | PostgreSQL via Neon/Supabase | ACID compliance, edge-friendly |
| Storage | Cloudflare R2 / KV | Object storage, key-value cache |
| Monitoring | Sentry | Error tracking |
| Analytics | Cloudflare Web Analytics / Mixpanel | User analytics |
| CI/CD | GitHub Actions + Wrangler | Automated deployments |

## Service Boundaries

### Wallet Service

**Responsibilities:**
- Balance management
- Transaction processing
- Funding source management
- Virtual card issuance

**APIs:**
```
GET    /v1/wallet/balance
POST   /v1/wallet/fund
POST   /v1/wallet/withdraw
GET    /v1/wallet/transactions
POST   /v1/wallet/funding-sources
```

### Payments Service

**Responsibilities:**
- P2P transfers
- Merchant payments
- Payment processing
- Transaction history

**APIs:**
```
POST   /v1/payments/p2p
POST   /v1/payments/merchant
POST   /v1/payments/qr
GET    /v1/payments/:id/status
```

### Rewards Service

**Responsibilities:**
- Points calculation
- Rewards redemption
- Loyalty program integration
- Rewards history

**APIs:**
```
GET    /v1/rewards/balance
GET    /v1/rewards/history
POST   /v1/rewards/redeem
GET    /v1/rewards/offers
```

### Identity Service

**Responsibilities:**
- User registration/login
- KYC verification
- Profile management
- Security settings

**APIs:**
```
POST   /v1/auth/register
POST   /v1/auth/login
POST   /v1/auth/verify-kyc
GET    /v1/auth/profile
PUT    /v1/auth/profile
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  auth0_id VARCHAR(255) UNIQUE,
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Wallets Table
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  balance DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id),
  type VARCHAR(20) NOT NULL, -- 'payment', 'p2p', 'fund', 'withdraw'
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reference_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Rewards Table
```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  points INTEGER DEFAULT 0,
  merchant_id VARCHAR(255),
  transaction_id UUID REFERENCES transactions(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security Considerations

### Authentication
- JWT tokens with short expiration (15 minutes)
- Refresh tokens with rotation
- Device binding for sensitive operations

### Authorization
- Role-based access control (RBAC)
- Per-user resource isolation
- Admin-only operations protected

### Data Protection
- Encryption at rest (database)
- TLS 1.3 in transit
- PII data hashed/salted
- PCI DSS compliance for card data

### Rate Limiting
- Per-user rate limits on API calls
- Stricter limits on payment operations
- IP-based blocking for abuse

## Monitoring & Observability

### Metrics to Track
- API response times (p50, p95, p99)
- Payment success/failure rates
- User registration/conversion
- P2P transaction volume
- Rewards redemption rates

### Alerts
- Payment failures above threshold
- API error rate spikes
- Database connection issues
- Unusual transaction patterns

## Cloudflare Architecture

### Why Cloudflare?

- **Global Edge**: Code runs in 300+ locations worldwide, reducing latency
- **Unified Platform**: Compute, storage, database, DNS on one provider
- **DDoS Protection**: Built-in mitigation at no extra cost
- **Cost Effective**: Pay-per-request, no idle server costs
- **Developer Experience**: Wrangler CLI, TypeScript-first, fast deployments

### Cloudflare Services Used

| Service | Purpose | Notes |
|---------|---------|-------|
| **Workers** | API compute | Edge Functions, sub-millisecond cold starts |
| **Pages Functions** | Full-stack deployments | For static + dynamic content |
| **KV** | Key-value storage | Fast reads, rate limiting, session data |
| **R2** | Object storage | User files, receipts, profile images |
| **Queues** | Async jobs | Webhook processing, notifications |
| **Durable Objects** | Stateful operations | Real-time features, strong consistency |
| **Analytics** | Request metrics | Built-in, no extra code needed |
| **Zero Trust** | Access control | Internal tool access, mTLS for DB |

### Database Connectivity

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Cloudflare      │────▶│ Cloudflare      │────▶│ PostgreSQL      │
│ Workers         │     │ Tunnel / Direct │     │ (Neon/Supabase) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

Two options for database connection:
1. **Cloudflare Tunnel**: Secure, private connection to any PostgreSQL
2. **Direct**: Neon/Supabase with edge-friendly connection pooling

### Rate Limiting Strategy

Using Cloudflare KV + Workers:
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ User Request │────▶│ KV Check     │────▶│ Allow/Deny   │
│              │     │ (rate limit) │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

Per-user and per-IP limits with auto-expiration.

## Deployment Strategy

### Environments
- **Development**: Local development with mock services
- **Staging**: Pre-production testing environment
- **Production**: Live environment

### CI/CD Pipeline
1. Code push triggers GitHub Actions
2. Run tests (unit, integration, E2E)
3. Build Workers bundle (`wrangler deploy`)
4. Deploy to Cloudflare Workers preview (staging)
5. Run smoke tests
6. Promote to production (manual approval)
7. Route traffic via Cloudflare DNS

## Future Considerations

### Scalability
- **Automatic**: Cloudflare Workers auto-scale globally
- **Database**: Neon/Supabase read replicas
- **Caching**: Cloudflare KV for frequently-accessed data
- **Queues**: Cloudflare Queues for async operations (webhooks, notifications)
- **Durable Objects**: For stateful operations requiring strong consistency

### Feature Expansion
- Virtual card integration
- Budgeting and analytics
- Bill pay features
- Investment/savings integration
