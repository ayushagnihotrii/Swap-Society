'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Plus,
    Loader2,
    Eye,
    Pause,
    Play,
    Trash2,
    Edit,
} from 'lucide-react';
import { getUserListings, updateListing, deleteListing } from '@/lib/listings';
import { getCategoryInfo, formatPrice } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import ProtectedRoute from '@/components/providers/ProtectedRoute';
import type { Listing, ListingStatus } from '@/types';
import styles from './page.module.css';

type TabFilter = 'all' | 'active' | 'sold' | 'rented' | 'paused';

function MyListingsContent() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabFilter>('all');

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        getUserListings(user.uid).then((data) => {
            setListings(data);
            setLoading(false);
        });
    }, [user]);

    const filtered = activeTab === 'all'
        ? listings
        : listings.filter((l) => l.status === activeTab);

    const counts = {
        all: listings.length,
        active: listings.filter((l) => l.status === 'active').length,
        sold: listings.filter((l) => l.status === 'sold').length,
        rented: listings.filter((l) => l.status === 'rented').length,
        paused: listings.filter((l) => l.status === 'paused').length,
    };

    const handlePauseToggle = async (listing: Listing) => {
        const newStatus: ListingStatus = listing.status === 'paused' ? 'active' : 'paused';
        try {
            await updateListing(listing.id, { status: newStatus });
            setListings((prev) =>
                prev.map((l) => l.id === listing.id ? { ...l, status: newStatus } : l)
            );
            showToast(
                newStatus === 'paused' ? 'Listing paused ⏸️' : 'Listing reactivated ▶️',
                'success'
            );
        } catch {
            showToast('Failed to update listing', 'error');
        }
    };

    const handleDelete = async (listing: Listing) => {
        try {
            await deleteListing(listing.id);
            setListings((prev) => prev.filter((l) => l.id !== listing.id));
            showToast('Listing deleted 🗑️', 'success');
        } catch {
            showToast('Failed to delete listing', 'error');
        }
    };

    const getStatusClass = (status: ListingStatus) => {
        switch (status) {
            case 'active': return styles.statusActive;
            case 'paused': return styles.statusPaused;
            case 'sold': return styles.statusSold;
            case 'rented': return styles.statusRented;
            default: return '';
        }
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>
                            <Package size={28} /> My Listings
                        </h1>
                        <p className={styles.subtitle}>
                            {loading ? 'Loading...' : `${listings.length} total listings`}
                        </p>
                    </div>
                    <Link href="/listing/create" className="btn btn-primary">
                        <Plus size={16} /> New Listing
                    </Link>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    {(['all', 'active', 'sold', 'rented', 'paused'] as TabFilter[]).map((tab) => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            <span className={styles.tabCount}>{counts[tab]}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
                        <p>Loading your listings...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className={styles.grid}>
                        <AnimatePresence>
                            {filtered.map((listing, i) => {
                                const cat = getCategoryInfo(listing.category);
                                const hasImage = listing.images.length > 0 && !listing.images[0].includes('placeholder');

                                return (
                                    <motion.div
                                        key={listing.id}
                                        className={styles.card}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                    >
                                        <Link href={`/listing/${listing.id}`}>
                                            <div
                                                className={styles.cardImage}
                                                style={!hasImage ? {
                                                    background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}11)`,
                                                } : undefined}
                                            >
                                                {hasImage ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={listing.images[0]} alt={listing.title} />
                                                ) : (
                                                    <span className={styles.cardEmoji}>{cat.icon}</span>
                                                )}
                                            </div>
                                        </Link>

                                        <div className={styles.cardBody}>
                                            <Link href={`/listing/${listing.id}`}>
                                                <h3 className={styles.cardTitle}>{listing.title}</h3>
                                            </Link>
                                            <div className={styles.cardMeta}>
                                                <span className={styles.cardPrice}>{formatPrice(listing.price)}</span>
                                                <span>·</span>
                                                <Eye size={12} /> {listing.views} views
                                                <span>·</span>
                                                <span className={`${styles.statusBadge} ${getStatusClass(listing.status)}`}>
                                                    {listing.status}
                                                </span>
                                            </div>
                                            <div className={styles.cardActions}>
                                                <Link href={`/listing/${listing.id}`} className={styles.actionBtn}>
                                                    <Edit size={12} /> View
                                                </Link>
                                                {(listing.status === 'active' || listing.status === 'paused') && (
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => handlePauseToggle(listing)}
                                                    >
                                                        {listing.status === 'paused' ? (
                                                            <><Play size={12} /> Activate</>
                                                        ) : (
                                                            <><Pause size={12} /> Pause</>
                                                        )}
                                                    </button>
                                                )}
                                                <button
                                                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                    onClick={() => handleDelete(listing)}
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                            <Package size={32} />
                        </div>
                        <h2 className={styles.emptyTitle}>
                            {activeTab === 'all' ? 'No listings yet' : `No ${activeTab} listings`}
                        </h2>
                        <p className={styles.emptyText}>
                            {activeTab === 'all'
                                ? 'Create your first listing and start selling or renting!'
                                : `You don't have any ${activeTab} listings.`}
                        </p>
                        {activeTab === 'all' && (
                            <Link href="/listing/create" className="btn btn-primary btn-lg">
                                <Plus size={18} /> Create Listing
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MyListingsPage() {
    return (
        <ProtectedRoute>
            <MyListingsContent />
        </ProtectedRoute>
    );
}
