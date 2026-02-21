import { useEffect, useRef, useCallback } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuthStore } from '../stores/authStore';

interface WebSocketMessage {
  event: string;
  data: any;
}

interface ChannelSubscription {
  channel: string;
  onMessage: (data: any) => void;
}

let echoInstance: Echo | null = null;

export function useWebSocket() {
  const token = useAuthStore((state) => state.token);
  const subscriptionsRef = useRef<Map<string, ChannelSubscription>>(new Map());
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  const isConnectedRef = useRef(false);

  const initializeEcho = useCallback(() => {
    if (echoInstance) {
      return echoInstance;
    }

    if (!token) {
      return null;
    }

    window.Pusher = Pusher;

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: 'sharedjox',
      wsHost: import.meta.env.VITE_WS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
      wsPort: 8080,
      wssPort: 443,
      forceTLS: false,
      encrypted: false,
      disableStats: true,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    echoInstance.connector.socket.on('connect', () => {
      isConnectedRef.current = true;
      processMessageQueue();
    });

    echoInstance.connector.socket.on('disconnect', () => {
      isConnectedRef.current = false;
    });

    return echoInstance;
  }, [token]);

  const processMessageQueue = useCallback(() => {
    while (messageQueueRef.current.length > 0) {
      const message = messageQueueRef.current.shift();
      if (message) {
        const subscription = subscriptionsRef.current.get(message.event);
        if (subscription) {
          subscription.onMessage(message.data);
        }
      }
    }
  }, []);

  const subscribe = useCallback(
    (channel: string, onMessage: (data: any) => void) => {
      const echo = initializeEcho();
      if (!echo) {
        return () => {};
      }

      subscriptionsRef.current.set(channel, { channel, onMessage });

      const isPrivate = channel.startsWith('user.') || channel.startsWith('job.');
      const echoChannel = isPrivate ? echo.private(channel) : echo.channel(channel);

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

      echoChannel.listen('.job.posted', handleMessage);
      echoChannel.listen('.job.claimed', handleMessage);
      echoChannel.listen('.job.updated', handleMessage);
      echoChannel.listen('.wallet.updated', handleMessage);

      return () => {
        subscriptionsRef.current.delete(channel);
        echo.leave(channel);
      };
    },
    [initializeEcho]
  );

  const subscribeToDiscovery = useCallback(
    (onJobPosted: (job: any) => void) => {
      return subscribe('jobs.discovery', (data) => {
        if (data.job) {
          onJobPosted(data);
        }
      });
    },
    [subscribe]
  );

  const subscribeToJob = useCallback(
    (jobId: number, onUpdate: (data: any) => void) => {
      return subscribe(`job.${jobId}`, onUpdate);
    },
    [subscribe]
  );

  const subscribeToUser = useCallback(
    (userId: number, onUpdate: (data: any) => void) => {
      return subscribe(`user.${userId}`, onUpdate);
    },
    [subscribe]
  );

  const isConnected = useCallback(() => {
    return isConnectedRef.current;
  }, []);

  useEffect(() => {
    if (token) {
      initializeEcho();
    }

    return () => {
      if (echoInstance && !token) {
        echoInstance.disconnect();
        echoInstance = null;
      }
    };
  }, [token, initializeEcho]);

  return {
    subscribe,
    subscribeToDiscovery,
    subscribeToJob,
    subscribeToUser,
    isConnected,
  };
}
