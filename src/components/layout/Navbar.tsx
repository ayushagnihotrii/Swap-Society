'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ShoppingBag,
    User,
    Menu,
    X,
    Plus,
    Heart,
    MessageCircle,
    LogIn,
    Sun,
    Moon,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import Logo from '@/components/ui/Logo';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const trendingSearches = ['MacBook Air', 'Textbooks', 'Nike Shoes', 'Bluetooth Speaker'];
    const categories = ['Electronics', 'Clothing', 'Books', 'Furniture', 'Shoes'];

    const handleSearchFocus = () => {
        setSearchFocused(true);
        setShowSuggestions(true);
    };

    const handleSearchBlur = () => {
        setSearchFocused(false);
        setTimeout(() => setShowSuggestions(false), 200);
    };

    return (
        <>
            <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
                <div className={`container ${styles.inner}`}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <Logo size={28} />
                        <span className={styles.logoText}>
                            Swap<span className={styles.logoAccent}>Society</span>
                        </span>
                    </Link>

                    {/* Search Bar with Autocomplete */}
                    <div className={styles.searchContainer}>
                        <div className={`${styles.searchWrapper} ${searchFocused ? styles.searchActive : ''}`}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search for anything..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                aria-label="Search items"
                            />
                            {searchQuery && (
                                <button
                                    className={styles.clearSearch}
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && (
                                <motion.div
                                    className={styles.searchDropdown}
                                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {searchQuery ? (
                                        <>
                                            <div className={styles.dropdownSection}>
                                                <span className={styles.dropdownLabel}>Results</span>
                                                <Link href={`/explore?q=${searchQuery}`} className={styles.dropdownItem}>
                                                    <Search size={14} /> Search for &quot;{searchQuery}&quot;
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={styles.dropdownSection}>
                                                <span className={styles.dropdownLabel}>🔥 Trending</span>
                                                {trendingSearches.map((s) => (
                                                    <button
                                                        key={s}
                                                        className={styles.dropdownItem}
                                                        onClick={() => setSearchQuery(s)}
                                                    >
                                                        <Search size={14} /> {s}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className={styles.dropdownDivider} />
                                            <div className={styles.dropdownSection}>
                                                <span className={styles.dropdownLabel}>📂 Categories</span>
                                                {categories.map((c) => (
                                                    <Link
                                                        key={c}
                                                        href={`/explore?category=${c.toLowerCase()}`}
                                                        className={styles.dropdownItem}
                                                    >
                                                        {c}
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Desktop Nav */}
                    <div className={styles.navActions}>
                        <Link href="/explore" className={styles.navLink}>
                            Explore
                        </Link>

                        <Link href="/listing/create" className={`btn btn-primary ${styles.sellBtn}`}>
                            <Plus size={16} />
                            <span>Sell / Rent</span>
                        </Link>

                        <Link href="/wishlist" className={styles.iconBtn} title="Wishlist" aria-label="Wishlist">
                            <Heart size={20} />
                        </Link>

                        <Link href="/messages" className={styles.iconBtn} title="Messages" aria-label="Messages">
                            <MessageCircle size={20} />
                            <span className={styles.notifDot}></span>
                        </Link>

                        <Link href="/cart" className={styles.iconBtn} title="Cart" aria-label="Cart">
                            <ShoppingBag size={20} />
                            <span className={styles.cartBadge}>2</span>
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            className={styles.iconBtn}
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                            aria-label="Toggle theme"
                        >
                            <motion.div
                                key={theme}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </motion.div>
                        </button>

                        <Link href="/auth/login" className={`btn btn-secondary ${styles.authBtn}`}>
                            <LogIn size={16} />
                            <span>Login</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={styles.menuToggle}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className={styles.mobileSearchWrapper}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search for anything..."
                                className={styles.searchInput}
                                aria-label="Search items"
                            />
                        </div>
                        <Link href="/explore" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                            Explore
                        </Link>
                        <Link href="/listing/create" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                            Sell / Rent an Item
                        </Link>
                        <Link href="/wishlist" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                            Wishlist
                        </Link>
                        <Link href="/messages" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                            Messages
                        </Link>
                        <Link href="/cart" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                            Cart
                        </Link>
                        <div className={styles.mobileDivider} />
                        <button className={styles.themeMobileBtn} onClick={toggleTheme}>
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <Link
                            href="/auth/login"
                            className={`btn btn-primary btn-full ${styles.mobileAuthBtn}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <LogIn size={16} />
                            Login / Sign Up
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
