'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ImagePlus,
    ArrowRight,
    ArrowLeft,
    Check,
    Upload,
    X,
    Loader2,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/utils';
import { createListing } from '@/lib/listings';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import ProtectedRoute from '@/components/providers/ProtectedRoute';
import { Category, ListingCondition, ListingType, RentalDuration } from '@/types';
import styles from './page.module.css';

const STEPS = ['Photos', 'Details', 'Pricing', 'Review'];

function CreateListingContent() {
    const router = useRouter();
    const { user, profile } = useAuth();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Category | ''>('');
    const [condition, setCondition] = useState<ListingCondition>('good');
    const [listingType, setListingType] = useState<ListingType>('sale');
    const [price, setPrice] = useState('');
    const [rentalDuration, setRentalDuration] = useState<RentalDuration>('day');
    const [deposit, setDeposit] = useState('');

    // Image state — store actual File objects + preview URLs
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const prev = () => setStep((s) => Math.max(s - 1, 0));

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remaining = 5 - imageFiles.length;
        const toAdd = files.slice(0, remaining);

        const newFiles = [...imageFiles, ...toAdd];
        const newPreviews = [...imagePreviews, ...toAdd.map((f) => URL.createObjectURL(f))];

        setImageFiles(newFiles);
        setImagePreviews(newPreviews);

        // Reset input so the same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!user || !profile) {
            showToast('Please log in first', 'error');
            return;
        }
        if (!title || !category) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const listingData = {
                title,
                description,
                category: category as Category,
                condition,
                listingType,
                price: Number(price) || 0,
                rentalDuration: (listingType === 'rent' || listingType === 'both') ? rentalDuration : undefined,
                deposit: (listingType === 'rent' || listingType === 'both') ? (Number(deposit) || 0) : undefined,
                sellerId: user.uid,
                sellerName: profile.name || user.displayName || 'User',
                sellerAvatar: profile.avatar || user.photoURL || '',
                sellerUniversity: profile.university || '',
                sellerRating: 0,
                status: 'active' as const,
            };

            const id = await createListing(listingData, imageFiles);
            showToast('Listing published! 🎉', 'success');
            router.push(`/listing/${id}`);
        } catch (err) {
            console.error('Create listing error:', err);
            showToast('Failed to create listing. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={`container ${styles.wrapper}`}>
                <h1 className={styles.pageTitle}>Create Listing</h1>

                {/* Progress */}
                <div className={styles.progress}>
                    {STEPS.map((label, i) => (
                        <div key={label} className={styles.progressStep}>
                            <div
                                className={`${styles.progressDot} ${i < step ? styles.done : i === step ? styles.current : ''
                                    }`}
                            >
                                {i < step ? <Check size={14} /> : i + 1}
                            </div>
                            <span
                                className={`${styles.progressLabel} ${i <= step ? styles.progressActive : ''
                                    }`}
                            >
                                {label}
                            </span>
                            {i < STEPS.length - 1 && <div className={`${styles.progressLine} ${i < step ? styles.progressLineDone : ''}`} />}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className={styles.formCard}>
                    <AnimatePresence mode="wait">
                        {/* Step 0: Photos */}
                        {step === 0 && (
                            <motion.div key="photos" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className={styles.stepContent}>
                                <h2 className={styles.stepTitle}>Upload Photos</h2>
                                <p className={styles.stepDesc}>Add up to 5 photos. The first one will be the cover image.</p>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />

                                <div className={styles.imageGrid}>
                                    {imagePreviews.map((preview, i) => (
                                        <div key={i} className={styles.imageThumb}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={preview}
                                                alt={`Preview ${i + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: 'inherit',
                                                }}
                                            />
                                            {i === 0 && <span className={styles.coverBadge}>Cover</span>}
                                            <button className={styles.removeImg} onClick={() => removeImage(i)}>
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {imageFiles.length < 5 && (
                                        <button
                                            className={styles.addImage}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <ImagePlus size={24} />
                                            <span>Add Photo</span>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 1: Details */}
                        {step === 1 && (
                            <motion.div key="details" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className={styles.stepContent}>
                                <h2 className={styles.stepTitle}>Item Details</h2>

                                <div className={styles.field}>
                                    <label className={styles.label}>Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. MacBook Air M2 — Like New"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="input"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Description</label>
                                    <textarea
                                        placeholder="Describe your item in detail..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={`input ${styles.textarea}`}
                                        rows={4}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Category</label>
                                    <div className={styles.categoryPicker}>
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.id}
                                                className={`${styles.catOption} ${category === cat.id ? styles.catActive : ''}`}
                                                onClick={() => setCategory(cat.id)}
                                                style={{ '--cat-color': cat.color } as React.CSSProperties}
                                            >
                                                <span>{cat.icon}</span> {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Condition</label>
                                    <div className={styles.toggleGroup}>
                                        {(['like-new', 'good', 'fair', 'well-used'] as ListingCondition[]).map((c) => (
                                            <button
                                                key={c}
                                                className={`${styles.toggleBtn} ${condition === c ? styles.toggleActive : ''}`}
                                                onClick={() => setCondition(c)}
                                            >
                                                {c === 'like-new' ? 'Like New' : c.charAt(0).toUpperCase() + c.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Pricing */}
                        {step === 2 && (
                            <motion.div key="pricing" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className={styles.stepContent}>
                                <h2 className={styles.stepTitle}>Set Your Price</h2>

                                <div className={styles.field}>
                                    <label className={styles.label}>Listing Type</label>
                                    <div className={styles.toggleGroup}>
                                        {(['sale', 'rent', 'both'] as ListingType[]).map((t) => (
                                            <button
                                                key={t}
                                                className={`${styles.toggleBtn} ${listingType === t ? styles.toggleActive : ''}`}
                                                onClick={() => setListingType(t)}
                                            >
                                                {t === 'sale' ? '🏷️ For Sale' : t === 'rent' ? '🔄 For Rent' : '✨ Both'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        {listingType === 'rent' ? 'Rental Price (₹)' : 'Price (₹)'}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="input"
                                    />
                                </div>

                                {(listingType === 'rent' || listingType === 'both') && (
                                    <>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Rental Duration</label>
                                            <div className={styles.toggleGroup}>
                                                {(['day', 'week', 'month'] as RentalDuration[]).map((d) => (
                                                    <button
                                                        key={d}
                                                        className={`${styles.toggleBtn} ${rentalDuration === d ? styles.toggleActive : ''}`}
                                                        onClick={() => setRentalDuration(d)}
                                                    >
                                                        Per {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.field}>
                                            <label className={styles.label}>Refundable Deposit (₹)</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={deposit}
                                                onChange={(e) => setDeposit(e.target.value)}
                                                className="input"
                                            />
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className={styles.stepContent}>
                                <h2 className={styles.stepTitle}>Review & Publish</h2>
                                <p className={styles.stepDesc}>Make sure everything looks good before publishing.</p>

                                <div className={styles.reviewGrid}>
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Title</span>
                                        <span className={styles.reviewValue}>{title || '—'}</span>
                                    </div>
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Category</span>
                                        <span className={styles.reviewValue}>
                                            {category ? CATEGORIES.find((c) => c.id === category)?.label : '—'}
                                        </span>
                                    </div>
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Condition</span>
                                        <span className={styles.reviewValue}>{condition}</span>
                                    </div>
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Type</span>
                                        <span className={styles.reviewValue}>{listingType}</span>
                                    </div>
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Price</span>
                                        <span className={styles.reviewValue}>₹{price || '0'}</span>
                                    </div>
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Photos</span>
                                        <span className={styles.reviewValue}>{imageFiles.length} uploaded</span>
                                    </div>
                                </div>

                                <div className={styles.reviewDesc}>
                                    <span className={styles.reviewLabel}>Description</span>
                                    <p className={styles.reviewValue}>{description || '—'}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className={styles.navButtons}>
                        {step > 0 && (
                            <button className="btn btn-secondary" onClick={prev} disabled={submitting}>
                                <ArrowLeft size={16} /> Back
                            </button>
                        )}
                        <div style={{ flex: 1 }} />
                        {step < STEPS.length - 1 ? (
                            <button className="btn btn-primary" onClick={next}>
                                Continue <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={18} className="spin" /> Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} /> Publish Listing
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CreateListingPage() {
    return (
        <ProtectedRoute>
            <CreateListingContent />
        </ProtectedRoute>
    );
}
