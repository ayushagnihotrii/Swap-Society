'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HandCoins,
    Loader2,
    Inbox,
    Send,
} from 'lucide-react';
import { getOffersForSeller, getOffersByUser, updateOfferStatus } from '@/lib/offers';
import { updateListing } from '@/lib/listings';
import { formatPrice, timeAgo } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import ProtectedRoute from '@/components/providers/ProtectedRoute';
import type { Offer, OfferStatus } from '@/types';
import styles from './page.module.css';

type TabView = 'received' | 'sent';

function OffersContent() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [received, setReceived] = useState<Offer[]>([]);
    const [sent, setSent] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabView>('received');

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        Promise.all([
            getOffersForSeller(user.uid),
            getOffersByUser(user.uid),
        ]).then(([r, s]) => {
            setReceived(r);
            setSent(s);
            setLoading(false);
        });
    }, [user]);

    const handleAccept = async (offer: Offer) => {
        try {
            await updateOfferStatus(offer.id, 'accepted');
            await updateListing(offer.listingId, {
                status: offer.isRental ? 'rented' : 'sold',
            });
            setReceived((prev) =>
                prev.map((o) => o.id === offer.id ? { ...o, status: 'accepted' as OfferStatus } : o)
            );
            showToast('Offer accepted! ✅', 'success');
        } catch {
            showToast('Failed to accept offer', 'error');
        }
    };

    const handleReject = async (offer: Offer) => {
        try {
            await updateOfferStatus(offer.id, 'rejected');
            setReceived((prev) =>
                prev.map((o) => o.id === offer.id ? { ...o, status: 'rejected' as OfferStatus } : o)
            );
            showToast('Offer rejected', 'info');
        } catch {
            showToast('Failed to reject offer', 'error');
        }
    };

    const handleCancel = async (offer: Offer) => {
        try {
            await updateOfferStatus(offer.id, 'cancelled');
            setSent((prev) =>
                prev.map((o) => o.id === offer.id ? { ...o, status: 'cancelled' as OfferStatus } : o)
            );
            showToast('Offer cancelled', 'info');
        } catch {
            showToast('Failed to cancel offer', 'error');
        }
    };

    const getStatusClass = (status: OfferStatus) => {
        switch (status) {
            case 'pending': return styles.statusPending;
            case 'accepted': return styles.statusAccepted;
            case 'rejected': return styles.statusRejected;
            case 'completed': return styles.statusCompleted;
            case 'cancelled': return styles.statusCancelled;
            default: return '';
        }
    };

    const currentOffers = activeTab === 'received' ? received : sent;

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        <HandCoins size={28} /> Offers
                    </h1>
                    <p className={styles.subtitle}>
                        Manage your offers — received and sent
                    </p>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'received' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('received')}
                    >
                        <Inbox size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Received
                        <span className={styles.tabCount}>{received.length}</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'sent' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('sent')}
                    >
                        <Send size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Sent
                        <span className={styles.tabCount}>{sent.length}</span>
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
                        <p>Loading offers...</p>
                    </div>
                ) : currentOffers.length > 0 ? (
                    <div className={styles.list}>
                        <AnimatePresence>
                            {currentOffers.map((offer, i) => (
                                <motion.div
                                    key={offer.id}
                                    className={styles.card}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                >
                                    <div className={styles.cardBody}>
                                        <Link href={`/listing/${offer.listingId}`}>
                                            <h3 className={styles.cardTitle}>{offer.listingTitle}</h3>
                                        </Link>
                                        <div className={styles.cardMeta}>
                                            <span>
                                                {activeTab === 'received'
                                                    ? `From: ${offer.buyerName}`
                                                    : `To: ${offer.sellerName}`}
                                            </span>
                                            <span>·</span>
                                            <span>{timeAgo(offer.createdAt)}</span>
                                            <span>·</span>
                                            {offer.isRental && <span>🔄 Rental</span>}
                                            <span className={`${styles.statusBadge} ${getStatusClass(offer.status)}`}>
                                                {offer.status}
                                            </span>
                                        </div>
                                        <div className={styles.offerAmount}>
                                            {formatPrice(offer.offerPrice)}
                                        </div>
                                        {offer.message && (
                                            <p className={styles.offerMessage}>
                                                &ldquo;{offer.message}&rdquo;
                                            </p>
                                        )}
                                        {offer.isRental && offer.rentalStartDate && offer.rentalEndDate && (
                                            <div className={styles.cardMeta}>
                                                📅 {offer.rentalStartDate} → {offer.rentalEndDate}
                                                {offer.rentalDays && ` (${offer.rentalDays} days)`}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {offer.status === 'pending' && (
                                            <div className={styles.cardActions}>
                                                {activeTab === 'received' ? (
                                                    <>
                                                        <button className={styles.acceptBtn} onClick={() => handleAccept(offer)}>
                                                            Accept
                                                        </button>
                                                        <button className={styles.rejectBtn} onClick={() => handleReject(offer)}>
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className={styles.cancelBtn} onClick={() => handleCancel(offer)}>
                                                        Cancel Offer
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                            {activeTab === 'received' ? <Inbox size={32} /> : <Send size={32} />}
                        </div>
                        <h2 className={styles.emptyTitle}>
                            {activeTab === 'received' ? 'No offers received' : 'No offers sent'}
                        </h2>
                        <p className={styles.emptyText}>
                            {activeTab === 'received'
                                ? 'When someone makes an offer on your listings, it will appear here.'
                                : 'Offers you make on listings will appear here.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OffersPage() {
    return (
        <ProtectedRoute>
            <OffersContent />
        </ProtectedRoute>
    );
}
