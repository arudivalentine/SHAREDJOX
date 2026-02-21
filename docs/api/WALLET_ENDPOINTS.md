# Wallet API Endpoints

All endpoints require `Authorization: Bearer {token}` header.

## GET /api/wallet

Retrieve current wallet state.

**Response:**
```json
{
  "data": {
    "id": 1,
    "userId": 1,
    "balance": 1500.00,
    "availableBalance": 1200.00,
    "pendingBalance": 300.00,
    "currency": "USD",
    "createdAt": "2026-02-18T04:59:15Z",
    "updatedAt": "2026-02-18T04:59:15Z"
  }
}
```

## POST /api/wallet/deposit

Initiate a deposit transaction.

**Request:**
```json
{
  "amount": 100.00,
  "reference": "stripe_pi_abc123",
  "metadata": {
    "method": "card",
    "last4": "4242"
  }
}
```

**Response:** 201 Created
```json
{
  "data": {
    "id": 1,
    "walletId": 1,
    "type": "deposit",
    "amount": 100.00,
    "reference": "stripe_pi_abc123",
    "status": "pending",
    "metadata": { "method": "card", "last4": "4242" },
    "createdAt": "2026-02-18T04:59:15Z",
    "updatedAt": "2026-02-18T04:59:15Z"
  }
}
```

## POST /api/wallet/withdraw

Initiate a withdrawal transaction.

**Request:**
```json
{
  "amount": 50.00,
  "reference": "stripe_payout_xyz789",
  "metadata": {
    "destination": "bank_account"
  }
}
```

**Response:** 201 Created
```json
{
  "data": {
    "id": 2,
    "walletId": 1,
    "type": "withdraw",
    "amount": 50.00,
    "reference": "stripe_payout_xyz789",
    "status": "pending",
    "metadata": { "destination": "bank_account" },
    "createdAt": "2026-02-18T04:59:15Z",
    "updatedAt": "2026-02-18T04:59:15Z"
  }
}
```

**Errors:**
- 422: Insufficient available balance

## POST /api/transactions/{id}/confirm

Confirm a pending transaction (called after payment processor webhook).

**Response:**
```json
{
  "data": {
    "id": 1,
    "walletId": 1,
    "type": "deposit",
    "amount": 100.00,
    "reference": "stripe_pi_abc123",
    "status": "completed",
    "metadata": { "method": "card", "last4": "4242" },
    "createdAt": "2026-02-18T04:59:15Z",
    "updatedAt": "2026-02-18T04:59:15Z"
  }
}
```

## GET /api/transactions

List transaction history.

**Query Parameters:**
- `limit`: Max results (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "walletId": 1,
      "type": "deposit",
      "amount": 100.00,
      "reference": "stripe_pi_abc123",
      "status": "completed",
      "metadata": { "method": "card", "last4": "4242" },
      "createdAt": "2026-02-18T04:59:15Z",
      "updatedAt": "2026-02-18T04:59:15Z"
    }
  ]
}
```

## GET /api/wallet/events

Retrieve wallet event audit trail.

**Query Parameters:**
- `limit`: Max events (default: 100, max: 500)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "walletId": 1,
      "type": "deposit_initiated",
      "payload": {
        "amount": 100.00,
        "reference": "stripe_pi_abc123",
        "transaction_id": 1
      },
      "createdAt": "2026-02-18T04:59:15Z"
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
      "createdAt": "2026-02-18T04:59:16Z"
    }
  ]
}
```

## Error Responses

**401 Unauthorized**
```json
{
  "message": "Unauthenticated."
}
```

**403 Forbidden**
```json
{
  "message": "This action is unauthorized."
}
```

**422 Unprocessable Entity**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "amount": ["The amount must be at least 0.01"]
  }
}
```
