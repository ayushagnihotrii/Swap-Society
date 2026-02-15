import {
    collection,
    doc,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    runTransaction,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Review, User } from '@/types';

// Create a review and update the target user's rating stats atomically
export async function createReview(
    targetUserId: string,
    reviewData: Omit<Review, 'id' | 'createdAt'>
) {
    if (!db) return;

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Get the target user ref
            const userRef = doc(db!, 'users', targetUserId);
            const userSnap = await transaction.get(userRef);

            if (!userSnap.exists()) {
                throw new Error('User does not exist');
            }

            const userData = userSnap.data() as User;
            const currentRating = userData.rating || 0;
            const currentTotal = userData.totalReviews || 0;

            // 2. Calculate new stats
            const newTotal = currentTotal + 1;
            const newRating =
                (currentRating * currentTotal + reviewData.rating) / newTotal;

            // 3. Create the review document
            const reviewRef = doc(collection(db!, 'reviews'));
            transaction.set(reviewRef, {
                ...reviewData,
                targetUserId, // store who this review is for
                createdAt: serverTimestamp(),
            });

            // 4. Update the user stats
            transaction.update(userRef, {
                rating: Number(newRating.toFixed(1)),
                totalReviews: newTotal,
            });
        });
        return true;
    } catch (error) {
        console.error('Error creating review:', error);
        throw error;
    }
}

export async function getReviewsForUser(userId: string): Promise<Review[]> {
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'reviews'),
            where('targetUserId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                // Convert timestamp to ISO string safely
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as Review;
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}
