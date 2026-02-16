'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    MessageCircle,
    Search,
    Send,
    ChevronLeft,
    Loader2,
    Package,
} from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import {
    subscribeToConversations,
    subscribeToMessages,
    sendMessage,
    markAsRead,
} from '@/lib/messages';
import { useAuth } from '@/components/providers/AuthProvider';
import ProtectedRoute from '@/components/providers/ProtectedRoute';
import type { Conversation, Message } from '@/types';
import styles from './page.module.css';

function formatMsgTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function MessagesInner() {
    const searchParams = useSearchParams();
    const convParam = searchParams.get('conv');
    const { user, profile } = useAuth();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeConv, setActiveConv] = useState<string | null>(convParam || null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [msgLoading, setMsgLoading] = useState(false);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const [mobileShowChat, setMobileShowChat] = useState(!!convParam);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Subscribe to conversations
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsub = subscribeToConversations(user.uid, (convs) => {
            setConversations(convs);
            setLoading(false);
        });
        return () => unsub();
    }, [user]);

    // Auto-select conversation from URL param
    useEffect(() => {
        if (convParam && conversations.length > 0) {
            setActiveConv(convParam);
            setMobileShowChat(true);
        }
    }, [convParam, conversations]);

    // Subscribe to messages when a conversation is selected
    useEffect(() => {
        if (!activeConv) {
            setMessages([]);
            return;
        }
        setMsgLoading(true);
        const unsub = subscribeToMessages(activeConv, (msgs) => {
            setMessages(msgs);
            setMsgLoading(false);
        });
        return () => unsub();
    }, [activeConv]);

    // Mark as read when opening a conversation
    useEffect(() => {
        if (activeConv && user) {
            markAsRead(activeConv, user.uid);
        }
    }, [activeConv, user, messages.length]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMsg.trim() || !activeConv || !user || !profile || sending) return;
        const text = newMsg.trim();
        setNewMsg('');
        setSending(true);
        try {
            await sendMessage(
                activeConv,
                user.uid,
                profile.name || user.displayName || 'User',
                profile.avatar || user.photoURL || '',
                text,
            );
        } catch (err) {
            console.error('Send message error:', err);
            setNewMsg(text); // restore on failure
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const selectConv = (convId: string) => {
        setActiveConv(convId);
        setMobileShowChat(true);
    };

    const goBackToList = () => {
        setMobileShowChat(false);
        setActiveConv(null);
    };

    // Get other participant's info
    const getOtherName = (conv: Conversation) => {
        if (!user) return 'Unknown';
        const entries = Object.entries(conv.participantNames || {});
        const other = entries.find(([id]) => id !== user.uid);
        return other?.[1] || 'Unknown';
    };

    const getOtherAvatar = (conv: Conversation) => {
        if (!user) return '';
        const entries = Object.entries(conv.participantAvatars || {});
        const other = entries.find(([id]) => id !== user.uid);
        return other?.[1] || '';
    };

    const getUnread = (conv: Conversation) => {
        if (!user) return 0;
        return (conv.unreadCount || {})[user.uid] || 0;
    };

    // Filter conversations by search
    const filteredConvs = conversations.filter((conv) => {
        if (!search.trim()) return true;
        const name = getOtherName(conv).toLowerCase();
        const msg = (conv.lastMessage || '').toLowerCase();
        return name.includes(search.toLowerCase()) || msg.includes(search.toLowerCase());
    });

    // Active conversation data
    const activeConvData = conversations.find((c) => c.id === activeConv);

    // Group messages by date
    const groupedMessages: { date: string; msgs: Message[] }[] = [];
    messages.forEach((msg) => {
        const dateKey = new Date(msg.createdAt).toDateString();
        const last = groupedMessages[groupedMessages.length - 1];
        if (last && last.date === dateKey) {
            last.msgs.push(msg);
        } else {
            groupedMessages.push({ date: dateKey, msgs: [msg] });
        }
    });

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Sidebar */}
                <div className={`${styles.sidebar} ${mobileShowChat ? styles.sidebarHidden : ''}`}>
                    <div className={styles.sidebarHeader}>
                        <h1 className={styles.sidebarTitle}>Messages</h1>
                    </div>

                    <div className={styles.searchWrap}>
                        <div className={styles.searchBox}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                className={styles.searchInput}
                                placeholder="Search conversations..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.convList}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Loader2 size={24} className="spin" style={{ color: 'var(--accent-primary)' }} />
                            </div>
                        ) : filteredConvs.length > 0 ? (
                            filteredConvs.map((conv) => {
                                const otherName = getOtherName(conv);
                                const otherAvatar = getOtherAvatar(conv);
                                const unread = getUnread(conv);

                                return (
                                    <div
                                        key={conv.id}
                                        className={`${styles.convItem} ${activeConv === conv.id ? styles.convActive : ''}`}
                                        onClick={() => selectConv(conv.id)}
                                    >
                                        <div className={styles.convAvatar}>
                                            {otherAvatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={otherAvatar} alt={otherName} />
                                            ) : (
                                                otherName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className={styles.convInfo}>
                                            <div className={styles.convTop}>
                                                <span className={styles.convName}>{otherName}</span>
                                                <span className={styles.convTime}>
                                                    {timeAgo(conv.lastMessageAt)}
                                                </span>
                                            </div>
                                            <p className={styles.convPreview}>{conv.lastMessage}</p>
                                        </div>
                                        {unread > 0 && (
                                            <span className={styles.convUnread}>{unread}</span>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <MessageCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                                <p>No conversations yet</p>
                                <p style={{ fontSize: 'var(--fs-xs)' }}>
                                    Start a chat from any listing page
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Panel */}
                <div className={`${styles.chatPanel} ${!mobileShowChat ? styles.chatHidden : ''}`}>
                    {activeConvData ? (
                        <>
                            {/* Chat Header */}
                            <div className={styles.chatHeader}>
                                <button className={styles.backBtn} onClick={goBackToList}>
                                    <ChevronLeft size={18} />
                                </button>
                                <div className={styles.chatUserAvatar}>
                                    {getOtherAvatar(activeConvData) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={getOtherAvatar(activeConvData)}
                                            alt={getOtherName(activeConvData)}
                                        />
                                    ) : (
                                        getOtherName(activeConvData).charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className={styles.chatUserInfo}>
                                    <div className={styles.chatUserName}>
                                        {getOtherName(activeConvData)}
                                    </div>
                                    <div className={styles.chatUserStatus}>
                                        <span className={styles.statusDot} />
                                        Online
                                    </div>
                                </div>
                                <div className={styles.chatActions}>
                                    {/* Listing link if available */}
                                </div>
                            </div>

                            {/* Listing Context Bar */}
                            {activeConvData && (activeConvData as Conversation & { listingTitle?: string }).listingTitle && (
                                <div className={styles.listingContext}>
                                    <Package size={14} className={styles.listingContextIcon} />
                                    <span>Regarding:</span>
                                    <span className={styles.listingContextTitle}>
                                        {(activeConvData as Conversation & { listingTitle?: string }).listingTitle}
                                    </span>
                                </div>
                            )}

                            {/* Messages Area */}
                            <div className={styles.messagesArea}>
                                {msgLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', flex: 1, alignItems: 'center' }}>
                                        <Loader2 size={24} className="spin" style={{ color: 'var(--accent-primary)' }} />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
                                        <MessageCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                                        <p>No messages yet. Say hi! 👋</p>
                                    </div>
                                ) : (
                                    groupedMessages.map((group) => (
                                        <div key={group.date}>
                                            <div className={styles.dateDivider}>
                                                <span className={styles.dateLabel}>
                                                    {formatDateDivider(group.msgs[0].createdAt)}
                                                </span>
                                            </div>
                                            {group.msgs.map((msg) => {
                                                const isSent = msg.senderId === user?.uid;
                                                return (
                                                    <motion.div
                                                        key={msg.id}
                                                        className={`${styles.msgRow} ${isSent ? styles.sent : styles.received}`}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className={styles.msgAvatar}>
                                                            {msg.senderAvatar ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={msg.senderAvatar} alt={msg.senderName} />
                                                            ) : (
                                                                msg.senderName.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className={styles.msgBubble}>
                                                                {msg.text}
                                                            </div>
                                                            <div className={styles.msgTime}>
                                                                {formatMsgTime(msg.createdAt)}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className={styles.inputArea}>
                                <div className={styles.inputWrap}>
                                    <input
                                        className={styles.msgInput}
                                        placeholder="Type a message..."
                                        value={newMsg}
                                        onChange={(e) => setNewMsg(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                <button
                                    className={styles.sendBtn}
                                    onClick={handleSend}
                                    disabled={!newMsg.trim() || sending}
                                    aria-label="Send message"
                                >
                                    {sending ? (
                                        <Loader2 size={18} className="spin" />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <MessageCircle size={32} />
                            </div>
                            <h2 className={styles.emptyTitle}>Select a conversation</h2>
                            <p className={styles.emptyDesc}>
                                Choose a conversation from the left, or start a new chat from any listing page.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MessagesContent() {
    return (
        <Suspense fallback={
            <div className={styles.page}>
                <div className={styles.container}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                </div>
            </div>
        }>
            <MessagesInner />
        </Suspense>
    );
}

export default function MessagesPage() {
    return (
        <ProtectedRoute>
            <MessagesContent />
        </ProtectedRoute>
    );
}
