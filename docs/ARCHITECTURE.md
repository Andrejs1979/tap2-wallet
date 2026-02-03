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
│           ┌───────────────────────┐                             │
│           │   Tap2 Wallet API     │                             │
│           │   (Node.js/Express)   │                             │
│           └───────────┬───────────┘                             │
│                       │                                          │
│       ┌───────────────┼───────────────┐                          │
│       ▼               ▼               ▼                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                    │
│  │ Wallet   │   │ Rewards  │   │ Identity │                    │
│  │ Service  │   │ Service  │   │ Service  │                    │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘                    │
│       │              │              │                            │
│       ▼              ▼              ▼                            │
│  ┌──────────────────────────────────────┐                      │
│  │         PostgreSQL Database          │                      │
│  └──────────────────────────────────────┘                      │
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
| API | Node.js + Express | TypeScript, async I/O |
| Database | PostgreSQL | ACID compliance for financial data |
| ORM | Prisma | Type-safe ORM |
| Auth | Auth0 | OAuth2, social logins |
| KYC | Persona | Identity verification |
| Payments | Stripe | Card processing, payouts |

### Infrastructure

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Hosting | AWS / Fly.io | Scalable hosting |
| CDN | CloudFront | Asset delivery |
| Monitoring | Sentry | Error tracking |
| Analytics | Mixpanel | User analytics |
| CI/CD | GitHub Actions | Automated deployments |

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

## Deployment Strategy

### Environments
- **Development**: Local development with mock services
- **Staging**: Pre-production testing environment
- **Production**: Live environment

### CI/CD Pipeline
1. Code push triggers GitHub Actions
2. Run tests (unit, integration, E2E)
3. Build Docker images
4. Deploy to staging
5. Run smoke tests
6. Promote to production (manual approval)

## Future Considerations

### Scalability
- Horizontal scaling for API servers
- Database read replicas
- Redis caching layer
- Message queue for async operations

### Feature Expansion
- Virtual card integration
- Budgeting and analytics
- Bill pay features
- Investment/savings integration
