'use client';

import Link from 'next/link';
import { Github, Twitter, Instagram, Mail, Heart } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.glowLine} />
            <div className={`container ${styles.inner}`}>
                <div className={styles.grid}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <Link href="/" className={styles.logo}>
                            <Logo size={24} />
                            <span className={styles.logoText}>
                                Swap<span className={styles.logoAccent}>Society</span>
                            </span>
                        </Link>
                        <p className={styles.tagline}>
                            The student marketplace for renting & selling pre-loved items. Built by students, for students.
                        </p>
                        <div className={styles.socials}>
                            <a href="#" className={styles.socialLink} aria-label="Instagram"><Instagram size={18} /></a>
                            <a href="#" className={styles.socialLink} aria-label="Twitter"><Twitter size={18} /></a>
                            <a href="#" className={styles.socialLink} aria-label="GitHub"><Github size={18} /></a>
                            <a href="#" className={styles.socialLink} aria-label="Email"><Mail size={18} /></a>
                        </div>
                    </div>

                    {/* Marketplace */}
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Marketplace</h4>
                        <Link href="/explore" className={styles.footerLink}>Browse All</Link>
                        <Link href="/explore?category=clothing" className={styles.footerLink}>Clothing</Link>
                        <Link href="/explore?category=electronics" className={styles.footerLink}>Electronics</Link>
                        <Link href="/explore?category=books" className={styles.footerLink}>Books</Link>
                        <Link href="/explore?category=shoes" className={styles.footerLink}>Shoes</Link>
                    </div>

                    {/* Account */}
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Account</h4>
                        <Link href="/auth/login" className={styles.footerLink}>Login</Link>
                        <Link href="/auth/signup" className={styles.footerLink}>Sign up</Link>
                        <Link href="/listing/create" className={styles.footerLink}>Sell an Item</Link>
                        <Link href="/profile" className={styles.footerLink}>My Profile</Link>
                    </div>

                    {/* Support */}
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Support</h4>
                        <Link href="#" className={styles.footerLink}>How it Works</Link>
                        <Link href="#" className={styles.footerLink}>Safety Tips</Link>
                        <Link href="#" className={styles.footerLink}>FAQ</Link>
                        <Link href="#" className={styles.footerLink}>Contact Us</Link>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © 2026 SwapSociety. Made with <Heart size={14} className={styles.heartIcon} /> by students.
                    </p>
                    <div className={styles.legal}>
                        <Link href="#" className={styles.legalLink}>Privacy</Link>
                        <Link href="#" className={styles.legalLink}>Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
