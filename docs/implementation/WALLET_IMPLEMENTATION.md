# Wallet Implementation Guide

## Backend Implementation

### DepositAction
Creates a Stripe Checkout session for deposits ($10-$10,000).

**Flow:**
1. Validates amount (min $10, max $10,000)
2. Creates pending transaction in database
3. Initiates Stripe Checkout session
4. Stores session ID in transaction metadata
5. Returns checkout URL to frontend

**Webhook Handler:**
- Listens for `checkout.session.completed` events
- Confirms transaction and updates wallet balance
- Records `deposit_confirmed` event for audit trail

### WithdrawAction
Creates a Stripe Connect transfer for withdrawals.

**Flow:**
1. Validates amount ($10-$10,000)
2. Checks available balance
3. Ensures no pending withdrawals exist
4. Creates pending withdrawal transaction
5. Initiates Stripe transfer to user's connected account
6. Stores transfer ID in metadata

**Webhook Handler:**
- Listens for transfer completion events
- Confirms withdrawal and updates balance
- Handles disputes with `charge.dispute.created` events

### ConfirmTransactionAction
Atomically confirms pending transactions.

**Idempotent:**
- Checks transaction status before confirming
- Only processes pending transactions
- Updates wallet balance in single DB transaction
- Records event for audit trail

### CancelWithdrawAction
Cancels pending withdrawals and reverses balance hold.

**Behavior:**
- Only cancels pending withdrawals
- Restores available balance
- Decrements pending balance
- Records cancellation event

## Frontend Implementation

### API Client (`apiClient.ts`)
- Axios instance with base URL from `VITE_API_URL`
- Request interceptor: Attaches Bearer token
- Response interceptor: Handles 401 redirects to login
- Retry logic: Exponential backoff for 5xx errors (max 3 retries)
- Request deduplication for identical concurrent calls

### useApi Hook
React Query wrapper for API calls.

**Features:**
- Automatic loading/error state management
- Cache invalidation helpers
- Optimistic updates support
- Type-safe responses

### walletApi.ts
Wallet-specific API functions.

**Hooks:**
- `useGetWallet()` - Fetch current wallet state
- `useInitiateDeposit()` - Start deposit flow
- `useInitiateWithdraw()` - Start withdrawal flow
- `useConfirmTransaction()` - Confirm pending transaction
- `useGetTransactionHistory()` - Fetch transactions
- `useGetWalletEvents()` - Fetch audit trail

### WalletPage
Main wallet interface.

**Components:**
- Balance cards (total, available, pending)
- Deposit/Withdraw buttons
- Transaction history with infinite scroll
- Real-time balance updates (WebSocket stub)

### DepositModal
Deposit flow UI.

**States:**
- Input: Amount entry
- Processing: Stripe redirect
- Success: Confirmation
- Error: Retry

### WithdrawModal
Withdrawal flow UI.

**States:**
- Input: Amount entry
- Confirm: Fee breakdown
- Processing: Transfer initiation
- Success: Confirmation
- Error: Retry

### TransactionList
Transaction history display.

**Features:**
- Date grouping (Today, Yesterday, Earlier)
- Status badges with color coding
- Infinite scroll pagination
- Type icons (↓ deposit, ↑ withdraw)

## Database Schema

### Users Table
```sql
ALTER TABLE users ADD COLUMN stripe_account_id VARCHAR(255) NULLABLE;
```

### Wallets Table
- `id` - Primary key
- `user_id` - Foreign key (unique)
- `balance` - Total funds
- `available_balance` - Funds available for withdrawal
- `pending_balance` - Funds in-flight
- `currency` - ISO 4217 code (default: USD)
- `timestamps` - created_at, updated_at

### Transactions Table
- `id` - Primary key
- `wallet_id` - Foreign key
- `type` - 'deposit' | 'withdraw'
- `amount` - Transaction amount
- `reference` - External reference (Stripe ID)
- `status` - 'pending' | 'completed' | 'cancelled' | 'failed'
- `metadata` - JSON (stripe_session_id, stripe_transfer_id, etc.)
- `timestamps` - created_at, updated_at

### WalletEvents Table
- `id` - Primary key
- `wallet_id` - Foreign key
- `type` - Event type (deposit_initiated, deposit_confirmed, etc.)
- `payload` - JSON event data
- `created_at` - Immutable timestamp

## Stripe Configuration

### Environment Variables
```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Webhook Events
- `checkout.session.completed` - Deposit confirmation
- `charge.dispute.created` - Dispute handling
- `transfer.created` - Withdrawal confirmation

### Webhook Endpoint
```
POST /webhooks/stripe
```

## Balance Logic

```
balance = total_deposits - total_withdrawals
available_balance = balance - pending_balance
pending_balance = sum(pending_withdrawals)
```

## Error Handling

### Validation Errors (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "amount": ["Amount must be between $10 and $10,000"]
  }
}
```

### Authorization Errors (403)
```json
{
  "message": "This action is unauthorized."
}
```

### Business Logic Errors (422)
```json
{
  "message": "Insufficient available balance"
}
```

## Testing with Stripe CLI

### Setup
```bash
stripe listen --forward-to localhost:8000/webhooks/stripe
```

### Test Deposit
```bash
curl -X POST http://localhost:8000/api/wallet/deposit \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

### Simulate Webhook
```bash
stripe trigger checkout.session.completed
```

## Security Considerations

1. **Idempotency:** All webhook handlers check transaction status before processing
2. **Authorization:** WalletPolicy enforces user ownership
3. **Atomic Updates:** Balance updates use DB transactions
4. **Webhook Verification:** Stripe signature validation required
5. **Rate Limiting:** Implement per-user rate limits on deposit/withdraw
6. **PCI Compliance:** Never store card data (Stripe handles this)

## Performance Optimizations

1. **Eager Loading:** Wallet queries include transactions and events
2. **Indexing:** Transactions indexed by (wallet_id, status) and (wallet_id, created_at)
3. **Pagination:** Transaction history uses cursor-based pagination
4. **Caching:** React Query caches wallet state with 5-minute stale time
5. **Deduplication:** API client prevents duplicate concurrent requests

## Future Enhancements

1. **WebSocket Integration:** Real-time balance updates via Laravel Reverb
2. **Recurring Deposits:** Subscription-based funding
3. **Multi-Currency:** Support for multiple currencies
4. **Fee Structure:** Configurable deposit/withdrawal fees
5. **Dispute Resolution:** Admin interface for handling chargebacks
6. **Audit Logging:** Enhanced event sourcing with user actions
