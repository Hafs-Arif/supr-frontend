import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  MessageCircle,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  Archive,
  Search,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import wsService from '../../../Services/WebSocketService';
import AdminChatService from '../../../Services/AdminChatService';
import { useAuth } from '../../../Components/Auth/AuthContext';
import messageQueueService from '../../../Services/MessageQueueService';
import './ChatPage.css';

/* ─── Production Logger ─── */
const IS_DEV = process.env.NODE_ENV !== 'production';

const log = {
  info: (...args) => IS_DEV && console.log(...args),
  warn: (...args) => IS_DEV && console.warn(...args),
  error: (...args) => console.error(...args), // always log errors
};

/* ─── Constants ─── */
const ALLOWED_NEW_CONVERSATION_ROLES = [
  'rider',
  'driver',
  'service_provider',
  'handyman',
  'delivery_person',
];

const AVATAR_COLORS = [
  '#018a3e',
  '#0ea5e9',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#14b8a6',
  '#6366f1',
  '#e11d48',
];

const CONNECTION_CHECK_INTERVAL = 3000;
const QUEUE_CHECK_INTERVAL = 2000;

/* ─── Helpers ─── */
function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  if (hrs < 24)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7)
    return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatMessageTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getBubblePosition(index, total) {
  if (total === 1) return 'single';
  if (index === 0) return 'first';
  if (index === total - 1) return 'last';
  return 'middle';
}

function groupMessagesBySender(msgs) {
  if (!msgs?.length) return [];
  const groups = [];
  let current = { sender: msgs[0].sender, messages: [msgs[0]] };

  for (let i = 1; i < msgs.length; i++) {
    if (msgs[i].sender === current.sender) {
      current.messages.push(msgs[i]);
    } else {
      groups.push(current);
      current = { sender: msgs[i].sender, messages: [msgs[i]] };
    }
  }
  groups.push(current);
  return groups;
}

function formatApiMessage(msg) {
  const senderRole = (msg.senderRole || 'user').toLowerCase();
  return {
    id: msg.id,
    sender: senderRole,
    senderRole,
    receiverRole: senderRole === 'admin' ? 'user' : 'admin',
    senderId: msg.senderId,
    content: msg.content || '',
    timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
    read: msg.isRead || false,
    metadata: msg.metadata || {},
  };
}

/* ─── Sub-components ─── */

function SkeletonConversation() {
  return (
    <div className="skeleton-conversation" aria-hidden="true">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton-lines">
        <div className="skeleton skeleton-line skeleton-line--short" />
        <div className="skeleton skeleton-line skeleton-line--long" />
        <div className="skeleton skeleton-line skeleton-line--medium" />
      </div>
    </div>
  );
}

function ConversationItem({ conversation, isActive, onClick }) {
  const bgColor = getAvatarColor(conversation.name);
  const initials = getInitials(conversation.name);

  return (
    <button
      className={`conversation-item ${isActive ? 'conversation-item--active' : ''}`}
      onClick={onClick}
      aria-label={`Chat with ${conversation.name}. ${conversation.unread || 0} unread messages`}
      aria-current={isActive ? 'true' : undefined}
    >
      <div
        className="conversation-item__avatar"
        style={{ backgroundColor: bgColor }}
        aria-hidden="true"
      >
        {initials}
      </div>

      <div className="conversation-item__info">
        <div className="conversation-item__top-row">
          <span className="conversation-item__name">{conversation.name}</span>
          <span className="conversation-item__time">
            {formatRelativeTime(conversation.timestamp)}
          </span>
        </div>

        <div className="conversation-item__role">{conversation.role}</div>

        <div className="conversation-item__preview">
          {conversation.lastMessage}
        </div>

        <div className="conversation-item__bottom-row">
          {conversation.status === 'pending' && (
            <span className="status-badge status-badge--pending">
              <AlertCircle size={10} /> Pending
            </span>
          )}
          {conversation.status === 'resolved' && (
            <span className="status-badge status-badge--resolved" title={conversation.resolvedAt ? `Resolved at ${conversation.resolvedAt.toLocaleString()}` : 'Resolved'}>
              <CheckCircle size={10} /> Resolved
            </span>
          )}
          {conversation.unread > 0 && (
            <span className="unread-badge">{conversation.unread}</span>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ message, position, senderType }) {
  const isAdmin = senderType === 'admin';
  const isQueued = message.queued;

  const bubbleClass = [
    'chat-bubble',
    isQueued
      ? 'chat-bubble--queued'
      : isAdmin
        ? 'chat-bubble--admin'
        : 'chat-bubble--user',
    `chat-bubble--${position}`,
  ].join(' ');

  return (
    <div className={bubbleClass}>
      <p className="chat-bubble__content">{message.content}</p>
      <span className="chat-bubble__footer">
        <span className="chat-bubble__time">
          {formatMessageTime(message.timestamp)}
        </span>
        {isAdmin && !isQueued && (
          <span className="chat-bubble__read-icon">
            {message.read ? (
              <CheckCircle2 size={12} aria-label="Read" />
            ) : (
              <Check size={12} aria-label="Delivered" />
            )}
          </span>
        )}
        {isQueued && <Clock size={11} className="chat-bubble__read-icon" />}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */
export default function ChatPage() {
  const { user: adminUser } = useAuth();

  /* ── State ── */
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [queuedMessageCount, setQueuedMessageCount] = useState(0);
  const [failedMessageCount, setFailedMessageCount] = useState(0);
  const [showQueueStatus, setShowQueueStatus] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);
  const selectedConvRef = useRef(selectedConversation);

  // Keep ref in sync so WebSocket handler reads latest value
  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  /* ── Scroll helper ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ── WebSocket handlers (stable refs) ── */
  const handleConnectionOpen = useCallback(() => {
    log.info('🟢 Connection opened');
    setIsConnected(true);
  }, []);

  const handleConnectionClose = useCallback(() => {
    log.info('🔴 Connection closed');
    setIsConnected(false);
  }, []);

  const handleConnectionError = useCallback((error) => {
    log.error('🔴 Connection error:', error);
    setIsConnected(false);
  }, []);

  const handleUserMessage = useCallback((data) => {
    const userId = data.userId || data.senderId || 'unknown';
    const messageContent = data.content || '';
    const senderRole = (data.senderRole || data.role || 'user').toLowerCase();
    const canCreate = ALLOWED_NEW_CONVERSATION_ROLES.includes(senderRole);

    log.info(`💬 Message from ${userId} (${senderRole})`);

    const newMessage = {
      id: data.messageId || Date.now(),
      sender: senderRole,
      senderRole,
      receiverRole: senderRole === 'admin' ? 'user' : 'admin',
      senderId: userId,
      content: messageContent,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      read: false,
    };

    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === userId);

      if (idx < 0 && !canCreate) {
        log.warn(`Role '${senderRole}' cannot create conversations`);
        return prev;
      }

      const next = [...prev];

      if (idx >= 0) {
        next[idx] = {
          ...next[idx],
          messages: [...next[idx].messages, newMessage],
          lastMessage: messageContent,
          timestamp: new Date(),
          unread:
            selectedConvRef.current?.id !== userId
              ? next[idx].unread + 1
              : next[idx].unread,
        };
      } else {
        next.unshift({
          id: userId,
          name: data.senderName || `${senderRole} ${userId}`,
          role: senderRole,
          avatar: '👤',
          lastMessage: messageContent,
          timestamp: new Date(),
          status: data.status || 'pending',
          unread: 1,
          messages: [newMessage],
        });
      }

      if (selectedConvRef.current?.id === userId) {
        setMessages((prev) => [...prev, newMessage]);
      }

      return next;
    });
  }, []);

  /* ── WebSocket init ── */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        await wsService.connect(token);

        if (!mounted) return;
        setIsConnected(wsService.isConnected());

        wsService.on('connection_open', handleConnectionOpen);
        wsService.on('connection_close', handleConnectionClose);
        wsService.on('connection_error', handleConnectionError);
        wsService.on('admin_chat_message', handleUserMessage);
      } catch (err) {
        log.error('❌ WebSocket init failed:', err);
        if (mounted) setIsConnected(false);
      }
    };

    init();

    return () => {
      mounted = false;
      wsService.off('connection_open', handleConnectionOpen);
      wsService.off('connection_close', handleConnectionClose);
      wsService.off('connection_error', handleConnectionError);
      wsService.off('admin_chat_message', handleUserMessage);
    };
  }, [handleConnectionOpen, handleConnectionClose, handleConnectionError, handleUserMessage]);

  /* ── Periodic connection check ── */
  useEffect(() => {
    const id = setInterval(() => {
      setIsConnected(wsService.isConnected());
    }, CONNECTION_CHECK_INTERVAL);
    return () => clearInterval(id);
  }, []);

  /* ── Periodic queue check ── */
  useEffect(() => {
    const id = setInterval(() => {
      const stats = messageQueueService.getStats();
      setQueuedMessageCount(stats.queued);
      setFailedMessageCount(stats.failed + stats.permanentlyFailed);
    }, QUEUE_CHECK_INTERVAL);
    return () => clearInterval(id);
  }, []);

  /* ── Load conversations ── */
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      log.info('📥 Fetching conversations…');

      const ids = await AdminChatService.getConversations(1, 50);

      if (!Array.isArray(ids) || ids.length === 0) {
        setConversations([]);
        setSelectedConversation(null);
        setMessages([]);
        return;
      }

      const results = await Promise.allSettled(
        ids.map(async (convItem) => {
          // Extract ID from various possible fields: id, conversationId, participantId
          let convId;
          
          if (typeof convItem === 'string') {
            convId = convItem;
          } else if (typeof convItem === 'object' && convItem) {
            // Try different ID field names used by the API
            convId = convItem.id || convItem.conversationId || convItem.participantId;
          }
          
          if (!convId) {
            console.warn('⚠️ Invalid conversation ID, no valid ID field found:', convItem);
            return null;
          }

          const response = await AdminChatService.getConversation(convId);
            
            // Extract messages and metadata from response
            let rawMsgs, convStatus, convResolvedAt;
            
            if (response?.messages) {
              // New format: { messages, status, resolvedAt }
              rawMsgs = response.messages;
              convStatus = response.status || 'pending';
              convResolvedAt = response.resolvedAt || null;
            } else if (Array.isArray(response)) {
              // Legacy format: just messages array
              rawMsgs = response;
              convStatus = 'pending';
              convResolvedAt = null;
            } else {
              // Object format
              rawMsgs = Array.isArray(response?.data) ? response.data : [];
              convStatus = response?.status || 'pending';
              convResolvedAt = response?.resolvedAt || null;
            }

            if (!rawMsgs.length) return null;

            const userMsg = rawMsgs.find((m) => m.senderRole !== 'admin');
            const lastMsg = rawMsgs[rawMsgs.length - 1];
            const userId = userMsg?.senderId || convId;

            return {
              id: userId,
              name: userMsg?.senderName || `User ${userId}`,
              role: userMsg?.senderRole || 'user',
              avatar: '👤',
              lastMessage: lastMsg.content || '',
              timestamp: lastMsg.createdAt ? new Date(lastMsg.createdAt) : new Date(),
              status: convStatus,
              resolvedAt: convResolvedAt,
              unread: rawMsgs.filter((m) => !m.isRead && m.senderRole !== 'admin').length,
              messages: rawMsgs.map(formatApiMessage),
            };
        }),
      );

      const convs = results
        .filter((r) => r.status === 'fulfilled' && r.value)
        .map((r) => r.value);

      log.info(`✅ Loaded ${convs.length} conversations`);
      setConversations(convs);

      if (convs.length > 0) {
        selectConversationById(convs[0], convs);
      }
    } catch (err) {
      log.error('❌ Load failed:', err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /* ── Select conversation ── */
  const selectConversationById = useCallback(
    async (displayConv, convList) => {
      const list = convList || conversations;
      const original = list.find((c) => c.id === (displayConv.originalId || displayConv.id));
      const convId = displayConv.originalId || displayConv.id;

      setSelectedConversation(displayConv);
      setMobileShowChat(true);

      try {
        const response = await AdminChatService.getMessages(convId, 100);
        
        // Extract messages and metadata from response
        let msgArray, convStatus, convResolvedAt;
        
        if (response?.messages) {
          // New format: { messages, status, resolvedAt }
          msgArray = response.messages;
          convStatus = response.status;
          convResolvedAt = response.resolvedAt;
        } else if (Array.isArray(response)) {
          // Legacy format: just messages array
          msgArray = response;
          convStatus = 'pending';
          convResolvedAt = null;
        } else {
          msgArray = [];
          convStatus = 'pending';
          convResolvedAt = null;
        }

        if (msgArray.length > 0) {
          const formatted = msgArray.map(formatApiMessage);

          setConversations((prev) =>
            prev.map((c) => (c.id === convId 
              ? { ...c, messages: formatted, status: convStatus, resolvedAt: convResolvedAt } 
              : c)),
          );
          setMessages(formatted);

          // Update selectedConversation with resolved status if applicable
          if (convStatus === 'resolved') {
            setSelectedConversation((prev) => ({
              ...prev,
              status: 'resolved',
              resolvedAt: convResolvedAt,
            }));
          }

          // Mark unread as read
          const unread = msgArray.filter((m) => !m.isRead && m.senderRole !== 'admin');
          for (const msg of unread) {
            AdminChatService.markMessageAsRead(msg.id).catch(() => {});
          }
        } else {
          setMessages(original?.messages || []);
        }
      } catch {
        log.warn('⚠️ Using cached messages');
        setMessages(original?.messages || []);
      }

      // Clear unread
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)),
      );
    },
    [conversations],
  );

  /* ── Process queued messages ── */
  const processQueuedMessages = useCallback(async () => {
    const queued = messageQueueService.getQueuedMessages();
    if (!queued.length) return;

    log.info(`📤 Processing ${queued.length} queued messages…`);

    for (const qMsg of queued) {
      try {
        messageQueueService.markAsSending(qMsg.id);
        wsService.sendChatToAdmin(qMsg.content, {
          timestamp: qMsg.timestamp,
          toUserId: qMsg.conversationId,
          ...qMsg.metadata,
        });
        AdminChatService.sendMessage(qMsg.conversationId, qMsg.content, {
          timestamp: qMsg.timestamp,
          ...qMsg.metadata,
        }).catch(() => {});
        messageQueueService.markAsSent(qMsg.id);
      } catch (err) {
        messageQueueService.markAsFailed(qMsg.id, err.message);
      }
    }

    messageQueueService.clearSentMessages();
  }, []);

  // Process queue when coming back online
  useEffect(() => {
    if (isConnected) processQueuedMessages();
  }, [isConnected, processQueuedMessages]);

  /* ── Send message ── */
  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      const text = inputValue.trim();
      if (!text || !selectedConversation) return;

      const convId = selectedConversation.originalId || selectedConversation.id;
      const now = new Date();

      const optimisticMsg = {
        id: Date.now(),
        sender: 'admin',
        senderRole: 'admin',
        receiverRole: 'user',
        senderId: adminUser?.id || 'admin',
        content: text,
        timestamp: now,
        read: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, optimisticMsg], lastMessage: text, timestamp: now }
            : c,
        ),
      );
      setInputValue('');

      if (!isConnected) {
        const q = messageQueueService.queueMessage(convId, text, {
          timestamp: now.toISOString(),
          issue_type: 'admin_reply',
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? { ...m, queued: true, queueId: q.id } : m)),
        );
        return;
      }

      try {
        const sent = await AdminChatService.sendMessage(convId, text, {
          timestamp: now.toISOString(),
          issue_type: 'admin_reply',
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMsg.id
              ? { ...m, id: sent.id || m.id, timestamp: sent.createdAt ? new Date(sent.createdAt) : m.timestamp }
              : m,
          ),
        );

        try {
          wsService.sendChatToAdmin(text, {
            timestamp: now.toISOString(),
            issue_type: 'admin_reply',
            toUserId: convId,
          });
        } catch {
          /* API delivery succeeded — WebSocket is optional */
        }
      } catch (err) {
        const q = messageQueueService.queueMessage(convId, text, {
          timestamp: now.toISOString(),
          issue_type: 'admin_reply',
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMsg.id
              ? { ...m, queued: true, queueId: q.id, error: err.message }
              : m,
          ),
        );
      }
    },
    [inputValue, selectedConversation, isConnected, adminUser],
  );

  /* ── Resolve / Archive ── */
  const resolveConversation = useCallback(async (id) => {
    try {
      const response = await AdminChatService.resolveConversation(id);
      log.info('Resolve response:', response);
      
      // Update conversation with resolved status from backend
      const resolvedAt = response?.resolvedAt ? new Date(response.resolvedAt) : new Date();
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: 'resolved', resolvedAt }
            : c
        )
      );
      
      // Update selectedConversation if it's the one being resolved
      if (selectedConversation?.id === id) {
        setSelectedConversation((prev) => ({
          ...prev,
          status: 'resolved',
          resolvedAt,
        }));
      }
      
      log.info('✅ Conversation resolved successfully');
    } catch (error) {
      log.error('❌ Failed to resolve conversation:', error);
      // Show error - user can retry
    }
  }, [selectedConversation?.id]);

  const archiveConversation = useCallback(
    async (id) => {
      try {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if ((selectedConversation?.originalId || selectedConversation?.id) === id) {
          setSelectedConversation(null);
          setMessages([]);
          setMobileShowChat(false);
        }
        await AdminChatService.deleteConversation(id);
        log.info('Conversation deleted successfully');
      } catch (error) {
        log.error('Failed to delete conversation:', error);
        // Reload conversations on failure
        loadConversations();
      }
    },
    [selectedConversation, loadConversations],
  );

  /* ── Mobile back ── */
  const handleMobileBack = useCallback(() => {
    setMobileShowChat(false);
    setSelectedConversation(null);
  }, []);

  /* ── Derived / memoized data ── */
  const displayConversations = useMemo(
    () =>
      conversations.map((c) => ({
        id: c.id,
        originalId: c.id,
        name: c.name,
        role: c.role,
        avatar: c.avatar,
        lastMessage:
          c.lastMessage ||
          (c.messages?.length ? c.messages[c.messages.length - 1].content : ''),
        timestamp: c.timestamp,
        status: c.status,
        unread: c.unread,
        messageCount: c.messages?.length || 0,
        resolvedAt: c.resolvedAt,
      })),
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return displayConversations.filter((c) => {
      if (!c?.id) return false;
      const matchSearch =
        (c.name || '').toLowerCase().includes(q) ||
        (c.lastMessage || '').toLowerCase().includes(q);
      const matchStatus =
        filterStatus === 'all' || (c.status || 'pending') === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [displayConversations, searchQuery, filterStatus]);

  const messageGroups = useMemo(() => groupMessagesBySender(messages), [messages]);

  const pendingCount = useMemo(
    () => conversations.filter((c) => c.status === 'pending').length,
    [conversations],
  );

  const resolvedCount = useMemo(
    () => conversations.filter((c) => c.status === 'resolved').length,
    [conversations],
  );

  const connectionLabel = isLoading ? 'Connecting…' : isConnected ? 'Online' : 'Offline';
  const connectionDotClass = isLoading
    ? 'chat-header__dot--connecting'
    : isConnected
      ? 'chat-header__dot--online'
      : 'chat-header__dot--offline';

  const selectedConvId = selectedConversation?.id;

  const showQueueBar =
    selectedConversation && (queuedMessageCount > 0 || failedMessageCount > 0);

  /* ═══════════════ Render ═══════════════ */
  return (
    <div className="chat-page">
      <div className="chat-page__inner">
        {/* ── Header ── */}
        <header className="chat-header">
          <div className="chat-header__left">
            <div className="chat-header__icon" aria-hidden="true">
              <MessageCircle size={26} />
            </div>
            <div>
              <h1 className="chat-header__title">
                {adminUser?.name || 'Admin'} — Support Chat
              </h1>
              <div className="chat-header__meta">
                <span className="chat-header__status">
                  <span className={`chat-header__dot ${connectionDotClass}`} />
                  <span
                    style={{
                      color: isConnected
                        ? '#16a34a'
                        : isLoading
                          ? '#854d0e'
                          : '#dc2626',
                    }}
                  >
                    {connectionLabel}
                  </span>
                </span>
                {pendingCount > 0 && (
                  <span className="chat-header__pending-badge">
                    <AlertCircle size={13} />
                    {pendingCount} pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Grid ── */}
        <div
          className={`chat-grid ${mobileShowChat ? 'chat-grid--chat-open' : ''}`}
          role="region"
          aria-label="Chat interface"
        >
          {/* ── Sidebar ── */}
          <aside className="chat-sidebar" aria-label="Conversations">
            <div className="chat-sidebar__search">
              <div className="chat-sidebar__search-wrapper">
                <Search
                  size={15}
                  className="chat-sidebar__search-icon"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  className="chat-sidebar__search-input"
                  placeholder="Search conversations…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search conversations"
                />
              </div>

              <div className="chat-sidebar__filters" role="tablist" aria-label="Filter by status">
                {[
                  { key: 'all', label: `All (${conversations.length})` },
                  { key: 'pending', label: `Pending (${pendingCount})` },
                  { key: 'resolved', label: `Resolved (${resolvedCount})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={filterStatus === tab.key}
                    className={`chat-filter-tab ${filterStatus === tab.key ? 'chat-filter-tab--active' : ''}`}
                    onClick={() => setFilterStatus(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="chat-sidebar__list" role="list">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonConversation key={i} />
                ))
              ) : filteredConversations.length === 0 ? (
                <div className="chat-sidebar__empty">
                  <MessageCircle
                    size={32}
                    className="chat-sidebar__empty-icon"
                  />
                  <p className="chat-sidebar__empty-text">No conversations</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={selectedConvId === conv.id}
                    onClick={() => selectConversationById(conv)}
                  />
                ))
              )}
            </div>
          </aside>

          {/* ── Chat Panel ── */}
          <main className="chat-main" aria-label="Chat messages">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="chat-main__header">
                  <div className="chat-main__header-left">
                    <button
                      className="chat-main__back-btn"
                      onClick={handleMobileBack}
                      aria-label="Back to conversations"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div
                      className="chat-main__header-avatar"
                      style={{
                        backgroundColor: getAvatarColor(
                          selectedConversation.name,
                        ),
                      }}
                      aria-hidden="true"
                    >
                      {getInitials(selectedConversation.name)}
                    </div>
                    <div className="chat-main__header-info">
                      <div className="chat-main__header-name">
                        {selectedConversation.name}
                      </div>
                      <div className="chat-main__header-role">
                        {selectedConversation.role}
                      </div>
                      {selectedConversation.status === 'resolved' && selectedConversation.resolvedAt && (
                        <div className="chat-main__header-resolved" style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
                          ✓ Resolved {formatRelativeTime(selectedConversation.resolvedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="chat-main__header-actions">
                    {selectedConversation.status === 'pending' && (
                      <button
                        className="chat-action-btn chat-action-btn--resolve"
                        onClick={() =>
                          resolveConversation(
                            selectedConversation.originalId || selectedConversation.id,
                          )
                        }
                      >
                        <CheckCircle size={15} />
                        <span>Resolve</span>
                      </button>
                    )}
                    <button
                      className="chat-action-btn chat-action-btn--archive"
                      onClick={() =>
                        archiveConversation(
                          selectedConversation.originalId || selectedConversation.id,
                        )
                      }
                      aria-label="Archive conversation"
                    >
                      <Archive size={15} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div
                  className="chat-main__messages"
                  role="log"
                  aria-label="Message history"
                  aria-live="polite"
                >
                  {messageGroups.length > 0 ? (
                    messageGroups.map((group, gi) => (
                      <div
                        key={gi}
                        className={`message-group ${
                          group.sender === 'admin'
                            ? 'message-group--admin'
                            : 'message-group--user'
                        }`}
                      >
                        {group.sender !== 'admin' && gi === 0 && (
                          <span className="message-group__sender-label">
                            {group.sender}
                          </span>
                        )}

                        {group.messages.map((msg, mi) => (
                          <MessageBubble
                            key={msg.id}
                            message={msg}
                            position={getBubblePosition(
                              mi,
                              group.messages.length,
                            )}
                            senderType={group.sender}
                          />
                        ))}

                        {group.sender === 'admin' &&
                          group.messages.some((m) => m.queued) && (
                            <span className="message-group__queue-notice">
                              <Clock size={11} />
                              {group.messages.find((m) => m.error)
                                ? `Failed: ${group.messages.find((m) => m.error).error}`
                                : 'Queued — sends on reconnect'}
                            </span>
                          )}
                      </div>
                    ))
                  ) : (
                    <div className="chat-empty-state">
                      <MessageCircle
                        size={40}
                        className="chat-empty-state__icon"
                      />
                      <p className="chat-empty-state__title">No messages yet</p>
                      <p className="chat-empty-state__subtitle">
                        Start responding to user messages
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} aria-hidden="true" />
                </div>

                {/* Queue status */}
                {showQueueBar && (
                  <div className="queue-status-bar">
                    <div className="queue-status-bar__items">
                      {queuedMessageCount > 0 && (
                        <span className="queue-status-bar__item queue-status-bar__item--queued">
                          <Clock size={13} />
                          {queuedMessageCount} queued
                        </span>
                      )}
                      {failedMessageCount > 0 && (
                        <span className="queue-status-bar__item queue-status-bar__item--failed">
                          <AlertTriangle size={13} />
                          {failedMessageCount} failed
                        </span>
                      )}
                      {!isConnected && (
                        <span className="queue-status-bar__item queue-status-bar__item--offline">
                          <AlertCircle size={13} />
                          Offline — messages will queue
                        </span>
                      )}
                    </div>
                    <button
                      className="queue-status-bar__toggle"
                      onClick={() => setShowQueueStatus((v) => !v)}
                    >
                      {showQueueStatus ? 'Hide' : 'Details'}
                    </button>
                  </div>
                )}

                {/* Queue details */}
                {showQueueStatus && (
                  <div className="queue-details">
                    {(() => {
                      const info = messageQueueService.getDebugInfo();
                      return (
                        <>
                          <div className="queue-details__title">
                            Queue Status
                          </div>
                          <div className="queue-details__stats">
                            Total: {info.stats.total} · Queued:{' '}
                            {info.stats.queued} · Sending:{' '}
                            {info.stats.sending} · Sent: {info.stats.sent} ·
                            Failed: {info.stats.failed} · Permanent:{' '}
                            {info.stats.permanentlyFailed}
                          </div>

                          {info.queued.length > 0 && (
                            <div className="queue-details__section queue-details__section--queued">
                              <div className="queue-details__section-title">
                                Queued
                              </div>
                              {info.queued.map((m) => (
                                <div
                                  key={m.id}
                                  className="queue-details__message"
                                >
                                  {m.conversationId}:{' '}
                                  {m.content.substring(0, 40)}… (retry{' '}
                                  {m.retries})
                                </div>
                              ))}
                            </div>
                          )}

                          {info.failed.length > 0 && (
                            <div className="queue-details__section queue-details__section--failed">
                              <div className="queue-details__section-title">
                                Failed
                              </div>
                              {info.failed.map((m) => (
                                <div
                                  key={m.id}
                                  className="queue-details__message"
                                >
                                  {m.conversationId}:{' '}
                                  {m.content.substring(0, 40)}… ({m.error})
                                </div>
                              ))}
                            </div>
                          )}

                          {info.permanentlyFailed.length > 0 && (
                            <div className="queue-details__section queue-details__section--permanent">
                              <div className="queue-details__section-title">
                                Permanently Failed
                              </div>
                              {info.permanentlyFailed.map((m, i) => (
                                <div key={i} className="queue-details__message">
                                  {m.conversationId}:{' '}
                                  {m.content.substring(0, 40)}…
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            className="queue-details__clear-btn"
                            onClick={() => {
                              messageQueueService.clearFailedMessages();
                              setShowQueueStatus(false);
                            }}
                          >
                            Clear Failed
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Input */}
                <form
                  className="chat-input"
                  onSubmit={handleSendMessage}
                  aria-label="Send a message"
                >
                  <div className="chat-input__form">
                    <input
                      type="text"
                      className="chat-input__field"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={
                        isConnected
                          ? 'Type your reply…'
                          : 'Offline — messages will queue…'
                      }
                      aria-label="Message text"
                    />
                    <button
                      type="submit"
                      className="chat-input__send"
                      disabled={!inputValue.trim()}
                      aria-label="Send message"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  {!isConnected && (
                    <p className="chat-input__offline-notice">
                      <AlertCircle size={13} />
                      You are offline. Messages will be sent when you reconnect.
                    </p>
                  )}
                </form>
              </>
            ) : (
              <div className="chat-empty-state">
                <MessageCircle size={52} className="chat-empty-state__icon" />
                <p className="chat-empty-state__title">
                  Select a conversation
                </p>
                <p className="chat-empty-state__subtitle">
                  Choose from the list to start supporting users
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}