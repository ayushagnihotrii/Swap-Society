'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SlidersHorizontal,
    X,
    ChevronDown,
    Search,
    Loader2,
} from 'lucide-react';
import ListingCard from '@/components/listing/ListingCard';
import { CATEGORIES } from '@/lib/utils';
import { getListings } from '@/lib/listings';
import { Category, ListingType, ListingCondition, Listing } from '@/types';
import styles from './page.module.css';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular';

function ExploreContent() {
    const searchParams = useSearchParams();
    const initialCategory = (searchParams.get('category') as Category) || 'all';
    const initialSearch = searchParams.get('q') || '';

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(initialCategory);
    const [listingType, setListingType] = useState<ListingType | 'all'>('all');
    const [condition, setCondition] = useState<ListingCondition | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const results = await getListings({
                category: selectedCategory,
                condition,
                listingType,
                sortBy,
                search: search || undefined,
                priceMin: priceMin ? Number(priceMin) : undefined,
                priceMax: priceMax ? Number(priceMax) : undefined,
            });
            setListings(results);
        } catch (err) {
            console.error('Failed to fetch listings:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, condition, listingType, sortBy, search, priceMin, priceMax]);

    useEffect(() => {
        // Debounce the search
        const timer = setTimeout(() => {
            fetchListings();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchListings]);

    const clearFilters = () => {
        setSelectedCategory('all');
        setListingType('all');
        setCondition('all');
        setSortBy('newest');
        setSearch('');
        setPriceMin('');
        setPriceMax('');
    };

    const hasFilters =
        selectedCategory !== 'all' ||
        listingType !== 'all' ||
        condition !== 'all' ||
        search !== '' ||
        priceMin !== '' ||
        priceMax !== '';

    return (
        <div className={styles.page}>
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Explore</h1>
                        <p className={styles.subtitle}>
                            {loading ? 'Loading...' : `${listings.length} items available`}
                        </p>
                    </div>
                </div>

                {/* Search + Filter Bar */}
                <div className={styles.toolbar}>
                    <div className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        {search && (
                            <button
                                className={styles.clearSearch}
                                onClick={() => setSearch('')}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <button
                        className={`btn btn-secondary ${styles.filterBtn} ${filterOpen ? styles.filterActive : ''}`}
                        onClick={() => setFilterOpen(!filterOpen)}
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                        {hasFilters && <span className={styles.filterDot} />}
                    </button>

                    <div className={styles.sortWrap}>
                        <label className={styles.sortLabel}>Sort:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className={styles.sortSelect}
                        >
                            <option value="newest">Newest</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                            <option value="popular">Most Popular</option>
                        </select>
                        <ChevronDown size={14} className={styles.sortChevron} />
                    </div>
                </div>

                {/* Category Chips */}
                <div className={styles.chips}>
                    <button
                        className={`${styles.chip} ${selectedCategory === 'all' ? styles.chipActive : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            className={`${styles.chip} ${selectedCategory === cat.id ? styles.chipActive : ''}`}
                            onClick={() =>
                                setSelectedCategory(
                                    selectedCategory === cat.id ? 'all' : cat.id
                                )
                            }
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {filterOpen && (
                        <motion.div
                            className={styles.filterPanel}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className={styles.filterGrid}>
                                <div className={styles.filterGroup}>
                                    <label className={styles.filterLabel}>Type</label>
                                    <div className={styles.filterOptions}>
                                        {(['all', 'rent', 'sale', 'both'] as const).map((t) => (
                                            <button
                                                key={t}
                                                className={`${styles.filterOption} ${listingType === t ? styles.filterOptionActive : ''}`}
                                                onClick={() => setListingType(t)}
                                            >
                                                {t === 'all' ? 'All' : t === 'both' ? 'Rent & Buy' : t === 'rent' ? 'For Rent' : 'For Sale'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.filterGroup}>
                                    <label className={styles.filterLabel}>Condition</label>
                                    <div className={styles.filterOptions}>
                                        {(['all', 'like-new', 'good', 'fair', 'well-used'] as const).map((c) => (
                                            <button
                                                key={c}
                                                className={`${styles.filterOption} ${condition === c ? styles.filterOptionActive : ''}`}
                                                onClick={() => setCondition(c)}
                                            >
                                                {c === 'all' ? 'All' : c === 'like-new' ? 'Like New' : c.charAt(0).toUpperCase() + c.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.filterGroup}>
                                    <label className={styles.filterLabel}>Price Range (₹)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceMin}
                                            onChange={(e) => setPriceMin(e.target.value)}
                                            className="input"
                                            style={{ width: '100px' }}
                                        />
                                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceMax}
                                            onChange={(e) => setPriceMax(e.target.value)}
                                            className="input"
                                            style={{ width: '100px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {hasFilters && (
                                <button className={styles.clearAll} onClick={clearFilters}>
                                    <X size={14} /> Clear all filters
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                {loading ? (
                    <div className={styles.empty}>
                        <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
                        <p className={styles.emptyDesc}>Loading listings...</p>
                    </div>
                ) : listings.length > 0 ? (
                    <div className={styles.grid}>
                        {listings.map((listing, i) => (
                            <ListingCard key={listing.id} listing={listing} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <span className={styles.emptyEmoji}>🔍</span>
                        <h3 className={styles.emptyTitle}>No items found</h3>
                        <p className={styles.emptyDesc}>
                            Try adjusting your filters or search query
                        </p>
                        <button className="btn btn-secondary" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} /></div>}>
            <ExploreContent />
        </Suspense>
    );
}
