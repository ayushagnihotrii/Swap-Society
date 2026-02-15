'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, IndianRupee, Loader2 } from 'lucide-react';
import { Listing } from '@/types';
import { formatPrice } from '@/lib/utils';
import { createOffer } from '@/lib/offers';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import styles from './MakeOfferModal.module.css';

interface MakeOfferModalProps {
    listing: Listing;
    isOpen: boolean;
    onClose: () => void;
}

export default function MakeOfferModal({ listing, isOpen, onClose }: MakeOfferModalProps) {
    const [offer, setOffer] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user, profile } = useAuth();
    const { showToast } = useToast();

    const suggestedPrices = [
        Math.round(listing.price * 0.7),
        Math.round(listing.price * 0.8),
        Math.round(listing.price * 0.9),
    ];

    const handleSubmit = async () => {
        if (!offer) return;
        if (!user || !profile) {
            showToast('Please log in to make an offer', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await createOffer({
                listingId: listing.id,
                listingTitle: listing.title,
                listingImage: listing.images[0],
                buyerId: user.uid,
                buyerName: profile.name || user.displayName || 'User',
                buyerAvatar: profile.avatar || user.photoURL || '',
                sellerId: listing.sellerId,
                sellerName: listing.sellerName,
                offerPrice: Number(offer),
                message,
                isRental: false,
            });
            showToast(`Offer of ₹${offer} sent to ${listing.sellerName}! 🤝`, 'success');
            onClose();
            setOffer('');
            setMessage('');
        } catch (err) {
            console.error('Create offer error:', err);
            showToast('Failed to send offer. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className={styles.header}>
                            <h2 className={styles.title}>Make an Offer</h2>
                            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.listingInfo}>
                            <span className={styles.listingTitle}>{listing.title}</span>
                            <span className={styles.askingPrice}>
                                Asking price: <strong>{formatPrice(listing.price)}</strong>
                            </span>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Your Offer</label>
                            <div className={styles.offerInput}>
                                <IndianRupee size={16} className={styles.rupee} />
                                <input
                                    type="number"
                                    placeholder="Enter your price"
                                    value={offer}
                                    onChange={(e) => setOffer(e.target.value)}
                                    className="input"
                                />
                            </div>
                            <div className={styles.suggestions}>
                                {suggestedPrices.map((p) => (
                                    <button
                                        key={p}
                                        className={`${styles.suggestBtn} ${Number(offer) === p ? styles.suggestActive : ''}`}
                                        onClick={() => setOffer(String(p))}
                                    >
                                        ₹{p.toLocaleString('en-IN')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Message (optional)</label>
                            <textarea
                                placeholder="Hey, I'm interested in this item..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className={`input ${styles.textarea}`}
                                rows={3}
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-full btn-lg"
                            onClick={handleSubmit}
                            disabled={!offer || submitting}
                        >
                            {submitting ? (
                                <><Loader2 size={18} className="spin" /> Sending...</>
                            ) : (
                                <><Send size={18} /> Send Offer</>
                            )}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
