'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    GraduationCap,
    Calendar,
    Star,
    Package,
    Heart,
    Edit3,
    Save,
    LogOut,
    Shield,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import ProtectedRoute from '@/components/providers/ProtectedRoute';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './page.module.css';

function ProfileContent() {
    const { user, profile, logOut } = useAuth();
    const { showToast } = useToast();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editName, setEditName] = useState(profile?.name || '');
    const [editUniversity, setEditUniversity] = useState(profile?.university || '');
    const [editBio, setEditBio] = useState(profile?.bio || '');

    const handleSave = async () => {
        if (!user || !db) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                name: editName,
                university: editUniversity,
                bio: editBio,
            });
            showToast('Profile updated! ✨', 'success');
            setEditing(false);
        } catch {
            showToast('Failed to save changes', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logOut();
    };

    const avatarUrl = profile?.avatar || user?.photoURL || '';
    const displayName = profile?.name || user?.displayName || 'User';
    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently';

    return (
        <div className={styles.page}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Profile Header Card */}
                    <div className={styles.headerCard}>
                        <div className={styles.headerBg} />
                        <div className={styles.headerContent}>
                            <div className={styles.avatarSection}>
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt={displayName}
                                        width={96}
                                        height={96}
                                        className={styles.avatar}
                                        unoptimized
                                    />
                                ) : (
                                    <div className={styles.avatarFallback}>
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {profile?.isVerified && (
                                    <div className={styles.verifiedBadge} title="Verified student">
                                        <Shield size={14} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.userInfo}>
                                <h1 className={styles.name}>{displayName}</h1>
                                <p className={styles.email}>
                                    <Mail size={14} /> {user?.email}
                                </p>
                                {profile?.university && (
                                    <p className={styles.university}>
                                        <GraduationCap size={14} /> {profile.university}
                                    </p>
                                )}
                                <p className={styles.memberSince}>
                                    <Calendar size={14} /> Member since {memberSince}
                                </p>
                            </div>

                            <div className={styles.headerActions}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => {
                                        setEditing(!editing);
                                        setEditName(profile?.name || '');
                                        setEditUniversity(profile?.university || '');
                                        setEditBio(profile?.bio || '');
                                    }}
                                >
                                    <Edit3 size={16} /> {editing ? 'Cancel' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <Package size={22} className={styles.statIcon} />
                            <span className={styles.statValue}>0</span>
                            <span className={styles.statLabel}>Listings</span>
                        </div>
                        <div className={styles.statCard}>
                            <Star size={22} className={styles.statIcon} />
                            <span className={styles.statValue}>—</span>
                            <span className={styles.statLabel}>Rating</span>
                        </div>
                        <div className={styles.statCard}>
                            <Heart size={22} className={styles.statIcon} />
                            <span className={styles.statValue}>0</span>
                            <span className={styles.statLabel}>Wishlist</span>
                        </div>
                    </div>

                    {/* Edit Form */}
                    {editing && (
                        <motion.div
                            className={styles.editCard}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h2 className={styles.sectionTitle}>Edit Profile</h2>
                            <div className={styles.formGrid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>
                                        <User size={14} /> Display Name
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>
                                        <GraduationCap size={14} /> University
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editUniversity}
                                        onChange={(e) => setEditUniversity(e.target.value)}
                                    />
                                </div>
                                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>
                                        <Edit3 size={14} /> Bio
                                    </label>
                                    <textarea
                                        className={styles.textarea}
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        placeholder="Tell others about yourself..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </motion.div>
                    )}

                    {/* Bio */}
                    {!editing && profile?.bio && (
                        <div className={styles.bioCard}>
                            <h2 className={styles.sectionTitle}>About</h2>
                            <p className={styles.bioText}>{profile.bio}</p>
                        </div>
                    )}

                    {/* Logout */}
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={16} /> Log Out
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}
