'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ShoppingBag,
    Minus,
    Plus,
    Trash2,
    ShieldCheck,
    ArrowRight,
    PackageSearch,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { formatPrice, getCategoryInfo } from '@/lib/utils';
import styles from './page.module.css';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal } = useCart();
    const { showToast } = useToast();

    const platformFee = Math.round(cartTotal * 0.02);
    const orderTotal = cartTotal + platformFee;

    const handleRemove = (id: string, title: string) => {
        removeFromCart(id);
        showToast(`Removed "${title}" from cart`, 'info');
    };

    const handleCheckout = () => {
        showToast('Checkout coming soon! 🚀', 'info');
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        <ShoppingBag size={28} /> My Cart
                    </h1>
                    <p className={styles.subtitle}>
                        {cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
                    </p>
                </div>

                {items.length > 0 ? (
                    <div className={styles.layout}>
                        {/* Items List */}
                        <div className={styles.itemsList}>
                            <AnimatePresence>
                                {items.map((item, i) => {
                                    const cat = getCategoryInfo(item.listing.category);
                                    return (
                                        <motion.div
                                            key={item.listing.id}
                                            className={styles.itemCard}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                        >
                                            {/* Image */}
                                            <Link href={`/listing/${item.listing.id}`}>
                                                <div
                                                    className={styles.itemImage}
                                                    style={{
                                                        background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}11)`,
                                                    }}
                                                >
                                                    <span className={styles.itemEmoji}>{cat.icon}</span>
                                                </div>
                                            </Link>

                                            {/* Details */}
                                            <div className={styles.itemDetails}>
                                                <Link href={`/listing/${item.listing.id}`}>
                                                    <h3 className={styles.itemTitle}>{item.listing.title}</h3>
                                                </Link>
                                                <p className={styles.itemSeller}>by {item.listing.sellerName}</p>
                                                <span
                                                    className={`${styles.itemType} ${item.isRental ? styles.typeRent : styles.typeSale}`}
                                                >
                                                    {item.isRental ? 'Rental' : 'Purchase'}
                                                </span>

                                                <div className={styles.itemBottom}>
                                                    <span className={styles.itemPrice}>
                                                        {formatPrice(item.listing.price)}
                                                        {item.isRental && item.listing.rentalDuration && (
                                                            <span className={styles.pricePer}>
                                                                /{item.listing.rentalDuration}
                                                            </span>
                                                        )}
                                                    </span>

                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        {/* Quantity */}
                                                        {!item.isRental && (
                                                            <div className={styles.qtyControls}>
                                                                <button
                                                                    className={styles.qtyBtn}
                                                                    onClick={() =>
                                                                        updateQuantity(item.listing.id, item.quantity - 1)
                                                                    }
                                                                    aria-label="Decrease quantity"
                                                                >
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className={styles.qtyValue}>{item.quantity}</span>
                                                                <button
                                                                    className={styles.qtyBtn}
                                                                    onClick={() =>
                                                                        updateQuantity(item.listing.id, item.quantity + 1)
                                                                    }
                                                                    aria-label="Increase quantity"
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Remove */}
                                                        <button
                                                            className={styles.removeBtn}
                                                            onClick={() => handleRemove(item.listing.id, item.listing.title)}
                                                            aria-label="Remove from cart"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <motion.div
                            className={styles.summary}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <h2 className={styles.summaryTitle}>Order Summary</h2>

                            <div className={styles.summaryRows}>
                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>
                                        Subtotal ({cartCount} item{cartCount > 1 ? 's' : ''})
                                    </span>
                                    <span className={styles.summaryValue}>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>Platform fee (2%)</span>
                                    <span className={styles.summaryValue}>{formatPrice(platformFee)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>Delivery</span>
                                    <span className={styles.summaryValue} style={{ color: 'var(--accent-success)' }}>
                                        Campus Pickup
                                    </span>
                                </div>

                                <div className={styles.summaryDivider} />

                                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                    <span className={styles.summaryLabel}>Total</span>
                                    <span className={styles.summaryValue}>{formatPrice(orderTotal)}</span>
                                </div>
                            </div>

                            <button
                                className={`btn btn-primary btn-lg ${styles.checkoutBtn}`}
                                onClick={handleCheckout}
                            >
                                Proceed to Checkout <ArrowRight size={18} />
                            </button>

                            <div className={styles.secureBadge}>
                                <ShieldCheck size={14} /> Secure campus transaction
                            </div>

                            <button
                                className={styles.clearBtn}
                                onClick={() => {
                                    clearCart();
                                    showToast('Cart cleared', 'info');
                                }}
                            >
                                Clear Cart
                            </button>
                        </motion.div>
                    </div>
                ) : (
                    <motion.div
                        className={styles.empty}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className={styles.emptyIcon}>
                            <PackageSearch size={48} />
                        </div>
                        <h2 className={styles.emptyTitle}>Your cart is empty</h2>
                        <p className={styles.emptyText}>
                            Browse listings and add items to your cart to get started!
                        </p>
                        <Link href="/explore" className="btn btn-primary btn-lg">
                            Start Exploring
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
