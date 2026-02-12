'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  ChevronRight,
  Upload,
  Handshake,
  Package,
} from 'lucide-react';
import ListingCard from '@/components/listing/ListingCard';
import { CATEGORIES, generateMockListings } from '@/lib/utils';
import styles from './page.module.css';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const listings = generateMockListings();

  return (
    <div className={styles.page}>
      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid} />

        <div className={`container ${styles.heroContent}`}>
          <motion.div
            className={styles.heroBadge}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={14} />
            <span>India&apos;s #1 Student Marketplace</span>
          </motion.div>

          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Rent, Buy & Sell
            <br />
            <span className="gradient-text">Anything on Campus</span>
          </motion.h1>

          <motion.p
            className={styles.heroSub}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            From laptops & textbooks to sneakers & jackets — swap pre-loved items
            with verified university students. Save money, reduce waste, look great.
          </motion.p>

          <motion.div
            className={styles.heroCTA}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/explore" className="btn btn-primary btn-lg">
              Start Exploring
              <ArrowRight size={18} />
            </Link>
            <Link href="/listing/create" className="btn btn-secondary btn-lg">
              List an Item
            </Link>
          </motion.div>

          <motion.div
            className={styles.heroStats}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className={styles.stat}>
              <span className={styles.statNum}>5,200+</span>
              <span className={styles.statLabel}>Active Listings</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>12,000+</span>
              <span className={styles.statLabel}>Verified Students</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>150+</span>
              <span className={styles.statLabel}>Universities</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className={`section ${styles.categoriesSection}`}>
        <div className="container">
          <motion.div {...fadeUp} className={styles.sectionHeader}>
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Find exactly what you need</p>
          </motion.div>

          <motion.div
            className={styles.categoryGrid}
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
          >
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/explore?category=${cat.id}`}
                  className={styles.categoryCard}
                  style={{
                    '--cat-color': cat.color,
                  } as React.CSSProperties}
                >
                  <span className={styles.categoryEmoji}>{cat.icon}</span>
                  <span className={styles.categoryLabel}>{cat.label}</span>
                  <span className={styles.categoryGlow} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TRENDING ===== */}
      <section className={`section ${styles.trendingSection}`}>
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.sectionTitleRow}>
              <TrendingUp size={24} className={styles.sectionIcon} />
              <h2 className="section-title">Trending Now</h2>
            </div>
            <Link href="/explore" className={styles.viewAll}>
              View all <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div className={styles.listingGrid}>
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className={`section ${styles.howSection}`}>
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to start swapping</p>
          </motion.div>

          <div className={styles.stepsGrid}>
            {[
              {
                icon: Upload,
                title: 'List Your Item',
                desc: 'Upload photos, set your price, and choose rent or sell. It takes less than a minute.',
                color: 'var(--accent-primary)',
                num: '01',
              },
              {
                icon: Handshake,
                title: 'Connect & Swap',
                desc: 'Chat with interested students from your university. Agree on terms directly in the app.',
                color: 'var(--accent-secondary)',
                num: '02',
              },
              {
                icon: Package,
                title: 'Complete the Deal',
                desc: 'Meet up on campus, exchange the item, and leave a review. Simple, safe, and savings galore!',
                color: 'var(--accent-success)',
                num: '03',
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                className={styles.stepCard}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className={styles.stepNum} style={{ color: step.color }}>
                  {step.num}
                </div>
                <div
                  className={styles.stepIconWrap}
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                >
                  <step.icon size={28} style={{ color: step.color }} />
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY SWAP ===== */}
      <section className={`section ${styles.whySection}`}>
        <div className="container">
          <motion.div
            className={styles.whyGrid}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.whyContent}>
              <h2 className={styles.whyTitle}>
                Why Students <span className="gradient-text">Love Us</span>
              </h2>
              <p className={styles.whyDesc}>
                SwapSociety is more than a marketplace — it&apos;s a community. Here&apos;s why
                thousands of students trust us.
              </p>

              <div className={styles.features}>
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Verified Students Only',
                    desc: 'Every user is verified with their university email.',
                  },
                  {
                    icon: Zap,
                    title: 'Lightning Fast',
                    desc: 'List an item in under 60 seconds. Buy in just a few taps.',
                  },
                  {
                    icon: Sparkles,
                    title: 'Save Up to 70%',
                    desc: 'Get premium brands at student-friendly prices.',
                  },
                ].map((feat, i) => (
                  <motion.div
                    key={feat.title}
                    className={styles.featureItem}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={styles.featureIcon}>
                      <feat.icon size={20} />
                    </div>
                    <div>
                      <h4 className={styles.featureTitle}>{feat.title}</h4>
                      <p className={styles.featureDesc}>{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className={styles.whyVisual}>
              <div className={styles.whyCard}>
                <div className={styles.whyCardGlow} />
                <span className={styles.whyEmoji}>🎉</span>
                <span className={styles.whyStatBig}>₹2.3 Cr+</span>
                <span className={styles.whyStatLabel}>Saved by students this year</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className={styles.ctaSection}>
        <div className="container">
          <motion.div
            className={styles.ctaBanner}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className={styles.ctaGlow} />
            <h2 className={styles.ctaTitle}>
              Ready to Start Swapping?
            </h2>
            <p className={styles.ctaDesc}>
              Join 12,000+ university students already saving money and reducing waste.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/auth/signup" className="btn btn-primary btn-lg">
                Sign Up Free
                <ArrowRight size={18} />
              </Link>
              <Link href="/explore" className="btn btn-secondary btn-lg">
                Browse Items
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
