/**
 * Admin Chat Service
 * Handles admin-specific chat operations and conversation management
 * Uses the new /admin-support-chat endpoints
 */

import api from '../utils/api';

class AdminChatService {
  /**
   * Parse conversation response to include formatted timestamps
   * @param {Object} conv - Conversation object
   * @returns {Object} Formatted conversation with Date objects
   */
  static formatConversation(conv) {
    return {
      ...conv,
      timestamp: conv.timestamp ? new Date(conv.timestamp) : new Date(),
      resolvedAt: conv.resolvedAt ? new Date(conv.resolvedAt) : null,
      messages: conv.messages?.map(msg => ({
        ...msg,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        updatedAt: msg.updatedAt ? new Date(msg.updatedAt) : new Date(),
      })) || [],
    };
  }

  /**
   * Get all conversations with formatted timestamps
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} List of formatted conversations
   */
  static async getConversations(page = 1, limit = 50) {
    try {
      const response = await api.get('/admin-support-chat/conversations', {
        params: { page, limit },
      });
      const conversations = response.data.data || [];
      return conversations.map(conv => this.formatConversation(conv));
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
  }

  /**
   * Get conversation with specific user or ID
   * @param {string} conversationId - Conversation/User ID
   * @returns {Promise} Conversation object with messages and metadata
   */
  static async getConversation(conversationId) {
    try {
      const response = await api.get(`/admin-support-chat/conversations/${conversationId}`);
      const conversation = response.data.data;
      
      if (Array.isArray(conversation)) {
        // If response is array of messages, infer resolved status from messages
        const formattedMessages = conversation.map(msg => ({
          ...msg,
          createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
          updatedAt: msg.updatedAt ? new Date(msg.updatedAt) : new Date(),
        }));
        
        // Check if all messages are resolved
        const allResolved = formattedMessages.length > 0 && formattedMessages.every(m => m.isResolved === true);
        const resolvedAt = allResolved 
          ? formattedMessages[formattedMessages.length - 1]?.resolvedAt 
            ? new Date(formattedMessages[formattedMessages.length - 1].resolvedAt)
            : new Date()
          : null;
        
        return {
          messages: formattedMessages,
          status: allResolved ? 'resolved' : 'pending',
          resolvedAt,
        };
      }
      
      // If response is conversation object, format it
      return this.formatConversation(conversation);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      throw error;
    }
  }

  /**
   * Get messages for a conversation
   * @param {string} conversationId - Conversation ID (userId)
   * @param {number} limit - Number of messages to fetch (optional)
   * @returns {Promise} Object with messages array and conversation metadata
   */
  static async getMessages(conversationId, limit = 50) {
    try {
      const response = await api.get(`/admin-support-chat/conversations/${conversationId}`);
      const messages = response.data.data || [];
      
      // Format timestamps for all messages
      const formattedMessages = messages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        updatedAt: msg.updatedAt ? new Date(msg.updatedAt) : new Date(),
      }));

      // Check if conversation is resolved (all messages have isResolved or is_resolved = true)
      const allResolved = formattedMessages.length > 0 && formattedMessages.every(m => m.isResolved === true || m.is_resolved === true);
      const resolvedAt = allResolved 
        ? formattedMessages[formattedMessages.length - 1]?.resolvedAt || formattedMessages[formattedMessages.length - 1]?.resolved_at
          ? new Date(formattedMessages[formattedMessages.length - 1]?.resolvedAt || formattedMessages[formattedMessages.length - 1]?.resolved_at)
          : new Date()
        : null;

      // Apply limit if specified and messages exceed it
      const messages_to_return = limit && formattedMessages.length > limit 
        ? formattedMessages.slice(-limit)
        : formattedMessages;

      // Return object with messages and metadata
      return {
        messages: messages_to_return,
        status: allResolved ? 'resolved' : 'pending',
        resolvedAt,
      };
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  }

  /**
   * Send message via new endpoint
   * @param {string} conversationId - Conversation ID (userId)
   * @param {string} content - Message content
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} Sent message data with formatted timestamps
   */
  static async sendMessage(conversationId, content, metadata = {}) {
    try {
      const response = await api.post('/admin-support-chat/send', {
        conversationId,
        content,
        metadata,
      });
      const message = response.data.data;
      // Format timestamps if present
      return {
        ...message,
        createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
        updatedAt: message.updatedAt ? new Date(message.updatedAt) : new Date(),
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Mark message as read by admin
   * @param {string} messageId - Message ID
   * @returns {Promise} Mark as read response
   */
  static async markMessageAsRead(messageId) {
    try {
      const response = await api.post(`/admin-support-chat/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  }

  /**
   * Mark conversation as resolved
   * @param {string} conversationId - Conversation ID
   * @returns {Promise} Resolution response with formatted timestamps
   */
  static async resolveConversation(conversationId) {
    try {
      const response = await api.post(`/admin-support-chat/conversations/${conversationId}/resolve`);
      const data = response.data.data || response.data;
      // Format timestamps if present in response
      return {
        ...data,
        resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      };
    } catch (error) {
      console.error('Failed to resolve conversation:', error);
      throw error;
    }
  }

  /**
   * Delete conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise} Delete response
   */
  static async deleteConversation(conversationId) {
    try {
      const response = await api.delete(`/admin-support-chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  /**
   * Archive conversation (uses delete endpoint)
   * @param {string} conversationId - Conversation ID
   * @returns {Promise} Archive response
   */
  static async archiveConversation(conversationId) {
    try {
      const response = await api.delete(`/admin-support-chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      throw error;
    }
  }

  /**
   * Search conversations
   * @param {string} query - Search query
   * @returns {Promise} Search results
   */
  static async searchConversations(query) {
    try {
      const response = await api.get('/chat/conversations/search', {
        params: { q: query },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to search conversations:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   * @returns {Promise} Unread count
   */
  static async getUnreadCount() {
    try {
      const response = await api.get('/chat/conversations/unread-count');
      return response.data.data?.count || 0;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  }

  /**
   * Mark conversation as read
   * @param {string} userId - User ID
   * @returns {Promise} Read response
   */
  static async markAsRead(userId) {
    try {
      const response = await api.post(`/chat/conversations/${userId}/mark-read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark as read:', error);
      throw error;
    }
  }

  /**
   * Get conversation statistics
   * @returns {Promise} Statistics
   */
  static async getStatistics() {
    try {
      const response = await api.get('/chat/statistics');
      return response.data.data || {
        totalConversations: 0,
        pendingConversations: 0,
        resolvedConversations: 0,
        averageResponseTime: 0,
        totalMessages: 0,
      };
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      return {
        totalConversations: 0,
        pendingConversations: 0,
        resolvedConversations: 0,
        averageResponseTime: 0,
        totalMessages: 0,
      };
    }
  }

  /**
   * Format error message from API response
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   */
  static getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.status === 400) {
      return 'Invalid request. Please check your input.';
    }
    if (error.response?.status === 401) {
      return 'Unauthorized. Please log in again.';
    }
    if (error.response?.status === 404) {
      return 'Conversation not found.';
    }
    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection.';
    }
    return error.message || 'An error occurred';
  }
}

export default AdminChatService;
