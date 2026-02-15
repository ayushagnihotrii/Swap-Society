'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    MessageCircle,
    Send,
    Paperclip,
    MoreVertical,
    Phone,
    ArrowLeft,
    Edit3,
    Package,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Message, Conversation } from '@/types';
import styles from './page.module.css';

// ── Mock Data ──────────────────────────────────────────

const CURRENT_USER_ID = 'currentUser';

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv1',
        participants: [CURRENT_USER_ID, 'user1'],
        participantNames: { [CURRENT_USER_ID]: 'You', user1: 'Arjun Patel' },
        participantAvatars: { [CURRENT_USER_ID]: '', user1: '' },
        lastMessage: 'Is the MacBook still available? I can pick it up tomorrow.',
        lastMessageAt: new Date(Date.now() - 5 * 60000).toISOString(),
        unreadCount: { [CURRENT_USER_ID]: 2, user1: 0 },
    },
    {
        id: 'conv2',
        participants: [CURRENT_USER_ID, 'user2'],
        participantNames: { [CURRENT_USER_ID]: 'You', user2: 'Priya Sharma' },
        participantAvatars: { [CURRENT_USER_ID]: '', user2: '' },
        lastMessage: 'Sure! ₹4,000 works for me. Let\'s meet at the campus gate.',
        lastMessageAt: new Date(Date.now() - 45 * 60000).toISOString(),
        unreadCount: { [CURRENT_USER_ID]: 0, user2: 0 },
    },
    {
        id: 'conv3',
        participants: [CURRENT_USER_ID, 'user3'],
        participantNames: { [CURRENT_USER_ID]: 'You', user3: 'Rohan Mehta' },
        participantAvatars: { [CURRENT_USER_ID]: '', user3: '' },
        lastMessage: 'The jacket is perfect for the event. Thanks!',
        lastMessageAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        unreadCount: { [CURRENT_USER_ID]: 0, user3: 0 },
    },
    {
        id: 'conv4',
        participants: [CURRENT_USER_ID, 'user4'],
        participantNames: { [CURRENT_USER_ID]: 'You', user4: 'Sneha Gupta' },
        participantAvatars: { [CURRENT_USER_ID]: '', user4: '' },
        lastMessage: 'Can I rent it for a week instead of a month?',
        lastMessageAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        unreadCount: { [CURRENT_USER_ID]: 1, user4: 0 },
    },
    {
        id: 'conv5',
        participants: [CURRENT_USER_ID, 'user5'],
        participantNames: { [CURRENT_USER_ID]: 'You', user5: 'Aditya Kumar' },
        participantAvatars: { [CURRENT_USER_ID]: '', user5: '' },
        lastMessage: 'Deal! I\'ll send you the UPI ID.',
        lastMessageAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        unreadCount: { [CURRENT_USER_ID]: 0, user5: 0 },
    },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
    conv1: [
        {
            id: 'm1', senderId: 'user1', senderName: 'Arjun Patel', senderAvatar: '',
            text: 'Hey! I saw your listing for the MacBook Air M2. Is it still available?',
            listingId: '1', listingTitle: 'MacBook Air M2 — Like New',
            read: true, createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
        },
        {
            id: 'm2', senderId: CURRENT_USER_ID, senderName: 'You', senderAvatar: '',
            text: 'Yes, it\'s still available! Are you interested in buying or renting?',
            read: true, createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
        },
        {
            id: 'm3', senderId: 'user1', senderName: 'Arjun Patel', senderAvatar: '',
            text: 'I\'d like to buy it. Can you do ₹60,000?',
            read: true, createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
        },
        {
            id: 'm4', senderId: CURRENT_USER_ID, senderName: 'You', senderAvatar: '',
            text: 'Hmm, the lowest I can go is ₹62,000. It\'s barely been used — only 50 battery cycles.',
            read: true, createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        },
        {
            id: 'm5', senderId: 'user1', senderName: 'Arjun Patel', senderAvatar: '',
            text: 'That sounds fair. ₹62,000 it is!',
            read: true, createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
        },
        {
            id: 'm6', senderId: 'user1', senderName: 'Arjun Patel', senderAvatar: '',
            text: 'Is the MacBook still available? I can pick it up tomorrow.',
            read: false, createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        },
    ],
    conv2: [
        {
            id: 'm7', senderId: CURRENT_USER_ID, senderName: 'You', senderAvatar: '',
            text: 'Hi Priya! I\'m interested in the Nike Air Jordans. Could you do ₹4,000?',
            listingId: '2', listingTitle: 'Nike Air Jordan 1 Retro — Size 9',
            read: true, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
            id: 'm8', senderId: 'user2', senderName: 'Priya Sharma', senderAvatar: '',
            text: 'Hey! The price is firm at ₹4,500 but I could do ₹4,200 if you pick them up today.',
            read: true, createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
        },
        {
            id: 'm9', senderId: CURRENT_USER_ID, senderName: 'You', senderAvatar: '',
            text: 'How about ₹4,000 flat? I\'ll come right now.',
            read: true, createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
        },
        {
            id: 'm10', senderId: 'user2', senderName: 'Priya Sharma', senderAvatar: '',
            text: 'Sure! ₹4,000 works for me. Let\'s meet at the campus gate.',
            read: true, createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        },
    ],
    conv3: [
        {
            id: 'm11', senderId: CURRENT_USER_ID, senderName: 'You', senderAvatar: '',
            text: 'Hey Rohan, can I rent the denim jacket for this weekend?',
            listingId: '3', listingTitle: 'Zara Oversized Denim Jacket',
            read: true, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        },
        {
            id: 'm12', senderId: 'user3', senderName: 'Rohan Mehta', senderAvatar: '',
            text: 'Sure! It\'s ₹200/day + ₹1,000 deposit. For the weekend (Fri-Sun) that\'s ₹600.',
            read: true, createdAt: new Date(Date.now() - 4.5 * 3600000).toISOString(),
        },
        {
            id: 'm13', senderId: CURRENT_USER_ID, senderName: 'You', senderAvatar: '',
            text: 'Perfect, I\'ll take it. Can we meet at the library?',
            read: true, createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        },
        {
            id: 'm14', senderId: 'user3', senderName: 'Rohan Mehta', senderAvatar: '',
            text: 'The jacket is perfect for the event. Thanks!',
            read: true, createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        },
    ],
    conv4: [
        {
            id: 'm15', senderId: 'user4', senderName: 'Sneha Gupta', senderAvatar: '',
            text: 'Hi! I need the Kreyszig textbook for my exams next week.',
            listingId: '4', listingTitle: 'Engineering Mathematics — Kreyszig 10th Ed',
            read: true, createdAt: new Date(Date.now() - 25 * 3600000).toISOString(),
        },
        {
            id: 'm16', senderId: CURRENT_USER_ID, senderName: 'You', senderAvatar: '',
            text: 'Sure, I have it! Monthly rental is ₹350 + ₹200 deposit.',
            read: true, createdAt: new Date(Date.now() - 24.5 * 3600000).toISOString(),
        },
        {
            id: 'm17', senderId: 'user4', senderName: 'Sneha Gupta', senderAvatar: '',
            text: 'Can I rent it for a week instead of a month?',
            read: false, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        },
    ],
    conv5: [
        {
            id: 'm18', senderId: CURRENT_USER_ID, senderName: 'You', senderAvatar: '',
            text: 'Hey Aditya, the G-Shock looks dope. Is it the all-black version?',
            listingId: '5', listingTitle: 'Casio G-Shock GA-2100',
            read: true, createdAt: new Date(Date.now() - 50 * 3600000).toISOString(),
        },
        {
            id: 'm19', senderId: 'user5', senderName: 'Aditya Kumar', senderAvatar: '',
            text: 'Yes! Matte black with box and papers. Barely worn.',
            read: true, createdAt: new Date(Date.now() - 49 * 3600000).toISOString(),
        },
        {
            id: 'm20', senderId: CURRENT_USER_ID, senderName: 'You', senderAvatar: '',
            text: 'Can you do ₹6,500?',
            read: true, createdAt: new Date(Date.now() - 49 * 3600000).toISOString(),
        },
        {
            id: 'm21', senderId: 'user5', senderName: 'Aditya Kumar', senderAvatar: '',
            text: 'Deal! I\'ll send you the UPI ID.',
            read: true, createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        },
    ],
};

// ── Helpers ────────────────────────────────────────────

function formatMsgTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatBubbleTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getDateLabel(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Component ──────────────────────────────────────────

export default function MessagesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageText, setMessageText] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
    const [timedOut, setTimedOut] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fallback: if loading hangs for more than 3s, force render anyway
    useEffect(() => {
        const timer = setTimeout(() => setTimedOut(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Consider auth "ready" when loading finishes OR the user is already available OR we timed out
    const authReady = !loading || !!user || timedOut;

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConvId, messages]);

    // Redirect if not logged in (after auth finishes loading)
    useEffect(() => {
        if (authReady && !user) {
            router.push('/auth/login');
        }
    }, [authReady, user, router]);

    // Get the other participant's info from a conversation
    const getOtherUser = (conv: Conversation) => {
        const otherId = conv.participants.find(p => p !== CURRENT_USER_ID) || '';
        return {
            id: otherId,
            name: conv.participantNames[otherId] || 'Unknown',
            avatar: conv.participantAvatars[otherId] || '',
        };
    };

    // Filter conversations by search
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter(conv => {
            const other = getOtherUser(conv);
            return other.name.toLowerCase().includes(q) || conv.lastMessage.toLowerCase().includes(q);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, conversations]);

    // Active conversation data
    const activeConv = conversations.find(c => c.id === activeConvId);
    const activeMessages = activeConvId ? (messages[activeConvId] || []) : [];
    const activeOtherUser = activeConv ? getOtherUser(activeConv) : null;

    // Get listing context from first message in conversation
    const listingContext = activeMessages.find(m => m.listingTitle);

    // Send a message
    const handleSend = () => {
        if (!messageText.trim() || !activeConvId) return;

        const newMsg: Message = {
            id: `msg_${Date.now()}`,
            senderId: CURRENT_USER_ID,
            senderName: 'You',
            senderAvatar: '',
            text: messageText.trim(),
            read: true,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => ({
            ...prev,
            [activeConvId]: [...(prev[activeConvId] || []), newMsg],
        }));

        setConversations(prev =>
            prev.map(c =>
                c.id === activeConvId
                    ? { ...c, lastMessage: newMsg.text, lastMessageAt: newMsg.createdAt }
                    : c
            ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
        );

        setMessageText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Group messages by date
    const groupedMessages = useMemo(() => {
        const groups: { date: string; messages: Message[] }[] = [];
        let currentDate = '';

        activeMessages.forEach(msg => {
            const dateLabel = getDateLabel(msg.createdAt);
            if (dateLabel !== currentDate) {
                currentDate = dateLabel;
                groups.push({ date: dateLabel, messages: [msg] });
            } else {
                groups[groups.length - 1].messages.push(msg);
            }
        });

        return groups;
    }, [activeMessages]);

    if (!authReady) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <MessageCircle size={32} />
                        </div>
                        <p className={styles.emptyTitle}>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* ── Sidebar ── */}
                <aside className={`${styles.sidebar} ${activeConvId ? styles.sidebarHidden : ''}`}>
                    <div className={styles.sidebarHeader}>
                        <h1 className={styles.sidebarTitle}>Messages</h1>
                        <button className={styles.newChatBtn} title="New message">
                            <Edit3 size={16} />
                        </button>
                    </div>

                    <div className={styles.searchWrap}>
                        <div className={styles.searchBox}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.convList}>
                        {filteredConversations.length === 0 ? (
                            <div className={styles.emptyState} style={{ padding: '2rem 1rem' }}>
                                <p className={styles.emptyDesc}>No conversations found</p>
                            </div>
                        ) : (
                            filteredConversations.map(conv => {
                                const other = getOtherUser(conv);
                                const unread = conv.unreadCount[CURRENT_USER_ID] || 0;
                                return (
                                    <div
                                        key={conv.id}
                                        className={`${styles.convItem} ${activeConvId === conv.id ? styles.convActive : ''}`}
                                        onClick={() => setActiveConvId(conv.id)}
                                    >
                                        <div className={styles.convAvatar}>
                                            {other.avatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={other.avatar} alt={other.name} />
                                            ) : (
                                                getInitials(other.name)
                                            )}
                                        </div>
                                        <div className={styles.convInfo}>
                                            <div className={styles.convTop}>
                                                <span className={styles.convName}>{other.name}</span>
                                                <span className={styles.convTime}>
                                                    {formatMsgTime(conv.lastMessageAt)}
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
                        )}
                    </div>
                </aside>

                {/* ── Chat Panel ── */}
                <section className={`${styles.chatPanel} ${!activeConvId ? styles.chatHidden : ''}`}>
                    {!activeConvId ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <MessageCircle size={32} />
                            </div>
                            <h2 className={styles.emptyTitle}>Your Messages</h2>
                            <p className={styles.emptyDesc}>
                                Select a conversation to start chatting with other students
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className={styles.chatHeader}>
                                <button
                                    className={styles.backBtn}
                                    onClick={() => setActiveConvId(null)}
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div className={styles.chatUserAvatar}>
                                    {activeOtherUser?.avatar ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={activeOtherUser.avatar} alt={activeOtherUser.name} />
                                    ) : (
                                        getInitials(activeOtherUser?.name || '')
                                    )}
                                </div>
                                <div className={styles.chatUserInfo}>
                                    <div className={styles.chatUserName}>
                                        {activeOtherUser?.name}
                                    </div>
                                    <div className={styles.chatUserStatus}>
                                        <span className={styles.statusDot} />
                                        Online
                                    </div>
                                </div>
                                <div className={styles.chatActions}>
                                    <button className={styles.chatActionBtn} title="Call">
                                        <Phone size={16} />
                                    </button>
                                    <button className={styles.chatActionBtn} title="More">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Listing Context Bar */}
                            {listingContext && (
                                <div className={styles.listingContext}>
                                    <Package size={14} className={styles.listingContextIcon} />
                                    <span>About:</span>
                                    <span className={styles.listingContextTitle}>
                                        {listingContext.listingTitle}
                                    </span>
                                </div>
                            )}

                            {/* Messages */}
                            <div className={styles.messagesArea}>
                                {groupedMessages.map(group => (
                                    <div key={group.date}>
                                        <div className={styles.dateDivider}>
                                            <span className={styles.dateLabel}>{group.date}</span>
                                        </div>
                                        {group.messages.map(msg => {
                                            const isSent = msg.senderId === CURRENT_USER_ID;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`${styles.msgRow} ${isSent ? styles.sent : styles.received}`}
                                                >
                                                    <div className={styles.msgAvatar}>
                                                        {msg.senderAvatar ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={msg.senderAvatar} alt={msg.senderName} />
                                                        ) : (
                                                            getInitials(msg.senderName)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className={styles.msgBubble}>{msg.text}</div>
                                                        <div className={styles.msgTime}>
                                                            {formatBubbleTime(msg.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className={styles.inputArea}>
                                <button className={styles.attachBtn} title="Attach file">
                                    <Paperclip size={18} />
                                </button>
                                <div className={styles.inputWrap}>
                                    <input
                                        type="text"
                                        className={styles.msgInput}
                                        placeholder="Type a message..."
                                        value={messageText}
                                        onChange={e => setMessageText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                <button
                                    className={styles.sendBtn}
                                    onClick={handleSend}
                                    disabled={!messageText.trim()}
                                    title="Send"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
