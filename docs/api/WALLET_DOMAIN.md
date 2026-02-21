# Wallet Domain

Event-sourced wallet system with deposit/withdraw operations and complete audit trail.

## Architecture

### Models

**Wallet**
- `balance`: Total funds (deposits - withdrawals)
- `available_balance`: Funds available for withdrawal
- `pending_balance`: Funds in-flight (pending withdrawals)
- Relations: User (1:1), Transactions (1:N), Events (1:N)

**Transaction**
- `type`: 'deposit' | 'withdraw'
- `status`: 'pending' | 'completed' | 'cancelled' | 'failed'
- `amount`: Transaction amount
- `reference`: External reference (Stripe ID, etc.)
- `metadata`: JSON payload for extensibility

**WalletEvent** (Event Sourcing)
- `type`: Event type (deposit_initiated, deposit_confirmed, withdrawal_initiated, etc.)
- `payload`: Event data (immutable audit trail)
- `created_at`: Timestamp (no updates)

### Actions

**DepositAction**
```php
$action = new DepositAction();
$transaction = $action->execute($wallet, 100.00, 'stripe_pi_123', ['method' => 'card']);
```

**WithdrawAction**
```php
$action = new WithdrawAction();
$transaction = $action->execute($wallet, 50.00, 'stripe_payout_123');
```

**ConfirmTransactionAction**
```php
$action = new ConfirmTransactionAction();
$action->execute($transaction);
```

**CancelWithdrawAction**
```php
$action = new CancelWithdrawAction();
$action->execute($transaction);
```

### Event Types

| Event | Payload | Trigger |
|-------|---------|---------|
| `deposit_initiated` | amount, reference, transaction_id | Deposit created |
| `deposit_confirmed` | amount, transaction_id, new_balance | Deposit completed |
| `withdrawal_initiated` | amount, reference, transaction_id | Withdrawal created |
| `withdrawal_confirmed` | amount, transaction_id, new_balance | Withdrawal completed |
| `withdrawal_cancelled` | amount, transaction_id | Withdrawal cancelled |

## Balance Logic

```
balance = total_deposits - total_withdrawals
available_balance = balance - pending_balance
pending_balance = sum(pending_withdrawals)
```

## Authorization

WalletPolicy enforces user ownership:
- Users can only view/modify their own wallet
- All operations require `$this->authorize('action', $wallet)`

## Database Schema

### wallets
- id, user_id (unique), balance, available_balance, pending_balance, currency, timestamps

### transactions
- id, wallet_id, type, amount, reference, status, metadata, timestamps
- Indexes: (wallet_id, status), (wallet_id, created_at), reference

### wallet_events
- id, wallet_id, type, payload, created_at (immutable)
- Indexes: (wallet_id, created_at), type

## Usage Example

```php
$wallet = $repository->findOrCreateByUser($user);

// Initiate deposit
$depositTx = (new DepositAction())->execute(
    $wallet,
    100.00,
    'stripe_pi_abc123',
    ['method' => 'card', 'last4' => '4242']
);

// Confirm after Stripe webhook
(new ConfirmTransactionAction())->execute($depositTx);

// Initiate withdrawal
$withdrawTx = (new WithdrawAction())->execute(
    $wallet,
    50.00,
    'stripe_payout_xyz789'
);

// View audit trail
$events = $repository->getEventHistory($wallet);
```

## Event Sourcing Benefits

- Complete audit trail of all wallet operations
- Ability to replay events for reconciliation
- Immutable record for compliance
- Easy debugging of balance discrepancies
