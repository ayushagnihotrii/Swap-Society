'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, IndianRupee } from 'lucide-react';
import { Listing } from '@/types';
import { formatPrice } from '@/lib/utils';
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
    const { showToast } = useToast();

    const suggestedPrices = [
        Math.round(listing.price * 0.7),
        Math.round(listing.price * 0.8),
        Math.round(listing.price * 0.9),
    ];

    const handleSubmit = () => {
        if (!offer) return;
        showToast(`Offer of ₹${offer} sent to ${listing.sellerName}! 🤝`, 'success');
        onClose();
        setOffer('');
        setMessage('');
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
                            disabled={!offer}
                        >
                            <Send size={18} /> Send Offer
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
