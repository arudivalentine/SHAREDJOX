# Frontend API Client Guide

## Setup

### Environment Variables
Create `.env` in `apps/web/`:
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8080
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## API Client

### Basic Usage
```typescript
import { apiClient } from '@/system/api';

const response = await apiClient.get('/api/wallet');
const data = response.data.data;
```

### Request Interceptor
Automatically attaches Bearer token:
```
Authorization: Bearer {token}
```

### Response Interceptor
- **401 Unauthorized:** Redirects to `/login`
- **5xx Errors:** Retries with exponential backoff (max 3 retries)
- **Duplicate Requests:** Deduplicates identical concurrent calls

## React Query Hooks

### useApi
Fetch data with automatic caching.

```typescript
import { useApi } from '@/system/api';

function MyComponent() {
  const { data, isLoading, error } = useApi<WalletDTO>(
    'wallet',
    '/api/wallet'
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data?.balance}</div>;
}
```

### useApiMutation
Mutate data with automatic cache invalidation.

```typescript
import { useApiMutation } from '@/system/api';

function DepositForm() {
  const { mutate, isPending } = useApiMutation<
    { checkoutUrl: string },
    { amount: number }
  >('/api/wallet/deposit', 'post');

  const handleSubmit = (amount: number) => {
    mutate(
      { amount },
      {
        onSuccess: (data) => {
          window.open(data.checkoutUrl, '_blank');
        },
        onError: (error) => {
          console.error(error.response?.data?.message);
        },
      }
    );
  };

  return (
    <button onClick={() => handleSubmit(100)} disabled={isPending}>
      {isPending ? 'Processing...' : 'Deposit'}
    </button>
  );
}
```

### useInvalidateQuery
Manually invalidate cache.

```typescript
import { useInvalidateQuery } from '@/system/api';

function RefreshButton() {
  const invalidate = useInvalidateQuery();

  return (
    <button onClick={() => invalidate('wallet')}>
      Refresh Wallet
    </button>
  );
}
```

## Wallet API

### useGetWallet
```typescript
const { data: wallet, isLoading } = useGetWallet();

// wallet: WalletDTO
// {
//   id: 1,
//   userId: 1,
//   balance: 1500.00,
//   availableBalance: 1200.00,
//   pendingBalance: 300.00,
//   currency: 'USD',
//   createdAt: '2026-02-18T04:59:15Z',
//   updatedAt: '2026-02-18T04:59:15Z'
// }
```

### useInitiateDeposit
```typescript
const { mutate: initiateDeposit, isPending } = useInitiateDeposit();

initiateDeposit(
  { amount: 100 },
  {
    onSuccess: (data) => {
      // data.checkoutUrl - Stripe Checkout URL
      // data.sessionId - Stripe session ID
      // data.transaction - TransactionDTO
      window.open(data.checkoutUrl, '_blank');
    },
  }
);
```

### useInitiateWithdraw
```typescript
const { mutate: initiateWithdraw, isPending } = useInitiateWithdraw();

initiateWithdraw(
  { amount: 50 },
  {
    onSuccess: (data) => {
      // data.transferId - Stripe transfer ID
      // data.transaction - TransactionDTO
      console.log('Withdrawal initiated:', data.transferId);
    },
  }
);
```

### useGetTransactionHistory
```typescript
const { data: transactions, isLoading } = useGetTransactionHistory();

// transactions: TransactionDTO[]
// [
//   {
//     id: 1,
//     walletId: 1,
//     type: 'deposit',
//     amount: 100.00,
//     reference: 'stripe_pi_abc123',
//     status: 'completed',
//     metadata: { stripe_session_id: '...' },
//     createdAt: '2026-02-18T04:59:15Z',
//     updatedAt: '2026-02-18T04:59:15Z'
//   }
// ]
```

### useGetWalletEvents
```typescript
const { data: events, isLoading } = useGetWalletEvents();

// events: WalletEventDTO[]
// [
//   {
//     id: 1,
//     walletId: 1,
//     type: 'deposit_initiated',
//     payload: { amount: 100, transaction_id: 1 },
//     createdAt: '2026-02-18T04:59:15Z'
//   }
// ]
```

## Error Handling

### API Error Type
```typescript
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```

### Handling Errors
```typescript
const { mutate } = useApiMutation<Data, Variables>(url, 'post');

mutate(variables, {
  onError: (error) => {
    if (error.response?.status === 422) {
      const fieldErrors = error.response.data.errors;
      // Handle validation errors
      console.log(fieldErrors.amount?.[0]);
    } else if (error.response?.status === 403) {
      // Handle authorization error
      console.log('Unauthorized action');
    } else {
      // Handle other errors
      console.log(error.response?.data?.message);
    }
  },
});
```

## Optimistic Updates

```typescript
const { mutate } = useApiMutation<WalletDTO, { amount: number }>(
  '/api/wallet/deposit',
  'post'
);

mutate(
  { amount: 100 },
  {
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wallet'] });

      // Snapshot previous value
      const previousWallet = queryClient.getQueryData(['wallet']);

      // Optimistically update cache
      queryClient.setQueryData(['wallet'], (old: WalletDTO) => ({
        ...old,
        pendingBalance: old.pendingBalance + variables.amount,
      }));

      return { previousWallet };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousWallet) {
        queryClient.setQueryData(['wallet'], context.previousWallet);
      }
    },
  }
);
```

## Request Deduplication

Identical concurrent requests are automatically deduplicated:

```typescript
// These two calls will only make one HTTP request
const promise1 = apiClient.get('/api/wallet');
const promise2 = apiClient.get('/api/wallet');

// Both resolve with the same response
const [data1, data2] = await Promise.all([promise1, promise2]);
```

## Retry Logic

Failed requests are automatically retried with exponential backoff:

```
Attempt 1: Immediate
Attempt 2: 2 seconds
Attempt 3: 4 seconds
Attempt 4: 8 seconds (max)
```

Only GET requests are retried. POST/PUT/PATCH/DELETE are not retried to prevent duplicate operations.

## Type Safety

All API functions are fully typed:

```typescript
// TypeScript knows the response type
const { data } = useGetWallet();
// data is WalletDTO | undefined

// TypeScript knows the mutation variables
const { mutate } = useInitiateDeposit();
mutate({ amount: 100 }); // ✓ Correct
mutate({ invalid: 'field' }); // ✗ Type error
```

## Caching Strategy

- **Wallet:** 5-minute stale time, invalidated on deposit/withdraw
- **Transactions:** 5-minute stale time, invalidated on transaction changes
- **Events:** 10-minute stale time, invalidated on wallet changes

## Performance Tips

1. **Use React Query DevTools** to monitor cache state
2. **Avoid unnecessary refetches** by reusing hooks
3. **Implement pagination** for large datasets
4. **Use optimistic updates** for better UX
5. **Debounce search/filter** inputs before API calls

## Debugging

Enable verbose logging:

```typescript
import { apiClient } from '@/system/api';

apiClient.interceptors.request.use((config) => {
  console.log('Request:', config.method?.toUpperCase(), config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```
