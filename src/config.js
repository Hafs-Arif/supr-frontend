/**
 * Configuration for frontend integration
 */

export const CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.REACT_APP_API_ROOT || 'https://api.example.com/api/v1',
    TIMEOUT: 10000,
  },

  // WebSocket Configuration
  WEBSOCKET: {
    URL: process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws/connect',
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 3000,
    HEARTBEAT_INTERVAL: 30000,
  },

  // SOS Configuration
  SOS: {
    LOCATION_UPDATE_INTERVAL: 5000, // Update location every 5 seconds
    LOCATION_ACCURACY: 'high',
    LOCATION_TIMEOUT: 10000,
  },

  // Chat Configuration
  CHAT: {
    MAX_MESSAGE_LENGTH: 1000,
    AUTO_CONNECT: true,
  },

  // Feature Flags
  FEATURES: {
    ADMIN_SUPPORT_CHAT: true,
    SOS_LOCATION_TRACKING: true,
    LIVE_NOTIFICATIONS: true,
  },
};

export default CONFIG;
