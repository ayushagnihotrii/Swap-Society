'use client';

import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Offer, OfferStatus } from '@/types';

// ── Timeout helper ─────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Firestore query timed out')), ms)
        ),
    ]);
}

// ── Helpers ────────────────────────────────────────────

function firestoreTimestampToString(val: unknown): string {
    if (val instanceof Timestamp) return val.toDate().toISOString();
    if (typeof val === 'string') return val;
    return new Date().toISOString();
}

function docToOffer(id: string, data: Record<string, unknown>): Offer {
    return {
        id,
        listingId: (data.listingId as string) ?? '',
        listingTitle: (data.listingTitle as string) ?? '',
        listingImage: data.listingImage as string | undefined,
        buyerId: (data.buyerId as string) ?? '',
        buyerName: (data.buyerName as string) ?? '',
        buyerAvatar: (data.buyerAvatar as string) ?? '',
        sellerId: (data.sellerId as string) ?? '',
        sellerName: (data.sellerName as string) ?? '',
        offerPrice: (data.offerPrice as number) ?? 0,
        message: (data.message as string) ?? '',
        isRental: (data.isRental as boolean) ?? false,
        rentalStartDate: data.rentalStartDate as string | undefined,
        rentalEndDate: data.rentalEndDate as string | undefined,
        rentalDays: data.rentalDays as number | undefined,
        status: (data.status as OfferStatus) ?? 'pending',
        createdAt: firestoreTimestampToString(data.createdAt),
        updatedAt: firestoreTimestampToString(data.updatedAt),
    };
}

// ── Create ─────────────────────────────────────────────

export interface CreateOfferData {
    listingId: string;
    listingTitle: string;
    listingImage?: string;
    buyerId: string;
    buyerName: string;
    buyerAvatar: string;
    sellerId: string;
    sellerName: string;
    offerPrice: number;
    message: string;
    isRental: boolean;
    rentalStartDate?: string;
    rentalEndDate?: string;
    rentalDays?: number;
}

export async function createOffer(data: CreateOfferData): Promise<string> {
    if (!db) throw new Error('Firebase not configured');

    const docRef = await addDoc(collection(db, 'offers'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
}

// ── Read: Offers on a specific listing ─────────────────

export async function getOffersForListing(listingId: string): Promise<Offer[]> {
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'offers'),
            where('listingId', '==', listingId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await withTimeout(getDocs(q));
        return snapshot.docs.map((d) =>
            docToOffer(d.id, d.data() as Record<string, unknown>)
        );
    } catch (err) {
        console.error('getOffersForListing error:', err);
        return [];
    }
}

// ── Read: Offers received by a seller ──────────────────

export async function getOffersForSeller(sellerId: string): Promise<Offer[]> {
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'offers'),
            where('sellerId', '==', sellerId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await withTimeout(getDocs(q));
        return snapshot.docs.map((d) =>
            docToOffer(d.id, d.data() as Record<string, unknown>)
        );
    } catch (err) {
        console.error('getOffersForSeller error:', err);
        return [];
    }
}

// ── Read: Offers sent by a buyer ───────────────────────

export async function getOffersByUser(userId: string): Promise<Offer[]> {
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'offers'),
            where('buyerId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await withTimeout(getDocs(q));
        return snapshot.docs.map((d) =>
            docToOffer(d.id, d.data() as Record<string, unknown>)
        );
    } catch (err) {
        console.error('getOffersByUser error:', err);
        return [];
    }
}

// ── Update Status ──────────────────────────────────────

export async function updateOfferStatus(
    offerId: string,
    status: OfferStatus,
): Promise<void> {
    if (!db) throw new Error('Firebase not configured');
    await updateDoc(doc(db, 'offers', offerId), {
        status,
        updatedAt: serverTimestamp(),
    });
}
