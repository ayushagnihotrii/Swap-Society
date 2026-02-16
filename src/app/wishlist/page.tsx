'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, PackageSearch, Loader2 } from 'lucide-react';
import { formatPrice, getCategoryInfo } from '@/lib/utils';
import { getWishlistListings, removeFromWishlist } from '@/lib/wishlist';
import { useToast } from '@/components/ui/Toast';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import ProtectedRoute from '@/components/providers/ProtectedRoute';
import Link from 'next/link';
import type { Listing } from '@/types';
import styles from './page.module.css';

function WishlistContent() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { addToCart } = useCart();
    const [wishlist, setWishlist] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        getWishlistListings(user.uid).then((listings) => {
            setWishlist(listings);
            setLoading(false);
        });
    }, [user]);

    const remove = async (id: string) => {
        if (!user) return;
        try {
            await removeFromWishlist(user.uid, id);
            setWishlist((prev) => prev.filter((l) => l.id !== id));
            showToast('Removed from wishlist', 'info');
        } catch {
            showToast('Failed to remove from wishlist', 'error');
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>
                                <Heart size={28} /> My Wishlist
                            </h1>
                            <p className={styles.subtitle}>Loading...</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                        <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>
                            <Heart size={28} /> My Wishlist
                        </h1>
                        <p className={styles.subtitle}>{wishlist.length} saved items</p>
                    </div>
                </div>

                {wishlist.length > 0 ? (
                    <div className={styles.grid}>
                        <AnimatePresence>
                            {wishlist.map((listing, i) => {
                                const cat = getCategoryInfo(listing.category);
                                return (
                                    <motion.div
                                        key={listing.id}
                                        className={styles.card}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                    >
                                        <Link href={`/listing/${listing.id}`} className={styles.cardInner}>
                                            <div
                                                className={styles.image}
                                                style={
                                                    listing.images.length > 0 && !listing.images[0].includes('placeholder')
                                                        ? undefined
                                                        : {
                                                            background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}11)`,
                                                        }
                                                }
                                            >
                                                {listing.images.length > 0 && !listing.images[0].includes('placeholder') ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={listing.images[0]}
                                                        alt={listing.title}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            borderRadius: 'inherit',
                                                        }}
                                                    />
                                                ) : (
                                                    <span className={styles.emoji}>{cat.icon}</span>
                                                )}
                                            </div>
                                            <div className={styles.info}>
                                                <h3 className={styles.itemTitle}>{listing.title}</h3>
                                                <p className={styles.university}>{listing.sellerUniversity}</p>
                                                <div className={styles.priceRow}>
                                                    <span className={styles.price}>{formatPrice(listing.price)}</span>
                                                    {listing.listingType === 'rent' && listing.rentalDuration && (
                                                        <span className={styles.per}>/{listing.rentalDuration}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.buyBtn}
                                                onClick={() => {
                                                    addToCart(listing);
                                                    showToast('Added to cart! 🛒', 'success');
                                                }}
                                                aria-label="Add to cart"
                                            >
                                                <ShoppingBag size={16} />
                                            </button>
                                            <button
                                                className={styles.removeBtn}
                                                onClick={() => remove(listing.id)}
                                                aria-label="Remove from wishlist"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        className={styles.empty}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className={styles.emptyIcon}>
                            <PackageSearch size={48} />
                        </div>
                        <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
                        <p className={styles.emptyText}>
                            Items you love will appear here. Start exploring and save your favourites!
                        </p>
                        <Link href="/explore" className="btn btn-primary btn-lg">
                            Start Exploring
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function WishlistPage() {
    return (
        <ProtectedRoute>
            <WishlistContent />
        </ProtectedRoute>
    );
}
