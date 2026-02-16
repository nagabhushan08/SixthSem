import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let client: Client | null = null;

export interface TrackingMessage {
  bookingId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

export const connectWebSocket = (): Client => {
  if (client && client.connected) {
    return client;
  }

  const token = localStorage.getItem('accessToken');
  client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws/tracking') as any,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('WebSocket connected');
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame);
    },
  });

  client.activate();
  return client;
};

export const subscribeToTracking = (
  bookingId: number,
  onMessage: (message: TrackingMessage) => void
): (() => void) => {
  let subscription: any = null;

  const subscribe = () => {
    if (client && client.connected) {
      subscription = client.subscribe(`/topic/tracking/${bookingId}`, (message) => {
        const data: TrackingMessage = JSON.parse(message.body);
        onMessage(data);
      });
    }
  };

  if (!client || !client.connected) {
    const newClient = connectWebSocket();
    newClient.onConnect = () => {
      console.log('WebSocket connected via subscribeToTracking');
      subscribe();
    };
  } else {
    subscribe();
  }

  return () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  };
};

export const sendLocationUpdate = (bookingId: number, latitude: number, longitude: number) => {
  if (!client || !client.connected) {
    return;
  }

  const message: TrackingMessage = {
    bookingId,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
  };

  client.publish({
    destination: `/app/tracking/update`,
    body: JSON.stringify(message),
  });
};

export const disconnectWebSocket = () => {
  if (client) {
    client.deactivate();
    client = null;
  }
};
