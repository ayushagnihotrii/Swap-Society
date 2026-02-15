'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    GraduationCap,
    Calendar,
    Star,
    Package,
    Shield,
    Loader2,
    MessageCircle,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserProfile } from '@/lib/user';
import { getUserListings } from '@/lib/listings';
import { getReviewsForUser } from '@/lib/reviews';
import ListingCard from '@/components/listing/ListingCard';
import ReviewModal from '@/components/profile/ReviewModal';
import { timeAgo } from '@/lib/utils';
import type { User, Listing, Review } from '@/types';
import styles from './page.module.css';

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();

    const [profile, setProfile] = useState<User | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [userProfile, userListings, userReviews] = await Promise.all([
                    getUserProfile(id),
                    getUserListings(id),
                    getReviewsForUser(id),
                ]);

                if (!userProfile) {
                    setProfile(null);
                } else {
                    setProfile(userProfile);
                    setListings(userListings);
                    setReviews(userReviews);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
            </div>
        );
    }

    if (!profile) {
        notFound();
    }

    const memberSince = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown';

    const isOwnProfile = user?.uid === profile.id;

    return (
        <div className={styles.page}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Header */}
                    <div className={styles.headerCard}>
                        <div className={styles.headerBg} />
                        <div className={styles.headerContent}>
                            <div className={styles.avatarSection}>
                                {profile.avatar ? (
                                    <Image
                                        src={profile.avatar}
                                        alt={profile.name}
                                        width={96}
                                        height={96}
                                        className={styles.avatar}
                                        unoptimized
                                    />
                                ) : (
                                    <div className={styles.avatarFallback}>
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {profile.isVerified && (
                                    <div className={styles.verifiedBadge} title="Verified student">
                                        <Shield size={14} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.userInfo}>
                                <h1 className={styles.name}>{profile.name}</h1>
                                {profile.university && (
                                    <p className={styles.university}>
                                        <GraduationCap size={14} />
                                        {profile.university}
                                        {profile.department && ` • ${profile.department}`}
                                        {profile.year && ` • ${profile.year}`}
                                    </p>
                                )}
                                <p className={styles.memberSince}>
                                    <Calendar size={14} /> Member since {memberSince}
                                </p>
                            </div>

                            <div className={styles.headerActions}>
                                {!isOwnProfile && (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setReviewModalOpen(true)}
                                    >
                                        <MessageCircle size={16} /> Write a Review
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <Package size={22} className={styles.statIcon} />
                            <span className={styles.statValue}>{listings.length}</span>
                            <span className={styles.statLabel}>Active Listings</span>
                        </div>
                        <div className={styles.statCard}>
                            <Star size={22} className={styles.statIcon} />
                            <span className={styles.statValue}>{profile.rating?.toFixed(1) || '—'}</span>
                            <span className={styles.statLabel}>Rating ({profile.totalReviews || 0})</span>
                        </div>
                        <div className={styles.statCard} style={{ opacity: 0.5 }}>
                            <Shield size={22} className={styles.statIcon} />
                            <span className={styles.statValue}>{profile.isVerified ? 'Yes' : 'No'}</span>
                            <span className={styles.statLabel}>Verified</span>
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className={styles.bioCard}>
                            <h2 className={styles.sectionTitle}>About</h2>
                            <p className={styles.bioText}>{profile.bio}</p>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className={styles.tabSection}>
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${activeTab === 'listings' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('listings')}
                            >
                                Listings
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                Reviews ({reviews.length})
                            </button>
                        </div>

                        {activeTab === 'listings' ? (
                            listings.length > 0 ? (
                                <div className={styles.listingsGrid}>
                                    {listings.map((listing, i) => (
                                        <ListingCard key={listing.id} listing={listing} index={i} />
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>No active listings</div>
                            )
                        ) : (
                            reviews.length > 0 ? (
                                <div className={styles.reviewsList}>
                                    {reviews.map((review) => (
                                        <div key={review.id} className={styles.reviewCard}>
                                            <div className={styles.reviewHeader}>
                                                <div className={styles.reviewAvatar}>
                                                    {review.reviewerAvatar ? (
                                                        <Image
                                                            src={review.reviewerAvatar}
                                                            alt={review.reviewerName}
                                                            width={40}
                                                            height={40}
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        review.reviewerName.charAt(0)
                                                    )}
                                                </div>
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
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>No reviews yet</div>
                            )
                        )}
                    </div>
                </motion.div>
            </div>

            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                targetUserId={profile.id}
                targetUserName={profile.name}
                onSuccess={() => {
                    // Refetch reviews and profile to update stats
                    Promise.all([
                        getUserProfile(id),
                        getReviewsForUser(id)
                    ]).then(([updatedProfile, updatedReviews]) => {
                        if (updatedProfile) setProfile(updatedProfile);
                        setReviews(updatedReviews);
                    });
                }}
            />
        </div>
    );
}
