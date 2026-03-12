/**
 * WebSocket Service
 * Manages WebSocket connection for Admin Support Chat and SOS Location Tracking
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws/connect';
    this.token = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.messageHandlers = {};
    this.isConnecting = false;
    this.pendingConnection = null;  // Store pending connection promise
  }

  /**
   * Connect to WebSocket server
   */
  connect(authToken) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return Promise.resolve();
    }

    // If already connecting, return the pending promise
    if (this.isConnecting && this.pendingConnection) {
      console.log('⏳ Connection already in progress, waiting...');
      return this.pendingConnection;
    }

    this.token = authToken || localStorage.getItem('accessToken');
    if (!this.token) {
      return Promise.reject(new Error('No authentication token available'));
    }

    this.isConnecting = true;

    this.pendingConnection = new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.url}?token=${this.token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.pendingConnection = null;
          resolve();
          this.emit('connection_open');
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.pendingConnection = null;
          reject(error);
          this.emit('connection_error', error);
        };

        this.ws.onclose = () => {
          console.log('⚠️ WebSocket disconnected');
          this.isConnecting = false;
          this.pendingConnection = null;
          this.emit('connection_close');
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        this.pendingConnection = null;
        reject(error);
      }
    });

    return this.pendingConnection;
  }

  /**
   * Send admin support chat message
   */
  sendChatToAdmin(content, metadata = {}) {
    if (!this.isConnected()) {
      console.error('WebSocket not connected');
      return false;
    }

    const message = {
      type: 'admin_support_chat',
      data: {
        content: content,
        metadata: metadata,
      },
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log('💬 Chat sent to admin');
      return true;
    } catch (error) {
      console.error('Failed to send chat:', error);
      return false;
    }
  }

  /**
   * Send SOS location update
   */
  sendSOSLocation(sosAlertId, latitude, longitude) {
    if (!this.isConnected()) {
      console.error('WebSocket not connected');
      return false;
    }

    const message = {
      type: 'sos_location_update',
      data: {
        sosAlertId: sosAlertId,
        latitude: latitude,
        longitude: longitude,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send SOS location:', error);
      return false;
    }
  }

  /**
   * Register message handler for specific message type
   */
  on(messageType, callback) {
    if (!this.messageHandlers[messageType]) {
      this.messageHandlers[messageType] = [];
    }
    this.messageHandlers[messageType].push(callback);
  }

  /**
   * Unregister message handler
   */
  off(messageType, callback) {
    if (this.messageHandlers[messageType]) {
      this.messageHandlers[messageType] = this.messageHandlers[messageType].filter(
        (cb) => cb !== callback
      );
    }
  }

  /**
   * Emit event (internal use)
   */
  emit(eventType, data = null) {
    if (this.messageHandlers[eventType]) {
      this.messageHandlers[eventType].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in handler for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(message) {
    const { type, data } = message;

    console.log(`📨 Received message type: ${type}`);

    switch (type) {
      case 'chat_message':
        this.handleChatMessage(data);
        break;
      case 'sos_alert':
        this.handleSOSAlert(data);
        break;
      case 'connection_ack':
        console.log('✅ Server acknowledged connection');
        break;
      default:
        this.emit(type, data);
    }
  }

  /**
   * Handle chat message from admin
   */
  handleChatMessage(data) {
    if (data.adminSupport) {
      this.emit('admin_chat_message', data);
      console.log('💬 Message from admin:', data.content);
    }
  }

  /**
   * Handle SOS alert updates
   */
  handleSOSAlert(data) {
    this.emit('sos_update', data);
    console.log('🚨 SOS Update:', data);
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );

      setTimeout(() => {
        if (this.token) {
          this.connect(this.token).catch((error) => {
            console.error('Reconnection failed:', error);
          });
        }
      }, this.reconnectDelay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_exceeded');
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    if (!this.ws) return 'DISCONNECTED';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'DISCONNECTED';
      default:
        return 'UNKNOWN';
    }
  }
}

// Create singleton instance
const wsService = new WebSocketService();

export default wsService;
