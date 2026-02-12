'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Compass, PlusCircle, MessageCircle, User } from 'lucide-react';
import styles from './MobileTabBar.module.css';

const tabs = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/listing/create', label: 'Sell', icon: PlusCircle },
    { href: '/messages', label: 'Chat', icon: MessageCircle },
    { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileTabBar() {
    const pathname = usePathname();

    return (
        <nav className={styles.tabBar}>
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`${styles.tab} ${isActive ? styles.active : ''}`}
                    >
                        <div className={styles.iconWrap}>
                            {tab.href === '/listing/create' ? (
                                <div className={styles.sellIcon}>
                                    <Icon size={22} />
                                </div>
                            ) : (
                                <Icon size={20} />
                            )}
                            {isActive && <span className={styles.activeIndicator} />}
                        </div>
                        <span className={styles.label}>{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
