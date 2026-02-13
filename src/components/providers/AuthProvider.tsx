'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
    User as FirebaseUser,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// ── Types ──────────────────────────────────────────────
interface UserProfile {
    uid: string;
    name: string;
    email: string;
    avatar: string;
    university: string;
    bio: string;
    isVerified: boolean;
    createdAt: string;
}

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    loading: boolean;
    signUp: (email: string, password: string, name: string, university: string) => Promise<void>;
    logIn: (email: string, password: string) => Promise<void>;
    googleSignIn: () => Promise<void>;
    logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// ── Helper: save user profile to Firestore ─────────────
async function saveUserProfile(
    uid: string,
    data: { name: string; email: string; avatar: string; university: string }
) {
    if (!db) return;
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            ...data,
            bio: '',
            isVerified: false,
            rating: 0,
            totalReviews: 0,
            listings: [],
            wishlist: [],
            createdAt: serverTimestamp(),
        });
    }
}

// ── Helper: fetch user profile from Firestore ──────────
async function fetchProfile(uid: string): Promise<UserProfile | null> {
    if (!db) return null;
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
        uid,
        name: d.name ?? '',
        email: d.email ?? '',
        avatar: d.avatar ?? '',
        university: d.university ?? '',
        bio: d.bio ?? '',
        isVerified: d.isVerified ?? false,
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
    };
}

// ── Provider ───────────────────────────────────────────
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen to auth state
    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        // Handle Google redirect result
        getRedirectResult(auth)
            .then(async (result) => {
                if (result?.user) {
                    await saveUserProfile(result.user.uid, {
                        name: result.user.displayName ?? 'User',
                        email: result.user.email ?? '',
                        avatar: result.user.photoURL ?? `https://api.dicebear.com/7.x/initials/svg?seed=U`,
                        university: '',
                    });
                }
            })
            .catch(() => { });

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const p = await fetchProfile(firebaseUser.uid);
                setProfile(p);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Email/password sign-up
    const signUp = useCallback(
        async (email: string, password: string, name: string, university: string) => {
            if (!auth) throw new Error('Firebase not configured');
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(cred.user, { displayName: name });
            await saveUserProfile(cred.user.uid, {
                name,
                email,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
                university,
            });
            const p = await fetchProfile(cred.user.uid);
            setProfile(p);
        },
        []
    );

    // Email/password log-in
    const logIn = useCallback(async (email: string, password: string) => {
        if (!auth) throw new Error('Firebase not configured');
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const p = await fetchProfile(cred.user.uid);
        setProfile(p);
    }, []);

    // Google sign-in (redirect-based for Safari compatibility)
    const googleSignIn = useCallback(async () => {
        if (!auth) throw new Error('Firebase not configured');
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    }, []);

    // Log out
    const logOut = useCallback(async () => {
        if (!auth) return;
        await signOut(auth);
        setProfile(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, logIn, googleSignIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
}
