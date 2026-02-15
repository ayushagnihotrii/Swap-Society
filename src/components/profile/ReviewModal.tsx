'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Star } from 'lucide-react';
import { createReview } from '@/lib/reviews';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import styles from './ReviewModal.module.css';

interface ReviewModalProps {
    targetUserId: string;
    targetUserName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ReviewModal({
    targetUserId,
    targetUserName,
    isOpen,
    onClose,
    onSuccess,
}: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user, profile } = useAuth();
    const { showToast } = useToast();

    const handleSubmit = async () => {
        if (rating === 0) {
            showToast('Please select a rating', 'error');
            return;
        }
        if (!user || !profile) {
            showToast('Please log in to leave a review', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await createReview(targetUserId, {
                listingId: '', // General user review
                reviewerId: user.uid,
                reviewerName: profile.name || user.displayName || 'User',
                reviewerAvatar: profile.avatar || user.photoURL || '',
                rating,
                comment,
            });
            showToast('Review submitted! ⭐️', 'success');
            onClose();
            setRating(0);
            setComment('');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Create review error:', err);
            showToast('Failed to submit review. Please try again.', 'error');
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
                            <h2 className={styles.title}>Review {targetUserName}</h2>
                            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Rate your experience</label>
                            <div className={styles.starRating}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        className={styles.starBtn}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setRating(star)}
                                    >
                                        <Star
                                            size={32}
                                            fill={star <= rating ? 'var(--accent-warning)' : 'transparent'}
                                            stroke={star <= rating ? 'var(--accent-warning)' : 'var(--text-tertiary)'}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Comment (optional)</label>
                            <textarea
                                placeholder={`How was your experience with ${targetUserName}?`}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className={styles.textarea}
                                rows={4}
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-full btn-lg"
                            onClick={handleSubmit}
                            disabled={rating === 0 || submitting}
                        >
                            {submitting ? (
                                <><Loader2 size={18} className="spin" /> Submitting...</>
                            ) : (
                                <><Send size={18} /> Submit Review</>
                            )}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
