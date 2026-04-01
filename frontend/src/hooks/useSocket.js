// WebSocket hook for real-time updates
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        withCredentials: true,
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, []);

  return { socket, isConnected };
};

export const useFoodMonitor = (foodId, onUpdate) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !foodId) return;

    // Join food monitoring room
    socket.emit('monitor-food', foodId);

    // Listen for price updates
    const handlePriceUpdate = (data) => {
      if (data.foodId === foodId && onUpdate) {
        onUpdate(data);
      }
    };

    socket.on('price-update', handlePriceUpdate);

    return () => {
      socket.off('price-update', handlePriceUpdate);
    };
  }, [socket, foodId, onUpdate]);

  return { isConnected };
};

export const useHotelDashboard = (hotelId, callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !hotelId) return;

    // Join hotel room
    socket.emit('join-hotel', hotelId);

    // Listen for various events
    const handleStatusChange = (data) => {
      if (callbacks.onStatusChange) {
        callbacks.onStatusChange(data);
      }
    };

    const handleAgentDecision = (data) => {
      if (callbacks.onAgentDecision) {
        callbacks.onAgentDecision(data);
      }
    };

    const handleAnalyticsUpdate = (data) => {
      if (callbacks.onAnalyticsUpdate) {
        callbacks.onAnalyticsUpdate(data);
      }
    };

    socket.on('status-change', handleStatusChange);
    socket.on('agent-decision', handleAgentDecision);
    socket.on('analytics-update', handleAnalyticsUpdate);

    return () => {
      socket.off('status-change', handleStatusChange);
      socket.off('agent-decision', handleAgentDecision);
      socket.off('analytics-update', handleAnalyticsUpdate);
    };
  }, [socket, hotelId, callbacks]);

  return { isConnected };
};
