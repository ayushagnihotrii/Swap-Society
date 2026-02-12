'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ImagePlus,
    ArrowRight,
    ArrowLeft,
    Check,
    Upload,
    X,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/utils';
import { Category, ListingCondition, ListingType, RentalDuration } from '@/types';
import styles from './page.module.css';

const STEPS = ['Photos', 'Details', 'Pricing', 'Review'];

export default function CreateListingPage() {
    const [step, setStep] = useState(0);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Category | ''>('');
    const [condition, setCondition] = useState<ListingCondition>('good');
    const [listingType, setListingType] = useState<ListingType>('sale');
    const [price, setPrice] = useState('');
    const [rentalDuration, setRentalDuration] = useState<RentalDuration>('day');
    const [deposit, setDeposit] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const prev = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = () => {
        alert('Listing published! 🎉 (Firebase integration coming soon)');
    };

    const addMockImage = () => {
        if (images.length < 5) {
            setImages([...images, `image-${images.length + 1}`]);
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

                                <div className={styles.imageGrid}>
                                    {images.map((img, i) => (
                                        <div key={img} className={styles.imageThumb}>
                                            <span className={styles.thumbEmoji}>📸</span>
                                            {i === 0 && <span className={styles.coverBadge}>Cover</span>}
                                            <button className={styles.removeImg} onClick={() => setImages(images.filter((_, j) => j !== i))}>
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <button className={styles.addImage} onClick={addMockImage}>
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
                                        <span className={styles.reviewValue}>{images.length} uploaded</span>
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
                            <button className="btn btn-secondary" onClick={prev}>
                                <ArrowLeft size={16} /> Back
                            </button>
                        )}
                        <div style={{ flex: 1 }} />
                        {step < STEPS.length - 1 ? (
                            <button className="btn btn-primary" onClick={next}>
                                Continue <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
                                <Upload size={18} /> Publish Listing
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
