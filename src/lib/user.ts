import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';

export async function getUserProfile(userId: string): Promise<User | null> {
    if (!db) return null;

    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            } as User;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}
