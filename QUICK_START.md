# Quick Start Guide - SharedJox Wallet

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd apps/api && composer require stripe/stripe-php
cd apps/web && npm install @tanstack/react-query axios
```

### 2. Configure Environment
```bash
# Backend
cp infrastructure/docker/.env.example apps/api/.env
# Add Stripe keys to apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env
```

### 3. Database
```bash
cd apps/api
php artisan migrate
```

### 4. Start Services
```bash
# Terminal 1: API
cd apps/api && php artisan serve --port=8000

# Terminal 2: Frontend
cd apps/web && npm run dev

# Terminal 3: Stripe Webhooks
stripe listen --forward-to localhost:8000/webhooks/stripe
```

## Test Deposit in 2 Minutes

```bash
# 1. Create user and get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/send-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' | jq -r '.link_id')

# Get token from DB
TOKEN=$(psql sharedjox -t -c "SELECT token FROM magic_links WHERE id = $TOKEN;")

# Verify token
API_TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/verify-link \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}" | jq -r '.token')

# 2. Initiate deposit
curl -X POST http://localhost:8000/api/wallet/deposit \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'

# 3. Simulate webhook
stripe trigger checkout.session.completed

# 4. Check balance
curl -X GET http://localhost:8000/api/wallet \
  -H "Authorization: Bearer $API_TOKEN" | jq '.data.balance'
```

## API Endpoints

### Auth
- `POST /api/auth/send-link` - Send magic link
- `POST /api/auth/verify-link` - Verify token
- `GET /api/auth/me` - Get user profile

### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/deposit` - Initiate deposit
- `POST /api/wallet/withdraw` - Initiate withdrawal
- `POST /api/transactions/{id}/confirm` - Confirm transaction
- `GET /api/transactions` - Transaction history
- `GET /api/wallet/events` - Audit trail

### Webhooks
- `POST /webhooks/stripe` - Stripe webhook handler

## Frontend Components

### Pages
- `WalletPage` - Main wallet interface

### Modals
- `DepositModal` - Deposit flow
- `WithdrawModal` - Withdrawal flow

### Lists
- `TransactionList` - Transaction history

### Hooks
- `useGetWallet()` - Fetch wallet
- `useInitiateDeposit()` - Start deposit
- `useInitiateWithdraw()` - Start withdrawal
- `useGetTransactionHistory()` - Fetch transactions

## Database Schema

### Key Tables
- `users` - User accounts (+ stripe_account_id)
- `wallets` - Wallet balances
- `transactions` - Deposits/withdrawals
- `wallet_events` - Audit trail

### Key Columns
- `wallets.balance` - Total funds
- `wallets.available_balance` - Available for withdrawal
- `wallets.pending_balance` - In-flight funds
- `transactions.status` - pending|completed|cancelled|failed
- `wallet_events.type` - Event type (deposit_initiated, etc.)

## Common Tasks

### Check Wallet Balance
```bash
curl -X GET http://localhost:8000/api/wallet \
  -H "Authorization: Bearer {token}" | jq '.data'
```

### View Transaction History
```bash
curl -X GET http://localhost:8000/api/transactions \
  -H "Authorization: Bearer {token}" | jq '.data'
```

### View Audit Trail
```bash
curl -X GET http://localhost:8000/api/wallet/events \
  -H "Authorization: Bearer {token}" | jq '.data'
```

### Reset Database
```bash
cd apps/api && php artisan migrate:refresh
```

### View Logs
```bash
# Backend
tail -f apps/api/storage/logs/laravel.log

# Stripe
stripe logs tail
```

## Stripe Test Cards

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Dispute:** 4000 0000 0000 0259

Use any future expiry date and any 3-digit CVC.

## Troubleshooting

### 401 Unauthorized
- Token expired or invalid
- Check Authorization header format: `Bearer {token}`
- Verify token in database

### 422 Validation Error
- Check amount is between $10-$10,000
- Check available balance for withdrawals
- Check for pending withdrawals

### Webhook Not Received
- Verify Stripe CLI is running
- Check webhook secret in .env
- View logs: `stripe logs tail`

### Balance Not Updated
- Check webhook was received
- Verify transaction status in DB
- Check for errors in Laravel logs

## Performance Tips

1. **Cache:** React Query caches for 5 minutes
2. **Pagination:** Transaction list loads 50 items at a time
3. **Retry:** API retries 5xx errors with backoff
4. **Dedup:** Identical concurrent requests deduplicated

## Security Notes

- Never commit .env files
- Stripe keys are test keys only
- Bearer tokens expire after 24 hours
- Webhooks are signature-verified
- All balance updates are atomic

## Next Steps

1. ✓ Phase 2 Complete (Wallet + API Client)
2. → Phase 3: Routing & WebSocket
3. → Phase 4: Jobs Domain
4. → Phase 5: Docker & Deployment

## Documentation

- `IMPLEMENTATION_SUMMARY.md` - Full overview
- `docs/implementation/WALLET_IMPLEMENTATION.md` - Architecture
- `docs/frontend/API_CLIENT.md` - API usage
- `docs/testing/WALLET_TESTING_GUIDE.md` - Testing guide

## Support

- Check logs: `tail -f apps/api/storage/logs/laravel.log`
- Debug API: Use Postman or curl
- Debug Frontend: Browser DevTools
- Debug Webhooks: `stripe logs tail`

---

**Ready to test?** Start with the 5-Minute Setup above!
