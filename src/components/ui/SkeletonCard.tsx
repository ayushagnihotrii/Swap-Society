import styles from './SkeletonCard.module.css';

export default function SkeletonCard() {
    return (
        <div className={styles.card}>
            <div className={`${styles.image} ${styles.shimmer}`} />
            <div className={styles.body}>
                <div className={`${styles.line} ${styles.title} ${styles.shimmer}`} />
                <div className={`${styles.line} ${styles.subtitle} ${styles.shimmer}`} />
                <div className={styles.row}>
                    <div className={`${styles.line} ${styles.price} ${styles.shimmer}`} />
                    <div className={`${styles.line} ${styles.badge} ${styles.shimmer}`} />
                </div>
            </div>
        </div>
    );
}
