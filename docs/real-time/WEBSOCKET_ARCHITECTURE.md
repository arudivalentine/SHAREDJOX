# WebSocket Architecture - Real-Time Layer

## Overview

SharedJox uses Laravel Reverb for real-time updates. The system broadcasts events to public and private channels, enabling instant notifications for job posts, claims, and wallet updates.

## Architecture

### Backend: Laravel Reverb
- **Server:** Runs on port 8080
- **Broadcaster:** Redis (for scalability)
- **Authentication:** Sanctum tokens via Bearer header
- **Channels:** Public (jobs.discovery) and Private (job.*, user.*)

### Frontend: Laravel Echo + Pusher.js
- **Client:** Connects to Reverb via WebSocket
- **Authentication:** Bearer token in headers
- **Subscriptions:** Automatic reconnection and message queuing
- **Channels:** Subscribes based on user role and context

## Configuration

### Backend (.env)
```
BROADCAST_DRIVER=reverb
REVERB_APP_KEY=sharedjox
REVERB_APP_SECRET=sharedjox-secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=http
```

### Frontend (.env)
```
VITE_WS_URL=ws://localhost:8080
```

## Events

### JobPostedEvent
**Channel:** `jobs.discovery` (public)
**Trigger:** PostJobAction completes
**Payload:**
```json
{
  "job": {
    "id": 1,
    "clientId": 2,
    "title": "Build React Dashboard",
    "budgetMin": 50,
    "budgetMax": 150,
    "status": "active",
    "requiredSkills": ["react", "typescript"],
    "estimatedDuration": 120,
    "createdAt": "2026-02-21T10:00:00Z"
  },
  "matchScore": 50,
  "timestamp": "2026-02-21T10:00:00Z"
}
```

### JobClaimedEvent
**Channels:** 
- `job.{jobId}` (private - client & freelancer)
- `user.{clientId}` (private - client notification)

**Trigger:** ClaimJobAction completes
**Payload:**
```json
{
  "jobId": 1,
  "claimedBy": 3,
  "claimedAt": "2026-02-21T10:05:00Z",
  "matchScore": 100,
  "timestamp": "2026-02-21T10:05:00Z"
}
```

### JobUpdatedEvent
**Channel:** `job.{jobId}` (private)
**Trigger:** Job status changes
**Payload:**
```json
{
  "jobId": 1,
  "status": "completed",
  "deliverables": ["source code", "documentation"],
  "updatedAt": "2026-02-21T10:30:00Z",
  "timestamp": "2026-02-21T10:30:00Z"
}
```

### WalletUpdatedEvent
**Channel:** `user.{userId}` (private)
**Trigger:** ConfirmTransactionAction completes
**Payload:**
```json
{
  "userId": 3,
  "newBalance": 145.00,
  "availableBalance": 145.00,
  "transactionType": "job_earning",
  "amount": 45.00,
  "timestamp": "2026-02-21T10:30:00Z"
}
```

## Channel Authorization

### routes/channels.php
```php
// Public channel - anyone can subscribe
Broadcast::channel('jobs.discovery', function () {
    return true;
});

// Private channel - only client or claimed freelancer
Broadcast::channel('job.{jobId}', function (User $user, int $jobId) {
    $job = Job::find($jobId);
    return $user->id === $job->client_id || $user->id === $job->claimed_by;
});

// Private channel - only the user
Broadcast::channel('user.{userId}', function (User $user, int $userId) {
    return $user->id === $userId;
});
```

## Frontend Integration

### useWebSocket Hook
```typescript
import { useWebSocket } from '@/system/hooks/useWebSocket';

function DiscoveryPage() {
  const { subscribeToDiscovery } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribeToDiscovery((data) => {
      console.log('New job posted:', data.job);
      // Add to discovery feed
    });

    return unsubscribe;
  }, [subscribeToDiscovery]);
}
```

### Subscribe to Job Updates
```typescript
function ClaimedJobPage({ jobId }) {
  const { subscribeToJob } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribeToJob(jobId, (data) => {
      console.log('Job updated:', data);
      // Update job status
    });

    return unsubscribe;
  }, [jobId, subscribeToJob]);
}
```

### Subscribe to Wallet Updates
```typescript
function WalletPage() {
  const { subscribeToUser } = useWebSocket();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUser(user.id, (data) => {
      console.log('Wallet updated:', data);
      // Update balance display
    });

    return unsubscribe;
  }, [user?.id, subscribeToUser]);
}
```

## Message Queuing

When the WebSocket is disconnected, messages are queued and processed when reconnected:

```typescript
const messageQueueRef = useRef<WebSocketMessage[]>([]);

const handleMessage = (data: any) => {
  if (isConnectedRef.current) {
    onMessage(data);
  } else {
    messageQueueRef.current.push({
      event: channel,
      data,
    });
  }
};
```

## Reconnection Strategy

- **Automatic:** Echo handles reconnection automatically
- **Backoff:** Exponential backoff on failed connections
- **Queue:** Messages queued during disconnection
- **Resubscribe:** Channels resubscribed on reconnect

## Performance Considerations

### Broadcasting
- Events queued to Redis for async processing
- Reduces request latency
- Scales horizontally with multiple Reverb instances

### Subscriptions
- Lazy subscribe (only when needed)
- Unsubscribe on component unmount
- Limit concurrent subscriptions

### Message Size
- Minimal payloads (IDs, not full objects)
- Clients fetch full data via REST API
- Reduces bandwidth usage

## Debugging

### Enable Logging
```typescript
// In useWebSocket.ts
echoInstance.connector.socket.on('connect', () => {
  console.log('WebSocket connected');
});

echoInstance.connector.socket.on('disconnect', () => {
  console.log('WebSocket disconnected');
});
```

### Monitor Events
```typescript
// In browser console
window.Echo.channel('jobs.discovery').listen('.job.posted', (data) => {
  console.log('Job posted:', data);
});
```

## Scaling

### Single Server
- Reverb on port 8080
- Redis for broadcasting
- Suitable for < 1000 concurrent users

### Multiple Servers
- Load balance Reverb instances
- Shared Redis for broadcasting
- Sticky sessions for WebSocket connections

### Production
- Use WSS (WebSocket Secure) with TLS
- Configure CORS for allowed origins
- Monitor connection count and message throughput

## Troubleshooting

### Connection Fails
- Check Reverb server is running
- Verify REVERB_HOST and REVERB_PORT
- Check firewall allows port 8080

### Messages Not Received
- Verify channel authorization
- Check user is authenticated
- Monitor Redis for message delivery

### High Latency
- Check network latency
- Monitor Reverb CPU/memory
- Consider message batching

## Future Enhancements

1. **Presence Channels** - Show who's viewing a job
2. **Typing Indicators** - Real-time chat preparation
3. **Notifications** - Push notifications for important events
4. **Analytics** - Track event throughput and latency
5. **Clustering** - Multiple Reverb instances with load balancing
