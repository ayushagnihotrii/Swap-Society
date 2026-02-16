'use client';

import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getListing } from '@/lib/listings';
import type { Listing } from '@/types';

// ── Add a listing to user's wishlist ───────────────────
export async function addToWishlist(userId: string, listingId: string): Promise<void> {
    if (!db) throw new Error('Firebase not configured');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        wishlist: arrayUnion(listingId),
    });
}

// ── Remove a listing from user's wishlist ──────────────
export async function removeFromWishlist(userId: string, listingId: string): Promise<void> {
    if (!db) throw new Error('Firebase not configured');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        wishlist: arrayRemove(listingId),
    });
}

// ── Check if a listing is in user's wishlist ───────────
export async function isInWishlist(userId: string, listingId: string): Promise<boolean> {
    if (!db) return false;
    try {
        const userRef = doc(db, 'users', userId);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return false;
        const data = snap.data();
        const wishlist = (data.wishlist as string[]) || [];
        return wishlist.includes(listingId);
    } catch {
        return false;
    }
}

// ── Get all wishlist listings for a user ───────────────
export async function getWishlistListings(userId: string): Promise<Listing[]> {
    if (!db) return [];
    try {
        const userRef = doc(db, 'users', userId);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return [];

        const data = snap.data();
        const wishlistIds = (data.wishlist as string[]) || [];

        if (wishlistIds.length === 0) return [];

        // Fetch each listing (Firestore doesn't support `whereIn` with > 30 items,
        // but wishlists are typically small)
        const listings = await Promise.all(
            wishlistIds.map((id) => getListing(id))
        );

        // Filter out nulls (deleted listings) and non-active listings
        return listings.filter(
            (l): l is Listing => l !== null && l.status === 'active'
        );
    } catch (err) {
        console.error('getWishlistListings error:', err);
        return [];
    }
}
