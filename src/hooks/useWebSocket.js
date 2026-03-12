/**
 * Custom Hook for WebSocket Service
 * Manages WebSocket connection and message handling
 */

import { useEffect, useState, useCallback } from 'react';
import wsService from '../Services/WebSocketService';
import { useAuth } from '../Components/Auth/AuthContext';

export const useWebSocket = () => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const initConnection = async () => {
      try {
        await wsService.connect();
        setIsConnected(true);
        setConnectionError(null);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      }
    };

    const handleConnectionOpen = () => setIsConnected(true);
    const handleConnectionClose = () => setIsConnected(false);
    const handleConnectionError = (error) => {
      setConnectionError(error?.message || 'Connection error');
      setIsConnected(false);
    };

    initConnection();

    wsService.on('connection_open', handleConnectionOpen);
    wsService.on('connection_close', handleConnectionClose);
    wsService.on('connection_error', handleConnectionError);

    return () => {
      wsService.off('connection_open', handleConnectionOpen);
      wsService.off('connection_close', handleConnectionClose);
      wsService.off('connection_error', handleConnectionError);
    };
  }, [isAuthenticated]);

  const subscribe = useCallback((messageType, handler) => {
    wsService.on(messageType, handler);
    return () => wsService.off(messageType, handler);
  }, []);

  const sendMessage = useCallback((type, data) => {
    if (type === 'admin_support_chat') {
      return wsService.sendChatToAdmin(data.content, data.metadata);
    } else if (type === 'sos_location') {
      return wsService.sendSOSLocation(data.sosAlertId, data.latitude, data.longitude);
    }
    return false;
  }, []);

  return {
    isConnected,
    connectionError,
    subscribe,
    sendMessage,
    wsService,
  };
};

export default useWebSocket;
