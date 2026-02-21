# Wallet Testing Guide

## Prerequisites

1. Stripe account with test keys
2. Stripe CLI installed
3. Laravel API running on localhost:8000
4. React app running on localhost:5173

## Setup

### 1. Configure Stripe Keys
Add to `apps/api/.env`:
```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (get from stripe listen output)
```

### 2. Start Stripe CLI Listener
```bash
stripe listen --forward-to localhost:8000/webhooks/stripe
```

This outputs:
```
Ready! Your webhook signing secret is: whsec_test_...
```

Copy the webhook secret to `.env`.

### 3. Run Migrations
```bash
cd apps/api
php artisan migrate
```

### 4. Start Services
```bash
# Terminal 1: Laravel API
cd apps/api && php artisan serve --port=8000

# Terminal 2: React app
cd apps/web && npm run dev

# Terminal 3: Stripe CLI
stripe listen --forward-to localhost:8000/webhooks/stripe
```

## Test Scenarios

### Scenario 1: Successful Deposit

**Step 1: Get Auth Token**
```bash
curl -X POST http://localhost:8000/api/auth/send-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Response:
```json
{
  "message": "Magic link sent to email",
  "link_id": 1
}
```

Get token from database:
```bash
psql sharedjox -c "SELECT token FROM magic_links WHERE id = 1;"
```

Verify token:
```bash
curl -X POST http://localhost:8000/api/auth/verify-link \
  -H "Content-Type: application/json" \
  -d '{"token": "..."}'
```

Response:
```json
{
  "token": "1|abc123def456..."
}
```

**Step 2: Initiate Deposit**
```bash
curl -X POST http://localhost:8000/api/wallet/deposit \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

Response:
```json
{
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/pay/...",
    "sessionId": "cs_test_...",
    "transaction": {
      "id": 1,
      "walletId": 1,
      "type": "deposit",
      "amount": 100.00,
      "status": "pending",
      "metadata": {
        "stripe_session_id": "cs_test_..."
      }
    }
  }
}
```

**Step 3: Simulate Stripe Webhook**
```bash
stripe trigger checkout.session.completed
```

**Step 4: Verify Deposit**
```bash
curl -X GET http://localhost:8000/api/wallet \
  -H "Authorization: Bearer 1|abc123def456..."
```

Response should show:
```json
{
  "data": {
    "balance": 100.00,
    "availableBalance": 100.00,
    "pendingBalance": 0.00
  }
}
```

### Scenario 2: Successful Withdrawal

**Step 1: Setup User with Stripe Account**
```bash
psql sharedjox -c "UPDATE users SET stripe_account_id = 'acct_test_...' WHERE id = 1;"
```

**Step 2: Initiate Withdrawal**
```bash
curl -X POST http://localhost:8000/api/wallet/withdraw \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}'
```

Response:
```json
{
  "data": {
    "transferId": "tr_test_...",
    "transaction": {
      "id": 2,
      "walletId": 1,
      "type": "withdraw",
      "amount": 50.00,
      "status": "pending",
      "metadata": {
        "stripe_transfer_id": "tr_test_..."
      }
    }
  }
}
```

**Step 3: Verify Pending Withdrawal**
```bash
curl -X GET http://localhost:8000/api/wallet \
  -H "Authorization: Bearer 1|abc123def456..."
```

Response should show:
```json
{
  "data": {
    "balance": 100.00,
    "availableBalance": 50.00,
    "pendingBalance": 50.00
  }
}
```

**Step 4: Simulate Transfer Completion**
```bash
stripe trigger transfer.created
```

**Step 5: Verify Withdrawal Completed**
```bash
curl -X GET http://localhost:8000/api/wallet \
  -H "Authorization: Bearer 1|abc123def456..."
```

Response should show:
```json
{
  "data": {
    "balance": 50.00,
    "availableBalance": 50.00,
    "pendingBalance": 0.00
  }
}
```

### Scenario 3: Transaction History

```bash
curl -X GET http://localhost:8000/api/transactions \
  -H "Authorization: Bearer 1|abc123def456..."
```

Response:
```json
{
  "data": [
    {
      "id": 2,
      "walletId": 1,
      "type": "withdraw",
      "amount": 50.00,
      "status": "completed",
      "createdAt": "2026-02-18T05:00:00Z"
    },
    {
      "id": 1,
      "walletId": 1,
      "type": "deposit",
      "amount": 100.00,
      "status": "completed",
      "createdAt": "2026-02-18T04:59:00Z"
    }
  ]
}
```

### Scenario 4: Wallet Events (Audit Trail)

```bash
curl -X GET http://localhost:8000/api/wallet/events \
  -H "Authorization: Bearer 1|abc123def456..."
```

Response:
```json
{
  "data": [
    {
      "id": 4,
      "walletId": 1,
      "type": "withdrawal_confirmed",
      "payload": {
        "amount": 50.00,
        "transaction_id": 2,
        "new_balance": 50.00
      },
      "createdAt": "2026-02-18T05:00:00Z"
    },
    {
      "id": 3,
      "walletId": 1,
      "type": "withdrawal_initiated",
      "payload": {
        "amount": 50.00,
        "reference": "stripe_transfer_...",
        "transaction_id": 2
      },
      "createdAt": "2026-02-18T04:59:30Z"
    },
    {
      "id": 2,
      "walletId": 1,
      "type": "deposit_confirmed",
      "payload": {
        "amount": 100.00,
        "transaction_id": 1,
        "new_balance": 100.00
      },
      "createdAt": "2026-02-18T04:59:15Z"
    },
    {
      "id": 1,
      "walletId": 1,
      "type": "deposit_initiated",
      "payload": {
        "amount": 100.00,
        "reference": "stripe_checkout_...",
        "transaction_id": 1
      },
      "createdAt": "2026-02-18T04:59:00Z"
    }
  ]
}
```

## Error Testing

### Invalid Amount
```bash
curl -X POST http://localhost:8000/api/wallet/deposit \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 5}'
```

Response (422):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "amount": ["Amount must be between $10 and $10,000"]
  }
}
```

### Insufficient Balance
```bash
curl -X POST http://localhost:8000/api/wallet/withdraw \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'
```

Response (422):
```json
{
  "message": "Insufficient available balance"
}
```

### Pending Withdrawal Exists
```bash
# First withdrawal
curl -X POST http://localhost:8000/api/wallet/withdraw \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}'

# Second withdrawal (should fail)
curl -X POST http://localhost:8000/api/wallet/withdraw \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 30}'
```

Response (422):
```json
{
  "message": "You have a pending withdrawal. Please wait for it to complete."
}
```

### Unauthorized
```bash
curl -X GET http://localhost:8000/api/wallet
```

Response (401):
```json
{
  "message": "Unauthenticated."
}
```

## Frontend Testing

### 1. Login Flow
- Navigate to http://localhost:5173/login
- Enter test email
- Check email for magic link (or get token from DB)
- Click link or paste token
- Should redirect to dashboard

### 2. Wallet Page
- Navigate to http://localhost:5173/wallet
- Should display balance cards
- Should show transaction history
- Deposit/Withdraw buttons should be enabled

### 3. Deposit Flow
- Click "Deposit" button
- Enter amount (e.g., 100)
- Click "Continue"
- Should redirect to Stripe Checkout
- Use test card: 4242 4242 4242 4242
- Complete payment
- Should show success message
- Balance should update

### 4. Withdraw Flow
- Click "Withdraw" button
- Enter amount (e.g., 50)
- Click "Continue"
- Review confirmation screen
- Click "Confirm"
- Should show processing spinner
- Should show success message
- Balance should update

### 5. Transaction History
- Scroll through transaction list
- Should show date grouping
- Should show status badges
- Should show amounts with +/- signs
- Click "Load More" to paginate

## Database Queries

### Check Wallet Balance
```sql
SELECT id, user_id, balance, available_balance, pending_balance 
FROM wallets 
WHERE user_id = 1;
```

### Check Transactions
```sql
SELECT id, type, amount, status, created_at 
FROM transactions 
WHERE wallet_id = 1 
ORDER BY created_at DESC;
```

### Check Events
```sql
SELECT id, type, payload, created_at 
FROM wallet_events 
WHERE wallet_id = 1 
ORDER BY created_at DESC;
```

### Check Magic Links
```sql
SELECT id, token, expires_at, used_at 
FROM magic_links 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

## Debugging

### Enable SQL Logging
Add to `apps/api/.env`:
```
DB_LOG_QUERIES=true
```

### Check Stripe Webhook Logs
```bash
stripe logs tail
```

### Check Laravel Logs
```bash
tail -f apps/api/storage/logs/laravel.log
```

### Check React Console
Open browser DevTools → Console tab

### Check Network Requests
Open browser DevTools → Network tab
- Filter by XHR/Fetch
- Check request/response headers
- Verify Authorization header is present

## Performance Testing

### Load Test Transactions
```bash
for i in {1..100}; do
  curl -X GET http://localhost:8000/api/transactions \
    -H "Authorization: Bearer 1|abc123def456..." &
done
wait
```

### Measure Response Time
```bash
time curl -X GET http://localhost:8000/api/wallet \
  -H "Authorization: Bearer 1|abc123def456..."
```

## Cleanup

### Reset Database
```bash
php artisan migrate:refresh
```

### Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
```

### Clear React Cache
```bash
rm -rf apps/web/node_modules/.vite
```
