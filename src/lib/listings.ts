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
    increment,
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Listing, Category, ListingCondition, ListingType, ListingStatus } from '@/types';
import { generateMockListings } from '@/lib/utils';

// ── Timeout helper ─────────────────────────────────────
// Firestore queries silently hang when a required composite
// index hasn't been created yet. This races the promise
// against a timer so the catch block fires instead.
function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Firestore query timed out')), ms)
        ),
    ]);
}

// ── Types ──────────────────────────────────────────────

export interface ListingFilters {
    category?: Category | 'all';
    condition?: ListingCondition | 'all';
    listingType?: ListingType | 'all';
    sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
    priceMin?: number;
    priceMax?: number;
    search?: string;
    limitCount?: number;
}

// ── Helpers ────────────────────────────────────────────

function firestoreTimestampToString(val: unknown): string {
    if (val instanceof Timestamp) return val.toDate().toISOString();
    if (typeof val === 'string') return val;
    return new Date().toISOString();
}

function docToListing(id: string, data: Record<string, unknown>): Listing {
    return {
        id,
        title: (data.title as string) ?? '',
        description: (data.description as string) ?? '',
        images: (data.images as string[]) ?? [],
        category: (data.category as Category) ?? 'other',
        condition: (data.condition as ListingCondition) ?? 'good',
        listingType: (data.listingType as ListingType) ?? 'sale',
        price: (data.price as number) ?? 0,
        rentalDuration: data.rentalDuration as Listing['rentalDuration'],
        deposit: data.deposit as number | undefined,
        sellerId: (data.sellerId as string) ?? '',
        sellerName: (data.sellerName as string) ?? '',
        sellerAvatar: (data.sellerAvatar as string) ?? '',
        sellerUniversity: (data.sellerUniversity as string) ?? '',
        sellerRating: (data.sellerRating as number) ?? 0,
        status: (data.status as ListingStatus) ?? 'active',
        views: (data.views as number) ?? 0,
        likes: (data.likes as number) ?? 0,
        createdAt: firestoreTimestampToString(data.createdAt),
        updatedAt: firestoreTimestampToString(data.updatedAt),
    };
}

// ── Create ─────────────────────────────────────────────

export async function createListing(
    data: Omit<Listing, 'id' | 'images' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>,
    imageFiles: File[],
): Promise<string> {
    if (!db || !storage) throw new Error('Firebase not configured');

    // 1. Create the doc first to get an ID
    const docRef = await addDoc(collection(db, 'listings'), {
        ...data,
        images: [],
        views: 0,
        likes: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    // 2. Upload images to Storage
    const imageUrls: string[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const storageRef = ref(storage, `listings/${docRef.id}/image_${i}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
    }

    // 3. Update doc with image URLs
    if (imageUrls.length > 0) {
        await updateDoc(docRef, { images: imageUrls });
    }

    return docRef.id;
}

// ── Read Single ────────────────────────────────────────

export async function getListing(id: string): Promise<Listing | null> {
    if (!db) return null;
    try {
        const snap = await getDoc(doc(db, 'listings', id));
        if (!snap.exists()) return null;
        return docToListing(snap.id, snap.data() as Record<string, unknown>);
    } catch {
        return null;
    }
}

// ── Read Multiple with Filters ─────────────────────────

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
    if (!db) return generateMockListings();

    try {
        const constraints: Parameters<typeof query>[1][] = [];

        // Always filter for active listings
        constraints.push(where('status', '==', 'active'));

        if (filters.category && filters.category !== 'all') {
            constraints.push(where('category', '==', filters.category));
        }
        if (filters.condition && filters.condition !== 'all') {
            constraints.push(where('condition', '==', filters.condition));
        }
        if (filters.listingType && filters.listingType !== 'all') {
            constraints.push(where('listingType', 'in', [filters.listingType, 'both']));
        }

        // Sort
        switch (filters.sortBy) {
            case 'price-asc':
                constraints.push(orderBy('price', 'asc'));
                break;
            case 'price-desc':
                constraints.push(orderBy('price', 'desc'));
                break;
            case 'popular':
                constraints.push(orderBy('likes', 'desc'));
                break;
            default:
                constraints.push(orderBy('createdAt', 'desc'));
        }

        // Limit
        constraints.push(limit(filters.limitCount || 50));

        // Build and run query - cast constraints properly
        const q = query(collection(db, 'listings'), ...constraints as never[]);
        const snapshot = await withTimeout(getDocs(q));

        let results = snapshot.docs.map((d) =>
            docToListing(d.id, d.data() as Record<string, unknown>)
        );

        // Client-side text search (Firestore doesn't support full-text search)
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            results = results.filter(
                (l) =>
                    l.title.toLowerCase().includes(searchLower) ||
                    l.description.toLowerCase().includes(searchLower)
            );
        }

        // Client-side price range (avoids requiring composite index with multiple inequalities)
        if (filters.priceMin !== undefined && filters.priceMin > 0) {
            results = results.filter((l) => l.price >= filters.priceMin!);
        }
        if (filters.priceMax !== undefined && filters.priceMax > 0) {
            results = results.filter((l) => l.price <= filters.priceMax!);
        }

        return results;
    } catch (err) {
        console.error('getListings error:', err);
        // Fallback to mock data in case of index issues
        return generateMockListings();
    }
}

// ── Read User's Listings ───────────────────────────────

export async function getUserListings(userId: string): Promise<Listing[]> {
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'listings'),
            where('sellerId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await withTimeout(getDocs(q));
        return snapshot.docs
            .map((d) => docToListing(d.id, d.data() as Record<string, unknown>))
            .filter((l) => l.status !== 'deleted');
    } catch (err) {
        console.error('getUserListings error:', err);
        return [];
    }
}

// ── Update ─────────────────────────────────────────────

export async function updateListing(
    id: string,
    data: Partial<Omit<Listing, 'id' | 'createdAt'>>,
): Promise<void> {
    if (!db) throw new Error('Firebase not configured');
    await updateDoc(doc(db, 'listings', id), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

// ── Delete (soft) ──────────────────────────────────────

export async function deleteListing(id: string): Promise<void> {
    if (!db) throw new Error('Firebase not configured');
    await updateDoc(doc(db, 'listings', id), {
        status: 'deleted',
        updatedAt: serverTimestamp(),
    });
}

// ── Increment views ────────────────────────────────────

export async function incrementViews(id: string): Promise<void> {
    if (!db) return;
    try {
        await updateDoc(doc(db, 'listings', id), {
            views: increment(1),
        });
    } catch (err) {
        console.error('incrementViews error:', err);
    }
}
