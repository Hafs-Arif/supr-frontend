/**
 * Message Queue Service
 * Handles persistent message queuing for offline scenarios
 * Ensures admin messages are not lost if connection drops
 */

class MessageQueueService {
  constructor() {
    this.QUEUE_KEY = 'admin_message_queue';
    this.FAILED_KEY = 'admin_failed_messages';
    this.MAX_RETRIES = 5;
    this.RETRY_DELAY = 2000; // milliseconds
    this.queue = [];
    this.failedMessages = [];
    this.isProcessing = false;
    this.loadFromStorage();
  }

  /**
   * Add message to queue
   * @param {string} conversationId - Chat conversation ID
   * @param {string} messageContent - Message content
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Queued message with id and timestamp
   */
  queueMessage(conversationId, messageContent, metadata = {}) {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      content: messageContent,
      metadata,
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'queued', // queued, sending, sent, failed
      error: null,
    };

    this.queue.push(message);
    this.saveToStorage();

    console.log(`📤 Message queued for ${conversationId}:`, message);

    return message;
  }

  /**
   * Mark message as sent
   * @param {string} messageId - Message ID
   */
  markAsSent(messageId) {
    const message = this.queue.find((m) => m.id === messageId);
    if (message) {
      message.status = 'sent';
      this.saveToStorage();
      console.log(`✅ Message ${messageId} marked as sent`);
    }
  }

  /**
   * Mark message as sending
   * @param {string} messageId - Message ID
   */
  markAsSending(messageId) {
    const message = this.queue.find((m) => m.id === messageId);
    if (message) {
      message.status = 'sending';
      this.saveToStorage();
      console.log(`⏳ Message ${messageId} is sending`);
    }
  }

  /**
   * Mark message as failed
   * @param {string} messageId - Message ID
   * @param {string} error - Error message
   * @returns {boolean} True if can retry, false if max retries reached
   */
  markAsFailed(messageId, error) {
    const message = this.queue.find((m) => m.id === messageId);
    if (!message) return false;

    message.error = error;
    message.retries += 1;

    if (message.retries >= this.MAX_RETRIES) {
      message.status = 'failed';
      this.failedMessages.push({ ...message });
      console.error(`❌ Message ${messageId} failed after ${message.retries} retries:`, error);
      this.saveToStorage();
      return false;
    }

    message.status = 'queued';
    console.warn(
      `⚠️ Message ${messageId} failed (retry ${message.retries}/${this.MAX_RETRIES}):`,
      error
    );
    this.saveToStorage();
    return true;
  }

  /**
   * Get all queued messages
   * @returns {Array} Array of queued messages
   */
  getQueuedMessages() {
    return this.queue.filter((m) => m.status === 'queued');
  }

  /**
   * Get messages for specific conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Array} Messages for that conversation
   */
  getMessagesByConversation(conversationId) {
    return this.queue.filter((m) => m.conversationId === conversationId);
  }

  /**
   * Get failed messages
   * @returns {Array} Array of permanently failed messages
   */
  getFailedMessages() {
    return [...this.failedMessages];
  }

  /**
   * Clear sent messages from queue
   */
  clearSentMessages() {
    const initialCount = this.queue.length;
    this.queue = this.queue.filter((m) => m.status !== 'sent');
    const clearedCount = initialCount - this.queue.length;
    if (clearedCount > 0) {
      console.log(`🗑️ Cleared ${clearedCount} sent messages from queue`);
      this.saveToStorage();
    }
  }

  /**
   * Clear failed messages
   */
  clearFailedMessages() {
    this.failedMessages = [];
    this.saveToStorage();
    console.log('🗑️ Cleared all failed messages');
  }

  /**
   * Get queue statistics
   * @returns {Object} Queue stats
   */
  getStats() {
    return {
      total: this.queue.length,
      queued: this.queue.filter((m) => m.status === 'queued').length,
      sending: this.queue.filter((m) => m.status === 'sending').length,
      sent: this.queue.filter((m) => m.status === 'sent').length,
      failed: this.queue.filter((m) => m.status === 'failed').length,
      permanentlyFailed: this.failedMessages.length,
    };
  }

  /**
   * Save queue to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(
        this.QUEUE_KEY,
        JSON.stringify({
          queue: this.queue,
          timestamp: new Date().toISOString(),
        })
      );

      localStorage.setItem(
        this.FAILED_KEY,
        JSON.stringify({
          messages: this.failedMessages,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('❌ Failed to save message queue to storage:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  loadFromStorage() {
    try {
      const queueData = localStorage.getItem(this.QUEUE_KEY);
      if (queueData) {
        const { queue } = JSON.parse(queueData);
        this.queue = queue || [];
        console.log(`📂 Loaded ${this.queue.length} queued messages from storage`);
      }

      const failedData = localStorage.getItem(this.FAILED_KEY);
      if (failedData) {
        const { messages } = JSON.parse(failedData);
        this.failedMessages = messages || [];
        console.log(`📂 Loaded ${this.failedMessages.length} failed messages from storage`);
      }
    } catch (error) {
      console.error('⚠️ Failed to load message queue from storage:', error);
    }
  }

  /**
   * Clear all messages
   */
  clear() {
    this.queue = [];
    this.failedMessages = [];
    localStorage.removeItem(this.QUEUE_KEY);
    localStorage.removeItem(this.FAILED_KEY);
    console.log('🗑️ Cleared all messages');
  }

  /**
   * Get detailed queue info for debugging
   */
  getDebugInfo() {
    return {
      stats: this.getStats(),
      queued: this.queue.filter((m) => m.status === 'queued'),
      sending: this.queue.filter((m) => m.status === 'sending'),
      sent: this.queue.filter((m) => m.status === 'sent'),
      failed: this.queue.filter((m) => m.status === 'failed'),
      permanentlyFailed: this.failedMessages,
    };
  }
}

// Create singleton instance
const messageQueueService = new MessageQueueService();

export default messageQueueService;
