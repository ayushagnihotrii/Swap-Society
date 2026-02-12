'use client';

import { use, useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { generateMockListings, formatPrice, timeAgo, getCategoryInfo } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import MakeOfferModal from '@/components/listing/MakeOfferModal';
import styles from './page.module.css';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const listings = generateMockListings();
    const listing = listings.find((l) => l.id === id) || listings[0];
    const categoryInfo = getCategoryInfo(listing.category);

    const [liked, setLiked] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [offerOpen, setOfferOpen] = useState(false);
    const { showToast } = useToast();

    const badgeClass =
        listing.listingType === 'rent' ? 'badge-rent' : listing.listingType === 'sale' ? 'badge-sale' : 'badge-rent';
    const badgeLabel =
        listing.listingType === 'rent' ? 'For Rent' : listing.listingType === 'sale' ? 'For Sale' : 'Rent / Buy';

    const handleLike = () => {
        setLiked(!liked);
        if (!liked) {
            showToast(`Saved to wishlist ❤️`, 'success');
        } else {
            showToast('Removed from wishlist', 'info');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard! 📋', 'success');
    };

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
                                {listing.listingType === 'rent' && listing.rentalDuration && (
                                    <span className={styles.pricePer}>/ {listing.rentalDuration}</span>
                                )}
                            </div>
                            {listing.deposit && (
                                <span className={styles.deposit}>
                                    Refundable deposit: {formatPrice(listing.deposit)}
                                </span>
                            )}
                        </div>

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
                                            : 'Fair Condition'}
                                </span>
                            </div>
                            <div className={styles.metaItem}>
                                <Heart size={14} />
                                <span>{listing.likes} likes</span>
                            </div>
                        </div>

                        {/* Seller Card */}
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

                        {/* CTA Buttons */}
                        <div className={styles.ctaGroup}>
                            {(listing.listingType === 'rent' || listing.listingType === 'both') && (
                                <button
                                    className="btn btn-primary btn-lg btn-full"
                                    onClick={() => showToast('Rental request sent! The seller will respond soon 🔄', 'success')}
                                >
                                    <ShoppingBag size={18} /> Rent Now
                                </button>
                            )}
                            {(listing.listingType === 'sale' || listing.listingType === 'both') && (
                                <button
                                    className="btn btn-secondary btn-lg btn-full"
                                    onClick={() => showToast('Added to cart! 🛒', 'success')}
                                >
                                    <ShoppingBag size={18} /> Buy Now — {formatPrice(listing.price)}
                                </button>
                            )}
                            <button
                                className={`btn btn-ghost btn-full ${styles.offerBtn}`}
                                onClick={() => setOfferOpen(true)}
                            >
                                <HandCoins size={18} /> Make an Offer
                            </button>
                            <button className={`btn btn-ghost btn-full ${styles.chatBtn}`}>
                                <MessageCircle size={18} /> Chat with Seller
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
                            Reviews (12)
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
                            {[
                                { name: 'Ananya S.', rating: 5, text: 'Amazing product! Exactly as described.', time: '2 days ago' },
                                { name: 'Vikram R.', rating: 4, text: 'Great condition. Seller was very responsive.', time: '1 week ago' },
                                { name: 'Meera K.', rating: 5, text: 'Loved it! Will buy again from this seller.', time: '2 weeks ago' },
                            ].map((review, i) => (
                                <div key={i} className={styles.reviewCard}>
                                    <div className={styles.reviewHeader}>
                                        <div className={styles.reviewAvatar}>{review.name.charAt(0)}</div>
                                        <div>
                                            <span className={styles.reviewName}>{review.name}</span>
                                            <div className={styles.reviewStars}>
                                                {Array.from({ length: 5 }, (_, j) => (
                                                    <Star
                                                        key={j}
                                                        size={12}
                                                        fill={j < review.rating ? 'var(--accent-warning)' : 'transparent'}
                                                        stroke={j < review.rating ? 'var(--accent-warning)' : 'var(--text-muted)'}
                                                    />
                                                ))}
                                                <span className={styles.reviewTime}>{review.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className={styles.reviewText}>{review.text}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Make an Offer Modal */}
            <MakeOfferModal listing={listing} isOpen={offerOpen} onClose={() => setOfferOpen(false)} />
        </div>
    );
}
