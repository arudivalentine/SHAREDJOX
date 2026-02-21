# Phase 4: Quick Start Guide

## What's New

Phase 4 adds the complete frontend marketplace with:
- Tinder-like job discovery page
- Real-time job claiming
- Job completion interface
- Navigation shell
- Protected routes

## File Structure

```
apps/web/src/
├── App.tsx                          # Main app with routing
├── main.tsx                         # React entry point
├── index.css                        # Global styles
├── index.html                       # HTML template
├── domains/
│   ├── auth/
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── VerifyPage.tsx
│   │       └── ProfilePage.tsx      # NEW
│   ├── jobs/
│   │   ├── pages/
│   │   │   ├── DiscoveryPage.tsx    # NEW - Main discovery
│   │   │   ├── ClaimedJobPage.tsx   # NEW - Job details
│   │   │   ├── PostJobPage.tsx      # NEW - Post wizard
│   │   │   ├── MyJobsPage.tsx       # NEW - Dashboard
│   │   │   └── index.ts
│   │   └── components/
│   │       ├── JobCard.tsx          # NEW - Job card
│   │       ├── CardStack.tsx        # NEW - Card stack
│   │       └── index.ts
│   └── wallet/
│       └── pages/
│           └── WalletPage.tsx
└── system/
    ├── components/
    │   ├── DashboardLayout.tsx      # NEW - Navigation shell
    │   ├── ProtectedRoute.tsx       # NEW - Auth wrapper
    │   ├── Toast.tsx                # NEW - Notifications
    │   └── ...
    ├── api/
    │   ├── useApi.ts                # UPDATED - URL params
    │   └── ...
    ├── stores/
    │   └── authStore.ts
    ├── hooks/
    │   └── useWebSocket.ts
    └── tokens.ts                    # NEW - Design tokens
```

## Running the App

### Development
```bash
cd apps/web
npm run dev
```

Then open http://localhost:5173

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## Key Routes

| Route | Component | Auth Required |
|-------|-----------|---------------|
| `/login` | LoginPage | No |
| `/verify` | VerifyPage | No |
| `/discovery` | DiscoveryPage | Yes |
| `/claimed/:id` | ClaimedJobPage | Yes |
| `/post` | PostJobPage | Yes |
| `/my-jobs` | MyJobsPage | Yes |
| `/wallet` | WalletPage | Yes |
| `/profile` | ProfilePage | Yes |

## Main Features

### Discovery Page
- Drag right to claim
- Drag left to skip
- Drag up to save
- Real-time updates
- Toast notifications

### Claimed Job Page
- 2-hour countdown timer
- File upload
- Notes textarea
- Submit/Cancel buttons

### Post Job Page
- 3-step wizard
- Budget validation
- Skill selection
- Fee breakdown

### My Jobs Page
- Posted vs Claimed tabs
- Status badges
- Real-time updates

### Navigation
- Desktop: Left sidebar
- Mobile: Bottom tab bar
- 5 nav items
- Active state highlighting

## Environment Variables

```
VITE_API_URL=http://localhost/api
VITE_WS_URL=ws://localhost:8080
```

## Component Usage

### Toast Notifications
```typescript
import { showToast } from '@/system/components/Toast';

// Success
showToast('Job claimed!', 'success');

// Error
showToast('Failed to claim', 'error');

// Loading
showToast('Submitting...', 'loading');
```

### Protected Routes
```typescript
<ProtectedLayout>
  <DashboardLayout>
    <DiscoveryPage />
  </DashboardLayout>
</ProtectedLayout>
```

### WebSocket
```typescript
import { useWebSocket } from '@/system/hooks/useWebSocket';

const { subscribeToDiscovery } = useWebSocket();

useEffect(() => {
  const unsubscribe = subscribeToDiscovery((job) => {
    console.log('New job:', job);
  });
  
  return () => unsubscribe?.();
}, []);
```

## Design System

### Colors
- Cyan: `#06B6D4`
- Violet: `#A78BFA`
- Red: `#EF4444`
- Green: `#22C55E`

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px

## Common Tasks

### Add a New Page
1. Create file in `domains/{domain}/pages/`
2. Add route in `App.tsx`
3. Add nav item in `DashboardLayout.tsx`

### Add a New Component
1. Create file in `domains/{domain}/components/`
2. Export from `index.ts`
3. Import and use in pages

### Update Design Tokens
1. Edit `system/tokens.ts`
2. Import in components
3. Use in styles

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Failed
- Check `VITE_WS_URL` in `.env`
- Ensure Reverb is running on port 8080
- Check browser console for errors

### Auth Token Expired
- Clear localStorage
- Log out and log back in
- Check token in browser DevTools

## Documentation

- `docs/PHASE_4_SUMMARY.md` - Overview
- `docs/implementation/PHASE_4_DISCOVERY_UI.md` - Detailed guide
- `docs/implementation/PHASE_4_COMPLETE.md` - Completion report

## Next Steps

1. Test the discovery flow
2. Test real-time updates
3. Test navigation
4. Test protected routes
5. Test mobile responsiveness

---

**Phase 4 Status:** Complete ✓
**Date:** February 21, 2026

