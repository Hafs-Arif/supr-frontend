import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Loader } from 'lucide-react';
import wsService from '../../Services/WebSocketService';
import './AdminSupportChat.css';

export default function AdminSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        setIsLoading(true);
        await wsService.connect();
        setIsConnected(true);

        // Listen for admin messages
        wsService.on('admin_chat_message', handleAdminMessage);
        wsService.on('connection_close', handleConnectionClose);
        wsService.on('connection_error', handleConnectionError);
      } catch (error) {
        console.error('Failed to connect to chat service:', error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    initWebSocket();

    return () => {
      wsService.off('admin_chat_message', handleAdminMessage);
      wsService.off('connection_close', handleConnectionClose);
      wsService.off('connection_error', handleConnectionError);
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAdminMessage = (data) => {
    const message = {
      id: Date.now(),
      sender: 'admin',
      senderRole: data.senderRole || 'Admin',
      content: data.content,
      timestamp: data.timestamp || new Date().toISOString(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleConnectionClose = () => {
    console.log('Chat connection closed');
    setIsConnected(false);
  };

  const handleConnectionError = (error) => {
    console.error('Chat connection error:', error);
    setIsConnected(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    if (!isConnected) {
      alert('You are currently disconnected. Please wait while we reconnect...');
      return;
    }

    // Add user message to UI
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Send to admin
    wsService.sendChatToAdmin(inputValue, {
      timestamp: new Date().toISOString(),
      issue_type: 'general_support',
    });

    setInputValue('');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const getConnectionStatusClass = () => {
    if (isLoading) return 'connecting';
    return isConnected ? 'connected' : 'disconnected';
  };

  const getConnectionStatusText = () => {
    if (isLoading) return 'Connecting...';
    return isConnected ? 'Online' : 'Offline';
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="admin-support-chat">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-content">
              <h3>Admin Support</h3>
              <div className={`status ${getConnectionStatusClass()}`}>
                {isLoading && <Loader size={12} className="spinner" />}
                <span>{getConnectionStatusText()}</span>
              </div>
            </div>
            <button className="close-btn" onClick={toggleChat} title="Close chat">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <MessageCircle size={40} />
                <p>Start a conversation with our admin team</p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={!isConnected}
            />
            <button type="submit" disabled={!isConnected || !inputValue.trim()} title="Send message">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
