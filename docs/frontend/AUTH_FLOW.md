# Authentication Flow

## Magic Link Flow

1. **LoginPage**: User enters email
2. **Send Link**: POST /api/auth/send-link → Creates user, generates token
3. **Email**: User receives link with token in query param
4. **VerifyPage**: User clicks link → POST /api/auth/verify-link → Receives API token
5. **Store**: Token saved to localStorage, user redirected to dashboard

## Components

**LoginPage**
- Email input with validation
- Loading state during send
- Success confirmation message
- Error handling with user-friendly messages

**VerifyPage**
- Automatic verification on mount
- Loading skeleton during verification
- Success animation with redirect
- Error state with retry link

## State Management

**useAuthStore** (Zustand)
- `token`: API token from Sanctum
- `user`: Current user profile
- `isAuthenticated`: Boolean flag
- `setToken()`: Save token to localStorage
- `setUser()`: Update user profile
- `logout()`: Clear auth state
- `loadFromStorage()`: Restore from localStorage on app init

## Usage

```tsx
import { useAuthStore } from '@/system/stores/authStore';

function Dashboard() {
  const { user, logout } = useAuthStore();

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## API Integration

All authenticated requests include header:
```
Authorization: Bearer {token}
```

Fetch wrapper (to be created):
```tsx
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${useAuthStore.getState().token}`
  }
});
```
