'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SlidersHorizontal,
    X,
    ChevronDown,
    Search,
} from 'lucide-react';
import ListingCard from '@/components/listing/ListingCard';
import { CATEGORIES, generateMockListings } from '@/lib/utils';
import { Category, ListingType, ListingCondition } from '@/types';
import styles from './page.module.css';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular';

export default function ExplorePage() {
    const allListings = generateMockListings();

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
    const [listingType, setListingType] = useState<ListingType | 'all'>('all');
    const [condition, setCondition] = useState<ListingCondition | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filterOpen, setFilterOpen] = useState(false);

    const filtered = useMemo(() => {
        let result = [...allListings];

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (l) =>
                    l.title.toLowerCase().includes(q) ||
                    l.description.toLowerCase().includes(q)
            );
        }
        if (selectedCategory !== 'all') {
            result = result.filter((l) => l.category === selectedCategory);
        }
        if (listingType !== 'all') {
            result = result.filter(
                (l) => l.listingType === listingType || l.listingType === 'both'
            );
        }
        if (condition !== 'all') {
            result = result.filter((l) => l.condition === condition);
        }

        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                result.sort((a, b) => b.likes - a.likes);
                break;
            default:
                result.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
        }

        return result;
    }, [allListings, search, selectedCategory, listingType, condition, sortBy]);

    const clearFilters = () => {
        setSelectedCategory('all');
        setListingType('all');
        setCondition('all');
        setSortBy('newest');
        setSearch('');
    };

    const hasFilters =
        selectedCategory !== 'all' ||
        listingType !== 'all' ||
        condition !== 'all' ||
        search !== '';

    return (
        <div className={styles.page}>
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Explore</h1>
                        <p className={styles.subtitle}>
                            {filtered.length} items available
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
                {filtered.length > 0 ? (
                    <div className={styles.grid}>
                        {filtered.map((listing, i) => (
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
