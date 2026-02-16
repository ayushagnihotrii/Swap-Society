'use client';

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    type Unsubscribe,
    increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Message, Conversation } from '@/types';

// ── Helpers ────────────────────────────────────────────

function tsToString(val: unknown): string {
    if (val instanceof Timestamp) return val.toDate().toISOString();
    if (typeof val === 'string') return val;
    return new Date().toISOString();
}

function docToConversation(id: string, data: Record<string, unknown>): Conversation {
    return {
        id,
        participants: (data.participants as string[]) ?? [],
        participantNames: (data.participantNames as Record<string, string>) ?? {},
        participantAvatars: (data.participantAvatars as Record<string, string>) ?? {},
        lastMessage: (data.lastMessage as string) ?? '',
        lastMessageAt: tsToString(data.lastMessageAt),
        unreadCount: (data.unreadCount as Record<string, number>) ?? {},
    };
}

function docToMessage(id: string, data: Record<string, unknown>): Message {
    return {
        id,
        senderId: (data.senderId as string) ?? '',
        senderName: (data.senderName as string) ?? '',
        senderAvatar: (data.senderAvatar as string) ?? '',
        text: (data.text as string) ?? '',
        listingId: data.listingId as string | undefined,
        listingTitle: data.listingTitle as string | undefined,
        read: (data.read as boolean) ?? false,
        createdAt: tsToString(data.createdAt),
    };
}

// ── Find or create a conversation ──────────────────────

export async function findOrCreateConversation(
    currentUserId: string,
    currentUserName: string,
    currentUserAvatar: string,
    otherUserId: string,
    otherUserName: string,
    otherUserAvatar: string,
    listingId?: string,
    listingTitle?: string,
): Promise<string> {
    if (!db) throw new Error('Firebase not configured');

    // First, try to find an existing conversation between these two users
    try {
        const q = query(
            collection(db, 'conversations'),
            where('participantIds', 'array-contains', currentUserId),
        );
        const snapshot = await getDocs(q);

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const participants = (data.participantIds as string[]) || [];
            if (participants.includes(otherUserId)) {
                return docSnap.id;
            }
        }
    } catch (err) {
        console.error('Error finding conversation:', err);
    }

    // No existing conversation found — create a new one
    const convData = {
        participants: [currentUserId, otherUserId],
        participantIds: [currentUserId, otherUserId], // for array-contains query
        participantNames: {
            [currentUserId]: currentUserName,
            [otherUserId]: otherUserName,
        },
        participantAvatars: {
            [currentUserId]: currentUserAvatar,
            [otherUserId]: otherUserAvatar,
        },
        lastMessage: listingTitle ? `Started a conversation about "${listingTitle}"` : 'New conversation started',
        lastMessageAt: serverTimestamp(),
        unreadCount: {
            [currentUserId]: 0,
            [otherUserId]: 1,
        },
        listingId: listingId || null,
        listingTitle: listingTitle || null,
    };

    const docRef = await addDoc(collection(db, 'conversations'), convData);

    // Add a system message if this is about a listing
    if (listingTitle) {
        await addDoc(collection(db, 'conversations', docRef.id, 'messages'), {
            senderId: currentUserId,
            senderName: currentUserName,
            senderAvatar: currentUserAvatar,
            text: `Hi! I'm interested in "${listingTitle}"`,
            listingId,
            listingTitle,
            read: false,
            createdAt: serverTimestamp(),
        });
    }

    return docRef.id;
}

// ── Get conversations for a user ───────────────────────

export async function getConversations(userId: string): Promise<Conversation[]> {
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'conversations'),
            where('participantIds', 'array-contains', userId),
            orderBy('lastMessageAt', 'desc'),
            limit(50),
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) =>
            docToConversation(d.id, d.data() as Record<string, unknown>)
        );
    } catch (err) {
        console.error('getConversations error:', err);
        return [];
    }
}

// ── Subscribe to conversations (real-time) ─────────────

export function subscribeToConversations(
    userId: string,
    callback: (convs: Conversation[]) => void,
): Unsubscribe {
    if (!db) return () => { };

    const q = query(
        collection(db, 'conversations'),
        where('participantIds', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc'),
        limit(50),
    );

    return onSnapshot(q, (snapshot) => {
        const convs = snapshot.docs.map((d) =>
            docToConversation(d.id, d.data() as Record<string, unknown>)
        );
        callback(convs);
    }, (err) => {
        console.error('subscribeToConversations error:', err);
    });
}

// ── Get messages in a conversation ─────────────────────

export async function getMessages(conversationId: string): Promise<Message[]> {
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'conversations', conversationId, 'messages'),
            orderBy('createdAt', 'asc'),
            limit(100),
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) =>
            docToMessage(d.id, d.data() as Record<string, unknown>)
        );
    } catch (err) {
        console.error('getMessages error:', err);
        return [];
    }
}

// ── Subscribe to messages (real-time) ──────────────────

export function subscribeToMessages(
    conversationId: string,
    callback: (msgs: Message[]) => void,
): Unsubscribe {
    if (!db) return () => { };

    const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'asc'),
        limit(200),
    );

    return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((d) =>
            docToMessage(d.id, d.data() as Record<string, unknown>)
        );
        callback(msgs);
    }, (err) => {
        console.error('subscribeToMessages error:', err);
    });
}

// ── Send a message ─────────────────────────────────────

export async function sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    text: string,
    listingId?: string,
    listingTitle?: string,
): Promise<void> {
    if (!db) throw new Error('Firebase not configured');

    // 1. Add message to sub-collection
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId,
        senderName,
        senderAvatar,
        text,
        listingId: listingId || null,
        listingTitle: listingTitle || null,
        read: false,
        createdAt: serverTimestamp(),
    });

    // 2. Get conversation to find the other participant
    const convRef = doc(db, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);
    if (!convSnap.exists()) return;

    const convData = convSnap.data();
    const participants = (convData.participantIds as string[]) || [];
    const otherUserId = participants.find((p) => p !== senderId) || '';

    // 3. Update conversation metadata
    await updateDoc(convRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${otherUserId}`]: increment(1),
    });
}

// ── Mark conversation as read ──────────────────────────

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
    if (!db) return;

    try {
        const convRef = doc(db, 'conversations', conversationId);
        await updateDoc(convRef, {
            [`unreadCount.${userId}`]: 0,
        });
    } catch (err) {
        console.error('markAsRead error:', err);
    }
}
