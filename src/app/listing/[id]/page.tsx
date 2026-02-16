'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Heart,
    Share2,
    MessageCircle,
    ShoppingBag,
    Star,
    MapPin,
    Clock,
    Shield,
    ChevronLeft,
    HandCoins,
    Loader2,
    Calendar,
} from 'lucide-react';
import { formatPrice, timeAgo, getCategoryInfo } from '@/lib/utils';
import { getListing, incrementViews } from '@/lib/listings';
import { getReviewsForUser } from '@/lib/reviews';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist';
import { findOrCreateConversation } from '@/lib/messages';
import { useToast } from '@/components/ui/Toast';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import MakeOfferModal from '@/components/listing/MakeOfferModal';
import type { Listing, Review } from '@/types';
import styles from './page.module.css';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    const [liked, setLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [offerOpen, setOfferOpen] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const { showToast } = useToast();
    const { addToCart } = useCart();
    const { user, profile } = useAuth();

    // Reviews state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // Rental date state
    const [rentalStart, setRentalStart] = useState('');
    const [rentalEnd, setRentalEnd] = useState('');

    // Fetch listing
    useEffect(() => {
        setLoading(true);
        getListing(id).then((l) => {
            setListing(l);
            setLoading(false);
        });
    }, [id]);

    // Increment view count (once per session)
    useEffect(() => {
        const viewKey = `viewed_${id}`;
        if (!sessionStorage.getItem(viewKey)) {
            sessionStorage.setItem(viewKey, '1');
            incrementViews(id);
        }
    }, [id]);

    // Check wishlist status
    useEffect(() => {
        if (!user) {
            setLikeLoading(false);
            return;
        }
        isInWishlist(user.uid, id).then((val) => {
            setLiked(val);
            setLikeLoading(false);
        });
    }, [user, id]);

    // Fetch reviews when listing loads
    useEffect(() => {
        if (!listing) return;
        setReviewsLoading(true);
        getReviewsForUser(listing.sellerId).then((r) => {
            setReviews(r);
            setReviewsLoading(false);
        });
    }, [listing]);

    const rentalCalc = useMemo(() => {
        if (!listing || !rentalStart || !rentalEnd) return null;
        const start = new Date(rentalStart);
        const end = new Date(rentalEnd);
        if (end <= start) return null;

        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let units = diffDays;
        if (listing.rentalDuration === 'week') units = Math.ceil(diffDays / 7);
        if (listing.rentalDuration === 'month') units = Math.ceil(diffDays / 30);

        const rentalCost = listing.price * units;
        const deposit = listing.deposit || 0;
        return { diffDays, units, rentalCost, deposit, total: rentalCost + deposit };
    }, [listing, rentalStart, rentalEnd]);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.skeleton}>
                        <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
                        <p>Loading listing...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.notFound}>
                        <h2 className={styles.notFoundTitle}>Listing Not Found</h2>
                        <p className={styles.notFoundDesc}>This listing may have been removed or doesn&apos;t exist.</p>
                        <Link href="/explore" className="btn btn-primary">
                            Browse Listings
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const categoryInfo = getCategoryInfo(listing.category);
    const badgeClass =
        listing.listingType === 'rent' ? 'badge-rent' : listing.listingType === 'sale' ? 'badge-sale' : 'badge-rent';
    const badgeLabel =
        listing.listingType === 'rent' ? 'For Rent' : listing.listingType === 'sale' ? 'For Sale' : 'Rent / Buy';
    const hasRealImages = listing.images.length > 0 && !listing.images[0].includes('placeholder');
    const isRentable = listing.listingType === 'rent' || listing.listingType === 'both';

    const handleLike = async () => {
        if (!user) {
            showToast('Please log in to save items', 'error');
            return;
        }
        try {
            if (liked) {
                await removeFromWishlist(user.uid, id);
                setLiked(false);
                showToast('Removed from wishlist', 'info');
            } else {
                await addToWishlist(user.uid, id);
                setLiked(true);
                showToast('Saved to wishlist ❤️', 'success');
            }
        } catch {
            showToast('Failed to update wishlist', 'error');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard! 📋', 'success');
    };

    const handleRentNow = () => {
        if (!rentalStart || !rentalEnd || !rentalCalc) {
            showToast('Please select rental dates first', 'error');
            return;
        }
        addToCart(listing, true, rentalCalc.diffDays);
        showToast('Rental added to cart! 🛒', 'success');
    };

    const handleChatWithSeller = async () => {
        if (!user || !profile) {
            showToast('Please log in to chat with the seller', 'error');
            return;
        }
        if (user.uid === listing.sellerId) {
            showToast('This is your own listing!', 'info');
            return;
        }

        setChatLoading(true);
        try {
            const conversationId = await findOrCreateConversation(
                user.uid,
                profile.name || user.displayName || 'User',
                profile.avatar || user.photoURL || '',
                listing.sellerId,
                listing.sellerName,
                listing.sellerAvatar,
                listing.id,
                listing.title,
            );
            router.push(`/messages?conv=${conversationId}`);
        } catch {
            showToast('Failed to start conversation', 'error');
        } finally {
            setChatLoading(false);
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className={styles.page}>
            <div className="container">
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link href="/explore" className={styles.breadcrumbLink}>
                        <ChevronLeft size={16} /> Back to Explore
                    </Link>
                </nav>

                <div className={styles.layout}>
                    {/* Left — Image */}
                    <motion.div
                        className={styles.imageSection}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {hasRealImages ? (
                            <>
                                <div className={styles.mainImageReal}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={listing.images[activeImage]} alt={listing.title} />
                                    <div className={styles.imageBadges}>
                                        <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                                    </div>
                                </div>
                                {listing.images.length > 1 && (
                                    <div className={styles.thumbnailStrip}>
                                        {listing.images.map((img, i) => (
                                            <div
                                                key={i}
                                                className={`${styles.thumbImg} ${i === activeImage ? styles.thumbActive : ''}`}
                                                onClick={() => setActiveImage(i)}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={img} alt={`${listing.title} ${i + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div
                                className={styles.mainImage}
                                style={{
                                    background: `linear-gradient(135deg, ${categoryInfo.color}33, ${categoryInfo.color}11)`,
                                }}
                            >
                                <span className={styles.imageEmoji}>{categoryInfo.icon}</span>
                                <div className={styles.imageBadges}>
                                    <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Right — Details */}
                    <motion.div
                        className={styles.detailSection}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className={styles.detailTop}>
                            <span className={styles.category} style={{ color: categoryInfo.color }}>
                                {categoryInfo.icon} {categoryInfo.label}
                            </span>
                            <div className={styles.actions}>
                                <button
                                    className={`${styles.actionBtn} ${liked ? styles.liked : ''}`}
                                    onClick={handleLike}
                                    disabled={likeLoading}
                                    aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                                </button>
                                <button className={styles.actionBtn} onClick={handleShare} aria-label="Share listing">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h1 className={styles.title}>{listing.title}</h1>

                        <div className={styles.pricingCard}>
                            <div className={styles.priceRow}>
                                <span className={styles.price}>{formatPrice(listing.price)}</span>
                                {isRentable && listing.rentalDuration && (
                                    <span className={styles.pricePer}>/ {listing.rentalDuration}</span>
                                )}
                            </div>
                            {listing.deposit && (
                                <span className={styles.deposit}>
                                    Refundable deposit: {formatPrice(listing.deposit)}
                                </span>
                            )}
                        </div>

                        {/* Rental Date Picker */}
                        {isRentable && (
                            <div className={styles.rentalPicker}>
                                <div className={styles.rentalPickerTitle}>
                                    <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                    Select Rental Dates
                                </div>
                                <div className={styles.rentalDates}>
                                    <div>
                                        <label>Start Date</label>
                                        <input
                                            type="date"
                                            className="input"
                                            min={todayStr}
                                            value={rentalStart}
                                            onChange={(e) => setRentalStart(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label>End Date</label>
                                        <input
                                            type="date"
                                            className="input"
                                            min={rentalStart || todayStr}
                                            value={rentalEnd}
                                            onChange={(e) => setRentalEnd(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {rentalCalc && (
                                    <div className={styles.rentalSummary}>
                                        <span>{rentalCalc.diffDays} days ({rentalCalc.units} {listing.rentalDuration}{rentalCalc.units > 1 ? 's' : ''})</span>
                                        <span className={styles.rentalTotal}>{formatPrice(rentalCalc.total)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.metaGrid}>
                            <div className={styles.metaItem}>
                                <Clock size={14} />
                                <span>Listed {timeAgo(listing.createdAt)}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Shield size={14} />
                                <span>
                                    {listing.condition === 'like-new'
                                        ? 'Like New'
                                        : listing.condition === 'good'
                                            ? 'Good Condition'
                                            : listing.condition === 'fair'
                                                ? 'Fair Condition'
                                                : 'Well Used'}
                                </span>
                            </div>
                            <div className={styles.metaItem}>
                                <Heart size={14} />
                                <span>{listing.likes} likes</span>
                            </div>
                        </div>

                        {/* Seller Card */}
                        <Link href={`/profile/${listing.sellerId}`} className={styles.sellerCardLink}>
                            <div className={styles.sellerCard}>
                                <div className={styles.sellerAvatar}>
                                    {listing.sellerName.charAt(0)}
                                </div>
                                <div className={styles.sellerInfo}>
                                    <span className={styles.sellerName}>{listing.sellerName}</span>
                                    <div className={styles.sellerMeta}>
                                        <MapPin size={12} />
                                        <span>{listing.sellerUniversity}</span>
                                        <span className={styles.sellerDot}>·</span>
                                        <Star size={12} fill="var(--accent-warning)" stroke="var(--accent-warning)" />
                                        <span>{listing.sellerRating}</span>
                                    </div>
                                </div>
                                <span className="badge badge-verified">Verified</span>
                            </div>
                        </Link>

                        {/* CTA Buttons */}
                        <div className={styles.ctaGroup}>
                            {isRentable && (
                                <button
                                    className="btn btn-primary btn-lg btn-full"
                                    onClick={handleRentNow}
                                >
                                    <ShoppingBag size={18} /> Rent Now
                                    {rentalCalc ? ` — ${formatPrice(rentalCalc.total)}` : ''}
                                </button>
                            )}
                            {(listing.listingType === 'sale' || listing.listingType === 'both') && (
                                <button
                                    className="btn btn-secondary btn-lg btn-full"
                                    onClick={() => {
                                        addToCart(listing);
                                        showToast('Added to cart! 🛒', 'success');
                                    }}
                                >
                                    <ShoppingBag size={18} /> Buy Now — {formatPrice(listing.price)}
                                </button>
                            )}
                            <button
                                className={`btn btn-ghost btn-full ${styles.offerBtn}`}
                                onClick={() => {
                                    if (!user) {
                                        showToast('Please log in to make an offer', 'error');
                                        return;
                                    }
                                    setOfferOpen(true);
                                }}
                            >
                                <HandCoins size={18} /> Make an Offer
                            </button>
                            <button
                                className={`btn btn-ghost btn-full ${styles.chatBtn}`}
                                onClick={handleChatWithSeller}
                                disabled={chatLoading}
                            >
                                {chatLoading ? (
                                    <><Loader2 size={18} className="spin" /> Opening chat...</>
                                ) : (
                                    <><MessageCircle size={18} /> Chat with Seller</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Tabs — Description / Reviews */}
                <div className={styles.tabSection}>
                    <div className={styles.tabs} role="tablist">
                        <button
                            className={`${styles.tab} ${activeTab === 'description' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('description')}
                            role="tab"
                            aria-selected={activeTab === 'description'}
                        >
                            Description
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('reviews')}
                            role="tab"
                            aria-selected={activeTab === 'reviews'}
                        >
                            Reviews ({reviews.length})
                        </button>
                    </div>

                    {activeTab === 'description' ? (
                        <motion.div
                            className={styles.tabContent}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key="desc"
                            role="tabpanel"
                        >
                            <p className={styles.description}>{listing.description}</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className={styles.tabContent}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key="reviews"
                            role="tabpanel"
                        >
                            {reviewsLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                    <Loader2 size={24} className="spin" style={{ color: 'var(--accent-primary)' }} />
                                </div>
                            ) : reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className={styles.reviewCard}>
                                        <div className={styles.reviewHeader}>
                                            <div className={styles.reviewAvatar}>{review.reviewerName.charAt(0)}</div>
                                            <div>
                                                <span className={styles.reviewName}>{review.reviewerName}</span>
                                                <div className={styles.reviewStars}>
                                                    {Array.from({ length: 5 }, (_, j) => (
                                                        <Star
                                                            key={j}
                                                            size={12}
                                                            fill={j < review.rating ? 'var(--accent-warning)' : 'transparent'}
                                                            stroke={j < review.rating ? 'var(--accent-warning)' : 'var(--text-muted)'}
                                                        />
                                                    ))}
                                                    <span className={styles.reviewTime}>{timeAgo(review.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className={styles.reviewText}>{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    <p>No reviews yet for this seller.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Make an Offer Modal */}
            <MakeOfferModal listing={listing} isOpen={offerOpen} onClose={() => setOfferOpen(false)} />
        </div>
    );
}
