'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Listing, CartItem } from '@/types';

// ── Types ──────────────────────────────────────────────
interface CartContextType {
    items: CartItem[];
    addToCart: (listing: Listing, isRental?: boolean, rentalDays?: number) => void;
    removeFromCart: (listingId: string) => void;
    updateQuantity: (listingId: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isInCart: (listingId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

const CART_KEY = 'swapsociety_cart';

// ── Provider ───────────────────────────────────────────
export default function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
        setHydrated(true);
    }, []);

    // Persist to localStorage on change (after hydration)
    useEffect(() => {
        if (hydrated) {
            localStorage.setItem(CART_KEY, JSON.stringify(items));
        }
    }, [items, hydrated]);

    const addToCart = useCallback((listing: Listing, isRental = false, rentalDays?: number) => {
        setItems((prev) => {
            const exists = prev.find((item) => item.listing.id === listing.id);
            if (exists) {
                // Increment quantity
                return prev.map((item) =>
                    item.listing.id === listing.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { listing, quantity: 1, isRental, rentalDays }];
        });
    }, []);

    const removeFromCart = useCallback((listingId: string) => {
        setItems((prev) => prev.filter((item) => item.listing.id !== listingId));
    }, []);

    const updateQuantity = useCallback((listingId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems((prev) => prev.filter((item) => item.listing.id !== listingId));
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
                item.listing.id === listingId ? { ...item, quantity } : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const isInCart = useCallback(
        (listingId: string) => items.some((item) => item.listing.id === listingId),
        [items]
    );

    const cartCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

    const cartTotal = useMemo(
        () => items.reduce((sum, item) => sum + item.listing.price * item.quantity, 0),
        [items]
    );

    return (
        <CartContext.Provider
            value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isInCart }}
        >
            {children}
        </CartContext.Provider>
    );
}
