'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Clock } from 'lucide-react';
import { Listing } from '@/types';
import { formatPrice, timeAgo, getCategoryInfo } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import styles from './ListingCard.module.css';

interface ListingCardProps {
    listing: Listing;
    index?: number;
}

export default function ListingCard({ listing, index = 0 }: ListingCardProps) {
    const [liked, setLiked] = useState(false);
    const [animateLike, setAnimateLike] = useState(false);
    const categoryInfo = getCategoryInfo(listing.category);
    const { showToast } = useToast();

    const badgeClass =
        listing.listingType === 'rent' ? 'badge-rent' : listing.listingType === 'sale' ? 'badge-sale' : 'badge-rent';
    const badgeLabel =
        listing.listingType === 'rent' ? 'FOR RENT' : listing.listingType === 'sale' ? 'FOR SALE' : 'RENT / BUY';

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLiked(!liked);
        setAnimateLike(true);
        setTimeout(() => setAnimateLike(false), 600);
        if (!liked) {
            showToast(`Added "${listing.title}" to wishlist ❤️`, 'success');
        } else {
            showToast(`Removed from wishlist`, 'info');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <Link href={`/listing/${listing.id}`} className={styles.card}>
                {/* Image */}
                <div
                    className={styles.imageWrap}
                    style={{
                        background: `linear-gradient(135deg, ${categoryInfo.color}33, ${categoryInfo.color}11)`,
                    }}
                >
                    <span className={styles.emoji}>{categoryInfo.icon}</span>
                    <div className={styles.topRow}>
                        <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                        <motion.button
                            className={`${styles.likeBtn} ${liked ? styles.liked : ''}`}
                            onClick={handleLike}
                            animate={animateLike ? { scale: [1, 1.4, 1] } : {}}
                            transition={{ duration: 0.3 }}
                            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                            {/* Particle burst */}
                            {animateLike && liked && (
                                <span className={styles.particles}>
                                    {[...Array(6)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={styles.particle}
                                            style={{
                                                '--angle': `${i * 60}deg`,
                                                '--delay': `${i * 0.03}s`,
                                            } as React.CSSProperties}
                                        />
                                    ))}
                                </span>
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Info */}
                <div className={styles.info}>
                    <h3 className={styles.title}>{listing.title}</h3>
                    <p className={styles.meta}>
                        {listing.sellerUniversity} · {timeAgo(listing.createdAt)}
                    </p>
                    <div className={styles.bottom}>
                        <div className={styles.priceWrap}>
                            <span className={styles.price}>{formatPrice(listing.price)}</span>
                            {listing.listingType === 'rent' && listing.rentalDuration && (
                                <span className={styles.per}>/{listing.rentalDuration}</span>
                            )}
                        </div>
                        <span className={styles.condition}>
                            <span
                                className={styles.conditionDot}
                                style={{
                                    background:
                                        listing.condition === 'like-new'
                                            ? 'var(--accent-success)'
                                            : listing.condition === 'good'
                                                ? 'var(--accent-warning)'
                                                : 'var(--text-muted)',
                                }}
                            />
                            {listing.condition === 'like-new' ? 'Like New' : listing.condition === 'good' ? 'Good' : 'Fair'}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
